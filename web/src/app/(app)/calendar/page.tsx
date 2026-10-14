import { DateTime } from "luxon"

import { CalendarWorkspace } from "@/components/calendar/calendar-workspace"
import { HolidayPanel } from "@/components/calendar/holiday-panel"
import { PayrollPeriodPanel } from "@/components/calendar/payroll-period-panel"
import { PageHeader } from "@/components/shell/page-header"
import { ButtonLink } from "@/components/ui/button"
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
      <ButtonLink href="/calendar" variant="outline">Try again</ButtonLink>
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
          <ButtonLink href="/settings" variant="outline">Finish profile</ButtonLink>
        </div>
      )
    case "unavailable":
      return <UnavailableState />
    case "ready":
      return null
  }
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ view?: string; date?: string; source?: string; day?: string }> }) {
  const params = await searchParams
  const view = params.view === "week" || params.view === "references" ? params.view : "month"
  const requested = params.date
  const date = requested && /^\d{4}-\d{2}-\d{2}$/.test(requested) && DateTime.fromISO(requested).isValid ? requested : DateTime.now().setZone("Asia/Manila").toISODate()!
  const sourceEnabled = params.source === "cebu2026"
  const rangeBase = DateTime.fromISO(date, { zone: "Asia/Manila" })
  const range = view === "week"
    ? { from: rangeBase.startOf("week").toISODate()!, to: rangeBase.endOf("week").toISODate()! }
    : { from: rangeBase.startOf("month").startOf("week").toISODate()!, to: rangeBase.endOf("month").endOf("week").toISODate()! }
  const result = await loadCalendar(view === "references" ? undefined : range)
  const day = params.day ?? null

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
      {result.status === "ready" ? (
        <CalendarWorkspace source={result.source} holidays={result.holidays} periods={result.periods} shifts={result.shifts} view={view} date={date} day={day} sourceEnabled={sourceEnabled}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><HolidayPanel holidays={result.holidays} /><PayrollPeriodPanel periods={result.periods} /></div>
        </CalendarWorkspace>
      ) : null}
    </div>
  )
}
