import { describe, expect, it } from 'vitest';
import type { Connection } from 'mongoose';
import { createMongoStorage, REQUIRED_INDEXES } from '../../src/backend/persistence/mongoCore';
import { context, selected } from './support';
import { fixture as policyFixture } from '../policy/support';
import type { TransactionContext } from '../../src/shared/ports';
function mongoDouble() {
  const writes: { kind: string; session: unknown; payload: any }[] = [];
  const flags = { connected: true, replica: true, indexes: true, fail: '', modified: 1, startFailure: false, cleanupFailure: false, receiptCollisions: 0, ambiguousCommit: false, policyIndex: 'valid' };
  const reads: unknown[] = [];
  const queries: { kind: string; filter: any }[] = [];
  const rows: { one: unknown; many: unknown[]; policy: unknown } = { one: { caseData: selected }, many: [], policy: null };
  let state = { writes: [] as typeof writes };
  let nextSession = 0;
  const query = (result: unknown) => ({ session(value: unknown) { reads.push(value); return this; }, lean() { return this; }, sort() { return this; }, async exec() { return result; } });
  const model = (kind: string) => ({
    findOne: (filter: unknown) => { queries.push({ kind, filter }); return query(kind === 'case' ? rows.one : null); }, find: (filter: unknown) => { queries.push({ kind, filter }); return query(kind === 'case' ? rows.many : []); },
    async create(payload: any, options: any) { if (kind === 'receipt' && flags.receiptCollisions-- > 0) throw Object.assign(Error('MOCK duplicate receipt'), { code: 11000, keyPattern: { key: 1 } }); if (flags.fail === kind) throw Error('MOCK write failure'); state.writes.push({ kind, session: options.session, payload }); },
    async updateOne(filter: any, update: any, options: any) { expect(filter['caseData.version']).toBe(1); state.writes.push({ kind: 'cas', session: options.session, payload: update }); return { modifiedCount: flags.modified }; },
  });
  const connection = {
    get readyState() { return flags.connected ? 1 : 0; },
    db: { admin: () => ({ command: async () => flags.replica ? { setName: 'SYN-rs', logicalSessionTimeoutMinutes: 30 } : {} }), collection: (name: string) => ({ listIndexes: () => ({ toArray: async () => flags.indexes ? REQUIRED_INDEXES.filter(([collection]) => collection === name).map(([,key,sparse]) => ({ key: { [key]: 1 }, unique: true, sparse, ...(name === 'policy_revisions' && flags.policyIndex === 'partial' ? { partialFilterExpression: { status: 'approved' } } : {}), ...(name === 'policy_revisions' && flags.policyIndex === 'collation' ? { collation: { locale: 'en' } } : {}) })).filter(() => name !== 'policy_revisions' || flags.policyIndex !== 'missing') : [] }), find: (filter: unknown, options: any) => { queries.push({ kind: name, filter }); reads.push(options.session); return { toArray: async () => { if (flags.fail === 'policy') throw Error('MOCK private policy storage failure'); return []; } }; }, findOne: async (_filter: unknown, options: any) => { reads.push(options.session); return name === 'policy_revisions' ? rows.policy : null; } }) },
    async startSession() {
      if (flags.startFailure) throw Error('private session details');
      const session = { id: ++nextSession, ended: false, async withTransaction<T>(work: () => Promise<T>, options: unknown) { expect(options).toMatchObject({ writeConcern: { w: 'majority' } }); const before = { writes: [...state.writes] }; let result: T; try { result = await work(); } catch (e) { state = before; throw e; } if (flags.ambiguousCommit) throw Object.assign(Error('MOCK lost commit acknowledgement'), { errorLabels: ['UnknownTransactionCommitResult'] }); return result; }, async endSession() { session.ended = true; if (flags.cleanupFailure) throw Error('private cleanup details'); } };
      return session;
    },
  };
  const storage = createMongoStorage({ connection: connection as unknown as Connection, models: { application: model('case'), audit: model('audit'), outbox: model('outbox'), receipt: model('receipt') } });
  return { storage, flags, reads, queries, rows, inspect: () => state.writes };
}
describe('MOCK ONLY Mongo session adapter operations, not real Mongo atomicity', () => {
  it('requires the policy ID index without partial filters or language collation', async () => {
    for (const mode of ['missing', 'partial', 'collation']) {
      const h = mongoDouble(); h.flags.policyIndex = mode;
      await expect(h.storage.ready()).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' });
    }
  });
  it('denies malformed/unapproved pinned policy records and accepts only a verified-shaped record', async () => {
    const h = mongoDouble();
    for (const row of [{ id: 'SYN-PARTIAL' }, { ...policyFixture(), status: 'draft' }, { ...policyFixture(), conditions: {} }]) {
      h.rows.policy = row;
      expect(await h.storage.transaction(unit => unit.policy('SYN-POLICY'))).toBeNull();
    }
    h.rows.policy = policyFixture();
    expect(await h.storage.transaction(unit => unit.policy(policyFixture().id))).toEqual(policyFixture());
  });
  it('aborts rather than accepting a route when a native policy-list read fails', async () => {
    const h = mongoDouble(); h.flags.fail = 'policy';
    await expect(h.storage.transaction(async unit => { await unit.insert(selected); await unit.policies!('2026-27', 'increase_intake'); })).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' });
    expect(h.inspect()).toEqual([]);
  });
  it('rejects disconnected, standalone and missing-index deployments', async () => {
    for (const key of ['connected', 'replica', 'indexes'] as const) { const h = mongoDouble(); h.flags[key] = false; await expect(h.storage.ready()).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' }); }
  });
  it('binds case/audit/outbox/receipt writes to one session and expires participant handles', async () => {
    const h = mongoDouble(); let handle: TransactionContext | undefined;
    await h.storage.transaction(async unit => {
      handle = unit.context(context, selected);
      await unit.institution(selected.institutionId); await unit.policy(selected.policyRevisionId!); await unit.get(context.actor, selected.id); await unit.receipt('SYN-KEY'); await unit.policies!('2026-27', 'increase_intake');
      await unit.save({ ...selected, version: 2 }, 1);
      await unit.audit({ id: 'SYN-AUDIT', applicationId: selected.id, actorId: context.actor.id, requestId: context.requestId, action: 'start_scrutiny', occurredAt: context.receivedAt, caseVersion: 2, evidenceVersionIds: [] });
      await unit.outbox({ eventId: 'SYN-EVENT', attempts: 0, status: 'pending', event: { contractVersion: '0.1.0-proposed', id: 'SYN-EVENT', type: 'CaseSubmitted', actorId: context.actor.id, requestId: context.requestId, occurredAt: context.receivedAt, applicationId: selected.id, caseVersion: 1, payload: { caseId: selected.id } } });
      await unit.remember({ key: 'SYN-KEY', fingerprint: 'SYN-FINGERPRINT', result: { application: selected, eventId: 'SYN-EVENT' } });
    });
    expect(new Set(h.inspect().map(w => w.session)).size).toBe(1);
    expect(h.reads).toHaveLength(5); expect(h.reads.every(s => s === h.inspect()[0].session)).toBe(true);
    expect(h.inspect().map(w => w.kind)).toEqual(['cas', 'audit', 'outbox', 'receipt']);
    expect((h.inspect()[0].session as { ended: boolean }).ended).toBe(true);
    await expect(handle!.repositories.decisions.insert({} as never)).rejects.toThrow('expired');
  });
  it('uses compare-and-swap and propagates rollback/storage failure', async () => {
    const h = mongoDouble(); h.flags.modified = 0;
    await expect(h.storage.transaction(unit => unit.save({ ...selected, version: 2 }, 1))).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
    expect(h.inspect()).toEqual([]);
    h.flags.modified = 1; h.flags.fail = 'audit';
    await expect(h.storage.transaction(async unit => { await unit.insert(selected); await unit.audit({ id: 'SYN-AUDIT', actorId: context.actor.id, requestId: context.requestId, action: 'CaseSubmitted', occurredAt: context.receivedAt, evidenceVersionIds: [] }); })).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' });
    expect(h.inspect()).toEqual([]);
  });
  it('maps unique insert failures without exposing raw database errors', async () => {
    const h = mongoDouble();
    await expect(h.storage.transaction(async () => { throw Object.assign(Error('private server details'), { code: 11000 }); })).rejects.toMatchObject({ code: 'PRECONDITION_FAILED', message: 'Unique identifier conflict' });
  });
  it('retries a receipt uniqueness race using a fresh transaction', async () => {
    const h = mongoDouble(); let calls = 0; h.flags.receiptCollisions = 1;
    const result = await h.storage.transaction(async unit => {
      calls++;
      await unit.remember({ key: 'SYN-KEY', fingerprint: 'SYN-FINGERPRINT', result: { application: selected, eventId: 'SYN-EVENT' } });
      return 'MOCK successful fresh attempt';
    });
    expect(calls).toBe(2); expect(result).toContain('fresh'); expect(h.inspect()).toHaveLength(1);
  });
  it('rejects cross-case participant writes inside the active session and rolls back', async () => {
    const h = mongoDouble();
    await expect(h.storage.transaction(async unit => {
      await unit.save({ ...selected, version: 2 }, 1);
      const tx = unit.context(context, selected);
      await tx.repositories.obligations.insert({ applicationId: 'SYN-OTHER' } as never);
    })).rejects.toMatchObject({ code: 'SCOPE_VIOLATION' });
    expect(h.inspect()).toEqual([]);
  });
  it('preserves registry metadata on updates and projects the selected route', async () => {
    const h = mongoDouble();
    await h.storage.transaction(unit => unit.save({ ...selected, version: 2 }, 1));
    const patch = h.inspect()[0].payload.$set;
    expect(patch).toMatchObject({ routeType: 'Scrutiny Only', caseData: { version: 2 } });
    for (const key of ['institutionName', 'state', 'city', 'submittedAt']) expect(patch).not.toHaveProperty(key);
    await h.storage.transaction(unit => unit.insert(selected));
    expect(h.inspect()[1].payload[0].submittedAt).toEqual(new Date(selected.createdAt));
  });
  it('rejects non-incrementing versions and participant attribution/scope bypasses', async () => {
    const foreign = { contractVersion: '0.1.0-proposed' as const, id: 'SYN-EVENT', type: 'CaseSubmitted' as const, actorId: context.actor.id, requestId: context.requestId, occurredAt: context.receivedAt, applicationId: 'SYN-OTHER', caseVersion: 1, payload: { caseId: 'SYN-OTHER' } };
    const invalid = [
      (tx: TransactionContext) => tx.repositories.cases.save(selected),
      (tx: TransactionContext) => tx.repositories.audit.append({ applicationId: 'SYN-OTHER' } as never),
      (tx: TransactionContext) => tx.repositories.audit.append({ applicationId: selected.id, actorId: 'SYN-FORGED', requestId: context.requestId } as never),
      (tx: TransactionContext) => tx.emit(foreign),
      (tx: TransactionContext) => tx.repositories.outbox.append({ eventId: foreign.id, event: foreign, attempts: 0, status: 'pending' }),
      (tx: TransactionContext) => { tx.application.id = 'SYN-OTHER'; tx.actor.id = 'SYN-FORGED'; tx.context.actor.id = 'SYN-FORGED'; return tx.repositories.cases.save({ ...selected, id: 'SYN-OTHER', version: 2 }); },
    ];
    for (const [index, write] of invalid.entries()) {
      const h = mongoDouble();
      await expect(h.storage.transaction(unit => write(unit.context(context, selected)))).rejects.toMatchObject({ code: index === 0 ? 'VERSION_CONFLICT' : 'SCOPE_VIOLATION' });
      expect(h.inspect()).toEqual([]);
    }
    expect(context.actor.id).toBe('SYN-REVIEWER'); expect(selected.id).toBe('SYN-CASE');
  });
  it('normalizes session creation errors and preserves commit/error despite cleanup failure', async () => {
    const h = mongoDouble(); h.flags.startFailure = true;
    await expect(h.storage.transaction(async () => 'unused')).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' });
    h.flags.startFailure = false; h.flags.cleanupFailure = true;
    await expect(h.storage.transaction(async () => 'acknowledged commit')).resolves.toBe('acknowledged commit');
    h.flags.modified = 0;
    await expect(h.storage.transaction(unit => unit.save({ ...selected, version: 2 }, 1))).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
  });
  it('does not rerun an ambiguous commit or unrelated duplicate-key error', async () => {
    const h = mongoDouble(); h.flags.ambiguousCommit = true; let calls = 0;
    await expect(h.storage.transaction(async unit => { calls++; await unit.insert(selected); })).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' });
    expect(calls).toBe(1); expect(h.inspect()).toHaveLength(1);
    const other = mongoDouble(); calls = 0;
    await expect(other.storage.transaction(async () => { calls++; throw Object.assign(Error('MOCK unrelated key'), { code: 11000, keyPattern: { key: 1 } }); })).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
    expect(calls).toBe(1);
  });
  it('bounds fresh receipt-race retries and returns storage unavailable when exhausted', async () => {
    const h = mongoDouble(); h.flags.receiptCollisions = 10; let calls = 0;
    await expect(h.storage.transaction(async unit => { calls++; await unit.remember({ key: 'SYN-KEY', fingerprint: 'SYN-FINGERPRINT', result: { application: selected, eventId: 'SYN-EVENT' } }); })).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' });
    expect(calls).toBe(3); expect(h.inspect()).toEqual([]);
  });
  it('rejects custom connections without connection-bound models', async () => {
    const connection = { readyState: 1, db: {} } as unknown as Connection;
    await expect(createMongoStorage({ connection }).ready()).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' });
  });
  it('constructs intersection scope filters and excludes unconverted legacy rows', async () => {
    const h = mongoDouble();
    await h.storage.get(context.actor, '__proto__'); await h.storage.list({ ...context.actor, institutionIds: [] });
    expect(h.queries[0].filter).toEqual({ 'caseData.id': '__proto__', 'caseData.institutionId': { $in: context.actor.institutionIds }, 'caseData.regionId': { $in: context.actor.regionIds } });
    expect(h.queries[1].filter).toEqual({ caseData: { $exists: true }, 'caseData.institutionId': { $in: [] }, 'caseData.regionId': { $in: context.actor.regionIds } });
    h.rows.one = null; expect(await h.storage.get(context.actor, 'SYN-LEGACY')).toBeNull();
    h.rows.one = { caseData: { id: 'SYN-PARTIAL' } };
    await expect(h.storage.get(context.actor, 'SYN-PARTIAL')).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' });
    h.rows.many = [{ caseData: null }];
    await expect(h.storage.list(context.actor)).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' });
  });
});
