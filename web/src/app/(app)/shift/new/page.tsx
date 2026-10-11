import { StatusLine } from "@/components/forms/status-line"
import { PageHeader } from "@/components/shell/page-header"
import { loadShiftConfiguration } from "@/server/queries/shift-configuration"

import { ShiftForm } from "./shift-form"

export default async function AddShiftPage() {
  const configuration = await loadShiftConfiguration()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="ADD A SHIFT"
        title="Calculate this shift"
        description="Your night hours, accounted for."
      />
      {configuration ? (
        <ShiftForm profile={configuration} rules={configuration.rules} />
      ) : (
        <StatusLine tone="error">
          Could not load your calculation settings. Try again.
        </StatusLine>
      )}
    </div>
  )
}
