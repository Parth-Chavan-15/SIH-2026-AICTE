import type { CorrectionInput, ScrutinySnapshot } from './contracts';

export interface ValidationRejection {
  item: CorrectionInput;
  reason: string;
}

export interface ValidateCorrectionsResult {
  valid: boolean;
  accepted: CorrectionInput[];
  rejected: ValidationRejection[];
}

/**
 * Pure function: Validates proposed correction changes against a signed ScrutinySnapshot.
 * Enforces the server-side scope lock: only items flagged as deficiencies (snapshot.deficiencyItemIds)
 * are permitted to be corrected. Accepted items (like C3) and unrecognized items are rejected.
 */
export function validateCorrections(
  snapshot: ScrutinySnapshot,
  changes: CorrectionInput[]
): ValidateCorrectionsResult {
  if (!changes || changes.length === 0) {
    return {
      valid: true,
      accepted: [],
      rejected: []
    };
  }

  const deficiencySet = new Set(snapshot.deficiencyItemIds || []);
  const accepted: CorrectionInput[] = [];
  const rejected: ValidationRejection[] = [];

  for (const change of changes) {
    if (deficiencySet.has(change.itemId)) {
      accepted.push(change);
    } else {
      rejected.push({
        item: change,
        reason: `SCOPE_VIOLATION: item ${change.itemId} was accepted in signed snapshot round ${snapshot.round}, corrections not permitted`
      });
    }
  }

  return {
    valid: rejected.length === 0,
    accepted,
    rejected
  };
}
