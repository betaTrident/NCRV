"use server"

import { revalidatePath } from "next/cache"

import { createClient, getRequestClaims } from "@/lib/supabase/server"
import {
  parseComputation,
  parseProfile,
  type ComputationFieldErrors,
  type ProfileFieldErrors,
} from "@/server/settings/parse-settings"

type SettingsActionState = {
  fieldErrors: ProfileFieldErrors &
    ComputationFieldErrors & { termsAccepted?: string }
  formError?: string
  formNotice?: string
}

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function signedOutState(): SettingsActionState {
  return { fieldErrors: {}, formError: "Sign in to save this." }
}

function saveErrorState(): SettingsActionState {
  return { fieldErrors: {}, formError: "Could not save your settings. Try again." }
}

function savedState(): SettingsActionState {
  return { fieldErrors: {}, formNotice: "Saved." }
}

async function signedInIdentity(): Promise<{ sub: string; email: string } | null> {
  const { data: claimData } = await getRequestClaims()
  const claims = claimData?.claims
  const sub = claims?.sub
  const email = claims?.email
  if (typeof sub !== "string" || sub.length === 0) {
    return null
  }
  if (typeof email !== "string" || email.length === 0) {
    return null
  }
  return { sub, email }
}

async function signedInSub(): Promise<string | null> {
  const { data: claimData } = await getRequestClaims()
  const sub = claimData?.claims?.sub
  return typeof sub === "string" && sub.length > 0 ? sub : null
}

async function createProfile(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const identity = await signedInIdentity()
  if (identity === null) {
    return signedOutState()
  }

  const parsed = parseProfile({
    name: readFormString(formData, "name"),
    monthlyBasicSalary: readFormString(formData, "monthlyBasicSalary"),
    workScheduleType: readFormString(formData, "workScheduleType"),
    scheduledRegularHours: readFormString(formData, "scheduledRegularHours"),
  })
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors }
  }

  if (readFormString(formData, "termsAccepted") !== "on") {
    return {
      fieldErrors: {
        termsAccepted: "You must accept the Terms and the Privacy Notice to continue.",
      },
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("employees").insert({
    id: identity.sub,
    name: parsed.value.name,
    email: identity.email,
    monthly_basic_salary: parsed.value.monthlyBasicSalary,
    work_schedule_type: parsed.value.workScheduleType,
    scheduled_regular_hours: parsed.value.scheduledRegularHours,
    terms_accepted_at: new Date().toISOString(),
  })

  if (error) {
    return saveErrorState()
  }

  revalidatePath("/settings")
  revalidatePath("/shift/new")
  revalidatePath("/calendar")
  return savedState()
}

async function updateProfile(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const sub = await signedInSub()
  if (sub === null) {
    return signedOutState()
  }

  const parsed = parseProfile({
    name: readFormString(formData, "name"),
    monthlyBasicSalary: readFormString(formData, "monthlyBasicSalary"),
    workScheduleType: readFormString(formData, "workScheduleType"),
    scheduledRegularHours: readFormString(formData, "scheduledRegularHours"),
  })
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("employees")
    .update({
      name: parsed.value.name,
      monthly_basic_salary: parsed.value.monthlyBasicSalary,
      work_schedule_type: parsed.value.workScheduleType,
      scheduled_regular_hours: parsed.value.scheduledRegularHours,
    })
    .eq("id", sub)

  if (error) {
    return saveErrorState()
  }

  revalidatePath("/settings")
  revalidatePath("/shift/new")
  return savedState()
}

async function updateComputation(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const sub = await signedInSub()
  if (sub === null) {
    return signedOutState()
  }

  const parsed = parseComputation({
    ndStart: readFormString(formData, "ndStart"),
    ndEnd: readFormString(formData, "ndEnd"),
    breakHours: readFormString(formData, "breakHours"),
  })
  if (!parsed.ok) {
    return { fieldErrors: parsed.fieldErrors }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("employees")
    .update({
      nd_start: parsed.value.ndStart,
      nd_end: parsed.value.ndEnd,
      break_hours: parsed.value.breakHours,
    })
    .eq("id", sub)

  if (error) {
    return saveErrorState()
  }

  revalidatePath("/settings")
  revalidatePath("/shift/new")
  return savedState()
}

export { createProfile, updateComputation, updateProfile }
export type { SettingsActionState }
