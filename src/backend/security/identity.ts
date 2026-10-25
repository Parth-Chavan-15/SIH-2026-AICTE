import { createHash, randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { actorSchema, loginSchema } from '../../shared/schemas';
import type { Actor, SessionResponse } from '../../shared/contracts';

const accountSchema = z.strictObject({
  email: z.string().email().refine(
    v => v.endsWith('.invalid') || v.endsWith('.gov.in') || v.endsWith('.ac.in'),
    'Fictional or official demo domain required'
  ),
  passwordHash: z.string().regex(/^\$2[aby]\$(1[0-4])\$[./A-Za-z0-9]{53}$/),
  actor: actorSchema.refine(a => a.id.startsWith('SYN-') || a.id.startsWith('usr-'), 'Synthetic or demo IDs only'),
  active: z.boolean(),
});
export type DemoAccount = z.infer<typeof accountSchema>;
export const SESSION_COOKIE = 'sih_demo_session';

export class SecurityError extends Error {
  constructor(public code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'SCOPE_VIOLATION' | 'STORAGE_UNAVAILABLE' | 'VALIDATION_FAILED', message: string) {
    super(message);
  }
}

const digest = (value: string) => createHash('sha256').update(value).digest('hex');

// Password hash for 'password123' (bcrypt rounds: 10)
const DEMO_PW_HASH = '$2b$10$OO.zwcqBHyOQCPHZP.l67uXjgSUDOEAMMW9PcyP1EWFsm9PSNby1O';

export const BUILT_IN_DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'principal@coep.ac.in',
    passwordHash: DEMO_PW_HASH,
    active: true,
    actor: {
      id: 'usr-inst-coep',
      roles: ['institution'],
      permissions: ['case.read', 'case.create', 'document.read', 'document.submit', 'scrutiny.correct', 'notification.read'],
      scope: 'scoped',
      institutionIds: ['INST-SOUTH', 'INST-WEST'],
      regionIds: ['WRO', 'Western'],
    },
  },
  {
    email: 'principal@giits.ac.in',
    passwordHash: DEMO_PW_HASH,
    active: true,
    actor: {
      id: 'usr-inst-giits',
      roles: ['institution'],
      permissions: ['case.read', 'case.create', 'document.read', 'document.submit', 'scrutiny.correct', 'notification.read'],
      scope: 'scoped',
      institutionIds: ['INST-NORTH'],
      regionIds: ['SCRO', 'South-Central'],
    },
  },
  {
    email: 'principal@pdimtr.ac.in',
    passwordHash: DEMO_PW_HASH,
    active: true,
    actor: {
      id: 'usr-inst-pdimtr',
      roles: ['institution'],
      permissions: ['case.read', 'case.create', 'document.read', 'document.submit', 'scrutiny.correct', 'notification.read'],
      scope: 'scoped',
      institutionIds: ['INST-WEST'],
      regionIds: ['WRO', 'Western'],
    },
  },
  {
    email: 'principal@evit.ac.in',
    passwordHash: DEMO_PW_HASH,
    active: true,
    actor: {
      id: 'usr-inst-evit',
      roles: ['institution'],
      permissions: ['case.read', 'case.create', 'document.read', 'document.submit', 'scrutiny.correct', 'notification.read'],
      scope: 'scoped',
      institutionIds: ['INST-EAST'],
      regionIds: ['ERO', 'Eastern'],
    },
  },
  {
    email: 'principal@vjti.ac.in',
    passwordHash: DEMO_PW_HASH,
    active: true,
    actor: {
      id: 'usr-inst-vjti',
      roles: ['institution'],
      permissions: ['case.read', 'case.create', 'document.read', 'document.submit', 'scrutiny.correct', 'notification.read'],
      scope: 'scoped',
      institutionIds: ['INST-VJTI'],
      regionIds: ['WRO', 'Western'],
    },
  },
  {
    email: 'principal@apex.ac.in',
    passwordHash: DEMO_PW_HASH,
    active: true,
    actor: {
      id: 'usr-inst-apex',
      roles: ['institution'],
      permissions: ['case.read', 'case.create', 'document.read', 'document.submit', 'scrutiny.correct', 'notification.read'],
      scope: 'scoped',
      institutionIds: ['INST-APEX', 'INST-EAST'],
      regionIds: ['NRO', 'Northern', 'Eastern'],
    },
  },
  {
    email: 'principal@batu.ac.in',
    passwordHash: DEMO_PW_HASH,
    active: true,
    actor: {
      id: 'usr-inst-batu',
      roles: ['institution'],
      permissions: ['case.read', 'case.create', 'document.read', 'document.submit', 'scrutiny.correct', 'notification.read'],
      scope: 'scoped',
      institutionIds: ['INST-BATU', 'INST-VJTI'],
      regionIds: ['WRO', 'Western'],
    },
  },
  {
    email: 'scrutiny.reviewer@aicte.gov.in',
    passwordHash: DEMO_PW_HASH,
    active: true,
    actor: {
      id: 'usr-scrutiny-reviewer',
      roles: ['reviewer'],
      permissions: ['case.read', 'case.transition', 'scrutiny.sign', 'scrutiny.rescrutinize', 'document.read', 'document.review', 'notification.read', 'history.read', 'dashboard.read'],
      scope: 'global',
      institutionIds: [],
      regionIds: ['WRO', 'SCRO', 'Western', 'South-Central'],
    },
  },
  {
    email: 'ro.western@aicte.gov.in',
    passwordHash: DEMO_PW_HASH,
    active: true,
    actor: {
      id: 'usr-ro-western',
      roles: ['regional_officer', 'reviewer'],
      permissions: ['case.read', 'case.transition', 'scrutiny.sign', 'scrutiny.rescrutinize', 'evc.read', 'evc.schedule', 'document.read', 'document.review', 'dashboard.read', 'notification.read', 'history.read'],
      scope: 'global',
      institutionIds: [],
      regionIds: ['WRO', 'SCRO', 'Western', 'South-Central'],
    },
  },
  {
    email: 'evc.chair@aicte.gov.in',
    passwordHash: DEMO_PW_HASH,
    active: true,
    actor: {
      id: 'usr-evc-chair',
      roles: ['evc'],
      permissions: ['case.read', 'evc.read', 'evc.schedule', 'evc.report', 'document.read', 'notification.read', 'dashboard.read', 'history.read'],
      scope: 'global',
      institutionIds: [],
      regionIds: [],
    },
  },
  {
    email: 'bureau.approval@aicte.gov.in',
    passwordHash: DEMO_PW_HASH,
    active: true,
    actor: {
      id: 'usr-bureau-hq',
      roles: ['bureau_officer', 'demo_authority'],
      permissions: ['case.read', 'case.transition', 'decision.record', 'document.read', 'document.review', 'policy.read', 'dashboard.read', 'history.read', 'notification.read'],
      scope: 'global',
      institutionIds: [],
      regionIds: [],
    },
  },
  {
    email: 'admin@aicte.gov.in',
    passwordHash: DEMO_PW_HASH,
    active: true,
    actor: {
      id: 'usr-admin',
      roles: ['policy_admin'],
      permissions: ['case.read', 'policy.read', 'policy.manage', 'history.read', 'dashboard.read', 'notification.read', 'document.read'],
      scope: 'global',
      institutionIds: [],
      regionIds: [],
    },
  },
];

export function createIdentity(options: { accounts: DemoAccount[]; origin?: string; secure?: boolean; now?: () => number; ttlMs?: number }) {
  const accounts = z.array(accountSchema).max(50).parse(options.accounts);
  if (new Set(accounts.map(a => a.email.toLowerCase())).size !== accounts.length || new Set(accounts.map(a => a.actor.id)).size !== accounts.length) {
    throw new Error('Duplicate demo identity configuration');
  }
  const origin = new URL(options.origin ?? 'http://localhost:3000').origin;
  const originUrl = new URL(origin);
  if (originUrl.protocol !== 'https:' && !(originUrl.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(originUrl.hostname))) {
    throw new Error('HTTPS or loopback demo origin required');
  }
  const secure = options.secure ?? (process.env.NODE_ENV === 'production' && origin.startsWith('https://'));
  if (secure && !origin.startsWith('https://')) throw new Error('HTTPS origin required');
  const now = options.now ?? Date.now;
  const ttlMs = options.ttlMs ?? 15 * 60_000;
  const sessions = new Map<string, { actorId: string; expiresAt: number; sessionId: string }>();
  const attempts = new Map<string, { count: number; until: number }>();
  const rounds = accounts.length ? bcrypt.getRounds(accounts[0].passwordHash) : 10;
  if (accounts.some(account => bcrypt.getRounds(account.passwordHash) !== rounds)) throw new Error('Demo hashes must use one consistent work factor');
  const dummyHash = bcrypt.hash(randomBytes(32).toString('hex'), rounds);
  const prune = () => {
    for (const [k, s] of sessions) if (s.expiresAt <= now()) sessions.delete(k);
    for (const [k, a] of attempts) if (a.until <= now()) attempts.delete(k);
  };
  const tokenFrom = (cookie: string | undefined) => {
    const matches = (cookie ?? '').split(';').map(p => p.trim()).filter(p => p.startsWith(`${SESSION_COOKIE}=`));
    if (matches.length !== 1) throw new SecurityError('UNAUTHENTICATED', 'Authentication required');
    const token = matches[0].slice(SESSION_COOKIE.length + 1);
    if (!/^[a-f0-9]{64}$/.test(token)) throw new SecurityError('UNAUTHENTICATED', 'Authentication required');
    return token;
  };
  return {
    origin,
    cookieOptions: { httpOnly: true, sameSite: 'strict' as const, secure, path: '/api/v1', maxAge: ttlMs },
    verifyOrigin(value: string | undefined) {
      if (value !== origin) throw new SecurityError('FORBIDDEN', 'Same-origin request required');
    },
    authenticate(cookie: string | undefined): SessionResponse & { sessionId: string } {
      prune();
      const session = sessions.get(digest(tokenFrom(cookie)));
      const account = session && accounts.find(a => a.actor.id === session.actorId && a.active);
      if (!session || !account) throw new SecurityError('UNAUTHENTICATED', 'Authentication required');
      return { actor: structuredClone(account.actor) as Actor, expiresAt: new Date(session.expiresAt).toISOString(), sessionId: session.sessionId };
    },
    async login(body: unknown, clientKey: string, oldCookie?: string) {
      prune();
      if (!accounts.length) throw new SecurityError('STORAGE_UNAVAILABLE', 'Demo authentication is not configured');
      const parsed = loginSchema.safeParse(body);
      const validInput = parsed.success && Buffer.byteLength(parsed.data.password, 'utf8') <= 72;
      const email = validInput ? parsed.data.email.toLowerCase() : '';
      const key = digest(`${clientKey}_${email}`);
      const limit = attempts.get(key) ?? { count: 0, until: now() + 60_000 };
      if (limit.count >= 200 || attempts.size >= 10_000) throw new SecurityError('UNAUTHENTICATED', 'Invalid credentials');
      attempts.set(key, { ...limit, count: limit.count + 1 });
      const account = accounts.find(a => a.email.toLowerCase() === email && a.active);
      const fallback = await dummyHash;
      const matches = await bcrypt.compare(validInput ? parsed.data.password : '', account?.passwordHash ?? fallback);
      if (!validInput || !account || !matches) throw new SecurityError('UNAUTHENTICATED', 'Invalid credentials');
      attempts.delete(key);
      if (sessions.size >= 1000) throw new SecurityError('STORAGE_UNAVAILABLE', 'Session capacity unavailable');
      if (oldCookie) {
        try {
          sessions.delete(digest(tokenFrom(oldCookie)));
        } catch {
          /* no valid prior session */
        }
      }
      const token = randomBytes(32).toString('hex');
      const expiresAt = now() + ttlMs;
      sessions.set(digest(token), { actorId: account.actor.id, expiresAt, sessionId: randomUUID() });
      return { token, session: { actor: structuredClone(account.actor) as Actor, expiresAt: new Date(expiresAt).toISOString() } };
    },
    logout(cookie: string | undefined) {
      try {
        sessions.delete(digest(tokenFrom(cookie)));
      } catch {
        /* ignore */
      }
    },
  };
}

export type Identity = ReturnType<typeof createIdentity>;
let defaultIdentity: Identity | undefined;
export function getIdentity(): Identity {
  if (!defaultIdentity) {
    let accounts: DemoAccount[] = [];
    if (process.env.DEMO_AUTH_USERS_JSON) {
      try {
        const parsed = JSON.parse(process.env.DEMO_AUTH_USERS_JSON);
        if (Array.isArray(parsed) && parsed.length > 0) {
          accounts = parsed;
        } else {
          accounts = BUILT_IN_DEMO_ACCOUNTS;
        }
      } catch {
        accounts = BUILT_IN_DEMO_ACCOUNTS;
      }
    } else {
      accounts = BUILT_IN_DEMO_ACCOUNTS;
    }
    const configuredOrigin = process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000';
    defaultIdentity = createIdentity({
      accounts,
      origin: configuredOrigin,
      secure: configuredOrigin.startsWith('https://'),
    });
  }
  return defaultIdentity;
}
