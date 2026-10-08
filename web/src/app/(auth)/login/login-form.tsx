"use client"

import { useActionState, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Field } from "@/components/forms/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn, type AuthActionState } from "@/server/actions/auth"

const initialState: AuthActionState = { fieldErrors: {} }

function PasswordInput({
  id,
  name,
  autoComplete,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  id?: string
  name: string
  autoComplete: string
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling"
  "aria-describedby"?: string
}) {
  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={passwordVisible ? "text" : "password"}
        autoComplete={autoComplete}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className="h-11 pr-12"
      />
      <Button
        type="button"
        variant="quiet"
        size="icon"
        className="absolute inset-y-0 right-0"
        aria-label={passwordVisible ? "Hide password" : "Show password"}
        aria-pressed={passwordVisible}
        onClick={() => {
          setPasswordVisible((visible) => !visible)
        }}
      >
        {passwordVisible ? (
          <EyeOff size={18} aria-hidden="true" />
        ) : (
          <Eye size={18} aria-hidden="true" />
        )}
      </Button>
    </div>
  )
}

function LoginForm() {
  const [state, formAction, pending] = useActionState(
    signIn,
    initialState,
  )

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <Field
        label="Email"
        htmlFor="login-email"
        error={state.fieldErrors.email}
      >
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          className="h-11"
        />
      </Field>
      <Field
        label="Password"
        htmlFor="login-password"
        error={state.fieldErrors.password}
      >
        <PasswordInput name="password" autoComplete="current-password" />
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
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    </form>
  )
}

export { LoginForm }
