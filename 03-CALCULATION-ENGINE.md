# Calculation Engine

## Goal

The calculation engine is the most important technical component of the
application.

The UI should remain simple while the calculation engine handles the
detailed logic.

## Inputs

A shift calculation requires:

``` text
work_date
shift_start
shift_end
day_classification
break_included_in_nd
monthly_basic_salary
scheduled_regular_hours
overtime_approved
```

The break duration is configured by the system and defaults to:

``` text
1 hour
```

`scheduled_regular_hours` defaults to 8. It may differ only for an
approved compressed-workweek schedule, where it must be between 8 and
12 hours inclusive. NCR Voyix's standard context is 40 hours per week;
for example, an approved CWW may configure 10 hours across 4 days.
`overtime_approved` is the
employee's record that extra work was agreed or approved; it is not an
approval performed by this application.

## Step 1 --- Normalize the Shift

If the end time is earlier than or equal to the start time, treat the
end as occurring on the following calendar day.

Example:

``` text
Start: October 1, 9:00 PM
End:   October 2, 6:00 AM
```

Calculate elapsed and worked hours before overtime:

``` text
elapsed_hours = duration(shift interval)
worked_hours = max(0, elapsed_hours - 1 hour unpaid break)
potential_overtime_hours =
    max(0, worked_hours - scheduled_regular_hours)
approved_overtime_hours =
    overtime_approved ? potential_overtime_hours : 0
```

The unpaid break always reduces worked hours. A 9-hour elapsed shift is
8 worked hours; a 10-hour elapsed shift is 9 worked hours.

## Step 2 --- Build the ND Window

For the shift's applicable date, construct:

``` text
ND Start = 10:00 PM
ND End   = 6:00 AM next day
```

## Step 3 --- Find the ND Overlap

Calculate the intersection:

``` text
shift interval ∩ ND interval
```

The resulting duration is the potential ND duration.

## Step 4 --- Apply the Break Rule

### Break excluded

``` text
ND Hours =
Potential ND Hours - 1 hour
```

The subtraction must not make ND hours negative.

### Break included

``` text
ND Hours =
Potential ND Hours
```

The employee only selects whether the break was included. No break
timestamps are entered.

This option changes only ND overlap. It does not change `worked_hours`,
`potential_overtime_hours`, or the schedule threshold.

## Step 5 --- Determine Day Classification

Use the employee's per-shift classification and holiday calendar.

Do not infer rest day from Saturday/Sunday.

Possible classifications include:

``` text
REGULAR_WORK_DAY
REST_DAY
SPECIAL_PUBLIC_HOLIDAY
SPECIAL_PUBLIC_HOLIDAY_REST_DAY
REGULAR_PUBLIC_HOLIDAY
REGULAR_PUBLIC_HOLIDAY_REST_DAY
DOUBLE_REGULAR_HOLIDAY
DOUBLE_REGULAR_HOLIDAY_REST_DAY
```

## Step 6 --- Determine Schedule and Overtime

Use 8 worked hours as the standard threshold. For an approved CWW, use
the employee's configured `scheduled_regular_hours` instead. Reject an
approved-CWW value below 8 or above 12. The schedule validation does not
invent a wage-code mapping or resolve the ND regular/overtime split.

Potential overtime is the worked time above that threshold. Count it as
approved overtime only when `overtime_approved` is true. Do not create a
manager or admin approval workflow.

## Step 7 --- Determine Hours Category

The wage type table distinguishes:

-   First 8 hours
-   Excess of the first 8 hours

The schedule threshold determines potential overtime, but it does not
by itself determine which ND minutes belong to regular versus overtime
wage-type lines. That ND allocation remains TBD. In particular, do not
select code 2252 merely because worked hours exceeded eight.

## Step 8 --- Find Applicable Wage Types

Query the wage type configuration using:

``` text
day_classification
hours_category
is_nd = true
```

Return **all applicable matching wage type rules**, not only the first
match.

## Step 9 --- Calculate Amount

The ordinary ND rule states 10% of regular wage for each qualifying
hour.

Derive the computational rate from monthly basic salary:

``` text
daily_rate = (monthly_basic_salary x 12) / 261
hourly_rate = daily_rate / 8
ordinary_nd_amount = hourly_rate x qualifying_nd_hours x 10 percent
```

Factor 365 is monthly-paid employment context only and must never be an
engine divisor. Do not round the daily rate before deriving the hourly
rate; preserve decimal precision and round only the final monetary
estimate to centavos.

For other wage type categories, use the configured payroll formula
associated with the wage type. Do not automatically treat every "TOTAL %
to be added" value as a standalone ND percentage.

Code 2252 and every non-2211 monetary formula remain TBD.

## Example

Input:

``` text
Date: October 1
Shift: 9:00 PM–6:00 AM
Day: Regular Work Day
Break included: No
Break duration: 1 hour
```

Result:

``` text
Elapsed:       9 hours
Worked:        8 hours
Potential OT:  0 hours
Potential ND: 8 hours
Break:         1 hour
Final ND:      7 hours
```

For the ordinary-day first-8-hours ND rule, the configured wage type is:

``` text
2211
```

with the supplied 10% value.

## Example With Break Included

``` text
Potential ND: 8 hours
Break:         1 hour
Break included: Yes
Final ND:      8 hours
```

## Pseudocode

``` text
function calculateND(input):

    shift = normalizeOvernightShift(
        input.shift_start,
        input.shift_end
    )

    elapsed_hours = duration(shift)
    worked_hours = max(
        0,
        elapsed_hours - default_break_duration
    )
    potential_overtime_hours = max(
        0,
        worked_hours - input.scheduled_regular_hours
    )
    approved_overtime_hours =
        input.overtime_approved
            ? potential_overtime_hours
            : 0

    nd_window = buildNDWindow(
        input.work_date,
        22:00,
        06:00
    )

    potential_nd_hours =
        duration(intersection(shift, nd_window))

    if input.break_included_in_nd:
        nd_hours = potential_nd_hours
    else:
        nd_hours = max(
            0,
            potential_nd_hours - default_break_duration
        )

    day_category =
        input.day_classification

    hours_categories =
        determineApplicableHoursCategoriesOrTbd(...)

    wage_type_lines =
        findAllWageTypes(
            day_category,
            hours_categories,
            is_nd = true
        )

    amounts =
        calculateConfiguredAmounts(
            deriveHourlyRate(
                input.monthly_basic_salary,
                annual_months = 12,
                workdays_factor = 261,
                rate_hours_per_day = 8
            ),
            nd_hours,
            wage_type_lines
        )

    return {
        elapsed_hours,
        worked_hours,
        potential_overtime_hours,
        approved_overtime_hours,
        nd_hours,
        day_category,
        wage_type_lines,
        amounts
    }
```

## Calculation Transparency

Every saved result should preserve enough information to explain the
calculation later:

``` text
Monthly basic salary
Annual rate factor (261)
Derived daily rate
Derived hourly rate
Elapsed hours
Worked hours after unpaid break
Scheduled regular hours
Potential overtime hours
Overtime recorded as approved
Approved overtime hours
ND window
Potential ND hours
Break duration
Break included
Final ND hours
Day classification
Applicable wage type lines
Configured percentage
Calculated amount
```

The saved rate inputs are snapshots. Later salary or schedule changes
must not rewrite the explanation for an existing record.
