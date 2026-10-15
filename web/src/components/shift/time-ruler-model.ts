import type { ClockInterval, NdClockIntervals } from "@/engine/types"

export type TimeRulerRowKind = "shift" | "window" | "potential" | "final"

export type TimeRulerInterval = ClockInterval & {
  startPercent: number
  widthPercent: number
}

export type TimeRulerModel = {
  axis: ClockInterval
  ticks: Array<{ value: number; percent: number }>
  rows: Array<{
    kind: TimeRulerRowKind
    label: string
    intervals: TimeRulerInterval[]
  }>
}

function clockAxis(intervals: NdClockIntervals): ClockInterval {
  const values = [intervals.shift, ...intervals.windows]
  return {
    start: values.reduce((earliest, value) => Date.parse(value.start) < Date.parse(earliest) ? value.start : earliest, intervals.shift.start),
    end: values.reduce((latest, value) => Date.parse(value.end) > Date.parse(latest) ? value.end : latest, intervals.shift.end),
  }
}

function clockTicks(axis: ClockInterval): Array<{ value: number; percent: number }> {
  const start = Date.parse(axis.start)
  const end = Date.parse(axis.end)
  const span = Math.max(end - start, 1)
  const spanHours = span / 3_600_000
  const stepHours = spanHours > 18 ? 3 : spanHours > 8 ? 2 : 1
  const first = Math.ceil(start / 3_600_000 / stepHours) * stepHours * 3_600_000
  const ticks = []
  for (let value = first; value < end; value += stepHours * 3_600_000) {
    ticks.push({ value, percent: roundedPercent(((value - start) / span) * 100) })
  }
  return ticks
}

function roundedPercent(value: number): number {
  return Number(value.toFixed(3))
}

function positionedIntervals(intervals: ClockInterval[], axis: ClockInterval): TimeRulerInterval[] {
  const axisStart = Date.parse(axis.start)
  const axisEnd = Date.parse(axis.end)
  const span = Math.max(axisEnd - axisStart, 1)

  return intervals.map((interval) => {
    const start = Date.parse(interval.start)
    const end = Date.parse(interval.end)
    return {
      ...interval,
      startPercent: roundedPercent(((start - axisStart) / span) * 100),
      widthPercent: roundedPercent(((end - start) / span) * 100),
    }
  })
}

/** A single-axis visual model. It never infers a duration-only break position. */
export function buildTimeRulerModel(
  intervals: NdClockIntervals,
  finalNdIsKnownOnClock: boolean,
): TimeRulerModel {
  const axis = clockAxis(intervals)
  const rows: TimeRulerModel["rows"] = [
    { kind: "shift", label: "Shift", intervals: positionedIntervals([intervals.shift], axis) },
    { kind: "window", label: "ND window", intervals: positionedIntervals(intervals.windows, axis) },
    { kind: "potential", label: "Potential ND", intervals: positionedIntervals(intervals.overlaps, axis) },
  ]

  if (finalNdIsKnownOnClock) {
    rows.push({
      kind: "final",
      label: "Final ND",
      intervals: positionedIntervals(intervals.overlaps, axis),
    })
  }

  return { axis, ticks: clockTicks(axis), rows }
}
