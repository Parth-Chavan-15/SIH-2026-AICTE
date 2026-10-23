import { useState, useEffect, useCallback } from 'react';
import type {
  EVCTask,
  EVCReportCommand,
  ApiResult,
  ApiError
} from '../../../backend/modules/scrutiny/contracts';
import {
  getAllTasks,
  getTasksForCase,
  createEVCTask as serviceCreateEVCTask,
  scheduleEVC as serviceScheduleEVC,
  submitEVCReport as serviceSubmitEVCReport
} from '../../../backend/modules/evc/evcService';
import { makeFakeCorePort, fakeCase, fakeExplanation } from '../../../backend/modules/scrutiny/mockCore';

/**
 * Custom React Hook for Conditional EVC (M2 USP B07).
 * Connects to live endpoints with synthetic in-memory fallback.
 */
export function useEVC(applicationId?: string) {
  const [tasks, setTasks] = useState<EVCTask[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [isSynthetic, setIsSynthetic] = useState<boolean>(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/evc/queue');
      if (res.ok) {
        const json: ApiResult<EVCTask[]> = await res.json();
        if (json.success) {
          const list = applicationId
            ? json.data.filter(t => t.applicationId === applicationId)
            : json.data;
          setTasks(list);
          setIsSynthetic(false);
          setLoading(false);
          return;
        }
      }
      throw new Error('Fallback to Synthetic EVC');
    } catch {
      // SYNTHETIC MOCK FALLBACK (Clearly Labeled)
      setIsSynthetic(true);
      const list = applicationId ? getTasksForCase(applicationId) : getAllTasks();
      setTasks(list);
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

function isErrorResult<T>(res: ApiResult<T>): res is { success: false; error: ApiError } {
  return !res.success || 'error' in res;
}

  const createTask = async (appId: string, expectedVersion: number = 1): Promise<ApiResult<EVCTask>> => {
    setLoading(true);
    setError(null);
    const command = {
      applicationId: appId,
      expectedVersion,
      idempotencyKey: `CREATE-EVC-${appId}-${Date.now()}`
    };

    try {
      const res = await fetch('/api/v1/evc/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command)
      });
      const data: ApiResult<EVCTask> = await res.json();
      if (isErrorResult(data)) {
        setError(data.error);
      } else {
        await fetchTasks();
      }
      setLoading(false);
      return data;
    } catch {
      const fakePort = makeFakeCorePort({ ...fakeCase, id: appId, version: expectedVersion }, fakeExplanation);
      const result = await serviceCreateEVCTask(fakePort, appId);
      if (isErrorResult(result)) {
        setError(result.error);
      } else {
        await fetchTasks();
      }
      setLoading(false);
      return result;
    }
  };

  const schedule = async (
    taskId: string,
    at: string,
    expectedVersion: number = 1
  ): Promise<ApiResult<EVCTask>> => {
    setLoading(true);
    setError(null);
    const command = {
      at,
      expectedVersion,
      idempotencyKey: `SCHED-${taskId}-${Date.now()}`
    };

    try {
      const res = await fetch(`/api/v1/evc/${encodeURIComponent(taskId)}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command)
      });
      const data: ApiResult<EVCTask> = await res.json();
      if (isErrorResult(data)) {
        setError(data.error);
      } else {
        await fetchTasks();
      }
      setLoading(false);
      return data;
    } catch {
      const result = await serviceScheduleEVC(taskId, at, expectedVersion, command.idempotencyKey);
      if (isErrorResult(result)) {
        setError(result.error);
      } else {
        await fetchTasks();
      }
      setLoading(false);
      return result;
    }
  };

  const submitReport = async (
    taskId: string,
    summary: string,
    recommendation: 'recommended' | 'conditional' | 'not_recommended',
    expectedVersion: number = 1
  ): Promise<ApiResult<EVCTask>> => {
    setLoading(true);
    setError(null);
    const command: EVCReportCommand = {
      evidenceVersionIds: [],
      summary,
      recommendation,
      expectedVersion,
      idempotencyKey: `REPORT-${taskId}-${Date.now()}`
    };

    try {
      const res = await fetch(`/api/v1/evc/${encodeURIComponent(taskId)}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command)
      });
      const data: ApiResult<EVCTask> = await res.json();
      if (isErrorResult(data)) {
        setError(data.error);
      } else {
        await fetchTasks();
      }
      setLoading(false);
      return data;
    } catch {
      const fakePort = makeFakeCorePort();
      const result = await serviceSubmitEVCReport(taskId, command, fakePort);
      if (isErrorResult(result)) {
        setError(result.error);
      } else {
        await fetchTasks();
      }
      setLoading(false);
      return result;
    }
  };

  return {
    tasks,
    loading,
    error,
    isSynthetic,
    refetch: fetchTasks,
    createTask,
    schedule,
    submitReport
  };
}
