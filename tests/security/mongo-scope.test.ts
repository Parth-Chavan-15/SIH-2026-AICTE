import express from 'express';
import request from 'supertest';
import { expect, it, vi } from 'vitest';
import { createApiRouter } from '../../src/backend/routes/index.js';
import { harness, origin } from './helpers';

it('MOCK Mongo adapter queries include both grants before reading or mutating; no live DB', async () => {
  const h = await harness();
  const login = await request(h.app).post('/api/v1/auth/login').set('Origin', origin).send({ email: h.account.email, password: h.password });
  const cookie = login.headers['set-cookie'][0].split(';')[0];
  const model = {
    find: vi.fn((_query: unknown) => ({ sort: async () => [h.store.applications[0]] })),
    findOne: vi.fn(async (_query: unknown) => null),
    create: vi.fn(),
  };
  const audit = { find: vi.fn((_query: unknown) => ({ sort: () => ({ limit: async () => [] }) })) };
  const app = express(); app.use(express.json()); app.use('/api/v1', createApiRouter({ identity: () => h.identity, store: h.store, applicationModel: model, auditModel: audit, connected: () => true }));
  expect((await request(app).get('/api/v1/applications?region=Western').set('Cookie', cookie)).status).toBe(200);
  expect(model.find.mock.calls[0][0]).toEqual({ $and: [{ institutionCode: { $in: ['SYN-INST-W'] }, region: { $in: ['Western'] } }, { region: 'Western' }] });
  expect((await request(app).get('/api/v1/applications/SYN-REF-N').set('Cookie', cookie)).status).toBe(404);
  expect(model.findOne.mock.calls[0][0]).toEqual({ $and: [{ institutionCode: { $in: ['SYN-INST-W'] }, region: { $in: ['Western'] } }, { $or: [{ applicationNumber: 'SYN-REF-N' }] }] });
  await request(app).get('/api/v1/audit-logs').set('Cookie', cookie);
  expect(audit.find.mock.calls[0][0]).toEqual({ applicationId: { $in: ['SYN-CASE-W', 'SYN-REF-W'] } });
  expect((await request(app).post('/api/v1/applications').set('Cookie', cookie).set('Origin', origin).send({ institutionCode: 'SYN-INST-N', region: 'Northern' })).status).toBe(403);
  expect(model.create).not.toHaveBeenCalled();
});
