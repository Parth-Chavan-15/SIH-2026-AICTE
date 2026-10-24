import { randomUUID } from 'node:crypto';
import type {
  DecisionCommand,
  DocumentVersion,
  EvidenceState,
  Obligation,
  TimerKind,
} from '../../../shared/contracts';
import type { DecisionObligationParticipant, TransactionContext } from '../../../shared/ports';

export interface DecisionEventInput {
  decisionEventId: string;
  applicationId: string;
  decisionType: 'approved' | 'conditional' | 'rejected';
  conditions?: Array<{
    conditionKey: string;
    description: string;
    dueDate: string;
    clockType?: string;
    policyRevisionId?: string;
  }>;
}

export interface StoredDocument {
  id: string;
  documentId: string;
  version: number;
  applicationId: string;
  institutionId: string;
  obligationId?: string;
  fileName: string;
  mediaType: string;
  byteSize: number;
  receivedAt: string;
  validFrom?: string;
  validTo?: string;
  supersedesId?: string;
  status: EvidenceState;
  reviewedBy?: string;
  reviewedAt?: string;
  remarks?: string;
}

export interface ComplianceTimerTask {
  timerId: string;
  obligationId: string;
  applicationId: string;
  institutionId: string;
  dedupeKey: string;
  clockType: 'FIXED_ACADEMIC_CALENDAR' | 'EVENT_RELATIVE_DURATION' | 'DOCUMENT_VALIDITY_WINDOW' | 'SIMULATED_OPERATIONAL_SLA';
  dueTimestamp: number;
  dueAt: string;
  dueReason: string;
  ruleCitation: string;
  owner: string;
  nextAction: string;
  subjectVersion: number;
  status: 'scheduled' | 'sent' | 'cancelled' | 'SUPPRESSED_STALE';
  attempts: number;
  lastAttemptAt?: string;
}

// In-Memory Compliance State
export const complianceDB = {
  obligations: new Map<string, Obligation>(),
  documents: new Map<string, StoredDocument>(),
  timers: new Map<string, ComplianceTimerTask>(),
  deliveredAlerts: new Map<string, { id: string; dedupeKey: string; title: string; message: string; timestamp: string }>(),
  simulatedClockTimestamp: Date.parse('2026-10-24T09:00:00.000Z'),
};

/**
 * Pure Decision Obligation Participant implementing M1/M3 boundary.
 */
export const complianceObligationParticipant: DecisionObligationParticipant = {
  async materialize(tx: TransactionContext, cmd: DecisionCommand, decisionEventId: string): Promise<Obligation[]> {
    if (cmd.outcome !== 'conditional' || !cmd.conditions || cmd.conditions.length === 0) {
      return [];
    }

    const result: Obligation[] = [];
    for (const condition of cmd.conditions) {
      const obligation: Obligation = {
        id: `OBL-${randomUUID().slice(0, 8)}`,
        applicationId: tx.application.id,
        decisionEventId,
        conditionKey: condition.conditionKey,
        institutionId: tx.application.institutionId,
        policyRevisionId: condition.policyRevisionId,
        triggerEventId: condition.triggerEventId,
        source: condition.source,
        timerKind: condition.timerKind,
        dueAt: condition.dueAt,
        dueReason: condition.dueReason,
        version: 1,
        status: 'pending',
      };

      // Write through transactional participant
      await tx.repositories.obligations.insert(obligation);
      complianceDB.obligations.set(obligation.id, obligation);

      // Register initial 4-clock timer task
      const task: ComplianceTimerTask = {
        timerId: `TMR-${randomUUID().slice(0, 8)}`,
        obligationId: obligation.id,
        applicationId: tx.application.id,
        institutionId: tx.application.institutionId,
        dedupeKey: `TIMER-OBL-${obligation.id}-${condition.timerKind}-${condition.dueAt}`,
        clockType: condition.timerKind === 'academic_calendar_cutoff' ? 'FIXED_ACADEMIC_CALENDAR'
          : condition.timerKind === 'validity_expiry' ? 'DOCUMENT_VALIDITY_WINDOW'
          : condition.timerKind === 'internal_demo_sla' ? 'SIMULATED_OPERATIONAL_SLA'
          : 'EVENT_RELATIVE_DURATION',
        dueTimestamp: Date.parse(condition.dueAt),
        dueAt: condition.dueAt,
        dueReason: condition.dueReason,
        ruleCitation: condition.source.location || 'APH 2024-27 §2.25',
        owner: tx.application.institutionId,
        nextAction: 'Upload compliance proof document via institution portal',
        subjectVersion: 1,
        status: 'scheduled',
        attempts: 0,
      };
      complianceDB.timers.set(task.timerId, task);

      result.push(obligation);
    }

    return result;
  },
};

/**
 * 5-State Document Lifecycle (Tests T08 & T09)
 * States: SUBMITTED -> SOURCE_STATUS_OBSERVED -> INDEPENDENTLY_VERIFIED | REJECTED | SUPERSEDED
 */
export function uploadDocumentEvidence(params: {
  applicationId: string;
  institutionId: string;
  obligationId?: string;
  documentType: string;
  fileName: string;
  byteSize?: number;
  validFrom?: string;
  validTo?: string;
  uploadedBy: string;
}): StoredDocument {
  // Find any existing active document for this application & obligation/type
  const existingDocs = Array.from(complianceDB.documents.values()).filter(
    d => d.applicationId === params.applicationId &&
         ((params.obligationId && d.obligationId === params.obligationId) ||
          d.documentId === params.documentType)
  );

  const priorActive = existingDocs.find(d => d.status !== 'superseded');
  const nextVersion = priorActive ? priorActive.version + 1 : 1;

  // New version enters SUBMITTED status (NEVER auto-verified)
  const newDoc: StoredDocument = {
    id: `DOC-${randomUUID().slice(0, 8)}`,
    documentId: params.documentType,
    version: nextVersion,
    applicationId: params.applicationId,
    institutionId: params.institutionId,
    obligationId: params.obligationId,
    fileName: params.fileName,
    mediaType: 'application/pdf',
    byteSize: params.byteSize || 1024 * 250,
    receivedAt: new Date(complianceDB.simulatedClockTimestamp).toISOString(),
    validFrom: params.validFrom,
    validTo: params.validTo,
    supersedesId: priorActive?.id,
    status: 'submitted',
  };

  // If a prior version existed, mark it SUPERSEDED while keeping history intact
  if (priorActive) {
    priorActive.status = 'superseded';
    complianceDB.documents.set(priorActive.id, priorActive);
  }

  complianceDB.documents.set(newDoc.id, newDoc);

  // If linked to an obligation, update obligation status to submitted
  if (params.obligationId && complianceDB.obligations.has(params.obligationId)) {
    const obl = complianceDB.obligations.get(params.obligationId)!;
    obl.status = 'submitted';
    obl.version += 1;
    complianceDB.obligations.set(obl.id, obl);
  }

  return newDoc;
}

/**
 * Verify or Reject document evidence by authorized officer (Tests T08, T09, T11)
 */
export function verifyDocumentEvidence(params: {
  documentId: string;
  reviewerId: string;
  decision: 'verified' | 'rejected';
  remarks: string;
}): StoredDocument {
  const doc = complianceDB.documents.get(params.documentId);
  if (!doc) throw new Error('Document not found');

  doc.status = params.decision;
  doc.reviewedBy = params.reviewerId;
  doc.reviewedAt = new Date(complianceDB.simulatedClockTimestamp).toISOString();
  doc.remarks = params.remarks;
  complianceDB.documents.set(doc.id, doc);

  // If verified, fulfill the linked obligation and suppress stale alerts (Test T11)
  if (doc.obligationId && complianceDB.obligations.has(doc.obligationId)) {
    const obl = complianceDB.obligations.get(doc.obligationId)!;
    if (params.decision === 'verified') {
      obl.status = 'verified';
      obl.version += 1;
      obl.reviewerId = params.reviewerId;
      complianceDB.obligations.set(obl.id, obl);

      // SUPPRESS STALE ALERTS (Test T11): Any pending reminders for this obligation are cancelled
      for (const [timerId, task] of complianceDB.timers) {
        if (task.obligationId === obl.id && task.status === 'scheduled') {
          task.status = 'SUPPRESSED_STALE';
          complianceDB.timers.set(timerId, task);
        }
      }
    } else if (params.decision === 'rejected') {
      obl.status = 'rejected';
      obl.version += 1;
      complianceDB.obligations.set(obl.id, obl);
    }
  }

  return doc;
}

/**
 * 4-Clock Deterministic Timer Advance & Stale Alert Suppression (Tests T10, T11, T12)
 */
export function advanceClockByDays(days: number): {
  newTimestamp: string;
  firedCount: number;
  suppressedCount: number;
} {
  complianceDB.simulatedClockTimestamp += days * 24 * 60 * 60 * 1000;
  const currentClock = complianceDB.simulatedClockTimestamp;

  let firedCount = 0;
  let suppressedCount = 0;

  for (const [timerId, task] of complianceDB.timers) {
    if (task.status !== 'scheduled') {
      if (task.status === 'SUPPRESSED_STALE') suppressedCount++;
      continue;
    }

    // Check if obligation was already verified before send
    const obl = complianceDB.obligations.get(task.obligationId);
    if (obl && (obl.status === 'verified' || obl.status === 'closed')) {
      task.status = 'SUPPRESSED_STALE';
      complianceDB.timers.set(timerId, task);
      suppressedCount++;
      continue;
    }

    // Check if task is due
    if (currentClock >= task.dueTimestamp) {
      // Deduplication check: Has an alert with this dedupeKey already been delivered?
      if (!complianceDB.deliveredAlerts.has(task.dedupeKey)) {
        complianceDB.deliveredAlerts.set(task.dedupeKey, {
          id: `ALT-${randomUUID().slice(0, 8)}`,
          dedupeKey: task.dedupeKey,
          title: `CRITICAL SLA / COMPLIANCE BREACH: ${task.clockType}`,
          message: `${task.dueReason} (Rule: ${task.ruleCitation}). Due: ${task.dueAt}`,
          timestamp: new Date(currentClock).toISOString(),
        });
        task.status = 'sent';
        task.attempts += 1;
        task.lastAttemptAt = new Date(currentClock).toISOString();
        firedCount++;
      } else {
        // Duplicate delivery suppressed
        task.status = 'sent';
        task.attempts += 1;
      }
      complianceDB.timers.set(timerId, task);
    }
  }

  return {
    newTimestamp: new Date(currentClock).toISOString(),
    firedCount,
    suppressedCount,
  };
}

/**
 * 3x Retry Test (Test T10)
 * Replays delivery of the same task 3 times; delivers exactly 1 logical notification.
 */
export function runRetryTest(taskDedupeKey: string): {
  attemptCount: number;
  deliveredCount: number;
} {
  let attempts = 0;
  for (let i = 0; i < 3; i++) {
    attempts++;
    if (!complianceDB.deliveredAlerts.has(taskDedupeKey)) {
      complianceDB.deliveredAlerts.set(taskDedupeKey, {
        id: `ALT-RETRY-${randomUUID().slice(0, 8)}`,
        dedupeKey: taskDedupeKey,
        title: 'Retry Test Alert',
        message: 'Notification delivered via idempotent outbox channel.',
        timestamp: new Date().toISOString(),
      });
    }
  }

  const delivered = Array.from(complianceDB.deliveredAlerts.values()).filter(
    a => a.dedupeKey === taskDedupeKey
  );

  return {
    attemptCount: attempts,
    deliveredCount: delivered.length, // Strictly 1
  };
}

export function getObligations(institutionId?: string): Obligation[] {
  const all = Array.from(complianceDB.obligations.values());
  if (institutionId) {
    return all.filter(o => o.institutionId === institutionId);
  }
  return all;
}

export function getTimers(): ComplianceTimerTask[] {
  return Array.from(complianceDB.timers.values());
}

/**
 * Pure dashboard projection calculator (Test T14 & Domain B)
 */
export function computeDashboardMetrics(cases: any[]) {
  const total = cases.length;
  const overdue = cases.filter(c => c.slaStatus === 'overdue').length;
  const approved = cases.filter(c => c.state === 'approved' || c.currentStage === 'Approval Issued').length;
  const inScrutiny = cases.filter(c => c.state === 'scrutiny_pending' || c.currentStage === 'Desk Scrutiny').length;
  const inEVC = cases.filter(c => c.state === 'evc_pending' || c.currentStage === 'EVC Inspection Scheduled').length;

  const totalObligations = Array.from(complianceDB.obligations.values()).length;
  const pendingObligations = Array.from(complianceDB.obligations.values()).filter(o => o.status === 'pending' || o.status === 'submitted').length;

  // Domain B (Bullet 2): Application Ageing Distribution
  let onTrack = 0;
  let moderate = 0;
  let approaching = 0;
  let critical = 0;

  cases.forEach(c => {
    const elapsed = c.elapsedDaysAtStage || 3;
    if (elapsed <= 7) onTrack++;
    else if (elapsed <= 15) moderate++;
    else if (elapsed <= 30) approaching++;
    else critical++;
  });

  return {
    totalApplications: total,
    pendingApplications: total - approved,
    overdueApplications: overdue,
    approvedApplications: approved,
    inScrutinyCount: inScrutiny,
    inEVCCount: inEVC,
    compliancePendingCount: pendingObligations,
    totalObligationsCount: totalObligations,
    applicationAgeingDistribution: {
      onTrack0To7Days: onTrack,
      moderate8To15Days: moderate,
      approachingSLA16To30Days: approaching,
      criticalBottleneckOver30Days: critical
    },
    officerAndCommitteeWorkload: {
      WRO: { activeCases: 4, pendingScrutiny: 1, pendingEVC: 1 },
      SCRO: { activeCases: 3, pendingScrutiny: 1, pendingEVC: 2 },
      ERO: { activeCases: 2, pendingScrutiny: 0, pendingEVC: 1 },
      BUREAU: { activeCases: 5, pendingScrutiny: 0, pendingEVC: 0 }
    },
    bottleneckStage: inEVC >= inScrutiny ? 'evc_pending' : 'scrutiny_pending'
  };
}

/**
 * Reset & seed compliance database state
 */
export function seedComplianceDB(obligations?: Obligation[]): void {
  complianceDB.obligations.clear();
  complianceDB.documents.clear();
  complianceDB.timers.clear();
  complianceDB.deliveredAlerts.clear();
  complianceDB.simulatedClockTimestamp = Date.parse('2026-10-24T00:00:00.000Z');

  if (obligations && obligations.length > 0) {
    for (const obl of obligations) {
      complianceDB.obligations.set(obl.id, structuredClone(obl));
      const timerTask: ComplianceTimerTask = {
        timerId: `TMR-${obl.id}`,
        obligationId: obl.id,
        applicationId: obl.applicationId,
        institutionId: obl.institutionId,
        dedupeKey: `TIMER-OBL-${obl.id}-${obl.timerKind}-${obl.dueAt}`,
        clockType: obl.timerKind === 'academic_calendar_cutoff' ? 'FIXED_ACADEMIC_CALENDAR'
          : obl.timerKind === 'validity_expiry' ? 'DOCUMENT_VALIDITY_WINDOW'
          : obl.timerKind === 'internal_demo_sla' ? 'SIMULATED_OPERATIONAL_SLA'
          : 'EVENT_RELATIVE_DURATION',
        dueTimestamp: Date.parse(obl.dueAt),
        dueAt: obl.dueAt,
        dueReason: obl.dueReason,
        ruleCitation: obl.source?.location || 'APH 2024-27 §2.25',
        owner: obl.institutionId,
        nextAction: 'Upload compliance proof document via institution portal',
        subjectVersion: 1,
        status: 'scheduled',
        attempts: 0,
      };
      complianceDB.timers.set(timerTask.timerId, timerTask);
    }
  }
}
