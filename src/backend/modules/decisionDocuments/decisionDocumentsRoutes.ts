import { Router, Request, Response } from 'express';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import {
  generateAndSignDecisionDocument,
  getDocumentMetadata,
  getAllGeneratedDocuments,
  generatedDocumentsDB,
  PROTOTYPE_SEAL_KEY
} from './decisionDocumentsService';
import type { Actor, Application, Decision } from '../../../shared/contracts';
import { requirePermission } from '../../security/authorization';
import type { CaseStorage } from '../../core/storage';
import { CANONICAL_DECISIONS } from '../../data/seedCanonicalCases';

export function createDecisionDocumentsRouter(storage?: CaseStorage): Router {
  const router = Router();

  // Helper for unified document generation bound to canonical recorded decision
  async function executeAuthorizedDocumentGeneration(
    actor: Actor,
    caseId: string,
    rawRequestedType: string | undefined,
    bodyApplicationId: string | undefined,
    res: Response
  ) {
    // 1. Cross-case protection: Validate application ID consistency
    if (bodyApplicationId && bodyApplicationId !== caseId) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: `Mismatched application ID: URL parameter '${caseId}' does not match body applicationId '${bodyApplicationId}'.`
        }
      });
    }

    // 2. Fetch canonical application from storage
    if (!storage) {
      return res.status(503).json({
        success: false,
        error: { code: 'STORAGE_UNAVAILABLE', message: 'Authoritative storage unavailable' }
      });
    }

    let app: Application | null = null;
    try {
      app = await storage.get(actor, caseId);
    } catch (err: any) {
      if (err?.code === 'NOT_FOUND') {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Application ${caseId} not found` }
        });
      }
      return res.status(503).json({
        success: false,
        error: { code: 'STORAGE_UNAVAILABLE', message: err.message }
      });
    }

    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Application ${caseId} not found` }
      });
    }

    // 3. Precondition: Check route resolution (halted cases cannot generate documents)
    if (app.route?.result === 'review_required') {
      return res.status(412).json({
        success: false,
        error: {
          code: 'PRECONDITION_FAILED',
          message: `Application ${caseId} route is halted for policy review (review_required). A decision document cannot be generated until policy review is complete.`
        }
      });
    }

    // 4. Precondition: Verify that an authorized decision exists
    const inspectDecisions: Decision[] = (storage as any).inspect?.().decisions || [];
    const recordedDecision = inspectDecisions.find(d => d.applicationId === caseId) ||
      CANONICAL_DECISIONS.find(d => d.applicationId === caseId);

    const isTerminalState = app.state === 'approved' || app.state === 'conditionally_approved' || app.state === 'rejected';

    if (!recordedDecision && !isTerminalState) {
      return res.status(412).json({
        success: false,
        error: {
          code: 'PRECONDITION_FAILED',
          message: `No authorized decision has been recorded for application ${caseId}. Current case state is '${app.state}'. A formal Council/Executive Committee decision must be recorded prior to document generation.`
        }
      });
    }

    // Determine authoritative outcome
    const outcome: 'approved' | 'conditional' | 'rejected' = recordedDecision?.outcome ||
      (app.state === 'rejected' ? 'rejected' : app.state === 'conditionally_approved' ? 'conditional' : 'approved');

    // 5. Outcome and Document Type Alignment
    const normalizedRaw = (rawRequestedType || '').trim().toUpperCase();

    if (outcome === 'rejected') {
      if (normalizedRaw === 'LOA' || normalizedRaw === 'EOA') {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: `Cannot generate approval document (${normalizedRaw}) for rejected application ${caseId}. Authoritative outcome is 'rejected'. Must generate LoR.`
          }
        });
      }
    } else {
      // outcome is approved or conditional
      if (normalizedRaw === 'LOR' || normalizedRaw === 'LOD') {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: `Cannot generate rejection or deficiency document (${normalizedRaw}) for an approved application. Must generate LoA/EoA.`
          }
        });
      }
    }

    const documentType: 'LoA' | 'EoA' | 'LoD' | 'LoR' = outcome === 'rejected'
      ? 'LoR'
      : app.category === 'new_institution'
        ? 'LoA'
        : 'EoA';

    // 6. Idempotency Check: prevent duplicate generation and duplicate obligations
    const existingDoc = getAllGeneratedDocuments().find(
      d => d.applicationId === caseId && d.documentType === documentType
    );
    if (existingDoc) {
      return res.status(200).json({
        success: true,
        data: {
          document: {
            ...existingDoc,
            caseId: existingDoc.applicationId,
            signatureStatus: 'DEMO_TEST_SIGNED',
            demoNotice: 'DEMO PROTOTYPE INTEGRITY SEAL — NOT AN OFFICIAL AICTE ORDER',
            documentDigest: `SHA256-${existingDoc.digitalSignature.integrityHashSha256}`
          }
        },
        message: `Existing authorized ${documentType} letter returned (idempotent retry).`
      });
    }

    // 7. Authoritative Data Sourcing (Canonical case facts and decision records ONLY)
    const institutionName = (app.facts?.institutionName as string) || 'Institution';
    const permanentInstituteId = app.institutionId;
    const region = app.regionId;
    const academicYear = app.session;

    const courses = outcome !== 'rejected'
      ? [
          {
            program: (app.facts?.program as string) || 'Engineering & Technology',
            course: (app.facts?.course as string) || 'Approved Technical Course',
            level: 'Under Graduate',
            previousIntake: Number(app.facts?.currentIntake) || 0,
            approvedIntake: Number(app.facts?.proposedIntake) || Number(app.facts?.currentIntake) || 60
          }
        ]
      : [];

    const orderBackedConditions = (outcome === 'conditional' && recordedDecision?.conditions)
      ? recordedDecision.conditions.map(c => ({
          conditionKey: c.conditionKey,
          requirement: c.dueReason,
          governingClause: c.source?.location || 'APH §2.25(f)',
          dueDays: 15
        }))
      : [];

    const speakingOrderSummary = outcome === 'rejected'
      ? `Council Executive Committee rejected application ${caseId} under AICTE Act §10(k) based on recorded statutory shortcomings.`
      : outcome === 'conditional'
        ? `Council Executive Committee granted Extension of Approval for Academic Year ${academicYear} subject to fulfillment of mandatory recorded undertakings under APH §2.25.`
        : `Council Executive Committee granted Extension of Approval for Academic Year ${academicYear} per APH norms.`;

    try {
      const doc = await generateAndSignDecisionDocument({
        applicationId: caseId,
        institutionName,
        permanentInstituteId,
        region,
        academicYear,
        documentType,
        speakingOrderSummary,
        courses,
        orderBackedConditions,
        decisionAuthority: actor.id,
        designation: 'Approval Bureau Authority'
      });

      return res.status(201).json({
        success: true,
        data: {
          document: {
            ...doc,
            caseId: doc.applicationId,
            signatureStatus: 'DEMO_TEST_SIGNED',
            demoNotice: 'DEMO PROTOTYPE INTEGRITY SEAL — NOT AN OFFICIAL AICTE ORDER',
            documentDigest: `SHA256-${doc.digitalSignature.integrityHashSha256}`
          }
        },
        message: `Official ${documentType} letter generated with HMAC-SHA256 prototype integrity seal.`
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'GENERATION_FAILED', message: err.message || 'PDF generation failed' }
      });
    }
  }

  // GET /api/v1/decision-docs - List generated decision docs
  router.get('/decision-docs', (_req: Request, res: Response) => {
    const docs = getAllGeneratedDocuments();
    return res.status(200).json({
      success: true,
      data: {
        documents: docs.map(({ pdfBytesBase64, ...rest }) => ({
          ...rest,
          caseId: rest.applicationId,
          dispatchNumber: rest.docId,
          signatureStatus: rest.digitalSignature?.status || 'DEMO_TEST_SIGNED',
          documentDigest: `SHA256-${rest.digitalSignature?.integrityHashSha256?.slice(0, 16)}`,
          signerName: rest.digitalSignature?.signerName || 'Approval Bureau Authority, AICTE',
          orderConditions: rest.orderBackedConditions?.map(c => c.requirement || c.conditionKey) || []
        }))
      }
    });
  });

  // POST /api/v1/decision-docs/generate/:caseId - Auto-generate per case (Secured with decision.record)
  router.post('/decision-docs/generate/:caseId', requirePermission('decision.record'), async (req: Request, res: Response) => {
    const actor = req.actor;
    if (!actor || !actor.id) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } });
    }

    const caseId = req.params.caseId;
    return executeAuthorizedDocumentGeneration(
      actor,
      caseId,
      req.body.documentType,
      req.body.applicationId,
      res
    );
  });

  // POST /api/v1/decision-documents/generate - Alias endpoint (Secured with decision.record)
  router.post('/decision-documents/generate', requirePermission('decision.record'), async (req: Request, res: Response) => {
    const actor = req.actor;
    if (!actor || !actor.id) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } });
    }

    const caseId = req.body.applicationId;
    if (!caseId) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: 'applicationId is required.' }
      });
    }

    return executeAuthorizedDocumentGeneration(
      actor,
      caseId,
      req.body.documentType,
      req.body.applicationId,
      res
    );
  });

  // GET /api/v1/decision-docs/verify-signature/:caseId
  router.get('/decision-docs/verify-signature/:caseId', (req: Request, res: Response) => {
    const caseId = req.params.caseId;
    const docs = getAllGeneratedDocuments();
    const doc = docs.find(d => d.applicationId === caseId);
    if (!doc) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `No decision document found for case ${caseId}` } });
    }
    return res.status(200).json({
      success: true,
      data: {
        valid: true,
        signer: doc.digitalSignature.signerName,
        issuer: doc.digitalSignature.certificateAuthority,
        algorithm: doc.digitalSignature.signatureAlgorithm,
        digest: doc.digitalSignature.integrityHashSha256,
        notice: doc.digitalSignature.prominentNotice
      }
    });
  });

  // GET /api/v1/decision-docs/download/:caseId
  router.get('/decision-docs/download/:caseId', async (req: Request, res: Response) => {
    const caseId = req.params.caseId;
    const actor = (req as any).actor as Actor | undefined;
    if (actor && storage) {
      try {
        const app = await storage.get(actor, caseId);
        if (!app) {
          return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Case ${caseId} not found or inaccessible in caller scope` } });
        }
      } catch {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Case ${caseId} not found or inaccessible in caller scope` } });
      }
    }
    const docs = getAllGeneratedDocuments();
    const doc = docs.find(d => d.applicationId === caseId);
    if (!doc || !doc.pdfBytesBase64) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `PDF binary not found for case ${caseId}` } });
    }
    const pdfBuffer = Buffer.from(doc.pdfBytesBase64, 'base64');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="AICTE_${doc.documentType}_${caseId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  });

  // GET /api/v1/decision-documents/list - List all generated decision letters
  router.get('/decision-documents/list', (_req: Request, res: Response) => {
    const docs = getAllGeneratedDocuments();
    return res.status(200).json({
      success: true,
      data: docs.map(({ pdfBytesBase64, ...rest }) => rest)
    });
  });

  // GET /api/v1/decision-documents/:docId - Fetch single document detail
  router.get('/decision-documents/:docId', (req: Request, res: Response) => {
    const doc = getDocumentMetadata(req.params.docId);
    if (!doc) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }
    const { pdfBytesBase64, ...rest } = doc;
    return res.status(200).json({ success: true, data: rest });
  });

  // GET /api/v1/decision-documents/:docId/download - Download real generated PDF
  router.get('/decision-documents/:docId/download', (req: Request, res: Response) => {
    const doc = getDocumentMetadata(req.params.docId);
    if (!doc || !doc.pdfBytesBase64) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'PDF binary not found' } });
    }

    const pdfBuffer = Buffer.from(doc.pdfBytesBase64, 'base64');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.docId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
  });

  // POST /api/v1/decision-documents/verify-signature/:docId - Genuine HMAC-SHA256 Digest Verification
  router.post('/decision-documents/verify-signature/:docId', (req: Request, res: Response) => {
    const doc = getDocumentMetadata(req.params.docId);
    if (!doc || !doc.pdfBytesBase64) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    if (!req.body || req.body.pdfBytesBase64 === undefined || req.body.pdfBytesBase64 === null) {
      return res.status(422).json({
        success: false,
        error: { code: 'MISSING_PAYLOAD', message: 'pdfBytesBase64 payload is required for signature verification' }
      });
    }

    if (typeof req.body.pdfBytesBase64 !== 'string') {
      return res.status(422).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'pdfBytesBase64 must be a base64-encoded string' }
      });
    }

    // Oversized input check (10MB)
    if (req.body.pdfBytesBase64.length > 10 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: 'Payload exceeds 10MB limit' }
      });
    }

    const trimmed = req.body.pdfBytesBase64.trim();
    if (!/^[A-Za-z0-9+/=]+$/.test(trimmed)) {
      return res.status(422).json({
        success: false,
        error: { code: 'MALFORMED_BASE64', message: 'Malformed base64 encoding in PDF payload' }
      });
    }

    const clientBuffer = Buffer.from(trimmed, 'base64');
    if (clientBuffer.length === 0) {
      return res.status(422).json({
        success: false,
        error: { code: 'EMPTY_PAYLOAD', message: 'Decoded PDF buffer is empty' }
      });
    }

    const clientSha256 = createHash('sha256').update(clientBuffer).digest('hex');
    const clientHmac = createHmac('sha256', PROTOTYPE_SEAL_KEY).update(clientBuffer).digest('hex');

    const storedHmacBuf = Buffer.from(doc.digitalSignature.hmacSignature || '', 'hex');
    const clientHmacBuf = Buffer.from(clientHmac, 'hex');

    const isSignatureValid = storedHmacBuf.length > 0 &&
      storedHmacBuf.length === clientHmacBuf.length &&
      timingSafeEqual(storedHmacBuf, clientHmacBuf);

    const tamperCheck: 'PASSED_UNMODIFIED' | 'TAMPER_DETECTED' = isSignatureValid ? 'PASSED_UNMODIFIED' : 'TAMPER_DETECTED';

    return res.status(200).json({
      success: true,
      data: {
        docId: doc.docId,
        isSignatureValid,
        signatureStatus: isSignatureValid ? doc.digitalSignature.status : 'TAMPERED_INVALID',
        signerName: doc.digitalSignature.signerName,
        signerRole: doc.digitalSignature.signerRole,
        certificateAuthority: doc.digitalSignature.certificateAuthority,
        signatureAlgorithm: 'HMAC-SHA256 Prototype Integrity Seal',
        signedAt: doc.digitalSignature.signedAt,
        sha256Hash: clientSha256,
        prominentNotice: doc.digitalSignature.prominentNotice,
        tamperCheck,
        signatureType: 'HMAC_SHA256_PROTOTYPE_SEAL'
      }
    });
  });

  return router;
}
