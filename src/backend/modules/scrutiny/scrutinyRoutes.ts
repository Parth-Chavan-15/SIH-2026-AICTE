import { Router, Request, Response } from 'express';
import {
  SignScrutinyCommandSchema,
  CorrectionCommandSchema,
  RescrutinyCommandSchema
} from './scrutinySchemas';
import {
  signScrutiny,
  submitCorrection,
  rescrutinize,
  getSnapshots,
  getLatestSnapshot
} from './scrutinyService';
import type { CorePort } from './ports';
import { makeFakeCorePort } from './mockCore';

export function createScrutinyRouter(corePort?: CorePort): Router {
  const router = Router();
  const port = corePort || makeFakeCorePort();

  // GET /api/v1/applications/:id/scrutiny - View snapshots & current checklist
  router.get('/applications/:id/scrutiny', async (req: Request, res: Response) => {
    try {
      const applicationId = req.params.id;
      const snapshots = getSnapshots(applicationId);
      const latest = getLatestSnapshot(applicationId);
      return res.status(200).json({
        success: true,
        data: {
          applicationId,
          snapshots,
          latestSnapshot: latest || null
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'STORAGE_UNAVAILABLE', message: err.message || 'Error fetching scrutiny data' }
      });
    }
  });

  // POST /api/v1/applications/:id/scrutiny - Sign checklist & create snapshot
  router.post('/applications/:id/scrutiny', async (req: Request, res: Response) => {
    if (Array.isArray(req.body.items)) {
      req.body.items = req.body.items.map((i: any) => ({
        ...i,
        result: i.result || i.status || 'accepted'
      }));
    }
    if (!req.body.idempotencyKey) {
      req.body.idempotencyKey = `SIGN-${req.params.id}-${Date.now()}`;
    }

    try {
      const app = await port.getApplication(req.params.id);
      if (app && typeof app.version === 'number') {
        req.body.expectedVersion = app.version;
      }
    } catch {}

    if (typeof req.body.expectedVersion !== 'number') {
      req.body.expectedVersion = 1;
    }

    const parsed = SignScrutinyCommandSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
        }
      });
    }

    const result = await signScrutiny(port, req.params.id, parsed.data);
    if (!result.success) {
      const status = result.error.code === 'FORBIDDEN' ? 403
        : result.error.code === 'VERSION_CONFLICT' ? 409
        : result.error.code === 'NOT_FOUND' ? 404
        : 400;
      return res.status(status).json(result);
    }
    return res.status(200).json(result);
  });

  // POST /api/v1/applications/:id/corrections - Submit corrections (Enforces SCOPE LOCK)
  router.post('/applications/:id/corrections', async (req: Request, res: Response) => {
    const parsed = CorrectionCommandSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
        }
      });
    }

    const result = await submitCorrection(port, req.params.id, parsed.data);
    if (!result.success) {
      // PRECONDITION_FAILED returns 412 per standard / acceptance criteria
      const status = result.error.code === 'PRECONDITION_FAILED' ? 412
        : result.error.code === 'VERSION_CONFLICT' ? 409
        : result.error.code === 'NOT_FOUND' ? 404
        : 400;
      return res.status(status).json(result);
    }
    return res.status(200).json(result);
  });

  // POST /api/v1/applications/:id/rescrutiny & /api/v1/scrutiny/:id/rescrutiny - Reviewer evaluates corrections
  router.post(['/applications/:id/rescrutiny', '/scrutiny/:id/rescrutiny'], async (req: Request, res: Response) => {
    if (Array.isArray(req.body.items) && !req.body.outcomes) {
      req.body.outcomes = req.body.items.map((i: any) => ({
        itemId: i.itemId || i.id,
        result: (i.status === 'COMPLIANT' || i.result === 'accepted' || i.status === 'accepted') ? 'accepted' : 'deficient',
        reason: i.remarks || i.reason || 'Re-scrutiny outcome'
      }));
    }
    if (Array.isArray(req.body.outcomes)) {
      req.body.outcomes = req.body.outcomes.map((o: any) => ({
        ...o,
        itemId: o.itemId || o.id,
        result: (o.status === 'COMPLIANT' || o.result === 'accepted' || o.status === 'accepted') ? 'accepted' : 'deficient'
      }));
    }
    if (!req.body.idempotencyKey) {
      req.body.idempotencyKey = `RESCRUTINY-${req.params.id}-${Date.now()}`;
    }
    if (!req.body.snapshotId) {
      const latest = getLatestSnapshot(req.params.id);
      req.body.snapshotId = latest?.id || `SNAP-${req.params.id}-R1`;
    }
    try {
      const app = await port.getApplication(req.params.id);
      if (app && typeof app.version === 'number') {
        req.body.expectedVersion = app.version;
      }
    } catch {}
    if (typeof req.body.expectedVersion !== 'number') {
      req.body.expectedVersion = 1;
    }

    const parsed = RescrutinyCommandSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
        }
      });
    }

    const result = await rescrutinize(port, req.params.id, parsed.data);
    if (!result.success) {
      const code = result.error.code as string;
      const status = code === 'SCOPE_VIOLATION' || code === 'RE_SCRUTINY_SCOPE_VIOLATION' || code === 'VERSION_CONFLICT' ? 409
        : code === 'NOT_FOUND' ? 404
        : 400;
      return res.status(status).json(result);
    }
    return res.status(200).json(result);
  });

  return router;
}
