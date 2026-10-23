import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../components/layout/Sidebar';
import { SLABadge, StageBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { formatDateIndian } from '../../utils/slaCalculator';
import {
  FileText,
  Clock,
  AlertOctagon,
  CheckCircle,
  Calendar,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Building,
  UserCheck,
  PlusCircle,
  Activity,
  FileCheck2,
} from 'lucide-react';
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

interface DashboardViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenNewAppModal: () => void;
  onSelectApplication: (appId: string) => void;
}

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenNewAppModal,
  onSelectApplication,
}) => {
  const { role, user, applications, evcInspections, complianceItems, expiringDocs, auditLog } = useApp();

  // Metrics computation
  const totalApps = applications.length;
  const pendingApps = applications.filter(
    (a) => a.currentStage !== 'Approval Issued' && a.currentStage !== 'Application Rejected'
  ).length;
  const overdueApps = applications.filter((a) => a.slaStatus === 'overdue').length;
  const completedApps = applications.filter((a) => a.currentStage === 'Approval Issued').length;
  const pendingEVCs = evcInspections.filter((e) => e.status === 'Scheduled').length;
  const approachingCompliance = complianceItems.filter(
    (c) => c.status === 'Pending Evidence' || c.isApproaching || c.isOverdue
  ).length;

  // Chart data: Stage distribution
  const stageDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => {
      const key = a.currentStage;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [applications]);

  // Chart data: Region workload
  const regionWorkload = useMemo(() => {
    const map: Record<string, { region: string; total: number; overdue: number }> = {};
    applications.forEach((a) => {
      if (!map[a.region]) {
        map[a.region] = { region: a.region, total: 0, overdue: 0 };
      }
      map[a.region].total += 1;
      if (a.slaStatus === 'overdue') {
        map[a.region].overdue += 1;
      }
    });
    return Object.values(map);
  }, [applications]);

  // Chart data: Processing Age
  const ageDistribution = useMemo(() => {
    let b1 = 0, b2 = 0, b3 = 0, b4 = 0;
    applications.forEach((a) => {
      if (a.totalElapsedDays <= 7) b1++;
      else if (a.totalElapsedDays <= 14) b2++;
      else if (a.totalElapsedDays <= 30) b3++;
      else b4++;
    });
    return [
      { name: '0 - 7 Days', count: b1 },
      { name: '8 - 14 Days', count: b2 },
      { name: '15 - 30 Days', count: b3 },
      { name: '30+ Days (Critical)', count: b4 },
    ];
  }, [applications]);

  // Overdue cases list
  const criticalOverdueCases = applications.filter((a) => a.slaStatus === 'overdue');

  return (
    <div className="space-y-6">
      {/* Role Context Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0A2540] to-[#1E3A8A] rounded-2xl p-6 text-white shadow-lg border border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30 mb-2">
            <span>{user.roleTitle}</span> &bull; <span>{user.organization}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Integrated AICTE Approval Command Center
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Real-time monitoring of institutional applications, regulatory scrutiny SLAs, committee inspections, and mandatory compliance filings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {role === 'institution' && (
            <button
              onClick={onOpenNewAppModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit New Application</span>
            </button>
          )}

          {(role === 'regional_officer' || role === 'bureau_officer' || role === 'admin') && (
            <button
              onClick={() => onNavigateTab('pendency')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-all"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Review Overdue Cases ({overdueApps})</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('applications')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-all"
          >
            <span>View All Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards (Clickable to filter/open) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Applications */}
        <button
          onClick={() => onNavigateTab('applications')}
          className="text-left bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Volume</span>
            <FileText className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalApps}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across 8 Regional Bureaus</p>
        </button>

        {/* Pending In-Pipeline */}
        <button
          onClick={() => onNavigateTab('workflow')}
          className="text-left bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Stages</span>
            <Clock className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-indigo-700">{pendingApps}</p>
          <p className="text-[11px] text-slate-500 mt-1">Under active processing</p>
        </button>

        {/* Overdue SLA Cases */}
        <button
          onClick={() => onNavigateTab('pendency')}
          className={`text-left p-4 rounded-xl border shadow-xs transition-all group ${
            overdueApps > 0
              ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400 hover:shadow-md'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">
              SLA Overdue
            </span>
            <AlertOctagon className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-rose-700">{overdueApps}</p>
          <p className="text-[11px] text-rose-600 font-medium mt-1">Action & Escalation required</p>
        </button>

        {/* Approvals Issued */}
        <button
          onClick={() => onNavigateTab('applications')}
          className="text-left bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved EoA</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{completedApps}</p>
          <p className="text-[11px] text-slate-500 mt-1">Digitally signed orders</p>
        </button>

        {/* EVC Visits Pending */}
        <button
          onClick={() => onNavigateTab('evc')}
          className="text-left bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">EVC Visits</span>
            <Calendar className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-purple-700">{pendingEVCs}</p>
          <p className="text-[11px] text-slate-500 mt-1">Scheduled inspections</p>
        </button>

        {/* Compliance Deadlines */}
        <button
          onClick={() => onNavigateTab('compliance')}
          className="text-left bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Compliance</span>
            <ShieldAlert className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-amber-700">{approachingCompliance}</p>
          <p className="text-[11px] text-slate-500 mt-1">Undertakings tracked</p>
        </button>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Region-wise Workload */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Regional Bureau Workload & SLA Health</h3>
              <p className="text-xs text-slate-500">Total applications vs cases currently breaching SLA</p>
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
              Live Feed
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionWorkload} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="region" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#FFF',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total" name="Total Applications" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue Cases" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage-wise Distribution Pie / Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Application Pipeline Stage Distribution</h3>
              <p className="text-xs text-slate-500">Volume breakdown by current active regulatory workflow stage</p>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {stageDistribution.map((entry, index) => (
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
                <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Overdue Applications & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Critical Overdue Cases Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Critical Overdue Cases Requiring Attention</h3>
                <p className="text-xs text-slate-500">Cases exceeding regulatory SLA threshold</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('pendency')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All Pendency</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {criticalOverdueCases.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">Zero Overdue Cases</p>
                <p className="text-xs text-slate-500">All applications are operating within regulatory SLA timelines.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-4">Application ID</th>
                    <th className="py-2.5 px-4">Institution</th>
                    <th className="py-2.5 px-4">Current Stage</th>
                    <th className="py-2.5 px-4">Overdue Days</th>
                    <th className="py-2.5 px-4">Responsible</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criticalOverdueCases.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-rose-50/40 transition-colors cursor-pointer"
                      onClick={() => onSelectApplication(app.id)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {app.applicationNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-[200px] truncate">
                        {app.institutionName}
                        <span className="block text-[10px] text-slate-400">{app.region} Region</span>
                      </td>
                      <td className="py-3 px-4">
                        <StageBadge stage={app.currentStage} />
                      </td>
                      <td className="py-3 px-4">
                        <SLABadge status={app.slaStatus} overdueDays={app.overdueDays} />
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {app.assignedOfficer}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectApplication(app.id);
                          }}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-medium text-xs transition-colors"
                        >
                          Process
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Audit / Activity Stream */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Live Governance Stream</h3>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-[11px] text-blue-600 hover:underline font-medium"
            >
              Full Trail
            </button>
          </div>

          <div className="p-4 flex-1 space-y-3.5 overflow-y-auto max-h-[360px]">
            {auditLog.slice(0, 6).map((log) => (
              <div key={log.id} className="text-xs border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                  <span className="font-semibold text-slate-700">{log.actorName}</span>
                  <span>{formatDateIndian(log.timestamp)}</span>
                </div>
                <p className="font-medium text-slate-800 line-clamp-1">{log.reason || log.action}</p>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                    {log.applicationNumber}
                  </span>
                  <span className="font-mono text-slate-400 text-[9px] truncate max-w-[100px]">
                    {log.tamperProofHash.slice(0, 16)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
