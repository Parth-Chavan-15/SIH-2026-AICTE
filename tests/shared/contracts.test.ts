import { describe, expect, it } from 'vitest';
import cases from './fixtures/cases.json';
import events from './fixtures/events.json';
import responses from './fixtures/responses.json';
import { CONTRACT_VERSION, ERROR_STATUS, type Application, type EventEnvelope, type EventPayloads, type DecisionCommand } from '../../src/shared/contracts';
import { actorSchema, apiResultSchema, applicationSchema, auditSchema, decisionCommandSchema, decisionSchema, documentVersionSchema, eventPayloadSchemas, eventSchema, idSchema, intakeSchema, outboxSchema, transitionSchema, utcSchema } from '../../src/shared/schemas';
import { endpoints, paths, type RequestOf, type ResponseOf } from '../../src/shared/endpointMap';
import { LEGACY_STAGE_MAP, mapLegacyStage, normalizeLegacyId } from '../../src/shared/compatibility';

describe('PR0 proposed structural contracts (not service authorization)', () => {
  it('accepts complete synthetic DTOs and one canonical envelope', () => {
    const consumer: Application = applicationSchema.parse(cases.applications[0]);
    expect(consumer.version).toBe(1);
    for (const app of cases.applications) expect(applicationSchema.safeParse(app).success).toBe(true);
    expect(actorSchema.safeParse(cases.actor).success).toBe(true);
    const response = apiResultSchema(applicationSchema);
    for (const key of ['success', 'reviewRequired', 'stale'] as const) expect(response.safeParse(responses[key]).success).toBe(true);
    expect(response.safeParse({ success: false, message: 'legacy envelope' }).success).toBe(false);
  });
  it('rejects arbitrary/final stages and requires versions only for mutations', () => {
    const create: RequestOf<'createApplication'> = { institutionId: 'SYN-INST-W', category: 'example', session: '2026-27', facts: {}, evidenceVersionIds: [], idempotencyKey: 'SYN-CREATE' };
    expect(intakeSchema.safeParse(create).success).toBe(true);
    expect(intakeSchema.safeParse({ ...create, expectedVersion: 1 }).success).toBe(false);
    const command = { expectedVersion: 1, idempotencyKey: 'SYN-KEY', evidenceVersionIds: [], action: 'start_scrutiny' };
    expect(transitionSchema.safeParse(command).success).toBe(true);
    for (const invalid of [{ ...command, action: 'approve' }, { ...command, targetStage: 'Approval Issued' }, { ...command, expectedVersion: 0 }, { ...command, expectedVersion: 1.5 }, { ...command, expectedVersion: undefined }]) expect(transitionSchema.safeParse(invalid).success).toBe(false);
  });
  it('checks source/revision consistency without interpreting policy rules', () => {
    const app = structuredClone(cases.applications[0]);
    expect(applicationSchema.safeParse({ ...app, state: 'approved' }).success).toBe(false);
    expect(applicationSchema.safeParse({ ...app, policyRevisionId: 'OTHER' }).success).toBe(false);
    expect(applicationSchema.safeParse({ ...app, route: { ...app.route, result: 'selected', policyRevisionId: 'SYN-REV', stages: ['scrutiny_pending'] } }).success).toBe(false);
  });
  it('validates discriminated event payloads and decision references', () => {
    const payloadNames = eventPayloadSchemas satisfies Record<keyof EventPayloads, unknown>;
    expect(Object.keys(payloadNames)).toHaveLength(16);
    for (const event of events.events) expect(eventSchema.safeParse(event).success).toBe(true);
    expect(auditSchema.safeParse(events.audit).success).toBe(true);
    expect(outboxSchema.safeParse(events.outbox).success).toBe(true);
    const denial: EventEnvelope<'CommandDenied'> = { contractVersion: CONTRACT_VERSION, id: 'SYN-DENIAL', type: 'CommandDenied', occurredAt: '2026-10-23T09:00:00Z', actorId: 'SYN-ACTOR', requestId: 'SYN-REQUEST', payload: { code: 'FORBIDDEN', attemptedAction: 'decision.record' } };
    expect(eventSchema.safeParse(denial).success).toBe(true);
    const event = events.events[0];
    expect(eventSchema.safeParse({ ...event, applicationId: 'OTHER' }).success).toBe(false);
    expect(eventSchema.safeParse({ ...event, type: 'ScrutinySigned' }).success).toBe(false);
    expect(eventSchema.safeParse({ ...event, caseVersion: undefined }).success).toBe(false);
    expect(outboxSchema.safeParse({ eventId: event.id, event, attempts: 0, status: 'pending' }).success).toBe(true);
    expect(outboxSchema.safeParse({ eventId: 'OTHER', event, attempts: 0, status: 'pending' }).success).toBe(false);
  });
  it('requires conditional obligation context and forbids duplicate condition keys', () => {
    const d = decisionSchema.parse(events.events[0].payload.decision);
    const command: DecisionCommand = { expectedVersion: 1, idempotencyKey: 'SYN', outcome: 'conditional', evidenceVersionIds: d.evidenceVersionIds, conditions: decisionCommandSchema.shape.conditions.parse(d.conditions) };
    expect(decisionCommandSchema.safeParse(command).success).toBe(true);
    expect(decisionCommandSchema.safeParse({ ...command, conditions: [] }).success).toBe(false);
    expect(decisionCommandSchema.safeParse({ ...command, outcome: 'approved' }).success).toBe(false);
    expect(decisionCommandSchema.safeParse({ ...command, conditions: [...command.conditions, ...command.conditions] }).success).toBe(false);
  });
  it('excludes private storage metadata and validates IDs and UTC dates', () => {
    const metadata = { id: 'SYN-V1', documentId: 'SYN-DOC', version: 1, applicationId: 'SYN-CASE-1', fileName: 'fictional.txt', mediaType: 'text/plain', byteSize: 3, receivedAt: '2026-10-23T09:00:00.000Z', status: 'submitted' };
    expect(documentVersionSchema.safeParse(metadata).success).toBe(true);
    expect(documentVersionSchema.safeParse({ ...metadata, storageKey: 'private/path' }).success).toBe(false);
    expect(idSchema.safeParse('  ').success).toBe(false);
    expect(utcSchema.safeParse('2026-10-23T09:00:00+05:30').success).toBe(false);
    expect(utcSchema.safeParse('2026-99-23T09:00:00Z').success).toBe(false);
  });
  it('provides typed method/path definitions with safe path segments', () => {
    const response: ResponseOf<'getApplication'> = { success: true, data: applicationSchema.parse(cases.applications[0]) };
    expect(response.success).toBe(true);
    expect(paths.application('id/a?b')).toBe('/applications/id%2Fa%3Fb');
    expect(endpoints.notificationRead.method).toBe('PATCH');
    expect(endpoints.documentContent.transport).toBe('binary');
    expect(ERROR_STATUS.VERSION_CONFLICT).toBe(409);
    expect(ERROR_STATUS.VALIDATION_FAILED).toBe(422);
    expect(ERROR_STATUS.STORAGE_UNAVAILABLE).toBe(503);
    // @ts-expect-error API mutation requires expectedVersion, unlike intake.
    const invalid: RequestOf<'transition'> = { action: 'start_scrutiny', evidenceVersionIds: [], idempotencyKey: 'SYN' };
    expect(invalid).toBeDefined();
  });
  it('flags lossy legacy states and never invents approval authority', () => {
    for (const stage of Object.keys(LEGACY_STAGE_MAP)) expect(mapLegacyStage(stage)).toBeDefined();
    expect(mapLegacyStage('Application Submitted')).toEqual({ mapped: true, state: 'submitted' });
    for (const stage of ['Approval Issued', 'Executive Committee Approval', 'Scrutiny Cleared', 'SAC / SHC Review']) expect(mapLegacyStage(stage)).toEqual({ mapped: false, reason: 'REQUIRES_CONTEXT' });
    expect(mapLegacyStage('unknown')).toEqual({ mapped: false, reason: 'UNKNOWN_STAGE' });
    expect(mapLegacyStage('__proto__')).toEqual({ mapped: false, reason: 'UNKNOWN_STAGE' });
    expect(normalizeLegacyId({ _id: 'SYN' })).toBe('SYN');
    expect(() => normalizeLegacyId({ _id: {} })).toThrow();
  });
});
