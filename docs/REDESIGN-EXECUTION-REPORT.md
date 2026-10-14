# Redesign execution - October 15, 2026

The approved Direction A redesign and recommended Calendar/Week package are implemented in the working tree. Changes remain uncommitted and undeployed.

## Delivered

- Ant 6.6.6 behind Voyix adapters and the App Router registry; root layout stays a Server Component. Removed unused Radix/shadcn dependencies and configuration.
- Shared complete Terms/Privacy documents, in-context legal reading, required semantics, preserved consent/form values, focus containment/return, and compact auth composition.
- Refined shell, rail tooltips, mobile entry shortcut, and loading states.
- Day Calculate → Review → Save with a current-preview guard, explicit stale state, proportional aggregate traces, and an unknown-position break deduction.
- Week drafts with multiple shifts per date, all classifications and schedule controls, calculation evidence, employee-scoped session recovery, stable retry identity, and trusted server recalculation.
- Atomic Week persistence with an owner-checked private writer, public invoker wrapper, protected retry ledger, changed-payload rejection, and all-or-nothing rollback.
- URL-backed Records ranges/sorting, stable 25-row server pagination, desktop/mobile information parity, and immutable saved evidence.
- Calendar Month/Week/References, source opt-in, personal references, saved-shift overlays, date handoff, and selected-day drawer focus/URL behavior.
- Independently verified Cebu 2026 reference: 21 holidays, 24 cutoffs, 24 pay days, and 14 inactive non-ND code rows, with source hashes. No source date changes classification and no source percentage activates a formula.
- Searchable Settings code explorer reading the authenticated reference catalog, honest formula/engine status, and corrected read-only email semantics.

Only ordinary-day 2211 retains a confirmed money formula. The calculation engine was preserved; other money/allocation rules remain TBD.

## Verification

| Check | Result |
| --- | --- |
| Vitest | 147 tests, 22 files passed |
| Typecheck | Passed |
| ESLint | Passed, no warnings |
| Production build | Passed |
| Diff whitespace | Passed |
| Local pgTAP | 111 assertions across 5 files passed |
| Local schema lint | No schema errors |
| Full Playwright run | 56 tests passed, desktop and mobile |
| Final focused Playwright run | 6 tests passed: password alignment/targets, modal reflow/state, and keyboard calculation/save |

The focused run adds two new keyboard cases; 58 unique current browser cases were covered across the full and focused runs. It was not a single 58-case run.

Browser checks cover 320, 375, 768, 900, and 1440 px, plus 720/360 px as 200%/400% reflow equivalents for a 1440 px window. Populated Overview, Day, Week, Records, Detail, Calendar, and Settings pass reflow and serious/critical axe checks. Legal modal reading, focus cycling, Escape/return focus, draft preservation, Calendar drawer behavior, source handoff, reduced motion, shift saving, Week retry/recovery, and two-user record isolation were exercised.

Reflow-equivalent viewport testing is not a separate browser-zoom certification. Live hosted migration/deployment behavior was not tested.

## Local migrations

- `20261014175555_week_batch_snapshot.sql`
- `20261014175837_source_reference_catalog.sql`
- `20261014182709_harden_week_batch_security.sql`

These were validated locally. No hosted migration push, commit, Git push, or deployment was performed.

## Coordination

Three executor agents ran in parallel within the four-slot session limit. The available executor models were GPT-5.6 Sol at medium and GPT-5.6 Luna at medium. GPT-5.6 Terra was unavailable for subagents. The active chat model could not be switched through the tools.

## Local database incident

The Calendar executor reset local Supabase while reconciling a stale migration ledger. That reset was not coordinated with the primary agent. There was no pre-reset backup or row-count capture, so possible loss of prior local rows cannot be ruled out. Immediately afterward, employee/shift/holiday/period tables were empty; subsequent E2E runs created local test accounts and records. Hosted Supabase was not changed. Further validation used additive migrations and rollback-scoped database tests, without another reset.
