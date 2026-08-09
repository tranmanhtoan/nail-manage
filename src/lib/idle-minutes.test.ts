import { describe, it, expect, beforeEach, vi } from 'vitest'
import { calculateIdleMinutes, type IdleCalcEmployee, type IdleCalcAppointment } from './idle-minutes'

// jsdom's localStorage under Vitest 4 is unreliable, so install a minimal
// in-memory implementation the util can read `work_start_time` from.
function installMemoryLocalStorage() {
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  })
}

// These tests run with TZ=UTC (set in the `test` npm script), so
// now.getTimezoneOffset() === 0 and appointment times (stored as UTC) map 1:1
// to local minutes. This keeps assertions deterministic across machines.

const NOW = new Date('2026-08-09T15:00:00Z') // 15:00 UTC -> 900 minutes into the day
const TODAY = '2026-08-09'

const emps: IdleCalcEmployee[] = [
  { id: 'e1', activated_at: null },
  { id: 'e2', activated_at: null },
]

beforeEach(() => {
  // Fresh in-memory localStorage each test -> default shift start (09:00)
  // unless a test sets work_start_time explicitly.
  installMemoryLocalStorage()
})

describe('calculateIdleMinutes', () => {
  it('marks an employee with an in_progress appointment as busy (null)', () => {
    const apts: IdleCalcAppointment[] = [
      { employee_id: 'e1', status: 'in_progress', time: '14:00' },
    ]
    const result = calculateIdleMinutes(emps, apts, NOW, TODAY)
    expect(result.e1).toBeNull()
  })

  it('computes idle since the last completed appointment', () => {
    const apts: IdleCalcAppointment[] = [
      { employee_id: 'e1', status: 'completed', time: '13:00' }, // 780 min
    ]
    const result = calculateIdleMinutes(emps, apts, NOW, TODAY)
    // 900 - 780 = 120
    expect(result.e1).toBe(120)
  })

  it('uses the latest completed appointment when there are several', () => {
    const apts: IdleCalcAppointment[] = [
      { employee_id: 'e1', status: 'completed', time: '10:00' },
      { employee_id: 'e1', status: 'completed', time: '14:30' }, // latest -> 870
      { employee_id: 'e1', status: 'completed', time: '12:15' },
    ]
    const result = calculateIdleMinutes(emps, apts, NOW, TODAY)
    // 900 - 870 = 30
    expect(result.e1).toBe(30)
  })

  it('busy state wins even if the employee also has completed appointments', () => {
    const apts: IdleCalcAppointment[] = [
      { employee_id: 'e1', status: 'completed', time: '10:00' },
      { employee_id: 'e1', status: 'in_progress', time: '14:00' },
    ]
    const result = calculateIdleMinutes(emps, apts, NOW, TODAY)
    expect(result.e1).toBeNull()
  })

  it('falls back to the default shift start (09:00) when no completions', () => {
    const result = calculateIdleMinutes(emps, [], NOW, TODAY)
    // 900 - 540 = 360 for both employees
    expect(result.e1).toBe(360)
    expect(result.e2).toBe(360)
  })

  it('honors a custom work_start_time from localStorage', () => {
    localStorage.setItem('work_start_time', '10:30') // 630 min
    const result = calculateIdleMinutes(emps, [], NOW, TODAY)
    // 900 - 630 = 270
    expect(result.e1).toBe(270)
  })

  it('idles since activation when activated today after shift start', () => {
    const activatedToday: IdleCalcEmployee[] = [
      { id: 'e1', activated_at: '2026-08-09T11:00:00Z' }, // 660 min > 540 shift start
    ]
    const result = calculateIdleMinutes(activatedToday, [], NOW, TODAY)
    // 900 - 660 = 240
    expect(result.e1).toBe(240)
  })

  it('uses shift start (not activation) when activated on a previous day', () => {
    const activatedEarlier: IdleCalcEmployee[] = [
      { id: 'e1', activated_at: '2026-08-01T11:00:00Z' },
    ]
    const result = calculateIdleMinutes(activatedEarlier, [], NOW, TODAY)
    // Activation not today -> shift start 540 -> 900 - 540 = 360
    expect(result.e1).toBe(360)
  })

  it('never returns a negative idle value', () => {
    // now earlier than shift start
    const early = new Date('2026-08-09T06:00:00Z') // 360 min < 540 shift start
    const result = calculateIdleMinutes(emps, [], early, TODAY)
    expect(result.e1).toBe(0)
  })

  it('returns null for every employee when viewing a non-today date', () => {
    const apts: IdleCalcAppointment[] = [
      { employee_id: 'e1', status: 'completed', time: '13:00' },
    ]
    const result = calculateIdleMinutes(emps, apts, NOW, '2026-08-08')
    expect(result.e1).toBeNull()
    expect(result.e2).toBeNull()
  })

  it('ignores appointments with a null employee_id', () => {
    const apts: IdleCalcAppointment[] = [
      { employee_id: null, status: 'in_progress', time: '14:00' },
    ]
    const result = calculateIdleMinutes(emps, apts, NOW, TODAY)
    // e1 has no real appointment -> idle since shift start
    expect(result.e1).toBe(360)
  })
})
