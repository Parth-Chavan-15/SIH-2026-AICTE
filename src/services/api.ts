import { z } from 'zod';
import type { IntakeCommand, TransitionCommand, DecisionCommand, Application as CanonicalApplication, CaseAction, Actor } from '../shared/contracts';
import { applicationSchema, auditSchema, routeSchema, decisionSchema } from '../shared/schemas';
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

const casePage = z.strictObject({ items: z.array(applicationSchema), total: z.number().int().nonnegative().optional(), nextCursor: z.string().optional() });
export function permittedActions(actor: Actor, app: CanonicalApplication): CaseAction[] {
  if (!actor.permissions.includes('case.transition') || app.route.result !== 'selected') return [];
  const officer = actor.roles.some(r => ['reviewer','regional_officer','bureau_officer'].includes(r));
  if (app.state === 'submitted' && officer) return ['start_scrutiny'];
  if (app.state === 'scrutiny_pending' && officer) return app.route.stages.includes('evc_pending') ? ['complete_scrutiny'] : ['complete_scrutiny','send_for_decision'];
  if (app.state === 'evc_pending' && actor.roles.some(r => ['evc','regional_officer','bureau_officer'].includes(r))) return ['complete_evc'];
  return [];
}
export const canDecide = (actor: Actor, app: CanonicalApplication) => actor.permissions.includes('decision.record') && actor.roles.includes('demo_authority') && app.state === 'decision_pending';
class APIService {
  public async listCases() { return casePage.parse(await requestJson('/applications')); }
  public async case(id: string) { return applicationSchema.parse(await requestJson('/applications/'+encodeURIComponent(id))); }
  public async history(id: string) { return z.strictObject({ items: z.array(auditSchema), total: z.number().optional(), nextCursor: z.string().optional() }).parse(await requestJson('/applications/'+encodeURIComponent(id)+'/history')); }
  public async explanation(id: string) { return routeSchema.parse(await requestJson('/applications/'+encodeURIComponent(id)+'/explanation')); }
  public async intake(command: IntakeCommand) { return this.caseResult(await requestJson('/applications', {method:'POST', body:JSON.stringify(command)})); }
  public async transition(id: string, command: TransitionCommand) { return this.caseResult(await requestJson('/applications/'+encodeURIComponent(id)+'/transition', {method:'POST', body:JSON.stringify(command)})); }
  public async decide(id: string, command: DecisionCommand) { return decisionSchema.parse(await requestJson('/applications/'+encodeURIComponent(id)+'/decisions', {method:'POST', body:JSON.stringify(command)})); }
  private caseResult(value: unknown) { return z.strictObject({application: applicationSchema, eventId: z.string().min(1)}).parse(value); }

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
  public async getApplications(role?: UserRole, regionFilter?: string): Promise<Application[]> { throw new Error('Legacy UI is retired; use listCases with canonical DTOs.'); }

  public async getApplicationById(id: string): Promise<Application | undefined> { throw new Error('Legacy UI is retired; use case with canonical DTOs.'); }

  public async createApplication(_newApp: Partial<Application>, _actor: UserProfile): Promise<Application> { throw new Error('Legacy UI is retired; use intake with canonical DTOs.'); }
  public async transitionStage(_id: string, _stage: WorkflowStage, _actor: UserProfile, _reason?: string): Promise<Application> { throw new Error('Legacy UI is retired; use named transition commands.'); }

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
