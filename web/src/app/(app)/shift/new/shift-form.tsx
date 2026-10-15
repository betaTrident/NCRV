"use client"

import { useActionState, useState, useSyncExternalStore } from "react"

import { CalculationPreview } from "@/components/shift/calculation-preview"
import { Field } from "@/components/forms/field"
import { StatusLine } from "@/components/forms/status-line"
import { Panel } from "@/components/shell/panel"
import { Button, ButtonLink } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Segmented } from "@/components/ui/segmented"
import { calculateNd } from "@/engine/calculate-nd"
import type { DayClassification, NdResult, WageTypeRule, WorkScheduleType } from "@/engine/types"
import { formatPhp } from "@/lib/format"
import { saveShiftAction } from "@/server/actions/shifts"
import type { SaveShiftResult } from "@/server/shift/save-shift"
import { WeekForm } from "./week-form"
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

const subscribeReady = () => () => {}
const clientReady = () => true
const serverReady = () => false

const initialShiftActionState: SaveShiftResult = { fieldErrors: {} }

type ShiftFormProps = {
  profile: ShiftProfile
  rules: WageTypeRule[]
  employeeKey?: string
  sourceEvents?: SourceEvent[]
  initialWorkDate?: string
}

type SourceEvent = {
  date: string
  label: string
  kind: string
  classification: string | null
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

function ShiftForm({ profile, rules, employeeKey = "anonymous", sourceEvents = [], initialWorkDate = "" }: ShiftFormProps) {
  const interactive = useSyncExternalStore(subscribeReady, clientReady, serverReady)
  const [state, formAction, pending] = useActionState(
    saveShiftAction,
    initialShiftActionState,
  )
  const [workDate, setWorkDate] = useState(initialWorkDate)
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
  const [previewStale, setPreviewStale] = useState(false)
  const [mode, setMode] = useState<"day" | "week">("day")

  function invalidatePreview() {
    setPreviewStale(true)
  }

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
    setPreviewStale(false)
  }

  const saveAction = preview ? <div className="sticky bottom-[calc(var(--vx-bottom-nav)+env(safe-area-inset-bottom))] z-10 -mx-3 mt-4 flex items-center justify-between gap-3 border border-[var(--vx-line-strong)] bg-[var(--vx-brand-deep)] px-4 py-3 text-[var(--vx-on-deep)] shadow-lg sm:static sm:mx-0 sm:border-x-0 sm:border-b-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:text-[var(--vx-ink)] sm:shadow-none">
            <p className="text-sm"><span className="block text-xs text-[var(--vx-brand-light)] sm:text-[var(--vx-muted)]">Final ND</span><strong className="font-mono tabular-nums">{preview.result.ndHours} h</strong></p>
            <Button
              type="submit"
              form="day-shift-form"
              variant="outline"
              disabled={pending || preview === null || previewStale}
              aria-disabled={pending || preview === null || previewStale}
            >
              Save entry
            </Button></div> : null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 border-b border-[var(--vx-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--vx-muted)]">Entry cadence</p>
          <p className="mt-1 text-sm text-[var(--vx-muted)]">Record one shift or review a complete week.</p>
        </div>
        <Segmented
          name="entry-mode"
          value={mode}
          options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }]}
          onValueChange={(value) => setMode(value as "day" | "week")}
        />
      </div>
      {mode === "week" ? (
        <WeekForm profile={profile} rules={rules} employeeKey={employeeKey} sourceEvents={sourceEvents} onBack={() => setMode("day")} />
      ) : (
      <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-2">
      <Panel className="p-6 sm:p-8">
        <form id="day-shift-form" action={formAction} className="flex flex-col gap-4" noValidate>
          <fieldset disabled={!interactive} className="flex min-w-0 flex-col gap-4 border-0 p-0" aria-labelledby="shift-facts-heading">
          <div className="border-b border-[var(--vx-border)] pb-4">
            <h2 id="shift-facts-heading" className="text-lg font-semibold text-[var(--vx-ink)]">Shift facts</h2>
            <p className="mt-1 text-sm text-[var(--vx-muted)]">Enter what happened. Voyix keeps the calculation separate and reviewable.</p>
          </div>
          <Field label="Work date" htmlFor="work-date" error={fieldErrors.workDate}>
            <Input
              id="work-date"
              name="workDate"
              type="date"
              value={workDate}
              onChange={(event) => {
                setWorkDate(event.target.value)
                invalidatePreview()
              }}
              className="h-11 font-mono"
            />
          </Field>
          {sourceEvents.filter((event) => event.date === workDate).map((event) => (
            <p key={`${event.date}-${event.label}`} className="rounded-[var(--vx-radius-control)] bg-[var(--vx-amber-bg)] px-3 py-2 text-sm text-[var(--vx-ink)]">
              Source reference · NCR Voyix Cebu 2026: {event.label}. Review the day classification for this shift; Voyix will not change it automatically.
            </p>
          ))}

          <div className="mt-2 border-t border-[var(--vx-border)] pt-5">
            <h3 className="text-base font-semibold text-[var(--vx-ink)]">Schedule and overtime</h3>
            <p className="mt-1 text-sm text-[var(--vx-muted)]">Standard schedules use 8.00 regular hours. Change this only for an approved compressed workweek.</p>
          </div>
          <div className={scheduleType === "APPROVED_CWW" ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
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
                  invalidatePreview()
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
                  invalidatePreview()
                }}
                className="h-11 font-mono"
              />
            </Field>
          </div>

          <Field
            label="Day classification"
            htmlFor="day-classification"
            error={fieldErrors.dayClassification}
          >
            <Select
              id="day-classification"
              name="dayClassification"
              value={dayClassification}
              onValueChange={(value) => {
                setDayClassification(value as DayClassification)
                invalidatePreview()
              }}
              options={DAY_CLASSIFICATIONS.map((value) => ({
                value,
                label: DAY_CLASSIFICATION_LABELS[value],
              }))}
              aria-invalid={fieldErrors.dayClassification ? true : undefined}
            />
          </Field>

          <Field
            label="Break included in night differential"
            htmlFor="break-included-in-nd"
            helper={`Default unpaid break: ${profile.breakHours} hour`}
            error={fieldErrors.breakIncludedInNd}
          >
            <Select
              id="break-included-in-nd"
              name="breakIncludedInNd"
              value={breakIncludedInNd}
              onValueChange={(value) => {
                setBreakIncludedInNd(value)
                invalidatePreview()
              }}
              options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
              aria-invalid={fieldErrors.breakIncludedInNd ? true : undefined}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Schedule type"
              htmlFor="schedule-type"
              error={fieldErrors.scheduleType}
            >
              <Select
                id="schedule-type"
                name="scheduleType"
                value={scheduleType}
                onValueChange={(value) => {
                  const nextSchedule = value as WorkScheduleType
                  setScheduleType(nextSchedule)
                  if (nextSchedule === "STANDARD") setScheduledRegularHours("8.00")
                  invalidatePreview()
                }}
                options={[
                  { value: "STANDARD", label: "Standard" },
                  { value: "APPROVED_CWW", label: "Approved compressed workweek" },
                ]}
                aria-invalid={fieldErrors.scheduleType ? true : undefined}
              />
            </Field>
            {scheduleType === "APPROVED_CWW" ? <Field
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
                  invalidatePreview()
                }}
                className="h-11 font-mono"
              />
            </Field> : <input type="hidden" name="scheduledRegularHours" value="8.00" />}
          </div>

          <Field
            label="Overtime agreed or approved"
            htmlFor="overtime-approved"
            error={fieldErrors.overtimeApproved}
          >
            <Select
              id="overtime-approved"
              name="overtimeApproved"
              value={overtimeApproved}
              onValueChange={(value) => {
                setOvertimeApproved(value)
                invalidatePreview()
              }}
              options={[{ value: "false", label: "No" }, { value: "true", label: "Yes" }]}
              aria-invalid={fieldErrors.overtimeApproved ? true : undefined}
            />
          </Field>

          <p className="text-sm text-[var(--vx-muted)]">
            This does not submit anything to payroll.
          </p>

          {pending ? <StatusLine tone="pending">this entry</StatusLine> : null}
          {!pending && state.formError ? (
            <StatusLine tone="error">{state.formError}</StatusLine>
          ) : null}
          {!pending && state.savedId && !state.formError && !previewStale ? (
            <StatusLine tone="saved">in your shiftbook</StatusLine>
          ) : null}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
            <Button type="button" onClick={calculatePreview}>
              Calculate shift
            </Button>

            <ButtonLink href="/" variant="outline">Cancel</ButtonLink>
          </div>
          </fieldset>
        </form>
      </Panel>

      {preview ? (
        <CalculationPreview
          windowLabel={`${profile.ndStart} – ${profile.ndEnd}`}
          clockIntervals={preview.result.clockIntervals}
          segments={[
            {
              startLabel: preview.startLabel,
              endLabel: preview.endLabel,
              kind: "shift",
              track: "shift",
              hours: Number(preview.result.elapsedHours),
            },
            {
              startLabel: profile.ndStart,
              endLabel: profile.ndEnd,
              kind: "overlap",
              track: "nd",
              hours: Number(preview.result.potentialNdHours),
              displayLabel: "Potential ND aggregate",
              displayValue: `${Number(preview.result.potentialNdHours).toFixed(2)} h`,
            },
            { startLabel: "", endLabel: "", kind: "qualifying", track: "qualifying", hours: Number(preview.result.ndHours), displayLabel: "Final ND aggregate", displayValue: `${preview.result.ndHours} h` },
            ...(!preview.result.breakIncludedInNd && Number(preview.result.breakHours) > 0
              ? [{
                  startLabel: "",
                  endLabel: "",
                  kind: "excluded-break" as const,
                  hours: Number(preview.result.breakHours),
                }]
              : []),
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
          stale={previewStale}
          actions={saveAction}
        />
      ) : (
        <Panel className="p-6 sm:p-8">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--vx-muted)]">Calculation receipt</p>
          <h2 className="mt-3 text-lg font-semibold text-[var(--vx-ink)]">Ready when the shift facts are complete</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--vx-muted)]">
            Calculate to review the exact night window, qualifying hours, ADP wage lines, and any rules that are still TBD before saving.
          </p>
        </Panel>
      )}
      </div>
      )}
    </div>
  )
}

export { ShiftForm }
export type { ShiftFormProps }
