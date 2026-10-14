-- Store the reviewed Week-entry batch key and record ids so retries are safe.
create table public.week_save_batches (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  idempotency_key text not null check (length(idempotency_key) between 1 and 200),
  payload_hash text not null check (length(payload_hash) = 32),
  payload jsonb not null,
  record_ids uuid[] not null check (cardinality(record_ids) between 1 and 31),
  check (payload_hash = pg_catalog.md5(payload::text)),
  created_at timestamptz not null default now(),
  unique (employee_id, idempotency_key)
);

alter table public.week_save_batches enable row level security;

create policy week_save_batches_select_own
  on public.week_save_batches
  for select
  to authenticated
  using (employee_id = (select auth.uid()));

create policy week_save_batches_insert_own
  on public.week_save_batches
  for insert
  to authenticated
  with check (
    employee_id = (select auth.uid())
    and record_ids <@ coalesce(
      (
        select pg_catalog.array_agg(r.id)
        from public.nd_records r
        join public.shifts s on s.id = r.shift_id
        where s.employee_id = (select auth.uid())
      ),
      '{}'::uuid[]
    )
  );

revoke all on table public.week_save_batches from anon, authenticated, public;
grant select, insert on table public.week_save_batches to authenticated;

create function public.save_week_snapshot_batch(
  p_idempotency_key text,
  p_input_rows jsonb,
  p_snapshots jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_owner uuid;
  v_existing uuid[];
  v_existing_hash text;
  v_existing_payload jsonb;
  v_payload_hash text;
  v_record_ids uuid[] := '{}'::uuid[];
  v_snapshot jsonb;
  v_record_id uuid;
begin
  v_owner := (select auth.uid());
  if v_owner is null then
    raise exception 'authentication required';
  end if;

  if p_idempotency_key is null
    or p_idempotency_key !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    raise exception 'idempotency key must be a UUID';
  end if;

  if p_input_rows is null or pg_catalog.jsonb_typeof(p_input_rows) <> 'array'
    or pg_catalog.jsonb_array_length(p_input_rows) = 0 then
    raise exception 'p_input_rows must be a nonempty jsonb array';
  end if;

  if p_snapshots is null or pg_catalog.jsonb_typeof(p_snapshots) <> 'array'
    or pg_catalog.jsonb_array_length(p_snapshots) = 0 then
    raise exception 'p_snapshots must be a nonempty jsonb array';
  end if;

  v_payload_hash := pg_catalog.md5(p_input_rows::text);

  -- Serialize retries for the same employee/key before checking or writing rows.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_owner::text || ':' || p_idempotency_key, 0)
  );

  select record_ids, payload_hash, payload
  into v_existing, v_existing_hash, v_existing_payload
  from public.week_save_batches
  where employee_id = v_owner
    and idempotency_key = p_idempotency_key;

  if v_existing is not null then
    if v_existing_hash is distinct from v_payload_hash
      or v_existing_payload is distinct from p_input_rows then
      raise exception 'idempotency key already used with a different payload';
    end if;
    return pg_catalog.jsonb_build_object('ids', to_jsonb(v_existing));
  end if;

  for v_snapshot in
    select value from pg_catalog.jsonb_array_elements(p_snapshots)
  loop
    if pg_catalog.jsonb_typeof(v_snapshot) <> 'object' then
      raise exception 'each snapshot must be a jsonb object';
    end if;

    v_record_id := public.save_shift_snapshot(
      (v_snapshot ->> 'work_date')::date,
      (v_snapshot ->> 'shift_start')::timestamptz,
      (v_snapshot ->> 'shift_end')::timestamptz,
      v_snapshot ->> 'day_classification',
      (v_snapshot ->> 'break_included_in_nd')::boolean,
      v_snapshot ->> 'work_schedule_type',
      (v_snapshot ->> 'scheduled_regular_hours')::numeric,
      (v_snapshot ->> 'overtime_approved')::boolean,
      (v_snapshot ->> 'potential_nd_hours')::numeric,
      (v_snapshot ->> 'break_hours')::numeric,
      (v_snapshot ->> 'nd_hours')::numeric,
      (v_snapshot ->> 'nd_start')::time,
      (v_snapshot ->> 'nd_end')::time,
      v_snapshot ->> 'time_zone',
      (v_snapshot ->> 'calculation_version')::smallint,
      (v_snapshot ->> 'monthly_basic_salary')::numeric,
      (v_snapshot ->> 'annual_months')::numeric,
      (v_snapshot ->> 'workdays_factor')::numeric,
      (v_snapshot ->> 'rate_hours_per_day')::numeric,
      (v_snapshot ->> 'derived_daily_rate')::numeric,
      (v_snapshot ->> 'derived_hourly_rate')::numeric,
      (v_snapshot ->> 'elapsed_hours')::numeric,
      (v_snapshot ->> 'worked_hours')::numeric,
      (v_snapshot ->> 'regular_hours')::numeric,
      (v_snapshot ->> 'potential_overtime_hours')::numeric,
      (v_snapshot ->> 'approved_overtime_hours')::numeric,
      (v_snapshot ->> 'unapproved_extra_hours')::numeric,
      coalesce(v_snapshot -> 'lines', '[]'::jsonb)
    );
    v_record_ids := array_append(v_record_ids, v_record_id);
  end loop;

  insert into public.week_save_batches (employee_id, idempotency_key, payload_hash, payload, record_ids)
  values (v_owner, p_idempotency_key, v_payload_hash, p_input_rows, v_record_ids);

  return pg_catalog.jsonb_build_object('ids', to_jsonb(v_record_ids));
end;
$function$;

revoke all on function public.save_week_snapshot_batch(text, jsonb, jsonb)
  from public, anon;
grant execute on function public.save_week_snapshot_batch(text, jsonb, jsonb)
  to authenticated;
