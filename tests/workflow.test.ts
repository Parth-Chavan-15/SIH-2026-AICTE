import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import apiRouter from '../src/backend/routes/index.js';

const app = express();
app.use(express.json());
app.use('/api/v1', apiRouter);

describe('AICTE Workflow Backend API Tests (SIH 26262)', () => {
  it('GET /api/v1/health should return healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/v1/applications should return list of applications', async () => {
    const res = await request(app).get('/api/v1/applications');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/dashboard/summary should return dashboard metrics', async () => {
    const res = await request(app).get('/api/v1/dashboard/summary');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalApplications');
    expect(res.body.data).toHaveProperty('overdueApplications');
  });

  it('POST /api/v1/applications should create a new application successfully', async () => {
    const newAppPayload = {
      institutionName: 'IIT Bombay Test Campus',
      institutionCode: '1-9988776',
      region: 'Western',
      state: 'Maharashtra',
      city: 'Mumbai',
      applicationType: 'Extension of Approval (EoA)',
      program: 'Engineering & Technology',
      proposedIntake: 900,
      routeType: 'Scrutiny Only',
    };

    const res = await request(app).post('/api/v1/applications').send(newAppPayload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.institutionName).toBe('IIT Bombay Test Campus');
    expect(res.body.data.applicationNumber).toContain('AICTE-2026');
  });

  it('POST /api/v1/applications/:id/transition should transition workflow stage with audit logging', async () => {
    // First get applications list to grab an ID
    const listRes = await request(app).get('/api/v1/applications');
    const targetApp = listRes.body.data[0];

    const transitionRes = await request(app)
      .post(`/api/v1/applications/${targetApp.id}/transition`)
      .send({
        targetStage: 'Scrutiny Cleared',
        reason: 'All technical documents and faculty ratios verified successfully.',
      });

    expect(transitionRes.status).toBe(200);
    expect(transitionRes.body.success).toBe(true);
    expect(transitionRes.body.data.currentStage).toBe('Scrutiny Cleared');
  });
});
