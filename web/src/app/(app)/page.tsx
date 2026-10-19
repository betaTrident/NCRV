import Link from "next/link"
import { ArrowUpRight, CalendarDays, Clock3, Coins, FileClock, MoonStar, ShieldCheck } from "lucide-react"

import { StatusLine } from "@/components/forms/status-line"
import { Ledger, type LedgerColumn } from "@/components/records/ledger"
import { OverviewActivity } from "@/components/records/overview-activity"
import { PageHeader } from "@/components/shell/page-header"
import { ButtonLink } from "@/components/ui/button"
import { formatPhp } from "@/lib/format"
import {
  loadOverview,
  type OverviewLedgerRow,
  type OverviewResult,
} from "@/server/queries/overview"

const LEDGER_COLUMNS: LedgerColumn<OverviewLedgerRow>[] = [
  {
    id: "workDate",
    header: "Date",
    cell: (row) => (
      <Link
        href={`/records/${row.id}`}
        className="font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline"
      >
        {row.workDate}
      </Link>
    ),
  },
  {
    id: "shift",
    header: "Shift",
    cell: (row) => row.shiftLabel,
  },
  {
    id: "day",
    header: "Day type",
    cell: (row) => row.dayLabel,
  },
  {
    id: "ndHours",
    header: "ND hours",
    numeric: true,
    cell: (row) => row.ndHours,
  },
  {
    id: "wageTypes",
    header: "Review status",
    cell: (row) => row.amountLabel.includes("TBD") ? "Amount TBD" : "Estimate",
  },
  {
    id: "amount",
    header: "Known estimate",
    numeric: true,
    cell: (row) => row.amountLabel,
  },
]

function UnavailableState() {
  return (
    <section className="vx-overview-panel flex flex-col items-start gap-4">
      <FileClock size={32} strokeWidth={1.25} aria-hidden="true" />
      <h2 className="text-lg font-semibold">Your overview is unavailable</h2>
      <p
        role="alert"
        className="inline-flex max-w-full items-center rounded-[var(--vx-radius-control)] bg-[var(--vx-rose-bg)] px-3 py-2 text-sm font-medium text-[var(--vx-rose)]"
      >
        Could not load this overview.
      </p>
      <p className="text-sm text-[var(--vx-muted)]">Your saved records could not be read. Reload to try again.</p>
      <form action="/" method="get"><button className="vx-button vx-button-outline" type="submit">Try again</button></form>
    </section>
  )
}

function ReadyState({
  overview,
}: {
  overview: Extract<OverviewResult, { status: "ready" }>
}) {
  const { period, summary, rows } = overview

  const metrics = [
    { label: "Total ND hours", value: `${summary.totalNdHours} hrs`, detail: "From your saved calculations", icon: MoonStar },
    { label: "Known estimate", value: overview.hasKnownAmount ? formatPhp(summary.estimatedCentavos) : summary.tbdLineCount ? "TBD" : "\u2014", detail: "Estimate only; excludes TBD amounts", icon: Coins },
    { label: "Saved entries", value: String(summary.entryCount), detail: "Personal shift records in this view", icon: FileClock },
    { label: "Unresolved lines", value: String(summary.tbdLineCount), detail: "Amounts that remain TBD", icon: Clock3 },
  ]
  return (
    <div className="vx-overview-content">
      <div className="vx-overview-scope">
        <CalendarDays size={18} aria-hidden="true" />
        <div><strong>{overview.scope === "period" ? "Your payroll period" : "This calendar month"}</strong><span>{period.periodStart} to {period.periodEnd}</span></div>
        <span className="vx-overview-scope-note">{overview.scope === "period" ? period.cutoffLabel ?? "Cutoff not recorded" : "Monthly activity; personal records"}</span>
      </div>
      <div className="vx-overview-metrics">
        {metrics.map(({ label, value, detail, icon: Icon }) => <section className="vx-overview-metric" key={label} aria-label={label}>
          <div className="vx-overview-metric-inset"><div className="vx-overview-metric-label"><Icon size={18} aria-hidden="true" /><h2>{label}</h2></div><p>{value}</p></div>
          <p className="vx-overview-metric-detail">{detail}</p>
        </section>)}
      </div>
      {overview.periodNotice ? <aside className="vx-overview-notice">
        <CalendarDays size={20} aria-hidden="true" /><div><h2>{overview.periodNotice === "none" ? "No payroll period yet" : "Payroll periods overlap"}</h2><p>{overview.periodNotice === "none" ? "Showing activity for this month. Add a personal period in Calendar to group your payroll-period totals." : "More than one active period covers today. Showing activity for this month until you resolve the overlap."}</p></div><ButtonLink href="/calendar" variant="quiet">Open calendar <ArrowUpRight size={15} aria-hidden="true" /></ButtonLink>
      </aside> : null}
      <OverviewActivity activity={overview.activity} start={period.periodStart} end={period.periodEnd} />
      <section className="vx-overview-panel" aria-labelledby="recent-title">
        <div className="vx-overview-section-head"><div><h2 id="recent-title">Recent shifts</h2><p>Your latest saved calculations in this view</p></div><ButtonLink href="/records" variant="quiet">View all <ArrowUpRight size={15} aria-hidden="true" /></ButtonLink></div>
        {rows.length ? <Ledger caption="Recent shift records" columns={LEDGER_COLUMNS} rows={rows} empty="No shifts in this view." /> : <div className="vx-overview-ledger-empty"><FileClock size={30} strokeWidth={1.25} aria-hidden="true" /><div><h3>No shifts recorded in this view</h3><p>Save your first shift to see its hours and calculation here.</p></div><ButtonLink href="/shift/new" variant="outline">Add your first shift</ButtonLink></div>}
      </section>
      <p className="vx-overview-disclaimer"><ShieldCheck size={15} aria-hidden="true" /> Private employee shiftbook. Estimates are not employer payroll; unresolved rules remain TBD.</p>
      {summary.tbdLineCount > 0 ? <StatusLine tone="estimate">Unresolved amounts are excluded from the total.</StatusLine> : null}
    </div>
  )
}

function OverviewBody({ overview }: { overview: OverviewResult }) {
  switch (overview.status) {
    case "signed-out":
    case "error":
      return <UnavailableState />
    case "ready":
      return <ReadyState overview={overview} />
  }
}

export default async function OverviewPage() {
  const overview = await loadOverview()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="YOUR HISTORY"
        title="Overview"
        description="Your night hours, estimates, and saved shifts at a glance."

      />
      <OverviewBody overview={overview} />
    </div>
  )
}
