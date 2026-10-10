# Business Rules

## 1. Night Differential Window

Night Differential applies to work performed between:

**10:00 PM and 6:00 AM of the following day.**

The company material states that night shift differential is equivalent
to **10% of the employee's regular wage for each hour of work performed
between 10:00 PM and 6:00 AM**.

## 2. The 9:00 PM--6:00 AM Example

For a 9:00 PM--6:00 AM shift:

-   The ND window is 10:00 PM--6:00 AM.
-   The potential ND period is 8 hours.
-   The standard 1-hour unpaid break is excluded by default.
-   Therefore the normal result is approximately **7 ND hours**.
-   If the employee records that the break is included in ND, the
    result can be approximately **8 ND hours**.

The application must follow this clarified rule rather than blindly
reproducing the earlier example in the PDF.

## 3. Break Rule

The application uses a default:

**Unpaid break = 1 hour**

The employee does **not** enter break start and break end times.

The unpaid break always reduces elapsed shift duration when calculating
worked hours:

``` text
worked hours = max(0, elapsed shift hours - 1 hour)
```

For example, 9 elapsed hours with the 1-hour unpaid break is 8 worked
hours. A 10-hour elapsed shift is 9 worked hours.

This worked-hours rule is separate from the employee input:

> **Was the break included in ND?**

Options:

-   `No` --- subtract the default 1-hour break from the qualifying ND
    period.
-   `Yes` --- count the default 1-hour break toward ND.

`break_included_in_nd` changes only the ND overlap. It never adds the
unpaid break back to worked hours and never changes the overtime
threshold. There is no manager account or approval workflow in this
application.

## 4. Monthly Salary and Computational Hourly Rate

The employee's monthly basic salary is the source value. NCR Voyix uses
factor **261** for the computational daily and hourly rates used by this
application:

``` text
computational daily rate = (monthly basic salary x 12) / 261
computational hourly rate = computational daily rate / 8
```

The general factor 365 is context for monthly-paid employment only. It
must never be used as an engine divisor for the rate used in ND,
overtime, absence, or tardiness estimates.

Employees remain monthly paid. The derived rate does not prorate their
monthly basic salary according to the number of working days in a
particular month.

## 5. Regular Hours and Approved Overtime

The standard regular schedule threshold is **8 worked hours**. For an
approved compressed workweek, the configured `scheduled_regular_hours`
is the threshold; for example, an approved 10-hour schedule can have 10
regular worked hours.

Under an approved CWW, daily working hours may exceed 8 but must not
exceed 12. NCR Voyix's normal context remains 40 hours per week (8 hours
across 5 days); an approved CWW can distribute those 40 hours across
fewer days, such as 10 hours across 4 days. This schedule constraint
does not establish any wage-code or ND regular/overtime allocation.

``` text
potential overtime hours =
    max(0, worked hours - scheduled regular hours)
```

Potential overtime is not automatically approved or payable. It is
treated as approved overtime only when the employee records that the
extra work was agreed or approved. This is a personal record, not an
employer approval action.

Examples under the standard 8-hour schedule:

-   9 elapsed hours - 1 unpaid hour = 8 worked hours and no potential
    overtime.
-   10 elapsed hours - 1 unpaid hour = 9 worked hours and 1 potential
    overtime hour. That hour is approved overtime only when the employee
    records it as agreed or approved.

## 6. Rotational Work Schedules

The application must **not** assign a permanent Saturday or Sunday rest
day to an employee.

Employees may work weekends or have different rest days because
schedules are rotational.

Therefore:

-   Rest-day status is determined **per shift/date**.
-   Saturday is not automatically a rest day.
-   Sunday is not automatically a rest day.
-   The employee can select the applicable day classification for the
    shift.

## 7. Day Classification

The shift record should support classifications such as:

-   Regular Work Day
-   Rest Day
-   Special Public Holiday
-   Special Public Holiday + Rest Day
-   Regular/Public Holiday
-   Regular/Public Holiday + Rest Day
-   Double Regular Holiday
-   Double Regular Holiday + Rest Day

Holiday dates can be preloaded from the supplied calendar.

## 8. Overnight Shifts

A shift may cross midnight.

Example:

`October 1, 9:00 PM → October 2, 6:00 AM`

The system must store the actual start and end timestamps correctly.

Holiday/day classification behavior for a shift that crosses from one
calendar date into another must be explicitly defined by the final
payroll rule. The system must not silently invent a rule.

## 9. ND Hours vs Wage Type

These are separate concepts.

**ND Hours** answer:

> How much qualifying time falls inside the ND window after the break
> rule?

**Wage Type Code(s)** answer:

> Which ADP wage type rule(s) apply to the resulting case?

A single shift/calculation may have **multiple applicable wage type
lines**.

## 10. Monetary Calculation

For the ordinary night-shift case, the source states a 10% ND
differential.

The exact monetary formula for every holiday/rest-day wage type must
follow the ADP/payroll rule represented by the configured wage type. The
ADP table describes its values as "TOTAL % to be added"; do not assume
every percentage is simply `hourly_rate × hours × percentage`.

Only ordinary-day 10% ND (code 2211) has a confirmed money formula.
Code 2252 and every non-2211 money formula remain TBD. How ND hours are
allocated between regular and approved-overtime portions also remains
TBD; the engine must not infer that allocation from elapsed time alone.

## 11. Payroll Periods

The application should group records by payroll period and display the
applicable cutoff information from the supplied company calendar/process
documentation.

The system is a tracking tool; it does not submit payroll to the
employer.

## 12. Source Conflict / Clarification

The supplied material contains an example that can be read as treating a
9:00 PM--6:00 AM shift as 8 ND hours. The user's clarified rule
establishes the intended behavior:

-   7 ND hours when the 1-hour break is excluded.
-   8 ND hours when the break is included.

The clarified rule is the authoritative application behavior.

## 13. Rules That Must Remain Configurable

Do not hard-code assumptions that may change.

At minimum:

-   Default break duration
-   Monthly basic salary
-   Rate factor (261 for the confirmed current rule)
-   Scheduled regular hours (8 unless an approved CWW is configured)
-   ND start time
-   ND end time
-   Wage type mappings
-   Holiday calendar
-   Payroll periods/cutoffs
-   Per-shift day classification
