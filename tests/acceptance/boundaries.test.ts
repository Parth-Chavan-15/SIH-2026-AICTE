/** MOCK ONLY integration-boundary regressions, no real services. */
import { it, expect } from 'vitest';
import { createCaseService } from '../../src/backend/core/cases';
import { fakeStorage, context, selected } from '../core/support';
import type { ScrutinyPrerequisitePort } from '../../src/shared/ports';
import { prerequisiteIds, readerContext } from '../../src/backend/core/integrationGuards';
import { fixture } from '../policy/support';
import { approvedRule } from '../../src/backend/policy/registry';
import type { CaseStorage } from '../../src/backend/core/storage';

const command = { action:'complete_scrutiny', expectedVersion:1, evidenceVersionIds:['SYN-E'], idempotencyKey:'SYN-BOUNDARY' };
it('does not forward unexpected capabilities or evaluate unrelated getters from an extended transaction',async()=>{
  const store=fakeStorage([selected]);let getterReads=0;
  await store.transaction(async unit=>{
    const original=unit.context(context,selected);
    const extended=Object.assign(original,{dangerousWrite:async()=>{throw Error('Unexpected capability called');}});
    Object.defineProperty(extended,'privateHandle',{enumerable:true,get(){getterReads++;return original.repositories;}});
    const view=readerContext(extended);
    expect('dangerousWrite' in view).toBe(false);expect('privateHandle' in view).toBe(false);expect(getterReads).toBe(0);
  });
});
it('detaches nested metadata and denies every canonical write even on a retained reader',async()=>{
  const store=fakeStorage([selected]);let retained:ReturnType<typeof readerContext>|undefined;
  await store.transaction(async unit=>{
    const tx=unit.context(context,selected),before=structuredClone({context:tx.context,actor:tx.actor,application:tx.application});
    retained=readerContext(tx);retained.actor.institutionIds.push('SYN-OTHER');retained.context.actor.roles.push('demo_authority');
    retained.application.facts.proposedIntake=999;retained.application.route.sources[0].title='SYN changed';retained.application.route.evaluatedFacts.injected=true;
    expect({context:tx.context,actor:tx.actor,application:tx.application}).toEqual(before);
    for(const repo of Object.values(retained.repositories))for(const write of Object.values(repo) as Array<(record:never)=>Promise<void>>)await expect(write({} as never)).rejects.toMatchObject({code:'PRECONDITION_FAILED'});
    await expect(retained.emit({} as never)).rejects.toMatchObject({code:'PRECONDITION_FAILED'});
  });
  await expect(retained!.repositories.decisions.insert({} as never)).rejects.toMatchObject({code:'PRECONDITION_FAILED'});
  expect(store.inspect().audit).toEqual([]);expect(store.inspect().outbox).toEqual([]);
});
it.each([undefined,null,{}, {allowed:false,prerequisiteEventIds:['SYN-E']},{allowed:1,prerequisiteEventIds:['SYN-E']},{allowed:true,prerequisiteEventIds:[]},{allowed:true,prerequisiteEventIds:[1]},{allowed:true,prerequisiteEventIds:['SYN-E',' SYN-E ']},{allowed:true,prerequisiteEventIds:['SYN-E'],unexpected:true}])('strictly rejects invalid prerequisite result %#',value=>{
  expect(()=>prerequisiteIds(value)).toThrow('Valid signed prerequisite references required');
});
it('retains a historically applicable pin after its effective period ends without migrating to a successor',async()=>{
  const p={...fixture(),effectiveTo:'2026-02-01T00:00:00.000Z'};
  const app={...structuredClone(selected),createdAt:'2026-01-15T00:00:00.000Z',policyRevisionId:p.id,route:{...structuredClone(selected.route),policyRevisionId:p.id,sources:[p.source]}};
  const base=fakeStorage([app]);let registryReads=0;
  const store:CaseStorage={...base,transaction:work=>base.transaction(unit=>work({...unit,policy:async id=>id===p.id?p:null,policies:async()=>{registryReads++;return [{...p,id:'SYN-SUCCESSOR',revision:2,supersedesId:p.id,effectiveFrom:'2026-02-01T00:00:00.000Z',effectiveTo:undefined}];}}))};
  expect(approvedRule(p,new Date().toISOString())).not.toBeNull();
  const result=await createCaseService(store,{evidence:{async assertReferences(){}}}).transition(context,app.id,{...command,action:'start_scrutiny'});
  expect(result.application.state).toBe('scrutiny_pending');expect(result.application.policyRevisionId).toBe(p.id);expect(registryReads).toBe(0);
});
it('still denies a pin that was outside the case creation window',async()=>{
  const p={...fixture(),effectiveTo:'2026-02-01T00:00:00.000Z'};
  const app={...structuredClone(selected),policyRevisionId:p.id,route:{...structuredClone(selected.route),policyRevisionId:p.id,sources:[p.source]}};
  const base=fakeStorage([app]);const store:CaseStorage={...base,transaction:work=>base.transaction(unit=>work({...unit,policy:async()=>p}))};
  await expect(createCaseService(store,{evidence:{async assertReferences(){}}}).transition(context,app.id,{...command,action:'start_scrutiny'})).rejects.toMatchObject({code:'POLICY_REVIEW_REQUIRED'});
  expect(base.inspect().cases[0].version).toBe(1);expect(base.inspect().audit).toEqual([]);
});
it.each([{allowed:'yes',prerequisiteEventIds:'SYN-E'}, {allowed:true,prerequisiteEventIds:[' ']}, {allowed:true,prerequisiteEventIds:['SYN-E','SYN-E']}])('rejects malformed M2 transition attestations %#',async result=>{
  const store=fakeStorage([{...selected,state:'scrutiny_pending'}]);
  const scrutiny={assertScrutinyComplete:async()=>result} as unknown as ScrutinyPrerequisitePort;
  await expect(createCaseService(store,{scrutiny,evidence:{async assertReferences(){}}}).transition(context,selected.id,command)).rejects.toMatchObject({code:'PRECONDITION_FAILED'});
  expect(store.inspect().audit).toEqual([]);
});
it('does not let evidence readers rewrite attribution or audit unverified IDs',async()=>{
  const store=fakeStorage([selected]); const ctx=structuredClone(context);
  const service=createCaseService(store,{evidence:{async assertReferences(tx,ids){tx.context.actor.id='SYN-FORGED';ids.push('SYN-UNVERIFIED');}}});
  await service.transition(ctx,selected.id,{...command,action:'start_scrutiny'});
  expect(store.inspect().audit[0].actorId).toBe(context.actor.id);
  expect(store.inspect().audit[0].evidenceVersionIds).toEqual(['SYN-E']);
});
it('prevents prerequisite readers from staging extra accepted audit writes',async()=>{
  const store=fakeStorage([{...selected,state:'scrutiny_pending'}]);
  const scrutiny={async assertScrutinyComplete(tx){await tx.repositories.audit.append({id:'SYN-FORGED',actorId:context.actor.id,requestId:context.requestId,occurredAt:context.receivedAt,applicationId:selected.id,action:'SYN-FORGED',evidenceVersionIds:[]});return {allowed:true,prerequisiteEventIds:['SYN-SIGNED']};}} as ScrutinyPrerequisitePort;
  await expect(createCaseService(store,{scrutiny,evidence:{async assertReferences(){}}}).transition(context,selected.id,command)).rejects.toMatchObject({code:'PRECONDITION_FAILED'});
  expect(store.inspect().audit).toEqual([]);
});
it('also validates EVC eligibility rather than accepting malformed positive attestations',async()=>{
  const app={...structuredClone(selected),state:'scrutiny_pending' as const};app.route.stages=['submitted','scrutiny_pending','evc_pending','decision_pending'];
  const store=fakeStorage([app]);
  const scrutiny={async assertScrutinyComplete(){return {allowed:true,prerequisiteEventIds:['SYN-SIGNED']};},async assertEVCEligible(){return {allowed:true,prerequisiteEventIds:'SYN-NOT-ARRAY'};}} as unknown as ScrutinyPrerequisitePort;
  await expect(createCaseService(store,{scrutiny,evidence:{async assertReferences(){}}}).transition(context,app.id,command)).rejects.toMatchObject({code:'PRECONDITION_FAILED'});
  expect(store.inspect().cases[0].version).toBe(1);expect(store.inspect().outbox).toEqual([]);
});
it('isolates intake facts and identity from the policy reader',async()=>{
  const store=fakeStorage(),ctx=structuredClone(context);
  const service=createCaseService(store,{policyFacts:{async load(tx){tx.application.facts.proposedIntake=999;tx.context.actor.id='SYN-FORGED';return {facts:{},sessionMode:'regular'};}}});
  const result=await service.create(ctx,{institutionId:'SYN-INST-W',category:'increase_intake',session:'2026-27',facts:{program:'engineering',proposedIntake:320},evidenceVersionIds:[],idempotencyKey:'SYN-INTAKE'});
  expect(result.application.facts.proposedIntake).toBe(320);expect(store.inspect().audit[0].actorId).toBe(context.actor.id);
});
