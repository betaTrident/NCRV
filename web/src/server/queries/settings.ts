import Decimal from "decimal.js"

import { createClient, getRequestClaims } from "@/lib/supabase/server"
import { displayedHourlyRate } from "@/server/settings/display-rate"
import {
  SCHEDULE_TYPES,
  type ScheduleType,
} from "@/server/settings/parse-settings"

const EMPLOYEE_SELECT =
  "name, email, monthly_basic_salary, work_schedule_type, scheduled_regular_hours, nd_start, nd_end, break_hours"

const WAGE_SELECT =
  "id, code, category, hours_category, percentage, description, active, is_nd"

type ProfileValues = {
  name: string
  email: string
  monthlyBasicSalary: string
  workScheduleType: ScheduleType
  scheduledRegularHours: string
  displayedHourlyRate: string | null
}

type ComputationValues = {
  ndStart: string
  ndEnd: string
  breakHours: string
}

type CodeSource = { file: string; page: number; rows: { code: string; category: string; hours: string; percentage: string }[] }

type WageCatalogRow = {
  isNd: boolean
  id: string
  code: string
  category: string
  hoursCategory: string
  percentage: string
  description: string
  active: boolean
  formulaLabel: "Confirmed 10% estimate" | "Formula TBD"
}

type SettingsPageData =
  | {
      status: "ready"
      profile: ProfileValues
      computation: ComputationValues
      wages: WageCatalogRow[]
      codeSource: CodeSource | null
    }
  | { status: "needs-profile"; email: string; wages: WageCatalogRow[]; codeSource: CodeSource | null }
  | { status: "unavailable" }
  | { status: "signed-out" }

type EmployeeSettingsRow = {
  name: string
  email: string
  monthly_basic_salary: string | number | null
  work_schedule_type: string
  scheduled_regular_hours: string | number
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
  description: string
  active: boolean
  is_nd: boolean
}

function isScheduleType(value: string): value is ScheduleType {
  return (SCHEDULE_TYPES as readonly string[]).includes(value)
}

function stableDecimalString(value: string | number, places: number): string {
  return new Decimal(value).toFixed(places)
}

function clockTime(value: string): string {
  const match = /^(\d{2}:\d{2})/.exec(value)
  return match?.[1] ?? value
}

function salaryFields(value: string | number | null): {
  monthlyBasicSalary: string
  rateInput: string | null
} {
  if (value === null || (typeof value === "string" && value.trim() === "")) {
    return { monthlyBasicSalary: "", rateInput: null }
  }
  const monthlyBasicSalary = stableDecimalString(value, 2)
  return { monthlyBasicSalary, rateInput: monthlyBasicSalary }
}

function mapWageRow(row: WageTypeRow): WageCatalogRow {
  return {
    isNd: row.is_nd,
    id: row.id,
    code: row.code,
    category: row.category,
    hoursCategory: row.hours_category,
    percentage: new Decimal(row.percentage).toFixed(2),
    description: row.description,
    active: row.active,
    formulaLabel: row.active && row.is_nd && row.code === "2211" && row.category === "REGULAR_WORK_DAY" && row.hours_category === "FIRST_8" && new Decimal(row.percentage).equals(10) ? "Confirmed 10% estimate" : "Formula TBD",
  }
}

async function loadSettings(): Promise<SettingsPageData> {
  const { data: claimData } = await getRequestClaims()
  const sub = claimData?.claims?.sub
  if (typeof sub !== "string" || sub.length === 0) {
    return { status: "signed-out" }
  }

  const supabase = await createClient()
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select(EMPLOYEE_SELECT)
    .eq("id", sub)
    .maybeSingle()

  if (employeeError) {
    return { status: "unavailable" }
  }

  const { data: wageTypes, error: wageError } = await supabase
    .from("wage_types")
    .select(WAGE_SELECT)
    .order("code")
    .order("category")
    .order("hours_category")

  if (wageError) {
    return { status: "unavailable" }
  }

  let wages: WageCatalogRow[]
  try {
    wages = ((wageTypes ?? []) as WageTypeRow[]).map(mapWageRow)
  } catch {
    return { status: "unavailable" }
  }

  const [sourceMeta, sourceRows] = await Promise.all([
    supabase.from("calendar_sources").select("code_file, code_page").eq("id", "ncr-voyix-cebu-2026").maybeSingle(),
    supabase.from("reference_codes").select("code, category, hours_category, percentage").eq("source_id", "ncr-voyix-cebu-2026").order("code"),
  ])
  const codeSource: CodeSource | null = !sourceMeta.error && !sourceRows.error && sourceMeta.data
    ? { file: String(sourceMeta.data.code_file), page: Number(sourceMeta.data.code_page), rows: (sourceRows.data ?? []).map(row => ({code: String(row.code), category: String(row.category), hours: String(row.hours_category), percentage: String(row.percentage)})) }
    : null

  if (!employee) {
    const email = claimData?.claims?.email
    if (typeof email !== "string" || email.length === 0) {
      return { status: "unavailable" }
    }
    return { status: "needs-profile", email, wages, codeSource }
  }

  const row = employee as EmployeeSettingsRow
  if (!isScheduleType(row.work_schedule_type)) {
    return { status: "unavailable" }
  }

  try {
    const salary = salaryFields(row.monthly_basic_salary)
    return {
      status: "ready",
      profile: {
        name: row.name,
        email: row.email,
        monthlyBasicSalary: salary.monthlyBasicSalary,
        workScheduleType: row.work_schedule_type,
        scheduledRegularHours: stableDecimalString(row.scheduled_regular_hours, 2),
        displayedHourlyRate: displayedHourlyRate(salary.rateInput),
      },
      computation: {
        ndStart: clockTime(row.nd_start),
        ndEnd: clockTime(row.nd_end),
        breakHours: stableDecimalString(row.break_hours, 2),
      },
      wages,
      codeSource,
    }
  } catch {
    return { status: "unavailable" }
  }
}

export { loadSettings }
export type {
  CodeSource,
  ComputationValues,
  ProfileValues,
  SettingsPageData,
  WageCatalogRow,
}
