import { useState, useEffect, useCallback } from 'react';
import type {
  EVCTask,
  EVCReportCommand,
  ApiResult,
  ApiError
} from '../../../backend/modules/scrutiny/contracts';

/**
 * Custom React Hook for Conditional EVC (M2 USP B07).
 * Connects to live endpoints with clean client-side fallback.
 */
const clientFallbackEVCTasks: EVCTask[] = [
  {
    id: 'EVC-TASK-SYNTHETIC-01',
    applicationId: 'APP-2026-001',
    prerequisiteEventId: 'EVT-PRE-01',
    policyRevisionId: 'POL-2026-INTAKE-NON-NBA',
    assigneeIds: ['EVC-EXPERT-WEST-01', 'EVC-EXPERT-WEST-02'],
    version: 1,
    status: 'pending'
  }
];

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
      // Clean Client Fallback (clearly labeled)
      setIsSynthetic(true);
      const list = applicationId 
        ? clientFallbackEVCTasks.filter(t => t.applicationId === applicationId)
        : clientFallbackEVCTasks;
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
      const newTask: EVCTask = {
        id: `EVC-${Date.now()}`,
        applicationId: appId,
        prerequisiteEventId: 'EVT-PRE-SYNTHETIC',
        policyRevisionId: 'POL-SYNTHETIC',
        assigneeIds: ['EVC-EXPERT-SYNTHETIC'],
        version: expectedVersion,
        status: 'pending'
      };
      clientFallbackEVCTasks.push(newTask);
      setTasks([...clientFallbackEVCTasks]);
      setLoading(false);
      return { success: true, data: newTask };
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
      const found = clientFallbackEVCTasks.find(t => t.id === taskId);
      if (found) {
        found.scheduledAt = at;
        found.status = 'scheduled';
        found.version = expectedVersion + 1;
        setTasks([...clientFallbackEVCTasks]);
        setLoading(false);
        return { success: true, data: found };
      }
      setLoading(false);
      return { success: false, error: { code: 'NOT_FOUND', message: 'EVC task not found' } };
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
      const found = clientFallbackEVCTasks.find(t => t.id === taskId);
      if (found) {
        found.status = 'completed';
        found.version = expectedVersion + 1;
        setTasks([...clientFallbackEVCTasks]);
        setLoading(false);
        return { success: true, data: found };
      }
      setLoading(false);
      return { success: false, error: { code: 'NOT_FOUND', message: 'EVC task not found' } };
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
