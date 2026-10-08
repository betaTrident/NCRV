import { AuthSplit } from "@/components/shell/auth-split"
import { PageHeader } from "@/components/shell/page-header"
import { LoginForm } from "./login-form"

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
          description="Sign in with your email to see your private shift history."
        />
        <LoginForm />
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
