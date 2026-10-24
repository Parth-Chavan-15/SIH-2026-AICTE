import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../components/layout/Sidebar';
import { SLABadge, StageBadge } from '../../components/common/StatusBadge';
import { formatDateIndian } from '../../utils/slaCalculator';
import { api } from '../../services/api';
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
  X,
  Download,
  RefreshCw,
  ExternalLink,
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

  // State for Consolidated Statutory Reports Modal (Domain F.3)
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reportsData, setReportsData] = useState<any>(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsCategoryTab, setReportsCategoryTab] = useState<
    'pendency' | 'evc' | 'undertakings' | 'documents' | 'escalations' | 'regions'
  >('pendency');

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

  // Ageing Buckets Computation (Domain B.2: 0-7d, 8-15d, 16-30d, >30d)
  const ageingBuckets = useMemo(() => {
    return {
      '0-7d': applications.filter((a) => (a.elapsedDaysAtStage || 0) <= 7).length,
      '8-15d': applications.filter((a) => (a.elapsedDaysAtStage || 0) >= 8 && (a.elapsedDaysAtStage || 0) <= 15).length,
      '16-30d': applications.filter((a) => (a.elapsedDaysAtStage || 0) >= 16 && (a.elapsedDaysAtStage || 0) <= 30).length,
      '>30d': applications.filter((a) => (a.elapsedDaysAtStage || 0) > 30).length,
    };
  }, [applications]);

  // Automated Bottleneck Detection (Domain B.2)
  const bottleneckStage = useMemo(() => {
    const stageCounts: Record<string, { count: number; totalDays: number }> = {};
    applications.forEach((a) => {
      if (a.currentStage !== 'Approval Issued' && a.currentStage !== 'Application Rejected') {
        if (!stageCounts[a.currentStage]) {
          stageCounts[a.currentStage] = { count: 0, totalDays: 0 };
        }
        stageCounts[a.currentStage].count += 1;
        stageCounts[a.currentStage].totalDays += a.elapsedDaysAtStage || 0;
      }
    });
    let maxStage = 'Scrutiny Stage (Desk Verification)';
    let maxAvg = 0;
    Object.entries(stageCounts).forEach(([stage, data]) => {
      const avg = data.count > 0 ? data.totalDays / data.count : 0;
      if (avg > maxAvg) {
        maxAvg = avg;
        maxStage = stage;
      }
    });
    return { stage: maxStage, avgDays: Math.round(maxAvg || 12) };
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

  const handleOpenReports = async () => {
    setShowReportsModal(true);
    setReportsLoading(true);
    try {
      const res = await api.getConsolidatedReports();
      if (res && res.data) {
        setReportsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load consolidated reports', err);
    } finally {
      setReportsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 🏛️ Clean Executive Command Banner */}
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
              onClick={handleOpenReports}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center gap-2 transition-colors active:scale-[0.97]"
              title="Open the Consolidated 6-Category Statutory Reporting Hub (PS §F.3)"
            >
              <FileText className="w-4 h-4 text-indigo-200" />
              <span>Consolidated Reports (PS §F.3)</span>
            </button>

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

      {/* ⏱️ Application Ageing Distribution & Automated Bottleneck Console (PS §B.2) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 tracking-tight">Application Ageing Distribution &amp; Stage Velocity</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-semibold">PS 26262 §B.2</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Real-time pendency duration buckets across all 8 Regional Bureaus</p>
          </div>

          {/* Bottleneck Alert Banner */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Detected Bottleneck Stage:</span>{' '}
              <span className="font-semibold text-slate-900">{bottleneckStage.stage}</span>{' '}
              <span className="text-[10px] text-amber-700 font-mono font-bold">(Avg {bottleneckStage.avgDays}d)</span>
            </div>
          </div>
        </div>

        {/* 4 Ageing Bucket Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">0–7 Days</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">On-Track</span>
            </div>
            <p className="text-2xl font-extrabold font-mono text-emerald-900">{ageingBuckets['0-7d']}</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">Initial scrutiny &amp; intake</p>
          </div>

          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">8–15 Days</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">Moderate</span>
            </div>
            <p className="text-2xl font-extrabold font-mono text-blue-900">{ageingBuckets['8-15d']}</p>
            <p className="text-[10px] text-blue-700 mt-0.5">EVC &amp; verification loop</p>
          </div>

          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">16–30 Days</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">Approaching SLA</span>
            </div>
            <p className="text-2xl font-extrabold font-mono text-amber-900">{ageingBuckets['16-30d']}</p>
            <p className="text-[10px] text-amber-700 mt-0.5">Pre-escalation threshold</p>
          </div>

          <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">&gt;30 Days</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">Critical Overdue</span>
            </div>
            <p className="text-2xl font-extrabold font-mono text-rose-900">{ageingBuckets['>30d']}</p>
            <p className="text-[10px] text-rose-700 mt-0.5">Breaching handbook timelines</p>
          </div>
        </div>
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
              APH Cycle 2026-27
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

      {/* 🏛️ Consolidated 6-Category Reporting Hub Modal (PS §F.3) */}
      {showReportsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-[#0A2540] text-white p-5 flex items-start justify-between border-b border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                  <FileText className="w-6 h-6 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                      PS 26262 §F.3 &amp; §F.4
                    </span>
                    <span className="text-xs text-slate-300">Statutory Reporting Hub &bull; Cycle 2026-27</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
                    Consolidated AICTE Statutory Reports &amp; Case Closure Ledger
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setShowReportsModal(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Category Navigation Bar */}
            <div className="border-b border-slate-200 bg-slate-50 px-5 flex items-center gap-1 overflow-x-auto scrollbar-none text-xs font-semibold">
              <button
                onClick={() => setReportsCategoryTab('pendency')}
                className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                  reportsCategoryTab === 'pendency'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Stage-wise Pendency Register
              </button>
              <button
                onClick={() => setReportsCategoryTab('evc')}
                className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                  reportsCategoryTab === 'evc'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                2. EVC Scheduling &amp; Video/GPS
              </button>
              <button
                onClick={() => setReportsCategoryTab('undertakings')}
                className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                  reportsCategoryTab === 'undertakings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Time-Bound Undertakings
              </button>
              <button
                onClick={() => setReportsCategoryTab('documents')}
                className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                  reportsCategoryTab === 'documents'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                4. Document Validity Warnings
              </button>
              <button
                onClick={() => setReportsCategoryTab('escalations')}
                className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                  reportsCategoryTab === 'escalations'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                5. Overdue Escalations
              </button>
              <button
                onClick={() => setReportsCategoryTab('regions')}
                className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                  reportsCategoryTab === 'regions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                6. 8-Region Clearance Rates
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              {reportsLoading ? (
                <div className="p-12 text-center text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
                  <p className="font-semibold">Compiling statutory report data across all 8 regions...</p>
                </div>
              ) : !reportsData ? (
                <div className="p-8 text-center text-slate-500">
                  <p>No report data returned from backend.</p>
                </div>
              ) : (
                <>
                  {/* Category 1: Pendency */}
                  {reportsCategoryTab === 'pendency' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">Application Movement &amp; Stage-wise Ageing</span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          Total Monitored: {reportsData.summaryMetrics?.totalApplications || 0}
                        </span>
                      </div>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-[10px] uppercase">
                            <tr>
                              <th className="p-2.5">Application ID</th>
                              <th className="p-2.5">Institution</th>
                              <th className="p-2.5">Region</th>
                              <th className="p-2.5">Stage</th>
                              <th className="p-2.5">Ageing</th>
                              <th className="p-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reportsData.sixCategoryReports?.applicationPendency?.map((row: any) => (
                              <tr key={row.applicationId} className="hover:bg-slate-50">
                                <td className="p-2.5 font-mono font-bold text-blue-700">{row.applicationId}</td>
                                <td className="p-2.5 font-medium text-slate-800">{row.institutionName}</td>
                                <td className="p-2.5 text-slate-600">{row.region}</td>
                                <td className="p-2.5"><StageBadge stage={row.currentStage} /></td>
                                <td className="p-2.5 font-mono font-bold">{row.ageingDays}d</td>
                                <td className="p-2.5"><SLABadge status={row.slaStatus} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Category 2: EVC */}
                  {reportsCategoryTab === 'evc' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">EVC Scheduling &amp; 30-min Video/GPS Verification</span>
                        <span className="text-xs text-slate-500 font-mono">Chapter I (7d SLA) vs Chapter II (14d SLA)</span>
                      </div>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-[10px] uppercase">
                            <tr>
                              <th className="p-2.5">Application ID</th>
                              <th className="p-2.5">Institution</th>
                              <th className="p-2.5">Institution Category</th>
                              <th className="p-2.5">Visit Date</th>
                              <th className="p-2.5">30-min Video &amp; GPS</th>
                              <th className="p-2.5">EVC Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reportsData.sixCategoryReports?.evcStatus?.map((row: any) => (
                              <tr key={row.applicationId} className="hover:bg-slate-50">
                                <td className="p-2.5 font-mono font-bold text-blue-700">{row.applicationId}</td>
                                <td className="p-2.5 font-medium text-slate-800">{row.institutionName}</td>
                                <td className="p-2.5 font-semibold text-slate-700">{row.institutionType}</td>
                                <td className="p-2.5 font-mono">{row.scheduledDate || 'Queue Scheduled'}</td>
                                <td className="p-2.5">
                                  {row.videoAndGpsVerified ? (
                                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 font-semibold">Pending Video</span>
                                  )}
                                </td>
                                <td className="p-2.5 font-semibold">{row.evcStatus}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Category 3: Undertakings */}
                  {reportsCategoryTab === 'undertakings' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">Time-Bound Undertakings &amp; Compliance Deficits</span>
                        <span className="text-xs text-slate-500">6-Month Faculty &amp; 30-Day Lease Deeds (APH §2.20)</span>
                      </div>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-[10px] uppercase">
                            <tr>
                              <th className="p-2.5">Obligation ID</th>
                              <th className="p-2.5">Institution</th>
                              <th className="p-2.5">Condition Title</th>
                              <th className="p-2.5">Due Date</th>
                              <th className="p-2.5">Remaining</th>
                              <th className="p-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reportsData.sixCategoryReports?.undertakingCompliance?.map((row: any) => (
                              <tr key={row.obligationId} className="hover:bg-slate-50">
                                <td className="p-2.5 font-mono font-bold text-blue-700">{row.obligationId}</td>
                                <td className="p-2.5 font-medium text-slate-800">{row.institutionName}</td>
                                <td className="p-2.5 font-semibold text-slate-700">{row.conditionTitle}</td>
                                <td className="p-2.5 font-mono">{row.dueDate}</td>
                                <td className="p-2.5 font-mono font-bold">{row.daysRemaining}d</td>
                                <td className="p-2.5 font-semibold text-amber-800">{row.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Category 4: Documents */}
                  {reportsCategoryTab === 'documents' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">Prescribed Documents &amp; 60-Day Renewal Warnings</span>
                        <span className="text-xs text-slate-500">Fire NOC (1-yr) &amp; Land Lease (30-yr)</span>
                      </div>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-[10px] uppercase">
                            <tr>
                              <th className="p-2.5">Document Name</th>
                              <th className="p-2.5">Institution</th>
                              <th className="p-2.5">Category</th>
                              <th className="p-2.5">Expiry Date</th>
                              <th className="p-2.5">Remaining</th>
                              <th className="p-2.5">Validity Warning</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reportsData.sixCategoryReports?.documentValidity?.map((row: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="p-2.5 font-bold text-slate-900">{row.documentName}</td>
                                <td className="p-2.5 font-medium text-slate-800">{row.institutionName}</td>
                                <td className="p-2.5 text-slate-600">{row.category}</td>
                                <td className="p-2.5 font-mono">{row.expiryDate}</td>
                                <td className="p-2.5 font-mono font-bold">{row.daysRemaining}d</td>
                                <td className="p-2.5">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    row.status === 'Expiring Soon'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  }`}>
                                    {row.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Category 5: Escalations */}
                  {reportsCategoryTab === 'escalations' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">Overdue Cases &amp; Bureau Escalation Registry</span>
                        <span className="text-xs text-rose-600 font-semibold">Immediate Regulatory Escalation Required</span>
                      </div>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-[10px] uppercase">
                            <tr>
                              <th className="p-2.5">Case ID</th>
                              <th className="p-2.5">Institution</th>
                              <th className="p-2.5">Escalated Authority</th>
                              <th className="p-2.5">Statutory Reason</th>
                              <th className="p-2.5">Escalated At</th>
                              <th className="p-2.5">Priority</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reportsData.sixCategoryReports?.overdueAndEscalations?.map((row: any) => (
                              <tr key={row.caseId} className="hover:bg-slate-50">
                                <td className="p-2.5 font-mono font-bold text-rose-700">{row.caseId}</td>
                                <td className="p-2.5 font-medium text-slate-800">{row.institutionName}</td>
                                <td className="p-2.5 font-semibold text-slate-900">{row.escalatedTo}</td>
                                <td className="p-2.5 text-slate-700">{row.reason}</td>
                                <td className="p-2.5 font-mono">{formatDateIndian(row.escalatedAt)}</td>
                                <td className="p-2.5">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                    {row.priority}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Category 6: Regions */}
                  {reportsCategoryTab === 'regions' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">8 Regional AICTE Bureaus Processing Performance</span>
                        <span className="text-xs text-slate-500">Clearance Rates &amp; Overdue Index</span>
                      </div>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-[10px] uppercase">
                            <tr>
                              <th className="p-2.5">Regional Bureau</th>
                              <th className="p-2.5">Total Volume</th>
                              <th className="p-2.5">Cleared</th>
                              <th className="p-2.5">Pending</th>
                              <th className="p-2.5">Overdue Rate</th>
                              <th className="p-2.5">Clearance Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reportsData.sixCategoryReports?.regionWisePerformance?.map((row: any) => (
                              <tr key={row.region} className="hover:bg-slate-50">
                                <td className="p-2.5 font-bold text-slate-900">
                                  {row.region} &bull; {row.regionName}
                                </td>
                                <td className="p-2.5 font-mono font-bold">{row.totalApplications}</td>
                                <td className="p-2.5 font-mono text-emerald-700 font-bold">{row.clearedApplications}</td>
                                <td className="p-2.5 font-mono text-blue-700 font-bold">{row.pendingApplications}</td>
                                <td className="p-2.5 font-mono text-rose-700 font-bold">{row.overdueRatePercent}%</td>
                                <td className="p-2.5 font-mono text-emerald-800 font-bold">{row.clearanceRatePercent}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono">
                Statutory Reporting Hub &bull; AICTE Approval Process Handbook (APH 2026-27)
              </span>
              <button
                onClick={() => setShowReportsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
