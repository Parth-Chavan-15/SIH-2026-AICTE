import type { EVCTask, RouteExplanation } from '../scrutiny/contracts';

export interface SignedPrerequisites {
  scrutinyComplete: boolean;
  snapshotId?: string;
}

export interface EVCEligibilityResult {
  eligible: boolean;
  reason: string;
}

/**
 * Pure function: Evaluates whether an application qualifies for an Expert Visit Committee (EVC) task.
 * 
 * Rules:
 * a. If route.stages does NOT include 'evc_pending' -> ineligible ("Route does not require EVC")
 * b. If signedPrerequisites.scrutinyComplete is false -> ineligible ("Scrutiny prerequisites not yet signed")
 * c. If activeTasksForCase has any task with status 'pending' or 'scheduled' -> ineligible ("Active EVC task already exists for this case")
 * d. Otherwise -> eligible ("Case qualifies for EVC per route and signed prerequisites")
 */
export function evcEligible(
  route: RouteExplanation,
  signedPrerequisites: SignedPrerequisites,
  activeTasksForCase: EVCTask[] = []
): EVCEligibilityResult {
  if (!route || !route.stages || !route.stages.includes('evc_pending')) {
    return {
      eligible: false,
      reason: 'Route does not require EVC'
    };
  }

  if (!signedPrerequisites || !signedPrerequisites.scrutinyComplete) {
    return {
      eligible: false,
      reason: 'Scrutiny prerequisites not yet signed'
    };
  }

  const hasActiveTask = activeTasksForCase.some(
    task => task.status === 'pending' || task.status === 'scheduled'
  );

  if (hasActiveTask) {
    return {
      eligible: false,
      reason: 'Active EVC task already exists for this case'
    };
  }

  return {
    eligible: true,
    reason: 'Case qualifies for EVC per route and signed prerequisites'
  };
}
