import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, WorkflowStage, DocumentItem } from '../../types';
import { SLABadge, StageBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { formatDateIndian } from '../../utils/slaCalculator';
import { getEligibleNextStages, validateWorkflowTransition } from '../../utils/workflowEngine';
import {
  X,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Calendar,
  ShieldCheck,
  History,
  FileCheck,
  Award,
  ArrowRight,
  MessageSquare,
  Send,
  Upload,
  AlertCircle,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface ApplicationDetailModalProps {
  applicationId: string;
  onClose: () => void;
  onOpenEVCModal?: (appId: string) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  applicationId,
  onClose,
  onOpenEVCModal,
}) => {
  const {
    role,
    user,
    applications,
    evcInspections,
    complianceItems,
    auditLog,
    transitionStage,
    addObservation,
    verifyDocument,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'details' | 'documents' | 'timeline' | 'observations' | 'evc' | 'compliance' | 'audit'
  >('overview');

  // Transition form state
  const [selectedTargetStage, setSelectedTargetStage] = useState<WorkflowStage | ''>('');
  const [mandatoryReason, setMandatoryReason] = useState('');
  const [transitionError, setTransitionError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // New observation state
  const [newObsComment, setNewObsComment] = useState('');
  const [newObsType, setNewObsType] = useState<'Observation' | 'Deficiency' | 'Clarification Request' | 'Recommendation'>('Observation');
  const [newObsMandatory, setNewObsMandatory] = useState(false);

  const application = applications.find((a) => a.id === applicationId);
  if (!application) return null;

  const evcRecord = evcInspections.find((e) => e.applicationId === application.id || e.id === application.evcId);
  const appCompliances = complianceItems.filter((c) => c.applicationId === application.id);
  const appAudits = auditLog.filter(
    (a) => a.applicationId === application.id || a.applicationNumber === application.applicationNumber
  );

  // Workflow eligible options
  const eligibleStages = getEligibleNextStages(application.currentStage, application.routeType);

  const handleExecuteTransition = async () => {
    if (!selectedTargetStage) return;
    const option = eligibleStages.find((o) => o.stage === selectedTargetStage);
    if (!option) return;

    const validation = validateWorkflowTransition(role, option, mandatoryReason);
    if (!validation.isValid) {
      setTransitionError(validation.errorMessage || 'Validation failed');
      return;
    }

    setTransitionError(null);
    setIsTransitioning(true);
    try {
      await transitionStage(application.id, selectedTargetStage, mandatoryReason);
      setSelectedTargetStage('');
      setMandatoryReason('');
    } catch (e: any) {
      setTransitionError(e.message);
    } finally {
      setIsTransitioning(false);
    }
  };

  const handlePostObservation = async () => {
    if (!newObsComment.trim()) return;
    await addObservation(application.id, newObsType, newObsComment, newObsMandatory);
    setNewObsComment('');
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'details', label: 'Details' },
    { id: 'documents', label: `Documents (${application.documents.length})` },
    { id: 'timeline', label: 'Workflow Timeline' },
    { id: 'observations', label: `Observations (${application.observations.length})` },
    { id: 'evc', label: 'EVC Details' },
    { id: 'compliance', label: `Compliance (${appCompliances.length})` },
    { id: 'audit', label: 'Audit History' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Top Header */}
        <div className="bg-[#0A2540] text-white p-5 flex items-start justify-between border-b border-slate-700/60">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold bg-blue-500/20 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                {application.applicationNumber}
              </span>
              <PriorityBadge priority={application.priority} />
              <span className="text-xs text-slate-300">
                Route: <strong className="text-white">{application.routeType}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {application.institutionName}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {application.city}, {application.state} &bull; Code: {application.institutionCode} &bull; Region: {application.region}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Stage & SLA Status Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Current Stage:</span>
              <StageBadge stage={application.currentStage} />
            </div>

            <div className="border-l border-slate-200 pl-3">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">SLA Health:</span>
              <SLABadge
                status={application.slaStatus}
                overdueDays={application.overdueDays}
                daysRemaining={Math.max(0, application.stageDeadlineDays - application.elapsedDaysAtStage)}
              />
            </div>

            <div className="border-l border-slate-200 pl-3 hidden sm:block">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Time at Stage:</span>
              <span className="font-bold text-slate-800">{application.elapsedDaysAtStage} Days (SLA: {application.stageDeadlineDays}d)</span>
            </div>

            <div className="border-l border-slate-200 pl-3 hidden md:block">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Responsible:</span>
              <span className="font-medium text-slate-800">{application.assignedOfficer}</span>
            </div>
          </div>

          {/* Quick Action Trigger (if eligible transitions exist) */}
          {eligibleStages.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                Action Eligible ({eligibleStages.length})
              </span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-white px-5 flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Application Type</span>
                  <span className="text-xs font-bold text-slate-900 mt-1 block">{application.applicationType}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Academic Year</span>
                  <span className="text-xs font-bold text-slate-900 mt-1 block">{application.academicYear}</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Program & Intake</span>
                  <span className="text-xs font-bold text-slate-900 mt-1 block">{application.program} ({application.proposedIntake} seats)</span>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Submission Date</span>
                  <span className="text-xs font-bold text-slate-900 mt-1 block">{formatDateIndian(application.submittedAt)}</span>
                </div>
              </div>

              {/* Regulatory Action Execution Box */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck className="w-4 h-4 text-blue-700" />
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Workflow Action Console (Current Role: {user.roleTitle})
                  </h4>
                </div>

                {eligibleStages.length === 0 ? (
                  <p className="text-xs text-slate-600">
                    No further automated transitions available from stage &ldquo;{application.currentStage}&rdquo;.
                  </p>
                ) : (
                  <div className="space-y-3 mt-3">
                    <p className="text-xs text-slate-700">
                      Select next eligible stage transition. Notice: The backend validates regulatory authority; actions require mandatory justification reasons where applicable.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {eligibleStages.map((opt) => (
                        <label
                          key={opt.stage}
                          className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedTargetStage === opt.stage
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="targetStage"
                            value={opt.stage}
                            checked={selectedTargetStage === opt.stage}
                            onChange={() => {
                              setSelectedTargetStage(opt.stage);
                              setTransitionError(null);
                            }}
                            className="mt-1"
                          />
                          <div>
                            <span className="font-bold text-xs block">{opt.actionLabel}</span>
                            <span className={`text-[11px] block mt-0.5 ${selectedTargetStage === opt.stage ? 'text-blue-100' : 'text-slate-500'}`}>
                              {opt.description}
                            </span>
                            {opt.requiresMandatoryReason && (
                              <span className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.2 rounded ${selectedTargetStage === opt.stage ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'}`}>
                                Mandatory Reason Required
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>

                    {selectedTargetStage && (
                      <div className="space-y-2 mt-2 bg-white p-3 rounded-lg border border-slate-200">
                        <label className="text-xs font-bold text-slate-700 block">
                          Official Regulatory Remarks / Mandatory Reason:
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Provide detailed justification, official remarks, or specific deficiencies observed..."
                          value={mandatoryReason}
                          onChange={(e) => setMandatoryReason(e.target.value)}
                          className="w-full p-2.5 rounded-md border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        {transitionError && (
                          <p className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {transitionError}
                          </p>
                        )}
                        <button
                          onClick={handleExecuteTransition}
                          disabled={isTransitioning}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isTransitioning ? 'Validating...' : 'Confirm & Execute Stage Transition'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Latest Observations Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Active Observations & Remarks ({application.observations.length})
                </h4>
                {application.observations.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                    No deficiencies or remarks recorded yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {application.observations.map((obs) => (
                      <div key={obs.id} className="p-3 rounded-xl border border-slate-200 bg-white text-xs">
                        <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                          <span className="font-semibold text-slate-800">{obs.authorName} ({obs.authorRole})</span>
                          <span>{formatDateIndian(obs.timestamp)}</span>
                        </div>
                        <p className="text-slate-800 leading-relaxed">{obs.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: APPLICATION DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-3">Institution Profile</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Institution Full Name:</span>
                    <span className="text-slate-900 font-medium">{application.institutionName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">AICTE Permanent Institute ID:</span>
                    <span className="text-slate-900 font-mono font-medium">{application.institutionCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Campus Location:</span>
                    <span className="text-slate-900 font-medium">{application.city}, {application.state}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Regional Jurisdiction:</span>
                    <span className="text-slate-900 font-medium">{application.region} Regional Office</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-3">Approval Scope & Academic Course Proposal</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Application Category:</span>
                    <span className="text-slate-900 font-medium">{application.applicationType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Target Academic Session:</span>
                    <span className="text-slate-900 font-medium">{application.academicYear}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Faculty Domain / Program:</span>
                    <span className="text-slate-900 font-medium">{application.program}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Proposed Sanctioned Intake:</span>
                    <span className="text-slate-900 font-medium">{application.proposedIntake} Students</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Prescribed Documents & Regulatory Evidence
                  </h4>
                  <p className="text-xs text-slate-500">
                    Mandatory filings per AICTE Approval Process Handbook (APH)
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{doc.name}</p>
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-semibold border ${
                              doc.status === 'Verified'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : doc.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {doc.fileName} &bull; {doc.fileSize} &bull; Category: {doc.category}
                        </p>
                        {doc.rejectionReason && (
                          <p className="text-rose-600 font-medium text-[11px] mt-1 bg-rose-50 p-1.5 rounded">
                            Deficiency Note: {doc.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Verification Controls for Officers */}
                    <div className="flex items-center gap-2 shrink-0">
                      {(role === 'regional_officer' || role === 'bureau_officer' || role === 'admin') && doc.status !== 'Verified' && (
                        <>
                          <button
                            onClick={() => verifyDocument(application.id, doc.id, 'Verified')}
                            className="px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs"
                          >
                            Verify Document
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Specify deficiency reason for rejection:');
                              if (reason) verifyDocument(application.id, doc.id, 'Rejected', reason);
                            }}
                            className="px-2.5 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs border border-rose-200"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => alert(`Previewing signed file "${doc.fileName}". Secure short-lived document token active.`)}
                        className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WORKFLOW TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Workflow Audit Timeline & Stage Progress
              </h4>
              <div className="relative border-l-2 border-slate-200 ml-4 pl-4 space-y-6">
                {application.timeline.map((event, idx) => (
                  <div key={event.id} className="relative text-xs">
                    <div
                      className={`absolute -left-[23px] top-0 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                        event.status === 'completed'
                          ? 'border-emerald-500 bg-emerald-500'
                          : event.status === 'active'
                          ? 'border-blue-500 bg-blue-500 animate-pulse'
                          : event.status === 'overdue'
                          ? 'border-rose-500 bg-rose-500'
                          : 'border-slate-300'
                      }`}
                    />
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-bold text-slate-800">{event.stage}</span>
                        <span>{formatDateIndian(event.timestamp)}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{event.action}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        By {event.actorName} ({event.actorRole})
                      </p>
                      {event.notes && (
                        <p className="text-[11px] text-blue-900 bg-blue-50 p-2 rounded mt-1.5 border border-blue-100">
                          {event.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: OBSERVATIONS */}
          {activeTab === 'observations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Official Observations & Clarifications
                </h4>
              </div>

              {/* Add observation form */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h5 className="font-bold text-xs text-slate-800">Record Regulatory Note / Remark</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <select
                    value={newObsType}
                    onChange={(e) => setNewObsType(e.target.value as any)}
                    className="p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="Observation">General Observation</option>
                    <option value="Deficiency">Deficiency Note</option>
                    <option value="Clarification Request">Clarification Request</option>
                    <option value="Recommendation">Recommendation</option>
                  </select>
                  <label className="flex items-center gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      checked={newObsMandatory}
                      onChange={(e) => setNewObsMandatory(e.target.checked)}
                    />
                    <span>Requires Mandatory Institution Response</span>
                  </label>
                </div>
                <textarea
                  rows={2}
                  placeholder="Enter observation or deficiency details..."
                  value={newObsComment}
                  onChange={(e) => setNewObsComment(e.target.value)}
                  className="w-full p-2.5 rounded border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  onClick={handlePostObservation}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-2xs"
                >
                  Append Official Note
                </button>
              </div>

              {/* List */}
              <div className="space-y-2">
                {application.observations.map((obs) => (
                  <div key={obs.id} className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                      <span className="font-bold text-slate-900">
                        {obs.type} &bull; {obs.authorName} ({obs.authorRole})
                      </span>
                      <span>{formatDateIndian(obs.timestamp)}</span>
                    </div>
                    <p className="text-slate-800 mt-1 leading-relaxed">{obs.comment}</p>
                    {obs.mandatoryResolutionRequired && (
                      <span className="inline-block mt-2 text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                        Mandatory Rectification
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: EVC DETAILS */}
          {activeTab === 'evc' && (
            <div className="space-y-4 text-xs">
              {evcRecord ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Expert Visit Committee (EVC) Dossier</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      {evcRecord.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 font-semibold block text-[11px]">Scheduled Visit Date:</span>
                      <span className="text-slate-900 font-bold">{evcRecord.scheduledDate} ({evcRecord.scheduledTime})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block text-[11px]">Inspection Chairman:</span>
                      <span className="text-slate-900 font-bold">{evcRecord.committeeChairman}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-semibold block text-[11px]">Committee Members:</span>
                    <ul className="list-disc list-inside text-slate-700 mt-1">
                      {evcRecord.committeeMembers.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  {evcRecord.reportSubmitted && (
                    <div className="bg-white p-3 rounded-lg border border-slate-200 mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">EVC Recommendation:</span>
                        <span className="font-bold text-emerald-700">{evcRecord.recommendation}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs mt-2">
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">Infra Score</span>
                          <span className="font-bold text-blue-700">{evcRecord.infrastructureScore}%</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">Faculty Score</span>
                          <span className="font-bold text-blue-700">{evcRecord.facultyScore}%</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">Lab Score</span>
                          <span className="font-bold text-blue-700">{evcRecord.laboratoriesScore}%</span>
                        </div>
                      </div>
                      <p className="text-slate-700 text-xs mt-2 italic bg-slate-50 p-2 rounded">
                        &ldquo;{evcRecord.reportSummary}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-800">No EVC Assigned</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    This route ({application.routeType}) does not currently have a scheduled inspection.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: COMPLIANCE */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Institutional Undertakings & Mandatory Compliances
              </h4>
              {appCompliances.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                  No pending compliance undertakings recorded for this application.
                </p>
              ) : (
                <div className="space-y-2">
                  {appCompliances.map((item) => (
                    <div key={item.id} className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900">{item.conditionTitle}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-slate-600">{item.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span>Due Date: <strong>{item.dueDate}</strong> ({item.daysRemaining}d remaining)</span>
                        {item.evidenceDocumentName && (
                          <span className="text-blue-600 font-medium">Evidence: {item.evidenceDocumentName}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: AUDIT HISTORY */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Immutable Blockchain/SHA256 Audit Trail
              </h4>
              <div className="space-y-2 text-xs font-mono">
                {appAudits.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                      <span className="font-bold text-slate-800">{log.action}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="text-slate-800 text-xs font-sans">{log.reason || 'State transition'}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Actor: {log.actorName} ({log.actorRole})</span>
                      <span className="text-blue-600">{log.tamperProofHash.slice(0, 24)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            AICTE Approval Engine &bull; Official Record ID: {application.id}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
