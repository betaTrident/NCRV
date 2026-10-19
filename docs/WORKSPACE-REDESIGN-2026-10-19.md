# Workspace redesign - October 19, 2026

## Result

Overview, My Records, Calendar, Settings, and shared navigation now use a bright neutral workspace with a white rail, restrained purple actions, readable typography, clear page landmarks, and labelled mobile navigation. The attached brief authorizes this presentation change over historical design guidance. Existing uncommitted Overview work was retained and extended. No commit, push, deployment, database reset, schema change, or production fixture was performed.

## Changes and functional fixes

- Overview: preserves calendar-month activity when no unambiguous personal period exists; shows saved ND hours, entries, known estimates and unresolved lines. All-TBD results display TBD instead of a misleading known zero. Saved zero-hour dates and unrecorded dates differ in the chart; daily values are expandable. Recent records prioritize shift and estimate information.
- Records: selected dates, exact filtered shift count, reset, existing range and ordering controls, distinct new-history and empty-range states, compact desktop and mobile records. Technical wage details remain in record snapshots. Detail links preserve a validated originating list or calendar URL, including error-state return links.
- Calendar: Today and date navigation, today/selection/record markers, text legend, mobile agenda, explicit optional source selection available in every view, personal-period creation and editing, and visible period dates/cutoffs. Source references stay separate from employee facts and never classify shifts.
- Settings: profile, calculation preferences, account/privacy and expandable reference information. Controlled fields retain edits after validation errors; unsaved changes are labelled; pending forms prevent further edits; success appears beside the section. Snapshot explanations reflect the actual behavior. Sign-out is separate from ordinary settings.
- Saving a day or week now invalidates Calendar as well as Records and Overview. Retry controls refresh server data.
- Period edits validate UUID and date/time input, derive owner identity from request claims, and apply explicit owner/id predicates under existing RLS.

## Verification

- 168 unit tests passed, including no-period/overlap fallback, failed queries, all-TBD totals, empty history versus empty filtered ranges, safe return URLs, and period-update ownership.
- TypeScript, ESLint, and git diff whitespace checks passed.
- Production Next.js build passed as part of the Playwright runner.
- Calendar, Records, and redesign suite: 20 browser tests passed across 1440 x 900 desktop and 375 x 812 mobile projects.
- After final visual adjustments, the four redesign journeys passed again on both projects. These include adding a shift, month fallback, unavailable period filter, empty custom results, period create/edit persistence, record return context, navigation, settings validation and persistence, all-TBD results, and unchanged saved estimates after settings changes.
- Axe scans on all four redesigned pages found no serious or critical violations. Calendar keyboard-close/focus restoration and cross-employee record isolation also passed in the 20-test suite.
- Desktop and mobile screenshots were reviewed. Latest screenshots are in web/test-results/workspace-redesign-employe-fc0e5-settings-and-return-context-{desktop,mobile}/. Test artifacts are generated and may be overwritten by later runs.

## Validation limits

Request failures were exercised through query/action unit tests; a live database outage was not injected into browser runs. Loading surfaces were inspected, but delayed network loading was not systematically asserted. No manual screen-reader audit or performance benchmark was performed. Automated accessibility checks do not establish complete WCAG conformance.

Only isolated local test accounts and their own records were created. Hosted data and production accounts were not modified. The existing local Supabase stack was used without reset.
