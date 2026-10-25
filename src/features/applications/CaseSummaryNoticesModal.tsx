import React, { useState } from 'react';
import { Application } from '../../types';
import { X, Copy, Check, Download, Printer, Shield, FileText, Send, AlertTriangle, Calendar, Award } from 'lucide-react';

interface CaseSummaryNoticesModalProps {
  application: Application;
  onClose: () => void;
}

type NoticeType = 
  | 'SCRUTINY_SCHEDULE_INTIMATION'
  | 'PORTAL_DEFICIENCY_COMMUNICATION'
  | 'EVC_INSPECTION_INTIMATION'
  | 'CONDITIONAL_EOA_UNDERTAKING'
  | 'SPEAKING_ORDER_OR_LOD';

export const CaseSummaryNoticesModal: React.FC<CaseSummaryNoticesModalProps> = ({
  application,
  onClose,
}) => {
  const isCOEP = application.id.includes('COEP') || application.institutionCode === 'INST-SOUTH';
  const isGIITS = application.id.includes('GIITS') || application.institutionCode === 'INST-NORTH';
  const isPDIMTR = application.id.includes('PDIMTR') || application.institutionCode === 'INST-WEST';
  const isApex = application.id.includes('APEX') || application.institutionCode === 'INST-APEX';
  const isBATU = application.id.includes('BATU') || application.institutionCode === 'INST-BATU';

  // Automatically select the scenario-specific primary statutory notice
  const initialActiveTab: NoticeType = isGIITS 
    ? 'PORTAL_DEFICIENCY_COMMUNICATION'
    : isPDIMTR 
    ? 'CONDITIONAL_EOA_UNDERTAKING'
    : isApex 
    ? 'SPEAKING_ORDER_OR_LOD'
    : isBATU 
    ? 'EVC_INSPECTION_INTIMATION'
    : 'SCRUTINY_SCHEDULE_INTIMATION';

  const [activeTab, setActiveTab] = useState<NoticeType>(initialActiveTab);
  const [copied, setCopied] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Scenario-specific notice status and eligibility
  const NOTICE_STATUS: Record<NoticeType, { state: 'ACTIVE' | 'ISSUED' | 'WAIVED' | 'NOT_APPLICABLE' | 'PENDING'; badgeText: string; badgeColor: string; reason: string }> = {
    SCRUTINY_SCHEDULE_INTIMATION: isBATU 
      ? { state: 'WAIVED', badgeText: 'Waived (§2.16.1)', badgeColor: 'bg-slate-100 text-slate-700 border-slate-300', reason: 'Restoration / Site Shifting waives preliminary desk scrutiny and routes straight to physical EVC.' }
      : { state: 'ISSUED', badgeText: 'Issued', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300', reason: 'Desk Scrutiny intimation notice served to institution.' },
    
    PORTAL_DEFICIENCY_COMMUNICATION: isGIITS
      ? { state: 'ACTIVE', badgeText: 'Active Notice (D1, D2)', badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold ring-1 ring-amber-400', reason: 'Faculty cadre deficit (1:2.4) flagged. 15-day cure window open under Annexure 7.' }
      : isApex
      ? { state: 'ISSUED', badgeText: 'Issued', badgeColor: 'bg-amber-50 text-amber-800 border-amber-200', reason: 'Deficiency communication served.' }
      : isCOEP
      ? { state: 'NOT_APPLICABLE', badgeText: 'Clean (0 Deficits)', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', reason: 'Desk Scrutiny verified 100% compliance under NBA Tier-1 fast-track. Zero deficiencies observed.' }
      : isPDIMTR
      ? { state: 'NOT_APPLICABLE', badgeText: 'N/A (Self-Disclosure)', badgeColor: 'bg-slate-100 text-slate-600 border-slate-200', reason: 'Fast-Track EoA Self-Disclosure route.' }
      : { state: 'NOT_APPLICABLE', badgeText: 'N/A (Waived Scrutiny)', badgeColor: 'bg-slate-100 text-slate-600 border-slate-200', reason: 'Direct EVC inspection route.' },

    EVC_INSPECTION_INTIMATION: isCOEP
      ? { state: 'WAIVED', badgeText: 'Waived (NBA)', badgeColor: 'bg-purple-100 text-purple-900 border-purple-300 font-bold', reason: 'Exempted per APH 2026–27 Errata p. 42 §2.6(c)(1): NBA Tier-1 accreditation exempts physical EVC.' }
      : isBATU
      ? { state: 'ACTIVE', badgeText: 'Active Notice', badgeColor: 'bg-blue-100 text-blue-900 border-blue-300 font-extrabold ring-1 ring-blue-400', reason: 'Physical campus inspection mandate queued for 3-member EVC panel.' }
      : isGIITS
      ? { state: 'PENDING', badgeText: 'Queued (Post-Cure)', badgeColor: 'bg-amber-50 text-amber-800 border-amber-200', reason: 'Scheduled upon successful verification of re-scrutiny cure.' }
      : isApex
      ? { state: 'ISSUED', badgeText: 'Conducted', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200', reason: 'EVC physical verification completed.' }
      : { state: 'NOT_APPLICABLE', badgeText: 'N/A (Fast-Track EoA)', badgeColor: 'bg-slate-100 text-slate-600 border-slate-200', reason: 'Not applicable for standard EoA renewal.' },

    CONDITIONAL_EOA_UNDERTAKING: isPDIMTR
      ? { state: 'ACTIVE', badgeText: 'Active Order (30-Yr Lease)', badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold ring-1 ring-emerald-400', reason: 'Conditional EoA sanctioned subject to time-bound Form-6 undertakings and 30-year lease deed renewal.' }
      : isCOEP
      ? { state: 'ISSUED', badgeText: 'Standard EoA', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200', reason: 'Unconditional Extension of Approval issued.' }
      : { state: 'PENDING', badgeText: 'Pending Council EC', badgeColor: 'bg-slate-100 text-slate-600 border-slate-200', reason: 'Awaiting completion of scrutiny and inspection stages.' },

    SPEAKING_ORDER_OR_LOD: isApex
      ? { state: 'ACTIVE', badgeText: 'Active Order (SAC Appeal)', badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold ring-1 ring-rose-400', reason: 'Formal Speaking Order issued under APH §1.11 granting 15-day appellate recourse before SAC.' }
      : { state: 'NOT_APPLICABLE', badgeText: 'Not Applicable', badgeColor: 'bg-slate-100 text-slate-500 border-slate-200', reason: 'Quasi-judicial speaking orders are only formulated upon rejection or appeal referral.' }
  };

  const NOTICES_CONFIG: Record<
    NoticeType,
    {
      title: string;
      shortLabel: string;
      icon: typeof FileText;
      statutoryClause: string;
      subject: string;
      body: string;
      actionRequired: string;
    }
  > = {
    SCRUTINY_SCHEDULE_INTIMATION: {
      title: 'Scrutiny Schedule & Panel Intimation Notice',
      shortLabel: '1. Scrutiny Schedule',
      icon: Calendar,
      statutoryClause: 'Approval Process Handbook (APH) 2026–27 §1.8(a)-(d)',
      subject: `Intimation of Online Scrutiny of Documents for Application ID: ${application.applicationNumber}`,
      body: `To,\nThe Principal / Director,\n${application.institutionName}\n${application.city}, ${application.state} (PID: ${application.institutionCode})\n\nSubject: Schedule of Online Scrutiny for Extension of Approval / New Institution (AY 2026–27)\n\nSir/Madam,\n\nWith reference to your application submitted under AICTE NSWS/Siebel Portal for Academic Session 2026–27, this is to inform that the Scrutiny Committee has been duly constituted by the Regional Office.\n\n1. Scheduled Date of Scrutiny: ${todayStr} (10:30 AM IST onwards)\n2. Committee Mode: Online Synchronous Virtual Scrutiny Room\n3. Assigned Route: ${application.routeType} (Pinned under APH 2026–27 Regulations)\n\nYou are advised to keep all original documents, audited balance sheets, registered land title deeds, and architect stability certificates ready for verification. In accordance with APH §1.8, the proceedings will be digitally audio-video recorded and sealed in WORM compliance storage.\n\nYours faithfully,\n\nRegional Officer\nAll India Council for Technical Education`,
      actionRequired: 'Ensure Authorized Signatory is available with Class-3 DSC token.',
    },
    PORTAL_DEFICIENCY_COMMUNICATION: {
      title: 'Portal Deficiency Communication Notice',
      shortLabel: '2. Deficiency Notice',
      icon: AlertTriangle,
      statutoryClause: 'APH 2026–27 §1.8(f)-(g) & Annexure 7',
      subject: `Statutory Deficiency Communication for Application ID: ${application.applicationNumber}`,
      body: `To,\nThe Authorized Signatory,\n${application.institutionName} (PID: ${application.institutionCode})\n\nSubject: Communication of Deficiencies observed during Scrutiny (Annexure 7)\n\nSir/Madam,\n\nDuring the Scrutiny proceedings conducted by the Scrutiny Committee for your institution, the following statutory deficiencies were recorded in ScrutinySnapshot v1:\n\n- Flagged Deficiency D1: Shortfall in Professor / Associate Professor cadre ratio as per APH Table 6.1.\n- Flagged Deficiency D2: Fire Safety NOC renewal receipt pending endorsement by Competent Authority.\n\nIn terms of APH §1.8(g), cleared checklist items (C3, C4) are sealed immutable and cannot be re-scrutinized. You are granted a restricted Deficiency Cure Window of fifteen (15) calendar days from receipt of this notice to upload rectified evidence solely for the flagged items.\n\nFailure to cure deficiencies within the stipulated SLA clock will trigger automated escalation to the Appellate Standing Hearing Committee (SHC).\n\nYours faithfully,\n\nChairman, Desk Scrutiny Committee\nAICTE Regional Office`,
      actionRequired: 'Submit rectifications in the restricted Cure Window within 15 days.',
    },
    EVC_INSPECTION_INTIMATION: {
      title: 'Expert Visit Committee (EVC) Inspection Notice',
      shortLabel: '3. EVC Inspection',
      icon: Send,
      statutoryClause: 'APH 2026–27 §1.9(a)-(f)',
      subject: `Notice of Physical Verification Visit by Expert Visit Committee (EVC)`,
      body: `To,\nThe Principal / Head of Institution,\n${application.institutionName}\n\nSubject: Conduct of Physical Inspection by Expert Visit Committee (EVC)\n\nSir/Madam,\n\nAn Expert Visit Committee (EVC) comprising empanelled senior professors and domain experts has been auto-selected and dispatched to conduct physical verification of your campus premises.\n\nMandatory Compliance Guidelines (APH §1.9(f)-(g)):\n1. Geo-Fencing: The entire physical inspection must be geo-tagged within a 50-meter perimeter of the approved coordinates (Lat: 17.0005° N, Long: 81.8040° E).\n2. Continuous Video: A mandatory 30-minute unedited continuous video recording of laboratories, computational centers, and library facilities must be uploaded to the portal within 24 hours of visit.\n3. Biometric / Form-16 Attendance: Faculty presence will be verified against Aadhaar-linked payroll.\n\nYours faithfully,\n\nDirector, Approval Bureau\nAICTE Headquarters, New Delhi`,
      actionRequired: 'Ensure unhindered campus access and continuous 30-min drone/video recording.',
    },
    CONDITIONAL_EOA_UNDERTAKING: {
      title: 'Conditional EoA Undertaking & Obligation Notice',
      shortLabel: '4. Conditional EoA',
      icon: Award,
      statutoryClause: 'APH 2026–27 §2.25(c)/(f) & Council Regulation 4.2',
      subject: `Grant of Conditional Extension of Approval (EoA) Subject to Time-Bound Compliance`,
      body: `To,\nThe Chairman / Secretary,\nGoverning Board, ${application.institutionName}\n\nSubject: Grant of Conditional EoA for Academic Session 2026–27 subject to Time-Bound Undertakings\n\nSir/Madam,\n\nIn exercise of powers conferred under AICTE Act 1987, the Competent Authority has sanctioned Conditional Extension of Approval (EoA) for your institution, subject to strict fulfilment of the following undertakings:\n\n1. Faculty Cadre Rectification (60-Day SLA): Appoint requisite senior faculty and file EPFO/Form 16 disbursement records.\n2. Fire Safety NOC & Municipal Stability Renewal (30-Day SLA): File renewed permanent Fire NOC from Municipal Fire Department.\n3. Land Lease Validity: Ensure uninterrupted 30-year registered lease deed compliance per APH §2.1(e).\n\nNon-fulfilment of these undertakings prior to the validity clocks will trigger automatic withdrawal of intake approval and stoppage of counselling participation.\n\nBy Order of the Council,\n\nMember Secretary, AICTE`,
      actionRequired: 'Comply with spawned obligations in Post-Approval Governance tab.',
    },
    SPEAKING_ORDER_OR_LOD: {
      title: 'Quasi-Judicial Speaking Order / Letter of Deficiency (LOD)',
      shortLabel: '5. Speaking Order / LOD',
      icon: Shield,
      statutoryClause: 'APH 2026–27 §1.11 & Council Standing Appellate Regulations',
      subject: `Formal Speaking Order under APH §1.11 for Application: ${application.applicationNumber}`,
      body: `ALL INDIA COUNCIL FOR TECHNICAL EDUCATION\n(A Statutory Body of the Government of India)\n\nSPEAKING ORDER\n\nIn the matter of Application No. ${application.applicationNumber} filed by ${application.institutionName} for ${application.applicationType} for AY 2026–27:\n\nWHEREAS, the application was evaluated through Desk Scrutiny and applicable EVC mechanisms pursuant to APH 2026–27;\nWHEREAS, the Competent Authority has meticulously examined the scrutiny findings, physical inspection telemetry, and institutional responses;\nNOW THEREFORE, the Competent Authority hereby records this formal Speaking Order:\n\n1. Finding: The statutory requirements under APH clauses 1.8, 1.9, and Table 1 have been duly assessed.\n2. Direction: The assigned statutory route (${application.routeType}) shall govern the institutional compliance lifecycle.\n3. Appellate Remedy: Any aggrieved party may prefer an appeal before the Standing Appellate Committee (SAC) within fifteen (15) days of this order.\n\nIssued under the seal of the Council on ${todayStr}.\n\nCompetent Authority\nApproval Bureau, AICTE`,
      actionRequired: 'Appellate recourse available before Standing Appellate Committee (SAC).',
    },
  };

  const currentNotice = NOTICES_CONFIG[activeTab];

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(currentNotice.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    const blob = new Blob([currentNotice.body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AICTE_${activeTab}_${application.applicationNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-70 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#0A2540] text-white p-5 flex items-start justify-between border-b border-slate-700">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                APH 2026–27 STATUTORY RECORD
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {application.applicationNumber}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Electronic Case Summary &amp; 5 Standardised Communications</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {application.institutionName} &bull; Code: {application.institutionCode} &bull; Region: {application.region}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close case summary modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Electronic Case Summary Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Certified Electronic Case Summary (Domain A.4 &amp; B.5)</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              WORM Signed: SHA256:7f9b8a2e...sealed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Assigned Route</span>
              <span className="font-bold text-slate-900 block mt-0.5">{application.routeType}</span>
              <span className="text-[10px] text-emerald-700 font-medium">Policy-Pinned (§Table 1)</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Current Milestone</span>
              <span className="font-bold text-slate-900 block mt-0.5">{application.currentStage}</span>
              <span className="text-[10px] text-blue-700 font-medium">{application.elapsedDaysAtStage}d at Stage (SLA: {application.stageDeadlineDays}d)</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Proposed Intake</span>
              <span className="font-bold text-slate-900 block mt-0.5">{application.proposedIntake} Seats</span>
              <span className="text-[10px] text-slate-500 font-medium">{application.program}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-semibold">Responsible Officer</span>
              <span className="font-bold text-slate-900 block mt-0.5">{application.assignedOfficer}</span>
              <span className="text-[10px] text-purple-700 font-medium">{application.region} Regional Office</span>
            </div>
          </div>
        </div>

        {/* Section 2: Scenario-Sensitive Communications Tabs */}
        <div className="border-b border-slate-200 bg-white px-4 flex items-center gap-1.5 overflow-x-auto py-1">
          {(Object.keys(NOTICES_CONFIG) as NoticeType[]).map((key) => {
            const config = NOTICES_CONFIG[key];
            const status = NOTICE_STATUS[key];
            const Icon = config.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 border ${
                  isActive
                    ? 'border-indigo-600 text-indigo-900 bg-indigo-50/80 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="font-bold">{config.shortLabel}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${status.badgeColor}`}>
                  {status.badgeText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section 3: Scenario Notice Viewer */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 space-y-4">
          {/* Scenario Context Banner */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${NOTICE_STATUS[activeTab].badgeColor}`}>
                {NOTICE_STATUS[activeTab].state === 'ACTIVE' ? '● CURRENT ACTIVE NOTICE' : NOTICE_STATUS[activeTab].state}
              </span>
              <span className="text-slate-700 font-medium">
                {NOTICE_STATUS[activeTab].reason}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              Rule Engine &bull; Domain A.4
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>{currentNotice.title}</span>
                  {NOTICE_STATUS[activeTab].state === 'ACTIVE' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                      ACTIVE FOR THIS CASE
                    </span>
                  )}
                </h3>
                <span className="text-[11px] text-indigo-700 font-mono font-medium">
                  {currentNotice.statutoryClause}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyNotice}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Notice'}</span>
                </button>
                <button
                  onClick={handleExportTxt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export (.txt)</span>
                </button>
              </div>
            </div>

            {/* Subject Banner */}
            <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-lg p-2.5 text-xs">
              <span className="font-bold text-indigo-950 block">Subject: {currentNotice.subject}</span>
              <span className="text-[11px] text-indigo-800 mt-0.5 block">
                Mandatory Action: {currentNotice.actionRequired}
              </span>
            </div>

            {/* If Waived or Not Applicable, show Statutory Exemption Certificate */}
            {NOTICE_STATUS[activeTab].state === 'WAIVED' ? (
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-purple-900">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>CERTIFIED STATUTORY EXEMPTION RECORD (APH 2026–27)</span>
                </div>
                <p className="leading-relaxed">
                  In accordance with Approval Process Handbook 2026–27 Errata p. 42 §2.6(c)(1), this stage is <strong>legally waived</strong> for {application.institutionName}. Valid Tier-1 NBA accreditation exempts the institution from physical campus inspection. No adverse intimation or physical visit notice is generated for this case.
                </p>
                <div className="p-2.5 rounded bg-white/80 border border-purple-200 font-mono text-[11px] text-purple-800">
                  Statutory Rule: APH_ERRATA_2026_P42_NBA_EXEMPT &bull; Verified by Desk Scrutiny Committee
                </div>
              </div>
            ) : NOTICE_STATUS[activeTab].state === 'NOT_APPLICABLE' ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Shield className="w-4 h-4 text-slate-600" />
                  <span>STATUTORY STANDING: NOT APPLICABLE FOR THIS CASE</span>
                </div>
                <p className="leading-relaxed text-slate-600">
                  {NOTICE_STATUS[activeTab].reason}. Under the pinned regulatory policy ({application.routeType}), this communication form is not applicable to the institutional compliance state of {application.institutionName}.
                </p>
                <div className="p-2.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-slate-500">
                  Lifecycle Phase: {application.currentStage} &bull; Route: {application.routeType}
                </div>
              </div>
            ) : null}

            {/* Formatted Letter Body */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
              {currentNotice.body}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>AICTE Standardised Statutory Communication Engine (SIH Problem Statement 26262 Domain A.4 &amp; F.1)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
