import { calculateNd } from "../../engine/calculate-nd"
import { toShiftSnapshot } from "../../engine/snapshot"
import type { WageTypeRule } from "../../engine/types"
import {
  buildShiftInput,
  parseShiftEntry,
  type ShiftFieldErrors,
  type ShiftProfile,
} from "./parse-shift-entry"

type SaveShiftProfile = ShiftProfile & { rules: WageTypeRule[] }

type SaveShiftDeps = {
  claims: { sub: string } | null
  profile: SaveShiftProfile | null
  calculate: typeof calculateNd
  persist: (
    snapshot: ReturnType<typeof toShiftSnapshot>,
  ) => Promise<{ id: string } | { error: true }>
}

type SaveShiftResult = {
  fieldErrors: ShiftFieldErrors
  formError?: string
  savedId?: string
}

const SIGN_IN_ERROR = "Sign in to save an entry."
const PROFILE_ERROR = "Could not load your calculation settings. Try again."
const SAVE_ERROR = "Could not save this entry. Try again."

async function saveShift(deps: SaveShiftDeps, formData: FormData): Promise<SaveShiftResult> {
  if (!deps.claims) {
    return { fieldErrors: {}, formError: SIGN_IN_ERROR }
  }

  const parsed = parseShiftEntry(formData)
  if (!parsed.success) {
    return { fieldErrors: parsed.fieldErrors }
  }

  if (!deps.profile) {
    return { fieldErrors: {}, formError: PROFILE_ERROR }
  }

  try {
    const input = buildShiftInput(parsed.data, deps.profile)
    const result = deps.calculate(input, deps.profile.rules)
    const persisted = await deps.persist(toShiftSnapshot(input, result))

    if ("error" in persisted) {
      return { fieldErrors: {}, formError: SAVE_ERROR }
    }

    return { fieldErrors: {}, savedId: persisted.id }
  } catch {
    return { fieldErrors: {}, formError: SAVE_ERROR }
  }
}

export { saveShift }
export type { SaveShiftDeps, SaveShiftProfile, SaveShiftResult }
