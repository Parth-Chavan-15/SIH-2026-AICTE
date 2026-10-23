import { beforeAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { harness, origin } from './security/helpers';
let h: Awaited<ReturnType<typeof harness>>;
let cookie: string;
beforeAll(async () => {
  h = await harness();
  const res = await request(h.app).post('/api/v1/auth/login').set('Origin', origin).send({ email: h.account.email, password: h.password });
  cookie = res.headers['set-cookie'][0].split(';')[0];
});
describe('Existing workflow HTTP checks with verified synthetic session (memory only)', () => {
  it('health remains public', async () => {
    expect((await request(h.app).get('/api/v1/health')).body.status).toBe('healthy');
  });
  it('application list requires a session and returns scoped applications', async () => {
    const res = await request(h.app).get('/api/v1/applications').set('Cookie', cookie);
    expect(res.status).toBe(200); expect(res.body.data).toHaveLength(1);
  });
  it('dashboard returns permitted record counts', async () => {
    const res = await request(h.app).get('/api/v1/dashboard/summary').set('Cookie', cookie);
    expect(res.status).toBe(200); expect(res.body.data.totalApplications).toBe(1);
  });
  it('creates a scoped fictional application without trusting client identity or route', async () => {
    const res = await request(h.app).post('/api/v1/applications').set('Cookie', cookie).set('Origin', origin).send({ institutionCode:'SYN-INST-W',region:'Western',institutionName:'Synthetic intake fixture', actorId:'SYN-AUTHORITY',currentStage:'Approval Issued',routeType:'Fast-Track EoA' });
    expect(res.status).toBe(201); expect(res.body.data.applicationNumber).toContain('DEMO-');
    expect(res.body.data.currentStage).toBe('Application Submitted'); expect(res.body.data.routeType).toBe('Unreviewed demo route');
  });
  it('does not accept legacy arbitrary transitions from an institution', async () => {
    const res = await request(h.app).post('/api/v1/applications/SYN-CASE-W/transition').set('Cookie', cookie).set('Origin', origin).send({targetStage:'Scrutiny Cleared'});
    expect(res.status).toBe(403); expect(h.store.applications.find(a=>a.id==='SYN-CASE-W')?.currentStage).toBe('Application Submitted');
  });
});
