/** Dependency injection ports. Implementations here are proposals, not repo code. */
import type {Actor, Application, AuditEvent, CommandResult, CorrectionCommand, DecisionCommand, DocumentVersion, EVCTask, EVCReportCommand, EventEnvelope, ID, Obligation, RouteExplanation, ScrutinySnapshot, SignScrutinyCommand, RescrutinyCommand, ApiResult, DashboardSummary} from './contracts';

/** Opaque wrapper: production must hold *one real Mongo session* for every participant. */
export interface TransactionContext {
  actor:Actor; application:Application; transactionId:ID;
  emit(event:EventEnvelope):void;
  /** Validated transactional writes; implementation must be atomic and uniqueness-guarded. */
  saveCase(application:Application):Promise<void>;
  saveObligation(obligation:Obligation):Promise<void>;
}
export interface CorePort {
  getActor():Promise<Actor>;
  getApplication(caseId:ID):Promise<Application>;
  getRouteExplanation(caseId:ID):Promise<RouteExplanation>;
  /** For tests: not permission to commit a fake transaction as real persistence. */
  withCaseTransaction<T>(caseId:ID, fn:(tx:TransactionContext)=>Promise<T>):Promise<T>;
}
export interface ScrutinyPort {
  sign(applicationId:ID, command:SignScrutinyCommand):Promise<ApiResult<ScrutinySnapshot>>;
  correct(applicationId:ID, command:CorrectionCommand):Promise<ApiResult<CommandResult>>;
  rescrutinize(applicationId:ID, command:RescrutinyCommand):Promise<ApiResult<CommandResult>>;
}
export interface EVCPort {
  getQueue():Promise<ApiResult<EVCTask[]>>;
  schedule(taskId:ID, at:string, expectedVersion:number, idempotencyKey:string):Promise<ApiResult<EVCTask>>;
  report(taskId:ID, command:EVCReportCommand):Promise<ApiResult<EVCTask>>;
}
export interface DecisionObligationParticipant {
  /** Invoked from M1 decision service *before transaction commit*. No follow-up HTTP for creation. */
  materialize(tx:TransactionContext, decisionCommand:DecisionCommand, decisionEventId:ID):Promise<Obligation[]>;
}
export interface DocumentPort {
  getVersion(id:ID):Promise<ApiResult<DocumentVersion>>;
  review(id:ID, outcome:'verified'|'rejected', remarks:string, expectedVersion:number, idempotencyKey:string):Promise<ApiResult<DocumentVersion>>;
}
export interface DashboardPort { summary():Promise<ApiResult<DashboardSummary>>; }
export interface TimerPort { consumeCommittedEvent(event:EventEnvelope):Promise<void>; }
