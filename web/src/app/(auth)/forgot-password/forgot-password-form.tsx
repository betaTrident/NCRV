"use client"

import { useActionState } from "react"
import { Field } from "@/components/forms/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  requestPasswordReset,
  type RequestResetState,
} from "@/server/actions/auth"

const initialState: RequestResetState = { fieldErrors: {} }

function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordReset,
    initialState,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <Field
        label="Email"
        htmlFor="forgot-email"
        error={state.fieldErrors.email}
      >
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
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
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </div>
    </form>
  )
}

export { ForgotPasswordForm }
