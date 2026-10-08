# User Interface

## Design Goal

The UI should be simple enough that an employee can enter a shift in
seconds.

There are no manager or admin accounts.

Signup and profile settings accept an optional **Monthly basic salary**.
Do not ask the employee to enter an hourly rate. When salary is present,
show the derived computational rate and its basis:

``` text
(Monthly basic salary x 12) / 261 / 8
```

## Main Navigation

Keep navigation minimal:

``` text
Dashboard
Add Shift
My Records
Calendar
Settings
```

------------------------------------------------------------------------

# 1. Login

``` text
NIGHT DIFF TRACKER

Employee ID / Email
[________________]

Password
[________________]

[ LOGIN ]
```

------------------------------------------------------------------------

# 2. Dashboard

Display:

``` text
Current Payroll Period
October 1–15

Total ND Hours
32.00 hrs

Estimated ND
₱XXX.XX

Total Entries
5

[ + ADD SHIFT ]
```

Also show recent entries.

------------------------------------------------------------------------

# 3. Add Shift

The form should contain only information the employee actually needs to
provide.

``` text
ADD SHIFT

Work Date
[ October 1, 2026 ]

Shift Start
[ 9:00 PM ]

Shift End
[ 6:00 AM ]

Day Classification
[ Regular Work Day ▼ ]

Break included in Night Differential?
[ No ▼ ]

Default unpaid break:
1 hour

Scheduled regular hours
[ 8.00 ]

Was overtime agreed or approved?
[ No ]

[ CALCULATE ]
```

Use 8 scheduled regular hours by default. A different value is valid
only when the employee is recording an approved compressed-workweek
schedule. The overtime answer is the employee's personal record, not an
approval performed by the app.

## Day Classification

Options:

``` text
Regular Work Day
Rest Day
Special Public Holiday
Special Public Holiday + Rest Day
Regular/Public Holiday
Regular/Public Holiday + Rest Day
Double Regular Holiday
Double Regular Holiday + Rest Day
```

The application can use the holiday calendar to help identify holiday
dates.

The employee chooses the actual classification for their rotational
schedule.

## Break

Do not ask:

``` text
Break Start
Break End
```

Only ask:

``` text
Break included in ND?
Yes / No
```

This selection changes only ND overlap. The 1-hour unpaid break always
reduces elapsed shift time when the app calculates worked hours.

------------------------------------------------------------------------

# 4. Calculation Result

After pressing Calculate:

``` text
NIGHT DIFFERENTIAL RESULT

Shift
9:00 PM – 6:00 AM

Elapsed
9.00 hrs

Worked after unpaid break
8.00 hrs

Scheduled regular hours
8.00 hrs

Potential overtime
0.00 hrs

Overtime recorded as approved
No

ND Window
10:00 PM – 6:00 AM

Potential ND
8.00 hrs

Break
1.00 hr

Break Included
No

Final ND
7.00 hrs

Day Classification
Regular Work Day
```

Then show applicable wage type lines.

If allocation of ND between regular and approved-overtime portions is
required, display that allocation as TBD. Do not automatically select
code 2252 from the shift duration.

------------------------------------------------------------------------

# 5. Wage Type Results

Do not display only one code.

Use a table:

  Code   Category            Hours   Rate   Amount
  ------ ----------------- ------- ------ --------
  2211   Ordinary Day ND      7.00    10%     ₱XXX

If multiple codes apply:

  Code   Category       Hours   Rate   Amount
  ------ ------------ ------- ------ --------
  XXXX   Category A      X.XX    XX%      TBD
  YYYY   Category B      X.XX    XX%      TBD

The employee should be able to see exactly which codes were selected.
Only code 2211 has a confirmed money formula. Every non-2211 amount,
including code 2252, must display as TBD rather than a currency value.

------------------------------------------------------------------------

# 6. Save Result

Buttons:

``` text
[ SAVE ENTRY ]
[ CANCEL ]
```

There is no approval workflow.

------------------------------------------------------------------------

# 7. My Records

Display:

  Date    Shift      Day Type     ND Hours Wage Types     Amount
  ------- ---------- ---------- ---------- ------------ --------
  Oct 1   9PM--6AM   Regular          7.00 2211             ₱XXX
  Oct 2   9PM--6AM   Regular          8.00 2211             ₱XXX

Filters:

``` text
This Week
This Payroll Period
This Month
Custom Range
```

------------------------------------------------------------------------

# 8. Record Details

Clicking a record shows:

``` text
October 1, 2026

Shift
9:00 PM – 6:00 AM

Day Classification
Regular Work Day

Elapsed
9.00 hrs

Worked after unpaid break
8.00 hrs

Potential Overtime
0.00 hrs

Potential ND
8.00 hrs

Default Break
1.00 hr

Break Included
No

Final ND
7.00 hrs
```

Then:

``` text
APPLICABLE WAGE TYPES

2211
Ordinary Day — Night Shift
First 8 Hours
10%
```

If multiple codes apply, display all of them.

------------------------------------------------------------------------

# 9. Calendar

Use the supplied company calendar as the initial holiday reference.

Show:

-   Regular holidays
-   Special non-working holidays
-   Payroll dates/cutoffs where available

Do not make Saturday or Sunday automatically mean rest day.

------------------------------------------------------------------------

# 10. Settings

Keep settings small:

``` text
MY PROFILE

Name
Employee ID
Monthly Basic Salary (optional)

Derived Computational Hourly Rate
(Monthly Basic Salary x 12) / 261 / 8

Approved Compressed Workweek
No

Scheduled Regular Hours
8 hours

COMPUTATION

ND Start
10:00 PM

ND End
6:00 AM

Default Unpaid Break
1 hour
```

The employee can view configured wage types and holiday information.

The first version does not need an admin configuration panel.

Factor 365 may be explained as monthly-paid employment context, but it
must not appear as a selectable or computed engine divisor.
