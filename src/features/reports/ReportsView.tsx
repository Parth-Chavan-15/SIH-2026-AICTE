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
} from 'recharts';
import {
  BarChart3,
  Download,
  Filter,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Layers,
  MapPin,
  TrendingUp,
  Award,
  Users,
} from 'lucide-react';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export const ReportsView: React.FC = () => {
  const { applications, evcInspections, complianceItems, expiringDocs, escalations } = useApp();

  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2026-27');
  const [selectedProgram, setSelectedProgram] = useState('All');

  // Filtered dataset with robust academic session normalization
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchRegion = selectedRegion === 'All' || app.region === selectedRegion;
      const matchYear =
        selectedAcademicYear === 'All' ||
        app.academicYear === selectedAcademicYear ||
        (selectedAcademicYear === '2026-27' &&
          (app.academicYear === '2026-2027' || app.academicYear === '2026-27' || !app.academicYear || app.academicYear === '2027-28'));
      const matchProgram = selectedProgram === 'All' || app.program === selectedProgram;
      return matchRegion && matchYear && matchProgram;
    });
  }, [applications, selectedRegion, selectedAcademicYear, selectedProgram]);

  // Overall metrics
  const totalVolume = filteredApps.length;
  const pendingApps = filteredApps.filter(
    (a) => a.currentStage !== 'Approval Issued' && a.currentStage !== 'Application Rejected'
  ).length;
  const approvedCount = filteredApps.filter((a) => a.currentStage === 'Approval Issued').length;
  const overdueCount = filteredApps.filter((a) => a.slaStatus === 'overdue').length;
  const avgProcessingDays = Math.round(
    filteredApps.reduce((acc, a) => acc + (a.totalElapsedDays || a.elapsedDaysAtStage || 5), 0) / (totalVolume || 1)
  );

  const evcCompletedCount = evcInspections.filter((e) => e.status === 'Completed').length;
  const evcTotalCount = evcInspections.length || 1;
  const evcCompletionRate = Math.round((evcCompletedCount / evcTotalCount) * 100);

  const complianceVerifiedCount = complianceItems.filter((c) => c.status === 'Verified').length;
  const complianceTotalCount = complianceItems.length || 1;
  const complianceRate = Math.round((complianceVerifiedCount / complianceTotalCount) * 100);

  // 1. Chart Data: Lifecycle Stage Distribution
  const stageDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredApps.forEach((a) => {
      const key = a.currentStage || 'Application Submitted';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [filteredApps]);

  // 2. Chart Data: Regulatory Route Distribution
  const routeDistributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredApps.forEach((a) => {
      const key = a.routeType || 'Scrutiny Only';
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [filteredApps]);

  // 3. Chart Data: Region Performance Breakdown
  const regionPerformanceData = useMemo(() => {
    const map: Record<string, { region: string; total: number; withinSLA: number; overdue: number }> = {};
    filteredApps.forEach((a) => {
      const r = a.region || 'Western';
      if (!map[r]) {
        map[r] = { region: r, total: 0, withinSLA: 0, overdue: 0 };
      }
      map[r].total++;
      if (a.slaStatus === 'within_sla') map[r].withinSLA++;
      else if (a.slaStatus === 'overdue') map[r].overdue++;
    });
    return Object.values(map);
  }, [filteredApps]);

  // 4. Chart Data: Ageing & Pendency Distribution
  const ageingDistributionData = useMemo(() => {
    const buckets = [
      { name: '0–7 Days (On Track)', count: 0 },
      { name: '8–15 Days (Moderate)', count: 0 },
      { name: '16–30 Days (Approaching SLA)', count: 0 },
      { name: '>30 Days (Critical Bottleneck)', count: 0 },
    ];
    filteredApps.forEach((a) => {
      const days = a.elapsedDaysAtStage || 5;
      if (days <= 7) buckets[0].count++;
      else if (days <= 15) buckets[1].count++;
      else if (days <= 30) buckets[2].count++;
      else buckets[3].count++;
    });
    return buckets;
  }, [filteredApps]);

  // 5. Chart Data: Intake capacity by program
  const intakeByProgram = useMemo(() => {
    const map: Record<string, number> = {};
    filteredApps.forEach((a) => {
      const p = a.program || 'Engineering & Technology';
      map[p] = (map[p] || 0) + (a.proposedIntake || 180);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredApps]);

  // 6. Chart Data: Post-Approval Statutory Compliance Status
  const complianceStatusData = useMemo(() => {
    const counts = {
      'Verified Compliant': complianceItems.filter((c) => c.status === 'Verified').length,
      'Pending Evidence': complianceItems.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length,
      'Expiring Soon': expiringDocs.filter((d) => d.renewalStatus === 'Expiring Soon' || d.daysUntilExpiry <= 30).length,
      'Overdue Escalated': escalations.length,
    };
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [complianceItems, expiringDocs, escalations]);

  // Automated Bottleneck Detection
  const bottleneck = useMemo(() => {
    const counts: Record<string, { totalDays: number; count: number }> = {};
    filteredApps.forEach((a) => {
      if (a.currentStage !== 'Approval Issued' && a.currentStage !== 'Application Rejected') {
        const stage = a.currentStage || 'Scrutiny in Progress';
        if (!counts[stage]) counts[stage] = { totalDays: 0, count: 0 };
        counts[stage].totalDays += a.elapsedDaysAtStage || 7;
        counts[stage].count++;
      }
    });
    let worstStage = 'Scrutiny Stage (Desk Verification)';
    let maxAvg = 0;
    Object.entries(counts).forEach(([stage, data]) => {
      const avg = data.count > 0 ? data.totalDays / data.count : 0;
      if (avg > maxAvg) {
        maxAvg = avg;
        worstStage = stage;
      }
    });
    return { stage: worstStage, avgDays: Math.round(maxAvg || 8) };
  }, [filteredApps]);

  // Export Filtered Analytical Report CSV
  const handleExportCSV = () => {
    const headers = [
      'Application Number',
      'Institution',
      'Region',
      'Program',
      'Route Type',
      'Proposed Intake',
      'Current Stage',
      'SLA Status',
      'Elapsed Days',
    ];
    const rows = filteredApps.map((a) => [
      `"${a.applicationNumber}"`,
      `"${a.institutionName}"`,
      `"${a.region}"`,
      `"${a.program}"`,
      `"${a.routeType || 'Scrutiny Only'}"`,
      a.proposedIntake,
      `"${a.currentStage}"`,
      `"${a.slaStatus}"`,
      a.totalElapsedDays || a.elapsedDaysAtStage,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `NIYAMSETU_Consolidated_Analytics_${selectedRegion}_${new Date().toISOString().split('T')[0]}.csv`
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Consolidated Statutory Analytics & Performance Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical distribution of approval lifecycles, route velocities, regional pendency, and compliance enforcement
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics Report (CSV)</span>
        </button>
      </div>

      {/* Visible Simulation Disclaimer */}
      <div className="bg-amber-50/90 border border-amber-300/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950">
        <div className="flex items-center gap-2">
          <span className="font-bold">
            ⚠️ Demonstration data — simulated (AY 2026-27 Norms)
          </span>
          <span className="text-amber-800 text-[11px] hidden sm:inline">
            &bull; Operational processing durations, committee allocations, and regional metrics computed under APH 2024-27 benchmark norms.
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded border border-amber-400">
          Statutory Analytics Engine
        </span>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Analytics Scope:</span>
        </div>

        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium cursor-pointer"
        >
          <option value="All">All AICTE Regional Bureaus</option>
          <option value="Northern">Northern Region</option>
          <option value="Western">Western Region</option>
          <option value="South-Central">South-Central Region</option>
          <option value="Southern">Southern Region</option>
          <option value="Eastern">Eastern Region</option>
        </select>

        <select
          value={selectedAcademicYear}
          onChange={(e) => setSelectedAcademicYear(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium cursor-pointer"
        >
          <option value="2026-27">Academic Session 2026–27 (Current Active)</option>
          <option value="All">All Academic Sessions</option>
          <option value="2027-28">Academic Session 2027–28</option>
        </select>

        <select
          value={selectedProgram}
          onChange={(e) => setSelectedProgram(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-medium cursor-pointer"
        >
          <option value="All">All Academic Disciplines</option>
          <option value="Engineering & Technology">Engineering & Technology</option>
          <option value="Management">Management</option>
          <option value="Computer Applications">Computer Applications (MCA)</option>
        </select>
      </div>

      {/* 6 High-Level Analytical KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Total Tracked Volume
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalVolume}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
            {approvedCount} Approved ({Math.round((approvedCount / (totalVolume || 1)) * 100)}%)
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Pending in Workflow
          </span>
          <p className="text-2xl font-black text-blue-600 mt-1">{pendingApps}</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {Math.round((pendingApps / (totalVolume || 1)) * 100)}% active docket
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Avg Velocity (Days)
          </span>
          <p className="text-2xl font-black text-indigo-700 mt-1">{avgProcessingDays}d</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Statutory Target: &le; 21d
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            EVC Completion Rate
          </span>
          <p className="text-2xl font-black text-purple-700 mt-1">{evcCompletionRate}%</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {evcCompletedCount} of {evcTotalCount} visits held
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Compliance Adherence
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{complianceRate}%</p>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {complianceVerifiedCount} undertakings verified
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Overdue SLA Breaches
          </span>
          <p className="text-2xl font-black text-rose-600 mt-1">{overdueCount}</p>
          <span className="text-[10px] text-rose-700 font-semibold mt-0.5 block">
            {escalations.length} escalated notices
          </span>
        </div>
      </div>

      {/* Analytical Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Lifecycle Stage Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                1. Application Lifecycle Stage Distribution
              </h3>
              <p className="text-xs text-slate-500">Active applications grouped by current regulatory stage</p>
            </div>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageDistributionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFF',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" name="Applications" fill="#2563EB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Regulatory Route Family Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                2. Regulatory Route Family Distribution
              </h3>
              <p className="text-xs text-slate-500">Route classification under APH Table 2.3 & Addendum §2.6</p>
            </div>
            <Award className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={routeDistributionData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={38}
                  paddingAngle={3}
                >
                  {routeDistributionData.map((_entry, index) => (
                    <Cell key={`route-cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Regional Bureau SLA Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                3. Regional Bureau SLA Performance Breakdown
              </h3>
              <p className="text-xs text-slate-500">Within statutory SLA vs Overdue cases across regions</p>
            </div>
            <MapPin className="w-4 h-4 text-slate-400" />
          </div>

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

        {/* Chart 4: Application Ageing & Pendency Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                4. Application Ageing & Pendency Distribution
              </h3>
              <p className="text-xs text-slate-500">Elapsed duration at current stage (0–7d, 8–15d, 16–30d, &gt;30d)</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageingDistributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFF',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" name="Applications" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Sanctioned Seat Capacity by Faculty Domain */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                5. Sanctioned Intake Capacity by Faculty Domain
              </h3>
              <p className="text-xs text-slate-500">Total approved student seats evaluated across disciplines</p>
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={intakeByProgram}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={38}
                  paddingAngle={3}
                >
                  {intakeByProgram.map((_entry, index) => (
                    <Cell key={`intake-cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Post-Approval Statutory Compliance Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                6. Post-Approval Compliance Adherence
              </h3>
              <p className="text-xs text-slate-500">Status of FDR, Fire Safety NOC, Land Lease, and Cadre Obligations</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complianceStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={38}
                  paddingAngle={3}
                >
                  {complianceStatusData.map((_entry, index) => (
                    <Cell
                      key={`comp-cell-${index}`}
                      fill={index === 0 ? '#10B981' : index === 1 ? '#3B82F6' : index === 2 ? '#F59E0B' : '#EF4444'}
                    />
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
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Workload & Bottleneck Diagnostics Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Regional Bureau & Committee Operational Capacity Overview
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified stage bottlenecks and active regulatory workload distribution
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-300">
            Current Bottleneck: {bottleneck.stage} (~{bottleneck.avgDays}d avg)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Bureau / Office</th>
                <th className="p-3">Active Dossiers</th>
                <th className="p-3">Pending Scrutiny</th>
                <th className="p-3">Pending EVC</th>
                <th className="p-3">Avg Elapsed</th>
                <th className="p-3">Capacity Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-bold text-slate-900">Western Regional Office (WRO Mumbai)</td>
                <td className="p-3 font-semibold text-slate-800">4 cases</td>
                <td className="p-3 text-slate-600">1 case (Group Alpha)</td>
                <td className="p-3 text-slate-600">1 case (Panel Beta)</td>
                <td className="p-3 text-slate-600">6.2 days</td>
                <td className="p-3">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Optimal (4/10)</span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">South-Central Regional Office (SCRO Hyderabad)</td>
                <td className="p-3 font-semibold text-slate-800">3 cases</td>
                <td className="p-3 text-slate-600">1 case (GIITS)</td>
                <td className="p-3 text-slate-600">1 case (Panel Alpha)</td>
                <td className="p-3 text-slate-600">8.5 days</td>
                <td className="p-3">
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Optimal (3/10)</span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Northern Regional Office (NRO Kanpur)</td>
                <td className="p-3 font-semibold text-slate-800">2 cases</td>
                <td className="p-3 text-slate-600">0 cases</td>
                <td className="p-3 text-slate-600">1 case (SAC listed)</td>
                <td className="p-3 text-slate-600">11.0 days</td>
                <td className="p-3">
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Attention (2/10)</span>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">National Approval Bureau (AICTE HQ Delhi)</td>
                <td className="p-3 font-semibold text-slate-800">5 cases</td>
                <td className="p-3 text-slate-600">0 cases</td>
                <td className="p-3 text-slate-600">0 cases</td>
                <td className="p-3 text-slate-600">4.8 days</td>
                <td className="p-3">
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">Active Chamber</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
