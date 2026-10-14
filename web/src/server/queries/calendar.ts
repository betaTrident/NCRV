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

type SourceCalendarEvent = {
  date: string
  label: string
  kind: "holiday" | "cutoff" | "payday"
  classification: "regular" | "special" | null
}

type SourceReferenceCode = {
  code: string
  category: string
  hoursCategory: string
  percentage: string
  engineActive: boolean
  formulaStatus: "TBD" | "confirmed"
}

type SourceCalendar = {
  id: string
  site: string
  year: number
  calendarFile: string
  calendarSha256: string
  codeFile: string
  codePage: number
  codeSha256: string
  events: SourceCalendarEvent[]
  referenceCodes: SourceReferenceCode[]
}

type SavedShiftListItem = {
  id: string
  recordId: string | null
  workDate: string
  shiftStart: string
  shiftEnd: string
  dayClassification: string
  ndHours: string | null
  wageCodes: string[]
}

type CalendarQueryResult =
  | { status: "ready"; holidays: HolidayListItem[]; periods: PayrollPeriodListItem[]; shifts: SavedShiftListItem[]; source: SourceCalendar | null }
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

function mapSourceEvent(row: unknown): SourceCalendarEvent | null {
  if (!isRecord(row) || typeof row.event_date !== "string" || typeof row.label !== "string") return null
  if (row.kind !== "holiday" && row.kind !== "cutoff" && row.kind !== "payday") return null
  if (row.classification !== null && row.classification !== "regular" && row.classification !== "special") return null
  const date = calendarDate(row.event_date)
  return date ? { date, label: row.label, kind: row.kind, classification: row.classification } : null
}

function mapSourceCode(row: unknown): SourceReferenceCode | null {
  if (!isRecord(row) || typeof row.code !== "string" || typeof row.category !== "string" || typeof row.hours_category !== "string") return null
  if (typeof row.percentage !== "number" && typeof row.percentage !== "string") return null
  if (typeof row.engine_active !== "boolean" || (row.formula_status !== "TBD" && row.formula_status !== "confirmed")) return null
  return { code: row.code, category: row.category, hoursCategory: row.hours_category, percentage: String(row.percentage), engineActive: row.engine_active, formulaStatus: row.formula_status }
}

async function loadCalendar(range?: { from: string; to: string }): Promise<CalendarQueryResult> {
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
  let holidaysQuery = supabase
    .from("holidays")
    .select("id, holiday_date, name, holiday_type, year, active")
    .or(filter)
    .order("holiday_date", { ascending: true })
  if (range) holidaysQuery = holidaysQuery.gte("holiday_date", range.from).lte("holiday_date", range.to)
  let periodsQuery = supabase
    .from("payroll_periods")
    .select("id, period_start, period_end, pay_date, cutoff_date, cutoff_time, active")
    .or(filter)
    .order("period_start", { ascending: false })
  if (range) periodsQuery = periodsQuery.lte("period_start", range.to).gte("period_end", range.from)
  let shiftsQuery = supabase.from("shifts").select("id, work_date, shift_start, shift_end, day_classification, nd_records(id, nd_hours, nd_wage_type_lines(wage_type_code, amount_status))").eq("employee_id", sub).order("work_date", { ascending: true })
  if (range) shiftsQuery = shiftsQuery.gte("work_date", range.from).lte("work_date", range.to)
  const [holidaysResult, periodsResult, shiftsResult, sourceResult, sourceEventsResult, sourceCodesResult] = await Promise.all([
    holidaysQuery,
    periodsQuery,
    shiftsQuery,
    supabase.from("calendar_sources").select("id, site, year, calendar_file, calendar_sha256, code_file, code_page, code_sha256").eq("id", "ncr-voyix-cebu-2026").maybeSingle(),
    supabase.from("calendar_events").select("event_date, label, kind, classification").eq("source_id", "ncr-voyix-cebu-2026").order("event_date", { ascending: true }),
    supabase.from("reference_codes").select("code, category, hours_category, percentage, engine_active, formula_status").eq("source_id", "ncr-voyix-cebu-2026").order("code", { ascending: true }),
  ])

  if (holidaysResult.error || periodsResult.error || shiftsResult.error) {
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

  const shifts: SavedShiftListItem[] = []
  for (const row of shiftsResult.data ?? []) {
    if (!isRecord(row) || typeof row.id !== "string" || typeof row.work_date !== "string") continue
    const nd = Array.isArray(row.nd_records) ? row.nd_records[0] : row.nd_records
    const lines = isRecord(nd) && Array.isArray(nd.nd_wage_type_lines) ? nd.nd_wage_type_lines : []
    shifts.push({
      id: row.id,
      recordId: isRecord(nd) && typeof nd.id === "string" ? nd.id : null,
      workDate: row.work_date,
      shiftStart: String(row.shift_start ?? ""),
      shiftEnd: String(row.shift_end ?? ""),
      dayClassification: String(row.day_classification ?? ""),
      ndHours: isRecord(nd) && nd.nd_hours !== null && nd.nd_hours !== undefined ? String(nd.nd_hours) : null,
      wageCodes: lines.filter(isRecord).map((line) => typeof line.wage_type_code === "string" ? line.wage_type_code : null).filter((code): code is string => code !== null),
    })
  }

  let source: SourceCalendar | null = null
  if (!sourceResult.error && sourceResult.data && !sourceEventsResult.error && !sourceCodesResult.error) {
    const events = (sourceEventsResult.data ?? []).map(mapSourceEvent).filter((item): item is SourceCalendarEvent => item !== null)
    const referenceCodes = (sourceCodesResult.data ?? []).map(mapSourceCode).filter((item): item is SourceReferenceCode => item !== null)
    if (typeof sourceResult.data.id === "string" && typeof sourceResult.data.site === "string" && typeof sourceResult.data.year === "number") {
      source = { id: sourceResult.data.id, site: sourceResult.data.site, year: sourceResult.data.year, calendarFile: String(sourceResult.data.calendar_file), calendarSha256: String(sourceResult.data.calendar_sha256), codeFile: String(sourceResult.data.code_file), codePage: Number(sourceResult.data.code_page), codeSha256: String(sourceResult.data.code_sha256), events, referenceCodes }
    }
  }

  return { status: "ready", holidays, periods, shifts, source }
}

export { loadCalendar }
export type { CalendarQueryResult, HolidayListItem, PayrollPeriodListItem, SavedShiftListItem, SourceCalendar, SourceCalendarEvent, SourceReferenceCode }
