import React, { useEffect, useState } from 'react';
import { quickAccessLogin, restoreSession, getSession } from '../../services/session';
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
  GraduationCap
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
    whatTheyDo: 'Submits new applications, tracks real-time status across stages, uploads deficiency corrections, and submits post-approval lease/NOC compliance.',
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

  // When authenticated, render children directly without any duplicate headers or footers
  if (ready) {
    return <>{children}</>;
  }

  // Unauthenticated Landing Page: Clean, focused, without global header or footer
  const nonApplicantRoles = REGULATORY_ROLES.filter((r) => r.roleNumber > 1);

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

        {/* Section 1: Role 1 — Institution / Applicant Category with 5 Seeded Institution Cards */}
        <div className="w-full mb-10">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border-2 border-blue-500/80 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-800 border-blue-200">
                      Role #1 &bull; Applicant Node
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    Institution Signatory Portal (Applicant Workspace)
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                    Submits new applications, tracks real-time workflow status across regulatory stages, uploads deficiency corrections, and submits post-approval statutory undertakings.
                  </p>
                </div>
              </div>
            </div>

            {/* 5 Seeded Institution Access Cards */}
            <div className="mt-6">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Select Seeded Technical Institution to Access:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
                {SEEDED_INSTITUTIONS.map((inst) => {
                  const isBusy = busyPersona === inst.id || busyPersona === inst.email;
                  return (
                    <div
                      key={inst.id}
                      className="bg-slate-50 hover:bg-blue-50/50 rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-1.5 mb-3">
                        <div className="font-bold text-xs text-slate-900 group-hover:text-blue-900 leading-snug line-clamp-2">
                          {inst.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Code: {inst.code}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {inst.region}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAccessNode(inst.id)}
                        disabled={Boolean(busyPersona)}
                        className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-white group-hover:bg-blue-600 text-blue-700 group-hover:text-white border border-blue-200 group-hover:border-blue-600 transition-all flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
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
                            <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Roles 2 through 6 — Committee, Regional, Bureau & Oversight Nodes */}
        <div className="w-full">
          <div className="mb-4">
            <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wider">
              Statutory Committees, Regional Desks &amp; Competent Authorities
            </h3>
            <p className="text-xs text-slate-500">
              Direct access nodes for regulatory scrutiny, physical inspection, regional compliance, council approvals, and policy management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {nonApplicantRoles.map((r) => {
              const Icon = r.icon;
              const isBusy = busyPersona === r.id || busyPersona === r.email;
              return (
                <div
                  key={r.id}
                  className={`bg-white rounded-2xl p-5 shadow-xs hover:shadow-md transition-all border-2 ${r.borderColor} flex flex-col justify-between group relative overflow-hidden`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${r.themeColor}`} />

                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5 text-slate-800" />
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${r.badgeBg}`}>
                        Role #{r.roleNumber}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                        {r.roleTitle}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                        {r.shortLabel}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed min-h-[56px]">
                      {r.whatTheyDo}
                    </p>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[10px] text-slate-500 leading-snug">
                      <span className="font-bold text-slate-700">Statutory Bound: </span>
                      <span>{r.legallyBlocked}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <button
                      onClick={() => handleAccessNode(r.id)}
                      disabled={Boolean(busyPersona)}
                      className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SessionGate;
