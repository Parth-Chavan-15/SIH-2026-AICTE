import React from 'react';
import { AICTEWorkflow3D } from '../../components/3d/AICTEWorkflow3D';
import { Sparkles, ShieldCheck, Clock, Award, Layers, HelpCircle, CheckCircle2 } from 'lucide-react';

export const WorkflowSimulationView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                3D Workflow Simulation Engine
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                SIH 2026 Innovation USP
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Interactive 3D digital twin of AICTE statutory approval lifecycles (PS 26262). Explore configurable application pathways, desk scrutiny checks, committee review, and post-approval compliance tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
            Approval Process Handbook 2026-27
          </span>
        </div>
      </div>

      {/* 3D Visualizer Main Engine */}
      <AICTEWorkflow3D />

      {/* Explanatory Cards for Evaluation & Judges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-blue-700 font-bold">
            <Layers className="w-4 h-4" />
            <h4>1. Configurable Workflow Routing</h4>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Statutory routes adapt dynamically to institutional profiles. Compliant institutions proceed via fast-track desk scrutiny, while capacity increases branch automatically into EVC inspections.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-rose-600 font-bold">
            <Clock className="w-4 h-4" />
            <h4>2. SLA Clock & Escalation Matrix</h4>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Every stage tracks working days against handbook deadlines (e.g., 7-day scrutiny SLA). Breaches trigger automated alerts to Regional and Bureau Officers.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-600 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <h4>3. Post-Approval Compliance Orbit</h4>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Approval is not the end of monitoring. The compliance branch continuously tracks land lease expiries, municipal fire certificates, and mandatory institutional undertakings.
          </p>
        </div>
      </div>
    </div>
  );
};
