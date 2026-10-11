import Link from "next/link"

import { StatusLine } from "@/components/forms/status-line"
import { Ledger, type LedgerColumn } from "@/components/records/ledger"
import { Metric } from "@/components/records/metric"
import { PeriodBanner } from "@/components/records/period-banner"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
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
    header: "Wage types",
    cell: (row) => row.wageCodes,
  },
  {
    id: "amount",
    header: "Amount",
    numeric: true,
    cell: (row) => row.amountLabel,
  },
]

function UnavailableState() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p
        role="alert"
        className="inline-flex max-w-full items-center rounded-[var(--vx-radius-control)] bg-[var(--vx-rose-bg)] px-3 py-2 text-sm font-medium text-[var(--vx-rose)]"
      >
        Could not load this overview.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Try again</Link>
      </Button>
    </div>
  )
}

function NoPeriodState() {
  return (
    <EmptyState
      title="No payroll period yet"
      description="A personal payroll period is needed before totals can be grouped. None was invented."
      action={
        <Button asChild variant="outline">
          <Link href="/calendar">Open calendar</Link>
        </Button>
      }
    />
  )
}

function OverlapState() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p
        role="alert"
        className="max-w-prose rounded-[var(--vx-radius-control)] bg-[var(--vx-rose-bg)] px-3 py-2 text-sm font-medium text-[var(--vx-rose)]"
      >
        More than one active payroll period covers today. No period was selected.
      </p>
      <Button asChild variant="outline">
        <Link href="/calendar">Open calendar</Link>
      </Button>
    </div>
  )
}

function ReadyState({
  overview,
}: {
  overview: Extract<OverviewResult, { status: "ready" }>
}) {
  const { period, summary, rows } = overview

  return (
    <div className="flex flex-col gap-8">
      <PeriodBanner
        periodStart={period.periodStart}
        periodEnd={period.periodEnd}
        cutoffLabel={period.cutoffLabel}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Total ND hours" value={`${summary.totalNdHours} hrs`} />
        <Metric
          label="Known estimate"
          value={formatPhp(summary.estimatedCentavos)}
          detail="Estimate only. Unresolved amounts are not included."
        />
        <Metric label="Entries" value={String(summary.entryCount)} />
      </div>
      {summary.tbdLineCount > 0 ? (
        <StatusLine tone="estimate">
          Unresolved amounts are excluded from the total.
        </StatusLine>
      ) : null}
      <Ledger
        caption="Recent shifts"
        columns={LEDGER_COLUMNS}
        rows={rows}
        empty="No shifts in this period."
      />
    </div>
  )
}

function OverviewBody({ overview }: { overview: OverviewResult }) {
  switch (overview.status) {
    case "signed-out":
    case "error":
      return <UnavailableState />
    case "no-period":
      return <NoPeriodState />
    case "overlap":
      return <OverlapState />
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
        description="Your current payroll period, three headline figures, and your most recent shifts."
        action={
          <Button asChild>
            <Link href="/shift/new">Add shift</Link>
          </Button>
        }
      />
      <OverviewBody overview={overview} />
    </div>
  )
}
