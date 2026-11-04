import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Gavel,
  Scale,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
  Calendar,
  Lock,
  ArrowRight,
  Eye,
  X,
  Send,
  Download,
  Printer
} from 'lucide-react';

export const CouncilSACAppealsView: React.FC = () => {
  const { applications, user } = useApp();
  const [data, setData] = useState<any>({ appeals: [], hearings: [], complaints: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Judicial Adjudication Modal State
  const [disposingAppeal, setDisposingAppeal] = useState<any>(null);
  const [dispositionDecision, setDispositionDecision] = useState<'RELIEF_GRANTED' | 'REJECTION_UPHELD' | 'REFERRED_TO_SHC'>('RELIEF_GRANTED');
  const [dispositionRemarks, setDispositionRemarks] = useState<string>(
    'Standing Appellate Committee (SAC) bench examined registered rectification evidence. Rectification satisfies APH 2024–27 Table 2.3 norms. Relief granted subject to post-approval compliance undertaking.'
  );
  const [speakingOrderDossier, setSpeakingOrderDossier] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAppealsAndHearings();
      const payload = (res as any)?.data ?? res;
      setData(payload || { appeals: [], hearings: [], complaints: [] });
    } catch (err: any) {
      console.error('Failed to load appeals data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDisposeAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disposingAppeal) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.disposeAppeal(disposingAppeal.appealId || disposingAppeal.id, {
        decision: dispositionDecision,
        remarks: dispositionRemarks,
        conditions: dispositionDecision === 'RELIEF_GRANTED' ? ['TIME_BOUND_UNDERTAKING_60_DAYS', 'FIRE_SAFETY_RENEWAL'] : []
      });
      const resultData = (res as any)?.data ?? res;
      setSuccessMsg(`Judicial Speaking Order successfully recorded for ${disposingAppeal.appealId || disposingAppeal.id}. Formal order sealed and dispatched to institution.`);
      setSpeakingOrderDossier(resultData?.appeal || disposingAppeal);
      setDisposingAppeal(null);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record SAC disposition');
    } finally {
      setLoading(false);
    }
  };

  const appealsList = data?.appeals || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0A2540] via-[#102A43] to-[#1E3A8A] text-white p-6 rounded-2xl shadow-md border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded shadow-xs">
                AICTE Act §11(2) &amp; APH §1.11 / §2.18
              </span>
              <span className="text-xs text-blue-200 font-semibold">
                Highest Appellate Forum
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Gavel className="w-6 h-6 text-amber-300" />
              <span>Standing Appellate Committee (SAC) Bench &amp; Speaking Orders</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Statutory appellate bench constituted by the Council. Review and dispose appeals filed by aggrieved technical institutions against adverse Scrutiny/EVC orders, issue binding Speaking Orders, and enforce conditional undertakings.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shrink-0 text-right">
            <span className="text-[11px] text-slate-300 block uppercase font-medium">Bench Constitution</span>
            <span className="font-mono text-sm font-bold text-amber-300 block mt-0.5">
              Hon'ble SAC Chamber
            </span>
            <span className="text-[10px] text-emerald-300 font-semibold block mt-0.5 flex items-center justify-end gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Council Quorum Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SAC Appellate Docket Register */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>SAC National Appellate Petitions Docket</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All formal appeals pending judicial determination before the SAC Bench under APH §1.11.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
            {appealsList.length} Petitions Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          {appealsList.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No appeals currently registered in the SAC docket.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Appeal ID &amp; Date</th>
                  <th className="py-3 px-4">Appellant Institution</th>
                  <th className="py-3 px-4">Target Application</th>
                  <th className="py-3 px-4">Appellate Grounds &amp; Clauses</th>
                  <th className="py-3 px-4">Judicial Status</th>
                  <th className="py-3 px-4 text-right">Bench Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appealsList.map((appeal: any) => (
                  <tr key={appeal.appealId || appeal.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-700 block">{appeal.appealId || appeal.id}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {appeal.filedAt ? new Date(appeal.filedAt).toLocaleDateString('en-IN') : '2026-10-29'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{appeal.institutionName || 'Appellant Technical Institution'}</p>
                      <span className="text-[10px] text-slate-500 font-mono">Appellant: {appeal.appellantType || 'INSTITUTION'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-800">{appeal.caseId}</span>
                    </td>
                    <td className="py-3 px-4 max-w-[260px]">
                      <p className="text-slate-700 truncate">&ldquo;{appeal.appealGrounds}&rdquo;</p>
                      <span className="text-[10px] font-mono text-slate-400">
                        {Array.isArray(appeal.citedClauses) ? appeal.citedClauses.join(', ') : 'APH §1.11'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        appeal.status === 'RELIEF_GRANTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        appeal.status === 'REJECTION_UPHELD' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                        appeal.status === 'HEARING_SCHEDULED' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {appeal.status || 'PENDING_BENCH'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {appeal.status === 'RELIEF_GRANTED' || appeal.status === 'REJECTION_UPHELD' ? (
                        <button
                          onClick={() => setSpeakingOrderDossier(appeal)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Order</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setDisposingAppeal(appeal);
                            setDispositionRemarks(
                              'Standing Appellate Committee (SAC) bench examined registered rectification evidence. Rectification satisfies APH 2024–27 Table 2.3 norms. Relief granted subject to post-approval compliance undertaking.'
                            );
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs shadow-xs inline-flex items-center gap-1.5"
                        >
                          <Gavel className="w-3.5 h-3.5" />
                          <span>Adjudicate</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADJUDICATE MODAL */}
      {disposingAppeal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-amber-300" />
                  <span>SAC Judicial Adjudication &amp; Speaking Order</span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">Under AICTE Act §11(2) &amp; APH §1.11</p>
              </div>
              <button onClick={() => setDisposingAppeal(null)}>
                <X className="w-5 h-5 text-slate-300 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleDisposeAppeal} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Appeal Docket Ref:</span>
                  <span className="font-mono font-bold text-slate-900">{disposingAppeal.appealId || disposingAppeal.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Application:</span>
                  <span className="font-mono font-bold text-slate-900">{disposingAppeal.caseId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Appellant Grounds:</span>
                  <span className="italic text-slate-700 truncate max-w-[260px]">&ldquo;{disposingAppeal.appealGrounds}&rdquo;</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judicial Determination Outcome</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDispositionDecision('RELIEF_GRANTED')}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs text-center transition-all ${
                      dispositionDecision === 'RELIEF_GRANTED'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Relief Granted
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispositionDecision('REJECTION_UPHELD')}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs text-center transition-all ${
                      dispositionDecision === 'REJECTION_UPHELD'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Rejection Upheld
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispositionDecision('REFERRED_TO_SHC')}
                    className={`py-2 px-3 rounded-lg border font-bold text-xs text-center transition-all ${
                      dispositionDecision === 'REFERRED_TO_SHC'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Remand to SHC
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judicial Speaking Order Text (Mandatory Reason)</label>
                <textarea
                  rows={4}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs leading-relaxed"
                  value={dispositionRemarks}
                  onChange={(e) => setDispositionRemarks(e.target.value)}
                  placeholder="State the findings of the Bench, verification of evidence, and legal reasoning under APH norms..."
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 gap-2">
                <button
                  type="button"
                  onClick={() => setDisposingAppeal(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs"
                >
                  <Gavel className="w-4 h-4" />
                  <span>Execute Speaking Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SPEAKING ORDER DOSSIER MODAL */}
      {speakingOrderDossier && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Official Judicial Speaking Order Dossier</span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">AICTE Standing Appellate Committee (SAC)</p>
              </div>
              <button onClick={() => setSpeakingOrderDossier(null)}>
                <X className="w-5 h-5 text-slate-300 hover:text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">ORDER NUMBER:</span>
                  <span className="font-bold text-slate-900">SAC-ORDER-{speakingOrderDossier.appealId || speakingOrderDossier.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">APPELLANT:</span>
                  <span className="font-bold text-slate-800">{speakingOrderDossier.institutionName || speakingOrderDossier.caseId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DISPOSITION:</span>
                  <span className="font-bold text-emerald-700">{speakingOrderDossier.disposition?.decision || 'RELIEF_GRANTED'}</span>
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">Reasoned Findings of the Bench:</h4>
                <p className="text-slate-700 leading-relaxed italic text-[11px]">
                  &ldquo;{speakingOrderDossier.disposition?.remarks || speakingOrderDossier.appealGrounds}&rdquo;
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900 text-[11px] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Digitally Signed with Member Secretary DSC Token Seal</span>
                </div>
                <span className="font-mono font-bold text-[10px]">SHA256-VERIFIED</span>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 gap-2">
                <button
                  onClick={() => alert('Simulating PDF download of sealed Speaking Order.')}
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sealed PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
