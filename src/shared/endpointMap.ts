import type { ApiResult, Application, AuditEvent, CommandResult, CorrectionCommand, DashboardSummary, Decision, DecisionCommand, DocumentUploadCommand, DocumentVersion, EvidenceReviewCommand, EVCTask, EVCReportCommand, IntakeCommand, LoginRequest, Notification, Page, RescrutinyCommand, RouteExplanation, ScheduleEVCCommand, ScrutinySnapshot, SessionResponse, SignScrutinyCommand, TransitionCommand } from './contracts';
export const API_PREFIX = '/api/v1' as const;
const segment = (id: string) => encodeURIComponent(id);
export const paths = {
  authLogin: '/auth/login', authLogout: '/auth/logout', authMe: '/auth/me',
  applications: '/applications', application: (id: string) => `/applications/${segment(id)}`,
  explanation: (id: string) => `/applications/${segment(id)}/explanation`,
  transition: (id: string) => `/applications/${segment(id)}/transition`,
  scrutiny: (id: string) => `/applications/${segment(id)}/scrutiny`,
  corrections: (id: string) => `/applications/${segment(id)}/corrections`,
  rescrutiny: (id: string) => `/applications/${segment(id)}/rescrutiny`,
  evcQueue: '/evc/queue', evcSchedule: (id: string) => `/evc/${segment(id)}/schedule`, evcReport: (id: string) => `/evc/${segment(id)}/report`,
  decision: (id: string) => `/applications/${segment(id)}/decisions`,
  documents: '/documents', documentContent: (id: string) => `/documents/${segment(id)}/content`,
  obligationEvidence: (id: string) => `/obligations/${segment(id)}/evidence`, obligationReview: (id: string) => `/obligations/${segment(id)}/review`,
  notifications: '/notifications', notificationRead: (id: string) => `/notifications/${segment(id)}/read`,
  dashboard: '/dashboard/summary', history: (id: string) => `/applications/${segment(id)}/history`,
} as const;
/** These are proposed contracts, not a declaration of live server capabilities.
 * Upload request is multipart metadata + binary file; content success is binary. */
export interface EndpointTypes {
  login: [LoginRequest, SessionResponse]; logout: [undefined, null]; me: [undefined, SessionResponse];
  listApplications: [undefined, Page<Application>]; createApplication: [IntakeCommand, CommandResult]; getApplication: [undefined, Application];
  explanation: [undefined, RouteExplanation]; transition: [TransitionCommand, CommandResult];
  scrutiny: [SignScrutinyCommand, ScrutinySnapshot]; corrections: [CorrectionCommand, CommandResult]; rescrutiny: [RescrutinyCommand, CommandResult];
  evcQueue: [undefined, EVCTask[]]; evcSchedule: [ScheduleEVCCommand, EVCTask]; evcReport: [EVCReportCommand, EVCTask];
  decision: [DecisionCommand, Decision]; documents: [DocumentUploadCommand, DocumentVersion]; documentContent: [undefined, Blob];
  obligationEvidence: [DocumentUploadCommand, DocumentVersion]; obligationReview: [EvidenceReviewCommand, DocumentVersion];
  notifications: [undefined, Page<Notification>]; notificationRead: [undefined, Notification]; dashboard: [undefined, DashboardSummary]; history: [undefined, Page<AuditEvent>];
}
export type RequestOf<K extends keyof EndpointTypes> = EndpointTypes[K][0];
export type ResponseOf<K extends keyof EndpointTypes> = K extends 'documentContent' ? Blob | ApiResult<never> : ApiResult<EndpointTypes[K][1]>;
type Endpoint = { method: 'GET' | 'POST' | 'PATCH'; path: string | ((id: string) => string); owner: 'M1' | 'M2' | 'M3'; transport?: 'multipart' | 'binary' };
export const endpoints = {
  login: { method: 'POST', path: paths.authLogin, owner: 'M1' }, logout: { method: 'POST', path: paths.authLogout, owner: 'M1' }, me: { method: 'GET', path: paths.authMe, owner: 'M1' },
  listApplications: { method: 'GET', path: paths.applications, owner: 'M1' }, createApplication: { method: 'POST', path: paths.applications, owner: 'M1' }, getApplication: { method: 'GET', path: paths.application, owner: 'M1' },
  explanation: { method: 'GET', path: paths.explanation, owner: 'M1' }, transition: { method: 'POST', path: paths.transition, owner: 'M1' },
  scrutiny: { method: 'POST', path: paths.scrutiny, owner: 'M2' }, corrections: { method: 'POST', path: paths.corrections, owner: 'M2' }, rescrutiny: { method: 'POST', path: paths.rescrutiny, owner: 'M2' },
  evcQueue: { method: 'GET', path: paths.evcQueue, owner: 'M2' }, evcSchedule: { method: 'POST', path: paths.evcSchedule, owner: 'M2' }, evcReport: { method: 'POST', path: paths.evcReport, owner: 'M2' },
  decision: { method: 'POST', path: paths.decision, owner: 'M1' }, documents: { method: 'POST', path: paths.documents, owner: 'M3', transport: 'multipart' }, documentContent: { method: 'GET', path: paths.documentContent, owner: 'M3', transport: 'binary' },
  obligationEvidence: { method: 'POST', path: paths.obligationEvidence, owner: 'M3', transport: 'multipart' }, obligationReview: { method: 'POST', path: paths.obligationReview, owner: 'M3' },
  notifications: { method: 'GET', path: paths.notifications, owner: 'M3' }, notificationRead: { method: 'PATCH', path: paths.notificationRead, owner: 'M3' }, dashboard: { method: 'GET', path: paths.dashboard, owner: 'M3' }, history: { method: 'GET', path: paths.history, owner: 'M1' },
} as const satisfies Record<keyof EndpointTypes, Endpoint>;
