/** SYNTHETIC / MOCK ONLY. Serialized in-memory simulator; no auth or Mongo proof.
 * Never import into runtime source. Fingerprints are supplied test strings, not hashes. */
import type { Actor, Application, AuditEvent, Decision, EVCTask, EventEnvelope, Obligation, Outbox, ScrutinySnapshot } from '../../../src/shared/contracts';
import type { CaseCommandBoundary, CorePort, TransactionContext } from '../../../src/shared/ports';
import cases from '../fixtures/cases.json';
import { actorSchema, applicationSchema } from '../../../src/shared/schemas';
const copy = <T>(value: T): T => structuredClone(value);
export const fakeActor: Actor = actorSchema.parse(cases.actor);
export const fakeCase: Application = applicationSchema.parse(cases.applications[0]);
interface State { application: Application; events: EventEnvelope[]; decisions: Decision[]; obligations: Obligation[]; scrutiny: ScrutinySnapshot[]; evc: EVCTask[]; audits: AuditEvent[]; outbox: Outbox[]; }
export function makeFakeCorePort(seed = fakeCase, actor = fakeActor) {
  const principal = copy(actor);
  let state: State = { application: copy(seed), events: [], decisions: [], obligations: [], scrutiny: [], evc: [], audits: [], outbox: [] };
  const replay = new Map<string, { fingerprint: string; result: unknown }>();
  let queue: Promise<unknown> = Promise.resolve();
  const port: CorePort & { inspect(): State } = {
    inspect: () => copy(state),
    async getActor() { return copy(principal); },
    async getApplication(id) { if (id !== state.application.id) throw Error('NOT_FOUND'); return copy(state.application); },
    async getRouteExplanation(id) { return (await port.getApplication(id)).route; },
    async withCaseTransaction<T>(caseId: string, command: CaseCommandBoundary, work: (tx: TransactionContext) => Promise<T>): Promise<T> {
      const run = async (): Promise<T> => {
        if (caseId !== state.application.id) throw Error('NOT_FOUND');
        // Minimal fixture identity/scope check, NOT a production authorization service.
        if (command.context.actor.id !== principal.id) throw Error('FORBIDDEN');
        if (principal.scope !== 'global' && (!principal.institutionIds.includes(state.application.institutionId) || !principal.regionIds.includes(state.application.regionId))) throw Error('SCOPE_VIOLATION');
        const key = JSON.stringify([principal.id, caseId, command.operation, command.idempotencyKey]);
        const previous = replay.get(key);
        if (previous) {
          if (previous.fingerprint !== command.requestFingerprint) throw Error('IDEMPOTENCY_CONFLICT');
          return copy(previous.result as T);
        }
        if (state.application.version !== command.expectedVersion) throw Error('VERSION_CONFLICT');
        const staged = copy(state);
        let active = true;
        const check = () => { if (!active) throw Error('MOCK_TRANSACTION_CLOSED'); };
        const insert = <T extends { id: string }>(collection: T[], value: T) => { check(); if (collection.some(v => v.id === value.id)) throw Error('MOCK_DUPLICATE_ID'); collection.push(copy(value)); };
        const tx: TransactionContext = {
          actor: copy(principal), context: copy(command.context), application: copy(staged.application), transactionId: 'MOCK-NOT-A-MONGO-SESSION', mode: 'mock',
          repositories: {
            cases: { async save(value) { check(); if (value.id !== caseId) throw Error('MOCK_CASE_MISMATCH'); staged.application = copy(value); } },
            decisions: { async insert(value) { insert(staged.decisions, value); } },
            obligations: { async insert(value) { check(); if (staged.obligations.some(o => o.decisionEventId === value.decisionEventId && o.conditionKey === value.conditionKey)) throw Error('MOCK_DUPLICATE_CONDITION'); insert(staged.obligations, value); } },
            scrutiny: { async insert(value) { insert(staged.scrutiny, value); } },
            evc: { async save(value) { check(); const i = staged.evc.findIndex(t => t.id === value.id); if (i < 0) staged.evc.push(copy(value)); else staged.evc[i] = copy(value); } },
            audit: { async append(value) { insert(staged.audits, value); } },
            outbox: { async append(value) { check(); if (staged.outbox.some(o => o.eventId === value.eventId)) throw Error('MOCK_DUPLICATE_OUTBOX'); staged.outbox.push(copy(value)); } },
          },
          async emit(event) { insert(staged.events, event); await tx.repositories.outbox.append({ eventId: event.id, event, attempts: 0, status: 'pending' }); },
        };
        try {
          const result = await work(tx);
          const savedResult = copy(result);
          state = staged;
          replay.set(key, { fingerprint: command.requestFingerprint, result: savedResult });
          return copy(result);
        } finally { active = false; }
      };
      const pending = queue.then(run);
      queue = pending.then(() => undefined, () => undefined);
      return pending;
    },
  };
  return port;
}
