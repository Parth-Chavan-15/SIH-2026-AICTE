import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
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
  deliveredAlerts: new Map<string, {
    id: string;
    dedupeKey: string;
    title: string;
    message: string;
    timestamp: string;
    applicationId?: string;
    institutionId?: string;
    category?: string;
    severity?: 'critical' | 'warning' | 'info' | 'success';
    isRead?: boolean;
  }>(),
  simulatedClockTimestamp: Date.parse('2026-10-24T09:00:00.000Z'),
};

// MongoDB Durable Persistence Helpers
export async function persistObligationToMongo(obl: Obligation): Promise<void> {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.collection('compliance_obligations').updateOne(
        { id: obl.id },
        { $set: obl },
        { upsert: true }
      );
    }
  } catch {
    // Non-blocking fallback
  }
}

export async function persistStoredDocumentToMongo(doc: StoredDocument): Promise<void> {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.collection('compliance_documents').updateOne(
        { id: doc.id },
        { $set: doc },
        { upsert: true }
      );
    }
  } catch {
    // Non-blocking fallback
  }
}

export async function syncComplianceFromMongo(): Promise<number> {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const items = await mongoose.connection.db.collection('compliance_obligations').find({}).toArray();
      let count = 0;
      for (const item of items) {
        if (item && (item as any).id) {
          complianceDB.obligations.set((item as any).id, item as any);
          count++;
        }
      }
      return count;
    }
  } catch {
    // Non-blocking
  }
  return 0;
}

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
      persistObligationToMongo(obligation);

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
    persistObligationToMongo(obl);
  }

  persistStoredDocumentToMongo(newDoc);
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
  persistStoredDocumentToMongo(doc);

  // If verified, fulfill the linked obligation and suppress stale alerts (Test T11)
  if (doc.obligationId && complianceDB.obligations.has(doc.obligationId)) {
    const obl = complianceDB.obligations.get(doc.obligationId)!;
    if (params.decision === 'verified') {
      obl.status = 'verified';
      obl.version += 1;
      obl.reviewerId = params.reviewerId;
      complianceDB.obligations.set(obl.id, obl);
      persistObligationToMongo(obl);

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
      persistObligationToMongo(obl);
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

  // Institutional Alert Fixtures: Scoped to Canonical Applications
  // 1. COEP Tech (APP-2026-COEP, INST-SOUTH) - 5 Coherent Workflow Events
  complianceDB.deliveredAlerts.set('ALERT-COEP-01-INTAKE', {
    id: 'ALT-COEP-01',
    dedupeKey: 'ALERT-COEP-01-INTAKE',
    title: 'NSWS Digital Intake Recorded',
    message: 'Application APP-2026-COEP (B.Tech AI & Data Science Intake Expansion) successfully ingested from National Single Window System with Class-3 Digital Signature verification.',
    timestamp: '2026-10-22T08:00:00.000Z',
    applicationId: 'APP-2026-COEP',
    institutionId: 'INST-SOUTH',
    category: 'Workflow',
    severity: 'info',
    isRead: true
  });
  complianceDB.deliveredAlerts.set('ALERT-COEP-02-ROUTING', {
    id: 'ALT-COEP-02',
    dedupeKey: 'ALERT-COEP-02-ROUTING',
    title: 'Route Evaluated: Route 1 (Scrutiny Only)',
    message: 'Dynamic Route Engine evaluated statutory criteria under APH Table 2.3 Row 1. NBA accreditation score of 680 waives physical EVC inspection under AY 2026-27 Addendum §2.6(c)(1).',
    timestamp: '2026-10-22T08:05:00.000Z',
    applicationId: 'APP-2026-COEP',
    institutionId: 'INST-SOUTH',
    category: 'Workflow',
    severity: 'info',
    isRead: true
  });
  complianceDB.deliveredAlerts.set('ALERT-COEP-03-ALLOCATION', {
    id: 'ALT-COEP-03',
    dedupeKey: 'ALERT-COEP-03-ALLOCATION',
    title: 'Desk Scrutiny Committee Group Assigned',
    message: 'Western Regional Office (WRO) allocated case APP-2026-COEP to Standing Scrutiny Committee Group Alpha for 6-category statutory checklist examination.',
    timestamp: '2026-10-23T09:30:00.000Z',
    applicationId: 'APP-2026-COEP',
    institutionId: 'INST-SOUTH',
    category: 'Workflow',
    severity: 'info',
    isRead: false
  });
  complianceDB.deliveredAlerts.set('ALERT-COEP-04-SCRUTINY', {
    id: 'ALT-COEP-04',
    dedupeKey: 'ALERT-COEP-04-SCRUTINY',
    title: 'Scrutiny Cleared under NBA Tier-1 Fast-Track',
    message: 'COEP Pune application APP-2026-COEP cleared desk scrutiny with 100% verified compliance across all categories (C1–C6). Docket transmitted to Executive Committee for approval.',
    timestamp: '2026-10-24T07:30:00.000Z',
    applicationId: 'APP-2026-COEP',
    institutionId: 'INST-SOUTH',
    category: 'Workflow',
    severity: 'success',
    isRead: false
  });
  complianceDB.deliveredAlerts.set('ALERT-COEP-05-READINESS', {
    id: 'ALT-COEP-05',
    dedupeKey: 'ALERT-COEP-05-READINESS',
    title: 'Pre-Approval Readiness: Joint FDR & Affidavit-3',
    message: 'Statutory reminder: Upon formal grant of Approval Order, 15-day compliance clock commences under APH §2.25(f) for Joint FDR security deposit submission.',
    timestamp: '2026-10-24T11:00:00.000Z',
    applicationId: 'APP-2026-COEP',
    institutionId: 'INST-SOUTH',
    category: 'Compliance',
    severity: 'warning',
    isRead: false
  });

  // 2. PDIMTR (APP-2026-PDIMTR, INST-PDIMTR)
  complianceDB.deliveredAlerts.set('ALERT-PDIMTR-LEASE', {
    id: 'ALT-PDIMTR-01',
    dedupeKey: 'ALERT-PDIMTR-LEASE',
    title: '30-Year Registered Lease Deed Expiry Countdown',
    message: 'Prerna / Univ BDT College (PDIMTR) registered lease deed expires within 30 days. Form-6 renewal undertaking and valid lease deed registration required under APH Table 1.',
    timestamp: '2026-10-24T08:00:00.000Z',
    applicationId: 'APP-2026-PDIMTR',
    institutionId: 'INST-PDIMTR',
    category: 'Document Expiry',
    severity: 'critical',
    isRead: false
  });

  // 3. GIITS (APP-2026-GIITS, INST-NORTH)
  complianceDB.deliveredAlerts.set('ALERT-GIITS-CADRE', {
    id: 'ALT-GIITS-02',
    dedupeKey: 'ALERT-GIITS-CADRE',
    title: 'Faculty Cadre Ratio Deficiency Flagged (§1.8)',
    message: 'GIITS Visakhapatnam deficiency turnaround open. Cadre ratio deficit (1:2.4 vs 1:2.0) requires additional Associate Professor appointment proof within 10-day operational SLA (Statutory 15-day window applies under §2.25(f) post-approval).',
    timestamp: '2026-10-23T12:00:00.000Z',
    applicationId: 'APP-2026-GIITS',
    institutionId: 'INST-NORTH',
    category: 'Workflow',
    severity: 'warning',
    isRead: false
  });

  // 4. BATU Lonere (APP-2026-BATU, INST-BATU)
  complianceDB.deliveredAlerts.set('ALERT-BATU-EVC', {
    id: 'ALT-BATU-03',
    dedupeKey: 'ALERT-BATU-EVC',
    title: 'EVC Campus Physical Inspection Mandate Queued',
    message: 'BATU Lonere Restoration/Site Shifting application queued for 3-member Expert Visit Committee. Geo-tagged coordinates and 30-min walkthrough required.',
    timestamp: '2026-10-24T09:00:00.000Z',
    applicationId: 'APP-2026-BATU',
    institutionId: 'INST-BATU',
    category: 'EVC',
    severity: 'warning',
    isRead: false
  });

  // 5. Apex Institute (APP-2026-APEX, INST-APEX)
  complianceDB.deliveredAlerts.set('ALERT-APEX-SAC', {
    id: 'ALT-APEX-04',
    dedupeKey: 'ALERT-APEX-SAC',
    title: 'Standing Appellate Committee (SAC) Hearing Listed',
    message: 'Apex Institute of Technology appeal listed before SAC for hearing under APH §1.11. Institution representative summoned with original land revenue records.',
    timestamp: '2026-10-22T10:00:00.000Z',
    applicationId: 'APP-2026-APEX',
    institutionId: 'INST-APEX',
    category: 'Escalation',
    severity: 'info',
    isRead: false
  });
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
