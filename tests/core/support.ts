/** MOCK ONLY: staged cloned state and serialized test queue; NOT Mongo durability proof. */
import { CoreError, type CaseStorage, type Unit, type Receipt } from '../../src/backend/core/storage';
import { inScope } from '../../src/backend/security/authorization';
import type { Application, AuditEvent, Institution, Outbox, PolicyRevision, Actor, CommandContext } from '../../src/shared/contracts';
import type { TransactionContext, TransactionRepositories } from '../../src/shared/ports';
export const context: CommandContext = { actor: { id: 'SYN-REVIEWER', roles: ['reviewer'], permissions: ['case.create', 'case.read', 'case.transition', 'history.read', 'dashboard.read'], institutionIds: ['SYN-INST-W'], regionIds: ['Western'], scope: 'scoped' }, sessionId: 'SYN-SESSION', requestId: 'SYN-REQUEST', receivedAt: '2026-10-23T09:00:00.000Z' };
export const source = { documentId: 'SYN-SOURCE', title: 'Synthetic reviewed test source', location: 'MOCK ONLY', sourceRevision: 'SYN-1', reviewState: 'reviewed' as const };
export const policy: PolicyRevision = { id: 'SYN-POLICY', policyKey: 'SYN-KEY', revision: 1, session: '2026-27', category: 'increase_intake', source, status: 'approved', effectiveFrom: '2026-01-01T00:00:00.000Z', conditions: {} };
export const selected: Application = { id: 'SYN-CASE', reference: 'SYN-REF', institutionId: 'SYN-INST-W', regionId: 'Western', category: 'increase_intake', session: '2026-27', facts: { program: 'engineering', proposedIntake: 320 }, policyRevisionId: policy.id, state: 'submitted', route: { policyRevisionId: policy.id, session: policy.session, category: policy.category, evaluatedFacts: {}, result: 'selected', stages: ['submitted', 'scrutiny_pending', 'decision_pending'], reasons: ['MOCK ONLY'], sources: [source] }, version: 1, stageEnteredAt: '2026-10-23T09:00:00.000Z', createdAt: '2026-10-23T09:00:00.000Z', updatedAt: '2026-10-23T09:00:00.000Z' };
type State = { cases: Application[]; receipts: Receipt[]; audit: AuditEvent[]; outbox: Outbox[]; institutions: Institution[]; policies: PolicyRevision[] };
export function fakeStorage(initial: Application[] = []) {
  let state: State = { cases: structuredClone(initial), receipts: [], audit: [], outbox: [], institutions: [{ id: 'SYN-INST-W', permanentId: 'SYN-PERM', name: 'Synthetic institution', regionId: 'Western', status: 'active' }], policies: [structuredClone(policy)] };
  let queue: Promise<unknown> = Promise.resolve();
  const flags = { available: true, fail: '' };
  const ready = async () => { if (!flags.available) throw new CoreError('STORAGE_UNAVAILABLE', 'MOCK storage unavailable'); };
  const find = (s: State, actor: Actor, id: string) => s.cases.find(a => a.id === id && inScope(actor, a)) ?? null;
  const storage: CaseStorage & { flags: typeof flags; inspect(): State } = {
    flags, inspect: () => structuredClone(state), ready,
    async get(actor, id) { await ready(); return structuredClone(find(state, actor, id)); },
    async list(actor) { await ready(); return structuredClone(state.cases.filter(a => inScope(actor, a))); },
    async history(actor, id) { await ready(); const visible = state.cases.filter(a => inScope(actor, a) && (!id || a.id === id)).map(a => a.id); return structuredClone(state.audit.filter(a => visible.includes(a.applicationId!))); },
    async transaction<T>(work: (unit: Unit) => Promise<T>): Promise<T> {
      const run = async () => {
        await ready(); const draft = structuredClone(state); let active = true;
        const check = () => { if (!active) throw new CoreError('PRECONDITION_FAILED', 'MOCK context expired'); };
        const unit: Unit = {
          async institution(id) { check(); return draft.institutions.find(i => i.id === id) ?? null; },
          async policy(id) { check(); return draft.policies.find(p => p.id === id) ?? null; },
          async get(actor, id) { check(); return structuredClone(find(draft, actor, id)); },
          async receipt(key) { check(); return structuredClone(draft.receipts.find(r => r.key === key) ?? null); },
          async remember(r) { check(); if (flags.fail === 'receipt') throw Error('MOCK receipt failure'); draft.receipts.push(structuredClone(r)); },
          async insert(a) { check(); if (draft.cases.some(c => c.id === a.id || c.reference === a.reference)) throw new CoreError('IDEMPOTENCY_CONFLICT', 'MOCK duplicate identifier'); draft.cases.push(structuredClone(a)); },
          async save(a, v) { check(); const i = draft.cases.findIndex(c => c.id === a.id && c.version === v); if (i < 0) throw new CoreError('VERSION_CONFLICT', 'MOCK stale version'); draft.cases[i] = structuredClone(a); },
          async audit(a) { check(); if (flags.fail === 'audit') throw Error('MOCK audit failure'); draft.audit.push(structuredClone(a)); },
          async outbox(e) { check(); if (flags.fail === 'outbox') throw Error('MOCK outbox failure'); draft.outbox.push(structuredClone(e)); },
          context(ctx, app) {
            const unavailable = async () => { check(); throw new CoreError('PRECONDITION_FAILED', 'MOCK participant unavailable'); };
            const repositories: TransactionRepositories = { cases: { save: a => unit.save(a, app.version) }, decisions: { insert: unavailable }, obligations: { insert: unavailable }, scrutiny: { insert: unavailable }, evc: { save: unavailable }, audit: { append: a => unit.audit(a) }, outbox: { append: e => unit.outbox(e) } };
            return { context: ctx, actor: ctx.actor, application: structuredClone(app), mode: 'mock', transactionId: 'MOCK-NOT-MONGO', repositories, emit: async e => unit.outbox({ eventId: e.id, event: e, attempts: 0, status: 'pending' }) } satisfies TransactionContext;
          },
        };
        try { const result = await work(unit); state = draft; return structuredClone(result); } finally { active = false; }
      };
      const result = queue.then(run); queue = result.then(() => undefined, () => undefined); return result;
    },
  };
  return storage;
}
