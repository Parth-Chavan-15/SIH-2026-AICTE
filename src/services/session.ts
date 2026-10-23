import type { ApiResult, LoginRequest, SessionResponse } from '../shared/contracts';
import { sessionSchema } from '../shared/schemas';
let current: SessionResponse | undefined;
let revision = 0;
let expiryTimer: ReturnType<typeof setTimeout> | undefined;
function setCurrent(session: SessionResponse | undefined) {
  revision++;
  current = session;
  if (expiryTimer) clearTimeout(expiryTimer);
  if (!session) {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('sih:unauthenticated'));
  } else if (typeof window !== 'undefined') {
    expiryTimer = setTimeout(() => setCurrent(undefined), Math.max(0, Date.parse(session.expiresAt) - Date.now()));
  }
}
export class ApiHttpError extends Error { constructor(public status: number, message: string) { super(message); } }
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
  const body = await response.json() as ApiResult<T>;
  if (started !== revision) throw new ApiHttpError(401, 'Session changed; discard stale response');
  if (!response.ok || body.success !== true) {
    throw new ApiHttpError(response.status, body.success === false ? body.error.message : 'Request failed');
  }
  return body.data;
}
export async function login(credentials: LoginRequest) {
  setCurrent(sessionSchema.parse(await requestJson('/auth/login', { method: 'POST', body: JSON.stringify({ email: credentials.email, password: credentials.password }) })));
  return getSession()!;
}
export async function restoreSession() {
  setCurrent(sessionSchema.parse(await requestJson('/auth/me')));
  return getSession()!;
}
export async function logout() {
  await requestJson('/auth/logout', { method: 'POST' });
  setCurrent(undefined);
}
