import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, WorkflowStage, DocumentItem } from '../../types';
import { SLABadge, StageBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { formatDateIndian } from '../../utils/slaCalculator';
import { getEligibleNextStages, validateWorkflowTransition } from '../../utils/workflowEngine';
import { api } from '../../services/api';
import {
  X,
  Building,
  CheckCircle2,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Clock,
  FileText,
  Calendar,
  ShieldCheck,
  History,
  FileCheck,
  Award,
  ArrowRight,
  MessageSquare,
  Send,
  Upload,
  AlertCircle,
  ExternalLink,
  Lock,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Cpu,
  FileSignature,
  Radio,
  Video,
  MapPin,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  applicationId: string;
  onClose: () => void;
  onOpenEVCModal?: (appId: string) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  applicationId,
  onClose,
  onOpenEVCModal,
}) => {
  const {
    role,
    user,
    applications,
    evcInspections,
    complianceItems,
    auditLog,
    transitionStage,
    addObservation,
    verifyDocument,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'documents'
    | 'timeline'
    | 'observations'
    | 'evc'
    | 'compliance'
  >('overview');

  // Transition form state
  const [selectedTargetStage, setSelectedTargetStage] = useState<WorkflowStage | ''>('');
  const [mandatoryReason, setMandatoryReason] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Revert Stage state (Domain A.3)
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [revertTargetKey, setRevertTargetKey] = useState<string>('submitted');
  const [revertReason, setRevertReason] = useState('');
  const [revertError, setRevertError] = useState<string | null>(null);
  const [isReverting, setIsReverting] = useState(false);

  const stageMapping: Record<string, { uiStage: WorkflowStage; canonical: string }> = {
    submitted: { uiStage: 'Application Submitted', canonical: 'submitted' },
    scrutiny_pending: { uiStage: 'Scrutiny in Progress', canonical: 'scrutiny_pending' },
    correction_required: { uiStage: 'Deficiency Communicated', canonical: 'correction_required' },
    rescrutiny_pending: { uiStage: 'Scrutiny Cleared', canonical: 'rescrutiny_pending' },
    evc_pending: { uiStage: 'EVC Scheduled', canonical: 'evc_pending' },
  };

  // Authorized Compliance Closure state (Domain F.4)
  const [closingCompliance, setClosingCompliance] = useState(false);
  const [complianceClosedData, setComplianceClosedData] = useState<any>(null);

  // New observation state
  const [newObsComment, setNewObsComment] = useState('');
  const [newObsType, setNewObsType] = useState<'Observation' | 'Deficiency' | 'Clarification Request' | 'Recommendation'>('Observation');
  const [newObsMandatory, setNewObsMandatory] = useState(false);
  const [showWhyRouteDrawer, setShowWhyRouteDrawer] = useState(false);

  // Document correction modal state (GOV.UK style rectification)
  const [correctingDoc, setCorrectingDoc] = useState<DocumentItem | null>(null);
  const [rectificationComment, setRectificationComment] = useState('');
  const [rectificationError, setRectificationError] = useState<string | null>(null);

  const application = applications.find((a) => a.id === applicationId);
  if (!application) return null;

  const evcRecord = evcInspections.find((e) => e.applicationId === application.id || e.id === application.evcId);
  const appCompliances = complianceItems.filter((c) => c.applicationId === application.id);
  const appAudits = auditLog.filter(
    (a) => a.applicationId === application.id || a.applicationNumber === application.applicationNumber
  );

  // Workflow eligible options
  const eligibleStages = getEligibleNextStages(application.currentStage, application.routeType);

  const handleExecuteTransition = async () => {
    if (!selectedTargetStage) return;
    const option = eligibleStages.find((o) => o.stage === selectedTargetStage);
    if (!option) return;

    const validation = validateWorkflowTransition(role, option, mandatoryReason);
    if (!validation.isValid) {
      setTransitionError(validation.errorMessage || 'Validation failed');
      return;
    }

    setTransitionError(null);
    setIsTransitioning(true);
    try {
      await transitionStage(application.id, selectedTargetStage, mandatoryReason);
      setSelectedTargetStage('');
      setMandatoryReason('');
    } catch (e: any) {
      setTransitionError(e.message);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleRevertStage = async () => {
    if (!revertReason.trim() || revertReason.trim().length < 5) {
      setRevertError('A substantive revert reason (minimum 5 characters) must be recorded per APH §1.8(f)-(g) & §2.23.1');
      return;
    }
    setRevertError(null);
    setIsReverting(true);
    try {
      const targetConfig = stageMapping[revertTargetKey] || stageMapping.submitted;
      await api.revertApplication(application.id, targetConfig.canonical, revertReason);
      addToast({
        type: 'success',
        title: 'Application Reverted',
        message: `Case successfully reverted to ${targetConfig.uiStage}. Audit trail recorded.`,
      });
      await transitionStage(application.id, targetConfig.uiStage, `Reverted: ${revertReason}`);
      setShowRevertModal(false);
      setRevertReason('');
    } catch (e: any) {
      setRevertError(e.message || 'Failed to revert stage');
    } finally {
      setIsReverting(false);
    }
  };

  const handleCloseComplianceCase = async () => {
    setClosingCompliance(true);
    try {
      const res = await api.closeCompliance(application.id);
      if (res && res.data) {
        setComplianceClosedData(res.data);
        addToast({
          type: 'success',
          title: 'Case Compliance Formally Closed',
          message: 'All obligations verified under APH §2.25(c)/(f). Closure certificate recorded.',
        });
      }
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Case Closure Blocked',
        message: e.message || 'Obligations remain unverified.',
      });
    } finally {
      setClosingCompliance(false);
    }
  };

  const handlePostObservation = async () => {
    if (!newObsComment.trim()) return;
    await addObservation(application.id, newObsType, newObsComment, newObsMandatory);
    setNewObsComment('');
  };

  const handleConfirmRectification = async () => {
    if (!correctingDoc) return;
    if (!rectificationComment.trim()) {
      setRectificationError('Enter an explanation of how the deficiency was rectified');
      return;
    }
    try {
      await verifyDocument(application.id, correctingDoc.id, 'Pending' as any, `Deficiency rectified: ${rectificationComment}`);
      addToast({
        type: 'success',
        title: 'Rectified Document Filed',
        message: `${correctingDoc.name} resubmitted for Re-Scrutiny under APH Sec 3.2`,
      });
      setCorrectingDoc(null);
      setRectificationComment('');
      setRectificationError(null);
    } catch (e: any) {
      setRectificationError(e.message || 'Rectification submission failed');
    }
  };

  const isInstitution = role === 'institution';

  const tabs = isInstitution
    ? [
        { id: 'overview', label: '📋 Application Status & Details' },
        { id: 'documents', label: `📁 Submitted Documents (${application.documents.length})` },
        { id: 'timeline', label: '⏱️ Approval Timeline' },
        { id: 'observations', label: `💬 Remarks & Notices (${application.observations.length})` },
      ]
    : [
        { id: 'overview', label: '📋 Status & Officer Actions' },
        { id: 'documents', label: `📁 Document Verification (${application.documents.length})` },
        { id: 'timeline', label: '⏱️ Workflow Timeline' },
        { id: 'observations', label: `💬 Observations (${application.observations.length})` },
        ...(application.currentStage === 'EVC Scheduled' || application.currentStage === 'EVC Inspection Completed' ? [{ id: 'evc', label: '📍 EVC Details' }] : []),
        ...(appCompliances.length > 0 ? [{ id: 'compliance', label: `🛡️ Obligations (${appCompliances.length})` }] : []),
      ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Top Header */}
        <div className="bg-[#0A2540] text-white p-5 flex items-start justify-between border-b border-slate-700/60">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                {application.applicationNumber}
              </span>
              <PriorityBadge priority={application.priority} />
              <span className="text-xs text-slate-300">
                Route: <strong className="text-white">{application.routeType}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {application.institutionName}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {application.city}, {application.state} &bull; Code: {application.institutionCode} &bull; Region: {application.region}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Stage & SLA Status Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Current Stage:</span>
              <StageBadge stage={application.currentStage} />
            </div>

            <div className="border-l border-slate-200 pl-3">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">SLA Health:</span>
              <SLABadge
                status={application.slaStatus}
                overdueDays={application.overdueDays}
                daysRemaining={Math.max(0, application.stageDeadlineDays - application.elapsedDaysAtStage)}
              />
            </div>

            <div className="border-l border-slate-200 pl-3 hidden sm:block">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Time at Stage:</span>
              <span className="font-bold text-slate-800">{application.elapsedDaysAtStage} Days (SLA: {application.stageDeadlineDays}d)</span>
            </div>

            <div className="border-l border-slate-200 pl-3 hidden md:block">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Responsible:</span>
              <span className="font-medium text-slate-800">{application.assignedOfficer}</span>
            </div>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex items-center gap-2">
            {(role === 'regional_officer' || role === 'bureau_officer' || role === 'admin') && (
              <button
                onClick={() => setShowRevertModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-colors shadow-2xs"
                title="Return / Revert application stage per APH §1.8(f)-(g) & §2.23.1"
              >
                <History className="w-3.5 h-3.5 text-amber-700" />
                <span>Return / Revert</span>
              </button>
            )}

            <a
              href={`/api/v1/cases/${application.id}/official-artifacts/scrutiny-giits-2026`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors shadow-2xs"
              title="Stream official 2026-27 AICTE Scrutiny Evaluation Report from vault"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Vault Scrutiny PDF</span>
            </a>
            <a
              href={`/api/v1/cases/${application.id}/export-proforma`}
              download={`AICTE_Proforma_${application.applicationNumber}.txt`}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shadow-2xs"
              title="Export formatted AICTE 2026-27 Scrutiny Proforma"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Proforma</span>
            </a>
            <button
              onClick={() => setShowWhyRouteDrawer(!showWhyRouteDrawer)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
              title="Inspect policy handbook rules and facts that routed this application"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Why this route?</span>
              {showWhyRouteDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {eligibleStages.length > 0 && (
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                Action Eligible ({eligibleStages.length})
              </span>
            )}
          </div>
        </div>

        {/* Why this Route? Explanatory Policy Drawer */}
        {showWhyRouteDrawer && (
          <div className="bg-gradient-to-r from-indigo-50/95 via-blue-50/95 to-slate-50 border-b border-indigo-200/80 p-4 sm:p-5 text-xs text-slate-800 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-indigo-950 text-sm">
                      Policy Rule Explanation &mdash; Route: {application.routeType}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                      AICTE APH 2026-27 &bull; Chapter II, Sec 3.4
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      Simulated Rule Evaluation
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs max-w-3xl leading-relaxed">
                    The workflow engine evaluated this application against statutory Approval Process Handbook (APH) rules to assign the optimal procedural route, preventing unnecessary inspection pendency.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWhyRouteDrawer(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label="Close rule panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-3 border-t border-indigo-200/60">
              <div className="bg-white/90 p-3 rounded-lg border border-indigo-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                  1. Statutory Trigger
                </span>
                <p className="font-semibold text-slate-900">{application.applicationType}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Existing institution requesting standard session continuation ({application.academicYear}). Qualifying for streamlined processing.
                </p>
              </div>

              <div className="bg-white/90 p-3 rounded-lg border border-indigo-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                  2. Evaluated Facts & Capacity
                </span>
                <p className="font-semibold text-slate-900">{application.program} &bull; {application.proposedIntake} Intake</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Intake within sanctioned institutional threshold (&lt;50% surge limit). Past deficiency clearance index: 100%.
                </p>
              </div>

              <div className="bg-white/90 p-3 rounded-lg border border-indigo-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                  3. Route Assignment Verdict
                </span>
                <p className="font-semibold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Fast-Track Scrutiny Only
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Physical EVC inspection waived under APH Clause 3.4(b) unless documentary deficiency is flagged during scrutiny.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-white px-5 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Application Type</span>
                  <span className="text-xs font-bold text-slate-900 mt-1 block">{application.applicationType}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Academic Year</span>
                  <span className="text-xs font-bold text-slate-900 mt-1 block">{application.academicYear}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Program & Intake</span>
                  <span className="text-xs font-bold text-slate-900 mt-1 block">{application.program} ({application.proposedIntake} seats)</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Submission Date</span>
                  <span className="text-xs font-bold text-slate-900 mt-1 block">{formatDateIndian(application.submittedAt)}</span>
                </div>
              </div>

              {/* Regulatory Action Execution Box */}
              {!isInstitution ? (
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck className="w-4 h-4 text-blue-700" />
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                      Workflow Action Console (Current Role: {user.roleTitle})
                    </h4>
                  </div>

                  {eligibleStages.length === 0 ? (
                    <p className="text-xs text-slate-600">
                      No further automated transitions available from stage &ldquo;{application.currentStage}&rdquo;.
                    </p>
                  ) : (
                    <div className="space-y-3 mt-3">
                      <p className="text-xs text-slate-700">
                        Select next eligible stage transition. Notice: The backend validates regulatory authority; actions require mandatory justification reasons where applicable.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {eligibleStages.map((opt) => (
                          <label
                            key={opt.stage}
                            className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedTargetStage === opt.stage
                                ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="targetStage"
                              value={opt.stage}
                              checked={selectedTargetStage === opt.stage}
                              onChange={() => {
                                setSelectedTargetStage(opt.stage);
                                setTransitionError(null);
                              }}
                              className="mt-1"
                            />
                            <div>
                              <span className="font-bold text-xs block">{opt.actionLabel}</span>
                              <span className={`text-[11px] block mt-0.5 ${selectedTargetStage === opt.stage ? 'text-blue-100' : 'text-slate-500'}`}>
                                {opt.description}
                              </span>
                              {opt.requiresMandatoryReason && (
                                <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.2 rounded ${selectedTargetStage === opt.stage ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'}`}>
                                  Mandatory Reason Required
                                </span>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>

                      {selectedTargetStage && (
                        <div className="space-y-2 mt-2 bg-white p-3 rounded-lg border border-slate-200">
                          <label className="text-xs font-bold text-slate-700 block">
                            Official Regulatory Remarks / Mandatory Reason:
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Provide detailed justification, official remarks, or specific deficiencies observed..."
                            value={mandatoryReason}
                            onChange={(e) => setMandatoryReason(e.target.value)}
                            className="w-full p-2.5 rounded-md border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                          {transitionError && (
                            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {transitionError}
                            </p>
                          )}
                          <button
                            onClick={handleExecuteTransition}
                            disabled={isTransitioning}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isTransitioning ? 'Validating...' : 'Confirm & Execute Stage Transition'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Reassuring Stage Guidance for Institution Applicant */
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200/90 rounded-xl p-4.5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
                          Current Processing Status
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-200/70 text-blue-800 font-bold">
                          {application.currentStage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {application.currentStage === 'Application Submitted'
                          ? 'Your application payload has been ingested via the NSWS & AICTE Siebel hand-off and queued for formal scrutiny review.'
                          : application.currentStage === 'Scrutiny in Progress'
                          ? 'Your application is currently under review by the Desk Scrutiny Committee Cell. Document checklists and statutory norms are being evaluated.'
                          : application.currentStage === 'Deficiency Communicated'
                          ? '⚠️ Action Required: The Scrutiny Committee has communicated specific deficiencies. Please navigate to the "Submitted Documents" tab to view notes and upload rectified evidence.'
                          : application.currentStage === 'Scrutiny Cleared'
                          ? 'Initial scrutiny evaluation has been completed compliant with norms. The case is proceeding along its designated handbook pathway.'
                          : application.currentStage === 'EVC Scheduled'
                          ? 'An Expert Visit Committee has been constituted to conduct campus physical verification. Please ensure physical labs and facilities are ready.'
                          : application.currentStage === 'Executive Committee Approval'
                          ? 'All scrutiny and committee reports are compiled. Final decision is under review by the Council Approval Bureau.'
                          : application.currentStage === 'Approval Issued'
                          ? '✅ Extension of Approval (EoA) Granted! Your official stamped order is available in the Remarks & Notices tab.'
                          : 'Your application is in active regulatory processing.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-blue-200/60 text-xs">
                    <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Assigned Regional Office:</span>
                      <span className="font-semibold text-slate-800">{application.region} Regional Office</span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Campus Location:</span>
                      <span className="font-semibold text-slate-800">{application.city}, {application.state}</span>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">AICTE Permanent Institute ID:</span>
                      <span className="font-mono font-semibold text-blue-700">{application.institutionCode}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Latest Observations Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Active Observations & Remarks ({application.observations.length})
                </h4>
                {application.observations.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                    No deficiencies or remarks recorded yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {application.observations.map((obs) => (
                      <div key={obs.id} className="p-3 rounded-xl border border-slate-200 bg-white text-xs">
                        <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                          <span className="font-semibold text-slate-800">{obs.authorName} ({obs.authorRole})</span>
                          <span>{formatDateIndian(obs.timestamp)}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed">{obs.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Prescribed Documents & Regulatory Evidence
                  </h4>
                  <p className="text-xs text-slate-500">
                    Mandatory filings per AICTE Approval Process Handbook (APH)
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs">
                <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-800">
                    Correction Scope Enforcement (Statutory Freeze Policy):
                  </p>
                  <p>
                    Documents verified during initial scrutiny are locked against subsequent alteration (APH Sec 3.2). Resubmission is permitted strictly for flagged deficiencies within the designated rectification window.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{doc.name}</p>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                              doc.status === 'Verified'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : doc.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {doc.fileName} &bull; {doc.fileSize} &bull; Category: {doc.category}
                        </p>
                        {doc.rejectionReason && (
                          <p className="text-rose-600 font-medium text-[11px] mt-1 bg-rose-50 p-1.5 rounded">
                            Deficiency Note: {doc.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doc.status === 'Verified' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Locked (Scrutiny Cleared)</span>
                        </span>
                      ) : (role === 'regional_officer' || role === 'bureau_officer' || role === 'admin') ? (
                        <>
                          <button
                            onClick={() => verifyDocument(application.id, doc.id, 'Verified')}
                            className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs transition-colors"
                          >
                            Verify Document
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Specify deficiency reason for rejection:');
                              if (reason) verifyDocument(application.id, doc.id, 'Rejected', reason);
                            }}
                            className="px-2.5 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs border border-rose-200 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : role === 'institution' ? (
                        <button
                          onClick={() => {
                            setCorrectingDoc(doc);
                            setRectificationComment('');
                            setRectificationError(null);
                          }}
                          className="px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Rectify & Upload</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Correction Open</span>
                        </span>
                      )}
                      <button
                        onClick={() => alert(`Previewing signed file "${doc.fileName}". Secure short-lived document token active.`)}
                        className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WORKFLOW TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Workflow Audit Timeline & Stage Progress
              </h4>
              <div className="relative border-l-2 border-slate-200 ml-4 pl-4 space-y-6">
                {application.timeline.map((event) => (
                  <div key={event.id} className="relative text-xs">
                    <div
                      className={`absolute -left-[23px] top-0 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                        event.status === 'completed'
                          ? 'border-emerald-500 bg-emerald-500'
                          : event.status === 'active'
                          ? 'border-blue-500 bg-blue-500 animate-pulse'
                          : event.status === 'overdue'
                          ? 'border-rose-500 bg-rose-500'
                          : 'border-slate-300'
                      }`}
                    />
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-bold text-slate-800">{event.stage}</span>
                        <span>{formatDateIndian(event.timestamp)}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{event.action}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        By {event.actorName} ({event.actorRole})
                      </p>
                      {event.notes && (
                        <p className="text-[11px] text-blue-900 bg-blue-50 p-2 rounded mt-1.5 border border-blue-100">
                          {event.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OBSERVATIONS & STATUTORY NOTICES */}
          {activeTab === 'observations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Official Observations &amp; Statutory Communications
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Official communications recorded under AICTE Approval Process Handbook
                  </p>
                </div>
              </div>

              {/* If Approved, show Official EoA Order Card */}
              {(application.currentStage === 'Approval Issued' || application.currentStage === 'Executive Committee Approval') && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-emerald-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <h5 className="font-bold text-sm text-white">
                        Extension of Approval (EoA) Granted for AY 2026–27
                      </h5>
                    </div>
                    <span className="font-mono text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded">
                      Order No: AICTE/AB/2026-27/{application.institutionCode}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    The Council has accorded statutory approval under Section 10/11 of AICTE Act, 1987 and APH 2024–27 norms.
                    Approved Intake: <strong>{application.proposedIntake} seats</strong> in <strong>{application.program}</strong>.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Official EoA Order (PDF)</span>
                    </button>
                    <span className="text-[11px] text-emerald-300">
                      Digitally signed with Class-3 eMudhra DSC by Member Secretary, AICTE.
                    </span>
                  </div>
                </div>
              )}

              {/* Officer Note Recording Form (Officers only) */}
              {!isInstitution && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h5 className="font-bold text-xs text-slate-800">Record Regulatory Note / Remark</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <select
                      value={newObsType}
                      onChange={(e) => setNewObsType(e.target.value as any)}
                      className="p-2 rounded border border-slate-300 bg-white"
                    >
                      <option value="Observation">General Observation</option>
                      <option value="Deficiency">Deficiency Note</option>
                      <option value="Clarification Request">Clarification Request</option>
                      <option value="Recommendation">Recommendation</option>
                    </select>
                    <label className="flex items-center gap-2 text-slate-700">
                      <input
                        type="checkbox"
                        checked={newObsMandatory}
                        onChange={(e) => setNewObsMandatory(e.target.checked)}
                      />
                      <span>Requires Mandatory Institution Response</span>
                    </label>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Enter observation or deficiency details..."
                    value={newObsComment}
                    onChange={(e) => setNewObsComment(e.target.value)}
                    className="w-full p-2.5 rounded border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={handlePostObservation}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-2xs"
                  >
                    Append Official Note
                  </button>
                </div>
              )}

              {application.observations.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">No Deficiencies or Remarks Issued</p>
                  <p className="mt-1">All scrutiny checks are clear or pending initial evaluation.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {application.observations.map((obs) => (
                    <div key={obs.id} className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                        <span className="font-bold text-slate-900">
                          {obs.type} &bull; {obs.authorName} ({obs.authorRole})
                        </span>
                        <span>{formatDateIndian(obs.timestamp)}</span>
                      </div>
                      <p className="text-slate-800 mt-1 leading-relaxed">{obs.comment}</p>
                      {obs.mandatoryResolutionRequired && (
                        <span className="inline-block mt-2 text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                          Mandatory Rectification
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: EVC DETAILS (Domain C.2 Hardened) */}
          {activeTab === 'evc' && (
            <div className="space-y-4 text-xs">
              {/* Institution Type & SLA Classification Badge */}
              <div className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Video className="w-5 h-5 text-cyan-700" />
                  <div>
                    <span className="font-bold text-cyan-950 block">
                      {application.applicationType.includes('New')
                        ? 'Chapter I: New Technical Institution — Priority LoA Queue'
                        : 'Chapter II: Existing Technical Institution — Standard EoA Queue'}
                    </span>
                    <span className="text-[11px] text-cyan-800">
                      Mandated EVC Turnaround SLA:{' '}
                      <strong>{application.applicationType.includes('New') ? '7 Calendar Days' : '14 Calendar Days'}</strong>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-cyan-100 text-cyan-900 border border-cyan-300">
                  APH 2026-27 Table 2.3
                </span>
              </div>

              {evcRecord ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Expert Visit Committee (EVC) Dossier</h4>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-300 font-mono">
                      {evcRecord.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 font-semibold block text-[11px]">Scheduled Visit Date:</span>
                      <span className="text-slate-900 font-bold">{evcRecord.scheduledDate} ({evcRecord.scheduledTime})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[11px]">Inspection Chairman:</span>
                      <span className="text-slate-900 font-bold">{evcRecord.committeeChairman}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Committee Members:</span>
                    <ul className="list-disc list-inside text-slate-700 mt-1">
                      {evcRecord.committeeMembers.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  {/* 30-min Geo-Tagged Video & GPS Verification Card */}
                  <div className="p-3.5 rounded-xl border border-blue-200 bg-white space-y-2 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-rose-600" />
                        30-Minute Geo-Tagged Video &amp; GPS Verification (AICTE Act §11(2) &amp; APH §1.9 / §2.23.2)
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        GPS Verified
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                      <div>
                        <span>Campus Coordinates: </span>
                        <strong className="font-mono text-slate-900">17° 42' 7" N, 83° 6' 47" E (17.702834° N, 83.113288° E)</strong>
                      </div>
                      <div>
                        <span>Video Walkthrough: </span>
                        <a
                          href="https://storage.aicte-india.org/evc/2026/walkthrough-2-SOC1774344316.mp4"
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-blue-700 underline flex items-center gap-1 inline-flex"
                        >
                          <span>Open 30-min MP4 Stream</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {evcRecord.reportSubmitted && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">EVC Recommendation:</span>
                        <span className="font-bold text-emerald-700">{evcRecord.recommendation}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">Infra Score</span>
                          <span className="font-bold text-blue-700">{evcRecord.infrastructureScore}%</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">Faculty Score</span>
                          <span className="font-bold text-blue-700">{evcRecord.facultyScore}%</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">Lab Score</span>
                          <span className="font-bold text-blue-700">{evcRecord.laboratoriesScore}%</span>
                        </div>
                      </div>
                      <p className="text-slate-700 text-xs mt-2 italic bg-slate-50 p-2 rounded">
                        &ldquo;{evcRecord.reportSummary}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800">No EVC Assigned</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    This route ({application.routeType}) does not currently have a scheduled inspection.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: COMPLIANCE & AUTHORIZED CLOSURE (Domain F.4) */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Institutional Undertakings & Mandatory Compliances
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Monitored under AICTE Approval Process Handbook (APH §2.25(c)/(f) &amp; Table 2.3)
                  </p>
                </div>

                {(role === 'regional_officer' || role === 'bureau_officer' || role === 'admin') && (
                  <button
                    onClick={handleCloseComplianceCase}
                    disabled={closingCompliance}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{closingCompliance ? 'Verifying...' : 'Authorize Case & Obligation Closure'}</span>
                  </button>
                )}
              </div>

              {complianceClosedData && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-1 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Statutory Compliance Formally Discharged &amp; Case Closed</span>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    Closed By: <strong>{complianceClosedData.closedBy}</strong> at {formatDateIndian(complianceClosedData.closedAt)}.
                    All {complianceClosedData.obligationsClosedCount || 0} obligations marked completed. WORM audit digest recorded.
                  </p>
                </div>
              )}

              {appCompliances.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                  No pending compliance undertakings recorded for this application.
                </p>
              ) : (
                <div className="space-y-2">
                  {appCompliances.map((item) => (
                    <div key={item.id} className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{item.conditionTitle}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-slate-600">{item.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span>Due Date: <strong>{item.dueDate}</strong> ({item.daysRemaining}d remaining)</span>
                        {item.evidenceDocumentName && (
                          <span className="text-blue-600 font-medium">Evidence: {item.evidenceDocumentName}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            SIH 2026 Prototype Console (PS 26262) &bull; Case Record ID: {application.id}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>

      {/* Authorized Revert Stage Modal (Domain A.3) */}
      {showRevertModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#B91C1C] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-200" />
                <h3 className="font-bold text-sm">Authorized Case Return / Revert (APH §1.8(f)-(g) &amp; §2.23.1)</h3>
              </div>
              <button
                onClick={() => setShowRevertModal(false)}
                className="text-slate-200 hover:text-white p-1"
                aria-label="Close revert modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-800">
              <p className="text-slate-600">
                You are executing an authorized stage return/revert. Under AICTE APH regulations, a formal substantive reason must be duly recorded in the immutable WORM audit trail.
              </p>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Target Return Stage <span className="text-rose-600">*</span>
                </label>
                <select
                  value={revertTargetKey}
                  onChange={(e) => setRevertTargetKey(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="submitted">Initial Submission / Intake</option>
                  <option value="scrutiny_pending">Scrutiny Stage (Desk Verification)</option>
                  <option value="correction_required">Correction Window (Deficiency Rectification)</option>
                  <option value="rescrutiny_pending">Re-Scrutiny Stage</option>
                  <option value="evc_pending">Expert Visit Committee (EVC Queue)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Substantive Regulatory Reason for Revert <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={revertReason}
                  onChange={(e) => {
                    setRevertReason(e.target.value);
                    setRevertError(null);
                  }}
                  placeholder="Specify statutory ground (e.g., deficiency identified in Fire NOC, need for structural re-verification under APH §1.8(f)-(g) & §2.23.1)..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                {revertError && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1">
                    {revertError}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowRevertModal(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleRevertStage}
                disabled={isReverting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isReverting ? 'Reverting...' : 'Confirm & Execute Stage Revert'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GOV.UK Styled Document Rectification Dialog */}
      {correctingDoc && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-[#183B56] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Rectify Prescribed Document Deficiency</h3>
              </div>
              <button
                onClick={() => setCorrectingDoc(null)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Document Name:</span>
                <p className="font-bold text-sm text-slate-900 mt-0.5">{correctingDoc.name}</p>
                <p className="text-[11px] text-slate-500">Category: {correctingDoc.category} &bull; Current Status: {correctingDoc.status}</p>
              </div>

              {correctingDoc.rejectionReason && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                  <span className="font-bold block text-[11px] text-rose-700">Official Scrutiny Deficiency Note:</span>
                  <p className="mt-0.5 leading-relaxed">{correctingDoc.rejectionReason}</p>
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  !
                </div>
                <div className="text-[11px] text-amber-950 leading-relaxed">
                  <strong>Statutory Declaration:</strong> Filing rectified proof initiates secondary re-scrutiny under APH Chapter II. Upload only authenticated, stamped scans.
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Upload Requirements:</p>
                <p>&bull; Format: PDF only (clean high-resolution scan)</p>
                <p>&bull; Maximum file size: 10MB</p>
                <p>&bull; File pre-validated: <span className="font-mono text-blue-700">{correctingDoc.fileName.replace('.pdf', '_rectified_v2.pdf')}</span></p>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Explanation of Rectification Action <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rectificationComment}
                  onChange={(e) => {
                    setRectificationComment(e.target.value);
                    setRectificationError(null);
                  }}
                  placeholder="Detail the corrections made, authority approvals obtained, or updated validity dates..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {rectificationError && (
                  <p className="text-[#d4351c] text-[11px] font-semibold mt-1">
                    {rectificationError}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setCorrectingDoc(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRectification}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Submit Rectification for Re-Scrutiny</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
