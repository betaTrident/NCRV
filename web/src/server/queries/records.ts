import Decimal from "decimal.js"
import { DateTime } from "luxon"

import { formatPhp } from "@/lib/format"
import {
  parseRecordFilter,
  parseRecordPage,
  parseRecordSort,
  type ParsedRecordFilter,
} from "@/lib/record-filters"
import {
  resolveCurrentPeriod,
  type PeriodCandidate,
} from "@/lib/record-summary"
import { createClient, getRequestClaims } from "@/lib/supabase/server"

const MANILA = "Asia/Manila"
export const RECORDS_PAGE_SIZE = 25
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const DAY_LABELS: Record<string, string> = {
  REGULAR_WORK_DAY: "Regular Work Day",
  REST_DAY: "Rest Day",
  SPECIAL_PUBLIC_HOLIDAY: "Special Public Holiday",
  SPECIAL_PUBLIC_HOLIDAY_REST_DAY: "Special Public Holiday + Rest Day",
  REGULAR_PUBLIC_HOLIDAY: "Regular/Public Holiday",
  REGULAR_PUBLIC_HOLIDAY_REST_DAY: "Regular/Public Holiday + Rest Day",
  DOUBLE_REGULAR_HOLIDAY: "Double Regular Holiday",
  DOUBLE_REGULAR_HOLIDAY_REST_DAY: "Double Regular Holiday + Rest Day",
}

const HOURS_CATEGORY_LABELS: Record<string, string> = {
  FIRST_8: "First 8 Hours",
  EXCESS: "Excess",
}

const SCHEDULE_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  APPROVED_CWW: "Approved compressed workweek",
}

const SHIFT_SELECT = [
  "id",
  "work_date",
  "shift_start",
  "shift_end",
  "day_classification",
  "nd_records(id, nd_hours, nd_wage_type_lines(wage_type_code, amount_status, calculated_amount_centavos))",
].join(", ")

const DETAIL_SELECT = [
  "id",
  "potential_nd_hours",
  "break_hours",
  "break_included_in_nd",
  "nd_hours",
  "nd_start",
  "nd_end",
  "time_zone",
  "calculation_version",
  "monthly_basic_salary",
  "annual_months",
  "workdays_factor",
  "rate_hours_per_day",
  "derived_daily_rate",
  "derived_hourly_rate",
  "work_schedule_type",
  "scheduled_regular_hours",
  "elapsed_hours",
  "worked_hours",
  "regular_hours",
  "potential_overtime_hours",
  "approved_overtime_hours",
  "unapproved_extra_hours",
  "overtime_approved",
  "shifts!inner(employee_id, work_date, shift_start, shift_end, day_classification)",
  "nd_wage_type_lines(wage_type_code, category, hours_category, applicable_hours, percentage, amount_status, calculated_amount_centavos, unresolved_reason)",
].join(", ")

export type RecordListRow = {
  id: string
  workDate: string
  workDateLabel: string
  workDateLongLabel: string
  weekdayLabel: string
  shiftLabel: string
  dayLabel: string
  ndHours: string
  wageCodes: string
  wageCodeItems: { code: string; tbd: boolean }[]
  amountLabel: string
  amountState: "estimated" | "partial-tbd" | "tbd" | "none"
}

export type RecordsListResult =
  | { status: "signed-out" }
  | { status: "error" }
  | { status: "invalid"; message: string }
  | { status: "no-period" }
  | { status: "overlap" }
  | { status: "custom-pending" }
  | {
      status: "ready"
      range: "week" | "month" | "custom" | "period"
      from: string
      to: string
      page: number
      pageSize: number
      totalCount: number
      totalPages: number
      sort: "newest" | "oldest"
      rows: RecordListRow[]
    }

export type SavedWageLineView = {
  code: string
  categoryLabel: string
  hoursCategoryLabel: string
  hours: string | null
  percentage: string
  amountStatus: "estimated" | "tbd"
  amountLabel: string
  unresolvedReason: string | null
}

export type RecordDetailView = {
  id: string
  workDateLabel: string
  shiftLabel: string
  shiftStartLabel: string
  shiftEndLabel: string
  dayLabel: string
  elapsedHours: string | null
  workedHours: string | null
  regularHours: string | null
  potentialOvertimeHours: string | null
  approvedOvertimeHours: string | null
  unapprovedExtraHours: string | null
  potentialNdHours: string | null
  breakHours: string | null
  breakIncludedLabel: "Yes" | "No" | null
  ndHours: string | null
  scheduleLabel: string | null
  scheduledRegularHours: string | null
  overtimeApprovedLabel: "Yes" | "No" | null
  ndWindowLabel: string
  timeZone: string
  salaryLabel: string | null
  dailyRateLabel: string | null
  hourlyRateLabel: string | null
  lines: SavedWageLineView[]
}

export type RecordDetailResult =
  | { status: "signed-out" }
  | { status: "unavailable" }
  | { status: "error" }
  | { status: "ready"; detail: RecordDetailView }

type ListLine = {
  code: string
  amountStatus: "estimated" | "tbd"
  centavos: number | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isEmbedError(value: unknown): boolean {
  return isRecord(value) && "error" in value && !("id" in value) && !("wage_type_code" in value)
}

function asRows(value: unknown): unknown[] | null {
  if (value == null) {
    return []
  }
  if (Array.isArray(value)) {
    return value.some(isEmbedError) ? null : value
  }
  if (isEmbedError(value)) {
    return null
  }
  if (isRecord(value)) {
    return [value]
  }
  return null
}

function dateOnly(value: unknown): string | null {
  if (typeof value !== "string" || value.length < 10) {
    return null
  }
  const date = value.slice(0, 10)
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null
}

function nullableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null
  }
  if (typeof value === "string") {
    return value
  }
  return undefined
}

function asHoursString(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null
  }
  try {
    return new Decimal(value).toFixed(2)
  } catch {
    return null
  }
}

function nullableHours(value: unknown): string | null | undefined {
  if (value === null) {
    return null
  }
  const hours = asHoursString(value)
  return hours === null ? undefined : hours
}

function asSafeInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isSafeInteger(value)) {
    return value
  }
  if (typeof value === "string" && /^-?\d+$/.test(value)) {
    const parsed = Number(value)
    return Number.isSafeInteger(parsed) ? parsed : null
  }
  return null
}

function phpFromCentavos(centavos: number): string | null {
  try {
    return formatPhp(centavos)
  } catch {
    return null
  }
}

function asPercentageLabel(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null
  }
  try {
    const amount = new Decimal(value)
    if (!amount.isFinite()) {
      return null
    }
    return `${amount.toFixed()}%`
  } catch {
    return null
  }
}

function formatSavedPesos(value: unknown, maxFractionDigits: number): string | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null
  }
  try {
    const amount = new Decimal(value)
    if (!amount.isFinite()) {
      return null
    }
    const places = amount.decimalPlaces()
    const maximumFractionDigits = Math.min(Math.max(places, 2), maxFractionDigits)
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits,
    }).format(amount.toNumber())
  } catch {
    return null
  }
}

function mapPeriod(row: unknown): PeriodCandidate | null {
  if (!isRecord(row) || typeof row.id !== "string" || typeof row.active !== "boolean") {
    return null
  }
  const periodStart = dateOnly(row.period_start)
  const periodEnd = dateOnly(row.period_end)
  if (periodStart === null || periodEnd === null) {
    return null
  }
  const payDate = nullableString(row.pay_date)
  const cutoffDate = nullableString(row.cutoff_date)
  const cutoffTime = nullableString(row.cutoff_time)
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
    active: row.active,
  }
}

function formatClock(value: string): string {
  const parsed = DateTime.fromISO(value, { zone: MANILA })
  return parsed.isValid ? parsed.toFormat("h:mm a") : value
}

function formatTimeClock(value: string): string | null {
  const trimmed = value.trim()
  const withSeconds = DateTime.fromFormat(trimmed.slice(0, 8), "HH:mm:ss", {
    zone: MANILA,
  })
  if (withSeconds.isValid) {
    return withSeconds.toFormat("h:mm a")
  }
  const withMinutes = DateTime.fromFormat(trimmed.slice(0, 5), "HH:mm", {
    zone: MANILA,
  })
  return withMinutes.isValid ? withMinutes.toFormat("h:mm a") : null
}

function formatWorkDate(date: string, format: string): string | null {
  const parsed = DateTime.fromISO(date, { zone: MANILA })
  return parsed.isValid ? parsed.toFormat(format) : null
}

function dayLabelOf(value: string): string {
  return DAY_LABELS[value] ?? value
}

function hoursCategoryLabelOf(value: string): string {
  return HOURS_CATEGORY_LABELS[value] ?? value
}

function scheduleLabelOf(value: unknown): string | null | undefined {
  if (value === null) {
    return null
  }
  if (typeof value !== "string") {
    return undefined
  }
  return SCHEDULE_LABELS[value] ?? value
}

function yesNo(value: unknown): "Yes" | "No" | undefined {
  if (value === true) {
    return "Yes"
  }
  if (value === false) {
    return "No"
  }
  return undefined
}

function optionalYesNo(value: unknown): "Yes" | "No" | null | undefined {
  if (value === null) {
    return null
  }
  return yesNo(value)
}

function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

function amountLabelOf(lines: ListLine[]): string | null {
  if (lines.length === 0) {
    return "—"
  }

  let estimatedCentavos = 0
  let hasTbd = false
  let hasEstimated = false

  for (const line of lines) {
    if (line.amountStatus === "tbd") {
      hasTbd = true
      continue
    }
    if (line.centavos === null || !Number.isSafeInteger(line.centavos)) {
      return null
    }
    hasEstimated = true
    estimatedCentavos += line.centavos
  }

  if (!hasEstimated) {
    return hasTbd ? "TBD" : "—"
  }

  const money = phpFromCentavos(estimatedCentavos)
  if (money === null) {
    return null
  }
  return hasTbd ? `${money} · TBD` : money
}

function amountStateOf(lines: ListLine[]): RecordListRow["amountState"] {
  const hasEstimated = lines.some((line) => line.amountStatus === "estimated")
  const hasTbd = lines.some((line) => line.amountStatus === "tbd")
  if (hasEstimated && hasTbd) return "partial-tbd"
  if (hasEstimated) return "estimated"
  if (hasTbd) return "tbd"
  return "none"
}

function mapListLine(row: unknown): ListLine | null {
  if (!isRecord(row) || typeof row.wage_type_code !== "string") {
    return null
  }
  if (row.amount_status === "tbd") {
    return { code: row.wage_type_code, amountStatus: "tbd", centavos: null }
  }
  if (row.amount_status === "estimated") {
    const centavos = asSafeInteger(row.calculated_amount_centavos)
    if (centavos === null) {
      return null
    }
    return { code: row.wage_type_code, amountStatus: "estimated", centavos }
  }
  return null
}

function mapListNdRecord(
  row: unknown,
  workDate: string,
  shiftStart: string,
  shiftEnd: string,
  dayClassification: string,
): RecordListRow | null {
  if (!isRecord(row) || typeof row.id !== "string") {
    return null
  }
  const ndHours = asHoursString(row.nd_hours)
  const lineRows = asRows(row.nd_wage_type_lines)
  if (ndHours === null || lineRows === null) {
    return null
  }

  const lines: ListLine[] = []
  for (const lineRow of lineRows) {
    const mapped = mapListLine(lineRow)
    if (mapped === null) {
      return null
    }
    lines.push(mapped)
  }

  const workDateLabel = formatWorkDate(workDate, "MMM d")
  const workDateLongLabel = formatWorkDate(workDate, "MMMM d, yyyy")
  const weekdayLabel = formatWorkDate(workDate, "cccc")
  const amountLabel = amountLabelOf(lines)
  if (
    workDateLabel === null ||
    workDateLongLabel === null ||
    weekdayLabel === null ||
    amountLabel === null
  ) {
    return null
  }

  return {
    id: row.id,
    workDate,
    workDateLabel,
    workDateLongLabel,
    weekdayLabel,
    shiftLabel: `${formatClock(shiftStart)}–${formatClock(shiftEnd)}`,
    dayLabel: dayLabelOf(dayClassification),
    ndHours,
    wageCodes: lines.length === 0 ? "—" : lines.map((line) => line.code).join(", "),
    wageCodeItems: lines.map((line) => ({
      code: line.code,
      tbd: line.amountStatus === "tbd",
    })),
    amountLabel,
    amountState: amountStateOf(lines),
  }
}

export function paginationWindow(page: number): { from: number; to: number } {
  const from = (page - 1) * RECORDS_PAGE_SIZE
  return { from, to: from + RECORDS_PAGE_SIZE - 1 }
}

export function mapRecordListRows(shifts: unknown): RecordListRow[] | null {
  if (!Array.isArray(shifts)) {
    return null
  }

  const rows: RecordListRow[] = []
  for (const shift of shifts) {
    if (!isRecord(shift)) {
      return null
    }
    const workDate = dateOnly(shift.work_date)
    if (
      workDate === null ||
      typeof shift.shift_start !== "string" ||
      typeof shift.shift_end !== "string" ||
      typeof shift.day_classification !== "string"
    ) {
      return null
    }

    const embeds = asRows(shift.nd_records)
    if (embeds === null) {
      return null
    }
    if (embeds.length === 0) {
      continue
    }
    if (embeds.length !== 1) {
      return null
    }

    const mapped = mapListNdRecord(
      embeds[0],
      workDate,
      shift.shift_start,
      shift.shift_end,
      shift.day_classification,
    )
    if (mapped === null) {
      return null
    }
    rows.push(mapped)
  }

  return rows
}

function mapRateLabels(row: Record<string, unknown>): {
  salaryLabel: string | null
  dailyRateLabel: string | null
  hourlyRateLabel: string | null
} | null {
  const salary = row.monthly_basic_salary
  const daily = row.derived_daily_rate
  const hourly = row.derived_hourly_rate
  if (salary === undefined || daily === undefined || hourly === undefined) {
    return null
  }
  if (salary === null && daily === null && hourly === null) {
    return { salaryLabel: null, dailyRateLabel: null, hourlyRateLabel: null }
  }
  if (salary === null || daily === null || hourly === null) {
    return null
  }

  const salaryLabel = formatSavedPesos(salary, 2)
  const dailyRateLabel = formatSavedPesos(daily, 8)
  const hourlyRateLabel = formatSavedPesos(hourly, 8)
  if (salaryLabel === null || dailyRateLabel === null || hourlyRateLabel === null) {
    return null
  }
  return { salaryLabel, dailyRateLabel, hourlyRateLabel }
}

function mapSavedLine(row: unknown): SavedWageLineView | null {
  if (
    !isRecord(row) ||
    typeof row.wage_type_code !== "string" ||
    typeof row.category !== "string" ||
    typeof row.hours_category !== "string"
  ) {
    return null
  }

  const hours = nullableHours(row.applicable_hours)
  const percentage = asPercentageLabel(row.percentage)
  const unresolvedReason = nullableString(row.unresolved_reason)
  if (hours === undefined || percentage === null || unresolvedReason === undefined) {
    return null
  }

  if (row.amount_status === "tbd") {
    return {
      code: row.wage_type_code,
      categoryLabel: dayLabelOf(row.category),
      hoursCategoryLabel: hoursCategoryLabelOf(row.hours_category),
      hours,
      percentage,
      amountStatus: "tbd",
      amountLabel: "TBD",
      unresolvedReason,
    }
  }

  if (row.amount_status === "estimated") {
    const centavos = asSafeInteger(row.calculated_amount_centavos)
    if (centavos === null) {
      return null
    }
    const amountLabel = phpFromCentavos(centavos)
    if (amountLabel === null) {
      return null
    }
    return {
      code: row.wage_type_code,
      categoryLabel: dayLabelOf(row.category),
      hoursCategoryLabel: hoursCategoryLabelOf(row.hours_category),
      hours,
      percentage,
      amountStatus: "estimated",
      amountLabel,
      unresolvedReason,
    }
  }

  return null
}

export function mapRecordDetail(row: unknown): RecordDetailView | null {
  if (!isRecord(row) || typeof row.id !== "string" || typeof row.time_zone !== "string") {
    return null
  }

  const shiftRows = asRows(row.shifts)
  if (shiftRows === null || shiftRows.length !== 1 || !isRecord(shiftRows[0])) {
    return null
  }
  const shift = shiftRows[0]
  const workDate = dateOnly(shift.work_date)
  if (
    workDate === null ||
    typeof shift.shift_start !== "string" ||
    typeof shift.shift_end !== "string" ||
    typeof shift.day_classification !== "string"
  ) {
    return null
  }

  const workDateLabel = formatWorkDate(workDate, "MMMM d, yyyy")
  const potentialNdHours = nullableHours(row.potential_nd_hours)
  const breakHours = nullableHours(row.break_hours)
  const ndHours = nullableHours(row.nd_hours)
  const elapsedHours = nullableHours(row.elapsed_hours)
  const workedHours = nullableHours(row.worked_hours)
  const regularHours = nullableHours(row.regular_hours)
  const potentialOvertimeHours = nullableHours(row.potential_overtime_hours)
  const approvedOvertimeHours = nullableHours(row.approved_overtime_hours)
  const unapprovedExtraHours = nullableHours(row.unapproved_extra_hours)
  const scheduledRegularHours = nullableHours(row.scheduled_regular_hours)
  const scheduleLabel = scheduleLabelOf(row.work_schedule_type)
  const breakIncludedLabel = optionalYesNo(row.break_included_in_nd)
  const overtimeApprovedLabel = optionalYesNo(row.overtime_approved)
  const rates = mapRateLabels(row)
  const lineRows = asRows(row.nd_wage_type_lines)

  if (
    workDateLabel === null ||
    potentialNdHours === undefined ||
    breakHours === undefined ||
    ndHours === undefined ||
    elapsedHours === undefined ||
    workedHours === undefined ||
    regularHours === undefined ||
    potentialOvertimeHours === undefined ||
    approvedOvertimeHours === undefined ||
    unapprovedExtraHours === undefined ||
    scheduledRegularHours === undefined ||
    scheduleLabel === undefined ||
    breakIncludedLabel === undefined ||
    overtimeApprovedLabel === undefined ||
    rates === null ||
    lineRows === null ||
    typeof row.nd_start !== "string" ||
    typeof row.nd_end !== "string"
  ) {
    return null
  }

  const ndStartLabel = formatTimeClock(row.nd_start)
  const ndEndLabel = formatTimeClock(row.nd_end)
  if (ndStartLabel === null || ndEndLabel === null) {
    return null
  }

  const lines: SavedWageLineView[] = []
  for (const lineRow of lineRows) {
    const mapped = mapSavedLine(lineRow)
    if (mapped === null) {
      return null
    }
    lines.push(mapped)
  }

  return {
    id: row.id,
    workDateLabel,
    shiftLabel: `${formatClock(shift.shift_start)} – ${formatClock(shift.shift_end)}`,
    shiftStartLabel: formatClock(shift.shift_start),
    shiftEndLabel: formatClock(shift.shift_end),
    dayLabel: dayLabelOf(shift.day_classification),
    elapsedHours,
    workedHours,
    regularHours,
    potentialOvertimeHours,
    approvedOvertimeHours,
    unapprovedExtraHours,
    potentialNdHours,
    breakHours,
    breakIncludedLabel,
    ndHours,
    scheduleLabel,
    scheduledRegularHours,
    overtimeApprovedLabel,
    ndWindowLabel: `${ndStartLabel} – ${ndEndLabel}`,
    timeZone: row.time_zone,
    salaryLabel: rates.salaryLabel,
    dailyRateLabel: rates.dailyRateLabel,
    hourlyRateLabel: rates.hourlyRateLabel,
    lines,
  }
}

function shiftOwnerId(row: unknown): string | null {
  if (!isRecord(row)) {
    return null
  }
  const shiftRows = asRows(row.shifts)
  if (shiftRows === null || shiftRows.length !== 1 || !isRecord(shiftRows[0])) {
    return null
  }
  const employeeId = shiftRows[0].employee_id
  return typeof employeeId === "string" ? employeeId : null
}

async function resolvePeriodRange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sub: string,
  today: string,
): Promise<
  | { status: "error" }
  | { status: "no-period" }
  | { status: "overlap" }
  | { status: "ready"; from: string; to: string }
> {
  const { data: periodRows, error: periodError } = await supabase
    .from("payroll_periods")
    .select("id, period_start, period_end, pay_date, cutoff_date, cutoff_time, active")
    .eq("owner_id", sub)
    .eq("active", true)

  if (periodError) {
    return { status: "error" }
  }

  const periods: PeriodCandidate[] = []
  for (const row of periodRows ?? []) {
    const mapped = mapPeriod(row)
    if (mapped === null) {
      return { status: "error" }
    }
    periods.push(mapped)
  }

  const resolved = resolveCurrentPeriod(periods, today)
  if (resolved.status === "none") {
    return { status: "no-period" }
  }
  if (resolved.status === "overlap") {
    return { status: "overlap" }
  }

  return {
    status: "ready",
    from: resolved.period.periodStart,
    to: resolved.period.periodEnd,
  }
}

export async function loadRecords(params: {
  range?: string
  from?: string
  to?: string
  page?: string
  sort?: string
}): Promise<RecordsListResult> {
  const supabase = await createClient()
  const { data: claimData } = await getRequestClaims()
  const sub = claimData?.claims?.sub
  if (typeof sub !== "string" || sub.length === 0) {
    return { status: "signed-out" }
  }

  const today = DateTime.now().setZone(MANILA).toISODate()
  if (today === null) {
    return { status: "error" }
  }

  const parsed: ParsedRecordFilter = parseRecordFilter(params, today)
  if (parsed.status === "invalid") {
    return { status: "invalid", message: parsed.message }
  }
  if (parsed.status === "custom-pending") {
    return parsed
  }

  const parsedPage = parseRecordPage(params.page)
  if (parsedPage.status === "invalid") {
    return parsedPage
  }
  const parsedSort = parseRecordSort(params.sort)
  if (parsedSort.status === "invalid") {
    return parsedSort
  }

  let range: "week" | "month" | "custom" | "period"
  let from: string
  let to: string

  if (parsed.status === "period") {
    const period = await resolvePeriodRange(supabase, sub, today)
    if (period.status !== "ready") {
      return period
    }
    range = "period"
    from = period.from
    to = period.to
  } else {
    range = parsed.range
    from = parsed.from
    to = parsed.to
  }

  const window = paginationWindow(parsedPage.page)
  const ascending = parsedSort.sort === "oldest"
  const { data: shiftRows, error: shiftError, count } = await supabase
    .from("shifts")
    .select(SHIFT_SELECT, { count: "exact" })
    .eq("employee_id", sub)
    .gte("work_date", from)
    .lte("work_date", to)
    .order("work_date", { ascending })
    .order("shift_start", { ascending })
    .order("id", { ascending })
    .range(window.from, window.to)

  if (shiftError || count === null) {
    return { status: "error" }
  }

  const rows = mapRecordListRows(shiftRows ?? [])
  if (rows === null) {
    return { status: "error" }
  }


  const totalPages = Math.max(1, Math.ceil(count / RECORDS_PAGE_SIZE))
  if (count > 0 && parsedPage.page > totalPages) {
    return { status: "invalid", message: "That records page is not available." }
  }

  return {
    status: "ready",
    range,
    from,
    to,
    page: parsedPage.page,
    pageSize: RECORDS_PAGE_SIZE,
    totalCount: count,
    totalPages,
    sort: parsedSort.sort,
    rows,
  }
}

export async function loadRecordDetail(id: string): Promise<RecordDetailResult> {
  const supabase = await createClient()
  const { data: claimData } = await getRequestClaims()
  const sub = claimData?.claims?.sub
  if (typeof sub !== "string" || sub.length === 0) {
    return { status: "signed-out" }
  }

  if (!isUuid(id.trim())) {
    return { status: "unavailable" }
  }

  const { data, error } = await supabase
    .from("nd_records")
    .select(DETAIL_SELECT)
    .eq("id", id.trim())
    .eq("shifts.employee_id", sub)
    .maybeSingle()

  if (error) {
    return { status: "error" }
  }
  if (data == null) {
    return { status: "unavailable" }
  }

  const ownerId = shiftOwnerId(data)
  if (ownerId !== sub) {
    return ownerId === null ? { status: "error" } : { status: "unavailable" }
  }

  const detail = mapRecordDetail(data)
  if (detail === null) {
    return { status: "error" }
  }

  return { status: "ready", detail }
}
