-- Persist wage-line money as integer centavos and add the atomic
-- employee-owned shift snapshot writer.

do $migrate$
declare
  constraint_name text;
begin
  select c.conname
  into constraint_name
  from pg_catalog.pg_constraint as c
  join pg_catalog.pg_class as rel on rel.oid = c.conrelid
  join pg_catalog.pg_namespace as nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'nd_wage_type_lines'
    and c.contype = 'c'
    and pg_catalog.pg_get_constraintdef(c.oid) ~ 'calculated_amount'
    and pg_catalog.pg_get_constraintdef(c.oid) !~ 'calculated_amount_centavos';

  if constraint_name is null then
    raise exception
      'expected tbd-null check naming calculated_amount was not found';
  end if;

  execute format(
    'alter table public.nd_wage_type_lines drop constraint %I',
    constraint_name
  );
end
$migrate$;

alter table public.nd_wage_type_lines
  drop column calculated_amount;

alter table public.nd_wage_type_lines
  add column calculated_amount_centavos bigint;

alter table public.nd_wage_type_lines
  add constraint nd_wage_type_lines_tbd_amount_null
    check (amount_status <> 'tbd' or calculated_amount_centavos is null),
  add constraint nd_wage_type_lines_estimated_amount_required
    check (
      amount_status <> 'estimated'
      or calculated_amount_centavos is not null
    );

comment on column public.nd_wage_type_lines.calculated_amount_centavos is
  'Integer centavos for an estimated line; null when amount_status is tbd.';

create function public.save_shift_snapshot(
  p_work_date date,
  p_shift_start timestamptz,
  p_shift_end timestamptz,
  p_day_classification text,
  p_break_included_in_nd boolean,
  p_work_schedule_type text,
  p_scheduled_regular_hours numeric,
  p_overtime_approved boolean,
  p_potential_nd_hours numeric,
  p_break_hours numeric,
  p_nd_hours numeric,
  p_nd_start time,
  p_nd_end time,
  p_time_zone text,
  p_calculation_version smallint,
  p_monthly_basic_salary numeric,
  p_annual_months numeric,
  p_workdays_factor numeric,
  p_rate_hours_per_day numeric,
  p_derived_daily_rate numeric,
  p_derived_hourly_rate numeric,
  p_elapsed_hours numeric,
  p_worked_hours numeric,
  p_regular_hours numeric,
  p_potential_overtime_hours numeric,
  p_approved_overtime_hours numeric,
  p_unapproved_extra_hours numeric,
  p_lines jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_owner uuid;
  v_shift_id uuid;
  v_record_id uuid;
  v_line jsonb;
begin
  v_owner := (select auth.uid());
  if v_owner is null then
    raise exception 'authentication required';
  end if;

  if p_calculation_version is distinct from 2 then
    raise exception 'calculation_version must be 2';
  end if;

  if p_lines is null or pg_catalog.jsonb_typeof(p_lines) <> 'array' then
    raise exception 'p_lines must be a jsonb array';
  end if;

  v_shift_id := pg_catalog.gen_random_uuid();
  v_record_id := pg_catalog.gen_random_uuid();

  insert into public.shifts (
    id,
    employee_id,
    work_date,
    shift_start,
    shift_end,
    day_classification,
    break_included_in_nd,
    work_schedule_type,
    scheduled_regular_hours,
    overtime_approved
  ) values (
    v_shift_id,
    v_owner,
    p_work_date,
    p_shift_start,
    p_shift_end,
    p_day_classification,
    p_break_included_in_nd,
    p_work_schedule_type,
    p_scheduled_regular_hours,
    p_overtime_approved
  );

  insert into public.nd_records (
    id,
    shift_id,
    calculation_version,
    potential_nd_hours,
    break_hours,
    break_included_in_nd,
    nd_hours,
    nd_start,
    nd_end,
    time_zone,
    monthly_basic_salary,
    annual_months,
    workdays_factor,
    rate_hours_per_day,
    derived_daily_rate,
    derived_hourly_rate,
    work_schedule_type,
    scheduled_regular_hours,
    elapsed_hours,
    worked_hours,
    regular_hours,
    potential_overtime_hours,
    approved_overtime_hours,
    unapproved_extra_hours,
    overtime_approved
  ) values (
    v_record_id,
    v_shift_id,
    2,
    p_potential_nd_hours,
    p_break_hours,
    p_break_included_in_nd,
    p_nd_hours,
    p_nd_start,
    p_nd_end,
    p_time_zone,
    p_monthly_basic_salary,
    p_annual_months,
    p_workdays_factor,
    p_rate_hours_per_day,
    p_derived_daily_rate,
    p_derived_hourly_rate,
    p_work_schedule_type,
    p_scheduled_regular_hours,
    p_elapsed_hours,
    p_worked_hours,
    p_regular_hours,
    p_potential_overtime_hours,
    p_approved_overtime_hours,
    p_unapproved_extra_hours,
    p_overtime_approved
  );

  for v_line in
    select value
    from pg_catalog.jsonb_array_elements(p_lines)
  loop
    if pg_catalog.jsonb_typeof(v_line) <> 'object' then
      raise exception 'each p_lines element must be a jsonb object';
    end if;

    if v_line ->> 'wage_type_id' is null then
      raise exception 'wage_type_id is required';
    end if;

    if not exists (
      select 1
      from public.wage_types as wt
      where wt.id = (v_line ->> 'wage_type_id')::uuid
        and wt.code = v_line ->> 'wage_type_code'
        and wt.category = v_line ->> 'category'
        and wt.hours_category = v_line ->> 'hours_category'
    ) then
      raise exception
        'wage type does not match an existing public.wage_types row';
    end if;

    insert into public.nd_wage_type_lines (
      nd_record_id,
      wage_type_id,
      wage_type_code,
      category,
      hours_category,
      applicable_hours,
      percentage,
      amount_status,
      calculated_amount_centavos,
      unresolved_reason
    ) values (
      v_record_id,
      (v_line ->> 'wage_type_id')::uuid,
      v_line ->> 'wage_type_code',
      v_line ->> 'category',
      v_line ->> 'hours_category',
      (v_line ->> 'applicable_hours')::numeric,
      (v_line ->> 'percentage')::numeric,
      v_line ->> 'amount_status',
      (v_line ->> 'calculated_amount_centavos')::bigint,
      v_line ->> 'unresolved_reason'
    );
  end loop;

  return v_record_id;
end;
$function$;

revoke all on function public.save_shift_snapshot(
  date,
  timestamptz,
  timestamptz,
  text,
  boolean,
  text,
  numeric,
  boolean,
  numeric,
  numeric,
  numeric,
  time,
  time,
  text,
  smallint,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  jsonb
) from public, anon;

grant execute on function public.save_shift_snapshot(
  date,
  timestamptz,
  timestamptz,
  text,
  boolean,
  text,
  numeric,
  boolean,
  numeric,
  numeric,
  numeric,
  time,
  time,
  text,
  smallint,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  numeric,
  jsonb
) to authenticated;
