import { describe, it, expect, beforeEach } from 'vitest';
import {
  signScrutiny,
  submitCorrection,
  rescrutinize,
  getLatestSnapshot,
  getSnapshots
} from './scrutinyService';
import { makeFakeCorePort, fakeCase, fakeExplanation } from './mockCore';
import { eventBus } from '../events/eventBus';
import type { Application } from './contracts';

describe('Member 2 - Scrutiny & Scoped Correction Lock Integration (Gate G2)', () => {
  beforeEach(() => {
    eventBus.clear();
  });

  it('signs scrutiny checklist and generates immutable snapshot with D1/D2 deficient and C3 accepted', async () => {
    const testCase: Application = {
      ...fakeCase,
      id: 'TEST-APP-01',
      version: 1,
      state: 'scrutiny_pending'
    };
    const corePort = makeFakeCorePort(testCase);

    const signResult = await signScrutiny(corePort, 'TEST-APP-01', {
      checklistVersion: 'v2026.1',
      expectedVersion: 1,
      idempotencyKey: 'IDEMP-SIGN-01',
      items: [
        { itemId: 'D1', result: 'deficient', reason: 'Land conversion missing', evidenceVersionIds: ['DOC-1'] },
        { itemId: 'D2', result: 'deficient', reason: 'Faculty cadre mismatch', evidenceVersionIds: ['DOC-2'] },
        { itemId: 'C3', result: 'accepted', reason: 'Land boundary verified', evidenceVersionIds: ['DOC-3'] }
      ]
    });

    expect(signResult.success).toBe(true);
    if (signResult.success) {
      expect(signResult.data.deficiencyItemIds).toEqual(['D1', 'D2']);
      expect(signResult.data.round).toBe(1);
      expect(signResult.data.items).toHaveLength(3);
    }

    const latest = getLatestSnapshot('TEST-APP-01');
    expect(latest).toBeDefined();
    expect(latest?.deficiencyItemIds).toEqual(['D1', 'D2']);
  });

  it('allows correction submission for deficiency item D1 (Acceptance Criterion 1)', async () => {
    const corePort = makeFakeCorePort({
      ...fakeCase,
      id: 'SYN-NONACC-02',
      version: 1,
      state: 'correction_required'
    });

    const result = await submitCorrection(corePort, 'SYN-NONACC-02', {
      snapshotId: 'SNAP-SYN-NONACC-02-R1',
      expectedVersion: 1,
      idempotencyKey: 'IDEMP-CORR-D1',
      changes: [
        { itemId: 'D1', evidenceVersionIds: ['DOC-SYN-01-V2'], response: 'Attached gazette land conversion notification' }
      ]
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.application.state).toBe('rescrutiny_pending');
      expect(result.data.application.version).toBe(2);
    }
  });

  it('allows correction submission for deficiency item D2 (Acceptance Criterion 2)', async () => {
    const corePort = makeFakeCorePort({
      ...fakeCase,
      id: 'SYN-NONACC-02',
      version: 1,
      state: 'correction_required'
    });

    const result = await submitCorrection(corePort, 'SYN-NONACC-02', {
      snapshotId: 'SNAP-SYN-NONACC-02-R1',
      expectedVersion: 1,
      idempotencyKey: 'IDEMP-CORR-D2',
      changes: [
        { itemId: 'D2', evidenceVersionIds: ['DOC-SYN-02-V2'], response: 'Submitted AICTE cadre ratio faculty roster' }
      ]
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.application.state).toBe('rescrutiny_pending');
      expect(result.data.application.version).toBe(2);
    }
  });

  it('REJECTS correction attempt for accepted item C3 with PRECONDITION_FAILED (Acceptance Criterion 3 & 9)', async () => {
    const initialVersion = 1;
    const corePort = makeFakeCorePort({
      ...fakeCase,
      id: 'SYN-NONACC-02',
      version: initialVersion,
      state: 'correction_required'
    });

    const result = await submitCorrection(corePort, 'SYN-NONACC-02', {
      snapshotId: 'SNAP-SYN-NONACC-02-R1',
      expectedVersion: initialVersion,
      idempotencyKey: 'IDEMP-TAMPER-C3',
      changes: [
        { itemId: 'C3', evidenceVersionIds: ['DOC-ILLEGAL'], response: 'Attempting to change immutable accepted item' }
      ]
    });

    // Verification of exact error shape matching examples/blocked_c3_response.json
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('PRECONDITION_FAILED');
      expect(result.error.failedRule).toBe('RESCRUTINY_SCOPE_ONLY_SIGNED_DEFICIENCIES');
      expect(result.error.message).toBe('Only item IDs in the signed deficiency set can be corrected.');
      expect(result.error.currentVersion).toBe(initialVersion);
    }

    // Domain state must NOT mutate
    const app = await corePort.getApplication('SYN-NONACC-02');
    expect(app.version).toBe(initialVersion);
    expect(app.state).toBe('correction_required');

    // Denied attempt must be recorded in audit events
    const events = eventBus.getEvents('SYN-NONACC-02');
    const deniedEvent = events.find(e => e.type === 'CommandDenied');
    expect(deniedEvent).toBeDefined();
    expect(deniedEvent?.payload).toMatchObject({
      code: 'PRECONDITION_FAILED',
      attemptedAction: 'submit_corrections_scope_violation'
    });
  });

  it('rescrutinize forbids re-evaluation of non-deficiency items with SCOPE_VIOLATION', async () => {
    const corePort = makeFakeCorePort({
      ...fakeCase,
      id: 'SYN-NONACC-02',
      version: 2,
      state: 'rescrutiny_pending'
    });

    const result = await rescrutinize(corePort, 'SYN-NONACC-02', {
      snapshotId: 'SNAP-SYN-NONACC-02-R1',
      expectedVersion: 2,
      idempotencyKey: 'IDEMP-RESCRUTINY-SCOPE-TEST',
      outcomes: [
        { itemId: 'C3', result: 'deficient', reason: 'Reviewer attempting to reopen closed item' }
      ]
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('SCOPE_VIOLATION');
      expect(result.error.failedRule).toBe('RESCRUTINY_SCOPE_ONLY_SIGNED_DEFICIENCIES');
    }
  });

  it('rejects commands when expectedVersion does not match currentVersion (VERSION_CONFLICT)', async () => {
    const corePort = makeFakeCorePort({
      ...fakeCase,
      id: 'SYN-NONACC-02',
      version: 5,
      state: 'correction_required'
    });

    const result = await submitCorrection(corePort, 'SYN-NONACC-02', {
      snapshotId: 'SNAP-SYN-NONACC-02-R1',
      expectedVersion: 4, // stale version
      idempotencyKey: 'IDEMP-STALE-VERSION',
      changes: [{ itemId: 'D1', evidenceVersionIds: [], response: 'stale' }]
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('VERSION_CONFLICT');
      expect(result.error.currentVersion).toBe(5);
    }
  });
});
