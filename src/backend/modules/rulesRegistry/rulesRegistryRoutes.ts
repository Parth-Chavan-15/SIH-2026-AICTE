import { Router, Request, Response } from 'express';
import {
  getAllRules,
  getRuleById,
  getOpenConflicts,
  draftNewRule,
  publishRule,
  simulateRouteForFacts,
  ruleAuditTrail
} from './rulesRegistryService';
import type { Actor } from '../../../shared/contracts';

export function createRulesRegistryRouter(): Router {
  const router = Router();

  // GET /api/v1/rules-registry/rules or /active - List all rules with filters
  const returnRules = (_req: Request, res: Response) => {
    const rawRules = getAllRules();
    const rules = rawRules.map((r) => ({
      ...r,
      id: r.ruleId,
      clause: r.clauseLocator,
      page: r.physicalPdfPage,
      document: r.sourceTitle,
      summary: r.plainLanguageSummary,
      academicYear: r.academicYearScope
    }));
    return res.status(200).json({
      success: true,
      data: { rules, count: rules.length }
    });
  };
  router.get('/rules-registry/rules', returnRules);
  router.get('/rules-registry/active', returnRules);

  // GET /api/v1/rules-registry/conflicts - List open regulatory conflicts
  router.get('/rules-registry/conflicts', (_req: Request, res: Response) => {
    const rawConflicts = getOpenConflicts();
    const conflicts = rawConflicts.map((c) => ({
      ...c,
      id: c.ruleId,
      conflictId: c.ruleId,
      clause: c.clauseLocator,
      sources: [c.sourceTitle, c.conflictDetails || 'APH 2024-27 vs Addendum 2026-27'],
      safeHandlingPath: 'Statutory Conflict Hold: Automatic decisions suspended for policy review'
    }));
    return res.status(200).json({
      success: true,
      data: { conflicts, count: conflicts.length }
    });
  });

  // GET /api/v1/rules-registry/audit - Get audit history
  router.get('/rules-registry/audit', (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      data: ruleAuditTrail
    });
  });

  // GET /api/v1/rules-registry/rules/:ruleId/diff - Diff before & after
  router.get('/rules-registry/rules/:ruleId/diff', (req: Request, res: Response) => {
    const rule = getRuleById(req.params.ruleId);
    return res.status(200).json({
      success: true,
      data: {
        ruleId: req.params.ruleId,
        before: rule,
        after: rule
      }
    });
  });

  // GET /api/v1/rules-registry/rule/:id - Get single rule detail
  router.get('/rules-registry/rule/:id', (req: Request, res: Response) => {
    const rule = getRuleById(req.params.id);
    if (!rule) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Rule not found' } });
    }
    return res.status(200).json({ success: true, data: rule });
  });

  // POST /api/v1/rules-registry/draft or /revisions - Create draft revision
  const createDraft = (req: Request, res: Response) => {
    const actor = (req as any).actor as Actor;
    try {
      const payload = {
        ...req.body,
        clauseLocator: req.body.clauseLocator || req.body.clause || 'Clause 2.3.4',
        physicalPdfPage: req.body.physicalPdfPage || req.body.page || 1,
        sourceId: req.body.sourceId || 'SRC-APH-2024-27',
        sourceTitle: req.body.sourceTitle || req.body.document || 'Approval Process Handbook 2024–2027',
        sourceFile: req.body.sourceFile || 'APH 24–25, 26-27 Handbook(1).pdf',
        plainLanguageSummary: req.body.plainLanguageSummary || req.body.summary || req.body.title
      };
      const draft = draftNewRule(payload, actor?.id || req.body.proposedBy || 'admin@aicte.gov.in');
      return res.status(201).json({
        success: true,
        data: { draft },
        message: `Draft rule ${draft.ruleId} (v${draft.version}) created in DRAFT status.`
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: { code: 'OPERATION_FAILED', message: err.message } });
    }
  };
  router.post('/rules-registry/draft', createDraft);
  router.post('/rules-registry/revisions', createDraft);

  // POST /api/v1/rules-registry/publish - Role 6 publishes verified rule
  const doPublish = (req: Request, res: Response) => {
    const actor = (req as any).actor as Actor;
    const ruleId = req.params.ruleId || req.body.ruleId;
    const reason = req.body.reason;
    const approvedBy = req.body.approvedBy || actor?.id || 'admin@aicte.gov.in';

    if (!ruleId || !reason || reason.trim().length < 5) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'ruleId and a substantive publication reason (min 5 chars) are required.' }
      });
    }

    const result = publishRule(ruleId, approvedBy, reason);
    if (!result.success) {
      return res.status(409).json({
        success: false,
        error: { code: 'PUBLICATION_BLOCKED', message: result.error }
      });
    }

    return res.status(200).json({
      success: true,
      data: { rule: result.rule },
      message: `Rule ${ruleId} successfully published as ACTIVE_VERIFIED.`
    });
  };
  router.post('/rules-registry/publish', doPublish);
  router.post('/rules-registry/rules/:ruleId/publish', doPublish);

  // POST /api/v1/rules-registry/simulate or /simulate-route
  const doSimulate = (req: Request, res: Response) => {
    try {
      const facts = req.body.facts || req.body;
      const simulation = simulateRouteForFacts(facts);
      return res.status(200).json({
        success: true,
        data: {
          simulation: {
            ...simulation,
            routeDecision: simulation
          },
          routeDecision: simulation
        },
        message: 'Route simulation completed without database mutation.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: { code: 'SIMULATION_FAILED', message: err.message } });
    }
  };
  router.post('/rules-registry/simulate', doSimulate);
  router.post('/rules-registry/simulate-route', doSimulate);

  return router;
}
