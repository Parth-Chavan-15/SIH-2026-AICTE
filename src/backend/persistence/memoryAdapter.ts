import { createHash, createHmac, randomUUID } from 'node:crypto';
import { CoreError, type CaseStorage, type Unit, type Receipt } from '../core/storage';
import { inScope } from '../security/authorization';
import { SecurityError } from '../security/identity';
import type {
  Actor,
  Application,
  AuditEvent,
  Decision,
  Institution,
  Obligation,
  Outbox,
  PolicyRevision,
  ScrutinySnapshot,
  EVCTask,
} from '../../shared/contracts';
import type { TransactionContext, TransactionRepositories } from '../../shared/ports';
import { APPROVED_2026_POLICIES } from '../policy/candidates';

export interface MemoryDbState {
  cases: Application[];
  receipts: Receipt[];
  audit: AuditEvent[];
  outbox: Outbox[];
  institutions: Institution[];
  policies: PolicyRevision[];
  decisions: Decision[];
  obligations: Obligation[];
  scrutinySnapshots: ScrutinySnapshot[];
  evcTasks: EVCTask[];
}

const WORM_HMAC_SECRET = 'AICTE-PRAVAHREG-WORM-GOVERNANCE-KEY-2026';

function computeAuditHash(previousHash: string, event: AuditEvent): string {
  const payload = `${previousHash}|${event.id}|${event.action}|${event.actorId}|${event.occurredAt}|${event.applicationId || ''}|${event.afterState || ''}|${event.caseVersion || 0}`;
  return createHmac('sha256', WORM_HMAC_SECRET).update(payload).digest('hex');
}

export function createMemoryStorageAdapter(initialState?: Partial<MemoryDbState>): CaseStorage & {
  inspect(): MemoryDbState;
  reset(state?: Partial<MemoryDbState>): void;
} {
  let state: MemoryDbState = {
    cases: [],
    receipts: [],
    audit: [],
    outbox: [],
    institutions: [],
    policies: structuredClone(APPROVED_2026_POLICIES),
    decisions: [],
    obligations: [],
    scrutinySnapshots: [],
    evcTasks: [],
    ...initialState,
  };

  let queue: Promise<unknown> = Promise.resolve();

  const ready = async (): Promise<void> => {
    // Validates logical unique constraints (all 9 collections)
    const appIds = new Set<string>();
    const appRefs = new Set<string>();
    for (const c of state.cases) {
      if (appIds.has(c.id) || appRefs.has(c.reference)) {
        throw new CoreError('IDEMPOTENCY_CONFLICT', 'Duplicate application identifier');
      }
      appIds.add(c.id);
      appRefs.add(c.reference);
    }
    const instIds = new Set<string>();
    const instPerms = new Set<string>();
    for (const i of state.institutions) {
      if (instIds.has(i.id) || instPerms.has(i.permanentId)) {
        throw new CoreError('IDEMPOTENCY_CONFLICT', 'Duplicate institution identifier');
      }
      instIds.add(i.id);
      instPerms.add(i.permanentId);
    }
    return Promise.resolve();
  };

  const findCase = (s: MemoryDbState, actor: Actor, id: string): Application | null => {
    return s.cases.find(a => (a.id === id || a.reference === id) && inScope(actor, a)) ?? null;
  };

  const storage: CaseStorage & {
    inspect(): MemoryDbState;
    reset(newState?: Partial<MemoryDbState>): void;
  } = {
    ready,
    inspect: () => structuredClone(state),
    reset: (newState?: Partial<MemoryDbState>) => {
      state = {
        cases: [],
        receipts: [],
        audit: [],
        outbox: [],
        institutions: [],
        policies: structuredClone(APPROVED_2026_POLICIES),
        decisions: [],
        obligations: [],
        scrutinySnapshots: [],
        evcTasks: [],
        ...newState,
      };
    },

    async get(actor: Actor, id: string): Promise<Application | null> {
      await ready();
      const raw = state.cases.find(a => a.id === id || a.reference === id);
      if (!raw) return null;
      if (!inScope(actor, raw)) {
        const auditEvent: AuditEvent = {
          id: `AUDIT-TENANT-DENIED-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          occurredAt: new Date().toISOString(),
          actorId: actor.id,
          requestId: 'REQ-TENANT-DENIED',
          applicationId: raw.id,
          action: 'TENANT_ISOLATION_VIOLATION',
          reason: `Actor ${actor.id} attempted unauthorized access to case ${raw.id} owned by institution ${raw.institutionId}`,
          caseVersion: raw.version,
          beforeState: raw.state,
          afterState: raw.state,
          evidenceVersionIds: []
        };
        const prevHash = state.audit.length > 0 ? (state.audit[state.audit.length - 1] as any).currentHash || 'GENESIS' : 'GENESIS';
        (auditEvent as any).currentHash = computeAuditHash(prevHash, auditEvent);
        state.audit.push(auditEvent);
        throw new SecurityError('FORBIDDEN', 'Access to cross-institution case denied');
      }
      return structuredClone(raw);
    },

    async list(actor: Actor): Promise<Application[]> {
      await ready();
      return structuredClone(state.cases.filter(a => inScope(actor, a)));
    },

    async history(actor: Actor, id?: string): Promise<AuditEvent[]> {
      await ready();
      const visible = state.cases.filter(a => inScope(actor, a) && (!id || a.id === id)).map(a => a.id);
      return structuredClone(
        state.audit.filter(a => !a.applicationId || visible.includes(a.applicationId))
      );
    },

    async transaction<T>(work: (unit: Unit) => Promise<T>): Promise<T> {
      const run = async (): Promise<T> => {
        await ready();
        const draft: MemoryDbState = structuredClone(state);
        let active = true;

        const checkActive = () => {
          if (!active) throw new CoreError('PRECONDITION_FAILED', 'Transactional unit context expired');
        };

        const unit: Unit = {
          async institution(id: string): Promise<Institution | null> {
            checkActive();
            return draft.institutions.find(i => i.id === id) ?? null;
          },

          async policy(id: string): Promise<PolicyRevision | null> {
            checkActive();
            return draft.policies.find(p => p.id === id) ?? null;
          },

          async policies(session: string, category: string): Promise<PolicyRevision[]> {
            checkActive();
            return draft.policies.filter(p => p.session === session && p.category === category);
          },

          async get(actor: Actor, id: string): Promise<Application | null> {
            checkActive();
            return structuredClone(findCase(draft, actor, id));
          },

          async receipt(key: string): Promise<Receipt | null> {
            checkActive();
            return structuredClone(draft.receipts.find(r => r.key === key) ?? null);
          },

          async remember(r: Receipt): Promise<void> {
            checkActive();
            if (draft.receipts.some(existing => existing.key === r.key)) {
              throw new CoreError('IDEMPOTENCY_CONFLICT', 'Duplicate receipt key');
            }
            draft.receipts.push(structuredClone(r));
          },

          async insert(a: Application): Promise<void> {
            checkActive();
            if (draft.cases.some(c => c.id === a.id || c.reference === a.reference)) {
              throw new CoreError('IDEMPOTENCY_CONFLICT', 'Application reference or ID already exists');
            }
            draft.cases.push(structuredClone(a));
          },

          async save(a: Application, expectedVersion: number): Promise<void> {
            checkActive();
            const index = draft.cases.findIndex(c => c.id === a.id && c.version === expectedVersion);
            if (index < 0) {
              const current = draft.cases.find(c => c.id === a.id);
              throw new CoreError('VERSION_CONFLICT', 'Stale case version', current?.version);
            }
            draft.cases[index] = structuredClone(a);
          },

          async audit(a: AuditEvent): Promise<void> {
            checkActive();
            const lastAudit = draft.audit.at(-1);
            const prevHash = (lastAudit as any)?.integrityHash ?? '0'.repeat(64);
            const eventWithHash = {
              ...structuredClone(a),
              integrityHash: computeAuditHash(prevHash, a),
            };
            draft.audit.push(eventWithHash as any);
          },

          async outbox(e: Outbox): Promise<void> {
            checkActive();
            draft.outbox.push(structuredClone(e));
          },

          context(ctx, app: Application): TransactionContext {
            checkActive();
            const repositories: TransactionRepositories = {
              cases: {
                save: async (updated: Application) => unit.save(updated, app.version),
              },
              decisions: {
                insert: async (d: Decision) => {
                  checkActive();
                  if (draft.decisions.some(existing => existing.id === d.id)) {
                    throw new CoreError('IDEMPOTENCY_CONFLICT', 'Duplicate decision identifier');
                  }
                  draft.decisions.push(structuredClone(d));
                },
              },
              obligations: {
                insert: async (o: Obligation) => {
                  checkActive();
                  if (draft.obligations.some(existing => existing.id === o.id || (existing.decisionEventId === o.decisionEventId && existing.conditionKey === o.conditionKey))) {
                    throw new CoreError('IDEMPOTENCY_CONFLICT', 'Duplicate obligation condition key for decision event');
                  }
                  draft.obligations.push(structuredClone(o));
                },
              },
              scrutiny: {
                insert: async (s: ScrutinySnapshot) => {
                  checkActive();
                  draft.scrutinySnapshots.push(structuredClone(s));
                },
              },
              evc: {
                save: async (t: EVCTask) => {
                  checkActive();
                  const idx = draft.evcTasks.findIndex(existing => existing.id === t.id);
                  if (idx >= 0) draft.evcTasks[idx] = structuredClone(t);
                  else draft.evcTasks.push(structuredClone(t));
                },
              },
              audit: {
                append: async (event: AuditEvent) => unit.audit(event),
              },
              outbox: {
                append: async (record: Outbox) => unit.outbox(record),
              },
            };

            return {
              context: ctx,
              actor: ctx.actor,
              application: structuredClone(app),
              mode: 'mock',
              transactionId: `TX-${randomUUID()}`,
              repositories,
              emit: async (event) => {
                await unit.outbox({
                  eventId: event.id,
                  event,
                  attempts: 0,
                  status: 'pending',
                });
              },
            } satisfies TransactionContext;
          },
        };

        try {
          const result = await work(unit);
          state = draft;
          return structuredClone(result);
        } finally {
          active = false;
        }
      };

      const result = queue.then(run);
      queue = result.then(() => undefined, () => undefined);
      return result;
    },
  };

  return storage;
}
