import React, { useEffect, useState } from 'react';
import { login, logout, restoreSession, getSessionRevision, getSession } from '../../services/session';
import { api } from '../../services/api';
import { Lock, Mail, Shield, UserCheck, KeyRound, AlertTriangle, CheckCircle, Ban, ArrowRight, Info } from 'lucide-react';

export interface RegulatoryRole {
  id: string;
  roleNumber: number;
  roleTitle: string;
  shortLabel: string;
  email: string;
  whatTheyDo: string;
  legallyBlocked: string;
  pdfCitation: string;
  color: string;
}

export const REGULATORY_ROLES: RegulatoryRole[] = [
  {
    id: 'role-1-inst',
    roleNumber: 1,
    roleTitle: 'Institution (Applicant)',
    shortLabel: 'Applicant',
    email: 'principal@coep.ac.in',
    whatTheyDo: 'Submits applications, views deficiency reasons, uploads corrected proofs for flagged items, uploads post-approval compliance/lease renewals.',
    legallyBlocked: 'Cannot edit unflagged items during re-scrutiny, cannot change pinned rule versions, cannot approve or verify their own uploads.',
    pdfCitation: 'APH §1.8, Annexure 7',
    color: 'border-blue-300 bg-blue-50/70 text-blue-900'
  },
  {
    id: 'role-2-scrutiny',
    roleNumber: 2,
    roleTitle: 'Scrutiny Reviewer (Committee)',
    shortLabel: 'Scrutiny',
    email: 'scrutiny.reviewer@aicte.gov.in',
    whatTheyDo: 'Reviews initial checklists, marks deficiencies ( D1 , D2 ) vs cleared ( C3 ), signs an immutable snapshot, reviews re-scrutiny corrections.',
    legallyBlocked: 'Blocked by APH §1.8(g): During ordinary re-scrutiny, cannot reopen or fail an item ( C3 ) that was already cleared in initial scrutiny.',
    pdfCitation: 'APH §1.8(g), p. 7',
    color: 'border-amber-300 bg-amber-50/70 text-amber-900'
  },
  {
    id: 'role-3-evc',
    roleNumber: 3,
    roleTitle: 'EVC Coordinator / Member',
    shortLabel: 'EVC Expert',
    email: 'evc.chair@aicte.gov.in',
    whatTheyDo: 'Views the queue of cases eligible for an Expert Visit Committee (EVC) inspection, records schedule dates, uploads signed inspection reports.',
    legallyBlocked: 'Cannot constitute the committee on their own (reserved for the Council per G02 pp. 2–3), cannot see scrutiny-only cases, cannot grant final approval.',
    pdfCitation: 'G02 pp. 2–3, AICTE Act §11(2)',
    color: 'border-purple-300 bg-purple-50/70 text-purple-900'
  },
  {
    id: 'role-4-ro',
    roleNumber: 4,
    roleTitle: 'Regional / Bureau Officer (RO / RB)',
    shortLabel: 'RO / RB Ops',
    email: 'ro.western@aicte.gov.in',
    whatTheyDo: 'Monitors regional pendency, stage ageing, officer workload, and overdue escalations; assigns tasks; verifies uploaded compliance/lease proofs.',
    legallyBlocked: 'Cannot grant statutory approval or impose legal penalties solely based on an administrative dashboard role.',
    pdfCitation: 'APH §1.8–§1.10, Domain B',
    color: 'border-emerald-300 bg-emerald-50/70 text-emerald-900'
  },
  {
    id: 'role-5-ca',
    roleNumber: 5,
    roleTitle: 'Competent Authority User',
    shortLabel: 'Council EC',
    email: 'bureau.approval@aicte.gov.in',
    whatTheyDo: 'Reviews signed scrutiny/EVC/SHC evidence packets and records the legally reserved official decision (Approve, Conditional Approve, Reject).',
    legallyBlocked: 'Never replaced by AI or automation; requires prior required stages to be signed before the decision gate unlocks.',
    pdfCitation: 'APH §2.24–§2.25, G02 §2.25(f)',
    color: 'border-rose-300 bg-rose-50/70 text-rose-900'
  },
  {
    id: 'role-6-admin',
    roleNumber: 6,
    roleTitle: 'System Policy Administrator',
    shortLabel: 'Policy Admin',
    email: 'admin@aicte.gov.in',
    whatTheyDo: 'Drafts, validates, and publishes new APH/Addendum/Errata rule versions into the Policy Registry.',
    legallyBlocked: 'Cannot silently overwrite an active policy or retroactively alter the pinned rule version of an already running case without an authorized migration.',
    pdfCitation: 'G01–G03, P02/P09',
    color: 'border-slate-400 bg-slate-100 text-slate-900'
  }
];

export function SessionGate({ children }: { children: React.ReactNode }) {
  const [generation, setGeneration] = useState(getSessionRevision);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('ro.western@aicte.gov.in');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [logoutFailed, setLogoutFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [simulatedClockDays, setSimulatedClockDays] = useState(0);
  const [clockFeedback, setClockFeedback] = useState<string | null>(null);
  const [showRoleMatrixModal, setShowRoleMatrixModal] = useState(false);

  useEffect(() => {
    let active = true;
    restoreSession()
      .then(() => {
        if (active) setReady(!!getSession());
      })
      .catch(() => {
        /* display sign-in */
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    const expired = () => setReady(false);
    const changed = () => setGeneration(getSessionRevision());
    window.addEventListener('sih:sessionchanged', changed);
    window.addEventListener('sih:unauthenticated', expired);
    return () => {
      active = false;
      window.removeEventListener('sih:unauthenticated', expired);
      window.removeEventListener('sih:sessionchanged', changed);
    };
  }, []);

  const signOut = async () => {
    setBusy(true);
    try {
      await logout();
      setLogoutFailed(false);
      setError('');
      setReady(false);
    } catch {
      setLogoutFailed(true);
      setError('Local data cleared; server sign-out failed. Retry sign-out.');
    } finally {
      setBusy(false);
    }
  };

  const handleAdvanceClock = async (days: number) => {
    setBusy(true);
    try {
      const res: any = await api.advanceClock(days);
      const newDays = simulatedClockDays + days;
      setSimulatedClockDays(newDays);
      setClockFeedback(`Clock advanced +${days}d (Total +${newDays}d). Fired: ${res.data?.alertsFired || 0}, Suppressed: ${res.data?.alertsSuppressed || 0}`);
      window.dispatchEvent(new Event('sih:clockadvanced'));
    } catch (err: any) {
      setClockFeedback(`Clock advance failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleResetDemo = async () => {
    setBusy(true);
    try {
      await api.resetDemo();
      setSimulatedClockDays(0);
      setClockFeedback('Demo state reset to canonical seed (5 College Cases, 3 Trackers, 24-Oct-2026)');
      window.dispatchEvent(new Event('sih:demoreset'));
    } catch (err: any) {
      setClockFeedback(`Reset failed: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleSelectRole = (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword('password123');
    setError('');
  };

  if (checking) return <p role="status" className="p-8 text-center text-slate-600 font-medium">Checking demonstration session…</p>;

  const currentActor = getSession()?.actor;
  const currentRole = REGULATORY_ROLES.find(r => r.email === (currentActor as any)?.email) ||
    REGULATORY_ROLES.find(r => currentActor?.institutionIds?.includes('INST-VJTI') ? r.roleNumber === 1
      : (currentActor?.roles as string[])?.includes('reviewer') ? r.roleNumber === 2
      : (currentActor?.roles as string[])?.includes('evc') ? r.roleNumber === 3
      : (currentActor?.roles as string[])?.includes('regional_officer') ? r.roleNumber === 4
      : (currentActor?.roles as string[])?.includes('demo_authority') || (currentActor?.roles as string[])?.includes('bureau_officer') ? r.roleNumber === 5
      : (currentActor?.roles as string[])?.includes('policy_admin') ? r.roleNumber === 6
      : r.roleNumber === 4);

  const baseDate = new Date('2026-10-24T00:00:00.000Z');
  baseDate.setDate(baseDate.getDate() + simulatedClockDays);
  const displayClockDate = baseDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        {/* National PravahReg Companion Layer Control Banner */}
        <header className="bg-[#0A2540] text-white border-b border-slate-700/80 shadow-md">
          <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-400/40 flex items-center justify-center font-bold text-orange-400 text-sm">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-sm tracking-tight text-white">
                    AICTE Regulation Bureau &bull; PravahReg Companion Layer
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    AY 2026–27
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    WORM HMAC-SHA256
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Companion Layer for Upstream NSWS &amp; Siebel Portals &bull; PS 26262 Solution
                </p>
              </div>
            </div>

            {/* Simulated Clock Controller */}
            <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <span className="text-slate-400 font-medium">📅 Clock:</span>
              <span className="font-mono font-bold text-amber-300">
                {displayClockDate} {simulatedClockDays > 0 ? `(+${simulatedClockDays}d)` : ''}
              </span>
              <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleAdvanceClock(7)}
                  className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold transition-colors disabled:opacity-50"
                  title="Advance simulated clock by 7 days"
                >
                  +7d
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleAdvanceClock(15)}
                  className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold transition-colors disabled:opacity-50"
                  title="Advance simulated clock by 15 days (Triggers Land Lease alert)"
                >
                  +15d
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleAdvanceClock(30)}
                  className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-semibold transition-colors disabled:opacity-50"
                  title="Advance simulated clock by 30 days (Triggers Fire NOC alert)"
                >
                  +30d
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleResetDemo}
                  className="px-2 py-0.5 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 text-[11px] font-semibold border border-amber-500/40 transition-colors disabled:opacity-50"
                  title="Reset demo clock and seed state"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Authenticated User Profile & Sign Out */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-white block">
                  {currentRole?.roleTitle || 'AICTE Regulatory Officer'}
                </span>
                <span className="text-[10px] text-slate-300 block">
                  Role #{currentRole?.roleNumber || 4} &bull; {currentRole?.shortLabel}
                </span>
              </div>
              <button
                disabled={busy}
                onClick={signOut}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-200 hover:text-white text-xs font-semibold border border-rose-500/30 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                title="Sign out of current authenticated session"
              >
                <span>Sign out</span>
              </button>
            </div>
          </div>

          {/* Alert feedback toast if present */}
          {clockFeedback && (
            <div className="bg-amber-950/90 border-t border-amber-800 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between">
              <span>{clockFeedback}</span>
              <button
                type="button"
                onClick={() => setClockFeedback(null)}
                className="text-amber-400 hover:text-amber-200 ml-4 font-bold"
              >
                &times;
              </button>
            </div>
          )}
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-x-hidden" key={generation}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800">
      <div className="w-full max-w-5xl space-y-6">
        {/* Banner Header */}
        <div className="text-center space-y-2 text-white">
          <div className="inline-flex p-3 rounded-2xl bg-orange-500/20 border border-orange-400/40 text-3xl mb-1 shadow-lg">
            🏛️
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AICTE Regulation Bureau &bull; PravahReg
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto">
            Smart India Hackathon 2026 (Problem Statement 26262) &bull; Academic Year 2026–27
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
              APH 2024–27 &amp; 2026-27 Errata
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Zero-Trust Scope Isolation
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-purple-500/20 text-purple-300 border border-purple-400/30">
              WORM HMAC-SHA256 Audit
            </span>
          </div>
        </div>

        {/* Formal Authentication Card with Master 6-Role Reference Matrix */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Top Row: Official Login Form */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                    <Lock className="w-4 h-4 text-blue-700" />
                    <span>Portal Sign-In</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select any of the 6 official roles below to pre-fill credentials, or enter your registered email and password.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
                  Password: password123
                </span>
              </div>

              <form
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  setError('');
                  try {
                    await login({ email, password });
                    setReady(true);
                  } catch (err: any) {
                    setError(err instanceof Error ? err.message : 'Sign-in failed');
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Selected Role Email Address <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      type="email"
                      autoComplete="username"
                      required
                      placeholder="e.g. ro.western@aicte.gov.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-lg bg-[#0A2540] hover:bg-[#133863] text-white py-2 px-3 text-xs font-bold tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5 h-[34px]"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>{busy ? 'Authenticating…' : 'Sign In as Role'}</span>
                  </button>
                </div>
              </form>

              {error && (
                <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Bottom: The Exact 6 Regulatory Roles Table */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-700" />
                    <span>The 6 Regulatory Roles &amp; Statutory Legal Boundaries (Master Report §8.2)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Click <strong>"Select Role"</strong> on any row to immediately load its credentials into the authentication box above.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  6 Built-In Personas
                </span>
              </div>

              {/* Responsive Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 w-1/4">Role</th>
                      <th className="py-2.5 px-3 w-5/12">What They Do in the Flow</th>
                      <th className="py-2.5 px-3 w-5/12">What They Are Legally Blocked From Doing</th>
                      <th className="py-2.5 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {REGULATORY_ROLES.map((r) => {
                      const isSelected = email === r.email;
                      return (
                        <tr
                          key={r.id}
                          className={`hover:bg-blue-50/40 transition-colors ${
                            isSelected ? 'bg-blue-50/70 font-medium' : ''
                          }`}
                        >
                          {/* Col 1: Role */}
                          <td className="py-2.5 px-3 align-top">
                            <div className="font-bold text-slate-900">
                              {r.roleNumber}. {r.roleTitle}
                            </div>
                            <div className="font-mono text-[10px] text-blue-700 mt-0.5">{r.email}</div>
                            <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {r.pdfCitation}
                            </span>
                          </td>

                          {/* Col 2: What They Do */}
                          <td className="py-2.5 px-3 align-top text-slate-700 text-[11px] leading-relaxed">
                            {r.whatTheyDo}
                          </td>

                          {/* Col 3: Legally Blocked */}
                          <td className="py-2.5 px-3 align-top text-rose-900 text-[11px] leading-relaxed">
                            <span className="font-semibold text-rose-700 block mb-0.5 flex items-center gap-1">
                              <Ban className="w-3 h-3 text-rose-600 inline shrink-0" />
                              <span>Statutory Guard:</span>
                            </span>
                            {r.legallyBlocked}
                          </td>

                          {/* Col 4: Select Button */}
                          <td className="py-2.5 px-2 align-middle text-right">
                            <button
                              type="button"
                              onClick={() => handleSelectRole(r.email)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                                isSelected
                                  ? 'bg-blue-700 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                              }`}
                            >
                              {isSelected ? 'Loaded' : 'Select'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Zero-Trust Architecture: HttpOnly &bull; SameSite=Strict Cookies</span>
              <span>WORM HMAC-SHA256 Audit Trail Active</span>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
