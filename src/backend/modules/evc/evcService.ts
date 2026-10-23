import type {
  ApiResult,
  Application,
  EVCReportCommand,
  EVCTask,
  EventEnvelope,
  ID
} from '../scrutiny/contracts';
import type { CorePort } from '../scrutiny/ports';
import { evcEligible } from './evcEligible';
import { assertScrutinyComplete, getLatestSnapshot } from '../scrutiny/scrutinyService';
import { eventBus } from '../events/eventBus';

// In-memory store for EVC tasks
const evcTasks = new Map<ID, EVCTask>();
const idempotencyStore = new Map<string, ApiResult<any>>();

export function getTasksForCase(applicationId: ID): EVCTask[] {
  return Array.from(evcTasks.values()).filter(t => t.applicationId === applicationId);
}

export function getAllTasks(): EVCTask[] {
  return Array.from(evcTasks.values());
}

export function clearEVCTasks(): void {
  evcTasks.clear();
  idempotencyStore.clear();
}

/**
 * Creates an EVC task for an eligible application.
 * Returns error if route does not include evc_pending or active task already exists.
 */
export async function createEVCTask(
  corePort: CorePort,
  applicationId: ID
): Promise<ApiResult<EVCTask>> {
  let application: Application;
  try {
    application = await corePort.getApplication(applicationId);
  } catch {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: `Application ${applicationId} not found` }
    };
  }

  const route = await corePort.getRouteExplanation(applicationId);
  const existingTasks = getTasksForCase(applicationId);
  const latestSnapshot = getLatestSnapshot(applicationId);

  // Prerequisites check: either scrutiny signed with no deficiencies, or application stage passed scrutiny
  const scrutinyDone = assertScrutinyComplete(applicationId) || 
    application.state === 'evc_pending' || 
    (latestSnapshot !== undefined && latestSnapshot.deficiencyItemIds.length === 0);

  const eligibility = evcEligible(
    route,
    { scrutinyComplete: scrutinyDone, snapshotId: latestSnapshot?.id },
    existingTasks
  );

  if (!eligibility.eligible) {
    return {
      success: false,
      error: {
        code: 'PRECONDITION_FAILED',
        message: eligibility.reason,
        failedRule: 'CONDITIONAL_EVC_ELIGIBILITY_GATE',
        currentVersion: application.version
      }
    };
  }

  const taskId = `EVC-TASK-${applicationId}-${Date.now()}`;
  const newTask: EVCTask = {
    id: taskId,
    applicationId,
    prerequisiteEventId: latestSnapshot ? `EVT-SCRUTINY-${latestSnapshot.id}` : 'EVT-STAGE-EVC',
    policyRevisionId: route.policyRevisionId,
    assigneeIds: ['SYNTHETIC-EVC-EXPERT-1', 'SYNTHETIC-EVC-EXPERT-2'],
    version: 1,
    status: 'pending'
  };

  evcTasks.set(newTask.id, newTask);

  const event: EventEnvelope<'EVCTaskCreated'> = {
    id: `EVT-EVC-CREATED-${Date.now()}`,
    type: 'EVCTaskCreated',
    occurredAt: new Date().toISOString(),
    actorId: (await corePort.getActor()).id,
    applicationId,
    caseVersion: application.version,
    payload: {
      caseId: applicationId,
      evcTaskId: newTask.id
    }
  };
  eventBus.emit(event);

  return {
    success: true,
    data: newTask,
    eventId: event.id
  };
}

/**
 * Schedule an existing EVC task. Rejects if already scheduled or version conflict.
 */
export async function scheduleEVC(
  taskId: ID,
  at: string,
  expectedVersion: number,
  idempotencyKey: string
): Promise<ApiResult<EVCTask>> {
  if (idempotencyStore.has(idempotencyKey)) {
    return idempotencyStore.get(idempotencyKey)!;
  }

  const task = evcTasks.get(taskId);
  if (!task) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: `EVC task ${taskId} not found` }
    };
  }

  if (task.version !== expectedVersion) {
    return {
      success: false,
      error: {
        code: 'VERSION_CONFLICT',
        message: `Version conflict on EVC task: expected ${expectedVersion}, got ${task.version}`,
        currentVersion: task.version
      }
    };
  }

  if (task.status === 'scheduled') {
    return {
      success: false,
      error: {
        code: 'PRECONDITION_FAILED',
        message: 'EVC task has already been scheduled',
        failedRule: 'EVC_DUPLICATE_SCHEDULE_FORBIDDEN',
        currentVersion: task.version
      }
    };
  }

  if (task.status !== 'pending') {
    return {
      success: false,
      error: {
        code: 'PRECONDITION_FAILED',
        message: `Cannot schedule task with status ${task.status}`,
        currentVersion: task.version
      }
    };
  }

  const updatedTask: EVCTask = {
    ...task,
    scheduledAt: at,
    status: 'scheduled',
    version: task.version + 1
  };
  evcTasks.set(taskId, updatedTask);

  const event: EventEnvelope<'EVCScheduled'> = {
    id: `EVT-EVC-SCHEDULED-${Date.now()}`,
    type: 'EVCScheduled',
    occurredAt: new Date().toISOString(),
    actorId: 'SYNTHETIC-EVC-COORDINATOR',
    applicationId: task.applicationId,
    causationId: idempotencyKey,
    payload: {
      caseId: task.applicationId,
      evcTaskId: task.id
    }
  };
  eventBus.emit(event);

  const result: ApiResult<EVCTask> = {
    success: true,
    data: updatedTask,
    eventId: event.id
  };
  idempotencyStore.set(idempotencyKey, result);
  return result;
}

/**
 * Submit EVC Report.
 * CRITICAL RULE: Does NOT auto-approve case. Case advances to decision_pending only.
 */
export async function submitEVCReport(
  taskId: ID,
  command: EVCReportCommand,
  corePort?: CorePort
): Promise<ApiResult<EVCTask>> {
  if (idempotencyStore.has(command.idempotencyKey)) {
    return idempotencyStore.get(command.idempotencyKey)!;
  }

  const task = evcTasks.get(taskId);
  if (!task) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: `EVC task ${taskId} not found` }
    };
  }

  if (task.version !== command.expectedVersion) {
    return {
      success: false,
      error: {
        code: 'VERSION_CONFLICT',
        message: `Version conflict: expected ${command.expectedVersion}, got ${task.version}`,
        currentVersion: task.version
      }
    };
  }

  if (task.status === 'completed') {
    return {
      success: false,
      error: {
        code: 'PRECONDITION_FAILED',
        message: 'EVC report has already been submitted for this task',
        currentVersion: task.version
      }
    };
  }

  const reportDocId = `DOC-EVC-REPORT-${Date.now()}`;
  const updatedTask: EVCTask = {
    ...task,
    status: 'completed',
    reportVersionId: reportDocId,
    version: task.version + 1
  };
  evcTasks.set(taskId, updatedTask);

  // If corePort is provided, transition case state from evc_pending to decision_pending
  if (corePort) {
    try {
      await corePort.withCaseTransaction(task.applicationId, async (tx) => {
        const updatedCase: Application = {
          ...tx.application,
          state: 'decision_pending',
          version: tx.application.version + 1,
          updatedAt: new Date().toISOString()
        };
        await tx.saveCase(updatedCase);
      });
    } catch {
      // In standalone mode, proceed with task update
    }
  }

  const event: EventEnvelope<'EVCReportSubmitted'> = {
    id: `EVT-EVC-REPORT-${Date.now()}`,
    type: 'EVCReportSubmitted',
    occurredAt: new Date().toISOString(),
    actorId: 'SYNTHETIC-EVC-CHAIR',
    applicationId: task.applicationId,
    causationId: command.idempotencyKey,
    payload: {
      caseId: task.applicationId,
      evcTaskId: task.id
    }
  };
  eventBus.emit(event);

  const result: ApiResult<EVCTask> = {
    success: true,
    data: updatedTask,
    eventId: event.id
  };
  idempotencyStore.set(command.idempotencyKey, result);
  return result;
}

/**
 * Export for M1 consumer: ensure EVC task exists if route requires it.
 */
export async function ensureEligibleEvcTask(
  corePort: CorePort,
  applicationId: ID
): Promise<ApiResult<EVCTask>> {
  return createEVCTask(corePort, applicationId);
}
