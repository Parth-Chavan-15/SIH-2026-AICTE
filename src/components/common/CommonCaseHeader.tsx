import React from 'react';
import { Building, Shield, Calendar, Tag, Users, CheckCircle, AlertTriangle } from 'lucide-react';

export interface CommonCaseHeaderProps {
  applicationId: string;
  reference?: string;
  institutionName: string;
  institutionCode: string;
  category: string;
  academicYear: string;
  currentStage: string;
  policyRevisionId?: string;
  assignedScrutinyGroup?: string;
  assignedEVCGroup?: string;
  evcRequired?: boolean;
}

export const CommonCaseHeader: React.FC<CommonCaseHeaderProps> = ({
  applicationId,
  reference,
  institutionName,
  institutionCode,
  category,
  academicYear,
  currentStage,
  policyRevisionId,
  assignedScrutinyGroup,
  assignedEVCGroup,
  evcRequired,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{institutionName}</h2>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-300">
              {institutionCode}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
            <span>App ID: <strong className="text-slate-800">{applicationId}</strong></span>
            <span>&bull;</span>
            <span>PID: <strong className="text-slate-800">{reference || '1-435789102'}</strong></span>
            <span>&bull;</span>
            <span>AY: <strong className="text-slate-800">{academicYear}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            {currentStage}
          </span>
          {policyRevisionId && (
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-50 text-purple-700 border border-purple-200" title="Pinned Route Policy Version">
              Rule: {policyRevisionId}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <Tag className="w-4 h-4 text-slate-400" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
            <span className="font-medium text-slate-800">{category.replace(/_/g, ' ').toUpperCase()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Users className="w-4 h-4 text-blue-500" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Desk Scrutiny</span>
            <span className="font-medium text-slate-800">{assignedScrutinyGroup || 'SCR-GROUP-A'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Shield className="w-4 h-4 text-indigo-500" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">EVC Panel</span>
            <span className="font-medium text-slate-800">
              {evcRequired === false ? (
                <span className="text-emerald-700 font-semibold">Bypassed (NBA ≥670)</span>
              ) : (
                assignedEVCGroup || 'EVC-GROUP-A'
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-4 h-4 text-amber-500" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Regulatory Intake</span>
            <span className="font-medium text-slate-800">NSWS Simulated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
