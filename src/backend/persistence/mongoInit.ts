import mongoose from 'mongoose';
import { getCanonicalSeedState } from '../data/seedCanonicalCases';
import { REQUIRED_INDEXES } from './mongoCore';
import ApplicationModel from '../models/Application.js';
import { CoreAudit, CoreOutbox, CoreReceipt, CoreDecision } from './records';
import { APPROVED_2026_POLICIES } from '../policy/candidates';
import { syncComplianceFromMongo } from '../modules/compliance/complianceService';
import { syncDecisionDocumentsFromMongo } from '../modules/decisionDocuments/decisionDocumentsService';
import { syncAppealsAndHearingsFromMongo } from '../modules/appealsAndHearings/appealsAndHearingsService';
import { syncEVCTasksFromMongo } from '../modules/evc/evcService';

export interface MongoInitResult {
  connected: boolean;
  dbName?: string;
  collectionsSeeded?: number;
  reason?: string;
}

export async function initMongoDatabase(uri?: string): Promise<MongoInitResult> {
  const targetUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/niyamsetu';

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(targetUri, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 2000,
        bufferCommands: false,
        autoIndex: false,
        autoCreate: false,
      });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return { connected: false, reason: 'Database instance not available' };
    }

    // 1. Ensure required collections exist
    const existingCollections = await db.listCollections().toArray();
    const existingNames = new Set(existingCollections.map((c) => c.name));

    const requiredCollections = [
      'applications',
      'institutions',
      'policy_revisions',
      'core_audit',
      'core_outbox',
      'core_receipts',
      'core_decisions',
      'compliance_obligations',
      'compliance_documents',
      'decision_documents',
      'appeals_hearings',
      'chapter_vii_complaints',
      'evc_tasks'
    ];

    for (const name of requiredCollections) {
      if (!existingNames.has(name)) {
        try {
          await db.createCollection(name);
        } catch {
          // Collection may have been created concurrently
        }
      }
    }

    // 2. Ensure required indexes exist
    for (const [coll, key, sparse] of REQUIRED_INDEXES) {
      try {
        const collection = db.collection(coll);
        const existingIdxs = await collection.listIndexes().toArray();
        const hasIdx = existingIdxs.some((idx) => idx.key && idx.key[key] === 1);
        if (!hasIdx) {
          await collection.createIndex({ [key]: 1 }, { unique: true, sparse, name: `${coll}_${key}_idx` });
        }
      } catch {
        // Non-blocking index creation
      }
    }

    const companionIndexes = [
      ['compliance_obligations', 'id'],
      ['compliance_documents', 'id'],
      ['decision_documents', 'docId'],
      ['appeals_hearings', 'id'],
      ['chapter_vii_complaints', 'complaintId'],
      ['evc_tasks', 'id']
    ] as const;

    for (const [coll, key] of companionIndexes) {
      try {
        const collection = db.collection(coll);
        const existingIdxs = await collection.listIndexes().toArray();
        const hasIdx = existingIdxs.some((idx) => idx.key && idx.key[key] === 1);
        if (!hasIdx) {
          await collection.createIndex({ [key]: 1 }, { unique: true, name: `${coll}_${key}_idx` });
        }
      } catch {
        // Non-blocking index creation
      }
    }

    // 3. Seed canonical data if applications collection is empty
    const appCount = await db.collection('applications').countDocuments();
    let seededCount = 0;

    if (appCount === 0) {
      const canonicalState = getCanonicalSeedState();
      const cases = canonicalState.cases || [];
      const institutions = canonicalState.institutions || [];
      const audits = canonicalState.audit || [];

      // Seed Applications
      const appDocs = cases.map((c) => ({
        caseData: c,
        applicationNumber: c.reference,
        institutionName: c.facts?.institutionName || c.institutionId,
        institutionCode: c.institutionId,
        region: c.regionId,
        state: 'Maharashtra',
        city: 'Pune',
        applicationType: c.category,
        academicYear: c.session,
        program: String(c.facts?.program || 'Engineering & Technology'),
        proposedIntake: Number(c.facts?.proposedIntake || 180),
        routeType: c.id.includes('BATU') || c.category === 'restoration_or_shifting' ? 'Only EVC'
          : c.id.includes('APEX') || c.category === 'deficiency_appeal' ? 'Scrutiny + EVC + SAC/SHC'
          : c.id.includes('PDIMTR') || c.category === 'extension_of_approval' ? 'Fast-Track EoA'
          : c.route.stages.includes('evc_pending') ? 'Scrutiny + EVC'
          : 'Scrutiny Only',
        currentStage: c.state === 'submitted' ? 'Application Submitted'
          : c.state === 'scrutiny_pending' ? 'Scrutiny in Progress'
          : c.state === 'rescrutiny_pending' ? 'Deficiency Communicated'
          : c.state === 'evc_pending' ? 'EVC Scheduled'
          : c.state === 'decision_pending' ? 'Executive Committee Approval'
          : c.state === 'conditionally_approved' ? 'Approval Issued'
          : 'Application Submitted',
        currentStageStartedAt: new Date(c.stageEnteredAt),
        submittedAt: new Date(c.createdAt),
        stageDeadlineDays: 10,
        slaStatus: 'within_sla',
        priority: 'High',
        documents: [],
        observations: [],
        timeline: [],
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt)
      }));

      if (appDocs.length > 0) {
        await db.collection('applications').insertMany(appDocs as any);
      }

      // Seed Institutions
      if (institutions.length > 0) {
        await db.collection('institutions').insertMany(institutions as any);
      }

      // Seed Policies
      const policies = APPROVED_2026_POLICIES.length > 0 ? APPROVED_2026_POLICIES : (canonicalState.policies || []);
      if (policies.length > 0) {
        await db.collection('policy_revisions').insertMany(policies as any);
      }

      // Seed Audit Events
      if (audits.length > 0) {
        const auditDocs = audits.map((a) => ({ id: a.id, data: a }));
        await db.collection('core_audit').insertMany(auditDocs as any);
      }

      seededCount = appDocs.length;
    } else {
      // Sync canonical cases to ensure all 5 statutory route cases are present with accurate routeType
      const canonicalState = getCanonicalSeedState();
      for (const c of (canonicalState.cases || [])) {
        const routeType = c.id.includes('BATU') || c.category === 'restoration_or_shifting' ? 'Only EVC'
          : c.id.includes('APEX') || c.category === 'deficiency_appeal' ? 'Scrutiny + EVC + SAC/SHC'
          : c.id.includes('PDIMTR') || c.category === 'extension_of_approval' ? 'Fast-Track EoA'
          : c.route.stages.includes('evc_pending') ? 'Scrutiny + EVC'
          : 'Scrutiny Only';

        await db.collection('applications').updateOne(
          { 'caseData.id': c.id },
          {
            $set: {
              caseData: c,
              applicationNumber: c.reference,
              institutionName: c.facts?.institutionName || c.institutionId,
              institutionCode: c.institutionId,
              region: c.regionId,
              routeType,
              academicYear: c.session,
              applicationType: c.category
            }
          },
          { upsert: true }
        );
      }
      for (const inst of (canonicalState.institutions || [])) {
        await db.collection('institutions').updateOne(
          { id: inst.id },
          { $set: inst },
          { upsert: true }
        );
      }
    }

    // 4. Synchronize companion in-memory caches with durable MongoDB state
    await syncComplianceFromMongo();
    await syncDecisionDocumentsFromMongo();
    await syncAppealsAndHearingsFromMongo();
    await syncEVCTasksFromMongo();

    return {
      connected: true,
      dbName: mongoose.connection.name || 'niyamsetu',
      collectionsSeeded: seededCount
    };
  } catch (err: any) {
    return {
      connected: false,
      reason: err.message || 'MongoDB connection failed'
    };
  }
}
