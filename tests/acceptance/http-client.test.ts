/** Real Express + actual frontend client via a supertest bridge. MOCK storage; NO browser/DB proof. */
import { it, expect, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createCoreRouter } from '../../src/backend/core/router';
import { harness, origin } from '../security/helpers';
import { fakeStorage, selected } from '../core/support';

it('round-trips canonical client intake/list/detail/history and denies forbidden or revoked requests through real middleware',async()=>{
  vi.resetModules();
  const hidden = [
    {...selected,id:'SYN-OTHER-INSTITUTION',institutionId:'SYN-INST-OTHER'},
    {...selected,id:'SYN-OTHER-REGION',regionId:'Northern'},
  ];
  const auth=await harness(),storage=fakeStorage(hidden),app=express();app.use(express.json());app.use('/api/v1',createCoreRouter({storage,identity:()=>auth.identity}));
  let cookie='',sendOrigin=true;
  vi.stubGlobal('fetch',async(path:string,init:RequestInit={})=>{
    // Check the real transport contract before emulating the browser cookie jar.
    expect(init.credentials).toBe('same-origin');
    const method=(init.method ?? 'GET').toLowerCase() as 'get'|'post';let req=request(app)[method](path);
    const headers=new Headers(init.headers);headers.forEach((value,name)=>{req=req.set(name,value);});
    if(cookie)req=req.set('Cookie',cookie);if(sendOrigin && method==='post')req=req.set('Origin',origin);
    if(init.body){expect(headers.get('Content-Type')).toBe('application/json');req=req.send(JSON.parse(String(init.body)));}
    const res=await req;const cookies=res.headers['set-cookie'];if(cookies)cookie=cookies[0].split(';')[0];
    return {status:res.status,ok:res.status>=200 && res.status<300,json:async()=>res.body};
  });
  try{
    const session=await import('../../src/services/session');const {api}=await import('../../src/services/api');
    await session.login({email:auth.account.email,password:auth.password});
    const cmd={institutionId:'SYN-INST-W',category:'increase_intake',session:'2026-27',facts:{program:'engineering',proposedIntake:320},evidenceVersionIds:[],idempotencyKey:'SYN-INTEGRATION'};
    const accepted=await api.intake(cmd);expect(accepted.application.state).toBe('policy_review_required');
    expect(await api.listCases()).toEqual({items:[accepted.application],total:1});expect(await api.case(accepted.application.id)).toEqual(accepted.application);
    expect((await api.history(accepted.application.id)).items[0].id).toBe(accepted.eventId);
    expect((await api.explanation(accepted.application.id)).result).toBe('review_required');
    expect(await api.intake(cmd)).toEqual(accepted);expect(storage.inspect().outbox).toHaveLength(1);
    // Neither half of the institution AND region grant is sufficient. Unknown
    // and hidden records have the same public error across every detail route.
    for(const id of [...hidden.map(a=>a.id),'SYN-MISSING']){
      for(const read of [()=>api.case(id),()=>api.history(id),()=>api.explanation(id)]){
        await expect(read()).rejects.toMatchObject({status:404,details:{code:'NOT_FOUND',message:'Case not found'}});
      }
    }
    const beforeDenials=storage.inspect();
    await expect(api.intake({...cmd,institutionId:'SYN-INST-OTHER',idempotencyKey:'SYN-CROSS-SCOPE'})).rejects.toMatchObject({status:403});
    await expect(api.decide(accepted.application.id,{outcome:'approved',expectedVersion:1,idempotencyKey:'SYN-DENIED',reason:'SYN',evidenceVersionIds:['SYN-V'],conditions:[]})).rejects.toMatchObject({status:403});
    sendOrigin=false;await expect(api.intake({...cmd,idempotencyKey:'SYN-NO-ORIGIN'})).rejects.toMatchObject({status:403});sendOrigin=true;
    expect(storage.inspect()).toEqual(beforeDenials);
    const revokedCookie=cookie;expect(revokedCookie).toMatch(/^sih_demo_session=[a-f0-9]{64}$/);
    await session.logout();expect(session.getSession()).toBeUndefined();await expect(api.listCases()).rejects.toMatchObject({status:401});
    // A cleared client jar proves only anonymous denial. Reuse the actual old
    // token independently to prove server-side revocation instead.
    const revoked=await request(app).get('/api/v1/applications').set('Cookie',revokedCookie);
    expect(revoked.status).toBe(401);expect(revoked.body).toMatchObject({success:false,error:{code:'UNAUTHENTICATED'}});
  }finally{vi.unstubAllGlobals();}
});
