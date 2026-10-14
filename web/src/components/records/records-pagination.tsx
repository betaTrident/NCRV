import { ButtonLink } from "@/components/ui/button"

type RecordsPaginationProps = {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hrefForPage: (page: number) => string
}

function RecordsPagination({ page, pageSize, totalCount, totalPages, hrefForPage }: RecordsPaginationProps) {
  const first = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, totalCount)

  return (
    <nav aria-label="Records pages" className="flex flex-col gap-3 border-t border-[var(--vx-line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--vx-muted)]">Showing <span className="font-mono tabular-nums text-[var(--vx-ink)]">{first}–{last}</span> of <span className="font-mono tabular-nums text-[var(--vx-ink)]">{totalCount}</span></p>
      <div className="flex gap-2">
        {page > 1 ? <ButtonLink href={hrefForPage(page - 1)} variant="outline">Previous</ButtonLink> : null}
        {page < totalPages ? <ButtonLink href={hrefForPage(page + 1)} variant="outline">Next</ButtonLink> : null}
      </div>
    </nav>
  )
}

export { RecordsPagination }
export type { RecordsPaginationProps }
