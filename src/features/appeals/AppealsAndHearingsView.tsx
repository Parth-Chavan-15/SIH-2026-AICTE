import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { getSession } from '../../services/session';
import {
  Scale,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  Send,
  Shield,
  Eye,
  Gavel,
  MessageSquare,
  Clock,
  Info,
  Lock,
  Building
} from 'lucide-react';

export const AppealsAndHearingsView: React.FC = () => {
  const { applications, user } = useApp();
  const session = getSession();
  const actor = session?.actor;

  const isInstitution = Boolean(
    actor?.roles?.includes('institution') || actor?.id?.startsWith('usr-inst-')
  );
  const isRO = Boolean(
    actor?.roles?.includes('regional_officer') || actor?.id === 'usr-ro-western'
  );
  const isCouncil = Boolean(
    actor?.roles?.includes('demo_authority') ||
    actor?.roles?.includes('bureau_officer') ||
    actor?.id === 'usr-bureau-hq'
  );

  // Institution target application resolution
  const targetAppId = isInstitution
    ? (actor?.id === 'usr-inst-coep' || (actor as any)?.email === 'principal@coep.ac.in') ? 'APP-2026-COEP'
      : (actor?.id === 'usr-inst-giits' || (actor as any)?.email === 'principal@giits.ac.in') ? 'APP-2026-GIITS'
      : (actor?.id === 'usr-inst-pdimtr' || (actor as any)?.email === 'principal@pdimtr.ac.in') ? 'APP-2026-PDIMTR'
      : (actor?.id === 'usr-inst-apex' || (actor as any)?.email === 'principal@apex.ac.in') ? 'APP-2026-APEX'
      : (actor?.id === 'usr-inst-batu' || (actor as any)?.email === 'principal@batu.ac.in') ? 'APP-2026-BATU'
      : (actor?.institutionIds?.[0] ? applications.find(a => a.institutionCode === actor.institutionIds[0] || a.id === actor.institutionIds[0])?.id : null) || applications[0]?.id
    : null;

  const institutionApp = isInstitution && targetAppId
    ? applications.find(a => a.id === targetAppId) || applications[0]
    : null;

  // Determine if application suffered an adverse decision/rejection
  const isAdverseDecision = Boolean(
    institutionApp &&
    (institutionApp.currentStage === 'Application Rejected' ||
      institutionApp.currentStage === 'Deficiency Communicated' ||
      (institutionApp as any).state === 'rejected' ||
      (institutionApp as any).state === 'correction_required')
  );

  const [activeTab, setActiveTab] = useState<'APPEALS' | 'HEARINGS' | 'COMPLAINTS'>('APPEALS');
  const [data, setData] = useState<any>({ appeals: [], hearings: [], complaints: [] });
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // SAC Appeal form state
  const [selectedCaseId, setSelectedCaseId] = useState<string>(targetAppId || '');
  const [appealGrounds, setAppealGrounds] = useState<string>(
    'Rejection order failed to consider registered rectification submitted within cure window. All norms compliant per APH §1.11.'
  );
  const [appellantDscToken, setAppellantDscToken] = useState<string>('DSC-TOKEN-APPEL-7718');

  // Hearing schedule state (for RO / Council)
  const [hearingCaseId, setHearingCaseId] = useState<string>('');
  const [hearingType, setHearingType] = useState<'SHC' | 'SAC'>('SHC');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [hearingVenue, setHearingVenue] = useState<string>('https://aicte-hearings.gov.in/room-shc-3');

  // Complaint form state
  const [complainantName, setComplainantName] = useState<string>(
    isInstitution ? (institutionApp?.institutionName || 'Principal / Authorized Representative') : 'Prof. R. K. Sharma'
  );
  const [complainantId, setComplainantId] = useState<string>('ABCDE1234F');
  const [complaintDetails, setComplaintDetails] = useState<string>(
    'Grievance regarding infrastructure deficiency miscalculation under Chapter VII §7.10 norms.'
  );
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  // Disposition modal (for Council / SAC Bench)
  const [disposingAppealId, setDisposingAppealId] = useState<string | null>(null);
  const [dispositionDecision, setDispositionDecision] = useState<'RELIEF_GRANTED' | 'REJECTION_UPHELD' | 'REFERRED_TO_SHC'>('RELIEF_GRANTED');
  const [dispositionRemarks, setDispositionRemarks] = useState<string>('Appeal examined by SAC bench; relief granted per revised documents.');

  const fetchData = async () => {
    try {
      const res = await api.getAppealsAndHearings();
      setData(res.data || { appeals: [], hearings: [], complaints: [] });
      if (!selectedCaseId && applications.length > 0) {
        setSelectedCaseId(targetAppId || applications[0].id);
        setHearingCaseId(applications[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load appeals data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    if (targetAppId) {
      setSelectedCaseId(targetAppId);
    }
  }, [targetAppId]);

  const handleLodgeAppeal = async () => {
    const caseToSubmit = isInstitution ? targetAppId : selectedCaseId;
    if (!caseToSubmit || appealGrounds.trim().length < 10) {
      setErrorMsg('Valid case ID and detailed grounds are required to lodge an appeal.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.lodgeAppeal({
        caseId: caseToSubmit,
        institutionId: institutionApp?.institutionCode || 'INST-DEMO',
        grounds: appealGrounds,
        appellantDscToken
      });
      setSuccessMsg(`Statutory Appeal ${res.data?.appeal?.id || res.data?.id} successfully lodged with SAC!`);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Lodge appeal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleHearing = async () => {
    if (!hearingCaseId) {
      setErrorMsg('Please select a target application case.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.scheduleHearing({
        caseId: hearingCaseId,
        hearingType,
        committeeMembers: ['Dr. V. K. Paul (Chair)', 'Prof. A. S. Pant', 'Adv. S. K. Hegde (Legal Expert)'],
        scheduledDate,
        hearingMode: 'VIRTUAL',
        venueOrLink: hearingVenue
      });
      setSuccessMsg(`Hearing ${res.data?.hearing?.id || res.data?.id} scheduled successfully!`);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Schedule hearing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileComplaint = async () => {
    if (isAnonymous) {
      setErrorMsg('Anonymous complaints are strictly rejected under APH Chapter VII §7.10(h). Please uncheck anonymous or provide verified identity.');
      return;
    }
    if (!complaintDetails.trim()) {
      setErrorMsg('Grievance description is required.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.fileComplaint({
        caseId: isInstitution ? targetAppId || undefined : undefined,
        institutionId: institutionApp?.institutionCode || 'INST-DEMO',
        complainantName,
        complainantAadhaarOrPan: complainantId,
        complaintDetails,
        isAnonymous: false
      });
      setSuccessMsg(`Grievance/Complaint ${res.data?.complaint?.id || res.data?.id} recorded under Chapter VII!`);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to file complaint');
    } finally {
      setLoading(false);
    }
  };

  const handleDisposeAppeal = async () => {
    if (!disposingAppealId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.disposeAppeal(disposingAppealId, {
        decision: dispositionDecision,
        remarks: dispositionRemarks,
        committeeMembers: ['SAC Retired High Court Judge', 'Senior Academic Expert']
      });
      setSuccessMsg(`Appeal ${disposingAppealId} disposed with decision: ${dispositionDecision}`);
      setDisposingAppealId(null);
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Appeal disposition failed');
    } finally {
      setLoading(false);
    }
  };

  // Filter docket lists based on role
  const displayedAppeals = isInstitution && targetAppId
    ? (data.appeals || []).filter((a: any) => a.caseId === targetAppId)
    : (data.appeals || []);

  const displayedHearings = isInstitution && targetAppId
    ? (data.hearings || []).filter((h: any) => h.caseId === targetAppId)
    : (data.hearings || []);

  const displayedComplaints = isInstitution && targetAppId
    ? (data.complaints || []).filter((c: any) => c.caseId === targetAppId || c.institutionName?.toLowerCase().includes((institutionApp?.institutionName || '').toLowerCase().split(' ')[0]))
    : (data.complaints || []);

  return (
    <div className="space-y-6">
      {/* Role-Aware Governance Banner */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex items-start gap-3 shadow-sm">
        <Scale className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <p className="font-bold uppercase tracking-wider text-purple-950">
            {isInstitution
              ? 'Institutional Appeals, Summons & Grievance Desk'
              : isRO
              ? 'Regional Office SHC Hearings & Grievances Desk (APH §2.23.3)'
              : 'Standing Appellate Committee (SAC) Bench & Council Dispositions (APH §2.24)'}
          </p>
          <p className="mt-1 text-purple-800">
            Under AICTE statutory regulations, SAC (Standing Appellate Committee), SHC (Standing Hearing Committee), and PGRC/SCSC Complaints are <strong>separate conditional branches</strong>, not mandatory steps on the regular spine. Rejection orders trigger a statutory 7-calendar-day appeal window to SAC. Anonymous complaints are strictly barred per Chapter VII §7.10(h).
          </p>
        </div>
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('APPEALS')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'APPEALS'
              ? 'border-purple-600 text-purple-700 bg-purple-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>1. SAC Statutory Appeals (APH §1.11 / §2.24)</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
            {displayedAppeals.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('HEARINGS')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'HEARINGS'
              ? 'border-blue-600 text-blue-700 bg-blue-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>2. SHC Compliance Hearings (APH §2.23.3)</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
            {displayedHearings.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLAINTS')}
          className={`py-3 px-5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'COMPLAINTS'
              ? 'border-amber-600 text-amber-700 bg-amber-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>3. Grievances &amp; SCSC Complaints (Chapter VII)</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            {displayedComplaints.length}
          </span>
        </button>
      </div>

      {/* TAB 1: SAC STATUTORY APPEALS */}
      {activeTab === 'APPEALS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Lodge Appeal or Notice */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-600" />
              <span>
                {isInstitution ? 'Lodge SAC Statutory Appeal' : 'SAC Appeal Statutory Rules'}
              </span>
            </h3>

            {isInstitution && !isAdverseDecision ? (
              // Status Card for non-rejected applicant
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">No Adverse Decision on Record</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Statutory appeals under APH §1.11 / §2.24 are applicable exclusively to applications aggrieved by an adverse decision or rejection order issued by the Competent Authority.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Application:</span>
                    <span className="font-mono font-bold text-slate-800">{targetAppId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Status:</span>
                    <span className="font-semibold text-blue-700">{institutionApp?.currentStage || 'Active Review'}</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  If an adverse order or Letter of Rejection (LoR) is issued, a statutory 7-calendar-day window will automatically open here allowing your institution to lodge an appeal with your DSC token.
                </p>
              </div>
            ) : (
              // Lodge Appeal Form (for rejected institution or RO/Council testing)
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Technical institutions aggrieved by an adverse Executive Committee decision may file an appeal to the Standing Appellate Committee within 7 calendar days.
                </p>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Application Case</label>
                    {isInstitution ? (
                      <input
                        type="text"
                        disabled
                        value={`${targetAppId} • ${institutionApp?.institutionName || 'My College'}`}
                        className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-slate-700 font-mono text-xs"
                      />
                    ) : (
                      <select
                        value={selectedCaseId}
                        onChange={(e) => setSelectedCaseId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                      >
                        {applications.map((app) => (
                          <option key={app.id} value={app.id}>
                            {app.id} &bull; {app.institutionName} ({app.currentStage})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Appellate Grounds (Specific Shortcoming Contestation per APH §1.11 / §2.24)
                    </label>
                    <textarea
                      rows={4}
                      value={appealGrounds}
                      onChange={(e) => setAppealGrounds(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Detail specific documentary grounds contesting the adverse finding..."
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Appellant Cryptographic Token Serial</label>
                    <input
                      type="text"
                      value={appellantDscToken}
                      onChange={(e) => setAppellantDscToken(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleLodgeAppeal}
                  disabled={loading}
                  className="w-full py-2 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Lodge Appeal with SAC</span>
                </button>
              </div>
            )}
          </div>

          {/* Column 2 & 3: Active Appeals Docket */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {isInstitution ? 'My SAC Appeals Docket' : 'Active SAC Statutory Appeals Docket'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                APH §1.11 &bull; §2.24 Bench
              </span>
            </div>

            {displayedAppeals.length > 0 ? (
              <div className="space-y-3">
                {displayedAppeals.map((app: any) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{app.id}</span>
                        <span className="font-mono text-purple-700 font-semibold px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
                          {app.caseId}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'LODGED'
                            ? 'bg-amber-100 text-amber-800'
                            : app.status === 'DISPOSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <p className="text-slate-700">
                      <strong>Grounds: </strong>
                      {app.grounds}
                    </p>

                    {app.observations && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                        <strong className="block text-slate-700 mb-0.5">SAC Bench Ruling / Observations:</strong>
                        <span>{app.observations}</span>
                        {app.recommendation && (
                          <div className="mt-1 font-semibold text-purple-900">
                            Disposition: {app.recommendation}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                      <span>Lodged: {new Date(app.lodgedAt).toLocaleString()}</span>
                      {/* Only Council Authority (Role 5) can record SAC Dispositions */}
                      {isCouncil && app.status !== 'DISPOSED' && (
                        <button
                          onClick={() => setDisposingAppealId(app.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white font-sans text-xs font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <Gavel className="w-3.5 h-3.5" />
                          <span>Record SAC Disposition</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-50 border border-dashed text-center text-xs text-slate-400">
                {isInstitution
                  ? 'No statutory SAC appeals currently lodged for your institution.'
                  : 'No active SAC appeals currently docketed.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SHC COMPLIANCE HEARINGS */}
      {activeTab === 'HEARINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Schedule Hearing (RO/Council) OR Summons Notice (Institution) */}
          {isInstitution ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Hearing Summons &amp; Notice (APH §2.23.3)</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Standing Hearing Committee (SHC) hearings are scheduled exclusively by the AICTE Regional Office to examine contested deficiencies before final Council determination.
              </p>

              {displayedHearings.length > 0 ? (
                <div className="p-3.5 rounded-lg bg-blue-50 border border-blue-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-blue-900 font-bold">
                    <Calendar className="w-4 h-4 text-blue-700" />
                    <span>Active Hearing Summons Issued</span>
                  </div>
                  <p className="text-blue-800 text-[11px]">
                    Your institution is summoned to attend the virtual hearing session on the date and link listed in the roster. Authorized institutional signatories must join with relevant supporting documentation.
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                  <p className="font-bold text-slate-800">No Hearing Summons Pending</p>
                  <p className="text-slate-500 text-[11px]">
                    No compliance shortcomings have been referred to the Standing Hearing Committee for your institution.
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Schedule Hearing Form for Regional Officer / Council
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Schedule Hearing (APH §2.23.3)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Application Case</label>
                  <select
                    value={hearingCaseId}
                    onChange={(e) => setHearingCaseId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.id} &bull; {app.institutionName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hearing Bench Type</label>
                  <select
                    value={hearingType}
                    onChange={(e: any) => setHearingType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="SHC">SHC - Standing Hearing Committee (APH §2.23.3)</option>
                    <option value="SAC">SAC - Standing Appellate Committee Hearing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Virtual Room / Venue URL</label>
                  <input
                    type="text"
                    value={hearingVenue}
                    onChange={(e) => setHearingVenue(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleScheduleHearing}
                disabled={loading}
                className="w-full py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Formal Hearing</span>
              </button>
            </div>
          )}

          {/* Column 2 & 3: Scheduled Hearings List */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              {isInstitution ? 'My Institution Hearing Proceedings' : 'Scheduled Standing Committee Hearings'}
            </h3>

            {displayedHearings.length > 0 ? (
              <div className="space-y-3">
                {displayedHearings.map((h: any) => (
                  <div
                    key={h.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{h.id}</span>
                        <span className="font-mono text-blue-700 font-semibold px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                          {h.caseId}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                        {h.hearingType} &bull; {h.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-600">
                      <div>Scheduled Date: <strong>{h.scheduledDate}</strong></div>
                      <div>Venue / Room: <code className="text-blue-700">{h.venueOrLink}</code></div>
                      <div>Members: {h.committeeMembers?.join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-50 border border-dashed text-center text-xs text-slate-400">
                {isInstitution
                  ? 'No Standing Hearing Committee proceedings scheduled for your institution.'
                  : 'No hearings currently scheduled.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: GRIEVANCES & COMPLAINTS */}
      {activeTab === 'COMPLAINTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <span>File Grievance / Complaint (Chapter VII)</span>
            </h3>

            <p className="text-xs text-slate-500">
              Grievances are investigated via Public Grievance Redressal Committee (PGRC) and Standing Complaint Scrutiny Committee (SCSC). Anonymous complaints are rejected per §7.10(h).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Complainant Name</label>
                <input
                  type="text"
                  value={complainantName}
                  onChange={(e) => setComplainantName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Complainant PAN / Aadhaar</label>
                <input
                  type="text"
                  value={complainantId}
                  onChange={(e) => setComplainantId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grievance Description</label>
                <textarea
                  rows={4}
                  value={complaintDetails}
                  onChange={(e) => setComplaintDetails(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Detail factual grounds and clause violations..."
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span className="font-semibold text-slate-700">Submit as Anonymous (Will trigger rejection per §7.10)</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleFileComplaint}
              disabled={loading}
              className="w-full py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Submit Grievance to SCSC</span>
            </button>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              {isInstitution ? 'My Institution Grievance Registry' : 'Grievance & Complaint Registry'}
            </h3>

            {displayedComplaints.length > 0 ? (
              <div className="space-y-3">
                {displayedComplaints.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 text-sm">{c.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === 'UNDER_SCSC_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <p className="text-slate-700">
                      <strong>Details: </strong>
                      {c.complaintDetails}
                    </p>

                    <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                      <span>Complainant: {c.complainantName}</span>
                      <span>Filed: {new Date(c.filedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-50 border border-dashed text-center text-xs text-slate-400">
                {isInstitution ? 'No grievances registered for your institution.' : 'No complaints currently registered.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DISPOSITION MODAL (Council / SAC Bench Only) */}
      {disposingAppealId && isCouncil && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Record SAC Appellate Disposition</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appeal Reference</label>
                <input
                  type="text"
                  disabled
                  value={disposingAppealId}
                  className="w-full px-3 py-2 border rounded-lg bg-slate-100 text-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appellate Decision</label>
                <select
                  value={dispositionDecision}
                  onChange={(e: any) => setDispositionDecision(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="RELIEF_GRANTED">RELIEF_GRANTED - Forward for Approval (APH §2.24)</option>
                  <option value="REJECTION_UPHELD">REJECTION_UPHELD - Dismiss Appeal (Final AICTE Order)</option>
                  <option value="REFERRED_TO_SHC">REFERRED_TO_SHC - Remand to Standing Hearing Committee</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bench Remarks &amp; Statutory Grounds</label>
                <textarea
                  rows={3}
                  value={dispositionRemarks}
                  onChange={(e) => setDispositionRemarks(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDisposingAppealId(null)}
                className="px-3 py-1.5 rounded-lg border text-slate-600 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDisposeAppeal}
                disabled={loading}
                className="px-4 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>Submit SAC Order</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};