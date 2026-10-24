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
  Users2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Building,
  Sparkles,
} from 'lucide-react';

export type NavTab =
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
  const { role, applications, complianceItems, expiringDocs, notifications, escalations } = useApp();

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
    badge?: number;
    badgeColor?: string;
    allowedRoles: string[];
    section?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Command Center',
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
      allowedRoles: ['regional_officer', 'bureau_officer', 'evc_committee', 'admin'],
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
      allowedRoles: ['regional_officer', 'bureau_officer', 'admin'],
      section: 'Monitoring & Reports',
    },
    {
      id: 'reports',
      label: '6-Category Reports & Siebel',
      icon: BarChart3,
      allowedRoles: ['regional_officer', 'bureau_officer', 'admin'],
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
      allowedRoles: ['regional_officer', 'bureau_officer', 'admin', 'evc_committee'],
      section: 'System Governance',
    },
    {
      id: 'rules',
      label: 'Policy Registry & Rules',
      icon: Sliders,
      allowedRoles: ['admin', 'bureau_officer'],
      section: 'System Governance',
    },
  ];

  // Group items by section
  const sections = Array.from(new Set(navItems.map((item) => item.section || 'General')));

  return (
    <>
      {/* Mobile backdrop */}
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
          background: 'linear-gradient(180deg, #081E34 0%, #0A2540 40%, #0C2D4A 100%)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          boxShadow: '4px 0 24px -4px rgba(0,0,0,0.15)',
        }}
      >
        {/* Sidebar Header Brand */}
        <div
          className="h-[60px] px-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(180deg, rgba(4,16,29,0.6), transparent)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
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
                  AICTE Portal
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  Workflow Engine v2.6
                </span>
              </div>
            )}
          </div>
          {!isMobile && (
            <button
              onClick={onToggle}
              className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200 active:scale-95"
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation items scrollable list */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {sections.map((secName) => {
            const sectionItems = navItems.filter((i) => i.section === secName);
            const visibleItems = sectionItems.filter(
              (i) => i.allowedRoles.includes('all') || i.allowedRoles.includes(role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={secName} className="space-y-0.5">
                {isOpen && (
                  <p className="px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500/70 mb-2">
                    {secName}
                  </p>
                )}
                {visibleItems.map((item) => {
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
                      className={`nav-item-transition w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium group ${
                        isActive
                          ? 'active bg-white/[0.08] text-white font-semibold'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600/90 text-white'
                          : 'bg-transparent text-slate-500 group-hover:text-blue-300 group-hover:bg-white/[0.04]'
                      }`}
                      style={isActive ? { boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)' } : {}}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      {isOpen && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}
                      {isOpen && item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold min-w-[20px] text-center ${
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
            className="p-3 text-[11px] text-slate-500"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.04)',
              background: 'linear-gradient(180deg, transparent, rgba(4,16,29,0.4))',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 badge-breathe"></span>
              <span className="font-medium text-slate-400 text-[10px]">NIC Gateway Connected</span>
            </div>
            <p className="text-[10px] text-slate-600">
              Role: <span className="text-slate-400 capitalize">{role.replace('_', ' ')}</span>
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
