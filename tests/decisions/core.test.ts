import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createDecisionService } from '../../src/backend/core/decisions';
import { createCoreRouter } from '../../src/backend/core/router';
import { fixture } from '../policy/support';
import { selected, context, fakeStorage } from '../core/support';
import { harness, origin } from '../security/helpers';
import type { Application, Decision, Obligation, CommandContext } from '../../src/shared/contracts';
import type { CaseStorage, Unit } from '../../src/backend/core/storage';
import type { DecisionObligationParticipant, ScrutinyPrerequisitePort } from '../../src/shared/ports';
import { createMongoStorage, REQUIRED_INDEXES } from '../../src/backend/persistence/mongoCore';
const authority: CommandContext = { ...context, actor: { ...context.actor, roles: ['demo_authority'], permissions: [...context.actor.permissions, 'decision.record'] } };
const command = { outcome: 'approved', expectedVersion: 1, reason: 'Synthetic human review only', evidenceVersionIds: ['SYN-E'], conditions: [], idempotencyKey: 'SYN-DECISION' };
function setup(change: Partial<Application> = {}) {
  const p = fixture(), app: Application = { ...selected, state: 'decision_pending', policyRevisionId: p.id, route: { ...selected.route, policyRevisionId: p.id, sources: [p.source] }, ...change };
  const base = fakeStorage([app]); let records = { decisions: [] as Decision[], obligations: [] as Obligation[] };
  const storage: CaseStorage = { ...base, transaction: work => base.transaction(async unit => {
    const pending = structuredClone(records);
    const wrapped: Unit = { ...unit, policy: async () => p, context(ctx,a) { const tx = unit.context(ctx,a); return { ...tx, repositories: { ...tx.repositories,
      decisions: { async insert(d) { pending.decisions.push(d); } }, obligations: { async insert(o) { pending.obligations.push(o); } },
    } }; } };
    const result = await work(wrapped); records = pending; return result;
  }) };
  const scrutiny: ScrutinyPrerequisitePort = { async assertScrutinyComplete() { return { allowed: true, prerequisiteEventIds: ['SYN-SIGN'] }; }, async assertEVCEligible() { return { allowed: true, prerequisiteEventIds: ['SYN-SIGN'] }; }, async assertEVCComplete() { return { allowed: true, prerequisiteEventIds: ['SYN-EVC'] }; } };
  const obligations: DecisionObligationParticipant = { async materialize(tx,c,eventId) {
    const result: Obligation[] = [];
    for (const condition of c.conditions) { const { obligationType: _kind, ...fields } = condition; const o: Obligation = { ...fields, id: 'SYN-O', applicationId: tx.application.id, institutionId: tx.application.institutionId, decisionEventId: eventId, version: 1, status: 'pending' }; await tx.repositories.obligations.insert(o); result.push(o); }
    return result;
  } };
  const deps = { scrutiny, decisionEvidence: { async assertVerified() {} }, obligations };
  return { base, storage, app, p, deps, inspect: () => records };
}
describe('MOCK ONLY decision transactions, not Mongo durability', () => {
  it('binds the native decision/case/audit/outbox/receipt operations to the same MOCK session',async()=>{
    expect(REQUIRED_INDEXES).toHaveLength(9); expect(REQUIRED_INDEXES).toContainEqual(['core_decisions','id',false]);
    const writes:{kind:string;session:unknown}[]=[];
    const model=(kind:string)=>({async create(_docs:unknown,options:any){writes.push({kind,session:options.session});},async updateOne(_filter:unknown,_patch:unknown,options:any){writes.push({kind,session:options.session});return {modifiedCount:1};}});
    const session={async withTransaction(work:()=>Promise<unknown>){return work();},async endSession(){}};
    const connection={readyState:1,db:{admin:()=>({command:async()=>({setName:'SYN-rs',logicalSessionTimeoutMinutes:30})}),collection:(name:string)=>({listIndexes:()=>({toArray:async()=>REQUIRED_INDEXES.filter(([c])=>c===name).map(([,key,sparse])=>({key:{[key]:1},unique:true,sparse}))})})},async startSession(){return session;}};
    const storage=createMongoStorage({connection:connection as never,models:{application:model('case'),decision:model('decision'),audit:model('audit'),outbox:model('outbox'),receipt:model('receipt')}});
    const p=fixture(), d:Decision={id:'SYN-D',applicationId:selected.id,actorId:authority.actor.id,outcome:'approved',policyRevisionId:p.id,source:p.source,decidedAt:context.receivedAt,eventId:'SYN-E',evidenceVersionIds:['SYN-V'],conditions:[]};
    await storage.transaction(async unit=>{
      await unit.context(authority,selected).repositories.decisions.insert(d); await unit.save({...selected,version:2},1);
      await unit.audit({id:d.eventId,applicationId:selected.id,actorId:authority.actor.id,requestId:context.requestId,action:'DecisionRecorded',occurredAt:context.receivedAt,evidenceVersionIds:['SYN-V']});
      await unit.outbox({eventId:d.eventId,status:'pending',attempts:0,event:{contractVersion:'0.1.0-proposed',id:d.eventId,type:'DecisionRecorded',applicationId:selected.id,caseVersion:2,actorId:authority.actor.id,requestId:context.requestId,occurredAt:context.receivedAt,payload:{caseId:selected.id,decision:d}}});
      await unit.remember({key:'SYN-KEY',fingerprint:'SYN-FP',result:{application:{...selected,version:2},eventId:d.eventId},decision:d});
    });
    expect(writes.map(w=>w.kind)).toEqual(['decision','case','audit','outbox','receipt']);expect(writes.every(w=>w.session===session)).toBe(true);
  });
  it('checks current permissions on replay and serializes competing versions in the MOCK queue',async()=>{
    const h=setup(), service=createDecisionService(h.storage,h.deps);
    const results=await Promise.allSettled([service.decide(authority,h.app.id,command),service.decide(authority,h.app.id,{...command,idempotencyKey:'SYN-OTHER'})]);
    expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1); expect(h.inspect().decisions).toHaveLength(1);
    await expect(service.decide({...authority,actor:{...authority.actor,permissions:[]}},h.app.id,command)).rejects.toMatchObject({code:'FORBIDDEN'});
  });
  it('denies corrupt receipt outcome/source bindings instead of returning false replay',async()=>{
    const h=setup(); await createDecisionService(h.storage,h.deps).decide(authority,h.app.id,command);
    for (const mutate of [(r:any)=>{r.decision.source.url='https://untrusted.invalid/source';},(r:any)=>{r.decision.outcome='rejected';r.result.application.state='rejected';}]) {
      const storage:CaseStorage={...h.storage,transaction:work=>h.storage.transaction(unit=>work({...unit,receipt:async key=>{const r=await unit.receipt(key);mutate(r);return r;}}))};
      await expect(createDecisionService(storage,h.deps).decide(authority,h.app.id,command)).rejects.toMatchObject({code:'STORAGE_UNAVAILABLE'});
    }
    expect(h.inspect().decisions).toHaveLength(1);
  });
  it('blocks a wrong-case obligation and a forged client trigger',async()=>{
    for (const forged of [false,true]) {
      const h=setup(); const condition={conditionKey:'SYN-C',policyRevisionId:h.p.id,source:h.p.source,obligationType:'SYN',triggerEventId:forged?'SYN-FORGED':'SYN-SIGN',timerKind:'internal_demo_sla',dueAt:'2027-01-01T00:00:00.000Z',dueReason:'MOCK'};
      if (!forged) h.deps.obligations={async materialize(tx,c,eventId){const {obligationType:_kind,...fields}=c.conditions[0];const o={...fields,id:'SYN-O',applicationId:'SYN-OTHER',institutionId:tx.application.institutionId,decisionEventId:eventId,version:1,status:'pending' as const};await tx.repositories.obligations.insert(o);return [o];}};
      await expect(createDecisionService(h.storage,h.deps).decide(authority,h.app.id,{...command,outcome:'conditional',conditions:[condition]})).rejects.toMatchObject({code:'PRECONDITION_FAILED'}); expect(h.inspect().obligations).toEqual([]);
    }
  });
  it('isolates accepted command/evidence from mutable integration arguments', async () => {
    const h=setup();
    h.deps.obligations={async materialize(_tx,c){c.outcome='rejected'; return [];}};
    h.deps.decisionEvidence={async assertVerified(_tx:any,ids:string[]){ids.push('SYN-UNVERIFIED');}} as typeof h.deps.decisionEvidence;
    const d=await createDecisionService(h.storage,h.deps).decide(authority,h.app.id,command);
    expect(d.evidenceVersionIds).toEqual(command.evidenceVersionIds);
    expect(h.base.inspect().cases[0].state).toBe(d.outcome);
  });
  it.each([{allowed:'yes',prerequisiteEventIds:'SYN-SIGN'},{allowed:true,prerequisiteEventIds:[' ']},{allowed:true,prerequisiteEventIds:['SYN-SIGN','SYN-SIGN']}])('rejects malformed prerequisite attestations %#',async result=>{
    const h=setup(); h.deps.scrutiny.assertScrutinyComplete=async()=>result as never;
    await expect(createDecisionService(h.storage,h.deps).decide(authority,h.app.id,command)).rejects.toMatchObject({code:'PRECONDITION_FAILED'});
    expect(h.inspect().decisions).toEqual([]);
  });
  it('rejects duplicate evidence IDs before calling integrations',async()=>{
    const h=setup(); await expect(createDecisionService(h.storage,h.deps).decide(authority,h.app.id,{...command,evidenceVersionIds:['SYN-E','SYN-E']})).rejects.toMatchObject({code:'VALIDATION_FAILED'});
    expect(h.inspect().decisions).toEqual([]);
  });
  it('does not accept already closed/versioned initial obligations',async()=>{
    const h=setup();
    h.deps.obligations={async materialize(tx,c,eventId){const {obligationType:_kind,...fields}=c.conditions[0]; const o={...fields,id:'SYN-O',applicationId:tx.application.id,institutionId:tx.application.institutionId,decisionEventId:eventId,version:4,status:'closed' as const};await tx.repositories.obligations.insert(o);return [o];}};
    const condition={conditionKey:'SYN-C',policyRevisionId:h.p.id,source:h.p.source,obligationType:'SYN',triggerEventId:'SYN-SIGN',timerKind:'internal_demo_sla',dueAt:'2027-01-01T00:00:00.000Z',dueReason:'MOCK'};
    await expect(createDecisionService(h.storage,h.deps).decide(authority,h.app.id,{...command,outcome:'conditional',conditions:[condition]})).rejects.toMatchObject({code:'PRECONDITION_FAILED'});
    expect(h.inspect().decisions).toEqual([]);
  });
  it('does not treat intake reference existence as independently verified decision evidence', async () => {
    const h=setup();
    await expect(createDecisionService(h.storage,{...h.deps,decisionEvidence:undefined, ...{evidence:{async assertReferences(){}}}}).decide(authority,h.app.id,command)).rejects.toMatchObject({code:'PRECONDITION_FAILED'});
    expect(h.inspect().decisions).toEqual([]);
  });
  it('records one human decision and replays before stale/finalized checks', async () => {
    const h = setup(), service = createDecisionService(h.storage,h.deps);
    const d = await service.decide(authority,h.app.id,command);
    expect(await service.decide(authority,h.app.id,command)).toEqual(d); expect(d.actorId).toBe(authority.actor.id);
    expect(h.base.inspect().cases[0]).toMatchObject({state:'approved',version:2}); expect(h.inspect().decisions).toHaveLength(1); expect(h.base.inspect().audit).toHaveLength(1); expect(h.base.inspect().outbox[0].event.type).toBe('DecisionRecorded');
    await expect(service.decide(authority,h.app.id,{...command,reason:'changed'})).rejects.toMatchObject({code:'IDEMPOTENCY_CONFLICT'});
  });
  it.each(['permission','authority','institution','region','stale','reason','spoof','penalty','pin','state','m2','m3','evidence','unsigned'])('denies %s without writes', async failure => {
    const h = setup(failure === 'pin' ? {policyRevisionId:undefined} : failure === 'state' ? {state:'policy_review_required'} : {});
    const actor = structuredClone(authority), payload: any = {...command}; const deps: Partial<typeof h.deps> = {...h.deps};
    if (failure === 'permission') actor.actor.permissions=[];
    if (failure === 'authority') actor.actor.roles=['reviewer'];
    if (failure === 'institution') actor.actor.institutionIds=[];
    if (failure === 'region') actor.actor.regionIds=[];
    if (failure === 'stale') payload.expectedVersion=2;
    if (failure === 'reason') payload.reason=' ';
    if (failure === 'spoof') payload.actorId='SYN-FORGED';
    if (failure === 'penalty') payload.outcome='withdrawal';
    if (failure === 'm2') delete deps.scrutiny;
    if (failure === 'm3') delete deps.obligations;
    if (failure === 'evidence') deps.decisionEvidence={async assertVerified(){throw Error('MOCK unverified evidence');}};
    if (failure === 'unsigned') deps.scrutiny={...h.deps.scrutiny,async assertScrutinyComplete(){return {allowed:false,failedRule:'UNSIGNED',reason:'MOCK unsigned'};}};
    const denied = createDecisionService(h.storage,deps).decide(actor,h.app.id,payload);
    if (failure === 'evidence') await expect(denied).rejects.toThrow('MOCK unverified evidence');
    else await expect(denied).rejects.toMatchObject({code: ['permission','authority'].includes(failure) ? 'FORBIDDEN' : ['institution','region'].includes(failure) ? 'NOT_FOUND' : failure === 'stale' ? 'VERSION_CONFLICT' : ['reason','spoof','penalty'].includes(failure) ? 'VALIDATION_FAILED' : failure === 'pin' ? 'POLICY_REVIEW_REQUIRED' : 'PRECONDITION_FAILED'});
    expect(h.inspect().decisions).toEqual([]); expect(h.base.inspect().audit).toEqual([]); expect(h.base.inspect().cases[0].version).toBe(1);
  });
  it('materializes conditional obligations before accepting the logical command', async () => {
    const h=setup(); const condition={conditionKey:'SYN-C',policyRevisionId:h.p.id,source:h.p.source,obligationType:'SYN-PROOF',triggerEventId:'SYN-SIGN',timerKind:'internal_demo_sla',dueAt:'2027-01-01T00:00:00.000Z',dueReason:'Synthetic deadline, no regulatory claim'};
    await createDecisionService(h.storage,h.deps).decide(authority,h.app.id,{...command,outcome:'conditional',conditions:[condition]});
    expect(h.inspect().obligations).toHaveLength(1); expect(h.base.inspect().cases[0].state).toBe('conditionally_approved');
  });
  it.each(['participant','audit','outbox','receipt','emptyParticipant'])('rolls back on required %s failure', async fail => {
    const h=setup(); if (['audit','outbox','receipt'].includes(fail)) h.base.flags.fail=fail;
    if (fail === 'participant') h.deps.obligations={async materialize(){throw Error('MOCK participant failure');}};
    const payload:any={...command};
    if (fail === 'emptyParticipant') { h.deps.obligations={async materialize(){return [];}}; payload.outcome='conditional'; payload.conditions=[{conditionKey:'SYN-C',policyRevisionId:h.p.id,source:h.p.source,obligationType:'SYN',triggerEventId:'SYN-SIGN',timerKind:'internal_demo_sla',dueAt:'2027-01-01T00:00:00.000Z',dueReason:'MOCK'}]; }
    await expect(createDecisionService(h.storage,h.deps).decide(authority,h.app.id,payload)).rejects.toBeDefined();
    expect(h.inspect().decisions).toEqual([]); expect(h.base.inspect().cases[0].version).toBe(1); expect(h.base.inspect().outbox).toEqual([]);
  });
  it('requires the mandatory EVC report', async () => {
    const h=setup(); h.p.conditions.stages=['submitted','scrutiny_pending','evc_pending','decision_pending']; h.app.route.stages=h.p.conditions.stages as Application['route']['stages'];
    const base=fakeStorage([h.app]); const store:CaseStorage={...base,transaction:work=>base.transaction(unit=>work({...unit,policy:async()=>h.p}))};
    const deps={...h.deps,scrutiny:{...h.deps.scrutiny,async assertEVCComplete(){return {allowed:false as const,failedRule:'MISSING_REPORT',reason:'MOCK'};}}};
    await expect(createDecisionService(store,deps).decide(authority,h.app.id,command)).rejects.toMatchObject({code:'PRECONDITION_FAILED'}); expect(base.inspect().outbox).toEqual([]);
  });
  it('enforces actual HTTP cookie, authority, Origin and typed blocked execution', async () => {
    const h=setup(), auth=await harness(authority.actor), app=express(); app.use(express.json()); app.use('/api/v1',createCoreRouter({storage:h.storage,identity:()=>auth.identity}));
    const path=`/api/v1/applications/${h.app.id}/decisions`;
    expect((await request(app).post(path).set('Origin',origin).send(command)).status).toBe(401);
    const login=await request(app).post('/api/v1/auth/login').set('Origin',origin).send({email:auth.account.email,password:auth.password}); const cookie=login.headers['set-cookie'][0].split(';')[0];
    expect((await request(app).post(path).set('Cookie',cookie).send(command)).status).toBe(403);
    const blocked=await request(app).post(path).set('Cookie',cookie).set('Origin',origin).send(command);
    expect(blocked.status).toBe(409); expect(blocked.body.error.code).toBe('PRECONDITION_FAILED'); expect(h.inspect().decisions).toEqual([]);
  });
});
