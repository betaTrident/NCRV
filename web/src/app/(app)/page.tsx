import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"

export default function OverviewPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="YOUR HISTORY"
        title="Overview"
        description="Your current payroll period, three headline figures, and your most recent shifts."
      />
      <EmptyState
        title="No shifts recorded yet"
        description="Once you add a shift, your period summary and recent activity will appear here."
        action={
          <Button asChild>
            <Link href="/shift/new">Add shift</Link>
          </Button>
        }
      />
    </div>
  )
}
