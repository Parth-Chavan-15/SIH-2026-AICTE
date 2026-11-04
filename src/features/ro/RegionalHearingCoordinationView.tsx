import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Scale,
  Calendar,
  Clock,
  Users,
  Video,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building,
  PlusCircle,
  X,
  Send,
  Timer,
  AlertCircle
} from 'lucide-react';

export const RegionalHearingCoordinationView: React.FC = () => {
  const { applications, user } = useApp();
  const [data, setData] = useState<any>({ appeals: [], hearings: [], complaints: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Hearing Scheduler Modal
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>(applications[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [hearingVenue, setHearingVenue] = useState<string>('https://aicte-hearings.gov.in/room-shc-wro');
  const [originReportRef, setOriginReportRef] = useState<string>('SCR-2026-WRO-DEF-01');
  const [shortcomingText, setShortcomingText] = useState<string>(
    'Verification of Land Title Deed Registered Lease and Fire Safety NOC under APH §1.8'
  );

  // 15-Day University / State NOC Tracker State (PPT Pillar 1)
  const nocTrackerCases = [
    {
      caseId: 'APP-2026-COEP',
      institutionName: 'College of Engineering Pune (COEP Tech Univ)',
      authority: 'Government of Maharashtra DTE / SPPU',
      notifiedDate: '2026-10-18',
      deadlineDate: '2026-11-02',
      status: 'DEEMED_APPROVED',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      daysElapsed: 17,
      remarks: '15-day window expired without adverse objection. Statutory deemed concurrence issued under APH §1.8(e).'
    },
    {
      caseId: 'APP-2026-GIITS',
      institutionName: 'Godavari Institute of Infrastructure & Tech Sciences',
      authority: 'AP State Council of Higher Education (APSCHE)',
      notifiedDate: '2026-10-25',
      deadlineDate: '2026-11-09',
      status: 'IN_WINDOW',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
      daysElapsed: 10,
      remarks: 'Under active scrutiny by State Directorate. 5 days remaining in statutory concurrence period.'
    },
    {
      caseId: 'APP-2026-APEX',
      institutionName: 'Apex Polytechnic & Technical Institute',
      authority: 'Punjab State Board of Technical Education (PSBTE)',
      notifiedDate: '2026-10-22',
      deadlineDate: '2026-11-06',
      status: 'IN_WINDOW',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-300',
      daysElapsed: 13,
      remarks: 'Pending university affiliation concurrence. Approaching cutoff.'
    }
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAppealsAndHearings();
      const payload = (res as any)?.data ?? res;
      setData(payload || { appeals: [], hearings: [], complaints: [] });
    } catch (err: any) {
      console.error('Failed to load hearings data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScheduleHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.scheduleHearing({
        caseId: selectedCaseId,
        hearingType: 'SHC',
        scheduledDate,
        venue: hearingVenue,
        originReportRef,
        shortcomingText
      });
      setSuccessMsg(`Standing Hearing Committee (SHC) enquiry successfully scheduled for ${selectedCaseId}. Notice dispatched.`);
      setShowScheduleModal(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to schedule SHC hearing');
    } finally {
      setLoading(false);
    }
  };

  const shcHearings = (data?.hearings || []).filter((h: any) => h.hearingType === 'SHC' || !h.hearingType);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0A2540] via-[#102A43] to-[#1E3A8A] text-white p-6 rounded-2xl shadow-md border border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded shadow-xs">
                APH 2024–27 Chapter I §1.8 &amp; Chapter II §2.15
              </span>
              <span className="text-xs text-blue-200 font-semibold">
                Regional Office Coordination Desk
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Scale className="w-6 h-6 text-amber-300" />
              <span>Standing Hearing Committee (SHC) Coordination &amp; 15-Day NOC Tracker</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Autonomous Regional Office hearing coordination cell. Schedule formal SHC appearances for deficient applications, issue statutory notices, and monitor the 15-day State/University deemed concurrence clock.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setShowScheduleModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule SHC Hearing</span>
            </button>
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

      {/* SECTION 1: SHC Scheduled Hearings Register */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Regional SHC Hearings Register</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Statutory appearances scheduled under Regional Officer authority per APH §1.8(c).
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
            {shcHearings.length} Active Sessions
          </span>
        </div>

        <div className="overflow-x-auto">
          {shcHearings.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No SHC hearings currently scheduled in the Western Region docket.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Hearing ID &amp; Type</th>
                  <th className="py-3 px-4">Target Institution &amp; Case</th>
                  <th className="py-3 px-4">Scheduled Date &amp; Time</th>
                  <th className="py-3 px-4">Virtual Room / Venue</th>
                  <th className="py-3 px-4">Deficiency Focus</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shcHearings.map((h: any) => (
                  <tr key={h.hearingId || h.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-indigo-700 block">{h.hearingId || h.id}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                        SHC REGIONAL
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{h.institutionName || 'Technical Institution'}</p>
                      <p className="text-[11px] font-mono text-slate-500">{h.caseId}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{h.scheduledDate}</span>
                      <span className="text-[10px] text-slate-500 font-mono">11:00 AM IST</span>
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={h.venue || 'https://aicte-hearings.gov.in'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[160px]">{h.venue || 'room-shc-wro'}</span>
                      </a>
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      <p className="text-slate-700 truncate">{h.shortcomingText || 'Document deficiency verification'}</p>
                      <span className="text-[10px] text-slate-400 font-mono">Ref: {h.originReportRef || 'SCR-2026-01'}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => alert(`Opening SHC Proceedings Dossier for ${h.hearingId || h.id}`)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300"
                      >
                        Record Minutes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SECTION 2: 15-Day University / State NOC Tracker (PPT Engineering Pillar 1) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">15-Day University &amp; State NOC Concurrence Tracker</h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono font-bold">
                PPT PILLAR 1 ADAPTER
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Under APH §1.8(e), if the State Government / Affiliating University fails to communicate objections within 15 days, concurrence is deemed granted.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Application</th>
                <th className="py-3 px-4">Competent State / University Authority</th>
                <th className="py-3 px-4">Notice Date</th>
                <th className="py-3 px-4">15-Day Statutory Cutoff</th>
                <th className="py-3 px-4">Elapsed / Clock</th>
                <th className="py-3 px-4">Concurrence Status</th>
                <th className="py-3 px-4">Statutory Finding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {nocTrackerCases.map((item) => (
                <tr key={item.caseId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{item.caseId}</span>
                    <span className="text-slate-600 text-[11px] block truncate max-w-[200px]">{item.institutionName}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {item.authority}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {item.notifiedDate}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {item.deadlineDate}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-xs text-amber-700">{item.daysElapsed} Days</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Limit: 15 Days</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-[260px] text-slate-600 text-[11px]">
                    {item.remarks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULE HEARING MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-300" />
                  <span>Issue Statutory SHC Hearing Notice</span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">Under Regional Officer powers (APH 2024–27 Chapter I §1.8)</p>
              </div>
              <button onClick={() => setShowScheduleModal(false)}>
                <X className="w-5 h-5 text-slate-300 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleScheduleHearing} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Application</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs font-medium"
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                >
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.applicationNumber} — {app.institutionName} ({app.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hearing Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs font-mono"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Origin Scrutiny/EVC Report Ref</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs font-mono"
                    value={originReportRef}
                    onChange={(e) => setOriginReportRef(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Virtual Hearing Venue / Room URL</label>
                <input
                  type="url"
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs font-mono text-blue-700"
                  value={hearingVenue}
                  onChange={(e) => setHearingVenue(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specific Deficiency &amp; Notice Grounds</label>
                <textarea
                  rows={3}
                  required
                  className="w-full px-3 py-2 border rounded-lg bg-slate-50 focus:bg-white text-xs leading-relaxed"
                  value={shortcomingText}
                  onChange={(e) => setShortcomingText(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100 gap-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
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
                  <span>Issue Statutory Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
