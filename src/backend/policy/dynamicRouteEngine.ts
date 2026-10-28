/**
 * NIYAMSETU — Dynamic Source-Versioned Regulatory Route Engine
 * Smart India Hackathon 2026 | Problem Statement 26262: AICTE Regulation Bureau
 * 
 * Sourced directly from:
 * 1. AICTE Approval Process Handbook (APH 2024–2027) Chapter I, Chapter II (Table 2.3, p. 30)
 * 2. Updated Addendum/Corrigendum 2026–27 (Errata G02, p. 42 §2.6(c)(1))
 * 3. AICTE Act 1987 §10(k), §11(2)
 * 
 * Rules:
 * - Deterministic route evaluation based on verified facts and category.
 * - Stores explainable snapshot: matched rules, source locators, stages, conditional branches, skipped stages.
 * - Flags unresolved conflicts (ELP 50%, X=360 boundary, Hibernation timing, International student EVC).
 */

import { CaseState, PolicySource, RouteExplanation } from '../../shared/contracts';

export interface RouteRuleDefinition {
  ruleId: string;
  title: string;
  source: PolicySource;
  physicalPdfPage: number;
  printedPage: number;
  clause: string;
  effectiveAY: string;
  appliesWhen: string;
  rationale: string;
  status: 'ACTIVE_VERIFIED' | 'NEEDS_VERIFICATION' | 'CONFLICT' | 'ENGINEERING_PROPOSAL';
}

export interface DynamicRouteResult {
  policyRevisionId: string;
  ruleVersion: string;
  session: string;
  category: string;
  result: 'selected' | 'review_required';
  stages: CaseState[];
  conditionalBranches: {
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
  evaluatedFacts: Record<string, unknown>;
  evaluatedAt: string;
}

export const SOURCE_APH_2024_27: PolicySource = {
  documentId: 'DOC-APH-2024-27',
  title: 'Approval Process Handbook 2024–2027',
  location: 'Chapter II Table 2.3 (Printed p. 30, Physical PDF p. 46)',
  sourceRevision: 'APH-2024-27-BASE',
  reviewState: 'reviewed',
  url: 'https://www.aicte-india.org/sites/default/files/approval/APH%202024-27.pdf'
};

export const SOURCE_ADDENDUM_2026_27: PolicySource = {
  documentId: 'DOC-APH-2026-27-ERRATA',
  title: 'Addendum/Corrigendum 2026–27 Of APH 2024–27',
  location: 'PDF p. 4, Item 16 / Clause 2.6(c)(1)',
  sourceRevision: 'APH-2026-27-G02',
  reviewState: 'reviewed',
  url: 'https://www.aicte-india.org/bulletins/circulars/approval-process-handbook-2026-27-addendum-g02'
};

export const SOURCE_AICTE_ACT_1987: PolicySource = {
  documentId: 'DOC-AICTE-ACT-1987',
  title: 'The All India Council for Technical Education Act, 1987 (No. 52 of 1987)',
  location: 'Section 10(k) & Section 11(2)',
  sourceRevision: 'ACT-1987-GAZETTE',
  reviewState: 'reviewed',
  url: 'https://www.aicte-india.org/sites/default/files/AICTE_Act.pdf'
};

/**
 * Pure deterministic route evaluator consuming application facts
 */
export function evaluateDynamicRoute(facts: Record<string, any>): DynamicRouteResult {
  const evaluatedAt = new Date().toISOString();
  const session = facts.session || facts.academicYear || '2026-27';
  const category = facts.category || facts.applicationType || 'increase_intake';
  const evaluatedFacts: Record<string, unknown> = { ...facts };

  const matchedRules: RouteRuleDefinition[] = [];
  const reasons: string[] = [];
  const sources: PolicySource[] = [];
  const skippedStages: DynamicRouteResult['skippedStages'] = [];
  const unresolvedFlags: string[] = [];
  let stages: CaseState[] = ['submitted'];

  // Base conditional branches (never compulsory on main happy path)
  const conditionalBranches: DynamicRouteResult['conditionalBranches'] = {
    shcReview: 'Available if Scrutiny or EVC observes shortcomings referred under APH Chapter II §2.23.3',
    sacAppeal: 'Available if applicant is aggrieved by Executive Committee decision under APH Chapter I §1.11 (7 days from LoD) or Chapter II §2.24 (7 days from uploaded decision)',
    complaintBranch: 'Available if non-anonymous grievance is lodged under APH Chapter VII §7.10 (PGRC -> SCSC -> SHC)'
  };

  // Flag unresolved regulatory ambiguities if applicable
  if (facts.proposedIntake === 360 || facts.existingIntake === 360) {
    unresolvedFlags.push('RULE_AMBIGUITY: Intake threshold X = 360 boundary in Addendum 2026-27 p. 42 is ambiguous; held for policy verification');
  }
  if (facts.isExperientialLearningProgram) {
    unresolvedFlags.push('CONFLICT: Addendum p. 14 states "Minimum 50% experiential learning" while Concept Note p. 19 states "Up to 50%". Held for policy review');
  }
  if (facts.hibernationTiming) {
    unresolvedFlags.push('RULE_AMBIGUITY: Hibernation timing heading vs body discrepancy under Addendum Item 24 / §2.16.1(d). Requires human verification');
  }

  // Material unresolved regulatory ambiguities fail safely to review_required (Phases 2 & 3 mandate)
  const hasBlockingAmbiguity = unresolvedFlags.some(
    f => f.startsWith('RULE_AMBIGUITY:') || f.startsWith('CONFLICT:')
  );
  const routeResult: 'selected' | 'review_required' = hasBlockingAmbiguity ? 'review_required' : 'selected';

  // 1. Route Family: New Technical Institution
  if (category === 'new_institution' || category === 'New Technical Institution') {
    matchedRules.push({
      ruleId: 'APH-2024-CH1-NEW-INST',
      title: 'Approval for Setting up New Technical Institution',
      source: SOURCE_APH_2024_27,
      physicalPdfPage: 17,
      printedPage: 1,
      clause: 'Chapter I, Clauses 1.1–1.10 & Annexure 7',
      effectiveAY: '2024-25 to 2026-27',
      appliesWhen: 'category == new_institution',
      rationale: 'New technical institutions mandate document Scrutiny followed by physical EVC inspection before Council consideration.',
      status: 'ACTIVE_VERIFIED'
    });
    sources.push(SOURCE_APH_2024_27);
    reasons.push('New Technical Institution mandates sequential Scrutiny and EVC inspection per APH Chapter I §1.8–§1.9.');
    stages = ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'];
    
    return {
      policyRevisionId: 'POL-2026-NEW-INSTITUTION',
      ruleVersion: 'v2026.1',
      session,
      category,
      result: routeResult,
      stages,
      conditionalBranches,
      skippedStages,
      matchedRules,
      reasons,
      sources,
      unresolvedFlags,
      evaluatedFacts,
      evaluatedAt
    };
  }

  // 2. Route Family: Extension of Approval (EoA) on Self-Disclosure
  if (category === 'extension_of_approval' || category === 'Extension of Approval (EoA)') {
    matchedRules.push({
      ruleId: 'APH-2024-CH2-EOA-SELF',
      title: 'Extension of Approval based on Self-Disclosure',
      source: SOURCE_APH_2024_27,
      physicalPdfPage: 31,
      printedPage: 15,
      clause: 'Chapter II, Clause 2.5 & Table 2.3 Row 1',
      effectiveAY: '2024-25 to 2026-27',
      appliesWhen: 'category == extension_of_approval && no intake increase',
      rationale: 'Standard annual EoA is granted on self-disclosure (Affidavit 2) with Nil Deficiency without pre-approval scrutiny/EVC.',
      status: 'ACTIVE_VERIFIED'
    });
    sources.push(SOURCE_APH_2024_27);
    reasons.push('Extension of Approval granted based on Self-Disclosure under APH Chapter II §2.5 & Table 2.3 (Pre-approval Scrutiny and EVC are dashed/skipped).');
    
    skippedStages.push(
      { stage: 'scrutiny_pending', ruleId: 'APH-2024-CH2-EOA-SELF', sourceLocator: 'Table 2.3 Row 1', reason: 'Self-disclosure EoA skips pre-approval desk scrutiny' },
      { stage: 'evc_pending', ruleId: 'APH-2024-CH2-EOA-SELF', sourceLocator: 'Table 2.3 Row 1', reason: 'Self-disclosure EoA skips pre-approval EVC inspection (subject to random post-approval surprise check per §2.3.5)' }
    );
    stages = ['submitted', 'decision_pending'];

    return {
      policyRevisionId: 'POL-2026-EOA-SELF-DISCLOSURE',
      ruleVersion: 'v2026.1',
      session,
      category,
      result: routeResult,
      stages,
      conditionalBranches,
      skippedStages,
      matchedRules,
      reasons,
      sources,
      unresolvedFlags,
      evaluatedFacts,
      evaluatedAt
    };
  }

  // 3. Route Family: Restoration of Intake / Break-in-EoA / Shifting of Site (Only EVC)
  if (category === 'restoration_or_shifting' || facts.siteVerificationRequired || category === 'Change of Site / Location') {
    matchedRules.push({
      ruleId: 'APH-2024-CH2-ONLY-EVC',
      title: 'Break-in-EoA Restoration & Site Shifting (Only EVC)',
      source: SOURCE_APH_2024_27,
      physicalPdfPage: 40,
      printedPage: 24,
      clause: 'Chapter II §2.16.1(c), §2.17(e) & Table 2.3',
      effectiveAY: '2024-25 to 2026-27',
      appliesWhen: 'siteVerificationRequired == true || breakInEoA == true',
      rationale: 'Break-in-EoA or campus relocation bypasses desk scrutiny and requires on-site physical verification by EVC only.',
      status: 'ACTIVE_VERIFIED'
    });
    sources.push(SOURCE_APH_2024_27);
    reasons.push('Campus site shifting or Break-in-EoA restoration proceeds directly to on-site EVC inspection under APH §2.16.1(c) and §2.17(e).');
    
    skippedStages.push({
      stage: 'scrutiny_pending',
      ruleId: 'APH-2024-CH2-ONLY-EVC',
      sourceLocator: 'Table 2.3 & §2.16.1(c)',
      reason: 'Physical site verification proceeds directly to EVC; prior desk scrutiny not applicable'
    });
    stages = ['submitted', 'evc_pending', 'decision_pending'];

    return {
      policyRevisionId: 'POL-2026-ONLY-EVC-RESTORATION',
      ruleVersion: 'v2026.1',
      session,
      category,
      result: routeResult,
      stages,
      conditionalBranches,
      skippedStages,
      matchedRules,
      reasons,
      sources,
      unresolvedFlags,
      evaluatedFacts,
      evaluatedAt
    };
  }

  // 4. Route Family: Increase in Intake / Additional Course (NBA Fast-Track vs Scrutiny + EVC)
  if (category === 'increase_intake' || category === 'intake_increase' || category === 'Increase in Intake / Additional Course') {
    const isNbaAccredited = facts.nbaAccredited === true || facts.nbaAccreditation === true;
    
    if (isNbaAccredited) {
      matchedRules.push({
        ruleId: 'ADD-2026-27-CH2-2.6C-NBA',
        title: 'Increase in Intake with Valid NBA Accreditation (Fast-Track Scrutiny Only)',
        source: SOURCE_ADDENDUM_2026_27,
        physicalPdfPage: 4,
        printedPage: 4,
        clause: 'Addendum 2026–27 Item 16 / Clause 2.6(c)(1)',
        effectiveAY: '2026-27',
        appliesWhen: 'nbaAccredited == true && valid till at least 30 April 2026',
        rationale: 'Institutions with valid NBA accreditation evaluated under Scrutiny/Re-Scrutiny only; physical EVC visit is explicitly waived.',
        status: 'ACTIVE_VERIFIED'
      });
      sources.push(SOURCE_ADDENDUM_2026_27);
      reasons.push('Valid NBA accreditation verified. Under Addendum 2026–27 p. 4 §2.6(c)(1), accredited courses are exempt from EVC visit (Fast-Track Desk Scrutiny only).');
      
      skippedStages.push({
        stage: 'evc_pending',
        ruleId: 'ADD-2026-27-CH2-2.6C-NBA',
        sourceLocator: 'Addendum 2026–27 Item 16 p. 4',
        reason: 'EVC physical inspection explicitly waived for NBA accredited programmes'
      });
      stages = ['submitted', 'scrutiny_pending', 'decision_pending'];

      return {
        policyRevisionId: 'POL-2026-INTAKE-NBA',
        ruleVersion: 'v2026.2',
        session,
        category,
        result: routeResult,
        stages,
        conditionalBranches,
        skippedStages,
        matchedRules,
        reasons,
        sources,
        unresolvedFlags,
        evaluatedFacts,
        evaluatedAt
      };
    } else {
      matchedRules.push({
        ruleId: 'ADD-2026-27-CH2-2.6C-NON-NBA',
        title: 'Increase in Intake without NBA Accreditation (Scrutiny + EVC)',
        source: SOURCE_ADDENDUM_2026_27,
        physicalPdfPage: 5,
        printedPage: 5,
        clause: 'Addendum 2026–27 Item 16 / Clause 2.6(c)(1)(e)-(f) & APH Table 2.3 Row 9',
        effectiveAY: '2026-27',
        appliesWhen: 'nbaAccredited == false',
        rationale: 'Non-NBA accredited intake expansion requires both Desk Scrutiny/Re-Scrutiny and physical EVC inspection.',
        status: 'ACTIVE_VERIFIED'
      });
      sources.push(SOURCE_ADDENDUM_2026_27);
      reasons.push('Non-NBA accredited intake increase requires Desk Scrutiny followed by physical verification by Expert Visit Committee (EVC).');
      stages = ['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending'];

      return {
        policyRevisionId: 'POL-2026-INTAKE-NON-NBA',
        ruleVersion: 'v2026.2',
        session,
        category,
        result: routeResult,
        stages,
        conditionalBranches,
        skippedStages,
        matchedRules,
        reasons,
        sources,
        unresolvedFlags,
        evaluatedFacts,
        evaluatedAt
      };
    }
  }

  // 5. Default Fallback / Administrative Modifications (Scrutiny Only)
  matchedRules.push({
    ruleId: 'APH-2024-CH2-ADMIN-MOD',
    title: 'Administrative Modifications (Scrutiny Only)',
    source: SOURCE_APH_2024_27,
    physicalPdfPage: 46,
    printedPage: 30,
    clause: 'Chapter II Table 2.3 (Rows 4, 12, 15, 16)',
    effectiveAY: '2024-25 to 2026-27',
    appliesWhen: 'administrative modifications (name change, reduction in intake, closure)',
    rationale: 'Administrative changes require document verification only without physical inspection.',
    status: 'ACTIVE_VERIFIED'
  });
  sources.push(SOURCE_APH_2024_27);
  reasons.push('Administrative application requires Desk Scrutiny document verification only per APH Table 2.3.');
  skippedStages.push({
    stage: 'evc_pending',
    ruleId: 'APH-2024-CH2-ADMIN-MOD',
    sourceLocator: 'Table 2.3',
    reason: 'Administrative modifications skip physical EVC inspection'
  });
  stages = ['submitted', 'scrutiny_pending', 'decision_pending'];

  return {
    policyRevisionId: 'POL-2026-SCRUTINY-ONLY-MOD',
    ruleVersion: 'v2026.1',
    session,
    category,
    result: routeResult,
    stages,
    conditionalBranches,
    skippedStages,
    matchedRules,
    reasons,
    sources,
    unresolvedFlags,
    evaluatedFacts,
    evaluatedAt
  };
}

export const evaluateRouteWithEngine = evaluateDynamicRoute;
