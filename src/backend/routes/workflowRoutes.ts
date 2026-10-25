/**
 * PravahReg — Workflow, Revert, Case Summary & Consolidated Reporting Routes
 * Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau
 */

import { Router, Request, Response } from 'express';
import { CoreError, type CaseStorage } from '../core/storage';
import type { Actor, CaseState } from '../../shared/contracts';
import { getSnapshots } from '../modules/scrutiny/scrutinyService';
import { complianceDB, getObligations, getTimers } from '../modules/compliance/complianceService';
import {
  compileElectronicCaseSummary,
  compileConsolidatedReports
} from '../modules/reports/consolidatedReports';

export function createWorkflowRouter(storage: CaseStorage): Router {
  const router = Router();
  // POST /api/v1/applications/:id/workflow-action - Authoritative stage update (Accept, Reject, Advance, Flag Deficiencies)
  router.post('/applications/:id/workflow-action', async (req: Request, res: Response) => {
    const actor = (req as any).actor as Actor;
    const { action, targetStage, reason } = req.body;

    const isAuthorized = actor && (
      actor.permissions?.includes('case.transition') ||
      actor.roles?.some((r: string) => ['regional_officer', 'bureau_officer', 'reviewer', 'demo_authority', 'officer', 'admin', 'policy_admin'].includes(r))
    );

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Actor lacks authority to execute regulatory workflow actions' }
      });
    }

    try {
      const updated = await storage.transaction(async (tx) => {
        const app = await tx.get(actor, req.params.id);
        if (!app) throw new Error('Case not found');

        let nextState = app.state;
        if (targetStage === 'Scrutiny Cleared') {
          nextState = app.route?.stages?.includes('evc_pending') ? 'evc_pending' : 'decision_pending';
        } else if (targetStage === 'EVC Scheduled') {
          nextState = 'evc_pending';
        } else if (targetStage === 'EVC Inspection Completed' || targetStage === 'SAC / SHC Review') {
          nextState = 'decision_pending';
        } else if (targetStage === 'Deficiency Communicated') {
          nextState = 'rescrutiny_pending';
        } else if (targetStage === 'Application Rejected' || action === 'reject') {
          nextState = 'rejected';
        } else if (targetStage === 'Approval Issued' || action === 'approve') {
          nextState = 'approved';
        } else if (action === 'accept') {
          if (app.state === 'submitted' || app.state === 'scrutiny_pending') {
            nextState = app.route?.stages?.includes('evc_pending') ? 'evc_pending' : 'decision_pending';
          } else if (app.state === 'evc_pending') {
            nextState = 'decision_pending';
          } else if (app.state === 'decision_pending') {
            nextState = 'approved';
          } else {
            nextState = 'approved';
          }
        } else if (action === 'deficiency') {
          nextState = 'rescrutiny_pending';
        } else if (action === 'evc') {
          nextState = 'evc_pending';
        } else if (action === 'scrutiny') {
          nextState = 'scrutiny_pending';
        } else if (action === 'decision') {
          nextState = 'decision_pending';
        } else if (targetStage) {
          nextState = targetStage as any;
        }

        const now = new Date().toISOString();
        const updatedApp = {
          ...app,
          state: nextState,
          version: app.version + 1,
          stageEnteredAt: now,
          updatedAt: now
        };

        await tx.save(updatedApp, app.version);

        if ((tx as any).audit) {
          try {
            await (tx as any).audit({
              id: 'AUDIT-ACTION-' + Date.now(),
              applicationId: app.id,
              actorId: actor.id,
              requestId: 'REQ-ACTION-' + Date.now(),
              action: 'WORKFLOW_ACTION_' + (action || targetStage || 'ADVANCE').toUpperCase(),
              occurredAt: now,
              beforeState: app.state,
              afterState: nextState,
              caseVersion: updatedApp.version,
              reason: reason || ('Stage updated to ' + nextState + ' by ' + actor.id),
              evidenceVersionIds: []
            });
          } catch {}
        }

        return updatedApp;
      });

      return res.json({
        success: true,
        data: updated,
        message: 'Application transitioned to ' + updated.state
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'OPERATION_FAILED', message: err.message || 'Workflow transition failed' }
      });
    }
  });


  // POST /api/v1/applications/:id/revert - Authorized Return/Revert with recorded reason
  router.post('/applications/:id/revert', async (req: Request, res: Response) => {
    const actor = (req as any).actor as Actor;
    const { reason, targetStage, expectedVersion } = req.body;

    if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'A substantive revert reason (min 5 characters) must be duly recorded' }
      });
    }

    const validStages = [
      'submitted',
      'scrutiny_pending',
      'correction_required',
      'rescrutiny_pending',
      'evc_pending',
      'decision_pending'
    ];
    if (!targetStage || !validStages.includes(targetStage)) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: `Invalid targetStage: ${targetStage}. Must be one of ${validStages.join(', ')}` }
      });
    }

    // Check actor permissions
    if (
      !actor ||
      (!actor.permissions.includes('case.transition') &&
        !actor.roles.some((r: string) => ['regional_officer', 'bureau_officer', 'reviewer', 'demo_authority'].includes(r)))
    ) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Actor lacks authority to revert application stages' }
      });
    }

    try {
      const updated = await storage.transaction(async (tx) => {
        const app = await tx.get(actor, req.params.id);
        if (!app) {
          throw new CoreError('NOT_FOUND', `Application ${req.params.id} not found`);
        }

        if (expectedVersion !== undefined && app.version !== expectedVersion) {
          throw new CoreError('VERSION_CONFLICT', `Expected version ${expectedVersion} but current version is ${app.version}`);
        }

        const beforeState = app.state;
        app.state = targetStage as CaseState;
        app.version += 1;
        app.updatedAt = new Date().toISOString();
        app.stageEnteredAt = new Date().toISOString();
        if (!app.facts) app.facts = {};
        app.facts.lastRevertReason = reason;
        app.facts.revertedAt = app.updatedAt;
        app.facts.revertedBy = actor.id;

        await tx.save(app, app.version - 1);

        await tx.audit({
          id: `AUDIT-REVERT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          occurredAt: app.updatedAt,
          actorId: actor.id,
          requestId: (req as any).id || 'REQ-REVERT',
          applicationId: app.id,
          action: 'APPLICATION_REVERTED',
          reason,
          beforeState,
          afterState: targetStage as CaseState,
          caseVersion: app.version,
          evidenceVersionIds: []
        });

        return app;
      });

      return res.status(200).json({
        success: true,
        data: {
          application: updated,
          reverted: true,
          targetStage,
          reason,
          revertedBy: actor.id
        }
      });
    } catch (err: any) {
      if (err instanceof CoreError) {
        const status = err.code === 'NOT_FOUND' ? 404 : err.code === 'VERSION_CONFLICT' ? 409 : 403;
        return res.status(status).json({ success: false, error: { code: err.code, message: err.message } });
      }
      return res.status(500).json({ success: false, error: { code: 'STORAGE_UNAVAILABLE', message: err.message } });
    }
  });

  // GET /api/v1/applications/:id/case-summary - Electronic Case Summary & 5 Standardised Notices
  router.get('/applications/:id/case-summary', async (req: Request, res: Response) => {
    const actor = (req as any).actor as Actor;
    try {
      const app = await storage.get(actor, req.params.id);
      if (!app) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } });
      }

      const snapshots = getSnapshots(app.id);
      const obligations = getObligations();
      const summary = compileElectronicCaseSummary(app, snapshots, obligations);

      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'STORAGE_UNAVAILABLE', message: err.message } });
    }
  });

  // GET /api/v1/reports/consolidated - Consolidated 6-Category Reporting Hub
  router.get('/reports/consolidated', async (req: Request, res: Response) => {
    const actor = (req as any).actor as Actor;
    try {
      const apps = await storage.list(actor);
      const obligations = getObligations();
      const timers = getTimers();
      const reports = compileConsolidatedReports(apps, obligations, timers);

      return res.status(200).json({
        success: true,
        data: reports
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'STORAGE_UNAVAILABLE', message: err.message } });
    }
  });

  // POST /api/v1/applications/:id/close-compliance - Authorized Case & Obligation Closure
  router.post('/applications/:id/close-compliance', async (req: Request, res: Response) => {
    const actor = (req as any).actor as Actor;
    try {
      if (
        !actor ||
        !actor.roles.some((r: string) => ['bureau_officer', 'regional_officer', 'demo_authority', 'policy_admin'].includes(r))
      ) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Only competent regulatory authorities can issue formal compliance closure' }
        });
      }

      const app = await storage.get(actor, req.params.id);
      if (!app) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } });
      }

      const appObligations = getObligations(app.institutionId).filter(o => o.applicationId === app.id);
      const unverified = appObligations.filter(o => o.status !== 'verified' && o.status !== 'closed');
      if (unverified.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'PRECONDITION_FAILED',
            message: `Cannot close compliance case: ${unverified.length} undertaking(s) remain unverified or pending.`
          }
        });
      }

      for (const obl of appObligations) {
        obl.status = 'closed';
        complianceDB.obligations.set(obl.id, obl);
      }

      await storage.transaction(async (tx) => {
        const current = await tx.get(actor, app.id);
        if (current) {
          if (!current.facts) current.facts = {};
          current.facts.complianceClosed = true;
          current.facts.complianceClosedAt = new Date().toISOString();
          current.facts.complianceClosedBy = actor.id;
          current.version += 1;
          await tx.save(current, current.version - 1);
          await tx.audit({
            id: `AUDIT-CLOSE-${Date.now()}`,
            occurredAt: new Date().toISOString(),
            actorId: actor.id,
            requestId: (req as any).id || 'REQ-CLOSE',
            applicationId: app.id,
            action: 'COMPLIANCE_CASE_CLOSED',
            reason: 'All statutory undertakings and document renewals independently verified. Case formally closed.',
            caseVersion: current.version,
            evidenceVersionIds: []
          });
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          applicationId: app.id,
          closed: true,
          closedAt: new Date().toISOString(),
          closedBy: actor.id,
          obligationsClosedCount: appObligations.length
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'STORAGE_UNAVAILABLE', message: err.message } });
    }
  });

  return router;
}
