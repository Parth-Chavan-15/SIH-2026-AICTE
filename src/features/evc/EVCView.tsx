import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EVCInspection } from '../../types';
import { formatDateIndian } from '../../utils/slaCalculator';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  Upload,
  PlusCircle,
  X,
  FileText,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useEVC } from '../applications/hooks/useEVC';

interface EVCViewProps {
  onSelectApplication: (appId: string) => void;
}

export const EVCView: React.FC<EVCViewProps> = ({ onSelectApplication }) => {
  const { role, user, evcInspections, scheduleEVC, submitEVCReport, applications } = useApp();
  const { tasks: m2Tasks, isSynthetic: isEvcSynthetic } = useEVC();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [visitDate, setVisitDate] = useState('2026-10-30');
  const [visitTime, setVisitTime] = useState('10:00 AM IST');
  const [chairman, setChairman] = useState('Prof. Sivasubramanian Velmurugan');
  const [membersInput, setMembersInput] = useState('Assoc. Prof. Hareesh K (Govt Engg), Architect Md. Danish (NIT Patna / COA Reg)');
  const [fetchingRoster, setFetchingRoster] = useState(false);

  const fetchPortalRoster = async (committeeType = 'EVC') => {
    setFetchingRoster(true);
    try {
      const res = await fetch('/api/v1/adapter/committee-sync/' + (selectedAppId || 'APP-2026-GIITS'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ committeeType })
      });
      const json = await res.json();
      if (json.success && json.data && json.data.roster) {
        const roster = json.data.roster;
        const chair = roster[0];
        setChairman(chair.name + ' (' + chair.designation + ', ' + chair.organization + ')');
        const otherMembers = roster.slice(1).map((m: any) => m.name + ' (' + (m.specialization || m.designation) + ', ' + m.organization + ')').join(', ');
        setMembersInput(otherMembers);
      }
    } catch (e) {
      // keep
    } finally {
      setFetchingRoster(false);
    }
  };

  // Report submission modal state
  const [reportingEVC, setReportingEVC] = useState<EVCInspection | null>(null);
  const [reportSummary, setReportSummary] = useState('');
  const [recommendation, setRecommendation] = useState<'Recommended' | 'Recommended with Conditions' | 'Not Recommended'>('Recommended');
  const [infraScore, setInfraScore] = useState(90);
  const [facultyScore, setFacultyScore] = useState(88);
  const [labsScore, setLabsScore] = useState(92);

  const filteredInspections = evcInspections.filter((evc) => {
    const matchesSearch =
      evc.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evc.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evc.committeeChairman.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || evc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Apps eligible for EVC scheduling
  const eligibleAppsForEVC = applications.filter(
    (a) => a.currentStage === 'Scrutiny Cleared' || a.currentStage === 'EVC Scheduled'
  );

  const handleCreateSchedule = async () => {
    if (!selectedAppId || !visitDate || !chairman) return;
    const members = membersInput.split(',').map((m) => m.trim()).filter(Boolean);
    await scheduleEVC(selectedAppId, visitDate, visitTime, chairman, members);
    setShowScheduleModal(false);
  };

  const handleReportSubmit = async () => {
    if (!reportingEVC || !reportSummary) return;
    await submitEVCReport(
      reportingEVC.id,
      reportSummary,
      recommendation,
      infraScore,
      facultyScore,
      labsScore
    );
    setReportingEVC(null);
    setReportSummary('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Expert Visit Committee (EVC) Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical and virtual panel inspections, peer-review timetabling, and scoring assessment reports
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* List vs Calendar toggle */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex text-xs font-semibold">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Calendar Timetable
            </button>
          </div>

          {(role === 'regional_officer' || role === 'bureau_officer' || role === 'admin') && (
            <button
              onClick={() => {
                if (eligibleAppsForEVC.length > 0) setSelectedAppId(eligibleAppsForEVC[0].id);
                setShowScheduleModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Schedule Inspection</span>
            </button>
          )}
        </div>
      </div>

      {/* Member 2 USP B07: Conditional EVC Invariant Engine Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-5 border border-indigo-800/60 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-800/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/30 rounded-xl border border-indigo-500/30 text-indigo-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white tracking-tight">
                  Conditional EVC Gating Engine &bull; USP B07
                </h3>
                <span className="font-mono text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/30 font-semibold">
                  Gate G2 Certified
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Statutory rule enforcement: EVC is triggered only when route requires it and prior scrutiny is complete. Duplicate generation strictly blocked.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-semibold ${
              isEvcSynthetic ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30' : 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
            }`}>
              {isEvcSynthetic ? 'SYNTHETIC Adapter' : 'Live /api/v1/evc'}
            </span>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 font-semibold">
              Active Invariant Tasks: {m2Tasks.length}
            </span>
          </div>
        </div>

        {/* Comparative Route Rules Demonstration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Case SYN-ACC-01 (NBA Accredited)
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/30">
                EVC Ineligible
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Route follows direct scrutiny path per APH Table 1. Physical EVC inspection is locked out by server pure-rule logic, avoiding unnecessary inspector pendency.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Case SYN-NONACC-02 (Non-Accredited)
              </span>
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-200 px-1.5 py-0.5 rounded border border-cyan-500/30">
                Single Task Invariant
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Route requires EVC physical inspection. Exactly one task is generated upon signed scrutiny prerequisites; report submission advances to decision queue without auto-approval.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Institution, Application Number, or Committee Chairman..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
        >
          <option value="All">All Visit Statuses</option>
          <option value="Scheduled">Scheduled Visits</option>
          <option value="Completed">Completed & Reported</option>
          <option value="Delayed / Rescheduled">Delayed / Rescheduled</option>
        </select>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInspections.map((evc) => (
            <div
              key={evc.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-blue-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                    {evc.applicationNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${
                      evc.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : evc.status === 'Delayed / Rescheduled'
                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                        : 'bg-cyan-50 text-cyan-800 border-cyan-300'
                    }`}
                  >
                    {evc.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-tight">
                  {evc.institutionName}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{evc.region} Region</p>

                {/* Date & Time */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Inspection Date: <strong>{evc.scheduledDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Time: <strong>{evc.scheduledTime}</strong></span>
                  </div>
                </div>

                {/* Committee details */}
                <div className="mt-3 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Committee Chairman:
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">{evc.committeeChairman}</p>

                  <span className="text-[10px] uppercase font-bold text-slate-500 block mt-2">
                    Panel Experts ({evc.committeeMembers.length}):
                  </span>
                  <ul className="text-slate-600 text-[11px] list-disc list-inside mt-0.5 space-y-0.5">
                    {evc.committeeMembers.map((m, i) => (
                      <li key={i} className="truncate">{m}</li>
                    ))}
                  </ul>
                </div>

                {/* Assessment score if completed */}
                {evc.reportSubmitted && (
                  <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-900 mb-1">
                      <span>Recommendation:</span>
                      <span>{evc.recommendation}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-emerald-800">
                      <span>Infra: {evc.infrastructureScore}%</span>
                      <span>Faculty: {evc.facultyScore}%</span>
                      <span>Labs: {evc.laboratoriesScore}%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectApplication(evc.applicationId)}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  View Case Dossier
                </button>

                {(role === 'evc_committee' || role === 'regional_officer' || role === 'admin') &&
                  !evc.reportSubmitted && (
                    <button
                      onClick={() => setReportingEVC(evc)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Submit Report</span>
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900">October 2026 EVC Inspection Timetable</h3>
            <span className="text-xs text-slate-500">AICTE Approval Process Cycle</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 border-b border-slate-200 pb-2 mb-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const dateStr = `2026-10-${day.toString().padStart(2, '0')}`;
              const events = evcInspections.filter((e) => e.scheduledDate === dateStr);

              return (
                <div
                  key={day}
                  className={`min-h-[90px] p-2 rounded-xl border text-left flex flex-col justify-between ${
                    events.length > 0
                      ? 'bg-blue-50/60 border-blue-300'
                      : 'bg-slate-50/50 border-slate-100 text-slate-400'
                  }`}
                >
                  <span className="font-bold text-xs text-slate-700">{day}</span>
                  {events.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => onSelectApplication(ev.applicationId)}
                      className="cursor-pointer bg-blue-600 text-white text-[10px] p-1 rounded font-medium truncate mt-1 shadow-2xs hover:bg-blue-700"
                      title={`${ev.institutionName} (${ev.status})`}
                    >
                      {ev.institutionName}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scheduling Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Schedule Expert Visit Committee (EVC)</h3>
              <button onClick={() => setShowScheduleModal(false)}>
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Application</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white"
                >
                  {eligibleAppsForEVC.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.applicationNumber} - {a.institutionName} ({a.region})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              {/* AICTE Web-Portal Automated Committee Selection & Allocation */}
              <div className="bg-indigo-50/80 p-3 rounded-xl border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-600" />
                    AICTE Automated Committee Sync (APH §1.9)
                  </span>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded font-semibold">
                    Simulated Companion Adapter
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Fetch council-approved committee experts from AICTE's automated selector portal or dynamically reallocate an alternate roster.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fetchPortalRoster('EVC')}
                    disabled={fetchingRoster}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <span>⚡ Fetch Council EVC Panel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fetchPortalRoster('RE_EVC')}
                    disabled={fetchingRoster}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-[11px] transition-colors shadow-2xs flex items-center gap-1"
                  >
                    <span>🔄 Reallocate to Alternate Panel (Re-EVC)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Committee Chairman</label>
                <input
                  type="text"
                  value={chairman}
                  onChange={(e) => setChairman(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Panel Member Experts (Comma separated)
                </label>
                <textarea
                  rows={2}
                  value={membersInput}
                  onChange={(e) => setMembersInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSchedule}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Confirm Inspection Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Submission Modal */}
      {reportingEVC && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Upload EVC Inspection Assessment Report</h3>
              <button onClick={() => setReportingEVC(null)}>
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">{reportingEVC.institutionName}</p>
                <p className="text-slate-500 font-mono text-[11px]">{reportingEVC.applicationNumber}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Overall Recommendation</label>
                <select
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                >
                  <option value="Recommended">Recommended for Approval</option>
                  <option value="Recommended with Conditions">Recommended with Specific Conditions</option>
                  <option value="Not Recommended">Not Recommended (Severe Deficiencies)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Infra Score (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={infraScore}
                    onChange={(e) => setInfraScore(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Faculty (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={facultyScore}
                    onChange={(e) => setFacultyScore(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 text-center font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Labs (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={labsScore}
                    onChange={(e) => setLabsScore(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-300 text-center font-bold"
                  />
                </div>
              </div>

              {/* Statutory Physical Inspection Verification (APH §1.9(f)-(g)) */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-[11px] text-slate-800 uppercase tracking-wider block">
                  Mandatory Physical Verification Checks (APH 2026–27 §1.9)
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                    <span><strong>APH §1.9(f):</strong> 30-minute uninterrupted walkthrough video uploaded &amp; verified</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                    <span><strong>APH §1.9(g):</strong> Geo-coordinates verified: <code>17.702834° N, 83.113288° E</code> (&plusmn;10m radius)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                    <span><strong>Cadre Physical Audit:</strong> Faculty physical presence verified with Form 16 / Aadhaar</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Executive Assessment Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail laboratory equipment adequacy, faculty physical presence, safety standards..."
                  value={reportSummary}
                  onChange={(e) => setReportSummary(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setReportingEVC(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReportSubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Submit & Sign Official EVC Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
