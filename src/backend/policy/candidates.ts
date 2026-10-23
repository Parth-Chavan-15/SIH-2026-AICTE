import type { PolicyRevision } from '../../shared/contracts';
/** NOT approved, NOT seeded. Eligibility is incomplete until exact errata review. */
export const candidatePolicies: PolicyRevision[] = [true, false].map(accredited => ({
  id: `CANDIDATE-G02-${accredited ? 'A' : 'B'}-r1`, policyKey: `CANDIDATE-G02-${accredited ? 'A' : 'B'}`,
  revision: 1, category: 'increase_intake', session: '2026-27', status: 'draft',
  // Placeholder window, explicitly blocks activation through unresolved conditions.
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  source: { documentId: 'G02', title: '2026–27 updated addendum / final errata',
    url: 'https://aicte.gov.in/downloads/aph/Final%20Addendum%202026-27_Updated.pdf',
    location: 'Reported PDF p.42, §2.6(c)(i); primary page NOT verified', sourceRevision: 'UNVERIFIED-2026-27-UPDATED', reviewState: 'interpretation_pending' },
  conditions: { format: 'm1-routing-v1', programs: ['engineering'], sessionMode: 'regular',
    predicates: [{ fact: 'nbaAccreditation', operator: 'eq', value: accredited, unit: 'none', ambiguousValues: [], explanation: 'Candidate accreditation branch; complete eligibility NOT established' },
      { fact: 'existingIntake', operator: 'gt', value: 0, unit: 'seats', ambiguousValues: [360], explanation: 'Placeholder boundary observation; not a regulatory threshold implementation' }],
    stages: accredited ? ['submitted', 'scrutiny_pending', 'decision_pending'] : ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'],
    evcReason: 'Proposed route only; not executable', requiresHearing: false,
    unresolved: ['Exact programme/level/institution applicability, thresholds and units', 'Effective window and amendment precedence', 'Accreditation validity and evidence mapping', 'Updated errata PDF returned 403; full source review required'] },
}));
