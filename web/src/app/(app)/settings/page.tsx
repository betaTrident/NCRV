import { RetryButton } from "@/components/ui/retry-button"

import { ComputationForm } from "@/components/settings/computation-form"
import { ProfileForm } from "@/components/settings/profile-form"
import { WageCatalog } from "@/components/settings/wage-catalog"
import { PageHeader } from "@/components/shell/page-header"
import { Button, ButtonLink } from "@/components/ui/button"
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
      <RetryButton />
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

function SettingsBody({ result }: { result: Awaited<ReturnType<typeof loadSettings>> }) {

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
          <section id="profile"><ProfileForm mode="create" profile={blankProfile(result.email)} /></section>
          <details className="vx-reference-disclosure"><summary>Reference information: ADP wage codes</summary><WageCatalog wages={result.wages} source={result.codeSource} /></details>
        </>
      )
    case "ready":
      return (
        <>
          <section id="profile"><ProfileForm profile={result.profile} /></section>
          <section id="calculation"><ComputationForm computation={result.computation} /></section>
          <section id="references"><details className="vx-reference-disclosure"><summary>Reference information: ADP wage codes</summary><WageCatalog wages={result.wages} source={result.codeSource} /></details></section>
        </>
      )
  }
}

export default async function SettingsPage() {
  const result = await loadSettings()
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="ACCOUNT SETUP"
        title="Settings"
        description="Make this shiftbook work for you. Your records stay private."

      />
      <div className={result.status === "ready" ? "vx-settings-layout" : ""}>
        {result.status === "ready" ? <nav className="vx-settings-nav" aria-label="Settings sections"><a href="#profile">Profile</a><a href="#calculation">Calculation preferences</a><a href="#account">Account and privacy</a><a href="#references">Reference information</a></nav> : null}
        <div className="vx-settings-sections"><SettingsBody result={result} />
          <section id="account" className="vx-overview-panel"><div className="vx-settings-section-head"><h2>Account and privacy</h2><p>This is your private employee shiftbook. Estimates are not employer payroll.</p></div><div className="flex flex-wrap gap-3"><ButtonLink href="/privacy" variant="outline">Privacy notice</ButtonLink><ButtonLink href="/terms" variant="quiet">Terms</ButtonLink></div><div className="mt-6 border-t border-[var(--vx-line)] pt-6"><p className="mb-3 text-sm text-[var(--vx-muted)]">Sign out on this device when you are finished.</p><form action={signOut}><Button type="submit" variant="outline">Sign out</Button></form></div></section>
        </div>
      </div>
    </div>
  )
}
