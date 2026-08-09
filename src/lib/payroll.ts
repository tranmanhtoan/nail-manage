/**
 * Pure payroll calculation utilities.
 *
 * This module captures — faithfully and without behavior change — the employee
 * earnings formulas currently duplicated inline in:
 *   - src/pages/owner/Reports.tsx   (loadReport / openEmployeeDetail)
 *   - src/pages/employee/MyEarnings.tsx (calcEarnings)
 *
 * It is intentionally NOT wired into those files yet. The purpose is to lock the
 * current behavior behind unit tests first (safety net), so a later refactor can
 * adopt this shared function with confidence that the numbers stay identical.
 *
 * Formulas (verified identical across both call sites):
 *   commission: revenue * (commissionRate/100) + tips
 *   split:      (revenue + tips) * (splitRate/100)
 *   fixed:      weeklySalary * (periodDays/7) + tips
 *
 * Where `revenue` is the sum of service prices (NOT including tips), and `tips`
 * is the sum of tips over the same set of completed appointments.
 */

export type PayType = 'commission' | 'fixed' | 'split'

export interface PayConfig {
  payType: PayType
  /** Commission percentage (0–100). Used when payType === 'commission'. */
  commissionRate?: number | null
  /** Weekly fixed salary. Used when payType === 'fixed'. */
  fixedSalary?: number | null
  /** Split percentage (0–100) applied to price+tip. Used when payType === 'split'. */
  splitRate?: number | null
}

export type EarningsPeriod = 'today' | 'day' | 'week' | 'month' | 'range'

/**
 * Number of days a reporting period represents. Used only to scale the weekly
 * fixed salary. Mirrors the existing branches in Reports.tsx / MyEarnings.tsx:
 *   day/today -> 1, week -> 7, month -> 30,
 *   range     -> min(31, ceil((end - start) / 1 day) + 1)
 */
export function getPeriodDays(
  period: EarningsPeriod,
  rangeStart?: string,
  rangeEnd?: string,
): number {
  switch (period) {
    case 'today':
    case 'day':
      return 1
    case 'week':
      return 7
    case 'month':
      return 30
    case 'range': {
      if (!rangeStart || !rangeEnd) return 7
      const diffMs = new Date(rangeEnd).getTime() - new Date(rangeStart).getTime()
      return Math.min(31, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1)
    }
    default:
      return 7
  }
}

/**
 * Calculate an employee's earnings for a set of completed appointments.
 *
 * @param config     Employee pay configuration.
 * @param revenue    Sum of service prices (excluding tips).
 * @param tips       Sum of tips.
 * @param periodDays Days the period spans (see getPeriodDays). Defaults to 7
 *                   (a full week) so that a fixed-salary employee gets exactly
 *                   their weekly salary when no period scaling is requested.
 */
export function calcEarnings(
  config: PayConfig,
  revenue: number,
  tips: number,
  periodDays: number = 7,
): number {
  switch (config.payType) {
    case 'commission':
      return revenue * ((config.commissionRate ?? 0) / 100) + tips
    case 'split':
      return (revenue + tips) * ((config.splitRate ?? 0) / 100)
    case 'fixed':
      return (config.fixedSalary ?? 0) * (periodDays / 7) + tips
    default:
      return 0
  }
}
