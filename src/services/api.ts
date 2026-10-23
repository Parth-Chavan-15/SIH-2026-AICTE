import { getSession, requestJson } from './session';
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

import { computeSLAStatus } from '../utils/slaCalculator';

class APIService {
  private normalizeApplication(row: any): Application {
    const sla=computeSLAStatus(row.currentStageStartedAt,row.stageDeadlineDays);
    return {...row,id:String(row._id ?? row.id),slaStatus:sla.status,elapsedDaysAtStage:sla.elapsedDays,overdueDays:sla.overdueDays,totalElapsedDays:0} as Application;
  }
  private applications: Application[];
  private evcInspections: EVCInspection[];
  private complianceItems: ComplianceUndertaking[];
  private expiringDocuments: ExpiringDocument[];
  private notifications: NotificationItem[];
  private escalations: EscalationRecord[];
  private auditLog: AuditEvent[];
  private configRules: ConfigRule[];

  constructor() { this.applications=[]; this.evcInspections=[]; this.complianceItems=[]; this.expiringDocuments=[]; this.notifications=[]; this.escalations=[]; this.auditLog=[]; this.configRules=[]; }

  // --- Users & Profiles ---
  public getUserProfile(_requestedRole?: UserRole): UserProfile {
    const actor = getSession()?.actor;
    // Legacy display labels only. Server permissions remain the sole authority.
    const role: UserRole = actor?.roles.some(role => role === 'regional_officer' || role === 'reviewer') ? 'regional_officer'
      : actor?.roles.includes('bureau_officer') ? 'bureau_officer'
      : actor?.roles.includes('evc') ? 'evc_committee'
      : actor?.roles.includes('policy_admin') ? 'admin' : 'institution';
    return { id: actor?.id ?? 'UNAUTHENTICATED', name: actor?.id ?? 'Unauthenticated', role,
      roleTitle: actor?.roles.join(', ') ?? 'Unauthenticated', organization: 'Fictional demonstration',
      region: actor?.regionIds.join(', ') ?? '', email: '', avatarInitials: 'DM' };
  }

  // --- Applications ---
  public async getApplications(role?: UserRole, regionFilter?: string): Promise<Application[]> { const rows=await requestJson<any[]>('/applications'); this.applications=rows.map(row=>this.normalizeApplication(row)); return [...this.applications]; }

  public async getApplicationById(id: string): Promise<Application | undefined> { const row=await requestJson<any>('/applications/'+encodeURIComponent(id)); return this.normalizeApplication(row); }

  public async createApplication(newApp: Partial<Application>, actor: UserProfile): Promise<Application> { const row=await requestJson<any>('/applications',{method:'POST',body:JSON.stringify({institutionCode:newApp.institutionCode,region:newApp.region,institutionName:newApp.institutionName,state:newApp.state,city:newApp.city,applicationType:newApp.applicationType,program:newApp.program,proposedIntake:newApp.proposedIntake})}); return this.normalizeApplication(row); }

  public async transitionStage(
    applicationId: string,
    targetStage: WorkflowStage,
    actor: UserProfile,
    reason?: string
  ): Promise<Application> { const row=await requestJson<any>('/applications/'+encodeURIComponent(applicationId)+'/transition',{method:'POST',body:JSON.stringify({targetStage,reason})}); return this.normalizeApplication(row); }

  public async addObservation(
    applicationId: string,
    type: 'Observation' | 'Deficiency' | 'Clarification Request' | 'Recommendation',
    comment: string,
    actor: UserProfile,
    mandatory: boolean = false
  ): Promise<Application> { throw new Error('Domain API is not integrated; no changes were recorded.'); }

  public async verifyDocument(
    applicationId: string,
    docId: string,
    status: 'Verified' | 'Rejected',
    actor: UserProfile,
    rejectionReason?: string
  ): Promise<Application> { throw new Error('Domain API is not integrated; no changes were recorded.'); }

  // --- EVC Inspections ---
  public async getEVCInspections(): Promise<EVCInspection[]> { return []; /* Domain API not integrated; no authoritative local fixtures. */ }

  public async scheduleEVC(
    applicationId: string,
    scheduledDate: string,
    scheduledTime: string,
    committeeChairman: string,
    committeeMembers: string[],
    actor: UserProfile
  ): Promise<EVCInspection> { throw new Error('Domain API is not integrated; no changes were recorded.'); }

  public async submitEVCReport(
    evcId: string,
    reportSummary: string,
    recommendation: 'Recommended' | 'Recommended with Conditions' | 'Not Recommended',
    infrastructureScore: number,
    facultyScore: number,
    laboratoriesScore: number,
    actor: UserProfile
  ): Promise<EVCInspection> { throw new Error('Domain API is not integrated; no changes were recorded.'); }

  // --- Institutional Compliance ---
  public async getComplianceItems(): Promise<ComplianceUndertaking[]> { return []; /* Domain API not integrated; no authoritative local fixtures. */ }

  public async submitComplianceEvidence(
    complianceId: string,
    evidenceDocumentName: string,
    actor: UserProfile
  ): Promise<ComplianceUndertaking> { throw new Error('Domain API is not integrated; no changes were recorded.'); }

  public async verifyCompliance(
    complianceId: string,
    status: 'Verified' | 'Rejected',
    remarks: string,
    actor: UserProfile
  ): Promise<ComplianceUndertaking> { throw new Error('Domain API is not integrated; no changes were recorded.'); }

  // --- Expiring Documents ---
  public async getExpiringDocuments(): Promise<ExpiringDocument[]> { return []; /* Domain API not integrated; no authoritative local fixtures. */ }

  public async submitDocumentRenewal(
    docId: string,
    renewalDocumentName: string,
    actor: UserProfile
  ): Promise<ExpiringDocument> { throw new Error('Domain API is not integrated; no changes were recorded.'); }

  public async verifyDocumentRenewal(
    docId: string,
    actor: UserProfile
  ): Promise<ExpiringDocument> { throw new Error('Domain API is not integrated; no changes were recorded.'); }

  // --- Notifications & Escalations ---
  public async getNotifications(): Promise<NotificationItem[]> { return requestJson<NotificationItem[]>('/notifications'); }

  public async markNotificationAsRead(id: string): Promise<void> { await requestJson('/notifications/'+encodeURIComponent(id)+'/read',{method:'PATCH'}); }

  public async markAllNotificationsAsRead(): Promise<void> { const owned=await this.getNotifications(); await Promise.all(owned.map(n=>this.markNotificationAsRead(n.id))); }

  public async getEscalations(): Promise<EscalationRecord[]> { return []; /* Domain API not integrated; no authoritative local fixtures. */ }

  public async resolveEscalation(
    id: string,
    notes: string,
    actor: UserProfile
  ): Promise<EscalationRecord> { throw new Error('Domain API is not integrated; no changes were recorded.'); }

  // --- Audit Trail ---
  public async getAuditLog(): Promise<AuditEvent[]> { return requestJson<AuditEvent[]>('/audit-logs'); }

  // --- Config Rules ---
  public async getConfigRules(): Promise<ConfigRule[]> { return []; /* Domain API not integrated; no authoritative local fixtures. */ }

  public async updateConfigRule(
    id: string,
    newValue: number | string,
    actor: UserProfile
  ): Promise<ConfigRule> { throw new Error('Domain API is not integrated; no changes were recorded.'); }

  // Reset to factory defaults for easy presentation reset
  public resetToDefaults(): void { this.applications=[]; this.auditLog=[]; this.notifications=[]; }
}

export const api = new APIService();
