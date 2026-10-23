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
  Sparkles,
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
    <header className="sticky top-0 z-40 bg-gradient-to-b from-[#071A2E] to-[#0A2540] text-white shadow-lg" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Main Bar */}
      <div className="px-4 sm:px-6 h-[60px] flex items-center justify-between gap-4">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition-all duration-200 active:scale-95"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* AICTE Emblem */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center font-bold text-white shrink-0 relative overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3), inset 0 1px 0 rgba(255,255,255,0.25)' }}>
              <span className="tracking-tighter text-[10px] sm:text-xs font-extrabold relative z-10">AICTE</span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight truncate">
                <span className="sm:hidden">AICTE Approval Workflow</span>
                <span className="hidden sm:inline">AICTE Approval Workflow & Compliance System</span>
              </h1>
              <p className="text-[10px] text-slate-500 hidden sm:block truncate">
                Automated Stage Processing &bull; SLA Pendency Tracking &bull; EVC Scheduling &bull; Compliance
              </p>
            </div>
          </div>
        </div>

        {/* Center/Right: Quick Search & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Search Button */}
          <button
            onClick={onSearchClick}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs transition-all duration-200 group"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            title="Search applications, colleges, or stages"
          >
            <Search className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors duration-200" />
            <span>Search applications...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-white/5 text-slate-500 border border-white/10">
              Ctrl+K
            </kbd>
          </button>

          {/* Interactive Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-lg text-white text-xs font-medium transition-all duration-200 active:scale-[0.97] group"
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(29, 78, 216, 0.95))',
                border: '1px solid rgba(96, 165, 250, 0.25)',
                boxShadow: '0 1px 4px rgba(37, 99, 235, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
              aria-expanded={showRoleMenu}
              aria-label="Select demo role"
            >
              <div className="text-left">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-blue-200/70 block font-normal leading-none">
                  Role:
                </span>
                <span className="font-semibold text-white truncate max-w-[100px] sm:max-w-[140px] block">
                  {user.roleTitle.split('(')[0].trim()}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-200/60 shrink-0 transition-transform duration-300 ${showRoleMenu ? 'rotate-180' : ''}`} />
            </button>

            {showRoleMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowRoleMenu(false)}
                />
                <div
                  className="absolute right-0 mt-2.5 w-80 bg-white rounded-xl text-slate-800 z-50 p-1.5 anim-scale-in overflow-hidden"
                  style={{ boxShadow: '0 20px 60px -15px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)' }}
                >
                  <div className="px-3.5 py-2.5 mb-1" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <p className="font-bold text-sm text-slate-900">Switch Active Demo Role</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Explore permissions and views for all 5 portal personas
                    </p>
                  </div>
                  <div className="space-y-0.5">
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
                          className={`w-full text-left p-2.5 rounded-lg text-xs flex items-start gap-2.5 transition-all duration-200 ${
                            isCurrent
                              ? 'bg-blue-50 text-blue-900 font-semibold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                          style={isCurrent ? { border: '1px solid rgba(37, 99, 235, 0.15)' } : { border: '1px solid transparent' }}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isCurrent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">{item.title}</span>
                              {isCurrent && (
                                <span className="bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wider uppercase">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-normal truncate">
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

          {/* Reset Demo Quick Action */}
          <button
            onClick={resetDemoData}
            title="Reset demonstration data"
            className="p-2 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/5 transition-all duration-200 active:scale-95 group"
            aria-label="Reset demo data"
          >
            <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-95"
            aria-label={`View notifications (${unreadCount} unread)`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Mini */}
          <div className="hidden lg:flex items-center gap-2.5 pl-3 ml-1" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-amber-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {user.avatarInitials}
            </div>
            <div className="text-left text-xs">
              <p className="font-semibold text-slate-200 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
                {user.organization}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
