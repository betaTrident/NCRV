import { AuthSplit } from "@/components/shell/auth-split"
import { PageHeader } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignupPage() {
  return (
    <AuthSplit
      title="Show the work, not just the total."
      description="Creating a profile here starts your private record. It does not verify or submit anything to your employer."
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="NEW ACCOUNT"
          title="Create profile"
          description="Name and employee ID are required. Email and hourly rate are optional."
        />
        <form className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-name">Full name</Label>
            <Input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-employee-id">Employee ID</Label>
            <Input
              id="signup-employee-id"
              name="employeeId"
              type="text"
              autoComplete="off"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-email">
              Email <span className="font-normal text-[var(--vx-muted)]">(optional)</span>
            </Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="signup-hourly-rate">
              Hourly rate <span className="font-normal text-[var(--vx-muted)]">(optional)</span>
            </Label>
            <Input
              id="signup-hourly-rate"
              name="hourlyRate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              disabled
              aria-disabled="true"
              aria-describedby="signup-connection-helper"
              className="w-full"
            >
              Create profile
            </Button>
            <p
              id="signup-connection-helper"
              className="text-xs text-[var(--vx-muted)]"
            >
              The account connection is not ready.
            </p>
          </div>
        </form>
        <p className="text-sm text-[var(--vx-muted)]">
          Already have a profile?{" "}
          <a
            href="/login"
            className="font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </AuthSplit>
  )
}
