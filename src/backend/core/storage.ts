import type { Actor, Application, AuditEvent, CommandResult, Institution, Outbox, PolicyRevision } from '../../shared/contracts';
import type { TransactionContext } from '../../shared/ports';
import type { ApiError } from '../../shared/contracts';
export class CoreError extends Error {
  constructor(public code: ApiError['code'], message: string, public currentVersion?: number) { super(message); }
}
export const unavailable = () => new CoreError('STORAGE_UNAVAILABLE', 'Authoritative storage unavailable');
export interface Receipt { key: string; fingerprint: string; result: CommandResult; }
/** Every method on a unit uses the same real session in the Mongo adapter. */
export interface Unit {
  institution(id: string): Promise<Institution | null>;
  policy(id: string): Promise<PolicyRevision | null>;
  policies?(session: string, category: string): Promise<PolicyRevision[]>;
  get(actor: Actor, id: string): Promise<Application | null>;
  receipt(key: string): Promise<Receipt | null>;
  remember(receipt: Receipt): Promise<void>;
  insert(application: Application): Promise<void>;
  save(application: Application, expectedVersion: number): Promise<void>;
  audit(event: AuditEvent): Promise<void>;
  outbox(event: Outbox): Promise<void>;
  /** Implementations close over the unit session; no participant can commit. */
  context(context: TransactionContext['context'], app: Application): TransactionContext;
}
export interface CaseStorage {
  ready(): Promise<void>;
  transaction<T>(work: (unit: Unit) => Promise<T>): Promise<T>;
  get(actor: Actor, id: string): Promise<Application | null>;
  list(actor: Actor): Promise<Application[]>;
  history(actor: Actor, id?: string): Promise<AuditEvent[]>;
}
