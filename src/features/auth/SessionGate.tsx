import React, { useEffect, useState } from 'react';
import { login, logout, restoreSession, getSessionRevision, getSession } from '../../services/session';
/** Existing screens mount only after a server-verified session, never a selected persona. */
export function SessionGate({ children }: { children: React.ReactNode }) {
  const [generation, setGeneration] = useState(getSessionRevision);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [logoutFailed, setLogoutFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    restoreSession().then(() => { if (active) setReady(!!getSession()); }).catch(() => { /* display sign-in */ }).finally(() => { if (active) setChecking(false); });
    const expired = () => setReady(false);
    const changed = () => setGeneration(getSessionRevision());
    window.addEventListener('sih:sessionchanged', changed);
    window.addEventListener('sih:unauthenticated', expired);
    return () => { active = false; window.removeEventListener('sih:unauthenticated', expired); window.removeEventListener('sih:sessionchanged', changed); };
  }, []);
  const signOut = async () => { setBusy(true); try { await logout(); setLogoutFailed(false); setError(''); setReady(false); } catch { setLogoutFailed(true); setError('Local data cleared; server sign-out failed. Retry sign-out.'); } finally { setBusy(false); } };
  if (checking) return <p role="status">Checking demonstration session…</p>;
  if (ready) return <><div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-sm text-white"><span>Fictional demonstration · Some domain services are awaiting integration</span><button disabled={busy} onClick={signOut}>Sign out</button>{error && <span role="alert">{error}</span>}</div><div key={generation}>{children}</div></>;
  return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6"><form className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setError('');
    try { await login({ email, password }); setReady(true); } catch (err) { setError(err instanceof Error ? err.message : 'Sign-in failed'); } finally { setPassword(''); setBusy(false); }
  }}><h1 className="text-xl font-semibold">Fictional demonstration sign-in</h1><p>Use your configured demonstration account. Role selection does not grant access.</p><label className="block">Email<input className="block w-full border p-2" type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} /></label><label className="block">Password<input className="block w-full border p-2" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>{error && <p role="alert">{error}</p>}{logoutFailed && <button type="button" disabled={busy} onClick={signOut}>Retry server sign-out</button>}<button className="rounded bg-blue-800 px-4 py-2 text-white" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></main>;
}
