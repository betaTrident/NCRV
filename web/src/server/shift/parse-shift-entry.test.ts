import { describe, expect, it } from "vitest"

import { buildShiftInput, parseShiftEntry } from "./parse-shift-entry"

const validFields = {
  workDate: "2026-10-01",
  shiftStart: "21:00",
  shiftEnd: "06:00",
  dayClassification: "REGULAR_WORK_DAY",
  breakIncludedInNd: "false",
  scheduleType: "STANDARD",
  scheduledRegularHours: "8.00",
  overtimeApproved: "false",
}

const profile = {
  monthlyBasicSalary: "34800.00",
  timeZone: "Asia/Manila",
  ndStart: "22:00",
  ndEnd: "06:00",
  breakHours: "1.00",
}

describe("parseShiftEntry", () => {
  it("accepts the locked form fields and ignores extra keys", () => {
    const parsed = parseShiftEntry({
      ...validFields,
      monthlyBasicSalary: "1.00",
      timeZone: "UTC",
      ndStart: "00:00",
      ndEnd: "08:00",
      breakHours: "9.00",
      ownerId: "someone-else",
      centavos: "1",
    })

    expect(parsed.success).toBe(true)
    if (!parsed.success) {
      return
    }

    expect(parsed.data).toEqual({
      workDate: "2026-10-01",
      shiftStart: "21:00",
      shiftEnd: "06:00",
      dayClassification: "REGULAR_WORK_DAY",
      breakIncludedInNd: false,
      scheduleType: "STANDARD",
      scheduledRegularHours: "8.00",
      overtimeApproved: false,
    })
  })

  it("accepts STANDARD scheduledRegularHours of 8 and 8.00", () => {
    expect(
      parseShiftEntry({ ...validFields, scheduledRegularHours: "8" }).success,
    ).toBe(true)
    expect(
      parseShiftEntry({ ...validFields, scheduledRegularHours: "8.00" }).success,
    ).toBe(true)
  })

  it("rejects STANDARD scheduledRegularHours of 9", () => {
    const parsed = parseShiftEntry({
      ...validFields,
      scheduledRegularHours: "9",
    })

    expect(parsed.success).toBe(false)
    if (parsed.success) {
      return
    }
    expect(parsed.fieldErrors.scheduledRegularHours).toBeTruthy()
  })

  it("accepts APPROVED_CWW scheduledRegularHours of 10.00", () => {
    const parsed = parseShiftEntry({
      ...validFields,
      scheduleType: "APPROVED_CWW",
      scheduledRegularHours: "10.00",
    })

    expect(parsed.success).toBe(true)
  })

  it("rejects APPROVED_CWW scheduledRegularHours of 7 and 13", () => {
    const tooLow = parseShiftEntry({
      ...validFields,
      scheduleType: "APPROVED_CWW",
      scheduledRegularHours: "7",
    })
    const tooHigh = parseShiftEntry({
      ...validFields,
      scheduleType: "APPROVED_CWW",
      scheduledRegularHours: "13",
    })

    expect(tooLow.success).toBe(false)
    expect(tooHigh.success).toBe(false)
    if (!tooLow.success) {
      expect(tooLow.fieldErrors.scheduledRegularHours).toBeTruthy()
    }
    if (!tooHigh.success) {
      expect(tooHigh.fieldErrors.scheduledRegularHours).toBeTruthy()
    }
  })

  it("returns field errors for invalid date, time, classification, schedule, and approval", () => {
    const parsed = parseShiftEntry({
      workDate: "2026-02-30",
      shiftStart: "25:00",
      shiftEnd: "9:00",
      dayClassification: "HOLIDAY",
      breakIncludedInNd: "yes",
      scheduleType: "CWW",
      scheduledRegularHours: "8.00",
      overtimeApproved: "yes",
    })

    expect(parsed.success).toBe(false)
    if (parsed.success) {
      return
    }

    expect(parsed.fieldErrors.workDate).toBeTruthy()
    expect(parsed.fieldErrors.shiftStart).toBeTruthy()
    expect(parsed.fieldErrors.shiftEnd).toBeTruthy()
    expect(parsed.fieldErrors.dayClassification).toBeTruthy()
    expect(parsed.fieldErrors.breakIncludedInNd).toBeTruthy()
    expect(parsed.fieldErrors.scheduleType).toBeTruthy()
    expect(parsed.fieldErrors.overtimeApproved).toBeTruthy()
  })
})

describe("buildShiftInput", () => {
  it("combines the work date with times and uses only profile salary and settings", () => {
    const parsed = parseShiftEntry({
      ...validFields,
      monthlyBasicSalary: "1.00",
    })
    expect(parsed.success).toBe(true)
    if (!parsed.success) {
      return
    }

    expect(buildShiftInput(parsed.data, profile)).toEqual({
      workDate: "2026-10-01",
      shiftStart: "2026-10-01T21:00:00",
      shiftEnd: "2026-10-01T06:00:00",
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
    })
  })
})
