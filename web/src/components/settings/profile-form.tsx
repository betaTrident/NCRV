"use client"

import { LegalModal } from "@/components/ui/legal-modal"
import { useActionState, useState } from "react"

import { Field } from "@/components/forms/field"
import { StatusLine } from "@/components/forms/status-line"
import { Panel } from "@/components/shell/panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import {
  createProfile,
  updateProfile,
  type SettingsActionState,
} from "@/server/actions/settings"
import type { ProfileValues } from "@/server/queries/settings"

const initialState: SettingsActionState = { fieldErrors: {} }

type ProfileFormProps = {
  profile: ProfileValues
  mode?: "create" | "update"
}

function ProfileForm({ profile, mode = "update" }: ProfileFormProps) {
  const [dirty, setDirty] = useState(false)
  const [name, setName] = useState(profile.name)
  const [salary, setSalary] = useState(profile.monthlyBasicSalary)
  const [state, formAction, pending] = useActionState(async (prev: SettingsActionState, data: FormData) => {
    const result = await (mode === "create" ? createProfile : updateProfile)(prev, data)
    if (result.formNotice && !result.formError) setDirty(false)
    return result
  }, initialState)
  const [scheduleType, setScheduleType] = useState<
    ProfileValues["workScheduleType"]
  >(profile.workScheduleType)
  const [scheduledRegularHours, setScheduledRegularHours] = useState(
    profile.workScheduleType === "STANDARD"
      ? "8.00"
      : profile.scheduledRegularHours,
  )
  const isStandard = scheduleType === "STANDARD"

  return (
    <Panel className="p-6 sm:p-8">
      <div className="flex flex-col gap-6">
        <h2 className="text-[15px] font-semibold text-[var(--vx-ink)]">
          My profile
        </h2>
<p className="text-sm text-[var(--vx-muted)]">Salary and schedule are defaults for new calculations. Saved shift snapshots keep their original values.</p>
        <form action={formAction} className="flex flex-col gap-4" onChange={() => setDirty(true)} noValidate>
          <fieldset disabled={pending} className="contents">
          <Field
            label="Name"
            htmlFor="profile-name"
            error={state.fieldErrors.name}
          >
            <Input
              id="profile-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={name} onChange={(event) => setName(event.target.value)}
              className="h-11"
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium">Sign-in email</p>
            <p className="text-sm break-all text-[var(--vx-ink)]">{profile.email}</p>
            <p className="text-xs text-[var(--vx-muted)]">Read only. Used only to sign in.</p>
          </div>

          <Field
            label="Monthly basic salary"
            htmlFor="profile-monthly-basic-salary"
            helper="Optional. Used to derive the computational hourly rate with factor 261."
            error={state.fieldErrors.monthlyBasicSalary}
          >
            <Input
              id="profile-monthly-basic-salary"
              name="monthlyBasicSalary"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={salary} onChange={(event) => setSalary(event.target.value)}
              className="h-11 font-mono"
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <p className="text-sm leading-none font-medium">
              Derived computational hourly rate
            </p>
            <p className="font-mono text-xs text-[var(--vx-muted)]">
              (monthly basic salary × 12) / 261 / 8
            </p>
            {profile.displayedHourlyRate === null ? (
              <StatusLine tone="estimate">
                A monthly basic salary has not been set. Nothing was assumed.
              </StatusLine>
            ) : (
              <p className="text-sm text-[var(--vx-ink)]">
                <span className="font-mono tabular-nums">
                  {profile.displayedHourlyRate}
                </span>{" "}
                Estimate
              </p>
            )}
            <p className="text-xs text-[var(--vx-muted)]">
              Factor 365 is monthly-paid context only. This rate uses 261.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Field label="Schedule type" htmlFor="profile-schedule-type" error={state.fieldErrors.workScheduleType}>
                <Select id="profile-schedule-type" disabled={pending} value={scheduleType}
                  options={[{value: "STANDARD", label: "Standard"}, {value: "APPROVED_CWW", label: "Approved compressed workweek"}]}
                  onValueChange={(value) => {
                    const next = value as ProfileValues["workScheduleType"]
                    setDirty(true)
                    setScheduleType(next)
                    if (next === "STANDARD") setScheduledRegularHours("8.00")
                  }} />
              </Field>
              <input
                type="hidden"
                name="workScheduleType"
                value={scheduleType}
              />
            </div>
            <Field
              label="Scheduled regular hours"
              htmlFor="profile-scheduled-regular-hours"
              helper={
                isStandard
                  ? "Standard schedules use exactly 8 hours."
                  : "Enter 8 through 12 hours."
              }
              error={state.fieldErrors.scheduledRegularHours}
            >
              <Input
                id="profile-scheduled-regular-hours"
                name="scheduledRegularHours"
                type="text"
                inputMode="decimal"
                readOnly={isStandard}
                value={scheduledRegularHours}
                onChange={(event) => {
                  setScheduledRegularHours(event.target.value)
                }}
                className="h-11 font-mono"
              />
            </Field>
          </div>

          {mode === "create" ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex min-h-11 items-center gap-3">
                <input
                  id="profile-terms"
                  name="termsAccepted"
                  type="checkbox"
                  required
                  className="size-4 shrink-0 accent-[var(--vx-brand)]"
                  aria-invalid={state.fieldErrors.termsAccepted ? true : undefined}
                  aria-describedby={
                    state.fieldErrors.termsAccepted
                      ? "profile-terms-error"
                      : undefined
                  }
                />
                <div className="text-sm text-[var(--vx-ink)]">
                  <label htmlFor="profile-terms">I agree to the Terms and Privacy Notice.</label>
                  <div className="text-xs"><LegalModal kind="terms" /> · <LegalModal kind="privacy" /></div>
                </div>
              </div>
              {state.fieldErrors.termsAccepted ? (
                <p
                  id="profile-terms-error"
                  role="alert"
                  className="text-xs text-[var(--vx-rose)]"
                >
                  {state.fieldErrors.termsAccepted}
                </p>
              ) : null}
            </div>
          ) : null}

          {pending ? (
            <StatusLine tone="pending">your profile</StatusLine>
          ) : null}
          {!pending && state.formError ? (
            <StatusLine tone="error">{state.formError}</StatusLine>
          ) : null}
          {!pending && !dirty && state.formNotice && !state.formError ? (
            <StatusLine tone="saved">on your profile</StatusLine>
          ) : null}

          {dirty ? <p role="status" className="text-sm text-[var(--vx-amber-ink)]">Unsaved profile changes</p> : null}
          <div className="pt-2">
            <Button type="submit" disabled={pending} aria-disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Create profile" : "Save profile"}
            </Button>
          </div>
          </fieldset>
        </form>
      </div>
    </Panel>
  )
}

export { ProfileForm }
export type { ProfileFormProps }
