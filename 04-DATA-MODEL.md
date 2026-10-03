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
hourly_rate
created_at
updated_at
```

Do **not** store a fixed regular rest day.

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

created_at
updated_at
```

No:

``` text
break_start
break_end
```

The break is a configured default duration.

------------------------------------------------------------------------

## 3. nd_records

``` text
id
shift_id

potential_nd_hours
break_duration
break_included_in_nd
nd_hours

created_at
updated_at
```

`nd_records` represents the result of calculating a shift.

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
calculated_amount

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
