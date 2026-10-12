import { describe, expect, it } from "vitest"

import { parseRecordFilter } from "./record-filters"

const tuesday = "2026-10-13"
const tuesdayWeek = {
  status: "ready" as const,
  range: "week" as const,
  from: "2026-10-12",
  to: "2026-10-18",
}

describe("parseRecordFilter", () => {
  it("returns Monday–Sunday bounds for a Tuesday in Asia/Manila", () => {
    expect(parseRecordFilter({ range: "week" }, tuesday)).toEqual(tuesdayWeek)
  })

  it("returns a week that crosses a month boundary", () => {
    expect(parseRecordFilter({ range: "week" }, "2026-10-01")).toEqual({
      status: "ready",
      range: "week",
      from: "2026-09-28",
      to: "2026-10-04",
    })
  })

  it("ignores from and to when range is week", () => {
    expect(
      parseRecordFilter(
        { range: "week", from: "2026-01-01", to: "2026-01-31" },
        tuesday,
      ),
    ).toEqual(tuesdayWeek)
  })

  it("returns October month bounds and ignores from and to", () => {
    expect(
      parseRecordFilter(
        { range: "month", from: "2026-01-01", to: "2026-01-31" },
        tuesday,
      ),
    ).toEqual({
      status: "ready",
      range: "month",
      from: "2026-10-01",
      to: "2026-10-31",
    })
  })

  it("returns February month bounds for a non-leap year", () => {
    expect(parseRecordFilter({ range: "month" }, "2026-02-15")).toEqual({
      status: "ready",
      range: "month",
      from: "2026-02-01",
      to: "2026-02-28",
    })
  })

  it("returns period status without inventing payroll dates", () => {
    expect(
      parseRecordFilter(
        { range: "period", from: "2026-09-01", to: "2026-09-15" },
        tuesday,
      ),
    ).toEqual({ status: "period" })
  })

  it("accepts a valid custom range", () => {
    expect(
      parseRecordFilter(
        { range: "custom", from: "2026-09-01", to: "2026-09-15" },
        tuesday,
      ),
    ).toEqual({
      status: "ready",
      range: "custom",
      from: "2026-09-01",
      to: "2026-09-15",
    })
  })

  it("accepts a same-day custom range", () => {
    expect(
      parseRecordFilter(
        { range: "custom", from: "2026-09-01", to: "2026-09-01" },
        tuesday,
      ),
    ).toEqual({
      status: "ready",
      range: "custom",
      from: "2026-09-01",
      to: "2026-09-01",
    })
  })

  it("requires from on a custom range", () => {
    expect(
      parseRecordFilter({ range: "custom", to: "2026-09-15" }, tuesday),
    ).toEqual({
      status: "invalid",
      message: "Enter both a start date and an end date.",
    })
  })

  it("requires to on a custom range", () => {
    expect(
      parseRecordFilter({ range: "custom", from: "2026-09-01" }, tuesday),
    ).toEqual({
      status: "invalid",
      message: "Enter both a start date and an end date.",
    })
  })

  it("rejects a custom range that is not a real calendar date", () => {
    expect(
      parseRecordFilter(
        { range: "custom", from: "2026-02-31", to: "2026-03-01" },
        tuesday,
      ),
    ).toEqual({
      status: "invalid",
      message: "Enter dates as YYYY-MM-DD.",
    })
  })

  it("rejects custom dates that are not strict YYYY-MM-DD", () => {
    expect(
      parseRecordFilter(
        { range: "custom", from: "10/01/2026", to: "10/15/2026" },
        tuesday,
      ),
    ).toEqual({
      status: "invalid",
      message: "Enter dates as YYYY-MM-DD.",
    })
    expect(
      parseRecordFilter(
        { range: "custom", from: "2026-13-01", to: "2026-13-02" },
        tuesday,
      ),
    ).toEqual({
      status: "invalid",
      message: "Enter dates as YYYY-MM-DD.",
    })
  })

  it("rejects a custom range whose start is after its end", () => {
    expect(
      parseRecordFilter(
        { range: "custom", from: "2026-09-15", to: "2026-09-01" },
        tuesday,
      ),
    ).toEqual({
      status: "invalid",
      message: "The start date must be on or before the end date.",
    })
  })

  it("does not return week or month dates for an invalid custom range", () => {
    const result = parseRecordFilter(
      { range: "custom", from: "2026-02-31", to: "2026-03-01" },
      tuesday,
    )

    expect(result).toEqual({
      status: "invalid",
      message: "Enter dates as YYYY-MM-DD.",
    })
    expect(result).not.toMatchObject({ from: "2026-10-12", to: "2026-10-18" })
    expect(result).not.toMatchObject({ from: "2026-10-01", to: "2026-10-31" })
  })

  it("rejects an unknown range", () => {
    expect(parseRecordFilter({ range: "year" }, tuesday)).toEqual({
      status: "invalid",
      message: "Choose a week, payroll period, month, or custom range.",
    })
  })

  it("defaults an omitted range to this week for that Tuesday", () => {
    expect(parseRecordFilter({}, tuesday)).toEqual(tuesdayWeek)
  })

  it("defaults a missing, undefined, or empty range to this week", () => {
    expect(parseRecordFilter({ range: undefined }, tuesday)).toEqual(tuesdayWeek)
    expect(parseRecordFilter({ range: "" }, tuesday)).toEqual(tuesdayWeek)
  })
})
