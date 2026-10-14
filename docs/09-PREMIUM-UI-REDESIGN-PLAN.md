# Voyix Workspace Premium UI Redesign Audit and Execution Plan

**Status:** Proposed design and implementation plan; no runtime UI changes are authorized by this document alone.  
**Prepared:** October 15, 2026  
**Product mode:** Private employee shiftbook, not employer payroll  
**Recommended direction:** **Night Ledger 2.0 — a calm, precise, personal record of night work**

---

## 1. Why this plan exists

The current application is substantially more complete than the first Voyix prototype. It has authentication, Day and Week entry, a calculation preview, records, record detail, calendar views, settings, legal modals, an Ant Design adapter layer, and source-backed reference data. Functionality is no longer the central design problem.

The problem is that the visual redesign stopped at the component and styling layer. The product still reads as a collection of generic SaaS panels:

- rounded white containers with the same border and shadow;
- repeated uppercase mono eyebrows;
- small muted supporting text;
- equal-weight cards and form stacks;
- weak hierarchy between primary evidence and supporting metadata;
- product-specific artifacts that look less important than the containers around them.

The result is competent but not distinctive, efficient, or premium. This plan replaces that composition without changing the product's truth model. Voyix must remain an honest private record: it must never imply employer approval, invent wage formulas, or turn unresolved rules into confident totals.

This document supersedes the visual execution approach in the October 15 redesign appendices where the current implementation has demonstrated that the earlier direction was not expressive enough. Product, calculation, security, and data contracts remain authoritative.

---

## 2. Audit scope and evidence

### 2.1 Surfaces audited

- Login, forgot password, and reset password
- Signup and legal consent
- Standalone Terms and Privacy documents
- Authenticated application shell and navigation
- Overview
- Add Shift — Day
- Add Shift — Week
- My Records
- Record detail
- Calendar — Month, Week, and References
- Settings — profile, calculation basis, and code reference
- Loading, empty, success, warning, error, partial-estimate, and TBD states
- Desktop and mobile layouts, including the current 1440 px and 375 px Signup captures

### 2.2 Evidence reviewed

- The current Next.js implementation and route/component structure
- `PRODUCT.md`, `DESIGN.md`, `AGENTS.md`, `.superdesign/design-system.md`, and the product UX documents
- `docs/UI-REDESIGN-AUDIT.md`
- `docs/CALENDAR-WEEKLY-ENTRY-UX-BRIEF.md`
- `docs/08-NEXT-IMPLEMENTATION-PLAN.md`
- Current browser screenshots and authenticated route inspection
- Current Ant Design adapters and package version (`antd` 6.6.6)
- Official Ant Design component, theming, and Next.js guidance
- Official Magic UI component catalog
- WAI-ARIA calendar and modal-dialog patterns
- GOV.UK error-summary, check-answers, summary-list, and confirmation patterns

The authenticated inspection used the supplied test account without changing saved shifts or settings. Browser Use could reach the public deployment but not the local loopback address, so the audit combined its production session with a separate read-only local-browser pass against the current working tree.

### 2.3 Design tools and plugin roles

| Capability | Role in this redesign | Decision |
| --- | --- | --- |
| Superdesign | Baseline reproduction, alternative direction canvases, responsive flow screens | Use in Phase 0 before implementation; preserve the existing Voyix project and branch from a faithful baseline |
| UIUX Designer | Information architecture, page flows, form ergonomics, accessibility, handoff | Use as the route-level UX framework |
| Engineering Suite — Design System | Token and component contract | Use after visual direction approval; do not run an initializer that overwrites `DESIGN.md` |
| Impeccable | Structured critique and post-build refinement | Use critique principles now; run the formal detector only after implementation exists |
| Engineering Suite — Redesign | Existing-product redesign discipline | Use to preserve product contracts while changing visual composition |
| Engineering Suite — Polish | Final consistency, responsive, content, and interaction pass | Reserve for the final implementation phase |
| Engineering Suite — Taste | Anti-generic visual guardrails | Use as a visual-quality filter, not as the dashboard/data-table authority |
| Engineering Suite — UX Critique | Severity-ranked usability findings | Use for the audit and acceptance gates |
| Open Design | Canvas exploration if its callable tools become available | The plugin exposes no usable design-canvas tool in the current environment; do not install a substitute silently |
| Engineering Suite — Motion Design | Motion concept and reduced-motion contract | Use selectively; reject its marketing-scroll defaults for an operational app |
| Browser Use | Authenticated visual inspection and route QA | Use before and after each implementation slice |

### 2.4 Design read and working dials

- **Mode:** operate
- **Product character:** trustworthy, personal, exact, quiet, night-aware
- **Visual language:** editorial ledger + precision timekeeping
- **Design variance:** 6/10 — distinctive composition without visual spectacle
- **Motion intensity:** 4/10 — visible continuity and feedback, no entertainment layer
- **Information density:** 6/10 — efficient for repeat users, with progressive disclosure for complex evidence

### 2.5 Runtime and deployment parity findings

The visual audit uncovered a release problem that must be separated from design quality:

- The public deployment is materially behind the working tree. Password-recovery and legal routes return 404, Add Shift and Settings are placeholders, and the current Calendar capabilities are absent.
- In the local development session, several client interactions changed focus or selection chrome without changing content: Add Shift Day/Week, Calendar Month/Week/References, and Signup Terms/Privacy modal triggers.
- The local console showed repeated Next development HMR WebSocket handshake failures. This may be a stale development session or hydration/runtime issue rather than a component defect, but it is a release blocker until reproduced on a clean server.
- The authenticated production account was empty, so production record-detail behavior could not be visually verified with that account.

Before visual implementation, restart the local app cleanly, rerun these interactions, and classify each failure as stale dev state, hydration/client-boundary defect, or deployment drift. Do not redesign around a broken development session.

---

## 3. Executive audit verdict

### 3.1 What is working

- The purple identity, warm paper canvas, Manrope, and IBM Plex Mono form a credible brand foundation.
- The product correctly emphasizes privacy and does not claim to be employer payroll.
- Legal content is now available in modals during signup, preserving form context.
- Ant Design is mostly isolated behind product adapters instead of imported across every route.
- Day and Week entry, source references, record pagination, and detail surfaces exist.
- The data model can preserve known estimates, partial results, and explicit TBD outcomes.
- The application already has useful browser and accessibility test foundations.

### 3.2 Why it still feels generic

The primary failure is composition rather than color.

1. **Everything is a panel.** Forms, metrics, notices, calculation evidence, empty states, and settings sections use nearly the same white box treatment.
2. **The product has no dominant artifact.** A shiftbook should make time and calculation evidence memorable. Today the “timeline” is a set of normalized bars, not a clock-based explanation.
3. **The overview is a generic dashboard.** Three equal metric cards communicate hierarchy poorly and resemble a template.
4. **The weekly workflow is a form dump.** All daily controls and evidence are exposed together, creating decision overload.
5. **Typography is repetitive.** Uppercase mono labels are used so broadly that they no longer provide contrast or orientation.
6. **The shell spends space without adding context.** The desktop top bar is mostly empty; mobile loses the wordmark entirely.
7. **Mobile behavior is responsive but not always usable.** The calendar becomes a long sequence of up to 42 focusable cards, and the signup consent row visibly collides at narrow widths.
8. **Interaction behavior is not fully unified.** Raw buttons and links remain beside Ant-backed adapters, which causes subtle focus, hover, height, and disabled-state drift.

### 3.3 Priority summary

| Priority | Finding | User impact | Required response |
| --- | --- | --- | --- |
| P0 | Public deployment is behind the working tree | Users do not receive the audited product and encounter missing/placeholder routes | Establish deployment parity and a route/version smoke test before release |
| P0 | Key local client interactions failed in the inspected session | Week entry, Calendar views, and legal dialogs may be inaccessible | Reproduce after a clean restart and fix hydration/client behavior before visual refactoring |
| P0 | Weekly entry exposes too many controls and unclear review state | Slow, error-prone entry of the core workflow | Rebuild as a ledger with focused row editing and a distinct review step |
| P0 | The night-differential visual is not time-accurate | Users cannot understand where eligible hours came from | Build one shared clock-aligned time ruler and arithmetic receipt |
| P0 | Mobile Signup consent layout collides and target sizing is weak | Legal consent is difficult to read and operate | Recompose as a full-width 44 px consent row with clean legal actions |
| P1 | Overview uses equal KPI cards | Weak hierarchy; generic first impression | Replace with one asymmetric Period Statement |
| P1 | Calendar mobile month creates a very long focus/scroll sequence | Poor navigation and date comprehension | Keep a compact grid and pair it with a selected-day agenda |
| P1 | Records and record detail are card-heavy | Calculation evidence feels fragmented | Use statement and continuous calculation-sheet compositions |
| P1 | Shell loses identity and wastes desktop space | Weak orientation and brand continuity | Build a contextual top bar and compact mobile masthead |
| P1 | Settings and Calendar produce extreme mobile page lengths | A 5,521 px catalog and 3,283 px month view are technically responsive but operationally poor | Add progressive disclosure to Settings and retain a compact Calendar grid |
| P1 | Raw calculation precision leaks into the UI | Values such as long fractional peso/rate strings reduce readability and perceived quality | Define rounded display formatting while preserving full precision and formula provenance |
| P1 | Ant adapter contract is incomplete | State and accessibility drift | Finish the interaction adapter layer before route polish |
| P2 | Token system lacks typography, rhythm, surface, density, and elevation roles | Repeated arbitrary values and inconsistent hierarchy | Add semantic roles and make routes compose components, not styling strings |
| P2 | Loading, empty, notice, and error states vary by route | Inconsistent trust and recovery | Introduce shared state primitives and route-shaped skeletons |

---

## 4. Anti-slop contract

The redesign must not use visual novelty as a substitute for hierarchy.

### 4.1 Prohibited defaults

- no blue-purple gradients, aurora backgrounds, or glowing blobs;
- no glassmorphism panels;
- no equal three-card KPI grid on Overview;
- no repeated feature-card layout or oversized marketing hero inside the authenticated product;
- no animated number tickers for estimates or money;
- no shimmer buttons, border beams, marquees, particle fields, or looping ambient effects;
- no fade-up animation on every element;
- no decorative chart invented only to fill space;
- no icon tile above every empty state;
- no uncontrolled Ant preset colors;
- no mixed Ant, shadcn, and Magic UI primitives for the same interaction;
- no status language such as “approved,” “verified,” or “submitted” unless the data actually carries that meaning;
- no invented ADP codes, holiday dates, or money formulas.

### 4.2 Premium means

- strong information hierarchy;
- fewer, better surfaces;
- exact alignment of times and numeric values;
- readable evidence and clear calculation provenance;
- meaningful negative space;
- careful typography and optical spacing;
- fast, predictable controls;
- calm state transitions;
- excellent keyboard, screen-reader, zoom, and mobile behavior;
- visual consistency across empty, loading, error, partial, and populated states.

---

## 5. North-star direction — Night Ledger 2.0

### 5.1 Design premise

Voyix should look like a beautifully typeset personal work ledger built around night time, not an HR dashboard and not a futuristic fintech app.

The signature visual is a **Night Time Ruler**: one shared clock axis showing the recorded shift, configured night window, eligible overlap, break deduction, and final ND hours. The signature layout is a **Period Statement**: the current period summarized as a document rather than a set of KPI cards.

### 5.2 Visual mood

- warm, paper-like light canvas;
- deep plum navigation and emphasis surfaces;
- one controlled lavender layer for selected or active state;
- ink-heavy typography with purple used deliberately;
- fine rules, ledger columns, and tabular numbers;
- asymmetric layouts that give one primary result clear dominance;
- minimal depth: shadows only for floating layers, not every container;
- optional nearly invisible paper/noise texture on one deep-purple surface only.

### 5.3 Brand assets retained

- `#5F249F` brand purple
- `#341A4B` deep structural purple
- `#C3A3E0` workspace wordmark accent on deep purple
- Manrope for interface and editorial text
- IBM Plex Mono for codes, times, dates, formula labels, and tabular evidence
- lowercase `voyixworkspace` wordmark
- light-mode-only product for v1

### 5.4 Proposed surface hierarchy

| Role | Purpose | Visual behavior |
| --- | --- | --- |
| `plain` | Default content region | Open canvas, rules and spacing create structure; no card chrome |
| `sheet` | Primary editable or review artifact | Warm white, strong edge/rule, limited radius, no generic shadow |
| `inset` | Supporting explanation or secondary controls | Quiet lavender/neutral tint, compact padding |
| `emphasis` | Period total, final ND, or decisive state | Deep plum or high-contrast ink; used once per screen |
| `floating` | Modal, drawer, command layer | Elevated shadow and clear separation; never used for static page sections |

### 5.5 Type roles

| Token | Use |
| --- | --- |
| `display` | Auth identity and rare zero-state narrative only |
| `page-title` | Route title and primary document heading |
| `section-title` | Major sections, no all-caps |
| `body` | Primary reading and form content |
| `supporting` | Helper text; never below accessible contrast |
| `label` | Form labels and compact controls |
| `data-lg` | Total ND and known estimate |
| `data` | Dates, times, codes, and table values |
| `eyebrow` | Reserved for one page-context marker, not every card |

---

## 6. Information architecture and shell

### 6.1 Desktop shell

- Reduce the rail's visual weight while retaining the deep-purple identity.
- Keep navigation names visible at ordinary desktop widths; collapse only when space is genuinely constrained.
- Make the top bar useful: left side carries current route/period context; right side carries the privacy state and one Add Shift action.
- Keep the central content width responsive to the task. Records and Week entry need a wider work surface than Settings or auth forms.
- Avoid putting every route in an identical centered column.

### 6.2 Mobile shell

- Put a compact `voyixworkspace` mark in the top bar; do not leave only “Saved privately.”
- Keep the bottom navigation to the smallest useful set and provide a clear Add Shift action without overlapping content.
- Respect safe areas and virtual keyboards.
- Ensure every fixed element has a non-fixed fallback at 200% and 400% zoom.

### 6.3 Navigation principles

- Current route must be indicated by shape, contrast, and text—not color alone.
- Collapsed desktop navigation may use Ant Tooltip on hover and focus, but the link itself still needs an accessible name.
- Route changes use one content-level entrance, not per-card staggered animations.
- Browser Back must remain useful for Calendar and Records state changes; use replace only for non-navigational normalization.

---

## 7. Component architecture

```text
Foundations
├─ authoritative CSS variables
├─ typography and data roles
├─ spacing and density roles
├─ surface/elevation roles
├─ motion and reduced-motion tokens
└─ VoyixAntProvider consuming the same semantic values

Interaction adapters
├─ Button / ButtonLink / IconButton
├─ TextInput / PasswordInput / native Date and Time inputs
├─ Select / RadioGroup / CheckboxRow
├─ SegmentedControl
├─ Drawer / Modal / Tooltip
├─ Disclosure
└─ Table primitives

Editorial primitives
├─ PageFrame / PageHeader / SectionHeader
├─ Surface
├─ Notice / StatusBadge
├─ FormSection / Field / FormActionBar / ErrorSummary
├─ KeyValueList / EvidenceRow / DataValue
├─ EmptyState / RouteSkeleton
└─ ResponsiveDataTable

Domain compositions
├─ PeriodStatement
├─ ShiftWorksheet
├─ CalculationReceipt
├─ NightTimeRuler
├─ WageMatchDisclosure
├─ WeekLedger / WeekDaySummary / WeekDayEditorDrawer
├─ RecordStatement / RecordEvidenceSheet
├─ CalendarBoard / CalendarAgenda / DayDetailsDrawer
└─ CalculationBasis / CodeExplorer
```

Routes should own data fetching, mutation boundaries, and high-level composition. Repeated visual class strings should move into primitives or domain components.

---

## 8. Ant Design and Magic UI policy

### 8.1 Ant Design

Ant Design remains the behavioral component layer, not the visible brand.

**Use behind Voyix adapters:**

- Button
- Input and Password
- Select for longer enumerations
- Segmented for view switches
- Drawer
- Modal
- Tooltip
- Collapse/Disclosure if its semantics and keyboard behavior fit
- Alert only for persistent page-level service failures
- Skeleton only for slow, information-heavy initial loads and with animation disabled

**Keep bespoke or native:**

- native date and time inputs unless a replacement is demonstrably more accessible;
- semantic data tables;
- Night Time Ruler;
- calendar grid and agenda;
- period statement and calculation receipt;
- wage/code presentation;
- product copy and state language.

**Integration requirements:**

- No direct Ant imports in route files.
- Use `ConfigProvider` and `AntdRegistry` through the existing provider.
- Theme values must consume authoritative semantic variables rather than duplicate palette literals.
- Segmented controls must be at least 44 px tall even though Ant's large preset is 40 px.
- Button adapters expose deliberate loading behavior and prevent repeat submission.
- Drawer and Modal must trap focus, close on Escape, restore focus, and have clear accessible names.
- Select uses `virtual={false}` for short lists and has a tested label relationship.
- Prefer Radio for fewer than five visible choices.
- Never use Ant preset status colors without mapping them to Voyix semantics.

### 8.2 Magic UI

Magic UI is not a second component system. It may contribute at most one optional, source-copied visual primitive after accessibility and performance review.

**Candidate:** `NoiseTexture`, at extremely low opacity, `aria-hidden`, pointer-events disabled, static, and restricted to the deep-purple rail or one emphasis surface.

**Rejected for the product UI:** Border Beam, Shimmer Button, Number Ticker, Blur Fade, Animated List, Marquee, Scroll Progress, animated grids, beams, and particles.

If the texture harms contrast, adds visible banding, or increases paint cost on mobile, remove it. The redesign must still look complete without Magic UI.

---

## 9. Route redesign blueprints

### 9.1 Login, forgot password, and reset password

**Current issues**

- The split layout is attractive at first glance but generic and spatially wasteful.
- Story copy repeats instead of building trust with concise product evidence.
- The form is narrow relative to the canvas.
- Forgot-password positioning can collide with labels or validation at zoom.
- Error and pending states do not have a stable reserved region.

**Redesign**

- Replace the large marketing-style left panel with a compact **Private Ledger Masthead**: wordmark, one-line promise, privacy boundary, and one subtle night/time artifact.
- Widen the form sheet slightly and use section rhythm rather than a bordered card.
- Keep recovery actions in normal document flow.
- Reserve a status region above the primary action so validation does not shift the form unpredictably.
- On mobile, make the masthead compact enough that the form begins within the first screen.
- When `/reset-password` has no valid recovery token, replace the active-looking password form with a clear missing/expired-link state and a request-new-link action.

**Acceptance**

- Primary action visible without excessive scrolling at 375 × 812.
- No absolute-position collision at 200% zoom.
- Focus order follows the visual order.
- Error summary and field message use matching text.

### 9.2 Signup and legal consent

**Current issues**

- One long undifferentiated stack makes required, security, legal, and optional salary fields feel equivalent.
- The narrow consent checkbox and adjacent legal links visibly collide at phone width.
- Legal actions compete with the consent sentence.

**Redesign**

- Group fields into three ruled sections: **Your profile**, **Sign-in security**, and **Estimate basis**.
- Render consent as a full-width `CheckboxRow` with a 44 px minimum target.
- Put Terms and Privacy actions beneath the consent sentence as low-emphasis inline actions.
- Keep the Ant Modal approach. Opening or closing legal content must preserve every entered field and return focus to the trigger.
- Make salary explicitly optional and visually secondary without hiding its calculation purpose.

**Acceptance**

- No overlap from 320 px through 1440 px.
- Terms and Privacy work with keyboard only and screen-reader modal announcements.
- Closing a legal modal returns to the correct trigger.
- Invalid consent is announced and linked from the error summary.

### 9.3 Terms and Privacy

**Current issues**

- Standalone legal pages feel detached from the product.
- A generic bordered panel wraps the entire article.

**Redesign**

- Use an editorial reading frame with the Voyix masthead, document title, effective date, and clear Back to Signup/Sign in actions.
- Use open paper, readable measure, anchored headings, and restrained rules.
- Keep the same legal content component shared by modal and standalone page.

### 9.4 Overview

**Current issues**

- Equal KPI cards make the page feel like a dashboard template.
- Estimate certainty is detached from the number it qualifies.
- Recent records lack a strong relationship to the active period.

**Redesign — `PeriodStatement`**

- Header: active period dates and cutoff context.
- Dominant value: total final ND hours.
- Secondary aligned facts: known estimate, entry count, unresolved/TBD count.
- Attach partial/TBD meaning directly to the estimate.
- Place recent shifts immediately below as statement lines, not separate floating cards.
- Primary action is Add Shift; secondary action is View all records.
- Do not add a generic bar, line, or donut chart. The product's meaningful visualization belongs to each shift's time evidence.

**Mobile**

- Keep the dominant total and status together.
- Use open rows separated by rules for recent shifts.
- Keep one reachable Add Shift action without obscuring content.
- Add sufficient end padding and focus-scroll handling so the fixed bottom navigation never covers recent rows, controls, or validation messages.

### 9.5 Add Shift — Day

**Current issues**

- Inputs and preview have nearly equal visual weight before calculation.
- Empty preview includes an unusable Save action.
- Supporting facts appear before the final ND and matched code.
- Day/Week switching is not fully unified with other segmented controls.
- The current bars are aggregate quantities, not a clock-aligned explanation.

**Redesign — `ShiftWorksheet` + `CalculationReceipt`**

- Use a clear Day/Week Segmented control.
- Divide the form into **Shift facts** and progressive **Schedule and overtime** sections.
- Keep common fields visible; reveal approved CWW and exceptional fields only when relevant.
- Before calculation, show a quiet explanation of what the preview will contain—no disabled Save button.
- After calculation, order the receipt:
  1. Final ND hours
  2. matched code and amount/TBD state
  3. Night Time Ruler
  4. arithmetic trace
  5. supporting shift facts
  6. “Why this code?” disclosure
- On mobile, use a sticky result/action bar only after a valid calculation exists.
- If a controlling input changes, visibly mark the result stale and disable Save until recalculated.

### 9.6 Add Shift — Week

**Current issues**

- Each included day renders a large block of controls plus full calculation evidence.
- Users must scan dozens of decisions at once.
- The Calculate action is conceptually ambiguous because results are already derived in memory.
- The reviewed state does not clearly separate editing from committing the batch.

**Redesign — `WeekLedger`**

Desktop:

- A seven-row ledger shows day/date, include state, shift time, classification, break, final ND, code, estimate/TBD state, and row status.
- Selecting a row opens an inline or side editor; only one day's detailed controls are expanded at a time.
- Provide Previous week, This week, Next week, and date-range context.
- A persistent review bar summarizes selected days, total final ND, known estimate, TBD count, and validation issues.

Mobile:

- Each day is a compact `WeekDaySummary` row.
- Selecting a day opens `WeekDayEditorDrawer`, preferably bottom placement when it improves reachability.
- Save draft state while moving between days.

Review and save:

- Use a distinct **Review week** step modeled on check-answers.
- List every included day, matched code, final ND, known estimate/TBD, and warning.
- Every Change action returns to the exact day/field and then back to review.
- On submit, save the reviewed snapshot atomically.
- Confirmation says **Saved privately**, identifies the week, and offers Open records / Add another week.

### 9.7 My Records

**Current issues**

- Filters read like a form rather than direct table controls.
- Linked date plus an Open record column duplicates navigation.
- Rows have weak tracking and hierarchy.
- Mobile uses another set of generic cards.

**Redesign — `RecordStatement` + `ResponsiveDataTable`**

- One statement toolbar contains active range, exact dates, result count, sort order, and filter action.
- Desktop uses a semantic table with sticky header where useful, tabular numbers, restrained row hover/current-line feedback, and one clear detail action.
- Suggested columns: Date, Shift, Final ND, Code, Estimate, Status, action.
- Amount/TBD status must never be communicated by color alone.
- Custom date fields appear only when Custom is selected.
- Mobile uses open ledger rows separated by rules with the same information, not miniature cards.
- Pagination announces current page and preserves filter/search parameters.
- Empty state explains whether the range has no records and offers Add Shift.

### 9.8 Record detail

**Current issues**

- Evidence is fragmented across several equally styled cards.
- Final ND and certainty are not visually dominant.
- The current timeline cannot explain the temporal overlap.

**Redesign — `RecordEvidenceSheet`**

- One continuous calculation sheet with ruled sections:
  1. recorded shift and snapshot timestamp;
  2. Final ND and matched code;
  3. known estimate or explicit TBD reason;
  4. Night Time Ruler;
  5. arithmetic trace;
  6. saved inputs and calculation basis.
- Use a definition list for key facts and a real table for wage lines.
- Distinguish current settings from the saved snapshot.
- Keep Back to records and date-range context visible.

### 9.9 Calendar

**Current issues**

- Phone month view becomes 35–42 stacked focusable cards.
- Cells use raw ISO labels and weak event distinction.
- Selected/anchor state, source events, personal items, periods, and shifts lack a clear legend.
- No strong Today action.
- Only a small number of events appear without a “+N more” affordance.

**Redesign — `CalendarBoard` + `CalendarAgenda`**

- Keep Month / Week / References in the shared Segmented control.
- Month remains a compact seven-column grid at phone width; do not turn it into a card list.
- The current phone Month implementation reaches approximately 3,283 px because it expands nearly every date into a card; the replacement must eliminate that pattern.
- Use editorial day numbers, clear out-of-month styling, Today, selected state, and a compact marker system with legend.
- Selecting a date updates an adjacent desktop agenda or the mobile agenda below the grid; use a drawer only for secondary detail, not as the sole way to understand the selected date.
- Accessible labels include the full date and a concise event/shift summary.
- Limit visible cell items and expose “+N more.”
- Week view is a chronological, time-aware list.
- References prioritizes reviewing source and personal items; add forms are progressively disclosed.
- Use push navigation when users reasonably expect Back to restore a prior month/date.

**Keyboard target**

- Arrow keys move by day within the grid.
- Home/End move within the week.
- Page Up/Down changes month where appropriate.
- Enter/Space selects a date.
- Focus is managed without producing 42 sequential Tab stops.

### 9.10 Settings

**Current issues**

- Profile and computation forms have equal visual weight.
- The code explorer is long and undifferentiated.
- Derived values and rule status lack a single explanatory composition.

**Redesign**

- Use anchored sections: **Profile**, **Calculation basis**, **Code reference**.
- Calculation basis combines monthly salary, derived hourly rate, schedule settings, and formula provenance into one coherent sheet.
- Separate engine-active ND codes from reference-only codes.
- Add filtering by category and hours category without implying formulas for reference-only rows.
- Collapse reference-only groups by default on small screens; the current mobile Settings page reaches approximately 5,521 px with the entire 16-code catalog expanded.
- Use stable compound keys for repeated codes across categories.
- Desktop may use a quiet section rail; mobile uses a contents disclosure or natural page flow.

### 9.11 Loading, empty, error, and success states

- Build one `Notice` contract for persistent page errors and warnings.
- Keep field errors adjacent to controls and repeat them in a linked error summary for long forms.
- Use route-shaped, inactive skeletons only when loading is long enough to justify them.
- Empty states should be concise and action-oriented; icons are optional and never decorative tiles by default.
- Successful save confirms a private record and next actions. It never implies employer submission or approval.
- Table scroll regions receive contextual names and become focusable only when overflow exists.

---

## 10. Night Time Ruler specification

This is the signature data visualization and must be shared by Day preview, Week review, and Record detail.

### 10.1 Required evidence

- shift start and end;
- configured ND window;
- potential overlap;
- final eligible ND interval or duration;
- break deduction shown outside the clock if its exact position is unknown;
- scheduled/CWW reconciliation where relevant;
- final ND value;
- matched code and calculation certainty.

### 10.2 Visual behavior

- Every plotted row shares the same clock scale.
- Use hour ticks and clear rollover into the next day.
- Use brand purple for the shift, a quiet lavender overlay for the ND window, and amber only for an actual exclusion/warning.
- Do not plot a break at a made-up time. If only a duration is known, render `−1.00 h break` as a deduction after the ruler.
- Provide a text/table equivalent that exposes the same evidence.
- At phone widths, preserve the scale and simplify labels instead of creating independently normalized bars.

---

## 11. Motion and interaction strategy

The user has allowed the current animation restriction to be reconsidered. That permission should be used narrowly.

### 11.1 Motion purposes

- preserve context when a Week row opens for editing;
- connect a Calendar selection to its agenda/detail;
- show stale → recalculated result state;
- confirm Save without a disruptive page jump;
- make Drawer and Modal entry/exit feel spatially coherent;
- provide press-down feedback on buttons.

### 11.2 Motion tokens

- 80 ms: press and micro-feedback
- 140–180 ms: hover, focus, selection, small disclosure
- 220 ms: row/editor transition
- 280–320 ms: route content, drawer, or modal transition
- standard ease-out for entry; ease-in for exit

### 11.3 Restrictions

- No infinite or ambient animation.
- No animated values for money, ND hours, or codes.
- No per-card page-load cascade.
- No scroll-jacking or cinematic marketing sequence.
- `prefers-reduced-motion: reduce` removes transforms and nonessential transitions.
- CSS and the existing Ant motion system are the default.
- A new motion dependency requires an ADR, bundle measurement, isolated client boundary, and a demonstrated interaction that CSS cannot express cleanly.
- GSAP is not recommended for the core app. If ever used for a future explanatory visualization, it must be dynamically loaded, isolated, reduced-motion-safe, and absent from routine route rendering.

---

## 12. Accessibility contract

Target WCAG 2.2 AA and verify behavior, not only static attributes.

- 44 × 44 px minimum target for important controls.
- Visible focus with at least 3:1 contrast against adjacent colors.
- Correct landmark order and one clear page heading.
- Skip link to main content.
- No color-only status, selection, warning, or certainty.
- Text contrast at least 4.5:1 for normal text and 3:1 for large text/UI boundaries.
- Form labels stay visible; placeholders are examples, not labels.
- Error summary receives focus after failed submission and links to exact fields.
- Modal and Drawer trap focus, support Escape, and restore trigger focus.
- Calendar follows a documented grid keyboard pattern and avoids 42 Tab stops.
- Tables use captions/accessible region names and preserve equivalent mobile information.
- Content reflows without two-dimensional page scrolling at 320 CSS px except true data tables/timelines with a documented alternative.
- Test 200% and 400% zoom, Windows High Contrast, reduced motion, keyboard only, and at least one screen reader.
- Announce stale calculation, calculation completion, batch-save progress, and save result through polite live regions where appropriate.

---

## 13. Responsive contract

| Width | Required behavior |
| --- | --- |
| 320–374 | No overlap; one-column forms; compact masthead; calendar grid remains usable; fixed actions cannot hide fields |
| 375–767 | Primary phone target; bottom navigation and editor drawers tested with virtual keyboard |
| 768–899 | Tablet composition; avoid merely stretching phone cards |
| 900–1023 | Explicit transition zone for feature two-column layouts; verify no premature collapse |
| 1024–1439 | Standard desktop workspace |
| 1440+ | Wide ledger/table layouts; line lengths and form widths remain controlled |

Each route must be reviewed at 320, 375, 768, 900, 1024, and 1440 px. The browser matrix includes populated, empty, partial/TBD, warning, error, loading, and success states.

---

## 14. Performance and implementation constraints

- Keep route pages and data queries server-first.
- Client components must be small interactive islands.
- Do not turn an entire route into a client component to support one animation.
- Keep Ant imports behind adapters so tree shaking and behavior remain auditable.
- Do not add a Magic UI package wholesale; source-copy only an approved primitive.
- Avoid active skeleton shimmer, large SVG filters, and paint-heavy effects on scrolling surfaces.
- Measure bundle impact before accepting a motion or visualization dependency.
- Preserve fast input response on Week entry; memoize by row only after profiling.
- Use tabular numbers to prevent layout jitter.
- Define display precision by quantity: money uses the approved currency precision, hours use the minimum meaningful decimal precision, and derived rates use a concise rounded display with an accessible full-precision/formula disclosure. Never round persisted calculation inputs merely for presentation.
- Preserve URL-driven Records and Calendar state when it improves shareability and browser navigation.

---

## 15. Phased execution plan

### Phase 0 — Visual proof before code

**Goal:** prevent another functional redesign that never establishes a compelling composition.

**Work**

1. Restart the local app cleanly and smoke-test Day/Week switching, Calendar views, Signup legal dialogs, recovery-link states, and the browser console.
2. Record the current deployed commit/version and establish whether public-route gaps are deployment drift or configuration failure.
3. Capture faithful desktop and mobile baselines for Signup, Overview, Day entry, Week entry, Records, Calendar, and Settings.
4. In the existing Superdesign Voyix project, create two coherent branches from the baseline:
   - Direction A: **Night Ledger 2.0** — recommended;
   - Direction B: **Quiet Personal Register** — softer, more document-like alternative.
5. Produce at least these responsive frames:
   - Overview populated and partial/TBD;
   - Day entry before and after calculation;
   - Week ledger edit and review;
   - Records desktop table and mobile ledger rows;
   - Calendar month + selected day;
   - Signup + legal modal;
   - Settings calculation basis.
6. Review both directions against the anti-slop, accessibility, data honesty, and responsive contracts.
7. User selects one direction before implementation begins.

**Gate:** no foundation rewrite until the runtime blockers are classified, deployment parity is understood, and the direction and Night Time Ruler are approved.

### Phase 1 — Foundations and component lab

**Goal:** make hierarchy systematic before touching every route.

**Likely files**

- `web/src/app/globals.css`
- `web/src/components/ui/voyix-ant-provider.tsx`
- `web/src/components/ui/voyix-ant-theme.ts`
- `web/src/components/ui/*`
- `web/src/components/shell/*`
- a focused Storybook-free component-lab route or test fixture if useful

**Work**

- Add semantic type, rhythm, density, surface, elevation, focus, z-index, and motion tokens.
- Make Ant consume the authoritative semantic values.
- Finish Button, ButtonLink, IconButton, Input, Select, Radio, CheckboxRow, Segmented, Drawer, Modal, Tooltip, Disclosure, and table contracts.
- Build Surface, Notice, ErrorSummary, FormSection, FormActionBar, KeyValueList, EmptyState, and route skeleton primitives.
- Remove state drift between raw and adapted controls.

**Verification**

- Unit tests for adapter mappings and semantic tokens.
- Keyboard/focus checks for every interactive primitive.
- Visual review at 320/375/768/1440.
- `pnpm --dir web typecheck`, focused tests, lint, build, and `git diff --check`.

### Phase 2 — Signature evidence layer

**Goal:** make “show the work” visually true.

**Work**

- Implement the shared Night Time Ruler from known calculation intervals.
- Implement CalculationReceipt and WageMatchDisclosure.
- Preserve text/table equivalents.
- Define stale, calculating, valid, partial, TBD, and error states.

**Gate:** no invented position for a duration-only break; all plotted rows share a true clock scale.

### Phase 3 — Add Shift Day and Week

**Goal:** rebuild the core operating workflow first.

**Day work**

- Recompose ShiftWorksheet.
- Progressive schedule/CWW fields.
- New calculation receipt order.
- Stale-state handling and mobile result bar.

**Week work**

- Build WeekLedger and row editor.
- Build WeekDayEditorDrawer for mobile.
- Add navigation and row statuses.
- Add linked error summary.
- Add explicit review/check-answers step.
- Preserve atomic batch save and snapshot contracts.

**Verification**

- Write/strengthen interaction tests before implementation where the plan names behavior.
- Browser test Day and Week happy, validation, stale, partial/TBD, server error, duplicate date, and success flows.
- Keyboard-only Week completion at desktop and phone sizes.

### Phase 4 — Shell, auth, signup, and legal

**Goal:** establish the new direction at entry points and navigation.

**Work**

- Recompose desktop rail/top bar and mobile masthead/bottom navigation.
- Redesign login/recovery surfaces.
- Group Signup sections and fix the consent interaction.
- Restyle legal reading frames while sharing document components.
- Preserve legal-modal form state and focus restoration.

**Verification**

- 320–1440 responsive pass.
- 200%/400% zoom.
- keyboard, focus, error summary, modal, and password-manager behavior.

### Phase 5 — Overview, Records, and Record detail

**Goal:** turn stored data into a coherent personal statement.

**Work**

- Build PeriodStatement and integrate recent record lines.
- Recompose filters and ResponsiveDataTable.
- Replace mobile cards with ledger rows.
- Build RecordEvidenceSheet using the shared receipt and time ruler.

**Verification**

- Empty/populated/partial/TBD/paginated/custom-range states.
- Semantic table, mobile equivalence, and browser navigation.
- Snapshot-vs-current-setting language review.

### Phase 6 — Calendar and References

**Goal:** make dates understandable and efficient on every viewport.

**Work**

- Rebuild CalendarBoard, selected-day agenda, Week list, legend, Today action, and “+N more.”
- Implement the documented keyboard model.
- Recompose References to prioritize reviewing existing data over adding new data.
- Replace raw controls with adapters.

**Verification**

- Month boundary, out-of-month dates, holidays, personal events, payroll periods, recorded shifts, empty day, many-events day, and error states.
- Keyboard navigation and screen-reader labels.
- Back-button behavior across month/date changes.

### Phase 7 — Settings and code reference

**Goal:** make calculation setup and reference data intelligible.

**Work**

- Build anchored Settings sections.
- Recompose CalculationBasis.
- Separate engine-active from reference-only codes.
- Add category filtering and stable compound keys.
- Keep all unresolved money logic explicitly TBD.

### Phase 8 — Selective delight

**Goal:** add refinement only after hierarchy and behavior are correct.

**Work**

- Tune press, selection, disclosure, drawer, modal, and route transitions.
- Prototype the optional Magic UI-style static noise texture.
- Remove the texture if it fails contrast or performance review.
- Do not add a motion library unless a reviewed interaction justifies it.

### Phase 9 — Full QA, Impeccable, and release convergence

**Goal:** verify the product as a system.

**Work**

- Run a formal Impeccable detector on the finished surfaces.
- Run independent UX, source, and visual-quality reviews.
- Complete browser QA at all required widths.
- Test keyboard, screen reader, reduced motion, zoom, high contrast, and virtual keyboard.
- Review every empty/loading/error/partial/TBD/success state.
- Confirm no direct route-level Ant imports and no unapproved Magic UI effects.
- Reconcile `DESIGN.md`, `.superdesign/design-system.md`, and superseded setup/UI documentation after user approval.

**Release commands**

```powershell
pnpm --dir web test
pnpm --dir web typecheck
pnpm --dir web lint
pnpm --dir web build
git diff --check
```

Supabase runtime validation remains separate. If used, every Supabase CLI call must include `--agent no`.

---

## 16. Agent and skill workflow per implementation slice

1. **Planner:** confirms scope, existing contracts, dependencies, test-first behaviors, and file ownership.
2. **Design owner:** uses the selected Superdesign direction and updates the component/page contract.
3. **Executor:** writes the named failing interaction test first when the plan specifies behavior, then implements the smallest coherent slice.
4. **Accessibility reviewer:** audits keyboard, focus, semantics, contrast, zoom, and state announcements.
5. **Code and TypeScript reviewer:** reviews composition, adapter boundaries, server/client placement, types, and regression risk.
6. **Security reviewer:** required for auth, legal submission, Server Actions, RLS, settings, and persisted shift work.
7. **Browser QA:** verifies the real route at target widths with empty, error, partial/TBD, and populated states.
8. **Polish pass:** only after the feature is functionally and accessibly complete.

Recommended skills by phase:

- Always: `voyix-shift-workflow`
- UI: `design-taste-frontend`, `minimalist-ui`, `apple-design`, `accessibility`, `browser-qa`
- Component behavior: Ant Design official guidance through the adapter contract
- Complex forms: UIUX Designer forms/onboarding and user-flow guidance
- Final refinement: Impeccable and Engineering Suite Polish
- Auth/Server Actions: `supabase`, `supabase-postgres-best-practices`, `security-review`
- Named tests: `tdd-workflow`, `verification-loop`
- Next.js route/client boundaries: `nextjs-turbopack`

No implementation agent may rewrite another agent's work, commit, push, or modify git configuration without explicit authorization.

---

## 17. QA matrix

| Surface | Must test |
| --- | --- |
| Auth | valid/invalid login, pending, forgot/reset, password manager, keyboard, zoom |
| Signup | required/optional values, consent error, Terms modal, Privacy modal, state preservation, narrow layouts |
| Shell | all active routes, collapsed/full rail, mobile nav, shortcut, safe areas, long route titles |
| Overview | no records, one record, many records, known estimate, partial, all TBD, query failure |
| Day entry | ordinary day, approved CWW, overnight, break deduction, no overlap, partial/TBD, stale result, save failure/success |
| Week entry | excluded/included days, row errors, mixed estimates/TBD, edit-review-edit, atomic save failure/success |
| Records | default/custom range, sort, pagination, empty range, partial/TBD rows, narrow table equivalence |
| Detail | all evidence, snapshot differences, unknown break position, missing optional salary, deleted/missing record |
| Calendar | month/week/references, Today, month boundary, out-of-month days, many events, keyboard grid, selected agenda |
| Settings | unchanged/changed profile, valid/invalid salary/schedule, derived rate, code filtering, server error |
| Global | loading, offline/service error, reduced motion, 200%/400% zoom, high contrast, screen reader |
| Deployment parity | route manifest, public/local feature parity, build identifier, legal/recovery availability, authenticated smoke test |

---

## 18. Documentation cleanup required during execution

The following contradictions must be resolved once the new direction is approved:

- `docs/07-SETUP-PLAN.md` still contains broad shadcn/Radix guidance even though Ant now forms the interaction layer.
- `DESIGN.md` both implies a crescent brand mark exists and describes the brand as typographic until a real asset exists.
- Primary-action height is described as 42 px in one place while the active accessibility contract requires 44 px.
- Small-screen records guidance conflicts between horizontal table overflow and information-equivalent mobile rows.
- The timeline specification describes temporal evidence, while the current component renders normalized aggregate bars.
- The documented feature-layout breakpoint and current `lg:` implementation disagree.
- Older UI documentation retains pre-source Calendar and legacy navigation language.
- Historical docs still use `voyixshift` where current branding is `voyixworkspace`.

Do not erase history silently. Mark superseded sections clearly and update the authoritative contract after approval.

---

## 19. Decision gates

The following decisions must be approved before their corresponding implementation begins:

1. Select Night Ledger 2.0 or an alternative Phase 0 direction.
2. Approve the desktop shell width/navigation change.
3. Approve the exact Night Time Ruler representation.
4. Approve Week review as a distinct step before atomic save.
5. Approve any motion dependency; the default recommendation is no new dependency.
6. Approve or reject the optional static texture after seeing it on real content.
7. Approve documentation convergence and the final replacement of the current visual contract.

---

## 20. Definition of done

The redesign is complete only when:

- every named route follows one selected visual direction;
- the overview no longer uses a generic equal-card KPI composition;
- the Night Time Ruler truthfully explains the calculation on Day, Week review, and Record detail;
- Week entry is a focused ledger/editor workflow with an explicit review step;
- Records are a high-quality semantic data table on desktop and equivalent ledger rows on mobile;
- Calendar remains compact and keyboard-operable on phones;
- Signup legal consent does not collide and modal behavior preserves state/focus;
- Ant interaction behavior is fully contained behind Voyix adapters;
- Magic UI is either absent or limited to an approved static, decorative primitive;
- all loading, empty, error, partial/TBD, stale, and success states are designed and tested;
- WCAG 2.2 AA behavior is verified at required viewports and zoom levels;
- reduced motion is complete and no looping animation remains;
- tests, typecheck, lint, build, and `git diff --check` pass;
- the clean local build has no Week/Calendar/legal interaction blocker, and the deployed route/feature manifest matches the approved release;
- no product, calculation, security, or data-truth contract has regressed;
- the user has approved the final visual direction and responsive flow before release.

---

## 21. Primary external references

- [Ant Design theme customization](https://ant.design/docs/react/customize-theme/)
- [Ant Design with Next.js](https://ant.design/docs/react/use-with-next/)
- [Ant Design Button](https://ant.design/components/button/)
- [Ant Design Segmented](https://ant.design/components/segmented/)
- [Ant Design Drawer](https://ant.design/components/drawer/)
- [Ant Design Select](https://ant.design/components/select/)
- [Ant Design Calendar](https://ant.design/components/calendar/)
- [Magic UI Noise Texture](https://magicui.design/docs/components/noise-texture)
- [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WAI-ARIA date-picker grid example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/)
- [GOV.UK Check answers](https://design-system.service.gov.uk/patterns/check-answers/)
- [GOV.UK Error summary](https://design-system.service.gov.uk/components/error-summary/)
- [GOV.UK Summary list](https://design-system.service.gov.uk/components/summary-list/)
- [GOV.UK Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/)

---

## 22. Recommended immediate next action

Start Phase 0 only: create faithful current-state captures and two responsive visual directions for Overview, Day, Week, Records, Calendar, Signup, and Settings. Review the system as a connected flow, choose one direction, and approve the Night Time Ruler before modifying production UI code.
