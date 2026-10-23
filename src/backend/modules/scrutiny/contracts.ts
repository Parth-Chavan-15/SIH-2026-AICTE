/** PS26262 proposed contract v0.1.0; review/merge via PR0. NOT a functioning backend. */
export const CONTRACT_VERSION = '0.1.0-proposed' as const;
export type ID = string;
export type ISODate = string;
export type Role = 'institution' | 'reviewer' | 'evc' | 'regional_officer' | 'bureau_officer' | 'policy_admin' | 'demo_authority';
export type CaseState = 'submitted' | 'scrutiny_pending' | 'correction_required' | 'rescrutiny_pending' | 'evc_pending' | 'decision_pending' | 'approved' | 'conditionally_approved' | 'rejected' | 'policy_review_required';
export type CaseAction = 'start_scrutiny' | 'return_deficiencies' | 'submit_corrections' | 'complete_scrutiny' | 'complete_rescrutiny' | 'prepare_evc' | 'complete_evc' | 'send_for_decision';
export type EvidenceState = 'submitted' | 'verified' | 'rejected' | 'superseded';
export type TimerKind = 'academic_calendar_cutoff' | 'event_relative' | 'validity_expiry' | 'internal_demo_sla';
export type PolicyDecision = 'selected' | 'review_required';

export interface Actor { id:ID; roles:Role[]; institutionIds:ID[]; regionIds:ID[]; permissions:string[]; }
export interface Institution { id:ID; permanentId:string; name:string; regionId:ID; status:'active'|'inactive'; }
export interface PolicySource { documentId:string; title:string; location:string; url?:string; sourceRevision?:string; }
export interface PolicyRevision { id:ID; policyKey:string; revision:number; session:string; category:string; source:PolicySource; status:'draft'|'reviewed'|'approved'; effectiveFrom:ISODate; effectiveTo?:ISODate; supersedesId?:ID; conditions:Record<string,unknown>; }
export interface RouteExplanation { policyRevisionId:ID; session:string; evaluatedFacts:Record<string,unknown>; result:PolicyDecision; stages:CaseState[]; reasons:string[]; sources:PolicySource[]; reviewReasons?:string[]; }
export interface Application { id:ID; reference:string; institutionId:ID; category:string; session:string; regionId:ID; facts:Record<string,unknown>; policyRevisionId?:ID; state:CaseState; route:RouteExplanation; version:number; ownerId?:ID; stageEnteredAt:ISODate; createdAt:ISODate; updatedAt:ISODate; }
export interface CommandBase { expectedVersion:number; idempotencyKey:string; reason?:string; }
export interface TransitionCommand extends CommandBase { action:CaseAction; evidenceVersionIds:ID[]; }
export interface IntakeCommand { institutionId:ID; category:string; session:string; facts:Record<string,unknown>; evidenceVersionIds:ID[]; idempotencyKey:string; }
export interface ScrutinyItem { itemId:ID; result:'accepted'|'deficient'; reason?:string; evidenceVersionIds:ID[]; }
export interface ScrutinySnapshot { id:ID; applicationId:ID; round:number; checklistVersion:string; items:ScrutinyItem[]; deficiencyItemIds:ID[]; signedBy:ID; signedAt:ISODate; }
export interface SignScrutinyCommand extends CommandBase { checklistVersion:string; items:ScrutinyItem[]; }
export interface CorrectionInput { itemId:ID; evidenceVersionIds:ID[]; response:string; }
export interface CorrectionCommand extends CommandBase { snapshotId:ID; changes:CorrectionInput[]; }
export interface RescrutinyCommand extends CommandBase { snapshotId:ID; outcomes:{itemId:ID; result:'accepted'|'deficient'; reason?:string}[]; }
export interface EVCTask { id:ID; applicationId:ID; prerequisiteEventId:ID; policyRevisionId:ID; assigneeIds:ID[]; scheduledAt?:ISODate; version:number; status:'pending'|'scheduled'|'completed'|'canceled'; reportVersionId?:ID; }
export interface EVCReportCommand extends CommandBase { evidenceVersionIds:ID[]; summary:string; recommendation:'recommended'|'conditional'|'not_recommended'; }
export interface ConditionInput { conditionKey:string; policyRevisionId:ID; obligationType:string; triggerEventId?:ID; dueAt:ISODate; dueReason:string; }
export interface DecisionCommand extends CommandBase { outcome:'approved'|'conditional'|'rejected'; evidenceVersionIds:ID[]; conditions:ConditionInput[]; }
export interface Decision { id:ID; applicationId:ID; actorId:ID; outcome:DecisionCommand['outcome']; decidedAt:ISODate; eventId:ID; conditionKeys:string[]; }
export interface Obligation { id:ID; applicationId:ID; decisionEventId:ID; conditionKey:string; institutionId:ID; policyRevisionId:ID; triggerEventId:ID; dueAt:ISODate; dueReason:string; reviewerId?:ID; version:number; status:'pending'|'submitted'|'verified'|'rejected'|'closed'; }
export interface DocumentVersion { id:ID; documentId:ID; version:number; applicationId:ID; obligationId?:ID; storageKey:string; fileName:string; mediaType:string; byteSize:number; receivedAt:ISODate; validFrom?:ISODate; validTo?:ISODate; supersedesId?:ID; status:EvidenceState; reviewedBy?:ID; reviewedAt?:ISODate; }
export interface EvidenceReviewCommand extends CommandBase { documentVersionId:ID; outcome:'verified'|'rejected'; remarks:string; }
export interface AuditEvent { id:ID; applicationId:ID; actorId:ID; action:string; occurredAt:ISODate; beforeState?:CaseState; afterState?:CaseState; caseVersion:number; policyRevisionId?:ID; evidenceVersionIds:ID[]; reason?:string; causationId?:ID; }
export interface EventPayloads {
  CaseSubmitted:{caseId:ID; policyRevisionId?:ID}; ScrutinySigned:{caseId:ID; snapshotId:ID};
  CorrectionSubmitted:{caseId:ID; snapshotId:ID}; RescrutinyCompleted:{caseId:ID; snapshotId:ID};
  EVCTaskCreated:{caseId:ID; evcTaskId:ID}; EVCScheduled:{caseId:ID; evcTaskId:ID};
  EVCReportSubmitted:{caseId:ID; evcTaskId:ID}; DecisionRecorded:{caseId:ID; decisionId:ID; outcome:Decision['outcome']};
  ObligationCreated:{caseId:ID; obligationId:ID; decisionEventId:ID}; EvidenceSubmitted:{caseId:ID; documentVersionId:ID};
  EvidenceReviewed:{caseId:ID; documentVersionId:ID}; DocumentSuperseded:{caseId:ID; documentId:ID; oldVersionId:ID; newVersionId:ID};
  TimerCanceled:{caseId:ID; timerId:ID; reason:string}; ReminderDelivered:{caseId:ID; notificationId:ID};
  CommandDenied:{caseId?:ID; code:string; attemptedAction:string};
}
export type EventType = keyof EventPayloads;
export type EventEnvelope<K extends EventType = EventType> = { [T in K]:{ id:ID; type:T; occurredAt:ISODate; actorId:ID; applicationId?:ID; caseVersion?:number; causationId?:ID; payload:EventPayloads[T] } }[K];
export interface Timer { id:ID; obligationId:ID; obligationVersion:number; generation:number; kind:TimerKind; originEventId:ID; policyRevisionId?:ID; dueAt:ISODate; dedupeKey:string; status:'active'|'canceled'|'fired'; }
export interface Outbox { eventId:ID; type:EventType; payload:Record<string,unknown>; attempts:number; status:'pending'|'delivered'|'failed'; }
export interface Notification { id:ID; recipientId:ID; eventId:ID; dedupeKey:string; explanation:string; readAt?:ISODate; }
export type ErrorCode = 'UNAUTHENTICATED'|'FORBIDDEN'|'SCOPE_VIOLATION'|'NOT_FOUND'|'VERSION_CONFLICT'|'PRECONDITION_FAILED'|'POLICY_REVIEW_REQUIRED'|'IDEMPOTENCY_CONFLICT'|'VALIDATION_FAILED'|'FILE_TOO_LARGE'|'UNSUPPORTED_MEDIA_TYPE'|'STORAGE_UNAVAILABLE';
export interface ApiError { code:ErrorCode; message:string; failedRule?:string; currentVersion?:number; }
export type ApiResult<T> = {success:true;data:T;eventId?:ID}|{success:false;error:ApiError};
export interface CommandResult { application:Application; eventId:ID; }
export interface Page<T> { items:T[]; nextCursor?:string; total?:number; }
export interface DashboardSummary { casesByState:Partial<Record<CaseState,number>>; activeEvcTasks:number; pendingObligations:number; dueSoon:number; overdue:number; asOf:ISODate; scope:{institutionIds:ID[];regionIds:ID[]}; }
