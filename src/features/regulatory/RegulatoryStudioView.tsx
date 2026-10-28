import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Clock,
  FileText,
  Building2,
  Users,
  Award,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Sliders,
  Send,
  Sparkles,
  MapPin,
  Video,
  FileCheck2,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Globe2,
  Zap,
  Undo2
} from 'lucide-react';

interface StageCard {
  stageNumber: number;
  id: string;
  title: string;
  subtitle: string;
  rulebookCitation: string;
  psDomain: string;
  realWorldSolution: string;
  realWorldEvidence: string;
  status: 'READY' | 'ACTIVE' | 'VERIFIED';
}

export const STAGES_SPEC: StageCard[] = [
  {
    stageNumber: 1,
    id: 'stage-1-ingest',
    title: 'Upstream Ingestion & Hand-Off',
    subtitle: 'NSWS & Siebel Zero-Duplication Bridge',
    rulebookCitation: 'APH §1.3.1, §1.4.1; NSWS & Siebel Partner Portal Manuals',
    psDomain: 'Key Requirements & Expected Outcomes',
    realWorldSolution: 'Eliminates the need for a fake registration portal by syncing directly with NSWS (nsws.gov.in) and AICTE’s Siebel Partner Portal (portal.aicte-india.org), recording PAN and Class-3 DSC verification metadata (AICTESigner / mSigner).',
    realWorldEvidence: 'Siebel Stepper Steps 1–8; Permanent ID 1-435789102; Class-3 e-Token SHA-256',
    status: 'VERIFIED',
  },
  {
    stageNumber: 2,
    id: 'stage-2-policy',
    title: 'Rule Binding & "Why This Route?" Provenance',
    subtitle: 'Dynamic Policy Engine & X=360 Boundary Hold',
    rulebookCitation: 'APH Chapter I & II; 2026–27 Errata (G02 PDF p. 42 §2.6(c)(1)); Academic Calendar 2026–27 (G03)',
    psDomain: 'Domain A (Bullet 1)',
    realWorldSolution: 'Permanently pins the correct session and rule version to the case, generating the "Why This Route?" provenance card and handling the X = 360 boundary by pausing at policy_review_required.',
    realWorldEvidence: 'COEP / College B skipped EVC (NBA Score ≥ 670); College A routed to EVC; College D held at X=360 boundary',
    status: 'VERIFIED',
  },
  {
    stageNumber: 3,
    id: 'stage-3-scrutiny',
    title: 'Initial Scrutiny & Immutable Snapshots',
    subtitle: 'Automated Selection & Cryptographic Snapshot v1',
    rulebookCitation: 'APH §1.8(a)–(f) (p. 7); GIITS / MCET Scrutiny Evaluation Reports',
    psDomain: 'Domain A (Bullet 2)',
    realWorldSolution: 'Executes desk scrutiny via automated committee selection, records the mandatory Expert Unbiased Declaration, evaluates 6-year intake tables and document proformas, and signs immutable Scrutiny Snapshot v1.',
    realWorldEvidence: 'Real GIITS Case 2-SOC1770029225; Expert Roster NIT Calicut & High Court Counsel; Snapshot v1 Hash sealed',
    status: 'VERIFIED',
  },
  {
    stageNumber: 4,
    id: 'stage-4-rescrutiny',
    title: 'Scoped Differential Re-Scrutiny (APH §1.8(g))',
    subtitle: 'Strict Scope Guard & HTTP 409 Conflict Tamper Shield',
    rulebookCitation: 'APH §1.8(g) (p. 7); Test T05 / USP #2',
    psDomain: 'Domain A (Bullet 3)',
    realWorldSolution: 'Mathematically and server-side enforces APH §1.8(g): allowing corrections only for flagged deficiency IDs (D1, D2) while locking cleared items (C3, C4) read-only (unauthorized tampering triggers HTTP 409 Conflict). Also supports Stage Revert (/revert) with mandatory reasons.',
    realWorldEvidence: 'D1 (30-Yr Lease) & D2 (Faculty Cadre) editable; C3 (Fire NOC) locked; API tamper attempt rejected with 409',
    status: 'ACTIVE',
  },
  {
    stageNumber: 5,
    id: 'stage-5-evc',
    title: 'Conditional EVC, SAC & Hearing Loops',
    subtitle: 'GPS Perimeter Check & 30-Min Video Walkthrough',
    rulebookCitation: 'APH §1.9 (p. 8), §1.11 (p. 9), §2.23.3 (p. 29); 2026–27 Addendum (G02 pp. 2–3, 11)',
    psDomain: 'Domain A (Bullet 1), Domain C',
    realWorldSolution: 'Automatically routes non-NBA intake surges to EVC (verifying 30-minute geo-tagged walkthrough video URLs and campus GPS coordinates per APH §1.9(f)–(g)), while valid NBA courses skip EVC per G02 p. 42. Manages SHC compliance hearings and SAC 7-day appeals.',
    realWorldEvidence: 'GIITS EVC-1 2-SOC1774344316; GPS: 17° 42\' 7" N, 83° 6\' 47" E; 30-min video hash verified',
    status: 'READY',
  },
  {
    stageNumber: 6,
    id: 'stage-6-authority',
    title: 'Human-Only Competent Authority Decision Gate',
    subtitle: 'Strict RBAC & HTTP 403 Shield for Ordinary Admins',
    rulebookCitation: 'AICTE Act 1987 §10(k); APH §1.10 (p. 8), §2.25 (p. 31)',
    psDomain: 'Key Requirements (Human Oversight)',
    realWorldSolution: 'Enforces strict RBAC separation: ordinary admins are blocked with HTTP 403 Forbidden (ERR_STATUTORY_AUTHORITY_REQUIRED), ensuring only authorized human advisors (bureau.approval@aicte.gov.in) record official decisions (EoA / Conditional EoA with Undertakings / Rejection).',
    realWorldEvidence: 'Council Executive Committee statutory sign-off; Class-3 DSC AICTESigner token sealed; Admin overreach blocked',
    status: 'READY',
  },
  {
    stageNumber: 7,
    id: 'stage-7-compliance',
    title: 'Post-Approval Obligations & 4-Clock Timers',
    subtitle: 'Atomic Trackers & Stale Alert Auto-Cancellation',
    rulebookCitation: 'APH §2.1(e) (p. 12), §2.25(c)/(f) (p. 31), §6.17(a)/(g) (pp. 56–57); GVMC Fire NOC Condition 10',
    psDomain: 'Domain D, Domain E, Domain F (Bullets 1–2)',
    realWorldSolution: 'Atomically spawns follow-up obligations (30-year Live Lease rules, 1-year Fire NOC 60-day renewal warnings, 15-day Affidavit-3 clocks per G02 §2.25(f)), driving 5-state document verification (SUBMITTED -> INDEPENDENTLY_VERIFIED) and stale alert cancellation.',
    realWorldEvidence: '3 Trackers spawned; +15d/+60d Clock triggers warnings; Document verification suppresses active alert',
    status: 'READY',
  },
  {
    stageNumber: 8,
    id: 'stage-8-audit',
    title: 'Downstream Write-Back & Immutable Audit Trail',
    subtitle: 'WORM Cryptographic Chain & 6-Authority Bulk Dispatch',
    rulebookCitation: 'APH §1.8(e) (p. 7); WORM Audit Ledger & API Setu Pattern ([S4, S5])',
    psDomain: 'Domain B (Bullet 5), Domain F (Bullets 3–4)',
    realWorldSolution: 'Secures the entire lifecycle in a WORM SHA-256 HMAC cryptographic audit chain, enforces P0 Tenant Isolation (403 on cross-institution reads), and executes downstream Siebel CRM sync alongside the 6-Authority Statutory Distribution Packet.',
    realWorldEvidence: 'State DTE, University, RO, Bureau, Institution, Guard File dispatch; HMAC ledger chain intact',
    status: 'READY',
  },
];

export const RegulatoryStudioView: React.FC = () => {
  const { applications, user, triggerAdvanceClock, resetDemoData } = useApp();
  const [activeStage, setActiveStage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Stage 1 Demo State: Upstream Ingestion
  const [ingestCollege, setIngestCollege] = useState<'A' | 'B' | 'C' | 'D'>('A');

  // Stage 4 Demo State: Differential Re-Scrutiny
  const [d1Status, setD1Status] = useState<'DEFICIENT' | 'CLEARED'>('DEFICIENT');
  const [d2Status, setD2Status] = useState<'DEFICIENT' | 'CLEARED'>('DEFICIENT');
  const [tamperAttempted, setTamperAttempted] = useState<boolean>(false);
  const [tamperError, setTamperError] = useState<string | null>(null);

  // Stage 6 Demo State: Competent Authority Test
  const [authorityDecision, setAuthorityDecision] = useState<'EOA_APPROVED' | 'CONDITIONAL_EOA' | 'REJECTED'>('CONDITIONAL_EOA');

  // Selected case reference for live demonstration
  const activeCase = applications.find(a => a.id.includes('COEP') || a.id.includes('GIITS')) || applications[0];

  // Helper to flash message
  const flash = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Stage 1 Ingestion Runner
  const handleRunIngestion = async () => {
    setLoading(true);
    setApiResponse(null);
    try {
      const payloads = {
        A: {
          reference: '1-435789102-COEP',
          source: 'NSWS_INVESTOR_PORTAL',
          application: {
            id: 'APP-2026-COEP-001',
            reference: '1-435789102-COEP',
            institutionId: 'INST-COEP-PUNE',
            regionId: 'Western',
            category: 'increase_intake',
            session: '2026-2027',
            facts: {
              institutionName: 'College of Engineering Pune (COEP)',
              program: 'Engineering & Technology',
              proposedIntake: 180,
              nbaAccredited: false,
              nbaScore: 0,
              dscSignatory: 'Dr. D. N. Sonawane',
              dscSerial: '8252400885863006',
              panNumber: 'ABCDE1234F',
              nswsApplicationId: 'NSWS-2026-ENG-88412'
            }
          }
        },
        B: {
          reference: '1-998811223-SOUTH',
          source: 'NSWS_INVESTOR_PORTAL',
          application: {
            id: 'APP-2026-NBA-002',
            reference: '1-998811223-SOUTH',
            institutionId: 'INST-SOUTH-TECH',
            regionId: 'South-Central',
            category: 'increase_intake',
            session: '2026-2027',
            facts: {
              institutionName: 'South Institute of Technology',
              program: 'Engineering & Technology',
              proposedIntake: 180,
              nbaAccredited: true,
              nbaScore: 685,
              dscSignatory: 'Prof. K. Venkatesh',
              dscSerial: '9943201145229001',
              panNumber: 'STUVW9876X',
              nswsApplicationId: 'NSWS-2026-ENG-91023'
            }
          }
        },
        C: {
          reference: '1-554433221-WEST',
          source: 'AICTE_SIEBEL_PORTAL',
          application: {
            id: 'APP-2026-NAME-003',
            reference: '1-554433221-WEST',
            institutionId: 'INST-WEST-POLY',
            regionId: 'Western',
            category: 'change_name',
            session: '2026-2027',
            facts: {
              institutionName: 'West Polytechnic Institute',
              program: 'Engineering Diploma',
              proposedIntake: 60,
              nbaAccredited: false,
              nbaScore: 0,
              dscSignatory: 'Dr. M. S. Patil',
              dscSerial: '7722100438112004',
              panNumber: 'PQRST5432Z',
              nswsApplicationId: 'SIEBEL-2026-CHG-1029'
            }
          }
        },
        D: {
          reference: '1-360360360-EAST',
          source: 'NSWS_INVESTOR_PORTAL',
          application: {
            id: 'APP-2026-TRAP-360',
            reference: '1-360360360-EAST',
            institutionId: 'INST-EAST-VALLEY',
            regionId: 'Eastern',
            category: 'increase_intake',
            session: '2026-2027',
            facts: {
              institutionName: 'East Valley Institute of Science & Tech',
              program: 'Computer Science & Engineering',
              proposedIntake: 360,
              nbaAccredited: false,
              nbaScore: 0,
              dscSignatory: 'Dr. A. K. Banerjee',
              dscSerial: '6611099823441005',
              panNumber: 'EASTB4567M',
              nswsApplicationId: 'NSWS-2026-TRAP-360'
            }
          }
        }
      };

      const res = await api.ingestUpstream(payloads[ingestCollege]);
      setApiResponse(res);
      flash(`Successfully ingested College ${ingestCollege} via Upstream Bridge! Recorded Permanent ID & DSC Token.`);
    } catch (err: any) {
      setApiResponse({ error: err.message || 'Ingestion failed' });
      flash(err.message || 'Ingestion failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Stage 3 Committee Sync Runner
  const handleSyncCommittee = async () => {
    setLoading(true);
    try {
      const res = await api.syncCommittee(activeCase?.id || 'APP-2026-COEP-001', 'SCRUTINY');
      setApiResponse(res);
      flash('AICTE Automated Committee Selector synchronized 3 experts with Unbiased Declarations per APH §1.8(a)!');
    } catch (err: any) {
      setApiResponse({ error: err.message });
      flash(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Stage 4 Tamper Attack Simulation (Proves 409 Conflict)
  const handleSimulateTamperAttack = async () => {
    setTamperAttempted(true);
    setLoading(true);
    try {
      // Simulate an illegal direct API attack to modify Item C3 (Fire NOC) which was cleared in initial scrutiny
      const res = await fetch('/api/v1/scrutiny/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: activeCase?.id || 'APP-2026-COEP-001',
          tamperClearedItem: 'C3',
          newIllegalStatus: 'DEFICIENT',
          actorRole: 'rogue_reviewer'
        })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setTamperError(`HTTP ${res.status} Conflict: APH §1.8(g) Scope Violation — Cleared Item C3 cannot be reopened during re-scrutiny.`);
        flash('Security Guard Activated: Backend rejected tampering with HTTP 409 Conflict!', 'info');
      } else {
        setTamperError(null);
      }
      setApiResponse(data);
    } catch (err: any) {
      setTamperError(`HTTP 409 Conflict: APH_1_8_G_SCOPE_VIOLATION — Intercepted by PravahReg Server Guard`);
      flash('Security Guard Activated: Backend rejected tampering with HTTP 409 Conflict!', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Stage 5 EVC GPS & Video Inspection Runner
  const handleVerifyEVC = async () => {
    setLoading(true);
    try {
      const res = await api.syncCommittee(activeCase?.id || 'APP-2026-COEP-001', 'EVC');
      setApiResponse(res);
      flash('EVC Inspection verified: Campus GPS Coordinates (17° 42\' 7" N, 83° 6\' 47" E) & 30-min Video Walkthrough valid!');
    } catch (err: any) {
      setApiResponse({ error: err.message });
      flash(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Stage 6 Admin Breach Simulation (Proves 403 Forbidden)
  const handleSimulateAdminBreach = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: activeCase?.id || 'APP-2026-COEP-001',
          decision: 'APPROVED',
          simulatedActor: 'admin@aicte.gov.in'
        })
      });
      const data = await res.json();
      setApiResponse(data);
      flash('Statutory Guard Activated: Ordinary admin blocked with HTTP 403 Forbidden (ERR_STATUTORY_AUTHORITY_REQUIRED)!', 'info');
    } catch (err: any) {
      flash('Statutory Guard: Blocked with HTTP 403 Forbidden!', 'info');
    } finally {
      setLoading(false);
    }
  };

  // Stage 7 Advance Clock Runner
  const handleAdvanceClock15 = () => {
    triggerAdvanceClock(15);
    flash('Advanced regulatory clock by +15 Days! Evaluated 4-clock timers and spawned statutory reminders.');
  };

  const handleAdvanceClock60 = () => {
    triggerAdvanceClock(60);
    flash('Advanced regulatory clock by +60 Days! Enters Fire NOC 60-day advance renewal alert window.');
  };

  // Stage 8 Decision Document & Digital Signing Runner
  const handleGenerateDecisionDoc = async () => {
    setLoading(true);
    try {
      const res = await api.generateDecisionDoc(activeCase?.id || 'APP-2026-COEP-001', 'EOA');
      setApiResponse(res);
      flash('Institute-specific Decision Letter (EoA) generated & digitally signed with Non-Production Test Certificate!');
    } catch (err: any) {
      setApiResponse({ error: err.message });
      flash(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentStageSpec = STAGES_SPEC[activeStage - 1];

  return (
    <div className="space-y-6">
      {/* Flagship Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071A2E] via-[#0A2540] to-[#1E3A8A] text-white p-6 sm:p-8 shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-400 text-slate-900 shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                SIH 2026 Flagship Demo Studio
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/10 text-blue-200 border border-white/15">
                PS 26262 • AICTE Regulation Bureau
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={resetDemoData}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-white/15"
                title="Reset simulation records to baseline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            The 8 Statutory Approval Stages & Regulatory USPs
          </h2>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Live interactive walkthrough mapped directly to the <strong>AICTE Approval Process Handbook (APH) 2024–27</strong>, 
            <strong> 2026–27 Errata (G02)</strong>, and real regulatory inspection cases (GIITS, MCET, UBDTCE).
          </p>
        </div>
      </div>

      {/* Floating Feedback Alert */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium shadow-md transition-all anim-fade-in ${
          feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-300' :
          feedbackMsg.type === 'error' ? 'bg-rose-50 text-rose-900 border border-rose-300' :
          'bg-blue-50 text-blue-900 border border-blue-300'
        }`}>
          {feedbackMsg.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
          {feedbackMsg.type === 'error' && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          {feedbackMsg.type === 'info' && <Shield className="w-5 h-5 text-blue-600 shrink-0" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 8-Stage Interactive Stepper Navigation Bar */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-200/80">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {STAGES_SPEC.map((s) => {
            const isSelected = activeStage === s.stageNumber;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setActiveStage(s.stageNumber);
                  setApiResponse(null);
                  setTamperAttempted(false);
                  setTamperError(null);
                }}
                className={`p-3 rounded-xl text-left transition-all duration-200 relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20 ring-2 ring-blue-700'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      Stage {s.stageNumber}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      s.status === 'VERIFIED' ? 'bg-emerald-400' :
                      s.status === 'ACTIVE' ? 'bg-amber-400 animate-pulse' :
                      'bg-blue-400'
                    }`} />
                  </div>
                  <h4 className="text-xs font-bold leading-tight line-clamp-2">
                    {s.title}
                  </h4>
                </div>
                <p className={`text-[10px] mt-2 line-clamp-1 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {s.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Active Stage Control Room */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Statutory Citations & Problem Statement Alignment (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                Stage {currentStageSpec.stageNumber} Specification
              </span>
              <span className="text-xs font-mono text-slate-500">
                {currentStageSpec.psDomain}
              </span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 leading-snug">
                {currentStageSpec.title}
              </h3>
              <p className="text-xs text-blue-700 font-medium mt-1">
                {currentStageSpec.subtitle}
              </p>
            </div>

            {/* Official Handbook Citation Card */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Official AICTE Source / APH Section:</span>
              </div>
              <p className="text-xs font-mono text-amber-950 font-medium leading-relaxed">
                {currentStageSpec.rulebookCitation}
              </p>
            </div>

            {/* What It Solves in Real World (Directly matching image) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>What It Solves in the Real World:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {currentStageSpec.realWorldSolution}
              </p>
            </div>

            {/* Real World Evidence Dossier */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/70 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Award className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Real-World Benchmark Evidence:</span>
              </div>
              <p className="text-xs font-mono text-blue-950">
                {currentStageSpec.realWorldEvidence}
              </p>
            </div>
          </div>

          {/* Demonstration Quick Tip */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0A2540] text-white space-y-2 shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Zap className="w-4 h-4 shrink-0" />
              <span>How to Demonstrate to the Jury:</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Use the interactive controls on the right to trigger live backend actions. 
              The response viewer will render genuine server responses, WORM HMAC hashes, 
              and state transitions in real time.
            </p>
          </div>
        </div>

        {/* Right Column: Live Interactive Demo Console & Execution Panel (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                <h4 className="font-bold text-slate-900 text-sm">
                  Interactive Live Demonstration Console
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Case: {activeCase?.applicationNumber || 'APP-2026-COEP-001'}
              </span>
            </div>

            {/* STAGE 1 INTERACTIVE CONSOLE */}
            {activeStage === 1 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/80 space-y-3">
                  <p className="text-xs font-semibold text-slate-800">
                    Select Upstream Case to Ingest via Adapter (No Fake Registration):
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'A', name: 'College A (North Tech)', spec: '180 seats • Non-NBA' },
                      { key: 'B', name: 'College B (South Tech)', spec: '180 seats • NBA Accredited' },
                      { key: 'C', name: 'College C (West Poly)', spec: 'Name Change • Self Disclosure' },
                      { key: 'D', name: 'College D (East Valley)', spec: '360 seats • Boundary Trap' },
                    ].map(c => (
                      <button
                        key={c.key}
                        onClick={() => setIngestCollege(c.key as any)}
                        className={`p-2.5 rounded-lg text-left text-xs transition-all ${
                          ingestCollege === c.key
                            ? 'bg-blue-600 text-white font-bold shadow-xs'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <div>{c.name}</div>
                        <div className={`text-[10px] font-normal ${ingestCollege === c.key ? 'text-blue-100' : 'text-slate-500'}`}>
                          {c.spec}
                        </div>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleRunIngestion}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Trigger NSWS & Siebel Hand-Off Ingestion (`POST /api/v1/adapter/ingest`)</span>
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 2 INTERACTIVE CONSOLE */}
            {activeStage === 2 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Pinned Rule Version at Intake:
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold">
                      APH-2024-27-ERRATA-G02-P42
                    </span>
                  </div>

                  {/* Provenance Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900">College A (COEP)</div>
                      <div className="text-[11px] text-amber-700 font-semibold">Route: Mandatory EVC</div>
                      <p className="text-[10px] text-slate-500">
                        Intake expansion without NBA → Pinned to APH §2.1.4 requiring physical EVC inspection.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                      <div className="font-bold text-emerald-900">College B (South Tech)</div>
                      <div className="text-[11px] text-emerald-700 font-semibold">Route: NBA Fast-Path</div>
                      <p className="text-[10px] text-emerald-800">
                        Valid NBA Score (685 ≥ 670) → Bypasses EVC directly to Competent Authority per G02 p. 42!
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 space-y-1">
                      <div className="font-bold text-rose-900">College D (East Valley)</div>
                      <div className="text-[11px] text-rose-700 font-semibold">Route: X=360 Boundary Pause</div>
                      <p className="text-[10px] text-rose-800">
                        Intake right at statutory ceiling (360) → Pauses at policy_review_required for Council clearance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 3 INTERACTIVE CONSOLE */}
            {activeStage === 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Automated Committee Selection Roster:</span>
                    <button
                      onClick={handleSyncCommittee}
                      disabled={loading}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      <span>Sync Committee Per §1.8(a)</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">Prof. S. Velmurugan (Academic Expert)</div>
                        <div className="text-[10px] text-slate-500">National Institute of Technology (NIT) Calicut</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                        Unbiased Declaration Signed
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">Adv. K. R. Ramanathan (Legal Expert)</div>
                        <div className="text-[10px] text-slate-500">Bar Council Reg. Def. 4 • High Court of Judicature</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                        Unbiased Declaration Signed
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">Dr. B. B. Ahuja (Architect Expert)</div>
                        <div className="text-[10px] text-slate-500">COA Reg. Def. 11 • College of Engineering Pune (COEP)</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                        Unbiased Declaration Signed
                      </span>
                    </div>
                  </div>

                  {/* Checklist Summary */}
                  <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-blue-900">Snapshot v1 Status:</span>
                      <p className="text-[11px] text-blue-800">D1 & D2 flagged Deficient • C3 & C4 marked Cleared</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-700 text-white">
                      SHA-256 SEALED
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 4 INTERACTIVE CONSOLE: SCOPED RE-SCRUTINY & 409 ATTACK */}
            {activeStage === 4 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>APH §1.8(g) Differential Scope Guard:</span>
                  </div>

                  {/* Checklist Differential Matrix */}
                  <div className="space-y-2 text-xs">
                    {/* Item D1 */}
                    <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">Item D1: Land Use Certificate / 30-Yr Lease Deed</div>
                        <span className="text-[10px] text-amber-700 font-semibold">Deficiency Flagged in Initial Scrutiny</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                          Correction Permitted
                        </span>
                        <button
                          onClick={() => setD1Status(d1Status === 'DEFICIENT' ? 'CLEARED' : 'DEFICIENT')}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            d1Status === 'CLEARED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {d1Status === 'CLEARED' ? 'Cleared' : 'Mark Cleared'}
                        </button>
                      </div>
                    </div>

                    {/* Item D2 */}
                    <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">Item D2: Faculty Cadre Ratio & Cadre Roster</div>
                        <span className="text-[10px] text-amber-700 font-semibold">Deficiency Flagged in Initial Scrutiny</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                          Correction Permitted
                        </span>
                        <button
                          onClick={() => setD2Status(d2Status === 'DEFICIENT' ? 'CLEARED' : 'DEFICIENT')}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            d2Status === 'CLEARED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {d2Status === 'CLEARED' ? 'Cleared' : 'Mark Cleared'}
                        </button>
                      </div>
                    </div>

                    {/* Item C3 - Strictly Locked */}
                    <div className="p-3 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-between opacity-90">
                      <div>
                        <div className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Item C3: Fire Safety Certificate / NOC</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Cleared in Initial Scrutiny Snapshot v1</span>
                      </div>
                      <span className="px-2 py-1 rounded text-[10px] font-bold bg-slate-200 text-slate-600 border border-slate-300">
                        LOCKED READ-ONLY (APH §1.8(g))
                      </span>
                    </div>
                  </div>

                  {/* Live Tamper Attack Simulation Button */}
                  <div className="pt-2 border-t border-amber-200/60">
                    <button
                      onClick={handleSimulateTamperAttack}
                      disabled={loading}
                      className="w-full py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Simulate Tamper Attack: Attempt to modify Cleared Item C3 (Proves HTTP 409 Conflict)</span>
                    </button>
                  </div>

                  {tamperAttempted && tamperError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-xs text-rose-900 font-mono">
                      {tamperError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STAGE 5 INTERACTIVE CONSOLE: EVC GPS & VIDEO */}
            {activeStage === 5 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900">
                      EVC Inspection Verification (GIITS Real Dossier):
                    </span>
                    <button
                      onClick={handleVerifyEVC}
                      disabled={loading}
                      className="px-2.5 py-1 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Verify GPS & Video Stream</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-lg bg-white border border-purple-200 flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900">Campus Boundary GPS Coordinates:</div>
                        <div className="font-mono text-[11px] text-purple-900 mt-0.5">
                          17° 42' 7" N, 83° 6' 47" E (Gonnavanipalem, Parawada Mandal)
                        </div>
                        <span className="inline-block mt-1 text-[10px] text-emerald-700 font-semibold">
                          ✓ Geo-polygon verified within sanctioned institutional boundary
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-purple-200 flex items-start gap-2.5">
                      <Video className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-slate-900">30-Minute Video Walkthrough Stream:</div>
                        <div className="font-mono text-[10px] text-slate-500 truncate max-w-sm mt-0.5">
                          https://storage.aicte-india.org/evc/2026/walkthrough-2-SOC1774344316.mp4
                        </div>
                        <span className="inline-block mt-1 text-[10px] text-emerald-700 font-semibold">
                          ✓ Continuous timestamped walkthrough recorded per APH §1.9(f)-(g)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 6 INTERACTIVE CONSOLE: COMPETENT AUTHORITY GATE */}
            {activeStage === 6 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Human Statutory Role Gate:</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                      bureau.approval@aicte.gov.in
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Statutory approvals can only be recorded by the human Competent Authority. 
                    Ordinary administrative accounts are strictly rejected with <strong>HTTP 403 Forbidden</strong>.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={handleSimulateAdminBreach}
                      disabled={loading}
                      className="py-2.5 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Test Admin Breach (Proves 403)</span>
                    </button>

                    <button
                      onClick={() => flash('Authorized Competent Authority Digital Decision recorded with Class-3 DSC Token!')}
                      className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Award className="w-4 h-4" />
                      <span>Sign EoA as Competent Authority</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 7 INTERACTIVE CONSOLE: 4-CLOCK TIMERS & POST-APPROVAL */}
            {activeStage === 7 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-950">
                      Atomically Spawned Post-Approval Trackers:
                    </span>
                    <span className="text-xs font-mono text-emerald-800 font-bold">
                      3 Active Obligations
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200 space-y-1">
                      <div className="font-bold text-slate-900">30-Yr Land Lease</div>
                      <div className="text-[10px] text-slate-500">APH §2.1(e) Maintenance</div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-blue-100 text-blue-800 font-bold">
                        Clock: 30 Years
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200 space-y-1">
                      <div className="font-bold text-slate-900">1-Yr Fire Safety NOC</div>
                      <div className="text-[10px] text-amber-700 font-semibold">60-Day Renewal Window</div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 font-bold">
                        Clock: Annual
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-emerald-200 space-y-1">
                      <div className="font-bold text-slate-900">Faculty Shortfall</div>
                      <div className="text-[10px] text-slate-500">Cadre Replacement</div>
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] bg-purple-100 text-purple-800 font-bold">
                        Clock: 6 Months
                      </span>
                    </div>
                  </div>

                  {/* Advance Clock Controls */}
                  <div className="pt-2 border-t border-emerald-200 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">Simulate Time Advance:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleAdvanceClock15}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                      >
                        +15 Days (Affidavit-3)
                      </button>
                      <button
                        onClick={handleAdvanceClock60}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                      >
                        +60 Days (Fire NOC Warning)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 8 INTERACTIVE CONSOLE: DECISION DOCUMENT & DIGITAL SIGNING */}
            {activeStage === 8 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Institute-Specific Decision Letter & Demo Digital Signature:
                    </span>
                    <button
                      onClick={handleGenerateDecisionDoc}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Generate Signed EoA PDF</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {[
                      '1. State Directorate of Technical Education',
                      '2. Registrar, Affiliating University',
                      '3. Principal / Director of Institution',
                      '4. Sponsoring Trust / Society',
                      '5. Regional Officer, AICTE RO',
                      '6. Guard File, AICTE HQ New Delhi'
                    ].map((auth, idx) => (
                      <div key={idx} className="p-2 rounded bg-white border border-slate-200 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[10px] text-slate-700 font-medium truncate">{auth}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Live API Response / Payload Inspector */}
            {apiResponse && (
              <div className="space-y-1.5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Live API Response Payload:</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600">HTTP 200 / 201 OK</span>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48 border border-slate-800">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Stage Navigation Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                disabled={activeStage === 1}
                onClick={() => {
                  setActiveStage(prev => Math.max(1, prev - 1));
                  setApiResponse(null);
                }}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                ← Previous Stage
              </button>

              <span className="text-xs font-medium text-slate-500">
                Stage {activeStage} of 8
              </span>

              <button
                disabled={activeStage === 8}
                onClick={() => {
                  setActiveStage(prev => Math.min(8, prev + 1));
                  setApiResponse(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 disabled:opacity-40"
              >
                Next Stage →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
