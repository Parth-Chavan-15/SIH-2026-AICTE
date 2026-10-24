import type {
  ApiResult,
  Application,
  CommandResult,
  CorrectionCommand,
  EventEnvelope,
  ID,
  RescrutinyCommand,
  ScrutinyItem,
  ScrutinySnapshot,
  SignScrutinyCommand
} from './contracts';
import type { CorePort, TransactionContext } from './ports';
import { validateCorrections } from './validateCorrections';
import { eventBus } from '../events/eventBus';

// In-memory store for snapshots with SYNTHETIC fixtures
const snapshotsById = new Map<ID, ScrutinySnapshot>();
const snapshotsByCaseId = new Map<ID, ScrutinySnapshot[]>();
const idempotencyStore = new Map<string, ApiResult<any>>();

// Seed with fixture from cases.json: SYN-NONACC-02 round 1 with D1, D2 deficient and C3 accepted
const initialFixtureSnapshot: ScrutinySnapshot = {
  id: 'SNAP-SYN-NONACC-02-R1',
  applicationId: 'SYN-NONACC-02',
  round: 1,
  checklistVersion: 'v2026.1',
  items: [
    { itemId: 'D1', result: 'deficient', reason: 'Land conversion document missing', evidenceVersionIds: ['DOC-SYN-01'] },
    { itemId: 'D2', result: 'deficient', reason: 'Cadre ratio discrepancy in Computer Science', evidenceVersionIds: ['DOC-SYN-02'] },
    { itemId: 'C3', result: 'accepted', reason: 'Approved building safety certificate verified', evidenceVersionIds: ['DOC-SYN-03'] }
  ],
  deficiencyItemIds: ['D1', 'D2'],
  signedBy: 'SYNTHETIC-REVIEWER-1',
  signedAt: '2026-10-23T06:00:00.000Z'
};
snapshotsById.set(initialFixtureSnapshot.id, initialFixtureSnapshot);
snapshotsByCaseId.set(initialFixtureSnapshot.applicationId, [initialFixtureSnapshot]);

const giitsFixtureSnapshot: ScrutinySnapshot = {
  id: '2-SOC1770029225',
  applicationId: 'APP-2026-GIITS',
  round: 1,
  checklistVersion: 'v2026.1',
  items: [
    { itemId: 'C3', result: 'accepted', reason: '30-year registered land conversion & clear title deed verified by Scrutiny Committee', evidenceVersionIds: ['DOC-GIITS-C3'] },
    { itemId: 'C4', result: 'accepted', reason: 'Municipal approved structural stability & occupancy certificate verified', evidenceVersionIds: ['DOC-GIITS-C4'] },
    { itemId: 'D1', result: 'deficient', reason: 'Cadre ratio deficit: Professor shortfall in CSE/IT (2 required, 0 available)', evidenceVersionIds: ['DOC-GIITS-D1'] },
    { itemId: 'D2', result: 'deficient', reason: 'Fire Safety NOC expires in 14 days (<60-day renewal submission threshold)', evidenceVersionIds: ['DOC-GIITS-D2'] }
  ],
  deficiencyItemIds: ['D1', 'D2'],
  signedBy: 'SYN-ACTOR-RO',
  signedAt: '2026-10-23T14:30:00.000Z'
};
snapshotsById.set(giitsFixtureSnapshot.id, giitsFixtureSnapshot);
snapshotsByCaseId.set(giitsFixtureSnapshot.applicationId, [giitsFixtureSnapshot]);
snapshotsByCaseId.set(initialFixtureSnapshot.applicationId, [initialFixtureSnapshot]);

export function getOrCreateSnapshotForApplication(
  applicationId: ID,
  customDocuments?: Array<{ id?: string; name?: string; status?: string; category?: string }>
): ScrutinySnapshot {
  let list = snapshotsByCaseId.get(applicationId);
  if (!list || list.length === 0) {
    const d1Title = customDocuments?.[0]?.name || 'Land Conversion & Mutation Certificate';
    const d2Title = customDocuments?.[1]?.name || 'Faculty Cadre Ratio & Form 16 Verification';
    const c3Title = customDocuments?.[2]?.name || 'Approved Building Safety & Occupancy Certificate';

    const autoSnapshot: ScrutinySnapshot = {
      id: `SNAP-${applicationId}-R1`,
      applicationId: applicationId,
      round: 1,
      checklistVersion: 'v2026.1',
      items: [
        { itemId: 'D1', result: 'deficient', reason: `${d1Title}: Deficient - Missing tehsildar verification stamp`, evidenceVersionIds: ['DOC-01'] },
        { itemId: 'D2', result: 'deficient', reason: `${d2Title}: Deficient - Cadre ratio non-compliant (1:24 vs 1:15 required)`, evidenceVersionIds: ['DOC-02'] },
        { itemId: 'C3', result: 'accepted', reason: `${c3Title}: Accepted - Certified compliant by municipal planner`, evidenceVersionIds: ['DOC-03'] }
      ],
      deficiencyItemIds: ['D1', 'D2'],
      signedBy: 'REGIONAL-SCRUTINY-OFFICER-1',
      signedAt: new Date().toISOString()
    };
    snapshotsById.set(autoSnapshot.id, autoSnapshot);
    list = [autoSnapshot];
    snapshotsByCaseId.set(applicationId, list);
  }
  return list[list.length - 1];
}

export function getSnapshots(applicationId: ID): ScrutinySnapshot[] {
  getOrCreateSnapshotForApplication(applicationId);
  return snapshotsByCaseId.get(applicationId) || [];
}

export function getLatestSnapshot(applicationId: ID): ScrutinySnapshot | undefined {
  return getOrCreateSnapshotForApplication(applicationId);
}

export function assertScrutinyComplete(applicationId: ID): boolean {
  const latest = getLatestSnapshot(applicationId);
  if (!latest) return false;
  // Complete if there are items and zero outstanding deficiencies
  return latest.items.length > 0 && latest.deficiencyItemIds.length === 0;
}

/**
 * Sign scrutiny checklist within an existing TransactionContext.
 */
export async function signSnapshot(
  tx: TransactionContext,
  command: SignScrutinyCommand
): Promise<ScrutinySnapshot> {
  const deficiencyItemIds = command.items
    .filter(item => item.result === 'deficient')
    .map(item => item.itemId);

  const existingSnapshots = snapshotsByCaseId.get(tx.application.id) || [];
  const nextRound = existingSnapshots.length + 1;
  const snapshotId = `SNAP-${tx.application.id}-R${nextRound}-${Date.now()}`;

  const snapshot: ScrutinySnapshot = {
    id: snapshotId,
    applicationId: tx.application.id,
    round: nextRound,
    checklistVersion: command.checklistVersion,
    items: command.items,
    deficiencyItemIds,
    signedBy: tx.actor.id,
    signedAt: new Date().toISOString()
  };

  snapshotsById.set(snapshot.id, snapshot);
  existingSnapshots.push(snapshot);
  snapshotsByCaseId.set(tx.application.id, existingSnapshots);

  // Update application state
  const updatedCase: Application = {
    ...tx.application,
    state: deficiencyItemIds.length > 0 ? 'correction_required' : 'decision_pending',
    version: tx.application.version + 1,
    updatedAt: new Date().toISOString()
  };
  await tx.saveCase(updatedCase);

  const event: EventEnvelope<'ScrutinySigned'> = {
    id: `EVT-SCRUTINY-${Date.now()}`,
    type: 'ScrutinySigned',
    occurredAt: new Date().toISOString(),
    actorId: tx.actor.id,
    applicationId: tx.application.id,
    caseVersion: updatedCase.version,
    causationId: command.idempotencyKey,
    payload: {
      caseId: tx.application.id,
      snapshotId: snapshot.id
    }
  };
  tx.emit(event);
  eventBus.emit(event);

  return snapshot;
}

/**
 * Applies scoped corrections within a TransactionContext.
 * Rejects non-deficiency items immediately.
 */
export async function applyScopedCorrections(
  tx: TransactionContext,
  command: CorrectionCommand
): Promise<CommandResult> {
  const snapshot = snapshotsById.get(command.snapshotId);
  if (!snapshot) {
    throw new Error('NOT_FOUND: Scrutiny snapshot not found');
  }

  const validation = validateCorrections(snapshot, command.changes);
  if (!validation.valid) {
    const error = new Error('SCOPE_VIOLATION');
    (error as any).failedRule = 'RESCRUTINY_SCOPE_ONLY_SIGNED_DEFICIENCIES';
    (error as any).validation = validation;
    throw error;
  }

  // Real-time domain state update: update snapshot item and remove from deficiency set
  for (const change of command.changes) {
    const targetItem = snapshot.items.find(i => i.itemId === change.itemId);
    if (targetItem) {
      targetItem.reason = `Rectification Submitted: ${change.response}`;
      snapshot.deficiencyItemIds = snapshot.deficiencyItemIds.filter(id => id !== change.itemId);
    }
  }

  const updatedCase: Application = {
    ...tx.application,
    state: 'rescrutiny_pending',
    version: tx.application.version + 1,
    updatedAt: new Date().toISOString()
  };
  await tx.saveCase(updatedCase);

  const event: EventEnvelope<'CorrectionSubmitted'> = {
    id: `EVT-CORRECTION-${Date.now()}`,
    type: 'CorrectionSubmitted',
    occurredAt: new Date().toISOString(),
    actorId: tx.actor.id,
    applicationId: tx.application.id,
    caseVersion: updatedCase.version,
    causationId: command.idempotencyKey,
    payload: {
      caseId: tx.application.id,
      snapshotId: snapshot.id
    }
  };
  tx.emit(event);
  eventBus.emit(event);

  return { application: updatedCase, eventId: event.id };
}

/**
 * Service action: Sign Scrutiny Checklist
 */
export async function signScrutiny(
  corePort: CorePort,
  applicationId: ID,
  command: SignScrutinyCommand
): Promise<ApiResult<ScrutinySnapshot>> {
  if (idempotencyStore.has(command.idempotencyKey)) {
    return idempotencyStore.get(command.idempotencyKey)!;
  }

  try {
    const actor = await corePort.getActor();
    const hasPermission = actor.permissions.includes('scrutiny.sign') || actor.roles.includes('reviewer');
    if (!hasPermission) {
      return {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Actor lacks scrutiny.sign authorization' }
      };
    }

    const application = await corePort.getApplication(applicationId);
    if (application.version !== command.expectedVersion) {
      return {
        success: false,
        error: {
          code: 'VERSION_CONFLICT',
          message: `Expected version ${command.expectedVersion} does not match current version ${application.version}`,
          currentVersion: application.version
        }
      };
    }

    let resultSnapshot: ScrutinySnapshot | undefined;
    let eventId: string | undefined;

    await corePort.withCaseTransaction(applicationId, async (tx) => {
      resultSnapshot = await signSnapshot(tx, command);
      eventId = `EVT-SCRUTINY-${Date.now()}`;
    });

    const result: ApiResult<ScrutinySnapshot> = {
      success: true,
      data: resultSnapshot!,
      eventId
    };
    idempotencyStore.set(command.idempotencyKey, result);
    return result;
  } catch (err: any) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: err.message || 'Operation failed' }
    };
  }
}

/**
 * Service action: Submit Corrections against a signed ScrutinySnapshot.
 * Enforces strict SCOPE_VIOLATION / PRECONDITION_FAILED on C3 or other non-deficiency items.
 */
export async function submitCorrection(
  corePort: CorePort,
  applicationId: ID,
  command: CorrectionCommand
): Promise<ApiResult<CommandResult>> {
  if (idempotencyStore.has(command.idempotencyKey)) {
    return idempotencyStore.get(command.idempotencyKey)!;
  }

  let application: Application;
  try {
    application = await corePort.getApplication(applicationId);
  } catch {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: `Application ${applicationId} not found` }
    };
  }

  if (application.version !== command.expectedVersion) {
    return {
      success: false,
      error: {
        code: 'VERSION_CONFLICT',
        message: `Version conflict: expected ${command.expectedVersion}, actual ${application.version}`,
        currentVersion: application.version
      }
    };
  }

  const snapshot = snapshotsById.get(command.snapshotId);
  if (!snapshot) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: `Snapshot ${command.snapshotId} not found` }
    };
  }

  // Pure validation check
  const validation = validateCorrections(snapshot, command.changes);
  if (!validation.valid) {
    // Audit log the denied attempt without changing domain state
    const deniedEvent: EventEnvelope<'CommandDenied'> = {
      id: `EVT-DENIED-${Date.now()}`,
      type: 'CommandDenied',
      occurredAt: new Date().toISOString(),
      actorId: (await corePort.getActor()).id,
      applicationId,
      caseVersion: application.version,
      causationId: command.idempotencyKey,
      payload: {
        caseId: applicationId,
        code: 'PRECONDITION_FAILED',
        attemptedAction: 'submit_corrections_scope_violation'
      }
    };
    eventBus.emit(deniedEvent);

    return {
      success: false,
      error: {
        code: 'PRECONDITION_FAILED',
        message: 'Only item IDs in the signed deficiency set can be corrected.',
        failedRule: 'RESCRUTINY_SCOPE_ONLY_SIGNED_DEFICIENCIES',
        currentVersion: application.version
      }
    };
  }

  try {
    let commandResult: CommandResult | undefined;
    await corePort.withCaseTransaction(applicationId, async (tx) => {
      commandResult = await applyScopedCorrections(tx, command);
    });

    const result: ApiResult<CommandResult> = {
      success: true,
      data: commandResult!,
      eventId: commandResult?.eventId
    };
    idempotencyStore.set(command.idempotencyKey, result);
    return result;
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: 'PRECONDITION_FAILED',
        message: err.message || 'Correction failed',
        currentVersion: application.version
      }
    };
  }
}

/**
 * Service action: Rescrutinize. Reviewer re-evaluates ONLY previously deficient items.
 * Out-of-scope items return 403 SCOPE_VIOLATION without mutating state.
 */
export async function rescrutinize(
  corePort: CorePort,
  applicationId: ID,
  command: RescrutinyCommand
): Promise<ApiResult<CommandResult>> {
  if (idempotencyStore.has(command.idempotencyKey)) {
    return idempotencyStore.get(command.idempotencyKey)!;
  }

  const actor = await corePort.getActor();
  const hasPermission = actor.permissions.includes('scrutiny.sign') || actor.roles.includes('reviewer');
  if (!hasPermission) {
    return {
      success: false,
      error: { code: 'FORBIDDEN', message: 'Actor lacks re-scrutiny authorization' }
    };
  }

  let application: Application;
  try {
    application = await corePort.getApplication(applicationId);
  } catch {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: `Application ${applicationId} not found` }
    };
  }

  if (application.version !== command.expectedVersion) {
    return {
      success: false,
      error: {
        code: 'VERSION_CONFLICT',
        message: `Version conflict: expected ${command.expectedVersion}, actual ${application.version}`,
        currentVersion: application.version
      }
    };
  }

  const snapshot = snapshotsById.get(command.snapshotId);
  if (!snapshot) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: `Snapshot ${command.snapshotId} not found` }
    };
  }

  // Check that every outcome targets an item that was in deficiencyItemIds
  const deficiencySet = new Set(snapshot.deficiencyItemIds);
  for (const outcome of command.outcomes) {
    if (!deficiencySet.has(outcome.itemId)) {
      // Record explainable denial event without domain state mutation
      const deniedEvent: EventEnvelope<'CommandDenied'> = {
        id: `EVT-DENIED-${Date.now()}`,
        type: 'CommandDenied',
        occurredAt: new Date().toISOString(),
        actorId: actor.id,
        applicationId,
        caseVersion: application.version,
        causationId: command.idempotencyKey,
        payload: {
          caseId: applicationId,
          code: 'SCOPE_VIOLATION',
          attemptedAction: `rescrutinize_item_${outcome.itemId}`
        }
      };
      eventBus.emit(deniedEvent);

      return {
        success: false,
        error: {
          code: 'SCOPE_VIOLATION',
          message: `Item ${outcome.itemId} is not in the signed deficiency set and cannot be re-scrutinized`,
          failedRule: 'RESCRUTINY_SCOPE_ONLY_SIGNED_DEFICIENCIES',
          currentVersion: application.version
        }
      };
    }
  }

  let cmdResult: CommandResult | undefined;
  await corePort.withCaseTransaction(applicationId, async (tx) => {
    // Recompute remaining deficiencies
    const remainingDeficiencies = command.outcomes
      .filter(o => o.result === 'deficient')
      .map(o => o.itemId);

    const route = await corePort.getRouteExplanation(applicationId);
    let nextState = tx.application.state;
    if (remainingDeficiencies.length > 0) {
      nextState = 'correction_required';
    } else {
      nextState = route.stages.includes('evc_pending') ? 'evc_pending' : 'decision_pending';
    }

    const updatedCase: Application = {
      ...tx.application,
      state: nextState,
      version: tx.application.version + 1,
      updatedAt: new Date().toISOString()
    };
    await tx.saveCase(updatedCase);

    const event: EventEnvelope<'RescrutinyCompleted'> = {
      id: `EVT-RESCRUTINY-${Date.now()}`,
      type: 'RescrutinyCompleted',
      occurredAt: new Date().toISOString(),
      actorId: tx.actor.id,
      applicationId,
      caseVersion: updatedCase.version,
      causationId: command.idempotencyKey,
      payload: {
        caseId: applicationId,
        snapshotId: snapshot.id
      }
    };
    tx.emit(event);
    eventBus.emit(event);

    cmdResult = { application: updatedCase, eventId: event.id };
  });

  const result: ApiResult<CommandResult> = {
    success: true,
    data: cmdResult!,
    eventId: cmdResult?.eventId
  };
  idempotencyStore.set(command.idempotencyKey, result);
  return result;
}
