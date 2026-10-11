import { describe, expect, it } from "vitest"

import { calculateNd } from "./calculate-nd"
import { toShiftSnapshot } from "./snapshot"
import type { NdResult, ShiftInput, WageTypeRule } from "./types"

const ordinaryFirstEight: WageTypeRule = {
  id: "wt-2211",
  code: "2211",
  category: "REGULAR_WORK_DAY",
  hoursCategory: "FIRST_8",
  percentage: "10",
  isNd: true,
  description: "Ordinary day, night shift, first 8 hours",
}

const lockedInput: ShiftInput = {
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

function publicResult(overrides: Partial<NdResult> = {}): NdResult {
  return {
    rateBasis: null,
    elapsedHours: "9.00",
    workedHours: "8.00",
    scheduledRegularHours: "8.00",
    regularHours: "8.00",
    potentialOvertimeHours: "0.00",
    approvedOvertimeHours: "0.00",
    unapprovedExtraHours: "0.00",
    potentialNdHours: "8.00",
    breakHours: "1.00",
    breakIncludedInNd: false,
    ndHours: "7.00",
    dayClassification: "REGULAR_WORK_DAY",
    hoursCategories: ["FIRST_8"],
    lines: [],
    unresolved: [],
    normalizedShiftStart: "2026-10-01T21:00:00.000+08:00",
    normalizedShiftEnd: "2026-10-02T06:00:00.000+08:00",
    ...overrides,
  }
}

describe("toShiftSnapshot", () => {
  it("reshapes the locked 9 PM–6 AM estimate without recomputing money", () => {
    const result = calculateNd(lockedInput, [ordinaryFirstEight])
    const snapshot = toShiftSnapshot(lockedInput, result)

    expect(result.ndHours).toBe("7.00")
    expect(result.lines[0]).toMatchObject({
      status: "estimated",
      code: "2211",
      centavos: 14000,
      formula: "ordinary_nd_10_percent",
    })
    expect(snapshot).toEqual({
      workDate: "2026-10-01",
      shiftStart: "2026-10-01T21:00:00.000+08:00",
      shiftEnd: "2026-10-02T06:00:00.000+08:00",
      dayClassification: "REGULAR_WORK_DAY",
      breakIncludedInNd: false,
      workScheduleType: "STANDARD",
      scheduledRegularHours: "8.00",
      overtimeApproved: false,
      potentialNdHours: "8.00",
      breakHours: "1.00",
      ndHours: "7.00",
      ndStart: "22:00",
      ndEnd: "06:00",
      timeZone: "Asia/Manila",
      calculationVersion: 2,
      monthlyBasicSalary: "34800.00",
      annualMonths: "12",
      workdaysFactor: "261",
      rateHoursPerDay: "8",
      derivedDailyRate: "1600.00000000",
      derivedHourlyRate: "200.00000000",
      elapsedHours: "9.00",
      workedHours: "8.00",
      regularHours: "8.00",
      potentialOvertimeHours: "0.00",
      approvedOvertimeHours: "0.00",
      unapprovedExtraHours: "0.00",
      lines: [
        {
          wageTypeId: "wt-2211",
          wageTypeCode: "2211",
          category: "REGULAR_WORK_DAY",
          hoursCategory: "FIRST_8",
          applicableHours: "7.00",
          percentage: "10",
          amountStatus: "estimated",
          calculatedAmountCentavos: 14000,
          unresolvedReason: null,
        },
      ],
    })
    expect(snapshot.shiftStart).toBe(result.normalizedShiftStart)
    expect(snapshot.shiftEnd).toBe(result.normalizedShiftEnd)
  })

  it("copies public hours and money without recomputing them", () => {
    const snapshot = toShiftSnapshot(
      { ...lockedInput, scheduleType: "APPROVED_CWW", overtimeApproved: true },
      publicResult({
        ndHours: "99.00",
        elapsedHours: "1.00",
        scheduledRegularHours: "10.00",
        lines: [
          {
            status: "estimated",
            wageTypeId: "wt-2211",
            code: "2211",
            category: "REGULAR_WORK_DAY",
            hoursCategory: "FIRST_8",
            description: "Ordinary day, night shift, first 8 hours",
            hours: "3.00",
            percentage: "10",
            centavos: 1,
            formula: "ordinary_nd_10_percent",
          },
        ],
      }),
    )

    expect(snapshot.ndHours).toBe("99.00")
    expect(snapshot.elapsedHours).toBe("1.00")
    expect(snapshot.scheduledRegularHours).toBe("10.00")
    expect(snapshot.workScheduleType).toBe("APPROVED_CWW")
    expect(snapshot.overtimeApproved).toBe(true)
    expect(snapshot.lines[0]).toEqual({
      wageTypeId: "wt-2211",
      wageTypeCode: "2211",
      category: "REGULAR_WORK_DAY",
      hoursCategory: "FIRST_8",
      applicableHours: "3.00",
      percentage: "10",
      amountStatus: "estimated",
      calculatedAmountCentavos: 1,
      unresolvedReason: null,
    })
  })

  it("maps a TBD line to null centavos and the unresolved reason", () => {
    const snapshot = toShiftSnapshot(
      lockedInput,
      publicResult({
        lines: [
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
        ],
      }),
    )

    expect(snapshot.lines).toEqual([
      {
        wageTypeId: "wt-2411",
        wageTypeCode: "2411",
        category: "SPECIAL_PUBLIC_HOLIDAY",
        hoursCategory: "FIRST_8",
        applicableHours: "7.00",
        percentage: "143",
        amountStatus: "tbd",
        calculatedAmountCentavos: null,
        unresolvedReason: "Money formula is not confirmed for this wage type.",
      },
    ])
  })

  it("keeps applicableHours null when a TBD line has no allocated hours", () => {
    const snapshot = toShiftSnapshot(
      lockedInput,
      publicResult({
        lines: [
          {
            status: "tbd",
            wageTypeId: "wt-2252",
            code: "2252",
            category: "REGULAR_WORK_DAY",
            hoursCategory: "EXCESS",
            description: "Ordinary day, night shift, excess of the first 8 hours",
            hours: null,
            percentage: "138",
            reason:
              "ND allocation between regular and overtime hours is not confirmed without a break timestamp.",
          },
        ],
      }),
    )

    expect(snapshot.lines[0]?.applicableHours).toBeNull()
    expect(snapshot.lines[0]?.calculatedAmountCentavos).toBeNull()
    expect(snapshot.lines[0]?.unresolvedReason).toBe(
      "ND allocation between regular and overtime hours is not confirmed without a break timestamp.",
    )
  })

  it("nulls all six rate fields when rateBasis is absent", () => {
    const snapshot = toShiftSnapshot(lockedInput, publicResult())

    expect(snapshot.monthlyBasicSalary).toBeNull()
    expect(snapshot.annualMonths).toBeNull()
    expect(snapshot.workdaysFactor).toBeNull()
    expect(snapshot.rateHoursPerDay).toBeNull()
    expect(snapshot.derivedDailyRate).toBeNull()
    expect(snapshot.derivedHourlyRate).toBeNull()
    expect(snapshot.lines).toEqual([])
  })
})
