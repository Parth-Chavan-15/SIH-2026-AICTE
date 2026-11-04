import React, { useEffect, useState } from 'react';
import { quickAccessLogin, restoreSession, getSession } from '../../services/session';
import { NSWSSimulationView } from '../nsws/NSWSSimulationView';
import {
  Lock,
  Shield,
  Building2,
  FileCheck,
  Award,
  Sliders,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  GraduationCap,
  X,
  ExternalLink
} from 'lucide-react';

export interface RegulatoryRole {
  id: string;
  roleNumber: number;
  roleTitle: string;
  shortLabel: string;
  email: string;
  whatTheyDo: string;
  legallyBlocked: string;
  pdfCitation: string;
  themeColor: string;
  borderColor: string;
  badgeBg: string;
  icon: any;
}

export const SEEDED_INSTITUTIONS = [
  {
    id: 'inst-coep',
    name: 'COEP Technological University, Pune',
    code: '1-435789102',
    region: 'Western Region',
    email: 'principal@coep.ac.in',
  },
  {
    id: 'inst-giits',
    name: 'Gonna Institute of Information Technology & Sciences (GIITS)',
    code: '1-462589176',
    region: 'South-Central Region',
    email: 'principal@giits.ac.in',
  },
  {
    id: 'inst-pdimtr',
    name: 'Prerna / Univ BDT College of Engineering (PDIMTR)',
    code: '1-109704178',
    region: 'Western Region',
    email: 'principal@pdimtr.ac.in',
  },
  {
    id: 'inst-apex',
    name: 'Apex Institute of Technology & Management',
    code: '1-331049280',
    region: 'Northern Region',
    email: 'principal@apex.ac.in',
  },
  {
    id: 'inst-batu',
    name: 'Dr. Babasaheb Ambedkar Tech Univ (BATU Lonere)',
    code: '1-192014810',
    region: 'Western Region',
    email: 'principal@batu.ac.in',
  },
];

export const REGULATORY_ROLES: RegulatoryRole[] = [
  {
    id: 'role-1-inst',
    roleNumber: 1,
    roleTitle: 'Institution Signatory Portal',
    shortLabel: 'Applicant Workspace',
    email: 'principal@coep.ac.in',
    whatTheyDo: 'Submits new applications, tracks real-time workflow status across regulatory stages, uploads deficiency corrections, and submits post-approval statutory undertakings.',
    legallyBlocked: 'Cannot edit unflagged documents during re-scrutiny; cannot approve own submissions.',
    pdfCitation: 'Applicant Node',
    themeColor: 'from-blue-600 to-indigo-700',
    borderColor: 'border-blue-500 hover:border-blue-600',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: Building2
  },
  {
    id: 'role-2-scrutiny',
    roleNumber: 2,
    roleTitle: 'Desk Scrutiny Committee Cell',
    shortLabel: 'Document Verification',
    email: 'scrutiny.reviewer@aicte.gov.in',
    whatTheyDo: 'Examines uploaded checklists, marks verified vs. deficient items, digitally signs immutable scrutiny snapshots, and reviews institution resubmissions.',
    legallyBlocked: 'Cannot re-open or reject items that were already verified and cleared in initial scrutiny (Scope Lock USP B06).',
    pdfCitation: 'Scrutiny Committee',
    themeColor: 'from-amber-600 to-orange-700',
    borderColor: 'border-amber-500 hover:border-amber-600',
    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
    icon: FileCheck
  },
  {
    id: 'role-3-evc',
    roleNumber: 3,
    roleTitle: 'EVC Inspection Committee Portal',
    shortLabel: 'Campus Physical Verification',
    email: 'evc.chair@aicte.gov.in',
    whatTheyDo: 'Conducts physical and virtual campus inspections, verifies geo-tagged GPS coordinates and 30-min walkthrough video evidence, and submits committee scores.',
    legallyBlocked: 'Cannot self-schedule inspections without Council mandate; cannot grant final statutory approval.',
    pdfCitation: 'Inspection Panel',
    themeColor: 'from-purple-600 to-indigo-800',
    borderColor: 'border-purple-500 hover:border-purple-600',
    badgeBg: 'bg-purple-50 text-purple-900 border-purple-200',
    icon: Award
  },
  {
    id: 'role-4-ro',
    roleNumber: 4,
    roleTitle: 'Regional Office Operations Desk',
    shortLabel: 'Pendency & Compliance Desk',
    email: 'ro.western@aicte.gov.in',
    whatTheyDo: 'Monitors regional pendency, tracks approaching deadlines, oversees 15-day concurrence, and verifies post-approval undertakings and lease documents.',
    legallyBlocked: 'Cannot issue final approval letters or override statutory Council decisions.',
    pdfCitation: 'Regional Desk (RO / RB)',
    themeColor: 'from-emerald-600 to-teal-800',
    borderColor: 'border-emerald-500 hover:border-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    icon: Shield
  },
  {
    id: 'role-5-ca',
    roleNumber: 5,
    roleTitle: 'Competent Authority Chamber',
    shortLabel: 'Council EC Approval Gate',
    email: 'bureau.approval@aicte.gov.in',
    whatTheyDo: 'Reviews complete scrutiny and inspection dossiers to issue final decisions (Extension of Approval, Conditional Approval, or Rejection) using digital signatures.',
    legallyBlocked: 'Reserved statutory authority; ordinary administrators and AI cannot grant approval.',
    pdfCitation: 'Approval Authority',
    themeColor: 'from-rose-600 to-red-800',
    borderColor: 'border-rose-500 hover:border-rose-600',
    badgeBg: 'bg-rose-50 text-rose-900 border-rose-200',
    icon: Award
  },
  {
    id: 'role-6-admin',
    roleNumber: 6,
    roleTitle: 'Central Policy Administration',
    shortLabel: 'Policy Registry & Audit Ledger',
    email: 'admin@aicte.gov.in',
    whatTheyDo: 'Configures approval rules, manages intake capacity thresholds (e.g. 360-seat review hold), and inspects the tamper-evident audit ledger.',
    legallyBlocked: 'Cannot retroactively modify rules or alter the pinned handbook version of an in-flight case.',
    pdfCitation: 'System & Policy Admin',
    themeColor: 'from-slate-700 to-slate-900',
    borderColor: 'border-slate-500 hover:border-slate-600',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: Sliders
  }
];

export function SessionGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [busyPersona, setBusyPersona] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'landing' | 'nsws-intake'>('landing');
  const [showInstModal, setShowInstModal] = useState(false);

  useEffect(() => {
    let unmounted = false;
    const verify = async () => {
      try {
        const session = await restoreSession();
        if (!unmounted) setReady(Boolean(session));
      } catch {
        if (!unmounted) setReady(false);
      } finally {
        if (!unmounted) setChecking(false);
      }
    };

    verify();

    const handleSessionChange = () => {
      const active = getSession();
      setReady(Boolean(active));
    };

    window.addEventListener('sih:sessionchanged', handleSessionChange);
    return () => {
      unmounted = true;
      window.removeEventListener('sih:sessionchanged', handleSessionChange);
    };
  }, []);

  const handleAccessNode = async (personaIdentifier: string) => {
    setError('');
    setBusyPersona(personaIdentifier);
    try {
      await quickAccessLogin(personaIdentifier);
      const verified = await restoreSession();
      if (!verified) {
        throw new Error('Authentication could not be verified by server gateway');
      }
      setReady(true);
    } catch (err: any) {
      setError(err?.message || 'Authentication rejected by security gateway');
      setReady(false);
    } finally {
      setBusyPersona(null);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          <span>Verifying secure session token…</span>
        </div>
      </div>
    );
  }

  // When authenticated, render children directly without unauthenticated gateway
  if (ready) {
    return <>{children}</>;
  }

  // Modal for Selecting a Seeded Technical Institution
  const renderInstitutionModal = () => (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              Sign In to Existing Technical Institution
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowInstModal(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-600">
          Select one of the 5 seeded technical institutions to immediately access its Applicant Workspace:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pt-1">
          {SEEDED_INSTITUTIONS.map((inst) => {
            const isBusy = busyPersona === inst.id || busyPersona === inst.email;
            return (
              <button
                key={inst.id}
                type="button"
                disabled={Boolean(busyPersona)}
                onClick={async () => {
                  setShowInstModal(false);
                  await handleAccessNode(inst.id);
                }}
                className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group cursor-pointer flex flex-col justify-between disabled:opacity-50"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-blue-900 line-clamp-2">
                    {inst.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-1">
                    Code: {inst.code}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    {inst.region}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-blue-700">
                  <span>{isBusy ? 'Authenticating…' : 'Access Workspace'}</span>
                  {isBusy ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // If in NSWS Single-Window Intake Mode
  if (viewMode === 'nsws-intake') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          <NSWSSimulationView
            isUnauthenticatedFlow={true}
            onBackToGateway={() => setViewMode('landing')}
            onOpenInstitutionModal={() => setShowInstModal(true)}
            onContinueToInstitutionPortal={async (presetId, email) => {
              await handleAccessNode(presetId || email);
            }}
          />
        </main>
        {showInstModal && renderInstitutionModal()}
      </div>
    );
  }

  // Symmetrical 6-Role Statutory Landing Page
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto w-full">
        {/* Official Brand Hero */}
        <div className="text-center space-y-3 mb-8 sm:mb-10 max-w-3xl">
          <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-white shadow-md border border-slate-200">
            <img
              src="/niyamsetu-logo.png"
              alt="NiyamSetu Logo"
              className="h-14 sm:h-16 w-auto object-contain rounded-xl"
            />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
              NIYAMSETU <span className="font-normal text-teal-700">(नियमसेतु)</span>
            </h1>
            <p className="text-base sm:text-lg font-bold text-slate-700 tracking-tight mt-1">
              AICTE Approval &amp; Compliance Management Platform
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 font-extrabold text-[11px] sm:text-xs tracking-widest uppercase">
            <span>Bridging Rules</span>
            <span>&bull;</span>
            <span>Empowering Institutions</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Autonomous statutory workflow automation, dynamic regulatory routing, and tamper-evident compliance companion runtime for Academic Year 2026–27.
          </p>
        </div>

        {/* Actionable Error Banner */}
        {error && (
          <div className="w-full max-w-3xl p-3.5 mb-8 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm flex items-center gap-2.5 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Section Header */}
        <div className="w-full mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Official Statutory Access Nodes
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your statutory role node to enter the respective workspace or initiate single-window applicant intake.
              </p>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Academic Year <span className="font-bold text-slate-800">2026–27</span> &bull; 6 Statutory Nodes
            </div>
          </div>
        </div>

        {/* Pristine Symmetrical 6-Role Grid (3 columns on lg, 2 on md, 1 on sm) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REGULATORY_ROLES.map((r) => {
            const Icon = r.icon;
            const isApplicantRole = r.roleNumber === 1;
            const isBusy = busyPersona === r.id || busyPersona === r.email;

            return (
              <div
                key={r.id}
                className={`bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all border-2 ${r.borderColor} flex flex-col justify-between group relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${r.themeColor}`} />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 text-slate-800" />
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${r.badgeBg}`}>
                      Role #{r.roleNumber} &bull; {r.pdfCitation}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {r.roleTitle}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                      {r.shortLabel}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[50px]">
                    {r.whatTheyDo}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-snug">
                    <span className="font-bold text-slate-700">Statutory Bound: </span>
                    <span>{r.legallyBlocked}</span>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 mt-5 space-y-2">
                  {isApplicantRole ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setViewMode('nsws-intake')}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Begin Application Intake (NSWS)</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setShowInstModal(true)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <GraduationCap className="w-3 h-3" />
                          <span>Existing Institution? Sign In</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAccessNode(r.id)}
                      disabled={Boolean(busyPersona)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                        r.roleNumber === 2
                          ? 'bg-amber-50 text-amber-900 hover:bg-amber-600 hover:text-white border border-amber-200'
                          : r.roleNumber === 3
                          ? 'bg-purple-50 text-purple-900 hover:bg-purple-600 hover:text-white border border-purple-200'
                          : r.roleNumber === 4
                          ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                          : r.roleNumber === 5
                          ? 'bg-rose-50 text-rose-900 hover:bg-rose-600 hover:text-white border border-rose-200'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-800 hover:text-white border border-slate-300'
                      } disabled:opacity-50`}
                    >
                      {isBusy ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Authenticating…</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Access Node</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Institution Quick Sign-In Modal */}
      {showInstModal && renderInstitutionModal()}
    </div>
  );
}

export default SessionGate;
