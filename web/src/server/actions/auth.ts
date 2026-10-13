"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import * as z from "zod"
import { createClient } from "@/lib/supabase/server"

/**
 * Builds an absolute URL back to this deployment from the incoming
 * request headers, so the password-reset email link lands on
 * /auth/confirm without a new env var. /auth/confirm exchanges the
 * PKCE code Supabase appends for a session, then forwards to
 * /reset-password so the form renders with a live recovery session
 * instead of treating a valid link as expired.
 */
async function resetPasswordRedirectUrl(): Promise<string | undefined> {
  const requestHeaders = await headers()
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")
  if (!host) {
    return undefined
  }
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https"
  return `${protocol}://${host}/auth/confirm?next=/reset-password`
}

type AuthFieldErrors = {
  name?: string
  email?: string
  password?: string
  monthlyBasicSalary?: string
  termsAccepted?: string
}

type AuthActionState = {
  fieldErrors: AuthFieldErrors
  formError?: string
  formNotice?: string
}

type RequestResetState = {
  fieldErrors: { email?: string }
  formError?: string
  formNotice?: string
}

type UpdatePasswordState = {
  fieldErrors: { password?: string }
  formError?: string
}

const monthlyBasicSalarySchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value),
    "Enter a non-negative amount with at most two decimal places.",
  )
  .transform((value) => (value === "" ? undefined : value))

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .pipe(z.email("Enter a valid email.")),
  password: z.string().min(12, "Use at least 12 characters."),
  monthlyBasicSalary: monthlyBasicSalarySchema,
  termsAccepted: z.literal("on", {
    error: "You must accept the Terms and the Privacy Notice to continue.",
  }),
})

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .pipe(z.email("Enter a valid email.")),
  password: z.string().min(1, "Enter your password."),
})

const requestResetSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .pipe(z.email("Enter a valid email.")),
})

const updatePasswordSchema = z.object({
  password: z.string().min(12, "Use at least 12 characters."),
})

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

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

/**
 * Supabase returns this when the project's email provider has hit its
 * sending cap. It is an infrastructure limit, not a user mistake.
 */
function isEmailRateLimited(error: { code?: string; status?: number }) {
  return error.code === "over_email_send_rate_limit" || error.status === 429
}

async function signUp(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: readFormString(formData, "name"),
    email: readFormString(formData, "email"),
    password: readFormString(formData, "password"),
    monthlyBasicSalary: readFormString(formData, "monthlyBasicSalary"),
    termsAccepted: readFormString(formData, "termsAccepted"),
  })

  if (!parsed.success) {
    return {
      fieldErrors: fieldErrorsFromZod(parsed.error, [
        "name",
        "email",
        "password",
        "monthlyBasicSalary",
        "termsAccepted",
      ]),
    }
  }

  const { name, email, password, monthlyBasicSalary } = parsed.data
  const supabase = await createClient()
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    if (isEmailRateLimited(signUpError)) {
      return {
        fieldErrors: {},
        formError:
          "Too many signup attempts right now. Wait a few minutes and try again.",
      }
    }
    const message = signUpError.message.toLowerCase()
    if (message.includes("already") || message.includes("registered")) {
      return {
        fieldErrors: {
          email: "An account with this email already exists. Sign in instead.",
        },
      }
    }
    return {
      fieldErrors: {},
      formError: "Could not create the profile. Try again.",
    }
  }

  if (!signUpData.user?.identities || signUpData.user.identities.length === 0) {
    return {
      fieldErrors: {
        email: "An account with this email already exists. Sign in instead.",
      },
    }
  }

  if (!signUpData.session) {
    return {
      fieldErrors: {},
      formNotice:
        "Check your email to confirm your address, then sign in. Your profile has not been saved yet.",
    }
  }

  const { data: claimData } = await supabase.auth.getClaims()
  const userId = claimData?.claims?.sub
  if (typeof userId !== "string" || userId.length === 0) {
    await supabase.auth.signOut()
    return {
      fieldErrors: {},
      formError: "Could not start a session. Try signing in.",
    }
  }

  const { error: insertError } = await supabase.from("employees").insert({
    id: userId,
    name,
    email,
    terms_accepted_at: new Date().toISOString(),
    ...(monthlyBasicSalary ? { monthly_basic_salary: monthlyBasicSalary } : {}),
  })

  if (insertError) {
    await supabase.auth.signOut()
    return {
      fieldErrors: {},
      formError: "Could not save the profile. Try again.",
    }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

async function signIn(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: readFormString(formData, "email"),
    password: readFormString(formData, "password"),
  })

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error, ["email", "password"]) }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        fieldErrors: {},
        formError: "Confirm your email first, then sign in.",
      }
    }
    return {
      fieldErrors: {},
      formError: "Email or password is incorrect.",
    }
  }

  const { data: claimData } = await supabase.auth.getClaims()
  if (!claimData?.claims) {
    return {
      fieldErrors: {},
      formError: "Could not start a session. Try again.",
    }
  }

  const userId = claimData.claims.sub
  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("id", userId)
    .maybeSingle()

  revalidatePath("/", "layout")
  redirect(employee ? "/" : "/settings")
}

async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

/**
 * Sends a password-reset email. Always returns the same notice whether or
 * not the address has an account, so the form cannot be used to find out
 * which emails are registered.
 */
async function requestPasswordReset(
  _prevState: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  const parsed = requestResetSchema.safeParse({
    email: readFormString(formData, "email"),
  })

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error, ["email"]) }
  }

  const supabase = await createClient()
  const redirectTo = await resetPasswordRedirectUrl()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo,
  })

  if (error && isEmailRateLimited(error)) {
    return {
      fieldErrors: {},
      formError: "Too many reset attempts right now. Wait a few minutes and try again.",
    }
  }

  return {
    fieldErrors: {},
    formNotice:
      "If that email has a profile, a password reset link is on its way.",
  }
}

/**
 * Sets a new password for the session created by the reset-password email
 * link. The reset page is responsible for ensuring that session exists
 * before this action is called.
 */
async function updatePassword(
  _prevState: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const parsed = updatePasswordSchema.safeParse({
    password: readFormString(formData, "password"),
  })

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error, ["password"]) }
  }

  const supabase = await createClient()
  const { data: claimData } = await supabase.auth.getClaims()
  if (!claimData?.claims) {
    return {
      fieldErrors: {},
      formError: "This reset link has expired. Request a new one.",
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return {
      fieldErrors: {},
      formError: "Could not update your password. Try again.",
    }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export { signUp, signIn, signOut, requestPasswordReset, updatePassword }
export type {
  AuthActionState,
  AuthFieldErrors,
  RequestResetState,
  UpdatePasswordState,
}
