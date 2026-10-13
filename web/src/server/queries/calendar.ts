import { DateTime } from "luxon"

import { createClient, getRequestClaims } from "@/lib/supabase/server"
import { HOLIDAY_TYPES, type HolidayType } from "@/server/calendar/parse-calendar"

type HolidayListItem = {
  id: string
  holidayDate: string
  name: string
  holidayType: HolidayType
  year: number
}

type PayrollPeriodListItem = {
  id: string
  periodStart: string
  periodEnd: string
  payDate: string | null
  cutoffDate: string | null
  cutoffTime: string | null
}

type CalendarQueryResult =
  | { status: "ready"; holidays: HolidayListItem[]; periods: PayrollPeriodListItem[] }
  | { status: "needs-profile" }
  | { status: "unavailable" }
  | { status: "signed-out" }

const CUTOFF_HHMM_RE = /^([01]\d|2[0-3]):[0-5]\d$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isHolidayType(value: string): value is HolidayType {
  return (HOLIDAY_TYPES as readonly string[]).includes(value)
}

function calendarDate(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }
  const candidate = value.length > 10 ? value.slice(0, 10) : value
  const parsed = DateTime.fromISO(candidate, { zone: "utc" })
  return parsed.isValid && parsed.toISODate() === candidate ? candidate : null
}

function optionalCalendarDate(value: unknown): string | null | undefined {
  if (value === null) {
    return null
  }
  const date = calendarDate(value)
  return date === null ? undefined : date
}

function asYear(value: unknown): number | null {
  if (typeof value === "number" && Number.isSafeInteger(value)) {
    return value
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const year = Number(value)
    return Number.isSafeInteger(year) ? year : null
  }
  return null
}

function optionalCutoffTime(value: unknown): string | null | undefined {
  if (value === null) {
    return null
  }
  if (typeof value !== "string") {
    return undefined
  }

  const trimmed = value.trim()
  if (trimmed === "") {
    return null
  }

  const hhmm = trimmed.length >= 5 ? trimmed.slice(0, 5) : trimmed
  return CUTOFF_HHMM_RE.test(hhmm) ? hhmm : undefined
}

function ownerFilter(sub: string) {
  return `owner_id.eq.${sub},owner_id.is.null`
}

function mapHoliday(row: unknown): HolidayListItem | null {
  if (!isRecord(row) || typeof row.id !== "string" || typeof row.name !== "string") {
    return null
  }
  if (typeof row.holiday_type !== "string" || !isHolidayType(row.holiday_type)) {
    return null
  }

  const holidayDate = calendarDate(row.holiday_date)
  const year = asYear(row.year)
  if (holidayDate === null || year === null) {
    return null
  }

  return {
    id: row.id,
    holidayDate,
    name: row.name,
    holidayType: row.holiday_type,
    year,
  }
}

function mapPeriod(row: unknown): PayrollPeriodListItem | null {
  if (!isRecord(row) || typeof row.id !== "string") {
    return null
  }

  const periodStart = calendarDate(row.period_start)
  const periodEnd = calendarDate(row.period_end)
  if (periodStart === null || periodEnd === null) {
    return null
  }

  const payDate = optionalCalendarDate(row.pay_date)
  const cutoffDate = optionalCalendarDate(row.cutoff_date)
  const cutoffTime = optionalCutoffTime(row.cutoff_time)
  if (payDate === undefined || cutoffDate === undefined || cutoffTime === undefined) {
    return null
  }

  return {
    id: row.id,
    periodStart,
    periodEnd,
    payDate,
    cutoffDate,
    cutoffTime,
  }
}

async function loadCalendar(): Promise<CalendarQueryResult> {
  const supabase = await createClient()
  const { data: claimData } = await getRequestClaims()
  const sub = claimData?.claims?.sub
  if (typeof sub !== "string" || sub.length === 0) {
    return { status: "signed-out" }
  }

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("id")
    .eq("id", sub)
    .maybeSingle()

  if (employeeError) {
    return { status: "unavailable" }
  }
  if (!employee) {
    return { status: "needs-profile" }
  }

  const filter = ownerFilter(sub)
  const [holidaysResult, periodsResult] = await Promise.all([
    supabase
      .from("holidays")
      .select("id, holiday_date, name, holiday_type, year, active")
      .or(filter)
      .order("holiday_date", { ascending: true }),
    supabase
      .from("payroll_periods")
      .select("id, period_start, period_end, pay_date, cutoff_date, cutoff_time, active")
      .or(filter)
      .order("period_start", { ascending: false }),
  ])

  if (holidaysResult.error || periodsResult.error) {
    return { status: "unavailable" }
  }

  const holidays: HolidayListItem[] = []
  for (const row of holidaysResult.data ?? []) {
    const mapped = mapHoliday(row)
    if (mapped) {
      holidays.push(mapped)
    }
  }

  const periods: PayrollPeriodListItem[] = []
  for (const row of periodsResult.data ?? []) {
    const mapped = mapPeriod(row)
    if (mapped) {
      periods.push(mapped)
    }
  }

  return { status: "ready", holidays, periods }
}

export { loadCalendar }
export type { CalendarQueryResult, HolidayListItem, PayrollPeriodListItem }
