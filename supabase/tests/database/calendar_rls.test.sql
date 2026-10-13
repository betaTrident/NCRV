begin;

create extension if not exists pgtap with schema extensions;

select plan(32);

-- User A: 123e4567-e89b-12d3-a456-426614174000
-- User B: 987fcdeb-51a2-43d7-9012-345678901234

insert into auth.users (id, email)
values
  ('123e4567-e89b-12d3-a456-426614174000', 'user1@test.com'),
  ('987fcdeb-51a2-43d7-9012-345678901234', 'user2@test.com');

insert into public.employees (id, name, email, terms_accepted_at)
values
  (
    '123e4567-e89b-12d3-a456-426614174000',
    'Ada',
    'user1@test.com',
    now()
  ),
  (
    '987fcdeb-51a2-43d7-9012-345678901234',
    'Ben',
    'user2@test.com',
    now()
  );

insert into public.holidays (
  id,
  owner_id,
  holiday_date,
  name,
  holiday_type,
  year,
  active
)
values (
  'cc000000-0000-4000-8000-000000000001',
  null,
  date '2026-10-05',
  'Shared holiday fixture',
  'REGULAR_PUBLIC_HOLIDAY',
  2026,
  true
);

insert into public.payroll_periods (
  id,
  owner_id,
  period_start,
  period_end,
  pay_date,
  cutoff_date,
  cutoff_time,
  active
)
values (
  'cc000000-0000-4000-8000-000000000002',
  null,
  date '2026-09-01',
  date '2026-09-15',
  date '2026-09-20',
  date '2026-09-12',
  time '17:00',
  true
);

reset role;
set local role anon;
set local request.jwt.claim.sub = '';
set local request.jwt.claim.role = 'anon';
set local request.jwt.claims = '{"role":"anon"}';

select throws_ok(
  $$select count(*) from public.holidays$$,
  '42501',
  null,
  'anon cannot select holidays'
);

select throws_ok(
  $$select count(*) from public.payroll_periods$$,
  '42501',
  null,
  'anon cannot select payroll_periods'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '123e4567-e89b-12d3-a456-426614174000';
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claims = '{"sub":"123e4567-e89b-12d3-a456-426614174000","role":"authenticated"}';

select lives_ok(
  $$insert into public.holidays (
      id,
      owner_id,
      holiday_date,
      name,
      holiday_type,
      year,
      active
    ) values (
      'aa000000-0000-4000-8000-000000000001',
      '123e4567-e89b-12d3-a456-426614174000',
      date '2026-10-03',
      'Saturday fixture',
      'SPECIAL_PUBLIC_HOLIDAY',
      2026,
      true
    )$$,
  'user A can insert a holiday with owner_id = auth.uid()'
);

select lives_ok(
  $$insert into public.payroll_periods (
      id,
      owner_id,
      period_start,
      period_end,
      pay_date,
      cutoff_date,
      cutoff_time,
      active
    ) values (
      'aa000000-0000-4000-8000-000000000002',
      '123e4567-e89b-12d3-a456-426614174000',
      date '2026-10-01',
      date '2026-10-15',
      date '2026-10-20',
      date '2026-10-12',
      time '17:00',
      true
    )$$,
  'user A can insert a payroll period with owner_id = auth.uid()'
);

select throws_ok(
  $$insert into public.holidays (
      owner_id,
      holiday_date,
      name,
      holiday_type,
      year
    ) values (
      '987fcdeb-51a2-43d7-9012-345678901234',
      date '2026-10-06',
      'Blocked holiday',
      'REGULAR_PUBLIC_HOLIDAY',
      2026
    )$$,
  '42501',
  null,
  'user A cannot insert a holiday owned by user B'
);

select throws_ok(
  $$insert into public.payroll_periods (
      owner_id,
      period_start,
      period_end
    ) values (
      '987fcdeb-51a2-43d7-9012-345678901234',
      date '2026-11-01',
      date '2026-11-15'
    )$$,
  '42501',
  null,
  'user A cannot insert a payroll period owned by user B'
);

select results_eq(
  $$select holiday_date, name, holiday_type
    from public.holidays
    where id = 'aa000000-0000-4000-8000-000000000001'$$,
  $$values (
      date '2026-10-03',
      'Saturday fixture'::text,
      'SPECIAL_PUBLIC_HOLIDAY'::text
    )$$,
  'user A can select their own holiday'
);

select is(
  (
    select holiday_type
    from public.holidays
    where id = 'aa000000-0000-4000-8000-000000000001'
  ),
  'SPECIAL_PUBLIC_HOLIDAY',
  'a Saturday fixture keeps the inserted holiday_type, not a rest day'
);

select results_eq(
  $$select period_start, period_end
    from public.payroll_periods
    where id = 'aa000000-0000-4000-8000-000000000002'$$,
  $$values (date '2026-10-01', date '2026-10-15')$$,
  'user A can select their own payroll period'
);

select is(
  (
    select count(*)
    from public.holidays
    where id = 'cc000000-0000-4000-8000-000000000001'
  ),
  1::bigint,
  'user A can select a shared holiday with owner_id null'
);

select is(
  (
    select count(*)
    from public.payroll_periods
    where id = 'cc000000-0000-4000-8000-000000000002'
  ),
  1::bigint,
  'user A can select a shared payroll period with owner_id null'
);

with u as (
  update public.holidays
  set name = 'blocked shared holiday'
  where id = 'cc000000-0000-4000-8000-000000000001'
  returning 1
)
select is(
  (select count(*) from u),
  0::bigint,
  'user A cannot update a shared holiday'
);

with d as (
  delete from public.holidays
  where id = 'cc000000-0000-4000-8000-000000000001'
  returning 1
)
select is(
  (select count(*) from d),
  0::bigint,
  'user A cannot delete a shared holiday'
);

with u as (
  update public.payroll_periods
  set pay_date = date '2026-09-21'
  where id = 'cc000000-0000-4000-8000-000000000002'
  returning 1
)
select is(
  (select count(*) from u),
  0::bigint,
  'user A cannot update a shared payroll period'
);

with d as (
  delete from public.payroll_periods
  where id = 'cc000000-0000-4000-8000-000000000002'
  returning 1
)
select is(
  (select count(*) from d),
  0::bigint,
  'user A cannot delete a shared payroll period'
);

with u as (
  update public.holidays
  set name = 'Ada holiday updated'
  where id = 'aa000000-0000-4000-8000-000000000001'
  returning name
)
select is(
  (select name from u),
  'Ada holiday updated',
  'user A can update their own holiday'
);

with u as (
  update public.payroll_periods
  set pay_date = date '2026-10-21'
  where id = 'aa000000-0000-4000-8000-000000000002'
  returning pay_date
)
select is(
  (select pay_date from u),
  date '2026-10-21',
  'user A can update their own payroll period'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '987fcdeb-51a2-43d7-9012-345678901234';
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claims = '{"sub":"987fcdeb-51a2-43d7-9012-345678901234","role":"authenticated"}';

select is(
  (
    select count(*)
    from public.holidays
    where id = 'aa000000-0000-4000-8000-000000000001'
  ),
  0::bigint,
  'user B cannot select user A holiday'
);

select is(
  (
    select count(*)
    from public.payroll_periods
    where id = 'aa000000-0000-4000-8000-000000000002'
  ),
  0::bigint,
  'user B cannot select user A payroll period'
);

with u as (
  update public.holidays
  set name = 'hijacked'
  where id = 'aa000000-0000-4000-8000-000000000001'
  returning 1
)
select is(
  (select count(*) from u),
  0::bigint,
  'user B cannot update user A holiday'
);

with u as (
  update public.payroll_periods
  set pay_date = date '2026-10-31'
  where id = 'aa000000-0000-4000-8000-000000000002'
  returning 1
)
select is(
  (select count(*) from u),
  0::bigint,
  'user B cannot update user A payroll period'
);

with d as (
  delete from public.holidays
  where id = 'aa000000-0000-4000-8000-000000000001'
  returning 1
)
select is(
  (select count(*) from d),
  0::bigint,
  'user B cannot delete user A holiday'
);

with d as (
  delete from public.payroll_periods
  where id = 'aa000000-0000-4000-8000-000000000002'
  returning 1
)
select is(
  (select count(*) from d),
  0::bigint,
  'user B cannot delete user A payroll period'
);

select is(
  (
    select count(*)
    from public.holidays
    where id = 'cc000000-0000-4000-8000-000000000001'
  ),
  1::bigint,
  'user B can select a shared holiday with owner_id null'
);

select is(
  (
    select count(*)
    from public.payroll_periods
    where id = 'cc000000-0000-4000-8000-000000000002'
  ),
  1::bigint,
  'user B can select a shared payroll period with owner_id null'
);

with u as (
  update public.holidays
  set name = 'blocked by B'
  where id = 'cc000000-0000-4000-8000-000000000001'
  returning 1
)
select is(
  (select count(*) from u),
  0::bigint,
  'user B cannot update a shared holiday'
);

with d as (
  delete from public.holidays
  where id = 'cc000000-0000-4000-8000-000000000001'
  returning 1
)
select is(
  (select count(*) from d),
  0::bigint,
  'user B cannot delete a shared holiday'
);

with u as (
  update public.payroll_periods
  set pay_date = date '2026-09-22'
  where id = 'cc000000-0000-4000-8000-000000000002'
  returning 1
)
select is(
  (select count(*) from u),
  0::bigint,
  'user B cannot update a shared payroll period'
);

with d as (
  delete from public.payroll_periods
  where id = 'cc000000-0000-4000-8000-000000000002'
  returning 1
)
select is(
  (select count(*) from d),
  0::bigint,
  'user B cannot delete a shared payroll period'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '123e4567-e89b-12d3-a456-426614174000';
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claims = '{"sub":"123e4567-e89b-12d3-a456-426614174000","role":"authenticated"}';

select is(
  (
    select holiday_type
    from public.holidays
    where id = 'aa000000-0000-4000-8000-000000000001'
  ),
  'SPECIAL_PUBLIC_HOLIDAY',
  'user A holiday still has the inserted type after user B mutation attempts'
);

with d as (
  delete from public.holidays
  where id = 'aa000000-0000-4000-8000-000000000001'
  returning 1
)
select is(
  (select count(*) from d),
  1::bigint,
  'user A can delete their own holiday'
);

with d as (
  delete from public.payroll_periods
  where id = 'aa000000-0000-4000-8000-000000000002'
  returning 1
)
select is(
  (select count(*) from d),
  1::bigint,
  'user A can delete their own payroll period'
);

select * from finish();

rollback;
