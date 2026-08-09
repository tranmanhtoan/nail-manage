/**
 * Shared utility for calculating employee idle minutes.
 * Used by QuickEntry (rotation display) and Appointments (rotation panel).
 *
 * Logic:
 * - If employee is busy (has in_progress appointment) → null (busy)
 * - If employee has completed appointments today → idle since last completion
 * - If no completions → idle since shift start or activation time (whichever is later)
 */

const SHIFT_START_MINUTES = 9 * 60 // 9:00 AM

export interface IdleCalcAppointment {
  employee_id: string | null
  status: string
  time: string
}

export interface IdleCalcEmployee {
  id: string
  activated_at: string | null
}

/**
 * Calculate idle minutes for each employee based on today's appointments.
 *
 * @param employees - List of active employees
 * @param appointments - Today's appointments (need employee_id, status, time)
 * @param now - Current time (passed in so caller can control for timers/reactivity)
 * @param dateStr - The date being viewed (idle only calculated when viewing today)
 * @returns Map of employee_id → idle minutes (null = busy)
 */
export function calculateIdleMinutes(
  employees: IdleCalcEmployee[],
  appointments: IdleCalcAppointment[],
  now: Date = new Date(),
  dateStr?: string,
): Record<string, number | null> {
  const todayStr = now.toISOString().slice(0, 10)
  const viewingDate = dateStr ?? todayStr

  // Only calculate idle for today — other dates don't have meaningful idle times
  if (viewingDate !== todayStr) {
    const result: Record<string, number | null> = {}
    for (const emp of employees) {
      result[emp.id] = null
    }
    return result
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  // Build lookup maps from appointments
  const busyIds = new Set<string>()
  const lastCompletedTime = new Map<string, string>()

  for (const apt of appointments) {
    if (!apt.employee_id) continue

    if (apt.status === 'in_progress') {
      busyIds.add(apt.employee_id)
    }

    if (apt.status === 'completed') {
      const prev = lastCompletedTime.get(apt.employee_id)
      if (!prev || apt.time > prev) {
        lastCompletedTime.set(apt.employee_id, apt.time)
      }
    }
  }

  // Calculate idle for each employee
  const result: Record<string, number | null> = {}

  for (const emp of employees) {
    if (busyIds.has(emp.id)) {
      result[emp.id] = null // busy
      continue
    }

    const lastTime = lastCompletedTime.get(emp.id)
    if (lastTime) {
      // Idle since last completed appointment
      // time from DB is in UTC — convert to local timezone offset
      const [h, m] = lastTime.split(':')
      const utcMinutes = parseInt(h) * 60 + parseInt(m)
      // Get local timezone offset in minutes (negative means ahead of UTC)
      const tzOffsetMinutes = -now.getTimezoneOffset()
      let completedLocalMinutes = utcMinutes + tzOffsetMinutes
      // Handle day wraparound
      if (completedLocalMinutes < 0) completedLocalMinutes += 24 * 60
      if (completedLocalMinutes >= 24 * 60) completedLocalMinutes -= 24 * 60
      result[emp.id] = Math.max(0, nowMinutes - completedLocalMinutes)
    } else {
      // No completed today — idle since activation or shift start (whichever is later)
      let startMinutes = SHIFT_START_MINUTES
      if (emp.activated_at) {
        const activatedDate = new Date(emp.activated_at)
        const activatedDateStr = activatedDate.toISOString().slice(0, 10)
        if (activatedDateStr === todayStr) {
          const activatedMinutes = activatedDate.getHours() * 60 + activatedDate.getMinutes()
          startMinutes = Math.max(SHIFT_START_MINUTES, activatedMinutes)
        }
      }
      result[emp.id] = Math.max(0, nowMinutes - startMinutes)
    }
  }

  return result
}
