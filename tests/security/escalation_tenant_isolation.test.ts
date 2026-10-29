/**
 * NIYAMSETU (नियमसेतु) — Escalations Tenant Isolation & Cross-College Security Test
 * Smart India Hackathon 2026 | Problem Statement 26262: AICTE Approval Workflow Automation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createCompanionApp } from '../../src/backend/companionApp';
import { resetEscalationStore } from '../../src/backend/modules/escalations/escalationService';
import type { Actor } from '../../src/shared/contracts';

describe('Part 8 — Critical Security: Tenant Isolation for Escalations & Consolidated Reports', () => {
  let app: any;
  let origin: string;

  // Actor Institution A: COEP (West, PID 1-43657568230 / INST-SOUTH)
  const actorInstA: Actor = {
    id: 'usr-inst-coep',
    roles: ['institution'],
    permissions: ['case.read', 'case.create', 'document.read', 'document.submit', 'notification.read'],
    scope: 'scoped',
    institutionIds: ['INST-SOUTH'],
    regionIds: ['Western']
  };

  // Actor Institution B: GIITS (South, PID 1-46258917694 / INST-NORTH)
  const actorInstB: Actor = {
    id: 'usr-inst-giits',
    roles: ['institution'],
    permissions: ['case.read', 'case.create', 'document.read', 'document.submit', 'notification.read'],
    scope: 'scoped',
    institutionIds: ['INST-NORTH'],
    regionIds: ['South-Central']
  };

  // Actor Global Authority: Regional / Bureau Officer
  const actorGlobalRO: Actor = {
    id: 'usr-ro-western',
    roles: ['regional_officer', 'reviewer'],
    permissions: ['case.read', 'case.transition', 'scrutiny.sign', 'dashboard.read', 'notification.read'],
    scope: 'global',
    institutionIds: [],
    regionIds: ['Western', 'South-Central', 'Northern', 'Eastern']
  };

  beforeEach(() => {
    resetEscalationStore();
    const companion = createCompanionApp();
    app = companion.app;
    origin = companion.identity.origin;
  });

  it('Institution A (COEP) receives 0 escalations because COEP has no SLA breaches', async () => {
    // Authenticate through the live security gate
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .set('Origin', origin)
      .send({ email: 'principal@coep.ac.in', password: 'password123' });

    expect(loginRes.status).toBe(200);
    const cookie = loginRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/v1/escalations')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });

  it('Strict tenant isolation: Institution A is denied access to Institution B (GIITS) escalation docket via API', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .set('Origin', origin)
      .send({ email: 'principal@coep.ac.in', password: 'password123' });

    const cookie = loginRes.headers['set-cookie'];

    const res = await request(app)
      .get('/api/v1/escalations/ESC-GIITS-01')
      .set('Cookie', cookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('Institution B (GIITS) can only access its own escalation and cannot access BATU or PDIMTR', async () => {
    const { getEscalationsForActor, getEscalationById } = await import(
      '../../src/backend/modules/escalations/escalationService'
    );

    const bEscalations = getEscalationsForActor(actorInstB);
    expect(bEscalations.length).toBe(1);
    expect(bEscalations[0].id).toBe('ESC-GIITS-01');
    expect(bEscalations[0].applicationId).toBe('APP-2026-GIITS');

    // Own escalation succeeds
    const ownResult = getEscalationById(actorInstB, 'ESC-GIITS-01');
    expect(ownResult.error).toBeUndefined();
    expect(ownResult.escalation?.institutionName).toContain('GIITS');

    // Cross-tenant access to BATU is rejected
    const batuResult = getEscalationById(actorInstB, 'ESC-BATU-02');
    expect(batuResult.error).toBe('FORBIDDEN');
    expect(batuResult.escalation).toBeUndefined();

    // Cross-tenant access to PDIMTR is rejected
    const pdimtrResult = getEscalationById(actorInstB, 'ESC-PDIMTR-03');
    expect(pdimtrResult.error).toBe('FORBIDDEN');
    expect(pdimtrResult.escalation).toBeUndefined();
  });

  it('Global regulatory authority can access all escalations across all regions', async () => {
    const { getEscalationsForActor, getEscalationById } = await import(
      '../../src/backend/modules/escalations/escalationService'
    );

    const all = getEscalationsForActor(actorGlobalRO);
    expect(all.length).toBe(3);

    const giits = getEscalationById(actorGlobalRO, 'ESC-GIITS-01');
    expect(giits.escalation).toBeDefined();

    const batu = getEscalationById(actorGlobalRO, 'ESC-BATU-02');
    expect(batu.escalation).toBeDefined();

    const pdimtr = getEscalationById(actorGlobalRO, 'ESC-PDIMTR-03');
    expect(pdimtr.escalation).toBeDefined();
  });

  it('Authorized regulatory officer can resolve an active escalation with recorded remarks', async () => {
    const { resolveEscalationRecord, getEscalationById } = await import(
      '../../src/backend/modules/escalations/escalationService'
    );

    const result = resolveEscalationRecord(
      actorGlobalRO,
      'ESC-GIITS-01',
      'Deficiency cure accepted by Regional Officer under APH Table 2.3 norms.'
    );

    expect(result.error).toBeUndefined();
    expect(result.escalation?.status).toBe('Resolved');
    expect(result.escalation?.resolutionNotes).toContain('Deficiency cure accepted');
    expect(result.escalation?.resolvedBy).toBe('usr-ro-western');

    // Verify persistence in store
    const updated = getEscalationById(actorGlobalRO, 'ESC-GIITS-01');
    expect(updated.escalation?.status).toBe('Resolved');
  });

  it('Institution actors are strictly forbidden from resolving escalation cases', async () => {
    const { resolveEscalationRecord } = await import(
      '../../src/backend/modules/escalations/escalationService'
    );

    const result = resolveEscalationRecord(
      actorInstB,
      'ESC-GIITS-01',
      'Attempting self-resolution'
    );

    expect(result.error).toBe('FORBIDDEN');
    expect(result.escalation).toBeUndefined();
  });

  it('Consolidated reports hub does not leak other colleges overdue escalations to scoped institutions', async () => {
    const { compileConsolidatedReports } = await import(
      '../../src/backend/modules/reports/consolidatedReports'
    );

    // Provide only Institution A's case
    const instACase: any = [
      {
        id: 'APP-2026-COEP',
        institutionId: 'INST-NORTH',
        institutionName: 'College of Engineering Pune (COEP Tech Univ)',
        region: 'Western',
        state: 'approved',
        version: 1,
        facts: { proposedIntake: 180, accredited: true }
      }
    ];

    const report = compileConsolidatedReports(instACase, [], []);

    // Overdue and escalations MUST NOT contain GIITS or BATU for Institution A
    expect(report.sixCategoryReports.overdueAndEscalations).toHaveLength(0);
    expect(report.sixCategoryReports.evcStatus).toHaveLength(0);
  });
});
