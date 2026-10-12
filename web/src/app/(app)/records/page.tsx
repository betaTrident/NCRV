import Link from "next/link"

import { RecordFilters } from "@/components/records/record-filters"
import { RecordsTable } from "@/components/records/records-table"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
import {
  loadRecords,
  type RecordsListResult,
} from "@/server/queries/records"

type RecordsSearch = {
  range?: string | string[]
  from?: string | string[]
  to?: string | string[]
}

function firstSearchValue(
  value: string | string[] | undefined,
): string | undefined {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate && candidate.length > 0 ? candidate : undefined
}

function recordsSearchHref(params: {
  range?: string
  from?: string
  to?: string
}) {
  const search = new URLSearchParams()
  if (params.range) search.set("range", params.range)
  if (params.from) search.set("from", params.from)
  if (params.to) search.set("to", params.to)
  const query = search.toString()
  return query.length > 0 ? `/records?${query}` : "/records"
}

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

function UnavailableState({ href }: { href: string }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <AlertMessage>Could not load these records.</AlertMessage>
      <Button asChild variant="outline">
        <Link href={href}>Try again</Link>
      </Button>
    </div>
  )
}

function InvalidState({ message }: { message: string }) {
  return <AlertMessage>{message}</AlertMessage>
}

function NoPeriodState() {
  return (
    <EmptyState
      title="No payroll period yet"
      description="A personal payroll period is needed before this filter can group shifts. None was invented."
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
      <AlertMessage>
        More than one active payroll period covers today. No period was selected.
      </AlertMessage>
      <Button asChild variant="outline">
        <Link href="/calendar">Open calendar</Link>
      </Button>
    </div>
  )
}

function EmptyRangeState() {
  return (
    <EmptyState
      title="No shifts in this range"
      description="Saved shifts in this range will list here with their night-differential hours and wage codes."
      action={
        <Button asChild>
          <Link href="/shift/new">Add shift</Link>
        </Button>
      }
    />
  )
}

function RecordsBody({
  result,
  tryAgainHref,
}: {
  result: RecordsListResult
  tryAgainHref: string
}) {
  switch (result.status) {
    case "signed-out":
    case "error":
      return <UnavailableState href={tryAgainHref} />
    case "invalid":
      return <InvalidState message={result.message} />
    case "no-period":
      return <NoPeriodState />
    case "overlap":
      return <OverlapState />
    case "ready":
      return result.rows.length === 0 ? (
        <EmptyRangeState />
      ) : (
        <RecordsTable rows={result.rows} />
      )
  }
}

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<RecordsSearch>
}) {
  const params = await searchParams
  const range = firstSearchValue(params.range)
  const from = firstSearchValue(params.from)
  const to = firstSearchValue(params.to)
  const result = await loadRecords({ range, from, to })
  const tryAgainHref = recordsSearchHref({ range, from, to })

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="MY RECORDS"
        title="My records"
        description="Saved shifts for a week, payroll period, month, or custom range."
        action={
          <Button asChild>
            <Link href="/shift/new">Add shift</Link>
          </Button>
        }
      />
      <RecordFilters range={range} from={from} to={to} />
      <RecordsBody result={result} tryAgainHref={tryAgainHref} />
    </div>
  )
}
