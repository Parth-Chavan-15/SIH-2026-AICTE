import { SLAStatusType } from '../types';

export interface SLACalculationResult {
  elapsedDays: number;
  slaDays: number;
  daysRemaining: number;
  isOverdue: boolean;
  overdueDays: number;
  status: SLAStatusType;
}

/**
 * Calculates SLA metrics dynamically from timestamps and configured thresholds.
 */
export function computeSLAStatus(
  stageStartedAt: string,
  slaDays: number,
  referenceDate: string = '2026-10-22T10:35:00Z'
): SLACalculationResult {
  const start = new Date(stageStartedAt).getTime();
  const current = new Date(referenceDate).getTime();
  const diffMs = Math.max(0, current - start);
  const elapsedDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const daysRemaining = slaDays - elapsedDays;
  const isOverdue = daysRemaining < 0;
  const overdueDays = isOverdue ? Math.abs(daysRemaining) : 0;

  let status: SLAStatusType = 'within_sla';
  if (isOverdue) {
    status = 'overdue';
  } else if (daysRemaining <= 2) {
    // 2 days or less remaining is approaching deadline
    status = 'approaching_deadline';
  }

  return {
    elapsedDays,
    slaDays,
    daysRemaining,
    isOverdue,
    overdueDays,
    status,
  };
}

/**
 * Categorize processing aging into analytical buckets
 */
export function getAgingBucket(elapsedDays: number): '0-7 Days' | '8-14 Days' | '15-30 Days' | '30+ Days' {
  if (elapsedDays <= 7) return '0-7 Days';
  if (elapsedDays <= 14) return '8-14 Days';
  if (elapsedDays <= 30) return '15-30 Days';
  return '30+ Days';
}

/**
 * Format date in Indian Administrative format (DD-MMM-YYYY)
 */
export function formatDateIndian(isoDateString: string): string {
  try {
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) return isoDateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDateString;
  }
}
