import { DateTime } from "luxon"
import * as z from "zod"

const HOLIDAY_TYPES = ["REGULAR_PUBLIC_HOLIDAY", "SPECIAL_PUBLIC_HOLIDAY"] as const

type HolidayType = (typeof HOLIDAY_TYPES)[number]

type HolidayDraft = {
  holidayDate: string
  name: string
  holidayType: HolidayType
  year: number
}

type PayrollPeriodDraft = {
  periodStart: string
  periodEnd: string
  payDate: string | null
  cutoffDate: string | null
  cutoffTime: string | null
}

type CalendarFieldErrors = {
  holidayDate?: string
  name?: string
  holidayType?: string
  periodStart?: string
  periodEnd?: string
  payDate?: string
  cutoffDate?: string
  cutoffTime?: string
}

const HOLIDAY_FORM_FIELDS = ["holidayDate", "name", "holidayType"] as const
const PERIOD_FORM_FIELDS = [
  "periodStart",
  "periodEnd",
  "payDate",
  "cutoffDate",
  "cutoffTime",
] as const
const CALENDAR_FIELD_KEYS = [
  "holidayDate",
  "name",
  "holidayType",
  "periodStart",
  "periodEnd",
  "payDate",
  "cutoffDate",
  "cutoffTime",
] as const

const CUTOFF_TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

function isCalendarDate(value: string): boolean {
  const parsed = DateTime.fromISO(value, { zone: "utc" })
  return parsed.isValid && parsed.toISODate() === value
}

function knownFields(
  input: Record<string, string>,
  keys: readonly string[],
): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const key of keys) {
    const value = input[key]
    fields[key] = typeof value === "string" ? value : ""
  }
  return fields
}

function isCalendarField(key: unknown): key is (typeof CALENDAR_FIELD_KEYS)[number] {
  return (
    typeof key === "string" &&
    (CALENDAR_FIELD_KEYS as readonly string[]).includes(key)
  )
}

function fieldErrorsFromZod(error: z.ZodError): CalendarFieldErrors {
  const fieldErrors: CalendarFieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (!isCalendarField(key) || fieldErrors[key]) {
      continue
    }
    fieldErrors[key] = issue.message
  }
  return fieldErrors
}

const optionalCalendarDate = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || isCalendarDate(value), "Enter a valid date.")

function normalizeClock(value: string): string {
  const trimmed = value.trim()
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(trimmed)
  return match ? `${match[1]}:${match[2]}` : trimmed
}

const optionalCutoffTime = z
  .string()
  .transform(normalizeClock)
  .transform((value) => (value === "" ? null : value))
  .refine((value) => value === null || CUTOFF_TIME_RE.test(value), "Enter a valid time.")

const holidaySchema = z.object({
  holidayDate: z.string().trim().refine(isCalendarDate, "Enter a valid date."),
  name: z.string().trim().min(1, "Enter a name."),
  holidayType: z.enum(HOLIDAY_TYPES, "Choose a holiday type."),
})

const payrollPeriodSchema = z
  .object({
    periodStart: z.string().trim().refine(isCalendarDate, "Enter a valid date."),
    periodEnd: z.string().trim().refine(isCalendarDate, "Enter a valid date."),
    payDate: optionalCalendarDate,
    cutoffDate: optionalCalendarDate,
    cutoffTime: optionalCutoffTime,
  })
  .superRefine((value, ctx) => {
    if (!isCalendarDate(value.periodStart) || !isCalendarDate(value.periodEnd)) {
      return
    }
    if (value.periodEnd < value.periodStart) {
      ctx.addIssue({
        code: "custom",
        path: ["periodEnd"],
        message: "Period end must be on or after the start.",
      })
    }
  })

function parseHoliday(
  input: Record<string, string>,
): { ok: true; value: HolidayDraft } | { ok: false; fieldErrors: CalendarFieldErrors } {
  const parsed = holidaySchema.safeParse(knownFields(input, HOLIDAY_FORM_FIELDS))
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) }
  }

  const year = DateTime.fromISO(parsed.data.holidayDate, { zone: "utc" }).year
  return {
    ok: true,
    value: {
      holidayDate: parsed.data.holidayDate,
      name: parsed.data.name,
      holidayType: parsed.data.holidayType,
      year,
    },
  }
}

function parsePayrollPeriod(
  input: Record<string, string>,
): { ok: true; value: PayrollPeriodDraft } | { ok: false; fieldErrors: CalendarFieldErrors } {
  const parsed = payrollPeriodSchema.safeParse(knownFields(input, PERIOD_FORM_FIELDS))
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrorsFromZod(parsed.error) }
  }

  return { ok: true, value: parsed.data }
}

export { HOLIDAY_TYPES, parseHoliday, parsePayrollPeriod }
export type { CalendarFieldErrors, HolidayDraft, HolidayType, PayrollPeriodDraft }
