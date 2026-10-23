export type UserRole =
  | 'institution'
  | 'regional_officer'
  | 'bureau_officer'
  | 'evc_committee'
  | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  organization: string;
  region: string;
  email: string;
  avatarInitials: string;
}

export type ApplicationType =
  | 'Extension of Approval (EoA)'
  | 'New Technical Institution'
  | 'Increase in Intake / Additional Course'
  | 'Closure of Course / Institution'
  | 'Conversion to Co-Education'
  | 'Change of Site / Location';

export type WorkflowRouteType =
  | 'Scrutiny Only'
  | 'Scrutiny + EVC'
  | 'Scrutiny + EVC + SAC/SHC'
  | 'Fast-Track EoA';

export type WorkflowStage =
  | 'Draft'
  | 'Application Submitted'
  | 'Scrutiny in Progress'
  | 'Deficiency Communicated'
  | 'Scrutiny Cleared'
  | 'EVC Scheduled'
  | 'EVC Inspection Completed'
  | 'SAC / SHC Review'
  | 'Executive Committee Approval'
  | 'Approval Issued'
  | 'Application Rejected';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export type SLAStatusType = 'within_sla' | 'approaching_deadline' | 'overdue';

export interface DocumentItem {
  id: string;
  name: string;
  category: 'Land & Building' | 'Faculty & Academic' | 'Financial & Legal' | 'Affidavit & Undertaking' | 'Inspection Report';
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: string;
  status: 'Verified' | 'Pending Verification' | 'Rejected' | 'Needs Resubmission';
  rejectionReason?: string;
  expiryDate?: string; // for lease, fire NOC etc.
}

export interface Observation {
  id: string;
  stage: WorkflowStage;
  authorName: string;
  authorRole: string;
  timestamp: string;
  type: 'Observation' | 'Deficiency' | 'Clarification Request' | 'Recommendation' | 'Compliance Note';
  comment: string;
  mandatoryResolutionRequired: boolean;
  resolved: boolean;
  institutionResponse?: string;
  resolvedAt?: string;
}

export interface ApplicationTimelineEvent {
  id: string;
  stage: WorkflowStage;
  action: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  notes?: string;
  status: 'completed' | 'active' | 'pending' | 'returned' | 'overdue';
  durationDays?: number;
}

export interface Application {
  id: string;
  applicationNumber: string;
  institutionName: string;
  institutionCode: string;
  region: 'Northern' | 'Western' | 'Southern' | 'Eastern' | 'South-Western' | 'Central' | 'North-West' | 'South-Central';
  state: string;
  city: string;
  applicationType: ApplicationType;
  academicYear: string;
  program: 'Engineering & Technology' | 'Management' | 'Pharmacy' | 'Architecture' | 'Applied Arts';
  proposedIntake: number;
  routeType: WorkflowRouteType;
  currentStage: WorkflowStage;
  currentStageStartedAt: string;
  submittedAt: string;
  stageDeadlineDays: number;
  assignedOfficer: string;
  priority: PriorityLevel;
  slaStatus: SLAStatusType;
  elapsedDaysAtStage: number;
  totalElapsedDays: number;
  overdueDays: number;
  isEscalated: boolean;
  escalatedTo?: string;
  documents: DocumentItem[];
  observations: Observation[];
  timeline: ApplicationTimelineEvent[];
  evcId?: string;
}

export interface EVCInspection {
  id: string;
  applicationId: string;
  applicationNumber: string;
  institutionName: string;
  region: string;
  scheduledDate: string;
  scheduledTime: string;
  committeeChairman: string;
  committeeMembers: string[];
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed / Rescheduled' | 'Cancelled';
  isDelayed: boolean;
  delayDays?: number;
  reportSubmitted: boolean;
  reportSubmissionDate?: string;
  reportSummary?: string;
  recommendation?: 'Recommended' | 'Recommended with Conditions' | 'Not Recommended';
  infrastructureScore?: number; // 0-100
  facultyScore?: number; // 0-100
  laboratoriesScore?: number; // 0-100
  assignedOfficer: string;
}

export interface ComplianceUndertaking {
  id: string;
  applicationId: string;
  applicationNumber: string;
  institutionName: string;
  conditionTitle: string;
  description: string;
  dueDate: string;
  status: 'Pending Evidence' | 'Submitted' | 'Under Review' | 'Verified' | 'Rejected' | 'Overdue';
  evidenceDocumentName?: string;
  evidenceUploadedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  reviewerRemarks?: string;
  isApproaching: boolean;
  isOverdue: boolean;
  daysRemaining: number;
}

export interface ExpiringDocument {
  id: string;
  institutionName: string;
  institutionCode: string;
  region: string;
  documentType: 'Land Lease Deed' | 'Fire Safety NOC' | 'Building Stability Certificate' | 'Environmental Clearance' | 'Corpus Fund FDR';
  documentNumber: string;
  issuedDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  renewalStatus: 'Valid' | 'Expiring Soon' | 'Expired' | 'Renewal Submitted' | 'Renewal Verified';
  renewalDocumentName?: string;
  renewalSubmittedAt?: string;
  renewalVerifiedBy?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'Deadline' | 'Overdue' | 'EVC' | 'Compliance' | 'Document Expiry' | 'Escalation' | 'Workflow';
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  isRead: boolean;
  applicationId?: string;
  actionUrl?: string;
}

export interface EscalationRecord {
  id: string;
  applicationId: string;
  applicationNumber: string;
  institutionName: string;
  region: string;
  currentStage: WorkflowStage;
  escalationReason: string;
  previousAuthority: string;
  escalatedTo: string;
  escalationTimestamp: string;
  status: 'Escalated - Action Required' | 'Under Investigation' | 'Resolved';
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  applicationId: string;
  applicationNumber: string;
  previousState?: string;
  newState?: string;
  reason?: string;
  tamperProofHash: string;
  ipAddress: string;
  result: 'SUCCESS' | 'FAILED' | 'FLAGGED';
}

export interface ConfigRule {
  id: string;
  category: 'SLA Timelines' | 'Escalation Hierarchy' | 'Workflow Routes' | 'Notification Alerts';
  name: string;
  description: string;
  currentValue: string | number;
  unit: string;
  lastUpdated: string;
  updatedBy: string;
  status: 'Active' | 'Draft';
}
