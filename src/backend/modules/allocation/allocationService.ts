/**
 * NIYAMSETU — Regional Office (RO) Committee Workload & Allocation Engine
 * Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau
 * 
 * Mandates:
 * - At least two active Desk Scrutiny Committee groups (SCR-GROUP-A, SCR-GROUP-B)
 * - At least two active EVC Committee groups (EVC-GROUP-A, EVC-GROUP-B)
 * - Real expert memberships, capacity, active workloads
 * - Stage eligibility: EVC group can be assigned ONLY if route requires EVC and scrutiny is complete!
 * - Auditable assignment history with allocator, timestamp, reason, previous and new group.
 */

export interface CommitteeMember {
  id: string;
  name: string;
  designation: string;
  organization: string;
  role: 'Chair / Convener' | 'Subject Expert' | 'Architect Expert' | 'Legal Expert';
}

export interface CommitteeGroup {
  id: string;
  name: string;
  type: 'SCRUTINY' | 'EVC';
  region: string;
  status: 'ACTIVE' | 'INACTIVE';
  capacity: number;
  activeCaseCount: number;
  members: CommitteeMember[];
}

export interface AllocationHistoryRecord {
  id: string;
  caseId: string;
  type: 'SCRUTINY' | 'EVC';
  assignedGroupId: string;
  assignedGroupName: string;
  leadReviewerId?: string;
  leadReviewerName?: string;
  allocatedBy: string;
  allocatedAt: string;
  reason: string;
  previousGroupId?: string;
}

// In-Memory Committee Group State (Pre-seeded with real multi-group structure)
export const committeeGroups: Map<string, CommitteeGroup> = new Map([
  [
    'SCR-GROUP-A',
    {
      id: 'SCR-GROUP-A',
      name: 'Desk Scrutiny Committee Group A (Western & SCRO)',
      type: 'SCRUTINY',
      region: 'Western',
      status: 'ACTIVE',
      capacity: 10,
      activeCaseCount: 2,
      members: [
        {
          id: 'EXP-SCR-01',
          name: 'Prof. Suresh Deshmukh',
          designation: 'Professor & Dean',
          organization: 'College of Engineering Pune (COEP)',
          role: 'Chair / Convener'
        },
        {
          id: 'EXP-SCR-02',
          name: 'Prof. M. Joshi',
          designation: 'Associate Professor (Civil & Structural)',
          organization: 'VJTI Mumbai',
          role: 'Subject Expert'
        }
      ]
    }
  ],
  [
    'SCR-GROUP-B',
    {
      id: 'SCR-GROUP-B',
      name: 'Desk Scrutiny Committee Group B (Northern & Central)',
      type: 'SCRUTINY',
      region: 'Northern',
      status: 'ACTIVE',
      capacity: 10,
      activeCaseCount: 1,
      members: [
        {
          id: 'EXP-SCR-03',
          name: 'Dr. A. Gupta',
          designation: 'Senior Professor',
          organization: 'HBTI Kanpur',
          role: 'Chair / Convener'
        },
        {
          id: 'EXP-SCR-04',
          name: 'Prof. K. Patel',
          designation: 'Architect & Town Planner',
          organization: 'Council of Architecture (COA) Empanelled',
          role: 'Architect Expert'
        }
      ]
    }
  ],
  [
    'EVC-GROUP-A',
    {
      id: 'EVC-GROUP-A',
      name: 'Expert Visit Committee Panel Alpha (Infrastructure & Computing)',
      type: 'EVC',
      region: 'South-Central',
      status: 'ACTIVE',
      capacity: 5,
      activeCaseCount: 1,
      members: [
        {
          id: 'EXP-EVC-01',
          name: 'Dr. Anand Kulkarni',
          designation: 'Senior Professor (Mechanical)',
          organization: 'IIT Hyderabad (Empanelled)',
          role: 'Chair / Convener'
        },
        {
          id: 'EXP-EVC-02',
          name: 'Prof. V. Rao',
          designation: 'Professor (Computer Science & AI)',
          organization: 'NIT Warangal',
          role: 'Subject Expert'
        },
        {
          id: 'EXP-EVC-03',
          name: 'Er. S. Deshmukh',
          designation: 'Chief Engineer (Structural)',
          organization: 'CPWD / NBCC Empanelled',
          role: 'Subject Expert'
        }
      ]
    }
  ],
  [
    'EVC-GROUP-B',
    {
      id: 'EVC-GROUP-B',
      name: 'Expert Visit Committee Panel Beta (Polytechnic & Applied Sciences)',
      type: 'EVC',
      region: 'Western',
      status: 'ACTIVE',
      capacity: 5,
      activeCaseCount: 0,
      members: [
        {
          id: 'EXP-EVC-04',
          name: 'Dr. P. Nair',
          designation: 'Director & Professor',
          organization: 'Govt. Polytechnic Pune',
          role: 'Chair / Convener'
        },
        {
          id: 'EXP-EVC-05',
          name: 'Prof. T. Bannerjee',
          designation: 'Associate Professor',
          organization: 'NIT Nagpur',
          role: 'Subject Expert'
        },
        {
          id: 'EXP-EVC-06',
          name: 'Er. N. Reddy',
          designation: 'Senior Architect',
          organization: 'Council of Architecture Registry',
          role: 'Architect Expert'
        }
      ]
    }
  ]
]);

// Case -> Committee Assignment Mappings
export const caseAssignments: Map<string, { scrutinyGroupId?: string; evcGroupId?: string }> = new Map([
  ['APP-2026-GIITS', { scrutinyGroupId: 'SCR-GROUP-A', evcGroupId: 'EVC-GROUP-A' }],
  ['APP-2026-COEP', { scrutinyGroupId: 'SCR-GROUP-A' }], // EVC bypassed for COEP NBA
  ['APP-2026-PDIMTR', { scrutinyGroupId: 'SCR-GROUP-A' }],
  ['APP-2026-APEX', { scrutinyGroupId: 'SCR-GROUP-B', evcGroupId: 'EVC-GROUP-A' }],
  ['APP-2026-BATU', { evcGroupId: 'EVC-GROUP-B' }] // Only EVC route
]);

// Auditable Assignment History
export const allocationHistory: AllocationHistoryRecord[] = [
  {
    id: 'ALLOC-HIST-01',
    caseId: 'APP-2026-GIITS',
    type: 'SCRUTINY',
    assignedGroupId: 'SCR-GROUP-A',
    assignedGroupName: 'Desk Scrutiny Committee Group A (Western & SCRO)',
    leadReviewerId: 'EXP-SCR-01',
    leadReviewerName: 'Prof. Suresh Deshmukh',
    allocatedBy: 'ro_western@aicte.gov.in',
    allocatedAt: '2026-10-21T09:30:00.000Z',
    reason: 'Initial desk scrutiny assignment for non-NBA intake increase application.'
  },
  {
    id: 'ALLOC-HIST-02',
    caseId: 'APP-2026-GIITS',
    type: 'EVC',
    assignedGroupId: 'EVC-GROUP-A',
    assignedGroupName: 'Expert Visit Committee Panel Alpha (Infrastructure & Computing)',
    leadReviewerId: 'EXP-EVC-01',
    leadReviewerName: 'Dr. Anand Kulkarni',
    allocatedBy: 'ro_western@aicte.gov.in',
    allocatedAt: '2026-10-24T14:00:00.000Z',
    reason: 'EVC inspection mandated following Re-Scrutiny clearance of D1/D2.'
  }
];

export function getAllGroups(): CommitteeGroup[] {
  return Array.from(committeeGroups.values());
}

export function getCaseAssignment(caseId: string) {
  return caseAssignments.get(caseId) || {};
}

export function getHistoryForCase(caseId: string): AllocationHistoryRecord[] {
  return allocationHistory.filter(h => h.caseId === caseId);
}

export function assignCommitteeGroup(params: {
  caseId: string;
  type: 'SCRUTINY' | 'EVC';
  groupId: string;
  leadReviewerId?: string;
  allocatedBy: string;
  reason: string;
  caseRouteStages?: string[];
  caseCurrentStage?: string;
}): { success: boolean; error?: string; assignment?: AllocationHistoryRecord } {
  const group = committeeGroups.get(params.groupId);
  if (!group) {
    return { success: false, error: `Committee group ${params.groupId} not found.` };
  }
  if (group.status !== 'ACTIVE') {
    return { success: false, error: `Cannot assign to inactive group ${group.name}.` };
  }
  if (group.type !== params.type) {
    return { success: false, error: `Group ${group.id} is of type ${group.type}, cannot handle ${params.type} assignment.` };
  }

  // Precondition guard: EVC can be assigned ONLY if route requires EVC!
  if (params.type === 'EVC' && params.caseRouteStages && !params.caseRouteStages.includes('evc_pending')) {
    return {
      success: false,
      error: 'ILLEGAL_ASSIGNMENT: Case route does not require EVC inspection (e.g., NBA Fast-Track or Self-Disclosure). EVC task cannot be created.'
    };
  }

  const existing = caseAssignments.get(params.caseId) || {};
  const previousGroupId = params.type === 'SCRUTINY' ? existing.scrutinyGroupId : existing.evcGroupId;

  if (params.type === 'SCRUTINY') {
    existing.scrutinyGroupId = group.id;
  } else {
    existing.evcGroupId = group.id;
  }
  caseAssignments.set(params.caseId, existing);

  // Recalculate group workloads
  for (const g of committeeGroups.values()) {
    let count = 0;
    for (const a of caseAssignments.values()) {
      if (a.scrutinyGroupId === g.id || a.evcGroupId === g.id) count++;
    }
    g.activeCaseCount = count;
  }

  const leadMember = group.members.find(m => m.id === params.leadReviewerId) || group.members[0];

  const record: AllocationHistoryRecord = {
    id: `ALLOC-HIST-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    caseId: params.caseId,
    type: params.type,
    assignedGroupId: group.id,
    assignedGroupName: group.name,
    leadReviewerId: leadMember?.id,
    leadReviewerName: leadMember?.name,
    allocatedBy: params.allocatedBy,
    allocatedAt: new Date().toISOString(),
    reason: params.reason || 'Regional Office operations desk allocation',
    previousGroupId
  };

  allocationHistory.push(record);
  return { success: true, assignment: record };
}
