import {
  Application,
  EVCInspection,
  ComplianceUndertaking,
  ExpiringDocument,
  NotificationItem,
  EscalationRecord,
  AuditEvent,
  ConfigRule,
  UserProfile,
  UserRole,
  WorkflowStage,
} from '../types';
import {
  INITIAL_APPLICATIONS,
  INITIAL_EVC_INSPECTIONS,
  INITIAL_COMPLIANCE_ITEMS,
  INITIAL_EXPIRING_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ESCALATIONS,
  INITIAL_AUDIT_LOG,
  INITIAL_CONFIG_RULES,
  MOCK_USERS,
} from '../data/mockData';
import { computeSLAStatus } from '../utils/slaCalculator';

// Local storage key for demo session state persistence
const STORAGE_PREFIX = 'aicte_sih_26262_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

class APIService {
  private applications: Application[];
  private evcInspections: EVCInspection[];
  private complianceItems: ComplianceUndertaking[];
  private expiringDocuments: ExpiringDocument[];
  private notifications: NotificationItem[];
  private escalations: EscalationRecord[];
  private auditLog: AuditEvent[];
  private configRules: ConfigRule[];

  constructor() {
    this.applications = loadFromStorage('applications', INITIAL_APPLICATIONS);
    this.evcInspections = loadFromStorage('evc_inspections', INITIAL_EVC_INSPECTIONS);
    this.complianceItems = loadFromStorage('compliance_items', INITIAL_COMPLIANCE_ITEMS);
    this.expiringDocuments = loadFromStorage('expiring_docs', INITIAL_EXPIRING_DOCUMENTS);
    this.notifications = loadFromStorage('notifications', INITIAL_NOTIFICATIONS);
    this.escalations = loadFromStorage('escalations', INITIAL_ESCALATIONS);
    this.auditLog = loadFromStorage('audit_log', INITIAL_AUDIT_LOG);
    this.configRules = loadFromStorage('config_rules', INITIAL_CONFIG_RULES);
  }

  // --- Users & Profiles ---
  public getUserProfile(role: UserRole): UserProfile {
    return MOCK_USERS[role] || MOCK_USERS.institution;
  }

  // --- Applications ---
  public async getApplications(role?: UserRole, regionFilter?: string): Promise<Application[]> {
    let result = [...this.applications];
    // Dynamic SLA recalculation
    result = result.map((app) => {
      const sla = computeSLAStatus(app.currentStageStartedAt, app.stageDeadlineDays);
      return {
        ...app,
        slaStatus: sla.status,
        elapsedDaysAtStage: sla.elapsedDays,
        overdueDays: sla.overdueDays,
      };
    });

    if (role === 'institution') {
      // Show applications belonging to this institution
      result = result.filter((a) => a.institutionCode === '1-1049281' || a.id === 'app-001');
    } else if (role === 'regional_officer' && regionFilter && regionFilter !== 'All') {
      result = result.filter((a) => a.region === regionFilter);
    }
    return result;
  }

  public async getApplicationById(id: string): Promise<Application | undefined> {
    const app = this.applications.find((a) => a.id === id);
    if (!app) return undefined;
    const sla = computeSLAStatus(app.currentStageStartedAt, app.stageDeadlineDays);
    return {
      ...app,
      slaStatus: sla.status,
      elapsedDaysAtStage: sla.elapsedDays,
      overdueDays: sla.overdueDays,
    };
  }

  public async createApplication(newApp: Partial<Application>, actor: UserProfile): Promise<Application> {
    const id = `app-${Date.now().toString().slice(-4)}`;
    const appNumber = `AICTE-2026-${(newApp.region || 'WR').slice(0, 2).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    const created: Application = {
      id,
      applicationNumber: appNumber,
      institutionName: newApp.institutionName || actor.organization,
      institutionCode: newApp.institutionCode || '1-1049281',
      region: (newApp.region as any) || 'Western',
      state: newApp.state || 'Maharashtra',
      city: newApp.city || 'Pune',
      applicationType: newApp.applicationType || 'Extension of Approval (EoA)',
      academicYear: '2027-28',
      program: newApp.program || 'Engineering & Technology',
      proposedIntake: Number(newApp.proposedIntake) || 300,
      routeType: newApp.routeType || 'Scrutiny Only',
      currentStage: newApp.currentStage || 'Application Submitted',
      currentStageStartedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      stageDeadlineDays: 7,
      assignedOfficer: 'Shri R. K. Deshmukh',
      priority: (newApp.priority as any) || 'Medium',
      slaStatus: 'within_sla',
      elapsedDaysAtStage: 0,
      totalElapsedDays: 0,
      overdueDays: 0,
      isEscalated: false,
      documents: newApp.documents || [
        {
          id: `doc-${Date.now()}`,
          name: 'Institutional Self-Disclosure & Compliance Affidavit',
          category: 'Affidavit & Undertaking',
          fileName: 'AICTE_Self_Disclosure_Affidavit.pdf',
          fileSize: '2.1 MB',
          uploadedAt: new Date().toISOString(),
          verified: false,
          status: 'Pending Verification',
        },
      ],
      observations: [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          stage: 'Application Submitted',
          action: 'Application created and submitted online',
          actorName: actor.name,
          actorRole: actor.roleTitle,
          timestamp: new Date().toISOString(),
          status: 'completed',
          durationDays: 0,
        },
      ],
    };

    this.applications.unshift(created);
    saveToStorage('applications', this.applications);

    this.logAuditEvent({
      actorName: actor.name,
      actorRole: actor.roleTitle,
      action: 'APPLICATION_CREATED',
      applicationId: created.id,
      applicationNumber: created.applicationNumber,
      previousState: 'None',
      newState: created.currentStage,
      reason: `Application submitted for ${created.applicationType}`,
      result: 'SUCCESS',
    });

    return created;
  }

  public async transitionStage(
    applicationId: string,
    targetStage: WorkflowStage,
    actor: UserProfile,
    reason?: string
  ): Promise<Application> {
    const appIndex = this.applications.findIndex((a) => a.id === applicationId);
    if (appIndex === -1) throw new Error('Application not found');

    const app = this.applications[appIndex];
    const previousStage = app.currentStage;

    const updatedTimeline = [
      ...app.timeline.map((t) => (t.status === 'active' ? { ...t, status: 'completed' as const } : t)),
      {
        id: `tl-${Date.now()}`,
        stage: targetStage,
        action: `Transitioned from ${previousStage} to ${targetStage}`,
        actorName: actor.name,
        actorRole: actor.roleTitle,
        timestamp: new Date().toISOString(),
        notes: reason,
        status: 'active' as const,
        durationDays: 0,
      },
    ];

    const updatedApp: Application = {
      ...app,
      currentStage: targetStage,
      currentStageStartedAt: new Date().toISOString(),
      timeline: updatedTimeline,
      slaStatus: 'within_sla',
      elapsedDaysAtStage: 0,
      overdueDays: 0,
    };

    if (reason && reason.trim()) {
      updatedApp.observations.push({
        id: `obs-${Date.now()}`,
        stage: targetStage,
        authorName: actor.name,
        authorRole: actor.roleTitle,
        timestamp: new Date().toISOString(),
        type: targetStage === 'Deficiency Communicated' ? 'Deficiency' : 'Observation',
        comment: reason,
        mandatoryResolutionRequired: targetStage === 'Deficiency Communicated',
        resolved: false,
      });
    }

    this.applications[appIndex] = updatedApp;
    saveToStorage('applications', this.applications);

    this.logAuditEvent({
      actorName: actor.name,
      actorRole: actor.roleTitle,
      action: 'STAGE_TRANSITION',
      applicationId: app.id,
      applicationNumber: app.applicationNumber,
      previousState: previousStage,
      newState: targetStage,
      reason: reason || `Stage advanced to ${targetStage}`,
      result: 'SUCCESS',
    });

    return updatedApp;
  }

  public async addObservation(
    applicationId: string,
    type: 'Observation' | 'Deficiency' | 'Clarification Request' | 'Recommendation',
    comment: string,
    actor: UserProfile,
    mandatory: boolean = false
  ): Promise<Application> {
    const appIndex = this.applications.findIndex((a) => a.id === applicationId);
    if (appIndex === -1) throw new Error('Application not found');

    const app = this.applications[appIndex];
    const newObs = {
      id: `obs-${Date.now()}`,
      stage: app.currentStage,
      authorName: actor.name,
      authorRole: actor.roleTitle,
      timestamp: new Date().toISOString(),
      type,
      comment,
      mandatoryResolutionRequired: mandatory,
      resolved: false,
    };

    app.observations.push(newObs);
    saveToStorage('applications', this.applications);

    this.logAuditEvent({
      actorName: actor.name,
      actorRole: actor.roleTitle,
      action: 'RECORDED_OBSERVATION',
      applicationId: app.id,
      applicationNumber: app.applicationNumber,
      newState: type,
      reason: comment,
      result: 'SUCCESS',
    });

    return app;
  }

  public async verifyDocument(
    applicationId: string,
    docId: string,
    status: 'Verified' | 'Rejected',
    actor: UserProfile,
    rejectionReason?: string
  ): Promise<Application> {
    const app = this.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');

    const doc = app.documents.find((d) => d.id === docId);
    if (!doc) throw new Error('Document not found');

    doc.status = status;
    doc.verified = status === 'Verified';
    doc.verifiedBy = actor.name;
    doc.verificationDate = new Date().toISOString();
    if (rejectionReason) doc.rejectionReason = rejectionReason;

    saveToStorage('applications', this.applications);

    this.logAuditEvent({
      actorName: actor.name,
      actorRole: actor.roleTitle,
      action: status === 'Verified' ? 'VERIFIED_DOCUMENT' : 'REJECTED_DOCUMENT',
      applicationId: app.id,
      applicationNumber: app.applicationNumber,
      previousState: 'Pending Verification',
      newState: status,
      reason: rejectionReason || `Document "${doc.name}" marked as ${status}`,
      result: 'SUCCESS',
    });

    return app;
  }

  // --- EVC Inspections ---
  public async getEVCInspections(): Promise<EVCInspection[]> {
    return [...this.evcInspections];
  }

  public async scheduleEVC(
    applicationId: string,
    scheduledDate: string,
    scheduledTime: string,
    committeeChairman: string,
    committeeMembers: string[],
    actor: UserProfile
  ): Promise<EVCInspection> {
    const app = this.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');

    const newEvc: EVCInspection = {
      id: `evc-${Date.now()}`,
      applicationId: app.id,
      applicationNumber: app.applicationNumber,
      institutionName: app.institutionName,
      region: app.region,
      scheduledDate,
      scheduledTime,
      committeeChairman,
      committeeMembers,
      status: 'Scheduled',
      isDelayed: false,
      reportSubmitted: false,
      assignedOfficer: actor.name,
    };

    this.evcInspections.unshift(newEvc);
    app.evcId = newEvc.id;
    saveToStorage('evc_inspections', this.evcInspections);
    saveToStorage('applications', this.applications);

    this.logAuditEvent({
      actorName: actor.name,
      actorRole: actor.roleTitle,
      action: 'SCHEDULED_EVC',
      applicationId: app.id,
      applicationNumber: app.applicationNumber,
      newState: 'EVC Scheduled',
      reason: `EVC inspection timetable fixed on ${scheduledDate} with Chair ${committeeChairman}`,
      result: 'SUCCESS',
    });

    return newEvc;
  }

  public async submitEVCReport(
    evcId: string,
    reportSummary: string,
    recommendation: 'Recommended' | 'Recommended with Conditions' | 'Not Recommended',
    infrastructureScore: number,
    facultyScore: number,
    laboratoriesScore: number,
    actor: UserProfile
  ): Promise<EVCInspection> {
    const evc = this.evcInspections.find((e) => e.id === evcId);
    if (!evc) throw new Error('EVC Inspection record not found');

    evc.status = 'Completed';
    evc.reportSubmitted = true;
    evc.reportSubmissionDate = new Date().toISOString();
    evc.reportSummary = reportSummary;
    evc.recommendation = recommendation;
    evc.infrastructureScore = infrastructureScore;
    evc.facultyScore = facultyScore;
    evc.laboratoriesScore = laboratoriesScore;

    saveToStorage('evc_inspections', this.evcInspections);

    this.logAuditEvent({
      actorName: actor.name,
      actorRole: actor.roleTitle,
      action: 'SUBMITTED_EVC_REPORT',
      applicationId: evc.applicationId,
      applicationNumber: evc.applicationNumber,
      previousState: 'Scheduled',
      newState: 'Completed',
      reason: `EVC report submitted: Recommendation - ${recommendation}, Infra Score: ${infrastructureScore}%`,
      result: 'SUCCESS',
    });

    return evc;
  }

  // --- Institutional Compliance ---
  public async getComplianceItems(): Promise<ComplianceUndertaking[]> {
    return [...this.complianceItems];
  }

  public async submitComplianceEvidence(
    complianceId: string,
    evidenceDocumentName: string,
    actor: UserProfile
  ): Promise<ComplianceUndertaking> {
    const item = this.complianceItems.find((c) => c.id === complianceId);
    if (!item) throw new Error('Compliance item not found');

    item.status = 'Submitted';
    item.evidenceDocumentName = evidenceDocumentName;
    item.evidenceUploadedAt = new Date().toISOString();

    saveToStorage('compliance_items', this.complianceItems);

    this.logAuditEvent({
      actorName: actor.name,
      actorRole: actor.roleTitle,
      action: 'COMPLIANCE_EVIDENCE_SUBMITTED',
      applicationId: item.applicationId,
      applicationNumber: item.applicationNumber,
      previousState: 'Pending Evidence',
      newState: 'Submitted',
      reason: `Evidence file uploaded: ${evidenceDocumentName}`,
      result: 'SUCCESS',
    });

    return item;
  }

  public async verifyCompliance(
    complianceId: string,
    status: 'Verified' | 'Rejected',
    remarks: string,
    actor: UserProfile
  ): Promise<ComplianceUndertaking> {
    const item = this.complianceItems.find((c) => c.id === complianceId);
    if (!item) throw new Error('Compliance item not found');

    item.status = status;
    item.reviewerRemarks = remarks;
    item.verifiedBy = actor.name;
    item.verifiedAt = new Date().toISOString();

    saveToStorage('compliance_items', this.complianceItems);

    this.logAuditEvent({
      actorName: actor.name,
      actorRole: actor.roleTitle,
      action: status === 'Verified' ? 'COMPLIANCE_VERIFIED' : 'COMPLIANCE_REJECTED',
      applicationId: item.applicationId,
      applicationNumber: item.applicationNumber,
      previousState: 'Submitted',
      newState: status,
      reason: remarks,
      result: 'SUCCESS',
    });

    return item;
  }

  // --- Expiring Documents ---
  public async getExpiringDocuments(): Promise<ExpiringDocument[]> {
    return [...this.expiringDocuments];
  }

  public async submitDocumentRenewal(
    docId: string,
    renewalDocumentName: string,
    actor: UserProfile
  ): Promise<ExpiringDocument> {
    const doc = this.expiringDocuments.find((d) => d.id === docId);
    if (!doc) throw new Error('Document record not found');

    doc.renewalStatus = 'Renewal Submitted';
    doc.renewalDocumentName = renewalDocumentName;
    doc.renewalSubmittedAt = new Date().toISOString();

    saveToStorage('expiring_docs', this.expiringDocuments);

    this.logAuditEvent({
      actorName: actor.name,
      actorRole: actor.roleTitle,
      action: 'DOCUMENT_RENEWAL_SUBMITTED',
      applicationId: 'N/A',
      applicationNumber: doc.institutionCode,
      previousState: 'Expiring Soon',
      newState: 'Renewal Submitted',
      reason: `Renewal certificate uploaded: ${renewalDocumentName}`,
      result: 'SUCCESS',
    });

    return doc;
  }

  public async verifyDocumentRenewal(
    docId: string,
    actor: UserProfile
  ): Promise<ExpiringDocument> {
    const doc = this.expiringDocuments.find((d) => d.id === docId);
    if (!doc) throw new Error('Document record not found');

    doc.renewalStatus = 'Renewal Verified';
    doc.renewalVerifiedBy = actor.name;
    doc.daysUntilExpiry = 365; // renewed for 1 year

    saveToStorage('expiring_docs', this.expiringDocuments);

    this.logAuditEvent({
      actorName: actor.name,
      actorRole: actor.roleTitle,
      action: 'DOCUMENT_RENEWAL_VERIFIED',
      applicationId: 'N/A',
      applicationNumber: doc.institutionCode,
      previousState: 'Renewal Submitted',
      newState: 'Renewal Verified',
      reason: `Verified renewed ${doc.documentType} by ${actor.name}`,
      result: 'SUCCESS',
    });

    return doc;
  }

  // --- Notifications & Escalations ---
  public async getNotifications(): Promise<NotificationItem[]> {
    return [...this.notifications];
  }

  public async markNotificationAsRead(id: string): Promise<void> {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      saveToStorage('notifications', this.notifications);
    }
  }

  public async markAllNotificationsAsRead(): Promise<void> {
    this.notifications.forEach((n) => (n.isRead = true));
    saveToStorage('notifications', this.notifications);
  }

  public async getEscalations(): Promise<EscalationRecord[]> {
    return [...this.escalations];
  }

  public async resolveEscalation(
    id: string,
    notes: string,
    actor: UserProfile
  ): Promise<EscalationRecord> {
    const esc = this.escalations.find((e) => e.id === id);
    if (!esc) throw new Error('Escalation record not found');

    esc.status = 'Resolved';
    esc.resolutionNotes = notes;
    esc.resolvedAt = new Date().toISOString();

    saveToStorage('escalations', this.escalations);

    this.logAuditEvent({
      actorName: actor.name,
      actorRole: actor.roleTitle,
      action: 'RESOLVED_ESCALATION',
      applicationId: esc.applicationId,
      applicationNumber: esc.applicationNumber,
      previousState: 'Escalated - Action Required',
      newState: 'Resolved',
      reason: notes,
      result: 'SUCCESS',
    });

    return esc;
  }

  // --- Audit Trail ---
  public async getAuditLog(): Promise<AuditEvent[]> {
    return [...this.auditLog];
  }

  private logAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'tamperProofHash' | 'ipAddress'>): void {
    const newEvent: AuditEvent = {
      ...event,
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      tamperProofHash: `sha256-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
      ipAddress: '10.24.8.12 (AICTE-GOV-VPN)',
    };
    this.auditLog.unshift(newEvent);
    saveToStorage('audit_log', this.auditLog);
  }

  // --- Config Rules ---
  public async getConfigRules(): Promise<ConfigRule[]> {
    return [...this.configRules];
  }

  public async updateConfigRule(
    id: string,
    newValue: number | string,
    actor: UserProfile
  ): Promise<ConfigRule> {
    const rule = this.configRules.find((r) => r.id === id);
    if (!rule) throw new Error('Rule not found');

    const prev = rule.currentValue;
    rule.currentValue = newValue;
    rule.lastUpdated = new Date().toISOString().split('T')[0];
    rule.updatedBy = `${actor.name} (${actor.roleTitle})`;

    saveToStorage('config_rules', this.configRules);

    this.logAuditEvent({
      actorName: actor.name,
      actorRole: actor.roleTitle,
      action: 'UPDATED_CONFIG_RULE',
      applicationId: 'SYSTEM',
      applicationNumber: rule.id,
      previousState: String(prev),
      newState: String(newValue),
      reason: `Configuration rule "${rule.name}" updated`,
      result: 'SUCCESS',
    });

    return rule;
  }

  // Reset to factory defaults for easy presentation reset
  public resetToDefaults(): void {
    try {
      localStorage.removeItem(STORAGE_PREFIX + 'applications');
      localStorage.removeItem(STORAGE_PREFIX + 'evc_inspections');
      localStorage.removeItem(STORAGE_PREFIX + 'compliance_items');
      localStorage.removeItem(STORAGE_PREFIX + 'expiring_docs');
      localStorage.removeItem(STORAGE_PREFIX + 'notifications');
      localStorage.removeItem(STORAGE_PREFIX + 'escalations');
      localStorage.removeItem(STORAGE_PREFIX + 'audit_log');
      localStorage.removeItem(STORAGE_PREFIX + 'config_rules');
    } catch {
      // ignore
    }
    this.applications = [...INITIAL_APPLICATIONS];
    this.evcInspections = [...INITIAL_EVC_INSPECTIONS];
    this.complianceItems = [...INITIAL_COMPLIANCE_ITEMS];
    this.expiringDocuments = [...INITIAL_EXPIRING_DOCUMENTS];
    this.notifications = [...INITIAL_NOTIFICATIONS];
    this.escalations = [...INITIAL_ESCALATIONS];
    this.auditLog = [...INITIAL_AUDIT_LOG];
    this.configRules = [...INITIAL_CONFIG_RULES];
  }
}

export const api = new APIService();
