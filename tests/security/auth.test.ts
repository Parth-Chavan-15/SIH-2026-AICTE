import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { actor, harness, origin } from './helpers';
import { createIdentity } from '../../src/backend/security/identity';
import bcrypt from 'bcryptjs';
import { inspectSecurityDenials } from '../../src/backend/security/authorization';

async function signIn(h: Awaited<ReturnType<typeof harness>>) {
  const response = await request(h.app).post('/api/v1/auth/login').set('Origin', origin).send({ email: h.account.email, password: h.password });
  expect(response.status).toBe(200);
  return response.headers['set-cookie'][0].split(';')[0] as string;
}
describe('Stage 2 HTTP server security; synthetic memory store, no Mongo persistence proof', () => {
  it('AUTH-01/02: missing, invalid, forged bearer and malformed cookies return 401', async () => {
    const h = await harness();
    for (const headers of [{}, { Authorization: 'Bearer forged' }, { Cookie: 'sih_demo_session=bad' }, { Cookie: `sih_demo_session=${'a'.repeat(64)}` }]) {
      const res = await request(h.app).get('/api/v1/applications').set(headers);
      expect(res.status).toBe(401); expect(res.body.error.code).toBe('UNAUTHENTICATED');
    }
  });
  it('AUTH-03/04: unknown, incorrect and spoofed logins have identical sanitized rejection', async () => {
    const h = await harness();
    const unknown = await request(h.app).post('/api/v1/auth/login').set('Origin', origin).send({ email: 'unknown@demo.invalid', password: h.password });
    const wrong = await request(h.app).post('/api/v1/auth/login').set('Origin', origin).send({ email: h.account.email, password: 'incorrect' });
    const spoof = await request(h.app).post('/api/v1/auth/login').set('Origin', origin).send({ email: h.account.email, password: h.password, actor: actor(), roles: ['demo_authority'] });
    expect(unknown.status).toBe(401); expect(wrong.body).toEqual(unknown.body); expect(spoof.body).toEqual(unknown.body);
    expect(unknown.headers['set-cookie']).toBeUndefined();
  });
  it('issues HttpOnly SameSite cookies without secrets in JSON; me returns only server actor', async () => {
    const h = await harness();
    const res = await request(h.app).post('/api/v1/auth/login').set('Origin', origin).send({ email: h.account.email, password: h.password });
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/); expect(res.headers['set-cookie'][0]).toMatch(/SameSite=Strict/);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(Object.keys(res.body.data).sort()).toEqual(['actor', 'expiresAt']);
    expect(JSON.stringify(res.body)).not.toContain(h.password); expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    const cookie = res.headers['set-cookie'][0].split(';')[0];
    const me = await request(h.app).get('/api/v1/auth/me').set('Cookie', cookie).set('X-Actor-Id', 'SYN-AUTHORITY').set('X-Role', 'demo_authority');
    expect(me.body.data.actor).toEqual(h.account.actor);
  });
  it('expires, rotates and revokes sessions', async () => {
    let time = Date.now(); const h = await harness(actor(), () => time);
    const old = await signIn(h);
    const rotated = await request(h.app).post('/api/v1/auth/login').set('Origin', origin).set('Cookie', old).send({ email: h.account.email, password: h.password });
    const fresh = rotated.headers['set-cookie'][0].split(';')[0];
    expect((await request(h.app).get('/api/v1/auth/me').set('Cookie', old)).status).toBe(401);
    expect((await request(h.app).post('/api/v1/auth/logout').set('Origin', origin).set('Cookie', fresh)).status).toBe(200);
    expect((await request(h.app).get('/api/v1/auth/me').set('Cookie', fresh)).status).toBe(401);
    const expiring = await signIn(h); time += 16 * 60_000;
    expect((await request(h.app).get('/api/v1/auth/me').set('Cookie', expiring)).status).toBe(401);
  });
  it('rejects missing/cross-site Origin on login and mutations including logout', async () => {
    const h = await harness();
    expect((await request(h.app).post('/api/v1/auth/login').send({ email: h.account.email, password: h.password })).status).toBe(403);
    const cookie = await signIn(h);
    for (const value of ['', 'https://attacker.invalid', 'http://localhost:3000.attacker.invalid', 'null']) {
      expect((await request(h.app).post('/api/v1/auth/logout').set('Cookie', cookie).set('Origin', value)).status).toBe(403);
    }
  });
  it('RBAC-01: institution cannot perform officer actions; no mutation occurs', async () => {
    const h = await harness(); const cookie = await signIn(h); const before = structuredClone(h.store);
    const res = await request(h.app).post('/api/v1/applications/SYN-CASE-W/transition').set('Cookie', cookie).set('Origin', origin).send({ targetStage: 'Scrutiny Cleared', role: 'regional_officer' });
    expect(res.status).toBe(403); expect(h.store).toEqual(before);
    expect(inspectSecurityDenials().at(-1)).toMatchObject({ code: 'FORBIDDEN', actorId: h.account.actor.id });
    expect(JSON.stringify(inspectSecurityDenials())).not.toContain(h.password);
  });
  it('RBAC-02/03/06: authorized synthetic record visible; other institutions/regions concealed', async () => {
    const h = await harness(); const cookie = await signIn(h);
    const list = await request(h.app).get('/api/v1/applications').set('Cookie', cookie);
    expect(list.body.data.map((a: { id: string }) => a.id)).toEqual(['SYN-CASE-W']);
    expect((await request(h.app).get('/api/v1/applications/SYN-CASE-W').set('Cookie', cookie)).status).toBe(200);
    for (const id of ['SYN-CASE-OTHER', 'SYN-CASE-N']) expect((await request(h.app).get(`/api/v1/applications/${id}`).set('Cookie', cookie)).status).toBe(404);
    expect((await request(h.app).get('/api/v1/applications?region=Northern').set('Cookie', cookie)).status).toBe(403);
    expect((await request(h.app).get('/api/v1/applications?region[$ne]=Western').set('Cookie', cookie)).status).toBe(422);
  });
  it('RBAC-04: cross-scope officer mutation and institution intake denied', async () => {
    const officer = { ...actor('SYN-OFFICER'), roles: ['regional_officer'] as const, permissions: [...actor().permissions, 'case.transition' as const] };
    const h = await harness({ ...officer, roles: [...officer.roles] }); const cookie = await signIn(h);
    expect((await request(h.app).post('/api/v1/applications/SYN-CASE-N/transition').set('Cookie', cookie).set('Origin', origin).send({ targetStage: 'Scrutiny Cleared' })).status).toBe(404);
    expect((await request(h.app).post('/api/v1/applications').set('Cookie', cookie).set('Origin', origin).send({ institutionCode: 'SYN-INST-N', region: 'Northern' })).status).toBe(403);
    expect(h.store.applications).toHaveLength(3);
  });
  it('RBAC-05: officer and policy administrator do not gain demo decision authority', async () => {
    for (const role of ['regional_officer', 'policy_admin'] as const) {
      const h = await harness({ ...actor('SYN-PRIVILEGED'), roles: [role], scope: 'global', permissions: ['case.read', 'case.transition', 'decision.record'] });
      const cookie = await signIn(h);
      expect((await request(h.app).post('/api/v1/applications/SYN-CASE-W/transition').set('Cookie', cookie).set('Origin', origin).send({ targetStage: 'Approval Issued' })).status).toBe(403);
      expect((await request(h.app).post('/api/v1/applications/SYN-CASE-W/decisions').set('Cookie', cookie).set('Origin', origin).send({ outcome: 'approved' })).status).toBe(403);
      expect(h.store.applications[0].currentStage).toBe('Application Submitted');
    }
  });
  it('empty scope denies reads; global scope must be explicitly granted', async () => {
    for (const grants of [{ institutionIds: [], regionIds: ['Western'] }, { institutionIds: ['SYN-INST-W'], regionIds: [] }]) {
      const h = await harness({ ...actor(), ...grants }); const cookie = await signIn(h);
      expect((await request(h.app).get('/api/v1/applications').set('Cookie', cookie)).body.data).toEqual([]);
    }
    const h = await harness({ ...actor(), roles: ['bureau_officer'], scope: 'global', institutionIds: [], regionIds: [] }); const cookie = await signIn(h);
    expect((await request(h.app).get('/api/v1/applications').set('Cookie', cookie)).body.data).toHaveLength(3);
  });
  it('scopes dashboard/audit reads and notification recipient access, including writes', async () => {
    const h = await harness();
    expect((await request(h.app).get('/api/v1/dashboard/summary')).status).toBe(401);
    const cookie = await signIn(h);
    expect((await request(h.app).get('/api/v1/dashboard/summary').set('Cookie', cookie)).body.data.totalApplications).toBe(1);
    expect((await request(h.app).get('/api/v1/audit-logs').set('Cookie', cookie)).body.data).toHaveLength(1);
    expect((await request(h.app).get('/api/v1/notifications').set('Cookie', cookie)).body.data.map((n: { id: string }) => n.id)).toEqual(['SYN-NOTIF-OWN']);
    for (const id of ['SYN-NOTIF-OTHER', 'SYN-NOTIF-CROSS', 'SYN-NOTIF-LEGACY']) expect((await request(h.app).patch(`/api/v1/notifications/${id}/read`).set('Cookie', cookie).set('Origin', origin)).status).toBe(404);
    expect((await request(h.app).patch('/api/v1/notifications/SYN-NOTIF-OWN/read').set('Cookie', cookie).set('Origin', origin)).status).toBe(200);
  });
  it('requires permissions even with global scope; no implicit role permission grants', async () => {
    const h = await harness({ ...actor(), scope: 'global', roles: ['bureau_officer'], permissions: [] }); const cookie = await signIn(h);
    expect((await request(h.app).get('/api/v1/applications').set('Cookie', cookie)).status).toBe(403);
    expect((await request(h.app).get('/api/v1/dashboard/summary').set('Cookie', cookie)).status).toBe(403);
  });
  it('does not expose unlinked audit rows when a visible legacy record lacks a reference', async () => {
    const h = await harness(); const cookie = await signIn(h);
    delete (h.store.applications[0] as Partial<typeof h.store.applications[0]>).applicationNumber;
    h.store.auditLogs.push({ id: 'SYN-UNLINKED', applicationId: undefined as never });
    const res = await request(h.app).get('/api/v1/audit-logs').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.map((row: { id: string }) => row.id)).not.toContain('SYN-UNLINKED');
  });
  it('rejects duplicate cookies, inactive accounts and sessions from a previous process', async () => {
    const h = await harness(); const cookie = await signIn(h);
    expect((await request(h.app).get('/api/v1/auth/me').set('Cookie', `${cookie}; ${cookie}`)).status).toBe(401);
    const restarted = createIdentity({ accounts: [h.account], secure: false });
    expect(() => restarted.authenticate(cookie)).toThrow('Authentication required');
    const inactive = createIdentity({ accounts: [{ ...h.account, active: false }], secure: false });
    await expect(inactive.login({ email: h.account.email, password: h.password }, 'SYN')).rejects.toMatchObject({ code: 'UNAUTHENTICATED', message: 'Invalid credentials' });
  });
  it('rejects bcrypt truncation aliases by UTF-8 byte length', async () => {
    const h = await harness();
    const password = h.password + h.password.slice(0, 24); // 72 random ASCII bytes.
    const service = createIdentity({ accounts: [{ ...h.account, passwordHash: await bcrypt.hash(password, 10) }], secure: false });
    await expect(service.login({ email: h.account.email, password: password + 'extra' }, 'SYN')).rejects.toMatchObject({ code: 'UNAUTHENTICATED' });
    await expect(service.login({ email: h.account.email, password }, 'SYN')).resolves.toHaveProperty('session');
  });
  it('enforces officer-role restriction even if an institution is granted transition permission', async () => {
    const h = await harness({ ...actor(), permissions: ['case.transition'] }); const cookie = await signIn(h);
    expect((await request(h.app).post('/api/v1/applications/SYN-CASE-W/transition').set('Cookie', cookie).set('Origin', origin).send({ action: 'start_scrutiny' })).status).toBe(403);
  });
  it('does not bypass pending workflow guards even for authorized scoped officers', async () => {
    const h = await harness({ ...actor('SYN-REVIEWER'), roles: ['reviewer'], permissions: ['case.transition'] }); const cookie = await signIn(h);
    const before = structuredClone(h.store);
    const res = await request(h.app).post('/api/v1/applications/SYN-CASE-W/transition').set('Cookie', cookie).set('Origin', origin).send({ action: 'start_scrutiny', expectedVersion: 1, idempotencyKey: 'SYN-COMMAND', evidenceVersionIds: [] });
    expect(res.status).toBe(409); expect(h.store).toEqual(before);
  });
  it('rejects non-fictional accounts and unconfigured auth; throttles login attempts', async () => {
    const h = await harness();
    expect(() => createIdentity({ accounts: [{ ...h.account, email: 'real@example.com' }] })).toThrow();
    expect(() => createIdentity({ accounts: [{ ...h.account, actor: { ...h.account.actor, scope: undefined } }] as never })).toThrow();
    expect(createIdentity({ accounts: [h.account], origin: 'https://demo.invalid', secure: true }).cookieOptions.secure).toBe(true);
    const empty = createIdentity({ accounts: [], secure: false });
    await expect(empty.login({ email: 'x@demo.invalid', password: 'x' }, 'SYN')).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' });
    for (let i = 0; i < 10; i++) await request(h.app).post('/api/v1/auth/login').set('Origin', origin).send({ email: h.account.email, password: 'wrong' });
    expect((await request(h.app).post('/api/v1/auth/login').set('Origin', origin).send({ email: h.account.email, password: h.password })).status).toBe(401);
  });
});
export { signIn };
