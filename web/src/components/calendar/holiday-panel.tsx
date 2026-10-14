"use client"

import { useActionState, useState } from "react"
import { DateTime } from "luxon"

import { Field } from "@/components/forms/field"
import { StatusLine } from "@/components/forms/status-line"
import { Panel } from "@/components/shell/panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  addHoliday,
  type CalendarActionState,
} from "@/server/actions/calendar"
import type { HolidayListItem } from "@/server/queries/calendar"

const MANILA = "Asia/Manila"

const initialState: CalendarActionState = { fieldErrors: {} }

const HOLIDAY_TYPE_OPTIONS = [
  {
    value: "REGULAR_PUBLIC_HOLIDAY",
    label: "Regular holiday",
  },
  {
    value: "SPECIAL_PUBLIC_HOLIDAY",
    label: "Special non-working holiday",
  },
] as const

type HolidayType = (typeof HOLIDAY_TYPE_OPTIONS)[number]["value"]

type HolidayPanelProps = {
  holidays: HolidayListItem[]
}

function formatCalendarDate(value: string): string {
  const parsed = DateTime.fromISO(value, { zone: MANILA })
  return parsed.isValid ? parsed.toFormat("cccc, MMMM d, yyyy") : value
}

function holidayTypeLabel(type: HolidayListItem["holidayType"]): string {
  const option = HOLIDAY_TYPE_OPTIONS.find((item) => item.value === type)
  return option?.label ?? "Holiday reference"
}

function HolidayPanel({ holidays }: HolidayPanelProps) {
  const [state, formAction, pending] = useActionState(
    addHoliday,
    initialState,
  )
  const [holidayType, setHolidayType] = useState<HolidayType>(
    "REGULAR_PUBLIC_HOLIDAY",
  )

  return (
    <Panel className="flex flex-col gap-6 p-6 sm:p-8">
      <h2 className="text-[15px] font-semibold text-[var(--vx-ink)]">
        Holiday references
      </h2>

      {holidays.length === 0 ? (
        <p className="text-sm text-[var(--vx-muted)]">
          No holiday references yet. Add one below.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--vx-line)]">
          {holidays.map((holiday) => (
            <li key={holiday.id} className="flex flex-col gap-1 py-3 first:pt-0">
              <p className="font-medium text-[var(--vx-ink)]">{holiday.name}</p>
              <p className="text-sm text-[var(--vx-ink-soft)]">
                {formatCalendarDate(holiday.holidayDate)}
              </p>
              <p className="text-sm text-[var(--vx-muted)]">
                {holidayTypeLabel(holiday.holidayType)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="flex flex-col gap-4" noValidate>
        <Field
          label="Holiday date"
          htmlFor="holiday-date"
          error={state.fieldErrors.holidayDate}
        >
          <Input
            id="holiday-date"
            name="holidayDate"
            type="date"
            className="h-11"
          />
        </Field>

        <Field
          label="Name"
          htmlFor="holiday-name"
          error={state.fieldErrors.name}
        >
          <Input id="holiday-name" name="name" type="text" className="h-11" />
        </Field>

        <Field
          label="Holiday type"
          htmlFor="holiday-type"
          helper="A Saturday or Sunday stays the type you choose. It is not turned into a rest day."
          error={state.fieldErrors.holidayType}
        >
          <Select
            id="holiday-type"
            name="holidayType"
            value={holidayType}
            options={HOLIDAY_TYPE_OPTIONS.map((option) => ({ ...option }))}
            onValueChange={(value) => setHolidayType(value as HolidayType)}
          />
        </Field>

        {pending ? <StatusLine tone="pending">this holiday</StatusLine> : null}
        {!pending && state.formError ? (
          <StatusLine tone="error">{state.formError}</StatusLine>
        ) : null}
        {!pending && state.formNotice && !state.formError ? (
          <StatusLine tone="saved">in your calendar</StatusLine>
        ) : null}

        <div className="pt-2">
          <Button type="submit" disabled={pending} aria-disabled={pending}>
            {pending ? "Saving…" : "Add holiday"}
          </Button>
        </div>
      </form>
    </Panel>
  )
}

export { HolidayPanel }
export type { HolidayPanelProps }
