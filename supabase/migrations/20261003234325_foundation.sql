-- Voyix Shift foundation schema: employee-owned tables, RLS, and grants.
-- Policies wrap auth.uid() in (select ...) so it is evaluated once per query.

create table public.employees (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  employee_id text not null unique,
  email text not null,
  hourly_rate numeric(12, 2),
  time_zone text not null default 'Asia/Manila',
  nd_start time not null default '22:00',
  nd_end time not null default '06:00',
  break_hours numeric(4, 2) not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wage_types (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  category text not null,
  hours_category text not null,
  percentage numeric(7, 2) not null,
  is_nd boolean not null,
  description text not null,
  active boolean not null default true,
  effective_from date,
  effective_until date,
  unique (code, category, hours_category)
);

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  work_date date not null,
  shift_start timestamptz not null,
  shift_end timestamptz not null,
  day_classification text not null,
  break_included_in_nd boolean not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nd_records (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null unique references public.shifts (id) on delete cascade,
  potential_nd_hours numeric(6, 2) not null,
  break_hours numeric(4, 2) not null,
  break_included_in_nd boolean not null,
  nd_hours numeric(6, 2) not null,
  nd_start time not null,
  nd_end time not null,
  time_zone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.nd_wage_type_lines (
  id uuid primary key default gen_random_uuid(),
  nd_record_id uuid not null references public.nd_records (id) on delete cascade,
  wage_type_id uuid references public.wage_types (id),
  wage_type_code text not null,
  category text not null,
  hours_category text not null,
  applicable_hours numeric(6, 2) not null,
  percentage numeric(7, 2) not null,
  amount_status text not null check (amount_status in ('estimated', 'tbd')),
  calculated_amount numeric(14, 2),
  unresolved_reason text,
  created_at timestamptz not null default now(),
  check (amount_status <> 'tbd' or calculated_amount is null)
);

create table public.holidays (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.employees (id) on delete cascade,
  holiday_date date not null,
  name text not null,
  holiday_type text not null,
  year int not null,
  active boolean not null default true
);

create table public.payroll_periods (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.employees (id) on delete cascade,
  period_start date not null,
  period_end date not null,
  pay_date date,
  cutoff_date date,
  cutoff_time time,
  active boolean not null default true
);

create index shifts_employee_id_work_date_idx
  on public.shifts (employee_id, work_date desc);

create index nd_wage_type_lines_nd_record_id_idx
  on public.nd_wage_type_lines (nd_record_id);

create index holidays_owner_id_idx
  on public.holidays (owner_id);

create index payroll_periods_owner_id_idx
  on public.payroll_periods (owner_id);

alter table public.employees enable row level security;
alter table public.wage_types enable row level security;
alter table public.shifts enable row level security;
alter table public.nd_records enable row level security;
alter table public.nd_wage_type_lines enable row level security;
alter table public.holidays enable row level security;
alter table public.payroll_periods enable row level security;

create policy employees_select_own
  on public.employees
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy employees_insert_own
  on public.employees
  for insert
  to authenticated
  with check (id = (select auth.uid()));

create policy employees_update_own
  on public.employees
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy shifts_all_own
  on public.shifts
  for all
  to authenticated
  using (employee_id = (select auth.uid()))
  with check (employee_id = (select auth.uid()));

create policy nd_records_all_own
  on public.nd_records
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.shifts s
      where s.id = nd_records.shift_id
        and s.employee_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.shifts s
      where s.id = nd_records.shift_id
        and s.employee_id = (select auth.uid())
    )
  );

create policy nd_wage_type_lines_all_own
  on public.nd_wage_type_lines
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.nd_records r
      join public.shifts s on s.id = r.shift_id
      where r.id = nd_wage_type_lines.nd_record_id
        and s.employee_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.nd_records r
      join public.shifts s on s.id = r.shift_id
      where r.id = nd_wage_type_lines.nd_record_id
        and s.employee_id = (select auth.uid())
    )
  );

create policy wage_types_select_authenticated
  on public.wage_types
  for select
  to authenticated
  using (true);

create policy holidays_select_own_or_shared
  on public.holidays
  for select
  to authenticated
  using (owner_id is null or owner_id = (select auth.uid()));

create policy holidays_insert_own
  on public.holidays
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy holidays_update_own
  on public.holidays
  for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy holidays_delete_own
  on public.holidays
  for delete
  to authenticated
  using (owner_id = (select auth.uid()));

create policy payroll_periods_select_own_or_shared
  on public.payroll_periods
  for select
  to authenticated
  using (owner_id is null or owner_id = (select auth.uid()));

create policy payroll_periods_insert_own
  on public.payroll_periods
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy payroll_periods_update_own
  on public.payroll_periods
  for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy payroll_periods_delete_own
  on public.payroll_periods
  for delete
  to authenticated
  using (owner_id = (select auth.uid()));

revoke all on table public.employees from anon, authenticated, public;
revoke all on table public.wage_types from anon, authenticated, public;
revoke all on table public.shifts from anon, authenticated, public;
revoke all on table public.nd_records from anon, authenticated, public;
revoke all on table public.nd_wage_type_lines from anon, authenticated, public;
revoke all on table public.holidays from anon, authenticated, public;
revoke all on table public.payroll_periods from anon, authenticated, public;

grant select, insert, update on table public.employees to authenticated;
grant select on table public.wage_types to authenticated;
grant select, insert, update, delete on table public.shifts to authenticated;
grant select, insert, update, delete on table public.nd_records to authenticated;
grant select, insert, update, delete on table public.nd_wage_type_lines to authenticated;
grant select, insert, update, delete on table public.holidays to authenticated;
grant select, insert, update, delete on table public.payroll_periods to authenticated;
