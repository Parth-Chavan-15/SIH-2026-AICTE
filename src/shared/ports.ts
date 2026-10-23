/** Interfaces only. Production adapters must bind every repository to one real session. */
import type { Actor, Application, ApiResult, AuditEvent, CommandBase, CommandContext, CommandResult, CorrectionCommand, DashboardSummary, Decision, DecisionCommand, DocumentVersion, EvidenceReviewCommand, EVCTask, EVCReportCommand, EventEnvelope, ID, Obligation, Outbox, RouteExplanation, ScheduleEVCCommand, ScrutinySnapshot, SignScrutinyCommand, RescrutinyCommand } from './contracts';
import type { IntakeCommand, TransitionCommand } from './contracts';
export interface TransactionRepositories {
  cases: { save(application: Application): Promise<void> };
  decisions: { insert(decision: Decision): Promise<void> };
  obligations: { insert(obligation: Obligation): Promise<void> };
  scrutiny: { insert(snapshot: ScrutinySnapshot): Promise<void> };
  evc: { save(task: EVCTask): Promise<void> };
  audit: { append(event: AuditEvent): Promise<void> };
  outbox: { append(record: Outbox): Promise<void> };
}
/** Never serialize. All operations share the adapter's session and expire at callback exit.
 * A transactionId is correlation only. No participant may commit, publish or start HTTP work. */
export interface TransactionContext {
  readonly context: CommandContext;
  readonly actor: Actor;
  readonly application: Application;
  readonly transactionId: ID;
  readonly mode: 'mock' | 'database';
  readonly repositories: TransactionRepositories;
  emit(event: EventEnvelope): Promise<void>;
}
export interface CaseCommandBoundary extends CommandBase { context: CommandContext; operation: string; requestFingerprint: string; }
/** Authenticate/scope first; key=(actor,case,operation,key). Replay same fingerprint BEFORE
 * stale-version rejection; changed fingerprint ->409. Store result/key in same transaction.
 * Callback can retry: no external side effects. Intake uses a separate create boundary. */
export interface CorePort {
  getActor(): Promise<Actor>;
  getApplication(caseId: ID): Promise<Application>;
  getRouteExplanation(caseId: ID): Promise<RouteExplanation>;
  withCaseTransaction<T>(caseId: ID, command: CaseCommandBoundary, work: (tx: TransactionContext) => Promise<T>): Promise<T>;
}
/** Intake dedupes by actor+institution+operation+key and needs no existing version. */
export interface IntakePort { create(context: CommandContext, command: IntakeCommand): Promise<ApiResult<CommandResult>>; }
export interface ScrutinyPort {
  sign(applicationId: ID, command: SignScrutinyCommand): Promise<ApiResult<ScrutinySnapshot>>;
  correct(applicationId: ID, command: CorrectionCommand): Promise<ApiResult<CommandResult>>;
  rescrutinize(applicationId: ID, command: RescrutinyCommand): Promise<ApiResult<CommandResult>>;
}
export interface EVCPort {
  getQueue(): Promise<ApiResult<EVCTask[]>>;
  schedule(taskId: ID, command: ScheduleEVCCommand): Promise<ApiResult<EVCTask>>;
  report(taskId: ID, command: EVCReportCommand): Promise<ApiResult<EVCTask>>;
}
export type PrerequisiteResult = { allowed: true; prerequisiteEventIds: ID[] } | { allowed: false; failedRule: string; reason: string };
/** M1 implements named-action/state/pinned-route/permission/evidence guards later.
 * Terminal outcomes are deliberately absent from TransitionCommand.action. */
export interface WorkflowGuardPort { assertTransition(tx: TransactionContext, command: TransitionCommand): Promise<PrerequisiteResult>; }
/** M2 implements scoped, session-bound checks/writes. M1 supplies the transaction. */
export interface ScrutinyPrerequisitePort {
  assertScrutinyComplete(tx: TransactionContext): Promise<PrerequisiteResult>;
  assertEVCEligible(tx: TransactionContext): Promise<PrerequisiteResult>;
  assertEVCComplete(tx: TransactionContext): Promise<PrerequisiteResult>;
}
export interface DecisionObligationParticipant {
  /** M3 writes through tx.repositories before commit, unique(decisionEventId,conditionKey).
   * Failure aborts decision/case/audit/outbox together. Never delayed HTTP materialization. */
  materialize(tx: TransactionContext, command: DecisionCommand, decisionEventId: ID): Promise<Obligation[]>;
}
export interface DocumentPort {
  getVersion(id: ID): Promise<ApiResult<DocumentVersion>>;
  review(id: ID, command: EvidenceReviewCommand): Promise<ApiResult<DocumentVersion>>;
}
export interface DashboardPort { summary(): Promise<ApiResult<DashboardSummary>>; }
export interface TimerPort { consumeCommittedEvent(event: EventEnvelope): Promise<void>; }
