# Data Model

## Design Principle

Keep the database small.

This is an employee-only tracking application, not a company payroll
platform.

## Tables

The initial version can use six core tables:

1.  `employees`
2.  `shifts`
3.  `nd_records`
4.  `nd_wage_type_lines`
5.  `wage_types`
6.  `holidays`

A `payroll_periods` table can be added if payroll-period summaries are
needed.

------------------------------------------------------------------------

## 1. employees

``` text
id
name
employee_id
monthly_basic_salary (optional)
scheduled_regular_hours (default 8)
work_schedule_type (STANDARD or APPROVED_CWW)
created_at
updated_at
```

Do **not** store a fixed regular rest day.

`hourly_rate` is not an employee-entered source field. The engine
derives its computational rate from `monthly_basic_salary` with factor
261 and 8 regular hours per day. Factor 365 is never an engine divisor.
`scheduled_regular_hours` may differ from 8 only when the employee is
recording an approved compressed-workweek arrangement. Standard
schedules require exactly 8 hours. Approved CWW schedules allow 8
through 12 hours inclusive and never more than 12. NCR Voyix's normal
context is 40 hours per week; this constraint does not create a wage-code
mapping.

------------------------------------------------------------------------

## 2. shifts

``` text
id
employee_id
work_date

shift_start
shift_end

day_classification

break_included_in_nd
work_schedule_type
scheduled_regular_hours
overtime_approved

created_at
updated_at
```

No:

``` text
break_start
break_end
```

The break is a configured default duration.

`overtime_approved` records the employee's statement that extra work
was agreed or approved. It does not represent an approval by this app,
and there is no manager workflow.

------------------------------------------------------------------------

## 3. nd_records

``` text
id
shift_id
calculation_version

potential_nd_hours
break_duration
break_included_in_nd
nd_hours

elapsed_hours
worked_hours
regular_hours
work_schedule_type
scheduled_regular_hours
potential_overtime_hours
overtime_approved
approved_overtime_hours
unapproved_extra_hours

monthly_basic_salary
annual_months
workdays_factor
rate_hours_per_day
derived_daily_rate
derived_hourly_rate

created_at
updated_at
```

`nd_records` represents the result of calculating a shift.

These values are a calculation snapshot. The unpaid break always
reduces `elapsed_hours` to `worked_hours`; `break_included_in_nd` only
changes the ND overlap. Salary, factor, and derived rates are saved so a
later profile change cannot rewrite an existing estimate.

`calculation_version` is nullable only for legacy rows and defaults to
`2` for new records. Current complete snapshots use version `2`.
Snapshot groups are all-or-none:

-   A legacy row has a null version and every added schedule, duty-hour,
    approval, and rate-basis snapshot column is null.
-   A version 2 row has the complete schedule and duty-hour group,
    including `work_schedule_type`, scheduled, elapsed, worked, regular,
    potential overtime, approved overtime, unapproved extra hours, and
    the recorded overtime approval state.
-   Within a version 2 row, the rate-basis group is either entirely null
    when monthly salary was not provided, or entirely populated with
    monthly salary, 12 annual months, factor 261, 8 rate hours per day,
    and both derived rates.

The same schedule constraint applies to snapshots: `STANDARD` requires
8 hours; `APPROVED_CWW` permits 8 through 12 hours inclusive.

Current snapshots also enforce the duty-hour identities:

``` text
worked_hours = max(elapsed_hours - break_duration, 0)
regular_hours = min(worked_hours, scheduled_regular_hours)
```

------------------------------------------------------------------------

## 4. nd_wage_type_lines

``` text
id
nd_record_id

wage_type_id
wage_type_code

category
hours_category

applicable_hours
percentage
amount_status
calculated_amount
unresolved_reason

created_at
```

A single `nd_record` can have many wage type lines.

Example:

``` text
ND Record #1001
  ├── 2211
  ├── 2252
  └── another applicable code
```

Only actual applicable rules should be stored.

`applicable_hours` may be null only for a `tbd` line whose hours cannot
be allocated under the confirmed rules. Every `estimated` line requires
non-null, non-negative applicable hours. A nullable TBD value must not
be replaced with guessed hours.

------------------------------------------------------------------------

## 5. wage_types

``` text
id
code
category
hours_category
percentage
is_nd
description
active
effective_from
effective_until
```

This table contains the ADP configuration.

------------------------------------------------------------------------

## 6. holidays

``` text
id
date
name
holiday_type
year
active
```

The 2026 company holiday calendar can be seeded from the supplied PDF.

------------------------------------------------------------------------

## 7. payroll_periods (Optional but Recommended)

``` text
id
period_start
period_end
pay_date
cutoff_date
cutoff_time
active
```

This supports the tracking of ND records by payroll period.

------------------------------------------------------------------------

# Relationships

``` text
employees
    │
    └──< shifts
            │
            └──< nd_records
                    │
                    └──< nd_wage_type_lines
                              │
                              └── wage_types

holidays
    │
    └── used by shift/day classification logic

payroll_periods
    │
    └── groups shifts/ND records
```

## Why Wage Types Are Separate

Do not put only one `wage_type_code` column in `nd_records`.

The requirement is:

> Multiple codes may be applicable depending on the case.

Therefore:

``` text
nd_records 1 → many nd_wage_type_lines
```

is the correct structure.

## Why Rest Day Is Not in employees

Rotational schedules mean that rest-day status can change by date.

Therefore:

``` text
employees.rest_day
```

should not exist in the initial model.

Instead:

``` text
shifts.day_classification
```

stores the classification for the specific shift.
