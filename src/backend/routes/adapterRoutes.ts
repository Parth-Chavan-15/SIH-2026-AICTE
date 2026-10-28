import { Router, Request, Response } from 'express';
import { CoreError, type CaseStorage } from '../core/storage';
import type { Application, Actor } from '../../shared/contracts';
import { applicationSchema } from '../../shared/schemas';
import {
  getCommitteeRoster,
  verifyDSCSignature
} from '../adapters/ecosystemAdapters';

export function createAdapterRouter(storage: CaseStorage): Router {
  const router = Router();

  // POST /api/v1/adapter/ingest - Upstream NSWS & Siebel hand-off ingestion
  router.post('/adapter/ingest', async (req: Request, res: Response) => {
    try {
      const {
        source = 'NSWS_PORTAL',
        externalReference,
        sourceType = 'ADAPTER_IMPORTED_FIXTURE',
        application: rawApp
      } = req.body;

      if (!rawApp) {
        return res.status(422).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'Missing application payload in ingestion request' }
        });
      }

      // Ensure canonical required fields
      const appId = rawApp.id || `APP-2026-${externalReference || Date.now()}`;
      const reference = externalReference || rawApp.reference || `1-${Date.now()}`;
      const session = rawApp.session || rawApp.academicYear || '2026-2027';
      const category = rawApp.category || 'intake_increase';
      const nowIso = new Date().toISOString();

      const candidateApp: Application = {
        id: appId,
        reference,
        institutionId: rawApp.institutionId || 'INST-NORTH',
        regionId: rawApp.regionId || 'South-Central',
        category,
        session,
        facts: {
          ...rawApp.facts,
          sourceType,
          upstreamSource: source,
          upstreamReference: externalReference,
          ingestedAt: nowIso
        },
        policyRevisionId: rawApp.policyRevisionId ?? (rawApp.route?.result === 'review_required' ? undefined : 'POL_2026_INTAKE_NON_NBA'),
        state: rawApp.state || 'submitted',
        version: rawApp.version || 1,
        route: rawApp.route || {
          policyRevisionId: rawApp.policyRevisionId ?? (rawApp.route?.result === 'review_required' ? undefined : 'POL_2026_INTAKE_NON_NBA'),
          session,
          category,
          evaluatedFacts: {},
          result: 'selected',
          stages: ['scrutiny_pending', 'rescrutiny_pending', 'evc_pending', 'decision_pending'],
          reasons: ['Ingested from upstream ' + source],
          sources: [
            {
              documentId: 'DOC-APH-2026-ERRATA',
              title: 'APH 2026-27 Addendum & Errata',
              location: 'p. 42 §2.6(c)(1)',
              sourceRevision: 'v2026.2',
              reviewState: 'reviewed'
            }
          ]
        },
        stageEnteredAt: rawApp.stageEnteredAt || nowIso,
        createdAt: rawApp.createdAt || nowIso,
        updatedAt: nowIso
      };

      const parsed = applicationSchema.safeParse(candidateApp);
      if (!parsed.success) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
          }
        });
      }

      await storage.transaction(async (tx) => {
        const actor: Actor = {
          id: 'SYSTEM',
          roles: ['policy_admin'],
          permissions: ['case.read'],
          scope: 'global',
          institutionIds: ['*'],
          regionIds: ['*']
        };
        const existing = await tx.get(actor, parsed.data.id);
        if (existing) {
          await tx.save(parsed.data, existing.version);
        } else {
          await tx.insert(parsed.data);
        }
      });

      return res.status(201).json({
        success: true,
        data: {
          imported: true,
          applicationId: parsed.data.id,
          reference: parsed.data.reference,
          sourceType,
          syncedAt: nowIso
        }
      });
    } catch (err: any) {
      if (err instanceof CoreError) {
        return res.status(409).json({
          success: false,
          error: { code: err.code, message: err.message }
        });
      }
      return res.status(500).json({
        success: false,
        error: { code: 'STORAGE_UNAVAILABLE', message: err.message || 'Ingestion failed' }
      });
    }
  });

  // GET /api/v1/adapter/status - Status of upstream companion bridges
  router.get('/adapter/status', (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      data: {
        nswsSimulation: { status: 'ACTIVE', mode: 'SIMULATED_INTEGRATION', notice: 'Interactive NSWS to AICTE simulation' },
        mSignerGateway: { status: 'ACTIVE', provider: 'emBridge / DSC Sim', dscValidation: 'ENABLED' },
        committeeRosterGateway: { status: 'ACTIVE', provider: 'AICTE Central Portal Sync', mode: 'SIMULATED' },
        dynamicRouteEngine: { status: 'ACTIVE', source: 'APH 2024-27 & Addendum 2026-27 Errata G02' }
      }
    });
  });

  // 1. POST /api/v1/adapter/committee-sync/:caseId - AICTE Central Portal Committee Sync
  router.post('/adapter/committee-sync/:caseId', (req: Request, res: Response) => {
    const committeeType = req.body.committeeType || 'EVC';
    const roster = getCommitteeRoster(req.params.caseId, committeeType);
    return res.status(200).json({
      success: true,
      data: roster
    });
  });

  // 2. POST /api/v1/adapter/dsc-verify - emBridge / Class-3 DSC Verification Gateway
  router.post('/adapter/dsc-verify', (req: Request, res: Response) => {
    try {
      const result = verifyDSCSignature({
        documentId: req.body.documentId || `DOC-DSC-${Date.now()}`,
        dscSigned: req.body.dscSigned,
        tokenType: req.body.tokenType,
        signatoryName: req.body.signatoryName,
        signatoryPan: req.body.signatoryPan
      });
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (err: any) {
      if (err.message && err.message.includes('DSC_SIGNATURE_REQUIRED')) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'DSC_SIGNATURE_REQUIRED',
            message: err.message
          }
        });
      }
      return res.status(500).json({
        success: false,
        error: { code: 'STORAGE_UNAVAILABLE', message: err.message || 'DSC Verification gateway failed' }
      });
    }
  });

  return router;
}
