import { describe, it, expect } from 'vitest'
import { toLocalDateStr, parseLocalDate, dateRangeInclusive, addDays } from './datetime'

describe('toLocalDateStr', () => {
  it('formats using local calendar fields (no UTC shift)', () => {
    // Construct a local date explicitly via numeric fields.
    const d = new Date(2026, 7, 9, 23, 30) // 2026-08-09 23:30 local
    expect(toLocalDateStr(d)).toBe('2026-08-09')
  })

  it('zero-pads month and day', () => {
    const d = new Date(2026, 0, 5) // 2026-01-05 local
    expect(toLocalDateStr(d)).toBe('2026-01-05')
  })
})

describe('parseLocalDate', () => {
  it('parses to local midday, preserving the calendar day', () => {
    const d = parseLocalDate('2026-08-09')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(7)
    expect(d.getDate()).toBe(9)
    // Round-trip stays on the same day.
    expect(toLocalDateStr(d)).toBe('2026-08-09')
  })
})

describe('dateRangeInclusive', () => {
  it('includes both endpoints', () => {
    expect(dateRangeInclusive('2026-08-01', '2026-08-03')).toEqual([
      '2026-08-01',
      '2026-08-02',
      '2026-08-03',
    ])
  })

  it('returns a single date when from === to', () => {
    expect(dateRangeInclusive('2026-08-09', '2026-08-09')).toEqual(['2026-08-09'])
  })

  it('crosses a month boundary correctly', () => {
    expect(dateRangeInclusive('2026-01-30', '2026-02-02')).toEqual([
      '2026-01-30',
      '2026-01-31',
      '2026-02-01',
      '2026-02-02',
    ])
  })

  it('returns [] for an inverted range', () => {
    expect(dateRangeInclusive('2026-08-10', '2026-08-01')).toEqual([])
  })
})

describe('addDays', () => {
  it('adds days across a month boundary', () => {
    expect(toLocalDateStr(addDays(parseLocalDate('2026-08-30'), 3))).toBe('2026-09-02')
  })

  it('subtracts with a negative value', () => {
    expect(toLocalDateStr(addDays(parseLocalDate('2026-08-01'), -1))).toBe('2026-07-31')
  })

  it('does not mutate the input date', () => {
    const d = parseLocalDate('2026-08-01')
    addDays(d, 5)
    expect(toLocalDateStr(d)).toBe('2026-08-01')
  })
})
