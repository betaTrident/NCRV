import { DateTime } from "luxon"
import { StatusLine } from "@/components/forms/status-line"
import sourceReference from "@/lib/source-reference.json"
import { getRequestClaims } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shell/page-header"
import { loadShiftConfiguration } from "@/server/queries/shift-configuration"

import { ShiftForm } from "./shift-form"

type AddShiftSearch = { source?: string | string[]; workDate?: string | string[] }

export default async function AddShiftPage({
  searchParams,
}: {
  searchParams?: Promise<AddShiftSearch>
}) {
  const configuration = await loadShiftConfiguration()
  const { data: claimData } = await getRequestClaims()
  const employeeKey = typeof claimData?.claims?.sub === "string" ? claimData.claims.sub : "anonymous"
  const source = await searchParams
  const sourceValue = Array.isArray(source?.source) ? source?.source[0] : source?.source
  const workDateValue = Array.isArray(source?.workDate) ? source?.workDate[0] : source?.workDate
  const sourceEvents = sourceValue === "cebu2026"
    ? sourceReference.events.filter((event) => event.kind === "holiday")
    : []

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="ADD A SHIFT"
        title="Calculate this shift"
        description="Your night hours, accounted for."
      />
      {configuration ? (
        <ShiftForm
          profile={configuration}
          rules={configuration.rules}
          employeeKey={employeeKey}
          sourceEvents={sourceEvents}
          initialWorkDate={workDateValue && /^\d{4}-\d{2}-\d{2}$/.test(workDateValue) && DateTime.fromISO(workDateValue).isValid ? workDateValue : ""}
        />
      ) : (
        <StatusLine tone="error">
          Could not load your calculation settings. Try again.
        </StatusLine>
      )}
    </div>
  )
}
