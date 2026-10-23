import { z } from 'zod';
import { idSchema } from '../../shared/schemas';
import type { TransactionContext } from '../../shared/ports';
import { CoreError } from './storage';

const attestation = z.strictObject({ allowed: z.literal(true), prerequisiteEventIds: z.array(idSchema).min(1).refine(ids => new Set(ids).size === ids.length) });
/** Structural validation only; trusted M2 readers must establish provenance. */
export function prerequisiteIds(value: unknown): string[] {
  const parsed = attestation.safeParse(value);
  if (!parsed.success) throw new CoreError('PRECONDITION_FAILED', 'Valid signed prerequisite references required');
  return parsed.data.prerequisiteEventIds;
}
/** Readers receive detached metadata and no write capabilities. Not a native session API. */
export function readerContext(tx: TransactionContext): TransactionContext {
  const deny = async () => { throw new CoreError('PRECONDITION_FAILED', 'Prerequisite readers cannot write'); };
  // Allowlist the canonical fields: spreading an adapter extension could copy a
  // private write handle or invoke an unrelated enumerable getter.
  return { transactionId: tx.transactionId, mode: tx.mode, context: structuredClone(tx.context), actor: structuredClone(tx.actor), application: structuredClone(tx.application), repositories: { cases: { save: deny }, decisions: { insert: deny }, obligations: { insert: deny }, scrutiny: { insert: deny }, evc: { save: deny }, audit: { append: deny }, outbox: { append: deny } }, emit: deny };
}
