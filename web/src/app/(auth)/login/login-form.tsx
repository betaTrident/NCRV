"use client"

import { useActionState } from "react"
import Link from "next/link"
import { Field } from "@/components/forms/field"
import { PasswordInput } from "@/components/forms/password-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { signIn, type AuthActionState } from "@/server/actions/auth"

const initialState: AuthActionState = { fieldErrors: {} }

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
      <div className="relative">
        <Field
          label="Password"
          htmlFor="login-password"
          error={state.fieldErrors.password}
        >
          <PasswordInput name="password" autoComplete="current-password" />
        </Field>
        <Link
          href="/forgot-password"
          className="absolute top-0 right-0 z-10 text-sm font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline"
        >
          Forgot password?
        </Link>
      </div>
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
