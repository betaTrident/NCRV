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

const ordinaryExcess: WageTypeRule = {
  id: "wt-2252",
  code: "2252",
  category: "REGULAR_WORK_DAY",
  hoursCategory: "EXCESS",
  percentage: "138",
  isNd: true,
  description: "Ordinary day, night shift, excess of the first 8 hours",
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
  it("derives the factor-261 rate and treats a 9-hour shift as 8 regular worked hours", () => {
    const result = calculateNd(baseInput, [ordinaryFirstEight])

    expect(result.rateBasis).toEqual({
      monthlyBasicSalary: "34800.00",
      annualMonths: "12",
      workdaysFactor: "261",
      rateHoursPerDay: "8",
      dailyRate: "1600.00000000",
      hourlyRate: "200.00000000",
    })
    expect(result.elapsedHours).toBe("9.00")
    expect(result.workedHours).toBe("8.00")
    expect(result.regularHours).toBe("8.00")
    expect(result.potentialOvertimeHours).toBe("0.00")
    expect(result.approvedOvertimeHours).toBe("0.00")
    expect(result.unapprovedExtraHours).toBe("0.00")
    expect(result.potentialNdHours).toBe("8.00")
    expect(result.ndHours).toBe("7.00")
    expect(result.lines).toEqual([
      {
        status: "estimated",
        code: "2211",
        hours: "7.00",
        percentage: "10",
        centavos: 14000,
        formula: "ordinary_nd_10_percent",
      },
    ])
  })

  it("can include the break in ND without adding it to worked hours", () => {
    const result = calculateNd(
      { ...baseInput, breakIncludedInNd: true },
      [ordinaryFirstEight],
    )

    expect(result.workedHours).toBe("8.00")
    expect(result.ndHours).toBe("8.00")
    expect(result.lines[0]).toMatchObject({
      status: "estimated",
      centavos: 16000,
    })
  })

  it("counts an early-morning shift in the previous night's ND window", () => {
    const result = calculateNd(
      {
        ...baseInput,
        shiftStart: "2026-10-01T02:00:00",
        shiftEnd: "2026-10-01T06:00:00",
        breakIncludedInNd: true,
      },
      [ordinaryFirstEight],
    )

    expect(result.potentialNdHours).toBe("4.00")
    expect(result.ndHours).toBe("4.00")
  })

  it("records unapproved extra time without turning it into approved overtime", () => {
    const result = calculateNd(
      { ...baseInput, shiftEnd: "2026-10-02T07:00:00" },
      [ordinaryFirstEight, ordinaryExcess],
    )

    expect(result.elapsedHours).toBe("10.00")
    expect(result.workedHours).toBe("9.00")
    expect(result.regularHours).toBe("8.00")
    expect(result.potentialOvertimeHours).toBe("1.00")
    expect(result.approvedOvertimeHours).toBe("0.00")
    expect(result.unapprovedExtraHours).toBe("1.00")
    expect(result.lines.some((line) => line.code === "2252")).toBe(false)
    expect(result.unresolved).toContain(
      "Extra worked time was not recorded as agreed or approved overtime.",
    )
  })

  it("counts excess worked time as overtime only when recorded as approved", () => {
    const result = calculateNd(
      {
        ...baseInput,
        shiftEnd: "2026-10-02T07:00:00",
        overtimeApproved: true,
      },
      [ordinaryFirstEight, ordinaryExcess],
    )

    expect(result.potentialOvertimeHours).toBe("1.00")
    expect(result.approvedOvertimeHours).toBe("1.00")
    expect(result.unapprovedExtraHours).toBe("0.00")
    expect(result.lines).toContainEqual({
      status: "tbd",
      code: "2252",
      hours: null,
      percentage: "138",
      reason:
        "ND allocation between regular and overtime hours is not confirmed without a break timestamp.",
    })
  })

  it("uses an approved CWW schedule threshold instead of eight hours", () => {
    const result = calculateNd(
      {
        ...baseInput,
        shiftStart: "2026-10-01T20:00:00",
        shiftEnd: "2026-10-02T06:00:00",
        scheduleType: "APPROVED_CWW",
        scheduledRegularHours: "9.00",
      },
      [ordinaryFirstEight],
    )

    expect(result.workedHours).toBe("9.00")
    expect(result.regularHours).toBe("9.00")
    expect(result.potentialOvertimeHours).toBe("0.00")
    expect(result.approvedOvertimeHours).toBe("0.00")
    expect(result.lines[0]).toMatchObject({ status: "tbd", code: "2211" })
    expect(result.unresolved).toContain(
      "The ADP wage type for approved CWW regular hours beyond eight is not confirmed.",
    )
  })

  it("accepts CWW boundaries and rejects thresholds outside 8 to 12 hours", () => {
    expect(() =>
      calculateNd(
        {
          ...baseInput,
          scheduleType: "APPROVED_CWW",
          scheduledRegularHours: "12.00",
        },
        [ordinaryFirstEight],
      ),
    ).not.toThrow()

    expect(() =>
      calculateNd(
        {
          ...baseInput,
          scheduleType: "APPROVED_CWW",
          scheduledRegularHours: "7.99",
        },
        [ordinaryFirstEight],
      ),
    ).toThrow("An approved CWW threshold must be between 8 and 12 hours.")

    expect(() =>
      calculateNd(
        {
          ...baseInput,
          scheduleType: "APPROVED_CWW",
          scheduledRegularHours: "12.01",
        },
        [ordinaryFirstEight],
      ),
    ).toThrow("An approved CWW threshold must be between 8 and 12 hours.")
  })

  it("does not create overtime when approval is recorded but there are no excess hours", () => {
    const result = calculateNd(
      { ...baseInput, overtimeApproved: true },
      [ordinaryFirstEight],
    )

    expect(result.potentialOvertimeHours).toBe("0.00")
    expect(result.approvedOvertimeHours).toBe("0.00")
  })

  it("floors worked and ND hours at zero", () => {
    const result = calculateNd(
      {
        ...baseInput,
        shiftStart: "2026-10-01T22:00:00",
        shiftEnd: "2026-10-01T22:30:00",
      },
      [ordinaryFirstEight],
    )

    expect(result.workedHours).toBe("0.00")
    expect(result.ndHours).toBe("0.00")
  })

  it("keeps a Saturday classification employee-selected", () => {
    const result = calculateNd(
      {
        ...baseInput,
        workDate: "2026-10-03",
        shiftStart: "2026-10-03T21:00:00",
        shiftEnd: "2026-10-04T06:00:00",
      },
      [ordinaryFirstEight],
    )

    expect(result.dayClassification).toBe("REGULAR_WORK_DAY")
    expect(result.lines[0]).toMatchObject({ status: "estimated", code: "2211" })
  })

  it("returns every matching rule while leaving unconfirmed formulas TBD", () => {
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

    expect(result.lines).toHaveLength(2)
    expect(result.lines.every((line) => line.status === "tbd")).toBe(true)
  })

  it("reports unresolved ND when no configured wage rule matches", () => {
    const result = calculateNd(baseInput, [])

    expect(result.ndHours).toBe("7.00")
    expect(result.lines).toEqual([])
    expect(result.unresolved).toContain(
      "No configured ND wage type rule matches this shift.",
    )
  })

  it("uses the exact repeating factor-261 rate without a rounding warning", () => {
    const result = calculateNd(
      { ...baseInput, monthlyBasicSalary: "35000.00" },
      [ordinaryFirstEight],
    )

    expect(result.rateBasis?.hourlyRate).toBe("201.14942529")
    expect(result.lines[0]).toMatchObject({
      status: "estimated",
      centavos: 14080,
    })
    expect(result.unresolved).not.toContain(
      "Hourly-rate rounding is not confirmed; this estimate keeps the factor-261 rate unrounded until the final centavo amount.",
    )
  })
})
