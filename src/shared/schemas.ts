/** Structural validation only: permission, policy and evidence checks belong to services. */
import { z } from 'zod';
import { CASE_ACTIONS, CASE_STATES, CONTRACT_VERSION, ERROR_STATUS, PERMISSIONS, ROLES } from './contracts';
import type { EventPayloads } from './contracts';
export const idSchema = z.string().trim().min(1).max(200);
export const utcSchema = z.iso.datetime({ offset: false });
const text = z.string().trim().min(1);
const version = z.number().int().positive();
const ids = z.array(idSchema);
const facts = z.record(z.string(), z.unknown());
export const actorSchema = z.strictObject({ id: idSchema, roles: z.array(z.enum(ROLES)).min(1), permissions: z.array(z.enum(PERMISSIONS)), scope: z.enum(['scoped', 'global']), institutionIds: ids, regionIds: ids });
export const commandContextSchema = z.strictObject({ actor: actorSchema, sessionId: idSchema, requestId: idSchema, receivedAt: utcSchema });
export const policySourceSchema = z.strictObject({ documentId: idSchema, title: text, location: text, sourceRevision: text, reviewState: z.enum(['interpretation_pending', 'reviewed']), url: z.url().optional() });
export const policyRevisionSchema = z.strictObject({ id: idSchema, policyKey: text, revision: version, session: text, category: text, source: policySourceSchema, status: z.enum(['draft', 'reviewed', 'approved']), effectiveFrom: utcSchema, effectiveTo: utcSchema.optional(), supersedesId: idSchema.optional(), conditions: facts });
export const routeSchema = z.strictObject({ policyRevisionId: idSchema.optional(), session: text, category: text, evaluatedFacts: facts, result: z.enum(['selected', 'review_required']), stages: z.array(z.enum(CASE_STATES)), reasons: z.array(text).min(1), sources: z.array(policySourceSchema), reviewReasons: z.array(text).optional() }).superRefine((route, ctx) => {
  if (route.result === 'selected' && (!route.policyRevisionId || !route.stages.length || !route.sources.length || route.sources.some(s => s.reviewState !== 'reviewed'))) ctx.addIssue({ code: 'custom', message: 'Selected route requires a pinned revision, reviewed sources and stages.' });
  if (route.result === 'review_required' && (!route.reviewReasons?.length || route.stages.length)) ctx.addIssue({ code: 'custom', message: 'Review-needed route requires reasons and no executable stages.' });
});
export const applicationSchema = z.strictObject({ id: idSchema, reference: text, institutionId: idSchema, regionId: idSchema, category: text, session: text, facts, policyRevisionId: idSchema.optional(), state: z.enum(CASE_STATES), route: routeSchema, version, ownerId: idSchema.optional(), stageEnteredAt: utcSchema, createdAt: utcSchema, updatedAt: utcSchema }).superRefine((app, ctx) => {
  if (app.policyRevisionId !== app.route.policyRevisionId || app.session !== app.route.session || app.category !== app.route.category) ctx.addIssue({ code: 'custom', message: 'Case and route revision/session/category must agree.' });
  if (app.route.result === 'review_required' && app.state !== 'policy_review_required') ctx.addIssue({ code: 'custom', message: 'Unresolved route must remain in policy review.' });
});
const create = { idempotencyKey: text.max(200) };
const command = { ...create, expectedVersion: version, reason: text.optional() };
export const intakeSchema = z.strictObject({ ...create, institutionId: idSchema, category: text, session: text, facts, evidenceVersionIds: ids });
export const transitionSchema = z.strictObject({ ...command, action: z.enum(CASE_ACTIONS), evidenceVersionIds: ids });
const itemSchema = z.strictObject({ itemId: idSchema, result: z.enum(['accepted', 'deficient']), reason: text.optional(), evidenceVersionIds: ids });
export const signScrutinySchema = z.strictObject({ ...command, checklistVersion: text, items: z.array(itemSchema).min(1) });
export const correctionSchema = z.strictObject({ ...command, snapshotId: idSchema, changes: z.array(z.strictObject({ itemId: idSchema, evidenceVersionIds: ids, response: text })).min(1) });
export const rescrutinySchema = z.strictObject({ ...command, snapshotId: idSchema, outcomes: z.array(itemSchema.omit({ evidenceVersionIds: true })).min(1) });
export const scheduleEVCSchema = z.strictObject({ ...command, scheduledAt: utcSchema, assigneeIds: ids.min(1) });
export const evcReportSchema = z.strictObject({ ...command, evidenceVersionIds: ids.min(1), summary: text, recommendation: z.enum(['recommended', 'conditional', 'not_recommended']) });
export const timerKindSchema = z.enum(['academic_calendar_cutoff', 'event_relative', 'validity_expiry', 'internal_demo_sla']);
export const conditionSchema = z.strictObject({ conditionKey: text, policyRevisionId: idSchema, source: policySourceSchema, obligationType: text, triggerEventId: idSchema, timerKind: timerKindSchema, dueAt: utcSchema, dueReason: text });
const outcome = z.enum(['approved', 'conditional', 'rejected']);
const decisionFields = { outcome, evidenceVersionIds: ids.min(1), conditions: z.array(conditionSchema) };
function validateConditions(value: { outcome: string; conditions: { conditionKey: string }[] }, ctx: z.RefinementCtx) {
  if ((value.outcome === 'conditional') !== (value.conditions.length > 0)) ctx.addIssue({ code: 'custom', message: 'Only conditional decisions carry nonempty conditions.' });
  if (new Set(value.conditions.map(c => c.conditionKey)).size !== value.conditions.length) ctx.addIssue({ code: 'custom', message: 'Duplicate condition keys.' });
}
export const decisionCommandSchema = z.strictObject({ ...command, ...decisionFields }).superRefine(validateConditions);
export const decisionSchema = z.strictObject({ id: idSchema, applicationId: idSchema, actorId: idSchema, ...decisionFields, policyRevisionId: idSchema, source: policySourceSchema, decidedAt: utcSchema, eventId: idSchema }).superRefine(validateConditions);
export const obligationSchema = z.strictObject({ id: idSchema, applicationId: idSchema, decisionEventId: idSchema, conditionKey: text, institutionId: idSchema, policyRevisionId: idSchema, triggerEventId: idSchema, source: policySourceSchema, timerKind: timerKindSchema, dueAt: utcSchema, dueReason: text, reviewerId: idSchema.optional(), version, status: z.enum(['pending', 'submitted', 'verified', 'rejected', 'closed']) });
export const documentVersionSchema = z.strictObject({ id: idSchema, documentId: idSchema, version, applicationId: idSchema, obligationId: idSchema.optional(), fileName: text, mediaType: text, byteSize: z.number().int().nonnegative(), receivedAt: utcSchema, validFrom: utcSchema.optional(), validTo: utcSchema.optional(), supersedesId: idSchema.optional(), status: z.enum(['submitted', 'source_status_observed', 'verified', 'rejected', 'superseded']), reviewedBy: idSchema.optional(), reviewedAt: utcSchema.optional() });
export const documentUploadSchema = z.strictObject({ ...create, applicationId: idSchema, obligationId: idSchema.optional(), supersedesId: idSchema.optional() });
export const evidenceReviewSchema = z.strictObject({ ...command, documentVersionId: idSchema, outcome: z.enum(['verified', 'rejected']), remarks: text });
export const loginSchema = z.strictObject({ email: z.email(), password: z.string().min(1).max(1024) });
export const sessionSchema = z.strictObject({ actor: actorSchema, expiresAt: utcSchema });
export const errorSchema = z.strictObject({ code: z.enum(Object.keys(ERROR_STATUS) as [keyof typeof ERROR_STATUS, ...(keyof typeof ERROR_STATUS)[]]), message: text, failedRule: text.optional(), currentVersion: version.optional(), issues: z.array(z.strictObject({ path: z.string(), message: text })).optional() });
export function apiResultSchema<T extends z.ZodType>(data: T) { return z.discriminatedUnion('success', [z.strictObject({ success: z.literal(true), data, eventId: idSchema.optional() }), z.strictObject({ success: z.literal(false), error: errorSchema })]); }
const caseId = { caseId: idSchema };
export const eventPayloadSchemas = {
  CaseSubmitted: z.strictObject({ ...caseId, policyRevisionId: idSchema.optional() }),
  CaseTransitioned: z.strictObject({ ...caseId, action: z.enum(CASE_ACTIONS), beforeState: z.enum(CASE_STATES), afterState: z.enum(CASE_STATES) }),
  ScrutinySigned: z.strictObject({ ...caseId, snapshotId: idSchema }),
  CorrectionSubmitted: z.strictObject({ ...caseId, snapshotId: idSchema }),
  RescrutinyCompleted: z.strictObject({ ...caseId, snapshotId: idSchema }),
  EVCTaskCreated: z.strictObject({ ...caseId, evcTaskId: idSchema, prerequisiteEventId: idSchema }),
  EVCScheduled: z.strictObject({ ...caseId, evcTaskId: idSchema }),
  EVCReportSubmitted: z.strictObject({ ...caseId, evcTaskId: idSchema, reportVersionId: idSchema }),
  DecisionRecorded: z.strictObject({ ...caseId, decision: decisionSchema }),
  ObligationCreated: z.strictObject({ ...caseId, obligationId: idSchema, decisionEventId: idSchema, conditionKey: text, policyRevisionId: idSchema }),
  EvidenceSubmitted: z.strictObject({ ...caseId, documentVersionId: idSchema }),
  EvidenceReviewed: z.strictObject({ ...caseId, documentVersionId: idSchema, outcome: z.enum(['verified', 'rejected']) }),
  DocumentSuperseded: z.strictObject({ ...caseId, documentId: idSchema, oldVersionId: idSchema, newVersionId: idSchema }),
  TimerCanceled: z.strictObject({ ...caseId, timerId: idSchema, reason: text }),
  ReminderDelivered: z.strictObject({ ...caseId, notificationId: idSchema }),
  CommandDenied: z.strictObject({ caseId: idSchema.optional(), code: errorSchema.shape.code, attemptedAction: text }),
} as const satisfies Record<keyof EventPayloads, z.ZodType>;
const eventBase = z.strictObject({ contractVersion: z.literal(CONTRACT_VERSION), id: idSchema, type: z.enum(Object.keys(eventPayloadSchemas) as [keyof typeof eventPayloadSchemas, ...(keyof typeof eventPayloadSchemas)[]]), occurredAt: utcSchema, actorId: idSchema, requestId: idSchema, applicationId: idSchema.optional(), caseVersion: version.optional(), causationId: idSchema.optional(), payload: z.unknown() });
export const eventSchema = eventBase.superRefine((event, ctx) => {
  const parsed = eventPayloadSchemas[event.type].safeParse(event.payload);
  if (!parsed.success) { for (const issue of parsed.error.issues) ctx.addIssue({ code: 'custom', path: ['payload', ...issue.path], message: issue.message }); return; }
  if (event.type !== 'CommandDenied' && (!event.applicationId || !event.caseVersion)) ctx.addIssue({ code: 'custom', message: 'Domain events require case ID and version.' });
  if (parsed.data.caseId !== event.applicationId) ctx.addIssue({ code: 'custom', message: 'Envelope and payload case IDs differ.' });
  if (event.type === 'DecisionRecorded') {
    const d = eventPayloadSchemas.DecisionRecorded.parse(event.payload).decision;
    if (d.eventId !== event.id || d.applicationId !== event.applicationId || d.actorId !== event.actorId) ctx.addIssue({ code: 'custom', message: 'Decision references must match envelope.' });
  }
});
export const auditSchema = z.strictObject({ id: idSchema, applicationId: idSchema.optional(), actorId: idSchema, requestId: idSchema, action: text, occurredAt: utcSchema, beforeState: z.enum(CASE_STATES).optional(), afterState: z.enum(CASE_STATES).optional(), caseVersion: version.optional(), policyRevisionId: idSchema.optional(), evidenceVersionIds: ids, reason: text.optional(), causationId: idSchema.optional() });
export const outboxSchema = z.strictObject({ eventId: idSchema, event: eventSchema, attempts: z.number().int().nonnegative(), status: z.enum(['pending', 'delivered', 'failed']) }).refine(o => o.eventId === o.event.id, 'Outbox event ID mismatch');
