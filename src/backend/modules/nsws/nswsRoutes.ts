import { Router, Request, Response } from 'express';
import {
  onboardInvestor,
  verifyPan,
  verifyDSC,
  buildApplicationFromNSWS,
  simulatedProfiles
} from './nswsService';
import { evaluateDynamicRoute } from '../../policy/dynamicRouteEngine';
import { verifyDSCSignature } from '../../adapters/ecosystemAdapters';
import type { CaseStorage } from '../../core/storage';
import type { Actor } from '../../../shared/contracts';
import mongoose from 'mongoose';
import ApplicationModel from '../../models/Application.js';
import { deriveRouteType } from '../../persistence/mongoCore';
import { CoreAudit } from '../../persistence/records';
import { computeCanonicalAuditHash } from '../../security/auditVerification';

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
      const isBlocked = routeDecision.eligibilityStatus === 'INELIGIBLE';
      const canonicalRouteType = routeDecision.policyRevisionId.includes('NBA') && !routeDecision.policyRevisionId.includes('NON-NBA')
        ? 'SCRUTINY_ONLY'
        : routeDecision.stages.includes('evc_pending')
        ? 'SCRUTINY_AND_EVC'
        : 'SCRUTINY_ONLY';

      return res.status(200).json({
        success: true,
        data: {
          routeDecision: {
            ...routeDecision,
            routeType: canonicalRouteType,
            requiresEVC: !isBlocked && routeDecision.stages.includes('evc_pending'),
            fastTrackEligible: !isBlocked && routeDecision.policyRevisionId.includes('NBA') && routeDecision.eligibilityStatus === 'ELIGIBLE',
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
      const { investorId, tokenType, signatoryName, signatoryPan, dscSigned, documentId } = req.body;
      if (!investorId) {
        return res.status(422).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'investorId is required.' }
        });
      }

      // Authoritative DSC gateway verification (APH §1.4.3 & §2.3.4(a))
      const dscResult = verifyDSCSignature({
        documentId: documentId || ('DOC-DSC-' + Date.now()),
        dscSigned: dscSigned !== false && tokenType !== 'UnsignedDocument',
        tokenType: tokenType || 'ePass2003Auto',
        signatoryName,
        signatoryPan
      });

      const result = verifyDSC(investorId);
      const profile = simulatedProfiles.get(investorId);
      if (profile) {
        profile.dscDetails = {
          certSerialNumber: dscResult.certSerialNumber,
          signatoryName: dscResult.signatoryName,
          tokenType: dscResult.tokenType,
          verifiedAt: dscResult.verifiedAt
        };
        simulatedProfiles.set(investorId, profile);
      }

      return res.status(200).json({ success: true, data: { ...result, ...dscResult } });
    } catch (err: any) {
      if (err.message && err.message.includes('DSC_SIGNATURE_REQUIRED')) {
        return res.status(422).json({
          success: false,
          error: { code: 'DSC_SIGNATURE_REQUIRED', message: err.message }
        });
      }
      if (err.message && (err.message.includes('DSC_CERTIFICATE_EXPIRED') || err.message.includes('DSC_CERTIFICATE_REVOKED'))) {
        const code = err.message.includes('DSC_CERTIFICATE_EXPIRED') ? 'DSC_CERTIFICATE_EXPIRED' : 'DSC_CERTIFICATE_REVOKED';
        return res.status(422).json({
          success: false,
          error: { code, message: err.message }
        });
      }
      return res.status(400).json({ success: false, error: { code: 'OPERATION_FAILED', message: err.message } });
    }
  });

  // POST /api/v1/nsws/submit - Step 4 & 5: Submit AICTE application & invoke real route engine
  router.post('/nsws/submit', async (req: Request, res: Response) => {
    try {
      const instName = req.body.institutionName || req.body.facts?.institutionName;
      if (req.body.idempotencyKey?.includes('CUSTOM') || req.body.selectedPresetId === 'custom') {
        if (!instName || !String(instName).trim()) {
          return res.status(422).json({
            success: false,
            error: {
              code: 'VALIDATION_FAILED',
              message: 'Institution Legal Name is required for custom application intake.'
            }
          });
        }
      }

      const { application, routeExplanation } = buildApplicationFromNSWS(req.body);

      // Statutory Ineligibility Guard: Do not allow submission of ineligible applications
      if (routeExplanation.eligibilityStatus === 'INELIGIBLE') {
        return res.status(422).json({
          success: false,
          error: {
            code: 'STATUTORY_INELIGIBILITY',
            message: `Submission Blocked: Ineligible under AICTE Norms. ${routeExplanation.reasons.join('; ')}`,
            unresolvedFlags: routeExplanation.unresolvedFlags
          }
        });
      }

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

        if (false && application.facts?.nswsInvestorId) {
          queryCriteria.push({ 'caseData.facts.nswsInvestorId': application.facts.nswsInvestorId });
        }

        if (false && application.institutionId && application.session && application.category) {
          queryCriteria.push({
            institutionCode: application.institutionId,
            academicYear: application.session,
            applicationType: application.category,
            program: String(application.facts?.program || 'Engineering and Technology'),
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
        try {
          const { getIdentity } = await import('../../security/identity');
          const idp = getIdentity();
          (idp as any).ensureInstitutionScope?.(existingDoc.caseData.institutionId, existingDoc.caseData.regionId);
        } catch (_idErr) {}
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
        proposedIntake: Number(application.facts?.proposedIntake || 180),
        routeType: deriveRouteType(application),
        submittedAt: new Date(application.createdAt)
      };

      try {
        await storage.transaction(async (tx) => {
          const actor: Actor = {
            id: 'SYSTEM_NSWS_SIMULATION',
            roles: ['institution'],
            permissions: ['case.create', 'case.read', 'case.update'],
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

        if (mongoose.connection?.readyState === 1) {
          try {
            await ApplicationModel.updateOne(
              { 'caseData.id': application.id },
              { $set: projection },
              { upsert: true }
            );
          } catch (mErr: any) {
            console.warn('[NSWS] Mongo sync note:', mErr.message);
          }
        }
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

      try {
        const { getIdentity } = await import('../../security/identity');
        const idp = getIdentity();
        (idp as any).ensureInstitutionScope?.(application.institutionId, application.regionId);
      } catch (_idErr) {}

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
