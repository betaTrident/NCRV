import { AuthSplit } from "@/components/shell/auth-split"
import { PageHeader } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <AuthSplit
      title="Your night hours, accounted for."
      description="A private record of every night-shift differential, built for employees who want to see the work."
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="SIGN IN"
          title="Employee sign in"
          description="Sign in with your employee ID to see your private shift history."
        />
        <form className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-employee-id">Employee ID or email</Label>
            <Input
              id="login-employee-id"
              name="employeeId"
              type="text"
              autoComplete="username"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              disabled
              aria-disabled="true"
              aria-describedby="login-connection-helper"
              className="w-full"
            >
              Sign in
            </Button>
            <p
              id="login-connection-helper"
              className="text-xs text-[var(--vx-muted)]"
            >
              The account connection is not ready.
            </p>
          </div>
        </form>
        <p className="text-sm text-[var(--vx-muted)]">
          New here?{" "}
          <a
            href="/signup"
            className="font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline"
          >
            Create a profile
          </a>
        </p>
      </div>
    </AuthSplit>
  )
}
