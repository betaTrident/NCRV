import { RetryButton } from "@/components/ui/retry-button"
import { RecordFilters } from "@/components/records/record-filters"
import { RecordsPagination } from "@/components/records/records-pagination"
import { RecordsTable } from "@/components/records/records-table"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"
import { ButtonLink } from "@/components/ui/button"
import {
  loadRecords,
  type RecordsListResult,
} from "@/server/queries/records"

type RecordsSearch = {
  range?: string | string[]
  from?: string | string[]
  to?: string | string[]
  page?: string | string[]
  sort?: string | string[]
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
  page?: number
  sort?: string
}) {
  const search = new URLSearchParams()
  if (params.range) search.set("range", params.range)
  if (params.from) search.set("from", params.from)
  if (params.to) search.set("to", params.to)
  if (params.page && params.page > 1) search.set("page", String(params.page))
  if (params.sort === "oldest") search.set("sort", "oldest")
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

function UnavailableState() {
  return (
    <div className="flex flex-col items-start gap-3">
      <AlertMessage>Could not load these records.</AlertMessage>
      <RetryButton />
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
      description="Create a personal period in Calendar, or choose Week or Month above to see your shifts."
      action={
        <ButtonLink href="/calendar" variant="outline">Open calendar</ButtonLink>
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
      <ButtonLink href="/calendar" variant="outline">Open calendar</ButtonLink>
    </div>
  )
}

function EmptyRangeState() {
  return (
    <EmptyState
      title="No shifts in this range"
      description="Try another range or reset to this week. Add a shift if you are starting your history."
      action={
        <ButtonLink href="/shift/new">Add shift</ButtonLink>
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
      return <UnavailableState />
    case "invalid":
      return <InvalidState message={result.message} />
    case "no-period":
      return <NoPeriodState />
    case "overlap":
      return <OverlapState />
    case "custom-pending":
      return <p className="text-sm text-[var(--vx-muted)]">Choose both dates above to load your records.</p>
    case "ready":
      return result.rows.length === 0 ? (
        result.hasAnyRecords ? <EmptyRangeState /> : <EmptyState title="Your shiftbook starts here" description="Save your first shift to keep a private history of your night hours and estimates." action={<ButtonLink href="/shift/new">Add your first shift</ButtonLink>} />
      ) : (
        <div className="flex flex-col gap-5">
          <RecordsTable rows={result.rows} returnTo={tryAgainHref} />
          <RecordsPagination
            page={result.page}
            pageSize={result.pageSize}
            totalCount={result.totalCount}
            totalPages={result.totalPages}
            hrefForPage={(page) => recordsSearchHref({
              range: result.range,
              from: result.range === "custom" ? result.from : undefined,
              to: result.range === "custom" ? result.to : undefined,
              page,
              sort: result.sort,
            })}
          />
        </div>
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
  const page = firstSearchValue(params.page)
  const sort = firstSearchValue(params.sort)
  const result = await loadRecords({ range, from, to, page, sort })
  const parsedPage = page && /^\d+$/.test(page) ? Number(page) : undefined
  const tryAgainHref = recordsSearchHref({ range, from, to, page: parsedPage, sort })

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="MY RECORDS"
        title="My records"
        description="Saved shifts for a week, payroll period, month, or custom range."
      />
      <section className="vx-records-panel">
      <RecordFilters
        key={`${range ?? "week"}:${from ?? ""}:${to ?? ""}:${sort ?? "newest"}`}
        range={range}
        from={from}
        to={to}
        sort={sort}
      />
      {result.status === "ready" ? <div className="vx-records-summary"><div><strong>{result.totalCount} saved shifts</strong><p>{result.from} to {result.to}</p></div><p>ND = night differential; estimates exclude TBD amounts</p></div> : null}
      <div className="mt-5"><RecordsBody result={result} tryAgainHref={tryAgainHref} /></div>
      </section>
    </div>
  )
}
