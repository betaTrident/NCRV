"use server"

import { revalidatePath } from "next/cache"

import { createClient, getRequestClaims } from "@/lib/supabase/server"
import {
  parseHoliday,
  parsePayrollPeriod,
  type CalendarFieldErrors,
} from "@/server/calendar/parse-calendar"

type CalendarActionState = {
  fieldErrors: CalendarFieldErrors
  formError?: string
  formNotice?: string
}

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function formRecord(formData: FormData, keys: readonly string[]): Record<string, string> {
  const record: Record<string, string> = {}
  for (const key of keys) {
    record[key] = readFormString(formData, key)
  }
  return record
}

async function signedInSub(): Promise<string | null> {
  const { data: claimData } = await getRequestClaims()
  const sub = claimData?.claims?.sub
  return typeof sub === "string" && sub.length > 0 ? sub : null
}

async function addHoliday(
  prev: CalendarActionState,
  formData: FormData,
): Promise<CalendarActionState> {
  void prev
  const parsed = parseHoliday(
    formRecord(formData, ["holidayDate", "name", "holidayType"]),
  )
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors }
  }

  const sub = await signedInSub()
  if (sub === null) {
    return { fieldErrors: {}, formError: "Sign in to save this." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("holidays").insert({
    owner_id: sub,
    holiday_date: parsed.value.holidayDate,
    name: parsed.value.name,
    holiday_type: parsed.value.holidayType,
    year: parsed.value.year,
    active: true,
  })

  if (error) {
    return { fieldErrors: {}, formError: "Could not save this. Try again." }
  }

  revalidatePath("/calendar")
  revalidatePath("/")
  revalidatePath("/records")
  return { fieldErrors: {}, formNotice: "Saved." }
}

async function addPayrollPeriod(
  prev: CalendarActionState,
  formData: FormData,
): Promise<CalendarActionState> {
  void prev
  const parsed = parsePayrollPeriod(
    formRecord(formData, [
      "periodStart",
      "periodEnd",
      "payDate",
      "cutoffDate",
      "cutoffTime",
    ]),
  )
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors }
  }

  const sub = await signedInSub()
  if (sub === null) {
    return { fieldErrors: {}, formError: "Sign in to save this." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("payroll_periods").insert({
    owner_id: sub,
    period_start: parsed.value.periodStart,
    period_end: parsed.value.periodEnd,
    pay_date: parsed.value.payDate,
    cutoff_date: parsed.value.cutoffDate,
    cutoff_time: parsed.value.cutoffTime,
    active: true,
  })

  if (error) {
    return { fieldErrors: {}, formError: "Could not save this. Try again." }
  }

  revalidatePath("/calendar")
  revalidatePath("/")
  revalidatePath("/records")
  return { fieldErrors: {}, formNotice: "Saved." }
}

export { addHoliday, addPayrollPeriod }
export type { CalendarActionState }


export async function updatePayrollPeriod(_prev: CalendarActionState, formData: FormData): Promise<CalendarActionState> {
  const id = readFormString(formData, "id")
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { fieldErrors: {}, formError: "Choose a saved personal period to edit." }
  }
  const parsed = parsePayrollPeriod(formRecord(formData, ["periodStart", "periodEnd", "payDate", "cutoffDate", "cutoffTime"]))
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors }
  const sub = await signedInSub()
  if (!sub) return { fieldErrors: {}, formError: "Sign in to save this." }
  const supabase = await createClient()
  const { data, error } = await supabase.from("payroll_periods").update({
    period_start: parsed.value.periodStart, period_end: parsed.value.periodEnd,
    pay_date: parsed.value.payDate, cutoff_date: parsed.value.cutoffDate, cutoff_time: parsed.value.cutoffTime,
  }).eq("id", id).eq("owner_id", sub).select("id").maybeSingle()
  if (error || !data) return { fieldErrors: {}, formError: "Could not update this personal period. Reload and try again." }
  revalidatePath("/calendar")
  revalidatePath("/")
  revalidatePath("/records")
  return { fieldErrors: {}, formNotice: "Saved." }
}
