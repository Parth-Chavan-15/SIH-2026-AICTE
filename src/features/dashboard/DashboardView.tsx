import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../components/layout/Sidebar';
import { SLABadge, StageBadge } from '../../components/common/StatusBadge';
import { formatDateIndian } from '../../utils/slaCalculator';
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
  Sparkles,
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

// Government-themed palette
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

  // KPI card definitions
  const kpiCards = [
    { label: 'Total Volume', value: totalApps, sub: '8 Regional Bureaus', icon: FileText, color: 'text-blue-700', bgHover: 'hover:border-blue-400', tab: 'applications' as NavTab },
    { label: 'Active Stages', value: pendingApps, sub: 'Under scrutiny / review', icon: Clock, color: 'text-blue-700', bgHover: 'hover:border-blue-400', tab: 'workflow' as NavTab },
    { label: 'SLA Overdue', value: overdueApps, sub: 'Escalation triggered', icon: AlertOctagon, color: 'text-rose-600', bgHover: 'hover:border-rose-400', tab: 'pendency' as NavTab, isDanger: overdueApps > 0 },
    { label: 'Approved EoA', value: completedApps, sub: 'Orders digitally issued', icon: CheckCircle, color: 'text-emerald-600', bgHover: 'hover:border-emerald-400', tab: 'applications' as NavTab },
    { label: 'EVC Visits', value: pendingEVCs, sub: 'Inspection queue', icon: Calendar, color: 'text-cyan-700', bgHover: 'hover:border-cyan-400', tab: 'evc' as NavTab },
    { label: 'Compliance', value: approachingCompliance, sub: 'Undertakings tracked', icon: ShieldAlert, color: 'text-amber-600', bgHover: 'hover:border-amber-400', tab: 'compliance' as NavTab },
  ];

  return (
    <div className="space-y-6">
      {/* 🏛️ Clean Executive Command Banner with link to 3D Workflow Simulator */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-7 text-white"
        style={{
          background: 'linear-gradient(135deg, #071A2E 0%, #0A2540 50%, #153E65 100%)',
          boxShadow: '0 4px 20px -4px rgba(7, 26, 46, 0.4)',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Integrated Workflow Automation & Compliance System
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Real-time scrutiny routing, committee inspection scheduling, and SLA timeline enforcement across 8 Regional Bureaus under APH 2026-27.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">

            {role === 'institution' && (
              <button
                onClick={onOpenNewAppModal}
                className="btn-gov-saffron flex items-center gap-2 active:scale-[0.97]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Application</span>
              </button>
            )}

            {(role === 'regional_officer' || role === 'bureau_officer' || role === 'admin') && (
              <button
                onClick={() => onNavigateTab('pendency')}
                className="px-3.5 py-2.5 rounded-xl text-white font-semibold text-xs bg-rose-600 hover:bg-rose-700 shadow-xs flex items-center gap-2 transition-colors active:scale-[0.97]"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Review Overdue ({overdueApps})</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('applications')}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors flex items-center gap-1.5"
            >
              <span>All Applications</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            </button>
          </div>
        </div>
      </div>

      {/* 📊 KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.button
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigateTab(kpi.tab)}
              className={`kpi-card text-left p-4 rounded-xl border group ${
                kpi.isDanger
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-white border-slate-200/80'
              } ${kpi.bgHover}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  kpi.isDanger ? 'text-rose-700' : 'text-slate-500'
                }`}>
                  {kpi.label}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-110 ${
                  kpi.isDanger ? 'bg-rose-100' : 'bg-slate-50'
                }`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <p className={`text-[26px] font-extrabold font-mono leading-none ${
                kpi.isDanger ? 'text-rose-700' : 'text-slate-900'
              }`}>
                {kpi.value}
              </p>
              <p className={`text-[10px] mt-1.5 font-medium ${
                kpi.isDanger ? 'text-rose-600' : 'text-slate-500'
              }`}>
                {kpi.sub}
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* 📈 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Region Workload Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="chart-container p-5"
        >
          <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Regional Bureau Workload & SLA Adherence</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Distribution across 8 Regional AICTE jurisdictions</p>
            </div>
            <span
              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                color: '#1e40af',
                border: '1px solid #bfdbfe',
              }}
            >
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
                    borderRadius: '8px',
                    fontSize: '11px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}
                />
                <Bar dataKey="total" name="Total Applications" fill="#1D4ED8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue SLA Cases" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Stage-wise Donut Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="chart-container p-5"
        >
          <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Approval Stage-wise Application Pipeline</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Active status distribution in regulatory workflow</p>
            </div>
            <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
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
                  stroke="none"
                >
                  {stageDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0A2540',
                    color: '#FFF',
                    borderRadius: '8px',
                    fontSize: '11px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', marginTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ⚠️ Overdue Cases & Live Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Critical Overdue Cases */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 overflow-hidden"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div
            className="p-4 flex items-center justify-between"
            style={{
              background: 'linear-gradient(180deg, #f8fafc, #ffffff)',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Overdue Cases Requiring Statutory Attention</h3>
                <p className="text-[10px] text-slate-500">Applications currently breaching handbook SLA limits</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('pendency')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-blue-50"
            >
              <span>View Pendency Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {criticalOverdueCases.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-slate-800">Zero Overdue Cases</p>
                <p className="text-xs text-slate-500 mt-1">All applications are currently operating within prescribed timelines.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-600 font-bold" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-wider">Application ID</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-wider">Institution Name</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-wider">Current Stage</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-wider">SLA Status</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-wider">Responsible Officer</th>
                    <th className="py-3 px-4 text-right text-[10px] uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criticalOverdueCases.map((app) => (
                    <tr
                      key={app.id}
                      className="table-row-hover cursor-pointer"
                      onClick={() => onSelectApplication(app.id)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {app.applicationNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-[200px] truncate">
                        {app.institutionName}
                        <span className="block text-[10px] text-slate-500 font-normal">{app.region} Region</span>
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
                          className="btn-gov-primary !py-1.5 !px-3 !text-[11px]"
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
        </motion.div>

        {/* Right: Live Audit Stream */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="bg-white rounded-xl border border-slate-200/80 flex flex-col"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div
            className="p-4 flex items-center justify-between"
            style={{
              background: 'linear-gradient(180deg, #f8fafc, #ffffff)',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5 text-blue-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Audit Log Stream</h3>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-blue-50"
            >
              Full Trail
            </button>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[360px]">
            {auditLog.slice(0, 6).map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
                className="text-xs pb-3 last:pb-0"
                style={{ borderBottom: index < 5 ? '1px solid #f1f5f9' : 'none' }}
              >
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="font-bold text-slate-800">{log.actorName}</span>
                  <span className="font-mono text-slate-400">{formatDateIndian(log.timestamp)}</span>
                </div>
                <p className="font-medium text-slate-700 line-clamp-1">{log.reason || log.action}</p>
                <div className="flex items-center justify-between mt-1.5 text-[10px]">
                  <span
                    className="font-mono font-medium px-2 py-0.5 rounded-md"
                    style={{
                      background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                      color: '#1e40af',
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    {log.applicationNumber}
                  </span>
                  <span className="font-mono text-slate-400 text-[9px] truncate max-w-[100px]">
                    {log.tamperProofHash.slice(0, 16)}...
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
