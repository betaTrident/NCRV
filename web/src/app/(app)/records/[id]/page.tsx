import Link from "next/link"

import { RecordDetail } from "@/components/records/record-detail"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"
import { Button } from "@/components/ui/button"
import { loadRecordDetail } from "@/server/queries/records"

type RecordDetailPageProps = {
  params: Promise<{ id: string }>
}

function UnavailableRecord() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="CALCULATION TRACE"
        title="Record detail"
        description="Saved snapshot for this shift. Nothing here is recalculated."
      />
      <EmptyState
        title="This record isn't available"
        description="That saved shift isn't in your shiftbook."
        action={
          <Button asChild variant="outline">
            <Link href="/records">Back to records</Link>
          </Button>
        }
      />
    </div>
  )
}

function RecordLoadError({ id }: { id: string }) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="CALCULATION TRACE"
        title="Record detail"
        description="Saved snapshot for this shift. Nothing here is recalculated."
      />
      <div className="flex flex-col items-start gap-3">
        <p
          role="alert"
          className="max-w-prose rounded-[var(--vx-radius-control)] bg-[var(--vx-rose-bg)] px-3 py-2 text-sm font-medium text-[var(--vx-rose)]"
        >
          Could not load this record.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/records/${id}`}>Try again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/records">Back to records</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default async function RecordDetailPage({
  params,
}: RecordDetailPageProps) {
  const { id } = await params
  const result = await loadRecordDetail(id)

  switch (result.status) {
    case "signed-out":
    case "unavailable":
      return <UnavailableRecord />
    case "error":
      return <RecordLoadError id={id} />
    case "ready":
      return (
        <div className="flex flex-col gap-8">
          <PageHeader
            eyebrow="CALCULATION TRACE"
            title={result.detail.workDateLabel}
            description="Saved snapshot for this shift. Nothing here is recalculated."
            action={
              <Button asChild variant="outline">
                <Link href="/records">Back to records</Link>
              </Button>
            }
          />
          <RecordDetail detail={result.detail} />
        </div>
      )
  }
}
