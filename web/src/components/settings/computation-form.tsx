"use client"

import { useActionState, useState } from "react"

import { Field } from "@/components/forms/field"
import { StatusLine } from "@/components/forms/status-line"
import { Panel } from "@/components/shell/panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  updateComputation,
  type SettingsActionState,
} from "@/server/actions/settings"
import type { ComputationValues } from "@/server/queries/settings"

const initialState: SettingsActionState = { fieldErrors: {} }

type ComputationFormProps = {
  computation: ComputationValues
}

function ComputationForm({ computation }: ComputationFormProps) {
  const [dirty, setDirty] = useState(false)
  const [values, setValues] = useState(computation)
  const [state, formAction, pending] = useActionState(async (prev: SettingsActionState, data: FormData) => {
    const result = await updateComputation(prev, data)
    if (result.formNotice && !result.formError) setDirty(false)
    return result
  }, initialState)

  return (
    <Panel className="p-6 sm:p-8">
      <div className="flex flex-col gap-6">
        <h2 className="text-[15px] font-semibold text-[var(--vx-ink)]">
          Calculation preferences
        </h2>
<p className="text-sm text-[var(--vx-muted)]">Choose the night-differential window and default break for future calculations. Existing saved records are unchanged. Times use Asia/Manila.</p>
        <form action={formAction} className="flex flex-col gap-4" onChange={() => setDirty(true)} noValidate>
          <fieldset disabled={pending} className="contents">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="ND start"
              htmlFor="computation-nd-start"
              error={state.fieldErrors.ndStart}
            >
              <Input
                id="computation-nd-start"
                name="ndStart"
                type="time"
                value={values.ndStart} onChange={(event) => setValues({ ...values, ndStart: event.target.value })}
                className="h-11"
              />
            </Field>
            <Field
              label="ND end"
              htmlFor="computation-nd-end"
              error={state.fieldErrors.ndEnd}
            >
              <Input
                id="computation-nd-end"
                name="ndEnd"
                type="time"
                value={values.ndEnd} onChange={(event) => setValues({ ...values, ndEnd: event.target.value })}
                className="h-11"
              />
            </Field>
          </div>
          <p className="text-xs text-[var(--vx-muted)]">
            A window can cross midnight, such as 10:00 PM to 6:00 AM.
          </p>

          <Field
            label="Default unpaid break"
            htmlFor="computation-break-hours"
            helper="Hours excluded from worked time. This does not submit a payroll break."
            error={state.fieldErrors.breakHours}
          >
            <Input
              id="computation-break-hours"
              name="breakHours"
              type="text"
              inputMode="decimal"
              value={values.breakHours} onChange={(event) => setValues({ ...values, breakHours: event.target.value })}
              className="h-11 font-mono"
            />
          </Field>

          {pending ? (
            <StatusLine tone="pending">your computation</StatusLine>
          ) : null}
          {!pending && state.formError ? (
            <StatusLine tone="error">{state.formError}</StatusLine>
          ) : null}
          {!pending && !dirty && state.formNotice && !state.formError ? (
            <StatusLine tone="saved">on your computation settings</StatusLine>
          ) : null}

          {dirty ? <p role="status" className="text-sm text-[var(--vx-amber-ink)]">Unsaved calculation changes</p> : null}
          <div className="pt-2">
            <Button type="submit" disabled={pending} aria-disabled={pending}>
              {pending ? "Saving…" : "Save computation"}
            </Button>
          </div>
          </fieldset>
        </form>
      </div>
    </Panel>
  )
}

export { ComputationForm }
export type { ComputationFormProps }
