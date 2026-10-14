import { calculateNd } from "../../engine/calculate-nd"
import type { NdResult, WageTypeRule } from "../../engine/types"

import {
  buildShiftInput,
  parseShiftEntry,
  type ShiftFieldErrors,
  type ShiftProfile,
} from "./parse-shift-entry"

export type WeekShiftDraft = {
  id: string
  workDate: string
  shiftStart: string
  shiftEnd: string
  dayClassification: string
  breakIncludedInNd: string
  scheduleType: string
  scheduledRegularHours: string
  overtimeApproved: string
  included: boolean
}

export type WeekRowCalculation = {
  id: string
  status: "ready" | "needs-review" | "not-included"
  fieldErrors?: ShiftFieldErrors
  result?: NdResult
}

export function calculateWeekRows(
  rows: WeekShiftDraft[],
  profile: ShiftProfile,
  rules: WageTypeRule[],
  calculate: typeof calculateNd = calculateNd,
): WeekRowCalculation[] {
  return rows.map((row) => {
    if (!row.included) {
      return { id: row.id, status: "not-included" }
    }

    const parsed = parseShiftEntry(row)
    if (!parsed.success) {
      return { id: row.id, status: "needs-review", fieldErrors: parsed.fieldErrors }
    }

    const input = buildShiftInput(parsed.data, profile)
    return { id: row.id, status: "ready", result: calculate(input, rules) }
  })
}

export { buildShiftInput, parseShiftEntry }
