import type {
  Application,
  Decision,
  Institution,
  Obligation,
  PolicySource,
  ScrutinySnapshot,
  EVCTask,
  AuditEvent
} from '../../shared/contracts';
import type { MemoryDbState } from '../persistence/memoryAdapter';
import { APPROVED_2026_POLICIES } from '../policy/candidates';

export const SRC_APH_2026_ERRATA: PolicySource = {
  documentId: 'DOC-APH-2026-ERRATA',
  title: 'APH 2026-27 Addendum & Errata',
  location: 'p. 42 §2.6(c)(1)',
  sourceRevision: 'v2026.2',
  reviewState: 'reviewed'
};

export const SRC_APH_2024_27: PolicySource = {
  documentId: 'DOC-APH-2024-27',
  title: 'APH 2024-2027 Handbook',
  location: 'Chapter II §2.6',
  sourceRevision: 'v2024.1',
  reviewState: 'reviewed'
};

export const SRC_CALENDAR_2026: PolicySource = {
  documentId: 'DOC-CAL-2026-27',
  title: 'Academic Calendar 2026-27',
  location: 'Table 1.1',
  sourceRevision: 'v2026.1',
  reviewState: 'reviewed'
};

export const CANONICAL_INSTITUTIONS: Institution[] = [
  {
    id: 'INST-NORTH',
    permanentId: '1-6055691',
    name: 'Gonna Institute of Information Technology and Sciences (GIITS), Visakhapatnam',
    regionId: 'South-Central',
    status: 'active'
  },
  {
    id: 'INST-SOUTH',
    permanentId: '1-1437622971',
    name: 'College of Engineering Pune (COEP Technological University)',
    regionId: 'Western',
    status: 'active'
  },
  {
    id: 'INST-WEST',
    permanentId: '1-447718433',
    name: 'Prerna / Univ BDT College of Engineering (PDIMTR)',
    regionId: 'Western',
    status: 'active'
  },
  {
    id: 'INST-EAST',
    permanentId: '1-9981234004',
    name: 'East Valley Institute of Technology (EVIT)',
    regionId: 'Eastern',
    status: 'active'
  },
  {
    id: 'INST-VJTI',
    permanentId: '1-7770001122',
    name: 'Veermata Jijabai Technological Institute (VJTI)',
    regionId: 'Western',
    status: 'active'
  },
  {
    id: 'INST-APEX',
    permanentId: '1-33104928',
    name: 'Apex Institute of Technology & Management',
    regionId: 'Northern',
    status: 'active'
  },
  {
    id: 'INST-BATU',
    permanentId: '1-19201481',
    name: 'Dr. Babasaheb Ambedkar Technological University (BATU Lonere)',
    regionId: 'Western',
    status: 'active'
  }
];

export const CANONICAL_APPLICATIONS: Application[] = [
  // College A: GIITS - Non-NBA Intake Increase, C3/C4 accepted, D1/D2 deficient
  {
    id: 'APP-2026-GIITS',
    reference: '1-46258917694',
    institutionId: 'INST-NORTH',
    regionId: 'South-Central',
    category: 'intake_increase',
    session: '2026-2027',
    facts: {
      institutionName: 'Gonna Institute of Information Technology and Sciences (GIITS), Visakhapatnam',
      societyName: 'Sri Veera Jagannadha Educational Society',
      address: 'Gonnavanipalem, Aganampudi, Parawada Mandal, Visakhapatnam, Andhra Pradesh 530053',
      gpsCoordinates: { latitude: 17.702834, longitude: 83.113288, formatted: '17° 42\' 7" N, 83° 6\' 47" E' },
      permanentInstituteId: '1-6055691',
      program: 'Engineering & Technology',
      course: 'Computer Science & Engineering',
      currentIntake: 180,
      proposedIntake: 240,
      nbaAccredited: false,
      cadreRatioDeficit: true,
      nswsReference: 'NSWS-2026-SCRO-101'
    },
    policyRevisionId: 'POL_2026_INTAKE_NON_NBA',
    state: 'rescrutiny_pending',
    route: {
      policyRevisionId: 'POL_2026_INTAKE_NON_NBA',
      session: '2026-2027',
      category: 'intake_increase',
      evaluatedFacts: { nbaAccredited: false, proposedIntake: 240 },
      result: 'selected',
      stages: ['scrutiny_pending', 'rescrutiny_pending', 'evc_pending', 'decision_pending'],
      reasons: ['APH 2026-27 Errata G02 §2.6: Non-NBA intake increase requires Scrutiny + Re-Scrutiny + EVC'],
      sources: [SRC_APH_2026_ERRATA]
    },
    version: 2,
    stageEnteredAt: '2026-10-24T00:00:00.000Z',
    createdAt: '2026-10-20T00:00:00.000Z',
    updatedAt: '2026-10-24T00:00:00.000Z'
  },
  // College B: AAA / COEP - Valid NBA Intake Increase, EVC Bypassed
  {
    id: 'APP-2026-COEP',
    reference: '1-43657568230',
    institutionId: 'INST-SOUTH',
    regionId: 'Western',
    category: 'intake_increase',
    session: '2026-2027',
    facts: {
      institutionName: 'College of Engineering Pune (COEP Technological University)',
      permanentInstituteId: '1-1437622971',
      program: 'Engineering & Technology',
      course: 'Mechanical Engineering',
      currentIntake: 120,
      proposedIntake: 180,
      nbaAccredited: true,
      nbaValidTill: '2028-06-30'
    },
    policyRevisionId: 'POL_2026_INTAKE_NBA',
    state: 'scrutiny_pending',
    route: {
      policyRevisionId: 'POL_2026_INTAKE_NBA',
      session: '2026-2027',
      category: 'intake_increase',
      evaluatedFacts: { nbaAccredited: true, proposedIntake: 180 },
      result: 'selected',
      stages: ['scrutiny_pending', 'decision_pending'],
      reasons: ['APH 2026-27 Errata G02 p. 42: Valid NBA accreditation skips EVC (Scrutiny / Re-Scrutiny only)'],
      sources: [SRC_APH_2026_ERRATA]
    },
    version: 1,
    stageEnteredAt: '2026-10-24T00:00:00.000Z',
    createdAt: '2026-10-22T00:00:00.000Z',
    updatedAt: '2026-10-24T00:00:00.000Z'
  },
  // College C: Univ BDT / PDIMTR - Conditional EoA with 3 Trackers (30-yr Lease, 1-yr Fire, 6-mo Undertaking)
  {
    id: 'APP-2026-PDIMTR',
    reference: '1-10970417826',
    institutionId: 'INST-WEST',
    regionId: 'Western',
    category: 'extension_of_approval',
    session: '2026-2027',
    facts: {
      institutionName: 'Prerna / Univ BDT College of Engineering (PDIMTR)',
      permanentInstituteId: '1-447718433',
      program: 'Management / MBA',
      currentIntake: 120,
      leaseExpiryDate: '2026-11-05',
      fireNocExpiryDate: '2026-11-24'
    },
    policyRevisionId: 'POL_2026_EOA_SELF_DISCLOSURE',
    state: 'conditionally_approved',
    route: {
      policyRevisionId: 'POL_2026_EOA_SELF_DISCLOSURE',
      session: '2026-2027',
      category: 'extension_of_approval',
      evaluatedFacts: {},
      result: 'selected',
      stages: ['scrutiny_pending', 'conditionally_approved'],
      reasons: ['Conditional EoA issued with time-bound post-approval undertaking clauses'],
      sources: [SRC_APH_2024_27]
    },
    version: 3,
    stageEnteredAt: '2026-10-24T00:00:00.000Z',
    createdAt: '2026-10-15T00:00:00.000Z',
    updatedAt: '2026-10-24T00:00:00.000Z'
  },
  // College 4: Apex Institute - Scrutiny + EVC + SAC/SHC Hearing Loop (APH §1.11 / §2.23.3 / GIITS precedent 2-SOC1776333767)
  {
    id: 'APP-2026-APEX',
    reference: '1-33104928001',
    institutionId: 'INST-APEX',
    regionId: 'Northern',
    category: 'deficiency_appeal',
    session: '2026-2027',
    facts: {
      institutionName: 'Apex Institute of Technology & Management',
      permanentInstituteId: '1-33104928',
      program: 'Engineering & Technology',
      course: 'Civil & Environmental Engineering',
      currentIntake: 120,
      proposedIntake: 180,
      nbaAccredited: false,
      cadreRatioDeficit: true,
      sacHearingScheduled: true
    },
    policyRevisionId: 'POL_2026_EVC_SAC_SHC_APPEAL',
    state: 'rescrutiny_pending',
    route: {
      policyRevisionId: 'POL_2026_EVC_SAC_SHC_APPEAL',
      session: '2026-2027',
      category: 'deficiency_appeal',
      evaluatedFacts: { standingAppealsHearingRequested: true },
      result: 'selected',
      stages: ['submitted', 'scrutiny_pending', 'evc_pending', 'rescrutiny_pending', 'decision_pending'],
      reasons: ['APH §1.11 & 2026-27 Addendum G02 p. 11 §2.23.3: Contested EVC deficiencies referred to Standing Appellate Committee (SAC) / SHC for personal hearing and Re-EVC order'],
      sources: [SRC_APH_2026_ERRATA]
    },
    version: 2,
    stageEnteredAt: '2026-10-24T00:00:00.000Z',
    createdAt: '2026-10-18T00:00:00.000Z',
    updatedAt: '2026-10-24T00:00:00.000Z'
  },
  // College 5: BATU Lonere - Only EVC (Restoration / Break-in-EoA / Site Shifting per APH §2.16.1 & §2.17(e))
  {
    id: 'APP-2026-BATU',
    reference: '1-19201481001',
    institutionId: 'INST-BATU',
    regionId: 'Western',
    category: 'restoration_or_shifting',
    session: '2026-2027',
    facts: {
      institutionName: 'Dr. Babasaheb Ambedkar Technological University (BATU Lonere)',
      permanentInstituteId: '1-19201481',
      program: 'Engineering & Technology',
      course: 'Chemical Engineering',
      currentIntake: 60,
      proposedIntake: 120,
      siteVerificationRequired: true
    },
    policyRevisionId: 'POL_2026_ONLY_EVC_RESTORATION',
    state: 'evc_pending',
    route: {
      policyRevisionId: 'POL_2026_ONLY_EVC_RESTORATION',
      session: '2026-2027',
      category: 'restoration_or_shifting',
      evaluatedFacts: { siteVerificationRequired: true },
      result: 'selected',
      stages: ['submitted', 'evc_pending', 'decision_pending'],
      reasons: ['APH 2024-27 §§2.16.1(c)/(d) & §2.17(e): Restoration / Site Shifting mandates physical on-site EVC inspection only, waiving preliminary desk scrutiny'],
      sources: [SRC_APH_2024_27]
    },
    version: 1,
    stageEnteredAt: '2026-10-24T00:00:00.000Z',
    createdAt: '2026-10-19T00:00:00.000Z',
    updatedAt: '2026-10-24T00:00:00.000Z'
  }
];

export const GIITS_SCRUTINY_SNAPSHOT: ScrutinySnapshot = {
  id: '2-SOC1770029225',
  applicationId: 'APP-2026-GIITS',
  round: 1,
  checklistVersion: 'v2026.1',
  items: [
    {
      itemId: 'C3',
      result: 'accepted',
      reason: '30-year registered land conversion & clear title deed verified by Scrutiny Committee',
      evidenceVersionIds: ['DOC-GIITS-C3']
    },
    {
      itemId: 'C4',
      result: 'accepted',
      reason: 'Municipal approved structural stability & occupancy certificate verified',
      evidenceVersionIds: ['DOC-GIITS-C4']
    },
    {
      itemId: 'D1',
      result: 'deficient',
      reason: 'Cadre ratio deficit: Professor shortfall in CSE/IT (2 required, 0 available)',
      evidenceVersionIds: ['DOC-GIITS-D1']
    },
    {
      itemId: 'D2',
      result: 'deficient',
      reason: 'Fire Safety NOC expires in 14 days (<60-day renewal submission threshold)',
      evidenceVersionIds: ['DOC-GIITS-D2']
    }
  ],
  deficiencyItemIds: ['D1', 'D2'],
  signedBy: 'SYN-ACTOR-RO',
  signedAt: '2026-10-23T14:30:00.000Z'
};

export const CANONICAL_OBLIGATIONS: Obligation[] = [
  // Obligation 1: 30-Year Land Lease expiring in 12 days (05-NOV-2026)
  {
    id: 'OBL-PDIMTR-LEASE',
    applicationId: 'APP-2026-PDIMTR',
    decisionEventId: 'EVT-DEC-PDIMTR',
    conditionKey: 'COND-LAND-LEASE-RENEWAL',
    institutionId: 'INST-WEST',
    policyRevisionId: 'POL_2026_EOA_SELF_DISCLOSURE',
    triggerEventId: 'EVT-TRIG-01',
    source: SRC_APH_2024_27,
    timerKind: 'validity_expiry',
    dueAt: '2026-11-05T00:00:00.000Z',
    dueReason: '30-Year registered lease registered 05-NOV-1996 expires 05-NOV-2026',
    version: 1,
    status: 'pending'
  },
  // Obligation 2: 1-Year Fire Safety NOC with 60-day advance renewal rule
  {
    id: 'OBL-PDIMTR-FIRE-NOC',
    applicationId: 'APP-2026-PDIMTR',
    decisionEventId: 'EVT-DEC-PDIMTR',
    conditionKey: 'COND-FIRE-NOC-RENEWAL',
    institutionId: 'INST-WEST',
    policyRevisionId: 'POL_2026_EOA_SELF_DISCLOSURE',
    triggerEventId: 'EVT-TRIG-02',
    source: SRC_APH_2024_27,
    timerKind: 'validity_expiry',
    dueAt: '2026-11-24T00:00:00.000Z',
    dueReason: 'Annual Fire Safety NOC requires 60-day advance renewal renewal submission',
    version: 1,
    status: 'pending'
  },
  // Obligation 3: 6-Month Faculty Deficiency Undertaking
  {
    id: 'OBL-PDIMTR-FACULTY',
    applicationId: 'APP-2026-PDIMTR',
    decisionEventId: 'EVT-DEC-PDIMTR',
    conditionKey: 'COND-FACULTY-CADRE-UNDERTAKING',
    institutionId: 'INST-WEST',
    policyRevisionId: 'POL_2026_EOA_SELF_DISCLOSURE',
    triggerEventId: 'EVT-TRIG-03',
    source: SRC_APH_2024_27,
    timerKind: 'event_relative',
    dueAt: '2027-04-24T00:00:00.000Z',
    dueReason: '6-Month faculty appointment undertaking per Conditional EoA letter clause (UBDTCE Davangere Precedent, F.No. South-West/1-10970417826/2022/EOA per APH §2.25(c)/(f))',
    version: 1,
    status: 'pending'
  }
];

export const CANONICAL_DECISIONS: Decision[] = [
  {
    id: 'DEC-2026-PDIMTR',
    applicationId: 'APP-2026-PDIMTR',
    actorId: 'SYN-ACTOR-BUREAU',
    outcome: 'conditional',
    policyRevisionId: 'POL_2026_EOA_SELF_DISCLOSURE',
    source: SRC_APH_2024_27,
    decidedAt: '2026-10-24T00:00:00.000Z',
    eventId: 'EVT-DEC-PDIMTR',
    evidenceVersionIds: ['DOC-EV-01'],
    conditions: [
      {
        conditionKey: 'COND-LAND-LEASE-RENEWAL',
        policyRevisionId: 'POL_2026_EOA_SELF_DISCLOSURE',
        source: SRC_APH_2024_27,
        obligationType: 'LAND_LEASE',
        triggerEventId: 'EVT-TRIG-01',
        timerKind: 'validity_expiry',
        dueAt: '2026-11-05T00:00:00.000Z',
        dueReason: '30-Year registered lease registered 05-NOV-1996 expires 05-NOV-2026'
      },
      {
        conditionKey: 'COND-FIRE-NOC-RENEWAL',
        policyRevisionId: 'POL_2026_EOA_SELF_DISCLOSURE',
        source: SRC_APH_2024_27,
        obligationType: 'SAFETY_NOC',
        triggerEventId: 'EVT-TRIG-02',
        timerKind: 'validity_expiry',
        dueAt: '2026-11-24T00:00:00.000Z',
        dueReason: 'Annual Fire Safety NOC requires 60-day advance renewal renewal submission'
      },
      {
        conditionKey: 'COND-FACULTY-CADRE-UNDERTAKING',
        policyRevisionId: 'POL_2026_EOA_SELF_DISCLOSURE',
        source: SRC_APH_2024_27,
        obligationType: 'FACULTY_DEFICIT',
        triggerEventId: 'EVT-TRIG-03',
        timerKind: 'event_relative',
        dueAt: '2027-04-24T00:00:00.000Z',
        dueReason: '6-Month faculty appointment undertaking per Conditional EoA letter clause (UBDTCE Davangere Precedent, F.No. South-West/1-10970417826/2022/EOA per APH §2.25(c)/(f))'
      }
    ]
  }
];

export const CANONICAL_EVC_TASKS: EVCTask[] = [
  {
    id: '2-SOC1774344316',
    applicationId: 'APP-2026-GIITS',
    prerequisiteEventId: 'EVT-SCRUTINY-2-SOC1770029225',
    policyRevisionId: 'POL_2026_INTAKE_NON_NBA',
    assigneeIds: ['SYN-ACTOR-EVC'],
    version: 1,
    status: 'scheduled',
    scheduledAt: '2026-10-28T10:00:00.000Z'
  }
];

export function getCanonicalSeedState(): Partial<MemoryDbState> {
  const genesisAudit: AuditEvent = {
    id: 'AUDIT-GENESIS-2026',
    occurredAt: '2026-10-24T00:00:00.000Z',
    actorId: 'SYN-ACTOR-ADMIN',
    requestId: 'REQ-GENESIS',
    action: 'CANONICAL_SEED_INITIALIZED',
    reason: 'Seeded 5 canonical SIH-26 AICTE college cases into companion runtime',
    caseVersion: 1,
    beforeState: 'submitted',
    afterState: 'submitted',
    evidenceVersionIds: []
  };

  return {
    cases: structuredClone(CANONICAL_APPLICATIONS),
    institutions: structuredClone(CANONICAL_INSTITUTIONS),
    policies: structuredClone(APPROVED_2026_POLICIES),
    scrutinySnapshots: [structuredClone(GIITS_SCRUTINY_SNAPSHOT)],
    obligations: structuredClone(CANONICAL_OBLIGATIONS),
    decisions: structuredClone(CANONICAL_DECISIONS),
    evcTasks: structuredClone(CANONICAL_EVC_TASKS),
    audit: [genesisAudit],
    receipts: [],
    outbox: []
  };
}
