/**
 * Timezone-safe date helpers (local time, no UTC drift).
 *
 * Background: several screens (Reports, Dashboard, MySchedule, MyEarnings) each
 * fixed the same class of bug where `Date.toISOString()` was used to derive a
 * "local" YYYY-MM-DD string, causing the date to shift by a day in timezones
 * behind/ahead of UTC. This module centralizes the correct, local-time logic.
 *
 * These helpers are pure and covered by unit tests. They are the intended
 * target for consolidation task #5 (not yet wired into the pages).
 */

/** Format a Date as a local-time YYYY-MM-DD string (no UTC conversion). */
export function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse a YYYY-MM-DD string into a Date at local midday (avoids DST/UTC edge shifts). */
export function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00`)
}

/**
 * Inclusive list of YYYY-MM-DD strings between `from` and `to`.
 * Iterates in local time so no dates are skipped or duplicated across DST.
 * Returns [] when the range is inverted (from > to).
 */
export function dateRangeInclusive(from: string, to: string): string[] {
  const dates: string[] = []
  const start = parseLocalDate(from)
  const end = parseLocalDate(to)
  const current = new Date(start)
  while (current <= end) {
    dates.push(toLocalDateStr(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

/** Add (or subtract, with a negative value) whole days to a Date, in local time. */
export function addDays(d: Date, days: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}
