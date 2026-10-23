import React, { useState } from 'react';
import type { Actor } from '../../shared/contracts';
import { getSession } from '../../services/session';
import { CanonicalWorkspace } from './CanonicalWorkspace';

const views = [
  { id:'cases', label:'Cases', permission:'case.read', owner:'M1', requirement:'Canonical intake, list, detail, history and policy explanation.' },
  { id:'scrutiny', label:'Scrutiny', permission:'case.transition', owner:'M2', requirement:'Signed scrutiny, correction and re-scrutiny APIs; current signed-status read contract.' },
  { id:'evc', label:'EVC', permission:'case.transition', owner:'M2', requirement:'Canonical EVC queue, schedule and report APIs.' },
  { id:'documents', label:'Documents', permission:'case.read', owner:'M3', requirement:'Scoped document upload, immutable versions, verified metadata and protected content APIs.' },
  { id:'obligations', label:'Obligations', permission:'case.read', owner:'M3', requirement:'Scoped obligation list/detail contract plus canonical evidence/review APIs.' },
  { id:'notifications', label:'Notifications', permission:'notification.read', owner:'M3', requirement:'Durable Page<Notification> and idempotent read API.' },
  { id:'dashboard', label:'Dashboard', permission:'dashboard.read', owner:'M3', requirement:'Canonical scoped DashboardSummary with durable cross-member counts.' },
] as const;
export function availableViews(actor: Actor) {
  return views.filter(view => actor.permissions.some(p => p === view.permission) &&
    (!['scrutiny','evc'].includes(view.id) || actor.roles.some(r => ['reviewer','regional_officer','bureau_officer','evc'].includes(r))));
}
export function PendingIntegration({ view }: { view: ReturnType<typeof availableViews>[number] }) {
  return <section className="m-6 rounded border p-6"><h1>{view.label}</h1><p role="status">Integration pending — {view.owner}</p><p>{view.requirement}</p><p>No live records are displayed and no changes can be submitted from this view.</p></section>;
}
/** All mounted views share SessionGate; no legacy AppContext or local domain mutation. */
export function CanonicalNavigation() {
  const actor = getSession()?.actor;
  const [selected, setSelected] = useState('cases');
  if (!actor) return <p role="alert">Session expired. Sign in again.</p>;
  const available = availableViews(actor), view = available.find(v => v.id === selected) ?? available[0];
  if (!view) return <p role="alert">No workspace permissions are assigned.</p>;
  return <><nav aria-label="Workspace" className="flex flex-wrap gap-3 border-b p-4">{available.map(v => <button key={v.id} aria-current={view.id === v.id ? 'page' : undefined} onClick={() => setSelected(v.id)}>{v.label}{v.id !== 'cases' ? ' (pending)' : ''}</button>)}</nav>{view.id === 'cases' ? <CanonicalWorkspace/> : <PendingIntegration view={view}/>}</>;
}
