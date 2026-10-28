import React from 'react';
import { useApp } from '../../context/AppContext';
import { getSession } from '../../services/session';
import { REGULATORY_ROLES } from '../../features/auth/SessionGate';
import {
  FolderKanban,
  FileCheck,
  CalendarCheck,
  ShieldCheck,
  FileWarning,
  Clock,
  BarChart3,
  History,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Globe2,
  Lock,
  Users,
  MapPin,
  Layers,
  Award,
  Building2,
  Send,
  FileText,
  Bell,
  Scale,
  UploadCloud,
  Gavel
} from 'lucide-react';

export type RolePortalId = 1 | 2 | 3 | 4 | 5 | 6;
export type NavTab = string;

export interface RoleNavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string | number;
  badgeColor?: string;
}

export const ROLE_NAV_ITEMS: Record<RolePortalId, { portalTitle: string; subtitle: string; items: RoleNavItem[] }> = {
  1: {
    portalTitle: 'Applicant Portal',
    subtitle: 'Technical Institution Signatory Workspace',
    items: [
      { id: 'inst-apps', label: '1. My Applications & Live Status', icon: FolderKanban },
      { id: 'inst-nsws', label: '2. NSWS Onboarding & Dynamic Route', icon: Globe2, badge: 'SIMULATION', badgeColor: 'bg-blue-600 text-white font-bold' },
      { id: 'inst-deficiencies', label: '3. Deficiency Cure Window (Annex. 7)', icon: FileWarning, badge: 'D1, D2', badgeColor: 'bg-amber-400 text-slate-900 font-bold' },
      { id: 'inst-decision-docs', label: '4. Decision Letters (LoA / EoA)', icon: FileText, badge: 'PDF', badgeColor: 'bg-emerald-600 text-white font-bold' },
      { id: 'appeals-hearings', label: '5. SAC Appeals & Complaints', icon: Scale },
      { id: 'inst-renewals', label: '6. Post-Approval Obligations & Lease', icon: ShieldCheck, badge: '3 ACTIVE', badgeColor: 'bg-emerald-500 text-white font-bold' },
      { id: 'notifications', label: '7. Statutory Alerts & Notices', icon: Bell },
    ]
  },
  2: {
    portalTitle: 'Scrutiny Committee Cell',
    subtitle: 'Desk Review • Roster 2-SOC1770029225',
    items: [
      { id: 'scrutiny-eval', label: '1. Checklist Review & Snapshot v1', icon: FileCheck },
      { id: 'scrutiny-rescrutiny', label: '2. Differential Re-Scrutiny (§1.8(g))', icon: Lock, badge: 'LOCKED C3', badgeColor: 'bg-amber-500 text-white font-bold' },
      { id: 'scrutiny-portal-import', label: '3. Portal Report Ingestion', icon: UploadCloud, badge: 'FIXTURE', badgeColor: 'bg-indigo-600 text-white font-bold' },
      { id: 'scrutiny-committee', label: '4. Expert Roster & Declarations', icon: Users },
      { id: 'scrutiny-queue', label: '5. All Scrutiny Case Dossiers', icon: FolderKanban },
      { id: 'notifications', label: '6. Scrutiny SLA Watches & Deadlines', icon: Bell },
    ]
  },
  3: {
    portalTitle: 'EVC Committee Portal',
    subtitle: 'Expert Visit & Inspection Panel',
    items: [
      { id: 'evc-inspect', label: '1. Campus Inspections & Telemetry', icon: MapPin, badge: 'NBA SKIP', badgeColor: 'bg-emerald-500 text-white font-bold' },
      { id: 'evc-reports', label: '2. Signed Inspection Reports (§1.9)', icon: FileText },
      { id: 'notifications', label: '3. EVC Inspection Reminders', icon: Bell },
    ]
  },
  4: {
    portalTitle: 'Regional Office Desk (RO)',
    subtitle: 'Western Regional Office (WRO) • Operations Desk',
    items: [
      { id: 'ro-allocation', label: '1. Committee Allocation & Workloads', icon: Users, badge: '4 GROUPS', badgeColor: 'bg-blue-600 text-white font-bold' },
      { id: 'ro-pendency', label: '2. Regional Pendency & SLA Matrix', icon: Clock, badge: '10d/15d', badgeColor: 'bg-rose-500 text-white font-bold' },
      { id: 'ro-appeals-hearings', label: '3. SHC Hearings & Complaints Desk', icon: Scale },
      { id: 'ro-obligations', label: '4. 4-Clock Timers & Lease Expiry', icon: ShieldCheck, badge: '3 ACTIVE', badgeColor: 'bg-amber-500 text-white font-bold' },
      { id: 'notifications', label: '5. Regional Alerts & Escalations', icon: Bell, badge: 'ALERTS', badgeColor: 'bg-amber-500 text-slate-900 font-bold' },
    ]
  },
  5: {
    portalTitle: 'Approval Bureau & Council',
    subtitle: 'Competent Authority • Executive Committee Chamber',
    items: [
      { id: 'ca-decision', label: '1. Statutory Decision Gate (APH §1.10)', icon: Award, badge: 'HUMAN ONLY', badgeColor: 'bg-rose-600 text-white font-bold' },
      { id: 'ca-decision-docs', label: '2. Decision Letters & PDF Signing', icon: FileText, badge: 'TEST CERT', badgeColor: 'bg-emerald-600 text-white font-bold' },
      { id: 'ca-appeals', label: '3. SAC Appeals & Dispositions', icon: Gavel },
      { id: 'notifications', label: '4. Council Alerts & Escalations', icon: Bell, badge: 'CRITICAL', badgeColor: 'bg-rose-600 text-white font-bold' },
    ]
  },
  6: {
    portalTitle: 'Central Policy Administration',
    subtitle: 'Policy Engine & WORM Governance',
    items: [
      { id: 'admin-policy', label: '1. Policy Registry & Pinned Rules', icon: Sliders },
      { id: 'admin-worm', label: '2. WORM HMAC-SHA256 Audit Trail', icon: History, badge: 'IMMUTABLE', badgeColor: 'bg-emerald-600 text-white font-bold' },
      { id: 'admin-adapters', label: '3. National Ecosystem Endpoints', icon: Globe2 },
      { id: 'admin-analytics', label: '4. Consolidated Statutory Analytics', icon: BarChart3 },
      { id: 'notifications', label: '5. System Alert Logs & Audits', icon: Bell },
    ]
  }
};

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
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
  const session = getSession();
  const activeActor = session?.actor;

  // Determine active role portal (1-6) - Priority order: Institution -> Regional -> Bureau -> EVC -> Reviewer -> Admin
  const roleNumber: RolePortalId = 
    (activeActor?.id?.startsWith('usr-inst-') || activeActor?.roles?.includes('institution')) ? 1 :
    (activeActor?.id === 'usr-ro-western' || activeActor?.roles?.includes('regional_officer')) ? 4 :
    (activeActor?.id === 'usr-bureau-hq' || activeActor?.roles?.includes('demo_authority') || activeActor?.roles?.includes('bureau_officer')) ? 5 :
    (activeActor?.id === 'usr-evc-chair' || activeActor?.roles?.includes('evc')) ? 3 :
    (activeActor?.id === 'usr-scrutiny-reviewer' || activeActor?.roles?.includes('reviewer')) ? 2 :
    6;

  const currentPortal = ROLE_NAV_ITEMS[roleNumber] || ROLE_NAV_ITEMS[4];

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
        {/* Role Portal Header */}
        <div
          className="h-[60px] px-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(180deg, rgba(4,16,29,0.7), transparent)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs text-white shadow-sm ${
                roleNumber === 1 ? 'bg-blue-600' :
                roleNumber === 2 ? 'bg-amber-600' :
                roleNumber === 3 ? 'bg-purple-600' :
                roleNumber === 4 ? 'bg-emerald-600' :
                roleNumber === 5 ? 'bg-rose-600' : 'bg-slate-700'
              }`}
            >
              #{roleNumber}
            </div>
            {isOpen && (
              <div className="overflow-hidden anim-fade-in">
                <span className="font-extrabold text-xs tracking-tight text-white block truncate">
                  {currentPortal.portalTitle}
                </span>
                <span className="text-[10px] text-slate-400 block truncate font-mono">
                  {roleNumber === 1 ? (
                    (activeActor?.id === 'usr-inst-giits' || (activeActor as any)?.email === 'principal@giits.ac.in') ? 'GIITS • ID 1-462589176' :
                    (activeActor?.id === 'usr-inst-pdimtr' || (activeActor as any)?.email === 'principal@pdimtr.ac.in') ? 'PDIMTR • ID 1-109704178' :
                    (activeActor?.id === 'usr-inst-apex' || (activeActor as any)?.email === 'principal@apex.ac.in') ? 'Apex • ID 1-33104928' :
                    (activeActor?.id === 'usr-inst-batu' || (activeActor as any)?.email === 'principal@batu.ac.in') ? 'BATU Lonere • ID 1-19201481' :
                    'COEP • ID 1-435789102'
                  ) : currentPortal.subtitle}
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

        {/* Dedicated Role Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1.5">
          {isOpen && (
            <p className="px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400/80 mb-2">
              Role #{roleNumber} Workspace Tabs
            </p>
          )}

          {currentPortal.items.map((item) => {
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <div className={`w-5 h-5 flex items-center justify-center shrink-0 ${
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

        {/* Sidebar Footer */}
        {isOpen && (
          <div className="p-3.5 text-[11px] text-slate-400 border-t border-white/5 bg-slate-950/40">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-slate-200 text-[11px]">NIC Sovereign Gateway</span>
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
