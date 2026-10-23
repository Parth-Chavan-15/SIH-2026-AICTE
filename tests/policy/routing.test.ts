import { describe, it, expect } from 'vitest';
import { evaluatePolicy } from '../../src/backend/policy/evaluator';
import { approvedRule, policyRegistry } from '../../src/backend/policy/registry';
import { candidatePolicies } from '../../src/backend/policy/candidates';
import { applicationSchema, routeSchema } from '../../src/shared/schemas';
import { input, fixture, facts } from './support';
import { createCaseService } from '../../src/backend/core/cases';
import { context, fakeStorage, selected } from '../core/support';
import type { CaseStorage, Unit } from '../../src/backend/core/storage';

describe('MOCK ONLY policy engine semantics; no approved AICTE fixtures', () => {
  it('does not resurrect a superseded revision after its successor expires', () => {
    const a = fixture(), b = { ...fixture(), id: 'SYN-r2', revision: 2, supersedesId: a.id, effectiveFrom: '2026-10-01T00:00:00.000Z', effectiveTo: '2026-10-20T00:00:00.000Z' };
    expect(evaluatePolicy(input, [a,b], facts()).result).toBe('review_required');
  });
  it('follows supersession through an expired intermediate without reviving ancestors', () => {
    const a = fixture(), b = { ...fixture(), id: 'SYN-r2', revision: 2, supersedesId: a.id, effectiveFrom: '2026-10-01T00:00:00.000Z', effectiveTo: '2026-10-10T00:00:00.000Z' };
    const c = { ...fixture(), id: 'SYN-r3', revision: 3, supersedesId: b.id, effectiveFrom: '2026-10-09T00:00:00.000Z' };
    expect(evaluatePolicy(input, [a,b,c], facts()).policyRevisionId).toBe(c.id);
  });
  it('rejects whitespace-only or cosmetically distinct approval identities', () => {
    for (const author of ['   ', 'SYN-AUTHOR']) {
      const p = fixture(); (p.conditions as any).verification.authoredBy = author;
      (p.conditions as any).verification.approvedBy = author.trim() ? ` ${author} ` : 'SYN-REVIEWER';
      expect(approvedRule(p, input.asOf)).toBeNull();
    }
  });
  it('does not coerce an array programme into an eligible programme string', () => {
    expect(evaluatePolicy({ ...input, facts: { ...input.facts, program: ['engineering'] } }, [fixture()], facts()).result).toBe('review_required');
  });
  it('rejects invalid approval evaluation dates and nonnumeric ordered predicates', () => {
    expect(approvedRule(fixture(), 'not-a-date')).toBeNull();
    const p = fixture(); (p.conditions as any).predicates[1].value = '360';
    expect(approvedRule(p, input.asOf)).toBeNull();
  });
  it('rejects pinned source URL/title/review-state divergence without any writes', async () => {
    const p = fixture();
    for (const changed of [{ url: 'https://untrusted.invalid/source' }, { title: 'Another document' }, { reviewState: 'interpretation_pending' as const }]) {
      const app = { ...selected, policyRevisionId: p.id, route: { ...selected.route, policyRevisionId: p.id, sources: [{ ...p.source, ...changed }] } };
      const base = fakeStorage([app]);
      const store: CaseStorage = { ...base, transaction: work => base.transaction(unit => work({ ...unit, policy: async () => p })) };
      await expect(createCaseService(store, { evidence: { async assertReferences() {} } }).transition(context, app.id, { action: 'start_scrutiny', expectedVersion: 1, evidenceVersionIds: ['SYN-EVIDENCE'], idempotencyKey: 'SYN-PIN' })).rejects.toMatchObject({ code: 'POLICY_REVIEW_REQUIRED' });
      expect(base.inspect().audit).toEqual([]); expect(base.inspect().cases[0].version).toBe(1);
    }
  });
  it.each([true, false])('selects distinct complete synthetic paths, accredited=%s', accredited => {
    const result = evaluatePolicy({ ...input, facts: { ...input.facts, nbaAccreditation: accredited } }, [fixture(true), fixture(false)], facts(accredited));
    expect(result.result).toBe('selected'); expect(result.stages.includes('evc_pending')).toBe(!accredited);
    expect(routeSchema.safeParse(result).success).toBe(true); expect(result.sources[0].location).toContain('MOCK ONLY');
    expect(result.reasons.length).toBe(4);
  });
  it.each(['draft', 'source', 'url', 'approval', 'author', 'precedence', 'unresolved', 'hearing', 'terminal', 'format'])('blocks invalid approval/route: %s', failure => {
    const p = fixture(); const c = p.conditions as any;
    if (failure === 'draft') p.status = 'draft';
    if (failure === 'source') p.source.reviewState = 'interpretation_pending';
    if (failure === 'url') p.source.url = 'https://untrusted.invalid/source';
    if (failure === 'approval') delete c.verification;
    if (failure === 'author') c.verification.approvedBy = c.verification.authoredBy;
    if (failure === 'precedence') c.verification.precedenceConfirmed = false;
    if (failure === 'unresolved') c.unresolved = ['Exact interpretation missing'];
    if (failure === 'hearing') c.requiresHearing = true;
    if (failure === 'terminal') c.stages.push('approved');
    if (failure === 'format') c.format = 'unknown';
    expect(evaluatePolicy(input, [p], facts()).result).toBe('review_required');
  });
  it.each(['missing', 'booleanOnly', 'expired', 'future', '360', 'divisions', 'wrongProgram', 'session', 'january', 'odl', 'category', 'period', 'penalty', 'withdrawal'])('safely reviews %s', failure => {
    const i = structuredClone(input), p = fixture(), f = facts();
    if (failure === 'missing') delete f.institutionEligible;
    if (failure === 'booleanOnly') delete f.nbaAccreditation;
    if (failure === 'expired') f.nbaAccreditation.validTo = '2026-10-23T10:00:00.000Z';
    if (failure === 'future') f.nbaAccreditation.verifiedAt = '2027-01-01T00:00:00.000Z';
    if (failure === '360') f.existingIntake.value = 360;
    if (failure === 'divisions') f.existingIntake.unit = 'divisions';
    if (failure === 'wrongProgram') i.facts.program = 'pharmacy';
    if (failure === 'session') i.session = '2027-28';
    if (failure === 'january' || failure === 'odl') i.sessionMode = failure;
    if (failure === 'category') i.category = 'new_institution';
    if (failure === 'period') p.effectiveTo = input.asOf;
    if (failure === 'penalty' || failure === 'withdrawal') i.category = failure;
    const result = evaluatePolicy(i, [p], f);
    expect(result.result).toBe('review_required'); expect(result.stages).toEqual([]); expect(result.reviewReasons?.length).toBeGreaterThan(0);
  });
  it('keeps real-source candidates blocked even with synthetic evidence', () => {
    for (const p of candidatePolicies) expect(evaluatePolicy(input, [p], facts()).result).toBe('review_required');
  });
  it('detects conflicts and duplicate immutable identities; snapshots cannot be mutated', () => {
    const p = fixture(), other = { ...fixture(), id: 'SYN-OTHER', policyKey: 'SYN-OTHER' };
    expect(evaluatePolicy(input, [p, other], facts()).reviewReasons?.[0]).toContain('conflict');
    expect(() => policyRegistry([p, p])).toThrow('Duplicate');
    const registry = policyRegistry([p]); (p.conditions as any).unresolved.push('changed');
    (registry.all()[0].conditions as any).unresolved.push('changed again');
    expect(registry.get(p.id)?.conditions.unresolved).toEqual([]);
  });
  it('honors explicit supersession only after its effective date', () => {
    const a = fixture(), b = { ...fixture(), id: 'SYN-r2', revision: 2, supersedesId: a.id, effectiveFrom: '2026-10-01T00:00:00.000Z' };
    expect(evaluatePolicy(input, [a, b], facts()).policyRevisionId).toBe(b.id);
    expect(evaluatePolicy({ ...input, asOf: '2026-09-01T00:00:00.000Z' }, [a,b], facts()).policyRevisionId).toBe(a.id);
    expect(() => policyRegistry([a, { ...b, supersedesId: b.id }])).toThrow('Invalid supersession');
  });
  it('pins intake, atomically records source/event, replays unchanged after a new revision', async () => {
    const base = fakeStorage(); const revisions = [fixture()];
    const store: CaseStorage = { ...base, transaction: work => base.transaction(unit => work({ ...unit, policies: async () => structuredClone(revisions) } satisfies Unit)) };
    const service = createCaseService(store, { policyFacts: { async load() { return { facts: facts(), sessionMode: 'regular' }; } } });
    const command = { institutionId: 'SYN-INST-W', category: input.category, session: input.session, facts: input.facts, evidenceVersionIds: [], idempotencyKey: 'SYN-POLICY-CREATE' };
    const first = await service.create(context, command);
    expect(first.application.state).toBe('submitted'); expect(applicationSchema.safeParse(first.application).success).toBe(true);
    revisions.push({ ...fixture(), id: 'SYN-r2', revision: 2, supersedesId: fixture().id });
    expect(await service.create(context, command)).toEqual(first);
    expect(first.application.policyRevisionId).toBe(fixture().id); expect(base.inspect().audit).toHaveLength(1);
    expect(base.inspect().outbox[0].event.payload).toMatchObject({ policyRevisionId: fixture().id });
    await expect(service.create(context, { ...command, facts: { ...input.facts, proposedIntake: 321 } })).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
    await expect(service.create({ ...context, actor: { ...context.actor, permissions: [] } }, command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
  it('rolls back evaluated intake when audit/outbox/receipt fails', async () => {
    for (const fail of ['audit','outbox','receipt']) {
      const base = fakeStorage(); base.flags.fail = fail;
      const store: CaseStorage = { ...base, transaction: work => base.transaction(unit => work({ ...unit, policies: async () => [fixture()] })) };
      await expect(createCaseService(store, { policyFacts: { async load() { return { facts: facts(), sessionMode: 'regular' }; } } }).create(context, { institutionId: 'SYN-INST-W', category: input.category, session: input.session, facts: input.facts, evidenceVersionIds: [], idempotencyKey: 'SYN-FAIL' })).rejects.toThrow();
      expect(base.inspect().cases).toEqual([]); expect(base.inspect().outbox).toEqual([]);
    }
  });
});
