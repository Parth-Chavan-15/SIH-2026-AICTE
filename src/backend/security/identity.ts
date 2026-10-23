import { createHash, randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { actorSchema, loginSchema } from '../../shared/schemas';
import type { Actor, SessionResponse } from '../../shared/contracts';
const accountSchema = z.strictObject({ email: z.email().refine(v => v.endsWith('.invalid'), 'Fictional .invalid accounts only'), passwordHash: z.string().regex(/^\$2[aby]\$(1[0-4])\$[./A-Za-z0-9]{53}$/), actor: actorSchema.refine(a => a.id.startsWith('SYN-'), 'Synthetic IDs only'), active: z.boolean() });
export type DemoAccount = z.infer<typeof accountSchema>;
export const SESSION_COOKIE = 'sih_demo_session';
export class SecurityError extends Error {
  constructor(public code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'SCOPE_VIOLATION' | 'STORAGE_UNAVAILABLE' | 'VALIDATION_FAILED', message: string) { super(message); }
}
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
/** Single-process revocable demo sessions. Restart invalidates sessions; no default users. */
export function createIdentity(options: { accounts: DemoAccount[]; origin?: string; secure?: boolean; now?: () => number; ttlMs?: number }) {
  const accounts = z.array(accountSchema).max(50).parse(options.accounts);
  if (new Set(accounts.map(a => a.email.toLowerCase())).size !== accounts.length || new Set(accounts.map(a => a.actor.id)).size !== accounts.length) throw new Error('Duplicate demo identity configuration');
  const origin = new URL(options.origin ?? 'http://localhost:3000').origin;
  const originUrl = new URL(origin);
  if (originUrl.protocol !== 'https:' && !(originUrl.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(originUrl.hostname))) throw new Error('HTTPS or loopback demo origin required');
  const secure = options.secure ?? process.env.NODE_ENV === 'production';
  if (secure && !origin.startsWith('https://')) throw new Error('HTTPS origin required');
  const now = options.now ?? Date.now;
  const ttlMs = options.ttlMs ?? 15 * 60_000;
  const sessions = new Map<string, { actorId: string; expiresAt: number; sessionId: string }>();
  const attempts = new Map<string, { count: number; until: number }>();
  const rounds = accounts.length ? bcrypt.getRounds(accounts[0].passwordHash) : 10;
  if (accounts.some(account => bcrypt.getRounds(account.passwordHash) !== rounds)) throw new Error('Demo hashes must use one consistent work factor');
  const dummyHash = bcrypt.hash(randomBytes(32).toString('hex'), rounds);
  const prune = () => { for (const [k, s] of sessions) if (s.expiresAt <= now()) sessions.delete(k); for (const [k, a] of attempts) if (a.until <= now()) attempts.delete(k); };
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
    verifyOrigin(value: string | undefined) { if (value !== origin) throw new SecurityError('FORBIDDEN', 'Same-origin request required'); },
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
      const key = digest(clientKey);
      const limit = attempts.get(key) ?? { count: 0, until: now() + 60_000 };
      if (limit.count >= 10 || attempts.size >= 10_000) throw new SecurityError('UNAUTHENTICATED', 'Invalid credentials');
      attempts.set(key, { ...limit, count: limit.count + 1 });
      const account = accounts.find(a => a.email.toLowerCase() === email && a.active);
      const fallback = await dummyHash;
      const matches = await bcrypt.compare(validInput ? parsed.data.password : '', account?.passwordHash ?? fallback);
      if (!validInput || !account || !matches) throw new SecurityError('UNAUTHENTICATED', 'Invalid credentials');
      if (sessions.size >= 1000) throw new SecurityError('STORAGE_UNAVAILABLE', 'Session capacity unavailable');
      if (oldCookie) { try { sessions.delete(digest(tokenFrom(oldCookie))); } catch { /* no valid prior session */ } }
      const token = randomBytes(32).toString('hex');
      const expiresAt = now() + ttlMs;
      sessions.set(digest(token), { actorId: account.actor.id, expiresAt, sessionId: randomUUID() });
      return { token, session: { actor: structuredClone(account.actor) as Actor, expiresAt: new Date(expiresAt).toISOString() } };
    },
    logout(cookie: string | undefined) { sessions.delete(digest(tokenFrom(cookie))); },
  };
}
export type Identity = ReturnType<typeof createIdentity>;
let defaultIdentity: Identity | undefined;
export function getIdentity(): Identity {
  // Lazy initialization after server.ts dotenv. Invalid/missing config never authenticates.
  if (!defaultIdentity) defaultIdentity = createIdentity({ accounts: JSON.parse(process.env.DEMO_AUTH_USERS_JSON ?? '[]'), origin: process.env.CLIENT_URL, secure: process.env.NODE_ENV === 'production' });
  return defaultIdentity;
}
