import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { quickAccessLogin, login, logout, getSession, restoreSession } from '../../src/services/session';
import { api } from '../../src/services/api';

describe('Isolated Role-Switching Reliability & Session Lifecycle Suite', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const ROLES_TEST_DATA = [
    {
      num: 1,
      name: 'Applicant (COEP)',
      email: 'principal@coep.ac.in',
      actorId: 'usr-inst-coep',
      role: 'institution',
      expectedTab: 'inst-apps',
      institutionIds: ['INST-COEP', 'INST-COEP-WES', 'INST-COEP-PUNE', 'INST-SOUTH'],
    },
    {
      num: 2,
      name: 'Scrutiny Cell',
      email: 'scrutiny.reviewer@aicte.gov.in',
      actorId: 'usr-scrutiny-reviewer',
      role: 'regional_officer', // Maps to reviewer/officer
      expectedTab: 'scrutiny-eval',
      institutionIds: [],
    },
    {
      num: 3,
      name: 'EVC Committee',
      email: 'evc.chair@aicte.gov.in',
      actorId: 'usr-evc-chair',
      role: 'evc_committee',
      expectedTab: 'evc-inspect',
      institutionIds: [],
    },
    {
      num: 4,
      name: 'Regional Desk',
      email: 'ro.western@aicte.gov.in',
      actorId: 'usr-ro-western',
      role: 'regional_officer',
      expectedTab: 'ro-pendency',
      institutionIds: [],
    },
    {
      num: 5,
      name: 'Approval Bureau',
      email: 'bureau.approval@aicte.gov.in',
      actorId: 'usr-bureau-hq',
      role: 'bureau_officer',
      expectedTab: 'ca-decision',
      institutionIds: [],
    },
    {
      num: 6,
      name: 'Policy Admin',
      email: 'admin@aicte.gov.in',
      actorId: 'usr-admin',
      role: 'admin',
      expectedTab: 'admin-policy',
      institutionIds: [],
    },
  ];

  it('1. Switches reliably between all 6 existing roles in one click without premature invalidation', async () => {
    for (const target of ROLES_TEST_DATA) {
      const actor = {
        id: target.actorId,
        roles: target.num === 1 ? ['institution'] : target.num === 2 ? ['reviewer'] : target.num === 3 ? ['evc'] : target.num === 4 ? ['regional_officer', 'reviewer'] : target.num === 5 ? ['bureau_officer', 'demo_authority'] : ['policy_admin'],
        permissions: ['case.read'],
        scope: target.num === 1 ? 'scoped' : 'global',
        institutionIds: target.institutionIds,
        regionIds: ['Western'],
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { actor, expiresAt: '2099-01-01T00:00:00Z' },
        }),
      });
      vi.stubGlobal('fetch', mockFetch);

      // Perform one-click role switch
      const session = await quickAccessLogin(target.email);

      expect(session).toBeDefined();
      expect(session.actor.id).toBe(target.actorId);
      expect(getSession()?.actor.id).toBe(target.actorId);

      // Verify the user profile maps correctly
      const profile = api.getUserProfile();
      expect(profile.id).toBe(target.actorId);
      expect(profile.role).toBe(target.role);
    }
  });

  it('2. Switches between individual technical colleges within Role 1 (Applicant)', async () => {
    const COLLEGES = [
      { id: 'usr-inst-coep', email: 'principal@coep.ac.in', name: 'COEP Technological University, Pune' },
      { id: 'usr-inst-giits', email: 'principal@giits.ac.in', name: 'Gonna Institute of IT & Sciences (GIITS)' },
      { id: 'usr-inst-pdimtr', email: 'principal@pdimtr.ac.in', name: 'Prerna / Univ BDT College (PDIMTR)' },
      { id: 'usr-inst-apex', email: 'principal@apex.ac.in', name: 'Apex Institute of Technology & Management' },
      { id: 'usr-inst-batu', email: 'principal@batu.ac.in', name: 'Dr. Babasaheb Ambedkar Technological University (BATU Lonere)' },
    ];

    for (const college of COLLEGES) {
      const actor = {
        id: college.id,
        roles: ['institution'],
        permissions: ['case.read', 'case.create'],
        scope: 'scoped',
        institutionIds: [college.id.replace('usr-inst-', 'INST-').toUpperCase()],
        regionIds: ['Western'],
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { actor, expiresAt: '2099-01-01T00:00:00Z' },
        }),
      }));

      const session = await quickAccessLogin(college.email);
      expect(session.actor.id).toBe(college.id);

      const profile = api.getUserProfile();
      expect(profile.name).toBe(college.name);
      expect(profile.role).toBe('institution');
    }
  });

  it('3. Guarantees session is NOT prematurely cleared to undefined during in-flight role switch', async () => {
    // Initial state: logged in as COEP
    const initialActor = {
      id: 'usr-inst-coep',
      roles: ['institution'],
      permissions: ['case.read'],
      scope: 'scoped',
      institutionIds: ['INST-COEP'],
      regionIds: ['Western'],
    };

    let completeSwitch!: (v: any) => void;
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { actor: initialActor, expiresAt: '2099-01-01T00:00:00Z' } }),
      })
      .mockImplementationOnce(() => new Promise((resolve) => { completeSwitch = resolve; }));

    vi.stubGlobal('fetch', fetchMock);

    // Initial login
    await login({ email: 'principal@coep.ac.in', password: 'password123' });
    expect(getSession()?.actor.id).toBe('usr-inst-coep');

    // Trigger switch to Role 4 (Regional Desk)
    const switchPromise = quickAccessLogin('ro.western@aicte.gov.in');

    // CRITICAL ASSERTION: While switch request is in flight, existing session MUST NOT be undefined!
    // (If it were undefined, SessionGate would prematurely unmount the application and show the gateway/NSWS screen)
    expect(getSession()).toBeDefined();
    expect(getSession()?.actor.id).toBe('usr-inst-coep');

    // Resolve the switch request with new Regional Officer actor
    const newActor = {
      id: 'usr-ro-western',
      roles: ['regional_officer', 'reviewer'],
      permissions: ['case.read', 'evc.read'],
      scope: 'global',
      institutionIds: [],
      regionIds: ['Western'],
    };
    completeSwitch({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { actor: newActor, expiresAt: '2099-01-01T00:00:00Z' } }),
    });

    const finalSession = await switchPromise;
    expect(finalSession.actor.id).toBe('usr-ro-western');
    expect(getSession()?.actor.id).toBe('usr-ro-western');
  });

  it('4. Handles authentication failure and network failure gracefully without wiping session', async () => {
    const actor = {
      id: 'usr-inst-coep',
      roles: ['institution'],
      permissions: ['case.read'],
      scope: 'scoped',
      institutionIds: ['INST-COEP'],
      regionIds: ['Western'],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { actor, expiresAt: '2099-01-01T00:00:00Z' } }),
    }));

    await login({ email: 'principal@coep.ac.in', password: 'password123' });
    expect(getSession()?.actor.id).toBe('usr-inst-coep');

    // Simulate network error on role switch
    vi.stubGlobal('fetch', vi.fn().mockRejectedValueOnce(new Error('Network disconnected')));

    await expect(quickAccessLogin('invalid-or-offline')).rejects.toThrow('Network disconnected');

    // Session remains preserved; user is NOT ejected to landing page
    expect(getSession()).toBeDefined();
    expect(getSession()?.actor.id).toBe('usr-inst-coep');

    // Simulate 403 Forbidden on role switch
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized role switch' } }),
    }));

    await expect(quickAccessLogin('forbidden-persona')).rejects.toMatchObject({ status: 403 });
    expect(getSession()).toBeDefined();
    expect(getSession()?.actor.id).toBe('usr-inst-coep');
  });

  it('5. Handles session expiry correctly via timer or 401 response', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('window', new EventTarget());

    const actor = {
      id: 'usr-evc-chair',
      roles: ['evc'],
      permissions: ['case.read'],
      scope: 'global',
      institutionIds: [],
      regionIds: [],
    };

    const now = Date.now();
    const expiryTime = new Date(now + 2000).toISOString();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { actor, expiresAt: expiryTime } }),
    }));

    await restoreSession();
    expect(getSession()?.actor.id).toBe('usr-evc-chair');

    const unauthSpy = vi.fn();
    window.addEventListener('sih:unauthenticated', unauthSpy);

    // Fast-forward past expiry time
    vi.advanceTimersByTime(2500);

    // Session must now be expired
    expect(getSession()).toBeUndefined();
    expect(unauthSpy).toHaveBeenCalled();
  });
});
