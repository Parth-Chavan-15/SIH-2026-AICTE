import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../components/layout/Sidebar';
import { SLABadge, StageBadge } from '../../components/common/StatusBadge';
import { formatDateIndian } from '../../utils/slaCalculator';
import { GovernanceGlobe3D } from '../../components/3d/GovernanceGlobe3D';
import { motion } from 'motion/react';
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
  Shield,
  Layers,
  MapPin,
  HelpCircle,
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

// Government-themed palette: Deep Navy, Bharat Royal Blue, Cyan, Saffron/Amber, Forest Green, Coral Red (No purple gradients)
const COLORS = ['#1D4ED8', '#2563EB', '#0284C7', '#0D9488', '#059669', '#D97706', '#DC2626'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenNewAppModal,
  onSelectApplication,
}) => {
  const { role, user, applications, evcInspections, complianceItems, auditLog } = useApp();

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

  // Overdue cases list
  const criticalOverdueCases = applications.filter((a) => a.slaStatus === 'overdue');

  return (
    <div className="space-y-6">
      {/* 🏛️ Official AICTE Command Banner with Integrated 3D Regional Bureau Network */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#061828] via-[#0A2540] to-[#0E355C] text-white shadow-xl border border-slate-700/80"
      >
        {/* Subtle grid blueprint watermark */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 p-6 sm:p-7 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Administrative Metadata & Actions */}
          <div className="flex-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-950/90 text-blue-200 border border-blue-700/60 mb-3 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-xs bg-emerald-400"></span>
              <span>{user.roleTitle}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">{user.organization}</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              AICTE National Approval Command Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed font-normal">
              Statutory processing under the <strong className="text-white">Approval Process Handbook (APH 2024–27)</strong>.
              Real-time scrutiny workflow routing, committee inspection scheduling, and SLA timeline enforcement across 8 Regional Bureaus.
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-5">
              {role === 'institution' && (
                <button
                  onClick={onOpenNewAppModal}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Submit New Application</span>
                </button>
              )}

              {(role === 'regional_officer' || role === 'bureau_officer' || role === 'admin') && (
                <button
                  onClick={() => onNavigateTab('pendency')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white font-semibold text-xs border border-rose-500/50 shadow-md transition-all active:scale-95"
                >
                  <AlertOctagon className="w-4 h-4" />
                  <span>Review Overdue SLA Cases ({overdueApps})</span>
                </button>
              )}

              <button
                onClick={() => onNavigateTab('applications')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-600/70 shadow-xs transition-all active:scale-95"
              >
                <span>View All Applications</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Right: 3D Interactive National Governance Grid Globe */}
          <div className="w-full lg:w-72 xl:w-80 h-48 sm:h-56 shrink-0 flex flex-col items-center justify-center bg-[#04101D]/70 rounded-lg border border-slate-700/60 p-2 shadow-inner">
            <div className="w-full h-full relative">
              <GovernanceGlobe3D className="w-full h-full" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* 📊 Top 6 Primary Administrative KPI Metrics (Staggered Animation, No Pill Shapes) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: Total Volume */}
        <motion.button
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          onClick={() => onNavigateTab('applications')}
          className="text-left bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Volume</span>
            <FileText className="w-4 h-4 text-blue-700 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">{totalApps}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">8 Regional Bureaus</p>
        </motion.button>

        {/* Metric 2: Pending Stages */}
        <motion.button
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          onClick={() => onNavigateTab('workflow')}
          className="text-left bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-blue-500 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Active Stages</span>
            <Clock className="w-4 h-4 text-blue-700 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-blue-900 font-mono">{pendingApps}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Under scrutiny / review</p>
        </motion.button>

        {/* Metric 3: Overdue SLA Cases */}
        <motion.button
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          onClick={() => onNavigateTab('pendency')}
          className={`text-left p-4 rounded-lg border shadow-2xs transition-all group ${
            overdueApps > 0
              ? 'bg-rose-50/60 border-rose-300 hover:border-rose-500 hover:shadow-sm'
              : 'bg-white border-slate-200 hover:border-blue-400'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">SLA Overdue</span>
            <AlertOctagon className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-rose-700 font-mono">{overdueApps}</p>
          <p className="text-[11px] text-rose-700 font-medium mt-1">Escalation triggered</p>
        </motion.button>

        {/* Metric 4: Approved EoA */}
        <motion.button
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          onClick={() => onNavigateTab('applications')}
          className="text-left bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-emerald-500 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Approved EoA</span>
            <CheckCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-800 font-mono">{completedApps}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Orders digitally issued</p>
        </motion.button>

        {/* Metric 5: EVC Visits Pending (Cyan/Navy, No Purple) */}
        <motion.button
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          onClick={() => onNavigateTab('evc')}
          className="text-left bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-cyan-500 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">EVC Visits</span>
            <Calendar className="w-4 h-4 text-cyan-700 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-cyan-900 font-mono">{pendingEVCs}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Inspection queue</p>
        </motion.button>

        {/* Metric 6: Compliance Filings */}
        <motion.button
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          onClick={() => onNavigateTab('compliance')}
          className="text-left bg-white p-4 rounded-lg border border-slate-200 shadow-2xs hover:border-amber-500 hover:shadow-sm transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Compliance</span>
            <ShieldAlert className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-extrabold text-amber-800 font-mono">{approachingCompliance}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Undertakings tracked</p>
        </motion.button>
      </div>

      {/* 📈 Workload & Stage Distribution Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Region Workload Bar Chart */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Regional Bureau Workload & SLA Adherence</h3>
              <p className="text-xs text-slate-500">Distribution across 8 Regional AICTE jurisdictions</p>
            </div>
            <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              Live Monitoring
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionWorkload} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A2540',
                    color: '#FFF',
                    borderRadius: '6px',
                    fontSize: '11px',
                    border: '1px solid #1E3A8A',
                  }}
                />
                <Bar dataKey="total" name="Total Applications" fill="#1D4ED8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue SLA Cases" fill="#DC2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage-wise Donut Distribution */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Approval Stage-wise Application Pipeline</h3>
              <p className="text-xs text-slate-500">Active status distribution in regulatory workflow</p>
            </div>
            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              APH Cycle 2027-28
            </span>
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
                  outerRadius={82}
                  innerRadius={46}
                  paddingAngle={3}
                >
                  {stageDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A2540',
                    color: '#FFF',
                    borderRadius: '6px',
                    fontSize: '11px',
                    border: '1px solid #1E3A8A',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', marginTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ⚠️ Critical Overdue Applications & Live Activity Stream Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Critical Overdue Cases Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Overdue Cases Requiring Statutory Attention</h3>
                <p className="text-[11px] text-slate-500">Applications currently breaching handbook SLA limits</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('pendency')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
            >
              <span>View Pendency Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {criticalOverdueCases.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">Zero Overdue Cases</p>
                <p className="text-xs text-slate-500">All applications are currently operating within prescribed timelines.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Application ID</th>
                    <th className="py-2.5 px-3">Institution Name</th>
                    <th className="py-2.5 px-3">Current Stage</th>
                    <th className="py-2.5 px-3">SLA Status</th>
                    <th className="py-2.5 px-3">Responsible Officer</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criticalOverdueCases.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-rose-50/50 transition-colors cursor-pointer"
                      onClick={() => onSelectApplication(app.id)}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {app.applicationNumber}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 max-w-[200px] truncate">
                        {app.institutionName}
                        <span className="block text-[10px] text-slate-500 font-normal">{app.region} Region</span>
                      </td>
                      <td className="py-3 px-3">
                        <StageBadge stage={app.currentStage} />
                      </td>
                      <td className="py-3 px-3">
                        <SLABadge status={app.slaStatus} overdueDays={app.overdueDays} />
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {app.assignedOfficer}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectApplication(app.id);
                          }}
                          className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-700 hover:text-white font-semibold text-xs transition-colors"
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

        {/* Right 1 Col: Live Audit / Governance Stream */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-700" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Audit Log Stream</h3>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs text-blue-700 hover:underline font-semibold"
            >
              Full Trail
            </button>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[360px]">
            {auditLog.slice(0, 6).map((log) => (
              <div key={log.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-slate-500 text-[10px] mb-1">
                  <span className="font-bold text-slate-800">{log.actorName}</span>
                  <span className="font-mono text-slate-400">{formatDateIndian(log.timestamp)}</span>
                </div>
                <p className="font-medium text-slate-800 line-clamp-1">{log.reason || log.action}</p>
                <div className="flex items-center justify-between mt-1 text-[10px]">
                  <span className="font-mono text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-medium">
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
