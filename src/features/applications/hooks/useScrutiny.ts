import { useState, useEffect, useCallback } from 'react';
import type {
  ScrutinySnapshot,
  SignScrutinyCommand,
  CorrectionCommand,
  RescrutinyCommand,
  CommandResult,
  ApiResult,
  ApiError
} from '../../../backend/modules/scrutiny/contracts';
import {
  signScrutiny,
  submitCorrection as serviceSubmitCorrection,
  rescrutinize as serviceRescrutinize,
  getSnapshots,
  getLatestSnapshot
} from '../../../backend/modules/scrutiny/scrutinyService';
import { makeFakeCorePort, fakeCase } from '../../../backend/modules/scrutiny/mockCore';

/**
 * Custom React Hook for Scrutiny and Scoped Correction Lock (M2 USP B06).
 * Features live API integration with an in-memory synthetic fallback for development.
 * Clearly labeled as SYNTHETIC adapter when running without live server.
 */
export function useScrutiny(applicationId: string, currentVersion: number = 1) {
  const [snapshots, setSnapshots] = useState<ScrutinySnapshot[]>([]);
  const [latestSnapshot, setLatestSnapshot] = useState<ScrutinySnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [isSynthetic, setIsSynthetic] = useState<boolean>(false);

  const fetchScrutiny = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/applications/${encodeURIComponent(applicationId)}/scrutiny`);
      if (res.ok) {
        const json: ApiResult<{ snapshots: ScrutinySnapshot[]; latestSnapshot: ScrutinySnapshot | null }> = await res.json();
        if (json.success) {
          setSnapshots(json.data.snapshots);
          setLatestSnapshot(json.data.latestSnapshot);
          setIsSynthetic(false);
          setLoading(false);
          return;
        }
      }
      throw new Error('Fallback to Synthetic Port');
    } catch {
      // SYNTHETIC MOCK ADAPTER FALLBACK (Clearly Labeled)
      setIsSynthetic(true);
      const localSnapshots = getSnapshots(applicationId);
      const latest = getLatestSnapshot(applicationId) || null;
      setSnapshots(localSnapshots);
      setLatestSnapshot(latest);
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchScrutiny();
  }, [fetchScrutiny]);

function isErrorResult<T>(res: ApiResult<T>): res is { success: false; error: ApiError } {
  return !res.success || 'error' in res;
}

  const sign = async (checklistVersion: string, items: any[]): Promise<ApiResult<ScrutinySnapshot>> => {
    setLoading(true);
    setError(null);
    const command: SignScrutinyCommand = {
      checklistVersion,
      items,
      expectedVersion: currentVersion,
      idempotencyKey: `SIGN-${applicationId}-${Date.now()}`
    };

    try {
      const res = await fetch(`/api/v1/applications/${encodeURIComponent(applicationId)}/scrutiny`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command)
      });
      const data: ApiResult<ScrutinySnapshot> = await res.json();
      if (isErrorResult(data)) {
        setError(data.error);
      } else {
        await fetchScrutiny();
      }
      setLoading(false);
      return data;
    } catch {
      // Direct service call for synthetic testing
      const fakePort = makeFakeCorePort({ ...fakeCase, id: applicationId, version: currentVersion });
      const localResult = await signScrutiny(fakePort, applicationId, command);
      if (isErrorResult(localResult)) {
        setError(localResult.error);
      } else {
        await fetchScrutiny();
      }
      setLoading(false);
      return localResult;
    }
  };

  const correct = async (snapshotId: string, changes: any[]): Promise<ApiResult<CommandResult>> => {
    setLoading(true);
    setError(null);
    const command: CorrectionCommand = {
      snapshotId,
      changes,
      expectedVersion: currentVersion,
      idempotencyKey: `CORR-${applicationId}-${Date.now()}`
    };

    try {
      const res = await fetch(`/api/v1/applications/${encodeURIComponent(applicationId)}/corrections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command)
      });
      const data: ApiResult<CommandResult> = await res.json();
      if (isErrorResult(data)) {
        setError(data.error);
      } else {
        await fetchScrutiny();
      }
      setLoading(false);
      return data;
    } catch {
      // Direct service call for synthetic testing
      const fakePort = makeFakeCorePort({ ...fakeCase, id: applicationId, version: currentVersion });
      const localResult = await serviceSubmitCorrection(fakePort, applicationId, command);
      if (isErrorResult(localResult)) {
        setError(localResult.error);
      } else {
        await fetchScrutiny();
      }
      setLoading(false);
      return localResult;
    }
  };

  const rescrutiny = async (snapshotId: string, outcomes: any[]): Promise<ApiResult<CommandResult>> => {
    setLoading(true);
    setError(null);
    const command: RescrutinyCommand = {
      snapshotId,
      outcomes,
      expectedVersion: currentVersion,
      idempotencyKey: `RESCRUTINY-${applicationId}-${Date.now()}`
    };

    try {
      const res = await fetch(`/api/v1/applications/${encodeURIComponent(applicationId)}/rescrutiny`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(command)
      });
      const data: ApiResult<CommandResult> = await res.json();
      if (isErrorResult(data)) {
        setError(data.error);
      } else {
        await fetchScrutiny();
      }
      setLoading(false);
      return data;
    } catch {
      const fakePort = makeFakeCorePort({ ...fakeCase, id: applicationId, version: currentVersion });
      const localResult = await serviceRescrutinize(fakePort, applicationId, command);
      if (isErrorResult(localResult)) {
        setError(localResult.error);
      } else {
        await fetchScrutiny();
      }
      setLoading(false);
      return localResult;
    }
  };

  return {
    snapshots,
    latestSnapshot,
    loading,
    error,
    isSynthetic,
    refetch: fetchScrutiny,
    sign,
    correct,
    rescrutiny
  };
}
