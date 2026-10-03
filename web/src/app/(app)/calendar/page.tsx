import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="DATES & PERIODS"
        title="Calendar"
        description="Holiday references and payroll periods you've entered. Dates are never fabricated."
      />
      <EmptyState
        title="No holiday references or payroll periods yet"
        description="Add your payroll period schedule in Settings so Voyix Shift can group your records."
        action={
          <Button asChild variant="outline">
            <Link href="/settings">Go to settings</Link>
          </Button>
        }
      />
    </div>
  )
}
