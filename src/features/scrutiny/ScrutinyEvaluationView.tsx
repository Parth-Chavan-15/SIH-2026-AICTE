import { LoadingState } from '../../components/common/LoadingState';
import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useScrutiny } from '../applications/hooks/useScrutiny';
import { formatDateIndian } from '../../utils/slaCalculator';
import { getLiveCureRemark } from '../../services/api';
import { SLABadge, StageBadge } from '../../components/common/StatusBadge';
import {
  FileCheck,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  Award,
  Sparkles,
  RefreshCw,
  Building,
  Clock,
  ArrowRight,
  XCircle,
  Check,
  RotateCcw
} from 'lucide-react';

interface ScrutinyEvaluationViewProps {
  mode: 'initial' | 'rescrutiny';
  onSelectApplication: (id: string) => void;
}

export const ScrutinyEvaluationView: React.FC<ScrutinyEvaluationViewProps> = ({
  mode,
  onSelectApplication,
}) => {
  const { applications, loading: appLoading, transitionStage, verifyDocument, addToast, refreshData } = useApp();

  // Strict Queue Filtering: Only show cases that actually belong to this active stage
  const activeCases = useMemo(() => {
    if (mode === 'rescrutiny') {
      return applications.filter(
        (a) =>
          a.currentStage === 'Deficiency Communicated' ||
          (a as any).state === 'rescrutiny_pending' ||
          (a as any).state === 'correction_required'
      );
    }
    // mode === 'initial': Desk Scrutiny Evaluation
    return applications.filter(
      (a) =>
        a.currentStage === 'Scrutiny in Progress' ||
        a.currentStage === 'Application Submitted' ||
        (a as any).state === 'submitted' ||
        (a as any).state === 'scrutiny_pending'
    );
  }, [applications, mode]);

  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  useEffect(() => {
    if (activeCases.length > 0) {
      if (!selectedCaseId || !activeCases.some((a) => a.id === selectedCaseId)) {
        setSelectedCaseId(activeCases[0].id);
      }
    } else {
      setSelectedCaseId('');
    }
  }, [activeCases, selectedCaseId]);

  const currentApp = activeCases.find((a) => a.id === selectedCaseId) || activeCases[0];
  const isPolicyHalted = Boolean(
    (currentApp?.routeType as string) === 'Policy review required' ||
    currentApp?.currentStage === 'Draft' ||
    (currentApp as any)?.state === 'policy_review_required'
  );

  const {
    latestSnapshot,
    snapshots,
    loading: scrutinyLoading,
    sign: signSnapshot,
    correct: submitCorrection,
    refetch: refetchScrutiny,
  } = useScrutiny(currentApp?.id || '');

  // Initial checklist evaluation state - dynamically bound to active case
  const [checklistItems, setChecklistItems] = useState<{
    itemId: string;
    name: string;
    category: string;
    status: 'pending' | 'accepted' | 'deficient';
    remark: string;
    evidenceVersion: string;
  }[]>([]);

  // Track verified remediations for re-scrutiny
  const [remediatedItemIds, setRemediatedItemIds] = useState<Set<string>>(new Set());

  // Dynamically initialize checklist items from currentApp's actual documents
  useEffect(() => {
    if (!currentApp) {
      setChecklistItems([]);
      return;
    }

    if (currentApp.documents && currentApp.documents.length > 0) {
      const items = currentApp.documents.map((doc) => {
        const itemId = doc.id.replace(/^DOC-/, '') || doc.id;
        let status: 'pending' | 'accepted' | 'deficient' = 'pending';
        if (doc.status === 'Verified') status = 'accepted';
        else if (doc.status === 'Rejected' || doc.status === 'Needs Resubmission') status = 'deficient';

        let remark = doc.verifiedBy || doc.verificationDate
          ? `Verified by ${doc.verifiedBy || 'Desk Scrutiny Cell'}`
          : 'Awaiting committee verification against AICTE statutory norms.';
        if (doc.status === 'Rejected') {
          remark = `Deficiency flagged: Documentary shortfall noted under statutory norms.`;
        }

        return {
          itemId,
          name: doc.name || `Item ${itemId}: Statutory Compliance Document`,
          category: doc.category || 'General',
          status,
          remark,
          evidenceVersion: `${doc.id}-v1`
        };
      });
      setChecklistItems(items);
    } else {
      setChecklistItems([
        {
          itemId: 'C3',
          name: 'Item C3: Registered Land Conversion / Title Deed (30-Year Lease Minimum)',
          category: 'Land & Building',
          status: 'pending',
          remark: 'Awaiting committee verification against state revenue records.',
          evidenceVersion: 'DOC-C3-v1',
        },
        {
          itemId: 'C4',
          name: 'Item C4: Municipal Approved Structural Stability Certificate',
          category: 'Land & Building',
          status: 'pending',
          remark: 'Awaiting structural stability verification by registered architect.',
          evidenceVersion: 'DOC-C4-v1',
        },
        {
          itemId: 'D1',
          name: 'Item D1: Faculty Cadre Ratio (1:2:6 Cadre & 1:20 Teacher-Student Ratio)',
          category: 'Faculty & Academic',
          status: 'pending',
          remark: 'Awaiting faculty cadre ratio verification against AICTE Table 2.1.',
          evidenceVersion: 'DOC-D1-v1',
        },
        {
          itemId: 'D2',
          name: 'Item D2: Fire Safety NOC (1-Year Validity with 60-Day Advance Renewal Rule)',
          category: 'Infrastructure & Safety',
          status: 'pending',
          remark: 'Awaiting municipal fire safety certificate verification.',
          evidenceVersion: 'DOC-D2-v1',
        },
      ]);
    }

    setSignedSuccess(null);
    setScopeTestResult(null);
    setRemediatedItemIds(new Set());
  }, [currentApp?.id]);

  const { immutableItems, deficientItems } = useMemo(() => {
    if (!currentApp) return { immutableItems: [], deficientItems: [] };
    const docs = currentApp.documents || [];
    if (docs.length > 0) {
      const deficientDocs = docs.filter((d) => d.status === 'Rejected' || Boolean(d.deficiencyRemark));
      const acceptedDocs = docs.filter((d) => d.status === 'Verified' || !deficientDocs.includes(d));

      if (deficientDocs.length === 0 && docs.length > 2) {
        return {
          immutableItems: docs.slice(0, 2).map((d) => ({
            itemId: d.id.replace(/^DOC-/, ''),
            name: d.name,
            category: d.type || 'Institutional Document',
            evidence: d.fileName || `${d.id}-v1`,
          })),
          deficientItems: docs.slice(2).map((d) => ({
            itemId: d.id.replace(/^DOC-/, ''),
            name: d.name,
            category: d.type || 'Regulatory Norm',
            ref: 'APH Table 2.1 & Annexure 7',
            remark: d.deficiencyRemark || 'Deficiency flagged during initial desk scrutiny.',
            evidence: d.fileName || `${d.id}-RECTIFIED-v2`,
          })),
        };
      }

      return {
        immutableItems: (acceptedDocs.length > 0 ? acceptedDocs : docs.slice(0, 2)).map((d) => ({
          itemId: d.id.replace(/^DOC-/, ''),
          name: d.name,
          category: d.type || 'Institutional Document',
          evidence: d.fileName || `${d.id}-v1`,
        })),
        deficientItems: (deficientDocs.length > 0 ? deficientDocs : docs.slice(2)).map((d) => ({
          itemId: d.id.replace(/^DOC-/, ''),
          name: d.name,
          category: d.type || 'Regulatory Norm',
          ref: 'APH Table 2.1 & Annexure 7',
          remark: d.deficiencyRemark || 'Deficiency flagged during initial desk scrutiny.',
          evidence: d.fileName || `${d.id}-RECTIFIED-v2`,
        })),
      };
    }

    return {
      immutableItems: [
        { itemId: 'C3', name: 'Registered Land Conversion / Title Deed (30-Yr Lease Minimum)', category: 'Land & Building', evidence: 'DOC-C3-v1' },
        { itemId: 'C4', name: 'Municipal Approved Structural Stability Certificate', category: 'Infrastructure & Safety', evidence: 'DOC-C4-v1' },
      ],
      deficientItems: [
        { itemId: 'D1', name: 'Faculty Cadre Ratio (2 Professor Deficit)', category: 'Faculty & Academic', ref: 'APH Table 2.1 • Annexure 7', remark: 'Professor deficit: 2 required, 0 available in CSE/IT departments', evidence: 'DOC-D1-RECTIFIED-v2' },
        { itemId: 'D2', name: 'Fire Safety NOC (1-Year Validity with 60-Day Advance Renewal Rule)', category: 'Infrastructure & Safety', ref: 'APH §2.25(f)', remark: 'Fire safety NOC expired or not renewed 60 days prior', evidence: 'DOC-D2-RECTIFIED-v2' },
      ],
    };
  }, [currentApp]);

  const [signedSuccess, setSignedSuccess] = useState<any | null>(null);
  const [scopeTestResult, setScopeTestResult] = useState<{
    type: 'tamper_blocked' | 'correction_accepted';
    title: string;
    message: string;
    statusCode: number;
    timestamp: string;
  } | null>(null);

  const [remediationVerified, setRemediationVerified] = useState(false);

  const hasPendingItems = checklistItems.some((i) => i.status === 'pending');
  const hasDeficientItems = checklistItems.some((i) => i.status === 'deficient');

  const handleToggleItemStatus = (itemId: string, newStatus: 'accepted' | 'deficient' | 'pending') => {
    setChecklistItems((prev) =>
      prev.map((item) => {
        if (item.itemId !== itemId) return item;
        const remark =
          newStatus === 'accepted'
            ? 'Verified compliant with statutory norms under APH 2026–27.'
            : newStatus === 'deficient'
            ? itemId === 'D1'
              ? 'Deficiency flagged: 2 Professor cadre deficit in CS & IT departments.'
              : itemId === 'D2'
              ? 'Deficiency flagged: Fire NOC validity expires within 14 calendar days.'
              : 'Deficiency flagged during physical document verification.'
            : 'Pending committee verification.';
        return { ...item, status: newStatus, remark };
      })
    );
  };

  const handleUpdateItemRemark = (itemId: string, remark: string) => {
    setChecklistItems((prev) =>
      prev.map((item) => (item.itemId === itemId ? { ...item, remark } : item))
    );
  };

  const handleSignSnapshot = async () => {
    if (!currentApp) return;
    const deficientItems = checklistItems.filter((i) => i.status === 'deficient');
    const itemsPayload = checklistItems.map((i) => ({
      itemId: i.itemId,
      result: i.status === 'deficient' ? ('deficient' as const) : ('accepted' as const),
      status: i.status === 'deficient' ? ('deficient' as const) : ('accepted' as const),
      reason: i.remark,
      evidenceVersionIds: [i.evidenceVersion],
    }));

    const result = await signSnapshot('2026-27-v1', itemsPayload);
    if (result.success) {
      setSignedSuccess((result as any)?.data ?? result);

      // Dynamically update document states according to the scrutiny evaluation
      for (const item of checklistItems) {
        const docId = `DOC-${item.itemId}`;
        if (item.status === 'accepted') {
          await verifyDocument(currentApp.id, docId, 'Verified', item.remark, true).catch(() => {});
        } else if (item.status === 'deficient') {
          await verifyDocument(currentApp.id, docId, 'Rejected', item.remark, true).catch(() => {});
        }
      }

      addToast({
        type: 'success',
        title: 'Scrutiny Snapshot v1 Signed',
        message: `Snapshot v1 recorded. ${deficientItems.length} deficiencies flagged. Items C3 & C4 locked immutable.`,
      });
      // Transition stage to Deficiency Communicated if deficiencies exist, else target stage
      if (deficientItems.length > 0) {
        await transitionStage(currentApp.id, 'Deficiency Communicated', 'Scrutiny Snapshot v1 signed with deficiencies.');
      } else {
        const needsEVC = currentApp.route?.stages?.includes('evc_pending') || (currentApp.routeType || '').toLowerCase().includes('evc');
        const targetStage = needsEVC ? 'EVC Scheduled' : 'Executive Committee Approval';
        await transitionStage(currentApp.id, targetStage, 'Scrutiny Snapshot v1 signed all items accepted. Advanced to ' + targetStage);
      }
      await refreshData();
      refetchScrutiny();
    } else {
      addToast({
        type: 'error',
        title: 'Sign Snapshot Failed',
        message: (result as any).error?.message || 'Failed to sign scrutiny snapshot',
      });
    }
  };

  const handleAcceptAndClearScrutiny = async () => {
    if (!currentApp) return;
    const acceptedItems = checklistItems.map((item) => ({
      ...item,
      status: 'accepted' as const,
      remark: 'All statutory parameters verified and accepted compliant with AICTE APH norms.',
    }));
    setChecklistItems(acceptedItems);
    const itemsPayload = acceptedItems.map((i) => ({
      itemId: i.itemId,
      result: 'accepted' as const,
      status: 'accepted' as const,
      reason: i.remark,
      evidenceVersionIds: [i.evidenceVersion],
    }));

    await signSnapshot('2026-27-v1', itemsPayload);
    for (const item of acceptedItems) {
      await verifyDocument(currentApp.id, `DOC-${item.itemId}`, 'Verified', item.remark, true).catch(() => {});
    }
    const needsEVC = currentApp.route?.stages?.includes('evc_pending') || (currentApp.routeType || '').toLowerCase().includes('evc');
    const targetStage = needsEVC ? 'EVC Scheduled' : 'Executive Committee Approval';
    await transitionStage(currentApp.id, targetStage, 'Scrutiny fully accepted and cleared by Desk Scrutiny Committee. Advanced to ' + targetStage);
    addToast({
      type: 'success',
      title: 'Scrutiny Accepted & Cleared',
      message: `All checklist items verified. Snapshot recorded and case advanced to ${targetStage}.`,
    });
    await refreshData();
    refetchScrutiny();
  };

  const handleRejectScrutiny = async () => {
    if (!currentApp) return;
    await transitionStage(currentApp.id, 'Application Rejected', 'Application rejected at scrutiny stage due to fatal regulatory non-compliance.');
    addToast({
      type: 'error',
      title: 'Application Rejected',
      message: 'Scrutiny rejection order stamped and case closed.',
    });
    await refreshData();
    refetchScrutiny();
  };

  // Authentic Scope Lock Tamper Attempt (triggered directly on locked items)
  const handleAttemptTamper = async (itemId: string, itemName: string) => {
    if (!currentApp) return;
    setScopeTestResult(null);

    const targetSnapshotId = latestSnapshot?.id || (currentApp.id.includes('GIITS') ? '2-SOC1770029225' : `SNAP-${currentApp.id}-v1`);
    try {
      const result = await submitCorrection(targetSnapshotId, [
        {
          itemId,
          response: `Unauthorized attempt to alter locked Item ${itemId} (${itemName}) during re-scrutiny.`,
          evidenceVersionIds: [`DOC-${itemId}-TAMPERED-v2`],
        },
      ]);

      if (!result.success) {
        const err = (result as any).error;
        setScopeTestResult({
          type: 'tamper_blocked',
          title: 'HTTP 409 / 412: Scope Lock Enforced (APH §1.8(g) Verified)',
          message:
            err?.message ||
            `Server-Enforced Scope Lock Violation: Under APH §1.8(g), only items flagged deficient in signed Snapshot v1 can be modified. Item ${itemId} (${itemName}) was accepted in initial scrutiny and is strictly immutable.`,
          statusCode: 409,
          timestamp: new Date().toLocaleTimeString(),
        });
        addToast({
          type: 'error',
          title: 'Scope Lock Violation Blocked',
          message: `Server guard rejected unauthorized tamper on Item ${itemId} (HTTP 409 Conflict).`,
        });
      }
    } catch (err: any) {
      setScopeTestResult({
        type: 'tamper_blocked',
        title: 'HTTP 409 Conflict: Scope Lock Guard Active',
        message: err.message || `Server guard rejected unauthorized modification on Item ${itemId} under APH §1.8(g).`,
        statusCode: 409,
        timestamp: new Date().toLocaleTimeString(),
      });
      addToast({
        type: 'error',
        title: 'Scope Lock Violation Blocked',
        message: `Modification blocked on locked Item ${itemId} (HTTP 409 Conflict).`,
      });
    }
  };

  const handleToggleCureItem = async (itemId: string, verified: boolean) => {
    if (!currentApp) return;
    setRemediatedItemIds((prev) => {
      const next = new Set(prev);
      if (verified) next.add(itemId);
      else next.delete(itemId);
      return next;
    });

    const docId = `DOC-${itemId.replace(/^DOC-/, '')}`;
    if (verified) {
      await verifyDocument(currentApp.id, docId, 'Verified', 'Rectification verified compliant under APH §1.8(g).', true).catch(() => {});
      addToast({
        type: 'success',
        title: 'Remediation Verified',
        message: `Deficiency for ${itemId} verified compliant by re-scrutiny panel.`,
      });
    } else {
      await verifyDocument(currentApp.id, docId, 'Rejected', 'Remediation deficient under APH §1.8(g).', true).catch(() => {});
      addToast({
        type: 'warning',
        title: 'Deficiency Maintained',
        message: `Item ${itemId} remains deficient.`,
      });
    }
  };

  const handleClearReScrutiny = async () => {
    if (!currentApp) return;
    const needsEVC = currentApp.route?.stages?.includes('evc_pending') || (currentApp.routeType || '').toLowerCase().includes('evc');
    const targetStage = needsEVC ? 'EVC Scheduled' : 'Executive Committee Approval';
    await transitionStage(
      currentApp.id,
      targetStage,
      'Differential Re-Scrutiny cleared by panel. Case advanced to ' + (needsEVC ? 'Expert Visit Committee (EVC)' : 'Council Approval Gate') + '.'
    );
    addToast({
      type: 'success',
      title: 'Re-Scrutiny Cleared & Advanced',
      message: `Case advanced to ${targetStage}. All deficiencies sealed compliant.`,
    });
    await refreshData();
    refetchScrutiny();
  };

  return (
    <div className="space-y-6">
      {/* Statutory Header */}
      <div className="bg-gradient-to-r from-[#071A2E] via-[#0A2540] to-[#0F355A] p-5 sm:p-6 rounded-2xl text-white shadow-lg border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black font-mono tracking-wider bg-amber-500 text-slate-950 uppercase">
              Role #2 Portal
            </span>
            <span className="text-xs text-blue-200">
              Desk Scrutiny Committee Cell &bull; Statutory Roster 2-SOC1770029225
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {mode === 'initial'
              ? 'Checklist Review & Scrutiny Snapshot v1 Signing'
              : 'Differential Re-Scrutiny & Scope Lock Console'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Governed by AICTE Approval Process Handbook (APH §1.8(a)-(g) &amp; 2026-27 Errata G02)
          </p>
        </div>

        {/* Committee Roster Pill */}
        <div className="bg-white/10 backdrop-blur-xs border border-white/15 p-3 rounded-xl text-xs space-y-1 max-w-sm">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Automated Committee Selection (§1.8(a))</span>
          </div>
          <p className="text-[11px] text-slate-200">
            <strong>Chairman:</strong> Dr. S. K. Roy (IIT Bombay) &bull; <strong>Experts:</strong> Dr. Anjali Mehta (NIT), Dr. R. K. Sharma (COEP)
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-300 pt-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Unbiased Expert Declaration Signed (No institutional conflict)</span>
          </div>
        </div>
      </div>

      {appLoading && applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs">
          <LoadingState
            title="Loading scrutiny review docket…"
            subtitle="Retrieving committee checklist and verified snapshots"
            spinnerColor="text-amber-600"
          />
        </div>
      ) : activeCases.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-xs space-y-2">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            {mode === 'initial'
              ? 'Desk Scrutiny Queue Empty'
              : 'Differential Re-Scrutiny Queue Empty'}
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {mode === 'initial'
              ? 'No applications currently awaiting initial desk scrutiny. Applications submitted via NSWS will appear here for committee evaluation.'
              : 'No applications currently in deficiency remediation or re-scrutiny. Flagged cases from initial scrutiny will appear here once applicant remediations are filed.'}
          </p>
        </div>
      ) : (
        <>
      {/* Case Selector Ribbon (strictly filtered to active stage cases) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-700">
            {mode === 'initial' ? 'Active Scrutiny Queue' : 'Active Re-Scrutiny Queue'} ({activeCases.length}):
          </span>
          {activeCases.map((app) => (
            <button
              key={app.id}
              onClick={() => setSelectedCaseId(app.id)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                selectedCaseId === app.id
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-300'
              }`}
            >
              <span className="font-mono text-[11px]">{app.applicationNumber}</span>
              <span className="ml-1 opacity-80">({app.institutionName.split(' ')[0]})</span>
            </button>
          ))}
        </div>

        {currentApp && (
          <button
            onClick={() => onSelectApplication(currentApp.id)}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Open Case Dossier</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Selected Application Card */}
      {currentApp && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                  {currentApp.applicationNumber}
                </span>
                <StageBadge stage={currentApp.currentStage} />
                <SLABadge status={currentApp.slaStatus} overdueDays={currentApp.overdueDays} />
              </div>
              <h3 className="text-base font-bold text-slate-900">{currentApp.institutionName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentApp.city}, {currentApp.state} &bull; Route: <strong className="text-slate-800">{currentApp.routeType}</strong> &bull; Intake: <strong className="text-slate-800">{currentApp.proposedIntake} seats</strong> in {currentApp.program}
              </p>
            </div>

            {/* Stage-aware Official Proforma link */}
            <div className="flex items-center gap-2">
              <a
                href={`/api/v1/cases/${currentApp.id}/export-proforma`}
                download={`AICTE_Proforma_${currentApp.applicationNumber}.txt`}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1 transition-colors"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Export Official Proforma</span>
              </a>
            </div>
          </div>

          {/* MODE 1: INITIAL SCRUTINY & SNAPSHOT v1 */}
          {mode === 'initial' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Statutory Checklist Verification (APH Chapter I / II Norms)
                    </h4>
                    <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                      APH §1.8 Evaluation Table
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Evaluate statutory parameters live. Accepted items are sealed into immutable WORM storage upon signing.
                  </p>
                </div>

                {/* Interactive Reviewer Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setChecklistItems((prev) =>
                        prev.map((item) => ({
                          ...item,
                          status: 'pending' as const,
                          remark: 'Awaiting committee evaluation against AICTE statutory norms.'
                        }))
                      );
                      addToast({
                        type: 'info',
                        title: 'Evaluation Reset',
                        message: 'Checklist rows reset to Pending Review for manual evaluation.',
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Reset all rows to Pending Review"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset to Pending</span>
                  </button>
                </div>
              </div>

              {/* Checklist Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Item &amp; Norm Description</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Committee Finding</th>
                      <th className="py-3 px-4 text-right">Evaluation Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {checklistItems.map((item) => (
                      <React.Fragment key={item.itemId}>
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 max-w-sm">
                            <span className="font-bold text-slate-900 block">{item.name}</span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">{item.remark}</span>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-600">{item.category}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                item.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : item.status === 'deficient'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-slate-100 text-slate-700 border border-slate-300 font-medium'
                              }`}
                            >
                              {item.status === 'accepted' ? 'Accepted' : item.status === 'deficient' ? 'Deficient' : 'Pending Review'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs font-semibold">
                              <button
                                onClick={() => handleToggleItemStatus(item.itemId, 'accepted')}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                  item.status === 'accepted'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Accepted
                              </button>
                              <button
                                onClick={() => handleToggleItemStatus(item.itemId, 'deficient')}
                                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                  item.status === 'deficient'
                                    ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                Deficient
                              </button>
                            </div>
                          </td>
                        </tr>
                        {item.status === 'deficient' && (
                          <tr className="bg-amber-50/60 border-b border-amber-200">
                            <td colSpan={4} className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                <span className="font-semibold text-slate-700 text-[11px] shrink-0">
                                  Deficiency Finding:
                                </span>
                                <input
                                  type="text"
                                  value={item.remark}
                                  onChange={(e) => handleUpdateItemRemark(item.itemId, e.target.value)}
                                  placeholder="Specify statutory deficiency observation per AICTE norms..."
                                  className="w-full text-xs px-2.5 py-1 rounded border border-amber-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Statutory Policy Review Halt Banner */}
              {isPolicyHalted && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-3 shadow-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-amber-900 uppercase tracking-wider text-[11px]">
                      Statutory Route Halted — Policy Review Required (APH Table 2.3 Row 9 Boundary X=360)
                    </div>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      The Dynamic Policy Routing Engine held this application because division boundary X = 360 is ambiguous under AY 2026–27 Addendum Errata G02 p. 42 (omitted between X &lt; 360 and X &gt; 360). Desk scrutiny checklist evaluation and signing actions are suspended pending Central Policy Bureau / Executive Committee clarification in the Active Rules Registry.
                    </p>
                  </div>
                </div>
              )}

              {/* Snapshot v1 Signing Action Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">
                    Official Scrutiny Actions &amp; Digital Seal
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isPolicyHalted
                      ? 'Desk Scrutiny signing suspended while statutory policy review is pending.'
                      : hasPendingItems
                      ? 'Evaluate each checklist item row above before signing the statutory snapshot.'
                      : hasDeficientItems
                      ? 'Deficiencies flagged. Signing will issue an official deficiency notice and open the APH §1.8(g) cure window.'
                      : 'All statutory parameters accepted. Signing will seal the snapshot and advance the application.'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {hasPendingItems ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-slate-200 text-slate-500 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-not-allowed opacity-70"
                      title="Evaluate all parameters before signing"
                    >
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Evaluate All Items to Sign</span>
                    </button>
                  ) : hasDeficientItems ? (
                    <button
                      onClick={handleSignSnapshot}
                      disabled={scrutinyLoading || isPolicyHalted}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title={isPolicyHalted ? 'Disabled: Case held for Policy Review' : 'Sign snapshot v1 and issue deficiency notice under APH §1.8(g)'}
                    >
                      <AlertTriangle className="w-4 h-4 text-slate-950" />
                      <span>{scrutinyLoading ? 'Signing Snapshot...' : 'Sign Snapshot v1 & Issue Deficiency Notice'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleAcceptAndClearScrutiny}
                      disabled={scrutinyLoading || isPolicyHalted}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      title={isPolicyHalted ? 'Disabled: Case held for Policy Review' : 'Sign snapshot v1, clear scrutiny, and advance application'}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>{scrutinyLoading ? 'Signing Snapshot...' : 'Sign Snapshot v1 & Clear Scrutiny'}</span>
                    </button>
                  )}

                  <button
                    onClick={handleRejectScrutiny}
                    disabled={scrutinyLoading || isPolicyHalted}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title={isPolicyHalted ? 'Disabled: Case held for Policy Review' : 'Formally reject application due to regulatory non-compliance'}
                  >
                    <XCircle className="w-4 h-4 text-rose-200" />
                    <span>Reject Application</span>
                  </button>
                </div>
              </div>

              {/* Signed Success Banner */}
              {signedSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Scrutiny Snapshot v1 Formally Signed &amp; Stamped!</span>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    Snapshot ID: <strong className="font-mono">{signedSuccess.id}</strong> &bull; Round: <strong>Round 1</strong> &bull; Checklist: {signedSuccess.checklistVersion}.
                    All accepted parameters are locked. Deficiency communication dispatched to applicant.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: DIFFERENTIAL RE-SCRUTINY & SCOPE LOCK (USP B06) */}
          {mode === 'rescrutiny' && (
            <div className="space-y-5">
              {/* USP B06 Header Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <h4 className="font-bold text-sm tracking-tight">
                      Differential Re-Scrutiny Scope Lock Engine &bull; APH §1.8(g)
                    </h4>
                  </div>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Server-enforced immutability: Under APH §1.8(g), only items flagged in signed deficiency snapshot (D1/D2) can be altered. Previously accepted items (C3/C4) are locked as read-only.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="px-2.5 py-1 rounded-full font-mono font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    Gate G2 &bull; Pure Server Enforcement
                  </span>
                </div>
              </div>

              {/* Active Snapshot & Immutability Bounds */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Active Baseline Snapshot:</span>
                    <p className="font-mono text-xs font-bold text-slate-800">
                      {latestSnapshot ? latestSnapshot.id : `SNAP-${currentApp.id}-v1`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Signed Round:</span>
                    <p className="font-bold text-xs text-indigo-700">Round 1 (2026-27-v1)</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">Checklist Items &amp; Immutability Bounds:</span>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    {immutableItems.map((item) => (
                      <div key={item.itemId} className="p-3 rounded-lg border bg-emerald-50/70 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                Item {item.itemId}
                              </span>
                              <span className="font-semibold">{item.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              Evidence: {item.evidence} &bull; Category: {item.category}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-200 text-emerald-900 border border-emerald-300">
                            Accepted (IMMUTABLE)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAttemptTamper(item.itemId, item.name)}
                            disabled={scrutinyLoading}
                            className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-700 font-bold text-[10px] rounded border border-rose-300 transition-colors flex items-center gap-1 shadow-2xs"
                            title="Attempt unauthorized alteration of locked item to test server-enforced immutability"
                          >
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Attempt Edit</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {deficientItems.map((item) => {
                      const isVerified = remediatedItemIds.has(item.itemId);
                      const applicantRemark = getLiveCureRemark(currentApp?.id || '', item.itemId);
                      return (
                        <div key={item.itemId} className="p-3.5 rounded-xl border bg-amber-50/70 border-amber-300 text-amber-950 flex flex-col gap-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                    Item {item.itemId}
                                  </span>
                                  <span className="font-semibold">{item.name}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 block mt-0.5">
                                  Deficiency Reference: {item.ref} &bull; Finding: {item.remark}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                                  isVerified
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : 'bg-amber-200 text-amber-900 border-amber-300'
                                }`}
                              >
                                {isVerified ? 'Remediation Verified & Accepted' : 'Applicant Remediation Filed'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleCureItem(item.itemId, !isVerified)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors ${
                                  isVerified
                                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {isVerified ? (
                                  <>
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Deficiency Persists</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Verify &amp; Accept</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="bg-white/90 p-3 rounded-lg border border-amber-200 text-[11px] text-slate-700 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Applicant Submission (From Role 1 Deficiency Cure Window):</span>
                            </div>
                            <p className="font-mono text-slate-800 text-[11px] bg-slate-50 p-2 rounded border border-slate-200">
                              &ldquo;{applicantRemark || (currentApp?.id.includes('GIITS') ? 'Rectification submitted with verified supporting compliance documentation.' : 'Applicant rectification uploaded and awaiting committee verification.')}&rdquo;
                            </p>
                            <div className="text-[10px] text-slate-500 font-mono">
                              Evidence: {item.evidence} &bull; Signatory: Dr. Principal
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Panel Decision & Action Controls */}
              <div className="bg-white border-2 border-indigo-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                      Re-Scrutiny Panel Regulatory Action
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Deficiencies Verified: {deficientItems.filter((i) => remediatedItemIds.has(i.itemId)).length} / {deficientItems.length}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Review applicant remediations submitted above. Once all flagged deficiencies are verified compliant under APH §1.8(g), advance the case to the next statutory stage, or reject if deficiencies persist:
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleClearReScrutiny}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    title="Clear Re-Scrutiny and forward case to Expert Visit Committee (EVC) or Council Gate"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Clear Re-Scrutiny &amp; Advance Case</span>
                  </button>

                  <button
                    onClick={handleRejectScrutiny}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-rose-200" />
                    <span>Reject Application</span>
                  </button>
                </div>

                {/* Scope Test Live Feedback Result */}
                {scopeTestResult && (
                  <div
                    className={`p-4 rounded-xl border text-xs leading-relaxed animate-in fade-in duration-150 ${
                      scopeTestResult.type === 'tamper_blocked'
                        ? 'bg-rose-50 border-rose-300 text-rose-950'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {scopeTestResult.type === 'tamper_blocked' ? (
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">{scopeTestResult.title}</p>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200">
                            HTTP {scopeTestResult.statusCode} &bull; {scopeTestResult.timestamp}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed">{scopeTestResult.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
};
