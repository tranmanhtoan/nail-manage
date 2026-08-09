import { describe, it, expect } from 'vitest'
import { calcEarnings, getPeriodDays, type PayConfig } from './payroll'

describe('calcEarnings — commission', () => {
  const cfg: PayConfig = { payType: 'commission', commissionRate: 60 }

  it('applies rate to revenue and adds full tips', () => {
    // 1000 * 60% + 200 = 800
    expect(calcEarnings(cfg, 1000, 200)).toBe(800)
  })

  it('is unaffected by periodDays (commission does not scale)', () => {
    expect(calcEarnings(cfg, 1000, 200, 1)).toBe(800)
    expect(calcEarnings(cfg, 1000, 200, 30)).toBe(800)
  })

  it('treats missing commissionRate as 0 (tips only)', () => {
    expect(calcEarnings({ payType: 'commission' }, 1000, 50)).toBe(50)
    expect(calcEarnings({ payType: 'commission', commissionRate: null }, 1000, 50)).toBe(50)
  })

  it('handles zero revenue and zero tips', () => {
    expect(calcEarnings(cfg, 0, 0)).toBe(0)
  })
})

describe('calcEarnings — split', () => {
  const cfg: PayConfig = { payType: 'split', splitRate: 60 }

  it('applies rate to (revenue + tips)', () => {
    // (1000 + 200) * 60% = 720
    expect(calcEarnings(cfg, 1000, 200)).toBe(720)
  })

  it('is unaffected by periodDays', () => {
    expect(calcEarnings(cfg, 1000, 200, 1)).toBe(720)
    expect(calcEarnings(cfg, 1000, 200, 30)).toBe(720)
  })

  it('treats missing splitRate as 0', () => {
    expect(calcEarnings({ payType: 'split' }, 1000, 200)).toBe(0)
  })

  it('40/60 split example', () => {
    // (500 + 100) * 40% = 240
    expect(calcEarnings({ payType: 'split', splitRate: 40 }, 500, 100)).toBe(240)
  })
})

describe('calcEarnings — fixed (weekly salary scaled by periodDays)', () => {
  const cfg: PayConfig = { payType: 'fixed', fixedSalary: 700 }

  it('full week (7 days) returns the weekly salary + tips', () => {
    expect(calcEarnings(cfg, 9999, 50, 7)).toBe(750)
  })

  it('single day (periodDays=1) returns weekly/7 + tips', () => {
    // 700/7 + 50 = 150
    expect(calcEarnings(cfg, 9999, 50, 1)).toBe(150)
  })

  it('month (periodDays=30) returns weekly*30/7 + tips', () => {
    // 700*30/7 + 0 = 3000
    expect(calcEarnings(cfg, 9999, 0, 30)).toBe(3000)
  })

  it('ignores revenue entirely (fixed salary is revenue-independent)', () => {
    expect(calcEarnings(cfg, 0, 0, 7)).toBe(700)
    expect(calcEarnings(cfg, 100000, 0, 7)).toBe(700)
  })

  it('defaults periodDays to a full week', () => {
    expect(calcEarnings(cfg, 0, 0)).toBe(700)
  })

  it('treats missing fixedSalary as 0 (tips only)', () => {
    expect(calcEarnings({ payType: 'fixed' }, 0, 80, 7)).toBe(80)
  })
})

describe('calcEarnings — unknown pay type', () => {
  it('returns 0 for an unrecognized pay type', () => {
    // Force an invalid value to mirror defensive default branch.
    expect(calcEarnings({ payType: 'bonus' as unknown as PayConfig['payType'] }, 1000, 200)).toBe(0)
  })
})

describe('getPeriodDays', () => {
  it('maps fixed periods to day counts', () => {
    expect(getPeriodDays('today')).toBe(1)
    expect(getPeriodDays('day')).toBe(1)
    expect(getPeriodDays('week')).toBe(7)
    expect(getPeriodDays('month')).toBe(30)
  })

  it('range: inclusive day count', () => {
    // 2026-08-01 .. 2026-08-01 -> 1 day
    expect(getPeriodDays('range', '2026-08-01', '2026-08-01')).toBe(1)
    // 2026-08-01 .. 2026-08-07 -> 7 days
    expect(getPeriodDays('range', '2026-08-01', '2026-08-07')).toBe(7)
  })

  it('range: caps at 31 days', () => {
    expect(getPeriodDays('range', '2026-01-01', '2026-12-31')).toBe(31)
  })

  it('range: falls back to 7 when endpoints missing', () => {
    expect(getPeriodDays('range')).toBe(7)
    expect(getPeriodDays('range', '2026-08-01')).toBe(7)
  })
})
