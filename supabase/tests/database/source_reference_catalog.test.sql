begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

select ok(
  (select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'calendar_sources'),
  'calendar_sources has RLS enabled'
);
select ok((select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'calendar_events'), 'calendar_events has RLS enabled');
select ok((select relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'reference_codes'), 'reference_codes has RLS enabled');

select ok(not has_table_privilege('anon', 'public.calendar_sources', 'SELECT'), 'anon cannot select source metadata');
select ok(not has_table_privilege('anon', 'public.calendar_events', 'SELECT'), 'anon cannot select source events');
select ok(not has_table_privilege('anon', 'public.reference_codes', 'SELECT'), 'anon cannot select reference codes');
select ok(has_table_privilege('authenticated', 'public.calendar_sources', 'SELECT'), 'authenticated can select source metadata');
select ok(has_table_privilege('authenticated', 'public.calendar_events', 'SELECT'), 'authenticated can select source events');
select ok(has_table_privilege('authenticated', 'public.reference_codes', 'SELECT'), 'authenticated can select reference codes');

select ok(not has_table_privilege('authenticated', 'public.calendar_events', 'INSERT'), 'authenticated cannot insert source events');
select ok(not has_table_privilege('authenticated', 'public.calendar_events', 'UPDATE'), 'authenticated cannot update source events');
select ok(not has_table_privilege('authenticated', 'public.calendar_events', 'DELETE'), 'authenticated cannot delete source events');
select ok(not has_table_privilege('authenticated', 'public.reference_codes', 'INSERT'), 'authenticated cannot insert reference codes');
select ok(not has_table_privilege('authenticated', 'public.reference_codes', 'UPDATE'), 'authenticated cannot update reference codes');

select is((select count(*) from public.calendar_events where source_id = 'ncr-voyix-cebu-2026'), 69::bigint, 'Cebu source has 69 calendar events');
select is((select count(*) from public.reference_codes where source_id = 'ncr-voyix-cebu-2026'), 14::bigint, 'Cebu source has 14 non-ND reference codes');
select is((select calendar_sha256 from public.calendar_sources where id = 'ncr-voyix-cebu-2026'), 'f229a4efdde407f2a17efe44102b71d5d6ee65c8c639024f62f9e18d38eadf09', 'calendar provenance hash is retained');
select is((select code_sha256 from public.calendar_sources where id = 'ncr-voyix-cebu-2026'), 'ffde16184f5e545b4203dcddacd4c2ff0de27d14a1345fdc8075e22e221d440c', 'ADP provenance hash is retained');

select * from finish();
rollback;
