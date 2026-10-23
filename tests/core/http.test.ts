import { describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import { readFileSync } from 'node:fs';
import { createApiRouter } from '../../src/backend/routes/index.js';
import { harness, origin } from '../security/helpers';
import { context, fakeStorage, selected } from './support';
const intake = { institutionId: 'SYN-INST-W', category: 'increase_intake', session: '2026-27', facts: { program: 'engineering', proposedIntake: 320 }, evidenceVersionIds: [], idempotencyKey: 'SYN-HTTP' };
async function coreHttp(actor = context.actor) {
  const identityFixture = await harness(actor);
  const storage = fakeStorage([selected]);
  const app = express(); app.use(express.json());
  app.use('/api/v1', createApiRouter({ identity: () => identityFixture.identity, storage }));
  const res = await request(app).post('/api/v1/auth/login').set('Origin', origin).send({ email: identityFixture.account.email, password: identityFixture.password });
  return { app, storage, cookie: res.headers['set-cookie'][0].split(';')[0] };
}
describe('Stage 3 actual HTTP guards with MOCK ONLY transactional storage', () => {
  it('creates, reads and replays a stored review case through canonical DTO endpoints', async () => {
    const h = await coreHttp();
    const create = () => request(h.app).post('/api/v1/applications').set('Cookie', h.cookie).set('Origin', origin).send(intake);
    const first = await create(); const retry = await create();
    expect(first.status).toBe(201); expect(retry.body.data).toEqual(first.body.data);
    const app = first.body.data.application;
    expect((await request(h.app).get(`/api/v1/applications/${app.id}`).set('Cookie', h.cookie)).body.data).toEqual(app);
    expect((await request(h.app).get(`/api/v1/applications/${app.id}/explanation`).set('Cookie', h.cookie)).body.data.result).toBe('review_required');
    expect((await request(h.app).get(`/api/v1/applications/${app.id}/history`).set('Cookie', h.cookie)).body.data.items).toHaveLength(1);
    expect((await request(h.app).get('/api/v1/applications').set('Cookie', h.cookie)).body.data.total).toBe(2);
  });
  it('denies spoofed payloads, cross-scope filters, missing auth and illegal final actions', async () => {
    const h = await coreHttp();
    expect((await request(h.app).get('/api/v1/applications')).status).toBe(401);
    expect((await request(h.app).get('/api/v1/applications?region=Northern').set('Cookie', h.cookie)).status).toBe(403);
    expect((await request(h.app).post('/api/v1/applications').set('Cookie', h.cookie).set('Origin', origin).send({ ...intake, actor: context.actor })).status).toBe(422);
    expect((await request(h.app).post('/api/v1/applications').set('Cookie', h.cookie).set('Origin', origin).send({ ...intake, institutionId: 'SYN-NORTH' })).status).toBe(403);
    expect((await request(h.app).post(`/api/v1/applications/${selected.id}/transition`).set('Cookie', h.cookie).set('Origin', origin).send({ expectedVersion: 1, idempotencyKey: 'SYN-A', action: 'approve', evidenceVersionIds: [] })).status).toBe(422);
    expect(h.storage.inspect().audit).toEqual([]);
  });
  it('returns 503 for unavailable storage without any successful memory write', async () => {
    const h = await coreHttp(); h.storage.flags.available = false;
    const before = h.storage.inspect();
    expect((await request(h.app).get('/api/v1/ready')).status).toBe(503);
    expect((await request(h.app).get('/api/v1/applications').set('Cookie', h.cookie)).status).toBe(503);
    expect((await request(h.app).post('/api/v1/applications').set('Cookie', h.cookie).set('Origin', origin).send(intake)).body.error.code).toBe('STORAGE_UNAVAILABLE');
    expect(h.storage.inspect()).toEqual(before);
  });
  it('enforces Origin at the canonical router and refuses an incomplete dashboard contract', async () => {
    const h = await coreHttp();
    for (const badOrigin of ['', 'https://untrusted.invalid']) {
      const req = request(h.app).post('/api/v1/applications').set('Cookie', h.cookie);
      if (badOrigin) req.set('Origin', badOrigin);
      expect((await req.send(intake)).status).toBe(403);
    }
    const dashboard = await request(h.app).get('/api/v1/dashboard/summary').set('Cookie', h.cookie);
    expect(dashboard.status).toBe(503); expect(dashboard.body.success).toBe(false);
    expect(h.storage.inspect().audit).toEqual([]);
  });
  it('denies canonical reads, counts and writes when the authenticated actor lacks permissions', async () => {
    const h = await coreHttp({ ...context.actor, permissions: [] });
    for (const path of ['/applications', `/applications/${selected.id}`, `/applications/${selected.id}/history`, '/audit-logs', '/dashboard/summary', '/notifications']) {
      const res = await request(h.app).get(`/api/v1${path}`).set('Cookie', h.cookie);
      expect(res.status).toBe(403); expect(res.body.error.code).toBe('FORBIDDEN');
    }
    expect((await request(h.app).post('/api/v1/applications').set('Cookie', h.cookie).set('Origin', origin).send(intake)).status).toBe(403);
    expect(h.storage.inspect().audit).toEqual([]);
  });
  it('default router is disconnected and never seeds or selects the old memory router', async () => {
    const app = express(); app.use('/api/v1', createApiRouter());
    expect((await request(app).get('/api/v1/ready')).status).toBe(503);
    const startup = readFileSync('server.ts', 'utf8');
    expect(startup).not.toMatch(/seedMemoryStore|seedAtlas|insertMany/);
    expect(startup).not.toContain('mongodb://127.0.0.1:27017/aicte_workflow');
  });
  it('real default Mongo boundary returns 503 for authenticated create while disconnected', async () => {
    const h = await harness(context.actor); const app = express(); app.use(express.json()); app.use('/api/v1', createApiRouter({ identity: () => h.identity }));
    const login = await request(app).post('/api/v1/auth/login').set('Origin', origin).send({ email: h.account.email, password: h.password });
    const cookie = login.headers['set-cookie'][0].split(';')[0];
    const res = await request(app).post('/api/v1/applications').set('Cookie', cookie).set('Origin', origin).send(intake);
    expect(res.status).toBe(503); expect(res.body.error.code).toBe('STORAGE_UNAVAILABLE');
  });
});
