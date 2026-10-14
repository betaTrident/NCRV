"use client"

import { DateTime } from "luxon"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, type ReactNode } from "react"
import { Drawer } from "@/components/ui/drawer"
import { Segmented } from "@/components/ui/segmented"
import type { HolidayListItem, PayrollPeriodListItem, SavedShiftListItem, SourceCalendar, SourceCalendarEvent } from "@/server/queries/calendar"

type View = "month" | "week" | "references"
type Props = { source: SourceCalendar | null; holidays: HolidayListItem[]; periods: PayrollPeriodListItem[]; shifts: SavedShiftListItem[]; view: View; date: string; day: string | null; sourceEnabled: boolean; children: ReactNode }
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function CalendarWorkspace({ source, holidays, periods, shifts, view, date, day, sourceEnabled, children }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const selected = validDate(date) ? date : "2026-01-01"
  const events = sourceEnabled ? source?.events || [] : []
  const sourceUnavailable = sourceEnabled && !source
  const activeDay = day && validDate(day) ? day : null
  const days = useMemo(() => buildDays(selected, view), [selected, view])
  const details = activeDay ? collectDay(activeDay, events, holidays, periods, shifts) : null
  function navigate(nextView: View, nextDate = selected, nextSource = sourceEnabled, nextDay: string | null = activeDay) {
    const params = new URLSearchParams()
    params.set("view", nextView)
    params.set("date", nextDate)
    if (nextSource) params.set("source", "cebu2026")
    if (nextDay) params.set("day", nextDay)
    router.replace(pathname + "?" + params.toString(), { scroll: false })
  }
  return <div className="flex flex-col gap-6">
    <Segmented name="calendar-view" value={view} options={[{ value: "month", label: "Month" }, { value: "week", label: "Week" }, { value: "references", label: "References" }]} onValueChange={(value) => navigate((value as View) || "month", selected, sourceEnabled, null)} />
    {view === "references" ? <div className="flex flex-col gap-6">{children}{sourceEnabled && source ? <ReferenceCodeTable source={source} /> : <p className="text-sm text-[var(--vx-muted)]">{sourceUnavailable ? "The Cebu 2026 source is unavailable. Your personal references remain available." : "Enable the Cebu 2026 source reference to see its read-only code catalogue."}</p>}</div> : <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--vx-muted)]">{view === "month" ? "MONTH VIEW" : "WEEK VIEW"}</p><h2 className="text-xl font-semibold text-[var(--vx-ink)]">{DateTime.fromISO(selected).toFormat(view === "month" ? "LLLL yyyy" : "MMM d, yyyy")}</h2></div><div className="flex gap-2"><button type="button" className="min-h-11 rounded-[var(--vx-radius-control)] border border-[var(--vx-line-strong)] px-3 text-sm" onClick={() => navigate(view, shiftDate(selected, view, -1), sourceEnabled, null)}>Previous</button><button type="button" className="min-h-11 rounded-[var(--vx-radius-control)] border border-[var(--vx-line-strong)] px-3 text-sm" onClick={() => navigate(view, shiftDate(selected, view, 1), sourceEnabled, null)}>Next</button></div></div>
      {!sourceEnabled ? <div className="rounded-[var(--vx-radius-control)] border border-[var(--vx-line)] bg-[var(--vx-surface)] p-4 text-sm text-[var(--vx-ink-soft)]"><p className="font-medium text-[var(--vx-ink)]">Add the Cebu 2026 source reference</p><p className="mt-1">It labels holidays, cutoffs, and pay days for context. A source date never changes your shift classification or creates a code.</p><button type="button" className="mt-3 min-h-11 rounded-[var(--vx-radius-control)] bg-[var(--vx-brand)] px-4 text-sm font-medium text-[var(--vx-on-deep)]" onClick={() => navigate(view, selected, true, activeDay)}>Show source reference</button></div> : <div className="flex flex-col gap-2 text-xs text-[var(--vx-muted)]"><div className="flex flex-wrap items-center justify-between gap-2"><span>{sourceUnavailable ? "Cebu 2026 source unavailable; personal records are still shown." : source ? "Source: " + source.site + " " + source.year + " · " + source.calendarFile : "Source unavailable"}</span><button type="button" className="min-h-11 underline underline-offset-2" onClick={() => navigate(view, selected, false, activeDay)}>Hide source reference</button></div><p>Source guidance from New Hire - Setting of Expectations (1).pdf, page 1: file night differentials every Friday or before payroll cutoff at midnight. Voyix does not file or submit records.</p></div>}
      <CalendarGrid days={days} selected={selected} sourceEvents={events} holidays={holidays} periods={periods} shifts={shifts} onSelect={(next) => navigate(view, selected, sourceEnabled, next)} />
    </div>}
    <Drawer title={activeDay ? "Details for " + activeDay : "Day details"} open={Boolean(activeDay)} onClose={() => navigate(view, selected, sourceEnabled, null)}>{details && activeDay ? <DayDetails date={activeDay} details={details} /> : null}</Drawer>
  </div>
}

function CalendarGrid({ days, selected, sourceEvents, holidays, periods, shifts, onSelect }: { days: string[]; selected: string; sourceEvents: SourceCalendarEvent[]; holidays: HolidayListItem[]; periods: PayrollPeriodListItem[]; shifts: SavedShiftListItem[]; onSelect: (date: string) => void }) {
  return <div className="flex flex-col gap-3"><div className="hidden grid-cols-7 gap-px rounded-[var(--vx-radius-panel)] border border-[var(--vx-line)] bg-[var(--vx-line)] lg:grid"><div className="col-span-7 grid grid-cols-7">{WEEKDAYS.map((day) => <div key={day} className="bg-[var(--vx-surface-soft)] px-3 py-2 text-center font-mono text-xs uppercase tracking-wide text-[var(--vx-muted)]">{day}</div>)}</div>{days.map((date) => <DayCell key={date} date={date} selected={date === selected} sourceEvents={sourceEvents} holidays={holidays} periods={periods} shifts={shifts} onSelect={onSelect} />)}</div><div className="grid gap-2 lg:hidden">{days.map((date) => <DayCell key={date} date={date} selected={date === selected} sourceEvents={sourceEvents} holidays={holidays} periods={periods} shifts={shifts} onSelect={onSelect} mobile />)}</div></div>
}

function DayCell({ date, selected, sourceEvents, holidays, periods, shifts, onSelect, mobile = false }: { date: string; selected: boolean; sourceEvents: SourceCalendarEvent[]; holidays: HolidayListItem[]; periods: PayrollPeriodListItem[]; shifts: SavedShiftListItem[]; onSelect: (date: string) => void; mobile?: boolean }) {
  const details = collectDay(date, sourceEvents, holidays, periods, shifts)
  return <button type="button" aria-label={"Open details for " + date} className={"flex " + (mobile ? "min-h-16" : "min-h-24") + " min-w-0 flex-col items-start gap-1 bg-[var(--vx-surface)] p-3 text-left " + (selected ? "ring-2 ring-inset ring-[var(--vx-brand)] " : "") + (mobile ? "rounded-[var(--vx-radius-control)] border border-[var(--vx-line)]" : "")} onClick={() => onSelect(date)}><span className="font-mono text-xs text-[var(--vx-muted)]">{date}</span>{details.shifts.length ? <span className="text-xs font-medium text-[var(--vx-brand)]">{details.shifts.length} saved shift{details.shifts.length > 1 ? "s" : ""}</span> : null}{details.source.slice(0, 2).map((event) => <span key={event.kind + event.label} className="truncate text-xs text-[var(--vx-ink-soft)]">{event.label}</span>)}{details.holidays.length ? <span className="text-xs text-[var(--vx-ink-soft)]">Personal note</span> : null}{details.periods.length ? <span className="text-xs text-[var(--vx-ink-soft)]">Payroll period</span> : null}</button>
}

function DayDetails({ date, details }: { date: string; details: ReturnType<typeof collectDay> }) {
  const addShiftHref = "/shift/new?workDate=" + date + (details.source.length ? "&source=cebu2026" : "")
  return <div className="flex flex-col gap-5"><div className="flex flex-col gap-3">{details.source.map((event) => <div key={event.kind + event.label} className="border-b border-[var(--vx-line)] pb-3"><p className="font-medium text-[var(--vx-ink)]">{event.label}</p><p className="text-sm text-[var(--vx-ink-soft)]">Source {event.kind}{event.classification ? " · " + event.classification + " holiday" : ""}</p></div>)}{details.holidays.map((item) => <div key={item.id} className="border-b border-[var(--vx-line)] pb-3"><p className="font-medium text-[var(--vx-ink)]">{item.name}</p><p className="text-sm text-[var(--vx-ink-soft)]">Your personal holiday note</p></div>)}{details.periods.map((item) => <div key={item.id} className="border-b border-[var(--vx-line)] pb-3"><p className="font-medium text-[var(--vx-ink)]">Payroll period</p><p className="text-sm text-[var(--vx-ink-soft)]">{item.periodStart} – {item.periodEnd}</p></div>)}{details.shifts.map((item) => <div key={item.id} className="border-b border-[var(--vx-line)] pb-3"><p className="font-medium text-[var(--vx-ink)]">Saved shift · {item.ndHours ? item.ndHours + " ND hours" : "ND result pending"}</p><p className="text-sm text-[var(--vx-ink-soft)]">{item.dayClassification.replaceAll("_", " ")}{item.wageCodes.length ? " · codes " + item.wageCodes.join(", ") : ""}</p>{item.recordId ? <a className="text-sm font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline" href={"/records/" + item.recordId}>Open record</a> : <p className="text-xs text-[var(--vx-muted)]">No saved calculation snapshot is available.</p>}</div>)}</div>{!details.source.length && !details.holidays.length && !details.periods.length && !details.shifts.length ? <p className="text-sm text-[var(--vx-muted)]">No entries for this day yet.</p> : null}<div className="flex flex-wrap gap-3"><a href={addShiftHref} className="min-h-11 rounded-[var(--vx-radius-control)] bg-[var(--vx-brand)] px-4 py-3 text-sm font-medium text-[var(--vx-on-deep)]">Add shift</a><p className="max-w-prose text-xs text-[var(--vx-muted)]">Source markers provide context only. They never set a day type or wage code.</p></div></div>
}

function collectDay(date: string, sourceEvents: SourceCalendarEvent[], holidays: HolidayListItem[], periods: PayrollPeriodListItem[], shifts: SavedShiftListItem[]) {
  return { source: sourceEvents.filter((event) => event.date === date), holidays: holidays.filter((item) => item.holidayDate === date), periods: periods.filter((item) => item.periodStart <= date && item.periodEnd >= date), shifts: shifts.filter((item) => item.workDate === date) }
}
function buildDays(date: string, view: View) { const base = DateTime.fromISO(date); if (view === "week") { const start = base.startOf("week"); return Array.from({ length: 7 }, (_, index) => start.plus({ days: index }).toISODate() || date) } const start = base.startOf("month").startOf("week"); return Array.from({ length: Math.ceil((base.endOf("month").endOf("week").diff(start, "days").days) / 7) * 7 }, (_, index) => start.plus({ days: index }).toISODate() || date) }
function shiftDate(date: string, view: View, amount: number) { const next = DateTime.fromISO(date).plus(view === "month" ? { months: amount } : { weeks: amount }); return next.toISODate() || date }
function validDate(value: string) { return /^\d{4}-\d{2}-\d{2}$/.test(value) && DateTime.fromISO(value).isValid }

function ReferenceCodeTable({ source }: { source: SourceCalendar }) { return <section className="flex flex-col gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--vx-muted)]">SOURCE REFERENCE</p><h2 className="text-xl font-semibold text-[var(--vx-ink)]">ADP reference codes</h2><p className="mt-1 text-sm text-[var(--vx-ink-soft)]">These non-ND rows are display-only. Percentages are source values; every formula remains TBD.</p></div><div className="overflow-x-auto rounded-[var(--vx-radius-panel)] border border-[var(--vx-line)] bg-[var(--vx-surface)]"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-[var(--vx-line)] text-xs uppercase tracking-wide text-[var(--vx-muted)]"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Hours</th><th className="px-4 py-3">Total % to be added</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-[var(--vx-line)]">{source.referenceCodes.map((item) => <tr key={item.code + item.category + item.hoursCategory}><td className="px-4 py-3 font-mono font-medium">{item.code}</td><td className="px-4 py-3">{item.category}</td><td className="px-4 py-3">{item.hoursCategory}</td><td className="px-4 py-3 font-mono">{item.percentage}%</td><td className="px-4 py-3">Reference only · {item.formulaStatus}</td></tr>)}</tbody></table></div><p className="text-sm text-[var(--vx-muted)]">Source onboarding guidance: file night differentials every Friday or before payroll cutoff at midnight. This source reference does not submit a timesheet, alter a payroll period, or select a wage code.</p></section> }

export { CalendarWorkspace }

