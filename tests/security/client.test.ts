import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
beforeEach(() => vi.resetModules());
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('Frontend authentication adapter; mocked fetch, no browser integration claim', () => {
  it('surfaces 401 instead of returning local applications or optimistic success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } }) }));
    const { api } = await import('../../src/services/api');
    await expect(api.listCases()).rejects.toThrow('Authentication required');
    await expect(api.intake({institutionId:'SYN-I',category:'increase_intake',session:'2026-27',facts:{program:'engineering',proposedIntake:1},evidenceVersionIds:[],idempotencyKey:'SYN-KEY'})).rejects.toThrow('Authentication required');
    await expect(api.transition('SYN', {action:'start_scrutiny',expectedVersion:1,evidenceVersionIds:[],idempotencyKey:'SYN-KEY'})).rejects.toThrow('Authentication required');
  });
  it('uses verified server actor, not requested UI role, and never persists tokens', async () => {
    const actor = { id: 'SYN-INST', roles: ['institution'], permissions: ['case.read'], scope: 'scoped', institutionIds: ['SYN-I'], regionIds: ['Western'] };
    const fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true, data: { actor, expiresAt: '2099-01-01T00:00:00Z' } }) });
    vi.stubGlobal('fetch', fetch);
    const { login } = await import('../../src/services/session');
    await login({ email: 'sample@demo.invalid', password: 'test-only-not-a-configured-credential' });
    const { api } = await import('../../src/services/api');
    expect(api.getUserProfile('admin').role).toBe('institution');
    expect(fetch.mock.calls[0][1].credentials).toBe('same-origin');
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
  });
  it('returns an empty scoped response without retaining previous records; unavailable domain writes fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true, data: {items:[],total:0} }) }));
    const { api } = await import('../../src/services/api');
    expect(await api.listCases()).toEqual({items:[],total:0});
    expect(await api.getEVCInspections()).toEqual([]);
    await expect(api.verifyDocument('SYN', 'SYN-V', 'Verified', api.getUserProfile())).rejects.toThrow('not integrated');
  });
  it('clears identity on a non-JSON 401 and expires idle browser state', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('window', new EventTarget());
    const actor = { id: 'SYN-INST', roles: ['institution'], permissions: [], scope: 'scoped', institutionIds: [], regionIds: [] };
    const fetch = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true, data: { actor, expiresAt: new Date(Date.now() + 1000).toISOString() } }) });
    vi.stubGlobal('fetch', fetch);
    const session = await import('../../src/services/session');
    await session.restoreSession();
    const expired = vi.fn(); window.addEventListener('sih:unauthenticated', expired);
    vi.advanceTimersByTime(1001);
    expect(session.getSession()).toBeUndefined(); expect(expired).toHaveBeenCalledOnce();
    await session.restoreSession();
    fetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => { throw Error('HTML response'); } });
    await expect(session.requestJson('/applications')).rejects.toMatchObject({ status: 401 });
    expect(session.getSession()).toBeUndefined();
  });
  it('discards responses from an old session without clearing a newly verified session', async () => {
    const actor = { id: 'SYN-INST', roles: ['institution'], permissions: [], scope: 'scoped', institutionIds: [], regionIds: [] };
    let release!: (value: unknown) => void;
    const fetch = vi.fn().mockImplementationOnce(() => new Promise(resolve => { release = resolve; })).mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true, data: { actor, expiresAt: '2099-01-01T00:00:00Z' } }) });
    vi.stubGlobal('fetch', fetch);
    const session = await import('../../src/services/session');
    const stale = session.requestJson('/applications');
    await session.restoreSession();
    release({ status: 401 });
    await expect(stale).rejects.toMatchObject({ status: 401 });
    expect(session.getSession()?.actor.id).toBe('SYN-INST');
    const delayed = new Promise(resolve => { release = resolve; });
    fetch.mockReturnValueOnce(delayed);
    const oldData = session.requestJson('/applications');
    await session.logout();
    release({ ok: true, status: 200, json: async () => ({ success: true, data: ['private old data'] }) });
    await expect(oldData).rejects.toThrow('Session changed');
  });
});
