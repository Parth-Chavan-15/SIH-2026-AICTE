import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, WorkflowStage, DocumentItem } from '../../types';
import { SLABadge, StageBadge } from '../../components/common/StatusBadge';
import { formatDateIndian } from '../../utils/slaCalculator';
import { getEligibleNextStages, validateWorkflowTransition } from '../../utils/workflowEngine';
import { api } from '../../services/api';
import { getSession } from '../../services/session';
import { CaseSummaryNoticesModal } from './CaseSummaryNoticesModal';
import {
  X,
  Building2,
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
  MoreVertical,
  Sliders
} from 'lucide-react';

interface ApplicationDetailModalProps {
  applicationId: string;
  onClose: () => void;
  onOpenEVCModal?: (appId: string) => void;
}

export interface RouteLifecycleStage {
  id: string;
  title: string;
  subtitle: string;
  status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING' | 'WAIVED' | 'CONDITIONAL' | 'REJECTED';
  badgeText: string;
  badgeColor: string;
  annotation?: string;
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
    verifyDocument,
    addToast,
  } = useApp();

  // Clean 4-tab dossier navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'evc' | 'compliance'>('overview');

  // Action in-progress state
  const [isActioning, setIsActioning] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

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

  // Route policy drawer toggle
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
  const canAct = roleNumber >= 2;
  const canRevert = roleNumber >= 4;

  const isCOEP = application.id.includes('COEP') || application.institutionCode === 'INST-SOUTH' || application.routeType === 'Scrutiny Only';
  const isGIITS = application.id.includes('GIITS') || application.institutionCode === 'INST-NORTH' || application.routeType === 'Scrutiny + EVC';
  const isPDIMTR = application.id.includes('PDIMTR') || application.institutionCode === 'INST-WEST' || application.routeType === 'Fast-Track EoA';
  const isAPEX = application.id.includes('APEX') || application.id.includes('Apex') || application.institutionCode === 'INST-APEX' || application.routeType === 'Scrutiny + EVC + SAC/SHC';
  const isBATU = application.id.includes('BATU') || application.institutionCode === 'INST-BATU' || application.routeType === 'Only EVC';

  // --- Dynamic Route-Specific Lifecycle Generator ---
  const generateRouteLifecycle = (): RouteLifecycleStage[] => {
    const cur = application.currentStage;

    // 1. Fast-Track EoA (Table 2.3 Row 1)
    if (isPDIMTR || application.routeType === 'Fast-Track EoA') {
      const isDone1 = cur !== 'Application Submitted' && cur !== 'Draft';
      const isActive1 = cur === 'Application Submitted' || cur === 'Draft';
      const isDoneCouncil = cur === 'Approval Issued';
      const isActiveCouncil = cur === 'Executive Committee Approval';
      return [
        {
          id: 'intake',
          title: '1. Self-Disclosure Intake',
          subtitle: 'NSWS Ingestion',
          status: isDone1 ? 'COMPLETED' : isActive1 ? 'ACTIVE' : 'UPCOMING',
          badgeText: isDone1 ? 'VERIFIED' : 'ACTIVE',
          badgeColor: isDone1 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-600 text-white',
          annotation: 'Table 2.3 Row 1'
        },
        {
          id: 'scrutiny',
          title: '2. Desk Scrutiny',
          subtitle: 'Checklist Review',
          status: 'WAIVED',
          badgeText: 'BYPASSED',
          badgeColor: 'bg-purple-100 text-purple-800',
          annotation: 'Self-Disclosure Renewal'
        },
        {
          id: 'evc',
          title: '3. Physical EVC',
          subtitle: 'Campus Audit',
          status: 'WAIVED',
          badgeText: 'EXEMPT',
          badgeColor: 'bg-purple-100 text-purple-800',
          annotation: 'No Intake Surge'
        },
        {
          id: 'council',
          title: '4. Executive Committee',
          subtitle: 'Approval Gate',
          status: isDoneCouncil ? 'COMPLETED' : isActiveCouncil ? 'ACTIVE' : 'UPCOMING',
          badgeText: isDoneCouncil ? 'APPROVED' : isActiveCouncil ? 'IN REVIEW' : 'PENDING',
          badgeColor: isDoneCouncil ? 'bg-emerald-100 text-emerald-800' : isActiveCouncil ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500',
          annotation: 'APH §2.25'
        },
        {
          id: 'order',
          title: '5. EoA Order Issued',
          subtitle: 'Post-Approval Obligations',
          status: cur === 'Approval Issued' ? 'COMPLETED' : 'UPCOMING',
          badgeText: cur === 'Approval Issued' ? 'ISSUED' : 'PENDING',
          badgeColor: cur === 'Approval Issued' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500',
          annotation: '15d §2.25(f) FDR Clock'
        }
      ];
    }

    // 2. Scrutiny Only (NBA Fast-Track Waiver §2.6(c)(1))
    if (isCOEP || application.routeType === 'Scrutiny Only') {
      const isDoneIntake = cur !== 'Application Submitted' && cur !== 'Draft';
      const isDoneScrutiny = cur === 'Scrutiny Cleared' || cur === 'Executive Committee Approval' || cur === 'Approval Issued';
      const isActiveScrutiny = cur === 'Scrutiny in Progress' || cur === 'Deficiency Communicated';
      const isDoneCouncil = cur === 'Approval Issued';
      const isActiveCouncil = cur === 'Executive Committee Approval';
      return [
        {
          id: 'intake',
          title: '1. Application Intake',
          subtitle: 'NSWS Digital Ingestion',
          status: isDoneIntake ? 'COMPLETED' : 'ACTIVE',
          badgeText: isDoneIntake ? 'VERIFIED' : 'ACTIVE',
          badgeColor: isDoneIntake ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-600 text-white',
          annotation: 'NBA Tier-1 Valid'
        },
        {
          id: 'scrutiny',
          title: '2. Desk Scrutiny',
          subtitle: 'Snapshot v1 Checklist',
          status: isDoneScrutiny ? 'COMPLETED' : isActiveScrutiny ? 'ACTIVE' : 'UPCOMING',
          badgeText: isDoneScrutiny ? 'CLEARED' : isActiveScrutiny ? 'IN REVIEW' : 'PENDING',
          badgeColor: isDoneScrutiny ? 'bg-emerald-100 text-emerald-800' : isActiveScrutiny ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500',
          annotation: '100% Verified C1-C6'
        },
        {
          id: 'evc',
          title: '3. Physical EVC',
          subtitle: 'Campus Inspection',
          status: 'WAIVED',
          badgeText: 'WAIVED (NBA)',
          badgeColor: 'bg-purple-100 text-purple-900 border border-purple-300 font-bold',
          annotation: 'Errata G02 p. 42 §2.6(c)(1)'
        },
        {
          id: 'council',
          title: '4. Executive Committee',
          subtitle: 'Council EC Approval Gate',
          status: isDoneCouncil ? 'COMPLETED' : isActiveCouncil ? 'ACTIVE' : 'UPCOMING',
          badgeText: isDoneCouncil ? 'APPROVED' : isActiveCouncil ? 'IN REVIEW' : 'PENDING',
          badgeColor: isDoneCouncil ? 'bg-emerald-100 text-emerald-800' : isActiveCouncil ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500',
          annotation: 'Human Decision Gate'
        },
        {
          id: 'order',
          title: '5. Extension of Approval',
          subtitle: 'Digitally Sealed Order',
          status: cur === 'Approval Issued' ? 'COMPLETED' : 'UPCOMING',
          badgeText: cur === 'Approval Issued' ? 'ISSUED' : 'PENDING',
          badgeColor: cur === 'Approval Issued' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500',
          annotation: 'AY 2026–27 EoA'
        }
      ];
    }

    // 3. Only EVC (Restoration / Site Shifting §2.16.1)
    if (isBATU || application.routeType === 'Only EVC') {
      const isDoneIntake = cur !== 'Application Submitted' && cur !== 'Draft';
      const isActiveEVC = cur === 'EVC Scheduled' || cur === 'EVC Inspection Completed' || cur === 'Scrutiny Cleared';
      const isDoneEVC = cur === 'Executive Committee Approval' || cur === 'Approval Issued';
      const isDoneCouncil = cur === 'Approval Issued';
      return [
        {
          id: 'intake',
          title: '1. Application Intake',
          subtitle: 'Restoration / Shifting',
          status: isDoneIntake ? 'COMPLETED' : 'ACTIVE',
          badgeText: isDoneIntake ? 'VERIFIED' : 'ACTIVE',
          badgeColor: isDoneIntake ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-600 text-white',
          annotation: 'Table 2.3 Row 11'
        },
        {
          id: 'scrutiny',
          title: '2. Desk Scrutiny',
          subtitle: 'Preliminary Review',
          status: 'WAIVED',
          badgeText: 'WAIVED',
          badgeColor: 'bg-purple-100 text-purple-800',
          annotation: 'Waived per §2.16.1'
        },
        {
          id: 'evc',
          title: '3. Mandatory Physical EVC',
          subtitle: 'Campus Site Verification',
          status: isDoneEVC ? 'COMPLETED' : isActiveEVC ? 'ACTIVE' : 'UPCOMING',
          badgeText: isDoneEVC ? 'INSPECTED' : isActiveEVC ? 'DISPATCHED' : 'PENDING',
          badgeColor: isDoneEVC ? 'bg-emerald-100 text-emerald-800' : isActiveEVC ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500',
          annotation: '500m Geo & 30m Video'
        },
        {
          id: 'council',
          title: '4. Executive Committee',
          subtitle: 'Competent Authority',
          status: isDoneCouncil ? 'COMPLETED' : cur === 'Executive Committee Approval' ? 'ACTIVE' : 'UPCOMING',
          badgeText: isDoneCouncil ? 'APPROVED' : 'PENDING',
          badgeColor: isDoneCouncil ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500',
          annotation: 'Council Determination'
        },
        {
          id: 'order',
          title: '5. Sanction Order',
          subtitle: 'Restoration Sanctioned',
          status: cur === 'Approval Issued' ? 'COMPLETED' : 'UPCOMING',
          badgeText: cur === 'Approval Issued' ? 'ISSUED' : 'PENDING',
          badgeColor: cur === 'Approval Issued' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500',
          annotation: 'Post-Restoration Audit'
        }
      ];
    }

    // 4. Default / Standard Scrutiny + EVC (e.g. GIITS Non-NBA Surge, New Institutions)
    const isDoneIntake = cur !== 'Application Submitted' && cur !== 'Draft';
    const isDoneScrutiny = cur !== 'Application Submitted' && cur !== 'Draft' && cur !== 'Scrutiny in Progress' && cur !== 'Deficiency Communicated';
    const isActiveScrutiny = cur === 'Scrutiny in Progress' || cur === 'Deficiency Communicated';
    const isDoneEVC = cur === 'Executive Committee Approval' || cur === 'SAC / SHC Review' || cur === 'Approval Issued' || cur === 'Application Rejected';
    const isActiveEVC = cur === 'EVC Scheduled' || cur === 'EVC Inspection Completed';
    const isActiveHearing = cur === 'SAC / SHC Review';
    const isDoneCouncil = cur === 'Approval Issued' || cur === 'Application Rejected';

    return [
      {
        id: 'intake',
        title: '1. Ingestion',
        subtitle: 'NSWS / Siebel Hand-off',
        status: isDoneIntake ? 'COMPLETED' : 'ACTIVE',
        badgeText: isDoneIntake ? 'VERIFIED' : 'ACTIVE',
        badgeColor: isDoneIntake ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-600 text-white',
        annotation: 'Single Window Intake'
      },
      {
        id: 'scrutiny',
        title: '2. Desk Scrutiny',
        subtitle: cur === 'Deficiency Communicated' ? 'Deficiencies Flagged' : 'Snapshot v1 Review',
        status: isDoneScrutiny ? 'COMPLETED' : isActiveScrutiny ? 'ACTIVE' : 'UPCOMING',
        badgeText: isDoneScrutiny ? 'CLEARED' : cur === 'Deficiency Communicated' ? 'CURE WINDOW' : isActiveScrutiny ? 'IN REVIEW' : 'PENDING',
        badgeColor: isDoneScrutiny ? 'bg-emerald-100 text-emerald-800' : cur === 'Deficiency Communicated' ? 'bg-amber-500 text-slate-950 font-bold' : isActiveScrutiny ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500',
        annotation: cur === 'Deficiency Communicated' ? '10d Operational SLA' : 'Checklists & Evidence'
      },
      {
        id: 'evc',
        title: '3. Physical EVC',
        subtitle: 'On-Site Inspection',
        status: isDoneEVC ? 'COMPLETED' : isActiveEVC ? 'ACTIVE' : 'UPCOMING',
        badgeText: isDoneEVC ? 'INSPECTED' : isActiveEVC ? 'ACTIVE' : 'PENDING',
        badgeColor: isDoneEVC ? 'bg-emerald-100 text-emerald-800' : isActiveEVC ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500',
        annotation: 'Mandatory Non-NBA §1.9'
      },
      ...(isAPEX || application.routeType.includes('SAC') ? [{
        id: 'hearing',
        title: '4. SHC / SAC Hearing',
        subtitle: 'Quasi-Judicial Recourse',
        status: (isActiveHearing ? 'ACTIVE' : isDoneCouncil ? 'COMPLETED' : 'CONDITIONAL') as any,
        badgeText: isActiveHearing ? 'HEARING LISTED' : isDoneCouncil ? 'DISPOSED' : 'RECOURSE',
        badgeColor: isActiveHearing ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600',
        annotation: 'APH §1.11 / §2.23.3'
      }] : []),
      {
        id: 'council',
        title: isAPEX ? '5. Council Gate' : '4. Council Gate',
        subtitle: 'Competent Authority',
        status: isDoneCouncil ? 'COMPLETED' : cur === 'Executive Committee Approval' ? 'ACTIVE' : 'UPCOMING',
        badgeText: cur === 'Approval Issued' ? 'APPROVED' : cur === 'Application Rejected' ? 'REJECTED' : cur === 'Executive Committee Approval' ? 'IN REVIEW' : 'PENDING',
        badgeColor: cur === 'Approval Issued' ? 'bg-emerald-100 text-emerald-800' : cur === 'Application Rejected' ? 'bg-rose-100 text-rose-800' : cur === 'Executive Committee Approval' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500',
        annotation: 'Human Decision Gate'
      },
      {
        id: 'order',
        title: isAPEX ? '6. Final Order' : '5. Final Order',
        subtitle: cur === 'Approval Issued' ? 'Approval Order (EoA)' : cur === 'Application Rejected' ? 'Speaking Order (LoR)' : 'Order Formulation',
        status: isDoneCouncil ? 'COMPLETED' : 'UPCOMING',
        badgeText: cur === 'Approval Issued' ? 'ISSUED' : cur === 'Application Rejected' ? 'REJECTED' : 'PENDING',
        badgeColor: cur === 'Approval Issued' ? 'bg-emerald-600 text-white' : cur === 'Application Rejected' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500',
        annotation: 'HMAC Sealed Binary'
      }
    ];
  };

  const lifecycleStages = generateRouteLifecycle();

  // Determine intelligent next primary action based on current stage, role & statutory route
  const getPrimaryActionForRole = () => {
    // 1. Institution Signatory
    if (isInstitution) {
      if (application.currentStage === 'Deficiency Communicated') {
        return {
          label: 'Submit Rectification (Annexure 7)',
          variant: 'amber',
          icon: Upload,
          handler: () => setActiveTab('documents')
        };
      }
      if (application.currentStage === 'Approval Issued') {
        return {
          label: 'Upload §2.25(f) FDR & Affidavit-3',
          variant: 'emerald',
          icon: ShieldCheck,
          handler: () => setActiveTab('compliance')
        };
      }
      return null;
    }

    // 2. Desk Reviewer (Role 2)
    if (roleNumber === 2) {
      if (application.currentStage === 'Application Submitted' || application.currentStage === 'Draft') {
        return {
          label: 'Start Desk Scrutiny',
          variant: 'green',
          icon: CheckCircle2,
          handler: () => handleQuickAccept('Scrutiny in Progress')
        };
      }
      if (application.currentStage === 'Scrutiny in Progress') {
        const nextStage: WorkflowStage = (application.routeType.includes('EVC') || isGIITS || isBATU) ? 'EVC Scheduled' : 'Executive Committee Approval';
        return {
          label: 'Sign Scrutiny Snapshot v1 & Advance',
          variant: 'green',
          icon: CheckCircle2,
          handler: () => handleQuickAccept(nextStage)
        };
      }
      if (application.currentStage === 'Deficiency Communicated') {
        return {
          label: 'Review Cured Submissions (Scope-Locked)',
          variant: 'blue',
          icon: CheckCircle2,
          handler: () => handleQuickAccept('Scrutiny in Progress')
        };
      }
    }

    // 3. EVC Inspection Panel (Role 3)
    if (roleNumber === 3) {
      if (application.currentStage === 'EVC Scheduled') {
        return {
          label: 'Record Inspection Telemetry & Video Audit',
          variant: 'purple',
          icon: Video,
          handler: () => {
            if (onOpenEVCModal) onOpenEVCModal(application.id);
            else setActiveTab('evc');
          }
        };
      }
      if (application.currentStage === 'EVC Inspection Completed') {
        const nextStage: WorkflowStage = (application.routeType.includes('SAC') || isAPEX) ? 'SAC / SHC Review' : 'Executive Committee Approval';
        return {
          label: 'Sign EVC Panel Report & Transmit',
          variant: 'green',
          icon: CheckCircle2,
          handler: () => handleQuickAccept(nextStage)
        };
      }
    }

    // 4. Regional Officer (Role 4)
    if (roleNumber === 4) {
      if (application.currentStage === 'Scrutiny Cleared' && (application.routeType.includes('EVC') || isGIITS || isBATU)) {
        return {
          label: 'Dispatch EVC Inspection Panel',
          variant: 'blue',
          icon: Calendar,
          handler: () => handleQuickAccept('EVC Scheduled')
        };
      }
      if (application.currentStage === 'EVC Inspection Completed' || application.currentStage === 'Scrutiny Cleared') {
        return {
          label: 'Transmit Dossier to Approval Bureau',
          variant: 'green',
          icon: ArrowRight,
          handler: () => handleQuickAccept('Executive Committee Approval')
        };
      }
    }

    // 5. Competent Authority (Role 5)
    if (roleNumber === 5 || roleNumber === 6) {
      if (application.currentStage === 'Executive Committee Approval') {
        return {
          label: 'Grant Approval & Formulate Order (APH §1.10)',
          variant: 'emerald',
          icon: Award,
          handler: () => handleQuickAccept('Approval Issued')
        };
      }
    }

    // Fallback default action if generic next stage available
    if (canAct && application.currentStage !== 'Approval Issued' && application.currentStage !== 'Application Rejected') {
      if (application.currentStage === 'Application Submitted') {
        return { label: 'Start Desk Scrutiny', variant: 'green', icon: CheckCircle2, handler: () => handleQuickAccept('Scrutiny in Progress') };
      }
      if (application.currentStage === 'Scrutiny in Progress') {
        const nextStage: WorkflowStage = (application.routeType.includes('EVC') || isGIITS || isBATU) ? 'EVC Scheduled' : 'Executive Committee Approval';
        return { label: 'Accept & Advance Stage', variant: 'green', icon: CheckCircle2, handler: () => handleQuickAccept(nextStage) };
      }
      if (application.currentStage === 'EVC Scheduled') {
        return { label: 'Mark EVC Completed', variant: 'green', icon: CheckCircle2, handler: () => handleQuickAccept('EVC Inspection Completed') };
      }
      if (application.currentStage === 'Executive Committee Approval') {
        return { label: 'Issue Council Approval (EoA)', variant: 'emerald', icon: Award, handler: () => handleQuickAccept('Approval Issued') };
      }
    }

    return null;
  };

  const primaryAction = getPrimaryActionForRole();

  // One-Click Accept & Advance Stage
  const handleQuickAccept = async (targetStage: WorkflowStage) => {
    setIsActioning(true);
    try {
      await transitionStage(
        application.id,
        targetStage,
        `Stage advanced to ${targetStage} per APH 2026-27 norms by ${user?.name || 'Authorized Officer'}`
      );
      addToast({
        type: 'success',
        title: 'Application Stage Advanced',
        message: `Case moved to ${targetStage}. Cryptographic audit trail recorded.`,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message || 'Workflow transition failed' });
    } finally {
      setIsActioning(false);
    }
  };

  // Flag Deficiencies Action
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
        message: 'Applicant notified. Case transitioned to 10-Day Operational SLA Turnaround Window.',
      });
      setShowMoreActions(false);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Action Failed', message: err.message || 'Deficiency transition failed' });
    } finally {
      setIsActioning(false);
    }
  };

  // Rejection Confirmation
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
        message: 'Rejection speaking order stamped and recorded in the immutable audit log.',
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
      addToast({
        type: 'success',
        title: 'Manual Transition Executed',
        message: `Case moved to ${selectedTargetStage}.`,
      });
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
      setShowMoreActions(false);
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
      const data = (res as any)?.data ?? res;
      if (data) {
        setComplianceClosedData(data);
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
      addToast({
        type: status === 'Verified' ? 'success' : 'warning',
        title: `Document ${status}`,
        message: `Status updated for ${docId}.`,
      });
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* ==================================================================== */}
        {/* 1. COMPACT CASE IDENTITY HEADER                                      */}
        {/* ==================================================================== */}
        <div className="bg-[#0A2540] text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  {application.institutionName}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  PID: {application.institutionCode}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  AY 2026–27
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1">
                <span className="font-mono text-slate-400">App No: {application.applicationNumber}</span>
                <span>&bull;</span>
                <span>{application.applicationType}</span>
                <span>&bull;</span>
                <span className="text-blue-200 font-medium">{application.region} Region</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <StageBadge stage={application.currentStage} />
            <SLABadge
              status={application.slaStatus}
              overdueDays={application.overdueDays}
              daysRemaining={Math.max(0, application.stageDeadlineDays - application.elapsedDaysAtStage)}
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Close Case Dossier (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 2. PROMINENT ROUTE SUMMARY & RULE DISCLOSURE BAR                     */}
        {/* ==================================================================== */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-100 text-indigo-900 border border-indigo-300">
              APH Table 2.3
            </span>
            <span className="text-slate-500 font-medium">Assigned Route:</span>
            <span className="font-extrabold text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300 shadow-2xs">
              {application.routeType}
            </span>
            {isCOEP && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                <Award className="w-3 h-3" /> NBA Tier-1 Valid (Physical EVC Exempt)
              </span>
            )}
            {isGIITS && (
              <span className="hidden sm:inline-flex text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Non-NBA Surge (Mandatory EVC)
              </span>
            )}
          </div>

          <button
            onClick={() => setShowWhyRouteDrawer(!showWhyRouteDrawer)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            title="Inspect governing handbook clauses"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Why this route?</span>
            {showWhyRouteDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable "Why this Route?" Statutory Drawer */}
        {showWhyRouteDrawer && (
          <div className="bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-slate-50 border-b border-indigo-200 p-4 text-xs text-slate-800 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-indigo-950 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Statutory Predicate: {application.routeType} (Rule Engine v2026.1)
                </h4>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {isCOEP
                    ? 'Evaluated under APH 2024–27 Table 2.3 Row 9 and AY 2026–27 Addendum Errata G02 p. 42 §2.6(c)(1). Tier-1 NBA score (680) clears desk scrutiny and exempts institution from physical EVC.'
                    : isGIITS
                    ? 'Evaluated under APH Table 2.3 Row 3. Proposed intake surge from 120 to 180 seats in unaccredited branch mandates on-site physical verification by a 3-member Expert Visit Committee under §1.9.'
                    : isPDIMTR
                    ? 'Evaluated under APH Table 2.3 Row 1 (Annual EoA Renewal on Self-Disclosure). Pre-approval scrutiny and physical inspection waived; post-approval subject to 30-year lease deed compliance.'
                    : isBATU
                    ? 'Evaluated under APH §2.16.1 & §2.17(e) (Restoration / Site Shifting). Preliminary desk scrutiny is statutory waived in lieu of immediate mandatory campus physical verification.'
                    : 'Evaluated against AICTE Approval Process Handbook (APH 2024–27) Table 2.3 matrix and statutory accreditation thresholds.'}
                </p>
              </div>
              <button
                onClick={() => setShowWhyRouteDrawer(false)}
                className="text-slate-400 hover:text-slate-600 p-1 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-indigo-100 text-[11px]">
              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-500 uppercase text-[9px] block">Accreditation Benchmark</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {isCOEP ? 'NBA Tier-1 (Valid 2028)' : isGIITS ? 'Non-NBA Program' : 'Self-Disclosure'}
                </span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-500 uppercase text-[9px] block">EVC Requirement</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {isCOEP ? 'Waived (NBA Exemption)' : isPDIMTR ? 'Bypassed (Self-Disclosure)' : 'Mandatory Physical EVC'}
                </span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-500 uppercase text-[9px] block">Official Artifact</span>
                <a
                  href={`/api/v1/cases/${application.id}/intake-evaluation-table`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>Intake Capacity Table</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 3. ROUTE-SPECIFIC DYNAMIC LIFECYCLE RAIL                             */}
        {/* ==================================================================== */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-900">
                Route-Specific Lifecycle Pipeline
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Current Milestone:</span>
              <span className="font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {application.currentStage}
              </span>
              <span className="font-mono text-slate-500 text-[11px]">
                {application.elapsedDaysAtStage}d elapsed (SLA: {application.stageDeadlineDays}d)
              </span>
            </div>
          </div>

          {/* Dynamic Stages Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {lifecycleStages.map((stage) => {
              const isCompleted = stage.status === 'COMPLETED';
              const isActive = stage.status === 'ACTIVE';
              const isWaived = stage.status === 'WAIVED';
              return (
                <div
                  key={stage.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between min-h-[82px] ${
                    isActive
                      ? 'bg-blue-50/80 border-2 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                      : isWaived
                      ? 'bg-purple-50/60 border-purple-200 text-purple-900'
                      : 'bg-slate-50/70 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold text-slate-400">
                      {stage.id.toUpperCase()}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${stage.badgeColor}`}>
                      {isCompleted && <CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />}
                      {stage.badgeText}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-xs text-slate-900 mt-1 leading-tight">
                      {stage.title}
                    </h5>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                      {stage.subtitle}
                    </p>
                  </div>

                  <div className="text-[9px] text-slate-400 font-medium pt-1 border-t border-slate-100/80 mt-1">
                    {stage.annotation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 4. ROLE-AWARE ACTION CONSOLE (Single Primary Action)                 */}
        {/* ==================================================================== */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {primaryAction ? (
              <button
                onClick={primaryAction.handler}
                disabled={isActioning}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all disabled:opacity-50 ${
                  primaryAction.variant === 'emerald'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : primaryAction.variant === 'amber'
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : primaryAction.variant === 'purple'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : primaryAction.variant === 'blue'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <primaryAction.icon className="w-4 h-4" />
                <span>{isActioning ? 'Executing...' : primaryAction.label}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Stage Status: <strong>{application.currentStage}</strong> (No pending action for your role)</span>
              </div>
            )}
          </div>

          {/* Secondary Actions Group */}
          <div className="flex items-center gap-2">
            {/* Case Summary & 5 Standard Notices */}
            <button
              onClick={() => setShowCaseSummaryModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 transition-colors shadow-2xs"
              title="View Electronic Case Summary & 5 Statutory Notices"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Summary &amp; 5 Notices</span>
            </button>

            {/* Contextual More Actions Dropdown for Authorized Officers */}
            {canAct && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreActions(!showMoreActions)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-2xs"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                  <span>More Actions</span>
                </button>

                {showMoreActions && (
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 text-xs">
                    {application.currentStage !== 'Deficiency Communicated' && (
                      <button
                        onClick={handleQuickFlagDeficiency}
                        className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-amber-900 flex items-center gap-2 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Flag Deficiencies (Annex. 7)</span>
                      </button>
                    )}

                    {canRevert && (
                      <button
                        onClick={() => {
                          setShowRevertModal(true);
                          setShowMoreActions(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-800 flex items-center gap-2 transition-colors border-t border-slate-100"
                      >
                        <RotateCcw className="w-4 h-4 text-slate-500" />
                        <span>Revert Stage (APH §1.8)</span>
                      </button>
                    )}

                    {application.currentStage !== 'Approval Issued' && application.currentStage !== 'Application Rejected' && (
                      <button
                        onClick={() => {
                          setShowRejectModal(true);
                          setShowMoreActions(false);
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 transition-colors border-t border-slate-100"
                      >
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Reject Application</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 5. CLEAN 4-TAB NAVIGATION BAR                                        */}
        {/* ==================================================================== */}
        <div className="border-b border-slate-200 bg-white px-4 sm:px-5 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Overview &amp; Statutory Facts</span>
          </button>
          
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Documents &amp; Checklists</span>
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
            <MapPin className="w-4 h-4" />
            <span>EVC Inspection &amp; Telemetry</span>
            {evcRecord && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
          </button>

          <button
            onClick={() => setActiveTab('compliance')}
            className={`py-3 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'compliance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Audit Trail &amp; Orders</span>
            {appCompliances.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-[10px] font-bold text-amber-900">
                {appCompliances.length}
              </span>
            )}
          </button>
        </div>

        {/* ==================================================================== */}
        {/* 6. CONSOLIDATED CONTENT PANELS (Single Outer Scroll)                 */}
        {/* ==================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          
          {/* TAB 1: OVERVIEW & FACTS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Institutional Facts Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Programme &amp; Level</span>
                  <p className="font-bold text-xs text-slate-900 mt-0.5">{application.program || 'Engineering & Tech'}</p>
                  <p className="text-[11px] text-slate-500">{(application as any).level || 'Under Graduate'}</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Intake Surge</span>
                  <p className="font-bold text-xs text-slate-900 mt-0.5">
                    {application.proposedIntake} seats
                    <span className="text-slate-500 font-normal ml-1">
                      (from {(application as any).currentIntake || (application.proposedIntake - 60)})
                    </span>
                  </p>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    +{application.proposedIntake - ((application as any).currentIntake || (application.proposedIntake - 60))} Proposed
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Submission Date</span>
                  <p className="font-bold text-xs text-slate-900 mt-0.5">{formatDateIndian(application.submittedAt)}</p>
                  <p className="text-[11px] text-slate-500">NSWS Single Window</p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Assigned Officer</span>
                  <p className="font-bold text-xs text-slate-900 mt-0.5">{application.assignedOfficer}</p>
                  <p className="text-[11px] text-blue-600 font-medium">RO {application.region}</p>
                </div>
              </div>

              {/* Manual Stage Transition for Authorized Officers (Hidden for Applicants) */}
              {canAct && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-blue-600" />
                        Manual Statutory Stage Transition (Override Gate)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Select an eligible target stage to execute authorized regulatory movement with justification note.
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
                    <div className="space-y-2 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 block">
                        Official Regulatory Remarks / Mandatory Reason:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Provide detailed justification, official remarks, or specific deficiencies observed..."
                        value={mandatoryReason}
                        onChange={(e) => setMandatoryReason(e.target.value)}
                        className="w-full p-2.5 rounded-md border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
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

          {/* TAB 2: SUBMITTED DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Prescribed Regulatory Documents &amp; Verification Roster
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
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Document / Requirement</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Validity</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
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

          {/* TAB 3: PHYSICAL EVC INSPECTION */}
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
                  <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Inspection Date</span>
                      <p className="font-bold text-slate-900 mt-0.5">{evcRecord.scheduledDate}</p>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mt-1 inline-block">
                        {evcRecord.status}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Committee Chair</span>
                      <p className="font-bold text-slate-900 mt-0.5">
                        {evcRecord.committeeChairman || evcRecord.committeeMembers?.[0] || 'Dr. S. K. Roy (IIT Bombay)'}
                      </p>
                      <p className="text-[11px] text-slate-500">AICTE Expert Panel Roster</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">GPS Coordinates</span>
                      <p className="font-mono text-slate-900 font-bold mt-0.5">17.7231° N, 83.3012° E</p>
                      <p className="text-[11px] text-emerald-700 font-medium">500m Geo-fence Verified</p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Audit Result</span>
                      <p className="font-bold text-emerald-700 mt-0.5">Satisfactory</p>
                      <p className="text-[11px] text-slate-500">Video Walkthrough Stamped</p>
                    </div>
                  </div>

                  {/* 30-Minute Video Telemetry */}
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

                    <div className="relative h-36 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                      <div className="text-center space-y-1">
                        <MapPin className="w-7 h-7 text-blue-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-200">Campus Video Stream Sealed with WORM Cryptographic Hash</p>
                        <p className="text-[10px] text-slate-400 font-mono">SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800">No EVC Inspection Assigned</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    This route ({application.routeType}) does not currently require a scheduled physical inspection.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COMPLIANCE, ORDERS & IMMUTABLE AUDIT TRAIL */}
          {activeTab === 'compliance' && (
            <div className="space-y-5">
              {/* Post-Approval Compliance Obligations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Institutional Undertakings &amp; Post-Approval Obligations
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Monitored under AICTE APH §2.25(c)/(f) (15-Day Joint FDR, 30-Year Lease Deed, Affidavit 3)
                    </p>
                  </div>

                  {canAct && (
                    <button
                      onClick={handleCloseComplianceCase}
                      disabled={closingCompliance}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{closingCompliance ? 'Verifying...' : 'Authorize Case Closure'}</span>
                    </button>
                  )}
                </div>

                {complianceClosedData && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-1 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-emerald-900">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Statutory Compliance Formally Discharged &amp; Case Closed</span>
                    </div>
                    <p className="text-emerald-800 text-[11px]">
                      Closed By: <strong>{complianceClosedData.closedBy}</strong> at {formatDateIndian(complianceClosedData.closedAt)}.
                      WORM audit digest recorded.
                    </p>
                  </div>
                )}

                {appCompliances.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-white p-3 rounded-lg border border-slate-200">
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

              {/* Digital Audit Trail (WORM Log) */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Immutable Digital Audit Trail (HMAC-SHA256 WORM Log)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Cryptographically chained audit entries recording all approvals, reverts, and notifications.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
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

        {/* ==================================================================== */}
        {/* SUB-MODALS                                                           */}
        {/* ==================================================================== */}

        {/* Case Summary & 5 Notices Modal */}
        {showCaseSummaryModal && (
          <CaseSummaryNoticesModal
            application={application}
            onClose={() => setShowCaseSummaryModal(false)}
          />
        )}

        {/* Revert Modal */}
        {showRevertModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>Revert Application Stage (APH §1.8(f)-(g))</span>
                </h4>
                <button onClick={() => setShowRevertModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Reversion Stage:</label>
                  <select
                    value={revertTargetKey}
                    onChange={(e) => setRevertTargetKey(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                  >
                    <option value="submitted">Stage 01: Application Submitted (Restart Desk Review)</option>
                    <option value="scrutiny_pending">Stage 02: Scrutiny in Progress</option>
                    <option value="correction_required">Stage 02b: Deficiency Communicated (Cure Window)</option>
                    <option value="rescrutiny_pending">Stage 02c: Scrutiny Cleared</option>
                    <option value="evc_pending">Stage 03: EVC Scheduled (Re-Inspection)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mandatory Written Regulatory Reason:</label>
                  <textarea
                    rows={3}
                    placeholder="Enter substantive statutory reason for stage reversion (minimum 5 characters per APH guidelines)..."
                    value={revertReason}
                    onChange={(e) => setRevertReason(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  {revertError && (
                    <p className="text-xs font-semibold text-rose-600 mt-1">{revertError}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowRevertModal(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevertStage}
                  disabled={isReverting}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isReverting ? 'Reverting...' : 'Confirm Reversion'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-sm text-rose-900 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Reject Application (Speaking Order Formulation)</span>
                </h4>
                <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Rejection is a formal quasi-judicial action under AICTE Act 1987 §10k. A Speaking Order recording substantive non-compliance reasons must be issued. Aggrieved applicants retain 7-day appellate recourse before SAC.
                </p>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Substantive Non-Compliance Grounds:</label>
                  <textarea
                    rows={3}
                    placeholder="Specify non-compliance clauses, deficiency items, or adverse findings..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  {rejectError && (
                    <p className="text-xs font-semibold text-rose-600 mt-1">{rejectError}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={isActioning}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{isActioning ? 'Recording...' : 'Confirm Rejection'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Document Rectification Modal */}
        {correctingDoc && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Rectify Flagged Deficiency: {correctingDoc.name}</span>
                </h4>
                <button onClick={() => setCorrectingDoc(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {correctingDoc.rejectionReason && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                    <strong>Recorded Deficiency:</strong> {correctingDoc.rejectionReason}
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Explanation of Rectification Submitted:</label>
                  <textarea
                    rows={3}
                    placeholder="Explain how the deficiency was resolved (e.g. additional Associate Professor appointment orders attached)..."
                    value={rectificationComment}
                    onChange={(e) => setRectificationComment(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {rectificationError && (
                    <p className="text-xs font-semibold text-rose-600 mt-1">{rectificationError}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setCorrectingDoc(null)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRectification}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit Rectification</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
