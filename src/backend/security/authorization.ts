import type { Request, RequestHandler, Response } from 'express';
import { randomUUID } from 'node:crypto';
import type { Actor, CommandContext, Permission } from '../../shared/contracts';
import { ERROR_STATUS } from '../../shared/contracts';
import { SecurityError, getIdentity, type Identity } from './identity';
declare global { namespace Express { interface Request { actor: Actor; commandContext: CommandContext; } } }
// Bounded, sanitized security telemetry only. Durable append-only audit is Stage 3.
const deniedRequests: { id: string; code: string; actorId?: string; requestId: string; occurredAt: string }[] = [];
export function inspectSecurityDenials() { return structuredClone(deniedRequests); }
export function deny(res: Response, error: unknown) {
  if (error instanceof SecurityError) {
    deniedRequests.push({ id: randomUUID(), code: error.code, actorId: res.locals.actorId, requestId: res.locals.requestId ?? randomUUID(), occurredAt: new Date().toISOString() });
    if (deniedRequests.length > 1000) deniedRequests.shift();
    return res.status(ERROR_STATUS[error.code]).json({ success: false, error: { code: error.code, message: error.message } });
  }
  return res.status(503).json({ success: false, error: { code: 'STORAGE_UNAVAILABLE', message: 'Service unavailable' } });
}
export const authenticate = (identity: () => Identity = getIdentity): RequestHandler => (req, res, next) => {
  try {
    if (req.headers.authorization) throw new SecurityError('UNAUTHENTICATED', 'Authentication required');
    if (!req.headers.cookie?.split(';').some(part => /^sih_demo_session=[a-f0-9]{64}$/.test(part.trim()))) throw new SecurityError('UNAUTHENTICATED', 'Authentication required');
    const service = identity();
    const session = service.authenticate(req.headers.cookie);
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) service.verifyOrigin(req.get('origin'));
    req.actor = session.actor;
    req.commandContext = { actor: session.actor, sessionId: session.sessionId, requestId: randomUUID(), receivedAt: new Date().toISOString() };
    res.locals.actorId = session.actor.id;
    res.locals.requestId = req.commandContext.requestId;
    res.setHeader('Cache-Control', 'no-store');
    next();
  } catch (error) { deny(res, error); }
};
export function assertPermission(actor: Actor | undefined, permission: Permission) {
  if (!actor) throw new SecurityError('UNAUTHENTICATED', 'Authentication required');
  if (!actor.permissions.includes(permission)) throw new SecurityError('FORBIDDEN', 'Permission denied');
  if (permission === 'decision.record' && !actor.roles.includes('demo_authority')) throw new SecurityError('FORBIDDEN', 'Separate demo authority required');
  if (permission === 'case.transition' && actor.roles.every(r => r === 'institution')) throw new SecurityError('FORBIDDEN', 'Officer permission required');
}
export const requirePermission = (permission: Permission): RequestHandler => (req, res, next) => {
  try { assertPermission(req.actor, permission); next(); } catch (error) { deny(res, error); }
};
export function inScope(actor: Actor, record: { institutionId?: unknown; institutionCode?: unknown; regionId?: unknown; region?: unknown }) {
  if (actor.scope === 'global') return true;
  const institution = record.institutionId ?? record.institutionCode;
  const region = record.regionId ?? record.region;
  return typeof institution === 'string' && typeof region === 'string' && actor.institutionIds.includes(institution) && actor.regionIds.includes(region);
}
export function assertScope(actor: Actor, record: Parameters<typeof inScope>[1]) {
  if (!inScope(actor, record)) throw new SecurityError('SCOPE_VIOLATION', 'Record outside authorized scope');
}
export function scopeQuery(actor: Actor): Record<string, unknown> {
  return actor.scope === 'global' ? {} : { institutionCode: { $in: actor.institutionIds }, region: { $in: actor.regionIds } };
}
export function safeQueryFilter(req: Request) {
  const filters: Record<string, string> = {};
  for (const [key, field] of [['region', 'region'], ['stage', 'currentStage'], ['status', 'slaStatus']] as const) {
    const value = req.query[key];
    if (value === undefined || value === 'All') continue;
    if (typeof value !== 'string' || !value.trim() || value.length > 100) throw new SecurityError('VALIDATION_FAILED', 'Invalid query filter');
    if (key === 'region' && req.actor.scope !== 'global' && !req.actor.regionIds.includes(value)) throw new SecurityError('SCOPE_VIOLATION', 'Region outside authorized scope');
    filters[field] = value;
  }
  return filters;
}
