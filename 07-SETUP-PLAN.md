# Voyix Shift Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a serverless Voyix Shift app on Next.js, Supabase, and Vercel, with a token-driven component library and a design workflow that keeps the interface premium, quiet, and accessible.

**Architecture:** One Next.js App Router application in `web/` is the only runtime. Signed-in pages render on the server. Mutations go through Server Actions. The night-differential calculation is a pure TypeScript module imported by both the live preview and the save action, so the preview and the stored snapshot use the same math. Supabase provides Postgres, Auth, and row-level security. Vercel runs the Next.js server functions. There is no separate API service and no Supabase Edge Function in version 1. `src/proxy.ts` only refreshes the auth cookies. Layouts, Server Actions, and row-level security decide who may read or write.

**Tech stack:** Node.js 22, pnpm 10, Next.js 16 (App Router, `src/`, Turbopack), React 19, TypeScript strict, Tailwind CSS 4, shadcn/ui on Radix, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Zod, React Hook Form, Luxon, decimal.js, Vitest, Playwright, axe-core.

## Global constraints

These apply to every task. Values are copied from the product documents.

- The product is a private employee shiftbook for night differential. It is not an employer payroll system. There are no manager or admin accounts and no approval workflow.
- Night differential window default: 10:00 PM to 6:00 AM the next day. The 1-hour unpaid break always reduces elapsed time to worked time. The employee separately records whether that break was included in ND; that answer changes only ND overlap.
- A 9:00 PM–6:00 AM shift has 8 potential ND hours. Final ND is 7 when the break is excluded and 8 when it is included. That clarified rule is authoritative.
- Saturday and Sunday are not rest days. Day classification is chosen per shift.
- Monthly basic salary is the source value. Derive the computational rate as `(monthly basic salary x 12) / 261 / 8`. Factor 365 is context only and is never an engine divisor.
- Standard scheduled regular hours are 8. An approved CWW may exceed 8 but must stay between 8 and 12 hours inclusive. NCR Voyix's normal context remains 40 hours per week, such as an approved 10-hour-by-4-day CWW. Potential overtime is worked hours above the configured schedule and counts as approved overtime only when the employee records that it was agreed or approved; the app performs no approval and the schedule constraint invents no wage-code mapping.
- One calculation may produce many wage-type lines. Wage types are data, not `if` statements. Do not invent ADP codes or percentages that are absent from `02-WAGE-TYPES.md`.
- The ADP column means `TOTAL % to be added`. Only the ordinary-day 10% case has a confirmed money formula: 10% of the regular hourly wage for each qualifying hour. Every other amount stays an explicit TBD estimate state until a formula is confirmed.
- Overnight shifts that cross a holiday or day classification, the allocation of ND between regular and approved-overtime portions, and code 2252 remain configurable TBD. The UI says so in words.
- Brand purple is exactly `#5F249F`. Deep structural purple is exactly `#341A4B`. Do not add a second brand hue, a purple-to-blue gradient, or a dark-mode palette in version 1.
- Green is only for saved, private, or confirmed states, and it is always paired with words or an icon. Amber means estimate, pending, or TBD. Rose means error.
- Interface type is Manrope. Time, dates, hours, employee codes, and money are IBM Plex Mono with tabular figures. Currency is PHP, grouped, two decimals, prefixed with ₱.
- Copy stays plain and employee-centered. Amounts are called estimates. The app never implies payroll submission or employer verification.
- Version 1 asks one question of every feature: does it help an employee calculate, understand, or track their night differential?

---

## What this plan produces

A repository that builds, authenticates an employee, stores only that employee's rows, and renders the Voyix Shift shell with real tokens and empty page landmarks.

The calculation cases in `06-IMPLEMENTATION-PLAN.md` and the filled screens in `05-USER-INTERFACE.md` are the next plans. This plan creates the module boundaries those plans must use. It does not invent the unresolved payroll formulas.

## Locked decisions

| Topic | Decision |
| --- | --- |
| App location | `web/`. Product specs stay at the repository root. Vercel root directory is `web`. |
| Repo shape | One package. No Turborepo, no shared UI package, no separate component registry service. |
| Rendering | Signed-in routes are dynamic server renders. Cache Components stay off. Private records must not be statically cached. |
| Session | Supabase Auth, email and password, cookie session via `@supabase/ssr`. `web/src/proxy.ts` refreshes cookies. It is not the authorization boundary. |
| Sign-in identifier | Email is required because Supabase Auth uses it. Employee ID is a required unique profile field. The signup copy says the email is only for signing back in, and that registration does not verify employment. |
| Email confirmation | Off for version 1 so the profile row can be saved in the same step as signup. Password reset stays available. |
| Authorization | `employees.id` equals `auth.users.id`. Policies use that id. Never authorize from `user_metadata`. |
| Reference data | Seeded wage types are read-only to the client. Holidays and payroll periods the employee adds are personal rows. Shared seed rows have no owner. |
| Money and hours | Engine uses decimal.js. Persisted hours and money use `numeric`. Never use binary floats for amounts. |
| Time zone | `Asia/Manila`, stored on the employee profile, defaulted there. Luxon owns interval math. |
| Preview vs save | The browser preview and the server save both call `calculateNd`. The server result is the one that is stored. |
| Component approach | shadcn/ui primitives are copied into the repo and recolored with Voyix tokens. Pages compose domain components. Pages do not restyle primitives with one-off hex values. |
| Motion | CSS only. About 180 ms for controls, one 280 ms / 5 px page entrance. `prefers-reduced-motion: reduce` removes the entrance. No GSAP, no scroll timelines, no looping animation. |
| Theme | Light paper canvas and a deep-purple rail. Dark mode is a later design project with its own contrast pass. |
| Wordmark | Lowercase `voyixshift`. On the deep-purple rail, `shift` is `#C3A3E0`. Version 1 does not ship an invented logo, initials tile, or emoji mark. |
| Button height | 44 px minimum. This meets the touch target in `DESIGN.md` and WCAG 2.2 target size. |
| Region | Supabase and Vercel both in Singapore, the closest region to the Philippines. |

## Left out of version 1

These are common additions that this product does not need yet.

- Redux, Zustand, or a client cache beyond the live shift preview.
- Prisma, Drizzle, tRPC, NextAuth, and a custom backend.
- Chart libraries, admin kits, command palettes, and notification centers.
- Framer Motion and GSAP. The motion budget is short CSS.
- OAuth and employer single sign-on.
- A public marketing page. Signed-out visitors go to login.
- CSV export, edit/delete polish, and backup UX. Those remain Phase 5 of `06-IMPLEMENTATION-PLAN.md`.

---

## Repository layout

```text
VoyixNDX/
  00-README.md … 07-SETUP-PLAN.md
  DESIGN.md
  PRODUCT.md                          durable product facts for Impeccable
  .cursor/rules/voyix-design.mdc      design gate for every UI change
  .superdesign/design-system.md       existing Add Shift screen spec
  supabase/
    config.toml
    migrations/<timestamp>_foundation.sql
    seed.sql
  web/
    AGENTS.md                         short pointer to the root specs
    components.json
    next.config.ts
    package.json
    src/proxy.ts                      cookie refresh only, no access decisions
    src/app/globals.css               the only color source
    src/app/layout.tsx                fonts, metadata, body
    src/app/(auth)/login/page.tsx
    src/app/(auth)/signup/page.tsx
    src/app/(auth)/layout.tsx
    src/app/(app)/layout.tsx          AppShell
    src/app/(app)/page.tsx            Overview
    src/app/(app)/shift/new/page.tsx
    src/app/(app)/records/page.tsx
    src/app/(app)/records/[id]/page.tsx
    src/app/(app)/calendar/page.tsx
    src/app/(app)/settings/page.tsx
    src/components/ui/                shadcn primitives
    src/components/shell/
    src/components/shift/
    src/components/records/
    src/components/forms/
    src/engine/                       pure calculation, no React, no Supabase
    src/lib/supabase/
    src/lib/format.ts
    src/lib/utils.ts
    src/server/actions/               mutations
    src/server/queries/               reads for server components
    public/
  .github/workflows/ci.yml
```

`src/proxy.ts` is the Next.js 16 request interceptor. With `--src-dir`, that is the correct path. Do not add `middleware.ts`. The proxy refreshes Supabase cookies and does nothing else. Next.js 16 treats this file as a network boundary, and a proxy redirect is not sufficient protection.

Domain components live beside the feature that uses them. Shared visual pieces that appear on more than one route live in `shell/` or `forms/`. A file exports one component.

---

## Design system

The visual source of truth is `DESIGN.md`, with the Add Shift composition in `.superdesign/design-system.md`. This plan refines craft inside that system. It does not replace the palette.

### Personality to protect

Precise, steady, human. Swiss editorial hierarchy with the legibility of a timekeeping instrument. The screen should feel like a private paper record, with one deep-purple structural rail and one high-emphasis summary.

The part that should feel stunning is the work itself: the night-window timeline, the aligned mono figures, and the final ND total. Everything around that stays quiet. A marketing hero, a gradient mesh, or a glass card would make the tool look generated.

### Token collision to avoid

`DESIGN.md` uses `--muted` for supporting text (`#706A75`). shadcn uses `--muted` for a quiet surface. Keep Voyix names under `--vx-*`. Point shadcn tokens at them. Never assign the text gray to a background token.

### `web/src/app/globals.css` token block

After `shadcn init`, replace the generated palette with this. Keep the file's Tailwind import and `@theme inline` mapping, and point `--color-*` theme aliases at these variables the way the generated file already maps `--background`, `--primary`, and the rest.

```css
:root {
  --vx-brand: #5f249f;
  --vx-brand-deep: #341a4b;
  --vx-brand-light: #c3a3e0;
  --vx-brand-tint: #f1e9f8;
  --vx-ink: #211e25;
  --vx-ink-soft: #4c4651;
  --vx-muted: #706a75;
  --vx-paper: #f5f2f6;
  --vx-surface: #fffefa;
  --vx-surface-soft: #fbf9fc;
  --vx-line: #e8e4eb;
  --vx-line-strong: #d8d1de;
  --vx-success: #356d5b;
  --vx-success-bg: #e7f2ec;
  --vx-amber: #a86c2e;
  --vx-amber-bg: #fbf3e8;
  --vx-rose: #a75143;
  --vx-rose-bg: #f8ebe8;
  --vx-on-deep: #fffefa;
  --vx-radius-control: 8px;
  --vx-radius-panel: 14px;
  --vx-rail: 244px;
  --vx-topbar: 65px;
  --vx-content: 1320px;

  --background: var(--vx-paper);
  --foreground: var(--vx-ink);
  --card: var(--vx-surface);
  --card-foreground: var(--vx-ink);
  --popover: var(--vx-surface);
  --popover-foreground: var(--vx-ink);
  --primary: var(--vx-brand);
  --primary-foreground: var(--vx-surface);
  --secondary: var(--vx-surface);
  --secondary-foreground: var(--vx-brand);
  --muted: var(--vx-surface-soft);
  --muted-foreground: var(--vx-muted);
  --accent: var(--vx-brand-tint);
  --accent-foreground: var(--vx-brand-deep);
  --destructive: var(--vx-rose);
  --destructive-foreground: var(--vx-surface);
  --border: var(--vx-line);
  --input: var(--vx-line-strong);
  --ring: var(--vx-brand);
  --radius: 8px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Focus style, applied to interactive elements:

```css
:focus-visible {
  outline: 3px solid var(--vx-brand);
  outline-offset: 2px;
}
```

On the deep-purple rail, focus uses `#C3A3E0` rather than `#5F249F`, because the signature purple must not sit as a small mark on `#341A4B`.

### Type

Load both families with `next/font/google` in `web/src/app/layout.tsx`. Set CSS variables `--font-sans` (Manrope) and `--font-mono` (IBM Plex Mono). Apply Manrope on `body`. Apply the mono variable on any element that shows a time, date, hour total, wage code, or amount, with `font-variant-numeric: tabular-nums`.

| Role | Size | Weight |
| --- | --- | --- |
| Page title | 32 px, 31 px below 640 px | 700 |
| Section heading | 17 px | 650 |
| Body | 14 px | 450–500 |
| Eyebrow / column label | 9–10 px, uppercase, +0.08 em tracking | 500 mono |
| Final ND total | clearly larger than the other figures | 650 mono |

Purple emphasis inside a heading is one word. Paragraphs stay ink.

### Layout numbers

| Viewport | Shell |
| --- | --- |
| ≥ 1120 px | 244 px rail, 40 px page padding, 1320 px content max |
| 900–1119 px | 215 px rail, 28 px padding |
| 640–899 px | 74 px icon rail, labels available to assistive tech even when visually hidden |
| < 640 px | no side rail, 54 px header, 63 px bottom nav plus safe-area inset, 16 px padding |
| < 370 px | 12 px padding, stacked banners |

Bottom nav items: Overview, Records, Shift, Calendar, Settings. Shift is the prominent shortcut. The desktop top bar holds the privacy indicator (“Saved privately”) and the Add shift action.

### Anti-slop rules for this product

These are the tells this codebase refuses, including ones that conflict with generic “make it premium” advice.

- Manrope and IBM Plex Mono only. Inter, Roboto, Arial, and system-ui as the designed face are out.
- No purple-to-blue, mesh, or glow gradients. The brand purple is flat.
- No card nested inside a card. A page is a stack of panels on the paper canvas.
- No icon tile above a heading. Icons support a label. They do not introduce a section.
- No pure `#000` or neutral gray. Ink is the warm `#211E25`.
- No bounce or elastic easing.
- No avatars, streak counters, confetti, or employer badges.
- No chart on the overview. The summary is three figures and a ledger.
- Status is never color alone. The words “ESTIMATE ONLY”, “CODE TBD”, “Mapping pending”, and “Saved privately” stay visible.
- `#C3A3E0` is not small text on white. `#5F249F` is not small text on `#341A4B`.

### Design workflow before each screen

Use this order. Skip none of it when the screen is new.

1. Read `DESIGN.md`, `05-USER-INTERFACE.md`, and, for Add Shift, `.superdesign/design-system.md`.
2. Search Mobbin for the reference type below. Save the useful structural idea in the implementation notes for that screen. Copy the rhythm, not the chrome.
3. Shape the screen with `/impeccable shape` against the existing tokens. If Impeccable proposes a new palette or a new font, reject it.
4. Build from the component library in this document.
5. Run `/impeccable critique` and `/impeccable audit`, then `/impeccable polish`. Use `/impeccable quieter` if the screen starts to look like a campaign. Do not run `bolder`, `overdrive`, or `delight` on these tools.
6. Check the screen with keyboard only, at 200% zoom, at 375 px and 1440 px, and with `prefers-reduced-motion` enabled.

Taste Skill dials for this product, passed in the prompt when the skill is used:

- `DESIGN_VARIANCE` 3. Asymmetric splits are already specified. Do not invent a new layout family.
- `MOTION_INTENSITY` 2. Hover and focus only, plus the single page entrance.
- `VISUAL_DENSITY` 6 on ledgers and the calculation trace. 4 on auth.

Install `design-taste-frontend` and `minimalist-ui`. Leave brutalist, image-generation, and GSAP-heavy variants uninstalled.

Mobbin searches, by screen:

| Screen | Look for | Leave behind |
| --- | --- | --- |
| Login / signup | Split editorial auth, calm finance sign-in | Illustration-heavy startup login, social-login walls |
| Overview | Personal finance period summary, compact recent-activity list | KPI dashboards, charts, admin home |
| Add shift | Timesheet entry beside a live receipt or fare breakdown | Multi-step wizards, break-clock punch UIs |
| Records | Statement or transaction ledger with sticky filters | Spreadsheet clones, dense HR grids |
| Record detail | Receipt with a line-item trace | Audit-log consoles |
| Calendar | Simple dated lists and a small add form | Full team calendars, drag scheduling |
| Settings | Two quiet form columns and a read-only reference table | Org-admin settings with dozens of tabs |

---

## Component library

Two layers. `src/components/ui` is the accessible primitive layer from shadcn. Feature folders are the product layer. A page imports the product layer.

### Primitives to install

Install only these. Add another primitive only when a product component cannot be built accessibly without it.

`button` `input` `label` `select` `separator` `table`

Do not install `card`, `badge`, `dialog`, `sheet`, `drawer`, `toast`, `sonner`, `calendar`, `chart`, or `sidebar`. The product has its own panel, chip, page shell, and inline status. Native `input type="date"` and `input type="time"` stay, styled as fields. They are clearer and more accessible than a custom calendar widget for this form.

`components.json` uses the Radix base, RSC, TSX, CSS variables, and aliases:

```json
{
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "utils": "@/lib/utils",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Initialize with:

```bash
pnpm dlx shadcn@latest init -d --base radix
```

Then add the six primitives:

```bash
pnpm dlx shadcn@latest add button input label select separator table
```

After install, set the button default height to 44 px, radius 8 px, and the three variants below. Primary hover darkens `#5F249F` slightly (`#531F8C`). It does not lift more than 1 px.

| Variant | Surface | Text | Border |
| --- | --- | --- | --- |
| `primary` | `#5F249F` | `#FFFEFA` | none |
| `outline` | transparent | `#5F249F` | `--vx-line-strong` |
| `quiet` | transparent until hover | `--vx-ink-soft` | none |

Disabled controls stay visible and use `aria-disabled` together with the native `disabled` attribute.

### Product components

| Component | File | Responsibility |
| --- | --- | --- |
| `AppShell` | `src/components/shell/app-shell.tsx` | Rail or bottom nav, top bar, skip link, `<main>` |
| `Wordmark` | `src/components/shell/wordmark.tsx` | `voyix` in off-white, `shift` in `#C3A3E0` on deep purple |
| `NavLink` | `src/components/shell/nav-link.tsx` | Active state: tinted field, 2 px left indicator, explicit label |
| `PrivacyIndicator` | `src/components/shell/privacy-indicator.tsx` | Success dot plus the words “Saved privately” |
| `PageHeader` | `src/components/shell/page-header.tsx` | Eyebrow, one `h1`, one sentence, optional action |
| `Panel` | `src/components/shell/panel.tsx` | Surface, 1 px line, 14 px radius, modest shadow |
| `Field` | `src/components/forms/field.tsx` | Persistent label, control, helper, error. Wires `aria-describedby` |
| `StatusLine` | `src/components/forms/status-line.tsx` | `estimate` \| `pending` \| `saved` \| `error`, always with text |
| `EmptyState` | `src/components/shell/empty-state.tsx` | Short explanation and one next action |
| `Metric` | `src/components/records/metric.tsx` | Label and one tabular figure |
| `PeriodBanner` | `src/components/records/period-banner.tsx` | Deep-purple payroll-period summary |
| `Ledger` | `src/components/records/ledger.tsx` | Responsive table with a caption and horizontal scroll |
| `WageCodeChip` | `src/components/shift/wage-code-chip.tsx` | Mono code. Amber treatment includes the visible word TBD |
| `NumberStrip` | `src/components/shift/number-strip.tsx` | Potential, break, final. Final is the emphasis |
| `NightWindowTimeline` | `src/components/shift/night-window-timeline.tsx` | Window, overlap, qualifying segment, excluded break, text legend |
| `EstimateNote` | `src/components/shift/estimate-note.tsx` | The standard “confirm your payroll rule” sentence |
| `AuthSplit` | `src/components/shell/auth-split.tsx` | Deep-purple story column, form column, stacked on small screens |

#### Contracts

```tsx
type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
}

type FieldProps = {
  label: string
  htmlFor: string
  helper?: string
  error?: string
  children: React.ReactNode
}

type StatusLineProps = {
  tone: "estimate" | "pending" | "saved" | "error"
  children: React.ReactNode
}

type LedgerColumn<T> = {
  id: string
  header: string
  numeric?: boolean
  cell: (row: T) => React.ReactNode
}
```

`NightWindowTimeline` receives already-computed segments. It does not calculate hours.

```tsx
type TimelineSegment = {
  startLabel: string
  endLabel: string
  kind: "shift" | "overlap" | "qualifying" | "excluded-break"
}

type NightWindowTimelineProps = {
  windowLabel: string
  segments: TimelineSegment[]
}
```

The legend repeats the meaning in text: qualifying ND, potential overlap, excluded break. Purple marks qualifying time. `#C3A3E0` marks potential overlap. Amber hatching marks the excluded break.

`Ledger` renders a real `<table>` inside a region that scrolls horizontally on narrow screens. It has a `<caption>` and `scope="col"` headers. Numeric columns use the mono face and right alignment.

#### Accessibility bar

Target WCAG 2.2 AA.

- One `h1` per page. The skip link is the first focusable control: “Skip to records” or the equivalent for that page.
- Every input has a visible label. Placeholder text is not the label.
- The calculation preview is an `aria-live="polite"` region so a change in hours is announced.
- Icon-only controls, including the collapsed rail, expose the same names as the wide labels.
- Contrast pairs to keep: `#5F249F` on `#FFFEFA` (about 9.3:1), `#211E25` on `#FFFEFA`, `#FFFEFA` on `#341A4B`, `#356D5B` / `#A86C2E` / `#A75143` as text on their pale surfaces. Verify any new pair before using it.
- `StatusLine` includes an icon and the status words.
- Primary targets are at least 44 by 44 px. The bottom nav clears `env(safe-area-inset-bottom)`.

---

## Calculation module boundary

`web/src/engine` imports nothing from React or Supabase. `06-IMPLEMENTATION-PLAN.md` fills in the cases. The foundation only locks the types and the public function so UI and database work cannot drift.

```ts
export type DayClassification =
  | "REGULAR_WORK_DAY"
  | "REST_DAY"
  | "SPECIAL_PUBLIC_HOLIDAY"
  | "SPECIAL_PUBLIC_HOLIDAY_REST_DAY"
  | "REGULAR_PUBLIC_HOLIDAY"
  | "REGULAR_PUBLIC_HOLIDAY_REST_DAY"
  | "DOUBLE_REGULAR_HOLIDAY"
  | "DOUBLE_REGULAR_HOLIDAY_REST_DAY"

export type HoursCategory = "FIRST_8" | "EXCESS"

export type WorkScheduleType = "STANDARD" | "APPROVED_CWW"

export type ShiftInput = {
  workDate: string
  shiftStart: string
  shiftEnd: string
  dayClassification: DayClassification
  monthlyBasicSalary: string | null
  timeZone: string
  ndStart: string
  ndEnd: string
  breakHours: string
  breakIncludedInNd: boolean
  scheduleType: WorkScheduleType
  scheduledRegularHours: string
  overtimeApproved: boolean
}

export type WageTypeRule = {
  id: string
  code: string
  category: DayClassification
  hoursCategory: HoursCategory
  percentage: string
  isNd: boolean
  description: string
}

export type RateBasis = {
  monthlyBasicSalary: string
  annualMonths: "12"
  workdaysFactor: "261"
  rateHoursPerDay: "8"
  dailyRate: string
  hourlyRate: string
}

export type AmountLine =
  | {
      status: "estimated"
      code: string
      hours: string
      percentage: string
      centavos: number
      formula: "ordinary_nd_10_percent"
    }
  | {
      status: "tbd"
      code: string
      hours: string | null
      percentage: string
      reason: string
    }

export type NdResult = {
  rateBasis: RateBasis | null
  elapsedHours: string
  workedHours: string
  scheduledRegularHours: string
  regularHours: string
  potentialOvertimeHours: string
  approvedOvertimeHours: string
  unapprovedExtraHours: string
  potentialNdHours: string
  breakHours: string
  breakIncludedInNd: boolean
  ndHours: string
  dayClassification: DayClassification
  hoursCategories: HoursCategory[]
  lines: AmountLine[]
  unresolved: string[]
}

export function calculateNd(
  input: ShiftInput,
  rules: WageTypeRule[],
): NdResult
```

Hours are decimal strings with two fraction digits (`"7.00"`). Money inside the engine is integer centavos. `format.php` turns centavos into `₱140.00` with `Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" })`.

The engine derives the computational hourly rate as `(monthlyBasicSalary x 12) / 261 / 8`. Factor 365 is never an engine divisor. Preserve decimal precision through the rate derivation and round only the final money result to centavos.

`ordinary_nd_10_percent` applies only when the matched rule is code `2211` at 10% and monthly basic salary is present. A missing salary, a missing rule, code 2252, an unresolved regular/overtime allocation, or any other code produces `status: "tbd"` with a specific `reason`. The function returns every matching rule, not the first.

---

The nullable `hours` on a TBD line represents unresolved allocation. An
estimated line always has non-null hours; the engine must not manufacture
hours simply to populate a TBD result.

## Supabase data model

Extends `04-DATA-MODEL.md` with the columns required to enforce ownership and to store the settings screen. Table names stay those of the spec.

### Tables

`employees`

- `id uuid primary key references auth.users(id) on delete cascade`
- `name text not null`
- `employee_id text not null unique`
- `email text not null`
- `monthly_basic_salary numeric(12,2)`
- `work_schedule_type text not null default 'STANDARD' check (work_schedule_type in ('STANDARD', 'APPROVED_CWW'))`
- `scheduled_regular_hours numeric(4,2) not null default 8`
- `time_zone text not null default 'Asia/Manila'`
- `nd_start time not null default '22:00'`
- `nd_end time not null default '06:00'`
- `break_hours numeric(4,2) not null default 1`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Employee schedule validation requires exactly 8 hours for `STANDARD`
and 8 through 12 hours inclusive for `APPROVED_CWW`.

`shifts`

- `id uuid primary key default gen_random_uuid()`
- `employee_id uuid not null references employees(id) on delete cascade`
- `work_date date not null`
- `shift_start timestamptz not null`
- `shift_end timestamptz not null`
- `day_classification text not null`
- `break_included_in_nd boolean not null`
- `work_schedule_type text not null`
- `scheduled_regular_hours numeric(4,2) not null`
- `overtime_approved boolean not null default false`
- `created_at`, `updated_at`

Shift snapshots enforce the same schedule rule: `STANDARD` is exactly
8 hours; `APPROVED_CWW` is between 8 and 12 hours inclusive.

No `break_start` or `break_end`.

`nd_records`

- `id uuid primary key`
- `shift_id uuid not null unique references shifts(id) on delete cascade`
- `calculation_version smallint default 2`
- `potential_nd_hours numeric(6,2) not null`
- `break_hours numeric(4,2) not null`
- `break_included_in_nd boolean not null`
- `nd_hours numeric(6,2) not null`
- `elapsed_hours numeric(6,2)`
- `worked_hours numeric(6,2)`
- `regular_hours numeric(6,2)`
- `work_schedule_type text`
- `scheduled_regular_hours numeric(4,2)`
- `potential_overtime_hours numeric(6,2)`
- `overtime_approved boolean`
- `approved_overtime_hours numeric(6,2)`
- `unapproved_extra_hours numeric(6,2)`
- `monthly_basic_salary numeric(12,2)`
- `annual_months numeric(4,2)`
- `workdays_factor numeric(6,2)`
- `rate_hours_per_day numeric(4,2)`
- `derived_daily_rate numeric(18,8)`
- `derived_hourly_rate numeric(18,8)`
- `nd_start time not null`
- `nd_end time not null`
- `time_zone text not null`
- `created_at`, `updated_at`

The window, schedule, salary, factor, and rate columns freeze the inputs
and derivation used at save time. The unpaid break always reduces
elapsed hours to worked hours; `break_included_in_nd` changes only ND
overlap.

The added snapshot columns are nullable only so pre-migration records
remain valid. `calculation_version` is null for a legacy record and
defaults to `2` for new records in the current snapshot format. The
groups are all-or-none:

- A legacy row has a null version and all added schedule, duty-hour,
  approval, and rate-basis snapshot columns are null.
- A version 2 row has every schedule, duty-hour, and approval snapshot
  value populated.
- Its rate-basis group is either entirely null when monthly salary is
  absent or entirely populated with salary, annual months, workdays
  factor, rate hours per day, and both derived rates.

Version 2 schedule snapshots also require exactly 8 hours for
`STANDARD` or 8 through 12 hours for `APPROVED_CWW`.

Version 2 duty snapshots enforce
`worked_hours = max(elapsed_hours - break_hours, 0)` and
`regular_hours = min(worked_hours, scheduled_regular_hours)`.

`nd_wage_type_lines`

- `id uuid primary key`
- `nd_record_id uuid not null references nd_records(id) on delete cascade`
- `wage_type_id uuid references wage_types(id)`
- `wage_type_code text not null`
- `category text not null`
- `hours_category text not null`
- `applicable_hours numeric(6,2)`
- `percentage numeric(7,2) not null`
- `amount_status text not null check (amount_status in ('estimated', 'tbd'))`
- `calculated_amount numeric(14,2)`
- `unresolved_reason text`
- `created_at timestamptz not null default now()`

`calculated_amount` is null when `amount_status` is `tbd`.
`applicable_hours` may be null only for a TBD line with unresolved hour
allocation. Estimated lines require non-null, non-negative applicable
hours; TBD hours must not be guessed.

`wage_types`

- `id uuid primary key`
- `code text not null`
- `category text not null`
- `hours_category text not null`
- `percentage numeric(7,2) not null`
- `is_nd boolean not null`
- `description text not null`
- `active boolean not null default true`
- `effective_from date`
- `effective_until date`
- unique `(code, category, hours_category)`

`holidays`

- `id uuid primary key`
- `owner_id uuid references employees(id) on delete cascade`
- `holiday_date date not null`
- `name text not null`
- `holiday_type text not null`
- `year int not null`
- `active boolean not null default true`

`owner_id` null means a shared seed row. Version 1 has no shared seed until the supplied calendar is transcribed. Do not fabricate dates.

`payroll_periods`

- `id uuid primary key`
- `owner_id uuid references employees(id) on delete cascade`
- `period_start date not null`
- `period_end date not null`
- `pay_date date`
- `cutoff_date date`
- `cutoff_time time`
- `active boolean not null default true`

### Row-level security

Enable RLS on every table above. Policies:

- `employees`: select, update, and insert where `id = auth.uid()`. No delete policy.
- `shifts`: all operations where `employee_id = auth.uid()`.
- `nd_records`: all operations where the parent shift belongs to `auth.uid()`.
- `nd_wage_type_lines`: all operations where the parent record belongs to `auth.uid()`.
- `wage_types`: select for `authenticated`. No insert, update, or delete policy for `authenticated`.
- `holidays` and `payroll_periods`: select where `owner_id is null or owner_id = auth.uid()`. Insert, update, and delete only where `owner_id = auth.uid()`.

Grant the `authenticated` role usage on the tables it must touch. Do not grant `anon` access to these tables. Do not create a `security definer` function in `public`.

The browser receives only the publishable key. `SUPABASE_SECRET_KEY` is used by the seed script locally and in CI if needed. It is not prefixed with `NEXT_PUBLIC_` and it is not imported by anything under `web/src/app` or `web/src/components`.

### Wage-type seed

Transcribe these ND rows into `supabase/seed.sql`. The “Rest Day OR Special Public Holiday” line becomes two rows with the same code and percentage, so a category lookup can return it for either classification. Do not add an excess-hours row for rest day. The source table does not contain one.

| Code | Category key | Hours | Percentage | Description |
| --- | --- | --- | --- | --- |
| 2211 | `REGULAR_WORK_DAY` | `FIRST_8` | 10 | Ordinary day, night shift, first 8 hours |
| 2252 | `REGULAR_WORK_DAY` | `EXCESS` | 138 | Ordinary day, night shift, excess of the first 8 hours |
| 2411 | `REST_DAY` | `FIRST_8` | 143 | Rest day, first 8 hours |
| 2411 | `SPECIAL_PUBLIC_HOLIDAY` | `FIRST_8` | 143 | Special public holiday, first 8 hours |
| 2418 | `SPECIAL_PUBLIC_HOLIDAY` | `FIRST_8` | 43 | Special public holiday, first 8 hours |
| 2511 | `SPECIAL_PUBLIC_HOLIDAY` | `EXCESS` | 186 | Special public holiday, excess of the first 8 hours |
| 2412 | `SPECIAL_PUBLIC_HOLIDAY_REST_DAY` | `FIRST_8` | 165 | Special public holiday and rest day, first 8 hours |
| 2512 | `SPECIAL_PUBLIC_HOLIDAY_REST_DAY` | `EXCESS` | 215 | Special public holiday and rest day, excess |
| 2413 | `REGULAR_PUBLIC_HOLIDAY` | `FIRST_8` | 120 | Regular or public holiday, first 8 hours |
| 2513 | `REGULAR_PUBLIC_HOLIDAY` | `EXCESS` | 286 | Regular or public holiday, excess |
| 2414 | `REGULAR_PUBLIC_HOLIDAY_REST_DAY` | `FIRST_8` | 286 | Regular or public holiday and rest day, first 8 hours |
| 2514 | `REGULAR_PUBLIC_HOLIDAY_REST_DAY` | `EXCESS` | 372 | Regular or public holiday and rest day, excess |
| 2415 | `DOUBLE_REGULAR_HOLIDAY` | `FIRST_8` | 230 | Double regular holiday, first 8 hours |
| 2515 | `DOUBLE_REGULAR_HOLIDAY` | `EXCESS` | 429 | Double regular holiday, excess |
| 2416 | `DOUBLE_REGULAR_HOLIDAY_REST_DAY` | `FIRST_8` | 429 | Double regular holiday and rest day, first 8 hours |
| 2516 | `DOUBLE_REGULAR_HOLIDAY_REST_DAY` | `EXCESS` | 558 | Double regular holiday and rest day, excess |

`2411` and `2418` are both stored for special public holiday, first 8 hours, because the supplied table lists both. The engine returns both lines. It does not pick a winner.

Non-ND codes in `02-WAGE-TYPES.md` (2251, 2301, 2215, 2235, 2170, 2226, 2240, 2246, 2425, 2535, 2420, 2520, 2430, 2233) are not seeded until their categories and percentages are transcribed from the source PDF. Seeding them with guessed percentages would invent payroll data.

### Client files

`web/src/lib/supabase/browser.ts` exports `createClient()` using `createBrowserClient` from `@supabase/ssr`.

`web/src/lib/supabase/server.ts` exports an async `createClient()` using `createServerClient` and `await cookies()` from `next/headers`.

`web/src/proxy.ts` creates a server client and calls `supabase.auth.getClaims()` so a stale session can refresh its cookies onto the response. It does not redirect and it does not decide access.

Access checks live in three places, and all three are required:

- `web/src/app/(app)/layout.tsx` calls `getClaims()` and redirects to `/login` when there is no session.
- `web/src/app/(auth)/layout.tsx` redirects an existing session to `/`.
- Every Server Action calls `getClaims()` and returns an error when the caller is signed out.

Row-level security is what actually protects a row if a proxy or layout check is skipped. Do not read `user_metadata` in any of these checks.

Environment names:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
```

Commit `web/.env.example` with those names and empty values. Do not commit `.env`, `.env.local`, or a populated secret.

---

## Routes

| URL | Group | Page landmark |
| --- | --- | --- |
| `/login` | `(auth)` | Employee sign in |
| `/signup` | `(auth)` | Create profile |
| `/` | `(app)` | Overview |
| `/shift/new` | `(app)` | Add a shift |
| `/records` | `(app)` | My records |
| `/records/[id]` | `(app)` | Record detail |
| `/calendar` | `(app)` | Calendar |
| `/settings` | `(app)` | Settings |

Foundation pages render `PageHeader`, the correct eyebrow from `DESIGN.md`, and an `EmptyState` where the data does not exist yet. Overview’s eyebrow is `YOUR HISTORY`. Add shift’s eyebrow is `ADD A SHIFT` and its title is “Calculate this shift”.

Nav labels: Overview, My records, Calendar, Settings. The add action reads “Add shift”.

---

## Tooling

| Tool | Use |
| --- | --- |
| pnpm 10 via Corepack | Install and scripts |
| Node.js 22 | Runtime. Next.js 16 requires Node ≥ 20.9. |
| `pnpm create next-app@latest` | Scaffold |
| `supabase` CLI | Local Postgres, migrations, seed |
| `vercel` CLI | Preview and production deploys |
| Vitest | Engine tests and the token contract test |
| Playwright + `@axe-core/playwright` | Installed in the foundation. Flow tests arrive with the screens. |
| ESLint `eslint-config-next` | Includes the core-web-vitals and TypeScript configs the scaffold writes |
| `eslint-plugin-jsx-a11y` | Add it if the Next config does not already enable it |
| Impeccable | Project skill. Commands listed in the design workflow. |
| Taste Skill | `design-taste-frontend` and `minimalist-ui` |
| Mobbin MCP | `search_screens`, `search_flows`, `search_sections` before a new screen |
| Superdesign | Existing `.superdesign/design-system.md` is the Add Shift composition |

Scripts in `web/package.json`:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

CI on pull requests, from the repository root:

```yaml
# .github/workflows/ci.yml
# working-directory: web
# steps: pnpm install --frozen-lockfile, pnpm lint, pnpm typecheck, pnpm test, pnpm build
```

Playwright does not run in CI until the first flow test exists. The job must stay green at the end of this plan.

Vercel project settings:

- Framework: Next.js
- Root directory: `web`
- Install command: `pnpm install`
- Build command: `pnpm build`
- Region: Singapore (`sin1`)
- Environment variables: the three Supabase names, with the secret marked sensitive
- Production branch deploys only. Preview deployments use the same Supabase project only after RLS is verified. Until then, previews point at a Supabase branch or stay local.

---

## Tasks

### Task 1: Scaffold the Next.js app

**Files:**
- Create: `web/` via the command below
- Modify: none of the root spec files

The repository root is not empty. Scaffold into `web/` and do not let the tool create a nested git repository.

- [ ] **Step 1: Install the toolchain**

```powershell
corepack enable
corepack prepare pnpm@10 --activate
node --version
```

Expected: Node `v22.x`. If Node is older than 20.9, install Node 22 before continuing.

- [ ] **Step 2: Create the app**

Run from the repository root:

```powershell
pnpm create next-app@latest web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --react-compiler --disable-git --yes
```

Expected: `web/package.json`, `web/src/app`, `web/tsconfig.json`. No `web/.git`.

- [ ] **Step 3: Confirm the request interceptor name**

If the scaffold added `web/src/middleware.ts` or `web/middleware.ts`, rename the file to `web/src/proxy.ts` and export `proxy`. Next.js 16 uses `proxy`, and `cookies()` is async. Leave the file empty of auth decisions until Task 6.

- [ ] **Step 4: Point agents at the specs**

Create `web/AGENTS.md` with this body:

```md
# Voyix Shift web app

Product rules, wage types, calculation, data model, screens, and visual design live at the repository root, not in this folder.

Read `../DESIGN.md`, `../07-SETUP-PLAN.md`, and `../.superdesign/design-system.md` before changing UI.
Read `../01-BUSINESS-RULES.md` through `../03-CALCULATION-ENGINE.md` before changing `src/engine`.

Do not invent ADP codes, holiday dates, or money formulas. Unresolved rules render as TBD.
```

- [ ] **Step 5: Verify**

```powershell
pnpm --dir web lint
pnpm --dir web typecheck
pnpm --dir web build
```

Expected: all three exit 0.

- [ ] **Step 6: Commit**

```powershell
git add web
git commit -m "Add the Next.js application scaffold."
```

### Task 2: Install the design gate

**Files:**
- Create: `PRODUCT.md`
- Create: `.cursor/rules/voyix-design.mdc`
- Modify: none of `DESIGN.md` beyond the implementation-path note already in that file

- [ ] **Step 1: Install the skills from the repository root**

```powershell
npx impeccable install --providers=cursor --scope=project
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
npx skills add https://github.com/Leonxlnx/taste-skill --skill "minimalist-ui"
pnpm --dir web dlx skills add shadcn/ui
```

Reload Cursor after the install so the project skills are picked up.

- [ ] **Step 2: Write `PRODUCT.md`**

Impeccable’s `/impeccable init` writes this file interactively and may also rewrite `DESIGN.md`. Do not run `init` against this repo. Write `PRODUCT.md` directly:

```md
# Voyix Shift

Voyix Shift is a private shiftbook for employees who work rotational night shifts and want a personal record of night-differential hours.

The person using it is an employee, not a payroll clerk and not a manager. They can spare a few seconds to enter a shift. They need to see how the hours were estimated.

It is not an employer payroll system. It does not submit time, approve wages, or verify employment.

Voice: plain, concise, and non-authoritative about payroll. “Your night hours, accounted for.” “Estimate only — confirm your payroll rule before relying on this amount.”

Visual system: see DESIGN.md. Do not replace the palette, the type, or the shell. Brand accent is #5F249F. Type is Manrope and IBM Plex Mono.

Unresolved wage rules stay visible as TBD. The app must not present an estimate as a confirmed payroll outcome.
```

- [ ] **Step 3: Write `.cursor/rules/voyix-design.mdc`**

```md
---
description: Voyix Shift visual and copy rules for any UI change
globs:
  - web/src/**/*.tsx
  - web/src/app/globals.css
alwaysApply: false
---

Follow DESIGN.md and 07-SETUP-PLAN.md.

Use the Voyix tokens in web/src/app/globals.css. Do not introduce fonts, hex values, gradients, or radii outside that file.

Compose pages from the product components. Do not nest panels. Do not put an icon tile above a heading.

Pair every status color with words. Call money an estimate. Do not imply payroll approval.

Motion stays under 280 ms and honors prefers-reduced-motion. Taste dials for this product: variance 3, motion 2, density 6 on ledgers and 4 on auth.

Before a new screen, read the matching section in 05-USER-INTERFACE.md and check Mobbin only for structure. Reject payroll-console and marketing-site patterns.
```

- [ ] **Step 4: Commit**

```powershell
git add PRODUCT.md .cursor
git commit -m "Add the Voyix Shift design gate for UI work."
```

### Task 3: Theme and primitives

**Files:**
- Create: `web/components.json`
- Create: `web/src/components/ui/*`
- Modify: `web/src/app/globals.css`
- Modify: `web/src/app/layout.tsx`
- Test: `web/src/app/globals.css.test.ts`

- [ ] **Step 1: Write the failing token test**

```ts
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

describe("Voyix tokens", () => {
  const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8")

  it("keeps the authoritative brand purple", () => {
    expect(css).toMatch(/--vx-brand:\s*#5f249f/i)
    expect(css).toMatch(/--vx-brand-deep:\s*#341a4b/i)
  })

  it("does not use the text muted color as a surface", () => {
    expect(css).toMatch(/--muted:\s*var\(--vx-surface-soft\)/)
    expect(css).toMatch(/--muted-foreground:\s*var\(--vx-muted\)/)
  })
})
```

- [ ] **Step 2: Run the test and confirm it fails**

```powershell
pnpm --dir web add -D vitest
pnpm --dir web exec vitest run src/app/globals.css.test.ts
```

Expected: FAIL because the variables are missing.

Add a `vitest` config that uses the `node` environment for this test.

- [ ] **Step 3: Initialize shadcn and replace the palette**

```powershell
pnpm --dir web dlx shadcn@latest init -d --base radix
pnpm --dir web dlx shadcn@latest add button input label select separator table
```

Paste the token block from the Design system section into `globals.css`, and map the generated `@theme inline` colors to those variables. Load Manrope and IBM Plex Mono in `layout.tsx` through `next/font/google`. Set the document title to “Voyix Shift”.

Retheme `button` to the three variants and a 44 px min-height. Remove any zinc, neutral, or default purple the generator introduced.

- [ ] **Step 4: Run the test and the build**

```powershell
pnpm --dir web exec vitest run src/app/globals.css.test.ts
pnpm --dir web typecheck
```

Expected: PASS, typecheck exit 0.

- [ ] **Step 5: Commit**

```powershell
git add web
git commit -m "Theme the primitive layer with the Voyix Shift tokens."
```

### Task 4: Build the shell and page landmarks

**Files:**
- Create: the product components listed in the library table
- Create: the route pages listed in the Routes section
- Test: keyboard and viewport check, recorded in the commit notes

- [ ] **Step 1: Build the shell components**

Implement `AppShell`, `Wordmark`, `NavLink`, `PrivacyIndicator`, `PageHeader`, `Panel`, `EmptyState`, and `AuthSplit` to the contracts and layout numbers in this plan.

`AppShell` structure:

```tsx
<a href="#content">Skip to content</a>
<div className="app-shell">
  <nav aria-label="Primary">{/* Overview, My records, Calendar, Settings */}</nav>
  <div>
    <header>{/* PrivacyIndicator and Add shift */}</header>
    <main id="content">{children}</main>
  </div>
</div>
```

Active nav uses `aria-current="page"`.

- [ ] **Step 2: Add the routes**

Each `(app)` page renders `PageHeader` and an `EmptyState` whose action is the next real step on that page. Auth pages use `AuthSplit` and real `<form>` elements with persistent labels. The forms can post to server actions that are added in Task 6. Until then, the submit buttons are `disabled` and the helper text says the account connection is not ready. Remove that disabled state in Task 6.

- [ ] **Step 3: Check the shell**

```powershell
pnpm --dir web dev
```

In the browser, at 1440 px and 375 px:

- One `h1` on Overview.
- Skip link is first in tab order and moves focus to `main`.
- Rail collapses to the bottom nav below 640 px.
- Reduced-motion preference removes the page entrance.
- No hex value outside `globals.css` in the new components. Search to confirm:

```powershell
rg -n "#[0-9a-fA-F]{3,8}" web/src/components web/src/app --glob "!globals.css"
```

Expected: no matches.

- [ ] **Step 4: Commit**

```powershell
git add web/src
git commit -m "Add the Voyix Shift shell and empty page landmarks."
```

### Task 5: Create the Supabase project locally

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/<timestamp>_foundation.sql`
- Create: `supabase/seed.sql`
- Create: `web/.env.example`

- [ ] **Step 1: Install the CLI and initialize**

```powershell
supabase --version
supabase init
```

If the CLI is missing, install it from the current Supabase CLI documentation, then rerun `supabase init`. Do not invent a `config.toml`.

- [ ] **Step 2: Write the migration with the CLI**

```powershell
supabase migration new foundation
```

Put the tables, constraints, indexes, grants, and RLS policies from the Supabase data model section into that file. Use `supabase migration new` for the filename. Do not hand-name a timestamp.

Index `shifts (employee_id, work_date desc)` and `nd_wage_type_lines (nd_record_id)`.

- [ ] **Step 3: Write `supabase/seed.sql`**

Insert the wage-type rows from the seed table. Use `on conflict (code, category, hours_category) do nothing`. Do not insert holidays or payroll periods.

- [ ] **Step 4: Start the local stack and apply the migration**

```powershell
supabase start
supabase db reset
```

Expected: local API URL and publishable key printed. `db reset` applies the migration and seed without error.

- [ ] **Step 5: Prove isolation**

Using the local SQL prompt, sign in is not available yet, so assert the policies exist:

```sql
select c.relname, c.relrowsecurity
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'employees', 'shifts', 'nd_records', 'nd_wage_type_lines',
    'wage_types', 'holidays', 'payroll_periods'
  );
```

Expected: `relrowsecurity` true for all seven tables.

- [ ] **Step 6: Write `web/.env.example` and ignore secrets**

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Confirm `web/.gitignore` ignores `.env` and `.env*.local`. Copy the example to `web/.env.local` with the local keys from `supabase start`. Do not commit `.env.local`.

- [ ] **Step 7: Commit**

```powershell
git add supabase web/.env.example web/.gitignore
git commit -m "Add the employee-scoped Supabase schema and wage-type seed."
```

### Task 6: Wire auth, session refresh, and layout gates

**Files:**
- Create: `web/src/lib/supabase/browser.ts`
- Create: `web/src/lib/supabase/server.ts`
- Create: `web/src/proxy.ts`
- Create: `web/src/server/actions/auth.ts`
- Modify: `web/src/app/(app)/layout.tsx`
- Modify: `web/src/app/(auth)/layout.tsx`
- Modify: `web/src/app/(auth)/login/page.tsx`
- Modify: `web/src/app/(auth)/signup/page.tsx`

- [ ] **Step 1: Add the Supabase packages**

```powershell
pnpm --dir web add @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 2: Add the two client factories, the proxy, and the layout gates**

Follow the client rules in the Supabase data model section. In `src/proxy.ts`, call `getClaims()` and write refreshed cookies onto the response. Do not redirect from the proxy.

In `(app)/layout.tsx`, call `getClaims()` and `redirect("/login")` when the session is missing. In `(auth)/layout.tsx`, `redirect("/")` when a session exists. Do not read `user_metadata` to decide access.

- [ ] **Step 3: Add signup and login actions**

`signUp` collects name, employee ID, email, password, and optional monthly basic salary.

- Password length is at least 12 characters.
- Employee ID is trimmed and required.
- Monthly basic salary, when present, is a non-negative decimal with at most two fraction digits. Hourly rate is derived and is not entered by the employee.
- The action calls `supabase.auth.signUp`, then inserts the `employees` row with `id` set to the auth user id.
- A duplicate employee ID returns a field error on that input. It does not create a second profile.
- `signIn` accepts email and password.
- `signOut` clears the session and redirects to `/login`.

Validate with Zod inside the action. Return field errors to `Field`. Do not use a toast.

- [ ] **Step 4: Enable the forms**

Remove the disabled state from Task 4. Login shows a password reveal control with an accessible name (“Show password” / “Hide password”). Signup states that the account does not verify employment.

In the Supabase dashboard for the hosted project, and in `supabase/config.toml` for local auth, turn email confirmation off. Keep password recovery on.

- [ ] **Step 5: Verify the flow**

```powershell
supabase start
pnpm --dir web dev
```

In the browser:

- Create an account and land on Overview.
- Sign out and confirm `/` redirects to `/login`.
- Sign in and confirm `/login` redirects to `/`.
- Create a second account and confirm it cannot see the first account’s employee row. Check with a select against `employees` using each session.
- Submit an empty login and confirm the error is text, not color alone.

- [ ] **Step 6: Commit**

```powershell
git add web/src supabase/config.toml
git commit -m "Authenticate employees and isolate their profiles."
```

### Task 7: Lock the calculation entry point

**Files:**
- Create: `web/src/engine/types.ts`
- Create: `web/src/engine/calculate-nd.ts`
- Create: `web/src/engine/calculate-nd.test.ts`
- Create: `web/src/lib/format.ts`
- Modify: `web/package.json` dependencies

- [ ] **Step 1: Add decimal.js and luxon**

```powershell
pnpm --dir web add decimal.js luxon
pnpm --dir web add -D @types/luxon
```

- [ ] **Step 2: Write the failing characterization test**

```ts
import { describe, expect, it } from "vitest"
import { calculateNd } from "./calculate-nd"

const ordinaryFirstEight = {
  id: "wt-2211",
  code: "2211",
  category: "REGULAR_WORK_DAY" as const,
  hoursCategory: "FIRST_8" as const,
  percentage: "10",
  isNd: true,
  description: "Ordinary day, night shift, first 8 hours",
}

describe("calculateNd", () => {
  it("returns 7 hours and a 10 percent estimate for a 9 PM to 6 AM shift", () => {
    const result = calculateNd(
      {
        workDate: "2026-10-01",
        shiftStart: "2026-10-01T21:00:00",
        shiftEnd: "2026-10-02T06:00:00",
        dayClassification: "REGULAR_WORK_DAY",
        breakIncludedInNd: false,
        monthlyBasicSalary: "34800.00",
        scheduleType: "STANDARD",
        scheduledRegularHours: "8",
        overtimeApproved: false,
        timeZone: "Asia/Manila",
        ndStart: "22:00",
        ndEnd: "06:00",
        breakHours: "1",
      },
      [ordinaryFirstEight],
    )

    expect(result.elapsedHours).toBe("9.00")
    expect(result.workedHours).toBe("8.00")
    expect(result.regularHours).toBe("8.00")
    expect(result.potentialOvertimeHours).toBe("0.00")
    expect(result.approvedOvertimeHours).toBe("0.00")
    expect(result.unapprovedExtraHours).toBe("0.00")
    expect(result.rateBasis?.workdaysFactor).toBe("261")
    expect(result.potentialNdHours).toBe("8.00")
    expect(result.ndHours).toBe("7.00")
    expect(result.lines).toEqual([
      {
        status: "estimated",
        code: "2211",
        hours: "7.00",
        percentage: "10",
        centavos: 14000,
        formula: "ordinary_nd_10_percent",
      },
    ])
  })
})
```

- [ ] **Step 3: Run it and confirm failure**

```powershell
pnpm --dir web exec vitest run src/engine/calculate-nd.test.ts
```

Expected: FAIL because `calculateNd` is not implemented.

- [ ] **Step 4: Implement the one confirmed case**

Implement `calculateNd` for the ordinary 9:00 PM–6:00 AM path described in `03-CALCULATION-ENGINE.md`: normalize an overnight end, subtract the 1-hour unpaid break from elapsed time to obtain worked hours, compute potential overtime above scheduled regular hours, then intersect the shift with the Manila 22:00–06:00 ND window. Apply `breakIncludedInNd` only to ND overlap. Derive the hourly rate from monthly salary with factor 261 and apply `ordinary_nd_10_percent` only for rule `2211`. Any other matched rule returns `status: "tbd"` with the reason `Money formula is not confirmed for this wage type.`

Leave holiday crossing, allocation of ND between regular and approved-overtime portions, and code 2252 as `unresolved` entries when the input needs them. Do not guess those rules in order to make a test pass.

`formatPhp(centavos: number): string` returns the `en-PH` currency string.

- [ ] **Step 5: Run the test**

```powershell
pnpm --dir web test
```

Expected: the token test and this characterization test pass.

- [ ] **Step 6: Commit**

```powershell
git add web
git commit -m "Add the night-differential calculation entry point."
```

The rest of the cases in `06-IMPLEMENTATION-PLAN.md` (break included, 10-hour elapsed shift, approved CWW, 11 PM–7 AM, daytime, weekend classification, multiple lines) belong to the next plan. Add them as further tests in `calculate-nd.test.ts` when that work starts.

### Task 8: Continuous integration and Vercel

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: Vercel project settings, not application source

- [ ] **Step 1: Add the workflow**

The job checks out the repo, sets up Node 22 and pnpm 10, then in `web/` runs install, lint, typecheck, test, and build. Inject the example env vars as empty public values only if the build requires them. Do not put `SUPABASE_SECRET_KEY` in the workflow.

- [ ] **Step 2: Confirm CI is green**

Push the branch and confirm the workflow passes. Do not force-push.

- [ ] **Step 3: Create the hosted Supabase project**

Region: Singapore. Apply the same migration with the Supabase CLI linked to that project (`supabase db push` after `supabase link`). Run the advisors and fix any new RLS finding before inviting a colleague.

Turn email confirmation off. Set the site URL to the Vercel production URL once it exists, and add the local URL `http://localhost:3000` to the auth redirect allow list.

- [ ] **Step 4: Create the Vercel project**

Root directory `web`, region Singapore, environment variables from the hosted project. Deploy a preview. Sign up, sign in, and sign out against the preview URL.

- [ ] **Step 5: Commit the workflow**

```powershell
git add .github/workflows/ci.yml
git commit -m "Run lint, types, tests, and the Next.js build in CI."
```

---

## Screen work that follows this plan

Build in the order from `06-IMPLEMENTATION-PLAN.md`, using the library and the design workflow above.

1. Finish the calculation tests: break included only in ND, unpaid-break worked hours, standard and approved-CWW schedule thresholds, approved versus unapproved potential overtime, factor-261 rate derivation, partial overlap, daytime, rotational Saturday as a regular day, Saturday as a rest day, multiple matching wage lines, and TBD when ND allocation or a money formula is unknown.
2. Save a shift from `/shift/new` by running `calculateNd` on the server and writing `shifts`, `nd_records`, and `nd_wage_type_lines` in one transaction. The timeline and number strip show the trace. The amount note uses the estimate sentence from `DESIGN.md`.
3. Overview reads the current personal payroll period, three metrics, and the recent ledger.
4. Records filters use search params: this week, this payroll period, this month, custom range. Detail reads the saved snapshot, not a fresh calculation that could change history.
5. Calendar and settings write only the signed-in employee’s rows. The wage-type catalog on settings is read-only.
6. After each screen, run the Impeccable critique, audit, and polish commands, then a keyboard and axe pass.

Playwright coverage for that phase, at minimum:

- Sign up, add the 9:00 PM–6:00 AM sample, and see 7.00 hours and code 2211 marked as an estimate.
- A second user cannot open the first user’s record URL.
- Saturday with classification Regular Work Day does not display as a rest day.
- Axe reports zero serious or critical violations on login, overview, add shift, and records.

## Spec coverage

| Source | Where this plan honors it |
| --- | --- |
| `01-BUSINESS-RULES.md` | Engine boundary, TBD amounts, no fixed rest day, configurable window and break |
| `02-WAGE-TYPES.md` | Seed table, multiple lines, no invented codes |
| `03-CALCULATION-ENGINE.md` | `calculateNd` steps and the saved trace columns |
| `04-DATA-MODEL.md` | Same six tables plus `payroll_periods`, ownership, and snapshot columns |
| `05-USER-INTERFACE.md` | Routes, nav, form fields, ledger, no break start/end |
| `DESIGN.md` | Tokens, type, shell sizes, status language, motion, focus |
| `.superdesign/design-system.md` | Add Shift composition, used when that screen is built |
| `06-IMPLEMENTATION-PLAN.md` | Foundation first, then engine tests, then screens, then polish |

`DESIGN.md` section 9 now points at `web/src` rather than a `client/` app that is not in this repository.
