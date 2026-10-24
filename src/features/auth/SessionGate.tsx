import React, { useEffect, useState } from 'react';
import { login, logout, restoreSession, getSessionRevision, getSession } from '../../services/session';
import { api } from '../../services/api';
import { Lock, Mail, Shield, CheckCircle2, UserCheck, KeyRound, AlertTriangle } from 'lucide-react';

export const DEMO_PERSONAS = [
  {
    email: 'principal@coep.ac.in',
    name: 'Dr. D. N. Sonawane',
    institution: 'COEP Technological University',
    roleLabel: 'Institution Signatory',
    tag: 'College A–D Owner',
    description: 'Manages applications for COEP, GIITS, PDIMTR, and EVIT within assigned jurisdiction.'
  },
  {
    email: 'principal@vjti.ac.in',
    name: 'Dr. Sachin Kore',
    institution: 'VJTI Autonomous Institute',
    roleLabel: 'Institution Signatory',
    tag: 'College E (Cross-Tenant)',
    description: 'Tenant-isolated institution account strictly restricted to VJTI cases.'
  },
  {
    email: 'ro.western@aicte.gov.in',
    name: 'Dr. R. K. Soni',
    institution: 'AICTE Western / South-Central Regional Office',
    roleLabel: 'Regional Officer / Reviewer',
    tag: 'Scrutiny & Re-Scrutiny Signatory',
    description: 'Authorized for desk scrutiny evaluations, deficiency returns, and evidence verification.'
  },
  {
    email: 'evc.chair@aicte.gov.in',
    name: 'Prof. S. Velmurugan / Dr. B. B. Ahuja',
    institution: 'Expert Visit Committee Panel',
    roleLabel: 'EVC Committee Chairman',
    tag: 'On-Site Inspection Proforma',
    description: 'Conducts physical/virtual inspections, GPS verification, and submits EVC reports.'
  },
  {
    email: 'bureau.approval@aicte.gov.in',
    name: 'Dr. Mamta R. Agarwal',
    institution: 'Approval Bureau & Council Executive Committee',
    roleLabel: 'Advisor-I (Competent Authority)',
    tag: 'Decision Gate (decision.record)',
    description: 'Statutory decision authority for issuing Letters of Approval (LoA/EoA) and Speaking Orders.'
  },
  {
    email: 'admin@aicte.gov.in',
    name: 'Policy Administrator',
    institution: 'AICTE Headquarters (New Delhi)',
    roleLabel: 'Central System Admin',
    tag: 'Central Policy Admin',
    description: 'Platform administrator with access to handbook policy rules and immutable WORM audit logs.'
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

  const handleFillCredentials = (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword('password123');
    setError('');
  };

  if (checking) return <p role="status" className="p-8 text-center text-slate-600 font-medium">Checking demonstration session…</p>;

  const currentActor = getSession()?.actor;
  const currentPersona = DEMO_PERSONAS.find(p => p.email === (currentActor as any)?.email) ||
    DEMO_PERSONAS.find(p => currentActor?.institutionIds?.includes('INST-VJTI') ? p.email === 'principal@vjti.ac.in'
      : (currentActor?.roles as string[])?.includes('regional_officer') || (currentActor?.roles as string[])?.includes('reviewer') ? p.email === 'ro.western@aicte.gov.in'
      : (currentActor?.roles as string[])?.includes('evc') ? p.email === 'evc.chair@aicte.gov.in'
      : (currentActor?.roles as string[])?.includes('demo_authority') || (currentActor?.roles as string[])?.includes('bureau_officer') ? p.email === 'bureau.approval@aicte.gov.in'
      : (currentActor?.roles as string[])?.includes('policy_admin') ? p.email === 'admin@aicte.gov.in'
      : p.email === 'principal@coep.ac.in');

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
                  {currentPersona?.name || currentActor?.id}
                </span>
                <span className="text-[10px] text-slate-300 block">
                  {currentPersona?.roleLabel || currentActor?.roles.join(', ')}
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
      <div className="w-full max-w-4xl space-y-6">
        {/* Banner Header */}
        <div className="text-center space-y-2 text-white">
          <div className="inline-flex p-3 rounded-2xl bg-orange-500/20 border border-orange-400/40 text-3xl mb-1 shadow-lg">
            🏛️
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AICTE Regulation Bureau &bull; PravahReg
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
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

        {/* Formal Authentication Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left: Sign In Form */}
            <div className="md:col-span-6 space-y-5">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Portal Authentication</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your official AICTE or institutional credentials to access the regulatory companion layer.
                </p>
              </div>

              <form
                className="space-y-4"
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
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Official Email Address <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                      type="email"
                      autoComplete="username"
                      required
                      placeholder="e.g. ro.western@aicte.gov.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="Enter password (default: password123)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-lg bg-[#0A2540] hover:bg-[#133863] text-white py-2.5 px-4 text-xs font-bold tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>{busy ? 'Authenticating with Council Server…' : 'Sign In to PravahReg Portal'}</span>
                </button>
              </form>
            </div>

            {/* Right: Authorized Accounts Reference */}
            <div className="md:col-span-6 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-700" />
                    Authorized Test Personas
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                    AY 2026–27
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Click <strong>"Use Account"</strong> to pre-fill credentials for that role. All test accounts share default password <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">password123</code>.
                </p>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {DEMO_PERSONAS.map((p) => {
                    const isSelected = email === p.email;
                    return (
                      <div
                        key={p.email}
                        className={`p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-400 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 truncate">{p.name}</span>
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold truncate">
                              {p.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{p.roleLabel}</p>
                          <p className="text-[10px] font-mono text-blue-700 truncate">{p.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleFillCredentials(p.email)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Use Account'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Security: HttpOnly &bull; SameSite=Strict</span>
                <span>WORM Audit Logging: Active</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
