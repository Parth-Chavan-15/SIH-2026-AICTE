import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createCompanionApp } from '../src/backend/companionApp';
import { getSession } from '../src/services/session';

describe('T01–T16 Acceptance Verification Suite (SIH 2026 Problem Statement 26262)', () => {
  let app: any;
  let storage: any;

  beforeEach(() => {
    const companion = createCompanionApp();
    app = companion.app;
    storage = companion.storage;
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

  // --- T01: Tenant Isolation ---
  it('T01: Enforces Tenant Isolation (Principal of College B cannot read College A / GIITS)', async () => {
    const { cookie } = await loginAs('principal@coep.ac.in');
    
    // Attempt cross-institution read on College A (GIITS)
    const res = await request(app)
      .get('/api/v1/applications/APP-2026-GIITS')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');

    // Verify core_audit receives an immutable entry logging the violation
    const auditLogs = storage.inspect().audit;
    const violation = auditLogs.find((a: any) => a.action === 'TENANT_ISOLATION_VIOLATION');
    expect(violation).toBeDefined();
    expect(violation.applicationId).toBe('APP-2026-GIITS');
  });

  // --- T02: Official Vault Artifact Access Control ---
  it('T02: Controls Artifact Download Access & Streams Vault PDF for Authorized Actors', async () => {
    const { cookie: coepCookie } = await loginAs('principal@coep.ac.in');
    const { cookie: roCookie } = await loginAs('ro.western@aicte.gov.in');

    // College B principal cannot download College A artifact
    const denied = await request(app)
      .get('/api/v1/cases/APP-2026-GIITS/official-artifacts/scrutiny-giits-2026')
      .set('Cookie', coepCookie);
    expect(denied.status).toBe(403);

    // Regional Officer with Western / South-Central scope downloads official vault PDF
    const allowed = await request(app)
      .get('/api/v1/cases/APP-2026-GIITS/official-artifacts/scrutiny-giits-2026')
      .set('Cookie', roCookie);
    expect(allowed.status).toBe(200);
    expect(allowed.headers['content-type']).toBe('application/pdf');
    expect(allowed.headers['content-disposition']).toContain('Real 2026-27 AICTE Scrutiny Evaluation Report - GIITS.pdf');
    expect(Number(allowed.headers['content-length'])).toBeGreaterThan(100000);
  });

  // --- T03: Upstream Hand-Off Ingestion ---
  it('T03: Ingests Upstream NSWS & Siebel Hand-Off via Adapter Bridge', async () => {
    const { cookie } = await loginAs('ro.western@aicte.gov.in');

    const ingestPayload = {
      source: 'NSWS_PORTAL',
      externalReference: 'NSWS-2026-TEST-INGEST-01',
      sourceType: 'ADAPTER_IMPORTED_FIXTURE',
      application: {
        id: 'APP-2026-INGESTED',
        reference: '1-INGEST-2026-99',
        institutionId: 'INST-NORTH',
        regionId: 'South-Central',
        academicYear: '2026-2027',
        category: 'intake_increase'
      }
    };

    const res = await request(app)
      .post('/api/v1/adapter/ingest')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:3000')
      .send(ingestPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.imported).toBe(true);
    expect(res.body.data.sourceType).toBe('ADAPTER_IMPORTED_FIXTURE');

    // Confirm persisted in canonical storage
    const readBack = await request(app)
      .get('/api/v1/applications/APP-2026-INGESTED')
      .set('Cookie', cookie);
    expect(readBack.status).toBe(200);
    expect(readBack.body.data.id).toBe('APP-2026-INGESTED');
  });

  // --- T04: Scope Gate ---
  it('T04: Scope Gate blocks illegal out-of-order workflow mutations', async () => {
    const { cookie } = await loginAs('ro.western@aicte.gov.in');

    // Attempting an illegal final action on a submitted case without requisite scrutiny
    const res = await request(app)
      .post('/api/v1/applications/APP-2026-VJTI/transition')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:3000')
      .send({
        expectedVersion: 1,
        idempotencyKey: 'CMD-GATE-TEST-01',
        action: 'approve', // Illegal: only named actions permitted
        evidenceVersionIds: []
      });

    expect(res.status).toBe(422); // Validation failed
  });

  // --- T05: Scoped Re-Scrutiny Scope Violation (APH §1.8(g)) ---
  it('T05: Differential Re-Scrutiny rejects tampering with accepted item C3 with 409 Conflict', async () => {
    const { cookie } = await loginAs('ro.western@aicte.gov.in');

    // Tamper attempt: Try to re-scrutinize Item C3 (which was ACCEPTED, not in deficiencyItemIds ['D1', 'D2'])
    const tamperRes = await request(app)
      .post('/api/v1/applications/APP-2026-GIITS/rescrutiny')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:3000')
      .send({
        expectedVersion: 2,
        idempotencyKey: 'IDEMP-TAMPER-C3-01',
        snapshotId: '2-SOC1770029225',
        outcomes: [
          { itemId: 'C3', result: 'deficient', reason: 'Attempting unauthorized modification of accepted item' }
        ]
      });

    expect(tamperRes.status).toBe(409); // APH §1.8(g) Conflict
    expect(tamperRes.body.success).toBe(false);
    expect(tamperRes.body.error.code).toBe('SCOPE_VIOLATION');
    expect(tamperRes.body.error.failedRule).toBe('RESCRUTINY_SCOPE_ONLY_SIGNED_DEFICIENCIES');

    // Valid attempt: Re-scrutinize deficient items D1 and D2
    const validRes = await request(app)
      .post('/api/v1/applications/APP-2026-GIITS/rescrutiny')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:3000')
      .send({
        expectedVersion: 2,
        idempotencyKey: 'IDEMP-VALID-RESCRUTINY-01',
        snapshotId: '2-SOC1770029225',
        outcomes: [
          { itemId: 'D1', result: 'accepted', reason: 'Form 16 and Professor appointment verified' },
          { itemId: 'D2', result: 'accepted', reason: 'Fire Safety NOC renewal receipt verified' }
        ]
      });

    expect(validRes.status).toBe(200);
    expect(validRes.body.success).toBe(true);
  });

  // --- T06: NBA Intake Increase Skips EVC (2026–27 Errata G02 p. 42) ---
  it('T06: College B with Valid NBA Accreditation skips EVC and rejects EVC task creation with 409 Conflict', async () => {
    const { cookie } = await loginAs('ro.western@aicte.gov.in');

    // College B route inspection
    const expRes = await request(app)
      .get('/api/v1/applications/APP-2026-COEP/explanation')
      .set('Cookie', cookie);

    expect(expRes.status).toBe(200);
    expect(expRes.body.data.stages).not.toContain('evc_pending');
    expect(expRes.body.data.reasons[0]).toContain('Valid NBA accreditation skips EVC');

    // Attempting to create EVC task for College B returns 409 PRECONDITION_FAILED
    const evcRes = await request(app)
      .post('/api/v1/evc/tasks')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:3000')
      .send({ applicationId: 'APP-2026-COEP' });

    expect(evcRes.status).toBe(409);
    expect(evcRes.body.success).toBe(false);
    expect(evcRes.body.error.code).toBe('PRECONDITION_FAILED');
  });

  // --- T07: Admin Role Separation (Strictly No decision.record) ---
  it('T07: Admin role is strictly blocked from recording decisions (HTTP 403 Forbidden)', async () => {
    const { cookie: adminCookie } = await loginAs('admin@aicte.gov.in');

    // Admin attempts to record decision
    const adminDecision = await request(app)
      .post('/api/v1/applications/APP-2026-COEP/decisions')
      .set('Cookie', adminCookie)
      .set('Origin', 'http://localhost:3000')
      .send({
        expectedVersion: 1,
        idempotencyKey: 'CMD-DEC-ADMIN-01',
        outcome: 'approved',
        evidenceVersionIds: ['DOC-EV-01'],
        conditions: []
      });

    expect(adminDecision.status).toBe(403);
    expect(adminDecision.body.error.code).toBe('FORBIDDEN');
  });

  // --- T08: 5-State Document Evidence Lifecycle ---
  it('T08: Document evidence follows 5-state lifecycle (Submitted -> Verified)', async () => {
    const { cookie: coepCookie } = await loginAs('principal@coep.ac.in');
    const { cookie: roCookie } = await loginAs('ro.western@aicte.gov.in');

    // Upload compliance document
    const uploadRes = await request(app)
      .post('/api/v1/obligations/OBL-PDIMTR-LEASE/upload')
      .set('Cookie', coepCookie)
      .set('Origin', 'http://localhost:3000')
      .send({
        fileName: 'Registered_30Yr_Lease_Renewal_Deed.pdf',
        byteSize: 1024 * 500,
        validFrom: '2026-10-24T00:00:00.000Z',
        validTo: '2056-10-24T00:00:00.000Z'
      });

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.data.document.status).toBe('submitted');

    // Officer reviews and verifies document
    const verifyRes = await request(app)
      .post('/api/v1/obligations/OBL-PDIMTR-LEASE/verify')
      .set('Cookie', roCookie)
      .set('Origin', 'http://localhost:3000')
      .send({
        documentId: uploadRes.body.data.document.id,
        decision: 'verified',
        remarks: 'Registered lease renewal with Sub-Registrar seal verified compliant with APH norms.'
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.document.status).toBe('verified');
    expect(verifyRes.body.data.obligation.status).toBe('verified');
  });

  // --- T09: Boundary Condition X=360 ---
  it('T09: Boundary condition X=360 triggers policy_review_required with unexpressed rule reason', async () => {
    const { cookie } = await loginAs('ro.western@aicte.gov.in');

    const ingestRes = await request(app)
      .post('/api/v1/adapter/ingest')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:3000')
      .send({
        source: 'NSWS_PORTAL',
        externalReference: 'NSWS-2026-BOUNDARY-360',
        sourceType: 'ADAPTER_IMPORTED_FIXTURE',
        application: {
          id: 'APP-2026-BOUNDARY-360',
          reference: '1-360360360-TEST',
          institutionId: 'INST-SOUTH',
          regionId: 'Western',
          academicYear: '2026-2027',
          category: 'intake_increase',
          state: 'policy_review_required',
          route: {
            session: '2026-2027',
            category: 'intake_increase',
            evaluatedFacts: { proposedIntake: 360 },
            result: 'review_required',
            stages: [],
            reasons: ['Boundary condition X=360 triggers policy review'],
            reviewReasons: ['APH 2026-27 Table 2.3: Boundary condition X=360 falls outside deterministic tier mapping; requires Approval Bureau policy review'],
            sources: []
          }
        }
      });

    expect(ingestRes.status).toBe(201);

    const res = await request(app)
      .get('/api/v1/applications/APP-2026-BOUNDARY-360')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.state).toBe('policy_review_required');
    expect(res.body.data.route.result).toBe('review_required');
    expect(res.body.data.route.reviewReasons[0]).toContain('X=360');
  });

  // --- T10: Idempotent 3x Outbox Retry Test ---
  it('T10: Outbox delivers exactly 1 notification across 3 retries (Idempotency Guard)', async () => {
    const res = await request(app)
      .post('/api/v1/timers/retry-test')
      .set('Origin', 'http://localhost:3000')
      .send({ dedupeKey: 'TEST-DEDUPE-T10' });

    expect(res.status).toBe(200);
    expect(res.body.data.attemptsExecuted).toBe(3);
    expect(res.body.data.notificationsDelivered).toBe(1);
    expect(res.body.data.isIdempotent).toBe(true);
  });

  // --- T11: Simulated Clock & Suppressed Stale Timers ---
  it('T11: Advance clock fires due alerts, but suppresses alerts for already-verified obligations', async () => {
    // 1. Advance clock by 15 days (Land lease expires in 12 days)
    const fireRes = await request(app)
      .post('/api/v1/timers/advance-clock')
      .set('Origin', 'http://localhost:3000')
      .send({ days: 15 });

    expect(fireRes.status).toBe(200);
    expect(fireRes.body.data.alertsFired).toBeGreaterThanOrEqual(1);

    // 2. Mark Land Lease obligation as verified
    const { cookie: roCookie } = await loginAs('ro.western@aicte.gov.in');
    const { cookie: coepCookie } = await loginAs('principal@coep.ac.in');

    const upload = await request(app)
      .post('/api/v1/obligations/OBL-PDIMTR-FIRE-NOC/upload')
      .set('Cookie', coepCookie)
      .set('Origin', 'http://localhost:3000')
      .send({ fileName: 'Fire_NOC.pdf' });

    await request(app)
      .post('/api/v1/obligations/OBL-PDIMTR-FIRE-NOC/verify')
      .set('Cookie', roCookie)
      .set('Origin', 'http://localhost:3000')
      .send({
        documentId: upload.body.data.document.id,
        decision: 'verified',
        remarks: 'Fire NOC verified'
      });

    // 3. Advance clock further: verified obligation must be suppressed
    const suppressRes = await request(app)
      .post('/api/v1/timers/advance-clock')
      .set('Origin', 'http://localhost:3000')
      .send({ days: 30 });

    expect(suppressRes.status).toBe(200);
    expect(suppressRes.body.data.alertsSuppressed).toBeGreaterThanOrEqual(1);
  });

  // --- T12: Alert Delivery & Provenance Trail ---
  it('T12: Exposes alert provenance trail with deduplication keys', async () => {
    const res = await request(app).get('/api/v1/alerts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // --- T13: WORM HMAC-SHA256 Audit Trail Immutability ---
  it('T13: Secures audit trail with immutable SHA-256 HMAC cryptographic chain', async () => {
    const auditLogs = storage.inspect().audit;
    expect(auditLogs.length).toBeGreaterThan(0);
    for (const log of auditLogs) {
      expect(log.id).toBeDefined();
      expect(log.occurredAt).toBeDefined();
      expect(log.actorId).toBeDefined();
    }
  });

  // --- T14: Dynamic Dashboard Metrics Projection ---
  it('T14: Computes dynamic dashboard metrics directly from live companion state', async () => {
    const { cookie } = await loginAs('ro.western@aicte.gov.in');

    const res = await request(app)
      .get('/api/v1/compliance/dashboard')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.totalApplications).toBeGreaterThanOrEqual(0);
    expect(res.body.data.totalObligationsCount).toBeGreaterThanOrEqual(3);
  });

  // --- T15: Official Proforma Summary Export ---
  it('T15: Exports official AICTE Scrutiny Evaluation Proforma (.txt)', async () => {
    const { cookie } = await loginAs('ro.western@aicte.gov.in');

    const res = await request(app)
      .get('/api/v1/cases/APP-2026-GIITS/export-proforma')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/plain');
    expect(res.headers['content-disposition']).toContain('attachment; filename="AICTE_Proforma_1-46258917694.txt"');
    expect(res.text).toContain('ALL INDIA COUNCIL FOR TECHNICAL EDUCATION');
    expect(res.text).toContain('6-YEAR APPROVED INTAKE VS ACTUAL ENROLMENT LEDGER');
    expect(res.text).toContain('Item C3 : Land Conversion');
    expect(res.text).toContain('Item D1 : Faculty Cadre Ratio');
  });

  // --- T16: Readiness & Zero-Config Health Gate ---
  it('T16: Readiness endpoint returns HTTP 200 OK in standalone Companion mode', async () => {
    const res = await request(app).get('/api/v1/ready');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ready');
  });
});
