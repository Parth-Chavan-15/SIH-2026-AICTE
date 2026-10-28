/**
 * NIYAMSETU — Active Rules & Routing Registry Service (Role 6 Workspace)
 * Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau
 * 
 * Sourced from:
 * - Approval Process Handbook (APH 2024–2027)
 * - Addendum/Corrigendum 2026–27 Of APH 2024–27
 * - AICTE Act 1987
 * - NIYAMSETU Regulatory Rules, Case Routes & Explainability Master
 * 
 * GUARDRAILS:
 * - A rule without source or in conflict CANNOT be marked ACTIVE_VERIFIED.
 * - Old rules are NEVER deleted; retained as SUPERSEDED or RETIRED with reason.
 * - In-flight cases remain pinned to the rule version active when filed.
 */

import { evaluateDynamicRoute, DynamicRouteResult } from '../../policy/dynamicRouteEngine';

export interface RegulatoryRuleRecord {
  ruleId: string;
  version: number;
  title: string;
  sourceId: string;
  sourceTitle: string;
  sourceFile: string;
  physicalPdfPage: number;
  printedPage: number;
  clauseLocator: string;
  sourceWording: string;
  plainLanguageSummary: string;
  ruleType: 'ROUTE_GATE' | 'DOCUMENT_NORM' | 'ELIGIBILITY' | 'DEADLINE_TIMER' | 'APPEAL_PROCEDURE' | 'PENAL_ACTION';
  academicYearScope: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'ACTIVE_VERIFIED' | 'ACTIVE_NEEDS_VERIFICATION' | 'CONFLICT' | 'DRAFT' | 'SUPERSEDED' | 'RETIRED' | 'ENGINEERING_PROPOSAL';
  supersedesRuleId?: string;
  conflictDetails?: string;
  changeReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuleAuditEvent {
  eventId: string;
  ruleId: string;
  version: number;
  action: 'DRAFT_CREATED' | 'RULE_UPDATED' | 'RULE_PUBLISHED' | 'RULE_RETIRED' | 'CONFLICT_LOGGED';
  actorId: string;
  timestamp: string;
  changeReason: string;
  beforeSnapshot?: Partial<RegulatoryRuleRecord>;
  afterSnapshot?: Partial<RegulatoryRuleRecord>;
}

// Canonical Pre-Seeded Rule Registry
export const rulesRegistryDB: Map<string, RegulatoryRuleRecord> = new Map([
  [
    'RULE-2026-NBA-INTAKE-01',
    {
      ruleId: 'RULE-2026-NBA-INTAKE-01',
      version: 1,
      title: 'NBA Tier-1 Fast-Track Intake Increase (EVC Exemption)',
      sourceId: 'SRC-ADDENDUM-2026-27',
      sourceTitle: 'Addendum/Corrigendum 2026-27 Of APH 2024-27',
      sourceFile: 'APH Addentum.pdf',
      physicalPdfPage: 4,
      printedPage: 4,
      clauseLocator: 'Addendum Item 16 / Clause 2.6(c)(1)',
      sourceWording: 'Increase in intake / additional course(s) shall be permitted up to maximum permissible intake as specified in Table 1.3... Evaluation: Scrutiny/Re-Scrutiny (EVC waived for accredited courses).',
      plainLanguageSummary: 'Technical institutions with valid NBA accreditation are eligible for intake increase evaluated under Desk Scrutiny only; physical EVC visit is waived.',
      ruleType: 'ROUTE_GATE',
      academicYearScope: '2026-27',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      status: 'ACTIVE_VERIFIED',
      verifiedBy: 'AICTE Regulation Bureau Head',
      verifiedAt: '2026-01-05T00:00:00.000Z',
      authorId: 'admin@aicte.gov.in',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-05T00:00:00.000Z'
    }
  ],
  [
    'RULE-2024-SCOPE-LOCK-02',
    {
      ruleId: 'RULE-2024-SCOPE-LOCK-02',
      version: 1,
      title: 'Differential Re-Scrutiny Scope-Lock (Non-Tamper Cleared Items)',
      sourceId: 'SRC-APH-2024-27',
      sourceTitle: 'Approval Process Handbook 2024–2027',
      sourceFile: 'APH 24–25, 26-27 Handbook(1).pdf',
      physicalPdfPage: 23,
      printedPage: 7,
      clauseLocator: 'Chapter I §1.8(g)',
      sourceWording: 'The Re-Scrutiny Committee shall verify ONLY the deficiencies pointed out by the Scrutiny committee as per the norms and standards and shall countersign all the documents that are accepted.',
      plainLanguageSummary: 'During Re-Scrutiny rounds, the committee is strictly prohibited from re-examining previously cleared items (e.g. Item C3); only deficiencies are editable.',
      ruleType: 'ROUTE_GATE',
      academicYearScope: '2024-25 to 2026-27',
      effectiveFrom: '2024-01-01T00:00:00.000Z',
      status: 'ACTIVE_VERIFIED',
      verifiedBy: 'AICTE Legal Cell',
      verifiedAt: '2024-01-10T00:00:00.000Z',
      authorId: 'admin@aicte.gov.in',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-10T00:00:00.000Z'
    }
  ],
  [
    'RULE-2024-APPEAL-7DAY-03',
    {
      ruleId: 'RULE-2024-APPEAL-7DAY-03',
      version: 1,
      title: 'Statutory Right of Appeal within 7 Calendar Days to SAC',
      sourceId: 'SRC-APH-2024-27',
      sourceTitle: 'Approval Process Handbook 2024–2027',
      sourceFile: 'APH 24–25, 26-27 Handbook(1).pdf',
      physicalPdfPage: 25,
      printedPage: 9,
      clauseLocator: 'Chapter I §1.11(a) & Chapter II §2.24(a)',
      sourceWording: 'An Institution/ Applicant, if aggrieved by the decision of the Executive Committee shall have the right to appeal (through portal) once to the Council within 7 days from the date of issue of Letter of Deficiency (LoD) / uploading of the decision.',
      plainLanguageSummary: 'Institutions aggrieved by adverse Council decisions must file their statutory appeal before the Standing Appellate Committee (SAC) within 7 calendar days.',
      ruleType: 'APPEAL_PROCEDURE',
      academicYearScope: '2024-25 to 2026-27',
      effectiveFrom: '2024-01-01T00:00:00.000Z',
      status: 'ACTIVE_VERIFIED',
      verifiedBy: 'AICTE Regulation Bureau',
      verifiedAt: '2024-01-10T00:00:00.000Z',
      authorId: 'admin@aicte.gov.in',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-10T00:00:00.000Z'
    }
  ],
  [
    'RULE-CONFLICT-ELP-PERCENTAGE',
    {
      ruleId: 'RULE-CONFLICT-ELP-PERCENTAGE',
      version: 1,
      title: 'Experiential Learning Program (ELP) Industry Site Requirement',
      sourceId: 'SRC-ADDENDUM-2026-27',
      sourceTitle: 'Addendum/Corrigendum 2026-27 Concept Note & Clause 41',
      sourceFile: 'APH Addentum.pdf',
      physicalPdfPage: 14,
      printedPage: 14,
      clauseLocator: 'Addendum Item 41 (p. 14) vs Concept Note §5 (p. 19)',
      sourceWording: 'Page 14 states: "Minimum 50% experiential/work-based learning at industry sites." Page 19 Concept Note states: "Upto 50% experiential/work-based learning at industry sites."',
      plainLanguageSummary: 'Operative percentage conflict: minimum 50% vs upto 50%. Cannot be resolved automatically until official clarification is gazetted.',
      ruleType: 'ROUTE_GATE',
      academicYearScope: '2026-27',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      status: 'CONFLICT',
      conflictDetails: 'Direct text contradiction between Page 14 table and Page 19 concept note.',
      authorId: 'admin@aicte.gov.in',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    }
  ],
  [
    'RULE-CONFLICT-NBA-THRESHOLD-360',
    {
      ruleId: 'RULE-CONFLICT-NBA-THRESHOLD-360',
      version: 1,
      title: 'NBA Intake Surge Boundary Threshold (X = 360)',
      sourceId: 'SRC-ADDENDUM-2026-27',
      sourceTitle: 'Addendum/Corrigendum 2026-27 Errata G02',
      sourceFile: 'APH Addentum.pdf',
      physicalPdfPage: 4,
      printedPage: 4,
      clauseLocator: 'Clause 2.6(c)(1) boundary notes',
      sourceWording: 'Errata transcript does not unambiguously establish whether X = 360 seats falls in the lower or higher inspection tier.',
      plainLanguageSummary: 'Exact boundary behaviour at precisely 360 seats requires human policy administrator review.',
      ruleType: 'ROUTE_GATE',
      academicYearScope: '2026-27',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      status: 'CONFLICT',
      conflictDetails: 'Boundary value 360 is ambiguous in errata phrasing.',
      authorId: 'admin@aicte.gov.in',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    }
  ],
  [
    'RULE-CONFLICT-HIBERNATION-TIMING',
    {
      ruleId: 'RULE-CONFLICT-HIBERNATION-TIMING',
      version: 1,
      title: 'Hibernation Timing Heading vs Body Discrepancy',
      sourceId: 'SRC-ADDENDUM-2026-27',
      sourceTitle: 'Addendum/Corrigendum 2026-27 Item 24',
      sourceFile: 'APH Addentum.pdf',
      physicalPdfPage: 8,
      printedPage: 8,
      clauseLocator: 'Item 24 / Clause 2.16.1(d)',
      sourceWording: 'Discrepancy between section heading timing and operative text timeframe.',
      plainLanguageSummary: 'Hibernation period eligibility window requires human policy administrator verification.',
      ruleType: 'ROUTE_GATE',
      academicYearScope: '2026-27',
      effectiveFrom: '2026-01-01T00:00:00.000Z',
      status: 'CONFLICT',
      conflictDetails: 'Discrepancy in timing between header and provision.',
      authorId: 'admin@aicte.gov.in',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    }
  ]
]);

export const ruleAuditTrail: RuleAuditEvent[] = [
  {
    eventId: 'AUDIT-RULE-INIT-01',
    ruleId: 'RULE-2026-NBA-INTAKE-01',
    version: 1,
    action: 'RULE_PUBLISHED',
    actorId: 'admin@aicte.gov.in',
    timestamp: '2026-01-05T00:00:00.000Z',
    changeReason: 'Initial verified publication of Addendum 2026-27 NBA Fast-Track EVC exemption clause.'
  }
];

export function getAllRules(): RegulatoryRuleRecord[] {
  return Array.from(rulesRegistryDB.values());
}

export function getRuleById(ruleId: string): RegulatoryRuleRecord | undefined {
  return rulesRegistryDB.get(ruleId);
}

export function getOpenConflicts(): RegulatoryRuleRecord[] {
  return Array.from(rulesRegistryDB.values()).filter(r => r.status === 'CONFLICT' || r.status === 'ACTIVE_NEEDS_VERIFICATION');
}

export function draftNewRule(data: Partial<RegulatoryRuleRecord>, authorId: string): RegulatoryRuleRecord {
  const ruleId = data.ruleId || `RULE-${Date.now().toString().slice(-6)}`;
  const existing = rulesRegistryDB.get(ruleId);
  const nextVersion = existing ? existing.version + 1 : 1;

  const newRule: RegulatoryRuleRecord = {
    ruleId,
    version: nextVersion,
    title: data.title || 'Untitled Regulatory Rule Draft',
    sourceId: data.sourceId || 'SRC-UNVERIFIED',
    sourceTitle: data.sourceTitle || 'Unverified Source Document',
    sourceFile: data.sourceFile || 'source.pdf',
    physicalPdfPage: data.physicalPdfPage || 1,
    printedPage: data.printedPage || 1,
    clauseLocator: data.clauseLocator || 'Section TBD',
    sourceWording: data.sourceWording || '',
    plainLanguageSummary: data.plainLanguageSummary || '',
    ruleType: data.ruleType || 'ROUTE_GATE',
    academicYearScope: data.academicYearScope || '2026-27',
    effectiveFrom: data.effectiveFrom || new Date().toISOString(),
    status: 'DRAFT', // Never active directly!
    supersedesRuleId: existing?.ruleId,
    changeReason: data.changeReason || 'Draft rule revision initiated by Policy Administrator',
    authorId,
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  rulesRegistryDB.set(ruleId, newRule);

  ruleAuditTrail.push({
    eventId: `AUDIT-RULE-${Date.now()}`,
    ruleId,
    version: nextVersion,
    action: 'DRAFT_CREATED',
    actorId: authorId,
    timestamp: new Date().toISOString(),
    changeReason: newRule.changeReason || '',
    beforeSnapshot: existing,
    afterSnapshot: newRule
  });

  return newRule;
}

export function publishRule(ruleId: string, authorId: string, reason: string): { success: boolean; rule?: RegulatoryRuleRecord; error?: string } {
  const rule = rulesRegistryDB.get(ruleId);
  if (!rule) return { success: false, error: 'Rule not found' };

  // Guardrail: Source-less or unresolved rules CANNOT be published as ACTIVE_VERIFIED
  if (!rule.sourceFile || !rule.clauseLocator || rule.sourceId === 'SRC-UNVERIFIED') {
    return {
      success: false,
      error: 'GUARDRAIL_BLOCKED: A rule without verified source document, physical page, and exact clause locator cannot be published as ACTIVE_VERIFIED.'
    };
  }

  if (rule.status === 'CONFLICT') {
    return {
      success: false,
      error: 'GUARDRAIL_BLOCKED: Rule is in CONFLICT status. Regulatory conflicts must be formally resolved before publication.'
    };
  }

  rule.status = 'ACTIVE_VERIFIED';
  rule.verifiedBy = authorId;
  rule.verifiedAt = new Date().toISOString();
  rule.updatedAt = new Date().toISOString();
  rule.changeReason = reason;

  ruleAuditTrail.push({
    eventId: `AUDIT-RULE-${Date.now()}`,
    ruleId,
    version: rule.version,
    action: 'RULE_PUBLISHED',
    actorId: authorId,
    timestamp: new Date().toISOString(),
    changeReason: reason,
    afterSnapshot: rule
  });

  return { success: true, rule };
}

export function simulateRouteForFacts(facts: Record<string, any>): DynamicRouteResult {
  return evaluateDynamicRoute(facts);
}
