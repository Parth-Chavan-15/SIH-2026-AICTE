import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { login, logout, getSession } from '../../services/session';
import { REGULATORY_ROLES, type RegulatoryRole } from '../../features/auth/SessionGate';
import {
  Bell,
  RotateCcw,
  Menu,
  Shield,
  Building2,
  FileCheck,
  Award,
  Users,
  Search,
  ChevronDown,
  Sparkles,
  Clock,
  LogOut,
  Globe,
  Ban,
  CheckCircle,
  RefreshCw,
  X
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
  onSearchClick: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenNotifications,
  onSearchClick,
  onNavigateTab,
}) => {
  const { user, notifications, resetDemoData, triggerAdvanceClock, simulationTime } = useApp();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const session = getSession();
  const activeActor = session?.actor;

  // Determine current active regulatory role from session
  const activeRoleConfig = REGULATORY_ROLES.find(r => 
    (activeActor?.id === 'usr-inst-coep' && r.roleNumber === 1) ||
    (activeActor?.id === 'usr-scrutiny-reviewer' && r.roleNumber === 2) ||
    (activeActor?.id === 'usr-evc-chair' && r.roleNumber === 3) ||
    (activeActor?.id === 'usr-ro-western' && r.roleNumber === 4) ||
    (activeActor?.id === 'usr-bureau-hq' && r.roleNumber === 5) ||
    (activeActor?.id === 'usr-admin-hq' && r.roleNumber === 6)
  ) || REGULATORY_ROLES[0];

  const handleSwitchRole = async (email: string) => {
    setSwitchingRole(true);
    try {
      await login({ email, password: 'password123' });
      setShowRoleModal(false);
    } catch (err) {
      console.error('Failed to switch role', err);
    } finally {
      setSwitchingRole(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-b from-[#06182C] via-[#09223D] to-[#0A2540] text-white shadow-lg border-b border-white/10">
        <div className="px-4 sm:px-6 h-[64px] flex items-center justify-between gap-3">
          {/* Left: Hamburger & National Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none transition-all duration-150"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* AICTE Official Logo */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white flex items-center justify-center shrink-0 relative overflow-hidden shadow-md border border-amber-500/40 p-0.5">
                <img
                  src="/assets/logo_image/image_e867798b.png"
                  alt="AICTE Official Emblem"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight truncate">
                    AICTE PravahReg
                  </h1>
                  <span className="hidden md:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-400 text-slate-950 uppercase">
                    PS 26262
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block truncate">
                  National Digital Bureau • APH 2024–27 & 2026–27 Errata G02
                </p>
              </div>
            </div>
          </div>

          {/* Center Navigation Shortcuts: 8-Stage Studio & 5 Endpoints */}
          <div className="hidden xl:flex items-center gap-2">
            <button
              onClick={() => onNavigateTab?.('studio')}
              className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white text-xs font-bold border border-blue-400/30 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>🏛️ 8-Stage Master Studio</span>
            </button>

            <button
              onClick={() => onNavigateTab?.('endpoints')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 hover:text-white text-xs font-bold border border-emerald-400/30 flex items-center gap-1.5 transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-300" />
              <span>🌐 5 National Endpoints</span>
            </button>
          </div>

          {/* Right: Clock Simulator, Role Badge & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Regulatory Clock Simulator Header Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-mono text-[11px] text-slate-200 font-semibold">
                {simulationTime || '2026-10-24'}
              </span>
              <div className="flex items-center gap-1 ml-1 pl-1 border-l border-white/15">
                <button
                  onClick={() => triggerAdvanceClock(15)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600/60 hover:bg-blue-600 text-white transition-colors"
                  title="Advance clock by 15 days"
                >
                  +15d
                </button>
                <button
                  onClick={() => triggerAdvanceClock(60)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-600/60 hover:bg-amber-600 text-white transition-colors"
                  title="Advance clock by 60 days (Fire NOC window)"
                >
                  +60d
                </button>
              </div>
            </div>

            {/* Quick Search Button (Ctrl+K) */}
            <button
              onClick={onSearchClick}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs transition-all flex items-center gap-2 border border-white/10"
              title="Search applications (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Search</span>
              <kbd className="hidden md:inline text-[9px] font-mono bg-white/10 px-1 py-0.2 rounded text-slate-400">
                Ctrl+K
              </kbd>
            </button>

            {/* Active Role Selector Dropdown Pill */}
            <button
              onClick={() => setShowRoleModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-semibold shadow-sm border border-blue-400/30 transition-all active:scale-95"
              title="Click to switch authentic regulatory role"
            >
              <Shield className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <div className="text-left leading-tight">
                <span className="text-[9px] text-blue-200 font-normal block">Active Role:</span>
                <span className="truncate max-w-[120px] sm:max-w-[160px] block font-bold">
                  {activeRoleConfig.roleTitle}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-blue-200 shrink-0" />
            </button>

            {/* Reset Demo State Quick Action */}
            <button
              onClick={resetDemoData}
              title="Reset demonstration data"
              className="p-2 rounded-xl text-slate-400 hover:text-amber-300 hover:bg-white/10 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              aria-label={`Notifications (${unreadCount} unread)`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-3.5 min-w-3.5 px-1 items-center justify-center rounded-full text-[8px] font-bold bg-rose-600 text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              title="Logout session"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-all"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Authentic Role Switcher Modal Dialog */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center p-4" onClick={() => setShowRoleModal(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 anim-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#071A2E] to-[#0A2540] text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-base text-white">Switch Authentic Regulatory Role</h3>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Select any of the 6 official roles from Section 8.2 of the Master Engineering Specification.
                </p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-3">
              {REGULATORY_ROLES.map((r) => {
                const isCurrent = r.roleNumber === activeRoleConfig.roleNumber;
                return (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-50/80 border-blue-400 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {r.roleNumber}. {r.roleTitle}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {r.pdfCitation}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-700 text-white uppercase tracking-wider">
                              CURRENT ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-blue-700">{r.email}</div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {r.whatTheyDo}
                        </p>
                        <div className="text-[11px] text-rose-800 flex items-center gap-1 font-medium">
                          <Ban className="w-3 h-3 text-rose-600 inline shrink-0" />
                          <span>Statutory Guard: {r.legallyBlocked}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSwitchRole(r.email)}
                        disabled={switchingRole || isCurrent}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                          isCurrent
                            ? 'bg-blue-200 text-blue-900 cursor-default'
                            : 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                        }`}
                      >
                        {isCurrent ? 'Active' : switchingRole ? 'Authenticating...' : 'Authenticate'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
              Zero-Trust Architecture: Role switches issue genuine HttpOnly cookies through `/api/v1/auth/login`.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
