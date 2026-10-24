import type { Actor, Application, EventEnvelope, ID, Obligation, RouteExplanation } from './contracts';
import type { CorePort, TransactionContext } from './ports';
import type { CaseStorage } from '../../core/storage';

export const SYSTEM_OFFICER_ACTOR: Actor & { scope: 'global' } = {
  id: 'SYN-ACTOR-RO',
  roles: ['regional_officer'],
  permissions: ['scrutiny.sign', 'case.read', 'case.transition', 'evc.read', 'evc.schedule', 'evc.report'],
  scope: 'global',
  institutionIds: ['*'],
  regionIds: ['*']
};

export function createStorageCorePort(storage: CaseStorage, getActorFn?: () => Actor): CorePort {
  return {
    async getActor(): Promise<Actor> {
      return getActorFn ? getActorFn() : SYSTEM_OFFICER_ACTOR;
    },
    async getApplication(caseId: ID): Promise<Application> {
      const app = await storage.get(SYSTEM_OFFICER_ACTOR as any, caseId);
      if (!app) {
        throw new Error(`Application ${caseId} not found`);
      }
      return app as unknown as Application;
    },
    async getRouteExplanation(caseId: ID): Promise<RouteExplanation> {
      const app = await storage.get(SYSTEM_OFFICER_ACTOR as any, caseId);
      if (!app || !app.route) {
        throw new Error(`Route explanation for ${caseId} not found`);
      }
      return app.route as unknown as RouteExplanation;
    },
    async withCaseTransaction<T>(caseId: ID, fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
      return storage.transaction(async (unit) => {
        const app = await storage.get(SYSTEM_OFFICER_ACTOR as any, caseId);
        if (!app) throw new Error(`Application ${caseId} not found`);

        const actor = getActorFn ? getActorFn() : SYSTEM_OFFICER_ACTOR;
        const stagedEvents: EventEnvelope[] = [];

        const tx: TransactionContext = {
          actor,
          application: app as unknown as Application,
          transactionId: `TX-${Date.now()}`,
          emit: (event: EventEnvelope) => {
            stagedEvents.push(event);
            if ((unit as any).audit) {
              (unit as any).audit({
                id: event.id,
                occurredAt: event.occurredAt,
                actorId: event.actorId,
                requestId: 'REQ-TX',
                applicationId: event.applicationId,
                action: event.type,
                reason: event.payload ? JSON.stringify(event.payload) : undefined,
                caseVersion: event.caseVersion,
                beforeState: app.state,
                afterState: (event.payload as any)?.nextState || app.state,
                evidenceVersionIds: []
              });
            }
          },
          saveCase: async (updatedApp: Application) => {
            await unit.save(updatedApp as any, app.version);
          },
          saveObligation: async (obligation: Obligation) => {
            if ((unit as any).repositories?.obligations) {
              await (unit as any).repositories.obligations.insert(obligation);
            }
          }
        };

        return await fn(tx);
      });
    }
  };
}
