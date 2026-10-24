import React from 'react';
import {
  Users,
  ShieldCheck,
  CheckCircle2,
  Award,
  FileCheck2,
  Calendar,
  Building,
  Lock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface ScrutinyRosterDeclarationViewProps {
  onNavigateToScrutiny: () => void;
}

export const ScrutinyRosterDeclarationView: React.FC<ScrutinyRosterDeclarationViewProps> = ({
  onNavigateToScrutiny,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0A2540] via-[#102A43] to-[#1E3A8A] text-white p-6 rounded-2xl shadow-md border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded shadow-xs">
                AICTE Act §11(2) & APH §1.8(a)-(b)
              </span>
              <span className="text-xs text-blue-200 font-semibold">
                Expert Committee Constitution
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Desk Scrutiny Committee Cell Roster & Non-Conflict Affirmations
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Autonomous expert panels constituted under AICTE web-portal automated selection. Experts evaluate submitted checklists, execute ScrutinySnapshot v1, and maintain digital declarations.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shrink-0 text-right">
            <span className="text-[11px] text-slate-300 block uppercase font-medium">Assigned Panel ID</span>
            <span className="font-mono text-sm font-bold text-amber-300 block mt-0.5">
              2-SOC1770029225
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold block mt-0.5 flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Declarations Sealed</span>
            </span>
          </div>
        </div>
      </div>

      {/* Statutory Mandate Info Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Statutory Non-Conflict of Interest Affirmation (APH §1.8(b))
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>DSC Sealed on Server</span>
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
          <p className="font-semibold text-slate-900">
            Mandatory Statutory Declaration Form 2A (Affirmed by each committee expert prior to dossier access):
          </p>
          <p className="italic text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
            &ldquo;I hereby solemnly affirm that I do not have any direct or indirect commercial, advisory, administrative, or personal conflict of interest with the institutions assigned to this scrutiny panel. I have neither served as consultant, member of the Governing Body, nor received honorarium from the applicant trust within the preceding 3 academic sessions. All evaluations shall adhere strictly to AICTE Approval Process Handbook (APH 2024–27 & 2026–27 Errata).&rdquo;
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500 font-mono">
            <span>Cryptographic Nonce: 0x9f8b417c...4a29</span>
            <span>Recorded in WORM HMAC Ledger: 24-Oct-2026 09:30 IST</span>
          </div>
        </div>
      </div>

      {/* Committee Composition Panel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Panel Members Constituted per APH §1.8(a) (Existing Institution Scrutiny)</span>
          </h3>
          <span className="text-xs text-slate-500">Quorum: 2/2 Experts Present</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Expert 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                EXP-ACAD-MPS
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Affirmed
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Prof. Maheshwari Prasad Singh</h4>
              <p className="text-xs text-slate-600 mt-0.5">Professor (Computer Science & Engg)</p>
              <p className="text-xs font-medium text-slate-500 mt-1">
                National Institute of Technology (NIT) Patna
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p>Role: <strong>Senior Academic Expert (NIT/IIT)</strong></p>
              <p>Declaration: <strong className="text-emerald-700">Signed 04-Feb-2026</strong></p>
            </div>
          </div>

          {/* Expert 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                EXP-ACAD-RK
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Affirmed
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Prof. Rakesh Kumar</h4>
              <p className="text-xs text-slate-600 mt-0.5">Professor & Dean of Engineering</p>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Central University of Haryana
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p>Role: <strong>Academic Expert (NIT/IIT)</strong></p>
              <p>Declaration: <strong className="text-emerald-700">Signed 04-Feb-2026</strong></p>
            </div>
          </div>

          {/* Expert 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                EXP-ARCH-01
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Affirmed
              </span>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Dr. B. B. Ahuja / Arch. Md. Danish</h4>
              <p className="text-xs text-slate-600 mt-0.5">Council of Architecture (COA) Registered</p>
              <p className="text-xs font-medium text-slate-500 mt-1">
                COA Reg: CA/2014/61201
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
              <p>Role: <strong>Architect Expert (COA Def. 11)</strong></p>
              <p>Declaration: <strong className="text-emerald-700">Signed 04-Feb-2026</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
            Ready to perform desk review on active applications?
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Proceed to the Checklist Evaluation console to examine documents and sign ScrutinySnapshot v1.
          </p>
        </div>
        <button
          onClick={onNavigateToScrutiny}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <span>Open Scrutiny Evaluation Console</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
