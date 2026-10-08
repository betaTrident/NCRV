"use client"

import { useActionState } from "react"
import { Field } from "@/components/forms/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signUp, type AuthActionState } from "@/server/actions/auth"

const initialState: AuthActionState = { fieldErrors: {} }

function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signUp,
    initialState,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <Field label="Full name" htmlFor="signup-name" error={state.fieldErrors.name}>
        <Input
          id="signup-name"
          name="name"
          type="text"
          autoComplete="name"
          className="h-11"
        />
      </Field>
      <Field
        label="Employee ID"
        htmlFor="signup-employee-id"
        error={state.fieldErrors.employeeId}
      >
        <Input
          id="signup-employee-id"
          name="employeeId"
          type="text"
          autoComplete="off"
          className="h-11"
        />
      </Field>
      <Field
        label="Email"
        htmlFor="signup-email"
        helper="Only used to sign back in. Creating a profile does not verify employment."
        error={state.fieldErrors.email}
      >
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          className="h-11"
        />
      </Field>
      <Field
        label="Password"
        htmlFor="signup-password"
        helper="Use at least 12 characters."
        error={state.fieldErrors.password}
      >
        <Input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          className="h-11"
        />
      </Field>
      <Field
        label="Monthly basic salary"
        htmlFor="signup-monthly-basic-salary"
        helper="Optional. Used to derive the computational hourly rate with factor 261."
        error={state.fieldErrors.monthlyBasicSalary}
      >
        <Input
          id="signup-monthly-basic-salary"
          name="monthlyBasicSalary"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className="h-11"
        />
      </Field>
      {state.formError ? (
        <p className="text-xs text-[var(--vx-rose)]" role="alert">
          {state.formError}
        </p>
      ) : null}
      <div className="pt-2">
        <Button
          type="submit"
          className="w-full"
          disabled={pending}
          aria-disabled={pending}
        >
          {pending ? "Creating profile…" : "Create profile"}
        </Button>
      </div>
    </form>
  )
}

export { SignupForm }
