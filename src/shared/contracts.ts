/** Proposed software contracts only. No official authority or runtime implementation. */
export const CONTRACT_VERSION = '0.1.0-proposed' as const;
export type ID = string;
export type ISODate = string;
export const ROLES = ['institution', 'reviewer', 'evc', 'regional_officer', 'bureau_officer', 'policy_admin', 'demo_authority'] as const;
export type Role = typeof ROLES[number];
export const PERMISSIONS = ['case.read', 'case.create', 'case.transition', 'scrutiny.sign', 'scrutiny.correct', 'scrutiny.rescrutinize', 'evc.read', 'evc.schedule', 'evc.report', 'decision.record', 'document.read', 'document.submit', 'document.review', 'policy.read', 'policy.manage', 'history.read', 'dashboard.read', 'notification.read'] as const;
export type Permission = typeof PERMISSIONS[number];
/** scoped: both nonempty grants constrain access (intersection); empty grants deny.
 * global is an explicit server-issued grant, never inferred from a role. */
export interface Actor { id: ID; roles: Role[]; permissions: Permission[]; scope: 'scoped' | 'global'; institutionIds: ID[]; regionIds: ID[]; }
/** Only constructed after authentication; clients cannot submit this as identity. */
export interface CommandContext { actor: Actor; sessionId: ID; requestId: ID; receivedAt: ISODate; }
export const CASE_STATES = ['submitted', 'scrutiny_pending', 'correction_required', 'rescrutiny_pending', 'evc_pending', 'decision_pending', 'approved', 'conditionally_approved', 'rejected', 'policy_review_required'] as const;
export type CaseState = typeof CASE_STATES[number];
export const CASE_ACTIONS = ['start_scrutiny', 'return_deficiencies', 'submit_corrections', 'complete_scrutiny', 'complete_rescrutiny', 'prepare_evc', 'complete_evc', 'send_for_decision'] as const;
export type CaseAction = typeof CASE_ACTIONS[number];
export type EvidenceState = 'submitted' | 'source_status_observed' | 'verified' | 'rejected' | 'superseded';
export type TimerKind = 'academic_calendar_cutoff' | 'event_relative' | 'validity_expiry' | 'internal_demo_sla';
export interface Institution { id: ID; permanentId: string; name: string; regionId: ID; status: 'active' | 'inactive'; }
export interface PolicySource { documentId: ID; title: string; location: string; sourceRevision: string; reviewState: 'interpretation_pending' | 'reviewed'; url?: string; }
export interface PolicyRevision { id: ID; policyKey: string; revision: number; session: string; category: string; source: PolicySource; status: 'draft' | 'reviewed' | 'approved'; effectiveFrom: ISODate; effectiveTo?: ISODate; supersedesId?: ID; conditions: Record<string, unknown>; }
export interface RouteExplanation { policyRevisionId?: ID; session: string; category: string; evaluatedFacts: Record<string, unknown>; result: 'selected' | 'review_required'; stages: CaseState[]; reasons: string[]; sources: PolicySource[]; reviewReasons?: string[]; }
/** Canonical transport DTO for the existing Application aggregate, not another DB model. */
export interface Application { id: ID; reference: string; institutionId: ID; regionId: ID; category: string; session: string; facts: Record<string, unknown>; policyRevisionId?: ID; state: CaseState; route: RouteExplanation; version: number; ownerId?: ID; stageEnteredAt: ISODate; createdAt: ISODate; updatedAt: ISODate; }
export interface CreateCommand { idempotencyKey: string; }
export interface CommandBase extends CreateCommand { expectedVersion: number; reason?: string; }
export interface IntakeCommand extends CreateCommand { institutionId: ID; category: string; session: string; facts: Record<string, unknown>; evidenceVersionIds: ID[]; }
export interface TransitionCommand extends CommandBase { action: CaseAction; evidenceVersionIds: ID[]; }
export interface ScrutinyItem { itemId: ID; result: 'accepted' | 'deficient'; reason?: string; evidenceVersionIds: ID[]; }
export interface ScrutinySnapshot { id: ID; applicationId: ID; round: number; checklistVersion: string; items: ScrutinyItem[]; deficiencyItemIds: ID[]; signedBy: ID; signedAt: ISODate; }
export interface SignScrutinyCommand extends CommandBase { checklistVersion: string; items: ScrutinyItem[]; }
export interface CorrectionInput { itemId: ID; evidenceVersionIds: ID[]; response: string; }
export interface CorrectionCommand extends CommandBase { snapshotId: ID; changes: CorrectionInput[]; }
export interface RescrutinyCommand extends CommandBase { snapshotId: ID; outcomes: { itemId: ID; result: 'accepted' | 'deficient'; reason?: string }[]; }
export interface EVCTask { id: ID; applicationId: ID; prerequisiteEventId: ID; policyRevisionId: ID; assigneeIds: ID[]; scheduledAt?: ISODate; version: number; status: 'pending' | 'scheduled' | 'completed' | 'canceled'; reportVersionId?: ID; }
export interface ScheduleEVCCommand extends CommandBase { scheduledAt: ISODate; assigneeIds: ID[]; }
export interface EVCReportCommand extends CommandBase { evidenceVersionIds: ID[]; summary: string; recommendation: 'recommended' | 'conditional' | 'not_recommended'; }
export interface ConditionInput { conditionKey: string; policyRevisionId: ID; source: PolicySource; obligationType: string; triggerEventId: ID; timerKind: TimerKind; dueAt: ISODate; dueReason: string; }
export interface DecisionCommand extends CommandBase { outcome: 'approved' | 'conditional' | 'rejected'; evidenceVersionIds: ID[]; conditions: ConditionInput[]; }
export interface Decision { id: ID; applicationId: ID; actorId: ID; outcome: DecisionCommand['outcome']; policyRevisionId: ID; source: PolicySource; decidedAt: ISODate; eventId: ID; evidenceVersionIds: ID[]; conditions: ConditionInput[]; }
export interface Obligation { id: ID; applicationId: ID; decisionEventId: ID; conditionKey: string; institutionId: ID; policyRevisionId: ID; triggerEventId: ID; source: PolicySource; timerKind: TimerKind; dueAt: ISODate; dueReason: string; reviewerId?: ID; version: number; status: 'pending' | 'submitted' | 'verified' | 'rejected' | 'closed'; }
/** Safe scoped metadata. Storage keys, signed URLs and bytes never belong in this DTO. */
export interface DocumentVersion { id: ID; documentId: ID; version: number; applicationId: ID; obligationId?: ID; fileName: string; mediaType: string; byteSize: number; receivedAt: ISODate; validFrom?: ISODate; validTo?: ISODate; supersedesId?: ID; status: EvidenceState; reviewedBy?: ID; reviewedAt?: ISODate; }
export interface DocumentUploadCommand extends CreateCommand { applicationId: ID; obligationId?: ID; supersedesId?: ID; }
export interface EvidenceReviewCommand extends CommandBase { documentVersionId: ID; outcome: 'verified' | 'rejected'; remarks: string; }
export interface LoginRequest { email: string; password: string; }
/** Session transport (cookie vs bearer) remains an ADR; never return password/hash. */
export interface SessionResponse { actor: Actor; expiresAt: ISODate; }
export interface AuditEvent { id: ID; applicationId?: ID; actorId: ID; requestId: ID; action: string; occurredAt: ISODate; beforeState?: CaseState; afterState?: CaseState; caseVersion?: number; policyRevisionId?: ID; evidenceVersionIds: ID[]; reason?: string; causationId?: ID; }
export interface EventPayloads {
  CaseSubmitted: { caseId: ID; policyRevisionId?: ID };
  CaseTransitioned: { caseId: ID; action: CaseAction; beforeState: CaseState; afterState: CaseState };
  ScrutinySigned: { caseId: ID; snapshotId: ID };
  CorrectionSubmitted: { caseId: ID; snapshotId: ID };
  RescrutinyCompleted: { caseId: ID; snapshotId: ID };
  EVCTaskCreated: { caseId: ID; evcTaskId: ID; prerequisiteEventId: ID };
  EVCScheduled: { caseId: ID; evcTaskId: ID };
  EVCReportSubmitted: { caseId: ID; evcTaskId: ID; reportVersionId: ID };
  DecisionRecorded: { caseId: ID; decision: Decision };
  ObligationCreated: { caseId: ID; obligationId: ID; decisionEventId: ID; conditionKey: string; policyRevisionId: ID };
  EvidenceSubmitted: { caseId: ID; documentVersionId: ID };
  EvidenceReviewed: { caseId: ID; documentVersionId: ID; outcome: 'verified' | 'rejected' };
  DocumentSuperseded: { caseId: ID; documentId: ID; oldVersionId: ID; newVersionId: ID };
  TimerCanceled: { caseId: ID; timerId: ID; reason: string };
  ReminderDelivered: { caseId: ID; notificationId: ID };
  CommandDenied: { caseId?: ID; code: ErrorCode; attemptedAction: string };
}
export type EventType = keyof EventPayloads;
export type EventEnvelope<K extends EventType = EventType> = { [T in K]: {
  contractVersion: typeof CONTRACT_VERSION; id: ID; type: T; occurredAt: ISODate; actorId: ID; requestId: ID;
  causationId?: ID; payload: EventPayloads[T];
} & (T extends 'CommandDenied' ? { applicationId?: ID; caseVersion?: number } : { applicationId: ID; caseVersion: number }) }[K];
export interface Outbox { eventId: ID; event: EventEnvelope; attempts: number; status: 'pending' | 'delivered' | 'failed'; }
export interface Timer { id: ID; obligationId: ID; obligationVersion: number; generation: number; kind: TimerKind; originEventId: ID; policyRevisionId?: ID; dueAt: ISODate; dedupeKey: string; status: 'active' | 'canceled' | 'fired'; }
export interface Notification { id: ID; recipientId: ID; eventId: ID; dedupeKey: string; explanation: string; readAt?: ISODate; }
export const ERROR_STATUS = { UNAUTHENTICATED: 401, FORBIDDEN: 403, SCOPE_VIOLATION: 403, NOT_FOUND: 404, VERSION_CONFLICT: 409, PRECONDITION_FAILED: 409, POLICY_REVIEW_REQUIRED: 409, IDEMPOTENCY_CONFLICT: 409, VALIDATION_FAILED: 422, FILE_TOO_LARGE: 413, UNSUPPORTED_MEDIA_TYPE: 415, STORAGE_UNAVAILABLE: 503 } as const;
export type ErrorCode = keyof typeof ERROR_STATUS;
export interface ApiError { code: ErrorCode; message: string; failedRule?: string; currentVersion?: number; issues?: { path: string; message: string }[]; }
export type ApiResult<T> = { success: true; data: T; eventId?: ID } | { success: false; error: ApiError };
export interface CommandResult { application: Application; eventId: ID; }
export interface Page<T> { items: T[]; nextCursor?: string; total?: number; }
export interface DashboardSummary { casesByState: Partial<Record<CaseState, number>>; activeEvcTasks: number; pendingObligations: number; dueSoon: number; overdue: number; asOf: ISODate; scope: Pick<Actor, 'scope' | 'institutionIds' | 'regionIds'>; }
