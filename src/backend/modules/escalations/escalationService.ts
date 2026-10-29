/**
 * NIYAMSETU (नियमसेतु) — Automated Escalation Service with Strict Tenant Scoping
 * SIH 2026 | Problem Statement 26262: AICTE Approval Workflow Automation
 */

import type { Actor } from '../../../shared/contracts';

export interface BackendEscalation {
  id: string;
  applicationId: string;
  applicationNumber: string;
  institutionId: string;
  institutionName: string;
  region: string;
  currentStage: string;
  escalationReason: string;
  previousAuthority: string;
  escalatedTo: string;
  escalationTimestamp: string;
  status: 'Escalated - Action Required' | 'Under Investigation' | 'Resolved';
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

const CANONICAL_ESCALATIONS: BackendEscalation[] = [
  {
    id: 'ESC-GIITS-01',
    applicationId: 'APP-2026-GIITS',
    applicationNumber: '1-46258917694',
    institutionId: 'INST-NORTH',
    institutionName: 'Gonna Institute of Information Technology and Sciences (GIITS)',
    region: 'South-Central',
    currentStage: 'Deficiency Communicated',
    escalationReason:
      'Faculty Cadre Ratio deficit (1:2.4) deficiency cure pending > 7 days; approaching 10-day operational SLA turnaround deadline under APH §1.8 (Statutory 15-day deposit clock applies under §2.25(f))',
    previousAuthority: 'Desk Scrutiny Committee Cell',
    escalatedTo: 'Regional Officer (South-Central Region)',
    escalationTimestamp: '2026-10-23T14:30:00.000Z',
    status: 'Escalated - Action Required'
  },
  {
    id: 'ESC-BATU-02',
    applicationId: 'APP-2026-BATU',
    applicationNumber: '1-19201481001',
    institutionId: 'INST-BATU',
    institutionName: 'Dr. Babasaheb Ambedkar Technological University (BATU Lonere)',
    region: 'Western',
    currentStage: 'EVC Scheduled',
    escalationReason:
      'Physical EVC inspection mandate unfulfilled for 12 days; approaching 14-day SLA deadline per APH §2.16.1',
    previousAuthority: 'Regional Office Operations Desk',
    escalatedTo: 'EVC Inspection Committee Cell (Dr. R. K. Soni, EVC Chair)',
    escalationTimestamp: '2026-10-24T09:15:00.000Z',
    status: 'Escalated - Action Required'
  },
  {
    id: 'ESC-PDIMTR-03',
    applicationId: 'APP-2026-PDIMTR',
    applicationNumber: '1-10970417855',
    institutionId: 'INST-PDIMTR',
    institutionName: 'Prerna / Univ BDT College of Engineering (PDIMTR)',
    region: 'Western',
    currentStage: 'Approval Issued',
    escalationReason:
      '30-Year Registered Lease deed validity expires in 30 days; time-bound undertaking renewal pending under APH Table 1',
    previousAuthority: 'Compliance & Undertakings Engine',
    escalatedTo: 'Competent Authority Chamber (Member Secretary, AICTE)',
    escalationTimestamp: '2026-10-24T11:00:00.000Z',
    status: 'Under Investigation'
  }
];

let escalationStore: BackendEscalation[] = structuredClone(CANONICAL_ESCALATIONS);

export function resetEscalationStore(): void {
  escalationStore = structuredClone(CANONICAL_ESCALATIONS);
}

/**
 * Return escalations filtered strictly by the calling actor's tenant authorization.
 * Global authorities see all; institutions see only their own cases.
 */
export function getEscalationsForActor(actor: Actor): BackendEscalation[] {
  if (actor.scope === 'global') {
    return structuredClone(escalationStore);
  }

  // Scoped institution actor
  const allowedInstitutions = actor.institutionIds || [];
  return escalationStore
    .filter((e) => allowedInstitutions.includes(e.institutionId))
    .map((e) => structuredClone(e));
}

/**
 * Fetch a single escalation with strict cross-tenant access enforcement.
 */
export function getEscalationById(
  actor: Actor,
  id: string
): { escalation?: BackendEscalation; error?: 'NOT_FOUND' | 'FORBIDDEN' } {
  const item = escalationStore.find((e) => e.id === id);
  if (!item) {
    return { error: 'NOT_FOUND' };
  }

  if (actor.scope === 'scoped') {
    const allowed = actor.institutionIds || [];
    if (!allowed.includes(item.institutionId)) {
      return { error: 'FORBIDDEN' };
    }
  }

  return { escalation: structuredClone(item) };
}

/**
 * Resolve an escalation. Only authorized regulatory officers can record resolution.
 */
export function resolveEscalationRecord(
  actor: Actor,
  id: string,
  notes: string
): { escalation?: BackendEscalation; error?: 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION_FAILED' } {
  if (
    !actor.roles.some((r) =>
      ['bureau_officer', 'regional_officer', 'reviewer', 'demo_authority', 'policy_admin', 'admin'].includes(r)
    )
  ) {
    return { error: 'FORBIDDEN' };
  }

  if (!notes || notes.trim().length < 3) {
    return { error: 'VALIDATION_FAILED' };
  }

  const item = escalationStore.find((e) => e.id === id);
  if (!item) {
    return { error: 'NOT_FOUND' };
  }

  item.status = 'Resolved';
  item.resolutionNotes = notes.trim();
  item.resolvedAt = new Date().toISOString();
  item.resolvedBy = actor.id;

  return { escalation: structuredClone(item) };
}
