import { AuthSplit } from "@/components/shell/auth-split"
import { PageHeader } from "@/components/shell/page-header"
import { SignupForm } from "./signup-form"

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
          description="Name, employee ID, email, and password are required. Monthly basic salary is optional."
        />
        <SignupForm />
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
