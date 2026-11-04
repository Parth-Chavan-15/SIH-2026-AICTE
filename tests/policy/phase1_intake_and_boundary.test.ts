import { describe, it, expect } from 'vitest';
import { evaluateDynamicRoute } from '../../src/backend/policy/dynamicRouteEngine';
import { CATEGORIES } from '../../src/backend/core/cases';
import { parseAndValidateMongoTarget, AUTHORIZED_LOCAL_DEV_DB, DEFAULT_LOCAL_DEV_URI } from '../../src/backend/persistence/mongoInit';

describe('NIYAMSETU Phase 1 — Regulatory Routing, Category Intake & Policy Correctness', () => {

  // ==========================================================================
  // SECTION 1: ALL 21 TABLE 2.3 APPLICATION CATEGORIES ROUTING RECONCILIATION
  // ==========================================================================
  describe('Task A: Complete 21-Row Table 2.3 Intake Contract', () => {
    const baseFacts = {
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      session: '2026-27'
    };

    it('Row 1: CAT-CH2-01 — Extension of Approval (Self-Disclosure: Yes, Scrutiny: No, EVC: No)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'extension_of_approval' });
      expect(res.category).toBe('CAT-CH2-01');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'decision_pending']);
      expect(res.skippedStages.some(s => s.stage === 'scrutiny_pending')).toBe(true);
      expect(res.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    });

    it('Row 2: CAT-CH2-02 — NRI Seats (Self-Disclosure: Yes, Scrutiny: No, EVC: No)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'nri_seats' });
      expect(res.category).toBe('CAT-CH2-02');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'decision_pending']);
      expect(res.skippedStages.some(s => s.stage === 'scrutiny_pending')).toBe(true);
      expect(res.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    });

    it('Row 3: CAT-CH2-03 — Conversion Diploma to Degree (Scrutiny: Yes, EVC: Yes)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'conversion_diploma_degree' });
      expect(res.category).toBe('CAT-CH2-03');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    });

    it('Row 4: CAT-CH2-04 — Change in Name of Institution / Board (Scrutiny: Yes, EVC: No)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'name_change_institution' });
      expect(res.category).toBe('CAT-CH2-04');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'decision_pending']);
      expect(res.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    });

    it('Row 5: CAT-CH2-05 — New Programme / Level (Scrutiny: Yes, EVC: Yes)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'new_programme_level' });
      expect(res.category).toBe('CAT-CH2-05');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    });

    it('Row 6: CAT-CH2-06 — Merger of Institutions in Same Campus (Scrutiny: Yes, EVC: Yes)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'merger_institutions' });
      expect(res.category).toBe('CAT-CH2-06');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    });

    it('Row 7: CAT-CH2-07 — Break in EoA Restoration / Hibernation (Scrutiny: Yes, EVC: Yes)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'break_restoration_hibernation' });
      expect(res.category).toBe('CAT-CH2-07');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    });

    it('Row 8: CAT-CH2-08 — Supernumerary Seats for FN / OCI (Scrutiny: Yes, EVC: No)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'supernumerary_fn_oci' });
      expect(res.category).toBe('CAT-CH2-08');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'decision_pending']);
      expect(res.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    });

    it('Row 9A: CAT-CH2-09A — Increase in Intake with NBA (Scrutiny: Yes, EVC: Waived)', () => {
      const res = evaluateDynamicRoute({
        ...baseFacts,
        category: 'increase_intake',
        nbaAccredited: true,
        existingIntake: 180,
        proposedIntake: 240
      });
      expect(res.category).toBe('CAT-CH2-09A');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'decision_pending']);
      expect(res.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    });

    it('Row 9B: CAT-CH2-09B — Increase in Intake without NBA (Scrutiny: Yes, EVC: Mandatory)', () => {
      const res = evaluateDynamicRoute({
        ...baseFacts,
        category: 'increase_intake',
        nbaAccredited: false,
        existingIntake: 180,
        proposedIntake: 240
      });
      expect(res.category).toBe('CAT-CH2-09B');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
      expect(res.skippedStages.length).toBe(0);
    });

    it('Row 10: CAT-CH2-10 — Integrated / Dual Degree Course (Scrutiny: Yes, EVC: Yes)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'integrated_dual_degree' });
      expect(res.category).toBe('CAT-CH2-10');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    });

    it('Row 11: CAT-CH2-11 — Fellow Programme in Management - FPM (Scrutiny: Yes, EVC: Yes)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'fellow_programme_fpm' });
      expect(res.category).toBe('CAT-CH2-11');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    });

    it('Row 12: CAT-CH2-12 — Course Name Change / Reduction in Intake (Scrutiny: Yes, EVC: No)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'course_name_change' });
      expect(res.category).toBe('CAT-CH2-12');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'decision_pending']);
      expect(res.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    });

    it('Row 13: CAT-CH3-TWIN — Collaboration & Twinning Programme (Scrutiny: Yes, EVC: Yes)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'collaboration_twinning' });
      expect(res.category).toBe('CAT-CH3-TWIN');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    });

    it('Row 14: CAT-CH2-14 — Change of Site / Location (Scrutiny: Yes, EVC: Mandatory Physical)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'change_of_site' });
      expect(res.category).toBe('CAT-CH2-14');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    });

    it('Row 15: CAT-CH2-15 — Closure of Institution (Scrutiny: Yes, EVC: No)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'closure_institution' });
      expect(res.category).toBe('CAT-CH2-15');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'decision_pending']);
      expect(res.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    });

    it('Row 16: CAT-CH2-16 — Conversion Women to Co-ed (Scrutiny: Yes, EVC: No)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'conversion_women_coed' });
      expect(res.category).toBe('CAT-CH2-16');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'decision_pending']);
      expect(res.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    });

    it('Row 17: CAT-CH2-17 — Closure of Course / Programme (Scrutiny: Yes, EVC: No)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'closure_course' });
      expect(res.category).toBe('CAT-CH2-17');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'decision_pending']);
      expect(res.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    });

    it('Row 18: CAT-CH2-18 — Change in Bank Details (Scrutiny: Yes, EVC: No)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'bank_change' });
      expect(res.category).toBe('CAT-CH2-18');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'decision_pending']);
      expect(res.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    });

    it('Row 19: CAT-CH2-19 — Change in Name of Trust / Society (Scrutiny: Yes, EVC: No)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'trust_change' });
      expect(res.category).toBe('CAT-CH2-19');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'decision_pending']);
      expect(res.skippedStages.some(s => s.stage === 'evc_pending')).toBe(true);
    });

    it('Row 20: CAT-CH2-20 — Conversion to Deemed-to-be-University (Scrutiny: Yes, EVC: Yes)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'conversion_deemed_university' });
      expect(res.category).toBe('CAT-CH2-20');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    });

    it('Row 21: CAT-CH5-ODL — Open and Distance Learning / Online Courses (Scrutiny: Yes, EVC: Yes)', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'odl_courses', passOutBatches: 2 });
      expect(res.category).toBe('CAT-CH5-ODL');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    });

    it('Specialized Chapter I: CAT-CH1-NEW — New Technical Institution', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'new_institution' });
      expect(res.category).toBe('CAT-CH1-NEW');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'scrutiny_pending', 'evc_pending', 'decision_pending']);
    });

    it('Specialized Errata p. 42: CAT-BBA-BCA — Standalone BBA/BCA/BMS As Is Where Is', () => {
      const res = evaluateDynamicRoute({ ...baseFacts, category: 'bba_bca_bms' });
      expect(res.category).toBe('CAT-BBA-BCA');
      expect(res.result).toBe('selected');
      expect(res.stages).toEqual(['submitted', 'decision_pending']);
    });
  });

  // ==========================================================================
  // SECTION 2: ALIAS NORMALIZATION & CONTRACT WHITING
  // ==========================================================================
  describe('Task A: Alias Normalization & Intake Whitelist', () => {
    it('verifies all 21 Table 2.3 categories are present in cases.ts CATEGORIES contract', () => {
      const expectedKeys = [
        'extension_of_approval', 'nri_seats', 'conversion_diploma_degree',
        'name_change_institution', 'new_programme_level', 'merger_institutions',
        'break_restoration_hibernation', 'supernumerary_fn_oci', 'increase_intake',
        'integrated_dual_degree', 'fellow_programme_fpm', 'course_name_change',
        'collaboration_twinning', 'change_of_site', 'closure',
        'conversion_coeducation', 'closure_course', 'bank_change',
        'trust_change', 'conversion_deemed_university', 'odl_courses'
      ];
      for (const key of expectedKeys) {
        expect((CATEGORIES as readonly string[]).includes(key)).toBe(true);
      }
    });

    it('normalizes legacy and short aliases to canonical category codes without collision', () => {
      expect(evaluateDynamicRoute({ category: 'change_name' }).category).toBe('CAT-CH2-04');
      expect(evaluateDynamicRoute({ category: 'name_change' }).category).toBe('CAT-CH2-04');
      expect(evaluateDynamicRoute({ category: 'oci_seats' }).category).toBe('CAT-CH2-08');
      expect(evaluateDynamicRoute({ category: 'reduction_intake' }).category).toBe('CAT-CH2-12');
      expect(evaluateDynamicRoute({ category: 'course_merger' }).category).toBe('CAT-CH2-12');
      expect(evaluateDynamicRoute({ category: 'change_site' }).category).toBe('CAT-CH2-14');
      expect(evaluateDynamicRoute({ category: 'location' }).category).toBe('CAT-CH2-14');
      expect(evaluateDynamicRoute({ category: 'closure' }).category).toBe('CAT-CH2-15');
      expect(evaluateDynamicRoute({ category: 'coed' }).category).toBe('CAT-CH2-16');
      expect(evaluateDynamicRoute({ category: 'conversion_coeducation' }).category).toBe('CAT-CH2-16');
      expect(evaluateDynamicRoute({ category: 'programme_closure' }).category).toBe('CAT-CH2-17');
      expect(evaluateDynamicRoute({ category: 'change_bank' }).category).toBe('CAT-CH2-18');
      expect(evaluateDynamicRoute({ category: 'change_trust' }).category).toBe('CAT-CH2-19');
      expect(evaluateDynamicRoute({ category: 'online_learning', passOutBatches: 2 }).category).toBe('CAT-CH5-ODL');
    });

    it('safely rejects completely unknown / unmapped categories', () => {
      const res = evaluateDynamicRoute({ category: 'completely_fictional_unregistered_category_xyz' });
      expect(res.result).toBe('review_required');
      expect(res.unresolvedFlags.some(f => f.includes('UNKNOWN_CATEGORY'))).toBe(true);
    });
  });

  // ==========================================================================
  // SECTION 3: TASK B — X = 360 STATUTORY INTAKE BOUNDARY
  // ==========================================================================
  describe('Task B: Intake Formula Boundary X = 360 Defect Correction', () => {
    it('Mandatory Case 1: Existing 180, Proposed 360 — Must NOT be held for X = 360', () => {
      const res = evaluateDynamicRoute({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        existingIntake: 180,
        proposedIntake: 360,
        nbaAccredited: true,
        nbaScore: 680
      });

      // Existing 180 is strictly < 360. Statutory formula "Up to 360 + 60 + n divisions" applies.
      expect(res.unresolvedFlags.some(f => f.includes('X = 360'))).toBe(false);
      expect(res.result).toBe('selected');
      expect(res.allowedIntakeCalculation?.formulaApplied).toContain('Up to 360 + 60');
    });

    it('Mandatory Case 2: Existing 360, Proposed 420 — MUST be held for actual unresolved boundary gap', () => {
      const res = evaluateDynamicRoute({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        existingIntake: 360,
        proposedIntake: 420,
        nbaAccredited: true,
        nbaScore: 680
      });

      // Existing X = 360 is omitted from Addendum p. 42 table (< 360 and > 360 only).
      expect(res.unresolvedFlags.some(f => f.includes('X = 360'))).toBe(true);
      expect(res.result).toBe('review_required');
      expect(res.reasons.some(r => r.includes('Boundary Condition Ambiguity'))).toBe(true);
    });

    it('Mandatory Case 3: Existing 420, Proposed 480 — Must NOT be held for X = 360', () => {
      const res = evaluateDynamicRoute({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        existingIntake: 420,
        proposedIntake: 480,
        nbaAccredited: true,
        nbaScore: 680
      });

      // Existing 420 is strictly > 360. Statutory formula "X + 60 + n divisions" applies.
      expect(res.unresolvedFlags.some(f => f.includes('X = 360'))).toBe(false);
      expect(res.result).toBe('selected');
      expect(res.allowedIntakeCalculation?.formulaApplied).toContain('X (420) + 60');
    });

    it('Mandatory Case 4: Existing intake missing, Proposed 360 — Must be handled as MISSING_DATA, not X = 360', () => {
      const res = evaluateDynamicRoute({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        level: 'Under Graduate',
        proposedIntake: 360,
        nbaAccredited: true,
        nbaScore: 680
      });

      // Proposed 360 alone does NOT establish X = 360.
      expect(res.unresolvedFlags.some(f => f.includes('MISSING_DATA'))).toBe(true);
      expect(res.unresolvedFlags.some(f => f.includes('CONFLICT: Boundary Condition X = 360'))).toBe(false);
      expect(res.result).toBe('review_required');
    });

    it('Mandatory Case 5: Valid values below 360 and above 360 use the correct respective formulas', () => {
      const resBelow = evaluateDynamicRoute({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        existingIntake: 240,
        proposedIntake: 300,
        nbaAccredited: false
      });
      expect(resBelow.result).toBe('selected');
      expect(resBelow.allowedIntakeCalculation?.formulaApplied).toBe('Up to 360 + 60 (420)');

      const resAbove = evaluateDynamicRoute({
        category: 'increase_intake',
        program: 'Engineering and Technology',
        existingIntake: 480,
        proposedIntake: 540,
        nbaAccredited: false
      });
      expect(resAbove.result).toBe('selected');
      expect(resAbove.allowedIntakeCalculation?.formulaApplied).toBe('X (480) + 60 (540)');
    });

    it('Mandatory Case 6: Invalid, negative, non-numeric, or inconsistent intake values fail validation safely', () => {
      const resNeg = evaluateDynamicRoute({
        category: 'increase_intake',
        existingIntake: -60,
        proposedIntake: 180
      });
      expect(resNeg.unresolvedFlags.some(f => f.includes('VALIDATION_FAILED'))).toBe(true);
      expect(resNeg.result).toBe('review_required');

      const resInconsistent = evaluateDynamicRoute({
        category: 'increase_intake',
        existingIntake: 300,
        proposedIntake: 240
      });
      expect(resInconsistent.unresolvedFlags.some(f => f.includes('INCONSISTENCY'))).toBe(true);
      expect(resInconsistent.result).toBe('review_required');
    });
  });

  // ==========================================================================
  // SECTION 4: TASK C — 5% RANDOMIZED INSPECTION EXPLANATION CORRECTION
  // ==========================================================================
  describe('Task C: Clause 2.3.5(a) Randomized Inspection Explanation', () => {
    it('verifies user-facing EoA explanation does NOT present a 5% quota as statutory requirement', () => {
      const res = evaluateDynamicRoute({
        category: 'extension_of_approval',
        session: '2026-27'
      });

      // Find the Clause 2.3.5 explanation string
      const eoaReason = res.reasons.find(r => r.includes('Clause 2.3.5'));
      expect(eoaReason).toBeDefined();

      // Must NOT assert a fixed 5% quota
      expect(eoaReason).not.toContain('5%');
      expect(eoaReason).not.toContain('5 %');

      // Must accurately cite Clause 2.3.5(a) randomized inspection
      expect(eoaReason).toContain('Clause 2.3.5(a)');
      expect(eoaReason).toContain('randomized post-approval EVC inspection');
      expect(eoaReason).toContain('no fixed percentage quota is specified');
    });
  });

  // ==========================================================================
  // SECTION 5: TASK E — LOCAL DATABASE SAFETY CONFIGURATION
  // ==========================================================================
  describe('Task E: Local Database Safety & Target Validation', () => {
    it('in non-production, strictly rejects unauthorized target niyamsetu', () => {
      const res = parseAndValidateMongoTarget('mongodb://127.0.0.1:27017/niyamsetu', false);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('LOCAL_DB_SAFETY');
      expect(res.error).toContain('strictly prohibited');
    });

    it('in non-production, accepts authorized development database niyamsetu_dev', () => {
      const res = parseAndValidateMongoTarget(DEFAULT_LOCAL_DEV_URI, false);
      expect(res.valid).toBe(true);
      expect(res.dbName).toBe(AUTHORIZED_LOCAL_DEV_DB);
    });

    it('in production, rejects localhost / loopback URIs to prevent accidental local binding', () => {
      const res = parseAndValidateMongoTarget('mongodb://127.0.0.1:27017/niyamsetu_dev', true);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('PRODUCTION_SAFETY_VIOLATION');
    });

    it('in production, accepts valid remote Atlas MongoDB URI with explicit database', () => {
      const res = parseAndValidateMongoTarget('mongodb+srv://user:pass@cluster.mongodb.net/niyamsetu_prod?retryWrites=true', true);
      expect(res.valid).toBe(true);
      expect(res.dbName).toBe('niyamsetu_prod');
    });
  });
});
