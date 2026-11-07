import type { Actor } from '../shared/contracts';
import { executeSafeDemoReset } from './services/safeDemoResetService';
import express, { Express, Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { createCoreRouter } from './core/router';
import { createMemoryStorageAdapter } from './persistence/memoryAdapter';
import { getCanonicalSeedState, CANONICAL_OBLIGATIONS } from './data/seedCanonicalCases';
import {
  complianceObligationParticipant,
  seedComplianceDB
} from './modules/compliance/complianceService';
import { createComplianceRouter } from './modules/compliance/complianceRoutes';
import { createScrutinyRouter } from './modules/scrutiny/scrutinyRoutes';
import { createEVCRouter } from './modules/evc/evcRoutes';
import { createStorageCorePort } from './modules/scrutiny/corePortAdapter';
import { createAdapterRouter } from './routes/adapterRoutes';
import { createWorkflowRouter } from './routes/workflowRoutes';
import { createArtifactRouter } from './routes/artifactRoutes';
import { createAllocationRouter } from './modules/allocation/allocationRoutes';
import { createNSWSRouter } from './modules/nsws/nswsRoutes';
import { createPortalImportRouter } from './modules/portalImport/portalImportRoutes';
import { createAppealsAndHearingsRouter } from './modules/appealsAndHearings/appealsAndHearingsRoutes';
import { createRulesRegistryRouter } from './modules/rulesRegistry/rulesRegistryRoutes';
import { createDecisionDocumentsRouter } from './modules/decisionDocuments/decisionDocumentsRoutes';
import { getIdentity, type Identity } from './security/identity';
import { authenticate } from './security/authorization';
import type { CaseStorage } from './core/storage';
import { execSync } from 'child_process';

let cachedCommitSha: string | null = null;
export function resolveCommitSha(): string {
  if (cachedCommitSha) return cachedCommitSha;
  if (process.env.RENDER_GIT_COMMIT) {
    cachedCommitSha = process.env.RENDER_GIT_COMMIT;
    return cachedCommitSha;
  }
  if (process.env.GIT_COMMIT) {
    cachedCommitSha = process.env.GIT_COMMIT;
    return cachedCommitSha;
  }
  try {
    cachedCommitSha = execSync('git rev-parse HEAD', { encoding: 'utf-8', timeout: 1000 }).trim();
    return cachedCommitSha;
  } catch {
    cachedCommitSha = 'd806694';
    return cachedCommitSha;
  }
}

export interface CompanionAppInstance {
  app: Express;
  storage: CaseStorage & { inspect(): any; reset(state?: any): void };
  identity: Identity;
}

export function createCompanionApp(options?: {
  storage?: CaseStorage & { inspect(): any; reset(state?: any): void };
  identity?: () => Identity;
}): CompanionAppInstance {
  const app = express();
  const identityService = options?.identity ? options.identity() : getIdentity();
  const identityProvider = () => identityService;

  // Initialize storage seeded with 5 canonical real-world college cases
  const storage = options?.storage ?? createMemoryStorageAdapter(getCanonicalSeedState());

  // Initialize Member 3 compliance state
  seedComplianceDB(CANONICAL_OBLIGATIONS);

  // Standard Express Middleware
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use((_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  // Core Port for Member 2 modules
  const corePort = createStorageCorePort(storage);

  // Public Root Endpoints
  const getVersionPayload = () => ({
    status: 'ok',
    version: '2.5.0',
    service: 'niyamsetu-aicte',
    commit: resolveCommitSha(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'alive',
      uptimeSeconds: Math.floor(process.uptime()),
      commit: resolveCommitSha(),
      readiness: '/api/v1/ready',
      version: '/api/version'
    });
  });

  app.get('/version', (_req: Request, res: Response) => {
    res.json(getVersionPayload());
  });

  app.get('/api/version', (_req: Request, res: Response) => {
    res.json(getVersionPayload());
  });

  app.get('/api/v1/version', (_req: Request, res: Response) => {
    res.json(getVersionPayload());
  });

  // Authentication Middleware for /api/v1 companion routes
  const authMiddleware = authenticate(identityProvider);
  app.use('/api/v1', (req: Request, res: Response, next: NextFunction) => {
    // 1. Unauthenticated public endpoints that must NEVER be intercepted by authMiddleware
    if (
      req.path === '/auth/login' ||
      req.path === '/auth/demo-quick-access' ||
      req.path.startsWith('/auth/quick-access') ||
      req.path === '/health' ||
      req.path === '/ready' ||
      req.path === '/version' ||
      req.path === '/api/version' ||
      req.path.startsWith('/nsws/') ||
      req.path.startsWith('/adapter/')
    ) {
      return next();
    }

    const publicPrefixes = [
      '/timers/',
      '/alerts',
      '/demo/reset',
      '/portal-import/',
      '/allocation',
      '/appeals-hearings',
      '/rules-registry'
    ];
    if (publicPrefixes.some(p => req.path.startsWith(p)) || req.path === '/adapter/status') {
      if (req.headers.cookie || req.headers.authorization) {
        try {
          const authResult = identityProvider().authenticate(req.headers.cookie);
          req.actor = authResult.actor;
          req.commandContext = {
            actor: authResult.actor,
            sessionId: authResult.sessionId,
            requestId: randomUUID(),
            receivedAt: new Date().toISOString()
          };
          res.locals.actorId = authResult.actor.id;
          res.locals.requestId = req.commandContext.requestId;
        } catch {
          // Stale / unauthenticated cookie on public prefix: proceed unauthenticated
        }
      }
      return next();
    }
    return authMiddleware(req, res, next);
  });

  // Upstream Adapter Bridge (Companion Ingestion & Ecosystem Adapters)
  app.use('/api/v1', createAdapterRouter(storage));

  // Companion Workflow & Reporting Engine (Revert, Case Summary, 6-Category Reports, Closure)
  app.use('/api/v1', createWorkflowRouter(storage));

  // Regional Office Desk Allocation Router
  app.use('/api/v1', createAllocationRouter(storage));

  // NSWS Simulation Router
  app.use('/api/v1', createNSWSRouter(storage));

  // Existing AICTE Portal Ingestion Router
  app.use('/api/v1', createPortalImportRouter(storage));

  // Appeals (SAC), Hearings (SHC), & Complaints (PGRC/SCSC) Router
  app.use('/api/v1', createAppealsAndHearingsRouter());

  // Active Rules & Routing Registry (Role 6) Router
  app.use('/api/v1', createRulesRegistryRouter());

  // Decision Documents & Non-Production Digital Signing Router
  app.use('/api/v1', createDecisionDocumentsRouter(storage));

  // Member 2 Scrutiny & EVC Routes
  app.use('/api/v1', createScrutinyRouter(corePort));
  app.use('/api/v1', createEVCRouter(corePort));

  // Member 3 Compliance & Timers Routes
  app.use('/api/v1', createComplianceRouter());

  // Official Vault Artifacts & Proforma
  app.use('/api/v1', createArtifactRouter(storage));

  // Protected Safe Demo Reset Endpoint
  app.post('/api/v1/demo/reset', async (req: Request, res: Response) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const hasResetFlag = process.env.ALLOW_DEMO_RESET === 'true';
    const resetKey = req.headers['x-demo-reset-key'];
    const validKey = process.env.DEMO_RESET_KEY || 'sih-2026-demo-reset';
    const actor = (req as any).actor as Actor | undefined;
    const isAuthorizedRole = actor && (
      (actor.roles as any[])?.includes('admin') ||
      actor.roles?.includes('policy_admin') ||
      (actor.roles as any[])?.includes('superadmin') ||
      actor.roles?.includes('bureau_officer') ||
      actor.roles?.includes('regional_officer')
    );

    const hasKeyAccess = Boolean(resetKey && resetKey === validKey);
    if (!hasKeyAccess && !isAuthorizedRole) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Demo state reset is restricted. Supply a valid X-Demo-Reset-Key header or authenticate with an authorized administrative role.'
        }
      });
    }

    try {
      const result = await executeSafeDemoReset(storage, actor);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (err: any) {
      console.error('[DEMO RESET ERROR]:', err);
      return res.status(500).json({
        success: false,
        error: {
          code: 'RESET_FAILED',
          message: err.message || 'Failed to safely reset demo state'
        }
      });
    }
  });

  // Core Router (includes /health, /ready, /auth/login, /applications, /decisions, etc.)
  const coreRouter = createCoreRouter({
    storage,
    identity: identityProvider,
    obligations: complianceObligationParticipant
  });
  app.use('/api/v1', coreRouter);

  // Global Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.type === 'entity.too.large' ? 413 : err.status === 400 ? 422 : 503;
    const code = status === 413 ? 'FILE_TOO_LARGE' : status === 422 ? 'VALIDATION_FAILED' : 'STORAGE_UNAVAILABLE';
    res.status(status).json({ success: false, error: { code, message: err.message || 'Request could not be processed' } });
  });

  return { app, storage, identity: identityService };
}
