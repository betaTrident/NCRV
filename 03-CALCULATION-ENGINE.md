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
employee_hourly_rate
```

The break duration is configured by the system and defaults to:

``` text
1 hour
```

## Step 1 --- Normalize the Shift

If the end time is earlier than or equal to the start time, treat the
end as occurring on the following calendar day.

Example:

``` text
Start: October 1, 9:00 PM
End:   October 2, 6:00 AM
```

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

## Step 6 --- Determine Hours Category

The wage type table distinguishes:

-   First 8 hours
-   Excess of the first 8 hours

The final implementation must define exactly how the 8-hour threshold is
applied to the applicable payroll case. Do not assume a rule where the
source does not specify one.

## Step 7 --- Find Applicable Wage Types

Query the wage type configuration using:

``` text
day_classification
hours_category
is_nd = true
```

Return **all applicable matching wage type rules**, not only the first
match.

## Step 8 --- Calculate Amount

The ordinary ND rule states 10% of regular wage for each qualifying
hour.

For other wage type categories, use the configured payroll formula
associated with the wage type. Do not automatically treat every "TOTAL %
to be added" value as a standalone ND percentage.

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
        determineApplicableHoursCategories(...)

    wage_type_lines =
        findAllWageTypes(
            day_category,
            hours_categories,
            is_nd = true
        )

    amounts =
        calculateConfiguredAmounts(
            input.hourly_rate,
            nd_hours,
            wage_type_lines
        )

    return {
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
