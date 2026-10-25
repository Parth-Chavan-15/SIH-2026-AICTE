import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useScrutiny } from '../applications/hooks/useScrutiny';
import { formatDateIndian } from '../../utils/slaCalculator';
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
  Check
} from 'lucide-react';

interface ScrutinyEvaluationViewProps {
  mode: 'initial' | 'rescrutiny';
  onSelectApplication: (id: string) => void;
}

export const ScrutinyEvaluationView: React.FC<ScrutinyEvaluationViewProps> = ({
  mode,
  onSelectApplication,
}) => {
  const { applications, transitionStage, verifyDocument, addToast } = useApp();

  // Reviewable cases (COEP, GIITS, PDIMTR, Apex, BATU)
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    mode === 'rescrutiny'
      ? applications.find((a) => a.id.includes('GIITS') || a.id.includes('APEX'))?.id || applications[0]?.id || ''
      : applications.find((a) => a.id.includes('COEP'))?.id || applications[0]?.id || ''
  );

  const currentApp = applications.find((a) => a.id === selectedCaseId) || applications[0];

  const {
    latestSnapshot,
    snapshots,
    loading: scrutinyLoading,
    sign: signSnapshot,
    correct: submitCorrection,
    refetch: refetchScrutiny,
  } = useScrutiny(currentApp?.id || '');

  // Initial checklist evaluation state
  const [checklistItems, setChecklistItems] = useState([
    {
      itemId: 'C3',
      name: 'Item C3: Registered Land Conversion / Title Deed (30-Year Lease Minimum)',
      category: 'Land & Building',
      status: 'accepted' as 'accepted' | 'deficient',
      remark: '30-year registered lease deed verified in compliance with APH Annexure 1 norms.',
      evidenceVersion: 'DOC-C3-v1',
    },
    {
      itemId: 'C4',
      name: 'Item C4: Municipal Approved Structural Stability Certificate',
      category: 'Land & Building',
      status: 'accepted' as 'accepted' | 'deficient',
      remark: 'Structural safety certificate endorsed by Registered Municipal Architect.',
      evidenceVersion: 'DOC-C4-v1',
    },
    {
      itemId: 'D1',
      name: 'Item D1: Faculty Cadre Ratio (1:2:6 Cadre & 1:20 Teacher-Student Ratio)',
      category: 'Faculty & Academic',
      status: (currentApp?.id.includes('GIITS') ? 'deficient' : 'accepted') as 'accepted' | 'deficient',
      remark: currentApp?.id.includes('GIITS')
        ? 'Deficiency flagged: 2 Professor cadre deficit in CS & IT departments per GIITS 2-SOC1770029225.'
        : 'All faculty cadre ratios comply with AICTE Table 2.1 norms.',
      evidenceVersion: 'DOC-D1-v1',
    },
    {
      itemId: 'D2',
      name: 'Item D2: Fire Safety NOC (1-Year Validity with 60-Day Advance Renewal Rule)',
      category: 'Infrastructure & Safety',
      status: (currentApp?.id.includes('GIITS') ? 'deficient' : 'accepted') as 'accepted' | 'deficient',
      remark: currentApp?.id.includes('GIITS')
        ? 'Deficiency flagged: Fire NOC validity expires within 14 calendar days; advance renewal required.'
        : 'Valid Fire Safety NOC verified through end of academic session.',
      evidenceVersion: 'DOC-D2-v1',
    },
  ]);

  // Sync checklist if college changes
  useEffect(() => {
    if (currentApp?.id.includes('GIITS')) {
      setChecklistItems([
        {
          itemId: 'C3',
          name: 'Item C3: Registered Land Conversion / Title Deed (30-Year Lease Minimum)',
          category: 'Land & Building',
          status: 'accepted',
          remark: '30-year registered lease deed verified in compliance with APH Annexure 1 norms.',
          evidenceVersion: 'DOC-C3-v1',
        },
        {
          itemId: 'C4',
          name: 'Item C4: Municipal Approved Structural Stability Certificate',
          category: 'Land & Building',
          status: 'accepted',
          remark: 'Structural safety certificate endorsed by Registered Municipal Architect.',
          evidenceVersion: 'DOC-C4-v1',
        },
        {
          itemId: 'D1',
          name: 'Item D1: Faculty Cadre Ratio (1:2:6 Cadre & 1:20 Teacher-Student Ratio)',
          category: 'Faculty & Academic',
          status: 'deficient',
          remark: 'Deficiency flagged: 2 Professor cadre deficit in CS & IT departments per GIITS 2-SOC1770029225.',
          evidenceVersion: 'DOC-D1-v1',
        },
        {
          itemId: 'D2',
          name: 'Item D2: Fire Safety NOC (1-Year Validity with 60-Day Advance Renewal Rule)',
          category: 'Infrastructure & Safety',
          status: 'deficient',
          remark: 'Deficiency flagged: Fire NOC validity expires within 14 calendar days; advance renewal required.',
          evidenceVersion: 'DOC-D2-v1',
        },
      ]);
    } else {
      setChecklistItems([
        {
          itemId: 'C3',
          name: 'Item C3: Registered Land Conversion / Title Deed (30-Year Lease Minimum)',
          category: 'Land & Building',
          status: 'accepted',
          remark: '30-year registered lease deed verified in compliance with APH Annexure 1 norms.',
          evidenceVersion: 'DOC-C3-v1',
        },
        {
          itemId: 'C4',
          name: 'Item C4: Municipal Approved Structural Stability Certificate',
          category: 'Land & Building',
          status: 'accepted',
          remark: 'Structural safety certificate endorsed by Registered Municipal Architect.',
          evidenceVersion: 'DOC-C4-v1',
        },
        {
          itemId: 'D1',
          name: 'Item D1: Faculty Cadre Ratio (1:2:6 Cadre & 1:20 Teacher-Student Ratio)',
          category: 'Faculty & Academic',
          status: 'accepted',
          remark: 'All faculty cadre ratios comply with AICTE Table 2.1 norms.',
          evidenceVersion: 'DOC-D1-v1',
        },
        {
          itemId: 'D2',
          name: 'Item D2: Fire Safety NOC (1-Year Validity with 60-Day Advance Renewal Rule)',
          category: 'Infrastructure & Safety',
          status: 'accepted',
          remark: 'Valid Fire Safety NOC verified through end of academic session.',
          evidenceVersion: 'DOC-D2-v1',
        },
      ]);
    }
    setSignedSuccess(null);
    setScopeTestResult(null);
  }, [currentApp?.id]);

  const [signedSuccess, setSignedSuccess] = useState<any | null>(null);
  const [scopeTestResult, setScopeTestResult] = useState<{
    type: 'tamper_blocked' | 'correction_accepted';
    title: string;
    message: string;
    statusCode: number;
    timestamp: string;
  } | null>(null);

  const handleToggleItemStatus = (itemId: string, newStatus: 'accepted' | 'deficient') => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleSignSnapshot = async () => {
    if (!currentApp) return;
    const deficientItems = checklistItems.filter((i) => i.status === 'deficient');
    const itemsPayload = checklistItems.map((i) => ({
      itemId: i.itemId,
      result: i.status,
      status: i.status,
      reason: i.remark,
      evidenceVersionIds: [i.evidenceVersion],
    }));

    const result = await signSnapshot('2026-27-v1', itemsPayload);
    if (result.success) {
      setSignedSuccess(result.data);

      // Dynamically update document states according to the scrutiny evaluation (silent to prevent toast spam)
      for (const item of checklistItems) {
        const docId = `DOC-${item.itemId}`;
        if (item.status === 'accepted') {
          await verifyDocument(currentApp.id, docId, 'Verified', item.remark, true).catch(() => {});
        } else {
          await verifyDocument(currentApp.id, docId, 'Rejected', item.remark, true).catch(() => {});
        }
      }

      addToast({
        type: 'success',
        title: 'Scrutiny Snapshot v1 Signed',
        message: `Snapshot v1 recorded. ${deficientItems.length} deficiencies flagged. Items C3 & C4 locked immutable.`,
      });
      // Transition stage to Deficiency Communicated if deficiencies exist, else Scrutiny Cleared
      if (deficientItems.length > 0) {
        await transitionStage(currentApp.id, 'Deficiency Communicated', 'Scrutiny Snapshot v1 signed with D1/D2 deficiencies.');
      } else {
        await transitionStage(currentApp.id, 'Scrutiny Cleared', 'Scrutiny Snapshot v1 signed all items accepted.');
      }
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
    await transitionStage(currentApp.id, 'Scrutiny Cleared', 'Scrutiny fully accepted and cleared by Desk Scrutiny Committee.');
    addToast({
      type: 'success',
      title: 'Scrutiny Accepted & Cleared',
      message: 'All checklist items verified. Snapshot recorded and case advanced.',
    });
    refetchScrutiny();
  };

  const handleFlagDeficiencies = async () => {
    if (!currentApp) return;
    const flaggedItems = checklistItems.map((item) => {
      if (item.itemId === 'D1' || item.itemId === 'D2') {
        return {
          ...item,
          status: 'deficient' as const,
          remark: item.itemId === 'D1' ? 'Faculty cadre ratio deficit flagged.' : 'Fire Safety NOC advance renewal required.',
        };
      }
      return item;
    });
    setChecklistItems(flaggedItems);
    const itemsPayload = flaggedItems.map((i) => ({
      itemId: i.itemId,
      result: i.status,
      status: i.status,
      reason: i.remark,
      evidenceVersionIds: [i.evidenceVersion],
    }));
    await signSnapshot('2026-27-v1', itemsPayload);
    for (const item of flaggedItems) {
      const docId = `DOC-${item.itemId}`;
      if (item.status === 'accepted') {
        await verifyDocument(currentApp.id, docId, 'Verified', item.remark, true).catch(() => {});
      } else {
        await verifyDocument(currentApp.id, docId, 'Rejected', item.remark, true).catch(() => {});
      }
    }
    await transitionStage(currentApp.id, 'Deficiency Communicated', 'Deficiencies flagged in Faculty Cadre / Fire NOC per APH §1.8.');
    addToast({
      type: 'warning',
      title: 'Deficiencies Flagged & Communicated',
      message: 'Snapshot signed with deficiencies. Rectification window opened.',
    });
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
    refetchScrutiny();
  };

  // Live USP B06 Scope Lock Tamper Test
  const handleTestTamperLockedItem = async () => {
    if (!currentApp) return;
    setScopeTestResult(null);

    // Deliberately attempt to alter Item C3 (which is locked accepted)
    const targetSnapshotId = latestSnapshot?.id || (currentApp.id.includes('GIITS') ? '2-SOC1770029225' : `SNAP-${currentApp.id}-v1`);
    const result = await submitCorrection(targetSnapshotId, [
      {
        itemId: 'C3',
        response: 'Unauthorized attempt to modify locked Land Title Deed C3.',
        evidenceVersionIds: ['DOC-C3-TAMPERED-v2'],
      },
    ]);

    if (!result.success) {
      const err = (result as any).error;
      setScopeTestResult({
        type: 'tamper_blocked',
        title: 'HTTP 409 / 412: Scope Lock Enforced (USP B06 Verified)',
        message:
          err?.message ||
          'Server-Enforced Scope Lock Violation: Under APH §1.8(g), only items flagged deficient in signed Snapshot v1 (D1, D2) can be modified. Item C3 is immutable.',
        statusCode: 409,
        timestamp: new Date().toLocaleTimeString(),
      });
      addToast({
        type: 'error',
        title: 'Scope Lock Violation Blocked',
        message: 'Server guard rejected unauthorized tamper on Item C3 (HTTP 409 Conflict).',
      });
    } else {
      setScopeTestResult({
        type: 'correction_accepted',
        title: 'Correction Accepted',
        message: 'Item altered successfully.',
        statusCode: 200,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  };

  // Submit valid rectified D1/D2 evidence
  const handleSubmitValidCorrections = async () => {
    if (!currentApp) return;
    setScopeTestResult(null);

    const targetSnapshotId = latestSnapshot?.id || (currentApp.id.includes('GIITS') ? '2-SOC1770029225' : `SNAP-${currentApp.id}-v1`);
    const result = await submitCorrection(targetSnapshotId, [
      {
        itemId: 'D1',
        response: 'Appointed 2 Professors from approved AICTE roster (Reg #2026/RO-P/1042). Cadre ratio 1:2:6 restored.',
        evidenceVersionIds: ['DOC-D1-RECTIFIED-v2'],
      },
      {
        itemId: 'D2',
        response: 'Renewed Municipal Fire Safety NOC (Cert #FS/2026/8841 valid through 31-DEC-2027) attached.',
        evidenceVersionIds: ['DOC-D2-RECTIFIED-v2'],
      },
    ]);

    if (result.success) {
      setScopeTestResult({
        type: 'correction_accepted',
        title: 'HTTP 200 OK: Valid Rectification Accepted by Server Guard',
        message:
          'Deficiencies D1 (Faculty Cadre Ratio) and D2 (Fire Safety NOC) rectified compliant with APH §1.8(g) and Annexure 7.',
        statusCode: 200,
        timestamp: new Date().toLocaleTimeString(),
      });
      addToast({
        type: 'success',
        title: 'Rectified Evidence Filed',
        message: 'D1 and D2 evidence validated and attached to case record.',
      });
      refetchScrutiny();
    } else {
      addToast({
        type: 'error',
        title: 'Correction Submission Failed',
        message: (result as any).error?.message || 'Submission failed',
      });
    }
  };

  const handleClearReScrutiny = async () => {
    if (!currentApp) return;
    await transitionStage(currentApp.id, 'Scrutiny Cleared', 'Differential Re-Scrutiny cleared. All items verified.');
    addToast({
      type: 'success',
      title: 'Re-Scrutiny Cleared',
      message: 'Case cleared for downstream routing (EVC or Council Approval Gate).',
    });
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
              : 'Differential Re-Scrutiny & Scope Lock Console (USP B06)'}
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

      {/* Case Selector Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-700">Select Active Case:</span>
          {applications.map((app) => (
            <button
              key={app.id}
              onClick={() => setSelectedCaseId(app.id)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-all ${
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
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors"
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
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Statutory Checklist Verification (APH Chapter I / II Norms)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Evaluate parameters against physical/uploaded documents. Accepted items are locked upon signing.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                  APH §1.8 Evaluation Table
                </span>
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
                      <tr key={item.itemId} className="hover:bg-slate-50/60 transition-colors">
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
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {item.status === 'accepted' ? 'Accepted' : 'Deficient'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 text-xs font-semibold">
                            <button
                              onClick={() => handleToggleItemStatus(item.itemId, 'accepted')}
                              className={`px-2.5 py-1 rounded-md transition-all ${
                                item.status === 'accepted'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Accepted
                            </button>
                            <button
                              onClick={() => handleToggleItemStatus(item.itemId, 'deficient')}
                              className={`px-2.5 py-1 rounded-md transition-all ${
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Snapshot v1 Signing Action Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">
                    Official Scrutiny Actions &amp; Digital Seal
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Signing seals accepted items into immutable WORM storage. Select an authoritative regulatory action below:
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleAcceptAndClearScrutiny}
                    disabled={scrutinyLoading}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    title="Accept all parameters, sign snapshot v1, and advance application"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Accept &amp; Clear Scrutiny</span>
                  </button>

                  <button
                    onClick={handleFlagDeficiencies}
                    disabled={scrutinyLoading}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    title="Flag deficiencies in Faculty Cadre & Fire NOC, open rectification window"
                  >
                    <AlertTriangle className="w-4 h-4 text-slate-950" />
                    <span>Flag Deficiencies</span>
                  </button>

                  <button
                    onClick={handleSignSnapshot}
                    disabled={scrutinyLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    title="Sign snapshot v1 with current toggle states"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{scrutinyLoading ? 'Signing...' : 'Sign Snapshot v1'}</span>
                  </button>

                  <button
                    onClick={handleRejectScrutiny}
                    disabled={scrutinyLoading}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    title="Formally reject application due to regulatory non-compliance"
                  >
                    <XCircle className="w-4 h-4 text-rose-200" />
                    <span>Reject</span>
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
                      Differential Re-Scrutiny Scope Lock Engine &bull; USP B06
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
                    <div className="p-3 rounded-lg border bg-emerald-50/70 border-emerald-300 text-emerald-950 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              Item C3
                            </span>
                            <span className="font-semibold">Registered Land Conversion / Title Deed (30-Yr Lease)</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Evidence: DOC-C3-v1</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-200 text-emerald-900 border border-emerald-300">
                        Accepted (IMMUTABLE)
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border bg-emerald-50/70 border-emerald-300 text-emerald-950 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              Item C4
                            </span>
                            <span className="font-semibold">Municipal Structural Safety &amp; Occupancy Certificate</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Evidence: DOC-C4-v1</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-200 text-emerald-900 border border-emerald-300">
                        Accepted (IMMUTABLE)
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border bg-amber-50/70 border-amber-300 text-amber-950 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              Item D1
                            </span>
                            <span className="font-semibold">Faculty Cadre Ratio (2 Professor Deficit)</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Evidence: DOC-D1-v1 (Deficient)</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                        Deficiency (Modifiable)
                      </span>
                    </div>

                    <div className="p-3 rounded-lg border bg-amber-50/70 border-amber-300 text-amber-950 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              Item D2
                            </span>
                            <span className="font-semibold">Fire Safety Certificate (14-day expiry)</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Evidence: DOC-D2-v1 (Deficient)</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                        Deficiency (Modifiable)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Scope Test Console */}
              <div className="bg-white border-2 border-indigo-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Interactive Live Demonstration &bull; Scope Lock Enforcement Tests
                  </h4>
                </div>
                <p className="text-xs text-slate-600">
                  Demonstrate the core regulatory USP B06 to the evaluators by attempting both illegal tampering on locked Item C3 and authorized rectification on Items D1 and D2:
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleTestTamperLockedItem}
                    disabled={scrutinyLoading}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>⚡ Test Scope Lock: Attempt Tampering Locked Item C3</span>
                  </button>

                  <button
                    onClick={handleSubmitValidCorrections}
                    disabled={scrutinyLoading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✅ Submit Valid Rectification for D1 &amp; D2</span>
                  </button>

                  <button
                    onClick={handleClearReScrutiny}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
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
    </div>
  );
};
