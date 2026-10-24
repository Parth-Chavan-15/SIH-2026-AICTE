import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { login, logout, getSession } from '../../services/session';
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
  const [switchingRole, setSwitchingRole] = useState(false);

  const ROLES_LIST = [
    { num: 1, label: 'Applicant', icon: Building2, email: 'principal@coep.ac.in', tab: 'inst-apps', activeClass: 'bg-blue-600 text-white shadow-xs' },
    { num: 2, label: 'Scrutiny Cell', icon: FileCheck, email: 'scrutiny.reviewer@aicte.gov.in', tab: 'scrutiny-eval', activeClass: 'bg-amber-600 text-white shadow-xs' },
    { num: 3, label: 'EVC Committee', icon: Award, email: 'evc.chair@aicte.gov.in', tab: 'evc-inspect', activeClass: 'bg-purple-600 text-white shadow-xs' },
    { num: 4, label: 'Regional Desk', icon: Shield, email: 'ro.western@aicte.gov.in', tab: 'ro-pendency', activeClass: 'bg-emerald-600 text-white shadow-xs' },
    { num: 5, label: 'Approval Bureau', icon: Award, email: 'bureau.approval@aicte.gov.in', tab: 'ca-decision', activeClass: 'bg-rose-600 text-white shadow-xs' },
    { num: 6, label: 'Policy Admin', icon: Sliders, email: 'admin@aicte.gov.in', tab: 'admin-policy', activeClass: 'bg-slate-700 text-white shadow-xs' },
  ];

  const handleSwitchRole = async (targetRoleNumber: number, targetEmail: string, targetTab: string) => {
    setSwitchingRole(true);
    try {
      await login({ email: targetEmail, password: 'password123' });
      onNavigateTab?.(targetTab);
    } catch (err) {
      console.error('Role switch failed:', err);
    } finally {
      setSwitchingRole(false);
    }
  };

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
        {/* Left: Official NiyamSetu Brand with Emblem */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-auto flex items-center justify-center p-0.5 shrink-0 bg-white/10 rounded-lg border border-white/20">
            <img
              src="/niyamsetu-logo.png"
              alt="NiyamSetu Logo"
              className="h-9 w-auto object-contain rounded"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white leading-tight">
                NiyamSetu <span className="text-xs font-normal text-teal-300">(नियमसेतु)</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                AY 2026–27
              </span>
              <span className="hidden md:inline-flex text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                WORM SHA-256
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-300 tracking-wider hidden lg:block uppercase">
              Bridging Rules &bull; Empowering Institutions
            </p>
          </div>
        </div>

        {/* Center: Interactive One-Click Multi-Role Demonstration Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <div className="flex items-center gap-1 bg-slate-900/95 p-1 rounded-xl border border-slate-700/80 shadow-inner">
            {ROLES_LIST.map((r) => {
              const Icon = r.icon;
              const isActive = roleNumber === r.num;
              return (
                <button
                  key={r.num}
                  disabled={switchingRole}
                  onClick={() => handleSwitchRole(r.num, r.email, r.tab)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? r.activeClass + ' ring-1 ring-white/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  } ${switchingRole ? 'opacity-50 cursor-wait' : ''}`}
                  title={`Switch to Role ${r.num}: ${r.label}`}
                >
                  <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-black/40 text-white/90">
                    #{r.num}
                  </span>
                  <span className="hidden xl:inline">{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* College Quick-Switcher when in Role 1 */}
          {roleNumber === 1 && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-xl border border-blue-900/60 text-[11px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase pr-1">Tenant:</span>
              {[
                { id: 'coep', label: 'COEP (NBA)', email: 'principal@coep.ac.in' },
                { id: 'giits', label: 'GIITS (Non-NBA)', email: 'principal@giits.ac.in' },
                { id: 'pdimtr', label: 'PDIMTR (Lease)', email: 'principal@pdimtr.ac.in' },
              ].map((col) => {
                const isColActive = (activeActor as any)?.email === col.email || activeActor?.id === `usr-inst-${col.id}`;
                return (
                  <button
                    key={col.id}
                    disabled={switchingRole}
                    onClick={() => handleSwitchRole(1, col.email, 'inst-apps')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      isColActive
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {col.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Operational Tools, Clock Pill & Clean Sign Out */}
        <div className="flex items-center gap-2.5">

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
