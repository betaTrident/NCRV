"use client"

import { useActionState } from "react"
import { DateTime } from "luxon"

import { Field } from "@/components/forms/field"
import { StatusLine } from "@/components/forms/status-line"
import { Panel } from "@/components/shell/panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  addPayrollPeriod,
  type CalendarActionState,
} from "@/server/actions/calendar"
import type { PayrollPeriodListItem } from "@/server/queries/calendar"

const MANILA = "Asia/Manila"

const initialState: CalendarActionState = { fieldErrors: {} }

type PayrollPeriodPanelProps = {
  periods: PayrollPeriodListItem[]
}

function formatCalendarDate(value: string): string {
  const parsed = DateTime.fromISO(value, { zone: MANILA })
  return parsed.isValid ? parsed.toFormat("cccc, MMMM d, yyyy") : value
}

function formatClock(value: string): string {
  const trimmed = value.trim()
  const withSeconds = DateTime.fromFormat(trimmed.slice(0, 8), "HH:mm:ss", {
    zone: MANILA,
  })
  if (withSeconds.isValid) {
    return withSeconds.toFormat("h:mm a")
  }
  const withMinutes = DateTime.fromFormat(trimmed.slice(0, 5), "HH:mm", {
    zone: MANILA,
  })
  return withMinutes.isValid ? withMinutes.toFormat("h:mm a") : trimmed
}

function formatCutoff(
  cutoffDate: string | null,
  cutoffTime: string | null,
): string | null {
  const dateLabel = cutoffDate ? formatCalendarDate(cutoffDate) : null
  const timeLabel = cutoffTime ? formatClock(cutoffTime) : null
  if (dateLabel && timeLabel) {
    return `Cutoff ${dateLabel} at ${timeLabel}`
  }
  if (dateLabel) {
    return `Cutoff ${dateLabel}`
  }
  if (timeLabel) {
    return `Cutoff ${timeLabel}`
  }
  return null
}

function PayrollPeriodPanel({ periods }: PayrollPeriodPanelProps) {
  const [state, formAction, pending] = useActionState(
    addPayrollPeriod,
    initialState,
  )

  return (
    <Panel className="flex flex-col gap-6 p-6 sm:p-8">
      <h2 className="text-[15px] font-semibold text-[var(--vx-ink)]">
        Payroll periods
      </h2>

      {periods.length === 0 ? (
        <p className="text-sm text-[var(--vx-muted)]">
          No payroll periods yet. Add the dates you want this record to group.
          None were invented.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--vx-line)]">
          {periods.map((period) => {
            const cutoffLabel = formatCutoff(
              period.cutoffDate,
              period.cutoffTime,
            )

            return (
              <li
                key={period.id}
                className="flex flex-col gap-1 py-3 first:pt-0"
              >
                <p className="font-medium text-[var(--vx-ink)]">
                  {formatCalendarDate(period.periodStart)} -{" "}
                  {formatCalendarDate(period.periodEnd)}
                </p>
                {period.payDate ? (
                  <p className="text-sm text-[var(--vx-ink-soft)]">
                    Pay date {formatCalendarDate(period.payDate)}
                  </p>
                ) : null}
                {cutoffLabel ? (
                  <p className="text-sm text-[var(--vx-ink-soft)]">
                    {cutoffLabel}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}

      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Period start"
            htmlFor="period-start"
            error={state.fieldErrors.periodStart}
          >
            <Input
              id="period-start"
              name="periodStart"
              type="date"
              className="h-11"
            />
          </Field>
          <Field
            label="Period end"
            htmlFor="period-end"
            error={state.fieldErrors.periodEnd}
          >
            <Input
              id="period-end"
              name="periodEnd"
              type="date"
              className="h-11"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Pay date"
            htmlFor="pay-date"
            error={state.fieldErrors.payDate}
          >
            <Input id="pay-date" name="payDate" type="date" className="h-11" />
          </Field>
          <Field
            label="Cutoff date"
            htmlFor="cutoff-date"
            error={state.fieldErrors.cutoffDate}
          >
            <Input
              id="cutoff-date"
              name="cutoffDate"
              type="date"
              className="h-11"
            />
          </Field>
        </div>

        <Field
          label="Cutoff time"
          htmlFor="cutoff-time"
          error={state.fieldErrors.cutoffTime}
        >
          <Input
            id="cutoff-time"
            name="cutoffTime"
            type="time"
            className="h-11"
          />
        </Field>

        <p className="text-sm text-[var(--vx-muted)]">
          A period groups your own records. It is not an employer cutoff.
        </p>

        {pending ? (
          <StatusLine tone="pending">this payroll period</StatusLine>
        ) : null}
        {!pending && state.formError ? (
          <StatusLine tone="error">{state.formError}</StatusLine>
        ) : null}
        {!pending && state.formNotice && !state.formError ? (
          <StatusLine tone="saved">in your calendar</StatusLine>
        ) : null}

        <div className="pt-2">
          <Button type="submit" disabled={pending} aria-disabled={pending}>
            {pending ? "Saving…" : "Add payroll period"}
          </Button>
        </div>
      </form>
    </Panel>
  )
}

export { PayrollPeriodPanel }
export type { PayrollPeriodPanelProps }
