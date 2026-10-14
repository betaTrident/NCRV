import type { ReactNode } from "react"

function PrivacyDocument({ headingId }: { headingId?: string }) {
  return (
    <article className="flex flex-col gap-8">
      <h2 id={headingId} tabIndex={-1} className="sr-only">Privacy document</h2>
      <PrivacySection title="What is collected"><p>Voyix Workspace stores the information you enter so it can show your own night-differential estimate back to you. That includes:</p><ul className="list-disc space-y-2 pl-5"><li>Your name and email</li><li>Optional monthly basic salary</li><li>Schedule settings you choose, such as schedule type, night-differential window, and break duration</li><li>The shifts you save and the calculation snapshots created from them</li></ul><p>Sign-in uses email and password through Supabase Auth. The app does not collect an employee ID or any other workplace identifier.</p></PrivacySection>
      <PrivacySection title="Why it is collected">These fields exist so the app can calculate and show your own night-differential estimate back to you only. They are not used to submit time, verify employment, or run payroll.</PrivacySection>
      <PrivacySection title="Who can see it">Only you. Postgres Row Level Security restricts every employee-owned personal-data table to the account you signed in with. This product has no manager or admin view, and other people using the same instance cannot read your rows through the app. The person who set up this instance also operates the hosted database and can reach that infrastructure if they need to help you export or delete data.</PrivacySection>
      <PrivacySection title="Where it is stored">Your profile, shifts, and calculation snapshots are stored in a Postgres database hosted by Supabase. Authentication is also handled by Supabase.</PrivacySection>
      <PrivacySection title="Third parties">Supabase is the infrastructure provider for the database and sign-in. No analytics or advertising trackers are currently integrated.</PrivacySection>
      <PrivacySection title="Your controls">You can request an export or deletion of your account and data by contacting the person who set up your Voyix Workspace instance. There is no separate support desk for this tool.</PrivacySection>
      <PrivacySection title="Cookies">Signing in sets session cookies so the app can keep you signed in. They are not used for tracking.</PrivacySection>
    </article>
  )
}

function PrivacySection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="flex flex-col gap-3"><h3 className="text-base font-semibold text-[var(--vx-ink)] sm:text-lg">{title}</h3><div className="flex flex-col gap-3 text-[15px] leading-7 text-[var(--vx-ink-soft)] sm:text-base sm:leading-8">{children}</div></section>
}

export { PrivacyDocument }
