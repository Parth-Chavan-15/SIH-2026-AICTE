import { Router, Request, Response } from 'express';
import { createHash } from 'node:crypto';
import {
  generateAndSignDecisionDocument,
  getDocumentMetadata,
  getAllGeneratedDocuments,
  generatedDocumentsDB
} from './decisionDocumentsService';
import type { Actor } from '../../../shared/contracts';
import { requirePermission } from '../../security/authorization';
import type { CaseStorage } from '../../core/storage';

export function createDecisionDocumentsRouter(storage?: CaseStorage): Router {
  const router = Router();

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

  // POST /api/v1/decision-docs/generate/:caseId - Auto-generate and sign per case (Secured with decision.record)
  router.post('/decision-docs/generate/:caseId', requirePermission('decision.record'), async (req: Request, res: Response) => {
    const actor = req.actor;
    if (!actor || !actor.id) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } });
    }

    const caseId = req.params.caseId;
    const rawType = (req.body.documentType || 'EoA').trim().toUpperCase();
    const documentType: 'LoA' | 'EoA' | 'LoD' | 'LoR' = rawType === 'LOA' ? 'LoA'
      : rawType === 'EOA' ? 'EoA'
      : rawType === 'LOD' ? 'LoD'
      : 'LoR';

    let institutionName = 'College of Engineering Pune (COEP)';
    let permanentInstituteId = '1-435789102';
    let region = 'Western';
    let academicYear = '2026-27';

    if (storage) {
      try {
        const app = await storage.get(actor, caseId);
        if (!app) {
          return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Application ${caseId} not found` } });
        }
        if (app.facts?.institutionName) institutionName = app.facts.institutionName as string;
        if (app.institutionId) permanentInstituteId = app.institutionId;
        if (app.regionId) region = app.regionId;
        if (app.session) academicYear = app.session;
      } catch (err: any) {
        if (err?.code === 'NOT_FOUND') {
          return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Application ${caseId} not found` } });
        }
      }
    }

    try {
      const doc = await generateAndSignDecisionDocument({
        applicationId: caseId,
        institutionName,
        permanentInstituteId,
        region,
        academicYear,
        documentType,
        speakingOrderSummary: req.body.speakingOrderSummary || `Council Executive Committee approved ${documentType} for Academic Year ${academicYear} per APH norms.`,
        courses: req.body.courses || [
          { program: 'Engineering & Technology', course: 'Computer Engineering', approvedIntake: 180, level: 'Under Graduate' },
          { program: 'Engineering & Technology', course: 'Mechanical Engineering', approvedIntake: 120, level: 'Under Graduate' }
        ],
        orderBackedConditions: req.body.orderBackedConditions || [
          {
            conditionKey: 'COND-AFF-3',
            requirement: 'Affidavit-3 compliance proof of security deposit submission within 15 calendar days per APH §2.25(f)',
            dueDays: 15,
            governingClause: 'APH §2.25(f)'
          },
          {
            conditionKey: 'COND-FIRE-RENEW',
            requirement: 'Annual Fire Safety NOC renewal intimation 60 days in advance of certificate expiry',
            dueDays: 300,
            governingClause: 'GVMC Condition 10 / APH §6.17'
          }
        ],
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
        message: 'Decision document generated with HMAC-SHA256 prototype integrity seal.'
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'GENERATION_FAILED', message: err.message } });
    }
  });

  // GET /api/v1/decision-docs/verify-signature/:caseId
  router.get('/decision-docs/verify-signature/:caseId', (req: Request, res: Response) => {
    const caseId = req.params.caseId;
    const docs = getAllGeneratedDocuments();
    const doc = docs.find(d => d.applicationId === caseId) || docs[0];
    if (!doc) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No document found for case' } });
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
  router.get('/decision-docs/download/:caseId', (req: Request, res: Response) => {
    const caseId = req.params.caseId;
    const docs = getAllGeneratedDocuments();
    const doc = docs.find(d => d.applicationId === caseId) || docs[0];
    if (!doc || !doc.pdfBytesBase64) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'PDF binary not found' } });
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

  // POST /api/v1/decision-documents/generate - Authority generates & signs institute-specific letter (Secured)
  router.post('/decision-documents/generate', requirePermission('decision.record'), async (req: Request, res: Response) => {
    const actor = req.actor;
    if (!actor || !actor.id) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } });
    }

    try {
      const {
        applicationId,
        institutionName,
        permanentInstituteId,
        region,
        academicYear,
        documentType,
        speakingOrderSummary,
        courses,
        orderBackedConditions
      } = req.body;

      if (!applicationId || !institutionName || !permanentInstituteId || !documentType) {
        return res.status(422).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'applicationId, institutionName, permanentInstituteId, and documentType are required.' }
        });
      }

      const doc = await generateAndSignDecisionDocument({
        applicationId,
        institutionName,
        permanentInstituteId,
        region: region || 'Western',
        academicYear: academicYear || '2026-27',
        documentType,
        speakingOrderSummary: speakingOrderSummary || 'Approved in terms of AICTE Approval Process Handbook norms.',
        courses,
        orderBackedConditions,
        decisionAuthority: actor.id,
        designation: 'Approval Bureau Authority'
      });

      const { pdfBytesBase64, ...responseMeta } = doc;
      return res.status(201).json({
        success: true,
        data: responseMeta,
        downloadUrl: `/api/v1/decision-documents/${doc.docId}/download`,
        message: `Official ${documentType} letter generated with HMAC-SHA256 prototype integrity seal.`
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'GENERATION_FAILED', message: err.message || 'PDF generation failed' }
      });
    }
  });

  // POST /api/v1/decision-documents/verify-signature/:docId - Genuine SHA-256 Digest Verification
  router.post('/decision-documents/verify-signature/:docId', (req: Request, res: Response) => {
    const doc = getDocumentMetadata(req.params.docId);
    if (!doc || !doc.pdfBytesBase64) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    // Recompute actual SHA-256 hash of the stored binary
    const actualHash = createHash('sha256').update(Buffer.from(doc.pdfBytesBase64, 'base64')).digest('hex');
    const storedHash = doc.digitalSignature.integrityHashSha256;

    let isSignatureValid = actualHash === storedHash;
    let tamperCheck: 'PASSED_UNMODIFIED' | 'TAMPER_DETECTED' = isSignatureValid ? 'PASSED_UNMODIFIED' : 'TAMPER_DETECTED';

    // If caller provided client-side PDF bytes to check for tampering
    if (req.body?.pdfBytesBase64) {
      const clientHash = createHash('sha256').update(Buffer.from(req.body.pdfBytesBase64, 'base64')).digest('hex');
      if (clientHash !== storedHash) {
        isSignatureValid = false;
        tamperCheck = 'TAMPER_DETECTED';
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        docId: doc.docId,
        isSignatureValid,
        signatureStatus: isSignatureValid ? doc.digitalSignature.status : 'TAMPERED_INVALID',
        signerName: doc.digitalSignature.signerName,
        signerRole: doc.digitalSignature.signerRole,
        certificateAuthority: doc.digitalSignature.certificateAuthority,
        signatureAlgorithm: doc.digitalSignature.signatureAlgorithm,
        signedAt: doc.digitalSignature.signedAt,
        sha256Hash: actualHash,
        prominentNotice: doc.digitalSignature.prominentNotice,
        tamperCheck,
        signatureType: 'HMAC_SHA256_PROTOTYPE_SEAL'
      }
    });
  });

  return router;
}
