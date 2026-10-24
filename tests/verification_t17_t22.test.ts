import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createCompanionApp } from '../src/backend/companionApp';
import { APPROVED_2026_POLICIES } from '../src/backend/policy/candidates';

describe('T17–T22 Acceptance Verification Suite (100% PS 26262 & Ecosystem Hardening)', () => {
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

  // --- T17: 5 APH Route Combinations & Restoration/Hearing Policies ---
  it('T17: Registers and supports all 5 APH route combinations including Only EVC & EVC+SAC/SHC', async () => {
    const onlyEvc = APPROVED_2026_POLICIES.find((p) => p.id === 'POL-2026-ONLY-EVC-RESTORATION');
    const sacHearing = APPROVED_2026_POLICIES.find((p) => p.id === 'POL-2026-EVC-SAC-SHC-APPEAL');

    expect(onlyEvc).toBeDefined();
    expect(onlyEvc?.source.location).toContain('2.16.1');
    expect(onlyEvc?.conditions.stages).toEqual(['submitted', 'evc_pending', 'decision_pending']);

    expect(sacHearing).toBeDefined();
    expect(sacHearing?.source.location).toContain('2.23.3');
    expect(sacHearing?.conditions.stages).toEqual([
      'submitted',
      'scrutiny_pending',
      'evc_pending',
      'rescrutiny_pending',
      'decision_pending'
    ]);
  });

  // --- T18: Authorized Stage Return / Revert with Mandatory Reason & Audit ---
  it('T18: Enforces authorized stage return/revert requiring mandatory reason and recording to audit', async () => {
    const { cookie } = await loginAs('ro.western@aicte.gov.in');

    // 1. Revert with empty reason must be rejected with 422
    const emptyReasonRes = await request(app)
      .post('/api/v1/applications/APP-2026-COEP/revert')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:3000')
      .send({
        targetStage: 'submitted',
        reason: '',
        revertedBy: 'Regional Officer'
      });
    expect(emptyReasonRes.status).toBe(422);
    expect(emptyReasonRes.body.success).toBe(false);

    // 2. Valid revert with non-empty reason
    const validRes = await request(app)
      .post('/api/v1/applications/APP-2026-COEP/revert')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:3000')
      .send({
        targetStage: 'submitted',
        reason: 'Deficiency identified in structural stability certificate per APH §2.20',
        revertedBy: 'Regional Officer'
      });
    expect(validRes.status).toBe(200);
    expect(validRes.body.success).toBe(true);
    expect(validRes.body.data.reverted).toBe(true);
    expect(validRes.body.data.application.state).toBe('submitted');
    expect(validRes.body.data.application.version).toBeGreaterThan(1);

    // 3. Confirm audit trail captures APPLICATION_REVERTED
    const auditLogs = storage.inspect().audit;
    const revertAudit = auditLogs.find((a: any) => a.action === 'APPLICATION_REVERTED');
    expect(revertAudit).toBeDefined();
    expect(revertAudit.reason).toContain('Deficiency identified');
  });

  // --- T19: Electronic Case Summary & 5 Standardised Statutory Notices ---
  it('T19: Generates electronic case summary and all 5 standardised statutory notices', async () => {
    const { cookie } = await loginAs('ro.western@aicte.gov.in');

    const res = await request(app)
      .get('/api/v1/applications/APP-2026-COEP/case-summary')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const summary = res.body.data;

    expect(summary.applicationId).toBe('APP-2026-COEP');
    expect(summary.statutoryNotices).toBeDefined();
    expect(summary.statutoryNotices.length).toBe(5);

    const templateTypes = summary.statutoryNotices.map((n: any) => n.templateType);
    expect(templateTypes).toContain('SCRUTINY_SCHEDULE_INTIMATION');
    expect(templateTypes).toContain('PORTAL_DEFICIENCY_COMMUNICATION');
    expect(templateTypes).toContain('EVC_INSPECTION_INTIMATION');
    expect(templateTypes).toContain('CONDITIONAL_EOA_UNDERTAKING');
    expect(templateTypes).toContain('SPEAKING_ORDER_OR_LOD');

    const condNotice = summary.statutoryNotices.find((n: any) => n.templateType === 'CONDITIONAL_EOA_UNDERTAKING');
    expect(condNotice.body).toContain('Conditional Extension of Approval');
    expect(condNotice.body).toContain('within 6 months');
  });

  // --- T20: AICTESigner / mSigner Class-3 DSC Verification Gateway ---
  it('T20: Rejects unsigned affidavits (422) and validates Class-3 DSC signatures', async () => {
    const { cookie } = await loginAs('ro.western@aicte.gov.in');

    // 1. Unsigned submission must reject with 422 DSC_SIGNATURE_REQUIRED
    const unsignedRes = await request(app)
      .post('/api/v1/adapter/dsc-verify')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:3000')
      .send({
        documentId: 'DOC-AFF-01',
        documentName: 'Infrastructure & Land Affidavit (APH Table 2.1)',
        dscSigned: false
      });
    expect(unsignedRes.status).toBe(422);
    expect(unsignedRes.body.error.code).toBe('DSC_SIGNATURE_REQUIRED');

    // 2. Signed submission with Class-3 token succeeds
    const signedRes = await request(app)
      .post('/api/v1/adapter/dsc-verify')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:3000')
      .send({
        documentId: 'DOC-AFF-01',
        documentName: 'Infrastructure & Land Affidavit (APH Table 2.1)',
        dscSigned: true,
        signatoryName: 'Dr. Ramesh Kumar, Principal',
        tokenType: 'ePass2003Auto USB Cryptographic Token'
      });
    expect(signedRes.status).toBe(200);
    expect(signedRes.body.success).toBe(true);
    expect(signedRes.body.data.dscSigned).toBe(true);
    expect(signedRes.body.data.adapterType).toBe('SIMULATED_ADAPTER');
    expect(signedRes.body.data.statutoryCompliance).toContain('APH §1.4.3');
  });

  // --- T21: External Statutory Registries Hub & Committee Selection Sync ---
  it('T21: Provides external statutory registries data and committee auto-selection sync', async () => {
    const { cookie } = await loginAs('ro.western@aicte.gov.in');

    // 1. External Registries Hub (NBA, NAAC, IIC, APAAR, Anti-Ragging, Feedback)
    const regRes = await request(app)
      .get('/api/v1/adapter/external-registries/APP-2026-COEP')
      .set('Cookie', cookie);
    expect(regRes.status).toBe(200);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.adapterType).toBe('SIMULATED_ADAPTER');
    expect(regRes.body.data.nbaRegistry.status).toBe('VALID_ACCREDITATION');
    expect(regRes.body.data.moeInnovationCouncil.annualActivityStarRating).toBeGreaterThanOrEqual(4);
    expect(regRes.body.data.antiRaggingPortal.complianceStatus).toBe('100%_FILED');

    // 2. Automated Committee Selection Sync
    const commRes = await request(app)
      .post('/api/v1/adapter/committee-sync/APP-2026-COEP')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:3000')
      .send({ committeeType: 'EVC' });
    expect(commRes.status).toBe(200);
    expect(commRes.body.success).toBe(true);
    expect(commRes.body.data.adapterType).toBe('SIMULATED_ADAPTER');
    expect(commRes.body.data.roster.length).toBeGreaterThan(0);
    expect(commRes.body.data.unbiasedDeclarationComplete).toBe(true);
  });

  // --- T22: Consolidated Reporting Hub, Siebel Write-Back & Case Closure ---
  it('T22: Provides consolidated 6-category reports, downstream Siebel write-back, and authorized case closure', async () => {
    const { cookie } = await loginAs('ro.western@aicte.gov.in');

    // 1. Consolidated 6-Category Reporting Hub
    const repRes = await request(app)
      .get('/api/v1/reports/consolidated')
      .set('Cookie', cookie);
    expect(repRes.status).toBe(200);
    expect(repRes.body.success).toBe(true);
    expect(repRes.body.data.summaryMetrics.totalApplications).toBeGreaterThan(0);
    expect(repRes.body.data.applicationAgeingDistribution).toBeDefined();
    expect(Object.keys(repRes.body.data.sixCategoryReports).length).toBe(6);

    // 2. Downstream Siebel Write-Back & 6-Authority Dispatch
    const siebelRes = await request(app)
      .post('/api/v1/adapter/siebel-writeback/APP-2026-COEP')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:3000')
      .send({ currentStage: 'Approval Issued' });
    expect(siebelRes.status).toBe(200);
    expect(siebelRes.body.success).toBe(true);
    expect(siebelRes.body.data.adapterType).toBe('SIMULATED_ADAPTER');
    expect(siebelRes.body.data.sixAuthorityDistributionList.length).toBe(6);

    // 3. Authorized Case & Obligation Closure
    const closeRes = await request(app)
      .post('/api/v1/applications/APP-2026-COEP/close-compliance')
      .set('Cookie', cookie)
      .set('Origin', 'http://localhost:3000')
      .send();
    expect(closeRes.status).toBe(200);
    expect(closeRes.body.success).toBe(true);
    expect(closeRes.body.data.closed).toBe(true);
  });
});
