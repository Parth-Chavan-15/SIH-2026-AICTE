import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserRole,
  UserProfile,
  Application,
  EVCInspection,
  ComplianceUndertaking,
  ExpiringDocument,
  NotificationItem,
  EscalationRecord,
  AuditEvent,
  ConfigRule,
  WorkflowStage,
} from '../types';
import { api } from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  role: UserRole;
  user: UserProfile;
  setRole: (role: UserRole) => void;
  applications: Application[];
  evcInspections: EVCInspection[];
  complianceItems: ComplianceUndertaking[];
  expiringDocs: ExpiringDocument[];
  notifications: NotificationItem[];
  escalations: EscalationRecord[];
  auditLog: AuditEvent[];
  configRules: ConfigRule[];
  loading: boolean;
  selectedAppId: string | null;
  setSelectedAppId: (id: string | null) => void;
  // Actions
  refreshData: () => Promise<void>;
  createApplication: (data: Partial<Application>) => Promise<Application>;
  transitionStage: (appId: string, stage: WorkflowStage, reason?: string) => Promise<Application>;
  addObservation: (
    appId: string,
    type: 'Observation' | 'Deficiency' | 'Clarification Request' | 'Recommendation',
    comment: string,
    mandatory?: boolean
  ) => Promise<void>;
  verifyDocument: (
    appId: string,
    docId: string,
    status: 'Verified' | 'Rejected',
    reason?: string
  ) => Promise<void>;
  scheduleEVC: (
    appId: string,
    date: string,
    time: string,
    chair: string,
    members: string[]
  ) => Promise<void>;
  submitEVCReport: (
    evcId: string,
    summary: string,
    rec: 'Recommended' | 'Recommended with Conditions' | 'Not Recommended',
    infraScore: number,
    facultyScore: number,
    labsScore: number
  ) => Promise<void>;
  submitComplianceEvidence: (complianceId: string, fileName: string) => Promise<void>;
  verifyCompliance: (complianceId: string, status: 'Verified' | 'Rejected', remarks: string) => Promise<void>;
  submitDocumentRenewal: (docId: string, renewalDocName: string) => Promise<void>;
  verifyDocumentRenewal: (docId: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  resolveEscalation: (id: string, notes: string) => Promise<void>;
  updateConfigRule: (id: string, value: number | string) => Promise<void>;
  resetDemoData: () => void;
  // Clock simulation
  simulationTime: string;
  triggerAdvanceClock: (days: number) => Promise<void>;
  // Toast
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role] = useState<UserRole>(api.getUserProfile().role);
  const [user] = useState<UserProfile>(api.getUserProfile());
  const [applications, setApplications] = useState<Application[]>([]);
  const [evcInspections, setEvcInspections] = useState<EVCInspection[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceUndertaking[]>([]);
  const [expiringDocs, setExpiringDocs] = useState<ExpiringDocument[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [configRules, setConfigRules] = useState<ConfigRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [simulationDays, setSimulationDays] = useState<number>(0);
  const simulationTime = new Date(Date.now() + simulationDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleAdvanceClock = async (days: number) => {
    try {
      await api.advanceClock(days);
      setSimulationDays((prev) => prev + days);
      await refreshData();
      addToast({
        type: 'info',
        title: `Regulatory Clock Advanced (+${days}d)`,
        message: `Advanced simulation date to ${new Date(Date.now() + (simulationDays + days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}. Timers evaluated and outbox synchronized.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Clock advance failed',
        message: err.message || 'Unable to advance simulation clock',
      });
    }
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setRole = (newRole: UserRole) => {
    addToast({
      type: 'info',
      title: 'Server-verified account',
      message: 'Sign out and authenticate another configured account to change identity.',
    });
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [apps, evcs, comps, docs, notifs, escs, audits, rules] = await Promise.all([
        api.getApplications(role),
        api.getEVCInspections(),
        api.getComplianceItems(),
        api.getExpiringDocuments(),
        api.getNotifications(),
        api.getEscalations(),
        api.getAuditLog(),
        api.getConfigRules(),
      ]);
      setApplications(apps);
      setEvcInspections(evcs);
      setComplianceItems(comps);
      setExpiringDocs(docs);
      setNotifications(notifs);
      setEscalations(escs);
      setAuditLog(audits);
      setConfigRules(rules);
    } catch (err) {
      setApplications([]); setAuditLog([]); setNotifications([]);
      addToast({
        type: 'error',
        title: 'Data Load Failed',
        message: 'Could not fetch live workflow data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [role]);

  const handleCreateApplication = async (data: Partial<Application>): Promise<Application> => {
    try {
      const created = await api.createApplication(data, user);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Application Created Successfully',
        message: `Reference ID: ${created.applicationNumber}`,
      });
      return created;
    } catch (e: any) {
      addToast({ type: 'error', title: 'Creation Failed', message: e.message });
      throw e;
    }
  };

  const handleTransitionStage = async (
    appId: string,
    stage: WorkflowStage,
    reason?: string
  ): Promise<Application> => {
    try {
      const updated = await api.transitionStage(appId, stage, user, reason);
      await refreshData();
      addToast({
        type: 'success',
        title: `Workflow Stage Updated`,
        message: `Application moved to: ${stage}`,
      });
      return updated;
    } catch (e: any) {
      addToast({ type: 'error', title: 'Workflow Transition Error', message: e.message });
      throw e;
    }
  };

  const handleAddObservation = async (
    appId: string,
    type: 'Observation' | 'Deficiency' | 'Clarification Request' | 'Recommendation',
    comment: string,
    mandatory?: boolean
  ) => {
    try {
      await api.addObservation(appId, type, comment, user, mandatory);
      await refreshData();
      addToast({
        type: 'success',
        title: `${type} Recorded`,
        message: 'Saved to official application file and audit log.',
      });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Observation Failed', message: e.message });
    }
  };

  const handleVerifyDocument = async (
    appId: string,
    docId: string,
    status: 'Verified' | 'Rejected',
    reason?: string
  ) => {
    try {
      await api.verifyDocument(appId, docId, status, user, reason);
      await refreshData();
      addToast({
        type: status === 'Verified' ? 'success' : 'warning',
        title: `Document ${status}`,
        message: reason || `Updated document verification status`,
      });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Verification Failed', message: e.message });
    }
  };

  const handleScheduleEVC = async (
    appId: string,
    date: string,
    time: string,
    chair: string,
    members: string[]
  ) => {
    try {
      await api.scheduleEVC(appId, date, time, chair, members, user);
      await refreshData();
      addToast({
        type: 'success',
        title: 'EVC Visit Scheduled',
        message: `Inspection set for ${date}. Chairman: ${chair}`,
      });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Scheduling Failed', message: e.message });
    }
  };

  const handleSubmitEVCReport = async (
    evcId: string,
    summary: string,
    rec: 'Recommended' | 'Recommended with Conditions' | 'Not Recommended',
    infraScore: number,
    facultyScore: number,
    labsScore: number
  ) => {
    try {
      await api.submitEVCReport(evcId, summary, rec, infraScore, facultyScore, labsScore, user);
      await refreshData();
      addToast({
        type: 'success',
        title: 'EVC Inspection Report Submitted',
        message: `Recommendation: ${rec} (Infra: ${infraScore}%, Faculty: ${facultyScore}%)`,
      });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Submission Failed', message: e.message });
    }
  };

  const handleSubmitComplianceEvidence = async (complianceId: string, fileName: string) => {
    try {
      await api.submitComplianceEvidence(complianceId, fileName, user);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Compliance Evidence Uploaded',
        message: `Document "${fileName}" submitted for review.`,
      });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Upload Failed', message: e.message });
    }
  };

  const handleVerifyCompliance = async (
    complianceId: string,
    status: 'Verified' | 'Rejected',
    remarks: string
  ) => {
    try {
      await api.verifyCompliance(complianceId, status, remarks, user);
      await refreshData();
      addToast({
        type: status === 'Verified' ? 'success' : 'warning',
        title: `Compliance Undertaking ${status}`,
        message: remarks,
      });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Verification Action Failed', message: e.message });
    }
  };

  const handleSubmitDocumentRenewal = async (docId: string, renewalDocName: string) => {
    try {
      await api.submitDocumentRenewal(docId, renewalDocName, user);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Renewal Certificate Uploaded',
        message: `Submitted: ${renewalDocName}`,
      });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Upload Failed', message: e.message });
    }
  };

  const handleVerifyDocumentRenewal = async (docId: string) => {
    try {
      await api.verifyDocumentRenewal(docId, user);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Renewal Verified & Extended',
        message: 'Validity extended for 1 Academic Year.',
      });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Renewal Verification Failed', message: e.message });
    }
  };

  const handleMarkNotificationAsRead = async (id: string) => {
    await api.markNotificationAsRead(id);
    await refreshData();
  };

  const handleMarkAllNotificationsAsRead = async () => {
    await api.markAllNotificationsAsRead();
    await refreshData();
    addToast({ type: 'info', title: 'All Notifications Marked as Read' });
  };

  const handleResolveEscalation = async (id: string, notes: string) => {
    try {
      await api.resolveEscalation(id, notes, user);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Escalation Case Resolved',
        message: notes,
      });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Action Failed', message: e.message });
    }
  };

  const handleUpdateConfigRule = async (id: string, value: number | string) => {
    try {
      await api.updateConfigRule(id, value, user);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Configuration Published',
        message: `Rule updated to ${value}. Applied to workflow engine.`,
      });
    } catch (e: any) {
      addToast({ type: 'error', title: 'Update Failed', message: e.message });
    }
  };

  const handleResetDemoData = () => {
    api.resetToDefaults();
    refreshData();
    addToast({
      type: 'info',
      title: 'Refreshing demonstration view',
      message: 'Reloading permitted server data. Server records have not been reset.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        user,
        setRole,
        applications,
        evcInspections,
        complianceItems,
        expiringDocs,
        notifications,
        escalations,
        auditLog,
        configRules,
        loading,
        selectedAppId,
        setSelectedAppId,
        refreshData,
        createApplication: handleCreateApplication,
        transitionStage: handleTransitionStage,
        addObservation: handleAddObservation,
        verifyDocument: handleVerifyDocument,
        scheduleEVC: handleScheduleEVC,
        submitEVCReport: handleSubmitEVCReport,
        submitComplianceEvidence: handleSubmitComplianceEvidence,
        verifyCompliance: handleVerifyCompliance,
        submitDocumentRenewal: handleSubmitDocumentRenewal,
        verifyDocumentRenewal: handleVerifyDocumentRenewal,
        markNotificationAsRead: handleMarkNotificationAsRead,
        markAllNotificationsAsRead: handleMarkAllNotificationsAsRead,
        resolveEscalation: handleResolveEscalation,
        updateConfigRule: handleUpdateConfigRule,
        resetDemoData: handleResetDemoData,
        simulationTime,
        triggerAdvanceClock: handleAdvanceClock,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
