import { AuthSplit } from "@/components/shell/auth-split"
import { PageHeader } from "@/components/shell/page-header"
import { ResetPasswordForm } from "./reset-password-form"

type ResetPasswordPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { error } = await searchParams
  const expired = error === "expired"

  return (
    <AuthSplit
      title="Your night hours, accounted for."
      description="A private record of every night-shift differential, built for employees who want to see the work."
    >
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow="RESET PASSWORD"
          title="Choose a new password"
          description="This link only works once. Set a new password to finish signing in."
        />
        {expired ? (
          <p className="text-xs text-[var(--vx-rose)]" role="alert">
            This reset link has expired or was already used. Request a new
            one from the sign-in page.
          </p>
        ) : (
          <ResetPasswordForm />
        )}
      </div>
    </AuthSplit>
  )
}
