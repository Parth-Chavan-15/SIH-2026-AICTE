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
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'applications'
  | 'workflow'
  | 'pendency'
  | 'evc'
  | 'compliance'
  | 'documents'
  | 'notifications'
  | 'reports'
  | 'audit'
  | 'rules'
  | 'users';

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
      label: 'Overview',
      icon: LayoutDashboard,
      allowedRoles: ['all'],
      section: 'Core Operations',
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: FolderKanban,
      badge: applications.length,
      allowedRoles: ['all'],
      section: 'Core Operations',
    },
    {
      id: 'workflow',
      label: 'Approval Workflow',
      icon: GitMerge,
      allowedRoles: ['all'],
      section: 'Core Operations',
    },
    {
      id: 'pendency',
      label: 'Pendency Monitoring',
      icon: Clock,
      badge: overdueCount,
      badgeColor: 'bg-rose-500 text-white',
      allowedRoles: ['regional_officer', 'bureau_officer', 'admin'],
      section: 'Monitoring & Inspection',
    },
    {
      id: 'evc',
      label: 'EVC Scheduling',
      icon: CalendarCheck,
      allowedRoles: ['regional_officer', 'bureau_officer', 'evc_committee', 'admin'],
      section: 'Monitoring & Inspection',
    },
    {
      id: 'compliance',
      label: 'Institutional Compliance',
      icon: ShieldCheck,
      badge: pendingComplianceCount,
      badgeColor: 'bg-amber-500 text-white',
      allowedRoles: ['all'],
      section: 'Compliance & Validity',
    },
    {
      id: 'documents',
      label: 'Document Expiry',
      icon: FileWarning,
      badge: expiringCount,
      badgeColor: 'bg-amber-500 text-white',
      allowedRoles: ['all'],
      section: 'Compliance & Validity',
    },
    {
      id: 'notifications',
      label: 'Notifications & Escalations',
      icon: BellRing,
      badge: unreadNotifs,
      badgeColor: 'bg-blue-600 text-white',
      allowedRoles: ['all'],
      section: 'Governance & Analytics',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      allowedRoles: ['regional_officer', 'bureau_officer', 'admin'],
      section: 'Governance & Analytics',
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      icon: History,
      allowedRoles: ['regional_officer', 'bureau_officer', 'admin', 'evc_committee'],
      section: 'Governance & Analytics',
    },
    {
      id: 'rules',
      label: 'Rules & Configuration',
      icon: Sliders,
      allowedRoles: ['admin', 'bureau_officer'],
      section: 'System Administration',
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users2,
      allowedRoles: ['admin', 'bureau_officer'],
      section: 'System Administration',
    },
  ];

  // Group items by section
  const sections = Array.from(new Set(navItems.map((item) => item.section || 'General')));

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 backdrop-blur-xs"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-35 flex flex-col bg-[#0A2540] text-slate-200 transition-all duration-300 ease-in-out border-r border-slate-700/60 shadow-xl ${
          isMobile
            ? isOpen
              ? 'w-72 translate-x-0'
              : '-translate-x-full w-72'
            : isOpen
            ? 'w-64 translate-x-0 static'
            : 'w-20 translate-x-0 static'
        }`}
      >
        {/* Sidebar Header Brand for Desktop */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-700/60 bg-[#061828]">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 font-black text-xs text-white">
              GOV
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <span className="font-bold text-sm tracking-tight text-white block truncate">
                  AICTE Portal
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  Workflow Engine v2.6
                </span>
              </div>
            )}
          </div>
          {!isMobile && (
            <button
              onClick={onToggle}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation items scrollable list */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6 scrollbar-thin">
          {sections.map((secName) => {
            const sectionItems = navItems.filter((i) => i.section === secName);
            const visibleItems = sectionItems.filter(
              (i) => i.allowedRoles.includes('all') || i.allowedRoles.includes(role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={secName} className="space-y-1">
                {isOpen && (
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
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
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-blue-700/90 text-white font-semibold shadow-xs border-l-3 border-amber-400'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-300'
                        }`}
                      />
                      {isOpen && (
                        <span className="truncate flex-1 text-left">{item.label}</span>
                      )}
                      {isOpen && item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`px-1.5 py-0.2 rounded-sm text-[10px] font-mono font-bold ${
                            item.badgeColor || 'bg-slate-700 text-slate-200'
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

        {/* Sidebar Footer info */}
        {isOpen && (
          <div className="p-3 border-t border-slate-700/60 bg-[#061828]/50 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="font-medium text-slate-300">NIC Gateway Connected</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Role: <span className="text-slate-300 capitalize">{role.replace('_', ' ')}</span>
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
