import { describe, it, expect } from 'vitest';
import { validateCorrections } from './validateCorrections';
import type { ScrutinySnapshot, CorrectionInput } from './contracts';

describe('validateCorrections Pure Function (USP B06 / Acceptance T05-T07)', () => {
  // SYNTHETIC test fixture representing signed Round 1 snapshot
  // D1 and D2 are deficiencies; C3 was accepted and is immutable
  const signedSnapshot: ScrutinySnapshot = {
    id: 'SNAP-SYN-001',
    applicationId: 'SYN-NONACC-02',
    round: 1,
    checklistVersion: 'v2026.1',
    items: [
      { itemId: 'D1', result: 'deficient', reason: 'Land conversion certificate missing', evidenceVersionIds: ['DOC-1'] },
      { itemId: 'D2', result: 'deficient', reason: 'Faculty cadred ratio non-compliant', evidenceVersionIds: ['DOC-2'] },
      { itemId: 'C3', result: 'accepted', reason: 'Built-up area compliant', evidenceVersionIds: ['DOC-3'] }
    ],
    deficiencyItemIds: ['D1', 'D2'],
    signedBy: 'SYNTHETIC-REVIEWER-1',
    signedAt: '2026-10-23T10:00:00.000Z'
  };

  it('accepts valid correction for deficiency item D1', () => {
    const changes: CorrectionInput[] = [
      { itemId: 'D1', evidenceVersionIds: ['DOC-1-REV'], response: 'Attached updated land conversion certificate' }
    ];
    const result = validateCorrections(signedSnapshot, changes);
    expect(result.valid).toBe(true);
    expect(result.accepted).toHaveLength(1);
    expect(result.accepted[0].itemId).toBe('D1');
    expect(result.rejected).toHaveLength(0);
  });

  it('accepts valid correction for deficiency item D2', () => {
    const changes: CorrectionInput[] = [
      { itemId: 'D2', evidenceVersionIds: ['DOC-2-REV'], response: 'Submitted revised faculty roster' }
    ];
    const result = validateCorrections(signedSnapshot, changes);
    expect(result.valid).toBe(true);
    expect(result.accepted).toHaveLength(1);
    expect(result.accepted[0].itemId).toBe('D2');
    expect(result.rejected).toHaveLength(0);
  });

  it('rejects correction for already accepted immutable item C3 with SCOPE_VIOLATION', () => {
    const changes: CorrectionInput[] = [
      { itemId: 'C3', evidenceVersionIds: ['DOC-3-ATTEMPT'], response: 'Tampering with accepted built-up area' }
    ];
    const result = validateCorrections(signedSnapshot, changes);
    expect(result.valid).toBe(false);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].item.itemId).toBe('C3');
    expect(result.rejected[0].reason).toContain('SCOPE_VIOLATION: item C3 was accepted in signed snapshot round 1, corrections not permitted');
  });

  it('rejects correction for unknown item X99', () => {
    const changes: CorrectionInput[] = [
      { itemId: 'X99', evidenceVersionIds: ['DOC-UNKNOWN'], response: 'Arbitrary injection' }
    ];
    const result = validateCorrections(signedSnapshot, changes);
    expect(result.valid).toBe(false);
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].item.itemId).toBe('X99');
    expect(result.rejected[0].reason).toContain('SCOPE_VIOLATION: item X99 was accepted in signed snapshot round 1, corrections not permitted');
  });

  it('treats empty changes array as valid no-op', () => {
    const result = validateCorrections(signedSnapshot, []);
    expect(result.valid).toBe(true);
    expect(result.accepted).toHaveLength(0);
    expect(result.rejected).toHaveLength(0);
  });

  it('handles multiple changes with mixed valid (D1, D2) and invalid (C3, X99)', () => {
    const changes: CorrectionInput[] = [
      { itemId: 'D1', evidenceVersionIds: ['DOC-1-REV'], response: 'Fixed D1' },
      { itemId: 'C3', evidenceVersionIds: ['DOC-3-ILLEGAL'], response: 'Illegal C3 change' },
      { itemId: 'D2', evidenceVersionIds: ['DOC-2-REV'], response: 'Fixed D2' },
      { itemId: 'X99', evidenceVersionIds: ['DOC-99'], response: 'Invalid item' }
    ];
    const result = validateCorrections(signedSnapshot, changes);
    expect(result.valid).toBe(false);
    expect(result.accepted.map(a => a.itemId)).toEqual(['D1', 'D2']);
    expect(result.rejected.map(r => r.item.itemId)).toEqual(['C3', 'X99']);
  });
});
