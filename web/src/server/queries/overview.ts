import Decimal from "decimal.js"
import { DateTime } from "luxon"

import { formatPhp } from "@/lib/format"
import {
  recordAmount,
  resolveCurrentPeriod,
  summarizeRecords,
  type PeriodCandidate,
  type PeriodSummary,
  type SummaryLine,
  type SummaryRecord,
} from "@/lib/record-summary"
import { createClient, getRequestClaims } from "@/lib/supabase/server"

const MANILA = "Asia/Manila"

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

const SHIFT_SELECT = [
  "id",
  "work_date",
  "shift_start",
  "shift_end",
  "day_classification",
  "nd_records(id, nd_hours, nd_wage_type_lines(wage_type_code, amount_status, calculated_amount_centavos))",
].join(", ")

type OverviewLedgerRow = {
  id: string
  workDate: string
  shiftLabel: string
  dayLabel: string
  ndHours: string
  wageCodes: string
  amountLabel: string
}

type OverviewResult =
  | { status: "signed-out" }
  | { status: "error" }
  | { status: "no-period" }
  | { status: "overlap" }
  | {
      status: "ready"
      period: {
        periodStart: string
        periodEnd: string
        cutoffLabel: string | null
      }
      summary: PeriodSummary
      rows: OverviewLedgerRow[]
    }

type CollectedRecord = {
  record: SummaryRecord
  workDate: string
  shiftStart: string
  shiftEnd: string
  dayClassification: string
  wageCodes: string
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
    return new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2)
  } catch {
    return null
  }
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

function mapLine(row: unknown): { line: SummaryLine; code: string } | null {
  if (!isRecord(row) || typeof row.wage_type_code !== "string") {
    return null
  }
  if (row.amount_status === "tbd") {
    return { line: { amountStatus: "tbd", centavos: null }, code: row.wage_type_code }
  }
  if (row.amount_status === "estimated") {
    return {
      line: {
        amountStatus: "estimated",
        centavos: asSafeInteger(row.calculated_amount_centavos),
      },
      code: row.wage_type_code,
    }
  }
  return null
}

function mapNdRecord(row: unknown): { record: SummaryRecord; wageCodes: string } | null {
  if (!isRecord(row) || typeof row.id !== "string") {
    return null
  }
  const ndHours = asHoursString(row.nd_hours)
  const lineRows = asRows(row.nd_wage_type_lines)
  if (ndHours === null || lineRows === null) {
    return null
  }

  const lines: SummaryLine[] = []
  const codes: string[] = []
  for (const lineRow of lineRows) {
    const mapped = mapLine(lineRow)
    if (mapped === null) {
      return null
    }
    lines.push(mapped.line)
    codes.push(mapped.code)
  }

  return {
    record: { id: row.id, ndHours, lines },
    wageCodes: codes.join(", "),
  }
}

function collectShiftRecords(row: unknown): CollectedRecord[] | null {
  if (!isRecord(row)) {
    return null
  }
  const workDate = dateOnly(row.work_date)
  if (
    workDate === null ||
    typeof row.shift_start !== "string" ||
    typeof row.shift_end !== "string" ||
    typeof row.day_classification !== "string"
  ) {
    return null
  }

  const embeds = asRows(row.nd_records)
  if (embeds === null) {
    return null
  }

  const collected: CollectedRecord[] = []
  for (const embed of embeds) {
    const mapped = mapNdRecord(embed)
    if (mapped === null) {
      return null
    }
    collected.push({
      record: mapped.record,
      workDate,
      shiftStart: row.shift_start,
      shiftEnd: row.shift_end,
      dayClassification: row.day_classification,
      wageCodes: mapped.wageCodes,
    })
  }
  return collected
}

function collectRecords(shiftRows: unknown[]): CollectedRecord[] | null {
  const collected: CollectedRecord[] = []
  for (const row of shiftRows) {
    const mapped = collectShiftRecords(row)
    if (mapped === null) {
      return null
    }
    collected.push(...mapped)
  }
  return collected
}

function formatClock(value: string): string {
  const parsed = DateTime.fromISO(value, { zone: MANILA })
  return parsed.isValid ? parsed.toFormat("h:mm a") : value
}

function formatShiftLabel(shiftStart: string, shiftEnd: string): string {
  return `${formatClock(shiftStart)}–${formatClock(shiftEnd)}`
}

function formatCutoffTime(value: string): string | null {
  const trimmed = value.trim()
  const withSeconds = DateTime.fromFormat(trimmed.slice(0, 8), "HH:mm:ss", { zone: MANILA })
  if (withSeconds.isValid) {
    return withSeconds.toFormat("h:mm a")
  }
  const withMinutes = DateTime.fromFormat(trimmed.slice(0, 5), "HH:mm", { zone: MANILA })
  return withMinutes.isValid ? withMinutes.toFormat("h:mm a") : null
}

function formatCutoffLabel(
  cutoffDate: string | null,
  cutoffTime: string | null,
): string | null {
  if (cutoffDate === null || cutoffDate.length === 0) {
    return null
  }
  const timeLabel = cutoffTime ? formatCutoffTime(cutoffTime) : null
  if (timeLabel) {
    return `Cutoff ${cutoffDate} at ${timeLabel}.`
  }
  return `Cutoff ${cutoffDate}.`
}

function dayLabelOf(value: string): string {
  return DAY_LABELS[value] ?? value
}

function amountLabelOf(record: SummaryRecord): string {
  if (record.lines.length === 0) {
    return "—"
  }

  const { estimatedCentavos, hasTbd } = recordAmount(record)
  const hasEstimatedMoney = record.lines.some(
    (line) =>
      line.amountStatus === "estimated" &&
      line.centavos !== null &&
      Number.isSafeInteger(line.centavos),
  )

  if (!hasEstimatedMoney) {
    return hasTbd ? "TBD" : "—"
  }

  const money = formatPhp(estimatedCentavos)
  return hasTbd ? `${money} · TBD` : money
}

function compareRecent(left: CollectedRecord, right: CollectedRecord): number {
  if (left.workDate !== right.workDate) {
    return left.workDate < right.workDate ? 1 : -1
  }

  const leftStart = DateTime.fromISO(left.shiftStart, { zone: MANILA })
  const rightStart = DateTime.fromISO(right.shiftStart, { zone: MANILA })
  if (leftStart.isValid && rightStart.isValid) {
    return rightStart.toMillis() - leftStart.toMillis()
  }
  if (left.shiftStart === right.shiftStart) {
    return 0
  }
  return left.shiftStart < right.shiftStart ? 1 : -1
}

function toLedgerRow(item: CollectedRecord): OverviewLedgerRow {
  return {
    id: item.record.id,
    workDate: item.workDate,
    shiftLabel: formatShiftLabel(item.shiftStart, item.shiftEnd),
    dayLabel: dayLabelOf(item.dayClassification),
    ndHours: item.record.ndHours,
    wageCodes: item.wageCodes,
    amountLabel: amountLabelOf(item.record),
  }
}

async function loadOverview(): Promise<OverviewResult> {
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

  const { data: shiftRows, error: shiftError } = await supabase
    .from("shifts")
    .select(SHIFT_SELECT)
    .eq("employee_id", sub)
    .gte("work_date", resolved.period.periodStart)
    .lte("work_date", resolved.period.periodEnd)

  if (shiftError) {
    return { status: "error" }
  }

  const collected = collectRecords(shiftRows ?? [])
  if (collected === null) {
    return { status: "error" }
  }

  return {
    status: "ready",
    period: {
      periodStart: resolved.period.periodStart,
      periodEnd: resolved.period.periodEnd,
      cutoffLabel: formatCutoffLabel(
        resolved.period.cutoffDate,
        resolved.period.cutoffTime,
      ),
    },
    summary: summarizeRecords(collected.map((item) => item.record)),
    rows: [...collected].sort(compareRecent).slice(0, 8).map(toLedgerRow),
  }
}

export { loadOverview }
export type { OverviewLedgerRow, OverviewResult }
