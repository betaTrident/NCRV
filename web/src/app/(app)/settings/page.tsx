import Link from "next/link"

import { ComputationForm } from "@/components/settings/computation-form"
import { ProfileForm } from "@/components/settings/profile-form"
import { WageCatalog } from "@/components/settings/wage-catalog"
import { PageHeader } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
import { signOut } from "@/server/actions/auth"
import { loadSettings, type ProfileValues } from "@/server/queries/settings"

function AlertMessage({ children }: { children: string }) {
  return (
    <p
      role="alert"
      className="max-w-prose rounded-[var(--vx-radius-control)] bg-[var(--vx-rose-bg)] px-3 py-2 text-sm font-medium text-[var(--vx-rose)]"
    >
      {children}
    </p>
  )
}

function UnavailableState() {
  return (
    <div className="flex flex-col items-start gap-3">
      <AlertMessage>Could not load your settings.</AlertMessage>
      <Button asChild variant="outline">
        <Link href="/settings">Try again</Link>
      </Button>
    </div>
  )
}

function blankProfile(email: string): ProfileValues {
  return {
    name: "",
    email,
    monthlyBasicSalary: "",
    workScheduleType: "STANDARD",
    scheduledRegularHours: "8.00",
    displayedHourlyRate: null,
  }
}

async function SettingsBody() {
  const result = await loadSettings()

  switch (result.status) {
    case "unavailable":
      return <UnavailableState />
    case "signed-out":
      return (
        <p className="text-sm text-[var(--vx-ink-soft)]">
          Sign in to see your settings.
        </p>
      )
    case "needs-profile":
      return (
        <>
          <p className="max-w-prose text-sm text-[var(--vx-ink-soft)]">
            Your sign-in is active, but the profile was not saved yet. Name
            and Terms acceptance finish it. Nothing is sent to an employer.
          </p>
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <ProfileForm mode="create" profile={blankProfile(result.email)} />
          </div>
          <WageCatalog wages={result.wages} />
        </>
      )
    case "ready":
      return (
        <>
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <ProfileForm profile={result.profile} />
            <ComputationForm computation={result.computation} />
          </div>
          <WageCatalog wages={result.wages} />
        </>
      )
  }
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="ACCOUNT SETUP"
        title="Settings"
        description="Your profile, computation preferences, and the read-only ADP wage reference."
        action={
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Sign out
            </Button>
          </form>
        }
      />
      <SettingsBody />
    </div>
  )
}
