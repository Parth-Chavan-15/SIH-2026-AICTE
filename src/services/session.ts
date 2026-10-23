import type { ApiError, ApiResult, LoginRequest, SessionResponse } from '../shared/contracts';
import { sessionSchema, errorSchema } from '../shared/schemas';
let current: SessionResponse | undefined;
let revision = 0;
let expiryTimer: ReturnType<typeof setTimeout> | undefined;
function setCurrent(session: SessionResponse | undefined) {
  revision++;
  current = session;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('sih:sessionchanged'));
  if (expiryTimer) clearTimeout(expiryTimer);
  if (!session) {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('sih:unauthenticated'));
  } else if (typeof window !== 'undefined') {
    expiryTimer = setTimeout(() => setCurrent(undefined), Math.max(0, Date.parse(session.expiresAt) - Date.now()));
  }
}
export class ApiHttpError extends Error { constructor(public status: number, message: string, public details?: ApiError) { super(message); } }
export function getSession() {
  if (current && Date.parse(current.expiresAt) <= Date.now()) setCurrent(undefined);
  return current ? structuredClone(current) : undefined;
}
export async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const started = revision;
  const response = await fetch(`/api/v1${path}`, { ...init, credentials: 'same-origin', headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers } });
  // Status is authoritative even when a proxy returns HTML or an empty error body.
  if (response.status === 401) {
    if (started === revision) setCurrent(undefined);
    throw new ApiHttpError(401, 'Authentication required');
  }
  let body: ApiResult<T>;
  try { body = await response.json() as ApiResult<T>; } catch {
    if (started !== revision) throw new ApiHttpError(401, 'Session changed; discard stale response');
    throw new ApiHttpError(response.ok ? 503 : response.status, 'Service returned an invalid response');
  }
  if (started !== revision) throw new ApiHttpError(401, 'Session changed; discard stale response');
  if (!body || typeof body !== 'object' || typeof body.success !== 'boolean' || (body.success === false && !errorSchema.safeParse(body.error).success)) throw new ApiHttpError(response.ok ? 503 : response.status, 'Service returned an invalid response');
  if (!response.ok || body.success !== true) {
    throw new ApiHttpError(response.status, body.success === false ? body.error.message : 'Request failed', body.success === false ? body.error : undefined);
  }
  return body.data;
}
let authBusy = false;
async function authAction<T>(invalidate: boolean, work: () => Promise<T>): Promise<T> {
  if (authBusy) throw new ApiHttpError(409, 'A session action is already in progress');
  authBusy = true;
  if (invalidate) setCurrent(undefined);
  try { return await work(); } finally { authBusy = false; }
}
export async function login(credentials: LoginRequest) {
  return authAction(true, async () => {
    setCurrent(sessionSchema.parse(await requestJson('/auth/login', { method: 'POST', body: JSON.stringify({ email: credentials.email, password: credentials.password }) })));
    return getSession()!;
  });
}
let restoration: Promise<SessionResponse> | undefined;
export function restoreSession() {
  if (restoration) return restoration;
  restoration = authAction(false, async () => {
    setCurrent(sessionSchema.parse(await requestJson('/auth/me')));
    return getSession()!;
  }).finally(() => { restoration = undefined; });
  return restoration;
}
export async function logout() {
  return authAction(true, async () => { await requestJson('/auth/logout', { method: 'POST' }); });
}

export const getSessionRevision = () => revision;
