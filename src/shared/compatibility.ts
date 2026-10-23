import type { WorkflowStage } from '../types';
import type { CaseState } from './contracts';
/** Presentation compatibility only, never evidence of a legal transition/decision.
 * Lossy/conditional labels deliberately require review instead of inventing state. */
export const LEGACY_STAGE_MAP = {
  Draft: null,
  'Application Submitted': 'submitted',
  'Scrutiny in Progress': 'scrutiny_pending',
  'Deficiency Communicated': 'correction_required',
  'Scrutiny Cleared': null,
  'EVC Scheduled': 'evc_pending',
  'EVC Inspection Completed': null,
  'SAC / SHC Review': null,
  'Executive Committee Approval': null,
  'Approval Issued': null,
  'Application Rejected': 'rejected',
} as const satisfies Record<WorkflowStage, CaseState | null>;
export type StageMapping = { mapped: true; state: CaseState } | { mapped: false; reason: 'UNKNOWN_STAGE' | 'REQUIRES_CONTEXT' };
export function mapLegacyStage(value: string): StageMapping {
  if (!Object.prototype.hasOwnProperty.call(LEGACY_STAGE_MAP, value)) return { mapped: false, reason: 'UNKNOWN_STAGE' };
  const state = LEGACY_STAGE_MAP[value as WorkflowStage];
  return state === null ? { mapped: false, reason: 'REQUIRES_CONTEXT' } : { mapped: true, state };
}
/** Normalize IDs only. Policy, grants and versions cannot be inferred from legacy DTOs. */
export function normalizeLegacyId(value: { id?: unknown; _id?: unknown }): string {
  const id = value.id ?? value._id;
  if (typeof id !== 'string' || !id.trim()) throw new Error('Legacy ID requires an explicit serialized string');
  return id;
}
