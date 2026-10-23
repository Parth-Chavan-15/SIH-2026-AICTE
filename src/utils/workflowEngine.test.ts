import test from 'node:test';
import assert from 'node:assert/strict';
import { computeSLAStatus, getAgingBucket } from './slaCalculator.ts';
import { getEligibleNextStages, validateWorkflowTransition } from './workflowEngine.ts';

test('computeSLAStatus: accurately marks within SLA when time remains', () => {
  // 3 days elapsed out of 10 allowed
  const result = computeSLAStatus('2026-10-19T10:00:00Z', 10, '2026-10-22T10:00:00Z');
  assert.equal(result.elapsedDays, 3);
  assert.equal(result.daysRemaining, 7);
  assert.equal(result.isOverdue, false);
  assert.equal(result.status, 'within_sla');
});

test('computeSLAStatus: detects approaching deadline (2 or fewer days left)', () => {
  // 8 days elapsed out of 10 allowed -> 2 days remaining
  const result = computeSLAStatus('2026-10-14T10:00:00Z', 10, '2026-10-22T10:00:00Z');
  assert.equal(result.elapsedDays, 8);
  assert.equal(result.daysRemaining, 2);
  assert.equal(result.isOverdue, false);
  assert.equal(result.status, 'approaching_deadline');
});

test('computeSLAStatus: detects overdue cases and overdue duration', () => {
  // 15 days elapsed out of 10 allowed -> 5 days overdue
  const result = computeSLAStatus('2026-10-07T10:00:00Z', 10, '2026-10-22T10:00:00Z');
  assert.equal(result.elapsedDays, 15);
  assert.equal(result.daysRemaining, -5);
  assert.equal(result.isOverdue, true);
  assert.equal(result.overdueDays, 5);
  assert.equal(result.status, 'overdue');
});

test('getAgingBucket: correctly groups durations into SLA brackets', () => {
  assert.equal(getAgingBucket(3), '0-7 Days');
  assert.equal(getAgingBucket(11), '8-14 Days');
  assert.equal(getAgingBucket(22), '15-30 Days');
  assert.equal(getAgingBucket(45), '30+ Days');
});

test('getEligibleNextStages: route Scrutiny Only transitions directly to EC Approval', () => {
  const options = getEligibleNextStages('Scrutiny Cleared', 'Scrutiny Only');
  assert.equal(options.length, 1);
  assert.equal(options[0].stage, 'Executive Committee Approval');
});

test('getEligibleNextStages: route Scrutiny + EVC requires EVC Scheduling after Scrutiny', () => {
  const options = getEligibleNextStages('Scrutiny Cleared', 'Scrutiny + EVC');
  assert.equal(options.length, 1);
  assert.equal(options[0].stage, 'EVC Scheduled');
});

test('validateWorkflowTransition: blocks return without mandatory reason', () => {
  const options = getEligibleNextStages('Scrutiny in Progress', 'Scrutiny Only');
  const returnOption = options.find((o) => o.actionType === 'return')!;
  
  // Empty reason should fail
  const failedCheck = validateWorkflowTransition('regional_officer', returnOption, '');
  assert.equal(failedCheck.isValid, false);
  assert.ok(failedCheck.errorMessage?.includes('mandatory official reason'));

  // Valid reason should pass
  const passedCheck = validateWorkflowTransition('regional_officer', returnOption, 'Missing certified Land Ownership Deed Form II');
  assert.equal(passedCheck.isValid, true);
});

test('validateWorkflowTransition: enforces role permissions', () => {
  const options = getEligibleNextStages('Scrutiny in Progress', 'Scrutiny Only');
  const advanceOption = options.find((o) => o.actionType === 'advance')!;

  // Institution cannot approve scrutiny
  const invalidRoleCheck = validateWorkflowTransition('institution', advanceOption, 'Looks good');
  assert.equal(invalidRoleCheck.isValid, false);
  assert.ok(invalidRoleCheck.errorMessage?.includes('not authorized'));

  // Regional officer can approve scrutiny
  const validRoleCheck = validateWorkflowTransition('regional_officer', advanceOption, 'Approved');
  assert.equal(validRoleCheck.isValid, true);
});
