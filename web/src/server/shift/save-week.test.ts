import { describe, expect, it, vi } from "vitest"

import { calculateNd } from "../../engine/calculate-nd"
import type { WageTypeRule } from "../../engine/types"

import { saveWeek, type SaveWeekDeps } from "./save-week"

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

function rows() {
  return [
    {
      id: "draft-1",
      workDate: "2026-10-01",
      shiftStart: "21:00",
      shiftEnd: "06:00",
      dayClassification: "REGULAR_WORK_DAY",
      breakIncludedInNd: "false",
      scheduleType: "STANDARD",
      scheduledRegularHours: "8.00",
      overtimeApproved: "false",
      included: true,
    },
    {
      id: "draft-2",
      workDate: "2026-10-02",
      shiftStart: "21:00",
      shiftEnd: "06:00",
      dayClassification: "REGULAR_WORK_DAY",
      breakIncludedInNd: "false",
      scheduleType: "STANDARD",
      scheduledRegularHours: "8.00",
      overtimeApproved: "false",
      included: true,
    },
  ]
}

function formData(overrides: Record<string, string> = {}) {
  const form = new FormData()
  form.set("idempotencyKey", "11111111-1111-4111-8111-111111111111")
  form.set("rows", JSON.stringify(rows()))
  for (const [key, value] of Object.entries(overrides)) form.set(key, value)
  return form
}

describe("saveWeek", () => {
  it("recalculates every included row and persists one reviewed batch", async () => {
    const persist = vi.fn<SaveWeekDeps["persist"]>(async () => ({ ids: ["record-1", "record-2"] }))
    const result = await saveWeek({ claims: { sub: "user-1" }, profile, calculate: calculateNd, persist }, formData())

    expect(result).toEqual({ fieldErrors: {}, savedIds: ["record-1", "record-2"] })
    expect(persist).toHaveBeenCalledOnce()
    expect(persist.mock.calls[0]?.[0]).toBe("11111111-1111-4111-8111-111111111111")
    expect(persist.mock.calls[0]?.[1]).toHaveLength(2)
    const snapshots = persist.mock.calls[0]?.[1] as Array<{ lines: Array<{ calculatedAmountCentavos: number | null }> }>
    expect(snapshots[0]?.lines[0]?.calculatedAmountCentavos).toBe(14000)
  })

  it("does not persist any row when one included row is invalid", async () => {
    const persist = vi.fn()
    const invalid = rows()
    invalid[1]!.shiftStart = "bad"
    const result = await saveWeek(
      { claims: { sub: "user-1" }, profile, calculate: calculateNd, persist },
      formData({ rows: JSON.stringify(invalid) }),
    )

    expect(result.fieldErrors["draft-2"]?.shiftStart).toBeTruthy()
    expect(persist).not.toHaveBeenCalled()
  })

  it("requires claims and a nonempty idempotency key", async () => {
    const persist = vi.fn()
    const signedOut = await saveWeek({ claims: null, profile, calculate: calculateNd, persist }, formData())
    const noKey = await saveWeek(
      { claims: { sub: "user-1" }, profile, calculate: calculateNd, persist },
      formData({ idempotencyKey: "" }),
    )

    expect(signedOut.formError).toBe("Sign in to save this week.")
    expect(noKey.formError).toBe("Review this week before saving.")
    expect(persist).not.toHaveBeenCalled()
  })

  it("rejects malformed row arrays before calculation or persistence", async () => {
    const persist = vi.fn()
    const malformed = rows()
    ;(malformed[0] as unknown as { included: unknown }).included = "true"
    const result = await saveWeek(
      { claims: { sub: "user-1" }, profile, calculate: calculateNd, persist },
      formData({ rows: JSON.stringify(malformed) }),
    )

    expect(result.formError).toBe("Review this week before saving.")
    expect(persist).not.toHaveBeenCalled()
  })
})
