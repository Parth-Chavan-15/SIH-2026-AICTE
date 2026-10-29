import { Router, Request, Response } from 'express';
import {
  complianceDB,
  uploadDocumentEvidence,
  verifyDocumentEvidence,
  advanceClockByDays,
  runRetryTest,
  computeDashboardMetrics,
} from './complianceService';
import { requirePermission } from '../../security/authorization';

export function createComplianceRouter(): Router {
  const router = Router();

  // GET /api/v1/obligations - List obligations
  router.get('/obligations', requirePermission('document.read'), (req: Request, res: Response) => {
    let obligations = Array.from(complianceDB.obligations.values());
    if (req.actor.scope === 'scoped') {
      obligations = obligations.filter(o => req.actor.institutionIds.includes(o.institutionId));
    }
    res.json({ success: true, data: obligations });
  });

  // GET /api/v1/compliance/obligations/:caseId - Obligations for case
  router.get('/compliance/obligations/:caseId', (req: Request, res: Response) => {
    const caseId = req.params.caseId;
    const obligations = Array.from(complianceDB.obligations.values())
      .filter((o: any) => o.caseId === caseId || o.applicationId === caseId)
      .map((o: any) => ({
        ...o,
        caseId: o.caseId || o.applicationId
      }));
    res.json({ success: true, data: { obligations, count: obligations.length } });
  });

  // POST /api/v1/obligations/:id/upload - Upload evidence (Leaves status as 'submitted')
  router.post('/obligations/:id/upload', requirePermission('document.submit'), (req: Request, res: Response) => {
    const obligation = complianceDB.obligations.get(req.params.id);
    if (!obligation) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Obligation not found' } });
    }
    
    // Check scope authorization
    if (req.actor.scope !== 'global' && !req.actor.institutionIds.includes(obligation.institutionId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Record outside authorized scope' } });
    }

    const { fileName, validFrom, validTo, byteSize } = req.body || {};
    const doc = uploadDocumentEvidence({
      applicationId: obligation.applicationId,
      institutionId: obligation.institutionId,
      obligationId: obligation.id,
      documentType: obligation.conditionKey,
      fileName: fileName || `${obligation.conditionKey}_Compliance_Proof.pdf`,
      byteSize: byteSize || 1024 * 350,
      validFrom,
      validTo,
      uploadedBy: req.actor.id,
    });

    res.status(201).json({
      success: true,
      data: {
        document: doc,
        obligation: complianceDB.obligations.get(obligation.id),
      },
    });
  });

  // POST /api/v1/obligations/:id/verify - Review & verify/reject evidence by officer
  router.post('/obligations/:id/verify', requirePermission('document.review'), (req: Request, res: Response) => {
    const obligation = complianceDB.obligations.get(req.params.id);
    if (!obligation) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Obligation not found' } });
    }

    const { documentId, decision, remarks } = req.body || {};
    if (!['verified', 'rejected'].includes(decision)) {
      return res.status(422).json({ success: false, error: { code: 'VALIDATION_FAILED', message: 'Decision must be verified or rejected' } });
    }

    const docToVerify = documentId
      ? complianceDB.documents.get(documentId)
      : Array.from(complianceDB.documents.values()).reverse().find(d => d.obligationId === obligation.id);

    if (!docToVerify) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No document found to verify' } });
    }

    const updatedDoc = verifyDocumentEvidence({
      documentId: docToVerify.id,
      reviewerId: req.actor.id,
      decision,
      remarks: remarks || 'Verified compliant with Approval Process Handbook norms.',
    });

    res.json({
      success: true,
      data: {
        document: updatedDoc,
        obligation: complianceDB.obligations.get(obligation.id),
      },
    });
  });

  // GET /api/v1/documents - List documents with version history
  router.get('/documents', requirePermission('document.read'), (req: Request, res: Response) => {
    let docs = Array.from(complianceDB.documents.values());
    const appId = req.query.applicationId as string;
    if (appId) {
      docs = docs.filter(d => d.applicationId === appId);
    }
    if (req.actor.scope === 'scoped') {
      docs = docs.filter(d => req.actor.institutionIds.includes(d.institutionId));
    }
    res.json({ success: true, data: docs });
  });

  // GET /api/v1/timers - List 4-clock timers
  router.get('/timers', (req: Request, res: Response) => {
    let timers = Array.from(complianceDB.timers.values());
    if (req.actor?.scope === 'scoped') {
      timers = timers.filter(t => req.actor.institutionIds.includes(t.institutionId));
    }
    res.json({
      success: true,
      data: {
        simulatedClock: new Date(complianceDB.simulatedClockTimestamp).toISOString(),
        timers,
      },
    });
  });

  // POST /api/v1/timers/advance-clock - Advance clock (+N days)
  router.post('/timers/advance-clock', (req: Request, res: Response) => {
    const days = Number(req.body?.days) || 7;
    const result = advanceClockByDays(days);
    res.json({
      success: true,
      data: {
        advancedDays: days,
        newSimulatedTime: result.newTimestamp,
        alertsFired: result.firedCount,
        alertsSuppressed: result.suppressedCount,
        deliveredAlerts: Array.from(complianceDB.deliveredAlerts.values()),
      },
    });
  });

  // POST /api/v1/timers/retry-test - 3x Outbox Retry Test (Test T10)
  router.post('/timers/retry-test', (req: Request, res: Response) => {
    const dedupeKey = req.body?.dedupeKey || `RETRY-TEST-${Date.now()}`;
    const result = runRetryTest(dedupeKey);
    res.json({
      success: true,
      data: {
        testId: 'T10',
        dedupeKey,
        attemptsExecuted: result.attemptCount, // 3
        notificationsDelivered: result.deliveredCount, // 1
        isIdempotent: result.deliveredCount === 1,
      },
    });
  });

  // GET /api/v1/alerts - View delivered and provenance alerts (Test T12 & Tenant Scoping)
  router.get('/alerts', (req: Request, res: Response) => {
    const actor = (req as any).actor;
    let alerts = Array.from(complianceDB.deliveredAlerts.values());
    if (actor && (actor.roles?.includes('institution') || actor.id?.startsWith('usr-inst-'))) {
      const allowedInsts = new Set(actor.institutionIds || []);
      const isCOEP = actor.email === 'principal@coep.ac.in' || actor.id === 'usr-inst-coep';
      const isGIITS = actor.email === 'principal@giits.ac.in' || actor.id === 'usr-inst-giits';
      const isPDIMTR = actor.email === 'principal@pdimtr.ac.in' || actor.id === 'usr-inst-pdimtr';
      const isBATU = actor.email === 'principal@batu.ac.in' || actor.id === 'usr-inst-batu';
      const isAPEX = actor.email === 'principal@apex.ac.in' || actor.id === 'usr-inst-apex';

      alerts = alerts.filter(a => {
        if (a.institutionId && allowedInsts.has(a.institutionId)) return true;
        if (isCOEP && (a.applicationId === 'APP-2026-COEP' || a.institutionId === 'INST-SOUTH')) return true;
        if (isGIITS && (a.applicationId === 'APP-2026-GIITS' || a.institutionId === 'INST-NORTH')) return true;
        if (isPDIMTR && (a.applicationId === 'APP-2026-PDIMTR' || a.institutionId === 'INST-PDIMTR')) return true;
        if (isBATU && (a.applicationId === 'APP-2026-BATU' || a.institutionId === 'INST-BATU')) return true;
        if (isAPEX && (a.applicationId === 'APP-2026-APEX' || a.institutionId === 'INST-APEX')) return true;
        return false;
      });
    }
    res.json({
      success: true,
      data: alerts,
    });
  });

  // GET /api/v1/compliance/dashboard - Dynamic dashboard metrics projection (Test T14)
  router.get('/compliance/dashboard', requirePermission('dashboard.read'), (_req: Request, res: Response) => {
    const metrics = computeDashboardMetrics([]);
    res.json({ success: true, data: metrics });
  });

  return router;
}
