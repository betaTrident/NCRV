import { calculateNd } from "../../engine/calculate-nd"
import { toShiftSnapshot, type ShiftSnapshot } from "../../engine/snapshot"
import type { WageTypeRule } from "../../engine/types"

import { calculateWeekRows, type WeekShiftDraft } from "./week-entry"
import { buildShiftInput, parseShiftEntry, type ShiftFieldErrors, type ShiftProfile } from "./parse-shift-entry"

type SaveWeekProfile = ShiftProfile & { rules: WageTypeRule[] }

export type SaveWeekDeps = {
  claims: { sub: string } | null
  profile: SaveWeekProfile | null
  calculate: typeof calculateNd
  persist: (idempotencyKey: string, snapshots: ShiftSnapshot[], inputRows: WeekShiftDraft[]) => Promise<{ ids: string[] } | { error: true }>
}

type SaveWeekResult = {
  fieldErrors: Record<string, ShiftFieldErrors>
  formError?: string
  savedIds?: string[]
}

const SIGN_IN_ERROR = "Sign in to save this week."
const PROFILE_ERROR = "Could not load your calculation settings. Try again."
const REVIEW_ERROR = "Review this week before saving."
const SAVE_ERROR = "Could not save this week. Try again."

function readString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function readRows(formData: FormData): WeekShiftDraft[] | null {
  try {
    const raw = JSON.parse(readString(formData, "rows")) as unknown
    if (!Array.isArray(raw) || raw.length === 0 || raw.length > 31) return null
    const ids = new Set<string>()
    for (const row of raw) {
      if (!row || typeof row !== "object" || Array.isArray(row)) return null
      const candidate = row as Record<string, unknown>
      const id = candidate.id
      if (typeof id !== "string" || id.length < 1 || id.length > 120 || ids.has(id)) return null
      if (typeof candidate.included !== "boolean") return null
      for (const key of [
        "workDate",
        "shiftStart",
        "shiftEnd",
        "dayClassification",
        "breakIncludedInNd",
        "scheduleType",
        "scheduledRegularHours",
        "overtimeApproved",
      ]) {
        if (typeof candidate[key] !== "string") return null
      }
      ids.add(id)
    }
    return raw as WeekShiftDraft[]
  } catch {
    return null
  }
}

async function saveWeek(deps: SaveWeekDeps, formData: FormData): Promise<SaveWeekResult> {
  if (!deps.claims) return { fieldErrors: {}, formError: SIGN_IN_ERROR }
  if (!deps.profile) return { fieldErrors: {}, formError: PROFILE_ERROR }

  const idempotencyKey = readString(formData, "idempotencyKey").trim()
  const rows = readRows(formData)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey) || rows === null) {
    return { fieldErrors: {}, formError: REVIEW_ERROR }
  }

  const calculations = calculateWeekRows(rows, deps.profile, deps.profile.rules, deps.calculate)
  const fieldErrors: Record<string, ShiftFieldErrors> = {}
  for (const calculation of calculations) {
    if (calculation.status === "needs-review" && calculation.fieldErrors) {
      fieldErrors[calculation.id] = calculation.fieldErrors
    }
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors }

  const snapshots: ShiftSnapshot[] = []
  for (const row of rows) {
    if (!row.included) continue
    const calculation = calculations.find((item) => item.id === row.id)
    if (!calculation?.result) return { fieldErrors: {}, formError: REVIEW_ERROR }
    const parsedRow = row
    const parsed = parseShiftEntry(parsedRow)
    if (!parsed.success) return { fieldErrors: { [row.id]: parsed.fieldErrors } }
    const input = buildShiftInput(parsed.data, deps.profile)
    snapshots.push(toShiftSnapshot(input, calculation.result))
  }

  if (snapshots.length === 0) return { fieldErrors: {}, formError: REVIEW_ERROR }

  try {
    const persisted = await deps.persist(idempotencyKey, snapshots, rows)
    if ("error" in persisted) return { fieldErrors: {}, formError: SAVE_ERROR }
    return { fieldErrors: {}, savedIds: persisted.ids }
  } catch {
    return { fieldErrors: {}, formError: SAVE_ERROR }
  }
}

export { saveWeek }
export type { SaveWeekProfile, SaveWeekResult }
