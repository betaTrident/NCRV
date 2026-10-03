# User Interface

## Design Goal

The UI should be simple enough that an employee can enter a shift in
seconds.

There are no manager or admin accounts.

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

[ CALCULATE ]
```

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

------------------------------------------------------------------------

# 4. Calculation Result

After pressing Calculate:

``` text
NIGHT DIFFERENTIAL RESULT

Shift
9:00 PM – 6:00 AM

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
  XXXX   Category A      X.XX    XX%     ₱XXX
  YYYY   Category B      X.XX    XX%     ₱XXX

The employee should be able to see exactly which codes were selected.

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
Hourly Rate

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
