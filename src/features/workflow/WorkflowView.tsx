import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, WorkflowStage, WorkflowRouteType } from '../../types';
import { SLABadge, StageBadge } from '../../components/common/StatusBadge';
import { formatDateIndian } from '../../utils/slaCalculator';
import { getEligibleNextStages, validateWorkflowTransition } from '../../utils/workflowEngine';
import {
  GitMerge,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Shield,
  FileCheck,
  Building,
  Info,
  Clock,
  Layers,
} from 'lucide-react';

interface WorkflowViewProps {
  onSelectApplication: (appId: string) => void;
}

export const WorkflowView: React.FC<WorkflowViewProps> = ({ onSelectApplication }) => {
  const { role, user, applications, transitionStage } = useApp();

  const [selectedRouteFilter, setSelectedRouteFilter] = useState<'All' | WorkflowRouteType>('All');
  const [selectedAppId, setSelectedAppId] = useState<string>(applications[0]?.id || '');
  const [targetStage, setTargetStage] = useState<WorkflowStage | ''>('');
  const [reasonInput, setReasonInput] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Filter applications by route
  const filteredApps = applications.filter(
    (a) => selectedRouteFilter === 'All' || a.routeType === selectedRouteFilter
  );

  const currentApp = applications.find((a) => a.id === selectedAppId) || applications[0];

  const eligibleTransitions = currentApp
    ? getEligibleNextStages(currentApp.currentStage, currentApp.routeType)
    : [];

  const handleExecute = async () => {
    if (!currentApp || !targetStage) return;
    const opt = eligibleTransitions.find((o) => o.stage === targetStage);
    if (!opt) return;

    const validation = validateWorkflowTransition(role, opt, reasonInput);
    if (!validation.isValid) {
      setActionError(validation.errorMessage || 'Action not permitted');
      return;
    }

    setActionError(null);
    setProcessing(true);
    try {
      await transitionStage(currentApp.id, targetStage, reasonInput);
      setTargetStage('');
      setReasonInput('');
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setProcessing(false);
    }
  };

  // Route stages map for diagram
  const getRouteStages = (route: WorkflowRouteType): WorkflowStage[] => {
    switch (route) {
      case 'Scrutiny Only':
        return [
          'Application Submitted',
          'Scrutiny in Progress',
          'Scrutiny Cleared',
          'Executive Committee Approval',
          'Approval Issued',
        ];
      case 'Scrutiny + EVC':
        return [
          'Application Submitted',
          'Scrutiny in Progress',
          'Scrutiny Cleared',
          'EVC Scheduled',
          'EVC Inspection Completed',
          'Executive Committee Approval',
          'Approval Issued',
        ];
      case 'Scrutiny + EVC + SAC/SHC':
        return [
          'Application Submitted',
          'Scrutiny in Progress',
          'Deficiency Communicated',
          'EVC Scheduled',
          'EVC Inspection Completed',
          'SAC / SHC Review',
          'Executive Committee Approval',
          'Approval Issued',
        ];
      case 'Fast-Track EoA':
        return [
          'Application Submitted',
          'Scrutiny in Progress',
          'Scrutiny Cleared',
          'Approval Issued',
        ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Workflow Automation & Route Execution
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable regulatory state-machine routes with permission gating and deficiency feedback loops
          </p>
        </div>

        {/* Route Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-2xs overflow-x-auto">
          {(['All', 'Scrutiny Only', 'Scrutiny + EVC', 'Scrutiny + EVC + SAC/SHC', 'Fast-Track EoA'] as const).map(
            (r) => (
              <button
                key={r}
                onClick={() => setSelectedRouteFilter(r as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedRouteFilter === r
                    ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {r}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Dual-Column Workflow Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Applications Selector (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Workflow Cases ({filteredApps.length})
            </h3>
            <span className="text-[11px] text-slate-400">Select to inspect</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[580px] pr-1">
            {filteredApps.map((app) => {
              const isSelected = currentApp?.id === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => {
                    setSelectedAppId(app.id);
                    setTargetStage('');
                    setActionError(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-400'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {app.applicationNumber}
                    </span>
                    <SLABadge status={app.slaStatus} overdueDays={app.overdueDays} />
                  </div>
                  <p className="font-semibold text-xs text-slate-800 truncate">
                    {app.institutionName}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span className="truncate max-w-[130px]">{app.routeType}</span>
                    <span className="font-medium text-slate-700">{app.currentStage}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Workflow Route Visualizer & Transition Engine (8 Cols) */}
        {currentApp && (
          <div className="lg:col-span-8 space-y-6">
            
            {/* Active Application Dossier Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {currentApp.applicationNumber}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Route: {currentApp.routeType}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{currentApp.institutionName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentApp.program} &bull; {currentApp.proposedIntake} Seats &bull; {currentApp.region} Region
                  </p>
                </div>

                <button
                  onClick={() => onSelectApplication(currentApp.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shrink-0"
                >
                  View Full Dossier
                </button>
              </div>

              {/* Visual Route Pipeline Steps */}
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Configured Workflow Pipeline Path
                </p>

                <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-thin">
                  {getRouteStages(currentApp.routeType).map((stg, idx, arr) => {
                    const isCurrent = currentApp.currentStage === stg;
                    const isPassed =
                      currentApp.timeline.some((t) => t.stage === stg && t.status === 'completed') ||
                      (currentApp.currentStage === 'Approval Issued' && stg !== 'Approval Issued');

                    return (
                      <React.Fragment key={stg}>
                        <div
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium shrink-0 border transition-all ${
                            isCurrent
                              ? 'bg-blue-600 text-white font-bold border-blue-700 shadow-xs ring-2 ring-blue-300'
                              : isPassed
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Clock className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-white' : 'text-slate-400'}`} />
                          )}
                          <span className="whitespace-nowrap">{stg}</span>
                        </div>
                        {idx < arr.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Status & Timing Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Current Stage</span>
                  <span className="font-bold text-slate-900 mt-1 block">{currentApp.currentStage}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Stage Ageing</span>
                  <span className="font-bold text-slate-900 mt-1 block">{currentApp.elapsedDaysAtStage} Days</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">SLA Threshold</span>
                  <span className="font-bold text-slate-900 mt-1 block">{currentApp.stageDeadlineDays} Days Allowed</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Assigned Officer</span>
                  <span className="font-bold text-slate-900 mt-1 block truncate">{currentApp.assignedOfficer}</span>
                </div>
              </div>
            </div>

            {/* Interactive Transition Executor Console */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Authorized Stage Transition Console
                    </h4>
                    <p className="text-xs text-slate-500">
                      Executing as: <span className="font-semibold text-slate-800">{user.roleTitle}</span>
                    </p>
                  </div>
                </div>
              </div>

              {eligibleTransitions.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <p className="font-semibold">Workflow Terminus Reached</p>
                  <p className="mt-1 text-slate-500">
                    Application has finalized at &ldquo;{currentApp.currentStage}&rdquo;. No further transitions are pending.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Select Next Eligible Stage:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {eligibleTransitions.map((opt) => (
                        <button
                          key={opt.stage}
                          onClick={() => {
                            setTargetStage(opt.stage);
                            setActionError(null);
                          }}
                          className={`text-left p-3.5 rounded-xl border transition-all ${
                            targetStage === opt.stage
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{opt.actionLabel}</span>
                            {opt.actionType === 'return' && (
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${targetStage === opt.stage ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'}`}>
                                Return Loop
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] mt-1 ${targetStage === opt.stage ? 'text-blue-100' : 'text-slate-500'}`}>
                            {opt.description}
                          </p>
                          <div className="mt-2 text-[10px] opacity-80">
                            Required Role: {opt.requiredRole.join(' or ')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {targetStage && (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                      <label className="font-bold text-slate-800 block">
                        Official Regulatory Justification & Audit Note:
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Provide mandatory reason or official inspection remarks (min 10 characters)..."
                        value={reasonInput}
                        onChange={(e) => setReasonInput(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />

                      {actionError && (
                        <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 bg-rose-50 p-2 rounded border border-rose-200">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                          <span>{actionError}</span>
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-slate-500">
                          Action will be digitally stamped into immutable audit log
                        </span>
                        <button
                          onClick={handleExecute}
                          disabled={processing}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{processing ? 'Processing...' : 'Authorize Stage Transition'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
