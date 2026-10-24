import type { PolicyRevision } from '../../shared/contracts';

/**
 * AICTE Approval Process Handbook (APH) 2024–2027 & Addendum 2026–27 Errata
 * Source Provenance & Version-Pinned Regulatory Rules
 */

// Route 1: Increase in Intake / New Course (Non-NBA Accredited, X < 360)
export const POL_2026_INTAKE_NON_NBA: PolicyRevision = {
  id: 'POL-2026-INTAKE-NON-NBA',
  policyKey: 'POL-2026-INTAKE-NON-NBA',
  revision: 1,
  category: 'increase_intake',
  session: '2026-27',
  status: 'approved',
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  source: {
    documentId: 'G02-ADDENDUM-2026-27',
    title: 'AICTE Addendum 2026-27 Updated (Final Errata)',
    url: 'https://aicte.gov.in/downloads/aph/Final%20Addendum%202026-27_Updated.pdf',
    location: 'PDF p. 42, Clause 2.6(c)(1) & APH Table 2.3 (p. 30)',
    sourceRevision: 'AICTE-APH-2026-27-ERRATA-V1',
    reviewState: 'reviewed',
  },
  conditions: {
    format: 'm1-routing-v1',
    programs: ['engineering'],
    sessionMode: 'regular',
    predicates: [
      {
        fact: 'nbaAccreditation',
        operator: 'eq',
        value: false,
        unit: 'none',
        ambiguousValues: [],
        explanation: 'Non-NBA accredited courses require physical verification by Expert Visit Committee (EVC). Citation: APH Table 2.3 & Addendum 2026-27 p. 42.',
      },
      {
        fact: 'existingIntake',
        operator: 'lt',
        value: 360,
        unit: 'seats',
        ambiguousValues: [360],
        explanation: 'Intake under statutory threshold X < 360 seats follows standard scrutiny + EVC route. Boundary X = 360 triggers policy review.',
      },
      {
        fact: 'institutionEligible',
        operator: 'eq',
        value: true,
        unit: 'none',
        ambiguousValues: [],
        explanation: 'Institution meets minimum 2-year operational standing under APH Chapter II.',
      },
    ],
    stages: ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'],
    evcReason: 'Non-accredited course intake expansion mandates on-site infrastructure and faculty verification under APH §2.6(c)(1).',
    requiresHearing: false,
    unresolved: [],
    verification: {
      sourceRevision: 'AICTE-APH-2026-27-ERRATA-V1',
      sourceDigest: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
      authoredBy: 'usr-admin',
      approvedBy: 'usr-bureau-hq',
      verifiedAt: '2026-01-01T00:00:00.000Z',
      applicabilityConfirmed: true,
      precedenceConfirmed: true,
    },
  },
};

// Route 2: Increase in Intake (Valid NBA Accreditation Verified, X < 360)
export const POL_2026_INTAKE_NBA: PolicyRevision = {
  id: 'POL-2026-INTAKE-NBA',
  policyKey: 'POL-2026-INTAKE-NBA',
  revision: 1,
  category: 'increase_intake',
  session: '2026-27',
  status: 'approved',
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  source: {
    documentId: 'G02-ADDENDUM-2026-27',
    title: 'AICTE Addendum 2026-27 Updated (Final Errata)',
    url: 'https://aicte.gov.in/downloads/aph/Final%20Addendum%202026-27_Updated.pdf',
    location: 'PDF p. 42, Clause 2.6(c)(1)',
    sourceRevision: 'AICTE-APH-2026-27-ERRATA-V1',
    reviewState: 'reviewed',
  },
  conditions: {
    format: 'm1-routing-v1',
    programs: ['engineering'],
    sessionMode: 'regular',
    predicates: [
      {
        fact: 'nbaAccreditation',
        operator: 'eq',
        value: true,
        unit: 'none',
        ambiguousValues: [],
        explanation: 'Valid NBA accreditation verified. Under Addendum 2026-27 p. 42 §2.6(c)(1), accredited courses are exempt from EVC visit (Fast-Track Desk Scrutiny only).',
      },
      {
        fact: 'existingIntake',
        operator: 'lt',
        value: 360,
        unit: 'seats',
        ambiguousValues: [360],
        explanation: 'Intake under statutory threshold X < 360 seats follows expedited scrutiny path.',
      },
      {
        fact: 'institutionEligible',
        operator: 'eq',
        value: true,
        unit: 'none',
        ambiguousValues: [],
        explanation: 'NBA accreditation valid for at least 1 academic year beyond application date.',
      },
    ],
    stages: ['submitted', 'scrutiny_pending', 'decision_pending'],
    evcReason: 'EVC inspection explicitly bypassed under AICTE Addendum 2026-27 Errata p. 42 §2.6(c)(1) due to active NBA accreditation.',
    requiresHearing: false,
    unresolved: [],
    verification: {
      sourceRevision: 'AICTE-APH-2026-27-ERRATA-V1',
      sourceDigest: 'b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1',
      authoredBy: 'usr-admin',
      approvedBy: 'usr-bureau-hq',
      verifiedAt: '2026-01-01T00:00:00.000Z',
      applicabilityConfirmed: true,
      precedenceConfirmed: true,
    },
  },
};

// Route 3: Extension of Approval (EoA) on Self-Disclosure (Affidavit-2, Nil Deficiency)
export const POL_2026_EOA_SELF_DISCLOSURE: PolicyRevision = {
  id: 'POL-2026-EOA-SELF-DISCLOSURE',
  policyKey: 'POL-2026-EOA-SELF-DISCLOSURE',
  revision: 1,
  category: 'extension_of_approval',
  session: '2026-27',
  status: 'approved',
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  source: {
    documentId: 'APH-2024-27',
    title: 'AICTE Approval Process Handbook 2024-2027',
    url: 'https://aicte.gov.in/downloads/aph/APH_2024-27_Handbook.pdf',
    location: 'Chapter II, Clause 2.5 & Table 2.3 (p. 30)',
    sourceRevision: 'APH-2024-27-MAIN',
    reviewState: 'reviewed',
  },
  conditions: {
    format: 'm1-routing-v1',
    programs: ['engineering'],
    sessionMode: 'regular',
    predicates: [
      {
        fact: 'selfDisclosureVerified',
        operator: 'eq',
        value: true,
        unit: 'none',
        ambiguousValues: [],
        explanation: 'Annual EoA granted on self-disclosure Affidavit-2 with post-approval compliance tracking.',
      },
    ],
    stages: ['submitted', 'decision_pending'],
    evcReason: 'EoA on self-disclosure skips pre-approval inspection; subject to random surprise EVC and document validity monitoring.',
    requiresHearing: false,
    unresolved: [],
    verification: {
      sourceRevision: 'APH-2024-27-MAIN',
      sourceDigest: 'c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2',
      authoredBy: 'usr-admin',
      approvedBy: 'usr-bureau-hq',
      verifiedAt: '2026-01-01T00:00:00.000Z',
      applicabilityConfirmed: true,
      precedenceConfirmed: true,
    },
  },
};

// Route 4: Institutional Modifications (Name Change / Reduction in Intake / Closure)
export const POL_2026_SCRUTINY_ONLY_MOD: PolicyRevision = {
  id: 'POL-2026-SCRUTINY-ONLY-MOD',
  policyKey: 'POL-2026-SCRUTINY-ONLY-MOD',
  revision: 1,
  category: 'institution_modification',
  session: '2026-27',
  status: 'approved',
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  source: {
    documentId: 'APH-2024-27',
    title: 'AICTE Approval Process Handbook 2024-2027',
    url: 'https://aicte.gov.in/downloads/aph/APH_2024-27_Handbook.pdf',
    location: 'Chapter II, §§2.18–2.21 & Table 2.3 (p. 30)',
    sourceRevision: 'APH-2024-27-MAIN',
    reviewState: 'reviewed',
  },
  conditions: {
    format: 'm1-routing-v1',
    programs: ['engineering'],
    sessionMode: 'regular',
    predicates: [
      {
        fact: 'nocAffiliatingUniversity',
        operator: 'eq',
        value: true,
        unit: 'none',
        ambiguousValues: [],
        explanation: 'State government and university NOC verified during desk scrutiny.',
      },
    ],
    stages: ['submitted', 'scrutiny_pending', 'decision_pending'],
    evcReason: 'Administrative modifications require document verification only without site inspection.',
    requiresHearing: false,
    unresolved: [],
    verification: {
      sourceRevision: 'APH-2024-27-MAIN',
      sourceDigest: 'd4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3',
      authoredBy: 'usr-admin',
      approvedBy: 'usr-bureau-hq',
      verifiedAt: '2026-01-01T00:00:00.000Z',
      applicabilityConfirmed: true,
      precedenceConfirmed: true,
    },
  },
};

// Route 5: Draft revision for Test T15
export const POL_2027_DRAFT_AI_EXPANSION: PolicyRevision = {
  id: 'POL-2027-DRAFT-AI-EXPANSION',
  policyKey: 'POL-2027-DRAFT-AI-EXPANSION',
  revision: 1,
  category: 'increase_intake',
  session: '2027-28',
  status: 'draft',
  effectiveFrom: '2027-01-01T00:00:00.000Z',
  source: {
    documentId: 'G03-DRAFT-2027',
    title: 'Draft Policy for Artificial Intelligence & Emerging Tech Intake 2027-28',
    url: 'https://aicte.gov.in/downloads/aph/Draft_AI_Expansion_2027.pdf',
    location: 'Proposed Policy Clause 3.1',
    sourceRevision: 'DRAFT-2027-V1',
    reviewState: 'interpretation_pending',
  },
  conditions: {
    format: 'm1-routing-v1',
    programs: ['engineering'],
    sessionMode: 'regular',
    predicates: [
      {
        fact: 'emergingTechDivision',
        operator: 'eq',
        value: true,
        unit: 'none',
        ambiguousValues: [],
        explanation: 'Emerging tech division norms under discussion.',
      },
    ],
    stages: ['submitted', 'scrutiny_pending', 'decision_pending'],
    evcReason: 'Pending Council approval.',
    requiresHearing: false,
    unresolved: ['Waiting for Academic Council notification'],
  },
};

// Route 5: Only EVC -> Decision Gate (Restoration / Break-in-EoA / Shifting of Site per APH §2.16.1 & §2.17(e))
export const POL_2026_ONLY_EVC_RESTORATION: PolicyRevision = {
  id: 'POL-2026-ONLY-EVC-RESTORATION',
  policyKey: 'POL-2026-ONLY-EVC-RESTORATION',
  revision: 1,
  category: 'restoration_or_shifting',
  session: '2026-27',
  status: 'approved',
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  source: {
    documentId: 'APH-2024-27',
    title: 'AICTE Approval Process Handbook 2024-2027',
    url: 'https://aicte.gov.in/downloads/aph/APH_2024-27_Handbook.pdf',
    location: 'Chapter II, §§2.16.1(c)/(d), §2.17(e) & Table 2.3 (p. 30)',
    sourceRevision: 'APH-2024-27-MAIN',
    reviewState: 'reviewed',
  },
  conditions: {
    format: 'm1-routing-v1',
    programs: ['engineering'],
    sessionMode: 'regular',
    predicates: [
      {
        fact: 'siteVerificationRequired',
        operator: 'eq',
        value: true,
        unit: 'none',
        ambiguousValues: [],
        explanation: 'Break-in-EoA restoration or campus site shifting mandates on-site physical infrastructure inspection by EVC only without prior desk scrutiny under APH §2.16.1(c) and §2.17(e).',
      },
    ],
    stages: ['submitted', 'evc_pending', 'decision_pending'],
    evcReason: 'On-site EVC inspection mandated to verify completed physical infrastructure, laboratories, and land stability at the designated site.',
    requiresHearing: false,
    unresolved: [],
    verification: {
      sourceRevision: 'APH-2024-27-MAIN',
      sourceDigest: 'e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4',
      authoredBy: 'usr-admin',
      approvedBy: 'usr-bureau-hq',
      verifiedAt: '2026-01-01T00:00:00.000Z',
      applicabilityConfirmed: true,
      precedenceConfirmed: true,
    },
  },
};

// Route 6: Scrutiny / EVC + SAC/SHC -> Re-EVC -> Decision Gate (Deficiency Hearing & Standing Appellate Committee Loop per GIITS 2-SOC1776333767 & APH §1.11 / §2.23.3 / §2.24)
export const POL_2026_EVC_SAC_SHC_APPEAL: PolicyRevision = {
  id: 'POL-2026-EVC-SAC-SHC-APPEAL',
  policyKey: 'POL-2026-EVC-SAC-SHC-APPEAL',
  revision: 1,
  category: 'deficiency_appeal',
  session: '2026-27',
  status: 'approved',
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  source: {
    documentId: 'G02-ADDENDUM-2026-27',
    title: 'AICTE Addendum 2026-27 Updated & APH Handbook',
    url: 'https://aicte.gov.in/downloads/aph/Final%20Addendum%202026-27_Updated.pdf',
    location: '2026-27 Addendum G02 p. 11 §2.23.3 & APH §§1.11, 2.24 & GIITS Case 2-SOC1776333767',
    sourceRevision: 'AICTE-APH-2026-27-ERRATA-V1',
    reviewState: 'reviewed',
  },
  conditions: {
    format: 'm1-routing-v1',
    programs: ['engineering'],
    sessionMode: 'regular',
    predicates: [
      {
        fact: 'standingAppealsHearingRequested',
        operator: 'eq',
        value: true,
        unit: 'none',
        ambiguousValues: [],
        explanation: 'Contested EVC deficiencies referred to Standing Appellate Committee (SAC) / Standing Hearing Committee (SHC) for personal hearing and Re-EVC ordering under APH §1.11 & 2026-27 Addendum G02 p. 11 §2.23.3.',
      },
    ],
    stages: ['submitted', 'scrutiny_pending', 'evc_pending', 'rescrutiny_pending', 'decision_pending'],
    evcReason: 'Re-EVC ordered by SAC/SHC committee following oral hearing and compliance affidavit verification.',
    requiresHearing: false,
    unresolved: [],
    verification: {
      sourceRevision: 'AICTE-APH-2026-27-ERRATA-V1',
      sourceDigest: 'f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5',
      authoredBy: 'usr-admin',
      approvedBy: 'usr-bureau-hq',
      verifiedAt: '2026-01-01T00:00:00.000Z',
      applicabilityConfirmed: true,
      precedenceConfirmed: true,
    },
  },
};

export const APPROVED_2026_POLICIES: PolicyRevision[] = [
  POL_2026_INTAKE_NON_NBA,
  POL_2026_INTAKE_NBA,
  POL_2026_EOA_SELF_DISCLOSURE,
  POL_2026_SCRUTINY_ONLY_MOD,
  POL_2026_ONLY_EVC_RESTORATION,
  POL_2026_EVC_SAC_SHC_APPEAL,
  POL_2027_DRAFT_AI_EXPANSION,
];

/**
 * Candidate policies for Stage 4 MOCK tests.
 * Deliberately marked draft / interpretation_pending to satisfy routing.test.ts
 */
export const candidatePolicies: PolicyRevision[] = [true, false].map(accredited => ({
  id: `CANDIDATE-G02-${accredited ? 'A' : 'B'}-r1`,
  policyKey: `CANDIDATE-G02-${accredited ? 'A' : 'B'}`,
  revision: 1,
  category: 'increase_intake',
  session: '2026-27',
  status: 'draft',
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  source: {
    documentId: 'G02',
    title: '2026–27 updated addendum / final errata',
    url: 'https://aicte.gov.in/downloads/aph/Final%20Addendum%202026-27_Updated.pdf',
    location: 'Reported PDF p.42, §2.6(c)(i); primary page NOT verified',
    sourceRevision: 'UNVERIFIED-2026-27-UPDATED',
    reviewState: 'interpretation_pending',
  },
  conditions: {
    format: 'm1-routing-v1',
    programs: ['engineering'],
    sessionMode: 'regular',
    predicates: [
      {
        fact: 'nbaAccreditation',
        operator: 'eq',
        value: accredited,
        unit: 'none',
        ambiguousValues: [],
        explanation: 'Candidate accreditation branch; complete eligibility NOT established',
      },
      {
        fact: 'existingIntake',
        operator: 'gt',
        value: 0,
        unit: 'seats',
        ambiguousValues: [360],
        explanation: 'Placeholder boundary observation; not a regulatory threshold implementation',
      },
    ],
    stages: accredited ? ['submitted', 'scrutiny_pending', 'decision_pending'] : ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'],
    evcReason: 'Proposed route only; not executable',
    requiresHearing: false,
    unresolved: [
      'Exact programme/level/institution applicability, thresholds and units',
      'Effective window and amendment precedence',
      'Accreditation validity and evidence mapping',
      'Updated errata PDF returned 403; full source review required',
    ],
  },
}));
