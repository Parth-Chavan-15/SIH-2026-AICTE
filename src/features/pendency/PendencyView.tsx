import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, SLAStatusType } from '../../types';
import { SLABadge, StageBadge } from '../../components/common/StatusBadge';
import {
  Clock,
  AlertOctagon,
  AlertTriangle,
  CheckCircle,
  Filter,
  User,
  ArrowRight,
  ShieldAlert,
  Flame,
  Building,
} from 'lucide-react';

interface PendencyViewProps {
  onSelectApplication: (appId: string) => void;
}

export const PendencyView: React.FC<PendencyViewProps> = ({ onSelectApplication }) => {
  const { applications } = useApp();

  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | SLAStatusType>('All');
  const [selectedStageGroup, setSelectedStageGroup] = useState('All');

  // Filter applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // Exclude already finalized
      if (app.currentStage === 'Approval Issued' || app.currentStage === 'Application Rejected') {
        return false;
      }
      const matchRegion = selectedRegion === 'All' || app.region === selectedRegion;
      const matchStatus = selectedStatus === 'All' || app.slaStatus === selectedStatus;
      const matchStage = selectedStageGroup === 'All' || app.currentStage === selectedStageGroup;
      return matchRegion && matchStatus && matchStage;
    });
  }, [applications, selectedRegion, selectedStatus, selectedStageGroup]);

  // Group by stage
  const groupedByStage = useMemo(() => {
    const map: Record<string, Application[]> = {};
    filteredApps.forEach((app) => {
      if (!map[app.currentStage]) map[app.currentStage] = [];
      map[app.currentStage].push(app);
    });
    return map;
  }, [filteredApps]);

  // Bottleneck detection (stages with highest overdue or highest elapsed)
  const bottlenecks = useMemo(() => {
    const stageCounts: Record<string, { total: number; overdue: number; maxOverdue: number }> = {};
    applications.forEach((a) => {
      if (!stageCounts[a.currentStage]) {
        stageCounts[a.currentStage] = { total: 0, overdue: 0, maxOverdue: 0 };
      }
      stageCounts[a.currentStage].total++;
      if (a.slaStatus === 'overdue') {
        stageCounts[a.currentStage].overdue++;
        stageCounts[a.currentStage].maxOverdue = Math.max(
          stageCounts[a.currentStage].maxOverdue,
          a.overdueDays
        );
      }
    });

    return Object.entries(stageCounts)
      .filter(([_, stats]) => stats.overdue > 0)
      .sort((a, b) => b[1].overdue - a[1].overdue);
  }, [applications]);

  const totalOverdue = applications.filter((a) => a.slaStatus === 'overdue').length;
  const totalApproaching = applications.filter((a) => a.slaStatus === 'approaching_deadline').length;
  const totalOnTrack = applications.filter((a) => a.slaStatus === 'within_sla').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            SLA Pendency & Bottleneck Monitoring
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of processing durations against official AICTE regulatory SLA thresholds
          </p>
        </div>

        {/* Metric Badges */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            Overdue: {totalOverdue}
          </span>
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Approaching: {totalApproaching}
          </span>
          <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            On Track: {totalOnTrack}
          </span>
        </div>
      </div>

      {/* Bottleneck Alert Banner */}
      {bottlenecks.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-rose-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Flame className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  Critical Processing Bottlenecks Detected
                </span>
                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  AUTO-FLAGGED
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
                Stage &ldquo;{bottlenecks[0][0]}&rdquo; currently has {bottlenecks[0][1].overdue} cases exceeding configured SLA (max overdue: {bottlenecks[0][1].maxOverdue} days). Automated reminders and Bureau escalations active.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedStageGroup(bottlenecks[0][0])}
            className="px-3.5 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs shrink-0 transition-colors"
          >
            Filter This Bottleneck
          </button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters:</span>
        </div>

        {/* Region */}
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Regions</option>
          <option value="Northern">Northern</option>
          <option value="Western">Western</option>
          <option value="Southern">Southern</option>
          <option value="Eastern">Eastern</option>
          <option value="South-Western">South-Western</option>
          <option value="Central">Central</option>
          <option value="North-West">North-West</option>
        </select>

        {/* SLA Status */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All SLA Statuses</option>
          <option value="overdue">Overdue Only (Red)</option>
          <option value="approaching_deadline">Approaching Deadline (Amber)</option>
          <option value="within_sla">Within SLA (Green)</option>
        </select>

        {/* Stage */}
        <select
          value={selectedStageGroup}
          onChange={(e) => setSelectedStageGroup(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All">All Stage Groups</option>
          {Object.keys(groupedByStage).map((stg) => (
            <option key={stg} value={stg}>
              {stg}
            </option>
          ))}
        </select>

        {(selectedRegion !== 'All' || selectedStatus !== 'All' || selectedStageGroup !== 'All') && (
          <button
            onClick={() => {
              setSelectedRegion('All');
              setSelectedStatus('All');
              setSelectedStageGroup('All');
            }}
            className="text-xs text-blue-600 font-semibold hover:underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Stage Grouped Pendency Cards & Applications */}
      <div className="space-y-6">
        {Object.entries(groupedByStage).map(([stageName, apps]) => {
          const overdueInStage = apps.filter((a) => a.slaStatus === 'overdue').length;

          return (
            <div
              key={stageName}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Stage Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-slate-900">{stageName}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {apps.length} Cases
                  </span>
                  {overdueInStage > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3 text-rose-600" />
                      {overdueInStage} Overdue
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500">
                  Configured Stage SLA: <strong className="text-slate-800">{apps[0]?.stageDeadlineDays || 7} Days</strong>
                </div>
              </div>

              {/* Stage Cases Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/60 text-slate-600 font-semibold border-b border-slate-200">
                      <th className="py-2.5 px-4">Application ID</th>
                      <th className="py-2.5 px-4">Institution Name</th>
                      <th className="py-2.5 px-4">Time at Stage</th>
                      <th className="py-2.5 px-4">SLA Deadline / Status</th>
                      <th className="py-2.5 px-4">Responsible Officer</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {apps.map((app) => (
                      <tr
                        key={app.id}
                        onClick={() => onSelectApplication(app.id)}
                        className={`hover:bg-blue-50/40 transition-colors cursor-pointer ${
                          app.slaStatus === 'overdue' ? 'bg-rose-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {app.applicationNumber}
                          {app.isEscalated && (
                            <span className="block text-[10px] text-rose-700 font-sans font-bold">
                              &bull; Escalated to Bureau
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {app.institutionName}
                          <span className="block text-[10px] text-slate-400">
                            {app.city}, {app.region} Region
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800">{app.elapsedDaysAtStage} Days</span>
                          <span className="block text-[10px] text-slate-400">
                            Total {app.totalElapsedDays}d elapsed
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <SLABadge
                            status={app.slaStatus}
                            overdueDays={app.overdueDays}
                            daysRemaining={Math.max(0, app.stageDeadlineDays - app.elapsedDaysAtStage)}
                          />
                          <span className="block text-[10px] text-slate-500 mt-0.5">
                            SLA: {app.stageDeadlineDays} days
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{app.assignedOfficer}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectApplication(app.id);
                            }}
                            className="px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-medium text-xs transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
