import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { quickAccessLogin, logout, getSession } from '../../services/session';
import { REGULATORY_ROLES } from '../../features/auth/SessionGate';
import { getActiveInstitutionScope, isNotificationForRole } from '../../utils/institutionScope';
import {
  Clock,
  LogOut,
  Bell,
  Shield,
  FileCheck,
  Building2,
  Sliders,
  Award,
  ChevronDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
  onSearchClick: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNotifications,
  onNavigateTab,
}) => {
  const { applications, notifications, resetDemoData, triggerAdvanceClock, simulationTime, addToast } = useApp();
  const session = getSession();
  const activeActor = session?.actor;
  const [showClockPopover, setShowClockPopover] = useState(false);

  // Determine active regulatory role (1 to 6) - Priority order: Institution -> Regional -> Bureau -> EVC -> Reviewer -> Admin
  const roleNumber: number =
    (activeActor?.id?.startsWith('usr-inst-') || activeActor?.roles?.includes('institution')) ? 1 :
    (activeActor?.id === 'usr-ro-western' || activeActor?.roles?.includes('regional_officer')) ? 4 :
    (activeActor?.id === 'usr-bureau-hq' || activeActor?.roles?.includes('demo_authority') || activeActor?.roles?.includes('bureau_officer')) ? 5 :
    (activeActor?.id === 'usr-evc-chair' || activeActor?.roles?.includes('evc')) ? 3 :
    (activeActor?.id === 'usr-scrutiny-reviewer' || activeActor?.roles?.includes('reviewer')) ? 2 :
    6;

  // Derive dynamic context-aware notifications strictly scoped to active role and tenant
  const instScope = getActiveInstitutionScope(activeActor);
  const unreadCount = notifications.filter((n) => !n.isRead && isNotificationForRole(n, roleNumber, instScope)).length;

  const activeRoleConfig = REGULATORY_ROLES.find(r => r.roleNumber === roleNumber) || REGULATORY_ROLES[3];
  const [switchingRole, setSwitchingRole] = useState(false);

  const [customVersion, setCustomVersion] = useState(0);

  useEffect(() => {
    const onCustomUpdate = () => setCustomVersion(v => v + 1);
    window.addEventListener('sih:custom_institution_added', onCustomUpdate);
    window.addEventListener('sih:custom_institution_reset', onCustomUpdate);
    return () => {
      window.removeEventListener('sih:custom_institution_added', onCustomUpdate);
      window.removeEventListener('sih:custom_institution_reset', onCustomUpdate);
    };
  }, []);

  const switcherColleges = useMemo(() => {
    const canon = [
      { id: 'coep', label: '1. COEP (Scrutiny Only)', email: 'principal@coep.ac.in', hint: 'NBA Tier-1 Fast-Track' },
      { id: 'giits', label: '2. GIITS (Scrutiny + EVC)', email: 'principal@giits.ac.in', hint: 'Non-NBA Intake Surge 180→240' },
      { id: 'pdimtr', label: '3. PDIMTR (Fast-Track EoA)', email: 'principal@pdimtr.ac.in', hint: 'Self-Disclosure & 30-Yr Lease' },
      { id: 'apex', label: '4. Apex (EVC + SAC/SHC)', email: 'principal@apex.ac.in', hint: 'Standing Appellate Review' },
      { id: 'batu', label: '5. BATU (Only EVC)', email: 'principal@batu.ac.in', hint: '§2.16.1 Restoration / Site Shift' },
      { id: 'vvit', label: '6. VVIT (Boundary X=360)', email: 'principal@vvit.ac.in', hint: 'Division boundary X=360 hold' },
    ];
    const customList: typeof canon = [];
    const seen = new Set<string>();

    const canonCodes = new Set([
      'INST-SOUTH', 'INST-COEP', 'INST-NORTH', 'INST-GIITS',
      'INST-WEST', 'INST-PDIMTR', 'INST-APEX', 'INST-BATU', 'INST-VVIT',
      'COEP', 'GIITS', 'PDIMTR', 'APEX', 'BATU', 'VVIT'
    ]);

    for (const c of canon) {
      seen.add(c.id.toLowerCase());
    }
    for (const code of canonCodes) {
      seen.add(code.toLowerCase());
    }

    // 1. Inspect legitimately persisted non-canonical applications from backend storage
    for (const app of applications) {
      const code = String((app as any).institutionCode || (app as any).institutionId || '').trim();
      const rawName = String((app as any).institutionName || (app as any).facts?.institutionName || '').trim();
      const codeLower = code.toLowerCase();
      const nameLower = rawName.toLowerCase();

      if (!code || canonCodes.has(code.toUpperCase()) || seen.has(codeLower)) {
        continue;
      }
      if (!rawName || rawName === code || seen.has(nameLower)) {
        continue;
      }

      seen.add(codeLower);
      seen.add(nameLower);

      const routeType = (app as any).routeType || 'Custom';
      const ref = (app as any).applicationNumber || (app as any).id || code;

      customList.push({
        id: code,
        label: `${7 + customList.length}. ${rawName.slice(0, 14)} (${routeType})`,
        email: 'principal@custom.ac.in',
        hint: `Custom Application: ${ref}`
      });
    }

    // 2. Sanitize and purge any phantom "Custom Techn..." entries from browser storage
    try {
      const rawStored = localStorage.getItem('sih_custom_institutions');
      if (rawStored) {
        const parsed = JSON.parse(rawStored);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((c: any) => {
            const name = String(c?.name || '').trim();
            return name && !/^custom\s+techn/i.test(name) && name !== 'Custom College' && c?.id !== '1-CUSTOM';
          });
          if (cleaned.length !== parsed.length) {
            if (cleaned.length > 0) {
              localStorage.setItem('sih_custom_institutions', JSON.stringify(cleaned));
            } else {
              localStorage.removeItem('sih_custom_institutions');
            }
          }
          for (const s of cleaned) {
            const sId = String(s?.id || '').trim();
            const sName = String(s?.name || '').trim();
            const sIdLower = sId.toLowerCase();
            const sNameLower = sName.toLowerCase();
            if (sId && sName && !seen.has(sIdLower) && !seen.has(sNameLower) && !canonCodes.has(sId.toUpperCase())) {
              seen.add(sIdLower);
              seen.add(sNameLower);
              customList.push({
                id: sId,
                label: `${7 + customList.length}. ${sName.slice(0, 14)} (${s.routeType || 'Custom'})`,
                email: s.email || 'principal@custom.ac.in',
                hint: `Custom Application: ${s.reference || sName}`
              });
            }
          }
        }
      }
      const activeRaw = localStorage.getItem('sih_active_custom_institution');
      if (activeRaw) {
        const active = JSON.parse(activeRaw);
        const activeName = String(active?.name || '').trim();
        if (!activeName || /^custom\s+techn/i.test(activeName) || activeName === 'Custom College' || active?.id === '1-CUSTOM') {
          localStorage.removeItem('sih_active_custom_institution');
          if (localStorage.getItem('sih_selected_college_id') === active?.id) {
            localStorage.removeItem('sih_selected_college_id');
          }
        }
      }
    } catch {}

    return [...canon, ...customList];
  }, [applications, customVersion]);

  const ROLES_LIST = [
    { num: 1, label: 'Applicant', icon: Building2, email: 'principal@coep.ac.in', tab: 'inst-apps', activeClass: 'bg-blue-600 text-white shadow-xs' },
    { num: 2, label: 'Scrutiny Cell', icon: FileCheck, email: 'scrutiny.reviewer@aicte.gov.in', tab: 'scrutiny-eval', activeClass: 'bg-amber-600 text-white shadow-xs' },
    { num: 3, label: 'EVC Committee', icon: Award, email: 'evc.chair@aicte.gov.in', tab: 'evc-inspect', activeClass: 'bg-purple-600 text-white shadow-xs' },
    { num: 4, label: 'Regional Desk', icon: Shield, email: 'ro.western@aicte.gov.in', tab: 'ro-allocation', activeClass: 'bg-emerald-600 text-white shadow-xs' },
    { num: 5, label: 'Approval Bureau', icon: Award, email: 'bureau.approval@aicte.gov.in', tab: 'ca-decision', activeClass: 'bg-rose-600 text-white shadow-xs' },
    { num: 6, label: 'Policy Admin', icon: Sliders, email: 'admin@aicte.gov.in', tab: 'admin-policy', activeClass: 'bg-slate-700 text-white shadow-xs' },
  ];

  const EMAIL_TO_ACTOR_ID: Record<string, string> = {
    'principal@coep.ac.in': 'usr-inst-coep',
    'principal@giits.ac.in': 'usr-inst-giits',
    'principal@pdimtr.ac.in': 'usr-inst-pdimtr',
    'principal@apex.ac.in': 'usr-inst-apex',
    'principal@batu.ac.in': 'usr-inst-batu',
    'principal@vvit.ac.in': 'usr-inst-vvit',
    'scrutiny.reviewer@aicte.gov.in': 'usr-scrutiny-reviewer',
    'evc.chair@aicte.gov.in': 'usr-evc-chair',
    'ro.western@aicte.gov.in': 'usr-ro-western',
    'bureau.approval@aicte.gov.in': 'usr-bureau-hq',
    'admin@aicte.gov.in': 'usr-admin',
  };

  const handleSwitchRole = async (targetRoleNumber: number, targetEmail: string, targetTab: string) => {
    if (switchingRole) return;
    setSwitchingRole(true);
    try {
      const activeSession = getSession();
      const currentActor = activeSession?.actor;
      const targetActorId = EMAIL_TO_ACTOR_ID[targetEmail];

      if (currentActor && targetActorId && currentActor.id === targetActorId) {
        onNavigateTab?.(targetTab);
        return;
      }

      await quickAccessLogin(targetEmail);
      onNavigateTab?.(targetTab);
    } catch (err: any) {
      console.error('Role switch failed:', err);
      addToast?.({
        type: 'error',
        title: 'Role Switch Failed',
        message: err?.message || 'Unable to authenticate into selected role'
      });
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
      {/* Primary Top Bar (Non-Wrapping) */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 min-h-[56px]">
        {/* Left: Official NiyamSetu Brand with Emblem */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-auto flex items-center justify-center p-0.5 shrink-0 bg-white/10 rounded-lg border border-white/20">
            <img
              src="/niyamsetu-logo.png"
              alt="NiyamSetu Logo"
              className="h-8 w-auto object-contain rounded"
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
              <span className="hidden lg:inline-flex text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                WORM SHA-256
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-300 tracking-wider hidden xl:block uppercase">
              Bridging Rules &bull; Empowering Institutions
            </p>
          </div>
        </div>

        {/* Center: Interactive One-Click Multi-Role Demonstration Switcher */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/95 p-1 rounded-xl border border-slate-700/80 shadow-inner overflow-x-auto">
          {ROLES_LIST.map((r) => {
            const isActive = roleNumber === r.num;
            return (
              <button
                key={r.num}
                disabled={switchingRole}
                onClick={() => handleSwitchRole(r.num, r.email, r.tab)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? r.activeClass + ' ring-1 ring-white/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                } ${switchingRole ? 'opacity-50 cursor-wait' : ''}`}
                title={`Switch to Role ${r.num}: ${r.label}`}
              >
                <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-black/40 text-white/90">
                  #{r.num}
                </span>
                <span className="inline">{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Operational Tools, Clock Pill, Alerts & Clean Sign Out */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Regulatory Simulation Clock Pill */}
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

          {/* Dedicated Alerts & Notifications Bell Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="View Automated Alerts, Deadline Reminders & Escalations"
          >
            <Bell className="w-4 h-4 text-amber-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[10px] font-bold font-mono shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Active Role Label */}
          <div className="text-right hidden 2xl:block leading-tight border-l border-slate-700/80 pl-2.5">
            <span className="text-xs font-bold text-white block">
              {activeRoleConfig.roleTitle}
            </span>
            <span className="text-[10px] text-slate-400 block font-medium">
              Role #{activeRoleConfig.roleNumber} &bull; {activeRoleConfig.shortLabel}
            </span>
          </div>

          {/* Prominent Fixed Top-Right Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-200 hover:text-white text-xs font-bold border border-rose-500/30 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Sign out of authenticated session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="inline">Sign out</span>
          </button>
        </div>
      </div>

            {/* Role 1 Applicant Dynamic College Switcher */}
      {roleNumber === 1 && (
        <div className="bg-[#05182B] border-t border-slate-800 px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-teal-300 font-bold">
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-[10px] uppercase tracking-wider">Select College Applicant:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5">
            {switcherColleges.map((col, idx) => {
              const selectedSavedId = typeof window !== 'undefined' ? localStorage.getItem('sih_selected_college_id') : null;
              const isCustom = idx >= 6;
              const isColActive = isCustom
                ? (selectedSavedId === col.id || ((activeActor as any)?.email === 'principal@custom.ac.in' && (!selectedSavedId || selectedSavedId === col.id)) || activeActor?.institutionIds?.includes(col.id))
                : ((activeActor as any)?.email === col.email || activeActor?.id === `usr-inst-${col.id}`);
              return (
                <button
                  key={col.id}
                  disabled={switchingRole}
                  onClick={() => {
                    try { localStorage.setItem('sih_selected_college_id', col.id); } catch {}
                    handleSwitchRole(1, col.email, 'inst-apps');
                  }}
                  title={`${col.label} — ${col.hint}`}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    isColActive
                      ? 'bg-blue-600 text-white shadow-xs ring-1 ring-blue-300'
                      : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                  }`}
                >
                  {col.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
