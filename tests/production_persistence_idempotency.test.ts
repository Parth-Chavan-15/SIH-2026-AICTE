import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createCompanionApp } from '../src/backend/companionApp';
import {
  complianceDB,
  persistObligationToMongo,
  persistStoredDocumentToMongo,
  syncComplianceFromMongo,
  uploadDocumentEvidence,
  verifyDocumentEvidence
} from '../src/backend/modules/compliance/complianceService';
import {
  generatedDocumentsDB,
  generateAndSignDecisionDocument,
  persistDecisionDocumentToMongo,
  syncDecisionDocumentsFromMongo,
  getDocumentMetadata
} from '../src/backend/modules/decisionDocuments/decisionDocumentsService';
import {
  hearingsDB,
  complaintsDB,
  lodgeComplaint,
  submitStatutoryAppeal,
  persistHearingToMongo,
  persistComplaintToMongo,
  syncAppealsAndHearingsFromMongo
} from '../src/backend/modules/appealsAndHearings/appealsAndHearingsService';
import {
  createEVCTask,
  scheduleEVC,
  clearEVCTasks,
  persistEVCTaskToMongo,
  syncEVCTasksFromMongo,
  getTasksForCase
} from '../src/backend/modules/evc/evcService';

describe('Production Persistence, Idempotency & Safe Diagnostic Verification', () => {
  let app: any;

  beforeEach(() => {
    const companion = createCompanionApp();
    app = companion.app;
  });

  describe('1. Synthetic Persistence Round-Trip without Mutating Real Data', () => {
    it('persists and retrieves synthetic compliance obligations safely', async () => {
      const syntheticOblId = `OBL-TEST-${Date.now()}`;
      const syntheticObl = {
        id: syntheticOblId,
        applicationId: 'APP-TEST-SYNTHETIC-001',
        decisionEventId: 'EVT-TEST-001',
        conditionKey: 'COND-FIRE-NOC',
        institutionId: 'INST-TEST-999',
        policyRevisionId: 'POL-2026-TEST',
        triggerEventId: 'EVT-TEST-001',
        source: {
          documentId: 'F.No. AICTE/TEST/999/2026/LoA',
          title: 'Letter of Approval',
          location: 'Clause 2.25',
          sourceRevision: 'v2026.1',
          reviewState: 'reviewed' as const
        },
        timerKind: 'event_relative' as const,
        dueAt: '2026-11-15T00:00:00.000Z',
        dueReason: 'Submission of Fire Safety Certificate',
        version: 1,
        status: 'pending' as const
      };

      // Write to in-memory map and call Mongo persistence helper
      complianceDB.obligations.set(syntheticOblId, syntheticObl);
      await persistObligationToMongo(syntheticObl);

      expect(complianceDB.obligations.get(syntheticOblId)).toBeDefined();
      expect(complianceDB.obligations.get(syntheticOblId)?.conditionKey).toBe('COND-FIRE-NOC');

      // Test sync execution (should safely complete without error)
      const synced = await syncComplianceFromMongo();
      expect(typeof synced).toBe('number');
    });

    it('persists and retrieves synthetic decision documents with HMAC integrity seal', async () => {
      const doc = await generateAndSignDecisionDocument({
        applicationId: 'APP-TEST-DOC-PERSIST',
        institutionName: 'Synthetic Institute of Technology',
        permanentInstituteId: '1-999999999',
        region: 'Western',
        academicYear: '2026-27',
        documentType: 'EoA',
        speakingOrderSummary: 'Extension of Approval granted for AY 2026-27 under APH Clause 2.14.',
        orderBackedConditions: [
          {
            conditionKey: 'COND-FACULTY-CADRE',
            requirement: 'Maintain Cadre Ratio 1:2:6 as per APH norms',
            governingClause: 'APH 2026-27 Chapter II §2.14',
            dueDays: 30
          }
        ]
      });

      expect(doc.docId).toBeDefined();
      expect(doc.digitalSignature.status).toBe('DEMO_SIGNATURE_VERIFIED');
      expect(doc.digitalSignature.hmacSignature).toBeDefined();
      expect(doc.orderBackedConditions).toHaveLength(1);

      // Verify persistence helper execution
      await persistDecisionDocumentToMongo(doc);
      const retrieved = getDocumentMetadata(doc.docId);
      expect(retrieved).toBeDefined();
      expect(retrieved?.fileNumber).toContain('AICTE/Western/1-999999999/2026-27/EoA');

      // Verify linked obligation was materialized in compliance store
      const linkedOblId = `OBL-APP-TEST-DOC-PERSIST-COND-FACULTY-CADRE`;
      expect(complianceDB.obligations.get(linkedOblId)).toBeDefined();

      const syncedDocs = await syncDecisionDocumentsFromMongo();
      expect(typeof syncedDocs).toBe('number');
    });

    it('persists complaints and appeals without touching existing canonical records', async () => {
      // 1. Complaint persistence
      const complaintRes = lodgeComplaint({
        caseId: 'APP-TEST-PERSIST-COMP',
        institutionName: 'Synthetic Academy of Engineering',
        complainantName: 'Prof. Test Complainant',
        isAnonymous: false,
        category: 'Faculty Pay Scales',
        description: 'Synthetic complaint regarding non-payment of allowances.'
      });

      expect(complaintRes.success).toBe(true);
      expect(complaintRes.complaint?.complaintId).toBeDefined();
      await persistComplaintToMongo(complaintRes.complaint!);

      // 2. Appeal persistence
      const appealRes = submitStatutoryAppeal({
        caseId: 'APP-TEST-PERSIST-APPEAL',
        institutionName: 'Synthetic Academy of Engineering',
        appealedDecisionRef: 'DEC-2026-TEST-REF',
        decisionDate: new Date().toISOString(), // within 7-day limit
        chapterType: 'CHAPTER_II',
        groundsOfAppeal: 'EVC report overlooked existing library contiguous space',
        submittedBy: 'Principal'
      });

      expect(appealRes.success).toBe(true);
      expect(appealRes.hearing?.id).toBeDefined();
      await persistHearingToMongo(appealRes.hearing!);

      const syncResult = await syncAppealsAndHearingsFromMongo();
      expect(typeof syncResult.hearings).toBe('number');
      expect(typeof syncResult.complaints).toBe('number');
    });
  });

  describe('2. Idempotency & Duplicate Prevention', () => {
    it('prevents processing of anonymous complaints under APH Chapter VII §7.10(h)', () => {
      const anonRes = lodgeComplaint({
        institutionName: 'Unknown Institute',
        complainantName: 'Anonymous',
        isAnonymous: true,
        category: 'Ragging',
        description: 'Anonymous allegation without verification details.'
      });

      expect(anonRes.success).toBe(false);
      expect(anonRes.complaint?.scscScrutinyStatus).toBe('REJECTED_ANONYMOUS');
      expect(anonRes.message).toContain('APH §7.10(h)');
    });

    it('rejects duplicate scheduling for already scheduled EVC task', async () => {
      const taskId = `EVC-IDEMP-TEST-${Date.now()}`;
      const scheduleTime = '2026-11-05T10:00:00.000Z';
      const idempKey = `KEY-IDEMP-A-${Date.now()}`;

      // First schedule: should succeed
      const firstSchedule = await scheduleEVC(taskId, scheduleTime, 1, idempKey);
      expect(firstSchedule.success).toBe(true);

      // Replay with identical idempotency key: should return cached success
      const replay = await scheduleEVC(taskId, scheduleTime, 1, idempKey);
      expect(replay.success).toBe(true);
      expect(replay).toEqual(firstSchedule);

      // Second schedule attempt with new key on already scheduled task: must be rejected
      const secondSchedule = await scheduleEVC(taskId, scheduleTime, 2, `KEY-IDEMP-B-${Date.now()}`);
      expect(secondSchedule.success).toBe(false);
      if (!secondSchedule.success) {
        expect(secondSchedule.error?.failedRule).toBe('EVC_DUPLICATE_SCHEDULE_FORBIDDEN');
      }
    });

    it('statutory appeal is strictly time-barred after 7 calendar days', () => {
      const eightDaysAgo = new Date(Date.now() - 8 * 86400000).toISOString();
      const appealRes = submitStatutoryAppeal({
        caseId: 'APP-TEST-LATE-APPEAL',
        institutionName: 'Late Institute of Technology',
        appealedDecisionRef: 'DEC-2026-OLD',
        decisionDate: eightDaysAgo,
        chapterType: 'CHAPTER_II',
        groundsOfAppeal: 'Out-of-time appeal representation',
        submittedBy: 'Principal'
      });

      expect(appealRes.success).toBe(false);
      expect(appealRes.error).toContain('APPEAL_TIME_BARRED');
      expect(appealRes.error).toContain('Statutory limit is 7 days');
    });
  });

  describe('3. Readiness and Health Diagnostic Probes', () => {
    it('/health endpoint returns 200 with liveness metadata and readiness link', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('alive');
      expect(typeof res.body.uptimeSeconds).toBe('number');
      expect(res.body.readiness).toBe('/api/v1/ready');
      expect(res.body.commit).toBeDefined();
    });

    it('/api/v1/ready endpoint returns 200 with safe storage diagnostic metadata in test mode', async () => {
      const res = await request(app).get('/api/v1/ready');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ready');
      expect(res.body.data.storageMode).toBeDefined();
      expect(res.body.data.database).toBeDefined();
      // Ensure credentials or connection strings are NEVER leaked in diagnostic payload
      const serialized = JSON.stringify(res.body);
      expect(serialized).not.toContain('mongodb://');
      expect(serialized).not.toContain('mongodb+srv://');
      expect(serialized).not.toContain('@');
    });

    it('/api/v1/ready returns 503 with safe diagnostic error when production mode lacks MONGODB_URI', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const originalMongoUri = process.env.MONGODB_URI;

      try {
        process.env.NODE_ENV = 'production';
        delete process.env.MONGODB_URI;

        const res = await request(app).get('/api/v1/ready');
        expect(res.status).toBe(503);
        expect(res.body.success).toBe(false);
        expect(res.body.status).toBe('unhealthy');
        expect(res.body.storageMode).toBe('in-memory-unverified');
        expect(res.body.error.code).toBe('DATABASE_NOT_CONFIGURED');
        expect(res.body.data.database.configured).toBe(false);
        expect(res.body.data.database.connected).toBe(false);
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
        if (originalMongoUri) {
          process.env.MONGODB_URI = originalMongoUri;
        } else {
          delete process.env.MONGODB_URI;
        }
      }
    });

    it('/api/v1/demo/reset is forbidden in production unless explicitly authorized', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        const res = await request(app).post('/api/v1/demo/reset');
        expect(res.status).toBe(403);
        expect(res.body.error.code).toBe('FORBIDDEN');
      } finally {
        process.env.NODE_ENV = originalNodeEnv;
      }
    });
  });
});
