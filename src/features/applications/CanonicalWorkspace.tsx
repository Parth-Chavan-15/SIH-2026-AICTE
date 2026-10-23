import React, { useEffect, useRef, useState } from 'react';
import type { Actor, Application, AuditEvent, RouteExplanation, CaseAction, DecisionCommand } from '../../shared/contracts';
import { decisionCommandSchema } from '../../shared/schemas';
import { api, canDecide, permittedActions } from '../../services/api';
import { ApiHttpError, getSession } from '../../services/session';

export function errorMessage(error: unknown): string {
  if (error instanceof ApiHttpError) return `${error.status}: ${error.message}${error.details?.issues?.map(i => ` ${i.path}: ${i.message}`).join('') ?? ''}${error.status === 409 ? ' Refresh the case before issuing a new command.' : ''}`;
  return error instanceof Error ? error.message : 'Request failed';
}
export function CaseExplanation({ route }: { route: RouteExplanation }) {
  return <section><h3>Policy explanation</h3><p>{route.result === 'review_required' ? 'Policy review required — this is not rejection.' : `Pinned revision: ${route.policyRevisionId}`}</p>
    {[...route.reasons, ...(route.reviewReasons ?? [])].map((r,i) => <p key={i}>{r}</p>)}
    {route.sources.map(s => <p key={s.documentId}>{s.title} · {s.location} · revision {s.sourceRevision} {s.url && /^https:\/\/(?:www\.)?aicte\.gov\.in\//.test(s.url) && <a href={s.url} target="_blank" rel="noreferrer">Official source</a>}</p>)}
    <details><summary>Evaluated facts and evidence references</summary><pre>{JSON.stringify(route.evaluatedFacts, null, 2)}</pre></details></section>;
}
export function CaseHistory({ items }: { items: AuditEvent[] }) { return <section><h3>History</h3>{items.length ? <ol>{items.map(e => <li key={e.id}>{e.occurredAt} · {e.action} · version {e.caseVersion} · {e.reason}</li>)}</ol> : <p>No recorded history.</p>}</section>; }

/** Selection tickets invalidate late detail and command navigation results. */
export function createCaseSelection() {
  let version=0, id:string|undefined;
  return { get version(){return version;}, get id(){return id;}, start(next:string){const changed=id!==next;id=next;return {version:++version,changed};}, invalidate(){version++;} };
}
export function CanonicalWorkspace() {
  const session = getSession();
  return session ? <SessionWorkspace actor={session.actor}/> : <p role="alert">Session expired. Sign in again.</p>;
}
function SessionWorkspace({actor}: {actor: Actor}) {
  const [cases, setCases] = useState<Application[]>([]), [loading, setLoading] = useState(true), [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState<Application>(), [route, setRoute] = useState<RouteExplanation>(), [history, setHistory] = useState<AuditEvent[]>(), [detailError, setDetailError] = useState(''), [detailBusy, setDetailBusy] = useState(false);
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [commandError, setCommandError] = useState('');
  const [institutionId, setInstitution] = useState(actor.institutionIds[0] ?? ''), [category, setCategory] = useState('increase_intake'), [session, setYear] = useState('2026-27'), [program, setProgram] = useState('engineering'), [intake, setIntake] = useState('');
  const [evidence, setEvidence] = useState(''), [reason, setReason] = useState(''), [outcome, setOutcome] = useState<DecisionCommand['outcome']>('approved'), [conditions, setConditions] = useState('[]');
  const selection = useRef(createCaseSelection());
  const alive = useRef(true), listSequence = useRef(0), locked = useRef(false), keys = useRef(new Map<string,string>());
  const keyFor = (operation: string, payload: unknown) => { const fingerprint = JSON.stringify([operation,payload]); if (!keys.current.has(fingerprint)) keys.current.set(fingerprint, crypto.randomUUID()); return keys.current.get(fingerprint)!; };
  async function refresh() {
    const sequence = ++listSequence.current; setLoading(true); setLoadError('');
    try { const page = await api.listCases(); if (alive.current && sequence === listSequence.current) setCases(page.items); }
    catch (e) { if (alive.current && sequence === listSequence.current) { setCases([]); setLoadError(errorMessage(e)); } }
    finally { if (alive.current && sequence === listSequence.current) setLoading(false); }
  }
  async function open(id: string) {
    const ticket = selection.current.start(id);
    if (ticket.changed) { setEvidence(''); setReason(''); setOutcome('approved'); setConditions('[]'); }
    const sequence = ticket.version; setDetailBusy(true); setDetailError(''); setSelected(undefined); setRoute(undefined); setHistory(undefined);
    try {
      const app = await api.case(id); if (!alive.current || sequence !== selection.current.version) return;
      setSelected(app);
      const explanation = await api.explanation(id); if (!alive.current || sequence !== selection.current.version) return; setRoute(explanation);
      if (actor.permissions.includes('history.read')) { const page = await api.history(id); if (alive.current && sequence === selection.current.version) setHistory(page.items); }
    } catch (e) { if (alive.current && sequence === selection.current.version) setDetailError(errorMessage(e)); }
    finally { if (alive.current && sequence === selection.current.version) setDetailBusy(false); }
  }
  useEffect(() => { alive.current = true; void refresh(); return () => { alive.current = false; listSequence.current++; selection.current.invalidate(); }; }, []);
  async function perform(work: () => Promise<string>) {
    if (locked.current) return; locked.current = true; setBusy(true); setCommandError(''); setMessage('');
    try { const result = await work(); if (alive.current) { setMessage(result); await refresh(); } }
    catch (e) { if (alive.current) setCommandError(errorMessage(e)); }
    finally { locked.current = false; if (alive.current) setBusy(false); }
  }
  const ids = () => evidence.split(',').map(s => s.trim()).filter(Boolean);
  const transition = (action: CaseAction) => perform(async () => {
    if (!selected) throw Error('Select a case');
    const body = { action, expectedVersion: selected.version, reason, evidenceVersionIds: ids() };
    const result = await api.transition(selected.id, { ...body, idempotencyKey: keyFor(selected.id,body) }); if (selection.current.id === selected.id) await open(selected.id); return `Server recorded ${result.eventId}`;
  });
  return <main className="mx-auto max-w-6xl space-y-6 p-6 text-slate-900"><header><h1 className="text-2xl font-bold">Approval workflow · demonstration</h1><p>Signed in: {actor.id} · {actor.roles.join(', ')} · grants: {actor.scope === 'global' ? 'Explicit global scope' : `${actor.institutionIds.join(', ')} / ${actor.regionIds.join(', ')}`}</p><p>Human demo outcomes are not statutory AICTE approvals. Policy activation and route resolution remain unavailable.</p></header>
    {commandError && <p role="alert">{commandError}</p>}{message && <p role="status">{message}</p>}
    {actor.permissions.includes('case.create') && <form className="space-y-2 rounded border bg-white p-4" onSubmit={e => { e.preventDefault(); void perform(async () => {
      const body = { institutionId, category, session, facts: { program, proposedIntake: Number(intake) }, evidenceVersionIds: [] };
      const navigationVersion=selection.current.version;
      const result = await api.intake({ ...body, idempotencyKey: keyFor('intake',body) }); if (navigationVersion === selection.current.version) await open(result.application.id); return `Created ${result.application.reference}: ${result.application.state}`;
    }); }}><h2>New application</h2><label>Institution ID<input required value={institutionId} onChange={e=>setInstitution(e.target.value)} /></label>
      <label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{['extension_of_approval','new_institution','increase_intake','closure','conversion_coeducation','change_site'].map(c=><option key={c}>{c}</option>)}</select></label>
      <label>Academic session<input required pattern="20[0-9]{2}-[0-9]{2}" value={session} onChange={e=>setYear(e.target.value)} /></label>
      <label>Programme<select value={program} onChange={e=>setProgram(e.target.value)}>{['engineering','management','pharmacy','architecture','applied_arts'].map(c=><option key={c}>{c}</option>)}</select></label>
      <label>Proposed seats<input type="number" required min="1" max="100000" value={intake} onChange={e=>setIntake(e.target.value)} /></label><p>These are intake facts, not verified eligibility. New cases may require policy review.</p><button disabled={busy}>Submit intake</button></form>}
    <section className="rounded border bg-white p-4"><h2>Scoped cases</h2><button disabled={loading} onClick={()=>void refresh()}>Refresh cases</button>
      {loading ? <p role="status">Loading cases…</p> : loadError ? <p role="alert">{loadError}</p> : cases.length ? <ul>{cases.map(a=><li key={a.id}><button onClick={()=>void open(a.id)}>{a.reference} · {a.state} · version {a.version}</button></li>)}</ul> : <p>No cases in your scope.</p>}</section>
    {detailBusy && <p role="status">Loading case details…</p>}{detailError && <p role="alert">{detailError}</p>}
    {selected && <section className="space-y-3 rounded border bg-white p-4"><h2>{selected.reference}</h2><p>ID: {selected.id} · {selected.state} · version {selected.version}</p><button onClick={()=>void open(selected.id)}>Refresh selected case</button>
      {route && <CaseExplanation route={route}/>} {history && <CaseHistory items={history}/>}
      {(permittedActions(actor,selected).length > 0 || canDecide(actor,selected)) && <div><label>Persisted evidence version IDs (comma separated)<input value={evidence} onChange={e=>setEvidence(e.target.value)}/></label><label>Human reason<textarea value={reason} onChange={e=>setReason(e.target.value)}/></label><p>Signed prerequisites and evidence are checked on the server. Their read/status UI is not integrated.</p></div>}
      {permittedActions(actor,selected).map(a=><button key={a} disabled={busy || !ids().length} onClick={()=>void transition(a)}>{a}</button>)}
      {canDecide(actor,selected) && <form onSubmit={e=>{e.preventDefault(); void perform(async()=>{
        const body = { outcome, expectedVersion: selected.version, reason, evidenceVersionIds: ids(), conditions: outcome === 'conditional' ? JSON.parse(conditions) : [] };
        const command = decisionCommandSchema.parse({ ...body, idempotencyKey: keyFor(selected.id,body) });
        const result = await api.decide(selected.id, command); if (selection.current.id === selected.id) await open(selected.id); return `Server recorded demo decision ${result.id}`;
      });}}><h3>Human demo decision</h3><select aria-label="Demo outcome" value={outcome} onChange={e=>setOutcome(e.target.value as DecisionCommand['outcome'])}><option value="approved">Demo approved</option><option value="conditional">Demo conditional</option><option value="rejected">Demo rejected</option></select>
        {outcome === 'conditional' && <label>Reviewed condition records (canonical JSON; no deadline calculation)<textarea value={conditions} onChange={e=>setConditions(e.target.value)}/></label>}
        <button disabled={busy || !reason.trim() || !ids().length}>Submit human decision</button><p>Execution is blocked unless signed M2 checks, verified evidence and the M3 transaction participant are integrated.</p></form>}
    </section>}
    <aside>M2 scrutiny/EVC, M3 documents/obligations/notifications, dashboard and policy administration await integration. No local simulation changes authoritative cases.</aside>
  </main>;
}
