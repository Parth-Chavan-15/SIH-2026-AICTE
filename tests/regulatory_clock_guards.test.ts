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
        message: 'Appeal is time-barred. APH §1.11 and §2.24 strictly mandate appeal submission within 7 calendar days of issue of Letter of Deficiency / uploading of decision. Case flagged as APPEAL_WINDOW_ELAPSED_PENDING_COUNCIL_ORDER.'
      };
    }
    return { valid: true, message: 'Statutory appeal filed within 7-calendar-day statute of limitations.' };
  }

  return { valid: false, errorCode: 'UNKNOWN_CLOCK', message: 'Unknown clock specification.' };
}

export function evaluateStatutoryAppealWindow(params: {
  chapter: 'CHAPTER_I' | 'CHAPTER_II';
  triggerEventDate: string;
  submissionDate: string;
  speakingOrderPresent: boolean;
}): {
  valid: boolean;
  governingClause: string;
  statutoryTrigger: string;
  daysElapsed: number;
  errorCode?: string;
  message: string;
} {
  const t0 = Date.parse(params.triggerEventDate);
  const t1 = Date.parse(params.submissionDate);
  const daysElapsed = (t1 - t0) / (1000 * 60 * 60 * 24);

  const governingClause = params.chapter === 'CHAPTER_I'
    ? 'APH 2024-27 Chapter I Clause 1.11(a)'
    : 'APH 2024-27 Chapter II Clause 2.24(a)';

  const statutoryTrigger = params.chapter === 'CHAPTER_I'
    ? 'DATE_OF_ISSUE_OF_LOD'
    : 'DATE_OF_UPLOADING_OF_DECISION';

  if (!params.speakingOrderPresent) {
    return {
      valid: false,
      governingClause,
      statutoryTrigger,
      daysElapsed,
      errorCode: 'SPEAKING_ORDER_MANDATORY',
      message: 'Speaking Order is legally mandatory under AICTE Act §10(k) and APH Clause 1.10(b)/2.23.3 prior to appeal.'
    };
  }

  if (daysElapsed > 7.0) {
    return {
      valid: false,
      governingClause,
      statutoryTrigger,
      daysElapsed,
      errorCode: 'STATUTORY_APPEAL_TIME_BARRED',
      message: "Statutory appeal time-barred after 7 calendar days from " + statutoryTrigger + " under " + governingClause,
    };
  }

  return {
    valid: true,
    governingClause,
    statutoryTrigger,
    daysElapsed,
    message: "Statutory appeal submitted within 7 calendar days from " + statutoryTrigger + " under " + governingClause,
  };
}

/**
 * AICTE APH 2024-27 Clause 6.45 vs Annexure 6 Clause 6.12 Fee Refund Policy
 */
export function evaluateFeeRefundCompliance(facts: {
  institutionType: 'GENERAL_TECHNICAL' | 'STANDALONE_PGDM';
  isWithdrawnBeforeStart: boolean;
  withdrawalDate?: string;
  courseStartDate?: string;
  processingFeeDeducted: number;
  refundTurnaroundDays: number;
  certificatesReturnedDays: number;
}): { compliant: boolean; governingClause: string; violations: string[] } {
  const violations: string[] = [];

  if (facts.institutionType === 'GENERAL_TECHNICAL') {
    const clause = 'APH 2024-27 Chapter VI Clause 6.45 (Fee Refund Policy for Technical Institutions)';
    if (facts.isWithdrawnBeforeStart) {
      if (facts.processingFeeDeducted > 1000) {
        violations.push(`FEE_DEDUCTION_EXCEEDED: Clause 6.45 caps processing fee deduction at maximum Rs. 1,000/- (deducted: Rs. ${facts.processingFeeDeducted}).`);
      }
      if (facts.refundTurnaroundDays > 7) {
        violations.push(`REFUND_WINDOW_BREACH: Clause 6.45 mandates entire fee refund within 7 calendar days (took: ${facts.refundTurnaroundDays} days).`);
      }
      if (facts.certificatesReturnedDays > 7) {
        violations.push(`CERTIFICATE_RETURN_BREACH: Clause 6.45 strictly mandates return of original certificates/documents within 7 calendar days (took: ${facts.certificatesReturnedDays} days).`);
      }
    }
    return {
      compliant: violations.length === 0,
      governingClause: clause,
      violations
    };
  } else {
    // STANDALONE_PGDM
    const clause = 'APH 2024-27 Annexure 6 Clause 6.12 (Refund Policy for Standalone PGDM Institutions)';
    if (facts.withdrawalDate && facts.withdrawalDate > '2026-06-30') {
      violations.push('PGDM_CUTOFF_PASSED: Annexure 6 Clause 6.12 stipulates cut-off date of 30th June for PGDM fee refund.');
    }
    if (facts.processingFeeDeducted > 1000) {
      violations.push(`FEE_DEDUCTION_EXCEEDED: Annexure 6 Clause 6.12 caps processing fee at Rs. 1,000/-.`);
    }
    return {
      compliant: violations.length === 0,
      governingClause: clause,
      violations
    };
  }
}

/**
 * AICTE APH 2024-27 Clause 6.17(a) Live Land Lease Duration
 * Statutory text: "The Live Lease has to be at least equal to Maximum duration of the program / course at the time of submission of application."
 * NO "+1 year" buffer in statutory text.
 */
export function evaluateLiveLeaseCompliance(facts: {
  leaseDurationYears: number;
  remainingLiveLeaseYears: number;
  maxCourseDurationYears: number;
}): { compliant: boolean; governingClause: string; reason?: string } {
  const clause = 'APH 2024-27 Chapter VI Clause 6.17(a) Land Lease & Live Lease Requirements';
  if (facts.leaseDurationYears < 30) {
    return {
      compliant: false,
      governingClause: clause,
      reason: `INITIAL_LEASE_INSUFFICIENT: Long-term registered lease must be for a minimum period of 30 years (provided: ${facts.leaseDurationYears} years).`
    };
  }
  if (facts.remainingLiveLeaseYears < facts.maxCourseDurationYears) {
    return {
      compliant: false,
      governingClause: clause,
      reason: `LIVE_LEASE_INSUFFICIENT: Live Lease (${facts.remainingLiveLeaseYears} yrs) must be at least equal to maximum duration of program (${facts.maxCourseDurationYears} yrs).`
    };
  }
  return {
    compliant: true,
    governingClause: clause,
    reason: `COMPLIANT: Live lease (${facts.remainingLiveLeaseYears} yrs) meets or exceeds maximum course duration (${facts.maxCourseDurationYears} yrs).`
  };
}

/**
 * AICTE APH 2024-27 Clause 2.25(e) & 2.25(f) Security Deposit Penalties & Council Order Guardrail
 */
export function evaluateSecurityDepositSubmission(facts: {
  intimationDate: string; // ISO date string
  submissionDate: string; // ISO date string
  calendarYear: number;
}): {
  status: 'COMPLIANT_ON_TIME' | 'PENALTY_10_PERCENT' | 'PENALTY_20_PERCENT' | 'SECURITY_DEPOSIT_DEFAULT_PENDING_COUNCIL_ORDER';
  governingClause: string;
  penaltyPercentage: number;
  requiresCouncilOrder: boolean;
  portalAutoRevoked: boolean;
  message: string;
} {
  const clause = 'APH 2024-27 Chapter II Clause 2.25(e) & 2.25(f)';
  const t0 = Date.parse(facts.intimationDate);
  const t1 = Date.parse(facts.submissionDate);
  const daysFromIntimation = (t1 - t0) / (1000 * 60 * 60 * 24);

  const may31 = Date.parse(`${facts.calendarYear}-05-31T23:59:59.999Z`);
  const july31 = Date.parse(`${facts.calendarYear}-07-31T23:59:59.999Z`);

  if (daysFromIntimation <= 15) {
    return {
      status: 'COMPLIANT_ON_TIME',
      governingClause: clause,
      penaltyPercentage: 0,
      requiresCouncilOrder: false,
      portalAutoRevoked: false,
      message: 'Joint FDR security deposit and Affidavit 3 submitted within statutory 15 days from intimation.'
    };
  }

  if (t1 <= may31) {
    return {
      status: 'PENALTY_10_PERCENT',
      governingClause: clause,
      penaltyPercentage: 10,
      requiresCouncilOrder: false,
      portalAutoRevoked: false,
      message: 'Submitted after 15 days but up to 31st May: 10% penalty applicable under Clause 2.25(f).'
    };
  }

  if (t1 <= july31) {
    return {
      status: 'PENALTY_20_PERCENT',
      governingClause: clause,
      penaltyPercentage: 20,
      requiresCouncilOrder: false,
      portalAutoRevoked: false,
      message: 'Submitted after 31st May but up to 31st July: 20% penalty applicable under Clause 2.25(f).'
    };
  }

  // Beyond 31st July: Approval withdrawn by Council. Portal must flag for Council Speaking Order, NEVER auto-cancel!
  return {
    status: 'SECURITY_DEPOSIT_DEFAULT_PENDING_COUNCIL_ORDER',
    governingClause: clause,
    penaltyPercentage: 20,
    requiresCouncilOrder: true,
    portalAutoRevoked: false, // Strict Guardrail: Portal does not execute unilateral autonomous revocation
    message: 'Submitted after 31st July: Flagged as SECURITY_DEPOSIT_DEFAULT_PENDING_COUNCIL_ORDER. Mandates formal Council / Executive Committee withdrawal order.'
  };
}

/**
 * AICTE APH 2024-27 Clause 1.4.7 / 2.19(c) University/State NOC Timeout Guardrail
 */
export function evaluateAffiliatingUniversityNocTimeout(facts: {
  daysElapsedSinceRequest: number;
  responseReceived: boolean;
}): {
  status: 'WAITING_FOR_RESPONSE' | 'PROCEED_WITHOUT_EXTERNAL_VIEWS';
  governingClause: string;
  deemedConcurrenceSynthesized: boolean;
  message: string;
} {
  const clause = 'APH 2024-27 Clause 1.4.7 & Clause 2.19(c) Affiliating University / State NOC';
  if (facts.responseReceived) {
    return {
      status: 'WAITING_FOR_RESPONSE',
      governingClause: clause,
      deemedConcurrenceSynthesized: false,
      message: 'Official views / NOC received from Affiliating University.'
    };
  }
  if (facts.daysElapsedSinceRequest > 15) {
    return {
      status: 'PROCEED_WITHOUT_EXTERNAL_VIEWS',
      governingClause: clause,
      deemedConcurrenceSynthesized: false, // Strict Guardrail: Never synthesize fictitious 'DEEMED_CONCURRENCE'
      message: '15-calendar-day window elapsed. Per Clause 1.4.7/2.19(c), Council shall proceed without external views. Synthetic concurrence is prohibited.'
    };
  }
  return {
    status: 'WAITING_FOR_RESPONSE',
    governingClause: clause,
    deemedConcurrenceSynthesized: false,
    message: `Awaiting response from Affiliating University / State (${15 - facts.daysElapsedSinceRequest} days remaining).`
  };
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
    it('allows statutory appeal filed on Day 6 within 7 calendar days', () => {
      const result = evaluateClockApplication(
        'SECTION_1_11_SAC_APPEAL',
        'REJECTED_SPEAKING_ORDER',
        6
      );
      expect(result.valid).toBe(true);
      expect(result.message).toContain('within 7-calendar-day statute of limitations');
    });

    it('allows statutory appeal filed on exact boundary Day 7.0', () => {
      const result = evaluateClockApplication(
        'SECTION_1_11_SAC_APPEAL',
        'REJECTED_SPEAKING_ORDER',
        7
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
      expect(result.message).toContain('APPEAL_WINDOW_ELAPSED_PENDING_COUNCIL_ORDER');
    });

    it('disambiguates Chapter I Clause 1.11(a) trigger: Date of ISSUE of Letter of Deficiency (LoD), NOT receipt', () => {
      const appealChapterI = evaluateStatutoryAppealWindow({
        chapter: 'CHAPTER_I',
        triggerEventDate: '2026-04-10T10:00:00.000Z',
        submissionDate: '2026-04-16T10:00:00.000Z', // 6 days later
        speakingOrderPresent: true
      });
      expect(appealChapterI.valid).toBe(true);
      expect(appealChapterI.statutoryTrigger).toBe('DATE_OF_ISSUE_OF_LOD');
      expect(appealChapterI.governingClause).toBe('APH 2024-27 Chapter I Clause 1.11(a)');
    });

    it('disambiguates Chapter II Clause 2.24(a) trigger: Date of UPLOADING of the EC decision', () => {
      const appealChapterII = evaluateStatutoryAppealWindow({
        chapter: 'CHAPTER_II',
        triggerEventDate: '2026-05-01T12:00:00.000Z',
        submissionDate: '2026-05-07T12:00:00.000Z', // 6 days later
        speakingOrderPresent: true
      });
      expect(appealChapterII.valid).toBe(true);
      expect(appealChapterII.statutoryTrigger).toBe('DATE_OF_UPLOADING_OF_DECISION');
      expect(appealChapterII.governingClause).toBe('APH 2024-27 Chapter II Clause 2.24(a)');
    });

    it('mandates Speaking Order presence under AICTE Act §10(k) and Clause 1.10(b)/2.23.3 prior to appeal processing', () => {
      const noSpeakingOrder = evaluateStatutoryAppealWindow({
        chapter: 'CHAPTER_I',
        triggerEventDate: '2026-04-10T10:00:00.000Z',
        submissionDate: '2026-04-14T10:00:00.000Z',
        speakingOrderPresent: false
      });
      expect(noSpeakingOrder.valid).toBe(false);
      expect(noSpeakingOrder.errorCode).toBe('SPEAKING_ORDER_MANDATORY');
    });
  });

  describe('Statutory Fee Refund Policy: Clause 6.45 vs Annexure 6 Clause 6.12', () => {
    it('verifies compliant fee refund for Technical Institutions under Clause 6.45 (full refund, max Rs 1000 fee, 7 days)', () => {
      const result = evaluateFeeRefundCompliance({
        institutionType: 'GENERAL_TECHNICAL',
        isWithdrawnBeforeStart: true,
        processingFeeDeducted: 1000,
        refundTurnaroundDays: 5,
        certificatesReturnedDays: 3
      });
      expect(result.compliant).toBe(true);
      expect(result.governingClause).toContain('Clause 6.45');
      expect(result.violations).toHaveLength(0);
    });

    it('rejects fee refund violation where processing fee exceeds Rs 1,000/-', () => {
      const result = evaluateFeeRefundCompliance({
        institutionType: 'GENERAL_TECHNICAL',
        isWithdrawnBeforeStart: true,
        processingFeeDeducted: 5000,
        refundTurnaroundDays: 5,
        certificatesReturnedDays: 5
      });
      expect(result.compliant).toBe(false);
      expect(result.violations.some(v => v.includes('FEE_DEDUCTION_EXCEEDED'))).toBe(true);
    });

    it('rejects fee refund violation where refund turnaround exceeds 7 calendar days', () => {
      const result = evaluateFeeRefundCompliance({
        institutionType: 'GENERAL_TECHNICAL',
        isWithdrawnBeforeStart: true,
        processingFeeDeducted: 1000,
        refundTurnaroundDays: 14,
        certificatesReturnedDays: 5
      });
      expect(result.compliant).toBe(false);
      expect(result.violations.some(v => v.includes('REFUND_WINDOW_BREACH'))).toBe(true);
    });

    it('rejects original certificates withholding beyond 7 calendar days', () => {
      const result = evaluateFeeRefundCompliance({
        institutionType: 'GENERAL_TECHNICAL',
        isWithdrawnBeforeStart: true,
        processingFeeDeducted: 1000,
        refundTurnaroundDays: 6,
        certificatesReturnedDays: 15
      });
      expect(result.compliant).toBe(false);
      expect(result.violations.some(v => v.includes('CERTIFICATE_RETURN_BREACH'))).toBe(true);
    });

    it('enforces Standalone PGDM 30th June cut-off under Annexure 6 Clause 6.12', () => {
      const validPgdm = evaluateFeeRefundCompliance({
        institutionType: 'STANDALONE_PGDM',
        isWithdrawnBeforeStart: true,
        withdrawalDate: '2026-06-25',
        processingFeeDeducted: 1000,
        refundTurnaroundDays: 5,
        certificatesReturnedDays: 5
      });
      expect(validPgdm.compliant).toBe(true);
      expect(validPgdm.governingClause).toContain('Annexure 6 Clause 6.12');

      const latePgdm = evaluateFeeRefundCompliance({
        institutionType: 'STANDALONE_PGDM',
        isWithdrawnBeforeStart: true,
        withdrawalDate: '2026-07-05',
        processingFeeDeducted: 1000,
        refundTurnaroundDays: 5,
        certificatesReturnedDays: 5
      });
      expect(latePgdm.compliant).toBe(false);
      expect(latePgdm.violations.some(v => v.includes('PGDM_CUTOFF_PASSED'))).toBe(true);
    });
  });

  describe('Live Land Lease Duration: Clause 6.17(a) (No "+1 year" distortion)', () => {
    it('approves establishment with >= 30-year lease and live lease >= max course duration', () => {
      const result = evaluateLiveLeaseCompliance({
        leaseDurationYears: 30,
        remainingLiveLeaseYears: 4,
        maxCourseDurationYears: 4 // e.g. 4-year B.Tech
      });
      expect(result.compliant).toBe(true);
      expect(result.reason).toContain('COMPLIANT');
    });

    it('rejects initial lease less than statutory 30 years', () => {
      const result = evaluateLiveLeaseCompliance({
        leaseDurationYears: 25,
        remainingLiveLeaseYears: 10,
        maxCourseDurationYears: 4
      });
      expect(result.compliant).toBe(false);
      expect(result.reason).toContain('INITIAL_LEASE_INSUFFICIENT');
    });

    it('rejects when remaining live lease is less than maximum course duration', () => {
      const result = evaluateLiveLeaseCompliance({
        leaseDurationYears: 30,
        remainingLiveLeaseYears: 3,
        maxCourseDurationYears: 4 // Needs at least 4 years
      });
      expect(result.compliant).toBe(false);
      expect(result.reason).toContain('LIVE_LEASE_INSUFFICIENT');
    });

    it('validates that live lease EQUAL to course duration is compliant (disproving "+1 year" myth)', () => {
      const result = evaluateLiveLeaseCompliance({
        leaseDurationYears: 30,
        remainingLiveLeaseYears: 4,
        maxCourseDurationYears: 4
      });
      expect(result.compliant).toBe(true);
    });
  });

  describe('Security Deposit Penalty Stages and Autonomous Revocation Prohibition: Clause 2.25(f)', () => {
    it('recognizes on-time deposit within 15 calendar days from intimation (0% penalty)', () => {
      const res = evaluateSecurityDepositSubmission({
        intimationDate: '2026-03-01T00:00:00.000Z',
        submissionDate: '2026-03-12T00:00:00.000Z',
        calendarYear: 2026
      });
      expect(res.status).toBe('COMPLIANT_ON_TIME');
      expect(res.penaltyPercentage).toBe(0);
      expect(res.requiresCouncilOrder).toBe(false);
    });

    it('imposes 10% penalty for submissions beyond 15 days up to 31st May', () => {
      const res = evaluateSecurityDepositSubmission({
        intimationDate: '2026-03-01T00:00:00.000Z',
        submissionDate: '2026-04-15T00:00:00.000Z',
        calendarYear: 2026
      });
      expect(res.status).toBe('PENALTY_10_PERCENT');
      expect(res.penaltyPercentage).toBe(10);
      expect(res.requiresCouncilOrder).toBe(false);
    });

    it('imposes 20% penalty for submissions between 1st June and 31st July', () => {
      const res = evaluateSecurityDepositSubmission({
        intimationDate: '2026-03-01T00:00:00.000Z',
        submissionDate: '2026-06-20T00:00:00.000Z',
        calendarYear: 2026
      });
      expect(res.status).toBe('PENALTY_20_PERCENT');
      expect(res.penaltyPercentage).toBe(20);
      expect(res.requiresCouncilOrder).toBe(false);
    });

    it('flags default beyond 31st July for Council Speaking Order, strictly forbidding automated portal revocation', () => {
      const res = evaluateSecurityDepositSubmission({
        intimationDate: '2026-03-01T00:00:00.000Z',
        submissionDate: '2026-08-05T00:00:00.000Z',
        calendarYear: 2026
      });
      expect(res.status).toBe('SECURITY_DEPOSIT_DEFAULT_PENDING_COUNCIL_ORDER');
      expect(res.requiresCouncilOrder).toBe(true);
      expect(res.portalAutoRevoked).toBe(false); // Guardrail: Portal does not auto-cancel approvals
      expect(res.message).toContain('Mandates formal Council / Executive Committee withdrawal order');
    });
  });

  describe('Affiliating University / State NOC 15-Day Timeout: Clause 1.4.7 / 2.19(c)', () => {
    it('waits for response when within 15 days', () => {
      const res = evaluateAffiliatingUniversityNocTimeout({
        daysElapsedSinceRequest: 8,
        responseReceived: false
      });
      expect(res.status).toBe('WAITING_FOR_RESPONSE');
      expect(res.deemedConcurrenceSynthesized).toBe(false);
    });

    it('proceeds without external views after 15 days without synthesizing deemed concurrence', () => {
      const res = evaluateAffiliatingUniversityNocTimeout({
        daysElapsedSinceRequest: 16,
        responseReceived: false
      });
      expect(res.status).toBe('PROCEED_WITHOUT_EXTERNAL_VIEWS');
      expect(res.deemedConcurrenceSynthesized).toBe(false);
      expect(res.message).toContain('Council shall proceed without external views');
    });
  });
});
