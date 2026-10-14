-- Harden the Week batch ledger against direct caller inserts.
revoke insert on table public.week_save_batches from authenticated;
drop policy if exists week_save_batches_insert_own on public.week_save_batches;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.save_week_snapshot_batch(
  p_idempotency_key text,
  p_input_rows jsonb,
  p_snapshots jsonb
)
returns jsonb
language plpgsql
security definer
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
  if v_owner is null then raise exception 'authentication required'; end if;
  if p_idempotency_key is null
    or p_idempotency_key !~* '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    raise exception 'idempotency key must be a UUID';
  end if;
  if p_input_rows is null or pg_catalog.jsonb_typeof(p_input_rows) <> 'array'
    or pg_catalog.jsonb_array_length(p_input_rows) = 0
    or pg_catalog.jsonb_array_length(p_input_rows) > 31 then
    raise exception 'p_input_rows must contain 1 to 31 rows';
  end if;
  if p_snapshots is null or pg_catalog.jsonb_typeof(p_snapshots) <> 'array'
    or pg_catalog.jsonb_array_length(p_snapshots) = 0
    or pg_catalog.jsonb_array_length(p_snapshots) > 31 then
    raise exception 'p_snapshots must contain 1 to 31 rows';
  end if;

  v_payload_hash := pg_catalog.md5(p_input_rows::text);
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_owner::text || ':' || p_idempotency_key, 0)
  );

  select record_ids, payload_hash, payload into v_existing, v_existing_hash, v_existing_payload
  from public.week_save_batches
  where employee_id = v_owner and idempotency_key = p_idempotency_key;

  if v_existing is not null then
    if v_existing_hash is distinct from v_payload_hash
      or v_existing_payload is distinct from p_input_rows then
      raise exception 'idempotency key already used with a different payload';
    end if;
    return pg_catalog.jsonb_build_object('ids', to_jsonb(v_existing));
  end if;

  for v_snapshot in select value from pg_catalog.jsonb_array_elements(p_snapshots) loop
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

revoke all on function private.save_week_snapshot_batch(text, jsonb, jsonb)
  from public, anon, authenticated;
-- The private schema is excluded from PostgREST exposure. These grants let
-- the invoker wrapper resolve the helper while preserving its owner checks.
grant usage on schema private to authenticated;
grant execute on function private.save_week_snapshot_batch(text, jsonb, jsonb)
  to authenticated;

create or replace function public.save_week_snapshot_batch(
  p_idempotency_key text,
  p_input_rows jsonb,
  p_snapshots jsonb
)
returns jsonb
language sql
security invoker
set search_path = ''
as $function$
  select private.save_week_snapshot_batch($1, $2, $3);
$function$;

revoke all on function public.save_week_snapshot_batch(text, jsonb, jsonb)
  from public, anon;
grant execute on function public.save_week_snapshot_batch(text, jsonb, jsonb)
  to authenticated;
