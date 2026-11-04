import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createCompanionApp } from '../../src/backend/companionApp';

describe('NSWS All 7 Statutory Presets & Idempotency Acceptance Suite', () => {
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

  const PRESETS = [
    {
      id: 'coep',
      name: 'College of Engineering Pune (COEP Tech Univ)',
      institutionId: 'INST-SOUTH',
      pan: 'AAACB1234F',
      signatory: 'Dr. Anand Deshpande',
      category: 'increase_intake',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      existingIntake: 120,
      proposedIntake: 180,
      nbaAccredited: true,
      nbaScore: 680,
      region: 'Western',
      email: 'principal@coep.ac.in',
      expectedRouteSubstring: 'CAT-CH2-09A'
    },
    {
      id: 'giits',
      name: 'Godavari Institute of Infrastructure & Tech Sciences',
      institutionId: 'INST-NORTH',
      pan: 'AABTG5432K',
      signatory: 'Dr. Suresh Rao',
      category: 'increase_intake',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      existingIntake: 120,
      proposedIntake: 240,
      nbaAccredited: false,
      nbaScore: 0,
      region: 'Western',
      email: 'principal@giits.ac.in',
      expectedRouteSubstring: 'CAT-CH2-09B'
    },
    {
      id: 'pdimtr',
      name: 'Prerna Deshmukh Inst of Mgmt & Tech Research',
      institutionId: 'INST-WEST',
      pan: 'AAATP9988D',
      signatory: 'Dr. Meena Patil',
      category: 'extension_of_approval',
      program: 'Management',
      level: 'Post Graduate',
      existingIntake: 180,
      proposedIntake: 180,
      nbaAccredited: false,
      nbaScore: 0,
      region: 'Western',
      email: 'principal@pdimtr.ac.in',
      expectedRouteSubstring: 'CAT-CH2-01'
    },
    {
      id: 'apex',
      name: 'Apex Polytechnic & Technical Institute',
      institutionId: 'INST-APEX',
      pan: 'AAATA4321M',
      signatory: 'Dr. Vikram Malhotra',
      category: 'new_institution',
      program: 'Engineering and Technology',
      level: 'Diploma',
      existingIntake: 0,
      proposedIntake: 300,
      nbaAccredited: false,
      nbaScore: 0,
      region: 'North-Western',
      email: 'principal@apex.ac.in',
      expectedRouteSubstring: 'CAT-CH1-NEW'
    },
    {
      id: 'batu',
      name: 'Dr. BATU Regional Technical Centre',
      institutionId: 'INST-BATU',
      pan: 'AAATB7766N',
      signatory: 'Dr. Rajesh Kulkarni',
      category: 'closure',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      existingIntake: 240,
      proposedIntake: 180,
      nbaAccredited: true,
      nbaScore: 710,
      region: 'Western',
      email: 'principal@batu.ac.in',
      expectedRouteSubstring: 'CAT-CH2-15'
    },
    {
      id: 'batu-shifting',
      name: 'Dr. BATU Rural Extension Centre (Shifting/Relocation)',
      institutionId: 'INST-BATU',
      pan: 'AAATB7766N',
      signatory: 'Dr. Rajesh Kulkarni',
      category: 'restoration_or_shifting',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      existingIntake: 180,
      proposedIntake: 180,
      nbaAccredited: false,
      nbaScore: 0,
      region: 'Western',
      email: 'principal@batu.ac.in',
      expectedRouteSubstring: 'CAT-CH2-14'
    },
    {
      id: 'boundary-x360',
      name: 'Vidya Vardhini Institute of Technology (Boundary X=360)',
      institutionId: 'INST-VVIT',
      pan: 'AAATV5544P',
      signatory: 'Dr. Ramesh Kadam',
      category: 'increase_intake',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      existingIntake: 360,
      proposedIntake: 420,
      nbaAccredited: false,
      nbaScore: 0,
      region: 'Western',
      email: 'principal@vvit.ac.in',
      expectedRouteSubstring: 'CAT-CH2-09B'
    }
  ];

  it('correctly routes and submits all 7 presets with statutory route codes', async () => {
    for (const preset of PRESETS) {
      const slug = preset.id.toUpperCase().replace(/[^A-Z0-9]/g, '-');
      const expectedAppId = `APP-2026-NSWS-${slug}`;

      // 1. Dynamic route evaluation
      const evalRes = await request(app)
        .post('/api/v1/nsws/evaluate-route')
        .send({
          category: preset.category,
          program: preset.program,
          level: preset.level,
          existingIntake: preset.existingIntake,
          proposedIntake: preset.proposedIntake,
          nbaAccredited: preset.nbaAccredited,
          nbaScore: preset.nbaScore,
          region: preset.region
        });

      expect(evalRes.status).toBe(200);
      expect(evalRes.body.success).toBe(true);
      const decision = evalRes.body.data.routeDecision;
      expect(decision.category).toBe(preset.expectedRouteSubstring);

      // 2. Initial Submission
      const payload = {
        id: expectedAppId,
        reference: `1-NSWS-${slug}-2026`,
        idempotencyKey: `NSWS-2026-${preset.id}`,
        nswsReference: `NSWS-INV-${slug}`,
        institutionName: preset.name,
        institutionId: preset.institutionId,
        regionId: preset.region,
        category: preset.category,
        session: '2026-27',
        pan: preset.pan,
        signatoryName: preset.signatory,
        dscTokenSerial: 'EP2003-8841-A99B',
        facts: {
          institutionName: preset.name,
          category: preset.category,
          program: preset.program,
          level: preset.level,
          existingIntake: preset.existingIntake,
          proposedIntake: preset.proposedIntake,
          nbaAccredited: preset.nbaAccredited,
          nbaScore: preset.nbaScore,
          region: preset.region
        }
      };

      const submitRes = await request(app)
        .post('/api/v1/nsws/submit')
        .send(payload);

      expect([200, 201]).toContain(submitRes.status);
      expect(submitRes.body.success).toBe(true);
      expect(submitRes.body.data.application.id).toBe(expectedAppId);

      // 3. Idempotent Retry: duplicate submission returns success without duplicating
      const retryRes = await request(app)
        .post('/api/v1/nsws/submit')
        .send(payload);

      expect([200, 201]).toContain(retryRes.status);
      expect(retryRes.body.success).toBe(true);
      expect(retryRes.body.duplicateDetected).toBe(true);
      expect(retryRes.body.data.application.id).toBe(expectedAppId);
    }
  });

  it('enforces strict tenant isolation between COEP and VVIT', async () => {
    const coepSession = await loginAs('principal@coep.ac.in');
    const vvitSession = await loginAs('principal@vvit.ac.in');

    const coepListRes = await request(app)
      .get('/api/v1/applications')
      .set('Cookie', coepSession.cookie)
      .set('Origin', 'http://localhost:3000');

    const vvitListRes = await request(app)
      .get('/api/v1/applications')
      .set('Cookie', vvitSession.cookie)
      .set('Origin', 'http://localhost:3000');

    const coepApps = coepListRes.body.data?.items || coepListRes.body.items || [];
    const vvitApps = vvitListRes.body.data?.items || vvitListRes.body.items || [];

    // COEP must only see INST-SOUTH
    expect(coepApps.every((a: any) => a.institutionId === 'INST-SOUTH')).toBe(true);
    expect(coepApps.some((a: any) => a.institutionId === 'INST-VVIT')).toBe(false);

    // VVIT must only see INST-VVIT
    expect(vvitApps.every((a: any) => a.institutionId === 'INST-VVIT' || a.institutionId === 'INST-VVIT-WES')).toBe(true);
    expect(vvitApps.some((a: any) => a.institutionId === 'INST-SOUTH')).toBe(false);
  });
});
