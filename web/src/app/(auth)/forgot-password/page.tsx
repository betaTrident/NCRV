import { AuthSplit } from "@/components/shell/auth-split"
import { PageHeader } from "@/components/shell/page-header"
import { ForgotPasswordForm } from "./forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <AuthSplit
      title="Your night hours, accounted for."
      description="A private record of every night-shift differential, built for employees who want to see the work."
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="RESET PASSWORD"
          title="Forgot your password?"
          description="Enter the email on your profile and we'll send a reset link."
        />
        <ForgotPasswordForm />
        <p className="text-sm text-[var(--vx-muted)]">
          <a
            href="/login"
            className="font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline"
          >
            Back to sign in
          </a>
        </p>
      </div>
    </AuthSplit>
  )
}
