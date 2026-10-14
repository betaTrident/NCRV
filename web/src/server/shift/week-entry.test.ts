import { describe, expect, it } from "vitest"

import { calculateNd } from "../../engine/calculate-nd"
import type { WageTypeRule } from "../../engine/types"

import { calculateWeekRows, type WeekShiftDraft } from "./week-entry"

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
}

function row(overrides: Partial<WeekShiftDraft> = {}): WeekShiftDraft {
  return {
    id: "row-1",
    workDate: "2026-10-01",
    shiftStart: "21:00",
    shiftEnd: "06:00",
    dayClassification: "REGULAR_WORK_DAY",
    breakIncludedInNd: "false",
    scheduleType: "STANDARD",
    scheduledRegularHours: "8.00",
    overtimeApproved: "false",
    included: true,
    ...overrides,
  }
}

describe("calculateWeekRows", () => {
  it("uses the same engine result as Day entry for an included row", () => {
    const result = calculateWeekRows([row()], profile, [ordinaryFirstEight], calculateNd)

    expect(result).toHaveLength(1)
    expect(result[0]?.status).toBe("ready")
    expect(result[0]?.result?.ndHours).toBe("7.00")
    expect(result[0]?.result?.lines[0]?.code).toBe("2211")
  })

  it("keeps excluded rows in the draft without calculating them", () => {
    const result = calculateWeekRows(
      [row({ included: false }), row({ id: "row-2", workDate: "2026-10-02" })],
      profile,
      [ordinaryFirstEight],
      calculateNd,
    )

    expect(result[0]).toMatchObject({ id: "row-1", status: "not-included" })
    expect(result[0]?.result).toBeUndefined()
    expect(result[1]).toMatchObject({ id: "row-2", status: "ready" })
  })

  it("keeps invalid rows linked to field errors while valid rows remain ready", () => {
    const result = calculateWeekRows(
      [row({ shiftStart: "bad" }), row({ id: "row-2" })],
      profile,
      [ordinaryFirstEight],
      calculateNd,
    )

    expect(result[0]).toMatchObject({ id: "row-1", status: "needs-review" })
    expect(result[0]?.fieldErrors?.shiftStart).toBeTruthy()
    expect(result[1]).toMatchObject({ id: "row-2", status: "ready" })
  })
})
