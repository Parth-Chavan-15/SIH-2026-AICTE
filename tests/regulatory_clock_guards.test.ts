import { describe, it, expect } from 'vitest';

/**
 * AICTE APH 2024-27 Regulatory Clock & Jurisdictional Guardrails
 * 
 * Verifies strict disambiguation of statutory and operational clocks:
 * 1. APH §2.25(f) 15-day Security Deposit / Joint FDR & Affidavit-3 applies strictly POST-APPROVAL.
 *    It CANNOT be reused, substituted, or conflated with pre-approval deficiency cure windows.
 * 2. Pre-approval deficiency rectification operates under an internal 10-day operational SLA.
 * 3. APH §1.11 / §2.24 Standing Appellate Committee (SAC) appeal statute of limitations is strictly 7 calendar days.
 */

export interface RegulatoryClockEvaluation {
  clockId: string;
  stage: 'PRE_APPROVAL_SCRUTINY' | 'PRE_APPROVAL_EVC' | 'POST_APPROVAL' | 'APPELLATE';
  statutoryClause: string;
  durationDays: number;
  allowedStages: string[];
}

export function evaluateClockApplication(
  clockType: 'SECTION_2_25F_FDR_DEPOSIT' | 'OPERATIONAL_SLA_DEFICIENCY_CURE' | 'SECTION_1_11_SAC_APPEAL',
  currentStage: 'SCRUTINY_DEFICIENT' | 'EVC_INSPECTION' | 'POST_APPROVAL_ISSUED' | 'REJECTED_SPEAKING_ORDER',
  daysElapsed: number
): { valid: boolean; errorCode?: string; message?: string } {
  // Guardrail 1: §2.25(f) FDR Deposit applies ONLY post-approval
  if (clockType === 'SECTION_2_25F_FDR_DEPOSIT') {
    if (currentStage !== 'POST_APPROVAL_ISSUED') {
      return {
        valid: false,
        errorCode: 'REGULATORY_GUARD_VIOLATION_2_25F',
        message: 'APH §2.25(f) 15-day Joint FDR security deposit is strictly a post-approval obligation and cannot be applied during pre-approval deficiency resolution.'
      };
    }
    if (daysElapsed > 15) {
      return {
        valid: false,
        errorCode: 'POST_APPROVAL_FDR_DEFAULT',
        message: 'Statutory 15-day period for submitting Joint FDR and Affidavit-3 under §2.25(f) has expired. Default escalates to Chapter VII review.'
      };
    }
    return { valid: true, message: 'Valid §2.25(f) post-approval FDR deposit timeline.' };
  }

  // Guardrail 2: Pre-approval deficiency turnaround operates under 10-day operational SLA
  if (clockType === 'OPERATIONAL_SLA_DEFICIENCY_CURE') {
    if (currentStage !== 'SCRUTINY_DEFICIENT' && currentStage !== 'EVC_INSPECTION') {
      return {
        valid: false,
        errorCode: 'INVALID_DEFICIENCY_STAGE',
        message: 'Deficiency cure turnaround clock applies exclusively to pre-approval scrutiny/EVC stages.'
      };
    }
    if (daysElapsed > 10) {
      return {
        valid: false,
        errorCode: 'OPERATIONAL_SLA_EXPIRED',
        message: '10-day operational SLA for deficiency rectification has lapsed. Case escalates to Standing Hearing Committee (SHC).'
      };
    }
    return { valid: true, message: 'Within 10-day operational turnaround window.' };
  }

  // Guardrail 3: §1.11 / §2.24 SAC Appeal Statute of Limitations (7 Calendar Days)
  if (clockType === 'SECTION_1_11_SAC_APPEAL') {
    if (currentStage !== 'REJECTED_SPEAKING_ORDER') {
      return {
        valid: false,
        errorCode: 'APPEAL_PREMATURE',
        message: 'Statutory appeal under §1.11/§2.24 requires a formal Speaking Order of Rejection.'
      };
    }
    if (daysElapsed > 7) {
      return {
        valid: false,
        errorCode: 'STATUTORY_APPEAL_TIME_BARRED',
        message: 'Appeal is time-barred. APH §1.11 and §2.24 strictly mandate appeal submission within 7 calendar days of receipt of rejection order.'
      };
    }
    return { valid: true, message: 'Statutory appeal filed within 7-calendar-day statute of limitations.' };
  }

  return { valid: false, errorCode: 'UNKNOWN_CLOCK', message: 'Unknown clock specification.' };
}

describe('Authoritative Regulatory Clock & Jurisdictional Guardrails', () => {
  describe('Negative Tests: APH §2.25(f) FDR Security Deposit Window', () => {
    it('strictly forbids associating §2.25(f) 15-day deposit clock with pre-approval scrutiny deficiency resolution', () => {
      const result = evaluateClockApplication(
        'SECTION_2_25F_FDR_DEPOSIT',
        'SCRUTINY_DEFICIENT',
        5
      );
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('REGULATORY_GUARD_VIOLATION_2_25F');
      expect(result.message).toContain('cannot be applied during pre-approval deficiency resolution');
    });

    it('strictly forbids associating §2.25(f) deposit clock with pre-approval EVC inspection', () => {
      const result = evaluateClockApplication(
        'SECTION_2_25F_FDR_DEPOSIT',
        'EVC_INSPECTION',
        2
      );
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('REGULATORY_GUARD_VIOLATION_2_25F');
    });

    it('validates §2.25(f) deposit correctly when applied post-approval within 15 calendar days', () => {
      const result = evaluateClockApplication(
        'SECTION_2_25F_FDR_DEPOSIT',
        'POST_APPROVAL_ISSUED',
        10
      );
      expect(result.valid).toBe(true);
      expect(result.message).toContain('Valid §2.25(f) post-approval FDR deposit timeline');
    });

    it('flags default when §2.25(f) deposit exceeds 15 calendar days', () => {
      const result = evaluateClockApplication(
        'SECTION_2_25F_FDR_DEPOSIT',
        'POST_APPROVAL_ISSUED',
        16
      );
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('POST_APPROVAL_FDR_DEFAULT');
      expect(result.message).toContain('Statutory 15-day period');
    });
  });

  describe('Pre-Approval Deficiency Turnaround Clock (10-Day SLA)', () => {
    it('accepts deficiency resubmissions within 10 days during scrutiny', () => {
      const result = evaluateClockApplication(
        'OPERATIONAL_SLA_DEFICIENCY_CURE',
        'SCRUTINY_DEFICIENT',
        8
      );
      expect(result.valid).toBe(true);
    });

    it('escalates to SHC when pre-approval deficiency turnaround exceeds 10 days', () => {
      const result = evaluateClockApplication(
        'OPERATIONAL_SLA_DEFICIENCY_CURE',
        'SCRUTINY_DEFICIENT',
        11
      );
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('OPERATIONAL_SLA_EXPIRED');
      expect(result.message).toContain('escalates to Standing Hearing Committee (SHC)');
    });
  });

  describe('Standing Appellate Committee (SAC) Strict 7-Day Statute of Limitations', () => {
    it('allows statutory appeal filed within 7 calendar days', () => {
      const result = evaluateClockApplication(
        'SECTION_1_11_SAC_APPEAL',
        'REJECTED_SPEAKING_ORDER',
        6
      );
      expect(result.valid).toBe(true);
      expect(result.message).toContain('within 7-calendar-day statute of limitations');
    });

    it('strictly time-bars and rejects appeals lodged on Day 8 or later under APH §1.11 / §2.24', () => {
      const result = evaluateClockApplication(
        'SECTION_1_11_SAC_APPEAL',
        'REJECTED_SPEAKING_ORDER',
        8
      );
      expect(result.valid).toBe(false);
      expect(result.errorCode).toBe('STATUTORY_APPEAL_TIME_BARRED');
      expect(result.message).toContain('Appeal is time-barred');
      expect(result.message).toContain('strictly mandate appeal submission within 7 calendar days');
    });
  });
});
