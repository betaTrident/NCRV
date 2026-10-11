import { describe, expect, it } from "vitest"

import { calculateNd } from "./calculate-nd"
import type { ShiftInput, WageTypeRule } from "./types"

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

describe("calculateNd", () => {
  it("special public holiday first-eight returns both seeded codes, both TBD, with known ND hours and no centavos", () => {
    const rules: WageTypeRule[] = [
      {
        id: "wt-2411",
        code: "2411",
        category: "SPECIAL_PUBLIC_HOLIDAY",
        hoursCategory: "FIRST_8",
        percentage: "143",
        isNd: true,
        description: "Special public holiday, first 8 hours",
      },
      {
        id: "wt-2418",
        code: "2418",
        category: "SPECIAL_PUBLIC_HOLIDAY",
        hoursCategory: "FIRST_8",
        percentage: "43",
        isNd: true,
        description: "Special public holiday, first 8 hours",
      },
    ]

    const result = calculateNd(
      { ...baseInput, dayClassification: "SPECIAL_PUBLIC_HOLIDAY" },
      rules,
    )

    expect(result.lines).toEqual([
      {
        status: "tbd",
        wageTypeId: "wt-2411",
        code: "2411",
        category: "SPECIAL_PUBLIC_HOLIDAY",
        hoursCategory: "FIRST_8",
        description: "Special public holiday, first 8 hours",
        hours: "7.00",
        percentage: "143",
        reason: "Money formula is not confirmed for this wage type.",
      },
      {
        status: "tbd",
        wageTypeId: "wt-2418",
        code: "2418",
        category: "SPECIAL_PUBLIC_HOLIDAY",
        hoursCategory: "FIRST_8",
        description: "Special public holiday, first 8 hours",
        hours: "7.00",
        percentage: "43",
        reason: "Money formula is not confirmed for this wage type.",
      },
    ])
    expect(result.ndHours).toBe("7.00")
    expect(result.potentialNdHours).toBe("8.00")
  })
})
