import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Users,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  History,
  UserCheck,
  UserPlus,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

export const ROAllocationView: React.FC = () => {
  const { applications, user } = useApp();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [caseAssignments, setCaseAssignments] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Assignment Modal
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [assignType, setAssignType] = useState<'DESK_SCRUTINY' | 'EVC'>('DESK_SCRUTINY');
  const [targetGroupId, setTargetGroupId] = useState<string>('');
  const [assignmentReason, setAssignmentReason] = useState<string>('Standard Regional Committee load balancing');

  const activeApp = applications.find((a) => a.id === selectedCaseId) || applications[0];

  const loadGroups = async () => {
    try {
      const res = await api.getAllocationGroups();
      setGroups(res.data?.groups || []);
      if (!selectedCaseId && applications.length > 0) {
        setSelectedCaseId(applications[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load groups:', err);
    }
  };

  const loadCaseAssignments = async (caseId: string) => {
    if (!caseId) return;
    try {
      const res = await api.getCaseAssignments(caseId);
      setCaseAssignments(res.data);
    } catch (err: any) {
      console.error('Failed to load case assignments:', err);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    if (selectedCaseId) {
      loadCaseAssignments(selectedCaseId);
    }
  }, [selectedCaseId]);

  const handleOpenAssign = (type: 'DESK_SCRUTINY' | 'EVC') => {
    setAssignType(type);
    const candidateGroups = groups.filter((g) => g.groupType === type);
    if (candidateGroups.length > 0) {
      setTargetGroupId(candidateGroups[0].id);
    }
    setErrorMsg(null);
    setShowAssignModal(true);
  };

  const handleExecuteAssign = async () => {
    if (!assignmentReason || assignmentReason.trim().length < 5) {
      setErrorMsg('A valid official assignment justification is mandatory.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.assignCase({
        caseId: activeApp.id,
        groupType: assignType,
        groupId: targetGroupId,
        officerId: user?.id || 'usr-ro-western',
        reason: assignmentReason
      });
      setSuccessMsg(`Successfully assigned ${assignType} group ${targetGroupId} to ${activeApp.id}`);
      setShowAssignModal(false);
      await loadGroups();
      await loadCaseAssignments(activeApp.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const scrutinyGroups = groups.filter((g) => g.groupType === 'DESK_SCRUTINY');
  const evcGroups = groups.filter((g) => g.groupType === 'EVC');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Regional Office Operations Desk: Committee Allocation
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
              Role 2 Regional Officer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage active Scrutiny &amp; EVC panels, monitor workloads, and record auditable committee assignments per APH §1.8 &amp; §1.9
          </p>
        </div>

        <button
          onClick={() => {
            loadGroups();
            if (selectedCaseId) loadCaseAssignments(selectedCaseId);
          }}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Workloads</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 4 Standing Groups Dashboard */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Active Standing Committee Panels (Min. 2 Scrutiny &amp; 2 EVC Groups)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((grp) => {
            const loadPercent = Math.min(100, Math.round((grp.activeCases / grp.capacity) * 100));
            const isScrutiny = grp.groupType === 'DESK_SCRUTINY';
            return (
              <div
                key={grp.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-blue-400 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-800 px-2 py-0.5 rounded bg-slate-100 border">
                      {grp.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isScrutiny ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {isScrutiny ? 'SCRUTINY' : 'EVC PANEL'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{grp.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Region: {grp.region}</p>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Workload:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {grp.activeCases} / {grp.capacity} cases
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          loadPercent > 80 ? 'bg-rose-500' : loadPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${loadPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Standing Members:
                    </span>
                    <div className="space-y-1">
                      {grp.members?.slice(0, 3).map((m: any, idx: number) => (
                        <div key={idx} className="text-[11px] text-slate-700 flex items-center justify-between">
                          <span className="truncate">{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Case Assignment & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Case Selector */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <span>Select Regional Queue Case</span>
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {applications.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedCaseId(app.id)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  selectedCaseId === app.id
                    ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                  <span>{app.id}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                    {app.region}
                  </span>
                </div>
                <div className="font-semibold text-slate-900 mt-1 truncate">{app.institutionName}</div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                  <span>{app.applicationType}</span>
                  <span className="font-medium text-blue-700">{app.currentStage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Allocation Status & Actions for Active Case */}
        <div className="lg:col-span-2 space-y-4">
          {activeApp && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{activeApp.institutionName}</h4>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mt-0.5">
                    <span>{activeApp.id}</span>
                    <span>&bull;</span>
                    <span>Stage: <strong className="text-blue-700">{activeApp.currentStage}</strong></span>
                    <span>&bull;</span>
                    <span>Route: <strong className="text-slate-800">{activeApp.routeType}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAssign('DESK_SCRUTINY')}
                    className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign Desk Scrutiny</span>
                  </button>
                  <button
                    onClick={() => handleOpenAssign('EVC')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Assign EVC Panel</span>
                  </button>
                </div>
              </div>

              {/* Current Assignment Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                  <span className="text-blue-900 font-bold block mb-1">Desk Scrutiny Assignment:</span>
                  <div className="space-y-1 text-slate-700">
                    <div>Group: <strong>{caseAssignments?.currentDeskScrutiny || 'Unassigned / Pending'}</strong></div>
                    <div>Status: <span className="text-emerald-700 font-semibold">Active</span></div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-200">
                  <span className="text-indigo-900 font-bold block mb-1">EVC Panel Assignment:</span>
                  <div className="space-y-1 text-slate-700">
                    <div>Group: <strong>{caseAssignments?.currentEVC || 'Not Applicable / Not Assigned'}</strong></div>
                    <div>
                      Eligibility:{' '}
                      <span className="text-slate-600">
                        {activeApp.routeType?.includes('EVC') ? 'Mandatory for this route' : 'Bypassed by Rule'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auditable Assignment History */}
              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Auditable Allocation &amp; Reassignment History</span>
                </h5>

                {caseAssignments?.history && caseAssignments.history.length > 0 ? (
                  <div className="space-y-2">
                    {caseAssignments.history.map((hist: any) => (
                      <div
                        key={hist.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-slate-800">
                            Assigned to <strong className="text-blue-700">{hist.assignedGroupId}</strong> ({hist.groupType})
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(hist.assignedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-slate-600">
                          Justification: <em>"{hist.reason}"</em>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Assigned by: {hist.assignedBy}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-slate-50 text-center text-xs text-slate-400 border border-dashed">
                    No reassignment events recorded yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Assign {assignType === 'DESK_SCRUTINY' ? 'Desk Scrutiny' : 'EVC Inspection'} Committee
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Application</label>
                <input
                  type="text"
                  disabled
                  value={`${activeApp.id} (${activeApp.institutionName})`}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Standing Panel Group</label>
                <select
                  value={targetGroupId}
                  onChange={(e) => setTargetGroupId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  {(assignType === 'DESK_SCRUTINY' ? scrutinyGroups : evcGroups).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.id}) &bull; Active: {g.activeCases}/{g.capacity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mandatory Official Assignment Justification (Min. 5 chars)
                </label>
                <textarea
                  rows={3}
                  value={assignmentReason}
                  onChange={(e) => setAssignmentReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="State the official basis or load-balancing reason for this panel assignment..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-3 py-1.5 rounded-lg border text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAssign}
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Confirm Assignment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
