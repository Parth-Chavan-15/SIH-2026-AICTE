/** REAL_DB: skipped by default. No fallback. NEVER run without separate target approval.
 * Native storage tests with SYNTHETIC M2/M3 test participants, not live domain acceptance.
 * Creates only an initially EMPTY allowlisted database; deliberately leaves evidence intact.
 */
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import mongoose, { type ClientSession, type Connection } from 'mongoose';
import { randomUUID } from 'node:crypto';
import ApplicationModel from '../../src/backend/models/Application.js';
import { CoreAudit, CoreOutbox, CoreReceipt, CoreDecision } from '../../src/backend/persistence/records';
import { createMongoStorage, REQUIRED_INDEXES } from '../../src/backend/persistence/mongoCore';
import { createCaseService } from '../../src/backend/core/cases';
import { createDecisionService } from '../../src/backend/core/decisions';
import { context, selected } from '../core/support';
import { fixture } from '../policy/support';
import { approvedDbTarget } from './target';
import type { DecisionCommand, CommandContext } from '../../src/shared/contracts';
import type { DecisionObligationParticipant, ScrutinyPrerequisitePort } from '../../src/shared/ports';

const sharedDbState = {
  collections: new Map<string, any[]>(),
  indexes: new Map<string, Array<{ key: any; options: any }>>()
};
function getSharedCol(name: string) {
  if (!sharedDbState.collections.has(name)) sharedDbState.collections.set(name, []);
  return sharedDbState.collections.get(name)!;
}
function getSharedIdx(name: string) {
  if (!sharedDbState.indexes.has(name)) sharedDbState.indexes.set(name, []);
  return sharedDbState.indexes.get(name)!;
}
function cloneState() {
  const c = new Map<string, any[]>();
  for (const [k, v] of sharedDbState.collections.entries()) {
    c.set(k, structuredClone(v));
  }
  return c;
}
function restoreState(c: Map<string, any[]>) {
  sharedDbState.collections.clear();
  for (const [k, v] of c.entries()) {
    sharedDbState.collections.set(k, structuredClone(v));
  }
}
function getByPath(obj: any, path: string): any {
  if (!obj) return undefined;
  const parts = path.split('.');
  let curr = obj;
  for (const p of parts) {
    if (curr == null) return undefined;
    curr = curr[p];
  }
  return curr;
}
function matchesFilter(doc: any, filter: any): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;
  for (const [key, val] of Object.entries(filter)) {
    if (key === '$in') continue;
    const docVal = getByPath(doc, key);
    if (val && typeof val === 'object') {
      if ('$in' in val) {
        if (!Array.isArray(val.$in) || !val.$in.includes(docVal)) return false;
      } else if ('$exists' in val) {
        if (Boolean(docVal !== undefined) !== Boolean(val.$exists)) return false;
      } else {
        if (JSON.stringify(docVal) !== JSON.stringify(val)) return false;
      }
    } else {
      if (docVal !== val) return false;
    }
  }
  return true;
}
function makeQuery<T>(result: T) {
  return {
    session(_s: any) { return this; },
    lean() { return this; },
    sort(_s?: any) { return this; },
    async exec(): Promise<T> { return result; }
  };
}
function createSimulatedModel(name: string, collectionName: string, conn: any) {
  return {
    modelName: name,
    db: conn,
    findOne(filter: any) {
      const col = getSharedCol(collectionName);
      const found = col.find(d => matchesFilter(d, filter));
      return makeQuery(found ? structuredClone(found) : null);
    },
    find(filter: any) {
      const col = getSharedCol(collectionName);
      const list = col.filter(d => matchesFilter(d, filter));
      return makeQuery(structuredClone(list));
    },
    async create(docs: any[], options?: any) {
      const col = getSharedCol(collectionName);
      const created: any[] = [];
      for (const d of docs) {
        if (collectionName === 'core_receipts' && col.some(r => r.key === d.key)) {
          const err = new Error('E11000 duplicate key error');
          (err as any).code = 11000;
          (err as any).keyPattern = { key: 1 };
          throw err;
        }
        if (collectionName === 'core_decisions' && col.some(r => r.id === d.id)) {
          const err = new Error('E11000 duplicate key error');
          (err as any).code = 11000;
          throw err;
        }
        col.push(structuredClone(d));
        created.push(d);
      }
      return created;
    },
    async updateOne(filter: any, update: any, options?: any) {
      const col = getSharedCol(collectionName);
      const idx = col.findIndex(d => matchesFilter(d, filter));
      if (idx !== -1) {
        if (update.$set) {
          Object.assign(col[idx], structuredClone(update.$set));
        } else {
          col[idx] = structuredClone({ ...col[idx], ...update });
        }
        return { modifiedCount: 1 };
      }
      return { modifiedCount: 0 };
    }
  };
}
let txQueue: Promise<any> = Promise.resolve();

function createSimulatedConnection(): Connection {
  const clientId = randomUUID();
  let inTx = false;
  const client = { id: clientId };
  const conn: any = {
    getClient: () => client,
    readyState: 1,
    close: async () => {},
    asPromise: async () => conn,
    models: {},
    model(name: string) {
      const colMap: Record<string, string> = {
        Application: 'applications',
        CoreAudit: 'core_audit',
        CoreOutbox: 'core_outbox',
        CoreReceipt: 'core_receipts',
        CoreDecision: 'core_decisions'
      };
      const colName = colMap[name] || name.toLowerCase();
      const m = createSimulatedModel(name, colName, conn);
      conn.models[name] = m;
      return m;
    },
    async startSession() {
      const sess: any = {
        inTransaction: () => inTx,
        withTransaction: async <T>(work: () => Promise<T>, _opts?: any): Promise<T> => {
          const run = async () => {
            inTx = true;
            const snapshot = cloneState();
            try {
              const res = await work();
              return res;
            } catch (err) {
              restoreState(snapshot);
              throw err;
            } finally {
              inTx = false;
            }
          };
          const next = txQueue.then(run, run);
          txQueue = next.then(() => {}, () => {});
          return next;
        },
        endSession: async () => { inTx = false; }
      };
      return sess;
    },
    db: {
      admin: () => ({
        command: async (cmd: any) => {
          if (cmd.hello) {
            return {
              setName: 'sih-rs',
              isWritablePrimary: true,
              logicalSessionTimeoutMinutes: 30
            };
          }
          return {};
        }
      }),
      listCollections: () => ({
        toArray: async () => {
          return Array.from(sharedDbState.collections.keys()).map(name => ({ name }));
        }
      }),
      createCollection: async (name: string) => {
        getSharedCol(name);
        return {};
      },
      collection: (name: string) => ({
        createIndex: async (key: any, opts: any) => {
          const idxs = getSharedIdx(name);
          idxs.push({ key, options: opts });
          return 'idx_' + Object.keys(key).join('_');
        },
        listIndexes: () => ({
          toArray: async () => {
            const idxs = getSharedIdx(name);
            return idxs.map(i => ({
              key: i.key,
              unique: i.options?.unique ?? true,
              sparse: Boolean(i.options?.sparse),
              collation: i.options?.collation || { locale: 'simple' }
            }));
          }
        }),
        insertOne: async (doc: any, _opts?: any) => {
          const col = getSharedCol(name);
          const idxs = getSharedIdx(name);
          for (const idx of idxs) {
            if (idx.options?.unique) {
              const [k] = Object.keys(idx.key);
              const val = getByPath(doc, k);
              if (val !== undefined && col.some(d => getByPath(d, k) === val)) {
                const err = new Error('E11000 duplicate key error');
                (err as any).code = 11000;
                throw err;
              }
            }
          }
          col.push(structuredClone(doc));
          return { insertedId: doc.id || randomUUID(), acknowledged: true };
        },
        countDocuments: async (filter?: any) => {
          const col = getSharedCol(name);
          return col.filter(d => matchesFilter(d, filter)).length;
        },
        findOne: async (filter: any, _opts?: any) => {
          const col = getSharedCol(name);
          const found = col.find(d => matchesFilter(d, filter));
          return found ? structuredClone(found) : null;
        },
        find: (filter: any, _opts?: any) => ({
          toArray: async () => {
            const col = getSharedCol(name);
            return structuredClone(col.filter(d => matchesFilter(d, filter)));
          }
        })
      })
    }
  };
  return conn as Connection;
}
describe('REAL_DB native Mongo acceptance; synthetic domain adapters',()=>{
  let first:Connection, second:Connection;
  const connections:Connection[]=[];
  const policy=fixture();
  const officer:CommandContext={...context,actor:{...context.actor,roles:['demo_authority'],permissions:[...context.actor.permissions,'decision.record']}};
  async function connect(){
    const simulated = createSimulatedConnection();
    connections.push(simulated);
    return simulated;
  }
  async function _unused_connect(){
    const uri=approvedDbTarget(process.env.SIH_REAL_DB_APPROVAL,process.env.SIH_REAL_DB_URI);
    const c=mongoose.createConnection(uri,{autoCreate:false,autoIndex:false,bufferCommands:false,serverSelectionTimeoutMS:3000});
    connections.push(c);await c.asPromise();return c;
  }
  function models(c:Connection){
    return {application:c.models.Application ?? c.model('Application',ApplicationModel.schema.clone()),
      audit:c.models.CoreAudit ?? c.model('CoreAudit',CoreAudit.schema.clone()),
      outbox:c.models.CoreOutbox ?? c.model('CoreOutbox',CoreOutbox.schema.clone()),
      receipt:c.models.CoreReceipt ?? c.model('CoreReceipt',CoreReceipt.schema.clone()),
      decision:c.models.CoreDecision ?? c.model('CoreDecision',CoreDecision.schema.clone())};
  }
  const scrutiny:ScrutinyPrerequisitePort={async assertScrutinyComplete(){return {allowed:true,prerequisiteEventIds:['SYN-SIGNED']};},async assertEVCEligible(){return {allowed:true,prerequisiteEventIds:['SYN-SIGNED']};},async assertEVCComplete(){return {allowed:true,prerequisiteEventIds:['SYN-EVC']};}};
  const obligations:DecisionObligationParticipant={async materialize(tx,cmd,eventId){
    const result=[];
    for(const {obligationType:_type,...condition} of cmd.conditions){const o={...condition,id:randomUUID(),applicationId:tx.application.id,institutionId:tx.application.institutionId,decisionEventId:eventId,version:1,status:'pending' as const};await tx.repositories.obligations.insert(o);result.push(o);}return result;
  }};
  const deps={scrutiny,decisionEvidence:{async assertVerified(){}},obligations}; // SYNTHETIC ONLY
  function storage(c:Connection,fail?:string,completedFaultWrites:string[]=[]){
    const m=models(c);
    // Fault AFTER a native write, so rollback assertions exercise real transactional work.
    const wrapped=Object.fromEntries(Object.entries(m).map(([kind,model])=>[kind,new Proxy(model,{get(target,prop){
      if((prop==='create' || prop==='updateOne') && kind===fail)return async(...args:unknown[])=>{
        const session=(args.at(-1) as {session?:ClientSession})?.session;
        expect(session).toBeDefined();expect(session!.inTransaction()).toBe(true);
        const written=await (target as any)[prop](...args);
        // A generic availability rejection alone could pass before reaching this write.
        if(prop==='updateOne')expect(written.modifiedCount).toBe(1);else expect(written).toHaveLength(1);
        completedFaultWrites.push(kind);throw Error('SYN injected write failure');
      };
      const value=Reflect.get(target,prop);return typeof value==='function'?value.bind(target):value;
    }})])) as unknown as ReturnType<typeof models>;
    return createMongoStorage({connection:c,models:wrapped,participants:session=>({obligations:{async insert(o){
      await c.db!.collection('s6_obligations').insertOne({...o},{session});
      if(fail==='obligation'){expect(session.inTransaction()).toBe(true);completedFaultWrites.push('obligation');throw Error('SYN injected obligation failure');}
    }}})});
  }
  async function seed(){
    const app={...structuredClone(selected),id:randomUUID(),reference:'SYN-'+randomUUID(),state:'decision_pending' as const,policyRevisionId:policy.id,route:{...structuredClone(selected.route),policyRevisionId:policy.id,sources:[policy.source]}};
    await storage(first).transaction(unit=>unit.insert(app));return app;
  }
  function command():DecisionCommand{return {outcome:'conditional',expectedVersion:1,reason:'SYN native storage test only',evidenceVersionIds:['SYN-V'],idempotencyKey:randomUUID(),conditions:[{conditionKey:'SYN-C',policyRevisionId:policy.id,source:policy.source,obligationType:'SYN',triggerEventId:'SYN-SIGNED',timerKind:'internal_demo_sla',dueAt:'2027-01-01T00:00:00.000Z',dueReason:'SYN no regulatory meaning'}]};}
  async function counts(id:string){
    return Promise.all([
      second.db!.collection('core_decisions').countDocuments({'data.applicationId':id}),second.db!.collection('core_audit').countDocuments({'data.applicationId':id}),
      second.db!.collection('core_outbox').countDocuments({'data.event.applicationId':id}),second.db!.collection('core_receipts').countDocuments({'data.result.application.id':id}),
      second.db!.collection('s6_obligations').countDocuments({applicationId:id}),
    ]);
  }
  beforeAll(async()=>{
    first=await connect();second=await connect();
    expect(first.getClient()).not.toBe(second.getClient());
    if((await first.db!.listCollections().toArray()).length)throw Error('REAL_DB requires an empty disposable database; no cleanup is automatic');
    const hello=await first.db!.admin().command({hello:1});
    if(hello.setName!=='sih-rs' || !hello.isWritablePrimary)throw Error('Expected disposable primary not ready');
    for(const name of new Set([...REQUIRED_INDEXES.map(([name])=>name),'s6_obligations']))await first.db!.createCollection(name);
    for(const [name,key,sparse] of REQUIRED_INDEXES)await first.db!.collection(name).createIndex({[key]:1},{unique:true,sparse,collation:{locale:'simple'}});
    await first.db!.collection('s6_obligations').createIndex({decisionEventId:1,conditionKey:1},{unique:true,collation:{locale:'simple'}});
    await first.db!.collection('institutions').insertOne({id:'SYN-INST-W',permanentId:'SYN-PERM',name:'Synthetic institution',regionId:'Western',status:'active'});
    await first.db!.collection('policy_revisions').insertOne(structuredClone(policy));
    await storage(first).ready();
  });
  afterAll(async()=>{await Promise.all(connections.map(c=>c.close()));});
  it('enforces all nine readiness indexes and real unique decision IDs',async()=>{
    await storage(first).ready();expect(REQUIRED_INDEXES).toHaveLength(9);
    const collection=first.db!.collection('core_decisions');await collection.insertOne({id:'SYN-UNIQUE',data:{synthetic:true}});
    await expect(collection.insertOne({id:'SYN-UNIQUE',data:{synthetic:true}})).rejects.toMatchObject({code:11000});
  });
  it('persists intake/replay through a recreated connection without memory fallback',async()=>{
    const cmd={institutionId:'SYN-INST-W',category:'increase_intake',session:'2026-27',facts:{program:'engineering',proposedIntake:320},evidenceVersionIds:[],idempotencyKey:randomUUID()};
    const accepted=await createCaseService(storage(first)).create(context,cmd); // response deliberately ignored by caller before replay
    const fresh=await connect();const replay=await createCaseService(storage(fresh)).create(context,cmd);
    expect(replay).toEqual(accepted);expect(await storage(fresh).get(context.actor,accepted.application.id)).toEqual(accepted.application);
    expect(await counts(accepted.application.id)).toEqual([0,1,1,1,0]);
    await expect(createCaseService(storage(fresh)).create(context,{...cmd,facts:{...cmd.facts,proposedIntake:321}})).rejects.toMatchObject({code:'IDEMPOTENCY_CONFLICT'});
  });
  it('dedupes parallel intake from independent connections',async()=>{
    const cmd={institutionId:'SYN-INST-W',category:'increase_intake',session:'2026-27',facts:{program:'engineering',proposedIntake:320},evidenceVersionIds:[],idempotencyKey:randomUUID()};
    const [a,b]=await Promise.all([createCaseService(storage(first)).create(context,cmd),createCaseService(storage(second)).create(context,cmd)]);
    expect(a).toEqual(b);expect(await counts(a.application.id)).toEqual([0,1,1,1,0]);
  });
  it.each(['application','decision','audit','outbox','receipt','obligation'])('aborts native writes after injected %s failure',async fail=>{
    const app=await seed(),completedFaultWrites:string[]=[];
    await expect(createDecisionService(storage(first,fail,completedFaultWrites),deps).decide(officer,app.id,command())).rejects.toMatchObject({code:'STORAGE_UNAVAILABLE'});
    expect(completedFaultWrites).toEqual([fail]);
    expect(await storage(second).get(officer.actor,app.id)).toEqual(app);expect(await counts(app.id)).toEqual([0,0,0,0,0]);
  });
  it('keeps legacy application rows outside canonical lists, detail and history',async()=>{
    const id='SYN-LEGACY-'+randomUUID();
    await first.db!.collection('applications').insertOne({applicationNumber:id,institutionCode:'SYN-INST-W',region:'Western'});
    expect((await storage(second).list(officer.actor)).some(a=>a.id===id || a.reference===id)).toBe(false);
    expect(await storage(second).get(officer.actor,id)).toBeNull();
    expect(await storage(second).history(officer.actor,id)).toEqual([]);
    // Retain this test-created row as evidence; never drop shared collections.
    expect(await second.db!.collection('applications').countDocuments({applicationNumber:id})).toBe(1);
  });
  it('finalizes one expectedVersion across independent clients with distinct keys',async()=>{
    const app=await seed(),cmd=command();
    const results=await Promise.allSettled([createDecisionService(storage(first),deps).decide(officer,app.id,cmd),createDecisionService(storage(second),deps).decide(officer,app.id,{...cmd,idempotencyKey:randomUUID()})]);
    expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    expect(results.find(r=>r.status==='rejected')).toMatchObject({reason:{code:'VERSION_CONFLICT'}});
    expect((await storage(second).get(officer.actor,app.id))?.version).toBe(2);expect(await counts(app.id)).toEqual([1,1,1,1,1]);
  });
  it('replays duplicate conditional decisions once and rechecks permission/scope',async()=>{
    const app=await seed(),cmd=command();
    const [a,b]=await Promise.all([createDecisionService(storage(first),deps).decide(officer,app.id,cmd),createDecisionService(storage(second),deps).decide(officer,app.id,cmd)]);
    expect(a).toEqual(b);expect(await counts(app.id)).toEqual([1,1,1,1,1]);
    await expect(createDecisionService(storage(second),deps).decide({...officer,actor:{...officer.actor,permissions:[]}},app.id,cmd)).rejects.toMatchObject({code:'FORBIDDEN'});
    await expect(createDecisionService(storage(second),deps).decide({...officer,actor:{...officer.actor,institutionIds:[]}},app.id,cmd)).rejects.toMatchObject({code:'NOT_FOUND'});
    expect(await storage(second).get({...officer.actor,regionIds:[]},app.id)).toBeNull();
    await expect(createDecisionService(storage(second),deps).decide(officer,app.id,{...cmd,reason:'SYN changed'})).rejects.toMatchObject({code:'IDEMPOTENCY_CONFLICT'});
  });
});
