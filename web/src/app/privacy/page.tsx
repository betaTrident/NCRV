import type { Metadata } from "next"

import { PageHeader } from "@/components/shell/page-header"
import { Panel } from "@/components/shell/panel"

export const metadata: Metadata = {
  title: "Privacy Notice",
  description:
    "What this instance stores about you, who can see it, and how to ask for a copy or deletion.",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-[var(--vx-paper)] px-[var(--vx-pad-mobile)] py-10 sm:px-[var(--vx-pad-tablet)] sm:py-14">
      <div className="mx-auto flex w-full max-w-prose flex-col gap-8">
        <PageHeader
          eyebrow="PRIVACY"
          title="Privacy Notice"
          description="What this instance stores about you, who can see it, and how to ask for a copy or deletion."
        />

        <Panel className="px-5 py-6 sm:px-8 sm:py-8">
          <article className="flex flex-col gap-8">
            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                What is collected
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                Voyix Workspace stores the information you enter so it can show
                your own night-differential estimate back to you. That includes:
              </p>
              <ul className="list-disc space-y-2 pl-5 text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                <li>Your name and email</li>
                <li>Optional monthly basic salary</li>
                <li>
                  Schedule settings you choose, such as schedule type,
                  night-differential window, and break duration
                </li>
                <li>
                  The shifts you save and the calculation snapshots created
                  from them
                </li>
              </ul>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                Sign-in uses email and password through Supabase Auth. The app
                does not collect an employee ID or any other workplace
                identifier.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                Why it is collected
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                These fields exist so the app can calculate and show your own
                night-differential estimate back to you only. They are not used
                to submit time, verify employment, or run payroll.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                Who can see it
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                Only you. Postgres Row Level Security restricts every
                application table to the account you signed in with. This
                product has no manager or admin view, and other people using
                the same instance cannot read your rows through the app. The
                person who set up this instance also operates the hosted
                database and can reach that infrastructure if they need to help
                you export or delete data.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                Where it is stored
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                Your profile, shifts, and calculation snapshots are stored in a
                Postgres database hosted by Supabase. Authentication is also
                handled by Supabase.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                Third parties
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                Supabase is the infrastructure provider for the database and
                sign-in. No analytics or advertising trackers are currently
                integrated.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                Your controls
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                You can request an export or deletion of your account and data
                by contacting the person who set up your Voyix Workspace
                instance. There is no separate support desk for this tool.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                Cookies
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                Signing in sets session cookies so the app can keep you signed
                in. They are not used for tracking.
              </p>
            </section>
          </article>
        </Panel>

        <nav
          aria-label="Related pages"
          className="flex flex-col gap-3 text-sm text-[var(--vx-muted)]"
        >
          <p>
            See also the{" "}
            <a
              href="/terms"
              className="font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline"
            >
              Terms of Use
            </a>
            .
          </p>
          <p>
            <a
              href="/login"
              className="font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline"
            >
              Back to sign in
            </a>
          </p>
        </nav>
      </div>
    </main>
  )
}
