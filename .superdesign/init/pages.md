# Page dependency trees

Trees include local application imports (route-group layouts are noted separately in `routes.md`); framework and package imports are omitted.

## / (Overview)

Entry: `web/src/app/(app)/page.tsx`
Dependencies:
- `web/src/components/forms/status-line.tsx`
- `web/src/components/records/ledger.tsx`
  - `web/src/components/ui/table.tsx`
- `web/src/components/records/metric.tsx`
  - `web/src/components/shell/panel.tsx`
- `web/src/components/records/period-banner.tsx`
- `web/src/components/shell/empty-state.tsx`
  - `web/src/components/shell/panel.tsx`
- `web/src/components/shell/page-header.tsx`
- `web/src/components/ui/button.tsx`
- `web/src/lib/format.ts`
- `web/src/server/queries/overview.ts`
  - `web/src/lib/supabase/server.ts`
  - `web/src/lib/record-summary.ts`

## /shift/new (Add Shift)

Entry: `web/src/app/(app)/shift/new/page.tsx`
Dependencies:
- `web/src/components/forms/status-line.tsx`
- `web/src/components/shell/page-header.tsx`
- `web/src/server/queries/shift-configuration.ts`
  - `web/src/lib/supabase/server.ts`
- `web/src/app/(app)/shift/new/shift-form.tsx`
  - `web/src/components/forms/field.tsx`
    - `web/src/components/ui/label.tsx`
  - `web/src/components/forms/status-line.tsx`
  - `web/src/components/shift/calculation-preview.tsx`
    - `web/src/components/shift/estimate-note.tsx`
    - `web/src/components/shift/night-window-timeline.tsx`
    - `web/src/components/shift/number-strip.tsx`
    - `web/src/components/shift/wage-type-table.tsx`
      - `web/src/components/shift/wage-code-chip.tsx`
      - `web/src/components/ui/table.tsx`
    - `web/src/components/shell/panel.tsx`
  - `web/src/components/ui/button.tsx`
  - `web/src/components/ui/input.tsx`
  - `web/src/components/ui/select.tsx`
  - `web/src/server/actions/shifts.ts`
    - `web/src/server/shift/parse-shift-entry.ts`
    - `web/src/server/shift/save-shift.ts`
    - `web/src/engine/calculate-nd.ts`

## /records (My Records)

Entry: `web/src/app/(app)/records/page.tsx`
Dependencies:
- `web/src/components/records/record-filters.tsx`
  - `web/src/components/forms/field.tsx`
  - `web/src/components/ui/button.tsx`
  - `web/src/components/ui/input.tsx`
- `web/src/components/records/records-table.tsx`
  - `web/src/components/records/ledger.tsx`
    - `web/src/components/ui/table.tsx`
- `web/src/components/shell/empty-state.tsx`
- `web/src/components/shell/page-header.tsx`
- `web/src/components/ui/button.tsx`
- `web/src/server/queries/records.ts`
  - `web/src/lib/record-filters.ts`
  - `web/src/lib/supabase/server.ts`

## /records/:id (Record Detail)

Entry: `web/src/app/(app)/records/[id]/page.tsx`
Dependencies:
- `web/src/components/records/record-detail.tsx`
  - `web/src/components/shift/estimate-note.tsx`
  - `web/src/components/shift/wage-type-table.tsx`
    - `web/src/components/shift/wage-code-chip.tsx`
    - `web/src/components/ui/table.tsx`
  - `web/src/components/shell/panel.tsx`
- `web/src/components/shell/empty-state.tsx`
- `web/src/components/shell/page-header.tsx`
- `web/src/components/ui/button.tsx`
- `web/src/server/queries/records.ts`
  - `web/src/lib/supabase/server.ts`

## /calendar (Calendar)

Entry: `web/src/app/(app)/calendar/page.tsx`
Dependencies:
- `web/src/components/ui/button.tsx`
- `web/src/components/shell/empty-state.tsx`
  - `web/src/components/shell/panel.tsx`
- `web/src/components/shell/page-header.tsx`

## /settings (Settings)

Entry: `web/src/app/(app)/settings/page.tsx`
Dependencies:
- `web/src/components/ui/button.tsx`
- `web/src/components/shell/empty-state.tsx`
  - `web/src/components/shell/panel.tsx`
- `web/src/components/shell/page-header.tsx`
- `web/src/server/actions/auth.ts`

## /login (Employee Sign In)

Entry: `web/src/app/(auth)/login/page.tsx`
Dependencies:
- `web/src/components/shell/auth-split.tsx`
  - `web/src/components/shell/wordmark.tsx`
- `web/src/components/shell/page-header.tsx`
- `web/src/app/(auth)/login/login-form.tsx`
  - `web/src/components/forms/field.tsx`
  - `web/src/components/forms/password-input.tsx`
    - `web/src/components/ui/button.tsx`
    - `web/src/components/ui/input.tsx`
  - `web/src/components/forms/status-line.tsx`
  - `web/src/components/ui/button.tsx`
  - `web/src/server/actions/auth.ts`

## /signup (Create Profile)

Entry: `web/src/app/(auth)/signup/page.tsx`
Dependencies:
- `web/src/components/shell/auth-split.tsx`
- `web/src/components/shell/page-header.tsx`
- `web/src/app/(auth)/signup/signup-form.tsx`
  - `web/src/components/forms/field.tsx`
  - `web/src/components/forms/password-input.tsx`
  - `web/src/components/forms/status-line.tsx`
  - `web/src/components/ui/button.tsx`
  - `web/src/components/ui/input.tsx`
  - `web/src/server/actions/auth.ts`

## /forgot-password and /reset-password

Entries: `web/src/app/(auth)/forgot-password/page.tsx`, `web/src/app/reset-password/page.tsx`
Dependencies:
- `web/src/components/shell/auth-split.tsx` → `web/src/components/shell/wordmark.tsx`
- `web/src/components/shell/page-header.tsx`
- respective local form (`forgot-password-form.tsx` or `reset-password-form.tsx`)
  - `web/src/components/forms/field.tsx`
  - `web/src/components/forms/password-input.tsx` (reset only)
  - `web/src/components/forms/status-line.tsx`
  - `web/src/components/ui/button.tsx`, `web/src/components/ui/input.tsx`
  - `web/src/server/actions/auth.ts`

## /privacy and /terms

Entries: `web/src/app/privacy/page.tsx`, `web/src/app/terms/page.tsx`
Dependencies:
- `web/src/components/shell/page-header.tsx`
- `web/src/components/shell/panel.tsx`

