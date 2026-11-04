import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createCompanionApp } from '../../src/backend/companionApp';

describe('NSWS-Originated Case Injection & End-to-End Hand-Off Verification Suite', () => {
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

  it('executes full NSWS intake pipeline for COEP Pune (NBA Fast-Track) and verifies immediate visibility in institution portal', async () => {
    // Step 1: NSWS Onboarding & PAN KYC Verification
    const onboardRes = await request(app)
      .post('/api/v1/nsws/onboard')
      .send({
        entityName: 'College of Engineering Pune (COEP Tech Univ)',
        entityType: 'State University / Autonomous Institute',
        contactPerson: 'Dr. Anand Deshpande',
        email: 'principal@coep.ac.in',
        mobile: '+91 98765 43210',
        pan: 'AAACB1234F'
      });

    expect(onboardRes.status).toBe(200);
    expect(onboardRes.body.success).toBe(true);
    expect(onboardRes.body.data.panValid).toBe(true);
    const investorId = onboardRes.body.data.nswsReference;
    expect(investorId).toBeDefined();

    // Step 2: DSC Verification via emBridge simulation
    const dscRes = await request(app)
      .post('/api/v1/nsws/verify-dsc')
      .send({ investorId });

    expect(dscRes.status).toBe(200);
    expect(dscRes.body.success).toBe(true);
    expect(dscRes.body.data.dscDetails.tokenType).toContain('ePass2003Auto');

    // Step 3: Dynamic Route Pre-evaluation using authoritative policy engine
    const evalRes = await request(app)
      .post('/api/v1/nsws/evaluate-route')
      .send({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        existingIntake: 120,
        proposedIntake: 180,
        nbaAccredited: true,
        nbaScore: 680,
        builtUpAreaSqM: 14500,
        region: 'Western'
      });

    expect(evalRes.status).toBe(200);
    expect(evalRes.body.success).toBe(true);
    const routeDecision = evalRes.body.data.routeDecision;
    expect(routeDecision.fastTrackEligible).toBe(true);
    expect(routeDecision.requiresEVC).toBe(false);
    expect(routeDecision.routeType).toBe('SCRUTINY_ONLY');

    // Step 4: Submission and Injection into Case Storage
    const submitRes = await request(app)
      .post('/api/v1/nsws/submit')
      .send({
        investorId,
        institutionName: 'College of Engineering Pune (COEP Tech Univ)',
        institutionId: 'INST-SOUTH',
        regionId: 'Western',
        category: 'increase_intake',
        session: '2026-27',
        pan: 'AAACB1234F',
        signatoryName: 'Dr. Anand Deshpande',
        dscTokenSerial: 'EP2003-8841-A99B',
        facts: {
          institutionName: 'College of Engineering Pune (COEP Tech Univ)',
          category: 'increase_intake',
          program: 'Engineering and Technology',
          level: 'Under Graduate',
          existingIntake: 120,
          proposedIntake: 180,
          nbaAccredited: true,
          nbaScore: 680,
          builtUpAreaSqM: 14500,
          region: 'Western'
        }
      });

    expect(submitRes.status).toBe(201);
    expect(submitRes.body.success).toBe(true);
    const createdApp = submitRes.body.data.application;
    expect(createdApp.id).toMatch(/^APP-2026-NSWS-/);
    expect(createdApp.state).toBe('submitted');
    expect(createdApp.facts.intakeChannel).toBe('NSWS_SIMULATION');
    expect(createdApp.facts.institutionName).toBe('College of Engineering Pune (COEP Tech Univ)');
    expect(createdApp.facts.policyVersionPinned).toMatch(/2026/);

    // Step 5: Verify immediate visibility to Institution Actor (usr-inst-coep)
    const coepSession = await loginAs('principal@coep.ac.in');
    const instListRes = await request(app)
      .get('/api/v1/applications')
      .set('Cookie', coepSession.cookie)
      .set('Origin', 'http://localhost:3000');

    expect(instListRes.status).toBe(200);
    const coepApps = instListRes.body.data?.items || instListRes.body.items || [];
    const foundCoepCase = coepApps.find((a: any) => a.id === createdApp.id);
    expect(foundCoepCase).toBeDefined();
    expect(foundCoepCase.institutionId).toBe('INST-SOUTH');

    // Step 6: Verify visibility to Scrutiny Reviewer (usr-scrutiny-reviewer)
    const reviewerSession = await loginAs('scrutiny.reviewer@aicte.gov.in');
    const reviewerListRes = await request(app)
      .get('/api/v1/applications')
      .set('Cookie', reviewerSession.cookie)
      .set('Origin', 'http://localhost:3000');

    expect(reviewerListRes.status).toBe(200);
    const reviewerApps = reviewerListRes.body.data?.items || reviewerListRes.body.items || [];
    const foundReviewerCase = reviewerApps.find((a: any) => a.id === createdApp.id);
    expect(foundReviewerCase).toBeDefined();

    // Step 7: Verify visibility to Regional Officer (usr-ro-western)
    const roSession = await loginAs('ro.western@aicte.gov.in');
    const roListRes = await request(app)
      .get('/api/v1/applications')
      .set('Cookie', roSession.cookie)
      .set('Origin', 'http://localhost:3000');

    expect(roListRes.status).toBe(200);
    const roApps = roListRes.body.data?.items || roListRes.body.items || [];
    const foundRoCase = roApps.find((a: any) => a.id === createdApp.id);
    expect(foundRoCase).toBeDefined();

    // Step 8: Verify full Case Detail continuity via GET /api/v1/applications/:id
    const detailRes = await request(app)
      .get(`/api/v1/applications/${createdApp.id}`)
      .set('Cookie', coepSession.cookie)
      .set('Origin', 'http://localhost:3000');

    expect(detailRes.status).toBe(200);
    const detail = detailRes.body.data || detailRes.body;
    expect(detail.id).toBe(createdApp.id);
    expect(detail.facts.proposedIntake).toBe(180);
    expect(detail.route.policyRevisionId).toBe(createdApp.route.policyRevisionId);
  });

  it('executes NSWS intake for Non-NBA Dual-Track (GIITS Tech) and enforces Tenant Isolation against COEP', async () => {
    // Submit Non-NBA Dual-Track application
    const submitRes = await request(app)
      .post('/api/v1/nsws/submit')
      .send({
        nswsReference: 'NSWS-GIITS-DUAL-001',
        institutionName: 'Godavari Institute of Infrastructure & Tech Sciences',
        institutionId: 'INST-NORTH',
        regionId: 'Western',
        category: 'increase_intake',
        session: '2026-27',
        pan: 'AABTG5432K',
        signatoryName: 'Dr. Suresh Rao',
        dscTokenSerial: 'EP2003-8841-GIITS',
        facts: {
          institutionName: 'Godavari Institute of Infrastructure & Tech Sciences',
          category: 'increase_intake',
          program: 'Engineering and Technology',
          level: 'Under Graduate',
          existingIntake: 120,
          proposedIntake: 240,
          nbaAccredited: false,
          nbaScore: 0,
          builtUpAreaSqM: 8800,
          region: 'Western'
        }
      });

    expect(submitRes.status).toBe(201);
    const giitsApp = submitRes.body.data.application;
    expect(giitsApp.route.stages).toContain('evc_pending');
    expect(giitsApp.route.stages).toContain('scrutiny_pending');

    // GIITS Principal can see GIITS application
    const giitsSession = await loginAs('principal@giits.ac.in');
    const giitsListRes = await request(app)
      .get('/api/v1/applications')
      .set('Cookie', giitsSession.cookie)
      .set('Origin', 'http://localhost:3000');

    const giitsApps = giitsListRes.body.data?.items || giitsListRes.body.items || [];
    expect(giitsApps.some((a: any) => a.id === giitsApp.id)).toBe(true);

    // COEP Principal CANNOT see GIITS application (Tenant Isolation)
    const coepSession = await loginAs('principal@coep.ac.in');
    const coepListRes = await request(app)
      .get('/api/v1/applications')
      .set('Cookie', coepSession.cookie)
      .set('Origin', 'http://localhost:3000');

    const coepApps = coepListRes.body.data?.items || coepListRes.body.items || [];
    expect(coepApps.some((a: any) => a.id === giitsApp.id)).toBe(false);

    // Direct read attempt by unauthorized institution returns 404 or 403
    const directRes = await request(app)
      .get(`/api/v1/applications/${giitsApp.id}`)
      .set('Cookie', coepSession.cookie)
      .set('Origin', 'http://localhost:3000');

    expect([403, 404]).toContain(directRes.status);
  });

  it('evaluates and injects Boundary Condition X = 360 resulting in Policy Review Required', async () => {
    const evalRes = await request(app)
      .post('/api/v1/nsws/evaluate-route')
      .send({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        existingIntake: 360,
        proposedIntake: 420,
        nbaAccredited: false,
        nbaScore: 0,
        builtUpAreaSqM: 16000,
        region: 'Western'
      });

    expect(evalRes.status).toBe(200);
    const decision = evalRes.body.data.routeDecision;
    expect(decision.result).toBe('review_required');
    expect(decision.reasons.some((r: string) => r.includes('360'))).toBe(true);

    const submitRes = await request(app)
      .post('/api/v1/nsws/submit')
      .send({
        nswsReference: 'NSWS-BOUNDARY-360',
        institutionName: 'Vidya Vardhini Institute of Technology',
        institutionId: 'INST-SOUTH',
        regionId: 'Western',
        category: 'increase_intake',
        session: '2026-27',
        pan: 'AAATV5544P',
        signatoryName: 'Dr. Ramesh Kadam',
        dscTokenSerial: 'EP2003-8841-VVIT',
        facts: {
          institutionName: 'Vidya Vardhini Institute of Technology',
          category: 'increase_intake',
          program: 'Engineering and Technology',
          level: 'Under Graduate',
          existingIntake: 360,
          proposedIntake: 420,
          nbaAccredited: false,
          nbaScore: 0,
          builtUpAreaSqM: 16000,
          region: 'Western'
        }
      });

    expect(submitRes.status).toBe(201);
    const boundaryApp = submitRes.body.data.application;
    expect(boundaryApp.route.result).toBe('review_required');
  });
});
