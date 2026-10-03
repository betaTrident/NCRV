import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"

export default function RecordsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="PAYROLL RECORDS"
        title="My records"
        description="Every saved shift for the selected payroll period, week, or custom range."
      />
      <EmptyState
        title="You haven't saved any shifts yet"
        description="Saved shifts will list here with their estimated night-differential hours and wage code."
        action={
          <Button asChild>
            <Link href="/shift/new">Add shift</Link>
          </Button>
        }
      />
    </div>
  )
}
