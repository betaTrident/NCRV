begin;

create extension if not exists pgtap with schema extensions;
select plan(12);

insert into auth.users (id, email)
values
  ('123e4567-e89b-12d3-a456-426614174000', 'week-user1@test.com'),
  ('987fcdeb-51a2-43d7-9012-345678901234', 'week-user2@test.com');

insert into public.employees (id, name, email, terms_accepted_at)
values
  ('123e4567-e89b-12d3-a456-426614174000', 'Week One', 'week-user1@test.com', now()),
  ('987fcdeb-51a2-43d7-9012-345678901234', 'Week Two', 'week-user2@test.com', now());

insert into public.wage_types (code, category, hours_category, percentage, is_nd, description)
select '2211', 'REGULAR_WORK_DAY', 'FIRST_8', 10, true, 'Ordinary day, night shift, first 8 hours'
where not exists (
  select 1 from public.wage_types
  where code = '2211' and category = 'REGULAR_WORK_DAY' and hours_category = 'FIRST_8'
);

select is(
  has_function_privilege('anon', 'public.save_week_snapshot_batch(text,jsonb,jsonb)', 'execute'),
  false,
  'anon cannot execute the week batch RPC'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.week_save_batches'::regclass),
  true,
  'week batch keys use RLS'
);

set local role authenticated;
set local request.jwt.claim.sub = '123e4567-e89b-12d3-a456-426614174000';
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claims = '{"sub":"123e4567-e89b-12d3-a456-426614174000","role":"authenticated"}';

select throws_ok(
  $$insert into public.week_save_batches (employee_id, idempotency_key, payload_hash, payload, record_ids)
    values ('123e4567-e89b-12d3-a456-426614174000', '33333333-3333-4333-8333-333333333333', md5('[]'), '[]'::jsonb, '{}'::uuid[])$$,
  '42501',
  null,
  'authenticated callers cannot insert ledger rows directly'
);

select lives_ok(
  $$select public.save_week_snapshot_batch(
    '11111111-1111-4111-8111-111111111111',
    '[{"id":"draft-1"}]'::jsonb,
    jsonb_build_array(jsonb_build_object(
      'work_date', '2026-10-01',
      'shift_start', '2026-10-01T21:00:00+08:00',
      'shift_end', '2026-10-02T06:00:00+08:00',
      'day_classification', 'REGULAR_WORK_DAY',
      'break_included_in_nd', false,
      'work_schedule_type', 'STANDARD',
      'scheduled_regular_hours', 8,
      'overtime_approved', false,
      'potential_nd_hours', 8,
      'break_hours', 1,
      'nd_hours', 7,
      'nd_start', '22:00',
      'nd_end', '06:00',
      'time_zone', 'Asia/Manila',
      'calculation_version', 2,
      'monthly_basic_salary', 34800,
      'annual_months', 12,
      'workdays_factor', 261,
      'rate_hours_per_day', 8,
      'derived_daily_rate', 1600,
      'derived_hourly_rate', 200,
      'elapsed_hours', 9,
      'worked_hours', 8,
      'regular_hours', 8,
      'potential_overtime_hours', 0,
      'approved_overtime_hours', 0,
      'unapproved_extra_hours', 0,
      'lines', jsonb_build_array(jsonb_build_object(
        'wage_type_id', (select id from public.wage_types where code = '2211'),
        'wage_type_code', '2211',
        'category', 'REGULAR_WORK_DAY',
        'hours_category', 'FIRST_8',
        'applicable_hours', 7,
        'percentage', 10,
        'amount_status', 'estimated',
        'calculated_amount_centavos', 14000,
        'unresolved_reason', null
      ))
    ))
  )$$,
  'authenticated employee can save a reviewed week'
);

select is((select count(*) from public.shifts), 1::bigint, 'one shift commits');
select is((select count(*) from public.week_save_batches), 1::bigint, 'one batch key commits');

select lives_ok(
  $$select public.save_week_snapshot_batch('11111111-1111-4111-8111-111111111111',
    (select payload from public.week_save_batches where idempotency_key = '11111111-1111-4111-8111-111111111111')::jsonb,
    '[{}]'::jsonb)$$,
  'same key remains callable for retry'
);
select is((select count(*) from public.shifts), 1::bigint, 'same key retry does not duplicate');

select throws_ok(
  $$select public.save_week_snapshot_batch('11111111-1111-4111-8111-111111111111', '[{"changed":true}]'::jsonb, '[{}]'::jsonb)$$,
  'P0001',
  'idempotency key already used with a different payload',
  'changed payload is rejected'
);

select throws_ok(
  $$select public.save_week_snapshot_batch('22222222-2222-4222-8222-222222222222',
    '[{"id":"draft-rollback"}]'::jsonb,
    '[{"work_date":"2026-10-03","lines":[]},{"work_date":"2026-10-04","lines":[{"wage_type_id":"00000000-0000-0000-0000-000000000000","wage_type_code":"bad","category":"REGULAR_WORK_DAY","hours_category":"FIRST_8","amount_status":"tbd","percentage":10}]}]'::jsonb)$$,
  null,
  null,
  'invalid child line fails the whole batch'
);
select is((select count(*) from public.shifts), 1::bigint, 'failed batch rolls back earlier rows');

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '987fcdeb-51a2-43d7-9012-345678901234';
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claims = '{"sub":"987fcdeb-51a2-43d7-9012-345678901234","role":"authenticated"}';
select is((select count(*) from public.week_save_batches), 0::bigint, 'second employee cannot read first employee batch');

select * from finish();
rollback;
