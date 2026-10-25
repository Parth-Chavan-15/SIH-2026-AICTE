import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, WorkflowStage, DocumentItem } from '../../types';
import { SLABadge, StageBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { formatDateIndian } from '../../utils/slaCalculator';
import { getEligibleNextStages, validateWorkflowTransition } from '../../utils/workflowEngine';
import { api } from '../../services/api';
import { getSession } from '../../services/session';
import { CaseSummaryNoticesModal } from './CaseSummaryNoticesModal';
import {
  X,
  Building,
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Calendar,
  ShieldCheck,
  History,
  FileCheck,
  Award,
  ArrowRight,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Video,
  MapPin,
  XCircle,
  Upload,
  Check,
  Ban,
  Radio,
  FileSignature
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

  // Clean 4-tab dossier navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'evc' | 'compliance'>('overview');

  // Quick Action in-progress state
  const [isActioning, setIsActioning] = useState(false);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  // Advanced Transition form state
  const [selectedTargetStage, setSelectedTargetStage] = useState<WorkflowStage | ''>('');
  const [mandatoryReason, setMandatoryReason] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Revert Stage state (Domain A.3)
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [revertTargetKey, setRevertTargetKey] = useState<string>('submitted');
  const [revertReason, setRevertReason] = useState('');
  const [showCaseSummaryModal, setShowCaseSummaryModal] = useState(false);
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

  const session = getSession();
  const activeActor = session?.actor;
  const roleNumber: number =
    (activeActor?.id === 'usr-inst-coep' || activeActor?.id === 'usr-inst-giits' || activeActor?.id === 'usr-inst-pdimtr' || activeActor?.id === 'usr-inst-apex' || activeActor?.id === 'usr-inst-batu' || activeActor?.roles?.includes('institution')) ? 1 :
    (activeActor?.id === 'usr-scrutiny-reviewer' || (activeActor?.roles?.includes('reviewer') && !activeActor?.roles?.includes('regional_officer'))) ? 2 :
    (activeActor?.id === 'usr-evc-chair' || activeActor?.roles?.includes('evc')) ? 3 :
    (activeActor?.id === 'usr-ro-western' || activeActor?.roles?.includes('regional_officer')) ? 4 :
    (activeActor?.id === 'usr-bureau-hq' || activeActor?.roles?.includes('demo_authority') || activeActor?.roles?.includes('bureau_officer')) ? 5 :
    6;

  const isInstitution = roleNumber === 1;
  const canAct = roleNumber >= 2; // Any reviewer, committee member, RO, Bureau officer, or admin can act
  const canRevert = roleNumber >= 4;

  const isPendingScrutiny = application.currentStage === 'Application Submitted' || application.currentStage === 'Draft';
  const isGIITS = application.id.includes('GIITS') || application.institutionCode === 'INST-NORTH' || application.routeType === 'Scrutiny + EVC';
  const isCOEP = application.id.includes('COEP') || application.institutionCode === 'INST-SOUTH' || application.routeType === 'Scrutiny Only';
  const isPDIMTR = application.id.includes('PDIMTR') || application.institutionCode === 'INST-WEST' || application.routeType === 'Fast-Track EoA';
  const isAPEX = application.id.includes('APEX') || application.id.includes('Apex') || application.institutionCode === 'INST-APEX' || application.routeType === 'Scrutiny + EVC + SAC/SHC';
  const isBATU = application.id.includes('BATU') || application.institutionCode === 'INST-BATU' || application.routeType === 'Only EVC';

  // Determine intelligent next primary action based on current stage & statutory route
  const getNextActionConfig = () => {
    if (application.currentStage === 'Application Submitted' || application.currentStage === 'Draft') {
      return { target: 'Scrutiny in Progress' as WorkflowStage, label: 'Start Desk Scrutiny', variant: 'green' };
    }
    if (application.currentStage === 'Scrutiny in Progress') {
      const nextStage: WorkflowStage = (application.routeType.includes('EVC') || isGIITS || isBATU) ? 'EVC Scheduled' : 'Executive Committee Approval';
      return { target: nextStage, label: 'Accept & Clear Scrutiny', variant: 'green' };
    }
    if (application.currentStage === 'Deficiency Communicated') {
      return { target: 'Scrutiny in Progress' as WorkflowStage, label: 'Accept Rectification & Re-Scrutinize', variant: 'blue' };
    }
    if (application.currentStage === 'Scrutiny Cleared') {
      const nextStage: WorkflowStage = (application.routeType.includes('EVC') || isGIITS || isBATU) ? 'EVC Scheduled' : 'Executive Committee Approval';
      return { target: nextStage, label: 'Advance to Next Stage', variant: 'green' };
    }
    if (application.currentStage === 'EVC Scheduled') {
      return { target: 'EVC Inspection Completed' as WorkflowStage, label: 'Mark EVC Completed', variant: 'green' };
    }
    if (application.currentStage === 'EVC Inspection Completed') {
      const nextStage: WorkflowStage = (application.routeType.includes('SAC') || isAPEX) ? 'SAC / SHC Review' : 'Executive Committee Approval';
      return { target: nextStage, label: 'Advance to Committee Review', variant: 'green' };
    }
    if (application.currentStage === 'SAC / SHC Review') {
      return { target: 'Executive Committee Approval' as WorkflowStage, label: 'Advance to Approval Gate', variant: 'green' };
    }
    if (application.currentStage === 'Executive Committee Approval') {
      return { target: 'Approval Issued' as WorkflowStage, label: 'Grant Approval / Issue EoA', variant: 'emerald' };
    }
    return null;
  };

  const nextAction = getNextActionConfig();

  // One-Click Accept & Advance Stage
  const handleQuickAccept = async () => {
    if (!nextAction) return;
    setIsActioning(true);
    try {
      await transitionStage(application.id, nextAction.target, `Accepted & advanced to ${nextAction.target} per APH 2026-27 norms by ${user?.name || 'Authorized Officer'}`);
      addToast({
        type: 'success',
        title: 'Application Stage Advanced',
        message: `Case moved to ${nextAction.target}. Audit trail recorded.`,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message || 'Workflow transition failed' });
    } finally {
      setIsActioning(false);
    }
  };

  // One-Click Flag Deficiencies
  const handleQuickFlagDeficiency = async () => {
    setIsActioning(true);
    try {
      await transitionStage(
        application.id,
        'Deficiency Communicated',
        `Deficiencies communicated per APH Chapter I / II verification checklist by ${user?.name || 'Reviewer'}`
      );
      addToast({
        type: 'warning',
        title: 'Deficiencies Communicated',
        message: 'Applicant notified. Case transitioned to Deficiency Rectification Window.',
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message || 'Deficiency transition failed' });
    } finally {
      setIsActioning(false);
    }
  };

  // One-Click Reject Application
  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Specify substantive grounds for rejection under AICTE APH regulations.');
      return;
    }
    setIsActioning(true);
    try {
      await transitionStage(application.id, 'Application Rejected', rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      addToast({
        type: 'error',
        title: 'Application Formally Rejected',
        message: 'Rejection order stamped and recorded in the immutable audit log.',
      });
    } catch (err: any) {
      setRejectError(err.message || 'Failed to reject application');
    } finally {
      setIsActioning(false);
    }
  };

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
      await transitionStage(application.id, selectedTargetStage, mandatoryReason || `Updated to ${selectedTargetStage}`);
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

  const handleVerifySingleDoc = async (docId: string, status: 'Verified' | 'Rejected') => {
    try {
      await verifyDocument(
        application.id,
        docId,
        status,
        status === 'Verified' ? 'Document verified compliant with APH norms.' : 'Deficiency flagged by reviewing officer.'
      );
    } catch (err: any) {
      addToast({ type: 'error', title: 'Verification Failed', message: err.message });
    }
  };

  const handleConfirmRectification = async () => {
    if (!correctingDoc) return;
    if (!rectificationComment.trim()) {
      setRectificationError('Enter an explanation of how the deficiency was rectified');
      return;
    }
    try {
      await verifyDocument(application.id, correctingDoc.id, 'Pending Verification', `Deficiency rectified: ${rectificationComment}`);
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
              
              {/* Prominently Highlighted Statutory Route Pill */}
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-teal-500/25 text-teal-200 border border-teal-400/50 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span className="text-[10px] font-mono text-teal-300 uppercase tracking-wider">ROUTE:</span>
                <span className="text-white uppercase tracking-tight">{application.routeType}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-teal-200 border border-teal-400/30">
                  {isCOEP ? '⚡ NBA FAST-TRACK (EVC WAIVED)' : isGIITS ? '🔍 SCRUTINY + EVC' : isPDIMTR ? '📜 SELF-DISCLOSURE' : isAPEX ? '⚖️ EVC + SAC/SHC' : isBATU ? '🚁 ONLY EVC (§2.16.1)' : 'RULE-PINNED'}
                </span>
              </div>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {application.institutionName}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {application.city}, {application.state} &bull; Code: <span className="font-mono text-blue-200">{application.institutionCode}</span> &bull; Region: {application.region} &bull; Program: {application.program}
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

        {/* Executive Action Strip (Prominent 1-Click Action Buttons) */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Current Stage:</span>
              <StageBadge stage={application.currentStage} />
            </div>

            <div className="border-l border-slate-300 pl-3">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">SLA Health:</span>
              <SLABadge
                status={application.slaStatus}
                overdueDays={application.overdueDays}
                daysRemaining={Math.max(0, application.stageDeadlineDays - application.elapsedDaysAtStage)}
              />
            </div>

            <div className="border-l border-slate-300 pl-3 hidden sm:block">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Time at Stage:</span>
              <span className="font-bold text-slate-800">{application.elapsedDaysAtStage} Days (SLA: {application.stageDeadlineDays}d)</span>
            </div>

            <div className="border-l border-slate-300 pl-3 hidden md:block">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Assigned Officer:</span>
              <span className="font-medium text-slate-800">{application.assignedOfficer}</span>
            </div>
          </div>

          {/* Direct 1-Click Action Buttons for Officers & Reviewers */}
          <div className="flex flex-wrap items-center gap-2">
            {canAct && application.currentStage !== 'Approval Issued' && application.currentStage !== 'Application Rejected' && (
              <>
                {/* Primary Accept / Advance Button */}
                {nextAction && (
                  <button
                    onClick={handleQuickAccept}
                    disabled={isActioning}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
                    title={`Advance application to ${nextAction.target}`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>{isActioning ? 'Processing...' : nextAction.label}</span>
                  </button>
                )}

                {/* Flag Deficiencies Button */}
                {application.currentStage !== 'Deficiency Communicated' && (
                  <button
                    onClick={handleQuickFlagDeficiency}
                    disabled={isActioning}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition-colors disabled:opacity-50"
                    title="Flag deficiencies and open correction window"
                  >
                    <AlertTriangle className="w-4 h-4 text-slate-950" />
                    <span>Flag Deficiencies</span>
                  </button>
                )}

                {/* Reject Application Button */}
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isActioning}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50"
                  title="Formally reject application per APH non-compliance"
                >
                  <XCircle className="w-4 h-4 text-rose-200" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {/* Return / Revert Button */}
            {canRevert && (
              <button
                onClick={() => setShowRevertModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-2xs"
                title="Return / Revert application stage per APH §1.8(f)-(g)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                <span>Revert Stage</span>
              </button>
            )}

            {/* Case Summary & 5 Notices Modal Trigger */}
            <button
              onClick={() => setShowCaseSummaryModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
              title="View Electronic Case Summary & 5 Statutory Notices"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Summary & 5 Notices</span>
            </button>

            {/* Route policy drawer toggle */}
            <button
              onClick={() => setShowWhyRouteDrawer(!showWhyRouteDrawer)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 transition-colors"
              title="Inspect policy handbook rules"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Route Rules</span>
              {showWhyRouteDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Why this Route? Explanatory Policy Drawer */}
        {showWhyRouteDrawer && (
          <div className="bg-gradient-to-r from-indigo-50/95 via-blue-50/95 to-slate-50 border-b border-indigo-200/80 p-4 text-xs text-slate-800 animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-indigo-950 text-sm">
                    Policy Rule Engine &mdash; Selected Route: {application.routeType}
                  </h4>
                  <p className="text-slate-600">
                    Governed by APH 2026–27 Table 1 Policy Matrix and Errata G02 p. 42. Evaluates institution accreditation, intake surge, land title validity, and inspection criteria.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWhyRouteDrawer(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 5-Route Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-3 text-[11px]">
              <div className={`p-2.5 rounded-xl border ${isPDIMTR ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950 ring-1 ring-emerald-400' : 'bg-white/80 border-slate-200 text-slate-500'}`}>
                <div className="flex items-center justify-between">
                  <span>1: Fast-Track EoA</span>
                  <span>{isPDIMTR ? '✅ ACTIVE' : '—'}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-normal">Self-disclosure renewal without intake surge</p>
              </div>
              <div className={`p-2.5 rounded-xl border ${isCOEP ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950 ring-1 ring-emerald-400' : 'bg-white/80 border-slate-200 text-slate-500'}`}>
                <div className="flex items-center justify-between">
                  <span>2: Scrutiny Only</span>
                  <span>{isCOEP ? '✅ ACTIVE (NBA)' : '—'}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-normal">NBA Tier-1 Valid: EVC waived per Errata p. 42</p>
              </div>
              <div className={`p-2.5 rounded-xl border ${isGIITS ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950 ring-1 ring-emerald-400' : 'bg-white/80 border-slate-200 text-slate-500'}`}>
                <div className="flex items-center justify-between">
                  <span>3: Scrutiny + EVC</span>
                  <span>{isGIITS ? '✅ ACTIVE' : '—'}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-normal">Non-NBA Intake Surge: EVC Mandatory §1.9</p>
              </div>
              <div className={`p-2.5 rounded-xl border ${isAPEX ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950 ring-1 ring-emerald-400' : 'bg-white/80 border-slate-200 text-slate-500'}`}>
                <div className="flex items-center justify-between">
                  <span>4: EVC + SAC/SHC</span>
                  <span>{isAPEX ? '✅ ACTIVE' : '—'}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-normal">Appellate hearing queue for aggrieved cases</p>
              </div>
              <div className={`p-2.5 rounded-xl border ${isBATU ? 'bg-emerald-50 border-emerald-400 font-bold text-emerald-950 ring-1 ring-emerald-400' : 'bg-white/80 border-slate-200 text-slate-500'}`}>
                <div className="flex items-center justify-between">
                  <span>5: Only EVC</span>
                  <span>{isBATU ? '✅ ACTIVE' : '—'}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 font-normal">Restoration / Site Shift waives scrutiny (§2.16.1)</p>
              </div>
            </div>
          </div>
        )}

        {/* Clean 4-Tab Navigation */}
        <div className="border-b border-slate-200 bg-white px-5 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span>📋 Overview &amp; Route Engine</span>
          </button>
          
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span>📁 Submitted Documents &amp; Checklists</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] font-mono text-slate-700">
              {application.documents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('evc')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'evc'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span>🚁 Physical Inspection &amp; Video Audit</span>
            {evcRecord && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'compliance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <span>🛡️ Obligations &amp; Audit Trail</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] font-mono text-slate-700">
              {appCompliances.length}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">

          {/* TAB 1: OVERVIEW & ROUTE ENGINE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Institution Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Application Type</span>
                  <p className="font-bold text-xs text-slate-900 mt-0.5">{application.applicationType}</p>
                  <p className="text-[11px] text-slate-500">{application.program}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Intake Surge</span>
                  <p className="font-bold text-xs text-slate-900 mt-0.5">
                    {application.proposedIntake} seats
                    <span className="text-slate-500 font-normal ml-1">(from {(application as any).currentIntake || (application.proposedIntake - 60)})</span>
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    +{application.proposedIntake - ((application as any).currentIntake || (application.proposedIntake - 60))} Seats Proposed
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Submission Date</span>
                  <p className="font-bold text-xs text-slate-900 mt-0.5">{formatDateIndian(application.submittedAt)}</p>
                  <p className="text-[11px] text-slate-500">Ingested via NSWS</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Officer</span>
                  <p className="font-bold text-xs text-slate-900 mt-0.5">{application.assignedOfficer}</p>
                  <p className="text-[11px] text-blue-600 font-medium">RO {application.region}</p>
                </div>
              </div>

              {/* Statutory Route Engine & Handbook Rule Breakdown */}
              <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 p-4.5 rounded-xl border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-700" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      Statutory 5-Route Engine Verdict (APH Table 1 / Errata G02)
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300">
                    Rule Engine v2026.1
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Accreditation Status</span>
                    <p className="font-bold text-slate-900">
                      {isCOEP ? 'NBA Tier-1 Accredited (Valid till 2028)' : isGIITS ? 'Non-NBA Accredited (CSE Surge)' : 'Standard Self-Disclosure'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {isCOEP ? 'Permits physical EVC waiver under Errata G02 p. 42.' : isGIITS ? 'Absence of NBA accreditation triggers mandatory physical EVC.' : 'Standard institutional renewal.'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Physical Verification</span>
                    <p className="font-bold text-slate-900">
                      {isCOEP ? 'EVC Waived (Fast-Track)' : (isGIITS || isBATU) ? 'Mandatory Physical EVC Required' : 'Post-Approval Audit'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {isCOEP ? 'Direct desk scrutiny clearance permitted.' : 'Mandatory 30-min geo-tagged video walkthrough & GPS audit.'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Official Artifact</span>
                    <p className="font-bold text-blue-700">
                      <a
                        href={`/api/v1/cases/${application.id}/intake-evaluation-table`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>Intake Capacity Table</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Live statutory table reflecting 2026-27 AICTE capacity norms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stage Lifecycle Progress Stepper (Executive Interactive Pipeline) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Workflow Lifecycle Stage Tracking &bull; AY 2026–27
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-medium">Current Milestone:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      {application.currentStage}
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {application.elapsedDaysAtStage}d elapsed (SLA: {application.stageDeadlineDays}d)
                    </span>
                  </div>
                </div>
                
                {/* 5-Step Connected Pipeline */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative">
                  {/* Step 1: NSWS Ingestion */}
                  {(() => {
                    const isDone = application.currentStage !== 'Application Submitted' && application.currentStage !== 'Draft';
                    const isActive = application.currentStage === 'Application Submitted' || application.currentStage === 'Draft';
                    return (
                      <div className={`p-3 rounded-xl border transition-all relative flex flex-col justify-between min-h-[92px] ${
                        isActive
                          ? 'bg-gradient-to-b from-blue-50/90 to-white border-2 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                          : isDone
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50/70 border-slate-200 text-slate-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-slate-400">STAGE 01</span>
                          {isDone ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-2.5 h-2.5" /> DONE
                            </span>
                          ) : isActive ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-600 text-white animate-pulse">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400">WAIT</span>
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-xs text-slate-900 mt-1">1. Ingestion</span>
                          <span className="text-[10px] text-slate-500 block">NSWS &bull; Siebel Token</span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium pt-1 border-t border-slate-100 mt-1">
                          {isDone ? 'Verified Single Window' : isActive ? 'Processing Intake Application' : 'Initial Phase'}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Step 2: Desk Scrutiny */}
                  {(() => {
                    const isActive = application.currentStage === 'Scrutiny in Progress' || application.currentStage === 'Deficiency Communicated';
                    const isDone = application.currentStage === 'Scrutiny Cleared' || application.currentStage === 'EVC Scheduled' || application.currentStage === 'EVC Inspection Completed' || application.currentStage === 'Executive Committee Approval' || application.currentStage === 'SAC / SHC Review' || application.currentStage === 'Approval Issued' || application.currentStage === 'Application Rejected';
                    return (
                      <div className={`p-3 rounded-xl border transition-all relative flex flex-col justify-between min-h-[92px] ${
                        isActive
                          ? 'bg-gradient-to-b from-blue-50/90 to-white border-2 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                          : isDone
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50/70 border-slate-200 text-slate-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-slate-400">STAGE 02</span>
                          {isDone ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-2.5 h-2.5" /> CLEARED
                            </span>
                          ) : isActive ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-600 text-white animate-pulse">
                              IN REVIEW
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400">PENDING</span>
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-xs text-slate-900 mt-1">2. Desk Scrutiny</span>
                          <span className="text-[10px] text-slate-500 block">Checklist &bull; Snapshot v1</span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium pt-1 border-t border-slate-100 mt-1">
                          {isDone ? 'Snapshot Digitally Signed' : isActive ? 'Verifying 4 Mandatory Checks' : 'SLA: 10 Days'}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Step 3: Physical EVC Inspection */}
                  {(() => {
                    const isWaived = isCOEP;
                    const isActive = (application.currentStage === 'EVC Scheduled' || application.currentStage === 'EVC Inspection Completed') && !isWaived;
                    const isDone = (application.currentStage === 'Executive Committee Approval' || application.currentStage === 'SAC / SHC Review' || application.currentStage === 'Approval Issued' || application.currentStage === 'Application Rejected') && !isWaived;
                    return (
                      <div className={`p-3 rounded-xl border transition-all relative flex flex-col justify-between min-h-[92px] ${
                        isWaived
                          ? 'bg-purple-50/60 border-purple-200 text-purple-950'
                          : isActive
                          ? 'bg-gradient-to-b from-blue-50/90 to-white border-2 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                          : isDone
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50/70 border-slate-200 text-slate-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-slate-400">STAGE 03</span>
                          {isWaived ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
                              <Award className="w-2.5 h-2.5 text-purple-600" /> WAIVED
                            </span>
                          ) : isDone ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-2.5 h-2.5" /> VISITED
                            </span>
                          ) : isActive ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-600 text-white animate-pulse">
                              DISPATCHED
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400">PENDING</span>
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-xs text-slate-900 mt-1">3. EVC Inspection</span>
                          <span className="text-[10px] text-slate-500 block">
                            {isWaived ? 'Waived (NBA Exemption)' : 'GPS &bull; 30m Video'}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium pt-1 border-t border-slate-100 mt-1">
                          {isWaived ? 'APH 2026-27 Errata p. 42' : isDone ? 'Telemetric Audit Verified' : isActive ? 'Field Verification Active' : 'SLA: 14 Days'}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Step 4: Regional Desk / SAC */}
                  {(() => {
                    const isActive = application.currentStage === 'Executive Committee Approval' || application.currentStage === 'SAC / SHC Review';
                    const isDone = application.currentStage === 'Approval Issued' || application.currentStage === 'Application Rejected';
                    return (
                      <div className={`p-3 rounded-xl border transition-all relative flex flex-col justify-between min-h-[92px] ${
                        isActive
                          ? 'bg-gradient-to-b from-blue-50/90 to-white border-2 border-blue-600 shadow-sm ring-2 ring-blue-500/20'
                          : isDone
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50/70 border-slate-200 text-slate-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-slate-400">STAGE 04</span>
                          {isDone ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-2.5 h-2.5" /> REVIEWED
                            </span>
                          ) : isActive ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-600 text-white animate-pulse">
                              IN REVIEW
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400">PENDING</span>
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-xs text-slate-900 mt-1">4. Regional Desk</span>
                          <span className="text-[10px] text-slate-500 block">RO / SAC Review Gate</span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium pt-1 border-t border-slate-100 mt-1">
                          {isDone ? 'Concurrence Finalized' : isActive ? 'Regional Concurrence & SAC' : 'SLA: 15 Days'}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Step 5: Final Order */}
                  {(() => {
                    const isIssued = application.currentStage === 'Approval Issued';
                    const isRejected = application.currentStage === 'Application Rejected';
                    return (
                      <div className={`p-3 rounded-xl border transition-all relative flex flex-col justify-between min-h-[92px] ${
                        isIssued
                          ? 'bg-emerald-50/90 border-2 border-emerald-600 shadow-sm ring-2 ring-emerald-500/20 text-emerald-950'
                          : isRejected
                          ? 'bg-rose-50/90 border-2 border-rose-600 shadow-sm ring-2 ring-rose-500/20 text-rose-950'
                          : 'bg-slate-50/70 border-slate-200 text-slate-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-slate-400">STAGE 05</span>
                          {isIssued ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white">
                              <CheckCircle2 className="w-2.5 h-2.5" /> APPROVED
                            </span>
                          ) : isRejected ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-600 text-white">
                              <XCircle className="w-2.5 h-2.5" /> REJECTED
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-slate-400">GATE</span>
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-xs text-slate-900 mt-1">5. Council Order</span>
                          <span className="text-[10px] text-slate-500 block">
                            {isIssued ? 'EoA Order Issued' : isRejected ? 'Speaking Order / LOD' : 'Statutory Order'}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium pt-1 border-t border-slate-100 mt-1">
                          {isIssued ? 'Digitally Signed & Dispatched' : isRejected ? 'LOD Dispatched' : 'Council EC Chamber'}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Advanced Manual Stage Transition Selector (For Regional & Bureau Officers) */}
              {canAct && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        Manual Statutory Stage Transition (Override Gate)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Select a specific target stage to execute authorized regulatory movement with justification note.
                      </p>
                    </div>
                  </div>

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
                          <AlertTriangle className="w-3.5 h-3.5" />
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
          )}

          {/* TAB 2: SUBMITTED DOCUMENTS & STATUTORY CHECKLISTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Prescribed Documents &amp; Verification Roster
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Monitored under AICTE APH Chapter I / II. Documents flagged deficient open a time-bound rectification window.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/api/v1/cases/${application.id}/intake-evaluation-table`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Intake Table (PDF)</span>
                  </a>

                  <a
                    href={`/api/v1/cases/${application.id}/export-proforma`}
                    download={`AICTE_Proforma_${application.applicationNumber}.txt`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1 transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Export Signed Proforma</span>
                  </a>
                </div>
              </div>

              {/* Documents Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Document / Requirement</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Validity / Expiry</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Verification Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {application.documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3">
                          <div className="flex items-start gap-2.5">
                            <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-bold text-slate-900 block">{doc.name}</span>
                              <span className="font-mono text-[11px] text-slate-500">{doc.fileName} &bull; {doc.fileSize}</span>
                              {doc.rejectionReason && (
                                <p className="text-[11px] text-rose-700 bg-rose-50 p-1.5 rounded mt-1 border border-rose-200">
                                  <strong>Deficiency Note:</strong> {doc.rejectionReason}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 font-medium text-slate-700">{doc.category}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">
                          {doc.expiryDate ? (
                            <span className={doc.expiryDate.startsWith('2026') ? 'text-amber-700 font-bold' : 'text-slate-700'}>
                              {doc.expiryDate}
                            </span>
                          ) : 'Permanent'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              doc.status === 'Verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : doc.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Officer Inline Verification Controls */}
                            {canAct && (
                              <>
                                <button
                                  onClick={() => handleVerifySingleDoc(doc.id, 'Verified')}
                                  className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[10px] flex items-center gap-1 transition-colors"
                                  title="Mark document verified"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Verify</span>
                                </button>
                                <button
                                  onClick={() => handleVerifySingleDoc(doc.id, 'Rejected')}
                                  className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[10px] flex items-center gap-1 transition-colors"
                                  title="Flag deficiency on this document"
                                >
                                  <Ban className="w-3 h-3" />
                                  <span>Flag</span>
                                </button>
                              </>
                            )}

                            {/* Institution Rectification Action */}
                            {isInstitution && doc.status === 'Rejected' && (
                              <button
                                onClick={() => setCorrectingDoc(doc)}
                                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors shadow-2xs"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Rectify &amp; Re-upload</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PHYSICAL INSPECTION & VIDEO AUDIT */}
          {activeTab === 'evc' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Expert Visit Committee (EVC) &amp; Physical Verification
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Governed by APH Chapter I §1.9 &amp; §1.10. Requires physical audit, faculty roster checks, and geo-tagged video walkthrough.
                  </p>
                </div>

                {onOpenEVCModal && (
                  <button
                    onClick={() => onOpenEVCModal(application.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Open EVC Inspection Panel</span>
                  </button>
                )}
              </div>

              {evcRecord ? (
                <div className="space-y-4">
                  {/* Committee Metadata Card */}
                  <div className="bg-white p-4.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Inspection Date</span>
                      <p className="font-bold text-slate-900 mt-0.5">{evcRecord.scheduledDate}</p>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mt-1 inline-block">
                        {evcRecord.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Committee Chair</span>
                      <p className="font-bold text-slate-900 mt-0.5">{evcRecord.committeeChairman || evcRecord.committeeMembers?.[0] || 'Dr. S. K. Roy (IIT Bombay)'}</p>
                      <p className="text-[11px] text-slate-500">AICTE Expert Panel Roster</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">GPS Coordinates</span>
                      <p className="font-mono text-slate-900 font-bold mt-0.5">17.7231° N, 83.3012° E</p>
                      <p className="text-[11px] text-emerald-700 font-medium">Geo-fence Verified</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Audit Result</span>
                      <p className="font-bold text-emerald-700 mt-0.5">Satisfactory</p>
                      <p className="text-[11px] text-slate-500">Video Walkthrough Stamped</p>
                    </div>
                  </div>

                  {/* Inspection Scorecards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-center">
                      <span className="text-xs font-bold text-emerald-900 block">Infrastructure &amp; Built-up Area</span>
                      <p className="text-2xl font-black text-emerald-700 mt-1">{evcRecord.infrastructureScore || 94}%</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5">All 24 labs compliant with AICTE Table 3.1</p>
                    </div>

                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-center">
                      <span className="text-xs font-bold text-emerald-900 block">Faculty Cadre Ratio</span>
                      <p className="text-2xl font-black text-emerald-700 mt-1">{evcRecord.facultyScore || 91}%</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5">1:20 Teacher-Student ratio verified</p>
                    </div>

                    <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-center">
                      <span className="text-xs font-bold text-emerald-900 block">Laboratory Equipment Norms</span>
                      <p className="text-2xl font-black text-emerald-700 mt-1">{evcRecord.laboratoriesScore || 96}%</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5">Physical safety &amp; calibration verified</p>
                    </div>
                  </div>

                  {/* 30-Minute Geo-tagged Video Walkthrough Simulator */}
                  <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2 border border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-rose-500 animate-pulse" />
                        <span className="font-bold tracking-tight">Geo-tagged 30-Min Inspection Video Walkthrough</span>
                      </div>
                      <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        GPS: 17.7231° N, 83.3012° E &bull; 1080p Stamped
                      </span>
                    </div>

                    <div className="relative h-44 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        <span>REC &bull; 00:28:44 / 00:30:00</span>
                      </div>
                      
                      <div className="text-center space-y-1">
                        <MapPin className="w-8 h-8 text-blue-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-200">Campus Video Stream Sealed with WORM Cryptographic Hash</p>
                        <p className="text-[10px] text-slate-400 font-mono">SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</p>
                      </div>

                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                        EVC Team #2-SOC1770029225 &bull; AICTE Portal
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800">No EVC Inspection Assigned</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    This route ({application.routeType}) does not currently require a scheduled physical inspection.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMPLIANCE, NOTICES & IMMUTABLE AUDIT TRAIL */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              {/* Compliance Obligations Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Institutional Undertakings &amp; Mandatory Conditions
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Monitored under AICTE Approval Process Handbook (APH §2.25(c)/(f) &amp; Table 2.3)
                    </p>
                  </div>

                  {canAct && (
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

              {/* Digital Audit Trail & Activity Movement Log (Domain B.5) */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Immutable Digital Audit Trail (WORM Log)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Cryptographically chained audit entries recording all approvals, reverts, and notifications.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {appAudits.length === 0 ? (
                      <p className="p-4 text-xs text-slate-500 italic">No audit records found for this case ID.</p>
                    ) : (
                      appAudits.map((a) => (
                        <div key={a.id} className="p-3 text-xs flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block">{a.action}</span>
                            <p className="text-slate-600 text-[11px]">{a.reason || a.action}</p>
                            <span className="text-[10px] font-mono text-slate-400">Actor: {a.actorName} ({a.actorRole})</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {formatDateIndian(a.timestamp)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            AICTE NiyamSetu Digital Platform &bull; Case Record: <span className="font-mono text-slate-700">{application.id}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>

      {/* Rejection Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="bg-rose-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-200" />
                <h3 className="font-bold text-sm">Formally Reject Application (APH Non-Compliance)</h3>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-slate-200 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-800">
              <p className="text-slate-600">
                You are executing a formal statutory rejection under AICTE Approval Process Handbook regulations. This order is recorded in the permanent audit trail.
              </p>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Substantive Grounds for Rejection <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    setRejectError(null);
                  }}
                  placeholder="Specify regulatory non-compliance (e.g. failure to cure infrastructure deficiencies within stipulated APH window)..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                {rejectError && (
                  <p className="text-rose-600 text-[11px] font-semibold mt-1">
                    {rejectError}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isActioning}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isActioning ? 'Rejecting...' : 'Confirm & Execute Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Case Summary and Notices Modal */}
      {showCaseSummaryModal && (
        <CaseSummaryNoticesModal
          application={application}
          onClose={() => setShowCaseSummaryModal(false)}
        />
      )}

      {/* Document Rectification Dialog */}
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
