import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createCompanionApp } from '../src/backend/companionApp';

describe('Appeals, Hearings & Grievances API (Decoupled Governance Branches)', () => {
  let app: any;

  beforeEach(() => {
    const companion = createCompanionApp();
    app = companion.app;
  });

  it('GET /api/v1/appeals-hearings returns decoupled appeals, hearings, complaints, and summary counts', async () => {
    const res = await request(app).get('/api/v1/appeals-hearings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.appeals)).toBe(true);
    expect(Array.isArray(res.body.data.hearings)).toBe(true);
    expect(Array.isArray(res.body.data.complaints)).toBe(true);
    expect(res.body.data.summary).toBeDefined();
  });

  it('GET /api/v1/appeals-hearings with caseId filters docket to target case', async () => {
    const res = await request(app).get('/api/v1/appeals-hearings?caseId=APP-2026-APEX');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.appeals.every((a: any) => a.caseId === 'APP-2026-APEX')).toBe(true);
  });

  it('POST /api/v1/appeals-hearings/schedule-hearing successfully schedules an SHC hearing', async () => {
    const res = await request(app)
      .post('/api/v1/appeals-hearings/schedule-hearing')
      .send({
        caseId: 'APP-2026-GIITS',
        hearingType: 'SHC',
        committeeMembers: ['Dr. V. K. Paul (Chair)', 'Prof. A. S. Pant', 'Adv. S. K. Hegde'],
        scheduledDate: '2026-11-05',
        hearingMode: 'VIRTUAL',
        venueOrLink: 'https://aicte-hearings.gov.in/room-shc-7'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hearing.id).toMatch(/^HEAR-SHC-/);
    expect(res.body.data.hearing.status).toBe('SCHEDULED');
  });

  it('POST /api/v1/appeals-hearings/schedule-hearing validates mandatory parameters', async () => {
    const res = await request(app)
      .post('/api/v1/appeals-hearings/schedule-hearing')
      .send({
        caseId: 'APP-2026-GIITS'
        // missing scheduledDate
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
  });

  it('POST /api/v1/appeals-hearings/appeals/:id/dispose records SAC disposition order', async () => {
    const res = await request(app)
      .post('/api/v1/appeals-hearings/appeals/HEAR-SAC-APEX-01/dispose')
      .send({
        decision: 'RELIEF_GRANTED',
        remarks: 'Bench examined registered architect floor plan; relief granted under APH §2.24.',
        committeeMembers: ['Hon. Retired High Court Judge', 'Senior Academic Expert']
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.appeal.status).toBe('DECIDED_BY_COUNCIL');
    expect(res.body.data.appeal.recommendation).toBe('RECOMMEND_APPROVAL');
  });

  it('POST /api/v1/appeals-hearings/appeals/:id/dispose returns 404 for nonexistent appeal', async () => {
    const res = await request(app)
      .post('/api/v1/appeals-hearings/appeals/HEAR-SAC-NONEXISTENT/dispose')
      .send({
        decision: 'REJECTION_UPHELD',
        remarks: 'Appeal dismissed.'
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
