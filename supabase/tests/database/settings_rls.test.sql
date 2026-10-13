begin;

create extension if not exists pgtap with schema extensions;

select plan(24);

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

insert into public.wage_types (
  code,
  category,
  hours_category,
  percentage,
  is_nd,
  description
)
values (
  '2211',
  'REGULAR_WORK_DAY',
  'FIRST_8',
  10,
  true,
  'Ordinary day, night shift, first 8 hours'
)
on conflict (code, category, hours_category) do nothing;

select is(
  has_table_privilege('anon', 'public.holidays', 'SELECT'),
  false,
  'anon has no select privilege on holidays'
);

select is(
  has_table_privilege('anon', 'public.payroll_periods', 'SELECT'),
  false,
  'anon has no select privilege on payroll_periods'
);

select is(
  has_table_privilege('anon', 'public.employees', 'SELECT'),
  false,
  'anon has no select privilege on employees'
);

select is(
  has_table_privilege('anon', 'public.wage_types', 'SELECT'),
  false,
  'anon has no select privilege on wage_types'
);

select is(
  has_table_privilege('authenticated', 'public.wage_types', 'INSERT'),
  false,
  'authenticated has no insert privilege on wage_types'
);

select is(
  has_table_privilege('authenticated', 'public.wage_types', 'UPDATE'),
  false,
  'authenticated has no update privilege on wage_types'
);

select is(
  has_table_privilege('authenticated', 'public.wage_types', 'DELETE'),
  false,
  'authenticated has no delete privilege on wage_types'
);

reset role;
set local role anon;
set local request.jwt.claim.sub = '';
set local request.jwt.claim.role = 'anon';
set local request.jwt.claims = '{"role":"anon"}';

select throws_ok(
  $$select count(*) from public.employees$$,
  '42501',
  null,
  'anon cannot select employees'
);

select throws_ok(
  $$update public.employees set name = 'anon'$$,
  '42501',
  null,
  'anon cannot update employees'
);

select throws_ok(
  $$select count(*) from public.wage_types$$,
  '42501',
  null,
  'anon cannot select wage_types'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '123e4567-e89b-12d3-a456-426614174000';
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claims = '{"sub":"123e4567-e89b-12d3-a456-426614174000","role":"authenticated"}';

select lives_ok(
  $$update public.employees
    set name = 'Ada Lovelace',
        monthly_basic_salary = 20000.00,
        work_schedule_type = 'APPROVED_CWW',
        scheduled_regular_hours = 10,
        nd_start = time '21:00',
        nd_end = time '05:00',
        break_hours = 0.50
    where id = '123e4567-e89b-12d3-a456-426614174000'$$,
  'user A can update their own employee settings'
);

select is(
  (
    select name
    from public.employees
    where id = '123e4567-e89b-12d3-a456-426614174000'
  ),
  'Ada Lovelace',
  'user A can update their own name'
);

select is(
  (
    select monthly_basic_salary
    from public.employees
    where id = '123e4567-e89b-12d3-a456-426614174000'
  ),
  20000.00,
  'user A can update their own monthly_basic_salary'
);

select is(
  (
    select work_schedule_type
    from public.employees
    where id = '123e4567-e89b-12d3-a456-426614174000'
  ),
  'APPROVED_CWW',
  'user A can update their own work_schedule_type'
);

select is(
  (
    select scheduled_regular_hours
    from public.employees
    where id = '123e4567-e89b-12d3-a456-426614174000'
  ),
  10.00,
  'user A can update their own scheduled_regular_hours'
);

select is(
  (
    select nd_start
    from public.employees
    where id = '123e4567-e89b-12d3-a456-426614174000'
  ),
  time '21:00',
  'user A can update their own nd_start'
);

select is(
  (
    select nd_end
    from public.employees
    where id = '123e4567-e89b-12d3-a456-426614174000'
  ),
  time '05:00',
  'user A can update their own nd_end'
);

select is(
  (
    select break_hours
    from public.employees
    where id = '123e4567-e89b-12d3-a456-426614174000'
  ),
  0.50,
  'user A can update their own break_hours'
);

with u as (
  update public.employees
  set name = 'Hijacked'
  where id = '987fcdeb-51a2-43d7-9012-345678901234'
  returning 1
)
select is(
  (select count(*) from u),
  0::bigint,
  'user A cannot update user B employee row'
);

select results_eq(
  $$select code, category, hours_category, is_nd
    from public.wage_types
    where code = '2211'
      and category = 'REGULAR_WORK_DAY'
      and hours_category = 'FIRST_8'$$,
  $$values (
      '2211'::text,
      'REGULAR_WORK_DAY'::text,
      'FIRST_8'::text,
      true
    )$$,
  'authenticated can select wage_types'
);

select throws_ok(
  $$insert into public.wage_types (
      code,
      category,
      hours_category,
      percentage,
      is_nd,
      description
    ) values (
      '2211',
      'REGULAR_WORK_DAY',
      'FIRST_8',
      10,
      true,
      'blocked'
    )$$,
  '42501',
  null,
  'authenticated cannot insert wage_types'
);

select throws_ok(
  $$update public.wage_types set description = 'blocked'$$,
  '42501',
  null,
  'authenticated cannot update wage_types'
);

select throws_ok(
  $$delete from public.wage_types$$,
  '42501',
  null,
  'authenticated cannot delete wage_types'
);

reset role;
set local request.jwt.claim.sub = '';
set local request.jwt.claim.role = '';
set local request.jwt.claims = '';

select is(
  (
    select name
    from public.employees
    where id = '987fcdeb-51a2-43d7-9012-345678901234'
  ),
  'Ben',
  'user B name is unchanged after user A update attempt'
);

select * from finish();

rollback;
