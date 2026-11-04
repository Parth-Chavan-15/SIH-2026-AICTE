import { describe, it, expect } from 'vitest';
import {
  evaluateDynamicRoute,
  SOURCE_APH_2024_27,
  SOURCE_ADDENDUM_2026_27,
  SOURCE_ADDENDUM_ERRATA_P42,
  SOURCE_PUBLIC_NOTICE,
  SOURCE_SC_JUDGMENT_2017
} from '../../src/backend/policy/dynamicRouteEngine';

describe('NIYAMSETU — Authoritative AICTE Routing Engine Suite (DOC-01 to DOC-09 Ground Truth)', () => {

  // TC-ROUTE-01: Positive Eligibility - Category 1 (New Technical Institution)
  it('TC-ROUTE-01: Routes Category 1 (New Technical Institution) through sequential Scrutiny and Mandatory Physical EVC', () => {
    const facts = {
      category: 'new_institution',
      program: 'engineering',
      nswsId: 'NSWS-2026-001',
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.result).toBe('selected');
    expect(result.eligibilityStatus).toBe('ELIGIBLE');
    expect(result.category).toBe('CAT-CH1-NEW');
    expect(result.aphChapter).toBe('Chapter I');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    expect(result.matchedRules.some(r => r.ruleId === 'RULE-CH1-001')).toBe(true);
    expect(result.sources.some(s => s.documentId === SOURCE_APH_2024_27.documentId)).toBe(true);
    expect(result.sources.some(s => s.documentId === SOURCE_PUBLIC_NOTICE.documentId)).toBe(true);
  });

  // TC-ROUTE-02: Sessional Exemption - Category 2 (EoA Self-Disclosure)
  it('TC-ROUTE-02: Sessional Exemption for EoA based on Self-Disclosure (Skips Scrutiny & EVC)', () => {
    const facts = {
      category: 'extension_of_approval',
      hasIntakeExpansion: false,
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH2-01');
    expect(result.aphChapter).toBe('Chapter II');
    expect(result.stages).toEqual(['submitted', 'decision_pending']);
    expect(result.skippedStages.some(s => s.stage === 'scrutiny_pending')).toBe(true);
    expect(result.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    expect(result.matchedRules.some(r => r.ruleId === 'RULE-CH2-CAT01')).toBe(true);
  });

  // TC-ROUTE-03: Conditional Branching - Category 9A (Intake Increase WITH NBA)
  it('TC-ROUTE-03: Fast-Track Desk Scrutiny only for Intake Increase with valid NBA accreditation', () => {
    const facts = {
      category: 'increase_intake',
      program: 'engineering',
      nbaAccredited: true,
      coreBranchesCount: 3,
      nonCsCoreBranchesCount: 2,
      existingIntake: 240,
      proposedIntake: 300,
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH2-09A');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'decision_pending']);
    expect(result.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    expect(result.allowedIntakeCalculation).toBeDefined();
    expect(result.allowedIntakeCalculation?.isCapped).toBe(false);
    expect(result.sources.some(s => s.sourceRevision === 'ERRATA-2026-27-P42')).toBe(true);
  });

  // TC-ROUTE-04: Conditional Branching - Category 9B (Intake Increase WITHOUT NBA)
  it('TC-ROUTE-04: Mandatory Physical EVC required for Intake Increase without NBA accreditation', () => {
    const facts = {
      category: 'increase_intake',
      program: 'engineering',
      nbaAccredited: false,
      coreBranchesCount: 3,
      nonCsCoreBranchesCount: 2,
      existingIntake: 240,
      proposedIntake: 300,
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH2-09B');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    expect(result.matchedRules.some(r => r.ruleId === 'RULE-CH2-CAT09B-NON-NBA')).toBe(true);
  });

  // TC-ROUTE-05: Negative Eligibility - Intake Increase Core Branch Deficit
  it('TC-ROUTE-05: Rejects Intake Increase when Core Branch requirement (3 core, 2 non-CS) is not met', () => {
    const facts = {
      category: 'increase_intake',
      program: 'engineering',
      coreBranchesCount: 2,
      nonCsCoreBranchesCount: 1,
      isRegionalLanguageCourse: false,
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.result).toBe('review_required');
    expect(result.eligibilityStatus).toBe('INELIGIBLE');
    expect(result.unresolvedFlags).toContain('ELIGIBILITY_FAILED_CORE_BRANCH_DEFICIT');
    expect(result.stages).toEqual(['submitted', 'policy_review_required']);
    expect(result.reasons.some(r => r.includes('minimum 3 core branch'))).toBe(true);
  });

  // TC-ROUTE-06: Statutory Exception - Regional Language Course Exemption
  it('TC-ROUTE-06: Exempts Regional Language Courses from Core Branch count requirement', () => {
    const facts = {
      category: 'increase_intake',
      program: 'engineering',
      coreBranchesCount: 1,
      nonCsCoreBranchesCount: 0,
      isRegionalLanguageCourse: true,
      nbaAccredited: true,
      existingIntake: 120,
      proposedIntake: 180,
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.result).toBe('selected');
    expect(result.eligibilityStatus).toBe('ELIGIBLE');
    expect(result.unresolvedFlags).not.toContain('ELIGIBILITY_FAILED_CORE_BRANCH_DEFICIT');
  });

  // TC-ROUTE-07: Mandatory Physical EVC - Category 14 (Change of Site / Location)
  it('TC-ROUTE-07: Change of Site / Location strictly requires physical site inspection by EVC', () => {
    const facts = {
      category: 'change_of_site',
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH2-14');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    expect(result.matchedRules.some(r => r.ruleId === 'RULE-CH2-CAT14')).toBe(true);
  });

  // TC-ROUTE-08: Scrutiny Only - Category 4 (Institution Name Change)
  it('TC-ROUTE-08: Administrative Name Change of Institution processed via Desk Scrutiny only', () => {
    const facts = {
      category: 'name_change_institution',
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH2-04');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'decision_pending']);
    expect(result.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
  });

  // TC-ROUTE-09: Sessional Supersession - BBA / BCA / BMS Standalone Institutions
  it('TC-ROUTE-09: Standalone BBA/BCA/BMS institutions granted LoA/EoA on "As Is Where Is" basis', () => {
    const facts = {
      category: 'bba_bca_bms',
      program: 'BBA',
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-BBA-BCA');
    expect(result.stages).toEqual(['submitted', 'decision_pending']);
    expect(result.matchedRules.some(r => r.ruleId === 'RULE-BBA-BCA-AS-IS')).toBe(true);
    expect(result.reasons.some(r => r.includes('As Is Where Is'))).toBe(true);
  });

  // TC-ROUTE-10: Mandatory EVC - Category 21 (ODL / Online Courses with pass out batch)
  it('TC-ROUTE-10: Open and Distance Learning proposals mandate Scrutiny and EVC per Addendum Item 32', () => {
    const facts = {
      category: 'odl_courses',
      passOutBatches: 1,
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH5-ODL');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    expect(result.futureDevelopmentDependencies.some(d => d.includes('FDD-01'))).toBe(true);
  });

  // TC-ROUTE-11: Negative Eligibility - ODL Course Without Pass Out Batch
  it('TC-ROUTE-11: Rejects ODL / Online Learning applications lacking minimum 1 batch pass out', () => {
    const facts = {
      category: 'odl_courses',
      passOutBatches: 0,
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.result).toBe('review_required');
    expect(result.eligibilityStatus).toBe('INELIGIBLE');
    expect(result.unresolvedFlags).toContain('ELIGIBILITY_FAILED_NO_PASS_OUT_BATCH');
    expect(result.stages).toEqual(['submitted', 'policy_review_required']);
  });

  // TC-ROUTE-12: Unresolved Boundary Gap - Exact Intake Boundary X = 360
  it('TC-ROUTE-12: Unresolved Boundary Condition X = 360 safely halts to POLICY_REVIEW_REQUIRED', () => {
    const facts = {
      category: 'increase_intake',
      program: 'engineering',
      existingIntake: 360,
      proposedIntake: 420,
      coreBranchesCount: 3,
      nonCsCoreBranchesCount: 2,
      nbaAccredited: true,
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.result).toBe('review_required');
    expect(result.eligibilityStatus).toBe('POLICY_REVIEW_REQUIRED');
    expect(result.unresolvedFlags.some(f => f.includes('X = 360'))).toBe(true);
    expect(result.reasons.some(r => r.includes('X = 360'))).toBe(true);
  });

  // TC-ROUTE-13: Future Development Guard - University Graded Autonomy
  it('TC-ROUTE-13: Identifies UGC Graded Autonomy Regulations 2018 as FUTURE_DEVELOPMENT dependency', () => {
    const facts = {
      category: 'university_technical',
      requestGradedAutonomy: true,
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.category).toBe('CAT-CH4-UNIV');
    expect(result.futureDevelopmentDependencies.some(d => d.includes('FDD-03'))).toBe(true);
    expect(result.sources.some(s => s.documentId === SOURCE_SC_JUDGMENT_2017.documentId)).toBe(true);
  });

  // TC-ROUTE-14: Future Development Guard - Twinning Foreign University Credit Mapping
  it('TC-ROUTE-14: Identifies UGC 2022 Collaboration Regulations as FUTURE_DEVELOPMENT dependency', () => {
    const facts = {
      category: 'collaboration_twinning',
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.category).toBe('CAT-CH3-TWIN');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    expect(result.futureDevelopmentDependencies.some(d => d.includes('FDD-02'))).toBe(true);
  });

  // TC-ROUTE-15: Sessional Deadlines - Preserves session context without hardcoded crash
  it('TC-ROUTE-15: Sessional context preserved without breaking dynamic evaluation', () => {
    const facts = {
      session: '2026-27',
      submissionDate: '2026-11-02',
      category: 'extension_of_approval'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.session).toBe('2026-27');
    expect(result.evaluatedFacts.submissionDate).toBe('2026-11-02');
    expect(result.stages).toEqual(['submitted', 'decision_pending']);
  });

  // TC-ROUTE-17: Table 2.3 Row 2 NRI Seats (CAT-CH2-02) skips Scrutiny and EVC
  it('TC-ROUTE-17: Table 2.3 Row 2 NRI Seats evaluates under Self-Disclosure skipping Scrutiny and EVC', () => {
    const facts = {
      category: 'nri_seats',
      session: '2026-27'
    };
    const result = evaluateDynamicRoute(facts);
    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH2-02');
    expect(result.aphChapter).toBe('Chapter II');
    expect(result.stages).toEqual(['submitted', 'decision_pending']);
    expect(result.skippedStages.some(s => s.stage === 'scrutiny_pending')).toBe(true);
    expect(result.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    expect(result.matchedRules.some(r => r.ruleId === 'RULE-CH2-CAT02')).toBe(true);
  });

  // TC-ROUTE-18: Table 2.3 Row 3 Diploma to Degree Conversion (CAT-CH2-03)
  it('TC-ROUTE-18: Table 2.3 Row 3 Conversion of Diploma into Degree requires Scrutiny + EVC', () => {
    const facts = {
      category: 'conversion_diploma_degree',
      session: '2026-27'
    };
    const result = evaluateDynamicRoute(facts);
    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH2-03');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
  });

  // TC-ROUTE-19: Table 2.3 Row 6 Merger of Institutions (CAT-CH2-06)
  it('TC-ROUTE-19: Table 2.3 Row 6 Merger of Institutions requires Scrutiny + EVC', () => {
    const facts = {
      category: 'merger_institutions',
      session: '2026-27'
    };
    const result = evaluateDynamicRoute(facts);
    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH2-06');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
  });

  // TC-ROUTE-20: Table 2.3 Row 7 Restoration of Intake (CAT-CH2-07)
  it('TC-ROUTE-20: Table 2.3 Row 7 Restoration / Hibernation mandates Scrutiny + EVC (BATU Lonere foundation)', () => {
    const facts = {
      category: 'break_restoration_hibernation',
      session: '2026-27'
    };
    const result = evaluateDynamicRoute(facts);
    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH2-07');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
  });

  // TC-ROUTE-21: Table 2.3 Row 10 Integrated / Dual Degree (CAT-CH2-10)
  it('TC-ROUTE-21: Table 2.3 Row 10 Integrated / Dual Degree requires Scrutiny + EVC', () => {
    const facts = {
      category: 'integrated_dual_degree',
      session: '2026-27'
    };
    const result = evaluateDynamicRoute(facts);
    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH2-10');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
  });

  // TC-ROUTE-22: Table 2.3 Row 11 Fellow Programme in Management (CAT-CH2-11)
  it('TC-ROUTE-22: Table 2.3 Row 11 Fellow Programme in Management mandates Scrutiny + EVC', () => {
    const facts = {
      category: 'fellow_programme_fpm',
      session: '2026-27'
    };
    const result = evaluateDynamicRoute(facts);
    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH2-11');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
  });

  // TC-ROUTE-23: Table 2.3 Row 14 Change of Site / Location with change_site alias
  it('TC-ROUTE-23: Table 2.3 Row 14 Change of Site maps change_site alias and mandates Scrutiny + EVC', () => {
    const facts = {
      category: 'change_site',
      session: '2026-27'
    };
    const result = evaluateDynamicRoute(facts);
    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH2-14');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    expect(result.reasons.some(r => r.includes('Change of Site') || r.includes('Clause 2.17'))).toBe(true);
  });

  // TC-ROUTE-24: Chapter III Collaboration alias cat_ch2_13
  it('TC-ROUTE-24: Chapter III Collaboration correctly maps cat_ch2_13 alias', () => {
    const facts = {
      category: 'cat_ch2_13',
      session: '2026-27'
    };
    const result = evaluateDynamicRoute(facts);
    expect(result.result).toBe('selected');
    expect(result.category).toBe('CAT-CH3-TWIN');
    expect(result.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    expect(result.matchedRules.some(r => r.ruleId === 'RULE-CH3-TWINNING')).toBe(true);
  });

  // TC-ROUTE-25: Intake capping enforcement
  it('TC-ROUTE-25: Enforces intake capping when proposed intake exceeds statutory ceiling', () => {
    const facts = {
      category: 'increase_intake',
      program: 'engineering',
      nbaAccredited: true,
      coreBranchesCount: 3,
      nonCsCoreBranchesCount: 2,
      existingIntake: 120,
      proposedIntake: 900,
      accreditedCoursesCount: 1,
      divisionSize: 60,
      session: '2026-27'
    };
    const result = evaluateDynamicRoute(facts);
    expect(result.result).toBe('selected');
    expect(result.allowedIntakeCalculation).toBeDefined();
    expect(result.allowedIntakeCalculation?.isCapped).toBe(true);
  });

  // Edge Case: Unknown category must fail safely without guessing
  it('Edge Case: Unknown or unmapped category safely halts to POLICY_REVIEW_REQUIRED', () => {
    const facts = {
      category: 'completely_unknown_category_xyz',
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.result).toBe('review_required');
    expect(result.eligibilityStatus).toBe('POLICY_REVIEW_REQUIRED');
    expect(result.stages).toEqual(['submitted', 'policy_review_required']);
    expect(result.unresolvedFlags.some(f => f.includes('UNKNOWN_CATEGORY'))).toBe(true);
  });
});
