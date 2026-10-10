# Implementation Plan

## Goal

Build the smallest useful version first.

The application should be developed in the following order.

## Phase 1 --- Calculation Engine

Build and test the calculation engine before building the full UI.

Implement:

1.  Overnight shift normalization
2.  10 PM--6 AM ND window
3.  Elapsed hours minus the default 1-hour unpaid break equals worked hours
4.  Break included/excluded in ND as a separate option
5.  Standard 8-hour schedule and approved-CWW schedule threshold
6.  Potential overtime and employee-recorded approved overtime
7.  Monthly-salary rate derivation with factor 261
8.  Per-shift day classification
9.  Holiday lookup
10. Wage type rule lookup without guessing the ND regular/overtime split
11. Multiple wage type results
12. Confirmed 2211 amount calculation; other amounts remain TBD

## Phase 2 --- Database

Create:

``` text
employees
shifts
nd_records
nd_wage_type_lines
wage_types
holidays
payroll_periods
```

Seed:

-   ADP wage type data from the supplied PDF
-   2026 holiday calendar from the supplied PDF
-   Payroll-period data where the source provides it

## Phase 3 --- Employee UI

Build:

1.  Login
2.  Dashboard
3.  Add Shift
4.  Calculation Result
5.  My Records
6.  Record Details
7.  Calendar
8.  Settings

## Phase 4 --- Testing

Before using the system for real tracking, test:

### Test A --- Standard 9 PM--6 AM

``` text
Shift: 9 PM–6 AM
Break included: No

Expected:
Elapsed = 9
Worked = 8
Potential OT = 0
Potential ND = 8
Final ND = 7
```

### Test B --- Break Included

``` text
Shift: 9 PM–6 AM
Break included: Yes

Expected:
Potential ND = 8
Final ND = 8
```

### Test C --- 11 PM--7 AM

``` text
ND window overlap:
11 PM–6 AM

Expected potential ND:
7 hours
```

Apply the break rule according to the selected option.

### Test D --- 10-Hour Elapsed Shift

``` text
Shift duration: 10 hours
Unpaid break: 1 hour
Scheduled regular hours: 8
Overtime recorded as approved: Yes

Expected:
Worked = 9
Potential OT = 1
Approved OT = 1
```

With approval recorded as No, potential OT remains 1 and approved OT is
0. Do not infer an ND regular/overtime split or code 2252.

### Test E --- Approved Compressed Workweek

``` text
Shift duration: 11 hours
Unpaid break: 1 hour
Scheduled regular hours: 10

Expected:
Worked = 10
Potential OT = 0
```

### Test F --- Daytime Shift

``` text
1 PM–10 PM

Expected:
No ND hours before 10 PM.
```

### Test G --- Weekend Rotational Work

``` text
Saturday
Day Classification: Regular Work Day
```

The system must not automatically mark Saturday as a rest day.

### Test H --- Saturday Rest Day

``` text
Saturday
Day Classification: Rest Day
```

The system must allow this classification even though another employee
may have Saturday as a regular work day.

### Test I --- Holiday

Select a date from the supplied holiday calendar and verify that the
correct holiday classification can be used.

### Test J --- Multiple Wage Types

Use a case where the configured rules produce more than one applicable
wage type.

Verify that the result contains multiple `nd_wage_type_lines`.

## Phase 5 --- Polish

After calculations are verified:

-   Improve mobile responsiveness
-   Add search/filtering
-   Add payroll-period summaries
-   Add CSV/Excel export if needed
-   Add backup/export functionality
-   Add edit/delete controls for personal records

## Important Development Rule

Do not add features simply because they are common in payroll systems.

This application is intentionally small.

The guiding question should be:

> Does this help an employee calculate, understand, or track their Night
> Differential?

If not, it should probably stay out of version 1.

## Outstanding Clarifications

The following should remain explicit rather than guessed:

1.  Exact monetary formula for every ADP percentage/category.
2.  Exact treatment when an overnight shift crosses from one holiday/day
    classification into another.
3.  Exact allocation of ND overlap between regular and approved-overtime
    portions, including when code 2252 applies.
4.  Any additional wage-type codes not present in the supplied ADP
    table.

Until confirmed, the system should mark these as configurable/TBD rather
than inventing payroll behavior.
