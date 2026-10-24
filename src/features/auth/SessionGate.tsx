import React, { useEffect, useState } from 'react';
import { login, logout, restoreSession, getSessionRevision, getSession } from '../../services/session';
import { api } from '../../services/api';

export const DEMO_PERSONAS = [
  {
    email: 'principal@coep.ac.in',
    name: 'Dr. D. N. Sonawane',
    institution: 'COEP Technological University',
    roleLabel: 'Institution Signatory',
    color: 'border-blue-300 bg-blue-50/80 hover:bg-blue-100 text-blue-900',
    tag: 'College A-D Owner'
  },
  {
    email: 'principal@vjti.ac.in',
    name: 'Dr. Sachin Kore',
    institution: 'VJTI Autonomous Institute',
    roleLabel: 'Institution Signatory',
    color: 'border-indigo-300 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900',
    tag: 'College E (Cross-Tenant Target)'
  },
  {
    email: 'ro.western@aicte.gov.in',
    name: 'Dr. R. K. Soni',
    institution: 'AICTE Western Regional Office',
    roleLabel: 'Regional Officer / Reviewer',
    color: 'border-amber-300 bg-amber-50/80 hover:bg-amber-100 text-amber-900',
    tag: 'Scrutiny & Re-Scrutiny Signatory'
  },
  {
    email: 'evc.chair@aicte.gov.in',
    name: 'Prof. S. Velmurugan / Dr. B. B. Ahuja',
    institution: 'Expert Visit Committee Panel',
    roleLabel: 'EVC Committee Chairman',
    color: 'border-purple-300 bg-purple-50/80 hover:bg-purple-100 text-purple-900',
    tag: 'On-Site Inspection Proforma'
  },
  {
    email: 'bureau.approval@aicte.gov.in',
    name: 'Dr. Mamta R. Agarwal',
    institution: 'Approval Bureau & Council EC',
    roleLabel: 'Advisor-I (Competent Authority)',
    color: 'border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900',
    tag: 'Decision Gate (decision.record)'
  },
  {
    email: 'admin@aicte.gov.in',
    name: 'Policy Administrator',
    institution: 'AICTE Headquarters (New Delhi)',
    roleLabel: 'Central System Admin',
    color: 'border-rose-300 bg-rose-50/80 hover:bg-rose-100 text-rose-900',
    tag: 'Policy Admin (No Decision T07)'
  }
];

export function SessionGate({ children }: { children: React.ReactNode }) {
  const [generation, setGeneration] = useState(getSessionRevision);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const quickSwitchRole = async (targetEmail: string) => {
    setBusy(true);
    setError('');
    setClockFeedback(null);
    try {
      try {
        await logout();
      } catch {
        /* ignore stale session logout */
      }
      await login({ email: targetEmail, password: 'password123' });
      setReady(true);
    } catch (err: any) {
      setError(err?.message || 'Quick role switch failed');
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
        {/* Top Ecosystem Header (National PravahReg Companion Layer) */}
        <header className="bg-[#0A2540] text-white border-b border-slate-700/80 shadow-md">
          {/* Main Top Brand Bar */}
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

            {/* Active User Pill & Sign Out */}
            <div className="flex items-center gap-2">
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
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-200 hover:text-white text-xs border border-slate-700 transition-colors disabled:opacity-50"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* 1-Click Role Switcher Bar */}
          <div className="bg-[#06182a] px-4 py-1.5 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold shrink-0">
              1-Click Role:
            </span>
            <div className="flex items-center gap-1.5 flex-nowrap">
              {DEMO_PERSONAS.map((p) => {
                const isActive = p.email === currentPersona?.email;
                return (
                  <button
                    key={p.email}
                    type="button"
                    disabled={busy || isActive}
                    onClick={() => quickSwitchRole(p.email)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all shrink-0 border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-400/40 font-bold'
                        : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    } disabled:cursor-default`}
                    title={`${p.name} - ${p.institution} (${p.roleLabel})`}
                  >
                    {p.name.split(' ')[0]} ({p.tag.split(' ')[0]})
                  </button>
                );
              })}
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
          {error && (
            <div role="alert" className="bg-rose-950/90 border-t border-rose-800 px-4 py-1.5 text-xs text-rose-200">
              {error}
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
    <main className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800">
      <div className="w-full max-w-4xl space-y-6">
        {/* Banner Header */}
        <div className="text-center space-y-2 text-white">
          <div className="inline-flex p-3 rounded-2xl bg-orange-500/20 border border-orange-400/40 text-2xl mb-1">
            🏛️
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            AICTE Regulation Bureau &bull; PravahReg Companion Layer
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto">
            Smart India Hackathon 2026 (Problem Statement 26262) &bull; Academic Year 2026–27
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30">
              APH 2024–27 + 2026-27 Errata
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Zero-Trust Scope Isolation
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-purple-500/20 text-purple-300 border border-purple-400/30">
              WORM HMAC-SHA256 Audit
            </span>
          </div>
        </div>

        {/* 1-Click Persona Cards Grid (Quick Login) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                1-Click Jury &amp; Demonstration Personas
              </h2>
              <p className="text-xs text-slate-500">
                Click any persona below to authenticate instantly with server-verified credentials.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              6 Built-In Roles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEMO_PERSONAS.map((p) => (
              <button
                key={p.email}
                type="button"
                disabled={busy}
                onClick={() => quickSwitchRole(p.email)}
                className={`p-3.5 rounded-xl border text-left transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${p.color} disabled:opacity-50`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs truncate">{p.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/80 border border-current font-bold uppercase">
                      {p.tag}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 line-clamp-1">{p.institution}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-current/20 flex items-center justify-between text-[10px]">
                  <span className="font-semibold">{p.roleLabel}</span>
                  <span className="underline font-mono">Login &rarr;</span>
                </div>
              </button>
            ))}
          </div>

          {/* Fallback Manual Form */}
          <div className="pt-4 border-t border-slate-200">
            <details className="text-xs text-slate-600">
              <summary className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900">
                Or sign in manually with email &amp; password
              </summary>
              <form
                className="mt-3 space-y-3 max-w-md"
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
                    setPassword('');
                    setBusy(false);
                  }
                }}
              >
                <label className="block">
                  <span className="text-[11px] font-semibold text-slate-700">Email Address</span>
                  <input
                    className="block w-full border border-slate-300 rounded-lg p-2 text-xs mt-1"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-[11px] font-semibold text-slate-700">Password</span>
                  <input
                    className="block w-full border border-slate-300 rounded-lg p-2 text-xs mt-1"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                {error && <p role="alert" className="text-xs text-rose-600 font-semibold">{error}</p>}
                {logoutFailed && (
                  <button type="button" disabled={busy} onClick={signOut} className="text-xs text-rose-600 underline">
                    Retry server sign-out
                  </button>
                )}
                <button
                  className="rounded-lg bg-blue-800 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-900 disabled:opacity-50"
                  disabled={busy}
                >
                  {busy ? 'Signing in…' : 'Sign in manually'}
                </button>
              </form>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
}
