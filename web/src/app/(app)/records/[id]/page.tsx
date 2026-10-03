import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"

export default function RecordDetailPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="CALCULATION TRACE"
        title="Record detail"
        description="The saved calculation snapshot for this shift, including the window, overlap, and wage code."
      />
      <EmptyState
        title="This record isn't available yet"
        description="Record detail pages open from a saved shift in My records."
        action={
          <Button asChild variant="outline">
            <Link href="/records">Back to records</Link>
          </Button>
        }
      />
    </div>
  )
}
