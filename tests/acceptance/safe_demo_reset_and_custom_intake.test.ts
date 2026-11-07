import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createCompanionApp } from '../../src/backend/companionApp';

describe('Safe Demo Reset and Custom NSWS Intake Acceptance Tests', () => {
  let app: any;

  beforeEach(() => {
    process.env.ALLOW_DEMO_RESET = 'true';
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

  it('allows authorized Admin to trigger safe demo reset via POST /api/v1/demo/reset', async () => {
    const { cookie } = await loginAs('admin@aicte.gov.in');

    const resetRes = await request(app)
      .post('/api/v1/demo/reset')
      .set('Origin', 'http://localhost:3000')
      .set('Cookie', cookie)
      .send({});

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);
    expect(resetRes.body.data.restoredCanonicalApplicationsCount).toBeGreaterThanOrEqual(5);
    expect(resetRes.body.data.preservedInstitutionsCount).toBeGreaterThanOrEqual(5);
  });

  it('rejects unauthorized unauthenticated requests to POST /api/v1/demo/reset without key', async () => {
    const resetRes = await request(app)
      .post('/api/v1/demo/reset')
      .send({});

    expect(resetRes.status).toBe(403);
    expect(resetRes.body.success).toBe(false);
  });

  it('allows safe demo reset with valid X-Demo-Reset-Key header', async () => {
    process.env.DEMO_RESET_KEY = 'secret-hackathon-key-2026';
    const resetRes = await request(app)
      .post('/api/v1/demo/reset')
      .set('x-demo-reset-key', 'secret-hackathon-key-2026')
      .send({});

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);
  });

  it('evaluates dynamic route in real time for custom institution facts via /api/v1/nsws/evaluate-route', async () => {
    // 1. NBA accredited with high score -> Scrutiny Only
    const nbaRes = await request(app)
      .post('/api/v1/nsws/evaluate-route')
      .send({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        existingIntake: 120,
        proposedIntake: 180,
        nbaAccredited: true,
        nbaScore: 720,
        region: 'Western'
      });

    expect(nbaRes.status).toBe(200);
    expect(nbaRes.body.data.routeDecision.routeType).toBe('SCRUTINY_ONLY');
    expect(nbaRes.body.data.routeDecision.requiresEVC).toBe(false);

    // 2. Non-NBA increase in intake -> Scrutiny + EVC
    const nonNbaRes = await request(app)
      .post('/api/v1/nsws/evaluate-route')
      .send({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        existingIntake: 120,
        proposedIntake: 180,
        nbaAccredited: false,
        region: 'Western'
      });

    expect(nonNbaRes.status).toBe(200);
    expect(nonNbaRes.body.data.routeDecision.requiresEVC).toBe(true);
  });

  it('submits a custom, non-seeded application into the live docket with dynamically computed route and purges on reset', async () => {
    const customAppId = 'APP-2026-NSWS-CUSTOM-TEST-001';
    const customPayload = {
      id: customAppId,
      reference: '1-NSWS-CUSTOM-TEST-001',
      idempotencyKey: 'NSWS-CUSTOM-TEST-KEY-001',
      nswsReference: 'NSWS-INV-CUSTOM-TEST',
      institutionName: 'Aryabhatta Institute of Advanced Research',
      institutionId: 'INST-CUSTOM-AIAR',
      regionId: 'Western',
      category: 'increase_intake',
      session: '2026-27',
      pan: 'AAATA9876C',
      signatoryName: 'Dr. K. S. Raman',
      dscTokenSerial: 'EP2003-8841-A99B',
      facts: {
        institutionName: 'Aryabhatta Institute of Advanced Research',
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        existingIntake: 120,
        proposedIntake: 180,
        nbaAccredited: true,
        nbaScore: 700,
        region: 'Western',
        builtUpAreaSqM: 15000,
        landAreaAcre: 6.0
      }
    };

    const submitRes = await request(app)
      .post('/api/v1/nsws/submit')
      .send(customPayload);

    expect(submitRes.status).toBe(201);
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.data.application.id).toBe(customAppId);
    expect(submitRes.body.data.application.facts.institutionName).toBe('Aryabhatta Institute of Advanced Research');
    expect(submitRes.body.data.application.route).toBeDefined();

    // Now verify safe demo reset clears this custom application and preserves canonical cases
    const { cookie } = await loginAs('admin@aicte.gov.in');
    const resetRes = await request(app)
      .post('/api/v1/demo/reset')
      .set('Origin', 'http://localhost:3000')
      .set('Cookie', cookie)
      .send({});

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.data.clearedDemoApplicationsCount).toBeGreaterThanOrEqual(1);
    expect(resetRes.body.data.restoredCanonicalApplicationsCount).toBeGreaterThanOrEqual(5);
  });

  it('enforces Institution Legal Name requirement and ensures creating abc adds exactly one custom institution without phantoms', async () => {
    // 1. Rejects custom submission when institutionName is empty
    const invalidEmptyPayload = {
      id: 'APP-2026-NSWS-EMPTY-001',
      reference: '1-NSWS-EMPTY-001',
      idempotencyKey: 'NSWS-2026-CUSTOM-EMPTY',
      selectedPresetId: 'custom',
      institutionName: '',
      category: 'increase_intake',
      facts: { institutionName: '' }
    };
    const failRes = await request(app)
      .post('/api/v1/nsws/submit')
      .send(invalidEmptyPayload);
    expect(failRes.status).toBe(422);
    expect(failRes.body.error.code).toBe('VALIDATION_FAILED');

    // 2. Submitting legitimate custom institution "abc" creates exactly one application
    const abcPayload = {
      id: 'APP-2026-NSWS-ABC-9999',
      reference: '1-NSWS-ABC-9999',
      idempotencyKey: 'NSWS-2026-CUSTOM-ABC-9999',
      nswsReference: 'NSWS-INV-ABC',
      institutionName: 'abc',
      institutionId: 'INST-ABC-9999',
      regionId: 'Western',
      category: 'increase_intake',
      session: '2026-27',
      pan: 'AAATA9876C',
      signatoryName: 'Dr. Anand Deshpande',
      dscTokenSerial: 'EP2003-8841-A99B',
      facts: {
        institutionName: 'abc',
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        existingIntake: 120,
        proposedIntake: 180,
        nbaAccredited: true,
        nbaScore: 700,
        region: 'Western'
      }
    };
    const abcRes = await request(app)
      .post('/api/v1/nsws/submit')
      .send(abcPayload);
    expect(abcRes.status).toBe(201);
    expect(abcRes.body.data.application.facts.institutionName).toBe('abc');

    // 3. Docket query returns exactly one non-canonical application (abc)
    const { cookie } = await loginAs('admin@aicte.gov.in');
    const listRes = await request(app)
      .get('/api/v1/applications')
      .set('Origin', 'http://localhost:3000')
      .set('Cookie', cookie);
    expect(listRes.status).toBe(200);

    const items = listRes.body.data.items || listRes.body.data;
    const customApps = items.filter((a: any) => a.id.includes('ABC') || a.facts?.institutionName === 'abc');
    expect(customApps).toHaveLength(1);
    expect(customApps[0].facts?.institutionName).toBe('abc');

    // Verify no phantom application named "Custom Technical Institute" exists
    const phantomApps = items.filter((a: any) => 
      a.facts?.institutionName === 'Custom Technical Institute' || 
      a.institutionId === 'INST-CUSTOM-4316'
    );
    expect(phantomApps).toHaveLength(0);
  });
});
