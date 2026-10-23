import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
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
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
  onSearchClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenNotifications,
  onSearchClick,
}) => {
  const { role, user, setRole, notifications, resetDemoData } = useApp();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const rolesList: { role: UserRole; title: string; subtitle: string; icon: any }[] = [
    {
      role: 'institution',
      title: 'Institution / College Portal',
      subtitle: 'COEP Tech Pune (Principal Dr. Arvind Mehta)',
      icon: Building2,
    },
    {
      role: 'regional_officer',
      title: 'Regional Officer Dashboard',
      subtitle: 'Western Regional Office (WRO Mumbai)',
      icon: FileCheck,
    },
    {
      role: 'bureau_officer',
      title: 'Bureau Officer Dashboard',
      subtitle: 'Approval Bureau AICTE HQ (Dr. Sunita Sharma)',
      icon: Shield,
    },
    {
      role: 'evc_committee',
      title: 'EVC / Committee Portal',
      subtitle: 'Inspection Panel Chair (Prof. S. K. Ramanathan)',
      icon: Award,
    },
    {
      role: 'admin',
      title: 'System Administrator Portal',
      subtitle: 'e-Governance Cell AICTE New Delhi',
      icon: Users,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#07192C] text-white border-b border-slate-700/80 shadow-md">
      {/* National Tricolor Top Accent Strip */}
      <div className="tricolor-strip" />

      {/* Top Government Disclaimer & SIH bar */}
      <div className="bg-[#04101D] px-4 py-1.5 border-b border-slate-800 text-[11px] flex flex-wrap items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-xs bg-emerald-400 animate-pulse"></span>
          <span>Government of India &bull; All India Council for Technical Education (AICTE)</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline bg-blue-900/60 text-blue-200 px-2 py-0.5 rounded text-[10px] font-medium border border-blue-700/50">
            SIH Problem Statement ID: 26262
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-slate-400">Approval Process Cycle 2027-28</span>
          <button
            onClick={resetDemoData}
            title="Reset demonstration data to clean state"
            className="flex items-center gap-1 text-slate-300 hover:text-amber-300 transition-colors text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* National emblem / AICTE seal emblem */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-white shadow-inner border border-amber-400/40 shrink-0">
              <span className="tracking-tighter text-xs sm:text-sm font-extrabold">AICTE</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white leading-tight truncate">
                <span className="sm:hidden">AICTE Approval Workflow</span>
                <span className="hidden sm:inline">AICTE Approval Workflow & Compliance System</span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                Automated Stage Processing &bull; SLA Pendency Tracking &bull; EVC Scheduling &bull; Compliance
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right: Quick Search & Role Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <button
            onClick={onSearchClick}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 transition-colors"
            title="Search applications, colleges, or stages"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search applications (Ctrl+K)...</span>
          </button>

          {/* Interactive Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-medium border border-blue-400/40 shadow-sm transition-all"
              aria-expanded={showRoleMenu}
              aria-label="Select demo role"
            >
              <div className="text-left">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-blue-200 block font-normal leading-none">
                  Role:
                </span>
                <span className="font-semibold text-white truncate max-w-[100px] sm:max-w-[140px] block">
                  {user.roleTitle.split('(')[0].trim()}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-200 shrink-0" />
            </button>

            {showRoleMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 z-50 p-2 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 text-xs">
                    <p className="font-bold text-slate-900">Switch Active Demo Role</p>
                    <p className="text-[11px] text-slate-500">
                      Explore permissions and views for all 5 portal personas
                    </p>
                  </div>
                  <div className="mt-1 space-y-1">
                    {rolesList.map((item) => {
                      const Icon = item.icon;
                      const isCurrent = role === item.role;
                      return (
                        <button
                          key={item.role}
                          onClick={() => {
                            setRole(item.role);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-lg text-xs flex items-start gap-2.5 transition-colors ${
                            isCurrent
                              ? 'bg-blue-50 text-blue-900 font-semibold border border-blue-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 mt-0.5 shrink-0 ${
                              isCurrent ? 'text-blue-600' : 'text-slate-400'
                            }`}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">{item.title}</span>
                              {isCurrent && (
                                <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-normal">
                              {item.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label={`View notifications (${unreadCount} unread)`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-sm bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-1 ring-[#0A2540]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Mini */}
          <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-slate-700/60">
            <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-600/60 flex items-center justify-center text-xs font-bold text-amber-300">
              {user.avatarInitials}
            </div>
            <div className="text-left text-xs">
              <p className="font-semibold text-slate-100 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                {user.organization}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
