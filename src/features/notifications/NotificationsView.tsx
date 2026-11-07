import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationItem, EscalationRecord } from '../../types';
import { formatDateIndian } from '../../utils/slaCalculator';
import { getSession } from '../../services/session';
import { getActiveInstitutionScope, isNotificationForRole, isEscalationForRole } from '../../utils/institutionScope';
import {
  Bell,
  BellRing,
  AlertOctagon,
  Calendar,
  ShieldAlert,
  FileWarning,
  CheckCircle,
  ExternalLink,
  Flame,
  Check,
  X,
  Search,
  AlertTriangle,
  Building2,
  Lock,
  Layers,
} from 'lucide-react';

interface NotificationsViewProps {
  onSelectApplication: (appId: string) => void;
  roleNumber?: number;
}

const ROLE_HEADERS: Record<number, { title: string; subtitle: string; roleTag: string }> = {
  1: {
    title: 'Official Notices & Regulatory Deadline Alerts',
    subtitle: 'Statutory deficiency communications, time-bound compliance reminders, and approval status updates',
    roleTag: 'Role #1 Applicant Portal',
  },
  2: {
    title: 'Scrutiny SLA Timers, Deficiencies & Committee Deadlines',
    subtitle: 'Real-time desk scrutiny alerts, document deficiency cure tracking, and expert roster deadlines',
    roleTag: 'Role #2 Scrutiny Committee Cell',
  },
  3: {
    title: 'EVC Inspection Deadlines, Telemetry & Scheduling Alerts',
    subtitle: 'Physical & digital expert visit schedules, geotagged evidence alerts, and inspection reporting SLAs',
    roleTag: 'Role #3 EVC Committee Portal',
  },
  4: {
    title: 'Regional Desk Operational Alerts, SHC Hearings & SLA Escalations',
    subtitle: 'Western Regional Office (WRO) queue pendency alerts, State/UT concurrence tracking, and SHC hearing notices',
    roleTag: 'Role #4 Regional Office Desk',
  },
  5: {
    title: 'Council Docket Alerts, SAC Judicial Hearings & Dispatch Tracking',
    subtitle: 'Executive Committee agenda deadlines, Standing Appellate Committee dispositions, and official order dispatch logs',
    roleTag: 'Role #5 Approval Bureau & Council',
  },
  6: {
    title: 'System Alerts, Autonomous Telemetry & WORM Audit Logs',
    subtitle: 'Real-time rule engine conflict logs, immutable WORM audit ledger verification, ecosystem health, and autonomous SLA escalation monitoring',
    roleTag: 'Role #6 Central Policy Admin',
  },
};

const ROLE_CATEGORIES: Record<number, string[]> = {
  1: ['All', 'Scrutiny', 'Compliance', 'Document Expiry', 'Deadline', 'Overdue'],
  2: ['All', 'Scrutiny', 'Workflow', 'Deadline', 'Overdue'],
  3: ['All', 'EVC', 'Deadline', 'Overdue'],
  4: ['All', 'Regional Intake', 'Concurrence', 'Compliance', 'Document Expiry', 'Deadline', 'Overdue'],
  5: ['All', 'Council Docket', 'Judicial / SAC', 'Order Dispatch', 'Deadline', 'Overdue'],
  6: ['All', 'Rule Engine Conflict', 'WORM Audit Ledger', 'Ecosystem Adapters', 'SLA Escalation', 'Worker Health'],
};

const ROLE_CASE_FILTERS: Record<number, Array<{ id: string; label: string }>> = {
  1: [],
  2: [
    { id: 'All', label: 'All Cases' },
    { id: 'APP-2026-COEP', label: 'COEP' },
    { id: 'APP-2026-GIITS', label: 'GIITS' },
    { id: 'APP-2026-PDIMTR', label: 'PDIMTR' },
  ],
  3: [
    { id: 'All', label: 'All Cases' },
    { id: 'APP-2026-GIITS', label: 'GIITS' },
    { id: 'APP-2026-BATU', label: 'BATU' },
  ],
  4: [
    { id: 'All', label: 'All Cases' },
    { id: 'APP-2026-COEP', label: 'COEP' },
    { id: 'APP-2026-PDIMTR', label: 'PDIMTR' },
    { id: 'APP-2026-BATU', label: 'BATU' },
    { id: 'APP-2026-APEX', label: 'Apex' },
  ],
  5: [
    { id: 'All', label: 'All Cases' },
    { id: 'APP-2026-COEP', label: 'COEP' },
    { id: 'APP-2026-APEX', label: 'Apex' },
    { id: 'APP-2026-BATU', label: 'BATU' },
    { id: 'APP-2026-PDIMTR', label: 'PDIMTR' },
  ],
  6: [],
};

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onSelectApplication,
  roleNumber: propsRoleNumber,
}) => {
  const {
    notifications,
    escalations,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resolveEscalation,
  } = useApp();

  const session = getSession();
  const activeActor = session?.actor;

  // Determine active role portal (1-6) - Priority order: Institution -> Regional -> Bureau -> EVC -> Reviewer -> Admin
  const roleNumber: number =
    propsRoleNumber ??
    ((activeActor?.id?.startsWith('usr-inst-') || activeActor?.roles?.includes('institution')) ? 1 :
      (activeActor?.id === 'usr-ro-western' || activeActor?.roles?.includes('regional_officer')) ? 4 :
      (activeActor?.id === 'usr-bureau-hq' || activeActor?.roles?.includes('demo_authority') || activeActor?.roles?.includes('bureau_officer')) ? 5 :
      (activeActor?.id === 'usr-evc-chair' || activeActor?.roles?.includes('evc')) ? 3 :
      (activeActor?.id === 'usr-scrutiny-reviewer' || activeActor?.roles?.includes('reviewer')) ? 2 :
      6);

  const isInstitution = roleNumber === 1;
  const isPolicyAdmin = roleNumber === 6;

  const scope = useMemo(() => getActiveInstitutionScope(activeActor), [activeActor]);

  const [activeTab, setActiveTab] = useState<'notifications' | 'escalations'>('notifications');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [institutionFilter, setInstitutionFilter] = useState('All');

  // Escalation resolution state
  const [resolvingEsc, setResolvingEsc] = useState<EscalationRecord | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Reset filters to 'All' on mount or role / scope switch
  useEffect(() => {
    setCategoryFilter('All');
    setInstitutionFilter('All');
  }, [roleNumber, scope.key]);

  // Scoped notifications strictly governed by statutory jurisdiction and tenant isolation
  const scopedNotifications = useMemo(() => {
    return notifications.filter((n) => isNotificationForRole(n, roleNumber, scope));
  }, [notifications, roleNumber, scope]);

  // Scoped escalations strictly governed by statutory role
  const scopedEscalations = useMemo(() => {
    return escalations.filter((e) => isEscalationForRole(e, roleNumber, scope));
  }, [escalations, roleNumber, scope]);

  // Dynamic category pills and case filters for the active role
  const availableCategories = ROLE_CATEGORIES[roleNumber] || ['All', 'Workflow', 'Deadline', 'Overdue'];
  const availableCaseFilters = ROLE_CASE_FILTERS[roleNumber] || [];

  const filteredNotifications = useMemo(() => {
    return scopedNotifications.filter((n) => {
      let matchesCategory = true;
      if (categoryFilter !== 'All') {
        const cat = (n.category || '').toLowerCase();
        const title = (n.title || '').toLowerCase();
        const msg = (n.message || '').toLowerCase();
        const f = categoryFilter.toLowerCase();

        if (f === 'overdue') {
          matchesCategory =
            n.category === 'Overdue' ||
            n.severity === 'critical' ||
            title.includes('overdue') ||
            msg.includes('overdue') ||
            title.includes('breach');
        } else if (f === 'deadline') {
          matchesCategory =
            n.category === 'Deadline' ||
            n.severity === 'warning' ||
            title.includes('deadline') ||
            msg.includes('deadline') ||
            title.includes('countdown') ||
            title.includes('expiry') ||
            title.includes('sla');
        } else if (f === 'scrutiny') {
          matchesCategory =
            n.category === 'Scrutiny' ||
            title.includes('scrutiny') ||
            msg.includes('scrutiny') ||
            title.includes('deficiency') ||
            msg.includes('deficiency') ||
            title.includes('cadre');
        } else if (f === 'evc') {
          matchesCategory =
            n.category === 'EVC' ||
            title.includes('evc') ||
            msg.includes('evc') ||
            title.includes('inspection') ||
            title.includes('campus');
        } else if (f === 'compliance') {
          matchesCategory =
            n.category === 'Compliance' ||
            title.includes('compliance') ||
            msg.includes('fdr') ||
            msg.includes('affidavit') ||
            msg.includes('undertaking');
        } else if (f === 'document expiry') {
          matchesCategory =
            n.category === 'Document Expiry' ||
            title.includes('expiry') ||
            msg.includes('lease') ||
            msg.includes('noc');
        } else if (f === 'regional intake') {
          matchesCategory =
            n.category === 'Regional Intake' ||
            title.includes('regional') ||
            title.includes('shc') ||
            msg.includes('wro');
        } else if (f === 'concurrence') {
          matchesCategory =
            n.category === 'Concurrence' ||
            title.includes('concurrence') ||
            msg.includes('concurrence') ||
            msg.includes('dte');
        } else if (f === 'council docket') {
          matchesCategory =
            n.category === 'Council Docket' ||
            title.includes('docket') ||
            title.includes('council') ||
            msg.includes('executive committee');
        } else if (f === 'judicial / sac') {
          matchesCategory =
            n.category === 'Judicial / SAC' ||
            title.includes('sac') ||
            msg.includes('appellate') ||
            title.includes('appeal');
        } else if (f === 'order dispatch') {
          matchesCategory =
            n.category === 'Order Dispatch' ||
            title.includes('dispatch') ||
            title.includes('order');
        } else {
          matchesCategory = n.category === categoryFilter;
        }
      }

      let matchesInst = true;
      if (institutionFilter !== 'All') {
        const nApp = (n.applicationId || '').toUpperCase();
        const fInst = institutionFilter.toUpperCase();
        matchesInst = nApp.includes(fInst) || fInst.includes(nApp);
      }

      return matchesCategory && matchesInst;
    });
  }, [scopedNotifications, categoryFilter, institutionFilter]);

  const unreadCount = scopedNotifications.filter((n) => !n.isRead).length;

  const headerMeta = ROLE_HEADERS[roleNumber] || ROLE_HEADERS[1];

  const handleResolveEscalationSubmit = async () => {
    if (!resolvingEsc || !resolutionNotes.trim()) return;
    await resolveEscalation(resolvingEsc.id, resolutionNotes);
    setResolvingEsc(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Role-Customized Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {headerMeta.title}
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 font-bold">
              {headerMeta.roleTag}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {headerMeta.subtitle}
          </p>
        </div>

        {/* Tab switch */}
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex text-xs font-semibold">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-blue-600" />
            <span>Alerts & Reminders ({unreadCount} unread)</span>
          </button>
          <button
            onClick={() => setActiveTab('escalations')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'escalations'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Escalation Dossier ({scopedEscalations.length})</span>
          </button>
        </div>
      </div>

      {/* Policy Admin System Telemetry Summary (Role 6) */}
      {isPolicyAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">WORM Audit Ledger</span>
            <div className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Verified Intact</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-mono">HMAC-SHA256 • 0 Tampering</p>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-800 block">Ecosystem Adapters</span>
            <div className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>99.98% Health</span>
            </div>
            <p className="text-[10px] text-blue-700 font-mono">NSWS • DigiLocker • DSC</p>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-800 block">Active Rules Engine</span>
            <div className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>1 Conflict Flagged</span>
            </div>
            <p className="text-[10px] text-amber-700 font-mono">RULE-CONFLICT-NBA-360</p>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-800 block">Worker Outbox Daemon</span>
            <div className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              <span>0 Delivery Failures</span>
            </div>
            <p className="text-[10px] text-purple-700 font-mono">3/3 Idempotent Receipts</p>
          </div>
        </div>
      )}

      {/* Institutional Isolation Notice (Role 1) */}
      {isInstitution && (
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs flex items-center gap-3 text-blue-950">
          <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-blue-900 block">
              Tenant-Isolated Institutional Notice Board &bull; {scope.label || scope.name || scope.idOrCode || 'Active Institution'}
            </span>
            <span className="text-slate-600">
              Only statutory communications, deficiency notices, and expiry countdowns issued specifically for your college node are displayed here.
            </span>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {/* Role-Scoped Category Filter Bar and Mark All Read */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Scoped Case Filter (Roles 2-5 Only; Strictly Hidden for Role 1 and Role 6) */}
            {availableCaseFilters.length > 0 && (
              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">Filter Case:</span>
                {availableCaseFilters.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setInstitutionFilter(col.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      institutionFilter === col.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            )}

            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 ml-auto"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* Notifications Feed */}
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <BellRing className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-sm">
                  {isInstitution
                    ? 'No statutory notices or deadline alerts pending for this institution.'
                    : "You're all caught up."}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {isInstitution
                    ? 'All official committee notices, deficiency communications, and deadline reminders will appear here in real time as statutory actions occur.'
                    : 'No new notifications or pending alerts match your active filter criteria.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotifications.map((notif) => {
                let icon = <Bell className="w-4 h-4 text-blue-600" />;
                let borderColor = 'border-slate-200';
                let badgeColor = 'bg-blue-50 text-blue-700';

                if (notif.severity === 'critical') {
                  icon = <AlertOctagon className="w-4 h-4 text-rose-600" />;
                  borderColor = 'border-rose-200 bg-rose-50/20';
                  badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                } else if (notif.severity === 'warning') {
                  icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
                  borderColor = 'border-amber-200 bg-amber-50/20';
                  badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                } else if (notif.severity === 'success') {
                  icon = <CheckCircle className="w-4 h-4 text-emerald-600" />;
                  badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                }

                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border bg-white shadow-2xs flex flex-col sm:flex-row sm:items-start justify-between gap-3 transition-colors ${borderColor} ${
                      !notif.isRead ? 'ring-1 ring-blue-300' : 'opacity-85'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">{icon}</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${badgeColor}`}>
                            {notif.category}
                          </span>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            {formatDateIndian(notif.timestamp)}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 leading-tight">
                          {notif.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {notif.applicationId && (
                        <button
                          onClick={() => onSelectApplication(notif.applicationId!)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <span>Open Case</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                      {!notif.isRead && (
                        <button
                          onClick={() => markNotificationAsRead(notif.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark Read</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ESCALATIONS TAB */}
      {activeTab === 'escalations' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-950">Statutory SLA Breach & Escalation Governance Protocol</h4>
              <p className="text-rose-800 mt-0.5 leading-relaxed">
                Cases exceeding statutory turnaround thresholds are autonomously escalated to higher regulatory authorities.
                Resolution notes are hashed and permanently committed to the immutable WORM audit ledger.
              </p>
            </div>
          </div>

          {scopedEscalations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Active Escalations</h3>
              <p className="text-xs text-slate-500">All applications in your statutory scope are within SLA limits.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scopedEscalations.map((esc) => (
                <div
                  key={esc.id}
                  className="p-4 rounded-xl border border-rose-200 bg-white shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 font-mono">
                          {esc.applicationNumber || esc.applicationId}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          {esc.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {esc.institutionName} &bull; {esc.region} Region
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Escalated On</span>
                      <span className="text-xs font-mono text-slate-600">
                        {formatDateIndian(esc.escalationTimestamp)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                    <span className="font-bold text-rose-900 block mb-0.5">Escalation Grounds:</span>
                    {esc.escalationReason}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Previous Authority</span>
                      <span className="font-medium text-slate-800">{esc.previousAuthority}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Escalated To</span>
                      <span className="font-semibold text-blue-900">{esc.escalatedTo}</span>
                    </div>
                  </div>

                  {/* Resolution Input / Button */}
                  {!isInstitution && (
                    <div className="pt-1 flex items-center justify-between gap-3 border-t border-slate-100">
                      <button
                        onClick={() => onSelectApplication(esc.applicationId)}
                        className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
                      >
                        <span>Open Application Dossier</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      {resolvingEsc?.id === esc.id ? (
                        <div className="flex items-center gap-2 w-full max-w-md">
                          <input
                            type="text"
                            placeholder="Enter authoritative resolution findings..."
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            className="flex-1 p-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            onClick={handleResolveEscalationSubmit}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => setResolvingEsc(null)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setResolvingEsc(esc)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>Resolve Escalation</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
