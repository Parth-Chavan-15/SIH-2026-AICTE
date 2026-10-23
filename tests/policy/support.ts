/** Entirely MOCK ONLY approval/provenance, never a verified AICTE fixture. */
import type { PolicyRevision } from '../../src/shared/contracts';
import type { VerifiedFacts, PolicyInput } from '../../src/backend/policy/evaluator';
export const input: PolicyInput = { category: 'increase_intake', session: '2026-27', asOf: '2026-10-23T10:00:00.000Z', sessionMode: 'regular', facts: { program: 'engineering', proposedIntake: 320, nbaAccreditation: true } };
export function fixture(accredited = true): PolicyRevision {
  return { id: `SYN-${accredited}-r1`, policyKey: `SYN-${accredited}`, revision: 1, category: input.category, session: input.session,
    effectiveFrom: '2026-01-01T00:00:00.000Z', status: 'approved',
    source: { documentId: 'SYN-TEST', title: 'MOCK ONLY source, NOT an official verified rule', location: 'MOCK ONLY p.1 §TEST', url: 'https://aicte.gov.in/SYN-NOT-A-REAL-SOURCE.pdf', sourceRevision: 'SYN-1', reviewState: 'reviewed' },
    conditions: { format: 'm1-routing-v1', programs: ['engineering'], sessionMode: 'regular', predicates: [
      { fact: 'nbaAccreditation', operator: 'eq', value: accredited, unit: 'none', ambiguousValues: [], explanation: 'MOCK ONLY accreditation evidence match' },
      { fact: 'existingIntake', operator: 'lt', value: 360, unit: 'seats', ambiguousValues: [360], explanation: 'MOCK ONLY boundary fixture, not an AICTE threshold codification' },
      { fact: 'institutionEligible', operator: 'eq', value: true, unit: 'none', ambiguousValues: [], explanation: 'MOCK ONLY eligibility established' }],
      stages: accredited ? ['submitted', 'scrutiny_pending', 'decision_pending'] : ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'],
      evcReason: accredited ? 'MOCK ONLY qualifying path excludes EVC' : 'MOCK ONLY qualifying path includes EVC', requiresHearing: false, unresolved: [],
      verification: { sourceRevision: 'SYN-1', sourceDigest: '1'.repeat(64), authoredBy: 'SYN-AUTHOR', approvedBy: 'SYN-REVIEWER', verifiedAt: '2026-01-01T00:00:00.000Z', applicabilityConfirmed: true, precedenceConfirmed: true } },
  };
}
export function facts(accredited = true): VerifiedFacts {
  const proof = { evidenceVersionIds: ['SYN-EVIDENCE'], verifiedAt: '2026-01-01T00:00:00.000Z' };
  return { nbaAccreditation: { ...proof, value: accredited, unit: 'none', validFrom: '2026-01-01T00:00:00.000Z', validTo: '2027-01-01T00:00:00.000Z' }, existingIntake: { ...proof, value: 300, unit: 'seats' }, institutionEligible: { ...proof, value: true, unit: 'none' } };
}
