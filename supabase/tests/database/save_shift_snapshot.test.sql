begin;

create extension if not exists pgtap with schema extensions;

select plan(25);

insert into auth.users (id, email)
values
  ('123e4567-e89b-12d3-a456-426614174000', 'user1@test.com'),
  ('987fcdeb-51a2-43d7-9012-345678901234', 'user2@test.com');

insert into public.employees (id, name, employee_id, email)
values
  (
    '123e4567-e89b-12d3-a456-426614174000',
    'Ada',
    'EMP-ADA',
    'user1@test.com'
  ),
  (
    '987fcdeb-51a2-43d7-9012-345678901234',
    'Ben',
    'EMP-BEN',
    'user2@test.com'
  );

insert into public.wage_types (
  code,
  category,
  hours_category,
  percentage,
  is_nd,
  description,
  active
)
select
  seed.code,
  seed.category,
  seed.hours_category,
  seed.percentage,
  seed.is_nd,
  seed.description,
  true
from (
  values
    (
      '2211',
      'REGULAR_WORK_DAY',
      'FIRST_8',
      10::numeric,
      true,
      'Ordinary day, night shift, first 8 hours'
    ),
    (
      '2252',
      'REGULAR_WORK_DAY',
      'EXCESS',
      138::numeric,
      true,
      'Ordinary day, night shift, excess of the first 8 hours'
    )
) as seed (
  code,
  category,
  hours_category,
  percentage,
  is_nd,
  description
)
where not exists (
  select 1
  from public.wage_types as wt
  where wt.code = seed.code
    and wt.category = seed.category
    and wt.hours_category = seed.hours_category
);

create function pg_temp.estimated_2211_line(
  p_hours numeric,
  p_centavos bigint
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'wage_type_id', wt.id,
    'wage_type_code', wt.code,
    'category', wt.category,
    'hours_category', wt.hours_category,
    'applicable_hours', p_hours,
    'percentage', wt.percentage,
    'amount_status', 'estimated',
    'calculated_amount_centavos', p_centavos,
    'unresolved_reason', null
  )
  from public.wage_types as wt
  where wt.code = '2211'
    and wt.category = 'REGULAR_WORK_DAY'
    and wt.hours_category = 'FIRST_8'
$$;

create function pg_temp.tbd_2252_line()
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'wage_type_id', wt.id,
    'wage_type_code', wt.code,
    'category', wt.category,
    'hours_category', wt.hours_category,
    'applicable_hours', null,
    'percentage', wt.percentage,
    'amount_status', 'tbd',
    'calculated_amount_centavos', null,
    'unresolved_reason',
    'ND allocation between regular and overtime hours is not confirmed without a break timestamp.'
  )
  from public.wage_types as wt
  where wt.code = '2252'
    and wt.category = 'REGULAR_WORK_DAY'
    and wt.hours_category = 'EXCESS'
$$;

create function pg_temp.save_snapshot(p_lines jsonb, p_work_date date)
returns uuid
language sql
as $$
  select public.save_shift_snapshot(
    p_work_date,
    (p_work_date::timestamp + time '21:00') at time zone 'Asia/Manila',
    ((p_work_date + 1)::timestamp + time '06:00') at time zone 'Asia/Manila',
    'REGULAR_WORK_DAY',
    false,
    'STANDARD',
    8,
    false,
    8,
    1,
    7,
    time '22:00',
    time '06:00',
    'Asia/Manila',
    2::smallint,
    34800,
    12,
    261,
    8,
    1600,
    200,
    9,
    8,
    8,
    0,
    0,
    0,
    p_lines
  );
$$;

grant execute on function pg_temp.estimated_2211_line(numeric, bigint)
  to authenticated, anon;
grant execute on function pg_temp.tbd_2252_line() to authenticated, anon;
grant execute on function pg_temp.save_snapshot(jsonb, date)
  to authenticated, anon;

select is(
  (
    select has_function_privilege('anon', p.oid, 'execute')
    from pg_catalog.pg_proc as p
    join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'save_shift_snapshot'
  ),
  false,
  'anon cannot execute save_shift_snapshot'
);

set local role anon;
set local request.jwt.claim.sub = '';
set local request.jwt.claim.role = 'anon';
set local request.jwt.claims = '{"role":"anon"}';

select throws_ok(
  $$select pg_temp.save_snapshot('[]'::jsonb, date '2026-10-01')$$,
  '42501',
  null,
  'anon execute of save_shift_snapshot is denied'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '123e4567-e89b-12d3-a456-426614174000';
set local request.jwt.claim.role = 'authenticated';
set local request.jwt.claims = '{"sub":"123e4567-e89b-12d3-a456-426614174000","role":"authenticated"}';

select lives_ok(
  $$select pg_temp.save_snapshot(
      jsonb_build_array(
        pg_temp.estimated_2211_line(7, 14000),
        pg_temp.tbd_2252_line()
      ),
      date '2026-10-01'
    )$$,
  'authenticated employee can save their own snapshot'
);

select is(
  (select count(*) from public.shifts),
  1::bigint,
  'the shift row commits'
);

select is(
  (select count(*) from public.nd_records),
  1::bigint,
  'the nd_records row commits'
);

select is(
  (select count(*) from public.nd_wage_type_lines),
  2::bigint,
  'both wage-type lines commit'
);

select is(
  (select employee_id from public.shifts),
  '123e4567-e89b-12d3-a456-426614174000'::uuid,
  'stored employee owner is auth.uid() even when the payload has no owner field'
);

select is(
  (
    select l.applicable_hours
    from public.nd_wage_type_lines as l
    where l.wage_type_code = '2211'
  ),
  7.00,
  'estimated lines store applicable hours'
);

select is(
  (
    select l.calculated_amount_centavos
    from public.nd_wage_type_lines as l
    where l.wage_type_code = '2211'
  ),
  14000::bigint,
  'estimated lines store integer centavos'
);

select is(
  (
    select l.calculated_amount_centavos
    from public.nd_wage_type_lines as l
    where l.wage_type_code = '2252'
  ),
  null,
  'tbd lines store null centavos'
);

select is(
  (
    select l.applicable_hours
    from public.nd_wage_type_lines as l
    where l.wage_type_code = '2252'
  ),
  null,
  'tbd lines may store null hours'
);

set local request.jwt.claim.sub = '987fcdeb-51a2-43d7-9012-345678901234';
set local request.jwt.claims = '{"sub":"987fcdeb-51a2-43d7-9012-345678901234","role":"authenticated"}';

select is(
  (select count(*) from public.shifts),
  0::bigint,
  'a second employee cannot read the first employee shift'
);

select is(
  (select count(*) from public.nd_records),
  0::bigint,
  'a second employee cannot read the first employee nd record'
);

select is(
  (select count(*) from public.nd_wage_type_lines),
  0::bigint,
  'a second employee cannot read the first employee wage lines'
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
  'authenticated users cannot insert wage_types'
);

select throws_ok(
  $$update public.wage_types set description = 'blocked'$$,
  '42501',
  null,
  'authenticated users cannot update wage_types'
);

select throws_ok(
  $$delete from public.wage_types$$,
  '42501',
  null,
  'authenticated users cannot delete wage_types'
);

set local request.jwt.claim.sub = '123e4567-e89b-12d3-a456-426614174000';
set local request.jwt.claims = '{"sub":"123e4567-e89b-12d3-a456-426614174000","role":"authenticated"}';

select throws_ok(
  $$select pg_temp.save_snapshot(
      jsonb_build_array(pg_temp.estimated_2211_line(7, null)),
      date '2026-10-02'
    )$$,
  '23514',
  null,
  'an estimated line with null centavos fails'
);

select throws_ok(
  $$select pg_temp.save_snapshot(
      jsonb_build_array(
        jsonb_build_object(
          'wage_type_id', '00000000-0000-0000-0000-000000000000',
          'wage_type_code', '2211',
          'category', 'REGULAR_WORK_DAY',
          'hours_category', 'FIRST_8',
          'applicable_hours', 7,
          'percentage', 10,
          'amount_status', 'estimated',
          'calculated_amount_centavos', 14000,
          'unresolved_reason', null
        )
      ),
      date '2026-10-03'
    )$$,
  'P0001',
  null,
  'an unknown wage_type_id fails'
);

select throws_ok(
  $$select pg_temp.save_snapshot(
      jsonb_build_array(pg_temp.estimated_2211_line(null, 14000)),
      date '2026-10-04'
    )$$,
  '23514',
  null,
  'an estimated line with null hours fails'
);

reset role;
set local request.jwt.claim.sub = '';
set local request.jwt.claim.role = '';
set local request.jwt.claims = '';

select is(
  (
    select count(*)
    from public.shifts
    where work_date in (date '2026-10-02', date '2026-10-03', date '2026-10-04')
  ),
  0::bigint,
  'a child-line failure rolls back the shift'
);

select is(
  (
    select count(*)
    from public.nd_records as r
    join public.shifts as s on s.id = r.shift_id
    where s.work_date in (date '2026-10-02', date '2026-10-03', date '2026-10-04')
  ),
  0::bigint,
  'a child-line failure rolls back the nd record'
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

select * from finish();

rollback;
