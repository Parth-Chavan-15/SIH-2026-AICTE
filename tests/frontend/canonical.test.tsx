import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, it, expect, vi } from 'vitest';
import { selected, context } from '../core/support';
beforeEach(()=>vi.resetModules()); afterEach(()=>vi.unstubAllGlobals());
const response=(data:unknown,status=200)=>({ok:status<400,status,json:async()=>({success:true,data})});
it('shares overlapping session restoration for StrictMode setup without competing auth actions',async()=>{
  let release!:(v:unknown)=>void; const fetch=vi.fn().mockImplementation(()=>new Promise(r=>release=r));vi.stubGlobal('fetch',fetch);
  const session=await import('../../src/services/session'); const results=Promise.all([session.restoreSession(),session.restoreSession()]);
  release(response({actor:context.actor,expiresAt:'2099-01-01T00:00:00Z'}));
  await expect(results).resolves.toHaveLength(2);expect(fetch).toHaveBeenCalledTimes(1);
});
it('invalidates old case selection tickets and signals field cleanup only on case changes',async()=>{
  const {createCaseSelection}=await import('../../src/features/applications/CanonicalWorkspace');
  const view=createCaseSelection(), first=view.start('SYN-A'); expect(first.changed).toBe(true);
  const refresh=view.start('SYN-A'); expect(refresh.changed).toBe(false);
  const second=view.start('SYN-B'); expect(second.changed).toBe(true); expect(first.version).not.toBe(view.version); expect(view.id).toBe('SYN-B');
  view.invalidate(); expect(second.version).not.toBe(view.version);
});
it.each([null,{}, {success:false,error:{message:'malformed'}}])('sanitizes malformed HTTP error envelopes %#',async body=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:503,json:async()=>body}));
  const {requestJson}=await import('../../src/services/session');await expect(requestJson('/applications')).rejects.toMatchObject({status:503,message:'Service returned an invalid response'});
});
it('invalidates private responses when logout begins, even before its HTTP reply',async()=>{
  let dataReply!:(v:unknown)=>void, logoutReply!:(v:unknown)=>void;
  const fetch=vi.fn().mockResolvedValueOnce(response({actor:context.actor,expiresAt:'2099-01-01T00:00:00Z'})).mockImplementationOnce(()=>new Promise(r=>dataReply=r)).mockImplementationOnce(()=>new Promise(r=>logoutReply=r)); vi.stubGlobal('fetch',fetch);
  const session=await import('../../src/services/session'); await session.restoreSession();
  const pending=session.requestJson('/applications'), signingOut=session.logout();
  expect(session.getSession()).toBeUndefined();
  dataReply(response({items:[selected]})); await expect(pending).rejects.toMatchObject({status:401});
  logoutReply(response(null)); await signingOut;
});
it('rejects overlapping authentication mutations before a second cookie rotation request',async()=>{
  let release!:(v:unknown)=>void; const fetch=vi.fn().mockImplementation(()=>new Promise(r=>release=r)); vi.stubGlobal('fetch',fetch);
  const session=await import('../../src/services/session'); const first=session.login({email:'synthetic@demo.invalid',password:'unconfigured-test-input'});
  await expect(session.login({email:'another@demo.invalid',password:'unconfigured-test-input'})).rejects.toMatchObject({status:409});
  expect(fetch).toHaveBeenCalledTimes(1);
  release(response({actor:context.actor,expiresAt:'2099-01-01T00:00:00Z'})); await first;
});
it('serializes canonical intake and named commands without actor or targetStage', async()=>{
  const fetch=vi.fn().mockResolvedValue(response({application:selected,eventId:'SYN-E'})); vi.stubGlobal('fetch',fetch);
  const {api}=await import('../../src/services/api');
  const input={institutionId:'SYN-INST-W',category:'increase_intake',session:'2026-27',facts:{program:'engineering',proposedIntake:320},evidenceVersionIds:[],idempotencyKey:'SYN-KEY'};
  await api.intake(input); expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(input);
  await api.transition(selected.id,{action:'start_scrutiny',expectedVersion:1,evidenceVersionIds:['SYN-E'],idempotencyKey:'SYN-T'});
  expect(JSON.parse(fetch.mock.calls[1][1].body)).not.toHaveProperty('targetStage'); expect(fetch.mock.calls[1][1].credentials).toBe('same-origin');
});
it('reads Page envelopes and validates case/detail/history/explanation',async()=>{
  const fetch=vi.fn().mockResolvedValueOnce(response({items:[selected],total:1})).mockResolvedValueOnce(response(selected)).mockResolvedValueOnce(response({items:[],total:0})).mockResolvedValueOnce(response(selected.route)); vi.stubGlobal('fetch',fetch);
  const {api}=await import('../../src/services/api'); expect((await api.listCases()).items).toEqual([selected]); expect(await api.case(selected.id)).toEqual(selected); expect((await api.history(selected.id)).items).toEqual([]); expect(await api.explanation(selected.id)).toEqual(selected.route);
});
it.each([403,404,409,422,503])('preserves typed %s failures instead of successful empty data',async status=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status,json:async()=>({success:false,error:{code:status===409?'VERSION_CONFLICT':'PRECONDITION_FAILED',message:'Synthetic denied',issues:[{path:'facts.program',message:'Required'}]}})}));
  const {api}=await import('../../src/services/api'); await expect(api.listCases()).rejects.toMatchObject({status,details:{message:'Synthetic denied'}});
});
it('hides officer and decision controls for an institution and renders source/history safely',async()=>{
  const {permittedActions,canDecide}=await import('../../src/services/api'); const institution={...context.actor,roles:['institution'] as const,permissions:['case.read'] as const};
  expect(permittedActions({...institution,roles:[...institution.roles],permissions:[...institution.permissions]},selected)).toEqual([]);
  expect(canDecide(context.actor,{...selected,state:'decision_pending'})).toBe(false);
  const {CaseExplanation,CaseHistory}=await import('../../src/features/applications/CanonicalWorkspace');
  const route={...selected.route,result:'review_required' as const,stages:[],reviewReasons:['Missing source review <script>']};
  const html=renderToStaticMarkup(<><CaseExplanation route={route}/><CaseHistory items={[]}/></>);
  expect(html).toContain('not rejection'); expect(html).toContain('&lt;script&gt;'); expect(html).toContain('No recorded history');
});
it('renders intake for a verified institution without role switching or optimistic approval controls',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response({actor:{...context.actor,roles:['institution'],permissions:['case.read','case.create']},expiresAt:'2099-01-01T00:00:00Z'})));
  const {restoreSession}=await import('../../src/services/session'); await restoreSession();
  const {CanonicalWorkspace}=await import('../../src/features/applications/CanonicalWorkspace'); const html=renderToStaticMarkup(<CanonicalWorkspace/>);
  expect(html).toContain('New application'); expect(html).toContain('Loading cases'); expect(html).not.toContain('Submit human decision'); expect(html).not.toContain('Select role');
  const {logout}=await import('../../src/services/session'); await logout();
  expect(renderToStaticMarkup(<CanonicalWorkspace/>)).toContain('Session expired');
});
it('does not report success when the decision endpoint is blocked',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:409,json:async()=>({success:false,error:{code:'PRECONDITION_FAILED',message:'M3 missing'}})}));
  const {api}=await import('../../src/services/api'); await expect(api.decide(selected.id,{outcome:'approved',reason:'Synthetic',expectedVersion:1,evidenceVersionIds:['SYN-E'],conditions:[],idempotencyKey:'SYN-D'})).rejects.toMatchObject({status:409});
});
it('discards a previous-session canonical page',async()=>{
  let release!:(v:unknown)=>void; const fetch=vi.fn().mockImplementationOnce(()=>new Promise(r=>release=r)).mockResolvedValue(response({actor:context.actor,expiresAt:'2099-01-01T00:00:00Z'})); vi.stubGlobal('fetch',fetch);
  const {api}=await import('../../src/services/api'); const {restoreSession}=await import('../../src/services/session'); const pending=api.listCases(); await restoreSession(); release(response({items:[selected]})); await expect(pending).rejects.toThrow('Session changed');
});
