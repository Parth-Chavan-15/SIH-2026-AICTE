import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Scale,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  Send,
  Shield,
  Eye,
  Gavel,
  MessageSquare
} from 'lucide-react';

export const AppealsAndHearingsView: React.FC = () => {
  const { applications, user } = useApp();
  const [activeTab, setActiveTab] = useState<'APPEALS' | 'HEARINGS' | 'COMPLAINTS'>('APPEALS');
  const [data, setData] = useState<any>({ appeals: [], hearings: [], complaints: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // SAC Appeal form state
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [appealGrounds, setAppealGrounds] = useState<string>(
    'Rejection order failed to consider registered rectification submitted within cure window. All norms compliant per APH §1.11.'
  );
  const [appellantDscToken, setAppellantDscToken] = useState<string>('DSC-TOKEN-APPEL-7718');

  // Hearing schedule state
  const [hearingCaseId, setHearingCaseId] = useState<string>('');
  const [hearingType, setHearingType] = useState<'SHC' | 'SAC'>('SHC');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [hearingVenue, setHearingVenue] = useState<string>('https://aicte-hearings.gov.in/room-shc-3');

  // Complaint form state
  const [complainantName, setComplainantName] = useState<string>('Prof. R. K. Sharma');
  const [complainantId, setComplainantId] = useState<string>('ABCDE1234F');
  const [complaintDetails, setComplaintDetails] = useState<string>(
    'Grievance regarding infrastructure deficiency miscalculation under Chapter VII §7.10 norms.'
  );
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Disposition modal
  const [disposingAppealId, setDisposingAppealId] = useState<string | null>(null);
  const [dispositionDecision, setDispositionDecision] = useState<'RELIEF_GRANTED' | 'REJECTION_UPHELD' | 'REFERRED_TO_SHC'>('RELIEF_GRANTED');
  const [dispositionRemarks, setDispositionRemarks] = useState<string>('Appeal examined by SAC bench; relief granted per revised documents.');

  const fetchData = async () => {
    try {
      const res = await api.getAppealsAndHearings();
      setData(res.data);
      if (!selectedCaseId && applications.length > 0) {
        setSelectedCaseId(applications[0].id);
        setHearingCaseId(applications[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load appeals data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLodgeAppeal = async () => {
    if (!selectedCaseId || appealGrounds.trim().length < 10) {
      setErrorMsg('Valid case ID and detailed grounds are required to lodge an appeal.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.lodgeAppeal({
        caseId: selectedCaseId,
        institutionId: 'INST-DEMO',
        grounds: appealGrounds,
        appellantDscToken
      });
      setSuccessMsg(`Statutory Appeal ${res.data?.appeal?.id} successfully lodged with SAC!`);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lodge appeal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleHearing = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.scheduleHearing({
        caseId: hearingCaseId,
        hearingType,
        committeeMembers: ['Dr. V. K. Paul (Chair)', 'Prof. A. S. Pant', 'Adv. S. K. Hegde (Legal Expert)'],
        scheduledDate,
        hearingMode: 'VIRTUAL',
        venueOrLink: hearingVenue
      });
      setSuccessMsg(`Hearing ${res.data?.hearing?.id} scheduled successfully!`);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Schedule hearing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileComplaint = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.fileComplaint({
        institutionId: 'INST-DEMO',
        complainantName,
        complainantAadhaarOrPan: complainantId,
        complaintDetails,
        isAnonymous
      });
      setSuccessMsg(`Grievance/Complaint ${res.data?.complaint?.id} recorded under Chapter VII!`);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to file complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleDisposeAppeal = async () => {
    if (!disposingAppealId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.disposeAppeal(disposingAppealId, {
        decision: dispositionDecision,
        remarks: dispositionRemarks,
        committeeMembers: ['SAC Retired High Court Judge', 'Senior Academic Expert']
      });
      setSuccessMsg(`Appeal ${disposingAppealId} disposed with decision: ${dispositionDecision}`);
      setDisposingAppealId(null);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Appeal disposition failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Decoupling Explanation Banner */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex items-start gap-3 shadow-sm">
        <Scale className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold uppercase tracking-wider text-purple-950">
            Decoupled Conditional Governance Branches (APH §1.11, §2.23.3 &amp; Chapter VII)
          </p>
          <p className="mt-1 text-purple-800">
            Under AICTE statutory regulations, SAC (Standing Appellate Committee), SHC (Standing Hearing Committee), and PGRC/SCSC Complaints are <strong>separate conditional branches</strong>, not mandatory steps on the regular spine. Adverse decisions trigger a statutory 7-calendar-day appeal window to SAC. Anonymous complaints are strictly barred per Chapter VII §7.10.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('APPEALS')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'APPEALS'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>1. SAC Statutory Appeals (APH §1.11 / §2.24)</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
            {data.appeals?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('HEARINGS')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'HEARINGS'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. SHC Compliance Hearings (APH §2.23.3)</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
            {data.hearings?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLAINTS')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'COMPLAINTS'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>3. Grievances &amp; SCSC Complaints (Chapter VII)</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            {data.complaints?.length || 0}
          </span>
        </button>
      </div>

      {/* TAB 1: SAC STATUTORY APPEALS */}
      {activeTab === 'APPEALS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lodge Appeal Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-600" />
              <span>Lodge Statutory Appeal to SAC</span>
            </h3>

            <p className="text-xs text-slate-500">
              Technical institutions aggrieved by an adverse Executive Committee decision may file an appeal to the Standing Appellate Committee within 7 calendar days.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Application Case</label>
                <select
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.id} &bull; {app.institutionName} ({app.currentStage})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appellate Grounds (Specific Shortcoming Contestation)</label>
                <textarea
                  rows={4}
                  value={appealGrounds}
                  onChange={(e) => setAppealGrounds(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appellant Cryptographic Token Serial</label>
                <input
                  type="text"
                  value={appellantDscToken}
                  onChange={(e) => setAppellantDscToken(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleLodgeAppeal}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Lodge Appeal with SAC</span>
            </button>
          </div>

          {/* Active Appeals List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Active SAC Statutory Appeals Docket</h3>

            {data.appeals && data.appeals.length > 0 ? (
              <div className="space-y-3">
                {data.appeals.map((app: any) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{app.id}</span>
                        <span className="font-mono text-purple-700 font-semibold px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
                          {app.caseId}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'LODGED'
                            ? 'bg-amber-100 text-amber-800'
                            : app.status === 'DISPOSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <p className="text-slate-700">
                      <strong>Grounds: </strong>
                      {app.grounds}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                      <span>Lodged: {new Date(app.lodgedAt).toLocaleString()}</span>
                      {app.status !== 'DISPOSED' && (
                        <button
                          onClick={() => setDisposingAppealId(app.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white font-sans text-xs font-semibold flex items-center gap-1"
                        >
                          <Gavel className="w-3.5 h-3.5" />
                          <span>Record SAC Disposition</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-50 border border-dashed text-center text-xs text-slate-400">
                No active SAC appeals currently docketed.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SHC COMPLIANCE HEARINGS */}
      {activeTab === 'HEARINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Schedule Hearing (APH §2.23.3)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Application Case</label>
                <select
                  value={hearingCaseId}
                  onChange={(e) => setHearingCaseId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.id} &bull; {app.institutionName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hearing Bench Type</label>
                <select
                  value={hearingType}
                  onChange={(e: any) => setHearingType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="SHC">SHC - Standing Hearing Committee (APH §2.23.3)</option>
                  <option value="SAC">SAC - Standing Appellate Committee Hearing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Virtual Room / Venue URL</label>
                <input
                  type="text"
                  value={hearingVenue}
                  onChange={(e) => setHearingVenue(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleScheduleHearing}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Formal Hearing</span>
            </button>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Scheduled Standing Committee Hearings</h3>

            {data.hearings && data.hearings.length > 0 ? (
              <div className="space-y-3">
                {data.hearings.map((h: any) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{h.id}</span>
                        <span className="font-mono text-blue-700 font-semibold px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                          {h.caseId}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {h.hearingType} &bull; {h.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-600">
                      <div>Scheduled Date: <strong>{h.scheduledDate}</strong></div>
                      <div>Venue/Room: <code className="text-blue-700">{h.venueOrLink}</code></div>
                      <div>Members: {h.committeeMembers?.join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-50 border border-dashed text-center text-xs text-slate-400">
                No hearings currently scheduled.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GRIEVANCES & COMPLAINTS */}
      {activeTab === 'COMPLAINTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>File Grievance / Complaint (Chapter VII)</span>
            </h3>

            <p className="text-xs text-slate-500">
              Grievances are investigated via Public Grievance Redressal Committee (PGRC) and Standing Complaint Scrutiny Committee (SCSC). Anonymous complaints are rejected.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Complainant Name</label>
                <input
                  type="text"
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Complainant PAN / Aadhaar</label>
                <input
                  type="text"
                  value={complainantId}
                  onChange={(e) => setComplainantId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grievance Description</label>
                <textarea
                  rows={4}
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span className="font-semibold text-slate-700">Submit as Anonymous (Will trigger rejection per §7.10)</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleFileComplaint}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Grievance to SCSC</span>
            </button>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Grievance &amp; Complaint Registry</h3>

            {data.complaints && data.complaints.length > 0 ? (
              <div className="space-y-3">
                {data.complaints.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 text-sm">{c.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'UNDER_SCSC_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <p className="text-slate-700">
                      <strong>Details: </strong>
                      {c.complaintDetails}
                    </p>

                    <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                      <span>Complainant: {c.complainantName}</span>
                      <span>Filed: {new Date(c.filedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-50 border border-dashed text-center text-xs text-slate-400">
                No complaints currently registered.
              </div>
            )}
          </div>
        </div>
      )}

      {/* DISPOSITION MODAL */}
      {disposingAppealId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Record SAC Appellate Disposition</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appeal Reference</label>
                <input
                  type="text"
                  disabled
                  value={disposingAppealId}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appellate Decision</label>
                <select
                  value={dispositionDecision}
                  onChange={(e: any) => setDispositionDecision(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="RELIEF_GRANTED">RELIEF_GRANTED - Forward for Approval</option>
                  <option value="REJECTION_UPHELD">REJECTION_UPHELD - Dismiss Appeal (Final Order)</option>
                  <option value="REFERRED_TO_SHC">REFERRED_TO_SHC - Remand to Standing Hearing Committee</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bench Remarks &amp; Statutory Grounds</label>
                <textarea
                  rows={3}
                  value={dispositionRemarks}
                  onChange={(e) => setDispositionRemarks(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDisposingAppealId(null)}
                className="px-3 py-1.5 rounded-lg border text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDisposeAppeal}
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>Submit SAC Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
