import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import request from 'supertest';
import { createCompanionApp } from '../../src/backend/companionApp';
import { NSWSSimulationView, CUSTOM_PRESET_DEF } from '../../src/features/nsws/NSWSSimulationView';

describe('Custom Intake Autofill, Phantom Purge & Safe Demo Reset Suite', () => {
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

  it('Step 1 to Step 3 Autofill: verifies custom intake banner and preset definition', () => {
    // Render static markup of NSWSSimulationView
    const html = renderToStaticMarkup(React.createElement(NSWSSimulationView, {}));
    
    // Verify Step 1 custom intake banner and canonical scenarios are present
    expect(html).toContain('Custom Technical Institution / Interactive Dynamic Intake');
    expect(html).toContain('Custom Mode Active');
    expect(html).toContain('Entity / Trust PAN');
    expect(html).toContain('Authorized Signatory Name');
    expect(html).toContain('Official Institutional Email Address');

    // Verify CUSTOM_PRESET_DEF parameters
    expect(CUSTOM_PRESET_DEF.id).toBe('custom');
    expect(CUSTOM_PRESET_DEF.name).toBe('');
    expect(CUSTOM_PRESET_DEF.signatory).toBe('Dr. K. S. Raman');
    expect(CUSTOM_PRESET_DEF.pan).toBe('AAATA9876C');
    expect(CUSTOM_PRESET_DEF.email).toBe('director@aitr.edu.in');
  });

  it('Safe Demo Reset purges custom institutions and leaves exactly the canonical applications', async () => {
    // 1. Submit a custom institution
    const customPayload = {
      id: 'APP-CUSTOM-TEST-AUTORESET',
      reference: '1-NSWS-CUSTOM-RESET-99',
      idempotencyKey: 'IDEMP-RESET-TEST-99',
      selectedPresetId: 'custom',
      institutionName: 'Custom University of Excellence',
      institutionId: 'INST-CUSTOM-EXCELLENCE',
      regionId: 'Western',
      category: 'increase_intake',
      session: '2026-27',
      pan: 'AAATA9876C',
      signatoryName: 'Dr. Test Chancellor',
      facts: {
        institutionName: 'Custom University of Excellence',
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        existingIntake: 120,
        proposedIntake: 180,
        region: 'Western'
      }
    };

    const submitRes = await request(app)
      .post('/api/v1/nsws/submit')
      .send(customPayload);
    expect(submitRes.status).toBe(201);

    // 2. Execute Safe Demo Reset
    const { cookie } = await loginAs('admin@aicte.gov.in');
    const resetRes = await request(app)
      .post('/api/v1/demo/reset')
      .set('Origin', 'http://localhost:3000')
      .set('Cookie', cookie)
      .send({});

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);
    expect(resetRes.body.data.clearedDemoApplicationsCount).toBeGreaterThanOrEqual(1);

    // 3. Verify custom application is removed and only canonical benchmarks remain
    const listRes = await request(app)
      .get('/api/v1/applications')
      .set('Origin', 'http://localhost:3000')
      .set('Cookie', cookie);

    const items = listRes.body.data.items || listRes.body.data;
    const foundCustom = items.find((a: any) => a.id === 'APP-CUSTOM-TEST-AUTORESET' || a.facts?.institutionName === 'Custom University of Excellence');
    expect(foundCustom).toBeUndefined();

    // Verify all canonical cases remain intact
    const canonicalCodes = ['INST-SOUTH', 'INST-NORTH', 'INST-WEST', 'INST-APEX', 'INST-BATU', 'INST-VVIT'];
    for (const code of canonicalCodes) {
      const canonApp = items.find((a: any) => a.institutionId === code || a.institutionCode === code);
      expect(canonApp).toBeDefined();
    }
  });

  it('Repeated Safe Demo Resets are idempotent and maintain the exact same clean baseline', async () => {
    const { cookie } = await loginAs('admin@aicte.gov.in');

    // Run reset 1st time
    const res1 = await request(app)
      .post('/api/v1/demo/reset')
      .set('Origin', 'http://localhost:3000')
      .set('Cookie', cookie)
      .send({});
    expect(res1.status).toBe(200);

    // Run reset 2nd time
    const res2 = await request(app)
      .post('/api/v1/demo/reset')
      .set('Origin', 'http://localhost:3000')
      .set('Cookie', cookie)
      .send({});
    expect(res2.status).toBe(200);
    expect(res2.body.data.restoredCanonicalApplicationsCount).toBe(res1.body.data.restoredCanonicalApplicationsCount);

    // Run reset 3rd time
    const res3 = await request(app)
      .post('/api/v1/demo/reset')
      .set('Origin', 'http://localhost:3000')
      .set('Cookie', cookie)
      .send({});
    expect(res3.status).toBe(200);
    expect(res3.body.data.restoredCanonicalApplicationsCount).toBe(res1.body.data.restoredCanonicalApplicationsCount);

    // Verify application count is stable
    const listRes = await request(app)
      .get('/api/v1/applications')
      .set('Origin', 'http://localhost:3000')
      .set('Cookie', cookie);
    const items = listRes.body.data.items || listRes.body.data;
    expect(items.length).toBeGreaterThanOrEqual(6);
  });
});
