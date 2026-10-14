"use client"

import { useActionState } from "react"
import { Field } from "@/components/forms/field"
import { PasswordInput } from "@/components/forms/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signUp, type AuthActionState } from "@/server/actions/auth"
import { LegalModal } from "@/components/ui/legal-modal"

const initialState: AuthActionState = { fieldErrors: {} }

function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signUp,
    initialState,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <Field label="Full name" htmlFor="signup-name" required error={state.fieldErrors.name}>
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
        required
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
        required
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
            required
            className="size-4 shrink-0 accent-[var(--vx-brand)]"
            aria-invalid={state.fieldErrors.termsAccepted ? true : undefined}
            aria-describedby={
              state.fieldErrors.termsAccepted
                ? "signup-terms-error"
                : undefined
            }
          />
          <div className="text-sm text-[var(--vx-ink)]">
            <label htmlFor="signup-terms">I agree to the Terms and Privacy Notice.</label>{" "}
            <span className="block text-xs text-[var(--vx-muted)]">
              <LegalModal kind="terms" /> <span aria-hidden="true">·</span>{" "}<LegalModal kind="privacy" />
            </span>
          </div>
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
