# Voyix Shift — Design System

**Version:** 1.1 · **Brand accent:** Purple `#5F249F`

This document describes the visual language and page patterns used by the Voyix Shift employee shiftbook. The interface is a private tracking and estimation tool, not an employer payroll system.

## 1. Brand foundation

- **Positioning:** A clear personal record of every night-shift differential—built for employees who want to see how their hours were estimated, without pretending an unresolved payroll rule is settled.
- **Personality:** precise, steady, human.
- **Design movement:** Swiss editorial hierarchy paired with the legibility of industrial timekeeping instruments.
- **Core principles:**
  1. **Scan first:** short headings, compact labels and consistent page landmarks make every screen easy to read quickly.
  2. **Show the work:** elapsed and worked time, schedule threshold, overtime status, ND overlap, break treatment, final ND hours and wage-code status are presented as a trace, not a black-box total.
  3. **Private and calm:** warm paper-like surfaces, restrained motion and a clear personal-record frame avoid the feel of a payroll operations console.
  4. **Do not overclaim:** estimate, pending and TBD states are explicit and are never styled as confirmed outcomes.
- **Brand voice:** plain, concise and non-authoritative about payroll. Example lines: “Your night hours, accounted for.” and “Estimate only — confirm your payroll rule before relying on this amount.”

## 2. Color system

Purple is the ownable Voyix Shift brand accent. The provided value is authoritative and must remain exact in primary actions and brand links.

| Token | Hex | Intended use |
| --- | --- | --- |
| `--brand-purple` | `#5F249F` | Signature color; primary buttons, links, active navigation on light surfaces, focus and selected states |
| `--brand-purple-deep` | `#341A4B` | Sidebar, authentication hero, period/amount banners, other large dark structural areas |
| `--brand-purple-light` | `#C3A3E0` | Mark and restrained accents on deep purple surfaces; decorative only on light surfaces |
| `--brand-purple-tint` | `#F1E9F8` | Selected filters, code chips, timeline highlights and soft brand surfaces |
| `--ink` | `#211E25` | Primary text and key totals |
| `--ink-soft` | `#4C4651` | Secondary body text and form labels |
| `--muted` | `#706A75` | Supporting copy, helper text and metadata |
| `--paper` | `#F5F2F6` | Main application canvas |
| `--surface` | `#FFFEFA` | Cards, panels and form surfaces |
| `--surface-soft` | `#FBF9FC` | Quiet inset surfaces |
| `--line` | `#E8E4EB` | Card borders and dividers |
| `--line-strong` | `#D8D1DE` | Input borders and stronger separators |

### Semantic colors

Semantic status color is separate from brand color. **Green is reserved for positive states only** (saved/private, preview ready, or a confirmed classification); it is not a second brand accent. Amber signals estimate, unresolved/TBD, or caution. Rose signals errors. Always pair status color with words or an icon—never communicate state by color alone.

| Meaning | Treatment |
| --- | --- |
| Positive/confirmed | `--success: #356D5B`, pale green success surface, small green status dot |
| Estimate / unresolved / caution | `--amber: #A86C2E`, `--amber-bg: #FBF3E8`; keep explicit “Estimate”, “Pending” or “TBD” text |
| Error | `--rose: #A75143`, with an error message and icon |

**Contrast rule:** use `#5F249F` for text or controls on light surfaces; use off-white or light lavender text on `#341A4B`. Do not place the exact signature purple as small text directly on the deep-purple structural background. Keep `#C3A3E0` for dark-surface accents or larger decorative details, not small text on a white card. The signature purple has approximately 9.3:1 contrast against the card white `#FFFEFA`.

## 3. Typography

- **Interface and headings:** Manrope, with Segoe UI/sans-serif fallback. Use 600–800 for headings and actions; keep body copy regular or medium.
- **Time, dates, hours, employee codes and money:** IBM Plex Mono, with system monospace fallback. Use tabular figures and keep numeric columns aligned.
- **Hierarchy:** page title 29–40 px (31 px on small screens); section heading 15–19 px; body 11–14 px; compact data labels 8–10 px in uppercase mono with increased tracking.
- **Emphasis:** reserve high weight and large scale for page titles and important totals. Use purple emphasis sparingly within a heading, not for entire paragraphs.
- **Currency:** display PHP with locale-aware grouping and two decimals where appropriate.

## 4. Layout and responsive behavior

- **Desktop shell:** fixed 244 px left navigation rail and a sticky 65 px top bar. Center page content within a 1,320 px maximum width; base content padding is 40 px.
- **Tablet / compact desktop:** at 1,120 px, rail narrows to 215 px and page gutters to 28 px. At 900 px, the rail becomes a 74 px icon rail; the wordmark and labels yield to space.
- **Mobile:** at 640 px, remove the desktop rail, use a compact 54 px header, and pin a 63 px bottom navigation bar with safe-area padding. Main content has 16 px side padding. At 370 px and below, reduce page gutters to 12 px and stack compact banner content.
- **Content composition:** prefer vertically stacked page sections, asymmetric split panels and readable ledgers over a centered marketing-style grid. Use two-column layouts for shift entry, calendar and settings when width allows; collapse them to one column at 900 px.
- **Surface language:** white/off-white panels, fine borders, modest shadows and 12–16 px corner radii. Reserve deep purple for navigation and high-emphasis summary surfaces.

## 5. Shared components

### Navigation and brand

- The custom crescent/clock-tick mark sits beside the lowercase `voyixshift` wordmark. The second word segment uses a light lavender accent on deep purple.
- Desktop navigation includes Overview, My records, Calendar and Settings. The top bar carries the privacy indicator and Add shift action. Mobile uses the same destinations in a bottom bar plus a prominent Shift shortcut.
- Active navigation uses a translucent purple field, a slim left indicator and a lighter icon; labels remain explicit.

### Page heading and section label

- Standard page header combines a small uppercase mono eyebrow and rule, one clear H1, one-sentence subtitle, and—when useful—a right-aligned action or count.
- Eyebrows identify the page purpose (“YOUR HISTORY”, “ADD A SHIFT”), not generic greetings.

### Buttons and links

- Primary action: 42 px minimum height, white label on `#5F249F`, 8 px radius; darken slightly on hover. The main action is phrased as a verb (“Add shift”, “Calculate shift”, “Save profile”).
- Outline action: transparent surface, purple text, visible border; hover adds a pale-purple tint.
- Quiet action: no strong container until hover; use for Cancel and secondary navigation.
- Hover motion is limited to a subtle 1 px lift for buttons and a small color/border transition. Disabled actions remain visibly disabled.

### Panels, forms and tables

- Panels use a white surface, thin neutral border and consistent 12–16 px corners. Related data stays grouped; section headings align consistently.
- Form fields use persistent labels, 40–45 px controls, clear focus rings, and short helper text below the relevant field. Keep two related fields side-by-side only when they remain legible.
- Tables use uppercase mono column labels, tabular figures and horizontal overflow on small screens rather than hiding important information.
- Wage-code chips use pale purple with purple mono text; unresolved candidates use amber with visible TBD wording.

### Night-window timeline

- Timeline presents the configured window labels, potential overlap, final qualifying ND segment and—when excluded—the break segment. Its legend repeats the visual meaning in text. Purple marks qualifying ND; a lighter lavender marks potential overlap; amber hatching marks excluded break.
- The saved record shows the same window and calculation snapshot that was used at save time.

### Notice and status patterns

- Use purple for selected/active states, success green for confirmed/saved states, amber for estimates and unresolved rules, and rose for errors.
- Keep full status words such as “ESTIMATE ONLY”, “CODE TBD” and “Mapping pending”. Never style an unresolved wage rule as a completed line.
- Empty states include a relevant icon, a short explanation and a next action when one exists.

## 6. Page-by-page system

| Route / page | Layout and emphasis | Key visual states |
| --- | --- | --- |
| `/login` — Employee sign in | Split composition: deep-purple story panel on the left, restrained form panel on the right. On mobile, stack the brand/story above the form. | Password reveal control, sign-in pending, validation/error feedback, privacy note. |
| `/signup` — Create profile | Reuse the auth shell; keep the form as the primary focus and registration copy clear that this does not verify employment. | Required name/employee ID/password; optional email and monthly basic salary; derived factor-261 rate explanation; pending and validation feedback. |
| `/` — Overview | Page heading and Add shift action; prominent payroll-period banner; three metric cards; recent-shift ledger; estimate disclaimer. | Configured vs not-configured period; loading; recent shifts vs empty ledger; estimate vs missing data. |
| `/shift/new` — Add shift | Desktop split: shift form at left, calculation preview at right. Stack on tablet/mobile. The timeline and number strip anchor the result. | Standard or approved-CWW schedule; employee-recorded overtime approval; worked/regular/extra-hour trace; pre-calculation placeholder; live calculation; cross-date confirmation; code/threshold TBD; save pending/saved; inline error. |
| `/records` — My records | Filter toolbar, optional custom dates, payroll-period subheading and compact ledger table. | Week/period/month/custom range; missing period notice; populated table; empty/loading state; pending code labels. |
| `/records/:id` — Record detail | Calculation trace in the wide panel; estimate and wage-type summary in the aside. Stack into a single column on mobile. | Saved snapshot, cross-date confirmation/pending, configured wage lines, unresolved candidates, missing record. |
| `/calendar` — Calendar | Two peer panels for holiday references and payroll periods, each with list/empty state followed by an add form. | Clear warning that dates are not fabricated; empty and populated lists; saved feedback. |
| `/settings` — Settings | Two-column profile and computation forms, then a full-width read-only ADP reference catalog. Collapse to one column on narrow layouts. | Profile and computation save states; unset first-eight basis warning; read-only catalog; TBD formulas. |

## 7. Interaction, motion and accessibility

- Use direct, reversible interactions and immediate inline feedback. Calculation changes should update the preview without hiding which input changed.
- Page entrance uses a short 5 px rise/fade (about 280 ms); control transitions generally sit around 150–200 ms. Avoid looping or attention-seeking animation.
- Honor `prefers-reduced-motion: reduce`; remove nonessential movement and shorten transitions.
- Every interactive element has a visible keyboard focus indicator (3 px purple outline with offset). Maintain native form labels and meaningful button names; icon-only actions require accessible labels.
- Preserve a minimum 44 px target for primary touch actions where practical. Keep mobile navigation clear of device safe areas.
- Do not rely on color alone for success, pending, estimate or error. Repeat meaning in a text label, icon, or both.

## 8. Copy and content rules

- Use employee-centered, matter-of-fact language (“your shift”, “saved privately”).
- Call amounts “estimates”; do not imply payroll approval, submission or employer verification.
- Explain missing source rules in place, with a concrete next step where possible. Keep warnings brief and specific; avoid false certainty or generic marketing language.

## 9. Implementation reference

The application foundation, file paths, and component names are specified in `07-SETUP-PLAN.md`. Palette and shared visual rules live in `web/src/app/globals.css`. Page composition lives under `web/src/app/(app)/`. The shell and wordmark live in `web/src/components/shell/`. The calculation timeline is `web/src/components/shift/night-window-timeline.tsx`. Version 1 uses the typographic wordmark. A crescent mark is added only when a real SVG asset exists. When adding a page, reuse `PageHeader`, `Panel`, `Field`, `StatusLine`, and the button variants before introducing a new visual primitive.
