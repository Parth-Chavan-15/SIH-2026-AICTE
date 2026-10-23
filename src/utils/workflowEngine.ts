import { WorkflowRouteType, WorkflowStage, UserRole } from '../types';

export interface NextStageOption {
  stage: WorkflowStage;
  actionLabel: string;
  actionType: 'advance' | 'return' | 'reject';
  requiresMandatoryReason: boolean;
  requiredRole: UserRole[];
  description: string;
}

export function getEligibleNextStages(
  currentStage: WorkflowStage,
  routeType: WorkflowRouteType
): NextStageOption[] {
  switch (currentStage) {
    case 'Draft':
      return [
        {
          stage: 'Application Submitted',
          actionLabel: 'Submit Application to AICTE',
          actionType: 'advance',
          requiresMandatoryReason: false,
          requiredRole: ['institution', 'admin'],
          description: 'Lock application fields and submit for Regional Officer Scrutiny',
        },
      ];

    case 'Application Submitted':
      return [
        {
          stage: 'Scrutiny in Progress',
          actionLabel: 'Initiate Scrutiny',
          actionType: 'advance',
          requiresMandatoryReason: false,
          requiredRole: ['regional_officer', 'bureau_officer', 'admin'],
          description: 'Begin document verification and regulatory compliance check',
        },
      ];

    case 'Scrutiny in Progress': {
      const options: NextStageOption[] = [
        {
          stage: 'Scrutiny Cleared',
          actionLabel: 'Clear Scrutiny',
          actionType: 'advance',
          requiresMandatoryReason: false,
          requiredRole: ['regional_officer', 'bureau_officer', 'admin'],
          description: 'All mandatory documents and academic norms found compliant',
        },
        {
          stage: 'Deficiency Communicated',
          actionLabel: 'Return for Clarification / Deficiency',
          actionType: 'return',
          requiresMandatoryReason: true,
          requiredRole: ['regional_officer', 'bureau_officer', 'admin'],
          description: 'Official remark and specific deficiency note dispatched to institution',
        },
      ];
      return options;
    }

    case 'Deficiency Communicated':
      return [
        {
          stage: 'Scrutiny in Progress',
          actionLabel: 'Resubmit with Rectifications',
          actionType: 'advance',
          requiresMandatoryReason: true,
          requiredRole: ['institution', 'admin'],
          description: 'Provide explanation and upload supporting rectification proofs',
        },
      ];

    case 'Scrutiny Cleared':
      if (routeType === 'Scrutiny Only' || routeType === 'Fast-Track EoA') {
        return [
          {
            stage: 'Executive Committee Approval',
            actionLabel: 'Submit to Executive Committee',
            actionType: 'advance',
            requiresMandatoryReason: false,
            requiredRole: ['regional_officer', 'bureau_officer', 'admin'],
            description: 'Forward directly to AICTE Executive Committee for approval',
          },
        ];
      } else {
        // Scrutiny + EVC or Scrutiny + EVC + SAC/SHC
        return [
          {
            stage: 'EVC Scheduled',
            actionLabel: 'Initiate EVC Scheduling',
            actionType: 'advance',
            requiresMandatoryReason: false,
            requiredRole: ['regional_officer', 'bureau_officer', 'admin'],
            description: 'Assign Expert Visit Committee panel and timetable physical/virtual inspection',
          },
        ];
      }

    case 'EVC Scheduled':
      return [
        {
          stage: 'EVC Inspection Completed',
          actionLabel: 'Submit Inspection Report',
          actionType: 'advance',
          requiresMandatoryReason: false,
          requiredRole: ['evc_committee', 'regional_officer', 'admin'],
          description: 'Record inspection findings, score infrastructure, and upload signed EVC report',
        },
      ];

    case 'EVC Inspection Completed':
      if (routeType === 'Scrutiny + EVC + SAC/SHC') {
        return [
          {
            stage: 'SAC / SHC Review',
            actionLabel: 'Refer to Standing Appellate Committee',
            actionType: 'advance',
            requiresMandatoryReason: false,
            requiredRole: ['bureau_officer', 'admin'],
            description: 'Standing Hearing / Appellate Committee review for contentious items',
          },
        ];
      } else {
        return [
          {
            stage: 'Executive Committee Approval',
            actionLabel: 'Recommend for EC Approval',
            actionType: 'advance',
            requiresMandatoryReason: false,
            requiredRole: ['bureau_officer', 'regional_officer', 'admin'],
            description: 'Forward positive EVC recommendations to AICTE Executive Committee',
          },
          {
            stage: 'Deficiency Communicated',
            actionLabel: 'Return for Rectification',
            actionType: 'return',
            requiresMandatoryReason: true,
            requiredRole: ['bureau_officer', 'regional_officer', 'admin'],
            description: 'EVC found remediable deficiencies; request college response',
          },
        ];
      }

    case 'SAC / SHC Review':
      return [
        {
          stage: 'Executive Committee Approval',
          actionLabel: 'SAC Cleared - Forward to EC',
          actionType: 'advance',
          requiresMandatoryReason: false,
          requiredRole: ['bureau_officer', 'admin'],
          description: 'Appellate committee disposed appeal favorably for EC approval',
        },
        {
          stage: 'Application Rejected',
          actionLabel: 'Uphold Rejection',
          actionType: 'reject',
          requiresMandatoryReason: true,
          requiredRole: ['bureau_officer', 'admin'],
          description: 'Appellate hearing concluded non-compliance with AICTE Approval Process Handbook',
        },
      ];

    case 'Executive Committee Approval':
      return [
        {
          stage: 'Approval Issued',
          actionLabel: 'Issue Official Approval Letter',
          actionType: 'advance',
          requiresMandatoryReason: false,
          requiredRole: ['bureau_officer', 'admin'],
          description: 'Generate digitally signed AICTE Approval Order (EoA / LOA)',
        },
        {
          stage: 'Application Rejected',
          actionLabel: 'Reject Application',
          actionType: 'reject',
          requiresMandatoryReason: true,
          requiredRole: ['bureau_officer', 'admin'],
          description: 'Executive committee rejected application due to non-fulfillment of criteria',
        },
      ];

    case 'Approval Issued':
    case 'Application Rejected':
      return [];

    default:
      return [];
  }
}

/**
 * Validate whether a role can perform the target transition and if reasons are supplied
 */
export function validateWorkflowTransition(
  userRole: UserRole,
  nextOption: NextStageOption,
  reason: string
): { isValid: boolean; errorMessage?: string } {
  if (!nextOption.requiredRole.includes(userRole)) {
    return {
      isValid: false,
      errorMessage: `Your role (${userRole}) is not authorized to execute this transition. Required roles: ${nextOption.requiredRole.join(', ')}`,
    };
  }

  if (nextOption.requiresMandatoryReason && (!reason || reason.trim().length < 10)) {
    return {
      isValid: false,
      errorMessage: 'A mandatory official reason (minimum 10 characters) must be recorded for this action.',
    };
  }

  return { isValid: true };
}
