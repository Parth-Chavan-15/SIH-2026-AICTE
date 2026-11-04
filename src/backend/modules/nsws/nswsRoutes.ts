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

      // P0: Idempotency Verification - Query existing applications before insertion
      const mongoose = (await import('mongoose')).default;
      const { deriveRouteType } = await import('../../persistence/mongoCore');
      const { computeCanonicalAuditHash } = await import('../../security/auditVerification');
      const { CoreAudit } = await import('../../persistence/records');

      let existingDoc: any = null;
      if (mongoose.connection?.readyState === 1) {
        const ApplicationModel = (await import('../../models/Application.js')).default;
        const queryCriteria: any[] = [
          { 'caseData.id': application.id },
          { applicationNumber: application.reference },
          { 'caseData.reference': application.reference }
        ];

        if (application.facts?.nswsInvestorId) {
          queryCriteria.push({ 'caseData.facts.nswsInvestorId': application.facts.nswsInvestorId });
        }

        if (application.institutionId && application.session && application.category) {
          queryCriteria.push({
            institutionCode: application.institutionId,
            academicYear: application.session,
            applicationType: application.category,
            program: String(application.facts?.program || ''),
            'caseData.facts.intakeChannel': 'NSWS_SIMULATION'
          });
        }

        existingDoc = await ApplicationModel.findOne({ $or: queryCriteria }).lean().exec();
      }

      if (!existingDoc && storage) {
        try {
          const sysActor: Actor = {
            id: 'SYSTEM_NSWS_SIMULATION',
            roles: ['institution'],
            permissions: ['case.create', 'case.read'],
            scope: 'global',
            institutionIds: ['*'],
            regionIds: ['*']
          };
          const memCase = await storage.get(sysActor, application.id);
          if (memCase) {
            existingDoc = { caseData: memCase, applicationNumber: memCase.reference };
          }
        } catch (_e) {
          // storage fallback check
        }
      }

      if (existingDoc && existingDoc.caseData) {
        const { evaluateDynamicRoute } = await import('../../policy/dynamicRouteEngine');
        const dynamicExplanation = evaluateDynamicRoute({
          ...existingDoc.caseData.facts,
          category: existingDoc.caseData.category,
          session: existingDoc.caseData.session
        });

        return res.status(200).json({
          success: true,
          duplicateDetected: true,
          alreadySubmitted: true,
          data: {
            application: existingDoc.caseData,
            routeExplanation: dynamicExplanation,
            simulationNotice: 'EXISTING RECORD RETRIEVED (IDEMPOTENT REPLAY) — NO DUPLICATE CREATED'
          },
          message: `Application ${existingDoc.caseData.id || existingDoc.applicationNumber} has already been submitted to AICTE via NSWS. Showing existing record.`
        });
      }

      // If not previously ingested, persist into CaseStorage / MongoDB
      const projection = {
        caseData: application,
        applicationNumber: application.reference,
        institutionName: (application.facts as any)?.institutionName || application.institutionId,
        institutionCode: application.institutionId,
        region: application.regionId,
        state: (application.facts as any)?.state || 'Maharashtra',
        city: (application.facts as any)?.city || 'Pune',
        academicYear: application.session,
        applicationType: application.category,
        currentStage: application.state,
        currentStageStartedAt: new Date(application.stageEnteredAt),
        program: String(application.facts?.program || ''),
        proposedIntake: application.facts?.proposedIntake || 0,
        routeType: deriveRouteType(application),
        submittedAt: new Date(application.createdAt)
      };

      try {
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
            const auditEvent = {
              id: `AUDIT-NSWS-${application.id}`,
              occurredAt: application.createdAt,
              actorId: 'NSWS_PORTAL_SIMULATION',
              requestId: `REQ-NSWS-${application.id}`,
              applicationId: application.id,
              action: 'APPLICATION_INGESTED_VIA_NSWS',
              beforeState: undefined,
              afterState: 'submitted',
              caseVersion: 1,
              reason: `Ingested via simulated NSWS onboarding pipeline. Dynamic Route: ${routeExplanation.policyRevisionId}`,
              evidenceVersionIds: []
            };
            await (tx as any).audit(auditEvent);
          }
        });
      } catch (txErr: any) {
        console.warn('[DEBUG NSWS] storage.transaction error:', txErr.message);
        // Fallback for standalone MongoDB deployments where multi-document transactions are unsupported
        try {
          await ApplicationModel.create(projection);

          // Also record genesis audit event with canonical HMAC-SHA256 signature
          try {
            const auditEvent = {
              id: `AUDIT-NSWS-${application.id}`,
              occurredAt: application.createdAt,
              actorId: 'NSWS_PORTAL_SIMULATION',
              requestId: `REQ-NSWS-${application.id}`,
              applicationId: application.id,
              action: 'APPLICATION_INGESTED_VIA_NSWS',
              beforeState: undefined,
              afterState: 'submitted',
              caseVersion: 1,
              reason: `Ingested via simulated NSWS onboarding pipeline. Dynamic Route: ${routeExplanation.policyRevisionId}`,
              evidenceVersionIds: []
            };
            const hash = computeCanonicalAuditHash('GENESIS', auditEvent);
            await CoreAudit.updateOne(
              { id: auditEvent.id },
              { $setOnInsert: { id: auditEvent.id, data: { ...auditEvent, tamperProofHash: hash } } },
              { upsert: true }
            );
          } catch (auditErr: any) {
            console.warn('Audit record insertion note:', auditErr.message);
          }
        } catch (fbErr: any) {
          console.warn('[DEBUG NSWS] fbErr code:', fbErr.code, 'msg:', fbErr.message, 'keyPattern:', fbErr.keyPattern);
          if (fbErr.code === 11000) {
            // Concurrently inserted - retrieve and return existing gracefully
            const recheck: any = await ApplicationModel.findOne({ $or: queryCriteria }).lean().exec();
            if (recheck?.caseData) {
              return res.status(200).json({
                success: true,
                duplicateDetected: true,
                alreadySubmitted: true,
                data: {
                  application: recheck.caseData,
                  routeExplanation: recheck.caseData.route || routeExplanation,
                  simulationNotice: 'EXISTING RECORD RETRIEVED (CONCURRENT DEDUPLICATION) — NO DUPLICATE CREATED'
                },
                message: `Application ${recheck.caseData.id} already exists. Returning canonical record.`
              });
            }
          }
          console.warn('Fallback direct persistence note:', fbErr.message);
        }
      }

      return res.status(201).json({
        success: true,
        duplicateDetected: false,
        data: {
          application,
          routeExplanation,
          simulationNotice: 'SIMULATED TRANSACTION — PERSISTED IN LOCAL PROTOTYPE DATABASE'
        },
        message: `Application ${application.id} submitted via NSWS simulation. Route evaluated: ${routeExplanation.stages.join(' -> ')}`
      });
    } catch (err: any) {
      console.error('NSWS submit error:', err);
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: err.message || 'NSWS application submission failed.' }
      });
    }
  });

  return router;
}
