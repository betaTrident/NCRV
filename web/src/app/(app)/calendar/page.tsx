import Link from "next/link"

import { HolidayPanel } from "@/components/calendar/holiday-panel"
import { PayrollPeriodPanel } from "@/components/calendar/payroll-period-panel"
import { PageHeader } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
import { loadCalendar } from "@/server/queries/calendar"

function UnavailableState() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p
        role="alert"
        className="max-w-prose rounded-[var(--vx-radius-control)] bg-[var(--vx-rose-bg)] px-3 py-2 text-sm font-medium text-[var(--vx-rose)]"
      >
        Could not load your calendar.
      </p>
      <Button asChild variant="outline">
        <Link href="/calendar">Try again</Link>
      </Button>
    </div>
  )
}

function CalendarBody({
  result,
}: {
  result: Awaited<ReturnType<typeof loadCalendar>>
}) {
  switch (result.status) {
    case "signed-out":
      return (
        <p className="text-sm text-[var(--vx-ink-soft)]">
          Sign in to see your calendar.
        </p>
      )
    case "needs-profile":
      return (
        <div className="flex flex-col items-start gap-3">
          <p className="max-w-prose text-sm text-[var(--vx-ink-soft)]">
            Your sign-in is active, but the profile was not saved yet. Finish
            it in Settings before adding dates.
          </p>
          <Button asChild variant="outline">
            <Link href="/settings">Finish profile</Link>
          </Button>
        </div>
      )
    case "unavailable":
      return <UnavailableState />
    case "ready":
      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <HolidayPanel holidays={result.holidays} />
          <PayrollPeriodPanel periods={result.periods} />
        </div>
      )
  }
}

export default async function CalendarPage() {
  const result = await loadCalendar()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="DATES & PERIODS"
        title="Calendar"
        description="Holiday references and payroll periods you've entered. Dates are never fabricated."
      />
      <p className="max-w-prose text-sm text-[var(--vx-ink-soft)]">
        These are personal notes. Voyix Workspace does not supply a company
        calendar, and saving a date does not change how a shift is classified.
      </p>
      <CalendarBody result={result} />
    </div>
  )
}
