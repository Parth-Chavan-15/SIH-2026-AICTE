import mongoose from 'mongoose';
import { getCanonicalSeedState } from '../data/seedCanonicalCases';
import { REQUIRED_INDEXES, deriveRouteType } from './mongoCore';
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

export const AUTHORIZED_LOCAL_DEV_DB = 'niyamsetu_dev';
export const DEFAULT_LOCAL_DEV_URI = 'mongodb://127.0.0.1:27017/niyamsetu_dev';

export function parseAndValidateMongoTarget(uri: string, isProduction: boolean): { valid: boolean; dbName: string; error?: string } {
  try {
    const parsed = new URL(uri);
    const dbName = parsed.pathname.replace(/^\//, '').split('?')[0];
    const isLocal = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';

    if (isProduction) {
      if (isLocal) {
        return { valid: false, dbName, error: 'PRODUCTION_SAFETY_VIOLATION: Production environment cannot use localhost MongoDB URI.' };
      }
      if (!dbName) {
        return { valid: false, dbName, error: 'PRODUCTION_SAFETY_VIOLATION: Production MongoDB URI must explicitly specify target database.' };
      }
      return { valid: true, dbName };
    } else {
      // Non-production (development / test)
      // The authorized local database is strictly 'niyamsetu_dev'
      if (dbName === 'niyamsetu' || dbName === '') {
        return { valid: false, dbName, error: `LOCAL_DB_SAFETY: Target database '${dbName || 'unspecified'}' is rejected. The only authorized local development database is 'niyamsetu_dev'. Connecting to default 'niyamsetu' is strictly prohibited.` };
      }
      return { valid: true, dbName };
    }
  } catch (err: any) {
    return { valid: false, dbName: '', error: `INVALID_MONGODB_URI: ${err.message}` };
  }
}

export async function initMongoDatabase(uri?: string): Promise<MongoInitResult> {
  const isProduction = process.env.NODE_ENV === 'production';

  // In production, MONGODB_URI must be explicitly configured; never inherit local development fallback
  if (isProduction && !uri && !process.env.MONGODB_URI) {
    return { connected: false, reason: 'PRODUCTION_CONFIG_ERROR: Production environment requires an explicitly configured MONGODB_URI.' };
  }

  const targetUri = uri || process.env.MONGODB_URI || DEFAULT_LOCAL_DEV_URI;

  // Pre-connection safety validation
  const validation = parseAndValidateMongoTarget(targetUri, isProduction);
  if (!validation.valid) {
    console.warn(`[DB SAFETY GUARD] Connection rejected: ${validation.error}`);
    return { connected: false, reason: validation.error };
  }

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

    // Post-connection verification: ensure actual connected database name matches authorized target
    const actualDbName = mongoose.connection.name || db.databaseName;
    if (!isProduction && actualDbName !== AUTHORIZED_LOCAL_DEV_DB && actualDbName !== validation.dbName) {
      await mongoose.disconnect();
      return { connected: false, reason: `LOCAL_DB_SAFETY: Actual connected database '${actualDbName}' does not match authorized target '${AUTHORIZED_LOCAL_DEV_DB}'. Connection terminated.` };
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
        routeType: deriveRouteType(c as any),
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
        const routeType = deriveRouteType(c as any);

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
