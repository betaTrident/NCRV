import Decimal from "decimal.js"

import type { DayClassification, HoursCategory, WageTypeRule } from "@/engine/types"
import { createClient, getRequestClaims } from "@/lib/supabase/server"
import { DAY_CLASSIFICATIONS, type ShiftProfile } from "@/server/shift/parse-shift-entry"

type ShiftConfiguration = ShiftProfile & { rules: WageTypeRule[] }

type EmployeeSettingsRow = {
  monthly_basic_salary: string | number | null
  time_zone: string
  nd_start: string
  nd_end: string
  break_hours: string | number
}

type WageTypeRow = {
  id: string
  code: string
  category: string
  hours_category: string
  percentage: string | number
  is_nd: boolean
  description: string
}

function isDayClassification(value: string): value is DayClassification {
  return (DAY_CLASSIFICATIONS as readonly string[]).includes(value)
}

function isHoursCategory(value: string): value is HoursCategory {
  return value === "FIRST_8" || value === "EXCESS"
}

function stableDecimalString(value: string | number, places?: number): string {
  const parsed = new Decimal(value)
  return places === undefined ? parsed.toFixed() : parsed.toFixed(places)
}

function clockTime(value: string): string {
  const match = /^(\d{2}:\d{2})/.exec(value)
  return match?.[1] ?? value
}

function mapRule(row: WageTypeRow): WageTypeRule | null {
  if (!isDayClassification(row.category) || !isHoursCategory(row.hours_category)) {
    return null
  }

  return {
    id: row.id,
    code: row.code,
    category: row.category,
    hoursCategory: row.hours_category,
    percentage: stableDecimalString(row.percentage),
    isNd: row.is_nd,
    description: row.description,
  }
}

async function loadShiftConfiguration(): Promise<ShiftConfiguration | null> {
  const supabase = await createClient()
  const { data: claimData } = await getRequestClaims()
  const userId = claimData?.claims?.sub
  if (typeof userId !== "string" || userId.length === 0) {
    return null
  }

  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("monthly_basic_salary, time_zone, nd_start, nd_end, break_hours")
    .eq("id", userId)
    .maybeSingle()

  if (employeeError || !employee) {
    return null
  }

  const { data: wageTypes, error: wageError } = await supabase
    .from("wage_types")
    .select("id, code, category, hours_category, percentage, is_nd, description")
    .eq("active", true)
    .eq("is_nd", true)

  if (wageError) {
    return null
  }

  try {
    const row = employee as EmployeeSettingsRow
    const rules = ((wageTypes ?? []) as WageTypeRow[])
      .map(mapRule)
      .filter((rule): rule is WageTypeRule => rule !== null)

    return {
      monthlyBasicSalary:
        row.monthly_basic_salary === null
          ? null
          : stableDecimalString(row.monthly_basic_salary, 2),
      timeZone: row.time_zone,
      ndStart: clockTime(row.nd_start),
      ndEnd: clockTime(row.nd_end),
      breakHours: stableDecimalString(row.break_hours, 2),
      rules,
    }
  } catch {
    return null
  }
}

export { loadShiftConfiguration }
export type { ShiftConfiguration }
