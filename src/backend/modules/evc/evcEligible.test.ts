import { describe, it, expect } from 'vitest';
import { evcEligible } from './evcEligible';
import type { RouteExplanation, EVCTask } from '../scrutiny/contracts';

describe('evcEligible Pure Function (USP B07 / Acceptance T08-T09)', () => {
  // SYNTHETIC accredited case route: no evc_pending stage
  const accreditedRoute: RouteExplanation = {
    policyRevisionId: 'POL-REV-ACC',
    session: '2026-27',
    evaluatedFacts: { nbaAccreditation: true },
    result: 'selected',
    stages: ['submitted', 'scrutiny_pending', 'decision_pending'],
    reasons: ['Accredited institution qualifies for direct scrutiny-to-decision path'],
    sources: [{ documentId: 'G02', title: 'AICTE APH 2026-27 Table 1', location: 'Page 42' }]
  };

  // SYNTHETIC non-accredited case route: requires evc_pending stage
  const nonAccreditedRoute: RouteExplanation = {
    policyRevisionId: 'POL-REV-NONACC',
    session: '2026-27',
    evaluatedFacts: { nbaAccreditation: false },
    result: 'selected',
    stages: ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'],
    reasons: ['Non-accredited institution requires Expert Visit Committee inspection'],
    sources: [{ documentId: 'G02', title: 'AICTE APH 2026-27 Table 2', location: 'Page 43' }]
  };

  it('rejects accredited case SYN-ACC-01 because route does not include evc_pending', () => {
    const result = evcEligible(accreditedRoute, { scrutinyComplete: true });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('Route does not require EVC');
  });

  it('approves non-accredited case SYN-NONACC-02 when scrutiny prerequisites are signed', () => {
    const result = evcEligible(nonAccreditedRoute, { scrutinyComplete: true, snapshotId: 'SNAP-1' });
    expect(result.eligible).toBe(true);
    expect(result.reason).toBe('Case qualifies for EVC per route and signed prerequisites');
  });

  it('rejects non-accredited case when scrutiny prerequisites are not yet completed', () => {
    const result = evcEligible(nonAccreditedRoute, { scrutinyComplete: false });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('Scrutiny prerequisites not yet signed');
  });

  it('rejects case when an active pending EVC task already exists (prevents duplicate generation)', () => {
    const activeTasks: EVCTask[] = [
      {
        id: 'EVC-TASK-001',
        applicationId: 'SYN-NONACC-02',
        prerequisiteEventId: 'EVT-SCRUTINY-SIGNED',
        policyRevisionId: 'POL-REV-NONACC',
        assigneeIds: ['EVC-EXPERT-1'],
        version: 1,
        status: 'pending'
      }
    ];
    const result = evcEligible(nonAccreditedRoute, { scrutinyComplete: true }, activeTasks);
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('Active EVC task already exists for this case');
  });

  it('rejects case when an active scheduled EVC task already exists', () => {
    const activeTasks: EVCTask[] = [
      {
        id: 'EVC-TASK-002',
        applicationId: 'SYN-NONACC-02',
        prerequisiteEventId: 'EVT-SCRUTINY-SIGNED',
        policyRevisionId: 'POL-REV-NONACC',
        assigneeIds: ['EVC-EXPERT-2'],
        scheduledAt: '2026-11-01T10:00:00.000Z',
        version: 2,
        status: 'scheduled'
      }
    ];
    const result = evcEligible(nonAccreditedRoute, { scrutinyComplete: true }, activeTasks);
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('Active EVC task already exists for this case');
  });

  it('allows new EVC creation if previous tasks are canceled or completed (not currently active)', () => {
    const pastTasks: EVCTask[] = [
      {
        id: 'EVC-TASK-PREV',
        applicationId: 'SYN-NONACC-02',
        prerequisiteEventId: 'EVT-PAST',
        policyRevisionId: 'POL-REV-NONACC',
        assigneeIds: ['EVC-EXPERT-PREV'],
        version: 1,
        status: 'canceled'
      }
    ];
    const result = evcEligible(nonAccreditedRoute, { scrutinyComplete: true }, pastTasks);
    expect(result.eligible).toBe(true);
  });
});
