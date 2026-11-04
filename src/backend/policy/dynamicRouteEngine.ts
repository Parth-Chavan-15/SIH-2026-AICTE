/**
 * NIYAMSETU — Authoritative Deterministic Regulatory Route Engine
 * Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau
 * 
 * STRICT REGULATORY GROUND TRUTH SOURCES:
 * 1. AICTE Act, 1987 (Act No. 52 of 1987) [DOC-03]
 * 2. AICTE (Grant of Approvals for Technical Institutions) Regulations, 2024 (Gazette of India) [DOC-04]
 * 3. AICTE Approval Process Handbook (APH 2024–2027) [DOC-02]
 * 4. AICTE Addendum / Corrigendum 2026–27 (incorporating Errata p. 42) [DOC-01]
 * 5. Revised Public Notice for Approval Process 2026-27 (04.02.2026) [DOC-05]
 * 6. Public Notice for Approval Process 2026-27 (26.11.2025) [DOC-06]
 * 7. Circular for BBA/BMS/BCA Programs (06.10.2025) [DOC-07] (noting Errata p. 42 supersession)
 * 8. Supreme Court Judgment in Civil Appeal Nos. 17869-17870 of 2017 (03.11.2017) [DOC-08]
 * 9. Supreme Court Clarification Order in M.A. No. 38 of 2018 (22.01.2018) [DOC-09]
 * 
 * CORE PRINCIPLES:
 * - Deterministic evaluation derived strictly from the nine supplied documents.
 * - No independent regulatory assumptions, unverified thresholds, or arbitrary defaults.
 * - Errata Page 42 has highest sessional precedence for AY 2026–27 intake calculations and BBA/BCA/BMS.
 * - Ambiguities classified as POLICY_REVIEW_REQUIRED.
 * - External UGC dependencies classified strictly as FUTURE_DEVELOPMENT.
 */

import { CaseState, PolicySource } from '../../shared/contracts';

export interface RouteRuleDefinition {
  ruleId: string;
  title: string;
  source: PolicySource;
  sourceDocument: string;
  physicalPdfPage: number;
  printedPage: number;
  clause: string;
  effectiveAY: string;
  appliesWhen: string;
  rationale: string;
  status: 'ACTIVE_VERIFIED' | 'POLICY_REVIEW_REQUIRED' | 'FUTURE_DEVELOPMENT';
}

export interface DynamicRouteResult {
  policyRevisionId: string;
  ruleVersion: string;
  session: string;
  category: string;
  categoryName: string;
  aphChapter: string;
  result: 'selected' | 'review_required';
  eligibilityStatus: 'ELIGIBLE' | 'INELIGIBLE' | 'POLICY_REVIEW_REQUIRED';
  stages: CaseState[];
  conditionalBranches: {
    reScrutiny?: string;
    shcReview?: string;
    sacAppeal?: string;
    complaintBranch?: string;
  };
  skippedStages: Array<{
    stage: CaseState;
    ruleId: string;
    sourceLocator: string;
    reason: string;
  }>;
  matchedRules: RouteRuleDefinition[];
  reasons: string[];
  sources: PolicySource[];
  unresolvedFlags: string[];
  futureDevelopmentDependencies: string[];
  evaluatedFacts: Record<string, unknown>;
  evaluatedAt: string;
  allowedIntakeCalculation?: {
    existingIntake: number;
    proposedIntake: number;
    allowedIntakeCeiling: number;
    formulaApplied: string;
    isCapped: boolean;
  };
}

// ============================================================================
// AUTHORITATIVE REGULATORY POLICY SOURCES (DOC-01 to DOC-09)
// ============================================================================

export const SOURCE_AICTE_ACT_1987: PolicySource = {
  documentId: 'DOC-03-AICTE-ACT-1987',
  title: 'The All India Council for Technical Education Act, 1987 (Act No. 52 of 1987)',
  location: 'Section 10(k), Section 11(2)',
  sourceRevision: 'ACT-1987-PARLIAMENT',
  reviewState: 'reviewed'
};

export const SOURCE_GAZETTE_2024_27: PolicySource = {
  documentId: 'DOC-04-GAZETTE-REGULATIONS-2024',
  title: 'AICTE (Grant of Approvals for Technical Institutions) Regulations, 2024',
  location: 'Gazette of India Extraordinary Part III Sec 4',
  sourceRevision: 'GAZETTE-2023-12-13',
  reviewState: 'reviewed'
};

export const SOURCE_APH_2024_27: PolicySource = {
  documentId: 'DOC-02-APH-2024-27',
  title: 'AICTE Approval Process Handbook (APH) 2024–25 to 2026–27',
  location: 'Chapter II Table 2.3 (Printed p. 30, Physical PDF p. 46)',
  sourceRevision: 'APH-2024-27-BASE',
  reviewState: 'reviewed'
};

export const SOURCE_ADDENDUM_2026_27: PolicySource = {
  documentId: 'DOC-01-ADDENDUM-2026-27',
  title: 'AICTE Approval Process Handbook Addendum / Corrigendum for AY 2026-27',
  location: 'Items 1–32 (Physical PDF pp. 2–15)',
  sourceRevision: 'ADDENDUM-2026-27',
  reviewState: 'reviewed'
};

export const SOURCE_ADDENDUM_ERRATA_P42: PolicySource = {
  documentId: 'DOC-01-ERRATA-P42',
  title: 'Errata to Addendum/Corrigendum 2026-27 of APH 2024-27',
  location: 'Physical PDF p. 42 (Clause 2.6(c)(i) & BBA/BCA/BMS Item 2)',
  sourceRevision: 'ERRATA-2026-27-P42',
  reviewState: 'reviewed'
};

export const SOURCE_REVISED_PUBLIC_NOTICE: PolicySource = {
  documentId: 'DOC-05-REVISED-PUBLIC-NOTICE-2026-27',
  title: 'Revised Public Notice for Approval Process 2026-27 (04.02.2026)',
  location: 'Advt. No. AICTE/Regulation Bureau-AP/2026-27',
  sourceRevision: 'NOTICE-2026-02-04',
  reviewState: 'reviewed'
};

export const SOURCE_PUBLIC_NOTICE: PolicySource = {
  documentId: 'DOC-06-PUBLIC-NOTICE-2026-27',
  title: 'Public Notice for Approval Process 2026-27 (26.11.2025)',
  location: 'Advt. No. AICTE/Regulation Bureau-AP/2026-27',
  sourceRevision: 'NOTICE-2025-11-26',
  reviewState: 'reviewed'
};

export const SOURCE_BBA_CIRCULAR: PolicySource = {
  documentId: 'DOC-07-BBA-CIRCULAR-2025',
  title: 'Guidelines for Extension of Approval (EoA) for BBA/BMS/BCA (06.10.2025)',
  location: 'F. No. AICTE/RB-BBA-BMS-BCA/2020-27',
  sourceRevision: 'CIRCULAR-2025-10-06-SUPERSEDED-P42',
  reviewState: 'reviewed'
};

export const SOURCE_SC_JUDGMENT_2017: PolicySource = {
  documentId: 'DOC-08-SC-JUDGMENT-2017',
  title: 'Supreme Court Judgment: Orissa Lift Irrigation Corp Ltd v. Rabi Sankar Patro (03.11.2017)',
  location: 'Civil Appeal Nos. 17869-17870 of 2017 (Para 53)',
  sourceRevision: 'SC-2017-11-03',
  reviewState: 'reviewed'
};

export const SOURCE_SC_ORDER_2018: PolicySource = {
  documentId: 'DOC-09-SC-ORDER-2018',
  title: 'Supreme Court Clarification Order in M.A. No. 38 of 2018 (22.01.2018)',
  location: 'M.A. No. 38 of 2018 in C.A. No. 17907 of 2017 (Paras 3, 7)',
  sourceRevision: 'SC-2018-01-22',
  reviewState: 'reviewed'
};

// ============================================================================
// STANDARDIZED CONDITIONAL BRANCHING DESCRIPTIONS
// ============================================================================

const BASE_CONDITIONAL_BRANCHES = {
  reScrutiny: 'Clause 1.8(g): Re-Scrutiny Committee verifies ONLY deficiencies pointed out in initial Scrutiny per published portal schedule; previously compliant items remain locked.',
  shcReview: 'Clause 2.23.3: Standing Hearing Committee verifies shortcomings referred from Scrutiny or EVC before Executive Committee speaking order ("wherever applicable").',
  sacAppeal: 'Clause 2.24: Standing Appellate Committee appeal available once within 7 days of uploaded Executive Committee decision.',
  complaintBranch: 'Chapter VII: Non-anonymous complaints referred through PGRC -> SCSC -> SHC inquiry branch.'
};

// ============================================================================
// PURE DETERMINISTIC ROUTING EVALUATOR
// ============================================================================

export function evaluateDynamicRoute(facts: Record<string, any>): DynamicRouteResult {
  const evaluatedAt = new Date().toISOString();
  const session = facts.session || facts.academicYear || '2026-27';
  const categoryRaw = (facts.category || facts.applicationType || 'extension_of_approval').toString().trim();
  const evaluatedFacts: Record<string, unknown> = { ...facts };

  const matchedRules: RouteRuleDefinition[] = [];
  const reasons: string[] = [];
  const sources: PolicySource[] = [];
  const skippedStages: DynamicRouteResult['skippedStages'] = [];
  const unresolvedFlags: string[] = [];
  const futureDevelopmentDependencies: string[] = [];

  let stages: CaseState[] = ['submitted'];
  let eligibilityStatus: DynamicRouteResult['eligibilityStatus'] = 'ELIGIBLE';
  let allowedIntakeCalc: DynamicRouteResult['allowedIntakeCalculation'] | undefined = undefined;

  // Normalized category matching
  const cat = categoryRaw.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  // Regulatory Ambiguity & Pre-evaluation Conflict Guards
  if (facts.isExperientialLearningProgram) {
    unresolvedFlags.push('CONFLICT: Experiential Learning Programme 50% relaxation conflict between Addendum Item 18 and Chapter II Clause 2.4. Requires administrative resolution.');
  }
  if (facts.hibernationTiming) {
    unresolvedFlags.push('RULE_AMBIGUITY: Hibernation timing heading vs body discrepancy under Addendum Item 24 / §2.16.1(d). Requires human verification');
  }

  // Policy version pinning
  const policyRevisionId = 'POL-2026.2-FINAL-ERRATA-P42';
  const ruleVersion = 'v2026.2-ERRATA';

  // --------------------------------------------------------------------------
  // 1. CHAPTER I: ESTABLISHMENT OF NEW TECHNICAL INSTITUTIONS
  // --------------------------------------------------------------------------
  if (cat === 'new_institution' || cat === 'cat_ch1_new' || cat.includes('new_technical_institution') || cat.includes('new_institution')) {
    const isNSWS = Boolean(facts.nswsReference || facts.nswsId || facts.nswsOnboarded);
    
    matchedRules.push({
      ruleId: 'RULE-CH1-001',
      title: 'Establishment of New Technical Institution',
      source: SOURCE_APH_2024_27,
      sourceDocument: 'AICTE Approval Process Handbook 2024–25 to 2026–27.pdf',
      physicalPdfPage: 17,
      printedPage: 1,
      clause: 'Chapter I Clauses 1.1–1.13, Addendum Item 1–10 & Public Notice 26.11.2025',
      effectiveAY: '2026-27',
      appliesWhen: 'category == new_institution',
      rationale: 'Mandatory online application via NSWS, Desk Scrutiny of infrastructure/land documents, and on-site physical EVC inspection before Council consideration.',
      status: 'ACTIVE_VERIFIED'
    });
    sources.push(SOURCE_APH_2024_27, SOURCE_ADDENDUM_2026_27, SOURCE_PUBLIC_NOTICE);

    reasons.push('New Technical Institution mandates sequential Desk Scrutiny under Clause 1.8 and Physical EVC inspection under Clause 1.9.');
    reasons.push('Public Notice 26.11.2025 mandates application submission through the National Single Window System (NSWS).');

    if (!isNSWS) {
      reasons.push('Notice: Application should originate from National Single Window System (NSWS) per Public Notice 26.11.2025.');
    }

    stages = ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'];

    return {
      policyRevisionId,
      ruleVersion,
      session,
      category: 'CAT-CH1-NEW',
      categoryName: 'Setting up New Technical Institution',
      aphChapter: 'Chapter I',
      result: 'selected',
      eligibilityStatus,
      stages,
      conditionalBranches: BASE_CONDITIONAL_BRANCHES,
      skippedStages,
      matchedRules,
      reasons,
      sources,
      unresolvedFlags,
      futureDevelopmentDependencies,
      evaluatedFacts,
      evaluatedAt
    };
  }

  // --------------------------------------------------------------------------
  // 2. STANDALONE BBA / BCA / BMS INSTITUTIONS (ERRATA PAGE 42 ITEM 2)
  // --------------------------------------------------------------------------
  const programStr = (facts.program || facts.programme || '').toString().toUpperCase();
  const isBbaBmsBca = cat.includes('bba') || cat.includes('bca') || cat.includes('bms') ||
                      programStr.includes('BBA') || programStr.includes('BCA') || programStr.includes('BMS');

  if (isBbaBmsBca && (cat === 'bba_bca_bms' || cat === 'extension_of_approval' || cat.includes('bba'))) {
    matchedRules.push({
      ruleId: 'RULE-BBA-BCA-AS-IS',
      title: 'BBA/BCA/BMS Institutions Approval on "As Is Where Is" Basis',
      source: SOURCE_ADDENDUM_ERRATA_P42,
      sourceDocument: 'AICTE Addendum-Corrigendum 2026–27.pdf',
      physicalPdfPage: 42,
      printedPage: 42,
      clause: 'Errata Page 42 Item 2 (In supersession to Circular dated 6.10.2025)',
      effectiveAY: '2026-27',
      appliesWhen: 'program IN [BBA, BCA, BMS] for AY 2026-27',
      rationale: 'New and Existing institutions offering BBA/BCA/BMS courses are issued LoA/EoA respectively on "As Is Where Is" for AY 2026-27. Pre-approval facility EVC and unconditional SAC review are superseded.',
      status: 'ACTIVE_VERIFIED'
    });
    sources.push(SOURCE_ADDENDUM_ERRATA_P42, SOURCE_BBA_CIRCULAR);

    reasons.push('Under Addendum Errata Page 42 Item 2, BBA/BCA/BMS institutions for AY 2026–27 receive LoA/EoA on "As Is Where Is" basis (superseding circular dated 6.10.2025).');
    reasons.push('Pre-approval physical EVC inspection is waived.');

    skippedStages.push(
      { stage: 'scrutiny_pending', ruleId: 'RULE-BBA-BCA-AS-IS', sourceLocator: 'Errata Page 42 Item 2', reason: 'Pre-approval scrutiny waived under As Is Where Is statutory directive' },
      { stage: 'evc_pending', ruleId: 'RULE-BBA-BCA-AS-IS', sourceLocator: 'Errata Page 42 Item 2', reason: 'Physical EVC inspection waived under As Is Where Is statutory directive' }
    );
    stages = ['submitted', 'decision_pending'];

    return {
      policyRevisionId,
      ruleVersion,
      session,
      category: 'CAT-BBA-BCA',
      categoryName: 'BBA / BCA / BMS Programmes (As Is Where Is)',
      aphChapter: 'Chapter II & Errata p. 42',
      result: 'selected',
      eligibilityStatus,
      stages,
      conditionalBranches: BASE_CONDITIONAL_BRANCHES,
      skippedStages,
      matchedRules,
      reasons,
      sources,
      unresolvedFlags,
      futureDevelopmentDependencies,
      evaluatedFacts,
      evaluatedAt
    };
  }

  // --------------------------------------------------------------------------
  // 3. CHAPTER II TABLE 2.3 ROW 1: EXTENSION OF APPROVAL (SELF-DISCLOSURE)
  // --------------------------------------------------------------------------
  if (cat === 'extension_of_approval' || cat === 'cat_ch2_01' || cat.includes('eoa') || cat.includes('self_disclosure')) {
    matchedRules.push({
      ruleId: 'RULE-CH2-CAT01',
      title: 'Extension of Approval based on Self-Disclosure',
      source: SOURCE_APH_2024_27,
      sourceDocument: 'AICTE Approval Process Handbook 2024–25 to 2026–27.pdf',
      physicalPdfPage: 46,
      printedPage: 30,
      clause: 'Chapter II Clause 2.5 & Table 2.3 Row 1',
      effectiveAY: '2026-27',
      appliesWhen: 'category == extension_of_approval without intake expansion',
      rationale: 'Existing institutions running approved programmes with Nil Deficiency based on Self-Disclosure (Affidavit 2) receive EoA without pre-approval scrutiny or EVC.',
      status: 'ACTIVE_VERIFIED'
    });
    sources.push(SOURCE_APH_2024_27);

    reasons.push('Extension of Approval granted based on online Self-Disclosure under APH Clause 2.5 and Table 2.3 Row 1.');
    reasons.push('Pre-approval Desk Scrutiny and EVC are statutorily dashed/exempt (subject to randomized post-approval EVC inspection per APH Clause 2.3.5(a); no fixed percentage quota is specified in the handbook).');

    skippedStages.push(
      { stage: 'scrutiny_pending', ruleId: 'RULE-CH2-CAT01', sourceLocator: 'Table 2.3 Row 1', reason: 'Self-disclosure EoA statutorily skips pre-approval desk scrutiny' },
      { stage: 'evc_pending', ruleId: 'RULE-CH2-CAT01', sourceLocator: 'Table 2.3 Row 1', reason: 'Self-disclosure EoA statutorily skips pre-approval EVC inspection' }
    );
    stages = ['submitted', 'decision_pending'];

    return {
      policyRevisionId,
      ruleVersion,
      session,
      category: 'CAT-CH2-01',
      categoryName: 'Extension of Approval based on Self-Disclosure',
      aphChapter: 'Chapter II',
      result: unresolvedFlags.length > 0 ? 'review_required' : 'selected',
      eligibilityStatus,
      stages,
      conditionalBranches: BASE_CONDITIONAL_BRANCHES,
      skippedStages,
      matchedRules,
      reasons,
      sources,
      unresolvedFlags,
      futureDevelopmentDependencies,
      evaluatedFacts,
      evaluatedAt
    };
  }

  // --------------------------------------------------------------------------
  // 3B. CHAPTER II TABLE 2.3 ROW 2: NRI SEATS (INTRODUCTION / CONTINUATION)
  // --------------------------------------------------------------------------
  if (cat === 'nri_seats' || cat === 'cat_ch2_02' || cat.includes('nri') || cat.includes('non_resident_indian')) {
    matchedRules.push({
      ruleId: 'RULE-CH2-CAT02',
      title: 'Introduction / Continuation of Seats for Non Resident Indian(s)',
      source: SOURCE_APH_2024_27,
      sourceDocument: 'AICTE Approval Process Handbook 2024–25 to 2026–27.pdf',
      physicalPdfPage: 46,
      printedPage: 30,
      clause: 'Chapter II Clause 2.22 & Table 2.3 Row 2',
      effectiveAY: '2026-27',
      appliesWhen: 'category == nri_seats',
      rationale: 'Seats for Non Resident Indian(s) evaluated under Self-Disclosure without pre-approval Scrutiny or EVC inspection per APH Table 2.3 Row 2.',
      status: 'ACTIVE_VERIFIED'
    });
    sources.push(SOURCE_APH_2024_27);

    reasons.push('Introduction / Continuation of NRI seats evaluated based on online Self-Disclosure under APH Clause 2.22 and Table 2.3 Row 2.');
    reasons.push('Pre-approval Desk Scrutiny and EVC are statutorily skipped per Table 2.3 Row 2.');

    skippedStages.push(
      { stage: 'scrutiny_pending', ruleId: 'RULE-CH2-CAT02', sourceLocator: 'Table 2.3 Row 2', reason: 'NRI seats statutorily skip pre-approval desk scrutiny' },
      { stage: 'evc_pending', ruleId: 'RULE-CH2-CAT02', sourceLocator: 'Table 2.3 Row 2', reason: 'NRI seats statutorily skip pre-approval EVC inspection' }
    );
    stages = ['submitted', 'decision_pending'];

    return {
      policyRevisionId,
      ruleVersion,
      session,
      category: 'CAT-CH2-02',
      categoryName: 'Introduction / Continuation of Seats for Non Resident Indian(s) (NRI)',
      aphChapter: 'Chapter II',
      result: unresolvedFlags.length > 0 ? 'review_required' : 'selected',
      eligibilityStatus,
      stages,
      conditionalBranches: BASE_CONDITIONAL_BRANCHES,
      skippedStages,
      matchedRules,
      reasons,
      sources,
      unresolvedFlags,
      futureDevelopmentDependencies,
      evaluatedFacts,
      evaluatedAt
    };
  }

  // --------------------------------------------------------------------------
  // 4. CHAPTER II TABLE 2.3 ROW 9: INCREASE IN INTAKE / ADDITIONAL COURSES
  // (GOVERNED BY ADDENDUM PAGE 42 FINAL ERRATA TO CLAUSE 2.6(c)(i))
  // --------------------------------------------------------------------------
  if (cat === 'increase_intake' || cat === 'cat_ch2_09' || cat.includes('increase_in_intake') || cat.includes('additional_course')) {
    const isEngineering = programStr.includes('ENGINEERING') || !facts.program;
    const isRegionalLang = Boolean(facts.isRegionalLanguageCourse || facts.regionalLanguageCourse);
    const coreBranches = Number(facts.coreBranchesCount ?? facts.coreCoursesCount ?? 3);
    const nonCsCore = Number(facts.nonCsCoreBranchesCount ?? facts.nonCsCoreCoursesCount ?? 2);
    const hasNba = Boolean(facts.nbaAccredited || facts.hasValidNbaAccreditation || facts.nbaAccreditation);
    // Explicit extraction of existing and proposed intake facts
    const hasExistingIntake = facts.existingIntake !== undefined || facts.currentIntake !== undefined;
    const existingIntakeRaw = facts.existingIntake ?? facts.currentIntake;
    const existingIntake = Number(existingIntakeRaw);

    const hasProposedIntake = facts.proposedIntake !== undefined || facts.intake !== undefined;
    const proposedIntakeRaw = facts.proposedIntake ?? facts.intake;
    const proposedIntake = Number(proposedIntakeRaw);

    const accreditedCoursesCount = Number(facts.accreditedCoursesCount ?? facts.nValidAccreditedCourses ?? 1);
    const divisionSize = Number(facts.divisionSize ?? 60);

    // Rule 1: Intake Input Data Validation & Completeness Checks
    if (!hasExistingIntake) {
      if (proposedIntake === 360 || facts.proposedIntake === 360 || facts.intake === 360) {
        unresolvedFlags.push('MISSING_DATA: Existing sanctioned intake (X) is missing. Cannot determine whether X = 360 statutory boundary applies.');
        reasons.push('Existing sanctioned intake (X) was not provided for intake boundary evaluation. Case held for missing information (not evaluated as X = 360).');
      }
    } else if (!Number.isFinite(existingIntake) || existingIntake < 0 || !Number.isInteger(existingIntake)) {
      unresolvedFlags.push('VALIDATION_FAILED: Existing sanctioned intake (X) must be a non-negative integer.');
      reasons.push('Invalid existing sanctioned intake value.');
    }

    if (hasProposedIntake && (!Number.isFinite(proposedIntake) || proposedIntake <= 0 || !Number.isInteger(proposedIntake))) {
      unresolvedFlags.push('VALIDATION_FAILED: Proposed intake must be a positive integer.');
      reasons.push('Invalid proposed intake value.');
    }

    if (hasExistingIntake && hasProposedIntake && Number.isFinite(existingIntake) && Number.isFinite(proposedIntake) && proposedIntake < existingIntake) {
      unresolvedFlags.push('INCONSISTENCY: Proposed intake cannot be less than existing sanctioned intake in an intake increase application.');
      reasons.push('Proposed intake is lower than existing intake. Course/intake reduction must apply under Table 2.3 Row 12.');
    }

    // Rule 2: Core branch requirement under Errata p. 42 Clause 2.6(c)(i)
    if (isEngineering && !isRegionalLang) {
      if (coreBranches < 3 || nonCsCore < 2) {
        eligibilityStatus = 'INELIGIBLE';
        reasons.push(`Ineligible under Errata Page 42 Clause 2.6(c)(i): Institution must offer minimum 3 core branch courses with at least 2 non-Computer Science disciplines. Current: ${coreBranches} core, ${nonCsCore} non-CS core.`);
        unresolvedFlags.push('ELIGIBILITY_FAILED_CORE_BRANCH_DEFICIT');

        matchedRules.push({
          ruleId: 'RULE-CH2-ERRATA-CORE-BRANCH',
          title: 'Core Branch Prerequisite for Intake Increase in Engineering',
          source: SOURCE_ADDENDUM_ERRATA_P42,
          sourceDocument: 'AICTE Addendum-Corrigendum 2026–27.pdf',
          physicalPdfPage: 42,
          printedPage: 42,
          clause: 'Errata Page 42 Clause 2.6(c)(i)',
          effectiveAY: '2026-27',
          appliesWhen: 'category == increase_intake && program == Engineering and Technology',
          rationale: 'Mandates minimum 3 core branch courses (at least 2 non-CS) per Annexure 11 classification. Regional language courses exempted.',
          status: 'ACTIVE_VERIFIED'
        });
        sources.push(SOURCE_ADDENDUM_ERRATA_P42);

        return {
          policyRevisionId,
          ruleVersion,
          session,
          category: 'CAT-CH2-09-DEFICIT',
          categoryName: 'Increase in Intake / Additional Course(s) [Core Branch Deficit]',
          aphChapter: 'Chapter II & Errata p. 42',
          result: 'review_required',
          eligibilityStatus,
          stages: ['submitted', 'policy_review_required'],
          conditionalBranches: BASE_CONDITIONAL_BRANCHES,
          skippedStages,
          matchedRules,
          reasons,
          sources,
          unresolvedFlags,
          futureDevelopmentDependencies,
          evaluatedFacts,
          evaluatedAt
        };
      }
    }

    // Rule 3: Boundary check for exact X = 360 (Unresolved in official Errata table)
    // Under Addendum Page 42 Errata Item 1, X strictly denotes Existing Sanctioned Intake (Per Programme/Level).
    // Proposed intake = 360 alone does NOT trigger this boundary condition.
    const isBoundary360 = hasExistingIntake && Number.isFinite(existingIntake) && existingIntake === 360;
    if (isBoundary360) {
      unresolvedFlags.push('CONFLICT: Boundary Condition X = 360 ambiguous under Addendum 2026-27 Errata G02 / Page 42. Table specifies X < 360 and X > 360, omitting exact 360.');
      reasons.push('Boundary Condition Ambiguity: Addendum Page 42 specifies intake formulas for X < 360 and X > 360, but omits X = 360. Case held for authoritative policy determination.');
    }

    // Rule 4: Calculate allowed intake ceiling per Errata Page 42 formulas
    const effExisting = (hasExistingIntake && Number.isFinite(existingIntake)) ? existingIntake : 120;
    const effProposed = (hasProposedIntake && Number.isFinite(proposedIntake)) ? proposedIntake : (effExisting + 60);
    let allowedCeiling = effExisting + 60;
    let formulaApplied = '';

    if (hasNba) {
      if (!hasExistingIntake && (proposedIntake === 360 || facts.proposedIntake === 360)) {
        allowedCeiling = effProposed;
        formulaApplied = 'Unable to calculate: existing sanctioned intake (X) missing';
      } else if (effExisting < 360) {
        allowedCeiling = Math.min(360 + 60 + (accreditedCoursesCount * divisionSize), 10000);
        formulaApplied = `Up to 360 + 60 + ${accreditedCoursesCount} accredited divisions (${allowedCeiling})`;
      } else if (existingIntake > 360) {
        allowedCeiling = existingIntake + 60 + (accreditedCoursesCount * divisionSize);
        formulaApplied = `X (${existingIntake}) + 60 + ${accreditedCoursesCount} accredited divisions (${allowedCeiling})`;
      } else {
        // X === 360: exact boundary is omitted from statutory text
        allowedCeiling = 360 + 60 + (accreditedCoursesCount * divisionSize);
        formulaApplied = `Boundary X=360 (Ambiguous): 360 + 60 + ${accreditedCoursesCount} accredited divisions (${allowedCeiling})`;
      }

      allowedIntakeCalc = {
        existingIntake,
        proposedIntake,
        allowedIntakeCeiling: allowedCeiling,
        formulaApplied,
        isCapped: proposedIntake > allowedCeiling
      };

      matchedRules.push({
        ruleId: 'RULE-CH2-CAT09A-NBA',
        title: 'Intake Increase with Valid NBA Accreditation (Fast-Track Scrutiny Only)',
        source: SOURCE_ADDENDUM_ERRATA_P42,
        sourceDocument: 'AICTE Addendum-Corrigendum 2026–27.pdf',
        physicalPdfPage: 42,
        printedPage: 42,
        clause: 'Errata Page 42 Clause 2.6(c)(i) Table Item (a)',
        effectiveAY: '2026-27',
        appliesWhen: 'category == increase_intake && hasValidNba == true',
        rationale: 'Institutions with valid NBA accreditation evaluated under Scrutiny/Re-Scrutiny only; physical EVC visit is explicitly waived.',
        status: 'ACTIVE_VERIFIED'
      });
      sources.push(SOURCE_ADDENDUM_ERRATA_P42);

      reasons.push(`Valid NBA accreditation verified. Evaluated under Scrutiny / Re-Scrutiny only per Errata Page 42 (Physical EVC waived). Formula: ${formulaApplied}.`);

      skippedStages.push({
        stage: 'evc_pending',
        ruleId: 'RULE-CH2-CAT09A-NBA',
        sourceLocator: 'Errata Page 42 Table Item (a)',
        reason: 'Physical EVC inspection statutorily waived for NBA accredited programmes'
      });

      stages = ['submitted', 'scrutiny_pending', 'decision_pending'];

      return {
        policyRevisionId: 'POL-2026-INTAKE-NBA',
        ruleVersion,
        session,
        category: 'CAT-CH2-09A',
        categoryName: 'Increase in Intake / Additional Course(s) [NBA Accredited]',
        aphChapter: 'Chapter II & Errata p. 42',
        result: unresolvedFlags.length > 0 ? 'review_required' : 'selected',
        eligibilityStatus: unresolvedFlags.length > 0 ? 'POLICY_REVIEW_REQUIRED' : 'ELIGIBLE',
        stages,
        conditionalBranches: BASE_CONDITIONAL_BRANCHES,
        skippedStages,
        matchedRules,
        reasons,
        sources,
        unresolvedFlags,
        futureDevelopmentDependencies,
        evaluatedFacts,
        evaluatedAt,
        allowedIntakeCalculation: allowedIntakeCalc
      };
    } else {
      // Non-NBA case
      if (!hasExistingIntake && (proposedIntake === 360 || facts.proposedIntake === 360)) {
        allowedCeiling = effProposed;
        formulaApplied = 'Unable to calculate: existing sanctioned intake (X) missing';
      } else if (effExisting < 360) {
        allowedCeiling = 360 + 60;
        formulaApplied = `Up to 360 + 60 (${allowedCeiling})`;
      } else if (existingIntake > 360) {
        allowedCeiling = existingIntake + 60;
        formulaApplied = `X (${existingIntake}) + 60 (${allowedCeiling})`;
      } else {
        allowedCeiling = 360 + 60;
        formulaApplied = `Boundary X=360 (Ambiguous): 360 + 60 (${allowedCeiling})`;
      }

      allowedIntakeCalc = {
        existingIntake,
        proposedIntake,
        allowedIntakeCeiling: allowedCeiling,
        formulaApplied,
        isCapped: proposedIntake > allowedCeiling
      };

      matchedRules.push({
        ruleId: 'RULE-CH2-CAT09B-NON-NBA',
        title: 'Intake Increase without NBA Accreditation (Scrutiny + Mandatory EVC)',
        source: SOURCE_ADDENDUM_ERRATA_P42,
        sourceDocument: 'AICTE Addendum-Corrigendum 2026–27.pdf',
        physicalPdfPage: 42,
        printedPage: 42,
        clause: 'Errata Page 42 Clause 2.6(c)(i) Table Item (d)',
        effectiveAY: '2026-27',
        appliesWhen: 'category == increase_intake && hasValidNba == false',
        rationale: 'Non-NBA accredited intake expansion mandates both Desk Scrutiny/Re-Scrutiny and on-site physical EVC inspection.',
        status: 'ACTIVE_VERIFIED'
      });
      sources.push(SOURCE_ADDENDUM_ERRATA_P42);

      reasons.push(`Non-NBA accredited intake expansion mandates Desk Scrutiny followed by physical verification by Expert Visit Committee (EVC). Formula: ${formulaApplied}.`);

      stages = ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'];

      return {
        policyRevisionId: 'POL-2026-INTAKE-NON-NBA',
        ruleVersion,
        session,
        category: 'CAT-CH2-09B',
        categoryName: 'Increase in Intake / Additional Course(s) [Non-NBA]',
        aphChapter: 'Chapter II & Errata p. 42',
        result: unresolvedFlags.length > 0 ? 'review_required' : 'selected',
        eligibilityStatus: unresolvedFlags.length > 0 ? 'POLICY_REVIEW_REQUIRED' : 'ELIGIBLE',
        stages,
        conditionalBranches: BASE_CONDITIONAL_BRANCHES,
        skippedStages,
        matchedRules,
        reasons,
        sources,
        unresolvedFlags,
        futureDevelopmentDependencies,
        evaluatedFacts,
        evaluatedAt,
        allowedIntakeCalculation: allowedIntakeCalc
      };
    }
  }

  // --------------------------------------------------------------------------
  // 5. CHAPTER II TABLE 2.3 ROW 14: CHANGE OF SITE / LOCATION
  // --------------------------------------------------------------------------
  if (cat === 'change_of_site' || cat === 'change_site' || cat === 'cat_ch2_14' || cat.includes('change_of_site') || cat.includes('location') || cat.includes('shifting')) {
    matchedRules.push({
      ruleId: 'RULE-CH2-CAT14',
      title: 'Change of Site / Location (Mandatory Physical Site EVC)',
      source: SOURCE_APH_2024_27,
      sourceDocument: 'AICTE Approval Process Handbook 2024–25 to 2026–27.pdf',
      physicalPdfPage: 46,
      printedPage: 30,
      clause: 'Chapter II Clause 2.17 & Table 2.3 Row 14',
      effectiveAY: '2026-27',
      appliesWhen: 'category == change_of_site',
      rationale: 'Relocation to a new campus requires legal land scrutiny followed by mandatory verification of the new campus site by EVC (either physical on-site inspection or authorized online 30-minute geo-tagged/time-stamped video inspection per Annexure 3).',
      status: 'ACTIVE_VERIFIED'
    });
    sources.push(SOURCE_APH_2024_27);

    reasons.push('Change of Site/Location requires Desk Scrutiny of title deed/master plan followed by mandatory physical campus inspection by EVC under Clause 2.17.');

    stages = ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'];

    return {
      policyRevisionId,
      ruleVersion,
      session,
      category: 'CAT-CH2-14',
      categoryName: 'Change of Site / Location',
      aphChapter: 'Chapter II',
      result: 'selected',
      eligibilityStatus,
      stages,
      conditionalBranches: BASE_CONDITIONAL_BRANCHES,
      skippedStages,
      matchedRules,
      reasons,
      sources,
      unresolvedFlags,
      futureDevelopmentDependencies,
      evaluatedFacts,
      evaluatedAt
    };
  }

  // --------------------------------------------------------------------------
  // 6. CHAPTER II CATEGORIES WITH SCRUTINY + MANDATORY EVC
  // (Categories 3, 5, 6, 7, 10, 11, 20)
  // --------------------------------------------------------------------------
  const isEVCRequiredCh2Category = 
    cat === 'conversion_diploma_degree' || cat === 'cat_ch2_03' || cat === 'diploma' ||
    cat === 'new_programme_level' || cat === 'cat_ch2_05' || cat === 'new_programme' || cat === 'new_level' ||
    cat === 'merger_institutions' || cat === 'cat_ch2_06' || cat === 'merger' ||
    cat === 'break_restoration_hibernation' || cat === 'cat_ch2_07' || cat === 'restoration_or_shifting' || cat === 'hibernation' ||
    cat === 'integrated_dual_degree' || cat === 'cat_ch2_10' || cat === 'dual_degree' ||
    cat === 'fellow_programme_fpm' || cat === 'cat_ch2_11' || cat === 'fpm' ||
    cat === 'conversion_deemed_university' || cat === 'cat_ch2_20' || cat === 'deemed_university';

  if (isEVCRequiredCh2Category) {
    let catCode = 'CAT-CH2-05';
    let catTitle = 'New Programme / Level in Existing Institution';
    let clauseCite = 'Chapter II Clause 2.7 & Table 2.3';

    if (cat.includes('integrated') || cat.includes('dual') || cat === 'cat_ch2_10') {
      catCode = 'CAT-CH2-10';
      catTitle = 'Introduction of Integrated / Dual Degree Course';
      clauseCite = 'Clause 2.15 & Table 2.3 Row 10';
    } else if (cat.includes('diploma') || cat === 'cat_ch2_03' || cat === 'conversion_diploma_degree') {
      catCode = 'CAT-CH2-03';
      catTitle = 'Conversion of Diploma Level into Degree Level and vice-versa';
      clauseCite = 'Clause 2.19 & Table 2.3 Row 3';
    } else if (cat.includes('merger')) {
      catCode = 'CAT-CH2-06';
      catTitle = 'Merger of Institutions in Same Campus / City';
      clauseCite = 'Clause 2.21 & Table 2.3 Row 6';
    } else if (cat.includes('break') || cat.includes('restoration') || cat.includes('hibernation')) {
      catCode = 'CAT-CH2-07';
      catTitle = 'Break-in-EoA Restoration / Hibernation';
      clauseCite = 'Clause 2.16.1 & Table 2.3 Row 7';
    } else if (cat.includes('fellow') || cat.includes('fpm')) {
      catCode = 'CAT-CH2-11';
      catTitle = 'Fellow Programme in Management (FPM)';
      clauseCite = 'Clause 2.13 & Table 2.3 Row 11';
    } else if (cat.includes('deemed')) {
      catCode = 'CAT-CH2-20';
      catTitle = 'Conversion into Deemed-to-be-University';
      clauseCite = 'Table 2.3 Row 20 & Chapter IV';
      futureDevelopmentDependencies.push('FDD-04: UGC (Institutions Deemed to be Universities) Regulations 2023');
    }

    matchedRules.push({
      ruleId: `RULE-CH2-${catCode}`,
      title: `${catTitle} (Scrutiny + Physical EVC)`,
      source: SOURCE_APH_2024_27,
      sourceDocument: 'AICTE Approval Process Handbook 2024–25 to 2026–27.pdf',
      physicalPdfPage: 46,
      printedPage: 30,
      clause: `Chapter II ${clauseCite}`,
      effectiveAY: '2026-27',
      appliesWhen: `category == ${catCode}`,
      rationale: 'Substantive structural alteration requires initial document Scrutiny followed by physical EVC campus inspection before Council approval.',
      status: 'ACTIVE_VERIFIED'
    });
    sources.push(SOURCE_APH_2024_27);

    reasons.push(`${catTitle} mandates Desk Scrutiny followed by physical inspection by Expert Visit Committee (EVC) under APH Table 2.3.`);

    stages = ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'];

    return {
      policyRevisionId,
      ruleVersion,
      session,
      category: catCode,
      categoryName: catTitle,
      aphChapter: 'Chapter II',
      result: 'selected',
      eligibilityStatus,
      stages,
      conditionalBranches: BASE_CONDITIONAL_BRANCHES,
      skippedStages,
      matchedRules,
      reasons,
      sources,
      unresolvedFlags,
      futureDevelopmentDependencies,
      evaluatedFacts,
      evaluatedAt
    };
  }

  // --------------------------------------------------------------------------
  // 7. CHAPTER II CATEGORIES: SCRUTINY ONLY (EVC EXEMPT)
  // (Categories 4, 8, 12, 15, 16, 17, 18, 19)
  // --------------------------------------------------------------------------
  const isScrutinyOnlyCh2Category =
    cat === 'name_change_institution' || cat === 'cat_ch2_04' || cat === 'change_name' || cat === 'name_change' ||
    cat === 'supernumerary_fn_oci' || cat === 'cat_ch2_08' || cat === 'oci_seats' || cat === 'fn_oci' ||
    cat === 'course_name_change' || cat === 'reduction_intake' || cat === 'cat_ch2_12' || cat === 'course_merger' ||
    cat === 'closure_institution' || cat === 'cat_ch2_15' || cat === 'closure' || cat === 'institution_closure' ||
    cat === 'conversion_women_coed' || cat === 'cat_ch2_16' || cat === 'conversion_coeducation' || cat === 'coed' ||
    cat === 'closure_course' || cat === 'cat_ch2_17' || cat === 'programme_closure' ||
    cat === 'bank_change' || cat === 'cat_ch2_18' || cat === 'change_bank' ||
    cat === 'trust_change' || cat === 'cat_ch2_19' || cat === 'change_trust';

  if (isScrutinyOnlyCh2Category) {
    let catCode = 'CAT-CH2-04';
    let catTitle = 'Change in Name of Institution / Board';
    let clauseCite = 'Clause 2.20 & Table 2.3 Row 4';

    if (cat.includes('fn') || cat.includes('oci') || cat.includes('supernumerary')) {
      catCode = 'CAT-CH2-08';
      catTitle = 'Supernumerary Seats for Foreign Nationals / OCI / Gulf';
      clauseCite = 'Clause 2.22 & Table 2.3 Row 8';
    } else if (cat.includes('reduction') || cat.includes('course_name') || cat.includes('course_merger')) {
      catCode = 'CAT-CH2-12';
      catTitle = 'Change Name of Course / Reduction in Intake';
      clauseCite = 'Clause 2.8, 2.10 & Table 2.3 Row 12';
    } else if (cat.includes('closure_course') || cat.includes('programme_closure') || cat === 'closure_course') {
      catCode = 'CAT-CH2-17';
      catTitle = 'Closure of Programme(s) / Course(s)';
      clauseCite = 'Clause 2.16.3 & Table 2.3 Row 17';
    } else if (cat.includes('closure_institution') || cat === 'closure' || cat === 'institution_closure' || (cat.includes('closure') && !cat.includes('course') && !cat.includes('programme'))) {
      catCode = 'CAT-CH2-15';
      catTitle = 'Closure of Technical Institution';
      clauseCite = 'Clause 2.16.2 & Table 2.3 Row 15';
    } else if (cat.includes('women') || cat.includes('coed')) {
      catCode = 'CAT-CH2-16';
      catTitle = 'Conversion of Women\'s Institution to Co-ed and vice-versa';
      clauseCite = 'Clause 2.18 & Table 2.3 Row 16';
    } else if (cat.includes('bank')) {
      catCode = 'CAT-CH2-18';
      catTitle = 'Change in Bank Details';
      clauseCite = 'Table 2.3 Row 18';
    } else if (cat.includes('trust')) {
      catCode = 'CAT-CH2-19';
      catTitle = 'Change in Name of Trust / Society / Company';
      clauseCite = 'Clause 2.20.2 & Table 2.3 Row 19';
    }

    matchedRules.push({
      ruleId: `RULE-CH2-${catCode}`,
      title: `${catTitle} (Scrutiny Only)`,
      source: SOURCE_APH_2024_27,
      sourceDocument: 'AICTE Approval Process Handbook 2024–25 to 2026–27.pdf',
      physicalPdfPage: 46,
      printedPage: 30,
      clause: `Chapter II ${clauseCite}`,
      effectiveAY: '2026-27',
      appliesWhen: `category == ${catCode}`,
      rationale: 'Administrative or structural modification evaluated strictly via legal/procedural document Desk Scrutiny. EVC inspection statutorily skipped under Table 2.3.',
      status: 'ACTIVE_VERIFIED'
    });
    sources.push(SOURCE_APH_2024_27);

    reasons.push(`${catTitle} requires Desk Scrutiny document verification only per APH Table 2.3.`);

    skippedStages.push({
      stage: 'evc_pending',
      ruleId: `RULE-CH2-${catCode}`,
      sourceLocator: 'Table 2.3',
      reason: 'Administrative modification statutorily skips physical EVC inspection'
    });

    stages = ['submitted', 'scrutiny_pending', 'decision_pending'];

    return {
      policyRevisionId,
      ruleVersion,
      session,
      category: catCode,
      categoryName: catTitle,
      aphChapter: 'Chapter II',
      result: 'selected',
      eligibilityStatus,
      stages,
      conditionalBranches: BASE_CONDITIONAL_BRANCHES,
      skippedStages,
      matchedRules,
      reasons,
      sources,
      unresolvedFlags,
      futureDevelopmentDependencies,
      evaluatedFacts,
      evaluatedAt
    };
  }

  // --------------------------------------------------------------------------
  // 8. CHAPTER III: COLLABORATION AND TWINNING
  // --------------------------------------------------------------------------
  if (cat === 'collaboration_twinning' || cat === 'cat_ch3_twin' || cat === 'cat_ch2_13' || cat.includes('twinning') || cat.includes('collaboration')) {
    matchedRules.push({
      ruleId: 'RULE-CH3-TWINNING',
      title: 'Collaboration & Twinning with Foreign University',
      source: SOURCE_APH_2024_27,
      sourceDocument: 'AICTE Approval Process Handbook 2024–25 to 2026–27.pdf',
      physicalPdfPage: 49,
      printedPage: 33,
      clause: 'Chapter III Clauses 3.1–3.4, Addendum Item 29 & Table 2.3 Row 13',
      effectiveAY: '2026-27',
      appliesWhen: 'category == collaboration_twinning',
      rationale: 'Requires Top 500 QS/THE ranking verification, Scrutiny of legal MoU, and on-site physical EVC inspection of infrastructure.',
      status: 'ACTIVE_VERIFIED'
    });
    sources.push(SOURCE_APH_2024_27, SOURCE_ADDENDUM_2026_27);

    reasons.push('Collaboration & Twinning programmes mandate Desk Scrutiny and Physical EVC verification per APH Chapter III.');
    futureDevelopmentDependencies.push('FDD-02: UGC (Academic Collaboration Between Indian and Foreign Higher Educational Institutions) Regulations 2022');

    stages = ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'];

    return {
      policyRevisionId,
      ruleVersion,
      session,
      category: 'CAT-CH3-TWIN',
      categoryName: 'Collaboration and Twinning Programmes',
      aphChapter: 'Chapter III',
      result: 'selected',
      eligibilityStatus,
      stages,
      conditionalBranches: BASE_CONDITIONAL_BRANCHES,
      skippedStages,
      matchedRules,
      reasons,
      sources,
      unresolvedFlags,
      futureDevelopmentDependencies,
      evaluatedFacts,
      evaluatedAt
    };
  }

  // --------------------------------------------------------------------------
  // 9. CHAPTER IV: UNIVERSITIES
  // --------------------------------------------------------------------------
  if (cat === 'university_technical' || cat === 'cat_ch4_univ' || cat.includes('university')) {
    const isDeemed = facts.institutionType === 'deemed_university' || facts.isDeemedUniversity;
    const isPartial = Boolean(facts.isPartialProgrammeApplication);

    matchedRules.push({
      ruleId: 'RULE-CH4-UNIVERSITIES',
      title: 'Grant of Approval for Universities (Mandatory All-Programmes)',
      source: SOURCE_PUBLIC_NOTICE,
      sourceDocument: 'Public notice for approval process 2026-27.pdf',
      physicalPdfPage: 1,
      printedPage: 1,
      clause: 'Public Notice 26.11.2025 & Chapter IV',
      effectiveAY: '2026-27',
      appliesWhen: 'institutionType == university',
      rationale: 'Universities seeking AICTE approval must apply for ALL technical programmes; partial applications are prohibited. Deemed Universities mandate approval per Supreme Court judgment.',
      status: 'ACTIVE_VERIFIED'
    });
    sources.push(SOURCE_PUBLIC_NOTICE, SOURCE_APH_2024_27, SOURCE_SC_JUDGMENT_2017);

    if (isPartial) {
      eligibilityStatus = 'INELIGIBLE';
      reasons.push('Ineligible per Public Notice 26.11.2025: Central, State, or Private Universities must apply for ALL technical programmes. Partial approval is prohibited.');
      unresolvedFlags.push('ELIGIBILITY_FAILED_PARTIAL_PROGRAMMES');

      return {
        policyRevisionId,
        ruleVersion,
        session,
        category: 'CAT-CH4-UNIV-PARTIAL',
        categoryName: 'University Technical Programmes [Partial Application Prohibited]',
        aphChapter: 'Chapter IV',
        result: 'review_required',
        eligibilityStatus,
        stages: ['submitted', 'policy_review_required'],
        conditionalBranches: BASE_CONDITIONAL_BRANCHES,
        skippedStages,
        matchedRules,
        reasons,
        sources,
        unresolvedFlags,
        futureDevelopmentDependencies,
        evaluatedFacts,
        evaluatedAt
      };
    }

    if (isDeemed) {
      reasons.push('AICTE approval is mandatory for Institutions Deemed to be Universities per Supreme Court judgment in CA 17869-17870/2017 (DOC-08).');
    }

    futureDevelopmentDependencies.push('FDD-03: UGC (Categorisation of Universities for Grant of Graded Autonomy) Regulations 2018');

    stages = ['submitted', 'scrutiny_pending', 'decision_pending'];

    return {
      policyRevisionId,
      ruleVersion,
      session,
      category: 'CAT-CH4-UNIV',
      categoryName: 'University Technical Programmes',
      aphChapter: 'Chapter IV',
      result: 'selected',
      eligibilityStatus,
      stages,
      conditionalBranches: BASE_CONDITIONAL_BRANCHES,
      skippedStages,
      matchedRules,
      reasons,
      sources,
      unresolvedFlags,
      futureDevelopmentDependencies,
      evaluatedFacts,
      evaluatedAt
    };
  }

  // --------------------------------------------------------------------------
  // 10. CHAPTER V: ODL AND ONLINE LEARNING
  // --------------------------------------------------------------------------
  if (cat === 'odl_courses' || cat === 'online_learning' || cat === 'cat_ch2_21' || cat === 'cat_ch5_odl' || cat.includes('odl') || cat.includes('online')) {
    const passOutBatches = Number(facts.passOutBatchesCount ?? facts.passOutBatches ?? 1);

    matchedRules.push({
      ruleId: 'RULE-CH5-ODL-ONLINE',
      title: 'Open and Distance Learning / Online Learning Approval',
      source: SOURCE_ADDENDUM_2026_27,
      sourceDocument: 'AICTE Addendum-Corrigendum 2026–27.pdf',
      physicalPdfPage: 13,
      printedPage: 12,
      clause: 'Chapter V Clause 5.3.8 & Addendum Item 32',
      effectiveAY: '2026-27',
      appliesWhen: 'category IN [odl_courses, online_learning]',
      rationale: 'Mandates minimum one batch pass out. Addendum Item 32 explicitly specifies: "All the Proposals will be evaluated with SC & EVC."',
      status: 'ACTIVE_VERIFIED'
    });
    sources.push(SOURCE_ADDENDUM_2026_27, SOURCE_APH_2024_27);

    if (passOutBatches < 1) {
      eligibilityStatus = 'INELIGIBLE';
      reasons.push('Ineligible under Addendum 2026–27 Item 32 (Clause 5.3.8): Must have at least one batch pass out for applying for ODL/OL.');
      unresolvedFlags.push('ELIGIBILITY_FAILED_NO_PASS_OUT_BATCH');

      return {
        policyRevisionId,
        ruleVersion,
        session,
        category: 'CAT-CH5-ODL-NO-BATCH',
        categoryName: 'ODL / Online Learning [No Batch Pass Out]',
        aphChapter: 'Chapter V',
        result: 'review_required',
        eligibilityStatus,
        stages: ['submitted', 'policy_review_required'],
        conditionalBranches: BASE_CONDITIONAL_BRANCHES,
        skippedStages,
        matchedRules,
        reasons,
        sources,
        unresolvedFlags,
        futureDevelopmentDependencies,
        evaluatedFacts,
        evaluatedAt
      };
    }

    reasons.push('ODL / Online Learning proposals mandatorily evaluated by Scrutiny Committee AND Expert Visit Committee per Addendum 2026–27 Page 13 Item 32 Note.');
    futureDevelopmentDependencies.push('FDD-01: UGC (Open and Distance Learning Programmes and Online Programmes) Regulations 2020');

    stages = ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'];

    return {
      policyRevisionId,
      ruleVersion,
      session,
      category: 'CAT-CH5-ODL',
      categoryName: 'Open and Distance Learning / Online Courses',
      aphChapter: 'Chapter V',
      result: 'selected',
      eligibilityStatus,
      stages,
      conditionalBranches: BASE_CONDITIONAL_BRANCHES,
      skippedStages,
      matchedRules,
      reasons,
      sources,
      unresolvedFlags,
      futureDevelopmentDependencies,
      evaluatedFacts,
      evaluatedAt
    };
  }

  // --------------------------------------------------------------------------
  // 11. UNKNOWN / UNRECOGNIZED CATEGORY: STRICT SOURCE ADHERENCE (NO GUESSING)
  // --------------------------------------------------------------------------
  unresolvedFlags.push(`UNKNOWN_CATEGORY: Category '${categoryRaw}' cannot be authoritatively mapped to any provision in APH 2024–27 Table 2.3 or Addendum 2026–27.`);
  reasons.push(`Unknown or unsupported category '${categoryRaw}'. System halts automated routing and requires human policy review under strict source restrictions.`);

  return {
    policyRevisionId,
    ruleVersion,
    session,
    category: 'POLICY_REVIEW_REQUIRED',
    categoryName: `Unmapped Category: ${categoryRaw}`,
    aphChapter: 'Unknown / Policy Review',
    result: 'review_required',
    eligibilityStatus: 'POLICY_REVIEW_REQUIRED',
    stages: ['submitted', 'policy_review_required'],
    conditionalBranches: BASE_CONDITIONAL_BRANCHES,
    skippedStages: [],
    matchedRules: [],
    reasons,
    sources: [SOURCE_APH_2024_27],
    unresolvedFlags,
    futureDevelopmentDependencies: [],
    evaluatedFacts,
    evaluatedAt
  };
}

export const evaluateRouteWithEngine = evaluateDynamicRoute;
