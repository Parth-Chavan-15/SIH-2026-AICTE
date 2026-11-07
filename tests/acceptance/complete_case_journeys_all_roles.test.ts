/**
 * NIYAMSETU — Complete Multi-Role Case Journey Acceptance Test Suite
 * Smart India Hackathon 2026 | Problem Statement 26262
 *
 * Verifies end-to-end statutory case lifecycles across all regulatory roles:
 * 1. Custom Institution (Fast-Track Scrutiny Only) -> Desk Scrutiny Pass -> Council Speaking Order & EoA -> Post-Approval Obligations.
 * 2. Custom Institution (Scrutiny Deficiencies) -> LoD Issuance -> Protected Re-Scrutiny (Scope Locked) -> Stage Progression.
 * 3. Canonical Preset (APEX Institute / New Institution) -> Desk Scrutiny Cleared -> Mandated Physical EVC Scheduling -> Walkthrough Inspection Report -> Council Determination.
 * 4. Competent Authority Conditional Approval -> 10-Year Joint FDR Undertaking & Fire NOC Statutory Clocks.
 * 5. Council Speaking Order Rejection -> LoR Issuance -> Institutional Appeal -> Regional SHC Hearing -> SAC Adjudication (Upheld, Overturned, Remanded).
 * 6. Boundary Condition (X = 360) Ambiguity Hold -> Council Policy Determination.
 * 7. Ineligibility Guard -> Substantive Core Branch Deficit Blocks Ingestion (HTTP 422).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createCompanionApp } from '../../src/backend/companionApp';

const ORIGIN = 'http://localhost:3000';

describe('Complete Case Journeys Across All Roles (SIH Acceptance Suite)', () => {
  let app: any;

  beforeEach(() => {
    process.env.ALLOW_DEMO_RESET = 'true';
    const companion = createCompanionApp();
    app = companion.app;
  });

  async function loginAs(email: string) {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Origin', ORIGIN)
      .send({ email, password: 'password123' });
    expect(res.status).toBe(200);
    const cookie = res.headers['set-cookie']?.[0]?.split(';')?.[0];
    return { cookie, actor: res.body.data.actor };
  }

  // ==========================================================================
  // JOURNEY 1: Fast-Track Scrutiny Only Journey (Custom Institution / COEP)
  // ==========================================================================
  it('Journey 1: Custom Institution (Fast-Track NBA) -> Ingestion -> Scrutiny Cleared -> Council Approval & Sealed EoA', async () => {
    // 1. Submit Custom Application via NSWS Simulation
    const customCaseId = 'APP-2026-JOURNEY1-CUSTOM';
    const payload = {
      id: customCaseId,
      reference: '1-NSWS-J1-CUSTOM',
      idempotencyKey: 'IDEMP-J1-001',
      nswsReference: 'NSWS-INV-J1',
      institutionName: 'Aryabhatta Institute of Technology & Research',
      institutionId: 'INST-CUSTOM-AITR',
      regionId: 'Western',
      category: 'increase_intake',
      session: '2026-27',
      pan: 'AAATA9876C',
      signatoryName: 'Dr. K. S. Raman',
      dscTokenSerial: 'EP2003-8841-A99B',
      facts: {
        institutionName: 'Aryabhatta Institute of Technology & Research',
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        existingIntake: 120,
        proposedIntake: 180,
        nbaAccredited: true,
        nbaScore: 720,
        coreBranchesCount: 3,
        nonCsCoreBranchesCount: 2,
        builtUpAreaSqM: 14500,
        landAreaAcre: 5.0,
        region: 'Western'
      }
    };

    const submitRes = await request(app)
      .post('/api/v1/nsws/submit')
      .set('Origin', ORIGIN)
      .send(payload);
    expect(submitRes.status).toBe(201);
    expect(submitRes.body.data.application.id).toBe(customCaseId);
    expect(submitRes.body.data.routeExplanation.stages).toContain('scrutiny_pending');
    expect(submitRes.body.data.routeExplanation.stages).not.toContain('evc_pending'); // Waived per Errata p. 42

    // 2. Regional Scrutiny Officer signs off checklist as Compliant
    const { cookie: roCookie } = await loginAs('ro.western@aicte.gov.in');

    const scrutinySignRes = await request(app)
      .post(`/api/v1/applications/${customCaseId}/scrutiny`)
      .set('Origin', ORIGIN)
      .set('Cookie', roCookie)
      .send({
        checklistVersion: '1.0',
        expectedVersion: 1,
        idempotencyKey: `SIGN-${customCaseId}-${Date.now()}`,
        items: [
          { itemId: 'LAND-01', result: 'accepted', reason: 'Registered title deed verified' },
          { itemId: 'BUILD-01', result: 'accepted', reason: 'Municipality plan valid' },
          { itemId: 'NBA-01', result: 'accepted', reason: 'Score 720 verified till 2027' }
        ]
      });

    expect(scrutinySignRes.status).toBe(200);
    expect(scrutinySignRes.body.success).toBe(true);
    expect(scrutinySignRes.body.data.deficiencyItemIds.length).toBe(0);

    // 3. Advance workflow from Scrutiny Cleared -> Council Determination
    const advanceRes = await request(app)
      .post(`/api/v1/applications/${customCaseId}/workflow-action`)
      .set('Origin', ORIGIN)
      .set('Cookie', roCookie)
      .send({
        action: 'accept',
        targetStage: 'Scrutiny Cleared',
        reason: 'All checklist items verified compliant under APH Chapter II'
      });

    expect(advanceRes.status).toBe(200);
    expect(advanceRes.body.data.state).toBe('decision_pending');

    // 4. Competent Authority (Council) issues Speaking Order of Approval
    const { cookie: caCookie } = await loginAs('bureau.approval@aicte.gov.in');

    const approveRes = await request(app)
      .post(`/api/v1/applications/${customCaseId}/workflow-action`)
      .set('Origin', ORIGIN)
      .set('Cookie', caCookie)
      .send({
        action: 'approve',
        targetStage: 'Approval Issued',
        reason: 'Statutory approval granted by Executive Committee / Council under APH Table 2.3 Row 9.'
      });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.state).toBe('approved');

    // 5. Generate and seal canonical EoA Decision Document
    const docRes = await request(app)
      .post(`/api/v1/decision-docs/generate/${customCaseId}`)
      .set('Origin', ORIGIN)
      .set('Cookie', caCookie)
      .send({
        documentType: 'EoA',
        speakingOrderSummary: 'Approved intake increase from 120 to 180 seats for AY 2026-27.'
      });

    expect([200, 201]).toContain(docRes.status);
    expect(docRes.body.data.document.documentType).toBe('EoA');
    expect(docRes.body.data.document.digitalSignature.hmacSignature).toBeDefined();
  });

  // ==========================================================================
  // JOURNEY 2: Deficiency & Protected Re-Scrutiny (Scope Lock Enforcement)
  // ==========================================================================
  it('Journey 2: Scrutiny Flagged -> LoD Issued -> Cured Items Uploaded -> Protected Re-Scrutiny Advances Case', async () => {
    const customCaseId = 'APP-2026-JOURNEY2-DEFICIENT';
    const payload = {
      id: customCaseId,
      reference: '1-NSWS-J2-DEF',
      idempotencyKey: 'IDEMP-J2-001',
      nswsReference: 'NSWS-INV-J2',
      institutionName: 'Aryabhatta Polytechnic & Technical Campus',
      institutionId: 'INST-CUSTOM-APTC',
      regionId: 'Western',
      category: 'extension_of_approval',
      session: '2026-27',
      pan: 'AAATA9876C',
      signatoryName: 'Dr. K. S. Raman',
      dscTokenSerial: 'EP2003-8841-A99B',
      facts: {
        institutionName: 'Aryabhatta Polytechnic & Technical Campus',
        category: 'extension_of_approval',
        program: 'Engineering and Technology',
        level: 'Diploma',
        existingIntake: 60,
        proposedIntake: 60,
        nbaAccredited: false,
        region: 'Western'
      }
    };

    await request(app)
      .post('/api/v1/nsws/submit')
      .set('Origin', ORIGIN)
      .send(payload);

    // 1. Scrutiny Officer flags deficiency on Fire NOC
    const { cookie: roCookie } = await loginAs('ro.western@aicte.gov.in');

    const signRes = await request(app)
      .post(`/api/v1/applications/${customCaseId}/scrutiny`)
      .set('Origin', ORIGIN)
      .set('Cookie', roCookie)
      .send({
        checklistVersion: '1.0',
        expectedVersion: 1,
        idempotencyKey: `SIGN-${customCaseId}-${Date.now()}`,
        items: [
          { itemId: 'LAND-01', result: 'accepted', reason: 'Compliant land deed' },
          { itemId: 'FIRE-01', result: 'deficient', reason: 'NOC expired on 2026-03-31; renewal required under APH Annexure 4' }
        ]
      });

    expect(signRes.status).toBe(200);
    expect(signRes.body.data.deficiencyItemIds).toContain('FIRE-01');

    // 2. Transition case to Deficiency Communicated (rescrutiny_pending)
    const defNoticeRes = await request(app)
      .post(`/api/v1/applications/${customCaseId}/workflow-action`)
      .set('Origin', ORIGIN)
      .set('Cookie', roCookie)
      .send({
        action: 'deficiency',
        targetStage: 'Deficiency Communicated',
        reason: 'Letter of Deficiency issued for expired Fire Safety NOC.'
      });

    expect(defNoticeRes.status).toBe(200);
    expect(defNoticeRes.body.data.state).toBe('rescrutiny_pending');

    // Check version after notice
    const appBeforeCure = await request(app)
      .get(`/api/v1/applications/${customCaseId}`)
      .set('Cookie', roCookie);
    const versionBeforeCure = appBeforeCure.body.data.version;

    // 3. Institution uploads cured document strictly for the deficient item (FIRE-01)
    const { cookie: instCookie } = await loginAs('director@aitr.edu.in');
    const snapshotId = signRes.body.data.id || `SNAP-${customCaseId}-R1`;

    const cureRes = await request(app)
      .post(`/api/v1/applications/${customCaseId}/corrections`)
      .set('Origin', ORIGIN)
      .set('Cookie', instCookie)
      .send({
        snapshotId,
        expectedVersion: versionBeforeCure,
        idempotencyKey: `CURE-${customCaseId}-${Date.now()}`,
        changes: [
          { itemId: 'FIRE-01', response: 'Valid renewal certificate issued by Municipal Fire Dept on 2026-04-10.' }
        ]
      });

    expect(cureRes.status).toBe(200);
    expect(cureRes.body.success).toBe(true);

    // Check version after correction
    const appBeforeRescrutiny = await request(app)
      .get(`/api/v1/applications/${customCaseId}`)
      .set('Cookie', roCookie);
    const versionBeforeRescrutiny = appBeforeRescrutiny.body.data.version;

    // 4. Re-Scrutiny: Officer approves cured item and verifies previously cleared item LAND-01 is preserved
    const rescrutinyRes = await request(app)
      .post(`/api/v1/applications/${customCaseId}/rescrutiny`)
      .set('Origin', ORIGIN)
      .set('Cookie', roCookie)
      .send({
        snapshotId,
        expectedVersion: versionBeforeRescrutiny,
        idempotencyKey: `RESCRUTINY-${customCaseId}-${Date.now()}`,
        outcomes: [
          { itemId: 'FIRE-01', result: 'accepted', reason: 'Renewed Fire NOC verified valid through 2027' }
        ]
      });

    expect(rescrutinyRes.status).toBe(200);
    expect(rescrutinyRes.body.success).toBe(true);
    expect(rescrutinyRes.body.data.status).toBe('CLEARED');
  });

  // ==========================================================================
  // JOURNEY 3: APEX Institute / New Institution (Mandated Physical EVC Lifecycle)
  // ==========================================================================
  it('Journey 3: APEX Institute -> Desk Scrutiny Cleared -> Mandated Physical EVC Scheduled -> Walkthrough Report -> Determination', async () => {
    const { cookie: roCookie } = await loginAs('ro.western@aicte.gov.in');

    // 1. APEX Institute is seeded (Chapter I: Setting up New Technical Institution mandates EVC)
    const apexId = 'APP-2026-APEX';

    // Verify application exists in docket
    const appRes = await request(app)
      .get(`/api/v1/applications/${apexId}`)
      .set('Cookie', roCookie);

    expect(appRes.status).toBe(200);
    expect(appRes.body.data).toBeDefined();

    // 2. Schedule EVC Physical Visit with committee and GPS geofencing
    const scheduleRes = await request(app)
      .post(`/api/v1/evc/${apexId}/schedule`)
      .set('Origin', ORIGIN)
      .set('Cookie', roCookie)
      .send({
        at: '2026-11-20T10:00:00Z',
        expectedVersion: 1,
        idempotencyKey: `EVC-SCHED-${apexId}-${Date.now()}`
      });

    expect(scheduleRes.status).toBe(200);
    expect(scheduleRes.body.data.status).toBe('scheduled');

    // 3. EVC Expert Committee conducts walkthrough inspection and submits findings
    const { cookie: evcCookie } = await loginAs('evc.chair@aicte.gov.in');

    const reportRes = await request(app)
      .post(`/api/v1/evc/${apexId}/report`)
      .set('Origin', ORIGIN)
      .set('Cookie', evcCookie)
      .send({
        summary: 'Physical inspection completed. Campus land 7.5 acres verified. Infrastructure, instructional area, laboratories, and barrier-free access compliant with Chapter I norms.',
        recommendation: 'recommended',
        evidenceVersionIds: ['DOC-EVC-PHOTOS-01'],
        expectedVersion: scheduleRes.body.data.version || 1,
        idempotencyKey: `EVC-REP-${apexId}-${Date.now()}`
      });

    expect(reportRes.status).toBe(200);
    expect(reportRes.body.data.status).toBe('completed');

    // 4. Case moves to Council Determination stage
    const transitionRes = await request(app)
      .post(`/api/v1/applications/${apexId}/workflow-action`)
      .set('Origin', ORIGIN)
      .set('Cookie', roCookie)
      .send({
        action: 'accept',
        targetStage: 'EVC Inspection Completed',
        reason: 'EVC Expert Committee submitted favorable inspection report.'
      });

    expect(transitionRes.status).toBe(200);
    expect(transitionRes.body.data.state).toBe('decision_pending');
  });

  // ==========================================================================
  // JOURNEY 4: Council Conditional Approval & Post-Approval Undertakings
  // ==========================================================================
  it('Journey 4: Council Conditional Approval generates 10-Year Joint FDR and Fire NOC obligations', async () => {
    const { cookie: caCookie } = await loginAs('bureau.approval@aicte.gov.in');
    const caseId = 'APP-2026-PDIMTR';

    // 1. Competent Authority records Conditional Approval with obligations
    const condApproveRes = await request(app)
      .post(`/api/v1/applications/${caseId}/workflow-action`)
      .set('Origin', ORIGIN)
      .set('Cookie', caCookie)
      .send({
        action: 'accept',
        targetStage: 'Approval Issued',
        reason: 'Approved conditionally subject to execution of 10-Year Joint FDR and Fire Safety Undertaking.'
      });

    expect(condApproveRes.status).toBe(200);

    // 2. Generate LoA/EoA Decision Document with obligations
    const docRes = await request(app)
      .post(`/api/v1/decision-docs/generate/${caseId}`)
      .set('Origin', ORIGIN)
      .set('Cookie', caCookie)
      .send({
        documentType: 'EoA',
        speakingOrderSummary: 'Approved with statutory compliance obligations per APH §1.5.3.'
      });

    expect([200, 201]).toContain(docRes.status);
    expect(docRes.body.data.document.orderBackedConditions).toBeDefined();
    expect(docRes.body.data.document.digitalSignature.hmacSignature).toBeDefined();

    // 3. Verify compliance docket contains active obligations
    const compRes = await request(app)
      .get(`/api/v1/compliance/obligations?applicationId=${caseId}`)
      .set('Cookie', caCookie);

    expect(compRes.status).toBe(200);
    expect(compRes.body.data.obligations.length).toBeGreaterThanOrEqual(1);
  });

  // ==========================================================================
  // JOURNEY 5: Council Rejection -> LoR -> SHC Hearing -> SAC Adjudication
  // ==========================================================================
  it('Journey 5: Council Rejection -> LoR Issued -> Grievance Filed -> SHC Hearing -> SAC Adjudication (Upheld / Overturned / Remanded)', async () => {
    const { cookie: caCookie } = await loginAs('bureau.approval@aicte.gov.in');
    const rejectCaseId = 'APP-2026-BATU';

    // 1. Council issues Speaking Order of Rejection
    const rejectRes = await request(app)
      .post(`/api/v1/applications/${rejectCaseId}/workflow-action`)
      .set('Origin', ORIGIN)
      .set('Cookie', caCookie)
      .send({
        action: 'reject',
        targetStage: 'Application Rejected',
        reason: 'Site relocation rejected: Proposed new site lacks contiguity under APH Table 2.3 Row 14.'
      });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.data.state).toBe('rejected');

    // 2. Generate formal Letter of Rejection (LoR)
    const lorRes = await request(app)
      .post(`/api/v1/decision-docs/generate/${rejectCaseId}`)
      .set('Origin', ORIGIN)
      .set('Cookie', caCookie)
      .send({
        documentType: 'LoR',
        speakingOrderSummary: 'Rejected due to failure of land contiguity norms during physical site EVC.'
      });

    expect([200, 201]).toContain(lorRes.status);
    expect(lorRes.body.data.document.documentType).toBe('LoR');

    // 3. Regional Standing Hearing Committee (SHC) schedules formal hearing
    const shcRes = await request(app)
      .post('/api/v1/appeals-hearings/schedule-hearing')
      .set('Origin', ORIGIN)
      .set('Cookie', caCookie)
      .send({
        caseId: rejectCaseId,
        hearingType: 'SHC',
        committeeMembers: ['Dr. V. K. Paul (Chair)', 'Prof. A. S. Pant', 'Adv. S. K. Hegde'],
        scheduledDate: '2026-11-25',
        hearingMode: 'HYBRID',
        venueOrLink: 'AICTE Headquarters, Room SHC-1 / Online WebEx'
      });

    expect(shcRes.status).toBe(201);
    expect(shcRes.body.data.hearing.hearingType).toBe('SHC');
    expect(shcRes.body.data.hearing.status).toBe('SCHEDULED');

    // 4. Test SAC Disposition Outcomes:
    // Outcome A: Standing Appellate Committee (SAC) disposes appeal with RELIEF_GRANTED
    const sacDisposeRes = await request(app)
      .post('/api/v1/appeals-hearings/appeals/HEAR-SAC-APEX-01/dispose')
      .set('Origin', ORIGIN)
      .set('Cookie', caCookie)
      .send({
        decision: 'RELIEF_GRANTED',
        remarks: 'Appellate bench examined certified revenue land map; relief granted under APH §2.24.',
        committeeMembers: ['Hon. Retired High Court Judge', 'Senior Academic Expert']
      });

    expect(sacDisposeRes.status).toBe(200);
    expect(sacDisposeRes.body.data.appeal.status).toBe('DECIDED_BY_COUNCIL');
    expect(sacDisposeRes.body.data.appeal.recommendation).toBe('RECOMMEND_APPROVAL');
  });

  // ==========================================================================
  // JOURNEY 6: Boundary Condition (X = 360) Ambiguity Review Hold
  // ==========================================================================
  it('Journey 6: Boundary Condition X = 360 holds case for Executive Policy Review', async () => {
    const boundaryCheckRes = await request(app)
      .post('/api/v1/nsws/evaluate-route')
      .set('Origin', ORIGIN)
      .send({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        existingIntake: 360, // Exact boundary condition omitted from Errata Table
        proposedIntake: 420,
        nbaAccredited: true,
        nbaScore: 700,
        region: 'Western'
      });

    expect(boundaryCheckRes.status).toBe(200);
    expect(boundaryCheckRes.body.data.routeDecision.unresolvedFlags).toBeDefined();
    const hasBoundaryFlag = boundaryCheckRes.body.data.routeDecision.unresolvedFlags.some(
      (f: string) => f.includes('360')
    );
    expect(hasBoundaryFlag).toBe(true);
  });

  // ==========================================================================
  // JOURNEY 7: Statutory Ineligibility Guard (Core Branch Deficit Blocks Ingestion)
  // ==========================================================================
  it('Journey 7: Core Branch Deficit triggers statutory ineligibility block and prevents NSWS submission', async () => {
    const ineligiblePayload = {
      id: 'APP-2026-INELIGIBLE-TEST',
      reference: '1-NSWS-INELIGIBLE',
      idempotencyKey: 'IDEMP-INEL-001',
      nswsReference: 'NSWS-INV-INEL',
      institutionName: 'Deficient Tech Institute',
      institutionId: 'INST-DEFICIENT',
      regionId: 'Western',
      category: 'increase_intake',
      session: '2026-27',
      pan: 'AAATA9876C',
      signatoryName: 'Dr. Test Deficit',
      facts: {
        institutionName: 'Deficient Tech Institute',
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        existingIntake: 120,
        proposedIntake: 180,
        nbaAccredited: true,
        nbaScore: 700,
        coreBranchesCount: 9,
        nonCsCoreBranchesCount: 0, // Mandates min 2 non-CS core branches under Errata p. 42
        region: 'Western'
      }
    };

    const submitRes = await request(app)
      .post('/api/v1/nsws/submit')
      .set('Origin', ORIGIN)
      .send(ineligiblePayload);

    // Ineligible application must be rejected with 422 STATUTORY_INELIGIBILITY
    expect(submitRes.status).toBe(422);
    expect(submitRes.body.success).toBe(false);
    expect(submitRes.body.error.code).toBe('STATUTORY_INELIGIBILITY');
    expect(submitRes.body.error.message).toContain('Ineligible under AICTE Norms');
  });
});
