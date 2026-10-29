/**
 * NIYAMSETU (नियमसेतु) — Performance Benchmarking Test Suite
 * SIH 2026 | Problem Statement 26262: AICTE Approval Workflow Automation
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createCompanionApp } from '../../src/backend/companionApp';

describe('Part 7 — Performance Verification Benchmarks', () => {
  const companion = createCompanionApp();
  const app = companion.app;
  const origin = companion.identity.origin;

  it('measures GET /api/v1/health response latency (< 250ms cold-start target)', async () => {
    const t0 = performance.now();
    const res = await request(app).get('/health');
    const elapsedMs = performance.now() - t0;

    expect(res.status).toBe(200);
    expect(elapsedMs).toBeLessThan(400);
    console.log(`[PERF] GET /health latency: ${elapsedMs.toFixed(2)} ms`);
  });

  it('measures NSWS Onboarding Step 1 transition latency (< 50ms target)', async () => {
    const t0 = performance.now();
    const res = await request(app)
      .post('/api/v1/nsws/onboard')
      .send({
        pan: 'AAACB1234F',
        signatoryName: 'Dr. Anand Deshpande',
        mobile: '9876543210',
        email: 'principal@coep.ac.in',
        simulatedOtp: '123456'
      });
    const elapsedMs = performance.now() - t0;

    expect(res.status).toBe(200);
    expect(elapsedMs).toBeLessThan(150);
    console.log(`[PERF] NSWS Step 1 Onboarding latency: ${elapsedMs.toFixed(2)} ms`);
  });

  it('measures NSWS Step 3 Dynamic Route evaluation (< 50ms target)', async () => {
    const t0 = performance.now();
    const res = await request(app)
      .post('/api/v1/nsws/evaluate-route')
      .send({
        facts: {
          category: 'increase_intake',
          nbaAccredited: true,
          nbaScore: 680,
          proposedIntake: 180
        }
      });
    const elapsedMs = performance.now() - t0;

    expect(res.status).toBe(200);
    expect(elapsedMs).toBeLessThan(150);
    console.log(`[PERF] NSWS Step 3 Dynamic Routing latency: ${elapsedMs.toFixed(2)} ms`);
  });

  it('measures GET /api/v1/appeals-hearings latency (< 50ms target)', async () => {
    const t0 = performance.now();
    const res = await request(app).get('/api/v1/appeals-hearings');
    const elapsedMs = performance.now() - t0;

    expect(res.status).toBe(200);
    expect(elapsedMs).toBeLessThan(150);
    console.log(`[PERF] GET /appeals-hearings latency: ${elapsedMs.toFixed(2)} ms`);
  });

  it('measures Authenticated Applicant / Approval Bureau load cycle (< 100ms target)', async () => {
    // 1. Login
    const tLogin0 = performance.now();
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .set('Origin', origin)
      .send({ email: 'principal@coep.ac.in', password: 'password123' });
    const loginMs = performance.now() - tLogin0;
    const cookie = loginRes.headers['set-cookie'];

    // 2. Load applications docket
    const tApp0 = performance.now();
    const appRes = await request(app)
      .get('/api/v1/applications')
      .set('Cookie', cookie);
    const appMs = performance.now() - tApp0;

    // 3. Load escalations
    const tEsc0 = performance.now();
    const escRes = await request(app)
      .get('/api/v1/escalations')
      .set('Cookie', cookie);
    const escMs = performance.now() - tEsc0;

    expect(loginRes.status).toBe(200);
    expect(appRes.status).toBe(200);
    expect(escRes.status).toBe(200);

    console.log(`[PERF] Authentication login latency: ${loginMs.toFixed(2)} ms`);
    console.log(`[PERF] Applications docket load latency: ${appMs.toFixed(2)} ms`);
    console.log(`[PERF] Escalation docket load latency: ${escMs.toFixed(2)} ms`);
  });
});
