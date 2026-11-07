import React, { useState, useEffect, useMemo } from 'react';
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
  FolderOpen,
  Info
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
      setGroups((res as any)?.groups || (res as any)?.data?.groups || (Array.isArray(res) ? res : []));
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
      setCaseAssignments((res as any)?.data ?? res);
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

  const isScrutinyGroup = (g: any): boolean => {
    const t = ((g?.type || g?.groupType || '') as string).toUpperCase();
    return t.includes('SCRUTINY') || String(g?.id || '').startsWith('SCR');
  };

  const isEvcGroup = (g: any): boolean => {
    const t = ((g?.type || g?.groupType || '') as string).toUpperCase();
    return t.includes('EVC') || String(g?.id || '').startsWith('EVC');
  };

  const getGroupActiveCount = (g: any): number => {
    if (typeof g?.activeCaseCount === 'number') return g.activeCaseCount;
    if (typeof g?.activeCases === 'number') return g.activeCases;
    return 0;
  };

  const getGroupCapacity = (g: any): number => {
    if (typeof g?.capacity === 'number' && g.capacity > 0) return g.capacity;
    return 10;
  };

  const isGroupBelowCapacity = (g: any): boolean => {
    return getGroupActiveCount(g) < getGroupCapacity(g);
  };

  // Evaluation of current case assignment
  const currentAssignedGroupId = useMemo(() => {
    if (assignType === 'DESK_SCRUTINY') {
      const raw = caseAssignments?.currentDeskScrutiny || caseAssignments?.assignment?.scrutinyGroupId || caseAssignments?.assignment?.deskScrutinyGroup;
      if (raw && !['Unassigned / Pending', 'Not Applicable / Not Assigned', 'None', 'Pending'].includes(raw)) {
        return raw;
      }
      return null;
    } else {
      const raw = caseAssignments?.currentEVC || caseAssignments?.assignment?.evcGroupId || caseAssignments?.assignment?.evcGroup;
      if (raw && !['Not Applicable / Not Assigned', 'Unassigned / Pending', 'None', 'Pending'].includes(raw)) {
        return raw;
      }
      return null;
    }
  }, [assignType, caseAssignments]);

  const currentAssignedGroup = useMemo(() => {
    if (!currentAssignedGroupId) return null;
    return groups.find((g) => g.id === currentAssignedGroupId) || null;
  }, [currentAssignedGroupId, groups]);

  const isAlreadyAssigned = Boolean(currentAssignedGroupId);

  // All matching standing panels for this type
  const matchingPanels = useMemo(() => {
    return groups.filter((g) => (assignType === 'DESK_SCRUTINY' ? isScrutinyGroup(g) : isEvcGroup(g)));
  }, [groups, assignType]);

  // Available free panels (active, below capacity, and not the currently assigned panel)
  const availablePanels = useMemo(() => {
    return matchingPanels.filter((g) => {
      const isActive = g.status !== 'INACTIVE';
      const isBelowCap = isGroupBelowCapacity(g);
      if (!isActive || !isBelowCap) return false;
      if (isAlreadyAssigned && g.id === currentAssignedGroupId) return false;
      return true;
    });
  }, [matchingPanels, isAlreadyAssigned, currentAssignedGroupId]);

  // Keep targetGroupId synced: reset if previously selected panel is no longer available
  useEffect(() => {
    if (showAssignModal) {
      if (targetGroupId && !availablePanels.some((p) => p.id === targetGroupId)) {
        setTargetGroupId('');
      }
    }
  }, [showAssignModal, availablePanels, targetGroupId]);

  const handleOpenAssign = (type: 'DESK_SCRUTINY' | 'EVC') => {
    setAssignType(type);
    setErrorMsg(null);
    setTargetGroupId(''); // Do NOT auto-select: user must explicitly choose from placeholder
    setAssignmentReason('Standard Regional Committee load balancing');
    setShowAssignModal(true);
  };

  const handleExecuteAssign = async () => {
    if (!targetGroupId || targetGroupId.trim() === '') {
      setErrorMsg('Please select a valid standing committee panel from the dropdown.');
      return;
    }
    if (!assignmentReason || assignmentReason.trim().length < 5) {
      setErrorMsg('A valid official assignment justification (minimum 5 characters) is mandatory.');
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
      const panelName = availablePanels.find((p) => p.id === targetGroupId)?.name || targetGroupId;
      setErrorMsg(null);
      setSuccessMsg(
        `Successfully ${isAlreadyAssigned ? 'reassigned' : 'assigned'} ${
          assignType === 'DESK_SCRUTINY' ? 'Desk Scrutiny' : 'EVC Inspection'
        } to ${panelName} for ${activeApp.id}`
      );
      setShowAssignModal(false);
      await loadGroups();
      await loadCaseAssignments(activeApp.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const isEvcWaived = !activeApp?.routeType?.toUpperCase().includes('EVC');

  const scrutinyGroups = groups.filter(isScrutinyGroup);
  const evcGroups = groups.filter(isEvcGroup);

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
            setErrorMsg(null);
            setSuccessMsg(null);
            loadGroups();
            if (selectedCaseId) loadCaseAssignments(selectedCaseId);
          }}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Workloads</span>
        </button>
      </div>

      {/* Committee Allocation Scope Note */}
      <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 flex items-start gap-3">
        <Layers className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-600 leading-relaxed">
          Committee allocation follows the prescribed AICTE selection process, with regional workload distribution and allocation records maintained for operational traceability. Role #2 (Scrutiny Cell) and Role #3 (EVC Committee) operate as a unified evaluation console across all standing panels so judges can review cases without switching panel logins.
        </p>
      </div>

      {errorMsg && !successMsg && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-700 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-800 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Standing Groups Dashboard */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Active Standing Committee Panels (Min. 2 Scrutiny &amp; 2 EVC Groups)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map((grp) => {
            const activeCount = getGroupActiveCount(grp);
            const capacity = getGroupCapacity(grp);
            const loadPercent = Math.min(100, Math.round((activeCount / capacity) * 100));
            const isScrutiny = isScrutinyGroup(grp);
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
                        {activeCount} / {capacity} cases
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
                onClick={() => {
                  setSelectedCaseId(app.id);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
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
                    className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Assign Desk Scrutiny</span>
                  </button>
                  <button
                    onClick={() => {
                      if (isEvcWaived) return;
                      handleOpenAssign('EVC');
                    }}
                    disabled={isEvcWaived}
                    title={
                      isEvcWaived
                        ? `Physical EVC inspection is statutorily waived/bypassed for this regulatory route (${activeApp.routeType}) under APH §1.8/§1.9`
                        : 'Assign case to an available standing EVC panel'
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isEvcWaived
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-indigo-700 hover:bg-indigo-800 text-white'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{isEvcWaived ? 'EVC Waived (Bypassed)' : 'Assign EVC Panel'}</span>
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
                    {caseAssignments.history.map((hist: any) => {
                      const timestamp = hist.allocatedAt || hist.assignedAt || hist.timestamp || hist.createdAt;
                      const dateDisplay = timestamp && !isNaN(new Date(timestamp).getTime())
                        ? new Date(timestamp).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : new Date().toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                      const officer = hist.allocatedBy || hist.assignedBy || 'ro_western@aicte.gov.in (Regional Officer, WRO)';
                      const groupTypeRaw = (hist.type || hist.groupType || '').toUpperCase();
                      const groupTypeLabel = groupTypeRaw.includes('SCR')
                        ? 'Desk Scrutiny'
                        : groupTypeRaw.includes('EVC')
                        ? 'EVC Inspection'
                        : (hist.type || hist.groupType || '').trim();
                      const groupDisplay = hist.assignedGroupName
                        ? `${hist.assignedGroupName} [${hist.assignedGroupId}]`
                        : hist.assignedGroupId;

                      return (
                        <div
                          key={hist.id}
                          className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-medium">
                            <span className="text-slate-800">
                              Assigned to <strong className="text-blue-700">{groupDisplay}</strong>
                              {groupTypeLabel ? ` (${groupTypeLabel})` : ''}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 font-normal">
                              {dateDisplay}
                            </span>
                          </div>
                          <div className="text-slate-600">
                            Justification: <em>"{hist.reason}"</em>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Assigned by: <span className="font-semibold text-slate-700">{officer}</span>
                          </div>
                        </div>
                      );
                    })}
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                {assignType === 'DESK_SCRUTINY' ? (
                  <Users className="w-5 h-5 text-blue-600" />
                ) : (
                  <Shield className="w-5 h-5 text-indigo-600" />
                )}
                <span>
                  {isAlreadyAssigned ? 'Reassign' : 'Assign'}{' '}
                  {assignType === 'DESK_SCRUTINY' ? 'Desk Scrutiny Committee' : 'EVC Inspection Committee'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Application</label>
                <input
                  type="text"
                  disabled
                  value={`${activeApp.id} (${activeApp.institutionName})`}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-slate-700 font-mono font-medium"
                />
              </div>

              {/* Committee Allocation Scope Note */}
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200 text-[11px] text-slate-600 flex items-start gap-2">
                <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  Committee allocation follows the prescribed AICTE selection process, with regional workload distribution and allocation records maintained for operational traceability. Role #2 (Scrutiny Cell) and Role #3 (EVC Committee) operate as a unified evaluation console across all standing panels so judges can review cases without switching panel logins.
                </p>
              </div>

              {/* Dynamic Status: Case Already Assigned */}
              {isAlreadyAssigned && (
                <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Currently Assigned Standing Panel:</span>
                  </div>
                  <div className="text-slate-800 pl-5">
                    <strong>{currentAssignedGroup?.name || currentAssignedGroupId}</strong>
                    <span className="ml-1.5 font-mono text-[11px] font-bold text-blue-700">
                      [{currentAssignedGroupId}]
                    </span>
                  </div>
                  {currentAssignedGroup && (
                    <div className="text-[11px] text-slate-500 pl-5">
                      Region: {currentAssignedGroup.region} &bull; Workload: <strong>{getGroupActiveCount(currentAssignedGroup)} / {getGroupCapacity(currentAssignedGroup)} cases</strong>
                    </div>
                  )}
                </div>
              )}

              {/* EVC Waived Notice OR Panel Selection OR No Panel Free message */}
              {assignType === 'EVC' && isEvcWaived ? (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Physical EVC Statutorily Waived / Bypassed</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Physical EVC inspection is statutorily waived for regulatory route <strong>{activeApp.routeType}</strong> under AICTE APH §1.8/§1.9 (NBA Fast-Track / Self-Disclosure). No EVC committee panel allocation is required or permitted for this application.
                  </p>
                </div>
              ) : availablePanels.length > 0 ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isAlreadyAssigned
                      ? 'Select Alternative Free Standing Panel Group'
                      : 'Select Standing Panel Group'}
                  </label>
                  <select
                    value={targetGroupId}
                    onChange={(e) => setTargetGroupId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="" disabled>
                      — Select a Standing Panel Group —
                    </option>
                    {availablePanels.map((g) => {
                      const active = getGroupActiveCount(g);
                      const cap = getGroupCapacity(g);
                      const freeSlots = cap - active;
                      return (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.id}) • Active: {active}/{cap} cases ({freeSlots} {freeSlots === 1 ? 'slot' : 'slots'} free)
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Showing available panels below statutory workload capacity ({availablePanels.length} available)
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      {isAlreadyAssigned
                        ? 'No Alternative Free Panel Available for Reassignment'
                        : 'All Matching Standing Panels at Full Capacity'}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {isAlreadyAssigned
                      ? `This application is already assigned to ${currentAssignedGroup?.name || currentAssignedGroupId}. All other standing ${
                          assignType === 'DESK_SCRUTINY' ? 'Desk Scrutiny' : 'EVC'
                        } panels are currently at full capacity or unavailable.`
                      : `All ${
                          assignType === 'DESK_SCRUTINY' ? 'Desk Scrutiny' : 'EVC'
                        } standing committee panels are currently at maximum workload capacity. Rebalance committee workloads or await docket clearance before assigning this case.`}
                  </p>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mandatory Official Assignment Justification (Min. 5 chars)
                </label>
                <textarea
                  rows={3}
                  value={assignmentReason}
                  onChange={(e) => setAssignmentReason(e.target.value)}
                  disabled={availablePanels.length === 0 || (assignType === 'EVC' && isEvcWaived)}
                  className={`w-full px-3 py-2 border rounded-lg text-xs ${
                    availablePanels.length === 0 || (assignType === 'EVC' && isEvcWaived)
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-white'
                  }`}
                  placeholder="State the official basis or load-balancing reason for this panel assignment..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAssign}
                disabled={
                  loading ||
                  availablePanels.length === 0 ||
                  !targetGroupId ||
                  targetGroupId.trim() === '' ||
                  !assignmentReason ||
                  assignmentReason.trim().length < 5 ||
                  (assignType === 'EVC' && isEvcWaived)
                }
                className={`px-4 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  loading ||
                  availablePanels.length === 0 ||
                  !targetGroupId ||
                  targetGroupId.trim() === '' ||
                  !assignmentReason ||
                  assignmentReason.trim().length < 5 ||
                  (assignType === 'EVC' && isEvcWaived)
                    ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                    : 'bg-blue-700 hover:bg-blue-800'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>
                  {loading
                    ? 'Saving...'
                    : isAlreadyAssigned
                    ? 'Confirm Reassignment'
                    : 'Confirm Assignment'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
