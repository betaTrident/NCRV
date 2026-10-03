import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shell/empty-state"
import { PageHeader } from "@/components/shell/page-header"

export default function AddShiftPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="ADD A SHIFT"
        title="Calculate this shift"
        description="Enter the start, end, and any break so Voyix Shift can estimate your night-differential hours."
      />
      <EmptyState
        title="The shift form isn't wired up yet"
        description="The entry form and the live calculation preview arrive in a later task."
        action={
          <Button disabled aria-disabled="true">
            Save shift
          </Button>
        }
      />
    </div>
  )
}
