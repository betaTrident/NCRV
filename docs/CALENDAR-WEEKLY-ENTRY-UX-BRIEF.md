# Voyix Workspace — Calendar, Weekly Entry, and ADP Visibility Brief

- **Status:** Recommended package approved for implementation
- **Prepared:** October 15, 2026
- **Implementation authorization:** User approved the recommended package on October 15, 2026; implementation follows the locked payroll and source-verification contracts.
- **Recommended product shape:** Daily quick entry + Week entry composer + source-labelled Calendar

This brief translates the newly supplied 2026 Cebu calendar, new-hire expectations material, and ADP screenshots into a product-safe UX direction for Voyix Workspace. It supplements `docs/UI-REDESIGN-AUDIT.md` and `docs/08-NEXT-IMPLEMENTATION-PLAN.md` without changing the existing calculation contract.

Voyix remains a private employee shiftbook. It does not become an ADP clone, an employer timesheet, a team schedule, a submission channel, or an approval system.

---

## 1. Sources reviewed

### 1.1 2026 NCR Commerce Philippines, Inc. (NCR Voyix) Calendar

Source: [`docs/resources/2026_NCRV_Cebu Calendar.pdf`](./resources/2026_NCRV_Cebu%20Calendar.pdf)

The one-page source contains:

- A January–December 2026 calendar with week numbers.
- A visual legend for payroll cut-off dates, NCPI pay days, and holidays.
- A Cebu-specific holiday list labelled as regular or special non-working.
- Company/site context in the title: NCR Commerce Philippines, Inc. (NCR Voyix), Cebu.

Product interpretation:

- This is evidence for a **source-labelled 2026 Cebu reference calendar**.
- It is not a timeless Philippine holiday rule and must not be generalized to another year or site.
- Any imported row needs provenance, year, site, and source-version metadata.
- A source holiday can offer a classification suggestion, but it must not silently change a shift's employee-confirmed classification.
- Payroll cut-off/pay-day markers are useful for personal reminders and period organization; Voyix still does not submit anything to payroll.

Holiday rows visible in the source are transcribed below for planning review only. They are not an authorized seed manifest until independently checked against the rendered PDF and approved as applicable:

| Date | Source label | Source type |
| --- | --- | --- |
| Jan 1, 2026 | New Year's Day | Regular holiday |
| Feb 17, 2026 | Chinese New Year | Special non-working holiday |
| Feb 24, 2026 | Cebu Charter Day | Special non-working holiday |
| Apr 2, 2026 | Maundy Thursday | Regular holiday |
| Apr 3, 2026 | Good Friday | Regular holiday |
| Apr 4, 2026 | Black Saturday | Special non-working holiday |
| Apr 9, 2026 | Araw ng Kagitingan | Regular holiday |
| May 1, 2026 | Labor Day | Regular holiday |
| Jun 12, 2026 | Independence Day | Regular holiday |
| Aug 6, 2026 | Provincial Charter Day | Special non-working holiday |
| Aug 21, 2026 | Ninoy Aquino Day | Special non-working holiday |
| Aug 31, 2026 | National Heroes Day | Regular holiday |
| Sep 9, 2026 | Osmeña Day | Special non-working holiday |
| Nov 1, 2026 | All Saints Day | Special non-working holiday |
| Nov 2, 2026 | All Souls Day | Special non-working holiday |
| Nov 30, 2026 | Bonifacio Day | Regular holiday |
| Dec 8, 2026 | Immaculate Conception | Special non-working holiday |
| Dec 24, 2026 | Christmas Eve | Special non-working holiday |
| Dec 25, 2026 | Christmas Day | Regular holiday |
| Dec 30, 2026 | Rizal Day | Regular holiday |
| Dec 31, 2026 | Last Day of the Year | Special non-working holiday |

The calendar's graphical pay-day and cut-off markers still require a separate exact-date manifest and independent visual comparison before structured import. This brief intentionally does not guess ambiguous cells.

### 1.2 New Hire — Setting of Expectations

Source: [`docs/resources/New Hire - Setting of Expectations (1).pdf`](./resources/New%20Hire%20-%20Setting%20of%20Expectations%20%281%29.pdf)

The four-page source contains:

1. Filing/cut-off guidance: file Night Differentials every Friday or before the payroll cut-off at midnight; a prose example says cut-off is the next business day after payday and describes half-month pay-date grouping.
2. Night-differential explanation: normal work is eight hours with one unpaid meal break; ND is described for work between 10:00 PM and 6:00 AM; the 9:00 PM–6:00 AM example states eight ND hours.
3. Two ADP code tables: overtime/holiday reference codes and night-shift-differential codes, with `TOTAL % to be added` labels.
4. OT-process guidance: obtain TL/supervisor approval before OT, use a template, and file with the appropriate ADP code.

Product interpretation:

- Filing guidance can become a **source-labelled reminder**, never a promise that a Voyix record was filed.
- The OT process is explanatory only. Voyix records the employee's statement that OT was approved; it does not create supervisors, approval requests, or employer submissions.
- The ADP tables support a richer read-only code explorer and calculation evidence.
- Percentages are reference values labelled `TOTAL % to be added`; they are not automatically monetary formulas.

### 1.3 User-supplied ADP screenshots

The screenshots show three useful interaction references:

- A month schedule with a selected-day details drawer.
- A weekly timesheet grid with wage type rows and one column per weekday.
- A daily/weekly view switch and compact month navigator.

Voyix should borrow the **information relationships**, not the employer-software visual language. It should not copy the dense enterprise chrome, team schedule, approval colors, balances, submission actions, or outdated table treatment.

---

## 2. Source conflicts and locked interpretations

| Source statement | Voyix interpretation |
| --- | --- |
| 9 PM–6 AM example equals 8 ND hours | The clarified Voyix contract wins: 7 ND hours when the one-hour break is excluded from ND; 8 only when it is included. |
| File every Friday or before cut-off | Display as source-labelled guidance/reminder only. Do not claim submission or compliance. |
| Cut-off is the next business day after payday | Do not derive future cut-offs algorithmically until “business day,” holiday handling, and applicability are confirmed. Prefer explicit sourced dates. |
| Half-month submission examples | Use as explanatory context only; do not create payroll-period rows from prose alone. |
| TL/supervisor approval process | Keep out of Voyix workflow. The existing employee-recorded `overtime_approved` answer remains the boundary. |
| ADP `TOTAL % to be added` | Preserve the source label. Only code 2211 has a confirmed money formula. Every other monetary result remains TBD. |
| Calendar holiday marker | Source reference only until employee confirms the per-shift classification. |

These conflicts are not implementation blockers. The interface can show the sourced facts, the employee's chosen classification, and the unresolved/TBD state at the same time.

---

## 3. Recommended information model

The UX must distinguish four layers rather than flattening everything into one calendar:

| Layer | Owner | Meaning | Can affect calculation? |
| --- | --- | --- | --- |
| Source reference | Read-only migration/configuration | Sourced Cebu holiday, pay day, or cut-off marker | Never automatically |
| Personal calendar | Signed-in employee | Employee-entered holiday or payroll-period note | Suggestion only |
| Week draft | Browser until reviewed | Unsaved daily/weekly entry work | No |
| Saved shift snapshot | Signed-in employee | Immutable server-calculated record | Yes; this is the authoritative saved result |

Visual labels must make those layers obvious:

- `SOURCE · NCR VOYIX CEBU 2026`
- `PERSONAL NOTE`
- `DRAFT · NOT SAVED`
- `SAVED PRIVATELY`

No color is used without the corresponding text label.

---

## 4. Recommended entry model

Use one Add Shift destination with two entry modes:

```text
Add shift
┌──────────────────────────────┐
│ [ Day ] [ Week ]             │
└──────────────────────────────┘
```

### 4.1 Day entry — keep as the default

Best for:

- A single completed shift.
- Irregular or rotating schedules.
- A shift needing careful holiday/rest-day classification.
- Mobile entry immediately after work.

Required improvements:

- Calculate → Review → Save, with Save beside the reviewed result.
- Source-calendar hint after choosing a date, never an automatic classification change.
- Complete ND trace: elapsed, break, worked, regular, extra, ND overlap, final ND, code match, and amount status.
- `Why this code?` disclosure for every returned ADP code.

### 4.2 Week entry — recommended new capability

Best for:

- Repeated schedules across several days.
- Friday catch-up entry suggested by the source guidance.
- Reviewing a week before saving private records.

Week entry is a **batch shift composer**, not an employer timesheet. Use copy such as `Save to my shiftbook`, never `Submit timesheet`, `Approve`, or `Send to payroll`.

Desktop composition:

```text
WEEK OF OCT 12–18                         [Previous] [This week] [Next]

Template:  9:00 PM → 6:00 AM · 1 h break · Standard
           [Apply to selected days] [Clear draft]

     Include  Date       Start   End     Classification        Result
Mon    ✓      Oct 12     9 PM    6 AM    Regular work day      Ready
Tue    ✓      Oct 13     9 PM    6 AM    Regular work day      Ready
Wed    ✓      Oct 14     9 PM    6 AM    Regular work day      7.00 h · 2211
Thu    ✓      Oct 15     9 PM    6 AM    Regular work day      Needs review
Fri    ✓      Oct 16     9 PM    6 AM    Regular work day      Ready
Sat    —      Oct 17     —       —       —                     Not included
Sun    —      Oct 18     —       —       —                     Not included

[Calculate selected days]

REVIEW THIS WEEK
5 shifts · 35.00 final ND hours · 5 code lines
Known estimate ₱… · 0 formula TBD · 0 classification warnings

[Save 5 reviewed entries]     [Return to edit]
```

Mobile composition:

```text
Week of Oct 12–18
[Previous] [This week] [Next]

MON · OCT 12                    Included
9:00 PM–6:00 AM
Regular work day
7.00 h · 2211 · Estimate
[Edit day]

TUE · OCT 13                    Needs review
...

[Calculate selected days]
[Save reviewed entries]
```

Mobile uses stacked day summaries and an edit sheet; it does not squeeze seven date columns into a horizontal timesheet.

### 4.3 Week-entry interaction rules

- Start with the employee's configured schedule/break as defaults, but never preselect holiday or rest-day classification from weekday alone.
- Let the employee choose days, copy one day's times to selected days, or apply a template.
- Allow more than one shift on a date through `Add another shift`; do not introduce a one-shift-per-day database rule.
- A sourced holiday creates a visible review prompt on that date.
- Calculate every included row through the existing calculation engine.
- Each row shows `Ready`, `Needs review`, `TBD`, or `Error` in words.
- A changed row invalidates only that row's preview and the aggregate weekly review.
- The final review lists every day, code, final ND value, estimate/TBD state, and warning before save.
- Recommended persistence is one server transaction for the reviewed batch: either every selected snapshot is saved or none are. This avoids a misleading half-saved week. This decision needs explicit approval before schema/RPC work.
- A retry must be idempotent. The future design needs a batch idempotency key and duplicate-warning behavior before implementation.

---

## 5. Calendar experience

The current two-panel holiday/period page should evolve into a personal calendar workspace while retaining the existing forms as secondary management tools.

### 5.1 View controls

```text
Calendar                         [Month] [Week] [References]
October 2026                     [‹] [Today] [›]
```

- **Month:** overview of source dates, personal dates, saved shifts, and ND/code status.
- **Week:** seven-day record view with quick entry and review access.
- **References:** current holiday/payroll-period lists and add forms.

The switch can use the Voyix Ant Segmented adapter. The calendar grid remains a bespoke semantic product component rather than Ant's generic Calendar widget.

### 5.2 Month view

Desktop possibility:

```text
MON 12              TUE 13              WED 14 · PAY DAY
7.00 h · 2211       7.00 h · 2211       7.00 h · 2211
Saved privately     Saved privately     Saved privately

THU 15              FRI 16              SAT 17
No shift            7.00 h · 2211       Add shift
                                         Source: special holiday
```

Each date cell may contain:

- Date number and weekday.
- Source event marker: regular holiday, special non-working holiday, pay day, or cut-off.
- Personal note marker.
- Saved-shift summary: shift count, final ND hours, and concise code chips.
- A visible `Add shift` action when empty or `View day` when populated.

Do not display a precomputed ADP code solely because a date is a holiday. Codes belong to a calculated shift, not to a calendar day by itself.

### 5.3 Selected-day drawer

Borrow the relationship shown in the ADP schedule screenshot, but redesign it as a clean Voyix day drawer:

```text
WEDNESDAY, OCTOBER 14                              [Close]
NCPI pay day
Source · NCR Voyix Cebu 2026

SAVED SHIFTS
9:00 PM–6:00 AM
Final ND 7.00 h     Code 2211     Estimate ₱…
[Open calculation record]

PERSONAL REFERENCES
No personal note for this date.

[Add another shift]    [Add personal note]
```

- Desktop: right-side drawer with a stable heading and internal scroll.
- Mobile: full-width sheet or full-screen dialog.
- Focus moves to the heading on open, remains contained, Escape closes it, and focus returns to the date trigger.
- Use a URL date parameter such as `?view=month&date=2026-10-14` so the state is shareable and browser navigation works.

### 5.4 Calendar accessibility

- Provide both grid and chronological-list representations; the list is the primary narrow-screen experience.
- Grid dates are real buttons with complete accessible names such as `October 14, pay day, one saved shift, 7 final ND hours, code 2211`.
- Arrow-key grid navigation is optional only if implemented completely; Tab must never traverse 42 silent date cells unnecessarily.
- Source, personal, draft, and saved states use words and icons, not color alone.
- Long holiday names and multiple events remain readable at 200% and 400% zoom.

---

## 6. ADP code visibility

The user should be able to see ADP codes in four contexts, each answering a different question.

### 6.1 During calculation — “What matched?”

Each wage line shows:

- Code in large mono type.
- Category and first-eight/excess reference.
- Source percentage labelled `Total % to be added`.
- Applicable ND hours when known.
- `Confirmed estimate formula` only for 2211.
- `Formula TBD`, `Hours allocation TBD`, or `Mapping unresolved` for all unsupported cases.
- `Why this code?` opens the matching inputs and source explanation.

### 6.2 Weekly review — “What will be saved?”

Show each day's codes and a weekly code summary:

```text
2211 · 5 lines · 35.00 known applicable hours
2413 · 1 line · formula TBD
1 mapping needs review
```

Do not add percentages together into a made-up weekly payroll rate.

### 6.3 Calendar/day drawer — “What happened on this date?”

Show codes only for saved/calculated shifts. A holiday marker may explain context but never generates a code by itself.

### 6.4 Settings code explorer — “What do these codes mean?”

Evolve the read-only wage catalog into a searchable reference with two groups:

1. **Night differential codes used by the engine** — the current seeded ND table.
2. **Other codes in the supplied ADP reference** — display-only, inactive for calculation until separately approved.

Every row includes source, category, hours category, `TOTAL % to be added`, engine status, and formula status.

The current engine-active ND transcription remains in [`docs/02-WAGE-TYPES.md`](./02-WAGE-TYPES.md). The supplied table contains an important special-public-holiday ambiguity: code 2411 is listed for `Rest Day OR Special Public Holiday` at 143%, while code 2418 is also listed for `Special Public Holiday` at 43%. Voyix currently preserves both matching rows rather than inventing a winner. The redesigned code explorer and calculation evidence must label that condition as source/mapping ambiguity, not imply that both money outcomes are confirmed.

The supplied source confirms these non-ND reference rows for documentation/display planning:

| Code | Source category | Hours category | Total % to be added | Proposed app status |
| --- | --- | --- | ---: | --- |
| 2251 | Ordinary Day | Excess of first 8 | 125% | Reference only; formula TBD |
| 2301 | Rest Day | First 8 | 130% | Reference only; formula TBD |
| 2215 | Special Public Holiday + Rest Day | First 8 | 150% | Reference only; formula TBD |
| 2235 | Special Public Holiday + Rest Day | Excess of first 8 | 195% | Reference only; formula TBD |
| 2170 | Regular/Public Holiday | First 8 | 100% | Reference only; formula TBD |
| 2226 | Regular/Public Holiday | Excess of first 8 | 260% | Reference only; formula TBD |
| 2240 | Regular/Public Holiday + Rest Day | First 8 | 260% | Reference only; formula TBD |
| 2246 | Regular/Public Holiday + Rest Day | Excess of first 8 | 338% | Reference only; formula TBD |
| 2425 | Double Regular Holiday | First 8 | 200% | Reference only; formula TBD |
| 2535 | Double Regular Holiday | Excess of first 8 | 390% | Reference only; formula TBD |
| 2420 | Double Regular Holiday + Rest Day | First 8 | 390% | Reference only; formula TBD |
| 2520 | Double Regular Holiday + Rest Day | Excess of first 8 | 507% | Reference only; formula TBD |
| 2430 | Special Public Holiday | First 8 | 30% | Reference only; formula TBD |
| 2233 | Special Public Holiday | Excess of first 8 | 169% | Reference only; formula TBD |

This transcription does not activate these codes in the engine and does not establish a money formula.

---

## 7. Night-differential visualization

Use one consistent evidence model in Day entry, Week review, saved Record detail, and Calendar day detail.

```text
SHIFT WINDOW       9:00 PM ━━━━━━━━━━━━━━━━━━━ 6:00 AM
ND WINDOW         10:00 PM ━━━━━━━━━━━━━━━━ 6:00 AM
BREAK             1.00 h unpaid · exact clock position not recorded

Elapsed           9.00 h
Worked            8.00 h
Potential ND      8.00 h
Break from ND    -1.00 h
Final ND           7.00 h

MATCH
2211 · Ordinary day · First 8 · Total % to be added 10%
Known estimate formula · Estimate only
```

Rules:

- The timeline can visualize known intervals only.
- If the break's exact clock position is unknown, show it as a labelled deduction instead of drawing it at an invented time.
- Final ND is emphasized once; supporting values stay quieter but readable.
- Formula and mapping states remain visible beside the code.
- The weekly aggregate links back to each daily trace rather than hiding the calculation inside one total.

---

## 8. Source-calendar adoption options

### Option A — Read-only shared 2026 Cebu reference (recommended)

- Import exact, reviewed source rows through a migration.
- `owner_id` remains null for shared rows; authenticated users can read but never mutate them.
- Add provenance fields or a source registry for document, site, year, version, and label.
- Overlay personal rows without copying the source into every account.
- Require employee confirmation before using a source date as shift classification.

Why this is recommended: it makes the supplied calendar useful while preserving a clear boundary between sourced reference and employee-owned facts.

### Option B — Employee opt-in copy

- Offer `Add source dates to my calendar` and create employee-owned copies.
- Simpler rendering, but creates duplicates, drift, and unclear provenance.
- Not recommended unless users need to customize every source row independently.

### Option C — PDF link only

- Show the PDF as a downloadable reference without structured events.
- Lowest implementation risk, but does not support reminders, date context, calendar filtering, or accessible event summaries.

### Required import gate

Before Option A is implemented:

1. Transcribe exact holiday, pay-day, and cut-off rows from the calendar.
2. Perform an independent second-person or second-agent comparison against the rendered PDF.
3. Resolve any visual ambiguity rather than guessing.
4. Store provenance and limit applicability to Cebu/2026.
5. Add contract tests for every imported row and duplicate source key.
6. Keep cross-date holiday treatment and classification automation disabled/TBD.

---

## 9. Planned data and server impact — not authorized yet

Likely additions after approval:

- Source metadata for shared holiday and payroll-period rows, or a normalized read-only `calendar_sources`/`calendar_events` reference model.
- A site/year applicability setting or explicit calendar-source subscription for the employee.
- Query support for a month/week range combining source events, personal events, and saved shift summaries.
- A reviewed batch-save RPC for Week entry, with claims-derived ownership, one transaction, immutable snapshots, and idempotency.
- No public API, background payroll sync, ADP integration, manager account, or approval table.

The schema design must preserve:

- `(select auth.uid())` RLS ownership.
- No anonymous app-table grants.
- No `security definer` function in `public`.
- Shared source rows are read-only to authenticated clients.
- Personal rows remain isolated to their owner.
- Saved calculations remain immutable snapshots.

---

## 10. Implementation slices after explicit approval

### Slice 0 — Source verification and contract update

- Approve the 2026 Cebu PDF as a bounded shared reference.
- Approve Week entry semantics and atomic-save policy.
- Update business, data, UI, design, and setup contracts consistently.
- Produce a verified source-row manifest before any migration.

### Slice 1 — ADP code explorer and calculation disclosure

- Improve the existing read-only catalog.
- Add source/formula/engine-status fields to the presentation model.
- Add `Why this code?` to calculation and record detail.
- No formula changes.

### Slice 2 — Calendar read model and source overlay

- Add verified shared reference rows and provenance.
- Build month/week queries and accessible list fallback.
- Keep personal forms and employee confirmation.

### Slice 3 — Calendar month/week interface

- Add Month/Week/References controls.
- Add the day drawer and URL-addressable selected date.
- Show source, personal, and saved layers distinctly.

### Slice 4 — Week-entry draft and calculation

- Build client draft state, template/copy behavior, per-row validation, and calculate-all review.
- No persistence until batch-save behavior and duplicate handling pass contract tests.

### Slice 5 — Atomic batch save

- Add idempotent server action/RPC and snapshot tests.
- Save all reviewed rows or none.
- Add two-user isolation and failure-retry tests.

### Slice 6 — Cross-surface convergence

- Reuse the same code disclosure and ND trace in Day, Week, Calendar, Records, and Detail.
- Complete keyboard, 320/375/768/900/1440, 200%/400%, axe, reduced-motion, query-error, and source-unavailable checks.

---

## 11. Decisions for the user to review

1. **Calendar source:** approve Option A, the read-only `NCR Voyix Cebu 2026` shared reference?
2. **Entry modes:** keep Day as default and add Week as a second mode?
3. **Batch behavior:** save a reviewed week atomically, so a failure saves none?
4. **Calendar navigation:** use Month, Week, and References within the existing Calendar route?
5. **ADP visibility:** show non-ND sourced codes as read-only reference while keeping them inactive for calculations?
6. **Source reminders:** show Friday/cut-off reminders as source-labelled guidance without claiming filing or submission?

No implementation should begin until these decisions and the main visual direction are approved.

## Execution authorization - October 15, 2026

The user authorized the redesign and approved the recommended Calendar/Week/source package. Direction A is the implementation default. Source transcriptions require independent visual verification; unresolved payroll formulas remain TBD.
