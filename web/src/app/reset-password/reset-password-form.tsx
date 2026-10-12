"use client"

import { useActionState } from "react"
import { Field } from "@/components/forms/field"
import { PasswordInput } from "@/components/forms/password-input"
import { Button } from "@/components/ui/button"
import {
  updatePassword,
  type UpdatePasswordState,
} from "@/server/actions/auth"

const initialState: UpdatePasswordState = { fieldErrors: {} }

function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialState,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <Field
        label="New password"
        htmlFor="reset-password"
        helper="Use at least 12 characters."
        error={state.fieldErrors.password}
      >
        <PasswordInput name="password" autoComplete="new-password" />
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
          {pending ? "Saving…" : "Set new password"}
        </Button>
      </div>
    </form>
  )
}

export { ResetPasswordForm }
