import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticate, requirePermission, deny, safeQueryFilter } from '../security/authorization';
import { getIdentity, type Identity } from '../security/identity';
import { ERROR_STATUS } from '../../shared/contracts';
import { CoreError, type CaseStorage } from './storage';
import { createCaseService, type EvidencePrerequisite, type PolicyFactsReader } from './cases';
import mongoose from 'mongoose';
import { createMongoStorage } from '../persistence/mongoCore';
import { createDecisionService, type DecisionEvidenceReader } from './decisions';
import type { DecisionObligationParticipant, ScrutinyPrerequisitePort } from '../../shared/ports';

export function createCoreRouter(options: { storage?: CaseStorage; identity?: () => Identity; scrutiny?: ScrutinyPrerequisitePort; evidence?: EvidencePrerequisite; policyFacts?: PolicyFactsReader; obligations?: DecisionObligationParticipant; decisionEvidence?: DecisionEvidenceReader } = {}) {
  const router = Router();
  const service = createCaseService(options.storage ?? createMongoStorage(), options);
  const decisions = createDecisionService(service.storage, options);
  const identity = options.identity ?? getIdentity;
  const wrap = (fn: (req: Request, res: Response) => Promise<unknown>) => async (req: Request, res: Response) => {
    try { await fn(req, res); } catch (error) {
      if (error instanceof CoreError) res.status(ERROR_STATUS[error.code]).json({ success: false, error: { code: error.code, message: error.message, ...(error.currentVersion ? { currentVersion: error.currentVersion } : {}) } });
      else deny(res, error);
    }
  };
  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.get('/health', (_req, res) => res.json({
    status: 'alive',
    uptimeSeconds: Math.floor(process.uptime()),
    commit: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || 'bc341e6',
    readiness: '/api/v1/ready',
    version: '/api/version'
  }));
  router.get('/version', (_req, res) => res.json({
    status: 'ok',
    version: '2.5.0',
    service: 'niyamsetu-aicte',
    commit: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || 'bc341e6',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  }));
  router.get('/ready', wrap(async (_req, res) => {
    await service.storage.ready();

    const isMongoConfigured = Boolean(process.env.MONGODB_URI && process.env.MONGODB_URI.trim().length > 0);
    const isProduction = process.env.NODE_ENV === 'production';
    const isConnected = mongoose.connection.readyState === 1;

    let pingLatencyMs: number | null = null;
    if (isConnected && mongoose.connection.db) {
      try {
        const start = Date.now();
        await mongoose.connection.db.admin().ping();
        pingLatencyMs = Date.now() - start;
      } catch {
        pingLatencyMs = null;
      }
    }

    const storageInspection = typeof (service.storage as any).inspect === 'function' ? (service.storage as any).inspect() : null;
    const storageMode = isConnected ? 'mongodb' : (storageInspection?.mode === 'database' ? 'mongodb' : 'in-memory-fallback');

    if (isProduction) {
      if (!isMongoConfigured) {
        return res.status(503).json({
          success: false,
          status: 'unhealthy',
          storageMode: 'in-memory-unverified',
          error: {
            code: 'DATABASE_NOT_CONFIGURED',
            message: 'Production service requires MONGODB_URI environment variable on Render'
          },
          data: {
            status: 'unhealthy',
            storageMode: 'in-memory-unverified',
            database: {
              configured: false,
              connected: false,
              readyState: mongoose.connection.readyState
            }
          }
        });
      }

      if (!isConnected || pingLatencyMs === null) {
        return res.status(503).json({
          success: false,
          status: 'unhealthy',
          storageMode: 'mongodb_connection_failed',
          error: {
            code: 'DATABASE_UNAVAILABLE',
            message: 'Configured MongoDB Atlas connection failed ping or network access check'
          },
          data: {
            status: 'unhealthy',
            storageMode: 'mongodb_connection_failed',
            database: {
              configured: true,
              connected: false,
              readyState: mongoose.connection.readyState
            }
          }
        });
      }
    }

    res.json({
      success: true,
      data: {
        status: 'ready',
        storageMode,
        database: {
          configured: isMongoConfigured,
          connected: isConnected,
          readyState: mongoose.connection.readyState,
          dbName: isConnected ? mongoose.connection.name : undefined,
          pingLatencyMs
        },
        uptimeSeconds: Math.floor(process.uptime()),
        commit: process.env.RENDER_GIT_COMMIT || '2beba60'
      }
    });
  }));
  router.post('/auth/login', wrap(async (req, res) => {
    const auth = identity(); auth.verifyOrigin(req.get('origin'));
    const { token, session } = await auth.login(req.body, req.ip ?? 'unknown', req.headers.cookie);
    res.cookie('sih_demo_session', token, auth.cookieOptions).json({ success: true, data: session });
  }));
  router.use(authenticate(identity));
  router.get('/auth/me', wrap(async (req, res) => { const { actor, expiresAt } = identity().authenticate(req.headers.cookie); res.json({ success: true, data: { actor, expiresAt } }); }));
  router.post('/auth/logout', wrap(async (req, res) => { const auth = identity(); auth.logout(req.headers.cookie); const { maxAge: _age, ...cookie } = auth.cookieOptions; res.clearCookie('sih_demo_session', cookie).json({ success: true, data: null }); }));
  router.get('/applications', requirePermission('case.read'), wrap(async (req, res) => {
    const filters = safeQueryFilter(req);
    if (filters.slaStatus) throw new CoreError('VALIDATION_FAILED', 'Legacy SLA filter is not supported by canonical case storage');
    const items = (await service.storage.list(req.actor)).filter(app => (!filters.region || app.regionId === filters.region) && (!filters.currentStage || app.state === filters.currentStage));
    res.json({ success: true, data: { items, total: items.length } });
  }));
  const get = async (req: Request) => { const app = await service.storage.get(req.actor, String(req.params.id)); if (!app) throw new CoreError('NOT_FOUND', 'Case not found'); return app; };
  router.get('/applications/:id', requirePermission('case.read'), wrap(async (req, res) => res.json({ success: true, data: await get(req) })));
  router.get('/applications/:id/explanation', requirePermission('case.read'), wrap(async (req, res) => res.json({ success: true, data: (await get(req)).route })));
  router.post('/applications', requirePermission('case.create'), wrap(async (req, res) => { const data = await service.create(req.commandContext, req.body); res.status(201).json({ success: true, data, eventId: data.eventId }); }));
  router.post('/applications/:id/transition', requirePermission('case.transition'), wrap(async (req, res) => { const data = await service.transition(req.commandContext, String(req.params.id), req.body); res.json({ success: true, data, eventId: data.eventId }); }));
  router.get('/applications/:id/history', requirePermission('history.read'), wrap(async (req, res) => { const app = await get(req); const items = await service.storage.history(req.actor, app.id); res.json({ success: true, data: { items, total: items.length } }); }));
  router.get('/audit-logs', requirePermission('history.read'), wrap(async (req, res) => res.json({ success: true, data: await service.storage.history(req.actor) })));
  router.get('/dashboard/summary', requirePermission('dashboard.read'), wrap(async (req, res) => {
    const filters = safeQueryFilter(req);
    if (filters.slaStatus) throw new CoreError('VALIDATION_FAILED', 'Legacy SLA filter is not supported by canonical case storage');
    // PR0 DashboardSummary also needs durable M2/M3 counts, scope and asOf.
    // Do not return a success payload that violates the shared contract.
    throw new CoreError('STORAGE_UNAVAILABLE', 'Complete dashboard summary adapter not integrated');
  }));
  router.post('/applications/:id/decisions', requirePermission('decision.record'), wrap(async (req, res) => { const data = await decisions.decide(req.commandContext, String(req.params.id), req.body); res.json({ success: true, data, eventId: data.eventId }); }));
  router.use('/applications/:id/decisions', requirePermission('decision.record'));
  router.use('/notifications', requirePermission('notification.read'), (_req, res) => res.status(503).json({ success: false, error: { code: 'STORAGE_UNAVAILABLE', message: 'Durable notification adapter not integrated' } }));
  router.use((_req, res) => res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Endpoint not implemented' } }));
  return router;
}
