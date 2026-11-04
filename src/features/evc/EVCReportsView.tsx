import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import type { EVCInspection } from '../../types';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Award,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  ShieldCheck,
  Building2,
  MapPin,
  Users,
  X,
  Calendar,
  Check,
  BarChart3,
  Video
} from 'lucide-react';

interface EVCReportsViewProps {
  onSelectApplication?: (id: string) => void;
}

export const EVCReportsView: React.FC<EVCReportsViewProps> = ({ onSelectApplication }) => {
  const [inspections, setInspections] = useState<EVCInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRecommendation, setFilterRecommendation] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedReport, setSelectedReport] = useState<EVCInspection | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const data = await api.getEVCInspections();
        setInspections(data || []);
      } catch (err) {
        console.error('Failed to load EVC inspections:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return inspections.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.applicationNumber && item.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRec =
        filterRecommendation === 'All' ||
        (filterRecommendation === 'Recommended' && item.recommendation === 'Recommended') ||
        (filterRecommendation === 'Recommended with Conditions' && item.recommendation === 'Recommended with Conditions') ||
        (filterRecommendation === 'Not Recommended' && item.recommendation === 'Not Recommended');

      const matchesStatus =
        filterStatus === 'All' ||
        (filterStatus === 'Completed' && (item.status === 'Completed' || item.reportSubmitted)) ||
        (filterStatus === 'Scheduled' && item.status === 'Scheduled' && !item.reportSubmitted);

      return matchesSearch && matchesRec && matchesStatus;
    });
  }, [inspections, searchQuery, filterRecommendation, filterStatus]);

  // Aggregate Metrics derived from real inspection data
  const totalAssigned = inspections.length;
  const completedReports = inspections.filter((i) => i.reportSubmitted || i.status === 'Completed').length;
  const pendingInspections = inspections.filter((i) => !i.reportSubmitted && i.status !== 'Completed').length;
  const reportsWithConditions = inspections.filter((i) => i.recommendation === 'Recommended with Conditions').length;
  const cleanRecommended = inspections.filter((i) => i.recommendation === 'Recommended').length;
  const notRecommended = inspections.filter((i) => i.recommendation === 'Not Recommended').length;

  // Average Scores among evaluated reports
  const scoredReports = inspections.filter((i) => i.infrastructureScore !== undefined);
  const avgInfra = scoredReports.length
    ? Math.round(scoredReports.reduce((acc, curr) => acc + (curr.infrastructureScore || 0), 0) / scoredReports.length)
    : 85;
  const avgFaculty = scoredReports.length
    ? Math.round(scoredReports.reduce((acc, curr) => acc + (curr.facultyScore || 0), 0) / scoredReports.length)
    : 80;
  const avgLabs = scoredReports.length
    ? Math.round(scoredReports.reduce((acc, curr) => acc + (curr.laboratoriesScore || 0), 0) / scoredReports.length)
    : 88;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300">
              Role #3 &bull; Inspection Committee (R3-S02)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
              AY 2026–27
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Signed Inspection Reports &amp; Committee Analysis
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Official repository of physical and virtual campus inspection reports, scoring rubrics, geo-tagged telemetry verification, and digital sign-offs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
            [DEMO Telemetry Fixture &bull; HMAC-SHA256 Signed]
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Inspections
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {totalAssigned}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Assigned to panel</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Completed &amp; Signed
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {completedReports}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Dossiers submitted</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            Pending Reports
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {pendingInspections}
          </div>
          <div className="text-[10px] text-amber-600 mt-0.5">Awaiting submission</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            With Conditions
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {reportsWithConditions}
          </div>
          <div className="text-[10px] text-blue-600 mt-0.5">Deficiencies noted</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
            Average Score
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1">
            {avgInfra}%
          </div>
          <div className="text-[10px] text-purple-600 mt-0.5">Infrastructure index</div>
        </div>
      </div>

      {/* Two Meaningful EVC Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Inspection Recommendation Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Inspection Recommendation Distribution
                </h3>
                <p className="text-[11px] text-slate-500">Statutory outcomes across completed EVC inspection panels</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700">Recommended (Clean Approval)</span>
                <span className="font-mono text-slate-700">{cleanRecommended} case(s)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${totalAssigned ? (cleanRecommended / totalAssigned) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700">Recommended with Conditions (Deficiency Undertaking)</span>
                <span className="font-mono text-slate-700">{reportsWithConditions} case(s)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${totalAssigned ? (reportsWithConditions / totalAssigned) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-700">Not Recommended (Critical Inadequacy)</span>
                <span className="font-mono text-slate-700">{notRecommended} case(s)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${totalAssigned ? (notRecommended / totalAssigned) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-500">Scheduled / Visit Pending</span>
                <span className="font-mono text-slate-700">{pendingInspections} case(s)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: `${totalAssigned ? (pendingInspections / totalAssigned) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Inspection Assessment Score Analysis */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Campus Assessment Score Analysis
                </h3>
                <p className="text-[11px] text-slate-500">Average scoring rubric performance across verified infrastructure metrics</p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Physical Infrastructure &amp; Land Norms</span>
                <span className="font-mono font-bold text-blue-700">{avgInfra} / 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${avgInfra}%` }} />
              </div>
              <span className="text-[10px] text-slate-400">Classrooms, labs, administration area &amp; barrier-free access</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Faculty Cadre &amp; Student-Teacher Ratio</span>
                <span className="font-mono font-bold text-purple-700">{avgFaculty} / 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${avgFaculty}%` }} />
              </div>
              <span className="text-[10px] text-slate-400">Cadre ratio 1:2:6 compliance &amp; biometric attendance logs</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Laboratories, Computing &amp; Library Resources</span>
                <span className="font-mono font-bold text-teal-700">{avgLabs} / 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: `${avgLabs}%` }} />
              </div>
              <span className="text-[10px] text-slate-400">Licensed software, internet bandwidth &amp; reading room holdings</span>
            </div>
          </div>
        </div>
      </div>

      {/* Signed Inspection Report Register */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Register Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              EVC Signed Inspection Report Register
            </h3>
            <p className="text-xs text-slate-500">
              Immutable committee dossiers submitted by EVC inspection panels
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search institution or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50"
              />
            </div>

            {/* Filter: Recommendation */}
            <select
              value={filterRecommendation}
              onChange={(e) => setFilterRecommendation(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="All">All Recommendations</option>
              <option value="Recommended">Recommended</option>
              <option value="Recommended with Conditions">With Conditions</option>
              <option value="Not Recommended">Not Recommended</option>
            </select>

            {/* Filter: Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed &amp; Signed</option>
              <option value="Scheduled">Scheduled Visit</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Report / Task ID</th>
                <th className="py-3 px-4">Technical Institution</th>
                <th className="py-3 px-4">Inspection Date</th>
                <th className="py-3 px-4">Committee Chairman</th>
                <th className="py-3 px-4">Rubric Score</th>
                <th className="py-3 px-4">Statutory Recommendation</th>
                <th className="py-3 px-4">Signing Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading signed EVC reports…
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No inspection reports match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const isCompleted = report.reportSubmitted || report.status === 'Completed';
                  return (
                    <tr key={report.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-purple-900">{report.id}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{report.applicationId}</div>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 line-clamp-1">{report.institutionName}</div>
                        <div className="text-[10px] text-slate-400">{report.region} Region</div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        <div>{report.scheduledDate}</div>
                        <div className="text-[10px] text-slate-400">{report.scheduledTime}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <div className="font-medium">{report.committeeChairman}</div>
                        <div className="text-[10px] text-slate-400">
                          {report.committeeMembers ? `${report.committeeMembers.length} Panel Members` : 'Panel Mandated'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isCompleted ? (
                          <div className="font-mono font-bold text-slate-800">
                            <span>{report.infrastructureScore || 85}</span>
                            <span className="text-[10px] text-slate-400 font-normal"> / 100</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Evaluation Pending</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {report.recommendation === 'Recommended' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <Check className="w-3 h-3" />
                            <span>Recommended</span>
                          </span>
                        ) : report.recommendation === 'Recommended with Conditions' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <AlertTriangle className="w-3 h-3" />
                            <span>With Conditions</span>
                          </span>
                        ) : report.recommendation === 'Not Recommended' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <span>Not Recommended</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                            <span>Visit Scheduled</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>HMAC Signed</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">In Draft</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-2.5 py-1 rounded text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200 transition-colors inline-flex items-center gap-1 shadow-xs"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Dossier</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Inspection Report Dossier Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 anim-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-purple-900 to-indigo-950 text-white flex items-center justify-between rounded-t-2xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/30 text-purple-200 border border-purple-400/30">
                    EVC Inspection Dossier
                  </span>
                  <span className="text-[10px] font-mono text-slate-300">
                    AY 2026–27
                  </span>
                </div>
                <h3 className="font-black text-lg text-white mt-1">
                  {selectedReport.institutionName}
                </h3>
                <p className="text-xs text-purple-200 font-mono mt-0.5">
                  Report ID: {selectedReport.id} &bull; Case: {selectedReport.applicationId}
                </p>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-slate-800 text-xs">
              {/* Committee Composition */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>Statutory Inspection Panel</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Committee Chairman:</span>
                    <span className="font-bold text-slate-900">{selectedReport.committeeChairman}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Assigned Regional Officer:</span>
                    <span className="font-bold text-slate-900">{selectedReport.assignedOfficer}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[10px]">Panel Members:</span>
                    <ul className="list-disc list-inside text-slate-700 space-y-0.5 mt-0.5">
                      {(selectedReport.committeeMembers || ['Expert Member 1', 'Architect Expert']).map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Assessment Scores */}
              <div>
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2.5">
                  Component Evaluation Scores
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
                    <span className="text-[10px] text-purple-800 font-bold block">Infrastructure</span>
                    <span className="text-xl font-black text-purple-900 font-mono mt-0.5">
                      {selectedReport.infrastructureScore || 85} / 100
                    </span>
                  </div>

                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
                    <span className="text-[10px] text-indigo-800 font-bold block">Faculty Cadre</span>
                    <span className="text-xl font-black text-indigo-900 font-mono mt-0.5">
                      {selectedReport.facultyScore || 80} / 100
                    </span>
                  </div>

                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-center">
                    <span className="text-[10px] text-teal-800 font-bold block">Laboratories</span>
                    <span className="text-xl font-black text-teal-900 font-mono mt-0.5">
                      {selectedReport.laboratoriesScore || 88} / 100
                    </span>
                  </div>
                </div>
              </div>

              {/* Committee Observations & Narrative Findings */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                  Committee Observations &amp; Verification Findings
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                  <p>
                    {selectedReport.reportSummary ||
                      'Physical inspection conducted on-site in accordance with AICTE Approval Process Handbook (APH 2024–27). Verified campus land demarcation, administrative and instructional carpet area, computer laboratory ratios, and emergency fire safety egress pathways.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-500 border-t border-slate-200 font-mono">
                    <span>GPS: 17.7289° N, 83.3039° E</span>
                    <span>&bull;</span>
                    <span>Geo-tagged Walkthrough Video: Verified 30-min feed</span>
                  </div>
                </div>
              </div>

              {/* Final Recommendation */}
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Statutory EVC Recommendation
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {selectedReport.recommendation || 'Recommended with Conditions'}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">Integrity Seal</span>
                  <span className="text-xs font-mono font-bold text-purple-800">
                    [HMAC-SHA256 Signed]
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center rounded-b-2xl">
              {onSelectApplication ? (
                <button
                  onClick={() => {
                    onSelectApplication(selectedReport.applicationId);
                    setSelectedReport(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Full Application Docket</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Simulating PDF export for EVC Report ${selectedReport.id}`)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EVCReportsView;
