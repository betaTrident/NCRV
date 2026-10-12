import type { Metadata } from "next"

import { PageHeader } from "@/components/shell/page-header"
import { Panel } from "@/components/shell/panel"

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Personal record-keeping for your own night-differential hours — not payroll.",
}

export default function TermsPage() {
  return (
    <main className="min-h-dvh bg-[var(--vx-paper)] px-[var(--vx-pad-mobile)] py-10 sm:px-[var(--vx-pad-tablet)] sm:py-14">
      <div className="mx-auto flex w-full max-w-prose flex-col gap-8">
        <PageHeader
          eyebrow="TERMS"
          title="Terms of Use"
          description="Personal record-keeping for your own night-differential hours — not payroll, and not a record your employer can see."
        />

        <Panel className="px-5 py-6 sm:px-8 sm:py-8">
          <article className="flex flex-col gap-8">
            <p className="rounded-[var(--vx-radius-control)] bg-[var(--vx-amber-bg)] px-4 py-3 text-[15px] leading-7 text-[var(--vx-amber)] sm:text-base sm:leading-8">
              This tool is for personal record-keeping only. The amounts it
              shows are estimates, not official payroll. Always confirm actual
              pay with your employer’s official payroll channel. The person who
              built or operates this instance is not liable for payroll
              decisions made from these estimates.
            </p>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                1. What this is
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                Voyix Workspace is a private, personal night-differential
                shiftbook. You choose to use it to keep your own hours. It is
                not an employer system, not payroll, not HR software, and not a
                way to submit or verify time. Nothing you enter is submitted,
                verified, or visible to an employer.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                2. Your responsibility
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                You enter the times, day type, and other facts. Wrong inputs
                produce wrong estimates. Any decision you make from these
                numbers — including whether to raise a payroll question — is
                yours. The overtime flag only records your own statement that
                extra work was agreed; this app does not approve overtime.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                3. Estimates and TBD amounts
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                Only ordinary-day 10% night differential (wage code 2211) has a
                confirmed money formula. Every other wage code is an unresolved
                estimate, shown as TBD, until a confirmed formula exists. There
                is no guarantee that any figure will match official pay. Treat
                unresolved amounts as incomplete, not as wages owed.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                4. No employer relationship
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                This app has no visibility to or from any employer. There are
                no manager or admin accounts. Your employer cannot see this
                record through Voyix Workspace, and Voyix Workspace cannot see
                your employer’s payroll system. Using this tool does not create
                a vendor, employment, or payroll relationship with anyone.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                5. Account and data
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                You sign in with email and password. You control the data you
                enter. The app does not collect an employee ID or any other
                workplace identifier. How that data is stored and who can see
                it is described in the Privacy Notice.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                6. Changes to these terms
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                When you accept these terms — usually when you create a profile
                — the time of that acceptance is recorded on your account. If
                this page is updated later, continued use after the change
                means you accept the updated terms.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                7. Termination
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                You may stop using Voyix Workspace at any time. To have your
                account and stored data removed, contact the person who set up
                your Voyix Workspace instance.
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">
                8. No warranty
              </h2>
              <p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">
                This is a personal tool offered as-is. There is no promise that
                it is complete, always available, or a substitute for official
                payroll. The person who built or operates this instance is not
                responsible for pay decisions, disputes, or shortfalls that
                follow from relying on these estimates.
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
              href="/privacy"
              className="font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline"
            >
              Privacy Notice
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
