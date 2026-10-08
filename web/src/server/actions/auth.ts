"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import * as z from "zod"
import { createClient } from "@/lib/supabase/server"

type AuthFieldErrors = {
  name?: string
  employeeId?: string
  email?: string
  password?: string
  monthlyBasicSalary?: string
}

type AuthActionState = {
  fieldErrors: AuthFieldErrors
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
  employeeId: z.string().trim().min(1, "Enter your employee ID."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .pipe(z.email("Enter a valid email.")),
  password: z.string().min(12, "Use at least 12 characters."),
  monthlyBasicSalary: monthlyBasicSalarySchema,
})

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email.")
    .pipe(z.email("Enter a valid email.")),
  password: z.string().min(1, "Enter your password."),
})

function fieldErrorsFromZod(error: z.ZodError): AuthFieldErrors {
  const fieldErrors: AuthFieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (
      key !== "name" &&
      key !== "employeeId" &&
      key !== "email" &&
      key !== "password" &&
      key !== "monthlyBasicSalary"
    ) {
      continue
    }
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message
    }
  }
  return fieldErrors
}

function readFormString(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function isDuplicateEmployeeId(error: {
  code?: string
  message?: string
  details?: string
}) {
  if (error.code !== "23505") {
    return false
  }
  const haystack = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase()
  return haystack.includes("employee_id")
}

async function signUp(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: readFormString(formData, "name"),
    employeeId: readFormString(formData, "employeeId"),
    email: readFormString(formData, "email"),
    password: readFormString(formData, "password"),
    monthlyBasicSalary: readFormString(formData, "monthlyBasicSalary"),
  })

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFromZod(parsed.error) }
  }

  const { name, employeeId, email, password, monthlyBasicSalary } = parsed.data
  const supabase = await createClient()
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
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
    employee_id: employeeId,
    email,
    ...(monthlyBasicSalary ? { monthly_basic_salary: monthlyBasicSalary } : {}),
  })

  if (insertError) {
    await supabase.auth.signOut()
    if (isDuplicateEmployeeId(insertError)) {
      return {
        fieldErrors: { employeeId: "That employee ID is already in use." },
      }
    }
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
    return { fieldErrors: fieldErrorsFromZod(parsed.error) }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
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

  revalidatePath("/", "layout")
  redirect("/")
}

async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

export { signUp, signIn, signOut }
export type { AuthActionState, AuthFieldErrors }
