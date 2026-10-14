"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Field } from "@/components/forms/field"
import { PasswordInput } from "@/components/forms/password-input"
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
        <PasswordInput
          id="signup-password"
          name="password"
          autoComplete="new-password"
        />
      </Field>
      <div className="flex flex-col gap-1.5">
        <div className="flex min-h-11 items-center gap-3">
          <input
            id="signup-terms"
            name="termsAccepted"
            type="checkbox"
            className="size-4 shrink-0 accent-[var(--vx-brand)]"
            aria-invalid={state.fieldErrors.termsAccepted ? true : undefined}
            aria-describedby={
              state.fieldErrors.termsAccepted
                ? "signup-terms-error"
                : undefined
            }
          />
          <label
            htmlFor="signup-terms"
            className="text-sm text-[var(--vx-ink)]"
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className="font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline"
            >
              Terms
            </Link>
            {" and "}
            <Link
              href="/privacy"
              className="font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline"
            >
              Privacy Notice
            </Link>{"."}
          </label>
        </div>
        {state.fieldErrors.termsAccepted ? (
          <p
            id="signup-terms-error"
            className="text-xs text-[var(--vx-rose)]"
            role="alert"
          >
            {state.fieldErrors.termsAccepted}
          </p>
        ) : null}
      </div>
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
      {state.formNotice ? (
        <p
          className="rounded-[var(--vx-radius-control)] bg-[var(--vx-surface-soft)] px-3 py-2 text-sm text-[var(--vx-ink)]"
          role="status"
        >
          {state.formNotice}
        </p>
      ) : null}
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
