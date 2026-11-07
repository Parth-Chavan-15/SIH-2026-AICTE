import { describe, it, expect } from 'vitest';
import { evaluateDynamicRoute } from '../../src/backend/policy/dynamicRouteEngine';

describe('AICTE Capacity Ceilings & Eligibility Hardening Suite', () => {
  it('enforces INELIGIBLE status when proposed intake exceeds statutory ceiling (1,200 existing, 9,800 proposed, ceiling 1,380)', () => {
    const facts = {
      category: 'increase_intake',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      existingIntake: 1200,
      proposedIntake: 9800,
      accreditedCoursesCount: 2,
      nbaAccredited: true,
      nbaScore: 700,
      coreBranchesCount: 4,
      nonCsCoreBranchesCount: 3,
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.eligibilityStatus).toBe('INELIGIBLE');
    expect(result.result).toBe('review_required');
    expect(result.allowedIntakeCalculation).toBeDefined();
    expect(result.allowedIntakeCalculation?.allowedIntakeCeiling).toBe(1380);
    expect(result.allowedIntakeCalculation?.isCapped).toBe(true);
    expect(result.unresolvedFlags.some(f => f.includes('CAPACITY_EXCEEDED'))).toBe(true);
    expect(result.reasons.some(r => r.includes('Capacity Ceiling Exceeded'))).toBe(true);
  });

  it('permits compliant intake within allowable ceiling (120 existing, 180 proposed, ceiling 480)', () => {
    const facts = {
      category: 'increase_intake',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      existingIntake: 120,
      proposedIntake: 180,
      accreditedCoursesCount: 1,
      nbaAccredited: true,
      nbaScore: 700,
      coreBranchesCount: 4,
      nonCsCoreBranchesCount: 3,
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.eligibilityStatus).toBe('ELIGIBLE');
    expect(result.result).toBe('selected');
    expect(result.allowedIntakeCalculation?.allowedIntakeCeiling).toBe(480);
    expect(result.allowedIntakeCalculation?.isCapped).toBe(false);
  });

  it('re-verifies boundary X = 360 safely triggers POLICY_REVIEW_REQUIRED', () => {
    const facts = {
      category: 'increase_intake',
      program: 'Engineering and Technology',
      level: 'Under Graduate',
      existingIntake: 360,
      proposedIntake: 420,
      accreditedCoursesCount: 1,
      nbaAccredited: true,
      nbaScore: 700,
      coreBranchesCount: 4,
      nonCsCoreBranchesCount: 3,
      session: '2026-27'
    };

    const result = evaluateDynamicRoute(facts);

    expect(result.eligibilityStatus).toBe('POLICY_REVIEW_REQUIRED');
    expect(result.result).toBe('review_required');
    expect(result.unresolvedFlags.some(f => f.includes('X = 360'))).toBe(true);
  });
});
