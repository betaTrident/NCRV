# Voyix Shift — Design System

**Product:** Voyix Shift, a private employee shiftbook for night-differential (ND) hours. It is a personal tracking and estimation tool. It is not an employer payroll system, and it has no manager or admin accounts.

**Personality:** precise, steady, human. Swiss editorial hierarchy paired with the legibility of industrial timekeeping instruments.

**Voice:** plain, concise, and non-authoritative about payroll. Example lines: “Your night hours, accounted for.” and “Estimate only — confirm your payroll rule before relying on this amount.”

**Core principles:**

1. Scan first. Short headings, compact labels, consistent landmarks.
2. Show the work. Time, overlap, break subtraction, final ND hours, and wage-code status appear as a trace, never as a black-box total.
3. Private and calm. Warm paper surfaces, restrained motion, a personal-record frame.
4. Do not overclaim. Estimate, pending, and TBD states stay explicit and are never styled as confirmed payroll outcomes.

## Color

Purple `#5F249F` is the only brand accent. Use these exact tokens. Do not introduce other hues, gradients, or accent colors.

| Token | Hex | Use |
| --- | --- | --- |
| `--brand-purple` | `#5F249F` | Primary buttons, links, active nav on light surfaces, focus, selected states |
| `--brand-purple-deep` | `#341A4B` | Sidebar, period/amount banners, large dark structural areas |
| `--brand-purple-light` | `#C3A3E0` | Marks and restrained accents on deep purple. Decorative only on light surfaces. Not small text on white. |
| `--brand-purple-tint` | `#F1E9F8` | Selected filters, code chips, timeline highlights, soft brand surfaces |
| `--ink` | `#211E25` | Primary text and key totals |
| `--ink-soft` | `#4C4651` | Secondary body text and form labels |
| `--muted` | `#706A75` | Supporting copy, helper text, metadata |
| `--paper` | `#F5F2F6` | Application canvas |
| `--surface` | `#FFFEFA` | Cards, panels, form surfaces |
| `--surface-soft` | `#FBF9FC` | Quiet inset surfaces |
| `--line` | `#E8E4EB` | Card borders and dividers |
| `--line-strong` | `#D8D1DE` | Input borders and stronger separators |
| `--success` | `#356D5B` | Positive/confirmed only, with words or an icon |
| `--amber` | `#A86C2E` | Estimate, unresolved, caution. Background `#FBF3E8` |
| `--rose` | `#A75143` | Errors, with a message and icon |

Contrast: `#5F249F` on light surfaces. Off-white or light lavender text on `#341A4B`. Do not place `#5F249F` as small text on the deep-purple rail.

Green is not a second brand color. Amber means estimate or unresolved. Never communicate state by color alone.

## Typography

- Interface and headings: Manrope, then Segoe UI, sans-serif. Headings and actions 600–800. Body regular or medium.
- Time, dates, hours, employee codes, and money: IBM Plex Mono, then ui-monospace, monospace. Tabular figures. Aligned numeric columns.
- Page title 32 px. Section heading 17 px. Body 13–14 px. Compact data labels 9 px uppercase mono with increased tracking.
- High weight and large scale are reserved for the page title and the final ND total. Purple emphasis is a single word inside a heading, not a whole paragraph.
- Currency is PHP with grouping and two decimals, prefixed with ₱.

## Layout

- Desktop shell: fixed 244 px left navigation rail in `#341A4B`, sticky 65 px top bar, content max-width 1320 px, page padding 40 px.
- Wordmark: lowercase `voyixshift`. On the deep-purple rail, `shift` is `#C3A3E0`. No invented logo, initials, or emoji mark. There is no brand-asset file in this repo yet.
- Desktop nav labels: Overview, My records, Calendar, Settings. Active item: translucent purple field, slim left indicator, lighter icon, explicit label. Add shift is the current page, so the top-bar action can read as the current context rather than a second primary button.
- Top bar: a small privacy indicator, “Saved privately”, with a success dot and the words. Do not use a payroll or employer badge.
- Surfaces: off-white panels, 1 px `#E8E4EB` borders, modest shadow, 14 px corner radius. Deep purple is for the rail and one high-emphasis summary only.
- Buttons: primary is min-height 42 px, white label on `#5F249F`, 8 px radius. Outline is transparent, purple text, visible border. Quiet actions have no strong container.
- Forms: persistent labels, 42 px controls, 3 px purple focus ring with offset, short helper text under the field.
- Tables: uppercase mono column labels, tabular figures.
- Motion: short and quiet. No looping animation.

## Screen to design: Add a shift

Desktop, 1440 px wide. Two columns inside the shell. Left column is the shift form. Right column is the live calculation preview. This is the calculated state, not the empty placeholder.

Page header: uppercase mono eyebrow `ADD A SHIFT`, one H1 “Calculate this shift”, one sentence: “Your night hours, accounted for.”

### Form (left)

Fields the employee actually provides:

- Work date: October 1, 2026
- Shift start: 9:00 PM
- Shift end: 6:00 AM
- Day classification: Regular Work Day. Options exist but are not all open: Regular Work Day, Rest Day, Special Public Holiday, Special Public Holiday + Rest Day, Regular/Public Holiday, Regular/Public Holiday + Rest Day, Double Regular Holiday, Double Regular Holiday + Rest Day.
- Break included in Night Differential? No.
- Helper under the break field: “Default unpaid break is 1 hour. Start and end of the break are not collected.”

Primary button: “Calculate shift”. Quiet action: “Cancel”.

A one-line note under the form: “This does not submit anything to payroll.”

### Calculation preview (right)

Show the trace for the sample above.

- Night-window timeline from 9:00 PM to 6:00 AM. Label the configured window 10:00 PM–6:00 AM. Purple marks the qualifying ND segment. Lighter lavender marks potential overlap. Amber hatching marks the excluded 1-hour break. Legend repeats those meanings in text.
- Number strip, in mono: Potential ND 8.00 hrs, Break 1.00 hr excluded, Final ND 7.00 hrs. Final ND is the emphasis.
- Amber status line with the words “ESTIMATE ONLY”.
- Wage-type table with columns Code, Category, Hours, Rate, Amount. One row: `2211`, “Ordinary day — night shift, first 8 hours”, `7.00`, `10%`, and the amount `₱140.00`.
- Helper under the amount: “10% of a saved hourly rate of ₱200.00 for each qualifying hour. Estimate only — confirm your payroll rule before relying on this amount.”
- Do not show a second invented wage code. Do not show break start or break end. Do not style 2211 as payroll-approved. The chip for 2211 is pale purple with purple mono text.

Primary save action sits with the preview: “Save entry”. Secondary: “Cancel”. There is no approval step.

## Do not

- Do not look like a payroll operations console, HR suite, or marketing landing page.
- Do not invent extra navigation, charts, avatars, or employer branding.
- Do not use fonts, colors, gradients, or component styles outside this system.
