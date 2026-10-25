import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Application } from '../../types';
import { formatDateIndian } from '../../utils/slaCalculator';
import {
  Award,
  Shield,
  CheckCircle2,
  FileCheck,
  Send,
  AlertTriangle,
  FileText,
  Building,
  Calendar,
  Lock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  Clock,
  Printer
} from 'lucide-react';

interface CompetentAuthorityDecisionViewProps {
  onSelectApplication: (appId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const CompetentAuthorityDecisionView: React.FC<CompetentAuthorityDecisionViewProps> = ({
  onSelectApplication,
  onNavigateTab
}) => {
  const { applications, transitionStage, addToast, auditLog } = useApp();

  // Candidate cases for Council Statutory Decision (all 5 canonical colleges accessible)
  const candidateCases = applications.filter(
    (a) =>
      a.currentStage === 'Scrutiny Cleared' ||
      a.currentStage === 'EVC Inspection Completed' ||
      a.currentStage === 'Executive Committee Approval' ||
      a.currentStage === 'Deficiency Communicated' ||
      a.currentStage === 'Scrutiny in Progress' ||
      a.currentStage === 'Approval Issued'
  );
  const decisionCases = candidateCases.length > 0 ? candidateCases : applications;

  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    decisionCases.find((c) => c.applicationNumber === '1-43657568230')?.id ||
    decisionCases[0]?.id ||
    applications[0]?.id
  );

  const activeCase = applications.find((a) => a.id === selectedCaseId) || applications[0];

  const [decisionMode, setDecisionMode] = useState<'approve' | 'conditional' | 'reject'>('approve');
  const [decisionReason, setDecisionReason] = useState(
    'Resolved: Approved under APH 2026–27 §1.10. Desk Scrutiny verified without deficiencies. EVC exempt per APH Errata G02 p. 42 (NBA Tier-1 valid till 2028). 15-day university/DTE deemed concurrence expired without objection.'
  );
  const [conditions, setConditions] = useState<{ id: string; label: string; checked: boolean; statutoryRef: string }[]>([
    {
      id: 'cond-lease',
      label: 'Submit 30-Year Registered Land Lease Renewal proof 60 days before November 2026 expiry',
      checked: true,
      statutoryRef: 'APH §2.1(e)'
    },
    {
      id: 'cond-fire',
      label: 'Upload annual Municipal Fire NOC renewal endorsement receipt',
      checked: true,
      statutoryRef: 'APH §2.25(f)'
    },
    {
      id: 'cond-cadre',
      label: 'Maintain Cadre Ratio (1:2:6 Professor/Assoc/Asst) verified through annual AISHE filing',
      checked: true,
      statutoryRef: 'APH §2.6'
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedOrder, setIssuedOrder] = useState<{
    orderNumber: string;
    caseNumber: string;
    institution: string;
    issuedAt: string;
    intakeApproved: number;
    obligationsSpawned: number;
  } | null>(null);

  const toggleCondition = (id: string) => {
    setConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

  const handleExecuteDecision = async () => {
    if (!activeCase) return;
    setIsSubmitting(true);
    try {
      // 1. Transition case to Approval Issued or Application Rejected
      await transitionStage(
        activeCase.id,
        decisionMode === 'reject' ? 'Application Rejected' : 'Approval Issued',
        `Council Statutory Order: ${decisionMode === 'approve' ? 'Unconditional EoA' : decisionMode === 'conditional' ? 'Conditional EoA' : 'Rejected'}. ${decisionReason}`
      );

      // 2. Trigger simulated Siebel write-back
      try {
        await fetch('/api/v1/adapter/siebel-writeback/' + activeCase.id, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentStage: 'Approval Issued' })
        });
      } catch {
        // optional companion writeback
      }

      const orderRef = `AICTE/${activeCase.region.toUpperCase().slice(0, 4)}/${activeCase.applicationNumber}/EOA-2026-27`;
      setIssuedOrder({
        orderNumber: orderRef,
        caseNumber: activeCase.applicationNumber,
        institution: activeCase.institutionName,
        issuedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        intakeApproved: activeCase.proposedIntake,
        obligationsSpawned: conditions.filter((c) => c.checked).length
      });

      addToast({
        type: 'success',
        title: 'Statutory Approval Order Issued',
        message: `Order ${orderRef} digitally signed. Post-approval obligations spawned & Siebel write-back dispatched.`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Decision Execution Failed',
        message: err.message || 'Error recording statutory decision.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statutory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Council Executive Committee Gate
            </span>
            <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-semibold">
              APH 2026–27 §1.10
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Competent Authority Statutory Decision Gate
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Human-Only Adjudication Enforced &bull; No Automated Algorithmic Approval Permitted by Council Statute
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            Human Authority Signature Required
          </span>
        </div>
      </div>

      {/* Success Banner if Order Issued */}
      {issuedOrder && (
        <div className="bg-emerald-950 text-white rounded-2xl p-6 border border-emerald-700/80 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/40 text-emerald-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Statutory Order Digitally Executed &bull; WORM Stored
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{issuedOrder.orderNumber}</h3>
                <p className="text-xs text-emerald-200 mt-1">
                  Extension of Approval (EoA) for AY 2026–27 granted to <strong>{issuedOrder.institution}</strong>.
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Order</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-emerald-800/60">
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Sanctioned Intake</span>
              <span className="text-base font-bold text-white mt-0.5 block">{issuedOrder.intakeApproved} Seats</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Obligations Spawned</span>
              <span className="text-base font-bold text-white mt-0.5 block">{issuedOrder.obligationsSpawned} Active Trackers</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-emerald-300 uppercase block font-semibold">Siebel Write-Back</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">Dispatched &bull; HTTP 200</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <span className="text-[10px] text-emerald-300 uppercase block font-semibold">6-Agency Concurrence</span>
              <span className="text-base font-bold text-white mt-0.5 block">State DTE & University</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Split Layout: Left Select Case / Right Decision Gate */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Eligible Case Selector */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Cases Awaiting Statutory Decision ({decisionCases.length})
            </h3>
            <span className="text-[11px] text-blue-700 font-semibold">Select Target Case</span>
          </div>

          <div className="space-y-2.5">
            {decisionCases.map((app) => {
              const isSelected = app.id === selectedCaseId;
              const isCOEP = app.id === 'APP-2026-COEP';
              const isGIITS = app.id === 'APP-2026-GIITS';

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedCaseId(app.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {app.applicationNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        app.currentStage === 'Approval Issued'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : isCOEP
                          ? 'bg-purple-100 text-purple-800 border-purple-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {app.currentStage}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 leading-tight">
                    {app.institutionName}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {app.program} &bull; {app.proposedIntake} Intake &bull; {app.region} Region
                  </p>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                    <span className="text-slate-600 font-medium">
                      {isCOEP ? '⚡ NBA Fast-Track (EVC Bypassed)' : isGIITS ? '🔍 Scrutiny + EVC Path' : '📜 Standard Self-Disclosure'}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Statutory Adjudication Chamber */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          {activeCase ? (
            <>
              {/* Dossier Clearance Provenance Ribbon */}
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    Dossier Review: {activeCase.applicationNumber}
                  </span>
                  <button
                    onClick={() => onSelectApplication(activeCase.id)}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Full Dossier</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {activeCase.institutionName}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proposed Course: <strong>{activeCase.program}</strong> &bull; Intake: <strong>{activeCase.proposedIntake} Seats</strong> &bull; Route: <strong>{activeCase.routeType}</strong>
                </p>
              </div>

              {/* Statutory Clearance Provenance Checklist (APH Domains A to E) */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Statutory Clearance Provenance (Prerequisites Met)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between text-emerald-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        Desk Scrutiny
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-200/60 px-1 rounded">Roster 2-SOC</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-snug">
                      Snapshot v1 digitally signed. Land C3, Occupancy C4 sealed immutable.
                    </p>
                  </div>

                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between text-emerald-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        EVC Committee
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-200/60 px-1 rounded">
                        {activeCase.id === 'APP-2026-COEP' ? 'NBA Exempt' : 'Recommended'}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-snug">
                      {activeCase.id === 'APP-2026-COEP'
                        ? 'Bypassed per APH Errata G02 p. 42 (NBA Tier-1 valid till 2028).'
                        : 'Panel inspection completed. Scores: 90% Infra, 88% Faculty, 92% Labs.'}
                    </p>
                  </div>

                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between text-emerald-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        Inter-Agency Concurrence
                      </span>
                      <span className="text-[10px] font-mono bg-emerald-200/60 px-1 rounded">15-Day SLA</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-snug">
                      State DTE & University deemed concurrence elapsed without objection.
                    </p>
                  </div>
                </div>
              </div>

              {/* Statutory Decision Radio */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Statutory Determination & Mode
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'approve', label: 'Grant Full EoA', desc: 'All statutory norms fulfilled' },
                    { id: 'conditional', label: 'Conditional EoA', desc: 'Subject to tracked undertakings' },
                    { id: 'reject', label: 'Reject / Notice', desc: 'Severe unrectified deficiencies' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setDecisionMode(mode.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        decisionMode === mode.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <div className="text-xs">{mode.label}</div>
                      <div className={`text-[10px] mt-0.5 ${decisionMode === mode.id ? 'text-blue-100' : 'text-slate-500'}`}>
                        {mode.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Statutory Order Reason */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Official Statutory Reason (Recorded in WORM Gazette Ledger)
                </label>
                <textarea
                  rows={2}
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Tracked Statutory Conditions to Atomically Spawn */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Post-Approval Obligations to Atomically Spawn (Domain D & E)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {conditions.filter((c) => c.checked).length} Trackers Active
                  </span>
                </div>

                <div className="space-y-2">
                  {conditions.map((cond) => (
                    <label
                      key={cond.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={cond.checked}
                        onChange={() => toggleCondition(cond.id)}
                        className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{cond.label}</span>
                          <span className="font-mono text-[10px] text-blue-700 font-bold ml-2 shrink-0">
                            {cond.statutoryRef}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500">
                  Authority: <strong>Prof. T. G. Sitharam (Chairman, AICTE)</strong>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting || activeCase.currentStage === 'Approval Issued'}
                  onClick={handleExecuteDecision}
                  className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all ${
                    activeCase.currentStage === 'Approval Issued'
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-700 active:scale-98'
                  } ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                >
                  <Award className="w-4 h-4" />
                  <span>
                    {activeCase.currentStage === 'Approval Issued'
                      ? 'Approval Already Issued'
                      : isSubmitting
                      ? 'Executing Statutory Order...'
                      : '⚡ Issue Official Approval Order (Execute Statutory Decision)'}
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select a case from the left panel to review and execute statutory decision.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
