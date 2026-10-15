import { DateTime } from "luxon"

import type { WeekRowCalculation, WeekShiftDraft } from "@/server/shift/week-entry"
import type { ShiftFieldErrors } from "@/server/shift/parse-shift-entry"

type ShiftField = keyof ShiftFieldErrors

const FIELD_SUFFIX: Record<ShiftField, string> = {
  workDate: "date",
  shiftStart: "start",
  shiftEnd: "end",
  dayClassification: "classification",
  breakIncludedInNd: "break",
  scheduleType: "schedule",
  scheduledRegularHours: "hours",
  overtimeApproved: "ot",
}

const FIELD_ORDER = Object.keys(FIELD_SUFFIX) as ShiftField[]

type WeekSummary = {
  includedCount: number
  readyCount: number
  needsReviewCount: number
  tbdCount: number
  finalNdHours: string
  knownEstimateCentavos: number
}

type WeekErrorTarget = {
  rowId: string
  field: ShiftField
  targetId: string
  message: string
}

function buildWeekRows(referenceDate: string, timeZone: string): WeekShiftDraft[] {
  const reference = DateTime.fromISO(referenceDate, { zone: timeZone })
  const monday = (reference.isValid ? reference : DateTime.now().setZone(timeZone)).startOf("week")

  return Array.from({ length: 7 }, (_, index) => {
    const date = monday.plus({ days: index }).toISODate() ?? ""
    return {
      id: `week-${date}`,
      workDate: date,
      shiftStart: "21:00",
      shiftEnd: "06:00",
      dayClassification: "REGULAR_WORK_DAY",
      breakIncludedInNd: "false",
      scheduleType: "STANDARD",
      scheduledRegularHours: "8.00",
      overtimeApproved: "false",
      included: index < 5,
    }
  })
}

function summarizeWeek(
  rows: WeekShiftDraft[],
  calculations: WeekRowCalculation[],
): WeekSummary {
  const included = new Set(rows.filter((row) => row.included).map((row) => row.id))
  let readyCount = 0
  let needsReviewCount = 0
  let tbdCount = 0
  let finalNdHours = 0
  let knownEstimateCentavos = 0

  for (const calculation of calculations) {
    if (!included.has(calculation.id)) continue
    if (calculation.status !== "ready" || !calculation.result) {
      needsReviewCount += 1
      continue
    }

    readyCount += 1
    finalNdHours += Number(calculation.result.ndHours)
    const isTbd = calculation.result.lines.some((line) => line.status === "tbd") || calculation.result.unresolved.length > 0
    if (isTbd) tbdCount += 1
    for (const line of calculation.result.lines) {
      if (line.status === "estimated") knownEstimateCentavos += line.centavos
    }
  }

  return {
    includedCount: included.size,
    readyCount,
    needsReviewCount,
    tbdCount,
    finalNdHours: finalNdHours.toFixed(2),
    knownEstimateCentavos,
  }
}

function weekRowFieldId(rowId: string, field: ShiftField): string {
  return `${rowId}-${FIELD_SUFFIX[field]}`
}

function firstWeekErrorTarget(
  rows: WeekShiftDraft[],
  errors: Record<string, ShiftFieldErrors>,
): WeekErrorTarget | null {
  return weekErrorTargets(rows, errors)[0] ?? null
}

function weekErrorTargets(
  rows: WeekShiftDraft[],
  errors: Record<string, ShiftFieldErrors>,
): WeekErrorTarget[] {
  const targets: WeekErrorTarget[] = []
  for (const row of rows) {
    const rowErrors = errors[row.id]
    if (!rowErrors) continue
    for (const field of FIELD_ORDER) {
      const message = rowErrors[field]
      if (message) {
        targets.push({
          rowId: row.id,
          field,
          targetId: weekRowFieldId(row.id, field),
          message,
        })
      }
    }
  }
  return targets
}

export {
  buildWeekRows,
  firstWeekErrorTarget,
  summarizeWeek,
  weekErrorTargets,
  weekRowFieldId,
}
export type { ShiftField, WeekErrorTarget, WeekSummary }
