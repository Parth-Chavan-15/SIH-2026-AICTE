import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateIndian } from '../../utils/slaCalculator';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Lock,
  Download,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
} from 'lucide-react';

interface AuditViewProps {
  onSelectApplication: (appId: string) => void;
}

export const AuditView: React.FC<AuditViewProps> = ({ onSelectApplication }) => {
  const { auditLog } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const filteredLogs = auditLog.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const exportAuditCSV = () => {
    const headers = [
      'Timestamp',
      'Event Action',
      'Application Number',
      'Actor Name',
      'Actor Role',
      'Previous State',
      'New State',
      'Reason / Remarks',
      'Cryptographic Hash',
      'Result',
    ];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.action}"`,
      `"${l.applicationNumber}"`,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      `"${l.previousState || 'None'}"`,
      `"${l.newState || 'None'}"`,
      `"${(l.reason || '').replace(/"/g, '""')}"`,
      `"${l.tamperProofHash}"`,
      `"${l.result}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `AICTE_Immutable_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Cryptographic Audit Trail & Governance Log
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Lock className="w-3 h-3" />
              WORM Compliant (Read-Only)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, append-only chronological log of all stage transitions, official observations, and approvals
          </p>
        </div>

        <button
          onClick={exportAuditCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, application number, or justification reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 focus:outline-none"
        >
          <option value="All">All Event Actions</option>
          <option value="STAGE_TRANSITION">STAGE_TRANSITION</option>
          <option value="VERIFIED_DOCUMENT">VERIFIED_DOCUMENT</option>
          <option value="TRIGGERED_ESCALATION">TRIGGERED_ESCALATION</option>
          <option value="RECORDED_OBSERVATION">RECORDED_OBSERVATION</option>
          <option value="SUBMITTED_EVC_REPORT">SUBMITTED_EVC_REPORT</option>
          <option value="ISSUED_APPROVAL_ORDER">ISSUED_APPROVAL_ORDER</option>
        </select>
      </div>

      {/* Audit Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Timestamp (UTC/IST)</th>
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Actor & Official Role</th>
                <th className="py-3 px-4">State Transition & Reason</th>
                <th className="py-3 px-4">Integrity Hash</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Timestamp */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                    {log.timestamp.replace('T', ' ').slice(0, 19)}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                      {log.action}
                    </span>
                  </td>

                  {/* App ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                    {log.applicationNumber}
                  </td>

                  {/* Actor */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900">{log.actorName}</p>
                    <p className="text-[10px] text-slate-500">{log.actorRole}</p>
                  </td>

                  {/* Transition and Reason */}
                  <td className="py-3.5 px-4 max-w-[280px]">
                    {log.previousState && log.newState && (
                      <div className="text-[11px] text-slate-600 mb-0.5 font-medium">
                        <span className="text-slate-500">{log.previousState}</span> &rarr;{' '}
                        <span className="font-bold text-slate-900">{log.newState}</span>
                      </div>
                    )}
                    <p className="text-slate-700 text-xs leading-relaxed">
                      {log.reason || 'Workflow event executed'}
                    </p>
                  </td>

                  {/* SHA-256 Hash */}
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Fingerprint className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate max-w-[120px]" title={log.tamperProofHash}>
                        {log.tamperProofHash}
                      </span>
                    </div>
                  </td>

                  {/* Result */}
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.result === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.result === 'FLAGGED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
