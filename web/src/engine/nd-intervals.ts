import { DateTime } from "luxon"

export type NdClockInterval = {
  start: string
  end: string
}

export type NdIntervals = {
  shift: NdClockInterval
  windows: NdClockInterval[]
  overlaps: NdClockInterval[]
}

type NdIntervalInput = {
  shiftStart: string
  shiftEnd: string
  ndStart: string
  ndEnd: string
  timeZone: string
}

function isoOrThrow(value: DateTime, label: string): string {
  const iso = value.toISO()
  if (iso === null) {
    throw new Error(`${label} must serialize to an ISO date-time with offset.`)
  }
  return iso
}

function normalizeShift(input: NdIntervalInput): { start: DateTime; end: DateTime } {
  const start = DateTime.fromISO(input.shiftStart, { zone: input.timeZone })
  let end = DateTime.fromISO(input.shiftEnd, { zone: input.timeZone })

  if (!start.isValid || !end.isValid) {
    throw new Error("Shift start and end must be valid local date-times.")
  }

  if (end.toMillis() <= start.toMillis()) {
    end = end.plus({ days: 1 })
  }

  return { start, end }
}

function buildWindow(input: NdIntervalInput, date: DateTime): { start: DateTime; end: DateTime } {
  const isoDate = date.toISODate()
  if (isoDate === null) {
    throw new Error("The shift dates must be valid.")
  }

  const start = DateTime.fromISO(`${isoDate}T${input.ndStart}`, { zone: input.timeZone })
  let end = DateTime.fromISO(`${isoDate}T${input.ndEnd}`, { zone: input.timeZone })

  if (!start.isValid || !end.isValid) {
    throw new Error("The work date and ND window must be valid.")
  }

  if (end.toMillis() <= start.toMillis()) {
    end = end.plus({ days: 1 })
  }

  return { start, end }
}

/**
 * Produces the actual clock intervals used by the calculation. Break time is
 * deliberately absent because the product records only its duration, never a
 * clock position.
 */
export function buildNdIntervals(input: NdIntervalInput): NdIntervals {
  const shift = normalizeShift(input)
  const windows: NdClockInterval[] = []
  const overlaps: NdClockInterval[] = []
  const candidates: Array<{ interval: NdClockInterval; distance: number }> = []
  let windowDate = shift.start.startOf("day").minus({ days: 1 })
  const lastWindowDate = shift.end.startOf("day")

  while (windowDate.toMillis() <= lastWindowDate.toMillis()) {
    const window = buildWindow(input, windowDate)
    const windowInterval = {
      start: isoOrThrow(window.start, "ND window start"),
      end: isoOrThrow(window.end, "ND window end"),
    }
    const overlapStart = Math.max(shift.start.toMillis(), window.start.toMillis())
    const overlapEnd = Math.min(shift.end.toMillis(), window.end.toMillis())
    const distance = Math.max(shift.start.toMillis() - window.end.toMillis(), window.start.toMillis() - shift.end.toMillis(), 0)
    candidates.push({ interval: windowInterval, distance })

    if (overlapEnd > overlapStart) {
      windows.push(windowInterval)
      overlaps.push({
        start: isoOrThrow(DateTime.fromMillis(overlapStart, { zone: input.timeZone }), "ND overlap start"),
        end: isoOrThrow(DateTime.fromMillis(overlapEnd, { zone: input.timeZone }), "ND overlap end"),
      })
    }

    windowDate = windowDate.plus({ days: 1 })
  }

  if (windows.length === 0 && candidates.length > 0) {
    const nearest = [...candidates].sort((left, right) => left.distance - right.distance)[0]
    if (nearest) windows.push(nearest.interval)
  }

  return {
    shift: {
      start: isoOrThrow(shift.start, "Normalized shift start"),
      end: isoOrThrow(shift.end, "Normalized shift end"),
    },
    windows,
    overlaps,
  }
}
