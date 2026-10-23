import { describe, expect, it } from 'vitest';
import { CONTRACT_VERSION, type DecisionCommand, type EventEnvelope, type Obligation } from '../../src/shared/contracts';
import type { CaseCommandBoundary, CorePort, DecisionObligationParticipant, ScrutinyPrerequisitePort, TransactionContext, TimerPort } from '../../src/shared/ports';
import { obligationSchema } from '../../src/shared/schemas';
import { fakeActor, fakeCase, makeFakeCorePort } from './support/mockCore';
import { fakeDecisionEvent, makeFakeDecisionParticipant } from './support/mockDecision';
import fixtures from './fixtures/events.json';

const boundary = (key = 'SYN-KEY', fingerprint = 'SYN-PAYLOAD'): CaseCommandBoundary => ({ expectedVersion: 1, idempotencyKey: key, operation: 'SYN-OP', requestFingerprint: fingerprint, context: { actor: structuredClone(fakeActor), sessionId: 'SYN-SESSION', requestId: 'SYN-REQUEST', receivedAt: '2026-10-23T09:00:00.000Z' } });
const event: EventEnvelope<'CaseSubmitted'> = { contractVersion: CONTRACT_VERSION, id: 'SYN-EVENT', type: 'CaseSubmitted', actorId: fakeActor.id, requestId: 'SYN-REQUEST', occurredAt: '2026-10-23T09:00:00.000Z', applicationId: fakeCase.id, caseVersion: 2, payload: { caseId: fakeCase.id } };
async function stagedWrite(tx: TransactionContext) {
  await tx.repositories.cases.save({ ...tx.application, version: 2 });
  await tx.emit(event);
  return { eventId: event.id };
}
describe('MOCK ONLY proposed port consumers - no MongoDB atomicity proof', () => {
  it('M2 imports core and transaction-aware prerequisite interfaces', async () => {
    const core: CorePort = makeFakeCorePort();
    // Fixed answers only; actual scrutiny/EVC rules belong to M2.
    const prerequisites: ScrutinyPrerequisitePort = {
      async assertScrutinyComplete(tx) { return { allowed: true, prerequisiteEventIds: [tx.application.id] }; },
      async assertEVCEligible() { return { allowed: false, failedRule: 'MOCK_UNRESOLVED_ROUTE', reason: 'Synthetic blocked fixture' }; },
      async assertEVCComplete() { return { allowed: true, prerequisiteEventIds: ['SYN-REPORT'] }; },
    };
    await core.withCaseTransaction(fakeCase.id, boundary(), async tx => {
      expect((await prerequisites.assertScrutinyComplete(tx)).allowed).toBe(true);
      expect((await prerequisites.assertEVCEligible(tx)).allowed).toBe(false);
      expect((await prerequisites.assertEVCComplete(tx)).allowed).toBe(true);
    });
  });
  it('M3 imports participant and committed-event consumer; stages supplied fixtures', async () => {
    const core = makeFakeCorePort();
    const obligations: Obligation[] = fixtures.obligations.map(o => obligationSchema.parse(o));
    const participant: DecisionObligationParticipant = makeFakeDecisionParticipant(obligations);
    const command: DecisionCommand = { expectedVersion: 1, idempotencyKey: 'SYN-DECISION', outcome: 'conditional', evidenceVersionIds: ['SYN-V1'], conditions: fakeDecisionEvent.payload.decision.conditions };
    await core.withCaseTransaction(fakeCase.id, boundary(), async tx => {
      await tx.repositories.decisions.insert(fakeDecisionEvent.payload.decision);
      await participant.materialize(tx, command, fakeDecisionEvent.id);
      await tx.repositories.cases.save({ ...tx.application, version: 2 });
      await tx.emit(fakeDecisionEvent);
    });
    const timer: TimerPort = { async consumeCommittedEvent(committed) { expect(committed.type).toBe('DecisionRecorded'); } };
    await timer.consumeCommittedEvent(core.inspect().events[0]);
    expect(core.inspect().obligations).toHaveLength(1);
    expect(core.inspect().outbox).toHaveLength(1);
  });
  it('rolls back supplied participant writes and permits retry after failure', async () => {
    const core = makeFakeCorePort();
    const before = core.inspect();
    const participant = makeFakeDecisionParticipant(fixtures.obligations.map(o => obligationSchema.parse(o)), true);
    await expect(core.withCaseTransaction(fakeCase.id, boundary(), async tx => {
      await stagedWrite(tx);
      await tx.repositories.decisions.insert(fakeDecisionEvent.payload.decision);
      await tx.repositories.audit.append({ id: 'SYN-AUDIT', actorId: fakeActor.id, requestId: 'SYN-REQUEST', action: 'MOCK', occurredAt: event.occurredAt, evidenceVersionIds: [] });
      await participant.materialize(tx, { expectedVersion: 1, idempotencyKey: 'SYN', outcome: 'conditional', evidenceVersionIds: [], conditions: [] }, fakeDecisionEvent.id);
    })).rejects.toThrow('MOCK_PARTICIPANT_FAILURE');
    expect(core.inspect()).toEqual(before);
    await core.withCaseTransaction(fakeCase.id, boundary(), stagedWrite);
    expect(core.inspect().application.version).toBe(2);
  });
  it('replays before stale-version check and rejects changed payload without writes', async () => {
    const core = makeFakeCorePort();
    const first = await core.withCaseTransaction(fakeCase.id, boundary(), stagedWrite);
    const replay = await core.withCaseTransaction(fakeCase.id, boundary(), async () => { throw Error('should not execute'); });
    expect(replay).toEqual(first);
    await expect(core.withCaseTransaction(fakeCase.id, boundary('SYN-KEY', 'CHANGED'), stagedWrite)).rejects.toThrow('IDEMPOTENCY_CONFLICT');
    expect(core.inspect().events).toHaveLength(1);
    expect(core.inspect().outbox).toHaveLength(1);
  });
  it('serializes competing mock commands; only one expected version succeeds', async () => {
    const core = makeFakeCorePort();
    const results = await Promise.allSettled([core.withCaseTransaction(fakeCase.id, boundary('A'), stagedWrite), core.withCaseTransaction(fakeCase.id, boundary('B'), stagedWrite)]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.find(r => r.status === 'rejected')).toMatchObject({ reason: new Error('VERSION_CONFLICT') });
    expect(core.inspect().events).toHaveLength(1);
  });
  it('isolates nested fixture data, instances, returned results and closed handles', async () => {
    const a = makeFakeCorePort(); const b = makeFakeCorePort();
    const read = await a.getApplication(fakeCase.id);
    read.route.reviewReasons?.push('MUTATED');
    expect((await b.getApplication(fakeCase.id)).route.reviewReasons).not.toContain('MUTATED');
    expect((await a.getApplication(fakeCase.id)).route.reviewReasons).not.toContain('MUTATED');
    let handle: TransactionContext;
    const result = await a.withCaseTransaction(fakeCase.id, boundary(), async tx => { handle = tx; return stagedWrite(tx); });
    result.eventId = 'MUTATED';
    expect(await a.withCaseTransaction(fakeCase.id, boundary(), stagedWrite)).toEqual({ eventId: event.id });
    await expect(handle!.emit(event)).rejects.toThrow('MOCK_TRANSACTION_CLOSED');
    expect(b.inspect().application.version).toBe(1);
  });
  it('denies wrong fixture scope and enforces supplied obligation uniqueness', async () => {
    const core = makeFakeCorePort(fakeCase, { ...fakeActor, regionIds: [] });
    await expect(core.withCaseTransaction(fakeCase.id, boundary(), stagedWrite)).rejects.toThrow('SCOPE_VIOLATION');
    const other = makeFakeCorePort();
    const ob = obligationSchema.parse(fixtures.obligations[0]);
    await expect(other.withCaseTransaction(fakeCase.id, boundary(), async tx => {
      await tx.repositories.obligations.insert(ob);
      await tx.repositories.obligations.insert({ ...ob, id: 'ANOTHER' });
    })).rejects.toThrow('MOCK_DUPLICATE_CONDITION');
    expect(other.inspect().obligations).toHaveLength(0);
  });
});
