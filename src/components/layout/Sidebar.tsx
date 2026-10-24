import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  FolderKanban,
  GitMerge,
  Clock,
  CalendarCheck,
  ShieldCheck,
  FileWarning,
  BellRing,
  BarChart3,
  History,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Globe2,
} from 'lucide-react';

export type NavTab =
  | 'studio'
  | 'endpoints'
  | 'overview'
  | 'applications'
  | 'workflow'
  | 'evc'
  | 'compliance'
  | 'pendency'
  | 'documents'
  | 'notifications'
  | 'reports'
  | 'audit'
  | 'rules';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onToggle,
  isMobile,
}) => {
  const { role, applications, complianceItems, expiringDocs, notifications } = useApp();

  const overdueCount = applications.filter((a) => a.slaStatus === 'overdue').length;
  const expiringCount = expiringDocs.filter((d) => d.daysUntilExpiry <= 30).length;
  const pendingComplianceCount = complianceItems.filter(
    (c) => c.status === 'Pending Evidence' || c.status === 'Overdue'
  ).length;
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const navItems: {
    id: NavTab;
    label: string;
    icon: any;
    badge?: number | string;
    badgeColor?: string;
    allowedRoles: string[];
    section?: string;
  }[] = [
    {
      id: 'studio',
      label: '8-Stage Master Flow',
      icon: Sparkles,
      badge: 'LIVE DEMO',
      badgeColor: 'bg-amber-400 text-slate-950 font-bold',
      allowedRoles: ['all'],
      section: 'Flagship Demonstration',
    },
    {
      id: 'endpoints',
      label: '5 National Endpoints',
      icon: Globe2,
      badge: 'API SETU',
      badgeColor: 'bg-emerald-400 text-slate-950 font-bold',
      allowedRoles: ['all'],
      section: 'Flagship Demonstration',
    },
    {
      id: 'overview',
      label: 'Executive Command Center',
      icon: LayoutDashboard,
      allowedRoles: ['all'],
      section: 'Approval Operations',
    },
    {
      id: 'applications',
      label: 'Applications Pipeline',
      icon: FolderKanban,
      badge: applications.length,
      allowedRoles: ['all'],
      section: 'Approval Operations',
    },
    {
      id: 'workflow',
      label: 'Scrutiny & Stages',
      icon: GitMerge,
      allowedRoles: ['all'],
      section: 'Approval Operations',
    },
    {
      id: 'evc',
      label: 'EVC Inspection Queue',
      icon: CalendarCheck,
      allowedRoles: ['all'],
      section: 'Approval Operations',
    },
    {
      id: 'compliance',
      label: 'Post-Approval Compliance',
      icon: ShieldCheck,
      badge: pendingComplianceCount,
      badgeColor: 'bg-amber-500 text-white',
      allowedRoles: ['all'],
      section: 'Compliance & Validity',
    },
    {
      id: 'documents',
      label: 'Document & Lease Validity',
      icon: FileWarning,
      badge: expiringCount,
      badgeColor: 'bg-amber-500 text-white',
      allowedRoles: ['all'],
      section: 'Compliance & Validity',
    },
    {
      id: 'pendency',
      label: 'SLA Pendency & Alerts',
      icon: Clock,
      badge: overdueCount,
      badgeColor: 'bg-rose-500 text-white',
      allowedRoles: ['all'],
      section: 'Monitoring & Reports',
    },
    {
      id: 'reports',
      label: '6-Category Reports',
      icon: BarChart3,
      allowedRoles: ['all'],
      section: 'Monitoring & Reports',
    },
    {
      id: 'notifications',
      label: 'Outbox Reminders',
      icon: BellRing,
      badge: unreadNotifs,
      badgeColor: 'bg-blue-600 text-white',
      allowedRoles: ['all'],
      section: 'Monitoring & Reports',
    },
    {
      id: 'audit',
      label: 'Immutable Audit Trail',
      icon: History,
      allowedRoles: ['all'],
      section: 'System Governance',
    },
    {
      id: 'rules',
      label: 'Policy Registry & Rules',
      icon: Sliders,
      allowedRoles: ['all'],
      section: 'System Governance',
    },
  ];

  const sections = Array.from(new Set(navItems.map((item) => item.section || 'General')));

  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-30 modal-backdrop"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-35 flex flex-col text-slate-200 transition-all duration-300 ease-in-out ${
          isMobile
            ? isOpen
              ? 'w-[272px] translate-x-0'
              : '-translate-x-full w-[272px]'
            : isOpen
            ? 'w-[260px] translate-x-0 static'
            : 'w-[68px] translate-x-0 static'
        }`}
        style={{
          background: 'linear-gradient(180deg, #071A2E 0%, #0A2540 40%, #0B2C4C 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '4px 0 24px -4px rgba(0,0,0,0.2)',
        }}
      >
        {/* Sidebar Header Brand */}
        <div
          className="h-[64px] px-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(180deg, rgba(4,16,29,0.7), transparent)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-[10px] text-white"
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              GOV
            </div>
            {isOpen && (
              <div className="overflow-hidden anim-fade-in">
                <span className="font-bold text-sm tracking-tight text-white block truncate">
                  AICTE CaseFlow
                </span>
                <span className="text-[10px] text-slate-400 block truncate font-mono">
                  PravahReg Engine
                </span>
              </div>
            )}
          </div>
          {!isMobile && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation items scrollable list */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-4">
          {sections.map((secName) => {
            const sectionItems = navItems.filter((i) => i.section === secName);
            if (sectionItems.length === 0) return null;

            return (
              <div key={secName} className="space-y-1">
                {isOpen && (
                  <p className="px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400/80 mb-1.5">
                    {secName}
                  </p>
                )}
                {sectionItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        if (isMobile) onToggle();
                      }}
                      title={!isOpen ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25 ring-1 ring-blue-400/40'
                          : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-300'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isOpen && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}
                      {isOpen && item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono min-w-[18px] text-center ${
                            item.badgeColor || 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        {isOpen && (
          <div
            className="p-3.5 text-[11px] text-slate-400 border-t border-white/5 bg-slate-950/30"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-200 text-[11px]">NIC Gateway Connected</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              WORM Cryptographic Chain: Active
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
