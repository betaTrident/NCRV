"use client"

import Link from "next/link"
import { useActionState, useState } from "react"

import { CalculationPreview } from "@/components/shift/calculation-preview"
import { Field } from "@/components/forms/field"
import { StatusLine } from "@/components/forms/status-line"
import { Panel } from "@/components/shell/panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { calculateNd } from "@/engine/calculate-nd"
import type { DayClassification, NdResult, WageTypeRule, WorkScheduleType } from "@/engine/types"
import { formatPhp } from "@/lib/format"
import { saveShiftAction } from "@/server/actions/shifts"
import type { SaveShiftResult } from "@/server/shift/save-shift"
import {
  buildShiftInput,
  DAY_CLASSIFICATIONS,
  parseShiftEntry,
  type ShiftFieldErrors,
  type ShiftProfile,
} from "@/server/shift/parse-shift-entry"

const DAY_CLASSIFICATION_LABELS: Record<DayClassification, string> = {
  REGULAR_WORK_DAY: "Regular Work Day",
  REST_DAY: "Rest Day",
  SPECIAL_PUBLIC_HOLIDAY: "Special Public Holiday",
  SPECIAL_PUBLIC_HOLIDAY_REST_DAY: "Special Public Holiday + Rest Day",
  REGULAR_PUBLIC_HOLIDAY: "Regular/Public Holiday",
  REGULAR_PUBLIC_HOLIDAY_REST_DAY: "Regular/Public Holiday + Rest Day",
  DOUBLE_REGULAR_HOLIDAY: "Double Regular Holiday",
  DOUBLE_REGULAR_HOLIDAY_REST_DAY: "Double Regular Holiday + Rest Day",
}

const initialShiftActionState: SaveShiftResult = { fieldErrors: {} }

type ShiftFormProps = {
  profile: ShiftProfile
  rules: WageTypeRule[]
}

type PreviewState = {
  result: NdResult
  startLabel: string
  endLabel: string
  overtimeApprovedLabel: "Yes" | "No"
}

function previewRows(result: NdResult) {
  return result.lines.map((line) => ({
    code: line.code,
    categoryLabel: line.description,
    hours: line.hours,
    percentage: line.percentage,
    amountStatus: line.status,
    formattedAmount:
      line.status === "estimated" ? formatPhp(line.centavos) : "TBD",
  }))
}

function ShiftForm({ profile, rules }: ShiftFormProps) {
  const [state, formAction, pending] = useActionState(
    saveShiftAction,
    initialShiftActionState,
  )
  const [workDate, setWorkDate] = useState("")
  const [shiftStart, setShiftStart] = useState("")
  const [shiftEnd, setShiftEnd] = useState("")
  const [dayClassification, setDayClassification] =
    useState<DayClassification>("REGULAR_WORK_DAY")
  const [breakIncludedInNd, setBreakIncludedInNd] = useState("false")
  const [scheduleType, setScheduleType] = useState<WorkScheduleType>("STANDARD")
  const [scheduledRegularHours, setScheduledRegularHours] = useState("8.00")
  const [overtimeApproved, setOvertimeApproved] = useState("false")
  const [localFieldErrors, setLocalFieldErrors] = useState<ShiftFieldErrors>({})
  const [preview, setPreview] = useState<PreviewState | null>(null)

  const fieldErrors: ShiftFieldErrors = {
    ...localFieldErrors,
    ...state.fieldErrors,
  }

  function calculatePreview() {
    const parsed = parseShiftEntry({
      workDate,
      shiftStart,
      shiftEnd,
      dayClassification,
      breakIncludedInNd,
      scheduleType,
      scheduledRegularHours,
      overtimeApproved,
    })

    if (!parsed.success) {
      setLocalFieldErrors(parsed.fieldErrors)
      setPreview(null)
      return
    }

    const input = buildShiftInput(parsed.data, profile)
    const result = calculateNd(input, rules)
    setLocalFieldErrors({})
    setPreview({
      result,
      startLabel: parsed.data.shiftStart,
      endLabel: parsed.data.shiftEnd,
      overtimeApprovedLabel: parsed.data.overtimeApproved ? "Yes" : "No",
    })
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-2">
      <Panel className="p-6 sm:p-8">
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <Field label="Work date" htmlFor="work-date" error={fieldErrors.workDate}>
            <Input
              id="work-date"
              name="workDate"
              type="date"
              value={workDate}
              onChange={(event) => {
                setWorkDate(event.target.value)
                setPreview(null)
              }}
              className="h-11 font-mono"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Shift start"
              htmlFor="shift-start"
              error={fieldErrors.shiftStart}
            >
              <Input
                id="shift-start"
                name="shiftStart"
                type="time"
                value={shiftStart}
              onChange={(event) => {
                setShiftStart(event.target.value)
                setPreview(null)
              }}
                className="h-11 font-mono"
              />
            </Field>
            <Field
              label="Shift end"
              htmlFor="shift-end"
              error={fieldErrors.shiftEnd}
            >
              <Input
                id="shift-end"
                name="shiftEnd"
                type="time"
                value={shiftEnd}
              onChange={(event) => {
                setShiftEnd(event.target.value)
                setPreview(null)
              }}
                className="h-11 font-mono"
              />
            </Field>
          </div>

          <Select
            value={dayClassification}
            onValueChange={(value) => {
              setDayClassification(value as DayClassification)
              setPreview(null)
            }}
          >
            <Field
              label="Day classification"
              htmlFor="day-classification"
              error={fieldErrors.dayClassification}
            >
              <SelectTrigger
                id="day-classification"
                className="min-h-11 w-full"
              >
                <SelectValue />
              </SelectTrigger>
            </Field>
            <SelectContent>
              {DAY_CLASSIFICATIONS.map((value) => (
                <SelectItem key={value} value={value}>
                  {DAY_CLASSIFICATION_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="dayClassification" value={dayClassification} />

          <Select
            value={breakIncludedInNd}
            onValueChange={(value) => {
              setBreakIncludedInNd(value)
              setPreview(null)
            }}
          >
            <Field
              label="Break included in night differential"
              htmlFor="break-included-in-nd"
              helper={`Default unpaid break: ${profile.breakHours} hour`}
              error={fieldErrors.breakIncludedInNd}
            >
              <SelectTrigger
                id="break-included-in-nd"
                className="min-h-11 w-full"
              >
                <SelectValue />
              </SelectTrigger>
            </Field>
            <SelectContent>
              <SelectItem value="false">No</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="hidden"
            name="breakIncludedInNd"
            value={breakIncludedInNd}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Select
                value={scheduleType}
                onValueChange={(value) => {
                  setScheduleType(value as WorkScheduleType)
                  setPreview(null)
                }}
              >
                <Field
                  label="Schedule type"
                  htmlFor="schedule-type"
                  error={fieldErrors.scheduleType}
                >
                  <SelectTrigger id="schedule-type" className="min-h-11 w-full">
                    <SelectValue />
                  </SelectTrigger>
                </Field>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard</SelectItem>
                  <SelectItem value="APPROVED_CWW">
                    Approved compressed workweek
                  </SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="scheduleType" value={scheduleType} />
            </div>
            <Field
              label="Scheduled regular hours"
              htmlFor="scheduled-regular-hours"
              error={fieldErrors.scheduledRegularHours}
            >
              <Input
                id="scheduled-regular-hours"
                name="scheduledRegularHours"
                type="text"
                inputMode="decimal"
                value={scheduledRegularHours}
                onChange={(event) => {
                  setScheduledRegularHours(event.target.value)
                  setPreview(null)
                }}
                className="h-11 font-mono"
              />
            </Field>
          </div>

          <Select
            value={overtimeApproved}
            onValueChange={(value) => {
              setOvertimeApproved(value)
              setPreview(null)
            }}
          >
            <Field
              label="Overtime agreed or approved"
              htmlFor="overtime-approved"
              error={fieldErrors.overtimeApproved}
            >
              <SelectTrigger id="overtime-approved" className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
            </Field>
            <SelectContent>
              <SelectItem value="false">No</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="overtimeApproved" value={overtimeApproved} />

          <p className="text-sm text-[var(--vx-muted)]">
            This does not submit anything to payroll.
          </p>

          {pending ? <StatusLine tone="pending">this entry</StatusLine> : null}
          {!pending && state.formError ? (
            <StatusLine tone="error">{state.formError}</StatusLine>
          ) : null}
          {!pending && state.savedId && !state.formError ? (
            <StatusLine tone="saved">in your shiftbook</StatusLine>
          ) : null}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
            <Button type="button" onClick={calculatePreview}>
              Calculate shift
            </Button>
            <Button type="submit" disabled={pending} aria-disabled={pending}>
              Save entry
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Cancel</Link>
            </Button>
          </div>
        </form>
      </Panel>

      {preview ? (
        <CalculationPreview
          windowLabel={`${profile.ndStart} – ${profile.ndEnd}`}
          segments={[
            {
              startLabel: preview.startLabel,
              endLabel: preview.endLabel,
              kind: "shift",
            },
          ]}
          shiftLabel={`${preview.startLabel} – ${preview.endLabel}`}
          dayClassificationLabel={
            DAY_CLASSIFICATION_LABELS[preview.result.dayClassification]
          }
          elapsedHours={preview.result.elapsedHours}
          workedHours={preview.result.workedHours}
          scheduledRegularHours={preview.result.scheduledRegularHours}
          regularHours={preview.result.regularHours}
          potentialOvertimeHours={preview.result.potentialOvertimeHours}
          approvedOvertimeHours={preview.result.approvedOvertimeHours}
          unapprovedExtraHours={preview.result.unapprovedExtraHours}
          overtimeApprovedLabel={preview.overtimeApprovedLabel}
          potentialNdHours={preview.result.potentialNdHours}
          breakHours={preview.result.breakHours}
          breakIncludedInNd={preview.result.breakIncludedInNd}
          ndHours={preview.result.ndHours}
          rows={previewRows(preview.result)}
          unresolved={preview.result.unresolved}
        />
      ) : (
        <Panel className="p-6 sm:p-8">
          <p className="text-sm text-[var(--vx-muted)]">
            Calculate this shift to see night hours and wage lines.
          </p>
        </Panel>
      )}
    </div>
  )
}

export { ShiftForm }
export type { ShiftFormProps }
