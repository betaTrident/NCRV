import { describe, expect, it } from "vitest"

import { parseComputation, parseProfile } from "./parse-settings"

const validProfile = {
  name: "Ada",
  monthlyBasicSalary: "34800",
  workScheduleType: "STANDARD",
  scheduledRegularHours: "8",
}

const validComputation = {
  ndStart: "22:00",
  ndEnd: "06:00",
  breakHours: "1",
}

describe("parseProfile", () => {
  it("treats monthly basic salary as optional and normalizes two decimal places", () => {
    const blank = parseProfile({ ...validProfile, monthlyBasicSalary: "" })
    expect(blank).toEqual({
      ok: true,
      value: {
        name: "Ada",
        monthlyBasicSalary: null,
        workScheduleType: "STANDARD",
        scheduledRegularHours: "8.00",
      },
    })

    const present = parseProfile({ ...validProfile, monthlyBasicSalary: "34800" })
    expect(present.ok).toBe(true)
    if (!present.ok) {
      return
    }
    expect(present.value.monthlyBasicSalary).toBe("34800.00")
  })

  it("rejects a negative salary, more than two decimals, and letters", () => {
    for (const monthlyBasicSalary of ["-1", "1.001", "abc"]) {
      const parsed = parseProfile({ ...validProfile, monthlyBasicSalary })
      expect(parsed.ok).toBe(false)
      if (parsed.ok) {
        continue
      }
      expect(parsed.fieldErrors.monthlyBasicSalary).toBe(
        "Enter a non-negative amount with at most two decimal places.",
      )
    }
  })

  it("rejects STANDARD scheduled hours of 7, 9, and 10", () => {
    for (const scheduledRegularHours of ["7", "9", "10"]) {
      const parsed = parseProfile({ ...validProfile, scheduledRegularHours })
      expect(parsed.ok).toBe(false)
      if (parsed.ok) {
        continue
      }
      expect(parsed.fieldErrors.scheduledRegularHours).toBe(
        "Standard schedules use exactly 8 hours.",
      )
    }
  })

  it("accepts APPROVED_CWW hours of 8, 10.5, and 12 as two-place decimals", () => {
    const cases: Array<[string, string]> = [
      ["8", "8.00"],
      ["10.5", "10.50"],
      ["12", "12.00"],
    ]

    for (const [scheduledRegularHours, expected] of cases) {
      const parsed = parseProfile({
        ...validProfile,
        workScheduleType: "APPROVED_CWW",
        scheduledRegularHours,
      })
      expect(parsed.ok).toBe(true)
      if (!parsed.ok) {
        continue
      }
      expect(parsed.value.scheduledRegularHours).toBe(expected)
    }
  })

  it("rejects APPROVED_CWW hours of 7.99 and 12.01", () => {
    for (const scheduledRegularHours of ["7.99", "12.01"]) {
      const parsed = parseProfile({
        ...validProfile,
        workScheduleType: "APPROVED_CWW",
        scheduledRegularHours,
      })
      expect(parsed.ok).toBe(false)
      if (parsed.ok) {
        continue
      }
      expect(parsed.fieldErrors.scheduledRegularHours).toBe(
        "Enter 8 through 12 hours.",
      )
    }
  })

  it("ignores legacy rate, email, and id fields on the input", () => {
    const parsed = parseProfile({
      ...validProfile,
      legacyHourlyRate: "999",
      legacy_hourly_rate: "999",
      email: "other@example.com",
      id: "attacker",
      employeeId: "EMP-1",
    })

    expect(parsed).toEqual({
      ok: true,
      value: {
        name: "Ada",
        monthlyBasicSalary: "34800.00",
        workScheduleType: "STANDARD",
        scheduledRegularHours: "8.00",
      },
    })
  })

  it("rejects a blank name and non-decimal hours", () => {
    const name = parseProfile({ ...validProfile, name: "  " })
    expect(name.ok).toBe(false)
    if (!name.ok) {
      expect(name.fieldErrors.name).toBe("Enter your name.")
    }

    const hours = parseProfile({ ...validProfile, scheduledRegularHours: "eight" })
    expect(hours.ok).toBe(false)
    if (!hours.ok) {
      expect(hours.fieldErrors.scheduledRegularHours).toBe(
        "Enter the scheduled regular hours as a decimal number.",
      )
    }
  })
})

describe("parseComputation", () => {
  it("accepts an ND window from 22:00 to 06:00", () => {
    const parsed = parseComputation(validComputation)
    expect(parsed).toEqual({
      ok: true,
      value: {
        ndStart: "22:00",
        ndEnd: "06:00",
        breakHours: "1.00",
      },
    })
  })

  it("rejects an invalid time and an out-of-range break", () => {
    const time = parseComputation({ ...validComputation, ndStart: "25:00" })
    expect(time.ok).toBe(false)
    if (!time.ok) {
      expect(time.fieldErrors.ndStart).toBe("Enter a valid time.")
    }

    for (const breakHours of ["-1", "1.001", "100"]) {
      const parsed = parseComputation({ ...validComputation, breakHours })
      expect(parsed.ok).toBe(false)
      if (parsed.ok) {
        continue
      }
      expect(parsed.fieldErrors.breakHours).toBe(
        "Enter a break from 0 through 99.99 hours.",
      )
    }
  })
})
