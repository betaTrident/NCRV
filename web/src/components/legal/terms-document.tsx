import type { ReactNode } from "react"

function TermsDocument({ headingId }: { headingId?: string }) {
  return (
    <article className="flex flex-col gap-8">
      <h2 id={headingId} tabIndex={-1} className="sr-only">Terms document</h2>
      <p className="rounded-[var(--vx-radius-control)] bg-[var(--vx-amber-bg)] px-4 py-3 text-[15px] leading-7 text-[var(--vx-amber-ink)] sm:text-base sm:leading-8">
        This tool is for personal record-keeping only. The amounts it shows are estimates, not official payroll. Always confirm actual pay with your employer’s official payroll channel. The person who built or operates this instance is not liable for payroll decisions made from these estimates.
      </p>
      <TermsSection title="1. What this is">Voyix Workspace is a private, personal night-differential shiftbook. You choose to use it to keep your own hours. It is not an employer system, not payroll, not HR software, and not a way to submit or verify time. Nothing you enter is submitted, verified, or visible to an employer.</TermsSection>
      <TermsSection title="2. Your responsibility">You enter the times, day type, and other facts. Wrong inputs produce wrong estimates. Any decision you make from these numbers — including whether to raise a payroll question — is yours. The overtime flag only records your own statement that extra work was agreed; this app does not approve overtime.</TermsSection>
      <TermsSection title="3. Estimates and TBD amounts">Only ordinary-day 10% night differential (wage code 2211) has a confirmed money formula. Every other wage code is an unresolved estimate, shown as TBD, until a confirmed formula exists. There is no guarantee that any figure will match official pay. Treat unresolved amounts as incomplete, not as wages owed.</TermsSection>
      <TermsSection title="4. No employer relationship">This app has no visibility to or from any employer. There are no manager or admin accounts. Your employer cannot see this record through Voyix Workspace, and Voyix Workspace cannot see your employer’s payroll system. Using this tool does not create a vendor, employment, or payroll relationship with anyone.</TermsSection>
      <TermsSection title="5. Account and data">You sign in with email and password. You control the data you enter. The app does not collect an employee ID or any other workplace identifier. How that data is stored and who can see it is described in the Privacy Notice.</TermsSection>
      <TermsSection title="6. Changes to these terms">When you accept these terms — usually when you create a profile — the time of that acceptance is recorded on your account. If this page is updated later, continued use after the change means you accept the updated terms.</TermsSection>
      <TermsSection title="7. Termination">You may stop using Voyix Workspace at any time. To have your account and stored data removed, contact the person who set up your Voyix Workspace instance.</TermsSection>
      <TermsSection title="8. No warranty">This is a personal tool offered as-is. There is no promise that it is complete, always available, or a substitute for official payroll. The person who built or operates this instance is not responsible for pay decisions, disputes, or shortfalls that follow from relying on these estimates.</TermsSection>
    </article>
  )
}

function TermsSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="flex flex-col gap-3"><h3 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">{title}</h3><p className="text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">{children}</p></section>
}

export { TermsDocument }
