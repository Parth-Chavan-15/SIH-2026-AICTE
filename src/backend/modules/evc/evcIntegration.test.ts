import { describe, it, expect, beforeEach } from 'vitest';
import {
  createEVCTask,
  scheduleEVC,
  submitEVCReport,
  getTasksForCase,
  getAllTasks,
  clearEVCTasks
} from './evcService';
import { makeFakeCorePort, fakeCase } from '../scrutiny/mockCore';
import { eventBus } from '../events/eventBus';
import type { Application, RouteExplanation } from '../scrutiny/contracts';

describe('Member 2 - Conditional EVC Integration (Gate G2 Acceptance Criteria 5-8)', () => {
  beforeEach(() => {
    eventBus.clear();
    clearEVCTasks();
  });

  // SYNTHETIC accredited case: does NOT contain evc_pending in route stages
  const accreditedCase: Application = {
    ...fakeCase,
    id: 'SYN-ACC-01',
    state: 'scrutiny_pending',
    version: 1,
    route: {
      policyRevisionId: 'POL-REV-ACC',
      session: '2026-27',
      evaluatedFacts: { nbaAccreditation: true },
      result: 'selected',
      stages: ['submitted', 'scrutiny_pending', 'decision_pending'],
      reasons: ['Direct scrutiny route without EVC inspection'],
      sources: [{ documentId: 'G02', title: 'AICTE APH 2026-27 Table 1', location: 'Page 42' }]
    }
  };

  // SYNTHETIC non-accredited case: DOES contain evc_pending in route stages
  const nonAccreditedCase: Application = {
    ...fakeCase,
    id: 'SYN-NONACC-02-EVC',
    state: 'evc_pending',
    version: 2,
    route: {
      policyRevisionId: 'POL-REV-NONACC',
      session: '2026-27',
      evaluatedFacts: { nbaAccreditation: false },
      result: 'selected',
      stages: ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'],
      reasons: ['Non-accredited case requires EVC physical inspection'],
      sources: [{ documentId: 'G02', title: 'AICTE APH 2026-27 Table 2', location: 'Page 43' }]
    }
  };

  it('rejects EVC task creation for accredited case SYN-ACC-01 (Acceptance Criterion 5)', async () => {
    const port = makeFakeCorePort(accreditedCase, accreditedCase.route);
    const result = await createEVCTask(port, 'SYN-ACC-01');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('PRECONDITION_FAILED');
      expect(result.error.message).toBe('Route does not require EVC');
    }
  });

  it('creates exactly ONE EVC task for qualifying non-accredited case (Acceptance Criterion 6)', async () => {
    const port = makeFakeCorePort(nonAccreditedCase, nonAccreditedCase.route);
    const result = await createEVCTask(port, 'SYN-NONACC-02-EVC');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('pending');
      expect(result.data.applicationId).toBe('SYN-NONACC-02-EVC');
      expect(result.data.assigneeIds.length).toBeGreaterThan(0);
    }

    // Attempt duplicate generation -> MUST be rejected (no duplicates)
    const duplicateAttempt = await createEVCTask(port, 'SYN-NONACC-02-EVC');
    expect(duplicateAttempt.success).toBe(false);
    if (!duplicateAttempt.success) {
      expect(duplicateAttempt.error.code).toBe('PRECONDITION_FAILED');
      expect(duplicateAttempt.error.message).toBe('Active EVC task already exists for this case');
    }
  });

  it('schedules an EVC task and rejects duplicate scheduling (Acceptance Criterion 7)', async () => {
    const port = makeFakeCorePort(nonAccreditedCase, nonAccreditedCase.route);
    const created = await createEVCTask(port, 'SYN-NONACC-02-EVC');
    expect(created.success).toBe(true);

    if (created.success) {
      const taskId = created.data.id;
      const scheduleResult = await scheduleEVC(
        taskId,
        '2026-11-05T09:30:00.000Z',
        1,
        'IDEMP-SCHED-01'
      );

      expect(scheduleResult.success).toBe(true);
      if (scheduleResult.success) {
        expect(scheduleResult.data.status).toBe('scheduled');
        expect(scheduleResult.data.scheduledAt).toBe('2026-11-05T09:30:00.000Z');
      }

      // Try duplicate scheduling on already scheduled task -> Rejected
      const duplicateSchedule = await scheduleEVC(
        taskId,
        '2026-11-06T10:00:00.000Z',
        2,
        'IDEMP-SCHED-02'
      );
      expect(duplicateSchedule.success).toBe(false);
      if (!duplicateSchedule.success) {
        expect(duplicateSchedule.error.code).toBe('PRECONDITION_FAILED');
        expect(duplicateSchedule.error.failedRule).toBe('EVC_DUPLICATE_SCHEDULE_FORBIDDEN');
      }
    }
  });

  it('submits EVC report but does NOT auto-approve the case (Acceptance Criterion 8)', async () => {
    const port = makeFakeCorePort(nonAccreditedCase, nonAccreditedCase.route);
    const created = await createEVCTask(port, 'SYN-NONACC-02-EVC');
    expect(created.success).toBe(true);

    if (created.success) {
      const taskId = created.data.id;
      await scheduleEVC(taskId, '2026-11-05T09:30:00.000Z', 1, 'IDEMP-SCHED-03');

      const reportResult = await submitEVCReport(
        taskId,
        {
          evidenceVersionIds: ['DOC-EVC-PHOTOS-01'],
          summary: 'Physical lab equipment and faculty presence verified on site.',
          recommendation: 'recommended',
          expectedVersion: 2,
          idempotencyKey: 'IDEMP-REPORT-01'
        },
        port
      );

      expect(reportResult.success).toBe(true);
      if (reportResult.success) {
        expect(reportResult.data.status).toBe('completed');
        expect(reportResult.data.reportVersionId).toBeDefined();
      }

      // Verify the application did NOT get auto-approved!
      const currentCase = await port.getApplication('SYN-NONACC-02-EVC');
      expect(currentCase.state).not.toBe('approved');
      expect(currentCase.state).toBe('decision_pending'); // Moved to decision authority queue, NOT approved
    }
  });
});
