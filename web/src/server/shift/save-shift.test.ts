import { describe, expect, it, vi } from "vitest"

import { calculateNd } from "../../engine/calculate-nd"
import { toShiftSnapshot } from "../../engine/snapshot"
import type { WageTypeRule } from "../../engine/types"
import { buildShiftInput, parseShiftEntry } from "./parse-shift-entry"
import { saveShift } from "./save-shift"

const ordinaryFirstEight: WageTypeRule = {
  id: "wt-2211",
  code: "2211",
  category: "REGULAR_WORK_DAY",
  hoursCategory: "FIRST_8",
  percentage: "10",
  isNd: true,
  description: "Ordinary day, night shift, first 8 hours",
}

const profile = {
  monthlyBasicSalary: "34800.00",
  timeZone: "Asia/Manila",
  ndStart: "22:00",
  ndEnd: "06:00",
  breakHours: "1.00",
  rules: [ordinaryFirstEight],
}

function lockedFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData()
  const fields = {
    workDate: "2026-10-01",
    shiftStart: "21:00",
    shiftEnd: "06:00",
    dayClassification: "REGULAR_WORK_DAY",
    breakIncludedInNd: "false",
    scheduleType: "STANDARD",
    scheduledRegularHours: "8.00",
    overtimeApproved: "false",
    ...overrides,
  }

  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value)
  }

  return formData
}

describe("saveShift", () => {
  it("returns a sign-in error and does not calculate or persist when claims are null", async () => {
    const calculate = vi.fn(calculateNd)
    const persist = vi.fn()

    const result = await saveShift(
      { claims: null, profile, calculate, persist },
      lockedFormData(),
    )

    expect(result).toEqual({
      fieldErrors: {},
      formError: "Sign in to save an entry.",
    })
    expect(calculate).not.toHaveBeenCalled()
    expect(persist).not.toHaveBeenCalled()
  })

  it("returns field errors and does not persist an invalid form", async () => {
    const persist = vi.fn()

    const result = await saveShift(
      { claims: { sub: "user-1" }, profile, calculate: calculateNd, persist },
      lockedFormData({ workDate: "not-a-date" }),
    )

    expect(result.formError).toBeUndefined()
    expect(result.fieldErrors.workDate).toBeTruthy()
    expect(persist).not.toHaveBeenCalled()
  })

  it("does not persist when profile is missing", async () => {
    const persist = vi.fn()

    const result = await saveShift(
      {
        claims: { sub: "user-1" },
        profile: null,
        calculate: calculateNd,
        persist,
      },
      lockedFormData(),
    )

    expect(result).toEqual({
      fieldErrors: {},
      formError: "Could not load your calculation settings. Try again.",
    })
    expect(persist).not.toHaveBeenCalled()
  })

  it("ignores a form field named monthlyBasicSalary and uses the profile salary", async () => {
    let persisted: ReturnType<typeof toShiftSnapshot> | undefined
    const persist = vi.fn(async (snapshot: ReturnType<typeof toShiftSnapshot>) => {
      persisted = snapshot
      return { id: "rec-1" }
    })

    const result = await saveShift(
      { claims: { sub: "user-1" }, profile, calculate: calculateNd, persist },
      lockedFormData({ monthlyBasicSalary: "1.00" }),
    )

    expect(result).toEqual({ fieldErrors: {}, savedId: "rec-1" })
    expect(persist).toHaveBeenCalledOnce()
    expect(persisted?.monthlyBasicSalary).toBe("34800.00")
  })

  it("rejects STANDARD scheduledRegularHours of 9", async () => {
    const persist = vi.fn()

    const result = await saveShift(
      { claims: { sub: "user-1" }, profile, calculate: calculateNd, persist },
      lockedFormData({ scheduledRegularHours: "9" }),
    )

    expect(result.fieldErrors.scheduledRegularHours).toBeTruthy()
    expect(persist).not.toHaveBeenCalled()
  })

  it("accepts APPROVED_CWW scheduledRegularHours of 10.00", async () => {
    const persist = vi.fn(async () => ({ id: "rec-cww" }))

    const result = await saveShift(
      { claims: { sub: "user-1" }, profile, calculate: calculateNd, persist },
      lockedFormData({
        scheduleType: "APPROVED_CWW",
        scheduledRegularHours: "10.00",
      }),
    )

    expect(result).toEqual({ fieldErrors: {}, savedId: "rec-cww" })
    expect(persist).toHaveBeenCalledOnce()
  })

  it("rejects APPROVED_CWW scheduledRegularHours of 7 and 13", async () => {
    const persist = vi.fn()

    const tooLow = await saveShift(
      { claims: { sub: "user-1" }, profile, calculate: calculateNd, persist },
      lockedFormData({
        scheduleType: "APPROVED_CWW",
        scheduledRegularHours: "7",
      }),
    )
    const tooHigh = await saveShift(
      { claims: { sub: "user-1" }, profile, calculate: calculateNd, persist },
      lockedFormData({
        scheduleType: "APPROVED_CWW",
        scheduledRegularHours: "13",
      }),
    )

    expect(tooLow.fieldErrors.scheduledRegularHours).toBeTruthy()
    expect(tooHigh.fieldErrors.scheduledRegularHours).toBeTruthy()
    expect(persist).not.toHaveBeenCalled()
  })

  it("persists the server calculateNd result rather than a client centavos field", async () => {
    let persisted: ReturnType<typeof toShiftSnapshot> | undefined
    const persist = vi.fn(async (snapshot: ReturnType<typeof toShiftSnapshot>) => {
      persisted = snapshot
      return { id: "rec-1" }
    })

    await saveShift(
      { claims: { sub: "user-1" }, profile, calculate: calculateNd, persist },
      lockedFormData({ calculatedAmountCentavos: "1", centavos: "99999" }),
    )

    expect(persisted?.lines[0]?.calculatedAmountCentavos).toBe(14000)
    expect(persisted?.lines[0]?.wageTypeCode).toBe("2211")
    expect(persisted?.lines[0]).toMatchObject({
      calculatedAmountCentavos: 14000,
      wageTypeCode: "2211",
    })
  })

  it("persists the locked 9 PM–6 AM case with 14000 centavos and code 2211", async () => {
    const persist = vi.fn(async () => ({ id: "rec-locked" }))
    const formData = lockedFormData()

    const result = await saveShift(
      { claims: { sub: "user-1" }, profile, calculate: calculateNd, persist },
      formData,
    )

    const parsed = parseShiftEntry(formData)
    expect(parsed.success).toBe(true)
    if (!parsed.success) {
      return
    }

    const input = buildShiftInput(parsed.data, profile)
    const expected = toShiftSnapshot(input, calculateNd(input, profile.rules))

    expect(result).toEqual({ fieldErrors: {}, savedId: "rec-locked" })
    expect(persist).toHaveBeenCalledWith(expected)
    expect(expected.lines[0]).toMatchObject({
      calculatedAmountCentavos: 14000,
      wageTypeCode: "2211",
    })
    expect(expected.lines[0]?.calculatedAmountCentavos).toBe(14000)
  })

  it("returns a generic save error when persist fails", async () => {
    const persist = vi.fn(async () => ({ error: true as const }))

    const result = await saveShift(
      { claims: { sub: "user-1" }, profile, calculate: calculateNd, persist },
      lockedFormData(),
    )

    expect(result).toEqual({
      fieldErrors: {},
      formError: "Could not save this entry. Try again.",
    })
    expect(result.formError).not.toMatch(/postgrest|postgres|permission|rpc/i)
  })
})
