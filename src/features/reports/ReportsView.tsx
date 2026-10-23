import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const ReportsView: React.FC = () => {
  const { applications, evcInspections, complianceItems, expiringDocs } = useApp();

  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2027-28');

  // Filtered dataset
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchRegion = selectedRegion === 'All' || app.region === selectedRegion;
      const matchYear = app.academicYear === selectedAcademicYear;
      return matchRegion && matchYear;
    });
  }, [applications, selectedRegion, selectedAcademicYear]);

  // Overall metrics
  const totalVolume = filteredApps.length;
  const overdueCount = filteredApps.filter((a) => a.slaStatus === 'overdue').length;
  const approvedCount = filteredApps.filter((a) => a.currentStage === 'Approval Issued').length;
  const avgProcessingDays = Math.round(
    filteredApps.reduce((acc, a) => acc + a.totalElapsedDays, 0) / (totalVolume || 1)
  );

  const evcCompletedCount = evcInspections.filter((e) => e.status === 'Completed').length;
  const evcCompletionRate = Math.round((evcCompletedCount / (evcInspections.length || 1)) * 100);

  const complianceVerifiedCount = complianceItems.filter((c) => c.status === 'Verified').length;
  const complianceRate = Math.round((complianceVerifiedCount / (complianceItems.length || 1)) * 100);

  // Region performance
  const regionPerformanceData = useMemo(() => {
    const map: Record<string, { region: string; total: number; withinSLA: number; overdue: number }> = {};
    filteredApps.forEach((a) => {
      if (!map[a.region]) {
        map[a.region] = { region: a.region, total: 0, withinSLA: 0, overdue: 0 };
      }
      map[a.region].total++;
      if (a.slaStatus === 'within_sla') map[a.region].withinSLA++;
      else if (a.slaStatus === 'overdue') map[a.region].overdue++;
    });
    return Object.values(map);
  }, [filteredApps]);

  // Intake capacity by program
  const intakeByProgram = useMemo(() => {
    const map: Record<string, number> = {};
    filteredApps.forEach((a) => {
      map[a.program] = (map[a.program] || 0) + a.proposedIntake;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredApps]);

  // Export Filtered Analytical Report CSV
  const handleExportCSV = () => {
    const headers = [
      'Application Number',
      'Institution',
      'Region',
      'Program',
      'Proposed Intake',
      'Current Stage',
      'SLA Status',
      'Total Days Elapsed',
    ];
    const rows = filteredApps.map((a) => [
      `"${a.applicationNumber}"`,
      `"${a.institutionName}"`,
      `"${a.region}"`,
      `"${a.program}"`,
      a.proposedIntake,
      `"${a.currentStage}"`,
      `"${a.slaStatus}"`,
      a.totalElapsedDays,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `AICTE_Regulatory_Performance_Report_${selectedRegion}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Regulatory Analytics & Performance Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical analysis of approval processing velocities, regional SLA compliance, and EVC efficiency
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics Report (CSV)</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Report Scope:</span>
        </div>

        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
        >
          <option value="All">All AICTE Regional Bureaus</option>
          <option value="Northern">Northern</option>
          <option value="Western">Western</option>
          <option value="Southern">Southern</option>
          <option value="Eastern">Eastern</option>
          <option value="South-Western">South-Western</option>
          <option value="Central">Central</option>
          <option value="North-West">North-West</option>
        </select>

        <select
          value={selectedAcademicYear}
          onChange={(e) => setSelectedAcademicYear(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
        >
          <option value="2027-28">Academic Session 2027-28</option>
          <option value="2026-27">Academic Session 2026-27</option>
        </select>
      </div>

      {/* High-Level Analytical KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Application Volume
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalVolume}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Approved: {approvedCount} ({Math.round((approvedCount / (totalVolume || 1)) * 100)}%)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Avg Processing Time
          </span>
          <p className="text-2xl font-black text-indigo-700 mt-1">{avgProcessingDays} Days</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Target SLA: &le; 21 Days</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            EVC Completion Rate
          </span>
          <p className="text-2xl font-black text-purple-700 mt-1">{evcCompletionRate}%</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {evcCompletedCount} of {evcInspections.length} visits held
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Compliance Adherence
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{complianceRate}%</p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {complianceVerifiedCount} undertakings verified
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Performance Comparison */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1">
            Regional Bureau Performance Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-4">Within SLA vs Overdue cases by region</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="region" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFF',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="withinSLA" name="Within SLA" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sanctioned Intake by Program */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-1">
            Sanctioned Seat Capacity by Faculty Domain
          </h3>
          <p className="text-xs text-slate-500 mb-4">Total seats under technical evaluation</p>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={intakeByProgram}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {intakeByProgram.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFF',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
