import React, { useState, useMemo } from 'react';
import { getSession } from '../../services/session';
import { useApp } from '../../context/AppContext';
import { Application, WorkflowStage, PriorityLevel, SLAStatusType } from '../../types';
import { SLABadge, StageBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { formatDateIndian } from '../../utils/slaCalculator';
import {
  Search,
  Filter,
  Download,
  PlusCircle,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  AlertOctagon,
  Building,
} from 'lucide-react';

interface ApplicationsListViewProps {
  onSelectApplication: (appId: string) => void;
  onOpenNewAppModal: () => void;
}

export const ApplicationsListView: React.FC<ApplicationsListViewProps> = ({
  onSelectApplication,
  onOpenNewAppModal,
}) => {
  const { role, applications, loading } = useApp();
  const session = getSession();
  const actor = session?.actor;
  const isInstitution = role === 'institution';

  // Enforce tenant isolation for institution logins: show ONLY that college's application
  const scopedApps = useMemo(() => {
    if (!isInstitution) return applications;
    return applications.filter((app) => {
      const actorId = actor?.id || '';
      const email = (actor as any)?.email || '';
      if (actorId === 'usr-inst-coep' || actorId === 'SYN-ACTOR-COEP' || email === 'principal@coep.ac.in') {
        return app.id.includes('COEP') || app.institutionCode === 'INST-SOUTH';
      }
      if (actorId === 'usr-inst-giits' || email === 'principal@giits.ac.in') {
        return app.id.includes('GIITS') || app.institutionCode === 'INST-NORTH';
      }
      if (actorId === 'usr-inst-pdimtr' || email === 'principal@pdimtr.ac.in') {
        return app.id.includes('PDIMTR') || app.institutionCode === 'INST-WEST';
      }
      if (actorId === 'usr-inst-apex' || email === 'principal@apex.ac.in') {
        return app.id.includes('APEX') || app.id.includes('Apex') || app.institutionCode === 'INST-APEX';
      }
      if (actorId === 'usr-inst-batu' || email === 'principal@batu.ac.in') {
        return app.id.includes('BATU') || app.institutionCode === 'INST-BATU';
      }
      if (actor?.institutionIds && actor.institutionIds.length > 0) {
        return actor.institutionIds.includes(app.institutionCode);
      }
      return true;
    });
  }, [applications, isInstitution, actor?.id]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedSLA, setSelectedSLA] = useState<'All' | SLAStatusType>('All');
  const [sortBy, setSortBy] = useState<'date' | 'overdue' | 'intake'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter logic
  const filteredApps = useMemo(() => {
    return scopedApps.filter((app) => {
      const matchesSearch =
        app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.institutionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion = selectedRegion === 'All' || app.region === selectedRegion;
      const matchesType = selectedType === 'All' || app.applicationType === selectedType;
      const matchesStage = selectedStage === 'All' || app.currentStage === selectedStage;
      const matchesSLA = selectedSLA === 'All' || app.slaStatus === selectedSLA;

      return matchesSearch && matchesRegion && matchesType && matchesStage && matchesSLA;
    }).sort((a, b) => {
      if (sortBy === 'overdue') return b.overdueDays - a.overdueDays;
      if (sortBy === 'intake') return b.proposedIntake - a.proposedIntake;
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  }, [applications, searchQuery, selectedRegion, selectedType, selectedStage, selectedSLA, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage) || 1;
  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredApps.slice(start, start + itemsPerPage);
  }, [filteredApps, currentPage]);

  // CSV Export
  const exportToCSV = () => {
    const headers = [
      'Application Number',
      'Institution Name',
      'Institution Code',
      'Region',
      'State',
      'Type',
      'Program',
      'Proposed Intake',
      'Route Type',
      'Current Stage',
      'SLA Status',
      'Elapsed Days',
      'Overdue Days',
      'Assigned Officer',
    ];

    const rows = filteredApps.map((a) => [
      `"${a.applicationNumber}"`,
      `"${a.institutionName}"`,
      `"${a.institutionCode}"`,
      `"${a.region}"`,
      `"${a.state}"`,
      `"${a.applicationType}"`,
      `"${a.program}"`,
      a.proposedIntake,
      `"${a.routeType}"`,
      `"${a.currentStage}"`,
      `"${a.slaStatus}"`,
      a.elapsedDaysAtStage,
      a.overdueDays,
      `"${a.assignedOfficer}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AICTE_Applications_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Application Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search, filter, and track approval workflows across all technical institutions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
            title="Download CSV export of currently filtered applications"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV ({filteredApps.length})</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Application No, Institute Name, Code, or City..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="All">All Regions</option>
            <option value="Northern">Northern (Kanpur)</option>
            <option value="Western">Western (Mumbai)</option>
            <option value="Southern">Southern (Chennai)</option>
            <option value="Eastern">Eastern (Kolkata)</option>
            <option value="South-Western">South-Western (Bangalore)</option>
            <option value="Central">Central (Bhopal)</option>
            <option value="North-West">North-West (Chandigarh)</option>
          </select>

          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => {
              setSelectedStage(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none max-w-[200px]"
          >
            <option value="All">All Stages</option>
            <option value="Application Submitted">Application Submitted</option>
            <option value="Scrutiny in Progress">Scrutiny in Progress</option>
            <option value="Deficiency Communicated">Deficiency Communicated</option>
            <option value="Scrutiny Cleared">Scrutiny Cleared</option>
            <option value="EVC Scheduled">EVC Scheduled</option>
            <option value="EVC Inspection Completed">EVC Inspection Completed</option>
            <option value="SAC / SHC Review">SAC / SHC Review</option>
            <option value="Executive Committee Approval">EC Approval</option>
            <option value="Approval Issued">Approval Issued</option>
          </select>

          {/* SLA Filter */}
          <select
            value={selectedSLA}
            onChange={(e) => {
              setSelectedSLA(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="All">All SLA Statuses</option>
            <option value="within_sla">Within SLA</option>
            <option value="approaching_deadline">Approaching Deadline</option>
            <option value="overdue">Overdue Cases</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="date">Sort by: Submission Date</option>
            <option value="overdue">Sort by: Overdue Days</option>
            <option value="intake">Sort by: Proposed Intake</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {paginatedApps.length === 0 ? (
            <div className="p-12 text-center">
              <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800">No applications match your filter</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search query or reset filter dropdowns.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Application Details</th>
                  <th className="py-3 px-4">Type & Intake</th>
                  <th className="py-3 px-4">Current Stage</th>
                  <th className="py-3 px-4">Route Type</th>
                  <th className="py-3 px-4">SLA / Ageing</th>
                  <th className="py-3 px-4">Responsible Officer</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedApps.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    onClick={() => onSelectApplication(app.id)}
                  >
                    {/* App details & institution */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 group-hover:text-blue-600">
                              {app.applicationNumber}
                            </span>
                            <PriorityBadge priority={app.priority} />
                          </div>
                          <p className="font-medium text-slate-800 mt-0.5 max-w-[240px] truncate">
                            {app.institutionName}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {app.city}, {app.state} &bull; Code: {app.institutionCode}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Type & Program */}
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{app.applicationType}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {app.program} &bull; <span className="font-bold text-slate-700">{app.proposedIntake} Seats</span>
                      </p>
                    </td>

                    {/* Stage Badge */}
                    <td className="py-3 px-4">
                      <StageBadge stage={app.currentStage} />
                      <span className="block text-[10px] text-slate-400 mt-1">
                        Active {app.elapsedDaysAtStage} days
                      </span>
                    </td>

                    {/* Highlighted Statutory Route Type */}
                    <td className="py-3 px-4">
                      {app.routeType === 'Scrutiny Only' || app.id.includes('COEP') ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                          <span className="text-emerald-600">⚡</span>
                          <span>Scrutiny Only</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-200/60 font-mono text-emerald-900">NBA</span>
                        </span>
                      ) : app.routeType === 'Scrutiny + EVC' || app.id.includes('GIITS') ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                          <span className="text-amber-600">🔍</span>
                          <span>Scrutiny + EVC</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200/60 font-mono text-amber-900">Non-NBA</span>
                        </span>
                      ) : app.routeType === 'Fast-Track EoA' || app.id.includes('PDIMTR') ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-300 shadow-2xs">
                          <span>📜</span>
                          <span>Self-Disclosure</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-blue-200/60 font-mono text-blue-900">EoA</span>
                        </span>
                      ) : app.routeType === 'Scrutiny + EVC + SAC/SHC' || app.id.includes('Apex') || app.id.includes('60293') ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-900 border border-purple-300 shadow-2xs">
                          <span className="text-purple-600">⚖️</span>
                          <span>EVC + SAC/SHC</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-purple-200/60 font-mono text-purple-900">Appellate</span>
                        </span>
                      ) : app.routeType === 'Only EVC' || app.id.includes('BATU') || app.id.includes('19201') ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-300 shadow-2xs">
                          <span className="text-indigo-600">🚁</span>
                          <span>Only EVC</span>
                          <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-200/60 font-mono text-indigo-900">§2.16.1</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
                          <span>⚠️</span>
                          <span>{app.routeType}</span>
                        </span>
                      )}
                    </td>

                    {/* SLA Status */}
                    <td className="py-3 px-4">
                      <SLABadge
                        status={app.slaStatus}
                        overdueDays={app.overdueDays}
                        daysRemaining={Math.max(0, app.stageDeadlineDays - app.elapsedDaysAtStage)}
                      />
                      <span className="block text-[10px] text-slate-400 mt-1">
                        Total {app.totalElapsedDays}d elapsed
                      </span>
                    </td>

                    {/* Responsible Officer */}
                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-medium text-slate-800">{app.assignedOfficer}</p>
                      <p className="text-[10px] text-slate-400">{app.region} Region</p>
                    </td>

                    {/* Action button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectApplication(app.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-medium text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>
            Showing <span className="font-semibold">{paginatedApps.length}</span> of{' '}
            <span className="font-semibold">{filteredApps.length}</span> applications
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
