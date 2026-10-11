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

describe("calculateNd", () => {
  it("keeps an 11-hour approved CWW example inside the 10-hour regular threshold", () => {
    const result = calculateNd(
      {
        ...baseInput,
        shiftStart: "2026-10-01T21:00:00",
        shiftEnd: "2026-10-02T08:00:00",
        scheduleType: "APPROVED_CWW",
        scheduledRegularHours: "10.00",
        breakHours: "1.00",
        breakIncludedInNd: false,
        overtimeApproved: false,
        dayClassification: "REGULAR_WORK_DAY",
      },
      [ordinaryFirstEight],
    )

    expect(result.elapsedHours).toBe("11.00")
    expect(result.workedHours).toBe("10.00")
    expect(result.regularHours).toBe("10.00")
    expect(result.potentialOvertimeHours).toBe("0.00")
    expect(result.approvedOvertimeHours).toBe("0.00")
    expect(result.unapprovedExtraHours).toBe("0.00")
    expect(result.lines.some((line) => line.code === "2252")).toBe(false)
    expect(result.lines).toEqual([
      {
        status: "tbd",
        wageTypeId: "wt-2211",
        code: "2211",
        category: "REGULAR_WORK_DAY",
        hoursCategory: "FIRST_8",
        description: "Ordinary day, night shift, first 8 hours",
        hours: null,
        percentage: "10",
        reason:
          "The ADP wage type for approved CWW regular hours beyond eight is not confirmed.",
      },
    ])
    expect(result.unresolved).toContain(
      "The ADP wage type for approved CWW regular hours beyond eight is not confirmed.",
    )
  })
})
