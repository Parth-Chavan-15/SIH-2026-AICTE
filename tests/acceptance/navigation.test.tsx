import React from 'react';
import { it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { availableViews, PendingIntegration, CanonicalNavigation } from '../../src/features/applications/CanonicalNavigation';
import { restoreSession, logout } from '../../src/services/session';
import { context } from '../core/support';
it('requires permissions and operational role for reviewer navigation',()=>{
  expect(availableViews({...context.actor,permissions:[]})).toEqual([]);
  const institution={...context.actor,roles:['institution' as const]};
  expect(availableViews(institution).map(v=>v.id)).not.toContain('scrutiny');
  expect(availableViews(context.actor).map(v=>v.id)).toContain('scrutiny');
});
it('discloses every unavailable module without mounting a form or fake live records',()=>{
  for(const view of availableViews({...context.actor,permissions:[...context.actor.permissions,'notification.read']})) {
    if(view.id==='cases') continue;
    const html=renderToStaticMarkup(<PendingIntegration view={view}/>);
    expect(html).toContain('Integration pending');expect(html).toContain(view.owner);
    expect(html).not.toContain('<form'); expect(html).toContain('No live records');
  }
});
it('hides navigation and canonical records when no verified session exists',()=>{
  const html=renderToStaticMarkup(<CanonicalNavigation/>);
  expect(html).toContain('role="alert"');expect(html).toContain('Session expired');
  expect(html).not.toContain('<nav');expect(html).not.toContain('New application');
});
it('renders semantic selected navigation and a truthful pending fallback for a restricted session',async()=>{
  const actor={...context.actor,roles:['institution' as const],permissions:['dashboard.read' as const]};
  const fetch=vi.fn().mockResolvedValue({status:200,ok:true,json:async()=>({success:true,data:{actor,expiresAt:new Date(Date.now()+60_000).toISOString()}})});
  vi.stubGlobal('fetch',fetch);
  try{
    await restoreSession();
    // Static rendering establishes markup/permission filtering, not interactive
    // keyboard behavior, SessionGate effects or browser privacy acceptance.
    const html=renderToStaticMarkup(<CanonicalNavigation/>);
    expect(html).toContain('<nav aria-label="Workspace"');expect(html).toContain('aria-current="page"');
    expect(html).toContain('Dashboard (pending)');expect(html).toContain('role="status"');
    expect(html).not.toContain('>Cases<');expect(html).not.toContain('<form');
    expect(fetch).toHaveBeenCalledTimes(1); // Pending view makes no domain request.
  }finally{
    await logout();vi.unstubAllGlobals();
  }
});
