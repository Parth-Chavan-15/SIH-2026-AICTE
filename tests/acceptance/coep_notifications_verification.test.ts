import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createCompanionApp } from '../../src/backend/companionApp';
import { complianceDB, seedComplianceDB } from '../../src/backend/modules/compliance/complianceService';

describe('Part 5 — COEP Demonstration Notifications & Tenant Isolation Verification', () => {
  let app: any;
  let companion: ReturnType<typeof createCompanionApp>;

  beforeEach(() => {
    companion = createCompanionApp();
    app = companion.app;
    seedComplianceDB();
  });

  it('delivers 5 coherent, workflow-grounded notifications for COEP Tech (APP-2026-COEP)', async () => {
    const alerts = Array.from(complianceDB.deliveredAlerts.values());
    const coepAlerts = alerts.filter(a => a.applicationId === 'APP-2026-COEP');

    expect(coepAlerts).toHaveLength(5);

    // Verify coherent workflow progression
    const titles = coepAlerts.map(a => a.title);
    expect(titles).toContain('NSWS Digital Intake Recorded');
    expect(titles).toContain('Route Evaluated: Route 1 (Scrutiny Only)');
    expect(titles).toContain('Desk Scrutiny Committee Group Assigned');
    expect(titles).toContain('Scrutiny Cleared under NBA Tier-1 Fast-Track');
    expect(titles).toContain('Pre-Approval Readiness: Joint FDR & Affidavit-3');

    // Verify unread state for active demonstration
    const unreadAlerts = coepAlerts.filter(a => !a.isRead);
    expect(unreadAlerts.length).toBeGreaterThanOrEqual(3);
  });

  it('enforces tenant isolation: Principal of COEP only receives COEP alerts via GET /api/v1/alerts', async () => {
    // 1. Authenticate as COEP Principal
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .set('Origin', companion.identity.origin)
      .send({ email: 'principal@coep.ac.in', password: 'password123' })
      .expect(200);

    const cookie = loginRes.headers['set-cookie'];

    // 2. Fetch alerts as authenticated COEP actor
    const alertsRes = await request(app)
      .get('/api/v1/alerts')
      .set('Cookie', cookie)
      .expect(200);

    expect(alertsRes.body.success).toBe(true);
    const delivered = alertsRes.body.data;

    // Must receive COEP alerts
    expect(delivered.length).toBe(5);
    delivered.forEach((item: any) => {
      expect(item.applicationId).toBe('APP-2026-COEP');
      expect(item.institutionId).toBe('INST-SOUTH');
    });

    // Zero cross-tenant leakage of GIITS, BATU, APEX, or PDIMTR alerts
    const otherColleges = delivered.filter((item: any) => item.applicationId !== 'APP-2026-COEP');
    expect(otherColleges).toHaveLength(0);
  });

  it('allows National Approval Bureau to inspect alerts across all institutions', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .set('Origin', companion.identity.origin)
      .send({ email: 'bureau.approval@aicte.gov.in', password: 'password123' })
      .expect(200);

    const cookie = loginRes.headers['set-cookie'];

    const alertsRes = await request(app)
      .get('/api/v1/alerts')
      .set('Cookie', cookie)
      .expect(200);

    expect(alertsRes.body.success).toBe(true);
    expect(alertsRes.body.data.length).toBeGreaterThanOrEqual(9);
  });
});
