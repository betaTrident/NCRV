-- Replace direct hourly-rate entry with the NCPI monthly-salary basis and
-- preserve enough inputs on each calculation to explain historical results.

alter table public.employees
  rename column hourly_rate to legacy_hourly_rate;

alter table public.employees
  add column monthly_basic_salary numeric(12, 2),
  add column work_schedule_type text not null default 'STANDARD',
  add column scheduled_regular_hours numeric(4, 2) not null default 8;

comment on column public.employees.legacy_hourly_rate is
  'Legacy value retained for migration safety. New calculations derive the hourly rate from monthly_basic_salary.';

comment on column public.employees.monthly_basic_salary is
  'Employee-entered monthly basic salary used to derive the factor-261 estimate.';

alter table public.employees
  add constraint employees_monthly_basic_salary_nonnegative
    check (monthly_basic_salary is null or monthly_basic_salary >= 0),
  add constraint employees_work_schedule_type_valid
    check (work_schedule_type in ('STANDARD', 'APPROVED_CWW')),
  add constraint employees_schedule_hours_valid
    check (
      (work_schedule_type = 'STANDARD' and scheduled_regular_hours = 8)
      or
      (
        work_schedule_type = 'APPROVED_CWW'
        and scheduled_regular_hours between 8 and 12
      )
    );

alter table public.shifts
  add column work_schedule_type text not null default 'STANDARD',
  add column scheduled_regular_hours numeric(4, 2) not null default 8,
  add column overtime_approved boolean not null default false;

alter table public.shifts
  add constraint shifts_work_schedule_type_valid
    check (work_schedule_type in ('STANDARD', 'APPROVED_CWW')),
  add constraint shifts_schedule_hours_valid
    check (
      (work_schedule_type = 'STANDARD' and scheduled_regular_hours = 8)
      or
      (
        work_schedule_type = 'APPROVED_CWW'
        and scheduled_regular_hours between 8 and 12
      )
    );

comment on column public.shifts.overtime_approved is
  'Employee-recorded fact that excess work was agreed or approved; Voyix Shift does not approve overtime.';

alter table public.nd_records
  add column calculation_version smallint,
  add column monthly_basic_salary numeric(12, 2),
  add column annual_months numeric(4, 2),
  add column workdays_factor numeric(6, 2),
  add column rate_hours_per_day numeric(4, 2),
  add column derived_daily_rate numeric(18, 8),
  add column derived_hourly_rate numeric(18, 8),
  add column work_schedule_type text,
  add column scheduled_regular_hours numeric(4, 2),
  add column elapsed_hours numeric(6, 2),
  add column worked_hours numeric(6, 2),
  add column regular_hours numeric(6, 2),
  add column potential_overtime_hours numeric(6, 2),
  add column approved_overtime_hours numeric(6, 2),
  add column unapproved_extra_hours numeric(6, 2),
  add column overtime_approved boolean;

alter table public.nd_records
  add constraint nd_records_calculation_version_valid
    check (calculation_version is null or calculation_version = 2),
  add constraint nd_records_snapshot_completeness_valid
    check (
      (
        calculation_version is null
        and monthly_basic_salary is null
        and annual_months is null
        and workdays_factor is null
        and rate_hours_per_day is null
        and derived_daily_rate is null
        and derived_hourly_rate is null
        and work_schedule_type is null
        and scheduled_regular_hours is null
        and elapsed_hours is null
        and worked_hours is null
        and regular_hours is null
        and potential_overtime_hours is null
        and approved_overtime_hours is null
        and unapproved_extra_hours is null
        and overtime_approved is null
      )
      or (
        calculation_version = 2
        and work_schedule_type is not null
        and scheduled_regular_hours is not null
        and elapsed_hours is not null
        and worked_hours is not null
        and regular_hours is not null
        and potential_overtime_hours is not null
        and approved_overtime_hours is not null
        and unapproved_extra_hours is not null
        and overtime_approved is not null
        and (
          (
            monthly_basic_salary is null
            and annual_months is null
            and workdays_factor is null
            and rate_hours_per_day is null
            and derived_daily_rate is null
            and derived_hourly_rate is null
          )
          or (
            monthly_basic_salary is not null
            and annual_months is not null
            and workdays_factor is not null
            and rate_hours_per_day is not null
            and derived_daily_rate is not null
            and derived_hourly_rate is not null
          )
        )
      )
    ),
  add constraint nd_records_rate_basis_valid
    check (
      (monthly_basic_salary is null or monthly_basic_salary >= 0)
      and (annual_months is null or annual_months = 12)
      and (workdays_factor is null or workdays_factor = 261)
      and (rate_hours_per_day is null or rate_hours_per_day = 8)
      and (derived_daily_rate is null or derived_daily_rate >= 0)
      and (derived_hourly_rate is null or derived_hourly_rate >= 0)
    ),
  add constraint nd_records_derived_rates_valid
    check (
      monthly_basic_salary is null
      or (
        derived_daily_rate = round(monthly_basic_salary * 12 / 261, 8)
        and derived_hourly_rate = round(monthly_basic_salary * 12 / 261 / 8, 8)
      )
    ),
  add constraint nd_records_schedule_basis_valid
    check (
      work_schedule_type is null
      or (
        work_schedule_type = 'STANDARD'
        and scheduled_regular_hours = 8
      )
      or (
        work_schedule_type = 'APPROVED_CWW'
        and scheduled_regular_hours between 8 and 12
      )
    ),
  add constraint nd_records_duty_hours_nonnegative
    check (
      (elapsed_hours is null or elapsed_hours >= 0)
      and (worked_hours is null or worked_hours >= 0)
      and (regular_hours is null or regular_hours >= 0)
      and (potential_overtime_hours is null or potential_overtime_hours >= 0)
      and (approved_overtime_hours is null or approved_overtime_hours >= 0)
      and (unapproved_extra_hours is null or unapproved_extra_hours >= 0)
    ),
  add constraint nd_records_duty_hours_consistent
    check (
      elapsed_hours is null
      or worked_hours is null
      or regular_hours is null
      or scheduled_regular_hours is null
      or (
        worked_hours = greatest(elapsed_hours - break_hours, 0::numeric)
        and regular_hours = least(worked_hours, scheduled_regular_hours)
      )
    ),
  add constraint nd_records_overtime_buckets_consistent
    check (
      worked_hours is null
      or regular_hours is null
      or potential_overtime_hours is null
      or approved_overtime_hours is null
      or unapproved_extra_hours is null
      or (
        worked_hours = regular_hours + potential_overtime_hours
        and potential_overtime_hours = approved_overtime_hours + unapproved_extra_hours
        and approved_overtime_hours <= potential_overtime_hours
      )
    ),
  add constraint nd_records_overtime_approval_state_consistent
    check (
      overtime_approved is null
      or potential_overtime_hours is null
      or approved_overtime_hours is null
      or unapproved_extra_hours is null
      or (
        overtime_approved
        and approved_overtime_hours = potential_overtime_hours
        and unapproved_extra_hours = 0
      )
      or (
        not overtime_approved
        and approved_overtime_hours = 0
        and unapproved_extra_hours = potential_overtime_hours
      )
    );

alter table public.nd_records
  alter column calculation_version set default 2;

alter table public.nd_wage_type_lines
  alter column applicable_hours drop not null,
  add constraint nd_wage_type_lines_applicable_hours_nonnegative
    check (applicable_hours is null or applicable_hours >= 0),
  add constraint nd_wage_type_lines_estimated_hours_required
    check (amount_status <> 'estimated' or applicable_hours is not null);
