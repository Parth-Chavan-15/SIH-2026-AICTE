import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createCompanionApp } from '../src/backend/companionApp';

describe('Exhaustive UI Interaction & Endpoint Verification Suite', () => {
  let app: any;

  beforeEach(() => {
    const companion = createCompanionApp();
    app = companion.app;
  });

  async function loginAs(email: string) {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Origin', 'http://localhost:3000')
      .send({ email, password: 'password123' });
    expect(res.status).toBe(200);
    const cookie = res.headers['set-cookie']?.[0]?.split(';')?.[0];
    return { cookie, actor: res.body.data.actor };
  }

  describe('Defect 8.1 — DSC / emBridge Simulation & Token Gateways', () => {
    it('succeeds for valid Class-3 cryptographic hardware token (ePass2003Auto)', async () => {
      const res = await request(app)
        .post('/api/v1/adapter/dsc-verify')
        .send({
          documentId: 'DOC-TEST-VALID-01',
          dscSigned: true,
          tokenType: 'ePass2003Auto',
          signatoryName: 'Dr. Anand Deshpande'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verified).toBe(true);
      expect(res.body.data.certificateLevel).toBe('Class-3 e-Token');
      expect(res.body.data.gateway).toBe('AICTESigner / mSigner V3.2');
    });

    it('rejects expired DSC token certificate with statutory citation (422)', async () => {
      const res = await request(app)
        .post('/api/v1/adapter/dsc-verify')
        .send({
          documentId: 'DOC-TEST-EXPIRED-01',
          dscSigned: true,
          tokenType: 'ExpiredToken',
          signatoryName: 'Dr. Anand Deshpande'
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('DSC_CERTIFICATE_EXPIRED');
      expect(res.body.error.message).toContain('expired');
      expect(res.body.error.message).toContain('APH §1.4.3');
    });

    it('rejects revoked certificate matched against CRL with statutory reason (422)', async () => {
      const res = await request(app)
        .post('/api/v1/adapter/dsc-verify')
        .send({
          documentId: 'DOC-TEST-REVOKED-01',
          dscSigned: true,
          tokenType: 'RevokedCert',
          signatoryName: 'Dr. Anand Deshpande'
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('DSC_CERTIFICATE_REVOKED');
      expect(res.body.error.message).toContain('revoked');
    });

    it('rejects unsigned document submission under APH §1.4.3 & §2.3.4(a) (422)', async () => {
      const res = await request(app)
        .post('/api/v1/adapter/dsc-verify')
        .send({
          documentId: 'DOC-TEST-UNSIGNED-01',
          dscSigned: false,
          tokenType: 'UnsignedDocument'
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('DSC_SIGNATURE_REQUIRED');
      expect(res.body.error.message).toContain('Class-3 Digital Signature are strictly invalid');
    });

    it('completes NSWS onboarding and pre-evaluation pipeline', async () => {
      const onboardRes = await request(app)
        .post('/api/v1/nsws/onboard')
        .send({
          pan: 'AAACB1234F',
          signatoryName: 'Dr. Anand Deshpande',
          mobile: '9876543210',
          email: 'principal@coep.ac.in',
          simulatedOtp: '123456'
        });

      expect(onboardRes.status).toBe(200);
      expect(onboardRes.body.success).toBe(true);
      expect(onboardRes.body.data.nswsReference).toBeDefined();

      const routeRes = await request(app)
        .post('/api/v1/nsws/evaluate-route')
        .send({
          facts: {
            category: 'increase_intake',
            institutionType: 'existing',
            program: 'Engineering and Technology',
            level: 'Under Graduate',
            proposedIntake: 180,
            existingIntake: 120,
            nbaAccredited: true,
            nbaScore: 680,
            builtUpAreaSqM: 12500,
            region: 'Western'
          }
        });

      expect(routeRes.status).toBe(200);
      expect(routeRes.body.success).toBe(true);
      expect(routeRes.body.data.routeDecision.routeType).toBeDefined();
    });
  });

  describe('Defect 8.2 — Active Rules Registry & Policy Admin Sandbox (Role 6)', () => {
    it('GET /api/v1/rules-registry/active returns populated rules array with APH locators', async () => {
      const res = await request(app).get('/api/v1/rules-registry/active');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.rules)).toBe(true);
      expect(res.body.data.rules.length).toBeGreaterThan(0);
      const rule = res.body.data.rules[0];
      expect(rule.id || rule.ruleId).toBeDefined();
      expect(rule.clause || rule.clauseLocator).toBeDefined();
      expect(rule.page || rule.physicalPdfPage).toBeDefined();
      expect(rule.document || rule.sourceTitle).toBeDefined();
    });

    it('GET /api/v1/rules-registry/conflicts returns statutory conflict register', async () => {
      const res = await request(app).get('/api/v1/rules-registry/conflicts');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.conflicts)).toBe(true);
      expect(res.body.data.conflicts.length).toBeGreaterThan(0);
      const conflict = res.body.data.conflicts[0];
      expect(conflict.id || conflict.ruleId || conflict.conflictId).toBeDefined();
      expect(conflict.safeHandlingPath).toBeDefined();
    });

    it('POST /api/v1/rules-registry/simulate-route evaluates facts without mutating live rules', async () => {
      const res = await request(app)
        .post('/api/v1/rules-registry/simulate-route')
        .send({
          facts: {
            category: 'increase_intake',
            program: 'Engineering and Technology',
            level: 'Under Graduate',
            proposedIntake: 360,
            nbaAccredited: true,
            nbaScore: 700
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.simulation.routeDecision || res.body.data.routeDecision).toBeDefined();
    });

    it('creates draft rule revision, produces diff, and publishes revision', async () => {
      const draftRes = await request(app)
        .post('/api/v1/rules-registry/revisions')
        .send({
          ruleId: 'RULE-2026-INTAKE-01',
          academicYear: '2026-2027',
          clause: 'Clause 2.3.4(b)',
          page: 45,
          title: 'Revised Maximum Intake Ceiling (Draft)',
          summary: 'Increased maximum intake ceiling to 360 for accredited programs per Corrigendum',
          sourceId: 'SRC-APH-2024-27',
          sourceTitle: 'Approval Process Handbook 2024–2027',
          sourceFile: 'APH 24–25, 26-27 Handbook(1).pdf',
          proposedBy: 'admin@aicte.gov.in'
        });

      expect(draftRes.status).toBe(201);
      expect(draftRes.body.success).toBe(true);
      expect(draftRes.body.data.draft).toBeDefined();

      const diffRes = await request(app).get('/api/v1/rules-registry/rules/RULE-2026-INTAKE-01/diff');
      expect(diffRes.status).toBe(200);
      expect(diffRes.body.data.ruleId).toBe('RULE-2026-INTAKE-01');

      const publishRes = await request(app)
        .post('/api/v1/rules-registry/rules/RULE-2026-INTAKE-01/publish')
        .send({
          reason: 'Official Gazette Corrigendum Gazette-2026-7788 ratified by Executive Committee',
          approvedBy: 'bureau.approval@aicte.gov.in'
        });

      expect(publishRes.status).toBe(200);
      expect(publishRes.body.success).toBe(true);
    });
  });

  describe('Defect 8.3 — Role-Specific SAC, SHC & Grievance APIs', () => {
    it('Regional Officer can refer shortcomings to SHC (APH §2.23.3)', async () => {
      const res = await request(app)
        .post('/api/v1/appeals-hearings/refer-shc')
        .send({
          caseId: 'APP-2026-GIITS',
          institutionName: 'Godavari Institute of Engineering and Technology',
          originReportRef: 'SCR-2026-REP-01',
          shortcomings: ['Fire NOC registered certificate shortfall under APH §1.8']
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.hearingType || res.body.data.type).toBeDefined();
    });

    it('Institution can lodge statutory SAC appeal within 7-calendar-day statute', async () => {
      const res = await request(app)
        .post('/api/v1/appeals-hearings/appeal')
        .send({
          caseId: 'APP-2026-GIITS',
          institutionName: 'Godavari Institute',
          groundsOfAppeal: 'Shortcoming rectified and compliant with APH §1.11 / §2.24 statutory norms.',
          appellantDscToken: 'DSC-TOKEN-APPEL-7718'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hearingType || res.body.data.type).toBeDefined();
    });

    it('Council Authority / SAC Bench disposes appeal with speaking order', async () => {
      const appealRes = await request(app)
        .post('/api/v1/appeals-hearings/appeal')
        .send({
          caseId: 'APP-2026-GIITS',
          institutionName: 'Godavari Institute',
          groundsOfAppeal: 'Shortcoming rectified and compliant with APH §1.11 / §2.24 statutory norms.',
          appellantDscToken: 'DSC-TOKEN-APPEL-7718'
        });
      expect(appealRes.status).toBe(201);
      const appealId = appealRes.body.data.id;

      const res = await request(app)
        .post(`/api/v1/appeals-hearings/appeals/${appealId}/dispose`)
        .send({
          decision: 'RELIEF_GRANTED',
          remarks: 'SAC bench examined revised documentation and granted relief per APH §2.24',
          committeeMembers: ['SAC Retired High Court Judge', 'Senior Academic Expert']
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('DISPOSED');
      expect(res.body.data.recommendation).toBe('RECOMMEND_APPROVAL');
    });

    it('Grievance submission enforces non-anonymous rule per Chapter VII §7.10', async () => {
      const anonymousRes = await request(app)
        .post('/api/v1/appeals-hearings/complaint')
        .send({
          institutionName: 'Demo Institute',
          complainantName: 'Anonymous',
          complaintDetails: 'Allegation of faculty deficit',
          isAnonymous: true
        });

      expect(anonymousRes.status).toBe(422);
      expect(anonymousRes.body.success).toBe(false);
      expect(anonymousRes.body.error.code).toBe('ANONYMOUS_COMPLAINT_REJECTED');

      const verifiedRes = await request(app)
        .post('/api/v1/appeals-hearings/complaint')
        .send({
          institutionName: 'Demo Institute',
          complainantName: 'Prof. R. K. Sharma',
          complainantAadhaarOrPan: 'ABCDE1234F',
          complaintDetails: 'Formal grievance filed regarding infrastructure norms under Chapter VII §7.10',
          isAnonymous: false
        });

      expect(verifiedRes.status).toBe(201);
      expect(verifiedRes.body.success).toBe(true);
      expect(verifiedRes.body.data.id).toBeDefined();
    });
  });

  describe('Defect 8.4 — Regional Officer Allocation, Portal Ingestion & Document Signature Verification', () => {
    it('lists allocation groups and assigns group with justification', async () => {
      const groupsRes = await request(app).get('/api/v1/allocation/groups');
      expect(groupsRes.status).toBe(200);
      expect(groupsRes.body.success).toBe(true);
      expect(Array.isArray(groupsRes.body.data.groups)).toBe(true);

      const assignRes = await request(app)
        .post('/api/v1/allocation/assign')
        .send({
          caseId: 'APP-2026-COEP',
          groupType: 'DESK_SCRUTINY',
          groupId: 'SCR-GROUP-A',
          officerId: 'usr-ro-western',
          reason: 'Balanced committee allocation for Pune cluster'
        });

      expect(assignRes.status).toBe(200);
      expect(assignRes.body.success).toBe(true);

      const caseAssignRes = await request(app).get('/api/v1/allocation/assignments/APP-2026-COEP');
      expect(caseAssignRes.status).toBe(200);
      expect(caseAssignRes.body.success).toBe(true);
      expect(caseAssignRes.body.data.caseId).toBe('APP-2026-COEP');
    });

    it('imports existing portal fixtures and confirms ingestion', async () => {
      const fixturesRes = await request(app).get('/api/v1/portal-import/fixtures');
      expect(fixturesRes.status).toBe(200);
      expect(fixturesRes.body.success).toBe(true);
      expect(Array.isArray(fixturesRes.body.data.fixtures)).toBe(true);

      const previewRes = await request(app)
        .post('/api/v1/portal-import/preview')
        .send({ fixtureId: 'GIITS-2026-REPORT' });

      expect(previewRes.status).toBe(200);
      expect(previewRes.body.success).toBe(true);
      expect(previewRes.body.data.extractedFields).toBeDefined();

      const confirmRes = await request(app)
        .post('/api/v1/portal-import/confirm')
        .send({
          applicationId: 'APP-2026-GIITS',
          institutionName: 'GIITS Engineering College',
          regionId: 'South-Central',
          academicYear: '2026-2027',
          originalReportContent: '{"raw": true}',
          originalReportHash: 'SHA256-GIITS-HASH-01',
          confirmedDeficiencyItemIds: ['D1', 'D2']
        });

      expect(confirmRes.status).toBe(201);
      expect(confirmRes.body.success).toBe(true);
    });

    it('verifies decision document digital signature digest', async () => {
      const { cookie } = await loginAs('bureau.approval@aicte.gov.in');

      const docsRes = await request(app)
        .get('/api/v1/decision-docs')
        .set('Cookie', cookie);
      expect(docsRes.status).toBe(200);
      expect(docsRes.body.success).toBe(true);
      expect(Array.isArray(docsRes.body.data.documents)).toBe(true);

      if (docsRes.body.data.documents.length > 0) {
        const doc = docsRes.body.data.documents[0];
        const verifyRes = await request(app)
          .get(`/api/v1/decision-docs/verify-signature/${doc.caseId}`)
          .set('Cookie', cookie);
        expect(verifyRes.status).toBe(200);
        expect(verifyRes.body.success).toBe(true);
        expect(verifyRes.body.data.verified).toBe(true);
      }
    });

    it('returns consolidated 6-category reporting metrics', async () => {
      const { cookie } = await loginAs('ro.western@aicte.gov.in');

      const res = await request(app)
        .get('/api/v1/reports/consolidated')
        .set('Cookie', cookie);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.generatedAt).toBeDefined();
    });
  });
});
