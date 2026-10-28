import express, { Express, Request, Response, NextFunction } from 'express';
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
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'alive',
      uptimeSeconds: Math.floor(process.uptime()),
      commit: process.env.RENDER_GIT_COMMIT || '2beba60',
      readiness: '/api/v1/ready'
    });
  });

  // Authentication Middleware for /api/v1 companion routes
  const authMiddleware = authenticate(identityProvider);
  app.use('/api/v1', (req: Request, res: Response, next: NextFunction) => {
    const publicPrefixes = [
      '/health',
      '/ready',
      '/auth/login',
      '/timers/',
      '/alerts',
      '/demo/reset',
      '/adapter/',
      '/nsws/',
      '/portal-import/',
      '/allocation',
      '/appeals-hearings',
      '/rules-registry'
    ];
    if (publicPrefixes.some(p => req.path.startsWith(p)) || req.path === '/adapter/status') {
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

  // Companion Demo Reset
  app.post('/api/v1/demo/reset', (_req: Request, res: Response) => {
    storage.reset(getCanonicalSeedState());
    seedComplianceDB(CANONICAL_OBLIGATIONS);
    res.json({
      success: true,
      message: 'Companion demo state reset to canonical seed with 5 real-world college cases'
    });
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
