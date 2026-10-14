# Voyix Workspace — Next Implementation Plan

- **Status:** Execution authorized; Direction A and recommended Calendar/Week package selected
- **Prepared:** October 15, 2026 (original plan October 11; current-state/source addendum added October 15)
- **Scope:** Preserve the completed core workflow, execute the approved UI redesign in controlled slices, implement the approved source-backed Calendar and Week entry capabilities.
- **Runtime:** `web/`
- **Hosted Supabase project:** `dvfxyrcxxktjgutpgcyw` (existing Tokyo project; do not create another project)
- **Production URL:** `https://voyix-workspace.vercel.app`
- **Intended custom domain:** `https://voyix.kentsuuii.tech` (CNAME already added; certificate propagation may still be in progress)

This is an implementation plan, not an authorization to invent payroll rules. It reconciles the requested next build with the repository as it exists now. It does not restart completed foundation work from `docs/07-SETUP-PLAN.md`.

## 0. October 15 planning addendum

This addendum supersedes stale baseline statements later in this document without erasing their historical implementation rationale.

- Overview, Add Shift, My Records, Record detail, Calendar, and Settings are now implemented.
- Playwright and `@axe-core/playwright` now exist in the working tree.
- Calendar now provides Month/Week/References views, saved-shift overlays, a selected-day drawer, and an explicitly selected read-only Cebu 2026 reference.
- Day remains the default; Week composes reviewed private shifts with atomic, idempotent persistence.
- Settings provides a searchable source-aware ADP code explorer; non-ND reference rows remain inactive.
- Ant Design 6.6.6 and the App Router registry are installed behind Voyix adapters; obsolete Radix/shadcn dependencies are removed.
- The execution changes remain uncommitted for review. Future implementation must preserve them.
- Runtime, dependency, and additive schema implementation is authorized by the October 15 user request. Deployment remains a separate action.

New planning sources:

- [`docs/resources/2026_NCRV_Cebu Calendar.pdf`](./resources/2026_NCRV_Cebu%20Calendar.pdf)
- [`docs/resources/New Hire - Setting of Expectations (1).pdf`](./resources/New%20Hire%20-%20Setting%20of%20Expectations%20%281%29.pdf)
- User-supplied ADP schedule/timesheet screenshots
- [`docs/CALENDAR-WEEKLY-ENTRY-UX-BRIEF.md`](./CALENDAR-WEEKLY-ENTRY-UX-BRIEF.md), the detailed source analysis, interaction options, wireframes, and decision gate
- [`docs/UI-REDESIGN-AUDIT.md`](./UI-REDESIGN-AUDIT.md), the current design-system and route-level contract

The PDFs are evidence, not executable configuration. The 2026 calendar is Cebu/site/year-specific. The onboarding material's 9 PM–6 AM example conflicts with the clarified break rule, and its cutoff prose is not enough to derive future dates automatically. The locked Voyix calculation and TBD contracts continue to win.

---

## 1. Outcome

Build the smallest complete version of Voyix Workspace that lets one signed-in employee:

1. Enter a shift in a few seconds.
2. See how night-differential hours were estimated.
3. Save the server-calculated result as an immutable snapshot.
4. Review current-period totals and recent entries.
5. Filter personal records and open saved calculation details.
6. Maintain personal holiday references, payroll periods, and computation settings.
7. See unresolved wage rules as explicit `TBD` states rather than guessed amounts.
8. Optionally enter several private shift records through a reviewed Week composer while retaining Day entry as the default.
9. Understand source calendar events, personal notes, saved shifts, ND totals, and ADP codes in one accessible Calendar experience.
10. Browse sourced ADP-code reference data while clearly distinguishing source percentage, engine activation, applicable hours, and money-formula status.

The completed product remains a private employee shiftbook. It is not employer payroll, does not submit time, does not approve wages, and does not verify employment.

---

## 2. Sources of truth

Read these before beginning a phase. Later implementation must preserve the contracts across all affected files rather than making isolated UI or database changes.

| Surface | Required documents |
| --- | --- |
| Any work | `PRODUCT.md`, `AGENTS.md`, `.agents/skills/voyix-shift-workflow/SKILL.md` |
| Engine | `docs/01-BUSINESS-RULES.md`, `docs/02-WAGE-TYPES.md`, `docs/03-CALCULATION-ENGINE.md` |
| Schema and auth | `docs/04-DATA-MODEL.md`, `docs/07-SETUP-PLAN.md` Supabase sections |
| UI | `DESIGN.md`, `docs/05-USER-INTERFACE.md`, `docs/07-SETUP-PLAN.md` section “Screen work that follows this plan,” `.superdesign/design-system.md` |
| Delivery order | `docs/06-IMPLEMENTATION-PLAN.md`, reconciled with the actual checkout and this document |
| Calendar / Week entry source expansion | `docs/CALENDAR-WEEKLY-ENTRY-UX-BRIEF.md`, both PDFs under `docs/resources/`, and `docs/UI-REDESIGN-AUDIT.md` |

If the sources disagree, use this priority:

1. The current user request and `AGENTS.md` hard constraints.
2. `PRODUCT.md` and the numbered business/calculation/data/UI specifications.
3. `DESIGN.md` and the current application contracts.
4. Older unchecked instructions in `docs/06-IMPLEMENTATION-PLAN.md` and `docs/07-SETUP-PLAN.md`.

Do not execute either older plan mechanically. Their foundation checklists remain unchecked even though their artifacts already exist.

---

## 3. Current repository baseline

### 3.1 Completed work

Foundation tasks 1–8 are already present:

- Next.js 16 App Router application under `web/`.
- Voyix tokens, typography, shell, responsive rail/bottom navigation, and empty route landmarks.
- Email/password signup, sign-in, sign-out, cookie refresh, authenticated layouts, and employee profile creation.
- Employee-owned Supabase tables and RLS for `employees`, `shifts`, `nd_records`, `nd_wage_type_lines`, `holidays`, and `payroll_periods`.
- Read-only authenticated access to the seeded `wage_types` catalog.
- Sixteen seeded ND wage-type rows. Holidays and payroll periods are intentionally not seeded.
- Pure `calculateNd` engine using Luxon and decimal.js.
- Factor-261 salary derivation, duty-hour snapshots, approved-CWW thresholds, employee-recorded overtime approval, previous-night ND overlap, explicit TBD lines, and final-centavo rounding.
- CI for lint, typecheck, Vitest, and Next build.
- Two applied migrations:
  - `supabase/migrations/20261003234325_foundation.sql`
  - `supabase/migrations/20261008180205_monthly_salary_overtime_rules.sql`

### 3.2 Verified baseline at planning time

- Branch: `feat/voyix-shift-foundation`.
- Worktree was clean before this document was added.
- `pnpm --dir web test` passed: 3 files, 17 tests.
- The local Supabase development stack was running.
- The checkout was linked to `dvfxyrcxxktjgutpgcyw`.
- `supabase --agent no migration list --local` listed both migrations locally and remotely.
- No database reset, hosted schema mutation, commit, or push was performed while producing this plan.

### 3.3 Historical gap list (October 11; superseded by the October 15 execution)

- All signed-in product pages are still empty landmarks.
- `/shift/new` does not have a working form, preview, or save action.
- No Server Action writes shift snapshots.
- Overview does not query personal periods or records.
- Records filters and record detail are not implemented.
- Calendar and Settings do not write employee-owned rows.
- Playwright and `@axe-core/playwright` are not direct dependencies, despite older setup text describing them as installed.

### 3.4 Existing engine coverage

`web/src/engine/calculate-nd.test.ts` already covers:

- Factor-261 rate derivation for the locked ₱34,800 salary.
- Break included in ND without adding it back to worked hours.
- An early-morning shift intersecting the previous night’s ND window.
- Approved and unapproved extra worked time.
- Approved-CWW behavior and the 8–12-hour validation boundary.
- Zero-floor behavior.
- Saturday preserved as employee-selected Regular Work Day.
- Multiple matching wage rules.
- No matching wage rule.
- Factor-261 calculation at another salary.

The next engine phase adds only missing direct characterizations. It must not rewrite already passing behavior without a failing spec-backed test.

---

## 4. Locked product and calculation contracts

### 4.1 Product boundary

- One employee owns and sees only their own personal data.
- There are no manager or admin accounts.
- There is no approval workflow.
- `overtime_approved` records the employee’s statement that extra work was agreed or approved. Voyix Workspace does not perform the approval.
- There is no public marketing page, employer console, chart dashboard, OAuth flow, client cache, separate API, Edge Function, REST envelope, repository layer, Prisma, Drizzle, or tRPC.

### 4.2 Authentication and authorization

- Email and password are the sign-in credentials.
- Passwords require at least 12 characters.
- There is no employee ID or other workplace identifier. A profile does not require one.
- `employees.id` equals `auth.users.id`.
- Layouts and every Server Action call `getClaims()`.
- `web/src/proxy.ts` refreshes cookies only; it does not authorize.
- RLS remains the database enforcement boundary.
- Policies use `(select auth.uid())`.
- Never authorize from `user_metadata`.
- No `anon` grants exist on application tables or mutation functions.
- No `security definer` function may exist in `public`.

### 4.3 Time, hours, and salary

- Time zone is `Asia/Manila`.
- Luxon owns date-time and interval math.
- Hours use decimal.js in the engine and `numeric` in Postgres.
- The default ND window is 10:00 PM–6:00 AM the next day.
- The default unpaid break is 1 hour.
- Worked hours are `max(0, elapsed hours - unpaid break)`.
- `break_included_in_nd` changes only the ND overlap. It never adds the break back to worked hours.
- Standard regular hours are exactly 8.
- An approved CWW threshold is 8–12 hours inclusive.
- Monthly basic salary is optional.
- The computational hourly rate is `(monthly basic salary × 12) / 261 / 8`.
- Factor 365 must never be used as an engine divisor.
- Preserve precision through the rate derivation and round only the final estimate to integer centavos.

### 4.4 Wage rules

- Wage-type lookup is data-driven.
- One calculation may return multiple wage-type lines.
- Only ordinary-day code `2211` at 10% has a confirmed money formula.
- Code `2252` and every non-2211 monetary formula remain TBD.
- A missing wage rule produces the exact unresolved reason: “No configured ND wage type rule matches this shift.”
- Estimated lines require non-null applicable hours.
- A TBD line may have null applicable hours when allocation is unresolved.

### 4.5 Snapshot history

- The browser preview and server save both call `calculateNd`.
- The server reloads trusted profile/configuration data and reruns the engine.
- Client preview output is never accepted as the persisted result.
- Saved records preserve the calculation inputs and outputs used at save time.
- Record detail reads the stored snapshot; it does not recalculate against current salary, settings, or wage rules.

### 4.6 Visual and interaction contract

- Brand purple is exactly `#5F249F`.
- Deep structural purple is exactly `#341A4B`.
- Light lavender on the deep rail is `#C3A3E0`.
- The wordmark is lowercase `voyixworkspace`; `workspace` uses the light lavender on the deep-purple rail.
- Interface type is Manrope. Times, dates, hours, wage codes, employee codes, and money use IBM Plex Mono with tabular figures.
- The application uses a light paper canvas only. There is no dark-mode palette in version 1.
- Green is reserved for positive/saved/private states, amber for estimates/TBD/caution, and rose for errors. Every status also has visible text.
- Buttons and primary touch targets are at least 44 px.
- Control transitions are approximately 180 ms. The single page entrance is approximately 280 ms and a 5 px rise/fade.
- Motion is CSS-only and honors `prefers-reduced-motion`.
- Do not add Framer Motion, GSAP, gradients, looping animation, avatars, employer badges, nested cards, or a chart dashboard.
- Compose screens from existing Voyix product components and Ant-backed Voyix UI adapters. Keep color tokens in `web/src/app/globals.css`; do not scatter one-off hex values through components.

The pending redesign replaces the last bullet's library-specific wording only after approval: Ant may be introduced behind `components/ui/**` adapters and `AntdRegistry`, while Voyix product components and tokens remain the visual source of truth. Until then, the current component stack remains authoritative.

### 4.7 Source-backed Calendar, weekly entry, and ADP visibility

- Day entry remains the default and must remain complete on its own.
- Week entry is a private batch shift composer. It is not an employer timesheet, team schedule, approval request, or payroll submission.
- A weekly draft is not a saved record. Every included row must be calculated and reviewed before persistence.
- If atomic batch saving is approved, all reviewed snapshots save in one transaction or none do; retries must be idempotent.
- More than one shift may occur on a date. Do not add a one-shift-per-day constraint.
- Source calendar rows are read-only, source/site/year-labelled reference data. Personal calendar rows remain employee-owned.
- A source holiday may prompt the employee to review classification but never silently changes it.
- Calendar cells show ADP codes only for calculated/saved shifts; a holiday date alone does not generate a code.
- The 2026 Cebu source does not establish other years, sites, or users' applicability.
- The onboarding filing/cutoff material may be shown as source-labelled guidance, never as proof that Voyix filed a record.
- Non-ND codes transcribed from the supplied table remain display-only until a separate engine/configuration decision activates them.
- The phrase `TOTAL % to be added` remains visible for sourced percentages. It does not establish a money formula.
- Only code 2211 retains a confirmed estimate formula. No source expansion changes this rule.

---

## 5. Rules that must remain TBD

These are global stop conditions for every phase:

1. The money formula for every ADP percentage or category other than ordinary-day code 2211 at 10%.
2. Treatment of an overnight shift that crosses from one holiday or day classification into another.
3. Allocation of qualifying ND overlap between regular hours and approved overtime, including when and how code 2252 applies.
4. Any wage-type code not already present in the seeded table.
5. Automatic derivation of a payroll cut-off from “next business day,” including holiday/weekend treatment.
6. Applicability of the Cebu/2026 source calendar to an employee who has not explicitly selected or confirmed that source.
7. Whether weekly persistence is all-or-nothing and the exact duplicate/idempotency contract, until the user approves the recommendation.

When one of these rules is needed:

- Do not infer an answer from elapsed time, weekday, or a percentage label.
- Return or preserve `tbd`/`unresolved` state.
- Show the reason in employee-facing language.
- Do not format a TBD amount as currency.
- Stop and request a source when two interpretations would change payroll math.
- Preserve source labels and provenance rather than presenting an employer reference as a universal rule.

---

## 6. Skills and agent workflow

### 6.1 Always load

For every implementation slice:

1. Read `AGENTS.md` and `PRODUCT.md`.
2. Load `voyix-shift-workflow`.
3. Identify the affected surface.
4. Read the surface documents before changing files.
5. Load only the skills needed for that slice.

### 6.2 Skills by surface

| Surface | Skills | Purpose in this plan |
| --- | --- | --- |
| Engine | `tdd-workflow`, `verification-loop` | Named RED/GREEN characterization tests and completion gates |
| UI | `design-taste-frontend`, `minimalist-ui`, `shadcn`, `apple-design`, `accessibility`, `browser-qa` | Preserve the quiet employee UI, use existing primitives, enforce focus/targets/reduced motion, and verify responsive states |
| React composition | `frontend-patterns` when component boundaries need review | Keep Server Components, client form state, and reusable product components aligned without introducing a client cache |
| Schema | `supabase`, `supabase-postgres-best-practices`, `security-review` | Current Supabase guidance, migrations, transaction/RPC design, indexes, RLS, grants, and pgTAP verification |
| Auth and Server Actions | `supabase`, `security-review` | Claims checks, input validation, employee ownership, safe errors, and secret boundaries |
| Next.js 16 | `nextjs-turbopack` when a Next/Turbopack issue is involved | App Router, Server Component, Server Action, build, or generated-route issues |
| Current library documentation | `documentation-lookup` when framework behavior is version-sensitive | Verify current official Next.js, Supabase, or library behavior instead of relying on stale examples |
| Git delivery | `git-workflow` only when the user asks for a commit, PR, or branch operation | Preserve hooks and repository policy; never make commit/push automatic |
| Final verification | `verification-loop`, `browser-qa`, `accessibility` | Test/type/lint/build/diff gates plus keyboard, viewport, and axe checks |

Repository rules override generic skill defaults:

- There is no 80% coverage gate.
- Do not add public REST endpoints because a generic backend skill suggests them.
- Do not add an admin role or manager workflow.
- Do not add CSRF middleware, rate-limit infrastructure, or other unrelated architecture without a concrete Voyix requirement and current Next.js/Supabase review.

### 6.3 Parked skills

Do not load these unless the user names them:

- `python-patterns`
- `python-testing`
- `seo`
- `brutalist-skill`
- `soft-skill`
- `imagegen-frontend-mobile`
- duplicate taste packs
- generic `backend-patterns` or `api-design` when they would push a public API

### 6.4 Agent use

| Agent | When to use |
| --- | --- |
| `voyix-planner` / `planner` | Before a complex multi-file phase or when code/spec state is ambiguous |
| `voyix-tdd` / `tdd-guide` | Engine work and any named RED/GREEN contract tests |
| `voyix-reviewer` / `code-reviewer` and `typescript-reviewer` | After implementation changes, before declaring the phase complete |
| `voyix-security` / `security-reviewer` | Auth, RLS, environment variables, database functions, and Server Actions |
| `voyix-build-fixer` / `build-error-resolver` | Only after a real typecheck or build failure |
| `impeccable-*` | Only when the user explicitly requests the Impeccable design pipeline |

Do not add a Python reviewer or an SEO specialist. They are not part of this repository.

### 6.5 Phase execution loop

Every phase follows this sequence:

1. Reconcile the phase against the checkout; do not assume plan checkboxes reflect reality.
2. Read the required specs and inspect the relevant existing files.
3. Write or strengthen the named failing test first.
4. Run the focused test and confirm the intended failure.
5. Implement the smallest change that satisfies the established contract.
6. Run focused tests until green.
7. Review against product/spec rules.
8. Run a quality review.
9. Run a security review when the phase touches claims, Server Actions, RLS, functions, or environment variables.
10. Run the proportional verification gates.
11. Report exactly which checks passed and which runtime checks remain unverified.
12. Commit only if the user asks. Never push unless asked.

---

## 7. Shared technical decisions

### 7.1 Atomic shift persistence

The save operation must write `shifts`, `nd_records`, and `nd_wage_type_lines` in one database transaction. Multiple independent Supabase client inserts are not sufficient because a later insert can fail after an earlier insert commits.

Use one Postgres function called through `supabase.rpc()` from the authenticated Server Action:

- Use `security invoker`, not `security definer`.
- Set `search_path = ''` and schema-qualify every object.
- Derive or enforce the employee ID from `(select auth.uid())`.
- Revoke function execution from `public` and `anon`.
- Grant execute only to `authenticated`.
- Keep the transaction short: validation and `calculateNd` happen before the RPC; the function performs only the inserts and returns the new record identifier.
- Preserve RLS on all inserted tables.
- Do not initialize a service/secret-key client for this path.
- Do not use a public `security definer` function.

Reference checked during planning: <https://supabase.com/docs/guides/database/functions>.

### 7.2 Database contract tests

Create pgTAP tests under `supabase/tests/database/` that prove:

- Anonymous callers cannot execute the save function or access application rows.
- An authenticated employee can save their own snapshot.
- A caller cannot provide another employee as owner.
- A second employee cannot read the first employee’s shift, record, or wage lines.
- Estimated lines require applicable hours and money.
- TBD lines require null money and may have null applicable hours.
- A child-line failure rolls back the shift and record inserts.
- Read-only wage types cannot be inserted, updated, or deleted by authenticated users.

Run database tests using the repository-required CLI form:

```powershell
supabase --agent no test db
```

Reference checked during planning: <https://supabase.com/docs/guides/database/postgres/row-level-security>.

### 7.3 Integer-centavo schema preflight

The wage-line money column is `calculated_amount_centavos bigint` (integer centavos, null when tbd). Resolve this before the first application record is saved.

Implementation sequence:

1. Query local and linked environments for existing non-null values.
2. If the column is empty, migrate it to an explicitly named integer-centavo field, preferably `calculated_amount_centavos bigint`.
3. Add constraints so an `estimated` line has non-null integer centavos and a `tbd` line has null centavos.
4. Update `docs/04-DATA-MODEL.md`, engine-to-database mapping, queries, and UI types together.
5. If non-null data exists, stop. Determine its current unit before designing a backfill. Do not assume existing values are pesos or centavos.

### 7.4 Timeline honesty

The app does not collect break start and end timestamps. Therefore:

- The timeline may position the actual shift interval and ND-window overlap.
- It must not position the unpaid break at an invented clock time.
- Show the break as a clearly labeled deduction, for example `1.00 hr excluded — break time not collected`.
- The number strip shows potential ND, break treatment, and final ND.
- Any hatched break treatment must be visibly conceptual rather than presented as a known interval.

### 7.5 Query organization

- Mutations live under `web/src/server/actions/`.
- Server Component reads live under `web/src/server/queries/`.
- Pure date/filter/summary helpers may live under `web/src/lib/` with Vitest coverage.
- Calculation logic remains in `web/src/engine/` with no React or Supabase imports.
- Do not create a repository abstraction layer.
- Do not add a separate API route for application CRUD.

---

## 8. Phase 1 — Finish the calculation characterization matrix

### Goal

Complete every engine case named by the product plan while preserving existing passing behavior and keeping unresolved payroll rules explicit.

### Dependencies

- Existing engine types and implementation.
- Existing seeded rule shapes.
- `docs/01-BUSINESS-RULES.md` through `docs/03-CALCULATION-ENGINE.md`.

### Skills and agents

- Skills: `voyix-shift-workflow`, `tdd-workflow`, `verification-loop`.
- Agent workflow: use `voyix-tdd` / `tdd-guide` for the RED/GREEN test slice when delegated; use `voyix-reviewer` / `code-reviewer` and `typescript-reviewer` after implementation changes.
- Do not load UI, SEO, Python, or generic backend skills for this engine-only phase.

### Files likely touched

- Test first: `web/src/engine/calculate-nd.test.ts`
- Only if a new test exposes a defect: `web/src/engine/calculate-nd.ts`
- Only if an existing documented contract requires it: `web/src/engine/types.ts`

### Tests to write or strengthen first

1. **11 PM–7 AM partial overlap**
   - Potential ND is 7.00 hours from 11 PM–6 AM.
   - Break excluded produces 6.00 final ND hours.
   - Break included produces 7.00 final ND hours.

2. **Daytime shift**
   - 1 PM–10 PM produces 0.00 potential and final ND hours.
   - No wage-type line is manufactured for zero ND.

3. **Saturday explicitly classified as Rest Day**
   - Preserve `REST_DAY` rather than deriving classification from weekday.
   - Match the existing first-eight rule for code 2411.
   - Keep the amount `tbd` with the existing unknown-formula reason.

4. **Standard schedule threshold**
   - `STANDARD` accepts exactly 8 hours.
   - It rejects values below or above 8.

5. **Approved CWW example**
   - An 11-hour elapsed shift with a 1-hour unpaid break and a 10-hour approved-CWW threshold has 10 worked hours and 0 potential overtime.

6. **Multiple matching wage lines**
   - A special-public-holiday first-eight case returns both seeded codes 2411 and 2418.
   - Both lines remain TBD.
   - Assert exact codes and reasons, not only line count.

7. **Unknown allocation**
   - Approved extra time may surface the configured excess candidate.
   - Applicable hours remain null where ND regular/overtime allocation is unresolved.
   - Code 2252 remains TBD.

8. **Unknown money formula**
   - Non-2211 matched rules keep known ND hours when allocation is known.
   - They never return centavos.

### Implementation rules

- Add the failing test before touching engine behavior.
- Do not duplicate Luxon or Decimal computations in tests; assert public results.
- Do not add a holiday date fixture as an authoritative calendar.
- Do not create a second-day classification algorithm.
- Do not select code 2252 solely because worked hours exceeded 8.

### Execution sequence

1. Inventory the requested cases against the existing 13 engine tests.
2. Add one missing direct characterization at a time.
3. Run the focused test and confirm RED only when implementation behavior is actually missing.
4. Make the smallest spec-backed engine change, if any.
5. Run the full engine file after each behavior change.
6. Review exact decimal strings, centavos, line status, and unresolved reasons.
7. Run the phase verification gates and reviewer pass.

### Done means

- Every requested engine case has a direct named test.
- The full Vitest suite is green.
- Existing locked result remains unchanged: 9 PM–6 AM, break excluded, ₱34,800 salary → 7.00 ND hours, code 2211, 14,000 centavos.
- No ADP code, formula, holiday date, or ND allocation was invented.
- Focused engine tests, full web tests, typecheck, lint, and `git diff --check` pass.

### Rules that remain TBD

- Cross-date holiday/day-classification behavior.
- ND allocation between regular and approved overtime.
- Code 2252 hours/formula.
- Every non-2211 money formula and unseeded code.

---

## 9. Phase 2 — Add Shift preview and atomic save

### Goal

Turn `/shift/new` into the first complete vertical slice: employee input, browser preview, calculation trace, server recalculation, and atomic snapshot persistence.

### Dependencies

- Phase 1 characterization suite is green.
- Local database can run new migrations and pgTAP tests.
- The integer-centavo preflight has a safe outcome.

### Skills and agents

- Always: `voyix-shift-workflow`.
- Engine contract: `tdd-workflow`, `verification-loop`.
- UI: `design-taste-frontend`, `minimalist-ui`, `shadcn`, `apple-design`, `frontend-patterns`, `accessibility`, `browser-qa`.
- Schema/auth: `supabase`, `supabase-postgres-best-practices`, `security-review`.
- Next.js: `nextjs-turbopack` only if an App Router, generated-route, or build behavior needs investigation.
- Agent workflow: planner before the multi-file slice; `voyix-tdd` for named tests; `voyix-security` for the RPC, RLS, claims, and Server Action; `voyix-reviewer`, `code-reviewer`, and `typescript-reviewer` after implementation.
- Use current official documentation through `documentation-lookup` or the Supabase documentation flow before implementing version-sensitive database/function behavior.

### Files likely touched or created

#### Engine and mapping

- `web/src/engine/types.ts`
- `web/src/engine/calculate-nd.ts`
- `web/src/engine/calculate-nd.test.ts`
- A pure engine-to-snapshot mapping helper and test if needed

Any engine type extension in this phase is for persistence identity and transparency, not new payroll math. The save path needs enough information to preserve matched rule identity, category, hours category, description, normalized timestamps, percentage, hours, status, amount, and reason.

#### UI

- `web/src/app/(app)/shift/new/page.tsx`
- `web/src/app/(app)/shift/new/shift-form.tsx`
- `web/src/components/shift/calculation-preview.tsx`
- `web/src/components/shift/night-window-timeline.tsx`
- `web/src/components/shift/number-strip.tsx`
- `web/src/components/shift/wage-type-table.tsx`
- `web/src/components/shift/wage-code-chip.tsx`
- `web/src/components/shift/estimate-note.tsx`
- `web/src/components/forms/status-line.tsx`

#### Server and database

- `web/src/server/queries/shift-configuration.ts`
- `web/src/server/actions/shifts.ts`
- `web/src/server/actions/shifts.test.ts`
- A migration created with `supabase --agent no migration new <descriptive-name>`
- `supabase/tests/database/save_shift_snapshot.test.sql`
- `docs/04-DATA-MODEL.md` and `docs/07-SETUP-PLAN.md` if the centavo contract changes

#### Browser testing

- `web/playwright.config.ts`
- `web/e2e/add-shift.spec.ts`
- `web/package.json`
- `web/pnpm-lock.yaml`

### Tests to write first

#### Server Action tests

- Signed-out calls return a safe authentication error.
- Invalid date, time, classification, schedule, and approval values return field errors.
- Standard schedules use exactly 8 regular hours.
- Approved CWW accepts only 8–12.
- The action ignores client-supplied salary, time zone, ND window, break hours, wage rules, owner ID, and calculation output.
- The action reloads the employee profile and active wage rules.
- The action calls `calculateNd` on the server.
- The action sends only the server result to the atomic save function.
- Database errors return generic employee-facing copy without secrets or stack traces.

#### Database tests

- All three tables commit on a valid save.
- A child-line failure rolls back all inserts.
- The function stores the caller as employee owner.
- User A cannot save under or read User B.
- Anonymous execution fails.
- Estimated lines require hours and integer centavos.
- TBD lines have null money and may have null hours.
- The function cannot write an unknown wage-type identity unless the snapshot contract explicitly permits a missing-rule result with no lines.

#### Browser tests

- Locked case: 9 PM–6 AM, break excluded, standard 8, overtime not approved, Regular Work Day, ₱34,800 salary.
- Preview announces 9.00 elapsed, 8.00 worked, 8.00 regular, 0.00 potential OT, 8.00 potential ND, 1.00 break excluded, and 7.00 final ND.
- Code 2211 and ₱140.00 appear with `ESTIMATE ONLY` wording.
- Missing salary shows hours but keeps money TBD.
- A missing wage rule shows the exact unresolved message.
- Validation, pending, database error, saved, and pre-calculation states are visible and accessible.

### Implementation sequence

1. Resolve the centavo schema contract.
2. Extend calculation output only as needed to preserve normalized interval and matched-rule snapshot identity.
3. Add the `security invoker` save function and its grants.
4. Prove transaction rollback and isolation with pgTAP.
5. Build the server query that loads employee calculation settings and active wage rules.
6. Build the client form and preview using the same engine.
7. Build the Server Action that validates, reloads trusted data, recalculates, maps the snapshot, and calls the RPC.
8. Render timeline, duty trace, number strip, wage lines, estimate note, and unresolved reasons.
9. Add the first Playwright flow and accessibility scan.

### UI and copy rules

- Page eyebrow: `ADD A SHIFT`.
- Title: `Calculate this shift`.
- Description: `Your night hours, accounted for.`
- Primary preview action: `Calculate shift`.
- Save action: `Save entry`.
- Supporting note: `This does not submit anything to payroll.`
- Amount note: `Estimate only — confirm your payroll rule before relying on this amount.`
- Controls and primary touch targets are at least 44 px.
- Preview changes use an `aria-live="polite"` region.
- Status is never conveyed by color alone.
- Motion remains CSS-only and respects `prefers-reduced-motion`.

### Done means

- A signed-in employee can calculate and save the locked sample.
- Preview and server save use `calculateNd`; the server result is authoritative.
- No partial record survives a save failure.
- Stored snapshots contain all confirmed explanatory values.
- The timeline never fabricates a break timestamp.
- Empty, pending, error, saved, and TBD states work at 1440 and 375.
- Keyboard-only operation and axe report no serious or critical issue.
- Database tests, focused tests, full web tests, typecheck, lint, build, Playwright flow, and `git diff --check` pass.

### Rules that remain TBD

All four global hard stops. The UI must keep those states visible rather than disabling the whole shiftbook.

---

## 10. Phase 3 — Overview

### Goal

Show the signed-in employee’s current personal payroll period, three headline figures, and recent saved entries using immutable snapshots.

### Skills and agents

- Skills: `voyix-shift-workflow`, `frontend-patterns`, `design-taste-frontend`, `minimalist-ui`, `accessibility`, `browser-qa`, and `verification-loop`.
- Add `supabase` and `security-review` for employee-scoped query review.
- Agent workflow: planner if the aggregate query and component split remain ambiguous; reviewers after the screen/query implementation; security reviewer for ownership and data-disclosure checks.

### Files likely touched or created

- `web/src/app/(app)/page.tsx`
- `web/src/server/queries/overview.ts`
- `web/src/components/records/period-banner.tsx`
- `web/src/components/records/metric.tsx`
- `web/src/components/records/ledger.tsx`
- `web/src/lib/record-summary.ts`
- `web/src/lib/record-summary.test.ts`
- `web/e2e/overview.spec.ts`

### Tests to write first

- No configured personal payroll period.
- Current period with no saved shifts.
- Correct total ND hours.
- Correct sum of known estimated centavos.
- Correct unique entry count.
- Multiple wage lines do not double-count a shift’s ND hours or entry count.
- TBD lines are excluded from the money total and disclosed separately.
- An overlapping active-period configuration produces a visible configuration error rather than silently selecting one.
- Query failure produces an error state with a next action.

### Implementation sequence

1. Create a server query scoped by RLS and the current employee.
2. Resolve “today” in `Asia/Manila`.
3. Find the employee-owned current period.
4. Aggregate saved `nd_records` once per record.
5. Sum only `estimated` line centavos for the known amount.
6. Load a limited recent-entry ledger.
7. Render period banner, metrics, ledger, estimate disclosure, empty state, and error state.

### Done means

- The three figures are total ND hours, known estimated ND amount, and total entries.
- The recent ledger links to saved record detail.
- Known amounts are labeled estimates.
- Unresolved amounts never enter the currency total.
- No chart or employer-style KPI dashboard is introduced.
- The screen passes keyboard, axe, empty/error, reduced-motion, 1440, and 375 checks.

### Rules that remain TBD

- Unknown wage-line amounts.
- Any payroll-period/cutoff data the employee has not personally entered.
- No winner is invented for overlapping active periods.

---

## 11. Phase 4 — My Records and saved detail

### Goal

Build URL-addressable personal record filtering and an immutable saved calculation detail view.

### Skills and agents

- Skills: `voyix-shift-workflow`, `frontend-patterns`, `design-taste-frontend`, `minimalist-ui`, `accessibility`, `browser-qa`, `supabase`, `security-review`, and `verification-loop`.
- Agent workflow: planner for the filter/query/detail split; reviewers after implementation; security reviewer for record-ID isolation and unavailable/not-found behavior.

### Files likely touched or created

- `web/src/app/(app)/records/page.tsx`
- `web/src/app/(app)/records/[id]/page.tsx`
- `web/src/server/queries/records.ts`
- `web/src/components/records/record-filters.tsx`
- `web/src/components/records/records-table.tsx`
- `web/src/components/records/record-detail.tsx`
- `web/src/lib/record-filters.ts`
- `web/src/lib/record-filters.test.ts`
- `web/e2e/records.spec.ts`

### Search-param contract

Use search params as the only filter state. A likely contract is:

- `range=week`
- `range=period`
- `range=month`
- `range=custom&from=YYYY-MM-DD&to=YYYY-MM-DD`

The exact parameter names may follow an existing route convention if one is added before this phase. Invalid or incomplete custom ranges show an inline error; they do not silently query an unrelated period.

### Tests to write first

- This-week boundaries in `Asia/Manila`.
- Current-payroll-period filter with and without a configured period.
- Current-month boundaries.
- Valid custom range.
- Missing, invalid, or reversed custom dates.
- Empty results and query errors.
- Detail renders saved salary/rate, schedule, duty-hour, ND-window, classification, and wage-line snapshots.
- Detail does not call `calculateNd`.
- Missing and cross-user record IDs have the same unavailable/not-found behavior.
- Saturday saved as Regular Work Day stays regular in list and detail.

### Implementation sequence

1. Add and test the pure filter parser.
2. Add employee-scoped server queries.
3. Build semantic URL filters.
4. Build the responsive ledger table.
5. Build record detail from saved snapshots and wage lines.
6. Render the missing-rule message from the saved state without querying current wage rules.
7. Add isolation and browser flows.

### Done means

- Week, period, month, and custom filters are shareable URLs.
- Record detail never recalculates history.
- Every saved wage line and TBD reason is visible.
- Another employee’s record cannot be distinguished from a missing record.
- Tables retain required columns on mobile using horizontal overflow rather than hiding data.
- Both screens pass the shared UI verification gate.

### Rules that remain TBD

Saved unknown formulas and allocations remain exactly as recorded. A later rule change does not retroactively turn them into confirmed amounts.

---

## 12. Phase 5 — Personal Calendar and Settings

This phase contains two independently reviewable screens. Complete Calendar first, then Settings, while preserving the required overall order.

### Shared skills and agents

- Skills: `voyix-shift-workflow`, `frontend-patterns`, `design-taste-frontend`, `minimalist-ui`, `shadcn`, `accessibility`, `browser-qa`, `supabase`, `supabase-postgres-best-practices`, `security-review`, and `verification-loop`.
- Agent workflow: planner before each screen if its form/query/action contract is still ambiguous; security reviewer for every employee-owned mutation and wage-catalog privilege test; UI and TypeScript reviewers after implementation.

### Phase 5A — Calendar

#### Goal

Let the employee maintain only their own holiday references and payroll periods. These rows help organize a personal record; they are not an authoritative employer calendar.

#### Files likely touched or created

- `web/src/app/(app)/calendar/page.tsx`
- Calendar holiday-list and holiday-form components
- Calendar payroll-period-list and payroll-period-form components
- `web/src/server/queries/calendar.ts`
- `web/src/server/actions/calendar.ts`
- `web/src/server/actions/calendar.test.ts`
- `supabase/tests/database/calendar_rls.test.sql`
- `web/e2e/calendar.spec.ts`

#### Tests to write first

- Signed-out mutations fail safely.
- Owner ID always comes from claims.
- Required names/types and valid dates are enforced.
- Payroll-period start must not be after end.
- User A cannot read, insert, update, or delete User B’s rows.
- Empty, populated, saved, validation, and database-error states.
- Weekend dates are never converted to rest days.

#### Execution sequence

1. Add action validation and ownership tests.
2. Add pgTAP allow/deny tests for personal rows.
3. Implement employee-scoped queries and mutations.
4. Build the two peer panels and their empty/list/form states.
5. Verify that reference dates do not mutate shift classification automatically.
6. Run the per-screen browser and accessibility gate.

#### Done means

- Personal holidays and periods can be added and listed.
- Only the signed-in employee’s owned rows can be mutated.
- No holiday or payroll-period seed is added.
- Shared rows are not fabricated.
- Holiday references do not silently override the per-shift classification.
- The screen passes the shared UI verification gate.

#### Rules that remain TBD

- The authoritative holiday calendar.
- Cross-date holiday treatment.
- Any unprovided payroll cutoff rule.

### Phase 5B — Settings

#### Goal

Connect personal profile and computation settings while displaying the seeded wage catalog as read-only reference data.

#### Files likely touched or created

- `web/src/app/(app)/settings/page.tsx`
- Profile form component
- Computation form component
- Read-only wage-type catalog component
- `web/src/server/queries/settings.ts`
- `web/src/server/actions/settings.ts`
- `web/src/server/actions/settings.test.ts`
- `supabase/tests/database/settings_rls.test.sql`
- `web/e2e/settings.spec.ts`

#### Tests to write first

- Monthly basic salary is optional and accepts a non-negative decimal with at most two fractional digits.
- Displayed rate uses `(monthly × 12) / 261 / 8`.
- Standard schedule requires exactly 8 hours.
- Approved CWW accepts 8–12 inclusive and rejects values outside that range.
- Only the signed-in employee row can be updated.
- Wage types can be selected by authenticated users but cannot be inserted, updated, or deleted.
- Non-2211 rows display their configured percentages and explicit TBD formula state.
- `legacy_hourly_rate` is never read or written by the screen.

#### Execution sequence

1. Add profile/computation action tests and wage-catalog privilege tests.
2. Implement the employee-scoped query and update action.
3. Build profile and computation forms from existing Field and Panel components.
4. Display the factor-261 derivation without adding an hourly-rate input.
5. Render the wage catalog as an authenticated read-only table with TBD formula labels.
6. Run the per-screen browser, security, and accessibility gates.

#### Done means

- The employee can update name, optional salary, schedule type/hours, ND window, and default break within the existing constraints.
- There is no hourly-rate input.
- There is no fixed rest-day setting.
- There is no manager/admin control or wage-catalog editor.
- The screen passes the shared UI verification gate.

#### Rules that remain TBD

- Every non-2211 money formula.
- Every code absent from the existing seed.
- Factor 365 is explanatory context only and never a selectable divisor.

---

## 13. Phase 6 — Integrated browser flows and release gates

### Goal

Prove the complete employee journey, row-isolation boundary, calculation transparency, and accessibility behavior before calling the core product complete.

### Skills and agents

- Skills: `voyix-shift-workflow`, `browser-qa`, `accessibility`, `verification-loop`, `security-review`, and `supabase`.
- Use `nextjs-turbopack` only for a real Next.js build/runtime failure.
- Agent workflow: code and TypeScript reviewers for the complete diff; security reviewer for the two-user isolation flow and database grants; build-error resolver only if a reproducible typecheck/build failure exists.

### Files likely touched

- `web/e2e/auth.spec.ts`
- `web/e2e/add-shift.spec.ts`
- `web/e2e/records.spec.ts`
- `web/e2e/accessibility.spec.ts`
- `web/playwright.config.ts`
- `.github/workflows/ci.yml`
- `web/package.json`
- `web/pnpm-lock.yaml`

### Minimum browser flows

1. Sign up, add the locked 9 PM–6 AM sample, and see 7.00 ND hours, code 2211, ₱140.00, and explicit estimate wording.
2. Create a second user and prove that the second user cannot open the first user’s record URL.
3. Save a Saturday as Regular Work Day and prove it never renders as Rest Day.
4. Run axe on login, overview, add shift, and records; serious and critical violation counts must be zero.

### Additional browser checks

- Login and signup validation errors use text, not color alone.
- Tab order begins with the skip link and remains logical.
- Every visible input has a persistent label.
- Preview updates are announced politely.
- All main actions meet the 44 px target.
- Tables remain usable at 375 px.
- Empty, loading/pending, error, saved, estimate, and TBD states are exercised.
- `prefers-reduced-motion` removes the page entrance and nonessential motion.
- No console errors or failed application requests occur in the tested journeys.

### CI rule

Playwright is added to CI only after the first real flow test exists and has a deterministic database/auth setup. Do not point uncontrolled pull-request tests at production employee data.

### Execution sequence

1. Establish deterministic local or isolated preview test data.
2. Complete the four minimum browser flows.
3. Run axe and manual keyboard/focus checks.
4. Run database isolation tests.
5. Run the full web verification sequence.
6. Run spec, quality, TypeScript, and security reviews.
7. Review the final diff for unintended scope.
8. Report local, hosted, browser, and static verification boundaries separately.

### Done means

- Focused and full Vitest suites pass.
- Supabase pgTAP tests pass.
- Playwright flows pass at desktop and mobile viewports.
- Typecheck, lint, and production build pass.
- `git diff --check` passes.
- Security review finds no cross-user access, secret exposure, `user_metadata` authorization, public privileged function, or anonymous application-table access.
- Verification reporting distinguishes web/static success from local and hosted migration/runtime verification.

### Rules that remain TBD

The four global hard stops remain visible through the complete user journeys.

---

## 14. Phase 7 — Deferred polish

Start this phase only after Phases 1–6 work end to end. Select one independently testable slice at a time.

### Goal

Improve an already working employee shiftbook without weakening calculation transparency, accessibility, ownership, or the deliberately small product boundary.

### Skills, agents, and workflow

- Start with `voyix-shift-workflow` and load only the skills for the chosen slice.
- Use a planner because each polish item is a separate feature, not a miscellaneous bundle.
- Write the slice’s acceptance test first, implement it independently, run the per-screen gate when UI changes, and complete reviewer/security passes in proportion to risk.
- Load `git-workflow` only when the user asks for a commit, PR, or branch operation.

### Files likely touched

Files depend on the selected slice. Keep each slice narrow and list its exact routes, components, queries/actions, tests, and any migration before implementation begins. Do not create a generic polish branch that edits unrelated screens together.

### Tests to write first

- Mobile refinement: a browser reproduction of the specific overflow, focus, or layout defect.
- Expanded filtering: pure search-param tests plus browser coverage for the new filter.
- Payroll summaries: saved-snapshot aggregation tests that exclude TBD money.
- CSV/Excel export: exact headers, locale-independent raw values, integer-centavo handling, escaping, and owner-only rows.
- Backup/export: ownership, completeness, and no-secret tests.
- Edit/delete: authorization, confirmation, recalculation/snapshot policy, and second-user denial tests before mutation code.

### Done means

- The selected slice has a clear employee benefit.
- It is independently tested and reviewable.
- Existing locked calculations and TBD behavior remain unchanged.
- UI changes pass the per-screen gate.
- Data changes pass security and ownership tests.
- No unrelated polish item is bundled into the same completion claim.

### Rules that remain TBD

Polish never resolves a missing payroll rule. All four global hard stops continue to apply.

Allowed candidates from `docs/06-IMPLEMENTATION-PLAN.md` Phase 5:

- Mobile refinement beyond the working responsive layouts.
- Search/filtering beyond the required records search params.
- Payroll-period summaries.
- CSV or Excel export.
- Backup/export.
- Edit and delete for the employee’s own records.

Every polish proposal must answer:

> Does this help an employee calculate, understand, or track their Night Differential?

If not, leave it out.

Polish must not introduce:

- Charts.
- Employer or manager workflows.
- Public pages.
- New payroll formulas.
- A client cache.
- A separate API service.
- A seeded holiday calendar without an authoritative source.

---

## 15. Proposed Phase 8 — Source-backed Calendar and Week entry

**Status:** Proposed and intentionally blocked on explicit user approval.

### Goal

Add a fast weekly path, a source-labelled month/week Calendar, and consistent ADP/ND evidence without changing Voyix into an employer timesheet or resolving any unsupported payroll formula.

### Approval dependencies

Before implementation, the user must decide:

1. Whether the supplied 2026 Cebu calendar becomes a read-only shared reference.
2. Whether Day stays the default and Week becomes a second entry mode.
3. Whether a reviewed week saves atomically.
4. Whether Calendar contains Month, Week, and References views.
5. Whether non-ND sourced codes appear as inactive/reference-only rows.
6. Whether Friday/cut-off guidance appears as source-labelled reminders.

Direction A/B approval for the broader redesign remains a separate gate.

### Phase 8A — Verify and register source data

Create a reviewable manifest from the supplied PDFs before any SQL or seed file:

- Exact holiday rows, type, site, year, source label, and source document.
- Exact pay-day and cut-off markers from the rendered calendar.
- Existing ND code rows cross-checked against `docs/02-WAGE-TYPES.md`.
- Non-ND code/category/hours/percentage rows marked reference-only.
- Source conflicts and ambiguous visual cells explicitly flagged rather than guessed.

Require an independent second comparison of every manifest row against the rendered source. Approving the PDF as a reference does not approve automatic classification or a money formula.

### Phase 8B — ADP code explorer and shared disclosure model

Likely surfaces:

- `web/src/components/settings/wage-catalog.tsx`
- A reusable code-detail/disclosure product component
- Shift calculation preview
- Record detail
- Weekly review and Calendar day detail

Required behavior:

- Search/filter codes by code and category.
- Display source percentage as `TOTAL % to be added`.
- Display `Engine active` or `Reference only`.
- Display `Confirmed estimate formula`, `Formula TBD`, `Hours allocation TBD`, or `Mapping unresolved`.
- Keep 2211 as the only confirmed money formula.
- Explain why a calculation returned each code.

### Phase 8C — Calendar source read model and visual workspace

Proposed route model:

```text
/calendar?view=month&month=2026-10&date=2026-10-14
/calendar?view=week&week=2026-10-12
/calendar?view=references
```

Required layers:

- Verified read-only source events.
- Employee-owned personal holidays and payroll periods.
- Saved shift summaries from immutable records.
- No unsourced employer data and no automatic wage-code selection.

Likely files/components after approval:

- Calendar range query and summary view models.
- Semantic month grid plus chronological list fallback.
- Week record view.
- Source-event legend/provenance component.
- Selected-day drawer adapter and product composition.
- Existing reference forms/lists preserved under References.

Tests first:

- Source rows are readable but never mutable by authenticated users.
- User A's personal events and shifts never appear for User B.
- Month/week boundaries use `Asia/Manila`.
- Selected date survives navigation and is URL-addressable.
- Grid and list expose equivalent event/shift information.
- Source holiday never changes classification or produces a code without employee calculation.
- Drawer contains focus, closes with Escape, restores focus, and reflows at 320/375 px.

### Phase 8D — Week-entry draft and calculate-all review

Recommended product composition:

- `Day | Week` mode switch on Add Shift.
- Week navigation, selected-day controls, and reusable time template.
- Per-day classification, break, schedule, and OT-answer editing.
- `Add another shift` for multiple shifts on one date.
- Per-row calculation through the existing engine.
- Weekly review that preserves every daily result, code, applicable hours, warning, and TBD reason.
- Stacked mobile summaries; no seven-column mobile timesheet.

Tests first:

- Copy/apply affects only selected draft rows.
- Saturday/Sunday never become rest days automatically.
- Source holidays create a prompt without mutating classification.
- A changed row invalidates its preview and aggregate review.
- Day and Week modes produce identical engine output for identical input.
- One invalid row is linked to its field errors without hiding valid rows.
- Multiple shifts on one date remain distinct.
- Draft exit warns before loss; browser navigation behavior is specified and tested.

### Phase 8E — Atomic reviewed-week persistence

Implement only if the atomic recommendation is approved:

- The browser sends raw reviewed shift inputs, not trusted calculated output.
- The server reloads profile/rules and recalculates every shift.
- One authenticated transaction writes every immutable snapshot or none.
- Ownership comes from claims, never request data or `user_metadata`.
- Add a batch idempotency key so a retry cannot silently duplicate a saved week.
- Return a safe per-row error map without leaking database detail.
- Never create approval, manager, team, or ADP-submission records.

Tests first:

- One invalid row saves zero rows.
- RPC failure after validation saves zero rows.
- Successful save writes the complete batch and all wage lines.
- Retrying the same idempotency key does not duplicate records.
- User A cannot read/write User B's batch or results.
- Server output matches Day entry for the same shifts.

### Phase 8F — Cross-surface convergence

- Reuse one ND trace and code-status vocabulary in Day, Week, Calendar, Records, Record detail, and Settings.
- Add source-unavailable, no-source-selected, empty week, partial-TBD, query-error, and retry states.
- Verify 320, 375, 768, 900, and 1440 px plus 200%/400% reflow.
- Run keyboard, screen-reader name/role/value, drawer focus, axe, and reduced-motion checks.
- Run security review for source-row grants, employee isolation, batch persistence, and safe errors.

### Done means

- Day entry remains fast and complete.
- Week entry saves private records without employer/submission language.
- Calendar clearly distinguishes source, personal, draft, and saved layers.
- Every sourced row identifies NCR Voyix Cebu, year 2026, and its source document/version.
- Source dates never silently classify shifts.
- ADP code visibility is consistent and never converts a percentage into an unsupported formula.
- Existing immutable snapshot and two-user isolation contracts remain intact.
- Every focused/full verification gate passes at its stated boundary.

### Rules that remain TBD

- Cross-date holiday treatment.
- Non-2211 money formulas.
- ND regular/overtime allocation and code 2252 behavior.
- Automatic future cut-off derivation.
- Any site/year calendar not supplied and separately approved.

---

## 16. Per-screen UI verification gate

Run this gate after each screen rather than deferring all quality work to Phase 6.

### Content and semantics

- One `h1`.
- Correct page eyebrow and employee-centered copy.
- Amounts are called estimates.
- TBD and unresolved states use words, not color alone.
- No payroll-submission, approval, or employer-verification language.

### Keyboard and assistive technology

- Skip link is first in tab order and moves focus to main content.
- All controls are keyboard reachable.
- Focus indicators remain visible on light and deep-purple surfaces.
- Inputs have visible labels and helpful `aria-describedby` associations.
- Icon-only controls have accessible names.
- Dynamic status uses an appropriate live region.
- Tables have captions and scoped headers.

### Responsive and motion

- Verify at 1440 px and 375 px.
- Verify 200% zoom.
- Verify mobile safe-area behavior.
- Verify long employee-entered names without overflow.
- Verify reduced-motion behavior.
- Motion stays CSS-only: about 180 ms for controls and one 280 ms page entrance.

### States

- Empty.
- Populated.
- Loading or pending.
- Validation error.
- Database/query error.
- Saved.
- Known estimate.
- Missing salary.
- Missing wage rule.
- TBD formula or allocation.

### Automated accessibility

- Run axe.
- Zero serious or critical violations is the minimum acceptance criterion.
- Manually verify focus order, because axe cannot prove it is logical.

---

## 17. Verification commands

Use focused commands during RED/GREEN work, then run the full relevant gates before marking a phase done.

### Web

```powershell
pnpm --dir web test
pnpm --dir web typecheck
pnpm --dir web lint
pnpm --dir web build
git diff --check
```

Once Playwright exists:

```powershell
pnpm --dir web test:e2e
```

### Supabase

Discover or confirm CLI syntax before relying on a command:

```powershell
supabase --agent no --help
supabase --agent no migration list --local
supabase --agent no test db
```

When creating a migration:

```powershell
supabase --agent no migration new <descriptive-name>
```

Do not run `supabase config push`. Do not create another project. Do not reset or push a database merely to satisfy a static planning checklist.

### Verification reporting

Report each boundary separately:

| Boundary | Evidence |
| --- | --- |
| Engine | Focused and full Vitest results |
| Type safety | `pnpm --dir web typecheck` |
| Code quality | `pnpm --dir web lint` and review findings |
| Production compilation | `pnpm --dir web build` |
| Database contract | Migration review plus pgTAP/local application |
| Hosted database | Migration list/application and targeted hosted verification, when authorized |
| Browser behavior | Playwright plus manual 1440/375 checks |
| Accessibility | axe plus keyboard/focus review |
| Patch hygiene | `git diff --check` and final diff review |

Passing web gates does not by itself prove that a migration was applied successfully. Static SQL review does not replace a local or hosted runtime check.

---

## 18. Security review checklist

Run this whenever a phase touches Server Actions, RLS, functions, auth, or employee input.

- `getClaims()` is called before the mutation.
- Owner IDs are derived from authenticated claims.
- No authorization decision reads `user_metadata`.
- Input is validated on the server with a whitelist schema.
- Errors shown to employees do not expose SQL messages, stack traces, keys, or internal identifiers.
- No secret or service key is imported by browser code.
- No secret is written to logs, tests, fixtures, or screenshots.
- RLS is enabled on every exposed application table.
- Policies and indexes use the established employee relationships.
- Policies wrap `auth.uid()` with `select`.
- No `anon` application grants are introduced.
- Wage types remain authenticated-read-only.
- Any database function has explicit execute privileges.
- No `security definer` function exists in `public`.
- A second-user test proves row isolation.
- `.env`, `.env.local`, and populated secrets remain untracked.

---

## 19. Drift corrections carried forward

Use these decisions instead of stale text in older plans:

- Do not rerun the 44 unchecked setup steps; reconcile with existing artifacts first.
- The hosted Supabase project already exists in Tokyo. Do not create a Singapore Supabase project. Singapore remains the Vercel runtime region.
- Do not seed unsourced holidays or payroll periods. Personal rows remain employee-owned. The supplied Cebu/2026 source may become a bounded read-only shared reference only after Phase 8 approval, manifest verification, provenance design, and security tests.
- Use `Overview`, not the older `Dashboard` navigation label.
- Use the lowercase `voyixworkspace` wordmark. The older `voyixshift` component-table reference is stale.
- Use 44 px minimum controls. This overrides older 42 px button wording.
- Email is required for Supabase Auth; there is no employee ID or other workplace identifier.
- The formatter is `formatPhp`, not `format.php`.
- The generic TDD skill’s 80% target is overridden by the repository’s no-percentage-gate policy.
- Do not run `impeccable init`.
- Do not make the Impeccable pipeline a core prerequisite unless the user requests it.
- Remove automatic commit/push behavior from old plan execution. Commit only when asked and never push unless asked.
- Do not add a root `package-lock.json`. Install from `web/` with pnpm.

---

## 20. Stop conditions

Stop implementation and request direction when:

- A missing source would change a money formula, wage code, holiday classification, or hour allocation.
- Two plausible interpretations would produce different ND or centavo results.
- Existing non-null `calculated_amount` data makes the centavo unit ambiguous.
- Hosted credentials or a production mutation are required and not already authorized.
- The linked project no longer matches `dvfxyrcxxktjgutpgcyw`.
- A dirty worktree change overlaps the files being modified and cannot be safely preserved.
- A migration cannot be runtime-tested and the phase depends on claiming database completion.

Do not stop merely because a rule is TBD. Preserve the TBD state and continue with the parts that are specified.

---

## 21. Delivery checklist

### Phase 1 — Engine characterizations

- [ ] Missing exact tests added.
- [ ] Existing cases preserved.
- [ ] Locked result unchanged.
- [ ] No invented rule.
- [ ] Web gates pass.

### Phase 2 — Add Shift and save

- [ ] Centavo schema contract resolved.
- [ ] Atomic authenticated RPC implemented and tested.
- [ ] Preview uses `calculateNd`.
- [ ] Server recalculates before save.
- [ ] Timeline and number strip are honest about missing break time.
- [ ] Locked browser flow passes.
- [ ] Screen verification gate passes.

### Phase 3 — Overview

- [ ] Current personal period shown or clearly unconfigured.
- [ ] Three metrics use saved snapshots.
- [ ] TBD money excluded and disclosed.
- [ ] Recent ledger works.
- [ ] Screen verification gate passes.

### Phase 4 — Records

- [ ] Search-param filters work.
- [ ] Custom ranges validate.
- [ ] Detail reads snapshots without recalculation.
- [ ] Cross-user URL is unavailable.
- [ ] Both screen verification gates pass.

### Phase 5 — Calendar and Settings

- [ ] Only personal calendar/period rows mutate.
- [ ] No date seed added.
- [ ] Settings validate salary and schedule contracts.
- [ ] Wage catalog is read-only.
- [ ] Both screen verification gates pass.

### Phase 6 — Integrated verification

- [ ] Four minimum browser flows pass.
- [ ] Axe has zero serious/critical issues on required pages.
- [ ] Database isolation tests pass.
- [ ] Full web and build gates pass.
- [ ] Verification boundaries are reported precisely.

### Phase 7 — Optional polish

- [ ] Core phases work before polish begins.
- [ ] Each selected slice helps calculate, understand, or track ND.
- [ ] Each slice has its own test and accessibility plan.

### Phase 8 — Source-backed Calendar and Week entry (approved October 15)

- [ ] Six product/source decisions explicitly approved.
- [ ] Exact source manifest independently verified against both PDFs.
- [ ] Shared rows include source/site/year provenance and are read-only.
- [ ] Source dates never silently classify shifts or select wage codes.
- [ ] ADP explorer distinguishes source percentage, engine status, hours status, and formula status.
- [ ] Day and Week produce identical calculation results for identical inputs.
- [ ] Weekly persistence is idempotent and all-or-nothing if that policy is approved.
- [ ] Calendar grid/list parity and selected-day focus/URL behavior pass.
- [ ] Cross-surface accessibility, security, responsive, and build gates pass.

---

## 22. Definition of core-product completion

The next implementation is complete when a new employee can sign up, enter the locked sample, understand the complete hour trace, save the server result, see it in Overview and My Records, reopen an immutable detail snapshot, and manage personal dates/settings without accessing another employee’s data.

The proposed Phase 8 source-backed Calendar and Week entry expansion is not part of this core-completion claim until the user explicitly approves it.

Completion also requires that:

- Code 2211 is visibly an estimate, not payroll confirmation.
- Every unsupported formula or allocation remains visibly TBD.
- No holiday date or wage rule was invented.
- Browser, accessibility, security, web, and database checks pass at their stated boundaries.
- No manager/admin/public/payroll-submission scope was added.
- The implementation remains inside the existing Next.js, Supabase, RLS, and Server Action architecture.

## October 15, 2026 redesign execution contract

The user authorized production implementation of Direction A — Editorial Night Ledger and approved the recommended Calendar/Week package: Day remains default; reviewed Week records save atomically with idempotent retries; Calendar uses Month, Week, and References; the read-only Cebu 2026 source is explicitly selected; non-ND codes remain reference-only; filing reminders are source-labelled guidance.

Ant Design is the interaction primitive layer behind `web/src/components/ui/**`. `AntdRegistry` and the small `VoyixAntProvider` preserve the root Server Component. Product components, native date/time inputs, semantic record tables, Lucide icons, Server Actions/`useActionState`, and CSS tokens remain authoritative. Use explicit `Button` and `ButtonLink`; no polymorphic `asChild` contract, direct route-level Ant imports, Ant Form, Ant icons, default dashboard layout, GSAP, or Framer Motion. Controls are at least 44 px; control motion is 180 ms and the page entrance is 280 ms with reduced-motion support.

Source data is separate from employee-owned facts and the active wage engine. No source date silently sets classification. Only ordinary-day code 2211 has a confirmed money formula; all others stay TBD. See `docs/SOURCE-REFERENCE-VERIFICATION.md` for independent PDF comparison and provenance. Source imports do not create personal payroll periods.

Earlier statements that implementation is paused or that Radix/shadcn must remain the runtime primitive layer are superseded by this execution contract. Historical setup examples are retained for context. Commit/push/deployment remain separate user actions.
