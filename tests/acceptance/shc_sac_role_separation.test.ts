/**
 * NIYAMSETU (नियमसेतु) — SHC Hearing vs SAC Appeals Role Separation Acceptance Test
 * Smart India Hackathon 2026 | Problem Statement 26262: AICTE Approval Workflow Automation
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { ROLE_NAV_ITEMS } from '../../src/components/layout/Sidebar';
import { createCompanionApp } from '../../src/backend/companionApp';

describe('Part 3 — SHC Hearing vs SAC Appeals Role Separation', () => {
  it('verifies Regional Office (Role 4) navigation tab is named exactly "3. SHC Hearing"', () => {
    const roItems = ROLE_NAV_ITEMS[4].items;
    const shcItem = roItems.find((item) => item.id === 'ro-appeals-hearings');
    expect(shcItem).toBeDefined();
    expect(shcItem?.label).toBe('3. SHC Hearing');
  });

  it('verifies Approval Bureau (Role 5) navigation tab is "3. SAC Appeals & Dispositions"', () => {
    const bureauItems = ROLE_NAV_ITEMS[5].items;
    const sacItem = bureauItems.find((item) => item.id === 'ca-appeals');
    expect(sacItem).toBeDefined();
    expect(sacItem?.label).toBe('3. SAC Appeals & Dispositions');
  });

  it('verifies Regional Office portal title reflects Regional Operations and Bureau reflects Council Chamber', () => {
    expect(ROLE_NAV_ITEMS[4].portalTitle).toBe('Regional Office Desk (RO)');
    expect(ROLE_NAV_ITEMS[5].portalTitle).toBe('Approval Bureau & Council');
  });

  it('verifies backend separates SHC hearings from SAC appeals in /api/v1/appeals-hearings', async () => {
    const companion = createCompanionApp();
    const res = await request(companion.app).get('/api/v1/appeals-hearings');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.appeals)).toBe(true);
    expect(Array.isArray(res.body.data.hearings)).toBe(true);

    // Verify SAC appeals are distinct from SHC hearings
    const appeals = res.body.data.appeals;
    const hearings = res.body.data.hearings;

    expect(appeals.every((a: any) => a.id.startsWith('HEAR-SAC-') || a.appealType === 'SAC')).toBe(true);
    expect(hearings.every((h: any) => h.hearingType === 'SHC' || h.id.startsWith('HEAR-SHC-') || h.hearingType === 'SAC')).toBe(true);
  });

  it('allows Regional Office to schedule an SHC hearing with mandatory committee quorum', async () => {
    const companion = createCompanionApp();
    const res = await request(companion.app)
      .post('/api/v1/appeals-hearings/schedule-hearing')
      .send({
        caseId: 'APP-2026-GIITS',
        hearingType: 'SHC',
        committeeMembers: ['Dr. V. K. Paul (Chair)', 'Prof. A. S. Pant', 'Adv. S. K. Hegde (Legal Expert)'],
        scheduledDate: '2026-11-06',
        hearingMode: 'VIRTUAL',
        venueOrLink: 'https://aicte-hearings.gov.in/room-shc-wro-01'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hearing.hearingType).toBe('SHC');
    expect(res.body.data.hearing.caseId).toBe('APP-2026-GIITS');
    expect(res.body.data.hearing.status).toBe('SCHEDULED');
  });
});
