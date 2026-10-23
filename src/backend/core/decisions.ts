import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { CONTRACT_VERSION, type CommandContext, type Decision, type EventEnvelope } from '../../shared/contracts';
import { applicationSchema, decisionCommandSchema, decisionSchema, idSchema, obligationSchema, commandContextSchema } from '../../shared/schemas';
import type { DecisionObligationParticipant, ScrutinyPrerequisitePort } from '../../shared/ports';
import { assertPermission, assertScope } from '../security/authorization';
import { approvedRule } from '../policy/registry';
import { CoreError, unavailable, type CaseStorage } from './storage';
import type { TransactionContext } from '../../shared/ports';
export interface DecisionEvidenceReader {
  /** Persisted, scoped, independently verified, current evidence; same transaction. */
  assertVerified(tx: TransactionContext, ids: string[]): Promise<void>;
}
const canonical = (v: unknown): string => Array.isArray(v) ? `[${v.map(canonical).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`).join(',')}}` : JSON.stringify(v);
const hash = (v: unknown) => createHash('sha256').update(canonical(v)).digest('hex');
const commandSchema = decisionCommandSchema.refine(c => !!c.reason?.trim(), 'A human decision reason is required').refine(c => new Set(c.evidenceVersionIds).size === c.evidenceVersionIds.length, 'Duplicate evidence IDs');
const attestationSchema = z.strictObject({allowed:z.literal(true), prerequisiteEventIds:z.array(idSchema).min(1).refine(ids=>new Set(ids).size===ids.length)});
function prerequisiteIds(value: unknown): string[] { const parsed=attestationSchema.safeParse(value); if (!parsed.success) throw new CoreError('PRECONDITION_FAILED', 'Valid signed prerequisite references required'); return parsed.data.prerequisiteEventIds; }
function readerContext(tx: TransactionContext): TransactionContext {
  const deny=async()=>{throw new CoreError('PRECONDITION_FAILED','Prerequisite readers cannot write');};
  return {...tx, context:structuredClone(tx.context),actor:structuredClone(tx.actor),application:structuredClone(tx.application), repositories:{cases:{save:deny},decisions:{insert:deny},obligations:{insert:deny},scrutiny:{insert:deny},evc:{save:deny},audit:{append:deny},outbox:{append:deny}},emit:deny};
}
export function createDecisionService(storage: CaseStorage, deps: { scrutiny?: ScrutinyPrerequisitePort; decisionEvidence?: DecisionEvidenceReader; obligations?: DecisionObligationParticipant } = {}) {
  return { async decide(context: CommandContext, id: string, body: unknown): Promise<Decision> {
    const verifiedContext=commandContextSchema.safeParse(context);
    if (!verifiedContext.success) throw new CoreError('UNAUTHENTICATED','Verified command context required');
    context=verifiedContext.data;
    assertPermission(context.actor, 'decision.record');
    const parsed = commandSchema.safeParse(body);
    if (!parsed.success) throw new CoreError('VALIDATION_FAILED', 'Invalid decision payload or missing reason');
    const command = parsed.data, key = hash([context.actor.id, id, 'decision', command.idempotencyKey]), fingerprint = hash(command);
    return storage.transaction(async unit => {
      const app = await unit.get(context.actor, id);
      if (!app) throw new CoreError('NOT_FOUND', 'Case not found');
      assertScope(context.actor, app);
      const receipt = await unit.receipt(key);
      if (receipt) {
        const saved = z.strictObject({ key: z.literal(key), fingerprint: z.string(), result: z.strictObject({ application: applicationSchema, eventId: idSchema }), decision: decisionSchema }).safeParse(receipt);
        if (!saved.success) throw unavailable();
        if (saved.data.fingerprint !== fingerprint) throw new CoreError('IDEMPOTENCY_CONFLICT', 'Idempotency key reused with different payload');
        const d = saved.data.decision, a = saved.data.result.application;
        if (d.applicationId !== id || d.actorId !== context.actor.id || d.eventId !== saved.data.result.eventId || d.policyRevisionId !== a.policyRevisionId || a.version !== command.expectedVersion + 1 || a.state !== (d.outcome === 'conditional' ? 'conditionally_approved' : d.outcome) || d.outcome !== command.outcome || canonical(d.conditions) !== canonical(command.conditions) || canonical(d.evidenceVersionIds) !== canonical(command.evidenceVersionIds) || a.policyRevisionId !== app.policyRevisionId || canonical(d.source) !== canonical(a.route.sources[0]) || canonical(a.route.sources) !== canonical(app.route.sources) || a.id !== id || a.institutionId !== app.institutionId || a.regionId !== app.regionId) throw unavailable();
        assertScope(context.actor, a); return d;
      }
      if (app.version !== command.expectedVersion) throw new CoreError('VERSION_CONFLICT', 'Stale case version', app.version);
      if (app.state !== 'decision_pending') throw new CoreError('PRECONDITION_FAILED', 'Case is not ready for a human decision');
      const p = app.policyRevisionId ? await unit.policy(app.policyRevisionId) : null;
      const rule = p ? approvedRule(p, new Date().toISOString()) : null;
      if (!p || !rule || p.id !== app.policyRevisionId || app.route.result !== 'selected' || app.route.policyRevisionId !== p.id || p.category !== app.category || p.session !== app.session ||
          app.route.category !== app.category || app.route.session !== app.session || JSON.stringify(rule.stages) !== JSON.stringify(app.route.stages) ||
          Date.parse(app.createdAt) < Date.parse(p.effectiveFrom) || (p.effectiveTo && Date.parse(app.createdAt) >= Date.parse(p.effectiveTo)) ||
          app.route.sources.length !== 1 || (['documentId','title','location','sourceRevision','url','reviewState'] as const).some(k => app.route.sources[0]?.[k] !== p.source[k])) throw new CoreError('POLICY_REVIEW_REQUIRED', 'Verified pinned policy and complete decision route required');
      if (!deps.scrutiny || !deps.decisionEvidence || !deps.obligations) throw new CoreError('PRECONDITION_FAILED', 'Signed scrutiny, verified evidence and transactional M3 participant are required');
      const tx = unit.context(context, app);
      const signed = await deps.scrutiny.assertScrutinyComplete(readerContext(tx));
      const signedIds = prerequisiteIds(signed);
      if (rule.stages.some(stage => stage === 'evc_pending')) {
        const evc = await deps.scrutiny.assertEVCComplete(readerContext(tx));
        signedIds.push(...prerequisiteIds(evc));
      }
      await deps.decisionEvidence.assertVerified(readerContext(tx), [...command.evidenceVersionIds]);
      for (const c of command.conditions) if (c.policyRevisionId !== p.id || !signedIds.includes(c.triggerEventId) || (['documentId','title','location','sourceRevision','url','reviewState'] as const).some(k => c.source[k] !== p.source[k])) throw new CoreError('PRECONDITION_FAILED', 'Condition requires the pinned source and a verified prerequisite trigger');
      const eventId = randomUUID(), time = new Date().toISOString();
      const decision: Decision = decisionSchema.parse({ id: randomUUID(), applicationId: id, actorId: context.actor.id, outcome: command.outcome, policyRevisionId: p.id, source: p.source, decidedAt: time, eventId, evidenceVersionIds: command.evidenceVersionIds, conditions: command.conditions });
      // Every required participant must be awaited before finalizing. No external publication.
      await tx.repositories.decisions.insert(structuredClone(decision));
      const materialized = new Map<string, unknown>();
      const reserved = new Set<string>();
      const denyCoreWrite=async()=>{throw new CoreError('PRECONDITION_FAILED','M3 cannot replace core/domain records');};
      const participantTx = { ...tx, context:structuredClone(tx.context),actor:structuredClone(tx.actor),application:structuredClone(tx.application), repositories: { ...tx.repositories, cases:{save:denyCoreWrite},decisions:{insert:denyCoreWrite},scrutiny:{insert:denyCoreWrite},evc:{save:denyCoreWrite}, obligations: { insert: async (raw: Parameters<typeof tx.repositories.obligations.insert>[0]) => {
        const o = obligationSchema.parse(raw);
        if (o.version !== 1 || o.status !== 'pending' || o.applicationId !== id || o.institutionId !== app.institutionId || o.decisionEventId !== eventId || !command.conditions.some(c => c.conditionKey === o.conditionKey && c.policyRevisionId === o.policyRevisionId && c.triggerEventId === o.triggerEventId && c.timerKind === o.timerKind && c.dueAt === o.dueAt && c.dueReason === o.dueReason && canonical(c.source) === canonical(o.source)) || reserved.has(o.conditionKey)) throw new CoreError('PRECONDITION_FAILED', 'Invalid or duplicate participant obligation');
        reserved.add(o.conditionKey);
        await tx.repositories.obligations.insert(structuredClone(o)); materialized.set(o.conditionKey, o);
      } } } };
      const returned = await deps.obligations.materialize(participantTx, structuredClone(command), eventId);
      const checkedReturned=z.array(obligationSchema).safeParse(returned);
      if (!checkedReturned.success || checkedReturned.data.length !== materialized.size || new Set(checkedReturned.data.map(o=>o.conditionKey)).size !== checkedReturned.data.length || checkedReturned.data.some(o=>canonical(o)!==canonical(materialized.get(o.conditionKey)))) throw new CoreError('PRECONDITION_FAILED','M3 result does not match its writes');
      if (materialized.size !== command.conditions.length) throw new CoreError('PRECONDITION_FAILED', 'M3 did not materialize all required conditions');
      const application = applicationSchema.parse({ ...app, state: command.outcome === 'conditional' ? 'conditionally_approved' : command.outcome, version: app.version + 1, updatedAt: time, stageEnteredAt: time });
      await unit.save(application, app.version);
      const event: EventEnvelope<'DecisionRecorded'> = { contractVersion: CONTRACT_VERSION, id: eventId, type: 'DecisionRecorded', actorId: context.actor.id, requestId: context.requestId, occurredAt: time, applicationId: id, caseVersion: application.version, payload: { caseId: id, decision } };
      await unit.audit({ id: eventId, applicationId: id, actorId: context.actor.id, requestId: context.requestId, action: 'DecisionRecorded', occurredAt: time, beforeState: app.state, afterState: application.state, caseVersion: application.version, policyRevisionId: p.id, evidenceVersionIds: command.evidenceVersionIds, reason: command.reason });
      await unit.outbox({ eventId, event, attempts: 0, status: 'pending' });
      await unit.remember({ key, fingerprint, result: { application, eventId }, decision });
      return decision;
    });
  } };
}
