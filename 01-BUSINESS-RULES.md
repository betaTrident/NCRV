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
-   If the employee's manager has allowed the break to be included in
    ND, the result can be approximately **8 ND hours**.

The application must follow this clarified rule rather than blindly
reproducing the earlier example in the PDF.

## 3. Break Rule

The application uses a default:

**Unpaid break = 1 hour**

The employee does **not** enter break start and break end times.

The only employee input is:

> **Was the break included in ND?**

Options:

-   `No` --- subtract the default 1-hour break from the qualifying ND
    period.
-   `Yes` --- count the default 1-hour break toward ND.

The `Yes` option represents the employee recording that the break was
allowed to be included by their manager. There is no manager account or
approval workflow in this application.

## 4. Rotational Work Schedules

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

## 5. Day Classification

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

## 6. Overnight Shifts

A shift may cross midnight.

Example:

`October 1, 9:00 PM → October 2, 6:00 AM`

The system must store the actual start and end timestamps correctly.

Holiday/day classification behavior for a shift that crosses from one
calendar date into another must be explicitly defined by the final
payroll rule. The system must not silently invent a rule.

## 7. ND Hours vs Wage Type

These are separate concepts.

**ND Hours** answer:

> How much qualifying time falls inside the ND window after the break
> rule?

**Wage Type Code(s)** answer:

> Which ADP wage type rule(s) apply to the resulting case?

A single shift/calculation may have **multiple applicable wage type
lines**.

## 8. Monetary Calculation

For the ordinary night-shift case, the source states a 10% ND
differential.

The exact monetary formula for every holiday/rest-day wage type must
follow the ADP/payroll rule represented by the configured wage type. The
ADP table describes its values as "TOTAL % to be added"; do not assume
every percentage is simply `hourly_rate × hours × percentage`.

## 9. Payroll Periods

The application should group records by payroll period and display the
applicable cutoff information from the supplied company calendar/process
documentation.

The system is a tracking tool; it does not submit payroll to the
employer.

## 10. Source Conflict / Clarification

The supplied material contains an example that can be read as treating a
9:00 PM--6:00 AM shift as 8 ND hours. The user's clarified rule
establishes the intended behavior:

-   7 ND hours when the 1-hour break is excluded.
-   8 ND hours when the break is included.

The clarified rule is the authoritative application behavior.

## 11. Rules That Must Remain Configurable

Do not hard-code assumptions that may change.

At minimum:

-   Default break duration
-   ND start time
-   ND end time
-   Wage type mappings
-   Holiday calendar
-   Payroll periods/cutoffs
-   Per-shift day classification
