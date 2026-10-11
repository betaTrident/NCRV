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

const restDayFirstEight: WageTypeRule = {
  id: "wt-2411-rest",
  code: "2411",
  category: "REST_DAY",
  hoursCategory: "FIRST_8",
  percentage: "143",
  isNd: true,
  description: "Rest day, first 8 hours",
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
  it("preserves an explicit Saturday rest-day classification", () => {
    const result = calculateNd(
      {
        ...baseInput,
        workDate: "2026-10-03",
        shiftStart: "2026-10-03T21:00:00",
        shiftEnd: "2026-10-04T06:00:00",
        dayClassification: "REST_DAY",
        breakIncludedInNd: false,
      },
      [restDayFirstEight],
    )

    expect(result.dayClassification).toBe("REST_DAY")
    expect(result.lines).toEqual([
      {
        status: "tbd",
        wageTypeId: "wt-2411-rest",
        code: "2411",
        category: "REST_DAY",
        hoursCategory: "FIRST_8",
        description: "Rest day, first 8 hours",
        hours: "7.00",
        percentage: "143",
        reason: "Money formula is not confirmed for this wage type.",
      },
    ])
  })

  it("accepts a standard 8-hour threshold and rejects other values", () => {
    expect(() => calculateNd(baseInput, [ordinaryFirstEight])).not.toThrow()

    expect(() =>
      calculateNd(
        { ...baseInput, scheduledRegularHours: "7.99" },
        [ordinaryFirstEight],
      ),
    ).toThrow("A standard schedule must use an 8-hour regular-duty threshold.")

    expect(() =>
      calculateNd(
        { ...baseInput, scheduledRegularHours: "8.01" },
        [ordinaryFirstEight],
      ),
    ).toThrow("A standard schedule must use an 8-hour regular-duty threshold.")
  })
})
