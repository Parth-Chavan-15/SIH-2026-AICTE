import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { getSession } from '../../services/session';
import {
  Scale,
  FileText,
  Send,
  Shield,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Building,
  ExternalLink,
  MessageSquare,
  Lock,
  ArrowRight,
  Info
} from 'lucide-react';

export const ApplicantAppealsView: React.FC = () => {
  const { applications, user } = useApp();
  const session = getSession();
  const actor = session?.actor;

  // Resolve institution target application
  const targetAppId = (actor?.id === 'usr-inst-coep' || (actor as any)?.email === 'principal@coep.ac.in') ? 'APP-2026-COEP'
    : (actor?.id === 'usr-inst-giits' || (actor as any)?.email === 'principal@giits.ac.in') ? 'APP-2026-GIITS'
    : (actor?.id === 'usr-inst-pdimtr' || (actor as any)?.email === 'principal@pdimtr.ac.in') ? 'APP-2026-PDIMTR'
    : (actor?.id === 'usr-inst-apex' || (actor as any)?.email === 'principal@apex.ac.in') ? 'APP-2026-APEX'
    : (actor?.id === 'usr-inst-batu' || (actor as any)?.email === 'principal@batu.ac.in') ? 'APP-2026-BATU'
    : (actor?.id === 'usr-inst-vvit' || (actor as any)?.email === 'principal@vvit.ac.in') ? 'APP-2026-VVIT'
    : (actor?.institutionIds?.[0] ? applications.find(a => a.institutionCode === actor.institutionIds[0] || a.id === actor.institutionIds[0])?.id : null) || (applications.length > 0 ? applications[0].id : null);

  const currentApp = applications.find(a => a.id === targetAppId) || applications[0];

  const [activeTab, setActiveTab] = useState<'MY_APPEALS' | 'SUBMIT_APPEAL' | 'HEARING_NOTICES' | 'GRIEVANCE'>('MY_APPEALS');
  const [data, setData] = useState<any>({ appeals: [], hearings: [], complaints: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Appeal Form State
  const [appealGrounds, setAppealGrounds] = useState<string>(
    'Rejection order failed to consider registered rectification submitted within cure window. All norms compliant per APH §1.11 and §2.18.'
  );
  const [citedClauses, setCitedClauses] = useState<string>('APH 2024–27 Clause 1.11, Table 2.3 & Addendum Clause 2.6');
  const [appellantDscToken, setAppellantDscToken] = useState<string>('ePass2003Auto-Class3-Cert#8821');
  const [supportingDocName, setSupportingDocName] = useState<string>('Compliance_Rectification_Dossier_2026.pdf');

  // Grievance Form State
  const [complainantName, setComplainantName] = useState<string>(currentApp?.institutionName || 'Principal / Authorized Representative');
  const [complaintDetails, setComplaintDetails] = useState<string>(
    'Requesting procedural clarification regarding laboratory equipment verification timeline under Chapter VII §7.10 norms.'
  );

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

  const handleFileAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.fileAppeal({
        caseId: currentApp?.id || 'APP-2026-COEP',
        appellantType: 'INSTITUTION',
        appealGrounds,
        citedClauses: citedClauses.split(',').map(s => s.trim()),
        appellantDscToken,
        supportingDocName
      });
      setSuccessMsg('Appellate petition successfully filed before Standing Appellate Committee (SAC). Assigned Bench docket.');
      await loadData();
      setActiveTab('MY_APPEALS');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to file appeal petition');
    } finally {
      setLoading(false);
    }
  };

  const handleFileComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.fileComplaint({
        complainantName,
        complainantId: currentApp?.institutionCode || 'INST-CODE',
        complaintDetails,
        isAnonymous: false,
        targetCaseId: currentApp?.id || 'APP-2026-COEP'
      });
      setSuccessMsg('Grievance petition registered with AICTE Public Grievance Redressal Cell.');
      await loadData();
      setActiveTab('MY_APPEALS');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to file grievance');
    } finally {
      setLoading(false);
    }
  };

  // Filter appeals for current institution
  const myAppeals = (data?.appeals || []).filter((a: any) =>
    a.caseId === currentApp?.id ||
    a.institutionName?.toLowerCase().includes(currentApp?.institutionName?.toLowerCase())
  );

  // Filter hearings for current institution
  const myHearings = (data?.hearings || []).filter((h: any) =>
    h.caseId === currentApp?.id ||
    h.institutionName?.toLowerCase().includes(currentApp?.institutionName?.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#0A2540] via-[#102A43] to-[#1E3A8A] text-white p-6 rounded-2xl shadow-md border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded shadow-xs">
                APH 2024–27 Chapter I §1.11 & Chapter II §2.18
              </span>
              <span className="text-xs text-blue-200 font-semibold">
                Statutory Appellate &amp; Grievance Redressal
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Scale className="w-6 h-6 text-amber-300" />
              <span>Applicant Appeals &amp; Grievance Redressal Desk</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Legal recourse gateway for technical institutions. Submit formal appellate petitions against adverse Scrutiny/EVC findings, track scheduled Standing Hearing Committee (SHC) &amp; Standing Appellate Committee (SAC) hearings, and inspect signed Speaking Orders.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shrink-0 text-right">
            <span className="text-[11px] text-slate-300 block uppercase font-medium">Institution Scope</span>
            <span className="font-mono text-xs font-bold text-amber-300 block mt-0.5 truncate max-w-[200px]">
              {currentApp?.institutionName || 'COEP Tech Univ'}
            </span>
            <span className="text-[10px] text-slate-300 block mt-0.5 font-mono">
              PID: {currentApp?.applicationNumber || '1-43657568230'}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 border-t border-slate-700/60 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('MY_APPEALS')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'MY_APPEALS'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>My Appellate Matters ({myAppeals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SUBMIT_APPEAL')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'SUBMIT_APPEAL'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>File New SAC Appeal</span>
          </button>

          <button
            onClick={() => setActiveTab('HEARING_NOTICES')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'HEARING_NOTICES'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Scheduled Hearings &amp; Notices ({myHearings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('GRIEVANCE')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'GRIEVANCE'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Lodge Grievance / Clarification</span>
          </button>
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

      {/* TAB 1: MY APPEALS */}
      {activeTab === 'MY_APPEALS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>Registered Appellate Petitions</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Formal petitions filed before the Standing Appellate Committee (SAC) under APH §1.11. All proceedings are logged with cryptographic timestamps.
            </p>

            {myAppeals.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Scale className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No active appellate petitions on record for this institution</p>
                <p className="text-[11px] text-slate-400 mt-1">If your application received an adverse scrutiny or inspection order, you may submit an appeal petition under APH §1.11 within 10 statutory working days.</p>
                <button
                  onClick={() => setActiveTab('SUBMIT_APPEAL')}
                  className="mt-4 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs inline-flex items-center gap-2 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Draft Appeal Petition</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myAppeals.map((item: any) => (
                  <div key={item.appealId || item.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors bg-white space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-blue-700">{item.appealId || item.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            item.status === 'RELIEF_GRANTED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            item.status === 'REJECTION_UPHELD' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                            item.status === 'HEARING_SCHEDULED' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                            'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {item.status || 'PENDING_BENCH_REVIEW'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mt-1">Target Case: {item.caseId}</p>
                      </div>

                      <div className="text-right text-[11px] text-slate-500 font-mono">
                        <span>Filed: {item.filedAt ? new Date(item.filedAt).toLocaleDateString('en-IN') : '2026-10-29'}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <span className="font-semibold text-slate-900 block mb-1">Appellate Grounds:</span>
                      <p className="italic text-slate-600">&ldquo;{item.appealGrounds}&rdquo;</p>
                    </div>

                    {item.disposition && (
                      <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-950 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>SAC Bench Speaking Order Recorded</span>
                          </span>
                          <span className="font-mono text-[10px] text-blue-800 font-bold">{item.disposition.decision}</span>
                        </div>
                        <p className="text-[11px] text-slate-700">&ldquo;{item.disposition.remarks}&rdquo;</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SUBMIT SAC APPEAL */}
      {activeTab === 'SUBMIT_APPEAL' && (
        <form onSubmit={handleFileAppeal} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">File Statutory Appeal Petition before SAC</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Governed by AICTE Act §11(2) and Approval Process Handbook 2024–27 Chapter I §1.11 / Chapter II §2.18.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Institution Legal Name</label>
              <input
                type="text"
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-slate-700 font-medium"
                value={currentApp?.institutionName || 'COEP Tech Univ'}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Reference (Target PID)</label>
              <input
                type="text"
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-slate-100 font-mono text-slate-700 font-semibold"
                value={currentApp?.applicationNumber || '1-43657568230'}
              />
            </div>
          </div>

          <div className="text-xs space-y-1">
            <label className="block font-semibold text-slate-700">Specific Grounds of Appeal &amp; Procedural Submissions</label>
            <textarea
              rows={4}
              required
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs leading-relaxed"
              value={appealGrounds}
              onChange={(e) => setAppealGrounds(e.target.value)}
              placeholder="State the factual and regulatory errors in the adverse order..."
            />
            <p className="text-[11px] text-slate-500">
              Citing specific clauses of APH 2024–27 and official corrigenda ensures expedited bench listing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Statutory Provisions &amp; Clauses Relied Upon</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white font-medium"
                value={citedClauses}
                onChange={(e) => setCitedClauses(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Class-3 Digital Signature Token (emBridge)</label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white font-medium text-xs"
                value={appellantDscToken}
                onChange={(e) => setAppellantDscToken(e.target.value)}
              >
                <option value="ePass2003Auto-Class3-Cert#8821">ePass2003Auto (Class-3 Valid Cryptographic Token)</option>
                <option value="mToken-CryptoIdentity#9914">mToken Crypto Identity (Class-3 Valid Token)</option>
                <option value="eMudhra-SoftCert#4402">eMudhra NIC PKI Software Certificate</option>
              </select>
            </div>
          </div>

          <div className="text-xs space-y-1">
            <label className="block font-semibold text-slate-700">Supporting Evidence Dossier (PDF Format)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 px-3 py-2 border rounded-lg bg-slate-50 font-mono text-xs"
                value={supportingDocName}
                onChange={(e) => setSupportingDocName(e.target.value)}
              />
              <span className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs border border-slate-200">
                .PDF Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Attach architectural maps, municipal approvals, or bank solvency guarantees verifying rectification of stated deficiency.
            </p>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Statutory Declaration per APH §1.11(b):</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                The institution hereby solemnly affirms that the facts stated herein are true to the records of the trust/society and authenticated via Class-3 DSC. False declarations shall invite penal withdrawal under AICTE Act §10(k).
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('MY_APPEALS')}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Submit Petition to SAC Registry</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SCHEDULED HEARINGS & NOTICES */}
      {activeTab === 'HEARING_NOTICES' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Official Hearing Notices &amp; Virtual Room Links</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Notices issued by Regional Office Standing Hearing Committee (SHC) or Central Standing Appellate Committee (SAC).
            </p>

            {myHearings.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No hearings currently scheduled for your institution</p>
                <p className="text-[11px] text-slate-400 mt-1">When an SHC enquiry or SAC bench listing is notified, the date, time, and virtual hearing room link will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myHearings.map((h: any) => (
                  <div key={h.hearingId || h.id} className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-purple-900">{h.hearingId || h.id}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900 font-mono">
                            {h.hearingType || 'SHC'} HEARING
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mt-1">Case: {h.caseId}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-purple-950 block">
                          Scheduled: {h.scheduledDate}
                        </span>
                        <span className="text-[10px] text-purple-700 font-mono">11:00 AM IST</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Hearing Venue / Link</span>
                        <a
                          href={h.venue || 'https://aicte-hearings.gov.in'}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <span>{h.venue || 'aicte-hearings.gov.in/room-shc'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div className="p-2.5 bg-white rounded-lg border border-purple-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Subject Matter</span>
                        <p className="text-slate-800 font-medium truncate mt-0.5">{h.shortcomingText || 'Hearing on identified deficiencies'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LODGE GRIEVANCE */}
      {activeTab === 'GRIEVANCE' && (
        <form onSubmit={handleFileComplaint} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Lodge Grievance or Procedural Clarification</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct submission to the AICTE Central Grievance Redressal Cell under Chapter VII §7.10 norms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Applicant / Complainant Identity</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-800 font-medium"
                value={complainantName}
                onChange={(e) => setComplainantName(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Application ID</label>
              <input
                type="text"
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-slate-100 font-mono text-slate-700 font-semibold"
                value={currentApp?.id || 'APP-2026-COEP'}
              />
            </div>
          </div>

          <div className="text-xs space-y-1">
            <label className="block font-semibold text-slate-700">Detailed Statement of Grievance</label>
            <textarea
              rows={4}
              required
              className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs leading-relaxed"
              value={complaintDetails}
              onChange={(e) => setComplaintDetails(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('MY_APPEALS')}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs flex items-center gap-2 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Submit Grievance to Registry</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
