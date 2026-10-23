import { describe, expect, it } from 'vitest';
import { createCaseService } from '../../src/backend/core/cases';
import { context, fakeStorage, selected } from './support';
import type { ScrutinyPrerequisitePort, TransactionContext } from '../../src/shared/ports';
const intake = { institutionId: 'SYN-INST-W', category: 'increase_intake', session: '2026-27', facts: { program: 'engineering', proposedIntake: 320 }, evidenceVersionIds: [], idempotencyKey: 'SYN-CREATE' };
const command = { action: 'start_scrutiny', expectedVersion: 1, evidenceVersionIds: ['SYN-VERSION'], idempotencyKey: 'SYN-TRANSITION' };
const goodEvidence = { async assertReferences() { /* fixed positive answer, MOCK ONLY */ } };
const goodPrerequisites: ScrutinyPrerequisitePort = { async assertScrutinyComplete() { return { allowed: true, prerequisiteEventIds: ['SYN-SIGNATURE'] }; }, async assertEVCEligible() { return { allowed: true, prerequisiteEventIds: ['SYN-ELIGIBILITY'] }; }, async assertEVCComplete() { return { allowed: true, prerequisiteEventIds: ['SYN-REPORT'] }; } };
describe('MOCK ONLY Stage 3 service/transaction semantics (no Mongo proof)', () => {
  it('rejects corrupted or misbound receipts before returning stored payloads', async () => {
    const store = fakeStorage([selected]); const service = createCaseService(store, { evidence: goodEvidence });
    await service.transition(context, selected.id, command);
    const original = store.inspect().receipts[0];
    for (const bad of [
      { ...original, result: { application: {}, eventId: 'SYN-E' } },
      { ...original, result: { ...original.result, application: { ...original.result.application, id: 'SYN-OTHER' } } },
    ]) {
      const broken = { ...store, transaction: <T,>(work: Parameters<typeof store.transaction<T>>[0]) => store.transaction(unit => work({ ...unit, receipt: async () => bad as never })) };
      await expect(createCaseService(broken).transition(context, selected.id, command)).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' });
    }
    await expect(service.transition({ ...context, actor: { ...context.actor, institutionIds: [] } }, selected.id, command)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(store.inspect().outbox).toHaveLength(1);
  });
  it('rejects inconsistent route policy identity without effects', async () => {
    const store = fakeStorage([{ ...selected, route: { ...selected.route, policyRevisionId: 'SYN-OTHER' } }]);
    await expect(createCaseService(store, { evidence: goodEvidence }).transition(context, selected.id, command)).rejects.toMatchObject({ code: 'POLICY_REVIEW_REQUIRED' });
    expect(store.inspect().outbox).toEqual([]);
  });
  it('cannot skip mandatory EVC; completes it only for an operational EVC role', async () => {
    const route = { ...selected.route, stages: ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'] as typeof selected.route.stages };
    const store = fakeStorage([{ ...selected, route, state: 'scrutiny_pending' }]);
    const service = createCaseService(store, { evidence: goodEvidence, scrutiny: goodPrerequisites });
    await expect(service.transition(context, selected.id, { ...command, action: 'send_for_decision' })).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
    const evc = await service.transition(context, selected.id, { ...command, action: 'complete_scrutiny' });
    expect(evc.application.state).toBe('evc_pending');
    const complete = { ...command, action: 'complete_evc', expectedVersion: 2 };
    await expect(service.transition(context, selected.id, complete)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    const result = await service.transition({ ...context, actor: { ...context.actor, roles: ['evc'] } }, selected.id, complete);
    expect(result.application.state).toBe('decision_pending'); expect(result.application.version).toBe(3);
    expect(store.inspect().outbox).toHaveLength(2);
  });
  it('sends a signed scrutiny case to decision without recording approval', async () => {
    const store = fakeStorage([{ ...selected, state: 'scrutiny_pending' }]);
    const result = await createCaseService(store, { evidence: goodEvidence, scrutiny: goodPrerequisites }).transition(context, selected.id, { ...command, action: 'send_for_decision' });
    expect(result.application.state).toBe('decision_pending'); expect(store.inspect().outbox[0].event.type).toBe('CaseTransitioned');
  });
  it('creates one review-needed case with source-free nonexecutable route, audit and outbox', async () => {
    const store = fakeStorage(); const service = createCaseService(store);
    const a = await service.create(context, intake); const retry = await service.create(context, intake);
    expect(a).toEqual(retry); expect(a.application.state).toBe('policy_review_required'); expect(a.application.route.stages).toEqual([]);
    expect(store.inspect().cases).toHaveLength(1); expect(store.inspect().audit).toHaveLength(1); expect(store.inspect().outbox[0].eventId).toBe(a.eventId);
  });
  it('rejects forged ownership/regions/states, unknown category, session and facts', async () => {
    for (const bad of [{ ...intake, institutionId: 'SYN-OTHER' }, { ...intake, roles: ['demo_authority'] }, { ...intake, regionId: 'Northern' }, { ...intake, state: 'approved' }, { ...intake, category: 'unknown' }, { ...intake, session: '2026-29' }, { ...intake, facts: { program: 'engineering', proposedIntake: '320' } }]) {
      const store = fakeStorage(); await expect(createCaseService(store).create(context, bad)).rejects.toBeDefined(); expect(store.inspect().cases).toEqual([]);
    }
  });
  it('rejects unavailable storage, missing evidence service and idempotency payload conflicts', async () => {
    const store = fakeStorage(); store.flags.available = false;
    await expect(createCaseService(store).create(context, intake)).rejects.toMatchObject({ code: 'STORAGE_UNAVAILABLE' });
    store.flags.available = true; const service = createCaseService(store);
    await expect(service.create(context, { ...intake, evidenceVersionIds: ['SYN-V'] })).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
    await service.create(context, intake);
    await expect(service.create(context, { ...intake, facts: { ...intake.facts, proposedIntake: 400 } })).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
  });
  it('rejects invalid action/targetStage and skipped states without effects', async () => {
    const store = fakeStorage([selected]); const service = createCaseService(store, { evidence: goodEvidence }); const before = store.inspect();
    for (const bad of [{ ...command, action: 'approve' }, { ...command, targetStage: 'Approval Issued' }, { ...command, action: 'complete_evc' }]) await expect(service.transition(context, selected.id, bad)).rejects.toBeDefined();
    expect(store.inspect()).toEqual(before);
  });
  it('enforces scope, empty grants, permissions, pinned policy, evidence and M2 services', async () => {
    const store = fakeStorage([selected]); const service = createCaseService(store);
    await expect(service.transition({ ...context, actor: { ...context.actor, regionIds: [] } }, selected.id, command)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.transition({ ...context, actor: { ...context.actor, permissions: [] } }, selected.id, command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.transition(context, selected.id, command)).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
    const pending = fakeStorage([{ ...selected, state: 'scrutiny_pending' }]);
    await expect(createCaseService(pending, { evidence: goodEvidence }).transition(context, selected.id, { ...command, action: 'complete_scrutiny' })).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
    const unresolved = fakeStorage([{ ...selected, route: { ...selected.route, result: 'review_required' } }]);
    await expect(createCaseService(unresolved).transition(context, selected.id, command)).rejects.toMatchObject({ code: 'POLICY_REVIEW_REQUIRED' });
    expect(store.inspect().audit).toHaveLength(0);
  });
  it('updates expected version once; stale command conflicts but identical replay succeeds', async () => {
    const store = fakeStorage([selected]); const service = createCaseService(store, { evidence: goodEvidence });
    const result = await service.transition(context, selected.id, command);
    expect(result.application.version).toBe(2); expect(result.application.state).toBe('scrutiny_pending');
    expect(await service.transition(context, selected.id, command)).toEqual(result);
    await expect(service.transition(context, selected.id, { ...command, reason: 'changed' })).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
    await expect(service.transition(context, selected.id, { ...command, idempotencyKey: 'OTHER' })).rejects.toMatchObject({ code: 'VERSION_CONFLICT' });
    expect(store.inspect().outbox).toHaveLength(1);
  });
  it('serializes concurrent duplicates and competing versions in MOCK transaction queue', async () => {
    const store = fakeStorage([selected]); const service = createCaseService(store, { evidence: goodEvidence });
    const [a,b] = await Promise.all([service.transition(context, selected.id, command), service.transition(context, selected.id, command)]); expect(a.eventId).toBe(b.eventId);
    const competing = fakeStorage([selected]); const other = createCaseService(competing, { evidence: goodEvidence });
    const results = await Promise.allSettled([other.transition(context, selected.id, command), other.transition(context, selected.id, { ...command, idempotencyKey: 'OTHER' })]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1); expect(competing.inspect().audit).toHaveLength(1);
  });
  it('completes scrutiny through injected M2 prerequisite, with no final approval', async () => {
    const store = fakeStorage([{ ...selected, state: 'scrutiny_pending' }]); const service = createCaseService(store, { evidence: goodEvidence, scrutiny: goodPrerequisites });
    const result = await service.transition(context, selected.id, { ...command, action: 'complete_scrutiny' });
    expect(result.application.state).toBe('decision_pending');
  });
  it('rolls back case/audit/outbox/receipt on each infrastructure failure', async () => {
    for (const failure of ['audit', 'outbox', 'receipt']) {
      const store = fakeStorage([selected]); const before = store.inspect(); store.flags.fail = failure;
      await expect(createCaseService(store, { evidence: goodEvidence }).transition(context, selected.id, command)).rejects.toThrow(); expect(store.inspect()).toEqual(before);
      store.flags.fail = ''; await createCaseService(store, { evidence: goodEvidence }).transition(context, selected.id, command); expect(store.inspect().outbox).toHaveLength(1);
    }
  });
  it('rolls back required participant failure and expires transaction handles', async () => {
    const store = fakeStorage([selected]); let handle: TransactionContext | undefined;
    const service = createCaseService(store, { evidence: { async assertReferences(tx) { handle = tx; await tx.repositories.obligations.insert({} as never); } } });
    await expect(service.transition(context, selected.id, command)).rejects.toThrow('participant unavailable');
    expect(store.inspect().cases[0].version).toBe(1); expect(store.inspect().outbox).toEqual([]);
    await expect(handle!.emit({} as never)).rejects.toThrow('context expired');
  });
  it('rejects missing evidence, mismatched policy source and negative signed prerequisites', async () => {
    const store = fakeStorage([selected]); const before = store.inspect();
    await expect(createCaseService(store, { evidence: goodEvidence }).transition(context, selected.id, { ...command, evidenceVersionIds: [] })).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
    const mismatched = fakeStorage([{ ...selected, route: { ...selected.route, sources: [{ ...selected.route.sources[0], sourceRevision: 'OTHER' }] } }]);
    await expect(createCaseService(mismatched, { evidence: goodEvidence }).transition(context, selected.id, command)).rejects.toMatchObject({ code: 'POLICY_REVIEW_REQUIRED' });
    const pending = fakeStorage([{ ...selected, state: 'scrutiny_pending' }]);
    const denied: ScrutinyPrerequisitePort = { ...goodPrerequisites, async assertScrutinyComplete() { return { allowed: false, failedRule: 'MOCK_UNSIGNED', reason: 'Not signed' }; } };
    await expect(createCaseService(pending, { evidence: goodEvidence, scrutiny: denied }).transition(context, selected.id, { ...command, action: 'complete_scrutiny' })).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
    expect(store.inspect()).toEqual(before); expect(pending.inspect().audit).toEqual([]);
  });
});
