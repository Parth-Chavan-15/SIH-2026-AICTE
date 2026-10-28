import { Router, Request, Response } from 'express';
import {
  onboardInvestor,
  verifyPan,
  verifyDSC,
  buildApplicationFromNSWS,
  simulatedProfiles
} from './nswsService';
import { evaluateDynamicRoute } from '../../policy/dynamicRouteEngine';
import type { CaseStorage } from '../../core/storage';
import type { Actor } from '../../../shared/contracts';

export function createNSWSRouter(storage: CaseStorage): Router {
  const router = Router();

  // GET /api/v1/nsws/profiles - List simulated investor profiles
  router.get('/nsws/profiles', (_req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      data: Array.from(simulatedProfiles.values())
    });
  });

  // POST /api/v1/nsws/onboard - Step 1: Onboard investor entity
  router.post('/nsws/onboard', (req: Request, res: Response) => {
    try {
      const entityName = req.body.entityName || req.body.institutionName || 'Demo Technical Institute';
      const entityType = req.body.entityType || 'Trust';
      const contactPerson = req.body.contactPerson || req.body.signatoryName || 'Authorized Signatory';
      const email = req.body.email || 'applicant@aicte.gov.in';
      const mobile = req.body.mobile || '+91 98765 43210';
      const pan = req.body.pan;

      const profile = onboardInvestor({ entityName, entityType, contactPerson, email, mobile });
      let panValid = false;
      if (pan) {
        verifyPan(profile.investorId, pan);
        panValid = true;
      }

      return res.status(200).json({
        success: true,
        data: {
          ...profile,
          pan: pan || profile.pan,
          panValid,
          nswsReference: profile.investorId,
          simulationNotice: 'This is an interactive NSWS to AICTE application intake simulation for Smart India Hackathon 2026. No live external API call is made.'
        },
        message: 'SIMULATION: Investor profile registered on simulated NSWS portal.'
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: { code: 'OPERATION_FAILED', message: err.message } });
    }
  });

  // POST /api/v1/nsws/evaluate-route - Route pre-check using Dynamic Route Engine
  router.post('/nsws/evaluate-route', (req: Request, res: Response) => {
    try {
      const facts = req.body.facts || req.body;
      const routeDecision = evaluateDynamicRoute(facts);
      return res.status(200).json({
        success: true,
        data: {
          routeDecision: {
            ...routeDecision,
            routeType: routeDecision.policyRevisionId.includes('NBA') && !routeDecision.policyRevisionId.includes('NON-NBA')
              ? 'SCRUTINY_ONLY'
              : routeDecision.stages.includes('evc_pending')
              ? 'SCRUTINY_AND_EVC'
              : 'SCRUTINY_ONLY',
            requiresEVC: routeDecision.stages.includes('evc_pending'),
            fastTrackEligible: routeDecision.policyRevisionId.includes('NBA'),
            policyVersion: routeDecision.ruleVersion
          }
        }
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: { code: 'EVALUATION_FAILED', message: err.message } });
    }
  });

  // POST /api/v1/nsws/verify-pan - Step 2: Validate PAN
  router.post('/nsws/verify-pan', (req: Request, res: Response) => {
    try {
      const { investorId, pan } = req.body;
      if (!investorId || !pan) {
        return res.status(422).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'investorId and pan are required.' }
        });
      }
      const result = verifyPan(investorId, pan);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_FAILED', message: err.message } });
    }
  });

  // POST /api/v1/nsws/verify-dsc - Step 3: Verify emBridge DSC Token
  router.post('/nsws/verify-dsc', (req: Request, res: Response) => {
    try {
      const { investorId } = req.body;
      if (!investorId) {
        return res.status(422).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'investorId is required.' }
        });
      }
      const result = verifyDSC(investorId);
      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: { code: 'OPERATION_FAILED', message: err.message } });
    }
  });

  // POST /api/v1/nsws/submit - Step 4 & 5: Submit AICTE application & invoke real route engine
  router.post('/nsws/submit', async (req: Request, res: Response) => {
    try {
      const { application, routeExplanation } = buildApplicationFromNSWS(req.body);

      // Persist created application in CaseStorage
      await storage.transaction(async (tx) => {
        const actor: Actor = {
          id: 'SYSTEM_NSWS_SIMULATION',
          roles: ['institution'],
          permissions: ['case.create'],
          scope: 'global',
          institutionIds: ['*'],
          regionIds: ['*']
        };
        const existing = await tx.get(actor, application.id);
        if (existing) {
          await tx.save(application, existing.version);
        } else {
          await tx.insert(application);
        }

        if ((tx as any).audit) {
          await (tx as any).audit({
            id: `AUDIT-NSWS-${Date.now()}`,
            occurredAt: application.createdAt,
            actorId: 'NSWS_PORTAL_SIMULATION',
            requestId: `REQ-NSWS-${Date.now()}`,
            applicationId: application.id,
            action: 'APPLICATION_INGESTED_VIA_NSWS',
            beforeState: undefined,
            afterState: 'submitted',
            caseVersion: 1,
            reason: `Ingested via simulated NSWS onboarding pipeline. Dynamic Route: ${routeExplanation.policyRevisionId}`,
            evidenceVersionIds: []
          });
        }
      });

      return res.status(201).json({
        success: true,
        data: {
          application,
          routeExplanation,
          simulationNotice: 'SIMULATED TRANSACTION — PERSISTED IN LOCAL PROTOTYPE DATABASE'
        },
        message: `Application ${application.id} submitted via NSWS simulation. Route evaluated: ${routeExplanation.stages.join(' -> ')}`
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: { code: 'SUBMISSION_FAILED', message: err.message || 'NSWS application submission failed.' }
      });
    }
  });

  return router;
}
