# Voyix Workspace — app brief

Copy this whole file. It is the product, the pages, and the design system in one place.

Voyix Workspace is a private employee night-differential shiftbook. The person using it is an employee, not a payroll clerk and not a manager. They spare a few seconds to enter a shift and need to see how the hours were estimated.

It is not employer payroll. It does not submit time, approve wages, or verify employment. There are no manager or admin accounts and no approval workflow.

Voice: plain, concise, and non-authoritative about payroll.
- “Your night hours, accounted for.”
- “Estimate only — confirm your payroll rule before relying on this amount.”
- “Show the work, not just the total.”
- “This does not submit anything to payroll.”

Unresolved wage rules stay visible as TBD. An estimate is never styled as a confirmed payroll outcome.

Production: https://voyix-workspace.vercel.app
Intended domain: https://voyix.kentsuuii.tech
Runtime folder: web/ (Vercel root). Specs: docs/. Product and design stay at the repo root: PRODUCT.md, DESIGN.md.

---

## What is built right now

Working:
- Email and password sign-in, sign-up, and sign-out.
- Signed-in shell: left rail, top bar, mobile bottom nav.
- Add shift at /shift/new: form, live calculation preview, and save. The server recalculates. The browser preview is not what gets stored.
- Calculation engine for night hours, break, scheduled hours, compressed workweek, and wage lines. Only ordinary-day code 2211 has a money amount. Everything else is TBD.

Still empty landmarks (copy and layout are specified; the screens do not yet load or save their data):
- Overview (/)
- My records (/records)
- Record detail (/records/:id)
- Calendar (/calendar)
- Settings profile, computation, and ADP catalog (/settings has Sign out only)

---

## Stack and hard rules

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, shadcn/ui on Radix.
- Supabase Auth + Postgres + row-level security. Server Actions. No separate API. No Edge Functions in v1.
- web/src/proxy.ts refreshes cookies only. Layouts, Server Actions, and row-level security authorize.
- employees.id equals auth.users.id. Policies use (select auth.uid()). Never authorize from user_metadata.
- No anon grants on app tables. No security-definer functions in public.
- Time zone: Asia/Manila. Date-time: Luxon. Hours: decimal.js. Money stored as integer centavos. Round only the final estimate.
- Light paper canvas only. No dark mode in v1.
- Motion is CSS only, about 180 ms for controls and one 280 ms page entrance (5 px rise and fade). Honor prefers-reduced-motion. No Framer Motion, GSAP, bounce springs, looping animation, or gradients.
- Do not invent ADP codes, holiday dates, or money formulas. TBD stays TBD.
- Do not seed holidays or payroll periods. Dates are never fabricated.
- Saturday and Sunday are not automatically rest days. Rest day is chosen per shift.

---

## Design system

Personality: precise, steady, human.
Movement: Swiss editorial hierarchy with the legibility of industrial timekeeping.
Principles:
1. Scan first. Short headings, compact labels, consistent landmarks.
2. Show the work. Elapsed time, worked time, schedule threshold, overtime status, night-differential overlap, break treatment, final hours, and wage-code status are a trace, not a black-box total.
3. Private and calm. Warm paper surfaces. Not a payroll console.
4. Do not overclaim. Estimate, pending, and TBD stay explicit.

### Color

Use these exact values. Purple is the brand. Green, amber, and rose are status only, and always paired with words.

| Token | Hex | Use |
| --- | --- | --- |
| Brand purple | #5F249F | Primary buttons, links, active nav on light surfaces, focus, selected states. Hover darkens to #531F8C. |
| Deep purple | #341A4B | Sidebar, auth hero, period and amount banners, other large dark areas. |
| Light lavender | #C3A3E0 | Wordmark “workspace” and restrained accents on deep purple. Not small text on a white card. |
| Purple tint | #F1E9F8 | Selected filters, code chips, timeline highlights, soft brand surfaces. |
| Ink | #211E25 | Primary text and key totals. |
| Ink soft | #4C4651 | Secondary body and form labels. |
| Muted | #706A75 | Helper text and metadata. |
| Paper | #F5F2F6 | App canvas. |
| Surface | #FFFEFA | Cards, panels, forms. Also the light text on deep purple. |
| Surface soft | #FBF9FC | Quiet insets. |
| Line | #E8E4EB | Card borders and dividers. |
| Line strong | #D8D1DE | Input borders. |
| Success | #356D5B on #E7F2EC | Saved, private, preview ready, confirmed classification. |
| Amber | #A86C2E on #FBF3E8 | Estimate, unresolved, TBD, caution. |
| Rose | #A75143 on #F8EBE8 | Errors. |

Contrast: #5F249F on light surfaces. Off-white or light lavender on #341A4B. Do not put #5F249F as small text on the deep-purple rail.

### Type

- Interface and headings: Manrope. Weights 600–800 for headings and actions. Body regular or medium. Fallback: Segoe UI, sans-serif.
- Time, dates, hours, employee codes, wage codes, and money: IBM Plex Mono, tabular figures. Fallback: system monospace.
- Page title: 29–40 px (31 px on small screens).
- Section heading: 15–19 px.
- Body: 11–14 px.
- Compact data labels: 8–10 px, uppercase mono, increased tracking.
- Purple emphasis is spare, inside a heading, never a whole paragraph.
- Currency: PHP, locale grouping, two decimals. Example shape: ₱1,234.56. Call it an estimate.

### Wordmark

Lowercase voyixworkspace. On the deep-purple rail: “voyix” is #FFFEFA, “workspace” is #C3A3E0. Weight 800, tight tracking. Version 1 is the typographic wordmark. A crescent or clock-tick mark is added only when a real SVG exists.

### Layout

- Desktop: fixed 244 px left rail, sticky 65 px top bar. Content max width 1,320 px. Page padding 40 px.
- At 1,120 px: rail 215 px, gutters 28 px.
- At 900 px: rail becomes a 74 px icon rail. Two-column pages collapse to one column.
- At 640 px: no desktop rail. Compact 54 px header. Bottom nav 63 px plus safe area. Side padding 16 px.
- At 370 px and below: gutters 12 px. Compact banners stack.
- Prefer stacked sections, asymmetric split panels, and ledgers. Not a centered marketing grid.
- Panels: white surface, thin border, 12–16 px corners (panel radius token 14 px, control radius 8 px). Do not nest panels. Do not put an icon tile above a heading.
- Primary buttons: at least 42 px tall, preferably 44 px touch targets. White label on #5F249F, 8 px radius. Hover darkens slightly. A 1 px lift is the most motion a button gets.
- Outline: transparent, purple text, visible border, pale-purple hover.
- Quiet: no strong container until hover. Use for Cancel and secondary navigation.
- Focus: 3 px purple outline with 2 px offset.
- Forms: persistent labels, 40–45 px controls, short helper text under the field.
- Tables: uppercase mono column labels, tabular figures, horizontal scroll on small screens. Do not hide columns.
- Wage chips: pale purple with purple mono text. Unresolved chips: amber plus the word TBD.
- Empty states: short explanation and a next action when one exists.
- Page header: small uppercase mono eyebrow, one H1, one-sentence subtitle, optional right-side action.

### Motion and accessibility

- Page entrance: 280 ms, 5 px rise and fade, once.
- Controls: about 150–200 ms.
- Reduced motion: remove nonessential movement.
- Every control has a visible focus ring and a real name. Icon-only buttons need an accessible label.
- Do not communicate state by color alone. Repeat “ESTIMATE ONLY”, “CODE TBD”, “Mapping pending”, “Saved”, or the error words.

### Shared shell

Desktop rail, top to bottom:
- Wordmark, links to Overview.
- Overview
- My records
- Calendar
- Settings

Top bar:
- Privacy indicator (private personal record).
- Primary action: Add shift.

Mobile bottom bar:
- Overview
- Records
- Shift (prominent plus)
- Calendar
- Settings

Active item: translucent purple field, slim left indicator, lighter icon, explicit label.
Skip link: “Skip to content”. Signed-out people go to /login. Signed-in people hitting /login or /signup go to Overview.

---

## Pages

### /login — Employee sign in

Built. Split screen: deep-purple story on the left, form on the right. On small screens the story stacks above the form.

Story:
- Eyebrow/brand: voyixworkspace
- Title: “Your night hours, accounted for.”
- Body: “A private record of every night-shift differential, built for employees who want to see the work.”

Form:
- Eyebrow: SIGN IN
- Title: Employee sign in
- Subtitle: “Sign in with your email to see your private shift history.”
- Email
- Password, with show/hide
- Button: Sign in (pending: “Signing in…”)
- Link: Create a profile → /signup
- Inline error in rose

Employee ID is not the login. Email and password are.

### /signup — Create profile

Built. Same auth split.

Story title: “Show the work, not just the total.”
Story body: “Creating a profile here starts your private record. It does not verify or submit anything to your employer.”

Form:
- Eyebrow: NEW ACCOUNT
- Title: Create profile
- Subtitle: “Name, employee ID, email, and password are required. Monthly basic salary is optional.”
- Full name
- Employee ID (profile field, not a login)
- Email. Helper: “Only used to sign back in. Creating a profile does not verify employment.”
- Password. Helper: “Use at least 12 characters.”
- Monthly basic salary, optional, decimal. Helper: “Optional. Used to derive the computational hourly rate with factor 261.”
- Button: Create profile (pending: “Creating profile…”)
- Link: Sign in → /login

Do not ask for an hourly rate. When salary is present, the derived rate is:

(Monthly basic salary × 12) / 261 / 8

Factor 365 may be mentioned as monthly-paid context. It is never a selectable or computed divisor.

### / — Overview

Specified. Currently an empty state.

Eyebrow: YOUR HISTORY
Title: Overview
Subtitle: “Your current payroll period, three headline figures, and your most recent shifts.”
Empty now: “No shifts recorded yet.” Action: Add shift.

Intended content:
- Payroll-period banner on deep purple. Example shape: October 1–15. If no period is configured, say so. Do not invent the dates.
- Three metric cards:
  - Total ND hours (mono, two decimals, “hrs”)
  - Estimated ND (PHP, two decimals, labeled estimate)
  - Total entries (count)
- Recent-shift ledger
- Estimate disclaimer
- States: period configured or not, loading, recent shifts or empty ledger, estimate or missing salary

### /shift/new — Add a shift

Built. Desktop: form left, calculation preview right. Stacks on smaller screens.

Eyebrow: ADD A SHIFT
Title: Calculate this shift
Subtitle: “Your night hours, accounted for.”
If settings fail to load: “Could not load your calculation settings. Try again.”

Fields, in order:
- Work date
- Shift start and shift end, side by side
- Day classification (employee chooses; the app does not infer rest day from weekday):
  - Regular Work Day
  - Rest Day
  - Special Public Holiday
  - Special Public Holiday + Rest Day
  - Regular/Public Holiday
  - Regular/Public Holiday + Rest Day
  - Double Regular Holiday
  - Double Regular Holiday + Rest Day
- Break included in night differential: No or Yes. Helper shows the default unpaid break (1 hour). Do not ask for break start or break end.
- Schedule type: Standard, or Approved compressed workweek
- Scheduled regular hours. Default 8.00. A different value is valid only for an approved compressed workweek, and only from 8 through 12 inclusive.
- Overtime agreed or approved: No or Yes. This is the employee’s personal record. The app does not approve overtime.
- Note: “This does not submit anything to payroll.”
- Buttons: Calculate shift, Save entry, Cancel (back to Overview)

Before calculate, the right panel says: “Calculate this shift to see night hours and wage lines.”
Changing any field clears the preview.

Preview trace, after Calculate:
- Night-window timeline. Default window 10:00 PM–6:00 AM. Purple = qualifying night differential. Lighter lavender = potential overlap. Amber hatch = excluded break. Legend repeats this in words.
- Shift clock span
- Day classification
- Elapsed hours
- Worked hours after the unpaid break
- Scheduled regular hours
- Regular hours
- Potential overtime
- Approved overtime and unapproved extra hours
- Overtime recorded as approved: Yes or No
- Potential ND
- Break hours
- Break included: Yes or No
- Final ND hours
- Wage-type table: Code, Category, Hours, Rate, Amount
- Amount is a PHP estimate only for code 2211. Every other line, including 2252, shows TBD.
- If no rule matches: “No configured ND wage type rule matches this shift.”
- If regular versus overtime allocation is unresolved, show TBD. Do not pick 2252 just because the shift ran long.

Save states: pending, saved privately, inline error.
The saved record keeps the inputs and outputs from save time. Later salary or rule changes do not rewrite it.

Worked example the product is built around. 9:00 PM–6:00 AM, regular work day, 1-hour unpaid break, standard 8-hour schedule:
- Elapsed 9.00
- Worked 8.00
- Potential overtime 0.00
- Potential ND 8.00 (10:00 PM–6:00 AM)
- Break excluded: final ND 7.00
- Break included: final ND 8.00
- The unpaid break always reduces worked hours. “Break included” changes only the night-differential overlap.

### /records — My records

Specified. Currently empty.

Eyebrow: PAYROLL RECORDS
Title: My records
Subtitle: “Every saved shift for the selected payroll period, week, or custom range.”
Empty now: “You haven't saved any shifts yet.” Action: Add shift.

Intended:
- Filters: This week, This payroll period, This month, Custom range
- Payroll-period subheading, or a missing-period notice
- Ledger columns: Date, Shift, Day type, ND hours, Wage types, Amount
- Pending codes stay labeled TBD
- Horizontal scroll on small screens
- Row opens /records/:id

### /records/:id — Record detail

Specified. Currently empty.

Eyebrow: CALCULATION TRACE
Title: Record detail
Subtitle: “The saved calculation snapshot for this shift, including the window, overlap, and wage code.”
Empty now: “This record isn't available yet.” Action: Back to records.

Intended: wide trace panel plus an estimate and wage-type aside. One column on mobile.
Shows the stored snapshot, not a fresh calculation.
States: saved snapshot, cross-date confirmation or pending, configured wage lines, unresolved candidates, missing record.

Detail trace:
- Work date
- Shift start–end
- Day classification
- Elapsed, worked after unpaid break, scheduled regular hours
- Potential overtime, and whether overtime was recorded as approved
- Potential ND, default break, break included, final ND
- Applicable wage types, one block per line: code, description, hours category, percentage, amount or TBD

### /calendar — Calendar

Specified. Currently empty.

Eyebrow: DATES & PERIODS
Title: Calendar
Subtitle: “Holiday references and payroll periods you've entered. Dates are never fabricated.”
Empty now: “No holiday references or payroll periods yet.” Action: Go to settings.

Intended: two peer panels.
- Holiday references: regular holidays and special non-working holidays. List, empty state, add form.
- Payroll periods: period start, period end, pay date, cutoff date, cutoff time. List, empty state, add form.
Warning stays visible: the app does not invent dates. Saturday and Sunday are not rest days.

### /settings — Settings

Partly specified. Sign out works. Profile save is not connected.

Eyebrow: ACCOUNT SETUP
Title: Settings
Subtitle: “Your profile, computation preferences, and the read-only ADP wage reference.”
Action: Sign out
Empty now: “Profile and computation settings aren't connected yet.” Disabled button: Save profile.

Intended, two columns then a full-width catalog. One column when narrow.

My profile:
- Name
- Employee ID
- Monthly basic salary, optional
- Derived computational hourly rate, read-only: (monthly basic salary × 12) / 261 / 8
- Approved compressed workweek: No by default
- Scheduled regular hours: 8 unless compressed workweek is on
- Save profile

Computation:
- ND start, default 10:00 PM
- ND end, default 6:00 AM
- Default unpaid break: 1 hour
- Save computation
- If the first-eight basis is unset, show a warning. Do not guess a formula.

Then a read-only ADP reference catalog. TBD formulas stay TBD. No admin configuration panel.

---

## Calculation rules that are confirmed

- Night window default: 10:00 PM to 6:00 AM the next day.
- Unpaid break default: 1 hour.
- Worked hours = max(0, elapsed hours − unpaid break).
- Break included in ND changes only the overlap. It never adds the break back to worked hours and never changes the overtime threshold.
- Standard scheduled regular hours: exactly 8.
- Approved compressed workweek: 8 through 12 hours inclusive, never more than 12.
- Potential overtime = max(0, worked hours − scheduled regular hours).
- That overtime counts as approved only when the employee records that it was agreed or approved.
- Regular hours = min(worked hours, scheduled regular hours).
- Computational daily rate = (monthly basic salary × 12) / 261.
- Computational hourly rate = that daily rate / 8.
- Code 2211 estimate = hourly rate × qualifying hours × 10 percent. Round the final estimate to integer centavos. Keep precision until that last step.
- One calculation can return more than one wage line.
- A missing rule uses this exact reason: “No configured ND wage type rule matches this shift.”
- Estimated lines need real hours. A TBD line may have null hours when allocation is unresolved.
- Saved detail reads the snapshot. It does not recalculate against today’s salary or rules.

## Rules that must stay TBD

1. The money formula for every code other than ordinary-day 2211 at 10 percent. The ADP column is “TOTAL % to be added”. Do not treat every percentage as hourly rate × hours × percent.
2. A shift that crosses from one holiday or day classification into the next calendar date.
3. How qualifying night-differential hours split between regular time and approved overtime, including when code 2252 applies. Do not choose 2252 from shift length alone.
4. Any wage-type code that is not in the seeded night-differential table.

---

## Seeded night-differential wage types

These rows are configuration. Only 2211 has a confirmed amount. The percentage is the source “total % to be added”, not a license to invent the other formulas.

| Code | Category | Hours | % | Description |
| --- | --- | --- | --- | --- |
| 2211 | Regular work day | First 8 | 10 | Ordinary day, night shift, first 8 hours |
| 2252 | Regular work day | Excess | 138 | Ordinary day, night shift, excess of the first 8 hours |
| 2411 | Rest day | First 8 | 143 | Rest day, first 8 hours |
| 2411 | Special public holiday | First 8 | 143 | Special public holiday, first 8 hours |
| 2418 | Special public holiday | First 8 | 43 | Special public holiday, first 8 hours |
| 2511 | Special public holiday | Excess | 186 | Special public holiday, excess of the first 8 hours |
| 2412 | Special public holiday + rest day | First 8 | 165 | Special public holiday and rest day, first 8 hours |
| 2512 | Special public holiday + rest day | Excess | 215 | Special public holiday and rest day, excess |
| 2413 | Regular/public holiday | First 8 | 120 | Regular or public holiday, first 8 hours |
| 2513 | Regular/public holiday | Excess | 286 | Regular or public holiday, excess |
| 2414 | Regular/public holiday + rest day | First 8 | 286 | Regular or public holiday and rest day, first 8 hours |
| 2514 | Regular/public holiday + rest day | Excess | 372 | Regular or public holiday and rest day, excess |
| 2415 | Double regular holiday | First 8 | 230 | Double regular holiday, first 8 hours |
| 2515 | Double regular holiday | Excess | 429 | Double regular holiday, excess |
| 2416 | Double regular holiday + rest day | First 8 | 429 | Double regular holiday and rest day, first 8 hours |
| 2516 | Double regular holiday + rest day | Excess | 558 | Double regular holiday and rest day, excess |

Non-night-differential codes exist in the source tables as reference only (examples: 2251, 2301, 2215, 2235, 2170, 2226, 2240, 2246, 2425, 2535, 2420, 2520, 2430, 2233). Version 1 focuses on the night-differential table. Do not invent further codes.

---

## Data the employee owns

One employee sees only their own rows.

employees — id (same as the auth user), name, employee id, optional monthly basic salary, scheduled regular hours, work schedule type (standard or approved compressed workweek). No fixed rest day. No entered hourly rate.

shifts — work date, start, end, day classification, break included in ND, schedule type, scheduled regular hours, overtime agreed or approved. No break start or end.

nd_records — immutable calculation snapshot: version, elapsed, worked, regular, potential and approved overtime, unapproved extra hours, potential ND, break, break-in-ND flag, final ND hours, and the salary basis used (12 months, factor 261, 8 rate hours, derived daily and hourly rates). Rate fields are all empty when salary was not provided.

nd_wage_type_lines — one row per applicable code: code, category, hours category, applicable hours, percentage, amount status (estimated or tbd), centavos or null, unresolved reason.

wage_types — shared read-only catalog for signed-in employees.

holidays — employee-owned date, name, type, year. Not pre-seeded.

payroll_periods — employee-owned start, end, pay date, cutoff date, cutoff time. Not pre-seeded.

---

## What a designer or builder should not add

- Manager or admin accounts, approval queues, or employer submission.
- A public marketing homepage, chart dashboard, avatars, or employer badges.
- Dark mode, gradients, or a second brand color.
- Hourly-rate entry, factor 365 as a divisor, or break start and end times.
- Automatic Saturday or Sunday rest days.
- A currency amount for any code except 2211.
- Invented holiday dates or payroll cutoffs.
- Nested cards, icon tiles above headings, or Framer Motion.
