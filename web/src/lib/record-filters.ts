import { DateTime } from "luxon"

const MANILA = "Asia/Manila"
const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/

export type RecordFilterParams = { range?: string; from?: string; to?: string }

export type ParsedRecordFilter =
  | { status: "ready"; range: "week" | "month" | "custom"; from: string; to: string }
  | { status: "period" }
  | { status: "invalid"; message: string }

function manilaDate(isoDate: string): DateTime {
  return DateTime.fromISO(isoDate, { zone: MANILA })
}

function isoDate(value: DateTime): string {
  return value.toISODate() as string
}

function weekRange(today: string): ParsedRecordFilter {
  const day = manilaDate(today)
  return {
    status: "ready",
    range: "week",
    from: isoDate(day.startOf("week")),
    to: isoDate(day.endOf("week")),
  }
}

function monthRange(today: string): ParsedRecordFilter {
  const day = manilaDate(today)
  return {
    status: "ready",
    range: "month",
    from: isoDate(day.startOf("month")),
    to: isoDate(day.endOf("month")),
  }
}

function isMissing(value: string | undefined): value is undefined | "" {
  return value === undefined || value === ""
}

function isCalendarDate(value: string): boolean {
  if (!CALENDAR_DATE.test(value)) {
    return false
  }
  const parsed = manilaDate(value)
  return parsed.isValid && parsed.toISODate() === value
}

function parseCustomRange(
  from: string | undefined,
  to: string | undefined,
): ParsedRecordFilter {
  if (isMissing(from) || isMissing(to)) {
    return {
      status: "invalid",
      message: "Enter both a start date and an end date.",
    }
  }

  if (!isCalendarDate(from) || !isCalendarDate(to)) {
    return {
      status: "invalid",
      message: "Enter dates as YYYY-MM-DD.",
    }
  }

  if (manilaDate(from) > manilaDate(to)) {
    return {
      status: "invalid",
      message: "The start date must be on or before the end date.",
    }
  }

  return { status: "ready", range: "custom", from, to }
}

export function parseRecordFilter(
  params: RecordFilterParams,
  today: string,
): ParsedRecordFilter {
  const range = params.range

  if (range === undefined || range === "" || range === "week") {
    return weekRange(today)
  }

  if (range === "month") {
    return monthRange(today)
  }

  if (range === "period") {
    return { status: "period" }
  }

  if (range === "custom") {
    return parseCustomRange(params.from, params.to)
  }

  return {
    status: "invalid",
    message: "Choose a week, payroll period, month, or custom range.",
  }
}
