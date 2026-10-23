import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Application, CommandContext, CommandResult, EventEnvelope, IntakeCommand, TransitionCommand } from '../../shared/contracts';
import { CONTRACT_VERSION } from '../../shared/contracts';
import { applicationSchema, intakeSchema, policyRevisionSchema, transitionSchema } from '../../shared/schemas';
import type { ScrutinyPrerequisitePort, TransactionContext } from '../../shared/ports';
import { assertPermission, assertScope } from '../security/authorization';
import { CoreError, unavailable, type CaseStorage, type Unit } from './storage';

export const CATEGORIES = ['extension_of_approval', 'new_institution', 'increase_intake', 'closure', 'conversion_coeducation', 'change_site'] as const;
const validatedIntake = intakeSchema.extend({ category: z.enum(CATEGORIES), session: z.string().regex(/^20\d{2}-\d{2}$/).refine(s => Number(s.slice(5)) === (Number(s.slice(0, 4)) + 1) % 100), facts: z.strictObject({ program: z.enum(['engineering', 'management', 'pharmacy', 'architecture', 'applied_arts']), proposedIntake: z.number().int().positive().max(100_000), nbaAccreditation: z.boolean().optional() }) });
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical((value as Record<string, unknown>)[k])}`).join(',')}}`;
  return JSON.stringify(value);
};
const hash = (value: unknown) => createHash('sha256').update(canonical(value)).digest('hex');
function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const value = schema.safeParse(input);
  if (!value.success) throw new CoreError('VALIDATION_FAILED', 'Invalid command payload');
  return value.data;
}
export interface EvidencePrerequisite {
  /** M3 adapter must validate persisted, scoped version IDs using this transaction. */
  assertReferences(tx: TransactionContext, ids: string[]): Promise<void>;
}
export function createCaseService(storage: CaseStorage, dependencies: { scrutiny?: ScrutinyPrerequisitePort; evidence?: EvidencePrerequisite } = {}) {
  async function evidence(tx: TransactionContext, ids: string[], required: boolean) {
    if (required && !ids.length) throw new CoreError('PRECONDITION_FAILED', 'Evidence references required');
    if (ids.length) {
      if (!dependencies.evidence) throw new CoreError('PRECONDITION_FAILED', 'Evidence version service unavailable');
      await dependencies.evidence.assertReferences(tx, ids);
    }
  }
  async function replay(unit: Unit, key: string, fingerprint: string) {
    const stored = await unit.receipt(key);
    if (!stored) return undefined;
    const checked = z.strictObject({ key: z.literal(key), fingerprint: z.string().min(1), result: z.strictObject({ application: applicationSchema, eventId: z.string().min(1) }) }).safeParse(stored);
    if (!checked.success) throw unavailable();
    const receipt = checked.data;
    if (receipt && receipt.fingerprint !== fingerprint) throw new CoreError('IDEMPOTENCY_CONFLICT', 'Idempotency key reused with different payload');
    return receipt?.result;
  }
  async function commit(unit: Unit, context: CommandContext, application: Application, before: Application | undefined, event: EventEnvelope, key: string, fingerprint: string, evidenceVersionIds: string[], reason?: string): Promise<CommandResult> {
    if (before) await unit.save(application, before.version); else await unit.insert(application);
    await unit.audit({ id: event.id, applicationId: application.id, actorId: context.actor.id, requestId: context.requestId, action: event.type === 'CaseTransitioned' ? event.payload.action : event.type, occurredAt: event.occurredAt, beforeState: before?.state, afterState: application.state, caseVersion: application.version, policyRevisionId: application.policyRevisionId, evidenceVersionIds, reason });
    await unit.outbox({ eventId: event.id, event, attempts: 0, status: 'pending' });
    const result = { application, eventId: event.id };
    await unit.remember({ key, fingerprint, result });
    return result;
  }
  return {
    storage,
    async create(context: CommandContext, body: unknown): Promise<CommandResult> {
      assertPermission(context.actor, 'case.create');
      const command: IntakeCommand = parse(validatedIntake, body);
      const key = hash([context.actor.id, command.institutionId, 'intake', command.idempotencyKey]);
      const fingerprint = hash(command);
      await storage.ready();
      return storage.transaction(async unit => {
        const institution = await unit.institution(command.institutionId);
        if (!institution || institution.status !== 'active') throw new CoreError('SCOPE_VIOLATION', 'Institution unavailable or outside grants');
        assertScope(context.actor, { institutionId: institution.id, regionId: institution.regionId });
        const previous = await replay(unit, key, fingerprint);
        if (previous) {
          assertScope(context.actor, previous.application);
          if (previous.application.institutionId !== institution.id || previous.application.regionId !== institution.regionId) throw unavailable();
          return previous;
        }
        const time = new Date().toISOString();
        const application: Application = { id: randomUUID(), reference: `DEMO-${randomUUID()}`, institutionId: institution.id, regionId: institution.regionId, category: command.category, session: command.session, facts: command.facts, state: 'policy_review_required', version: 1, route: { result: 'review_required', category: command.category, session: command.session, evaluatedFacts: command.facts, stages: [], reasons: ['Policy evaluator not yet integrated'], reviewReasons: ['Reviewed source mapping required'], sources: [] }, createdAt: time, updatedAt: time, stageEnteredAt: time };
        await evidence(unit.context(context, application), command.evidenceVersionIds, false);
        const event: EventEnvelope<'CaseSubmitted'> = { contractVersion: CONTRACT_VERSION, id: randomUUID(), type: 'CaseSubmitted', actorId: context.actor.id, requestId: context.requestId, applicationId: application.id, caseVersion: 1, occurredAt: time, payload: { caseId: application.id } };
        return commit(unit, context, application, undefined, event, key, fingerprint, command.evidenceVersionIds);
      });
    },
    async transition(context: CommandContext, id: string, body: unknown): Promise<CommandResult> {
      assertPermission(context.actor, 'case.transition');
      const command: TransitionCommand = parse(transitionSchema, body);
      const allowedRoles = command.action === 'complete_evc' ? ['evc', 'regional_officer', 'bureau_officer'] : ['reviewer', 'regional_officer', 'bureau_officer'];
      if (!context.actor.roles.some(role => allowedRoles.includes(role))) throw new CoreError('FORBIDDEN', 'Workflow action requires an assigned operational role');
      const key = hash([context.actor.id, id, command.action, command.idempotencyKey]);
      const fingerprint = hash(command);
      await storage.ready();
      return storage.transaction(async unit => {
        const app = await unit.get(context.actor, id);
        if (!app) throw new CoreError('NOT_FOUND', 'Case not found');
        assertScope(context.actor, app);
        const previous = await replay(unit, key, fingerprint);
        if (previous) {
          assertScope(context.actor, previous.application);
          if (previous.application.id !== app.id || previous.application.institutionId !== app.institutionId || previous.application.regionId !== app.regionId) throw unavailable();
          return previous;
        }
        if (app.version !== command.expectedVersion) throw new CoreError('VERSION_CONFLICT', 'Stale case version', app.version);
        if (app.route.result !== 'selected' || !app.policyRevisionId) throw new CoreError('POLICY_REVIEW_REQUIRED', 'Reviewed policy route required');
        const policy = await unit.policy(app.policyRevisionId);
        const checked = policyRevisionSchema.safeParse(policy);
        if (!checked.success || checked.data.id !== app.policyRevisionId || app.route.policyRevisionId !== app.policyRevisionId || app.route.session !== app.session || app.route.category !== app.category || checked.data.status !== 'approved' || checked.data.source.reviewState !== 'reviewed' || checked.data.session !== app.session || checked.data.category !== app.category) throw new CoreError('POLICY_REVIEW_REQUIRED', 'Pinned policy unavailable or not approved for this case');
        const pinned = checked.data;
        if (Date.parse(app.createdAt) < Date.parse(pinned.effectiveFrom) || (pinned.effectiveTo && Date.parse(app.createdAt) >= Date.parse(pinned.effectiveTo)) || !app.route.sources.some(source => source.documentId === pinned.source.documentId && source.sourceRevision === pinned.source.sourceRevision && source.location === pinned.source.location)) throw new CoreError('POLICY_REVIEW_REQUIRED', 'Pinned policy source or effective window does not match');
        const tx = unit.context(context, app);
        let target: Application['state'];
        let prerequisite: 'assertScrutinyComplete' | 'assertEVCComplete' | undefined;
        if (command.action === 'start_scrutiny' && app.state === 'submitted') target = 'scrutiny_pending';
        else if ((command.action === 'complete_scrutiny' || command.action === 'send_for_decision') && app.state === 'scrutiny_pending') {
          target = app.route.stages.includes('evc_pending') ? 'evc_pending' : 'decision_pending';
          if (command.action === 'send_for_decision' && target !== 'decision_pending') throw new CoreError('PRECONDITION_FAILED', 'Required EVC cannot be skipped');
          prerequisite = 'assertScrutinyComplete';
        } else if (command.action === 'complete_evc' && app.state === 'evc_pending') { target = 'decision_pending'; prerequisite = 'assertEVCComplete'; }
        else throw new CoreError('PRECONDITION_FAILED', 'Action is illegal in this state or requires an unimplemented M2 transaction operation');
        const position = app.route.stages.indexOf(app.state);
        if (position < 0 || app.route.stages[position + 1] !== target) throw new CoreError('PRECONDITION_FAILED', 'Action not permitted by pinned route');
        await evidence(tx, command.evidenceVersionIds, true);
        if (prerequisite) {
          if (!dependencies.scrutiny) throw new CoreError('PRECONDITION_FAILED', 'M2 prerequisite service unavailable');
          const result = await dependencies.scrutiny[prerequisite](tx);
          if (!result.allowed || !result.prerequisiteEventIds.length) throw new CoreError('PRECONDITION_FAILED', 'Required signed prerequisite not complete');
          if (target === 'evc_pending') {
            const eligibility = await dependencies.scrutiny.assertEVCEligible(tx);
            if (!eligibility.allowed || !eligibility.prerequisiteEventIds.length) throw new CoreError('PRECONDITION_FAILED', 'EVC eligibility not established');
          }
        }
        const time = new Date().toISOString();
        const updated = applicationSchema.parse({ ...app, state: target, version: app.version + 1, stageEnteredAt: time, updatedAt: time });
        const event: EventEnvelope<'CaseTransitioned'> = { contractVersion: CONTRACT_VERSION, id: randomUUID(), type: 'CaseTransitioned', actorId: context.actor.id, requestId: context.requestId, applicationId: id, caseVersion: updated.version, occurredAt: time, payload: { caseId: id, action: command.action, beforeState: app.state, afterState: target } };
        return commit(unit, context, updated, app, event, key, fingerprint, command.evidenceVersionIds, command.reason);
      });
    },
  };
}
