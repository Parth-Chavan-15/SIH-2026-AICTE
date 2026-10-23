import { describe, it, expect } from 'vitest';

// --- 1. Pure Obligation Materialization ---
export interface DecisionEvent {
  decisionEventId: string;
  applicationId: string;
  decisionType: 'APPROVED' | 'CONDITIONAL_APPROVED' | 'REJECTED';
  conditions?: Array<{ key: string; description: string; dueDate: string }>;
}

export interface Obligation {
  decisionEventId: string;
  applicationId: string;
  conditionKey: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'FULFILLED';
}

export function materializeDecisionObligations(event: DecisionEvent): Obligation[] {
  if (event.decisionType !== 'CONDITIONAL_APPROVED' || !event.conditions) {
    return [];
  }
  return event.conditions.map((cond) => ({
    decisionEventId: event.decisionEventId,
    applicationId: event.applicationId,
    conditionKey: cond.key,
    description: cond.description,
    dueDate: cond.dueDate,
    status: 'PENDING',
  }));
}

// --- 2. Document Version State Machine & Metadata ---
export interface DocumentVersion {
  documentId: string;
  versionNumber: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  status: 'submitted' | 'review_pending' | 'verified' | 'rejected';
  receivedAt: string;
  reviewedAt?: string;
}

export function createDocumentVersion(
  existingVersions: DocumentVersion[],
  newFile: { fileName: string; fileSize: number; mimeType: string; uploadedBy: string }
): DocumentVersion {
  const nextVersionNumber = existingVersions.length + 1;
  return {
    documentId: `doc-${Date.now()}`,
    versionNumber: nextVersionNumber,
    fileName: newFile.fileName,
    fileSize: newFile.fileSize,
    mimeType: newFile.mimeType,
    uploadedBy: newFile.uploadedBy,
    status: 'submitted', // Initial submission NEVER auto-verifies
    receivedAt: new Date().toISOString(),
  };
}

// --- 3. Deterministic Virtual Clock Timers ---
export interface TimerTask {
  timerId: string;
  dedupeKey: string;
  dueTimestamp: number;
  subjectVersion: number;
  status: 'scheduled' | 'sent' | 'cancelled';
}

export function dueTimers(
  currentClock: number,
  tasks: TimerTask[],
  latestSubjectVersion: number
): TimerTask[] {
  return tasks.map((task) => {
    if (task.status !== 'scheduled') return task;
    // Cancel if subject version advanced (stale task)
    if (task.subjectVersion < latestSubjectVersion) {
      return { ...task, status: 'cancelled' };
    }
    // Fire if clock reached due time
    if (currentClock >= task.dueTimestamp) {
      return { ...task, status: 'sent' };
    }
    return task;
  });
}

// --- 4. Derived Dashboard Projection ---
export interface SyntheticCase {
  id: string;
  region: string;
  currentStage: string;
  slaStatus: string;
  evcVisitsCount: number;
  obligationsCount: number;
}

export function computeDashboardProjection(cases: SyntheticCase[]) {
  const total = cases.length;
  const overdue = cases.filter((c) => c.slaStatus === 'overdue').length;
  const totalEVC = cases.reduce((acc, c) => acc + c.evcVisitsCount, 0);
  const totalObligations = cases.reduce((acc, c) => acc + c.obligationsCount, 0);

  return {
    totalApplications: total,
    overdueApplications: overdue,
    evcVisitsPending: totalEVC,
    compliancePending: totalObligations,
  };
}

describe('Member 3 — Obligations, Documents, Timers & Dashboard Projections', () => {
  it('materializes conditional obligations correctly', () => {
    const event: DecisionEvent = {
      decisionEventId: 'dec-101',
      applicationId: 'app-001',
      decisionType: 'CONDITIONAL_APPROVED',
      conditions: [
        { key: 'CADRE_RATIO', description: 'Rectify professor ratio', dueDate: '2026-11-15' },
      ],
    };
    const obs = materializeDecisionObligations(event);
    expect(obs.length).toBe(1);
    expect(obs[0].conditionKey).toBe('CADRE_RATIO');
    expect(obs[0].status).toBe('PENDING');
  });

  it('creates document versions without auto-verification', () => {
    const v1 = createDocumentVersion([], {
      fileName: 'land_deed.pdf',
      fileSize: 1024,
      mimeType: 'application/pdf',
      uploadedBy: 'inst-01',
    });
    expect(v1.versionNumber).toBe(1);
    expect(v1.status).toBe('submitted');
  });

  it('cancels stale timers when subject version advances', () => {
    const tasks: TimerTask[] = [
      { timerId: 't1', dedupeKey: 'd1', dueTimestamp: 100, subjectVersion: 1, status: 'scheduled' },
    ];
    const processed = dueTimers(120, tasks, 2);
    expect(processed[0].status).toBe('cancelled');
  });

  it('derives exact dashboard counts without hardcodes', () => {
    const cases: SyntheticCase[] = [
      { id: '1', region: 'Western', currentStage: 'Scrutiny', slaStatus: 'within_sla', evcVisitsCount: 0, obligationsCount: 2 },
    ];
    const proj = computeDashboardProjection(cases);
    expect(proj.totalApplications).toBe(1);
    expect(proj.compliancePending).toBe(2);
    expect(proj.evcVisitsPending).toBe(0);
  });
});
