import React, { useEffect, useState } from 'react';
import { login, logout, restoreSession, getSessionRevision, getSession } from '../../services/session';
import { api } from '../../services/api';
import {
  Lock,
  Mail,
  Shield,
  KeyRound,
  AlertTriangle,
  CheckCircle,
  Building2,
  FileCheck,
  Award,
  Users,
  Sliders,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  RefreshCw
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
    legallyBlocked: 'Cannot re-open or reject items that were already verified and cleared in initial scrutiny.',
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
  const [email, setEmail] = useState('principal@coep.ac.in');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showManualLogin, setShowManualLogin] = useState(false);

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

  const handleAccessNode = async (targetEmail: string) => {
    setError('');
    setBusy(true);
    try {
      await login({ email: targetEmail, password: 'password123' });
    } catch (err: any) {
      setError(err?.message || 'Authentication rejected by security gateway');
    } finally {
      setBusy(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials');
    } finally {
      setBusy(false);
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

  // When authenticated, render children without injecting any duplicate headers
  if (ready) {
    return <>{children}</>;
  }

  // Production-Grade Enterprise Access Gateway (Inspired by SpotFix Enterprise Gateway)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top National Brand Bar */}
      <header className="bg-[#071A2E] text-white border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center p-0.5 shadow-sm">
            <img
              src="/assets/logo_image/image_e867798b.png"
              alt="AICTE Emblem"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex items-center gap-2 font-mono text-xs tracking-wider">
            <span className="font-extrabold text-white">AICTE PravahReg</span>
            <span className="text-slate-500">|</span>
            <span className="text-blue-300">ACCESS GATEWAY</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
            AY 2026–27
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            WORM HMAC-SHA256
          </span>
        </div>
      </header>

      {/* Main Enterprise Gateway Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-6xl mx-auto w-full">
        {/* Gateway Title */}
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-200 mb-2 p-1">
            <img
              src="/assets/logo_image/image_e867798b.png"
              alt="AICTE Official Emblem"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            AICTE PravahReg Enterprise Gateway
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-widest">
            OFFICIAL AUTHORIZED PERSONNEL ACCESS GATEWAY &bull; PS 26262 SOLUTION
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="w-full max-w-md p-3.5 mb-6 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2 shadow-sm anim-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 6 Enterprise Access Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {REGULATORY_ROLES.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.id}
                className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border-2 ${r.borderColor} flex flex-col justify-between group relative overflow-hidden`}
              >
                {/* Top colored accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${r.themeColor}`} />

                <div className="space-y-4">
                  {/* Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 text-slate-800" />
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${r.badgeBg}`}>
                      {r.pdfCitation}
                    </span>
                  </div>

                  {/* Node Title & Subtitle */}
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                      {r.roleTitle}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                      {r.shortLabel}
                    </p>
                    <div className="text-[11px] font-mono text-blue-700 mt-1">
                      {r.email}
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-600 leading-relaxed min-h-[48px]">
                    {r.whatTheyDo}
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-6 border-t border-slate-100 mt-4">
                  <button
                    onClick={() => handleAccessNode(r.email)}
                    disabled={busy}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs ${
                      r.roleNumber === 1
                        ? 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200'
                        : r.roleNumber === 2
                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white border border-amber-200'
                        : r.roleNumber === 3
                        ? 'bg-purple-50 text-purple-800 hover:bg-purple-600 hover:text-white border border-purple-200'
                        : r.roleNumber === 4
                        ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                        : r.roleNumber === 5
                        ? 'bg-rose-50 text-rose-800 hover:bg-rose-600 hover:text-white border border-rose-200'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-800 hover:text-white border border-slate-300'
                    } disabled:opacity-50`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Access Node</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Credentials Toggle Drawer */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setShowManualLogin(!showManualLogin)}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Manual Credentials Sign-In</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showManualLogin ? 'rotate-180' : ''}`} />
          </button>

          {showManualLogin && (
            <div className="mt-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto text-left anim-scale-in">
              <form onSubmit={handleManualLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {busy ? 'Authenticating…' : 'Authenticate Session'}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Gateway Footer */}
      <footer className="p-4 bg-white border-t border-slate-200 text-center text-[11px] text-slate-500">
        AICTE PravahReg National Gateway &bull; Smart India Hackathon 2026 &bull; HttpOnly &bull; SameSite=Strict &bull; WORM HMAC-SHA256
      </footer>
    </div>
  );
}
