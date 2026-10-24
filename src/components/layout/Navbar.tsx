import React from 'react';
import { useApp } from '../../context/AppContext';
import { logout, getSession } from '../../services/session';
import { REGULATORY_ROLES } from '../../features/auth/SessionGate';
import {
  Clock,
  LogOut,
  Sparkles,
  Globe,
  RotateCcw
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

  // Identify active regulatory role configuration from session
  const activeRoleConfig = REGULATORY_ROLES.find(r => 
    (activeActor?.id === 'usr-inst-coep' && r.roleNumber === 1) ||
    (activeActor?.id === 'usr-scrutiny-reviewer' && r.roleNumber === 2) ||
    (activeActor?.id === 'usr-evc-chair' && r.roleNumber === 3) ||
    (activeActor?.id === 'usr-ro-western' && r.roleNumber === 4) ||
    (activeActor?.id === 'usr-bureau-hq' && r.roleNumber === 5) ||
    (activeActor?.id === 'usr-admin-hq' && r.roleNumber === 6)
  ) || REGULATORY_ROLES[3]; // default to RO if unspecified

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Sign out error', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#071A2E] text-white border-b border-slate-700/80 shadow-md">
      <div className="px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 min-h-[58px]">
        {/* Left: Emblem & National Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-400/40 flex items-center justify-center font-bold text-orange-400 text-sm shrink-0">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-tight text-white leading-tight">
                AICTE Regulation Bureau &bull; PravahReg Companion Layer
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                AY 2026–27
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                WORM HMAC-SHA256
              </span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block">
              Companion Layer for Upstream NSWS &amp; Siebel Portals &bull; PS 26262 Solution
            </p>
          </div>
        </div>

        {/* Center: Simulated Regulatory Clock Controller */}
        <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
          <span className="text-slate-400 font-medium">📅 Clock:</span>
          <span className="font-mono font-bold text-amber-300">
            {simulationTime || '2026-10-24'}
          </span>
          <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
            <button
              type="button"
              onClick={() => triggerAdvanceClock(7)}
              className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold transition-colors"
              title="Advance simulated clock by 7 days"
            >
              +7d
            </button>
            <button
              type="button"
              onClick={() => triggerAdvanceClock(15)}
              className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold transition-colors"
              title="Advance simulated clock by 15 days (Triggers Land Lease alert)"
            >
              +15d
            </button>
            <button
              type="button"
              onClick={() => triggerAdvanceClock(30)}
              className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold transition-colors"
              title="Advance simulated clock by 30 days (Triggers Fire NOC alert)"
            >
              +30d
            </button>
            <button
              type="button"
              onClick={resetDemoData}
              className="px-2 py-0.5 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 text-[11px] font-semibold border border-amber-500/40 transition-colors"
              title="Reset demo clock and seed state"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right: Authenticated Role Identity & Clean Sign Out Button */}
        <div className="flex items-center gap-3">
          {/* Flagship Demonstration Shortcut Button */}
          <button
            onClick={() => onNavigateTab?.('studio')}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-xs font-semibold border border-blue-400/30 transition-colors"
            title="Open Master 8-Stage Demonstration Studio"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>8-Stage Flow</span>
          </button>

          <div className="text-right hidden sm:block leading-tight">
            <span className="text-xs font-bold text-white block">
              {activeRoleConfig.roleTitle}
            </span>
            <span className="text-[10px] text-slate-300 block">
              Role #{activeRoleConfig.roleNumber} &bull; {activeRoleConfig.shortLabel}
            </span>
          </div>

          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-200 hover:text-white text-xs font-semibold border border-rose-500/30 transition-colors flex items-center gap-1.5"
            title="Sign out of current authenticated session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
