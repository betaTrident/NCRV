# Voyix Workspace UI Audit and Redesign Direction

- **Status:** Design direction and Calendar/Week-entry source decisions awaiting approval
- **Prepared:** October 15, 2026 (refreshed against the current checkout)
- **Runtime:** `web/`
- **Canvas:** [Voyix Workspace — Product redesign](https://superdesign.dev/teams/d9ab7d98-7600-4517-8d77-5bca18547291/projects/6358f71c-4d44-4b34-af4c-7f3b564f82bf)
- **Recommended direction:** Direction A — Editorial Night Ledger

This document records the current-state review, accessibility and interaction critique, Ant Design integration boundary, approved-product constraints, proposed redesign phases, and the design-selection gate. It does not authorize invented payroll rules, employer workflows, or legal claims.

The source-informed Calendar, Week entry, ADP-code, and ND-visualization proposal is detailed in [`docs/CALENDAR-WEEKLY-ENTRY-UX-BRIEF.md`](./CALENDAR-WEEKLY-ENTRY-UX-BRIEF.md). It is planning material only and does not authorize runtime or schema changes.

---

## 1. Method and evidence

The original audit used a dual-agent critique and a parent verification pass. A
second current-state pass was completed after the application advanced:

- **Assessment A:** `/root/sol_design_audit`, GPT-5.6 Sol high, source and rendered-page review.
- **Assessment B:** `/root/terra_detector`, GPT-5.6 Terra medium, independent Impeccable detector and runtime route checks.
- **Parent verification:** source inspection plus Playwright/Edge rendering at 1440 × 1000 and a true 375 × 812 viewport.
- **Architecture refresh:** `/root/sol_ui_architect`, GPT-5.6 Sol high, system and migration review.
- **Records refresh:** `/root/terra_records_table`, GPT-5.6 Terra medium, table/data/responsive contract review.
- **Auth and accessibility refresh:** `/root/terra_auth_accessibility`, GPT-5.6 Terra medium, legal-flow and semantic review.
- **Ant documentation refresh:** GPT-5.6 Luna browser executor, official Ant Design and Next.js documentation only.
- **Payroll/calendar source review:** visual and text inspection of `docs/resources/2026_NCRV_Cebu Calendar.pdf`, `docs/resources/New Hire - Setting of Expectations (1).pdf`, and the user-supplied ADP schedule/timesheet screenshots.

Important correction: the first raw Edge headless screenshots used a minimum browser layout width and falsely suggested auth-page horizontal overflow. A later Playwright viewport emulation proved that current Login and Signup do reflow at 375 px. The audit therefore does **not** treat mobile auth overflow as a confirmed defect.

Evidence boundaries:

- Impeccable detector: `[]` across `web/src/app` and `web/src/components`.
- `/login`: local runtime returned `200` and rendered a form.
- `/`: signed-out runtime returned the expected `307` redirect.
- Current Login, Signup, and Terms were visually checked at 375 px.
- Both proposed signup/modal directions were checked at 1440 px and 375 px.
- The repository now has Playwright and `@axe-core/playwright` coverage. Existing checks cover Login, Overview, Add Shift, and Records and require zero serious or critical findings. This is useful regression evidence, not a WCAG-conformance claim; every redesigned route and open modal state still needs to be added to the matrix.
- Calendar and Settings are now implemented. Any earlier statement describing them as placeholders is superseded by this refresh.
- Ant Design is not installed in the current checkout.

Workflow and plugin resolution:

- **Superdesign:** the faithful baseline and two alternatives remain in the project canvas. Multiple branches exist, so the baseline remains active until the user explicitly selects a direction; production UI code is not changed before that gate.
- **UI UX Designer:** supplied the route, component, responsive, form, modal, and handoff structure used in this contract.
- **Engineering Suite Design System / Redesign / Polish / Taste / UX Critique:** supplied the token, adapter, premium-quality, heuristic, and convergence criteria. The critique was refreshed against source because the application had advanced since the first report.
- **Impeccable:** its context directive reserves the next detector run for changed UI. The existing detector result is recorded, but no detector rerun is claimed during concept selection.
- **Motion Design:** its state-continuity principles are used; its GSAP default is rejected because Voyix's repository contract is CSS-only.
- **Open Design:** the skill was reviewed, but its local MCP workflow is not exposed in this runtime. No installation or remote download was performed silently.

---

## 2. Executive verdict

Voyix already has a credible authored foundation. Its exact purple palette, warm paper, Manrope/IBM Plex Mono pairing, employee-owned language, estimate/TBD honesty, semantic tables, visible labels, focus treatment, reduced-motion rule, skip link, and restrained geometry are worth preserving.

The problem is not a lack of decoration. The application only partially realizes its strongest product idea: **show the work, not just the total**.

The current visual specificity is approximately **6/10**. Voyix is recognizable through color, typography, and language, but several compositions could still belong to a generic finance SaaS. The biggest remaining gaps are interaction and composition:

1. Terms and Privacy interrupt Signup by navigating away from the form.
2. Required-field semantics are incomplete across Auth, and the Auth shell lacks the signed-in shell's skip-link behavior.
3. Add Shift makes Calculate and Save compete before the employee has reviewed a current result.
4. The night-window trace does not yet communicate a proportionate calculation story.
5. Records needs a first-class data-table contract, responsive summaries, and bounded server pagination.
6. Record detail presents a dense fact wall instead of preserving the calculation evidence.
7. The intermediate icon-only rail lacks sighted tooltips, and Overview duplicates the Add Shift action.
8. Shift capture is optimized only for one day at a time; repeated schedules need a faster weekly path without turning Voyix into an employer timesheet.
9. Calendar, calculation, and Settings expose related date/code information in separate places rather than one source-labelled evidence model.

The redesign thesis is:

> Make Voyix feel like a beautifully kept personal time record, with the calculation trace as its signature artifact—not like a skinned employer dashboard.

---

## 3. Nielsen heuristic score

| Heuristic | Score | Summary |
| --- | ---: | --- |
| Visibility of system status | 2/4 | Saved/error states exist, but stale preview and route loading behavior need clearer treatment. |
| Match with the real world | 3/4 | Employee-centered language is strong; classification and wage concepts need contextual help. |
| User control and freedom | 2/4 | Legal links interrupt Signup; Calculate/Save ownership is unclear. |
| Consistency and standards | 3/4 | Tokens and shared components are strong; duplicate actions and incomplete Auth semantics weaken consistency. |
| Error prevention | 2/4 | Server validation helps; required semantics and preview-before-save gating need improvement. |
| Recognition rather than recall | 3/4 | Persistent labels are good; dense record detail and icon-only intermediate navigation increase interpretation cost. |
| Flexibility and efficiency | 2/4 | Shareable record filters help; draft/interruption recovery and efficient configuration are limited. |
| Aesthetic and minimalist design | 3/4 | Calm and cohesive, but Auth is structurally generic and several information-heavy pages need stronger hierarchy. |
| Error recognition and recovery | 2/4 | Inline auth feedback exists; recovery is not always located at the failed decision. |
| Help and documentation | 2/4 | Product disclaimers are strong; calculation decision points need more local explanation. |
| **Total** | **24/40** | **Acceptable foundation; significant improvements needed.** |

---

## 4. Route-by-route critique

### Login

What works:

- Calm purple/paper split.
- Honest privacy language.
- Persistent labels and accessible password visibility control.
- Verified 375 px reflow.

What changes:

- Reduce unused desktop story-column space.
- Add the same first-tab skip behavior available in the authenticated shell.
- Keep one dominant sign-in action and improve pending/error proximity.
- Preserve the current lightweight mobile composition.

### Signup

What works:

- Required identity fields and optional monthly salary match the product contract.
- Helper text protects the employment/non-payroll boundary.
- Verified 375 px reflow.

What changes:

- Add native `required` and/or `aria-required` semantics.
- Label required and optional fields visibly and programmatically.
- Open Terms and Privacy in an in-context legal modal without losing form state.
- Keep standalone `/terms` and `/privacy` routes for deep links and signed-out access.
- Never auto-check acceptance when the employee closes or finishes reading the modal.

### Terms and Privacy

What works:

- Product-specific language.
- Clear non-payroll, no-employer-access, estimate, and TBD boundaries.
- Current 375 px article reflows correctly.

What changes:

- Extract the policy body into shared legal-content components.
- Use a bounded, accessible modal from Signup.
- Retain standalone pages with explicit return paths to Signup and Login.
- Do not invent an effective date, version number, jurisdiction, contact path, or legal promise.

#### Legal modal acceptance contract

- Extract the complete Terms and Privacy bodies into shared legal-document components consumed by both modal and standalone routes. Do not maintain shortened modal copies that can drift.
- Use real `type="button"` triggers outside the consent label, named “Read Terms of Use” and “Read Privacy Notice.” Triggering or dismissing a document never toggles acceptance.
- Give the dialog a visible title and accessible name, a labelled Close control, a viewport-bounded internal scroll region, and safe-area-aware spacing at 320/375 px.
- On open, focus the document heading or short introduction at the top, contain keyboard focus, lock background scroll, support Escape, and return focus to the exact trigger on close.
- Keep the checkbox as the sole explicit consent control. It is required, reports `aria-invalid` on failure, and references helper/error copy through `aria-describedby`.
- Preserve every entered signup value across modal open/close. If Terms validation fails, move the error decision to the checkbox rather than a legal-document trigger.
- Keep `/terms` and `/privacy` deep-linkable. Allow only an explicit `/signup` return path; never accept an arbitrary open redirect.
- Test focus containment, Escape, close-button focus return, scroll locking, consent remaining unchecked, 320/375 px reflow, modal-open axe checks, and the standalone return path.

### Overview

What works:

- Current-period framing, three core values, and recent-record ledger align with the product.
- Known estimates exclude TBD values.

What changes:

- Recompose the three equal cards into one stronger period summary with clear metric hierarchy.
- Remove duplicate Add Shift actions at sizes where the shell already supplies the same primary action.
- Specify loading, empty, query-error, missing-period, and partial/TBD states.

### Add Shift

Priority redesign:

- Keep Day entry as the default and introduce a clearly labelled `Day | Week` mode switch.
- Treat Week entry as a private batch shift composer, not an ADP timesheet: never use Submit, Approve, Send to payroll, team schedule, or balance language.
- Let an employee select days, apply/copy a time template, edit classifications per date, calculate each row, and review the complete week before save.
- On mobile, use stacked day summaries and an edit sheet rather than compressing seven weekday columns into a horizontal grid.
- Allow more than one shift on a date; do not invent a one-shift-per-day constraint.
- Make **Calculate** the form’s only primary action.
- Place **Save entry** beside the reviewed calculation result.
- Disable Save until a current preview exists and still matches the form inputs.
- On edit, preserve the prior preview but mark it **Needs recalculation**.
- Separate Standard schedule from approved CWW through progressive disclosure.
- Build a proportional shift/night-window trace from known engine facts.
- Never place an unpaid break at an invented clock position; show it as a labelled deduction when its exact time is unknown.
- Show a source-calendar date hint when relevant, but require explicit employee confirmation before changing the day classification.
- Recommended future weekly persistence is an idempotent, all-or-nothing server transaction. This requires separate approval and contract tests before implementation.

### My Records

What works:

- URL-based filters are shareable.
- The current reusable ledger is a real semantic table with a caption, scoped column headers, numeric alignment, and server-rendered rows.
- Native date inputs and the employee-scoped, Manila-time server query are appropriate.

What changes:

- Use an Ant-backed Voyix segmented-control adapter for Week, Payroll period, Month, and Custom. Route and product components must not import Ant directly.
- Reveal the labelled custom date GET form only after Custom is selected; selecting Custom must not immediately navigate to an invalid empty range.
- Preserve the bespoke, server-rendered semantic table on desktop. Ant Table is not justified for this read-only v1 ledger because it would expand the client boundary without improving the current authoritative server behavior.
- Add bounded server pagination for arbitrary custom ranges: 25 rows, `page` in the URL, stable date/start/id ordering, ordinary Previous/Next links, and a visible “Showing 26–50 of 83” summary.
- Keep sorting server-side. Initially support newest/oldest date only; do not imply that formatted money or mixed TBD amounts can be sorted reliably.
- At widths below 640 px, render complete linked record summaries rather than forcing every common task through a six-column horizontal viewport. Mobile and desktop must expose the same facts.
- Add loading, empty, invalid-range, missing-period, overlapping-period, query-error, partial-TBD, and populated states. Empty and error copy must not be rendered as fake table rows.
- Keep all required values available; do not hide calculation evidence for visual neatness.

#### Records data-table contract

Desktop columns:

1. **Date** — primary row link, with a quiet weekday and an accessible name such as “View record for October 10, 2026.”
2. **Shift** — start and end in IBM Plex Mono.
3. **Day type** — plain-text classification; any visual truncation retains the complete accessible label.
4. **Final ND** — right-aligned tabular number with the `h` unit.
5. **Wage codes** — individual text-backed chips, including an explicit `TBD` marker where relevant.
6. **Known estimate** — right-aligned amount with honest `estimated`, `partial-tbd`, `tbd`, and `none` states.
7. **Open record** — an explicit text action at large widths; a pointer-only clickable row is never the sole navigation path.

Mobile summary order:

- Date plus a visible View record cue.
- Shift and day type.
- Final ND and Known estimate/TBD.
- Complete wage-code chips.
- One semantic anchor with at least a 44 px target; no JavaScript row-click emulation.

The view model must preserve machine values separately from presentation labels. In particular, wage codes remain an array, dates retain an ISO sort value, and estimate status remains a discriminated value instead of being collapsed into one display string. The immutable saved snapshot stays authoritative.

### Record detail

What changes:

- Replace the undifferentiated fact grid with four sections: Shift facts, Duty allocation, ND trace, and Rate basis.
- Use one column at mobile widths.
- Restore the saved timeline/trace so the record retains the evidence the employee reviewed before saving.
- Emphasize Final ND once; keep unresolved lines visibly TBD.

### Calendar

Current state: implemented. The page now loads employee-owned holidays and payroll periods and renders add/list/error/profile-required states.

Redesign outcome:

- Preserve the existing Personal Holidays and Payroll Periods actions, ownership, and honest “dates are never fabricated” boundary.
- Add `Month | Week | References` views: Month for overview, Week for record/entry continuity, and References for the existing personal forms/lists.
- Offer the supplied `NCR Voyix Cebu 2026` calendar only as a source-labelled, read-only reference after exact transcription and independent verification.
- Layer source events, personal notes, and saved shifts distinctly. Never present a source event as employee-owned or a personal note as employer-authoritative.
- Add a URL-addressable selected-day drawer showing source markers, personal references, saved shifts, final ND hours, ADP codes, and links to immutable calculation records.
- Calendar cells may show codes only for saved/calculated shifts. A holiday date alone never produces an ADP code.
- Use a bespoke semantic calendar/list composition rather than Ant's default Calendar widget; an Ant-backed segmented control and accessible drawer adapter are appropriate.
- Keep forms directly available in empty states; use progressive disclosure once lists are populated if it materially reduces scanning cost.
- Strengthen hierarchy, loading feedback, empty copy, validation proximity, and mobile stacking without changing the data contract.
- Do not seed or invent dates. Any shared import must be limited to the exact sourced Cebu/2026 rows, include provenance, remain read-only, and pass a source-manifest verification gate.

### Settings

Current state: implemented. The page now renders profile, computation settings, incomplete-profile recovery, sign-out, and the read-only wage catalog.

Redesign outcome:

- Preserve the profile/computation split and read-only wage catalog.
- Render the account email as read-only metadata, not through a `<label>` targeting a non-labelable paragraph.
- Improve grouping, save-state feedback, responsive ordering, and incomplete-profile recovery.
- Evolve the read-only wage table into an ADP code explorer with source, category, hours category, `TOTAL % to be added`, engine status, and formula status.
- Separate engine-active ND codes from non-ND codes transcribed from the source. Reference-only codes remain inactive for calculation until separately approved.
- Keep non-2211 formulas visibly TBD; source percentages do not establish monetary formulas.
- No hourly-rate input, manager role, admin controls, or wage-catalog editor.

### Shell and navigation

What works:

- Strong desktop rail, current-page treatment, safe-area-aware bottom navigation, and skip link.

What changes:

- Add sighted tooltips when the intermediate rail becomes icon-only.
- Remove duplicate Add Shift entry points at mobile sizes.
- Keep the wordmark and privacy state consistently available without crowding the mobile header.

---

## 5. Accessibility contract

The redesign must preserve and strengthen these requirements:

- One `h1` per page and logical heading order.
- Persistent labels for every form control.
- Native `required` or accurate `aria-required` semantics.
- `aria-describedby` links for helper and error text.
- 44 px minimum primary targets.
- Visible focus on paper and deep-purple surfaces.
- Keyboard-complete legal modal with focus containment, Escape close, and focus return.
- Concise live-region result summary; the full calculation trace remains normally readable instead of being announced as one enormous status update.
- Status text plus icon/words; never color alone.
- 200% and 400% reflow verification.
- CSS-only motion: roughly 180 ms controls and the single 280 ms page entrance.
- `prefers-reduced-motion` disables nonessential motion.
- No Framer Motion, GSAP, route-scale transitions, or looping effects.

---

## 6. Ant Design integration decision

Ant Design should become a **themed interaction-primitive layer**, not a second visual identity and not a blanket component replacement.

The intended architecture is:

```text
RootLayout (Server Component)
  -> AntdRegistry
    -> VoyixAntProvider (small client boundary)
      -> components/ui adapters
        -> Voyix product components
          -> route pages
```

Rules:

- Route pages do not import `antd` directly.
- `components/ui/**` owns Ant imports and translates Voyix props/tokens.
- Adapters expose narrow Voyix props, not Ant's entire public prop surface.
- `globals.css` remains the visual source of truth.
- Product components retain Voyix semantics and composition.
- Use direct components rather than dotted subcomponents in App Router code.
- Keep one icon family: Lucide.
- Do not introduce Ant’s default blue, default dashboard look, dark algorithm, or compact algorithm.
- Keep Server Actions and `useActionState`; do not introduce Ant Form as a parallel validation/data-flow system.
- Do not add `@ant-design/cssinjs` directly, and do not add Ant icons.
- Use declarative Modal inside the provider context rather than static `Modal.info` or `Modal.confirm` calls.
- Configure CSS variables, 44 px control height, Voyix radii/colors/type, and disabled wave effects through `ConfigProvider`.
- Do not style Ant internal DOM selectors. Use supported semantic class/style hooks and wrapper composition.

Official implementation references:

- [Ant Design with Next.js App Router](https://ant.design/docs/react/use-with-next/)
- [Ant Design v6 migration and React support](https://ant.design/docs/react/migration-v6/)
- [Theme customization](https://ant.design/docs/react/customize-theme/)
- [ConfigProvider](https://ant.design/components/config-provider)
- [Modal](https://ant.design/components/modal/)
- [Segmented](https://ant.design/components/segmented/)
- [Table](https://ant.design/components/table/)

The October 15 documentation refresh reported Ant Design `6.6.6`. Ant v6 requires React 18+ and no React 19 compatibility patch; the current app is on React 19.2.8. The official App Router integration requires `@ant-design/nextjs-registry` around the application content to extract first-screen styles and avoid a flash of unstyled Ant content.

### Use Ant for

- Modal and overlay focus behavior through a Voyix legal-modal adapter.
- Drawer behavior for selected-day and mobile week-entry editing through a Voyix adapter, with URL state and tested focus return.
- Button, Input, Password, Checkbox, Select, and narrowly scoped form-control behavior through adapters.
- Segmented record filters with a stable group name and accessible option labels.
- Alert/Empty/Tooltip only where they express real application states.

### Keep bespoke or native

- `AppShell`, `AuthSplit`, `PageHeader`, `Panel`, `Metric`, and `PeriodBanner`.
- `StatusLine`, `WageCodeChip`, `NumberStrip`, and the calculation timeline.
- Native date/time inputs unless a tested Ant replacement is demonstrably better.
- The Records semantic data table. Keep it server-rendered and add Ant only if a future requirement genuinely needs rich client sorting, selection, editing, virtualization, or fixed-column behavior.

### Explicitly avoid

- Ant `Layout`, `Menu`, generic `Card` grids, `Statistic`, default dashboard templates, notification APIs, and the default Calendar widget.
- A permanent mixed shadcn/Radix plus Ant surface layer.
- Raw component-library styling outside the adapter boundary.
- Ant Table for the current read-only Records ledger; it would add hydration and styling cost without replacing the authoritative server query.

The current repository contract names shadcn/Radix as the component foundation. The user’s explicit Ant Design request therefore requires coordinated updates to `AGENTS.md`, `DESIGN.md`, `docs/05-USER-INTERFACE.md`, `docs/06-IMPLEMENTATION-PLAN.md`, `docs/07-SETUP-PLAN.md`, `docs/08-NEXT-IMPLEMENTATION-PLAN.md`, `.agents/README.md`, and dependency guidance when implementation begins. A temporary mixed-library migration is acceptable only behind the adapter boundary; remove obsolete Radix/shadcn dependencies and configuration after usage reaches zero.

Motion Design guidance is adopted only for hierarchy, state continuity, and purposeful feedback. Its default GSAP workflow conflicts with the repository's CSS-only contract, so the repository contract wins: controls remain about 180 ms, the single page entrance remains 280 ms, reduced motion is honored, and no GSAP or Framer Motion is introduced.

---

## 7. Component and page composition contract

The redesign is a component migration and composition pass, not a rewrite of working queries, Server Actions, calculation rules, or RLS boundaries.

```text
RootLayout (server)
└─ AntdRegistry
   └─ VoyixAntProvider (small client boundary)
      ├─ AuthSplit
      │  ├─ Auth page header
      │  ├─ route form built from Voyix UI adapters
      │  └─ LegalModal → shared LegalDocument
      └─ AppShell
         ├─ navigation rail / compact tooltip / mobile bottom navigation
         └─ route page
            ├─ PageHeader
            ├─ product-specific composition
            └─ small `components/ui` adapters only where interaction needs Ant
```

Page composition map:

| Surface | Primary composition | Ant-backed adapters | Bespoke/native elements |
| --- | --- | --- | --- |
| Login | `AuthSplit` + focused sign-in form | Button, Input, Password, Alert | Product story, privacy copy, skip link |
| Signup | `AuthSplit` + identity/consent form | Button, Input, Password, Checkbox, Modal | Shared legal documents, optional salary explanation |
| Terms / Privacy | Standalone legal article | ButtonLink where appropriate | Shared legal document body and return context |
| Overview | Period narrative + recent records | Empty/Alert only if valuable | Period banner, metrics, recent semantic ledger |
| Add Shift | Day quick entry or Week composer → Calculate → Review → Save | Segmented, Select, form controls, edit drawer | Per-day inputs, weekly review, proportional ND trace, calculation evidence |
| My Records | Range controls + result summary + data table | Segmented filter | Server semantic table, mobile summaries, native dates/pagination links |
| Record detail | Four evidence sections | None required initially | Shift facts, duty allocation, ND trace, rate basis/wage lines |
| Calendar | Month / Week / References workspace + selected-day detail | Segmented, Drawer, form controls, Alert/Empty selectively | Semantic calendar/list, source provenance, employee-owned lists, native date inputs |
| Settings | Profile + computation + ADP code explorer | Form controls, Tooltip selectively | Derived rate, sourced read-only catalog, formula/engine status, account metadata |

Premium-quality rules:

- Every page has one dominant task and one clear visual anchor; avoid interchangeable card grids.
- The deep-purple rail, warm paper, mono evidence values, and calculation trace carry the identity. Ant defaults never become the identity.
- Use borders, spacing, type scale, and restrained tonal fills before shadows or decoration.
- No decorative gradients, fake charts, oversized generic hero copy, glassmorphism, or unexplained icon-only actions.
- Empty, loading, error, saved, estimated, partial-TBD, and TBD states are designed as first-class compositions, not afterthought text.
- Motion explains a state change; it never loops, delays input, or competes with the calculation evidence.

## 8. Token mapping

| Ant concern | Voyix value |
| --- | --- |
| Primary/link | `#5F249F` |
| Primary hover | `#531F8C` |
| Structural purple | `#341A4B` |
| Layout background | `#F5F2F6` |
| Container background | `#FFFEFA` |
| Quiet fill | `#FBF9FC` |
| Primary text | `#211E25` |
| Secondary text | `#4C4651` |
| Muted text | `#706A75` |
| Border/strong border | `#E8E4EB` / `#D8D1DE` |
| Success/warning/error | `#356D5B` / `#A86C2E` / `#A75143` |
| Control/panel radius | `8px` / `14px` |
| Base control height | `44px` |
| Interface/numeric type | Manrope / IBM Plex Mono |

A token-contract test should keep TypeScript provider values and CSS custom properties exact.

---

## 9. Canvas directions

### Baseline — current Signup reproduction

[Open faithful baseline](https://superdesign.dev/teams/d9ab7d98-7600-4517-8d77-5bca18547291/projects/6358f71c-4d44-4b34-af4c-7f3b564f82bf?node=draft-variant-d63f0613-d7b0-4254-97fa-f74bbe46b570)

Purpose: neutral source-state reproduction for comparison. This is not the recommended redesign.

### Direction A — Editorial Night Ledger

[Open Direction A](https://superdesign.dev/teams/d9ab7d98-7600-4517-8d77-5bca18547291/projects/6358f71c-4d44-4b34-af4c-7f3b564f82bf?node=draft-variant-2efca117-2a28-4665-b786-3b1e330d95eb)

Characteristics:

- Evolves the established purple/paper auth split.
- Stronger editorial hierarchy and night-ledger identity.
- Terms modal is visually explicit, bounded, and review-only; production uses the complete shared legal document rather than a shortened copy.
- Best continuity with the existing shell and brand.
- Verified clean at 1440 px and 375 px.
- Production amendment: compress the mobile story panel so the form appears earlier, and add the full required/focus/skip-link contract.

**Recommendation:** select Direction A.

### Direction B — Quiet Personal Register

[Open Direction B](https://superdesign.dev/teams/d9ab7d98-7600-4517-8d77-5bca18547291/projects/6358f71c-4d44-4b34-af4c-7f3b564f82bf?node=draft-variant-6db8da93-9b42-4eb0-8648-f5f6ae55de0f)

Characteristics:

- Uses a lighter editorial register with a compact privacy summary.
- Reduces the dominance of the purple story panel.
- Terms modal was repaired after visual QA and now reflows at 375 px.
- More divergent from the authenticated rail, so it needs stronger system convergence later.

---

## 10. Implementation phases after direction approval

### Phase 0 — Confirm the design direction

- Select Direction A, Direction B, or request a specific hybrid.
- Confirm that Terms and Privacy use the same complete legal modal shell.
- Freeze the shared auth/legal layout before production implementation.
- Refresh the changed Signup source fingerprint in Superdesign without creating a third direction.

### Phase 1 — Foundation and contract convergence

- Update repository design/library contracts for the approved Ant adapter strategy.
- Install `antd` and `@ant-design/nextjs-registry` from `web/` with pnpm.
- Add `AntdRegistry` and `VoyixAntProvider` without turning the root layout into a Client Component.
- Add token-contract tests.
- Implement narrow UI adapters, including explicit `Button` and `ButtonLink` behavior instead of preserving a polymorphic `asChild` contract.
- Migrate one vertical slice first and verify Server Action/FormData behavior before broad replacement.
- Remove duplicate primitives and obsolete packages only as each migration reaches zero usage.

### Phase 2 — Auth and legal flow

- Implement Login, Signup, Forgot Password, and Reset Password with the approved composition.
- Extract shared Terms and Privacy content.
- Add the legal modal with focus containment, Escape, return focus, scroll lock, and deep-link fallback.
- Preserve incomplete Signup form state.
- Add required semantics, an Auth skip link, and focused validation tests.

### Phase 3 — Shell and primary workflow

- Refine rail, icon-only tooltips, top bar, mobile bottom navigation, and duplicate Add Shift actions.
- Rebuild Calculate → Review → Save.
- Preserve Day as the default entry path and specify Week entry as a separate progressive slice, with stacked mobile summaries instead of a seven-column mobile grid.
- Place Save with the reviewed result, disable it until a current preview exists, and mark edited previews as needing recalculation.
- Add stale-preview state and a proportional calculation trace without inventing the clock position of an unknown break.
- Keep all unresolved money/allocation rules explicit as TBD.

### Phase 4 — Overview and records

- Recompose period summary and recent records.
- Add complete empty/loading/query-error/TBD states.
- Implement the Records data-table contract: segmented URL filters, 25-row server pagination, stable ordering, accessible desktop table, and information-equivalent mobile summaries.
- Rebuild Record detail around saved evidence and timeline continuity.

### Phase 5 — Calendar and Settings composition

- Redesign the existing employee-owned Calendar forms/lists without changing ownership or inventing dates.
- Add Month/Week/References information architecture and a selected-day drawer specification.
- Gate any `NCR Voyix Cebu 2026` import behind exact source transcription, provenance, applicability, independent comparison, and read-only shared-row security tests.
- Redesign the existing Settings profile, computation, incomplete-profile, and wage-catalog states without adding employer/admin behavior.
- Add the ADP code explorer and keep non-ND source rows reference-only.
- Correct read-only email semantics and improve save/validation feedback.
- Run security review for claims, Server Actions, RLS, ownership, grants, and safe errors.
- Do not fabricate dates, formulas, wage codes, or shared employer configuration.

### Phase 6 — Verification and convergence

- Focused tests during implementation.
- `pnpm --dir web test`
- `pnpm --dir web typecheck`
- `pnpm --dir web lint`
- `pnpm --dir web build`
- `git diff --check`
- Playwright at 320, 375, 768, 900, and 1440.
- 200% and 400% reflow.
- Keyboard-only completion and modal focus behavior.
- Axe with zero serious or critical findings on required routes.
- Axe the open legal-modal state in addition to the underlying Signup route.
- Empty, populated, loading, validation, query-error, saved, estimate, missing-salary, missing-rule, and TBD states.
- Reduced-motion verification.
- Confirm that desktop and mobile Records expose identical information and that all pagination/filter state remains shareable by URL.
- Verify Week entry draft loss/recovery, per-row validation, holiday prompts, more-than-one-shift dates, aggregate review, idempotent retry, and all-or-nothing save if that policy is approved.
- Verify Calendar grid/list parity, source provenance, selected-day URL state, drawer focus behavior, and that source dates never silently change shift classification.
- Verify ADP code visibility across Day, Week, Calendar, Records, Detail, and Settings without treating non-2211 percentages as formulas.
- Two-user isolation for every employee-owned read/write flow.

---

## 11. Delivery acceptance gates

- Zero direct `antd` imports outside the provider and `components/ui/**` adapter boundary.
- Root layout remains a Server Component; no hydration warning or first-paint style flash.
- No Ant blue, Ant icon family, dark/compact algorithm, generic Ant dashboard layout, or unsupported internal-selector styling.
- 44 px primary controls, visible focus, persistent labels, correct required semantics, and valid heading/landmark order.
- Terms and Privacy open in context, retain entered form values, contain focus, close with Escape, restore focus, lock background scroll, and never change consent.
- Standalone legal routes remain deep-linkable and expose safe Signup/Login return paths.
- One visible primary Add Shift action per breakpoint.
- Save is available only for the current reviewed calculation; changed inputs make the prior result visibly stale or remove it.
- Records desktop table and mobile summaries expose the same date, shift, day type, Final ND, wage codes, and honest amount/TBD state.
- Day and Week entry use the same calculation engine and show the same evidence for an equivalent shift.
- Week entry is consistently described as saving private records, never submitting a timesheet or requesting approval.
- Source calendar rows display source/site/year provenance and cannot be mutated by authenticated clients.
- A source holiday produces, at most, a confirmation prompt; it never silently sets classification or selects a wage code.
- ADP code surfaces distinguish source percentage, engine activation, applicable hours, and money-formula status.
- Every estimate, partial result, pending state, error, saved state, and TBD outcome uses words in addition to color.
- Keyboard-only completion at 320/375/768/900/1440, plus 200% and 400% reflow.
- Axe reports zero serious or critical findings across every redesigned route and the open legal modal.
- Reduced motion removes nonessential movement and retains understandable state changes.
- Unit tests, E2E, pgTAP, typecheck, lint, build, and `git diff --check` pass; two-user isolation remains proven for employee-owned reads and writes.

## 12. Approval gate

Superdesign requires the current-state reproduction and alternatives to be reviewed before production code is changed. No application code or dependencies have been changed in this design-direction phase.

Recommended approval:

> Approve Direction A — Editorial Night Ledger, use the same legal modal shell for Terms and Privacy, retain standalone deep-link pages, and continue into production implementation.

The Calendar/Week-entry source expansion has a separate decision gate. Review the six decisions in [`docs/CALENDAR-WEEKLY-ENTRY-UX-BRIEF.md`](./CALENDAR-WEEKLY-ENTRY-UX-BRIEF.md) before authorizing source import, batch persistence, or calendar-route changes.
