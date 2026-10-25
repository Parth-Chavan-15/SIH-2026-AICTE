import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationItem, EscalationRecord } from '../../types';
import { formatDateIndian } from '../../utils/slaCalculator';
import { getSession } from '../../services/session';
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
} from 'lucide-react';

interface NotificationsViewProps {
  onSelectApplication: (appId: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onSelectApplication,
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
  const isInstitution = activeActor?.id?.startsWith('usr-inst-') || activeActor?.roles?.includes('institution');

  const collegeAppId =
    (activeActor?.id === 'usr-inst-coep' || (activeActor as any)?.email === 'principal@coep.ac.in') ? 'APP-2026-COEP'
    : (activeActor?.id === 'usr-inst-giits' || (activeActor as any)?.email === 'principal@giits.ac.in') ? 'APP-2026-GIITS'
    : (activeActor?.id === 'usr-inst-pdimtr' || (activeActor as any)?.email === 'principal@pdimtr.ac.in') ? 'APP-2026-PDIMTR'
    : (activeActor?.id === 'usr-inst-apex' || (activeActor as any)?.email === 'principal@apex.ac.in') ? 'APP-2026-APEX'
    : (activeActor?.id === 'usr-inst-batu' || (activeActor as any)?.email === 'principal@batu.ac.in') ? 'APP-2026-BATU'
    : null;

  const [activeTab, setActiveTab] = useState<'notifications' | 'escalations'>('notifications');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [institutionFilter, setInstitutionFilter] = useState('All');

  // Escalation resolution state
  const [resolvingEsc, setResolvingEsc] = useState<EscalationRecord | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Scoped notifications: colleges only see their alerts; higher authorities see all
  const scopedNotifications = isInstitution && collegeAppId
    ? notifications.filter((n) => n.applicationId === collegeAppId)
    : notifications;

  const filteredNotifications = scopedNotifications.filter((n) => {
    const matchesCategory = categoryFilter === 'All' || n.category === categoryFilter;
    const matchesInst = institutionFilter === 'All' || n.applicationId === institutionFilter;
    return matchesCategory && matchesInst;
  });

  const unreadCount = scopedNotifications.filter((n) => !n.isRead).length;

  const handleResolveEscalationSubmit = async () => {
    if (!resolvingEsc || !resolutionNotes.trim()) return;
    await resolveEscalation(resolvingEsc.id, resolutionNotes);
    setResolvingEsc(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Notification Center & Automated Escalation Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule-driven SLA breach escalations, committee alerts, and institutional reminder logs
          </p>
        </div>

        {/* Tab switch */}
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex text-xs font-semibold">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts & Reminders ({unreadCount} unread)</span>
          </button>
          <button
            onClick={() => setActiveTab('escalations')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'escalations'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Escalation Dossier ({escalations.length})</span>
          </button>
        </div>
      </div>

      {/* Institutional Isolation Notice */}
      {isInstitution && (
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 text-xs flex items-center gap-3 text-blue-950">
          <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <span className="font-extrabold uppercase tracking-wider text-[11px] text-blue-900 block">
              Tenant-Isolated Institutional Notice Board &bull; {collegeAppId}
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
          {/* Category Filter and Mark All Read */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                'All',
                'Overdue',
                'Deadline',
                'EVC',
                'Compliance',
                'Document Expiry',
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {!isInstitution && (
              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">Filter College:</span>
                {[
                  { id: 'All', label: 'All' },
                  { id: 'APP-2026-COEP', label: 'COEP' },
                  { id: 'APP-2026-GIITS', label: 'GIITS' },
                  { id: 'APP-2026-PDIMTR', label: 'PDIMTR' },
                  { id: 'APP-2026-APEX', label: 'Apex' },
                  { id: 'APP-2026-BATU', label: 'BATU' },
                ].map((col) => (
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
                className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* Notifications Feed */}
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
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ESCALATIONS TAB */}
      {activeTab === 'escalations' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900">
            <div className="flex items-center gap-2 font-bold mb-1">
              <Flame className="w-4 h-4 text-rose-600" />
              <span>Hierarchical Escalation Engine (Rule-Enforced)</span>
            </div>
            <p>
              Cases exceeding configured regional SLA thresholds escalate automatically to the Bureau Officer (Level 1) or Member Secretary (Level 2).
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Application</th>
                    <th className="py-3 px-4">Escalation Trigger Reason</th>
                    <th className="py-3 px-4">Previous &rarr; Escalated Authority</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {escalations.map((esc) => (
                    <tr key={esc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{esc.institutionName}</p>
                        <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                          {esc.applicationNumber}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Stage: {esc.currentStage}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-[280px]">
                        <p className="text-slate-800 leading-relaxed font-medium">
                          {esc.escalationReason}
                        </p>
                        {esc.resolutionNotes && (
                          <p className="text-[11px] text-emerald-800 bg-emerald-50 p-1.5 rounded mt-1 border border-emerald-100">
                            Resolution: {esc.resolutionNotes}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="space-y-0.5">
                          <p className="text-slate-500 text-[10px]">From: {esc.previousAuthority}</p>
                          <p className="font-bold text-slate-900">To: {esc.escalatedTo}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDateIndian(esc.escalationTimestamp)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${
                            esc.status === 'Resolved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {esc.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => onSelectApplication(esc.applicationId)}
                          className="text-xs text-blue-600 font-semibold hover:underline"
                        >
                          View
                        </button>
                        {esc.status !== 'Resolved' && (
                          <button
                            onClick={() => {
                              setResolvingEsc(esc);
                              setResolutionNotes('Special review constituted; SLA clock restarted with condition.');
                            }}
                            className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs"
                          >
                            Resolve Case
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Escalation Modal */}
      {resolvingEsc && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in">
            <div className="bg-[#0A2540] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Resolve Escalated Regulatory Case</h3>
              <button onClick={() => setResolvingEsc(null)}>
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-900 text-sm">{resolvingEsc.institutionName}</p>
                <p className="text-slate-500 font-mono text-[11px]">{resolvingEsc.applicationNumber}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Official Higher Authority Resolution Note
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setResolvingEsc(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveEscalationSubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Record Case Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
