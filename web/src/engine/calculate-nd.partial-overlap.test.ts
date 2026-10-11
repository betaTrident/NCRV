import { describe, expect, it } from "vitest"

import { calculateNd } from "./calculate-nd"
import type { ShiftInput, WageTypeRule } from "./types"

const ordinaryFirstEight: WageTypeRule = {
  id: "wt-2211",
  code: "2211",
  category: "REGULAR_WORK_DAY",
  hoursCategory: "FIRST_8",
  percentage: "10",
  isNd: true,
  description: "Ordinary day, night shift, first 8 hours",
}

const baseInput: ShiftInput = {
  workDate: "2026-10-01",
  shiftStart: "2026-10-01T21:00:00",
  shiftEnd: "2026-10-02T06:00:00",
  dayClassification: "REGULAR_WORK_DAY",
  monthlyBasicSalary: "34800.00",
  timeZone: "Asia/Manila",
  ndStart: "22:00",
  ndEnd: "06:00",
  breakHours: "1.00",
  breakIncludedInNd: false,
  scheduleType: "STANDARD",
  scheduledRegularHours: "8.00",
  overtimeApproved: false,
}

describe("calculateNd partial overlap", () => {
  it("counts 11 PM–7 AM as 7 potential ND hours and 6 ND hours when the break is excluded", () => {
    const result = calculateNd(
      {
        ...baseInput,
        shiftStart: "2026-10-01T23:00:00",
        shiftEnd: "2026-10-02T07:00:00",
        breakIncludedInNd: false,
      },
      [ordinaryFirstEight],
    )

    expect(result.potentialNdHours).toBe("7.00")
    expect(result.ndHours).toBe("6.00")
    expect(result.workedHours).toBe("7.00")
    expect(result.lines).toEqual([
      {
        status: "estimated",
        wageTypeId: "wt-2211",
        code: "2211",
        category: "REGULAR_WORK_DAY",
        hoursCategory: "FIRST_8",
        description: "Ordinary day, night shift, first 8 hours",
        hours: "6.00",
        percentage: "10",
        centavos: 12000,
        formula: "ordinary_nd_10_percent",
      },
    ])
  })

  it("includes the break in ND for 11 PM–7 AM without adding it back to worked hours", () => {
    const result = calculateNd(
      {
        ...baseInput,
        shiftStart: "2026-10-01T23:00:00",
        shiftEnd: "2026-10-02T07:00:00",
        breakIncludedInNd: true,
      },
      [ordinaryFirstEight],
    )

    expect(result.potentialNdHours).toBe("7.00")
    expect(result.ndHours).toBe("7.00")
    expect(result.workedHours).toBe("7.00")
    expect(result.lines).toEqual([
      {
        status: "estimated",
        wageTypeId: "wt-2211",
        code: "2211",
        category: "REGULAR_WORK_DAY",
        hoursCategory: "FIRST_8",
        description: "Ordinary day, night shift, first 8 hours",
        hours: "7.00",
        percentage: "10",
        centavos: 14000,
        formula: "ordinary_nd_10_percent",
      },
    ])
  })

  it("returns zero ND and no wage line for a daytime shift that never enters the window", () => {
    const result = calculateNd(
      {
        ...baseInput,
        shiftStart: "2026-10-01T13:00:00",
        shiftEnd: "2026-10-01T22:00:00",
        breakIncludedInNd: false,
      },
      [ordinaryFirstEight],
    )

    expect(result.elapsedHours).toBe("9.00")
    expect(result.workedHours).toBe("8.00")
    expect(result.potentialNdHours).toBe("0.00")
    expect(result.ndHours).toBe("0.00")
    expect(result.lines).toEqual([])
    expect(result.unresolved).not.toContain(
      "No configured ND wage type rule matches this shift.",
    )
  })
})
