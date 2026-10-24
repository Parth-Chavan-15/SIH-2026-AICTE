import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { logout, getSession } from '../../services/session';
import { REGULATORY_ROLES } from '../../features/auth/SessionGate';
import {
  Clock,
  LogOut,
  Sparkles,
  Shield,
  MapPin,
  FileCheck,
  Building2,
  Sliders,
  Award,
  ChevronDown,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
  onSearchClick: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateTab,
}) => {
  const { resetDemoData, triggerAdvanceClock, simulationTime } = useApp();
  const session = getSession();
  const activeActor = session?.actor;
  const [showClockPopover, setShowClockPopover] = useState(false);

  // Determine active regulatory role (1 to 6)
  const roleNumber: number =
    (activeActor?.id === 'usr-inst-coep' || activeActor?.id === 'usr-inst-vjti' || activeActor?.roles?.includes('institution')) ? 1 :
    (activeActor?.id === 'usr-scrutiny-reviewer' || (activeActor?.roles?.includes('reviewer') && !activeActor?.roles?.includes('regional_officer'))) ? 2 :
    (activeActor?.id === 'usr-evc-chair' || activeActor?.roles?.includes('evc')) ? 3 :
    (activeActor?.id === 'usr-ro-western' || activeActor?.roles?.includes('regional_officer')) ? 4 :
    (activeActor?.id === 'usr-bureau-hq' || activeActor?.roles?.includes('demo_authority') || activeActor?.roles?.includes('bureau_officer')) ? 5 :
    6;

  const activeRoleConfig = REGULATORY_ROLES.find(r => r.roleNumber === roleNumber) || REGULATORY_ROLES[3];

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#071A2E] text-white border-b border-slate-700/80 shadow-md">
      <div className="px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 min-h-[56px]">
        {/* Left: Official AICTE Emblem & Platform Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center p-1 shrink-0 shadow-xs">
            <img
              src="/assets/logo_image/image_e867798b.png"
              alt="AICTE Emblem"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white leading-tight">
                AICTE PravahReg
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                AY 2026–27
              </span>
              <span className="hidden md:inline-flex text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                WORM SHA-256
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden lg:block">
              Regulation Bureau Companion Layer &bull; PS 26262 Solution
            </p>
          </div>
        </div>

        {/* Center: Role-Dedicated Operational Status Card */}
        <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-xs text-xs">
          {roleNumber === 1 && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 font-bold text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Applicant Workspace
              </span>
              <span className="text-slate-300 font-medium hidden lg:inline">
                COEP Tech Univ &bull; ID: 1-435789102
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                <CheckCircle2 className="w-3 h-3" /> NSWS Ingested
              </span>
            </div>
          )}

          {roleNumber === 2 && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                Desk Scrutiny Cell
              </span>
              <span className="text-slate-300 font-medium hidden lg:inline">
                Roster: 2-SOC1770029225 &bull; 3/3 Experts
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                <Shield className="w-3 h-3" /> Snapshot v1 Guard Active
              </span>
            </div>
          )}

          {roleNumber === 3 && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60">
                <Award className="w-3.5 h-3.5 text-purple-400" />
                EVC Inspection Panel
              </span>
              <span className="text-slate-300 font-medium hidden lg:inline">
                GIITS Visakhapatnam
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/50">
                <MapPin className="w-3 h-3" /> GPS &amp; Video Validated
              </span>
            </div>
          )}

          {roleNumber === 4 && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Regional Desk (RO / RB)
              </span>
              <span className="text-slate-300 font-medium hidden lg:inline">
                Western Region (WRO)
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                <Clock className="w-3 h-3" /> 15-Day Concurrence Active
              </span>
            </div>
          )}

          {roleNumber === 5 && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 font-bold text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/60">
                <Award className="w-3.5 h-3.5 text-rose-400" />
                Approval Authority Gate
              </span>
              <span className="text-slate-300 font-medium hidden lg:inline">
                Council Executive Committee
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/50">
                <Shield className="w-3 h-3" /> Statutory DSC Armed
              </span>
            </div>
          )}

          {roleNumber === 6 && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                Policy &amp; Rules Engine
              </span>
              <span className="text-slate-300 font-medium hidden lg:inline">
                APH 2024–27 &amp; Errata G02
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/50">
                X=360 Boundary Active
              </span>
            </div>
          )}
        </div>

        {/* Right: Operational Tools, 8-Stage Studio, Clock Pill & Clean Sign Out */}
        <div className="flex items-center gap-2.5">
          {/* Flagship Demonstration Shortcut Button */}
          <button
            onClick={() => onNavigateTab?.('studio')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-xs font-semibold border border-blue-400/30 transition-colors"
            title="Open Master 8-Stage Demonstration Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">8-Stage Flow</span>
          </button>

          {/* Compact Regulatory Timers Simulation Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowClockPopover(!showClockPopover)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              title="Simulation Clock Controls"
            >
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-mono text-amber-300 text-[11px]">
                {simulationTime || '2026-10-24'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showClockPopover && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-3 z-50 text-xs space-y-2 anim-scale-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white">Simulation Clock</span>
                  <span className="font-mono text-amber-300 text-[11px]">{simulationTime || '2026-10-24'}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Advance date to test post-approval outbox timers and expiry alerts:
                </p>
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => { triggerAdvanceClock(7); setShowClockPopover(false); }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-center font-semibold text-[11px]"
                  >
                    +7 Days
                  </button>
                  <button
                    onClick={() => { triggerAdvanceClock(15); setShowClockPopover(false); }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-center font-semibold text-[11px]"
                    title="Triggers Land Lease 15-day alert"
                  >
                    +15 Days
                  </button>
                  <button
                    onClick={() => { triggerAdvanceClock(30); setShowClockPopover(false); }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-200 text-center font-semibold text-[11px]"
                    title="Triggers Fire NOC 30-day alert"
                  >
                    +30 Days
                  </button>
                </div>
                <button
                  onClick={() => { resetDemoData(); setShowClockPopover(false); }}
                  className="w-full mt-1.5 py-1 px-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 rounded border border-amber-500/40 text-center font-semibold text-[11px] flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Demo State</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Role Label */}
          <div className="text-right hidden xl:block leading-tight border-l border-slate-700/80 pl-3">
            <span className="text-xs font-bold text-white block">
              {activeRoleConfig.roleTitle}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Role #{activeRoleConfig.roleNumber} &bull; {activeRoleConfig.shortLabel}
            </span>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-200 hover:text-white text-xs font-semibold border border-rose-500/30 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Sign out of current authenticated session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
