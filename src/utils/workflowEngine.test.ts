import { describe, it, expect } from 'vitest';
import { computeSLAStatus, getAgingBucket } from './slaCalculator.ts';
import { getEligibleNextStages, validateWorkflowTransition, NextStageOption } from './workflowEngine.ts';

describe('Workflow Engine & SLA Calculator Unit Tests', () => {
  it('computeSLAStatus: accurately marks within SLA when time remains', () => {
    // 3 days elapsed out of 10 allowed
    const result = computeSLAStatus('2026-10-19T10:00:00Z', 10, '2026-10-22T10:00:00Z');
    expect(result.elapsedDays).toBe(3);
    expect(result.daysRemaining).toBe(7);
    expect(result.isOverdue).toBe(false);
    expect(result.status).toBe('within_sla');
  });

  it('computeSLAStatus: detects approaching deadline (2 or fewer days left)', () => {
    // 8 days elapsed out of 10 allowed -> 2 days remaining
    const result = computeSLAStatus('2026-10-14T10:00:00Z', 10, '2026-10-22T10:00:00Z');
    expect(result.elapsedDays).toBe(8);
    expect(result.daysRemaining).toBe(2);
    expect(result.isOverdue).toBe(false);
    expect(result.status).toBe('approaching_deadline');
  });

  it('computeSLAStatus: detects overdue cases and overdue duration', () => {
    // 15 days elapsed out of 10 allowed -> 5 days overdue
    const result = computeSLAStatus('2026-10-07T10:00:00Z', 10, '2026-10-22T10:00:00Z');
    expect(result.elapsedDays).toBe(15);
    expect(result.daysRemaining).toBe(-5);
    expect(result.isOverdue).toBe(true);
    expect(result.overdueDays).toBe(5);
    expect(result.status).toBe('overdue');
  });

  it('getAgingBucket: correctly groups durations into SLA brackets', () => {
    expect(getAgingBucket(3)).toBe('0-7 Days');
    expect(getAgingBucket(10)).toBe('8-14 Days');
    expect(getAgingBucket(22)).toBe('15-30 Days');
    expect(getAgingBucket(45)).toBe('30+ Days');
  });

  it('getEligibleNextStages: route Scrutiny Only transitions correctly', () => {
    const nextStages = getEligibleNextStages('Scrutiny in Progress', 'Scrutiny Only');
    const stageNames = nextStages.map((s) => s.stage);
    expect(stageNames).toContain('Scrutiny Cleared');
    expect(stageNames).toContain('Deficiency Communicated');
  });

  it('getEligibleNextStages: route Scrutiny + EVC requires EVC Scheduling after Scrutiny', () => {
    const nextStages = getEligibleNextStages('Scrutiny Cleared', 'Scrutiny + EVC + SAC/SHC');
    const stageNames = nextStages.map((s) => s.stage);
    expect(stageNames).toContain('EVC Scheduled');
  });

  it('validateWorkflowTransition: blocks transition without mandatory reason when required', () => {
    const nextOption: NextStageOption = {
      stage: 'Deficiency Communicated',
      actionLabel: 'Flag Deficiency',
      actionType: 'return',
      description: 'Deficiency communicated',
      requiredRole: ['regional_officer'],
      requiresMandatoryReason: true,
    };
    const check = validateWorkflowTransition('regional_officer', nextOption, 'short');
    expect(check.isValid).toBe(false);
    expect(check.errorMessage).toContain('mandatory official reason');
  });

  it('validateWorkflowTransition: enforces role permissions', () => {
    const nextOption: NextStageOption = {
      stage: 'Approval Issued',
      actionLabel: 'Issue Approval',
      actionType: 'advance',
      description: 'Issue official approval',
      requiredRole: ['bureau_officer'],
      requiresMandatoryReason: false,
    };
    // Institution role cannot execute approval
    const check = validateWorkflowTransition('institution', nextOption, 'Approving this institution');
    expect(check.isValid).toBe(false);
    expect(check.errorMessage).toContain('not authorized');
  });
});
