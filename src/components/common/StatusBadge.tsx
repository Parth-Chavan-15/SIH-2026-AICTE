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
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
        style={{
          background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
          color: '#9f1239',
          border: '1px solid #fecdd3',
        }}
      >
        <AlertCircle className="w-3.5 h-3.5 text-rose-600 badge-breathe" />
        <span className="font-mono">OVERDUE ({overdueDays}d)</span>
      </span>
    );
  }
  if (status === 'approaching_deadline') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
        style={{
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          color: '#92400e',
          border: '1px solid #fde68a',
        }}
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
        <span className="font-mono">EXPIRING ({daysRemaining}d left)</span>
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
      style={{
        background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
        color: '#065f46',
        border: '1px solid #a7f3d0',
      }}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      <span className="font-mono">WITHIN SLA</span>
    </span>
  );
};

export const StageBadge: React.FC<{ stage: WorkflowStage }> = ({ stage }) => {
  let bgGrad = 'linear-gradient(135deg, #f8fafc, #f1f5f9)';
  let textColor = '#334155';
  let borderColor = '#e2e8f0';
  let icon = <Clock className="w-3.5 h-3.5 text-slate-500" />;

  switch (stage) {
    case 'Draft':
      bgGrad = 'linear-gradient(135deg, #f8fafc, #f1f5f9)';
      textColor = '#475569';
      borderColor = '#e2e8f0';
      break;
    case 'Application Submitted':
      bgGrad = 'linear-gradient(135deg, #eff6ff, #dbeafe)';
      textColor = '#1e40af';
      borderColor = '#bfdbfe';
      break;
    case 'Scrutiny in Progress':
      bgGrad = 'linear-gradient(135deg, #eef2ff, #e0e7ff)';
      textColor = '#3730a3';
      borderColor = '#c7d2fe';
      break;
    case 'Deficiency Communicated':
      bgGrad = 'linear-gradient(135deg, #fffbeb, #fef3c7)';
      textColor = '#92400e';
      borderColor = '#fde68a';
      icon = <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />;
      break;
    case 'Scrutiny Cleared':
      bgGrad = 'linear-gradient(135deg, #f0fdfa, #ccfbf1)';
      textColor = '#115e59';
      borderColor = '#99f6e4';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />;
      break;
    case 'EVC Scheduled':
      bgGrad = 'linear-gradient(135deg, #ecfeff, #cffafe)';
      textColor = '#155e75';
      borderColor = '#a5f3fc';
      break;
    case 'EVC Inspection Completed':
      bgGrad = 'linear-gradient(135deg, #ecfdf5, #d1fae5)';
      textColor = '#065f46';
      borderColor = '#a7f3d0';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      break;
    case 'SAC / SHC Review':
      bgGrad = 'linear-gradient(135deg, #fff7ed, #ffedd5)';
      textColor = '#9a3412';
      borderColor = '#fed7aa';
      icon = <AlertCircle className="w-3.5 h-3.5 text-orange-600" />;
      break;
    case 'Executive Committee Approval':
      bgGrad = 'linear-gradient(135deg, #f0f9ff, #e0f2fe)';
      textColor = '#075985';
      borderColor = '#bae6fd';
      break;
    case 'Approval Issued':
      bgGrad = 'linear-gradient(135deg, #ecfdf5, #d1fae5)';
      textColor = '#065f46';
      borderColor = '#6ee7b7';
      icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      break;
    case 'Application Rejected':
      bgGrad = 'linear-gradient(135deg, #fff1f2, #ffe4e6)';
      textColor = '#9f1239';
      borderColor = '#fecdd3';
      icon = <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
      break;
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
      style={{
        background: bgGrad,
        color: textColor,
        border: `1px solid ${borderColor}`,
      }}
    >
      {icon}
      {stage}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  if (priority === 'High') {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide"
        style={{
          background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
          color: '#be123c',
          border: '1px solid #fecdd3',
        }}
      >
        HIGH
      </span>
    );
  }
  if (priority === 'Medium') {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide"
        style={{
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          color: '#b45309',
          border: '1px solid #fde68a',
        }}
      >
        MED
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide"
      style={{
        background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
        color: '#475569',
        border: '1px solid #e2e8f0',
      }}
    >
      LOW
    </span>
  );
};
