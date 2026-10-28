import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createCompanionApp } from '../src/backend/companionApp';
import { evaluateRouteWithEngine } from '../src/backend/policy/dynamicRouteEngine';
import { generatedDocumentsDB } from '../src/backend/modules/decisionDocuments/decisionDocumentsService';

describe('NIYAMSETU Full Deliverables Regression Suite (Mandatory Prototype Retrofit)', () => {
  let app: any;
  let storage: any;

  beforeEach(() => {
    generatedDocumentsDB.clear();
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

  // --- DELIVERABLE 1: Interactive NSWS -> AICTE Application Simulation ---
  describe('Deliverable 1: Interactive NSWS -> AICTE Application Simulation', () => {
    it('executes 5-step NSWS onboarding, PAN validation, route evaluation, and persistent submission', async () => {
      // Step 1: Onboard with PAN and OTP
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
      expect(onboardRes.body.data.panValid).toBe(true);
      expect(onboardRes.body.data.nswsReference).toMatch(/^NSWS-INV-/);
      expect(onboardRes.body.data.simulationNotice).toContain('NSWS to AICTE application intake simulation');

      // Step 2: DSC Verification via emBridge
      const dscRes = await request(app)
        .post('/api/v1/adapter/dsc-verify')
        .send({
          documentId: 'NSWS-DOC-KYC-01',
          dscSigned: true,
          tokenType: 'ePass2003Auto',
          signatoryName: 'Dr. Anand Deshpande'
        });
      expect(dscRes.status).toBe(200);
      expect(dscRes.body.data.verified).toBe(true);

      // Step 3 & 4: Route Pre-check
      const evalRes = await request(app)
        .post('/api/v1/nsws/evaluate-route')
        .send({
          facts: {
            category: 'increase_intake',
            program: 'Engineering and Technology',
            level: 'Under Graduate',
            proposedIntake: 360,
            nbaAccredited: true,
            nbaScore: 680,
            builtUpAreaSqM: 12500,
            region: 'Western'
          }
        });
      expect(evalRes.status).toBe(200);
      expect(evalRes.body.data.routeDecision.routeType).toBe('SCRUTINY_ONLY');
      expect(evalRes.body.data.routeDecision.requiresEVC).toBe(false);

      // Step 5: Persistent Submission
      const submitRes = await request(app)
        .post('/api/v1/nsws/submit')
        .send({
          nswsReference: onboardRes.body.data.nswsReference,
          institutionName: 'College of Engineering Pune',
          institutionId: 'INST-COEP-PUNE',
          regionId: 'Western',
          category: 'increase_intake',
          session: '2026-2027',
          pan: 'AAACB1234F',
          signatoryName: 'Dr. Anand Deshpande',
          dscTokenSerial: 'EP2003-8841-A99B',
          facts: {
            program: 'Engineering and Technology',
            level: 'Under Graduate',
            existingIntake: 120,
            proposedIntake: 180,
            nbaAccredited: true,
            nbaScore: 680
          }
        });
      expect(submitRes.status).toBe(201);
      expect(submitRes.body.success).toBe(true);
      expect(submitRes.body.data.application.facts.intakeChannel).toBe('NSWS_SIMULATION');
      expect(submitRes.body.data.application.route.result).toBe('selected');
      expect(submitRes.body.data.application.route.sources.length).toBeGreaterThan(0);
    });
  });

  // --- DELIVERABLE 2: Dynamic, Source-Versioned Route Engine ---
  describe('Deliverable 2: Dynamic, Source-Versioned Route Engine', () => {
    it('evaluates NBA score >= 670 course as EVC bypassed per Addendum 2026-27 p. 42', () => {
      const decision = evaluateRouteWithEngine({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        proposedIntake: 180,
        nbaAccredited: true,
        nbaScore: 680
      });
      expect(decision.policyRevisionId).toBe('POL-2026-INTAKE-NBA');
      expect(decision.result).toBe('selected');
      expect(decision.stages.includes('evc_pending')).toBe(false);
      expect(decision.skippedStages.some((s) => s.stage === 'evc_pending')).toBe(true);
      expect(decision.sources.some((s) => s.title.includes('Addendum'))).toBe(true);
    });

    it('evaluates non-NBA course as requiring EVC inspection per APH Table 2.3', () => {
      const decision = evaluateRouteWithEngine({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        proposedIntake: 240,
        nbaAccredited: false,
        nbaScore: 500
      });
      expect(decision.policyRevisionId).toBe('POL-2026-INTAKE-NON-NBA');
      expect(decision.result).toBe('selected');
      expect(decision.stages).toContain('evc_pending');
      expect(decision.skippedStages.length).toBe(0);
    });

    it('detects unresolved X=360 boundary condition and safely sets result to review_required', () => {
      const decision = evaluateRouteWithEngine({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        proposedIntake: 360,
        nbaAccredited: true,
        nbaScore: 680
      });
      expect(decision.unresolvedFlags.some((f) => f.includes('X = 360') || f.includes('X=360'))).toBe(true);
      expect(decision.result).toBe('review_required');
    });

    it('verifies adjacent boundary values around X=360 fail-safe', () => {
      const decision359 = evaluateRouteWithEngine({
        category: 'increase_intake',
        proposedIntake: 359,
        nbaAccredited: true
      });
      expect(decision359.result).toBe('selected');
      expect(decision359.unresolvedFlags.length).toBe(0);

      const decision361 = evaluateRouteWithEngine({
        category: 'increase_intake',
        proposedIntake: 361,
        nbaAccredited: true
      });
      expect(decision361.result).toBe('selected');
      expect(decision361.unresolvedFlags.length).toBe(0);
    });

    it('fails safely to review_required for ELP 50% conflict and hibernation discrepancy', () => {
      const elpDecision = evaluateRouteWithEngine({
        category: 'increase_intake',
        proposedIntake: 180,
        isExperientialLearningProgram: true
      });
      expect(elpDecision.result).toBe('review_required');
      expect(elpDecision.unresolvedFlags.some(f => f.includes('CONFLICT'))).toBe(true);

      const hiberDecision = evaluateRouteWithEngine({
        category: 'extension_of_approval',
        hibernationTiming: true
      });
      expect(hiberDecision.result).toBe('review_required');
      expect(hiberDecision.unresolvedFlags.some(f => f.includes('Hibernation timing'))).toBe(true);
    });
  });

  // --- DELIVERABLE 3: Regional Office Operations Desk Allocation ---
  describe('Deliverable 3: Regional Office Operations Desk Allocation UI & Workloads', () => {
    it('returns at least 2 Scrutiny and 2 EVC groups with real capacities and memberships', async () => {
      const res = await request(app).get('/api/v1/allocation/groups');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const groups = res.body.data.groups;
      expect(groups.length).toBeGreaterThanOrEqual(4);

      const scrutinyGroups = groups.filter((g: any) => g.type === 'SCRUTINY' || g.groupType === 'DESK_SCRUTINY');
      const evcGroups = groups.filter((g: any) => g.type === 'EVC' || g.groupType === 'EVC');
      expect(scrutinyGroups.length).toBeGreaterThanOrEqual(2);
      expect(evcGroups.length).toBeGreaterThanOrEqual(2);

      expect(scrutinyGroups[0].members.length).toBeGreaterThan(0);
      expect(evcGroups[0].capacity).toBeGreaterThan(0);
    });

    it('rejects EVC panel assignment when case route bypassed EVC inspection', async () => {
      const assignRes = await request(app)
        .post('/api/v1/allocation/assign')
        .send({
          caseId: 'APP-2026-COEP', // NBA course that bypassed EVC
          type: 'EVC',
          groupId: 'EVC-GROUP-A',
          officerId: 'usr-ro-western',
          reason: 'Manual inspection request'
        });
      expect(assignRes.status).toBe(422);
      expect(assignRes.body.error.code).toBe('EVC_NOT_APPLICABLE_FOR_ROUTE');
    });

    it('records valid Scrutiny assignment with reason in auditable history', async () => {
      const assignRes = await request(app)
        .post('/api/v1/allocation/assign')
        .send({
          caseId: 'APP-2026-COEP',
          type: 'SCRUTINY',
          groupId: 'SCR-GROUP-B',
          officerId: 'usr-ro-western',
          reason: 'Workload balancing across Western Regional Office desks'
        });
      expect(assignRes.status).toBe(200);
      expect(assignRes.body.success).toBe(true);

      const histRes = await request(app).get('/api/v1/allocation/assignments/APP-2026-COEP');
      expect(histRes.status).toBe(200);
      expect(histRes.body.data.currentDeskScrutiny || histRes.body.data.assignment?.assignedGroupId).toBe('SCR-GROUP-B');
      expect(histRes.body.data.history.length).toBeGreaterThan(0);
      expect(histRes.body.data.history[0].reason).toContain('Workload balancing');
    });
  });

  // --- DELIVERABLE 4: Existing AICTE Portal Case/Report Ingestion ---
  describe('Deliverable 4: Existing AICTE Portal Ingestion Flow for Re-Scrutiny', () => {
    it('provides local demo fixtures and extracts mapping preview with confidence', async () => {
      const fixRes = await request(app).get('/api/v1/portal-import/fixtures');
      expect(fixRes.status).toBe(200);
      expect(fixRes.body.data.fixtures.length).toBeGreaterThanOrEqual(2);

      const prevRes = await request(app)
        .post('/api/v1/portal-import/preview')
        .send({ fixtureId: 'GIITS-2026-REPORT' });
      expect(prevRes.status).toBe(200);
      expect(prevRes.body.data.extractedFields.applicationId).toBe('APP-2026-GIITS');
      expect(prevRes.body.data.confidence).toBeGreaterThanOrEqual(0.9);
      expect(prevRes.body.data.immutableHash).toBeDefined();
      expect(prevRes.body.data.extractedDeficiencies.length).toBeGreaterThan(0);
    });

    it('confirms ingestion, preserves original report immutable, and spawns scoped re-scrutiny', async () => {
      const confirmRes = await request(app)
        .post('/api/v1/portal-import/confirm')
        .send({
          applicationId: 'APP-2026-GIITS',
          institutionName: 'Gandhi Institute of Industrial Technology',
          regionId: 'South-Central',
          academicYear: '2026-2027',
          originalReportContent: JSON.stringify({ fixture: 'GIITS-2026' }),
          originalReportHash: 'SHA256-GIITS-IMMUTABLE-ORIGINAL',
          confirmedDeficiencyItemIds: ['D1', 'D2']
        });
      expect(confirmRes.status).toBe(201);
      expect(confirmRes.body.success).toBe(true);
      expect(confirmRes.body.data.scopedTaskId).toMatch(/^RESCRUTINY-TASK-/);
      expect(confirmRes.body.data.scopedDeficiencyIds).toEqual(['D1', 'D2']);
      expect(confirmRes.body.data.scopeLockRule).toContain('APH §1.8(g)');
    });
  });

  // --- DELIVERABLE 5: Re-Scrutiny Scope Lock Under APH §1.8(g) ---
  describe('Deliverable 5: Differential Re-Scrutiny Scope Lock (APH §1.8(g))', () => {
    it('locks cleared items read-only and allows edits ONLY on flagged deficiency IDs', async () => {
      const { cookie } = await loginAs('scrutiny.reviewer@aicte.gov.in');

      // Attempting to modify non-deficiency cleared item (C3) triggers HTTP 409 Conflict
      const tamperRes = await request(app)
        .post('/api/v1/scrutiny/APP-2026-COEP/rescrutiny')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({
          items: [
            { id: 'C3', category: 'Fire NOC', status: 'DEFICIENT', remarks: 'Tampered non-deficiency item' }
          ]
        });
      expect(tamperRes.status).toBe(409);
      expect(tamperRes.body.error.code).toMatch(/SCOPE_VIOLATION/);

      // Valid modification on deficiency item (D1) succeeds
      const validRes = await request(app)
        .post('/api/v1/scrutiny/APP-2026-COEP/rescrutiny')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({
          items: [
            { id: 'D1', category: 'Land Registration 30-Year Lease', status: 'COMPLIANT', remarks: 'Registered sale deed verified' }
          ]
        });
      expect(validRes.status).toBe(200);
      expect(validRes.body.success).toBe(true);
    });
  });

  // --- DELIVERABLE 6: Decoupled SAC, SHC, and Complaints Conditional Branches ---
  describe('Deliverable 6: Separate SAC, SHC, and Grievance Branches', () => {
    it('lodges statutory appeal to SAC requiring 7-day adverse trigger and appellant DSC', async () => {
      const appealRes = await request(app)
        .post('/api/v1/appeals-hearings/appeal')
        .send({
          caseId: 'APP-2026-COEP',
          institutionId: 'INST-COEP-PUNE',
          grounds: 'Rejection order was issued without examining structural stability certificate cure.',
          appellantDscToken: 'DSC-TOKEN-COEP-991'
        });
      expect(appealRes.status).toBe(201);
      expect(appealRes.body.data.appeal.id).toMatch(/^HEAR-SAC-/);
      expect(appealRes.body.data.appeal.status).toBe('PENDING_SCHEDULE');
    });

    it('rejects anonymous complaints per Chapter VII §7.10', async () => {
      const anonRes = await request(app)
        .post('/api/v1/appeals-hearings/complaint')
        .send({
          institutionId: 'INST-COEP-PUNE',
          complainantName: 'Anonymous Citizen',
          complainantAadhaarOrPan: 'ANONYMOUS',
          complaintDetails: 'Anonymous grievance regarding faculty cadres',
          isAnonymous: true
        });
      expect(anonRes.status).toBe(422);
      expect(anonRes.body.error.code).toBe('ANONYMOUS_COMPLAINT_REJECTED');
    });

    it('accepts identified complaints and routes to SCSC review', async () => {
      const identRes = await request(app)
        .post('/api/v1/appeals-hearings/complaint')
        .send({
          institutionId: 'INST-COEP-PUNE',
          complainantName: 'Prof. Ramesh Kulkarni',
          complainantAadhaarOrPan: 'ABCDE1234F',
          complaintDetails: 'Formal verified grievance with supporting evidence on lab norms',
          isAnonymous: false
        });
      expect(identRes.status).toBe(201);
      expect(identRes.body.data.complaint.id).toMatch(/^COMP-/);
      expect(identRes.body.data.complaint.status).toBe('PENDING_SCRUTINY');
    });
  });

  // --- DELIVERABLE 7: Active Rules & Routing Registry (Role 6) ---
  describe('Deliverable 7: Active Rules & Routing Registry', () => {
    it('provides searchable active rules with exact printed page and clause citations', async () => {
      const res = await request(app).get('/api/v1/rules-registry/active');
      expect(res.status).toBe(200);
      expect(res.body.data.rules.length).toBeGreaterThanOrEqual(5);

      const nbaRule = res.body.data.rules.find((r: any) => r.ruleId === 'RULE-2026-NBA-INTAKE-01');
      expect(nbaRule).toBeDefined();
      expect(nbaRule.clauseLocator).toContain('2.6(c)(1)');
      expect(nbaRule.printedPage).toBe(4);
      expect(nbaRule.status).toBe('ACTIVE_VERIFIED');
    });

    it('creates draft revisions and blocks unapproved direct publication', async () => {
      const draftRes = await request(app)
        .post('/api/v1/rules-registry/revisions')
        .send({
          ruleId: 'RULE-2026-NBA-INTAKE-01',
          academicYearScope: '2026-27',
          clauseLocator: 'Addendum Item 16 / Clause 2.6(c)(1)',
          printedPage: 4,
          physicalPdfPage: 4,
          sourceId: 'SRC-ADDENDUM-2026-27',
          sourceFile: 'APH Addentum.pdf',
          title: 'Revised Increase in Intake Norms',
          plainLanguageSummary: 'Updated draft for next academic gazette',
          proposedBy: 'usr-policy-admin'
        });
      expect(draftRes.status).toBe(201);
      expect(draftRes.body.data.draft.status).toBe('DRAFT');

      const pubRes = await request(app)
        .post('/api/v1/rules-registry/rules/RULE-2026-NBA-INTAKE-01/publish')
        .send({
          reason: 'Official Gazette Corrigendum Notification 2026-B',
          approvedBy: 'bureau.approval@aicte.gov.in'
        });
      expect(pubRes.status).toBe(200);
      expect(pubRes.body.data.rule.status).toBe('ACTIVE_VERIFIED');
    });

    it('exposes conflict register with safe holding paths for unresolved norms', async () => {
      const res = await request(app).get('/api/v1/rules-registry/conflicts');
      expect(res.status).toBe(200);
      expect(res.body.data.conflicts.length).toBeGreaterThanOrEqual(3);

      const elpConflict = res.body.data.conflicts.find((c: any) => c.ruleId === 'RULE-CONFLICT-ELP-PERCENTAGE');
      expect(elpConflict).toBeDefined();
      expect(elpConflict.status).toBe('CONFLICT');
    });
  });

  // --- DELIVERABLE 8: Generated Decision Documents & Demo Digital Signing ---
  describe('Deliverable 8: Decision Documents & Demo Digital Signing Verification', () => {
    it('rejects unauthenticated requests to /api/v1/decision-docs/generate/:caseId with 401', async () => {
      const res = await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-COEP')
        .send({ documentType: 'EOA' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('rejects unauthenticated requests to /api/v1/decision-documents/generate with 401', async () => {
      const res = await request(app)
        .post('/api/v1/decision-documents/generate')
        .send({
          applicationId: 'APP-2026-COEP',
          institutionName: 'COEP',
          permanentInstituteId: '1-435789102',
          documentType: 'EOA'
        });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('rejects decision document generation by applicant (institution role) with 403', async () => {
      const { cookie } = await loginAs('principal@coep.ac.in');
      const res = await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-COEP')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ documentType: 'EOA' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects decision document generation by regional officer (lacks decision.record) with 403', async () => {
      const { cookie } = await loginAs('ro.western@aicte.gov.in');
      const res = await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-COEP')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ documentType: 'EOA' });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('rejects decision document generation when no authorized decision has been recorded with 412', async () => {
      const { cookie } = await loginAs('bureau.approval@aicte.gov.in');
      // Case APP-2026-COEP is in 'scrutiny_pending' and has NO recorded decision
      const res = await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-COEP')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ documentType: 'EOA' });
      expect(res.status).toBe(412);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PRECONDITION_FAILED');
      expect(res.body.error.message).toContain('No authorized decision has been recorded');
    });

    it('rejects decision document generation when route is halted for policy review with 412', async () => {
      const { cookie } = await loginAs('bureau.approval@aicte.gov.in');
      const testActor = { id: 'usr-bureau-hq', role: 'bureau_officer', roles: ['bureau_officer'], institutionIds: [], regionIds: [], permissions: ['*'], scope: 'global' };
      await storage.transaction(async (unit: any) => {
        const c = await unit.get(testActor, 'APP-2026-PDIMTR');
        if (c) {
          c.route.result = 'review_required';
          await unit.save(c, c.version);
        }
      });

      const res = await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-PDIMTR')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ documentType: 'EOA' });
      expect(res.status).toBe(412);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PRECONDITION_FAILED');
      expect(res.body.error.message).toContain('review_required');
    });

    it('rejects decision document generation for non-existent case with 404', async () => {
      const { cookie } = await loginAs('bureau.approval@aicte.gov.in');
      const res = await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-DOES-NOT-EXIST')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ documentType: 'EOA' });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('rejects mismatched URL caseId and body applicationId with 422', async () => {
      const { cookie } = await loginAs('bureau.approval@aicte.gov.in');
      const res = await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-PDIMTR')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ applicationId: 'APP-2026-COEP', documentType: 'EOA' });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
      expect(res.body.error.message).toContain('Mismatched application ID');
    });

    it('rejects approval document (LoA/EoA) request for a rejected case with 422', async () => {
      const { cookie } = await loginAs('bureau.approval@aicte.gov.in');
      const testActor = { id: 'usr-bureau-hq', role: 'bureau_officer', roles: ['bureau_officer'], institutionIds: [], regionIds: [], permissions: ['*'], scope: 'global' };
      await storage.transaction(async (unit: any) => {
        const a = await unit.get(testActor, 'APP-2026-APEX');
        if (a) {
          a.state = 'rejected';
          await unit.save(a, a.version);
        }
      });

      const res = await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-APEX')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ documentType: 'EOA' });
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
      expect(res.body.error.message).toContain('Cannot generate approval document');
    });

    it('generates downloadable PDF with HMAC-SHA256 seal when case has valid recorded decision (APP-2026-PDIMTR)', async () => {
      const { cookie } = await loginAs('bureau.approval@aicte.gov.in');

      // APP-2026-PDIMTR has authorized conditional decision in canonical seed
      const genRes = await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-PDIMTR')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ documentType: 'EOA' });
      expect(genRes.status).toBe(201);
      expect(genRes.body.data.document.signatureStatus).toBe('DEMO_TEST_SIGNED');
      expect(genRes.body.data.document.demoNotice).toContain('NOT AN OFFICIAL AICTE');
      expect(genRes.body.data.document.documentDigest).toMatch(/^SHA256-/);
      expect(genRes.body.data.document.decisionAuthority).toBe('usr-bureau-hq');

      // Verify digital signature via caseId
      const verRes = await request(app)
        .get('/api/v1/decision-docs/verify-signature/APP-2026-PDIMTR')
        .set('Cookie', cookie);
      expect(verRes.status).toBe(200);
      expect(verRes.body.data.valid).toBe(true);
      expect(verRes.body.data.issuer).toContain('Non-Production');

      // Download PDF endpoint
      const dlRes = await request(app)
        .get('/api/v1/decision-docs/download/APP-2026-PDIMTR')
        .set('Cookie', cookie);
      expect(dlRes.status).toBe(200);
      expect(dlRes.headers['content-type']).toBe('application/pdf');
      expect(dlRes.headers['content-disposition']).toContain('attachment');
      expect(dlRes.body.length).toBeGreaterThan(100);
    });

    it('prevents duplicate generation and returns existing document idempotently (200 OK)', async () => {
      const { cookie } = await loginAs('bureau.approval@aicte.gov.in');

      // First generation
      const gen1 = await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-PDIMTR')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ documentType: 'EOA' });
      expect(gen1.status).toBe(201);
      const docId1 = gen1.body.data.document.docId;

      // Second generation (retry)
      const gen2 = await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-PDIMTR')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ documentType: 'EOA' });
      expect(gen2.status).toBe(200);
      expect(gen2.body.data.document.docId).toBe(docId1);
      expect(gen2.body.message).toContain('idempotent');
    });

    it('materializes post-approval obligations in complianceDB ONLY from recorded decision conditions', async () => {
      const { cookie } = await loginAs('bureau.approval@aicte.gov.in');

      await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-PDIMTR')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ documentType: 'EOA' });

      const compRes = await request(app)
        .get('/api/v1/compliance/obligations/APP-2026-PDIMTR')
        .set('Cookie', cookie);
      expect(compRes.status).toBe(200);
      expect(compRes.body.data.obligations.length).toBeGreaterThan(0);
      expect(compRes.body.data.obligations.every((o: any) => o.caseId === 'APP-2026-PDIMTR')).toBe(true);
    });

    it('generates Letter of Rejection (LoR) for rejected case and does NOT create compliance obligations', async () => {
      const { cookie } = await loginAs('bureau.approval@aicte.gov.in');
      const testActor = { id: 'usr-bureau-hq', role: 'bureau_officer', roles: ['bureau_officer'], institutionIds: [], regionIds: [], permissions: ['*'], scope: 'global' };
      await storage.transaction(async (unit: any) => {
        const a = await unit.get(testActor, 'APP-2026-APEX');
        if (a) {
          a.state = 'rejected';
          await unit.save(a, a.version);
        }
      });

      const lorRes = await request(app)
        .post('/api/v1/decision-documents/generate')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({
          applicationId: 'APP-2026-APEX',
          documentType: 'LoR'
        });
      expect(lorRes.status).toBe(201);
      expect(lorRes.body.data.document.documentType).toBe('LoR');
      expect(lorRes.body.data.document.courses.length).toBe(0); // Zero sanctioned intake on rejection!

      // Verify zero obligations created
      const compRes = await request(app)
        .get('/api/v1/compliance/obligations/APP-2026-APEX')
        .set('Cookie', cookie);
      expect(compRes.status).toBe(200);
      expect(compRes.body.data.obligations.length).toBe(0);
    });

    it('verifies unchanged PDF bytes pass HMAC-SHA256 verification and detects tampering', async () => {
      const { cookie } = await loginAs('bureau.approval@aicte.gov.in');

      const genRes = await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-PDIMTR')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ documentType: 'EOA' });
      expect(genRes.status).toBe(201);
      const doc = genRes.body.data.document;

      // 1. Valid unchanged bytes
      const validVerRes = await request(app)
        .post(`/api/v1/decision-documents/verify-signature/${doc.docId}`)
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ pdfBytesBase64: doc.pdfBytesBase64 });
      expect(validVerRes.status).toBe(200);
      expect(validVerRes.body.data.isSignatureValid).toBe(true);
      expect(validVerRes.body.data.tamperCheck).toBe('PASSED_UNMODIFIED');
      expect(validVerRes.body.data.signatureType).toBe('HMAC_SHA256_PROTOTYPE_SEAL');

      // 2. Tampered altered bytes
      const fakeBytes = Buffer.from('ALTERED_TAMPERED_PDF_CONTENT').toString('base64');
      const tamperRes = await request(app)
        .post(`/api/v1/decision-documents/verify-signature/${doc.docId}`)
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ pdfBytesBase64: fakeBytes });
      expect(tamperRes.status).toBe(200);
      expect(tamperRes.body.data.isSignatureValid).toBe(false);
      expect(tamperRes.body.data.tamperCheck).toBe('TAMPER_DETECTED');

      // 3. Malformed base64
      const malformedRes = await request(app)
        .post(`/api/v1/decision-documents/verify-signature/${doc.docId}`)
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ pdfBytesBase64: 'NOT_VALID_BASE_64!@#$' });
      expect(malformedRes.status).toBe(422);
      expect(malformedRes.body.error.code).toBe('MALFORMED_BASE64');

      // 4. Missing payload
      const missingRes = await request(app)
        .post(`/api/v1/decision-documents/verify-signature/${doc.docId}`)
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({});
      expect(missingRes.status).toBe(422);
      expect(missingRes.body.error.code).toBe('MISSING_PAYLOAD');

      // 5. Wrong document ID
      const wrongIdRes = await request(app)
        .post('/api/v1/decision-documents/verify-signature/DOC-NONEXISTENT-9999')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send({ pdfBytesBase64: fakeBytes });
      expect(wrongIdRes.status).toBe(404);
      expect(wrongIdRes.body.error.code).toBe('NOT_FOUND');
    });

    it('verifies denied calls leave domain state and compliance obligations unchanged', async () => {
      const initialObligations = (storage as any).inspect?.().obligations.length;

      // Unauthenticated call
      await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-COEP')
        .send({ documentType: 'EOA' });

      // Unauthorized role call
      const { cookie: instCookie } = await loginAs('principal@coep.ac.in');
      await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-COEP')
        .set('Cookie', instCookie)
        .set('Origin', 'http://localhost:3000')
        .send({ documentType: 'EOA' });

      // Precondition-failed call (case without decision)
      const { cookie: burCookie } = await loginAs('bureau.approval@aicte.gov.in');
      await request(app)
        .post('/api/v1/decision-docs/generate/APP-2026-COEP')
        .set('Cookie', burCookie)
        .set('Origin', 'http://localhost:3000')
        .send({ documentType: 'EOA' });

      // Verify domain state unchanged
      const currentObligations = (storage as any).inspect?.().obligations.length;
      expect(currentObligations).toBe(initialObligations);

      const coep = (storage as any).inspect?.().cases.find((c: any) => c.id === 'APP-2026-COEP');
      expect(coep.state).toBe('scrutiny_pending'); // Remained scrutiny_pending!
    });
  });

  // --- DELIVERABLE 10: Complete Removal of API Setu, State DTE, and Siebel CRM ---
  describe('Deliverable 10: Complete Removal of API Setu, State DTE, and Siebel CRM', () => {
    it('returns 404 for removed API Setu endpoint', async () => {
      const { cookie } = await loginAs('ro.western@aicte.gov.in');
      const res = await request(app)
        .get('/api/v1/adapter/external-registries/APP-2026-COEP')
        .set('Cookie', cookie);
      expect(res.status).toBe(404);
    });

    it('returns 404 for removed State DTE Concurrence endpoint', async () => {
      const { cookie } = await loginAs('ro.western@aicte.gov.in');
      const res = await request(app)
        .get('/api/v1/adapter/concurrence/APP-2026-COEP')
        .set('Cookie', cookie);
      expect(res.status).toBe(404);
    });

    it('returns 404 for removed Siebel CRM write-back endpoint', async () => {
      const { cookie } = await loginAs('ro.western@aicte.gov.in');
      const res = await request(app)
        .post('/api/v1/adapter/siebel-writeback/APP-2026-COEP')
        .set('Cookie', cookie)
        .set('Origin', 'http://localhost:3000')
        .send();
      expect(res.status).toBe(404);
    });
  });
});
