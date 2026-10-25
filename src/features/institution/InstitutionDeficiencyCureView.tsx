import React, { useState } from 'react';
import { getSession } from '../../services/session';
import { useApp } from '../../context/AppContext';
import {
  FileWarning,
  CheckCircle2,
  Lock,
  Upload,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  Clock,
  Sparkles
} from 'lucide-react';

interface InstitutionDeficiencyCureViewProps {
  onSelectApplication: (appId: string) => void;
}

export const InstitutionDeficiencyCureView: React.FC<InstitutionDeficiencyCureViewProps> = ({
  onSelectApplication,
}) => {
  const { applications, verifyDocument, addToast } = useApp();
  const session = getSession();
  const actor = session?.actor;

  // Filter application for this logged-in institution
  const activeApp = applications.find((app) => {
    const actorId = actor?.id || '';
    const email = (actor as any)?.email || '';
    if (actorId === 'usr-inst-coep' || actorId === 'SYN-ACTOR-COEP' || email === 'principal@coep.ac.in') {
      return app.id.includes('COEP') || app.institutionCode === 'INST-SOUTH';
    }
    if (actorId === 'usr-inst-giits' || email === 'principal@giits.ac.in') {
      return app.id.includes('GIITS') || app.institutionCode === 'INST-NORTH';
    }
    if (actorId === 'usr-inst-apex' || email === 'principal@apex.ac.in') {
        return app.id.includes('APEX') || app.id.includes('Apex') || app.institutionCode === 'INST-APEX';
      }
      if (actorId === 'usr-inst-batu' || email === 'principal@batu.ac.in') {
        return app.id.includes('BATU') || app.institutionCode === 'INST-BATU';
      }
      if (actorId === 'usr-inst-pdimtr' || email === 'principal@pdimtr.ac.in') {
      return app.id.includes('PDIMTR') || app.institutionCode === 'INST-WEST';
    }
    if (actorId === 'usr-inst-evit' || email === 'principal@evit.ac.in') {
      return app.id.includes('EVIT') || app.institutionCode === 'INST-EAST';
    }
    if (actorId === 'usr-inst-vjti' || email === 'principal@vjti.ac.in') {
      return app.id.includes('VJTI') || app.institutionCode === 'INST-VJTI';
    }
    return true;
  }) || applications[0];

  const [cureInputs, setCureInputs] = useState<Record<string, string>>({});
  const [curingDocId, setCuringDocId] = useState<string | null>(null);

  if (!activeApp) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        No active institution application found.
      </div>
    );
  }

  const deficientDocs = activeApp.documents.filter(
    (d) => d.status === 'Needs Resubmission' || d.status === 'Rejected'
  );
  const clearedDocs = activeApp.documents.filter((d) => d.status === 'Verified');
  const pendingDocs = activeApp.documents.filter((d) => d.status === 'Pending Verification');

  const handleCureSubmit = async (docId: string, docName: string) => {
    const comment = cureInputs[docId]?.trim();
    if (!comment) {
      addToast({
        type: 'error',
        title: 'Rectification Detail Required',
        message: 'Provide an explanatory statement of how the deficiency was cured.'
      });
      return;
    }

    setCuringDocId(docId);
    try {
      await verifyDocument(activeApp.id, docId, 'Pending Verification', `Deficiency cured: ${comment}`);
      addToast({
        type: 'success',
        title: 'Deficiency Rectification Submitted',
        message: `${docName} resubmitted for Re-Scrutiny under APH §1.8(g).`
      });
      setCureInputs((prev) => ({ ...prev, [docId]: '' }));
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: e.message || 'Error recording rectification.'
      });
    } finally {
      setCuringDocId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0A2540] via-[#0B2C4C] to-[#123E6B] text-white p-6 rounded-2xl shadow-md border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded shadow-xs">
                APH §1.8(g) & Annexure 7
              </span>
              <span className="text-xs text-blue-200 font-semibold">
                Deficiency Cure Protocol
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white">
              Statutory Deficiency Rectification Window
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              When the Desk Scrutiny Committee flags documentary deficiencies, the institution is granted a strictly scoped cure window. Verified items remain locked to prevent arbitrary scope creep.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shrink-0 text-right">
            <span className="text-[11px] text-slate-300 block uppercase font-medium">Target Institution</span>
            <span className="text-xs font-bold text-white block mt-0.5 max-w-[200px] truncate">
              {activeApp.institutionName}
            </span>
            <span className="font-mono text-[10px] text-amber-300 block mt-0.5">
              App: {activeApp.applicationNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Scope Guard Explanation Pill */}
      <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl flex items-start gap-3 text-xs text-slate-700">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-950 block mb-0.5">
            Server-Enforced Scope Guard (APH Clause 1.8(g)):
          </strong>
          <p className="text-slate-600 leading-relaxed">
            Under statutory rules, re-scrutiny is legally confined to verifying only the deficiencies noted in the initial scrutiny report. The system prevents reviewers from reopening cleared items (C3/C4), and institutions can upload corrections strictly for flagged items.
          </p>
        </div>
      </div>

      {/* Main Content: Action Cards */}
      {deficientDocs.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Flagged Deficiencies Requiring Rectification ({deficientDocs.length})</span>
            </h3>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
              Action Mandatory
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {deficientDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border-2 border-amber-300/80 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {doc.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{doc.name}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Category: <strong>{doc.category}</strong> &bull; Original Upload: {doc.fileName} ({doc.fileSize})
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 self-start sm:self-auto">
                    Needs Rectification
                  </span>
                </div>

                {doc.rejectionReason && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-rose-700 block mb-1">
                      Scrutiny Committee Finding:
                    </span>
                    <p className="font-medium">{doc.rejectionReason}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Upload Rectified Document / Remediation Statement:
                  </label>
                  <textarea
                    rows={2}
                    value={cureInputs[doc.id] || ''}
                    onChange={(e) => setCureInputs({ ...cureInputs, [doc.id]: e.target.value })}
                    placeholder="E.g. Recruited 2 Senior Professors per AICTE Cadre Ratio Table 2.1; Form 16 and Board appointment orders uploaded..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => onSelectApplication(activeApp.id)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
                  >
                    View in Full Dossier
                  </button>
                  <button
                    onClick={() => handleCureSubmit(doc.id, doc.name)}
                    disabled={curingDocId === doc.id}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{curingDocId === doc.id ? 'Submitting...' : 'Submit Rectification'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-emerald-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {pendingDocs.length > 0
              ? 'Checklist Under Active Desk Scrutiny Review'
              : 'Zero Deficiencies Active'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {pendingDocs.length > 0
              ? 'Your uploaded documents are currently pending review by the Scrutiny Committee Cell. Deficiencies (if any) will be communicated here.'
              : 'All evaluated checklist items have been cleared and verified. No corrective uploads are required.'}
          </p>
          <button
            onClick={() => onSelectApplication(activeApp.id)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
          >
            <span>Open Application Dossier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Immutable / Cleared Section */}
      {clearedDocs.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Locked & Cleared Checklist Items ({clearedDocs.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {clearedDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] text-slate-700">{doc.id}</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[220px]">{doc.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Verified &bull; Snapshot v1 Immutable
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Locked</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
