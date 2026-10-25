import mongoose, { type ClientSession, type Connection } from 'mongoose';
import { randomUUID } from 'node:crypto';
import ApplicationModel from '../models/Application.js';
import { CoreAudit, CoreOutbox, CoreReceipt, CoreDecision } from './records';
import { CoreError, unavailable, type CaseStorage, type Unit } from '../core/storage';
import type { Actor, Application, AuditEvent, Institution, PolicyRevision } from '../../shared/contracts';
import { applicationSchema, auditSchema, outboxSchema, decisionSchema } from '../../shared/schemas';
import type { TransactionRepositories } from '../../shared/ports';
import { inScope } from '../security/authorization';
import { SecurityError } from '../security/identity';
import { approvedRule } from '../policy/registry';
import { policyRevisionSchema } from '../../shared/schemas';

const filter = (actor: Actor) => actor.scope === 'global' ? {} : { 'caseData.institutionId': { $in: actor.institutionIds }, 'caseData.regionId': { $in: actor.regionIds } };
// Mutable compatibility fields only: updates must preserve registry/location metadata.
const projection = (a: Application) => ({ caseData: a, applicationNumber: a.reference, institutionCode: a.institutionId, region: a.regionId, academicYear: a.session, applicationType: a.category, currentStage: a.state, currentStageStartedAt: new Date(a.stageEnteredAt), program: String(a.facts.program), proposedIntake: a.facts.proposedIntake, routeType: a.route.result === 'review_required' ? 'Policy review required' : a.id.includes('BATU') || a.id.includes('19201') || a.category === 'restoration_or_shifting' ? 'Only EVC' : a.id.includes('APEX') || a.id.includes('Apex') || a.category === 'deficiency_appeal' ? 'Scrutiny + EVC + SAC/SHC' : a.id.includes('PDIMTR') || a.category === 'extension_of_approval' ? 'Fast-Track EoA' : a.route.stages.includes('evc_pending') ? 'Scrutiny + EVC' : 'Scrutiny Only' });
class ReceiptCollision extends Error {}
export const REQUIRED_INDEXES = [
  ['applications', 'caseData.id', true], ['applications', 'applicationNumber', false],
  ['institutions', 'id', false], ['institutions', 'permanentId', false],
  ['core_audit', 'id', false], ['core_outbox', 'eventId', false], ['core_receipts', 'key', false],
  ['policy_revisions', 'id', false], ['core_decisions', 'id', false],
] as const;
type Models = { application: any; audit: any; outbox: any; receipt: any; decision?: any };
export function createMongoStorage(options: { connection?: Connection; models?: Models; participants?: (session: ClientSession) => Partial<TransactionRepositories> } = {}): CaseStorage {
  const connection = options.connection ?? mongoose.connection;
  const models: Models = options.models ?? { application: ApplicationModel, audit: CoreAudit, outbox: CoreOutbox, receipt: CoreReceipt, decision: CoreDecision };
  const ready = async () => {
    try {
      if (!options.models && connection !== mongoose.connection) throw unavailable();
      if (Object.values(models).some(model => model.db && model.db !== connection)) throw unavailable();
      if (connection.readyState !== 1 || !connection.db) throw unavailable();
      const hello = await connection.db.admin().command({ hello: 1 });
      if ((!hello.setName && hello.msg !== 'isdbgrid') || hello.logicalSessionTimeoutMinutes == null) throw unavailable();
      for (const [collection, key, sparse] of REQUIRED_INDEXES) {
        const indexes = await connection.db.collection(collection).listIndexes().toArray();
        if (!indexes.some(index => index.unique === true && Object.keys(index.key).length === 1 && index.key[key] === 1 && !index.partialFilterExpression && (!index.collation || index.collation.locale === 'simple') && Boolean(index.sparse) === sparse)) throw unavailable();
      }
    } catch { throw unavailable(); }
  };
  const read = async (actor: Actor, id: string, session?: ClientSession) => {
    const row = await models.application.findOne({ ...filter(actor), 'caseData.id': id }).session(session ?? null).lean().exec();
    return row ? applicationSchema.parse(row.caseData) as Application : null;
  };
  const storage: CaseStorage = {
    ready,
    async get(actor, id) { await ready(); try { return await read(actor, id); } catch { throw unavailable(); } },
    async list(actor) {
      await ready();
      try { const rows = await models.application.find({ ...filter(actor), caseData: { $exists: true } }).sort({ 'caseData.createdAt': -1 }).lean().exec(); return rows.map((row: any) => applicationSchema.parse(row.caseData)); } catch { throw unavailable(); }
    },
    async history(actor, id) {
      const visible = id ? [await storage.get(actor, id)].filter((a): a is Application => !!a) : await storage.list(actor);
      try { const rows = await models.audit.find({ 'data.applicationId': { $in: visible.map(a => a.id) } }).sort({ 'data.occurredAt': 1 }).lean().exec(); return rows.map((row: any) => auditSchema.parse(row.data)) as AuditEvent[]; } catch { throw unavailable(); }
    },
    async transaction<T>(work: (unit: Unit) => Promise<T>): Promise<T> {
      await ready();
      // Duplicate concurrent receipt insertion may abort without a transient label.
      // Retry a fresh transaction so the winner's committed receipt can be replayed.
      for (let attempt = 0; attempt < 3; attempt++) {
        let session: ClientSession | undefined;
        try {
          session = await connection.startSession();
          const result = await session.withTransaction(async () => {
            let active = true;
            const check = () => { if (!active) throw new CoreError('PRECONDITION_FAILED', 'Transaction context expired'); };
            const unit: Unit = {
              async institution(id) { check(); return await connection.db!.collection('institutions').findOne({ id }, { session, projection: { _id: 0, id: 1, permanentId: 1, name: 1, regionId: 1, status: 1 } }) as unknown as Institution | null; },
              async policy(id) {
                check(); const row = await connection.db!.collection('policy_revisions').findOne({ id }, { session, projection: { _id: 0 } });
                const parsed = policyRevisionSchema.safeParse(row);
                return parsed.success && approvedRule(parsed.data, new Date().toISOString()) ? parsed.data as PolicyRevision : null;
              },
              async policies(academicSession, category) { check(); return await connection.db!.collection('policy_revisions').find({ session: academicSession, category }, { session, projection: { _id: 0 } }).toArray() as unknown as PolicyRevision[]; },
              async get(actor, id) { check(); return read(actor, id, session); },
              async receipt(key) { check(); const row = await models.receipt.findOne({ key }).session(session).lean().exec(); return row?.data ?? null; },
              async remember(receipt) {
                check();
                try { await models.receipt.create([{ key: receipt.key, data: receipt }], { session }); }
                catch (error: any) { if (error.code === 11000 && error.keyPattern?.key === 1 && Object.keys(error.keyPattern).length === 1) throw new ReceiptCollision(); throw error; }
              },
              async insert(app) { check(); await models.application.create([{ ...projection(applicationSchema.parse(app) as Application), institutionName: app.institutionId, state: 'Synthetic', city: 'Synthetic', submittedAt: new Date(app.createdAt) }], { session }); },
              async save(app, expectedVersion) {
                check();
                if (app.version !== expectedVersion + 1) throw new CoreError('VERSION_CONFLICT', 'Case version must advance exactly once');
                const result = await models.application.updateOne({ 'caseData.id': app.id, 'caseData.version': expectedVersion, 'caseData.institutionId': app.institutionId, 'caseData.regionId': app.regionId }, { $set: projection(applicationSchema.parse(app) as Application) }, { session, runValidators: true });
                if (result.modifiedCount !== 1) throw new CoreError('VERSION_CONFLICT', 'Stale case version');
              },
              async audit(event) { check(); await models.audit.create([{ id: event.id, data: auditSchema.parse(event) }], { session }); },
              async outbox(event) { check(); await models.outbox.create([{ eventId: event.eventId, data: outboxSchema.parse(event) }], { session }); },
              context(context, application) {
                check();
                context = structuredClone(context); application = structuredClone(application);
                const fail = async () => { check(); throw new CoreError('PRECONDITION_FAILED', 'Domain transaction repository not integrated'); };
                const sameCase = (id: string | undefined) => { check(); if (id !== application.id) throw new CoreError('SCOPE_VIOLATION', 'Participant record outside case'); };
                const sameActor = (record: { actorId: string; requestId: string }) => { if (record.actorId !== context.actor.id || record.requestId !== context.requestId) throw new CoreError('SCOPE_VIOLATION', 'Invalid participant attribution'); };
                const appendEvent = async (event: import('../../shared/contracts').Outbox) => {
                  sameCase(event.event.applicationId); sameCase(event.event.payload.caseId); sameActor(event.event);
                  if (event.eventId !== event.event.id || event.status !== 'pending' || event.attempts !== 0) throw new CoreError('PRECONDITION_FAILED', 'Invalid initial outbox record');
                  await unit.outbox(event);
                };
                const participants = options.participants?.(session!) ?? {};
                return { context: structuredClone(context), actor: structuredClone(context.actor), application: structuredClone(application), mode: 'database', transactionId: randomUUID(), repositories: {
                  ...participants,
                  cases: { save: app => { sameCase(app.id); if (app.institutionId !== application.institutionId || app.regionId !== application.regionId || !inScope(context.actor, app)) throw new CoreError('SCOPE_VIOLATION', 'Invalid participant case'); return unit.save(app, application.version); } },
                  audit: { append: async e => { sameCase(e.applicationId); sameActor(e); await unit.audit(e); } }, outbox: { append: appendEvent },
                  decisions: { insert: async d => { sameCase(d.applicationId); if (d.actorId !== context.actor.id) throw new CoreError('SCOPE_VIOLATION', 'Invalid decision actor'); const parsed = decisionSchema.parse(d); if (participants.decisions) await participants.decisions.insert(parsed); else if (models.decision) await models.decision.create([{ id: parsed.id, data: parsed }], { session }); else return fail(); } },
                  obligations: { insert: async o => { sameCase(o.applicationId); if (o.institutionId !== application.institutionId) throw new CoreError('SCOPE_VIOLATION', 'Invalid obligation institution'); if (!participants.obligations) return fail(); await participants.obligations.insert(o); } },
                  scrutiny: { insert: async s => { sameCase(s.applicationId); if (!participants.scrutiny) return fail(); await participants.scrutiny.insert(s); } },
                  evc: { save: async e => { sameCase(e.applicationId); if (!participants.evc) return fail(); await participants.evc.save(e); } },
                }, emit: async event => { await appendEvent({ eventId: event.id, event, attempts: 0, status: 'pending' }); } };
              },
            };
            try { return await work(unit); } finally { active = false; }
          }, { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' }, readPreference: 'primary', maxCommitTimeMS: 5000 });
          return result as T;
        } catch (error: any) {
          if (error instanceof CoreError || error instanceof SecurityError) throw error;
          if (error instanceof ReceiptCollision && attempt < 2) continue;
          if (error.code === 11000) throw new CoreError('PRECONDITION_FAILED', 'Unique identifier conflict');
          throw unavailable();
        } finally {
          // Cleanup cannot turn an acknowledged commit into a failed command or mask its error.
          try { await session?.endSession(); } catch { /* Driver cleanup failure; no command replay here. */ }
        }
      }
      throw unavailable();
    },
  };
  return storage;
}
