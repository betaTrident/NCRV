import Decimal from "decimal.js"
import * as z from "zod"

const SCHEDULE_TYPES = ["STANDARD", "APPROVED_CWW"] as const

type ScheduleType = (typeof SCHEDULE_TYPES)[number]

type ProfileDraft = {
  name: string
  monthlyBasicSalary: string | null
  workScheduleType: ScheduleType
  scheduledRegularHours: string
}

type ComputationDraft = {
  ndStart: string
  ndEnd: string
  breakHours: string
}

type ProfileFieldErrors = {
  name?: string
  monthlyBasicSalary?: string
  workScheduleType?: string
  scheduledRegularHours?: string
}

type ComputationFieldErrors = {
  ndStart?: string
  ndEnd?: string
  breakHours?: string
}

const PROFILE_FIELDS = [
  "name",
  "monthlyBasicSalary",
  "workScheduleType",
  "scheduledRegularHours",
] as const

const COMPUTATION_FIELDS = ["ndStart", "ndEnd", "breakHours"] as const

function normalizeClock(value: string): string {
  const trimmed = value.trim()
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(trimmed)
  return match ? `${match[1]}:${match[2]}` : trimmed
}

const clockTimeSchema = z
  .string()
  .transform(normalizeClock)
  .refine((value) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value), "Enter a valid time.")

const monthlyBasicSalarySchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value),
    "Enter a non-negative amount with at most two decimal places.",
  )
  .transform((value) => (value === "" ? null : new Decimal(value).toFixed(2)))

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

function isAllowedBreak(value: string): boolean {
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return false
  }
  try {
    return !new Decimal(value).greaterThan("99.99")
  } catch {
    return false
  }
}

const profileSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name."),
    monthlyBasicSalary: monthlyBasicSalarySchema,
    workScheduleType: z.enum(SCHEDULE_TYPES, "Choose a schedule type."),
    scheduledRegularHours: z.string().trim(),
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

    if (value.workScheduleType === "STANDARD" && !hours.equals(8)) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledRegularHours"],
        message: "Standard schedules use exactly 8 hours.",
      })
    }

    if (
      value.workScheduleType === "APPROVED_CWW" &&
      (hours.lessThan(8) || hours.greaterThan(12))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledRegularHours"],
        message: "Enter 8 through 12 hours.",
      })
    }
  })

const computationSchema = z.object({
  ndStart: clockTimeSchema,
  ndEnd: clockTimeSchema,
  breakHours: z
    .string()
    .trim()
    .refine(isAllowedBreak, "Enter a break from 0 through 99.99 hours.")
    .transform((value) => new Decimal(value).toFixed(2)),
})

function knownFields(
  input: Record<string, string>,
  keys: readonly string[],
): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const key of keys) {
    fields[key] = input[key] ?? ""
  }
  return fields
}

function fieldErrorsFromZod<K extends string>(
  error: z.ZodError,
  allowedKeys: readonly K[],
): Partial<Record<K, string>> {
  const fieldErrors: Partial<Record<K, string>> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key !== "string" || !allowedKeys.includes(key as K)) {
      continue
    }
    const typedKey = key as K
    if (!fieldErrors[typedKey]) {
      fieldErrors[typedKey] = issue.message
    }
  }
  return fieldErrors
}

function parseProfile(
  input: Record<string, string>,
): { ok: true; value: ProfileDraft } | { ok: false; fieldErrors: ProfileFieldErrors } {
  const parsed = profileSchema.safeParse(knownFields(input, PROFILE_FIELDS))
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFromZod(parsed.error, PROFILE_FIELDS),
    }
  }

  return {
    ok: true,
    value: {
      name: parsed.data.name,
      monthlyBasicSalary: parsed.data.monthlyBasicSalary,
      workScheduleType: parsed.data.workScheduleType,
      scheduledRegularHours: new Decimal(parsed.data.scheduledRegularHours).toFixed(2),
    },
  }
}

function parseComputation(
  input: Record<string, string>,
):
  | { ok: true; value: ComputationDraft }
  | { ok: false; fieldErrors: ComputationFieldErrors } {
  const parsed = computationSchema.safeParse(knownFields(input, COMPUTATION_FIELDS))
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: fieldErrorsFromZod(parsed.error, COMPUTATION_FIELDS),
    }
  }

  return { ok: true, value: parsed.data }
}

export { parseComputation, parseProfile, SCHEDULE_TYPES }
export type {
  ComputationDraft,
  ComputationFieldErrors,
  ProfileDraft,
  ProfileFieldErrors,
  ScheduleType,
}
