import type { Application as ExpressApp } from 'express';
import { createScrutinyRouter } from './scrutiny/scrutinyRoutes';
import { createEVCRouter } from './evc/evcRoutes';
import type { CorePort } from './scrutiny/ports';

// Export functions required by M1 per INTER_MEMBER_HANDOFF & PLAYBOOK
export {
  assertScrutinyComplete,
  signSnapshot,
  applyScopedCorrections,
  signScrutiny,
  submitCorrection,
  rescrutinize,
  getSnapshots,
  getLatestSnapshot
} from './scrutiny/scrutinyService';

export {
  ensureEligibleEvcTask,
  createEVCTask,
  scheduleEVC,
  submitEVCReport,
  getAllTasks,
  getTasksForCase
} from './evc/evcService';

export { validateCorrections } from './scrutiny/validateCorrections';
export { evcEligible } from './evc/evcEligible';
export { eventBus } from './events/eventBus';

// Contracts & Port types re-export
export * from './scrutiny/contracts';
export * from './scrutiny/ports';
export * from './scrutiny/mockCore';

/**
 * Mount all Member-2 owned routes onto the main Express application under /api/v1 prefix.
 * Called by M1 in server.ts once ready for integration.
 */
export function mountM2Routes(app: ExpressApp, corePort?: CorePort): void {
  const scrutinyRouter = createScrutinyRouter(corePort);
  const evcRouter = createEVCRouter(corePort);

  // Mount per endpointMap.ts paths with /api/v1 prefix
  app.use('/api/v1', scrutinyRouter);
  app.use('/api/v1', evcRouter);
}
