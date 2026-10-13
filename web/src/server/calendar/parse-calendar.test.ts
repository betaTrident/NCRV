import { describe, expect, it } from "vitest"

import { parseHoliday, parsePayrollPeriod } from "./parse-calendar"

describe("parseHoliday", () => {
  it("returns field errors for missing name, type, and date", () => {
    const parsed = parseHoliday({})

    expect(parsed.ok).toBe(false)
    if (parsed.ok) {
      return
    }

    expect(parsed.fieldErrors.holidayDate).toBe("Enter a valid date.")
    expect(parsed.fieldErrors.name).toBe("Enter a name.")
    expect(parsed.fieldErrors.holidayType).toBe("Choose a holiday type.")
  })

  it("rejects a blank name and an unknown holiday type", () => {
    const parsed = parseHoliday({
      holidayDate: "2026-10-01",
      name: "   ",
      holidayType: "REST_DAY",
    })

    expect(parsed.ok).toBe(false)
    if (parsed.ok) {
      return
    }

    expect(parsed.fieldErrors.name).toBe("Enter a name.")
    expect(parsed.fieldErrors.holidayType).toBe("Choose a holiday type.")
  })

  it("keeps SPECIAL_PUBLIC_HOLIDAY on Saturday 2026-10-03 and derives year 2026", () => {
    const parsed = parseHoliday({
      holidayDate: "2026-10-03",
      name: "Weekend special",
      holidayType: "SPECIAL_PUBLIC_HOLIDAY",
    })

    expect(parsed).toEqual({
      ok: true,
      value: {
        holidayDate: "2026-10-03",
        name: "Weekend special",
        holidayType: "SPECIAL_PUBLIC_HOLIDAY",
        year: 2026,
      },
    })
    if (!parsed.ok) {
      return
    }
    expect(parsed.value.holidayType).not.toBe("REST_DAY")
  })

  it("keeps REGULAR_PUBLIC_HOLIDAY on Sunday 2026-10-04", () => {
    const parsed = parseHoliday({
      holidayDate: "2026-10-04",
      name: "Sunday regular",
      holidayType: "REGULAR_PUBLIC_HOLIDAY",
    })

    expect(parsed.ok).toBe(true)
    if (!parsed.ok) {
      return
    }

    expect(parsed.value.holidayType).toBe("REGULAR_PUBLIC_HOLIDAY")
    expect(parsed.value.holidayDate).toBe("2026-10-04")
    expect(parsed.value.year).toBe(2026)
    expect(parsed.value.holidayType).not.toBe("REST_DAY")
  })

  it("rejects invalid date 2026-02-31", () => {
    const parsed = parseHoliday({
      holidayDate: "2026-02-31",
      name: "Impossible",
      holidayType: "REGULAR_PUBLIC_HOLIDAY",
    })

    expect(parsed.ok).toBe(false)
    if (parsed.ok) {
      return
    }
    expect(parsed.fieldErrors.holidayDate).toBe("Enter a valid date.")
  })

  it("ignores a submitted owner_id and year and derives year from the date", () => {
    const parsed = parseHoliday({
      holidayDate: "2026-10-03",
      name: "Special",
      holidayType: "SPECIAL_PUBLIC_HOLIDAY",
      owner_id: "someone-else",
      ownerId: "someone-else",
      employeeId: "someone-else",
      year: "1999",
    })

    expect(parsed.ok).toBe(true)
    if (!parsed.ok) {
      return
    }

    expect(parsed.value.year).toBe(2026)
    expect(parsed.value).not.toHaveProperty("owner_id")
    expect(parsed.value).not.toHaveProperty("ownerId")
    expect(parsed.value).not.toHaveProperty("employeeId")
  })
})

describe("parsePayrollPeriod", () => {
  it("returns field errors for missing period dates", () => {
    const parsed = parsePayrollPeriod({})

    expect(parsed.ok).toBe(false)
    if (parsed.ok) {
      return
    }

    expect(parsed.fieldErrors.periodStart).toBe("Enter a valid date.")
    expect(parsed.fieldErrors.periodEnd).toBe("Enter a valid date.")
  })

  it("rejects a period end that is before the start", () => {
    const parsed = parsePayrollPeriod({
      periodStart: "2026-10-16",
      periodEnd: "2026-10-01",
    })

    expect(parsed.ok).toBe(false)
    if (parsed.ok) {
      return
    }
    expect(parsed.fieldErrors.periodEnd).toBe("Period end must be on or after the start.")
  })

  it("accepts equal start and end dates", () => {
    const parsed = parsePayrollPeriod({
      periodStart: "2026-10-01",
      periodEnd: "2026-10-01",
    })

    expect(parsed).toEqual({
      ok: true,
      value: {
        periodStart: "2026-10-01",
        periodEnd: "2026-10-01",
        payDate: null,
        cutoffDate: null,
        cutoffTime: null,
      },
    })
  })

  it("treats blank optional fields as null", () => {
    const parsed = parsePayrollPeriod({
      periodStart: "2026-10-01",
      periodEnd: "2026-10-15",
      payDate: "",
      cutoffDate: "  ",
      cutoffTime: "",
      owner_id: "someone-else",
    })

    expect(parsed.ok).toBe(true)
    if (!parsed.ok) {
      return
    }

    expect(parsed.value).toEqual({
      periodStart: "2026-10-01",
      periodEnd: "2026-10-15",
      payDate: null,
      cutoffDate: null,
      cutoffTime: null,
    })
    expect(parsed.value).not.toHaveProperty("owner_id")
  })
})
