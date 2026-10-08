import Decimal from "decimal.js"
import { DateTime } from "luxon"

import type {
  AmountLine,
  HoursCategory,
  NdResult,
  RateBasis,
  ShiftInput,
  WageTypeRule,
} from "./types"

const ANNUAL_MONTHS = new Decimal(12)
const WORKDAYS_FACTOR = new Decimal(261)
const RATE_HOURS_PER_DAY = new Decimal(8)
const MAX_CWW_HOURS = new Decimal(12)
const MILLIS_PER_HOUR = new Decimal(3_600_000)

function decimalInput(name: string, value: string): Decimal {
  let parsed: Decimal

  try {
    parsed = new Decimal(value)
  } catch {
    throw new Error(`${name} must be a decimal number.`)
  }

  if (!parsed.isFinite() || parsed.isNegative()) {
    throw new Error(`${name} must be zero or greater.`)
  }

  return parsed
}

function fixedHours(value: Decimal): string {
  return value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2)
}

function normalizeShift(input: ShiftInput): { start: DateTime; end: DateTime } {
  const start = DateTime.fromISO(input.shiftStart, { zone: input.timeZone })
  let end = DateTime.fromISO(input.shiftEnd, { zone: input.timeZone })

  if (!start.isValid || !end.isValid) {
    throw new Error("Shift start and end must be valid local date-times.")
  }

  if (end.toMillis() <= start.toMillis()) {
    end = end.plus({ days: 1 })
  }

  return { start, end }
}

function buildNdWindow(
  input: ShiftInput,
  windowDate: string,
): { start: DateTime; end: DateTime } {
  const start = DateTime.fromISO(`${windowDate}T${input.ndStart}`, {
    zone: input.timeZone,
  })
  let end = DateTime.fromISO(`${windowDate}T${input.ndEnd}`, {
    zone: input.timeZone,
  })

  if (!start.isValid || !end.isValid) {
    throw new Error("The work date and ND window must be valid.")
  }

  if (end.toMillis() <= start.toMillis()) {
    end = end.plus({ days: 1 })
  }

  return { start, end }
}

function durationHours(startMillis: number, endMillis: number): Decimal {
  return Decimal.max(0, new Decimal(endMillis).minus(startMillis).div(MILLIS_PER_HOUR))
}

function ndOverlapHours(
  input: ShiftInput,
  shift: { start: DateTime; end: DateTime },
): Decimal {
  const overlaps: Array<{ startMillis: number; endMillis: number }> = []
  let windowDate = shift.start.startOf("day").minus({ days: 1 })
  const lastWindowDate = shift.end.startOf("day")

  while (windowDate.toMillis() <= lastWindowDate.toMillis()) {
    const isoDate = windowDate.toISODate()
    if (isoDate === null) {
      throw new Error("The shift dates must be valid.")
    }

    const window = buildNdWindow(input, isoDate)
    const startMillis = Math.max(shift.start.toMillis(), window.start.toMillis())
    const endMillis = Math.min(shift.end.toMillis(), window.end.toMillis())

    if (endMillis > startMillis) {
      overlaps.push({ startMillis, endMillis })
    }

    windowDate = windowDate.plus({ days: 1 })
  }

  if (overlaps.length === 0) {
    return new Decimal(0)
  }

  overlaps.sort((left, right) => left.startMillis - right.startMillis)
  let totalMillis = new Decimal(0)
  let mergedStart = overlaps[0].startMillis
  let mergedEnd = overlaps[0].endMillis

  for (const overlap of overlaps.slice(1)) {
    if (overlap.startMillis <= mergedEnd) {
      mergedEnd = Math.max(mergedEnd, overlap.endMillis)
      continue
    }

    totalMillis = totalMillis.plus(mergedEnd - mergedStart)
    mergedStart = overlap.startMillis
    mergedEnd = overlap.endMillis
  }

  return totalMillis.plus(mergedEnd - mergedStart).div(MILLIS_PER_HOUR)
}

function deriveRateBasis(monthlyBasicSalary: string | null): {
  snapshot: RateBasis | null
  hourlyRate: Decimal | null
} {
  if (monthlyBasicSalary === null || monthlyBasicSalary.trim() === "") {
    return { snapshot: null, hourlyRate: null }
  }

  const salary = decimalInput("Monthly basic salary", monthlyBasicSalary)
  const dailyRate = salary.times(ANNUAL_MONTHS).div(WORKDAYS_FACTOR)
  const hourlyRate = dailyRate.div(RATE_HOURS_PER_DAY)
  const displayedHourlyRate = hourlyRate.toDecimalPlaces(8, Decimal.ROUND_HALF_UP)

  return {
    snapshot: {
      monthlyBasicSalary: salary.toFixed(2),
      annualMonths: "12",
      workdaysFactor: "261",
      rateHoursPerDay: "8",
      dailyRate: dailyRate.toDecimalPlaces(8, Decimal.ROUND_HALF_UP).toFixed(8),
      hourlyRate: displayedHourlyRate.toFixed(8),
    },
    hourlyRate,
  }
}

function tbdLine(rule: WageTypeRule, reason: string, hours: string | null): AmountLine {
  return {
    status: "tbd",
    code: rule.code,
    hours,
    percentage: rule.percentage,
    reason,
  }
}

export function calculateNd(input: ShiftInput, rules: WageTypeRule[]): NdResult {
  const breakHours = decimalInput("Break hours", input.breakHours)
  const scheduledRegularHours = decimalInput(
    "Scheduled regular hours",
    input.scheduledRegularHours,
  )

  if (input.scheduleType === "STANDARD" && !scheduledRegularHours.equals(8)) {
    throw new Error("A standard schedule must use an 8-hour regular-duty threshold.")
  }

  if (
    input.scheduleType === "APPROVED_CWW" &&
    (scheduledRegularHours.lessThan(8) || scheduledRegularHours.greaterThan(MAX_CWW_HOURS))
  ) {
    throw new Error("An approved CWW threshold must be between 8 and 12 hours.")
  }

  const shift = normalizeShift(input)
  const elapsedHours = durationHours(shift.start.toMillis(), shift.end.toMillis())
  const workedHours = Decimal.max(0, elapsedHours.minus(breakHours))
  const regularHours = Decimal.min(workedHours, scheduledRegularHours)
  const potentialOvertimeHours = Decimal.max(0, workedHours.minus(scheduledRegularHours))
  const approvedOvertimeHours = input.overtimeApproved
    ? potentialOvertimeHours
    : new Decimal(0)
  const unapprovedExtraHours = input.overtimeApproved
    ? new Decimal(0)
    : potentialOvertimeHours

  const potentialNdHours = ndOverlapHours(input, shift)
  const ndHours = input.breakIncludedInNd
    ? potentialNdHours
    : Decimal.max(0, potentialNdHours.minus(breakHours))

  const { snapshot: rateBasis, hourlyRate } = deriveRateBasis(input.monthlyBasicSalary)
  const unresolved: string[] = []

  if (unapprovedExtraHours.greaterThan(0)) {
    unresolved.push("Extra worked time was not recorded as agreed or approved overtime.")
  }

  if (approvedOvertimeHours.greaterThan(0)) {
    unresolved.push(
      "ND allocation between regular and overtime hours is not confirmed without a break timestamp.",
    )
  }

  const cwwBeyondEight =
    input.scheduleType === "APPROVED_CWW" && regularHours.greaterThan(8)
  if (cwwBeyondEight) {
    unresolved.push(
      "The ADP wage type for approved CWW regular hours beyond eight is not confirmed.",
    )
  }

  const hoursCategories: HoursCategory[] = ["FIRST_8"]
  if (approvedOvertimeHours.greaterThan(0)) {
    hoursCategories.push("EXCESS")
  }

  const matchingRules =
    ndHours.isZero()
      ? []
      : rules.filter(
          (rule) =>
            rule.isNd &&
            rule.category === input.dayClassification &&
            hoursCategories.includes(rule.hoursCategory),
        )

  if (ndHours.greaterThan(0) && matchingRules.length === 0) {
    unresolved.push("No configured ND wage type rule matches this shift.")
  }

  const shiftHasUnallocatableNd =
    potentialOvertimeHours.greaterThan(0) || cwwBeyondEight

  const lines = matchingRules.map<AmountLine>((rule) => {
    if (rule.hoursCategory === "EXCESS") {
      return tbdLine(
        rule,
        "ND allocation between regular and overtime hours is not confirmed without a break timestamp.",
        null,
      )
    }

    if (shiftHasUnallocatableNd) {
      const reason = cwwBeyondEight
        ? "The ADP wage type for approved CWW regular hours beyond eight is not confirmed."
        : "ND allocation is not confirmed for a shift containing extra worked time."
      return tbdLine(rule, reason, null)
    }

    if (rule.code !== "2211" || !new Decimal(rule.percentage).equals(10)) {
      return tbdLine(
        rule,
        "Money formula is not confirmed for this wage type.",
        fixedHours(ndHours),
      )
    }

    if (hourlyRate === null) {
      return tbdLine(
        rule,
        "Monthly basic salary is required to derive the factor-261 hourly rate.",
        fixedHours(ndHours),
      )
    }

    const centavos = hourlyRate
      .times(ndHours)
      .times(new Decimal("0.10"))
      .times(100)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber()

    return {
      status: "estimated",
      code: rule.code,
      hours: fixedHours(ndHours),
      percentage: rule.percentage,
      centavos,
      formula: "ordinary_nd_10_percent",
    }
  })

  return {
    rateBasis,
    elapsedHours: fixedHours(elapsedHours),
    workedHours: fixedHours(workedHours),
    scheduledRegularHours: fixedHours(scheduledRegularHours),
    regularHours: fixedHours(regularHours),
    potentialOvertimeHours: fixedHours(potentialOvertimeHours),
    approvedOvertimeHours: fixedHours(approvedOvertimeHours),
    unapprovedExtraHours: fixedHours(unapprovedExtraHours),
    potentialNdHours: fixedHours(potentialNdHours),
    breakHours: fixedHours(breakHours),
    breakIncludedInNd: input.breakIncludedInNd,
    ndHours: fixedHours(ndHours),
    dayClassification: input.dayClassification,
    hoursCategories,
    lines,
    unresolved,
  }
}
