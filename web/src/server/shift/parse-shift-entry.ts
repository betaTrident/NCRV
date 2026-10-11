import Decimal from "decimal.js"
import { DateTime } from "luxon"
import * as z from "zod"

import type { DayClassification, ShiftInput, WorkScheduleType } from "../../engine/types"

const DAY_CLASSIFICATIONS = [
  "REGULAR_WORK_DAY",
  "REST_DAY",
  "SPECIAL_PUBLIC_HOLIDAY",
  "SPECIAL_PUBLIC_HOLIDAY_REST_DAY",
  "REGULAR_PUBLIC_HOLIDAY",
  "REGULAR_PUBLIC_HOLIDAY_REST_DAY",
  "DOUBLE_REGULAR_HOLIDAY",
  "DOUBLE_REGULAR_HOLIDAY_REST_DAY",
] as const satisfies readonly DayClassification[]

const SCHEDULE_TYPES = ["STANDARD", "APPROVED_CWW"] as const satisfies readonly WorkScheduleType[]

const SHIFT_FORM_FIELDS = [
  "workDate",
  "shiftStart",
  "shiftEnd",
  "dayClassification",
  "breakIncludedInNd",
  "scheduleType",
  "scheduledRegularHours",
  "overtimeApproved",
] as const

const clockTimeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time.")

function isCalendarDate(value: string): boolean {
  const parsed = DateTime.fromISO(value, { zone: "utc" })
  return parsed.isValid && parsed.toISODate() === value
}

function parseHours(value: string): Decimal | null {
  try {
    const parsed = new Decimal(value)
    if (!parsed.isFinite() || parsed.isNegative()) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

const shiftEntrySchema = z
  .object({
    workDate: z
      .string()
      .trim()
      .refine(isCalendarDate, "Enter a valid work date."),
    shiftStart: clockTimeSchema,
    shiftEnd: clockTimeSchema,
    dayClassification: z.enum(DAY_CLASSIFICATIONS, "Choose a day classification."),
    breakIncludedInNd: z
      .enum(["true", "false"], "Choose whether the break is included.")
      .transform((value) => value === "true"),
    scheduleType: z.enum(SCHEDULE_TYPES, "Choose a schedule type."),
    scheduledRegularHours: z.string().trim().min(1, "Enter the scheduled regular hours."),
    overtimeApproved: z
      .enum(["true", "false"], "Choose whether overtime was agreed or approved.")
      .transform((value) => value === "true"),
  })
  .superRefine((value, ctx) => {
    const hours = parseHours(value.scheduledRegularHours)
    if (hours === null) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledRegularHours"],
        message: "Enter the scheduled regular hours as a decimal number.",
      })
      return
    }

    if (value.scheduleType === "STANDARD" && !hours.equals(8)) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledRegularHours"],
        message: "A standard schedule must use 8 regular hours.",
      })
    }

    if (
      value.scheduleType === "APPROVED_CWW" &&
      (hours.lessThan(8) || hours.greaterThan(12))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledRegularHours"],
        message: "Approved CWW hours must be between 8 and 12.",
      })
    }
  })

type ParsedShiftEntry = z.output<typeof shiftEntrySchema>

type ShiftFieldErrors = {
  workDate?: string
  shiftStart?: string
  shiftEnd?: string
  dayClassification?: string
  breakIncludedInNd?: string
  scheduleType?: string
  scheduledRegularHours?: string
  overtimeApproved?: string
}

type ShiftProfile = {
  monthlyBasicSalary: string | null
  timeZone: string
  ndStart: string
  ndEnd: string
  breakHours: string
}

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function knownShiftFields(input: FormData | Record<string, unknown>) {
  if (input instanceof FormData) {
    const fields: Record<(typeof SHIFT_FORM_FIELDS)[number], string> = {
      workDate: readFormString(input, "workDate"),
      shiftStart: readFormString(input, "shiftStart"),
      shiftEnd: readFormString(input, "shiftEnd"),
      dayClassification: readFormString(input, "dayClassification"),
      breakIncludedInNd: readFormString(input, "breakIncludedInNd"),
      scheduleType: readFormString(input, "scheduleType"),
      scheduledRegularHours: readFormString(input, "scheduledRegularHours"),
      overtimeApproved: readFormString(input, "overtimeApproved"),
    }
    return fields
  }

  const fields: Record<string, unknown> = {}
  for (const key of SHIFT_FORM_FIELDS) {
    fields[key] = input[key]
  }
  return fields
}

function fieldErrorsFromZod(error: z.ZodError): ShiftFieldErrors {
  const fieldErrors: ShiftFieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (
      key !== "workDate" &&
      key !== "shiftStart" &&
      key !== "shiftEnd" &&
      key !== "dayClassification" &&
      key !== "breakIncludedInNd" &&
      key !== "scheduleType" &&
      key !== "scheduledRegularHours" &&
      key !== "overtimeApproved"
    ) {
      continue
    }
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message
    }
  }
  return fieldErrors
}

function parseShiftEntry(input: unknown) {
  const raw =
    input instanceof FormData || (typeof input === "object" && input !== null)
      ? knownShiftFields(input as FormData | Record<string, unknown>)
      : input

  const parsed = shiftEntrySchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false as const,
      fieldErrors: fieldErrorsFromZod(parsed.error),
    }
  }

  return {
    success: true as const,
    data: parsed.data,
  }
}

function buildShiftInput(parsed: ParsedShiftEntry, profile: ShiftProfile): ShiftInput {
  return {
    workDate: parsed.workDate,
    shiftStart: `${parsed.workDate}T${parsed.shiftStart}:00`,
    shiftEnd: `${parsed.workDate}T${parsed.shiftEnd}:00`,
    dayClassification: parsed.dayClassification,
    monthlyBasicSalary: profile.monthlyBasicSalary,
    timeZone: profile.timeZone,
    ndStart: profile.ndStart,
    ndEnd: profile.ndEnd,
    breakHours: profile.breakHours,
    breakIncludedInNd: parsed.breakIncludedInNd,
    scheduleType: parsed.scheduleType,
    scheduledRegularHours: parsed.scheduledRegularHours,
    overtimeApproved: parsed.overtimeApproved,
  }
}

export { buildShiftInput, DAY_CLASSIFICATIONS, parseShiftEntry }
export type { ParsedShiftEntry, ShiftFieldErrors, ShiftProfile }
