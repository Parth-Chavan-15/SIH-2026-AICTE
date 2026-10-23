import React from 'react';
import { SLAStatusType, WorkflowStage, PriorityLevel } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';

interface SLAProps {
  status: SLAStatusType;
  overdueDays?: number;
  daysRemaining?: number;
}

export const SLABadge: React.FC<SLAProps> = ({ status, overdueDays = 0, daysRemaining = 0 }) => {
  if (status === 'overdue') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
        <span className="font-mono">OVERDUE ({overdueDays}d)</span>
      </span>
    );
  }
  if (status === 'approaching_deadline') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
        <span className="font-mono">EXPIRING ({daysRemaining}d left)</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
      <span className="font-mono">WITHIN SLA</span>
    </span>
  );
};

export const StageBadge: React.FC<{ stage: WorkflowStage }> = ({ stage }) => {
  let style = 'bg-slate-100 text-slate-800 border-slate-300';
  let icon = <Clock className="w-3.5 h-3.5 text-slate-600" />;

  switch (stage) {
    case 'Draft':
      style = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
    case 'Application Submitted':
      style = 'bg-blue-50 text-blue-800 border-blue-200';
      break;
    case 'Scrutiny in Progress':
      style = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      break;
    case 'Deficiency Communicated':
      style = 'bg-amber-50 text-amber-900 border-amber-300 font-semibold';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />;
      break;
    case 'Scrutiny Cleared':
      style = 'bg-teal-50 text-teal-800 border-teal-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />;
      break;
    case 'EVC Scheduled':
      style = 'bg-cyan-50 text-cyan-800 border-cyan-200';
      break;
    case 'EVC Inspection Completed':
      style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      break;
    case 'SAC / SHC Review':
      style = 'bg-orange-50 text-orange-800 border-orange-200';
      icon = <AlertCircle className="w-3.5 h-3.5 text-orange-600" />;
      break;
    case 'Executive Committee Approval':
      style = 'bg-sky-50 text-sky-800 border-sky-200';
      break;
    case 'Approval Issued':
      style = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      break;
    case 'Application Rejected':
      style = 'bg-rose-50 text-rose-800 border-rose-300 font-semibold';
      icon = <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${style}`}>
      {icon}
      {stage}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  if (priority === 'High') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">HIGH</span>;
  }
  if (priority === 'Medium') {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-700 border border-amber-200">MED</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">LOW</span>;
};
