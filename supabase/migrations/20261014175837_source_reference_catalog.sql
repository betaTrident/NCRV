-- Read-only source catalogue transcribed from the supplied Cebu 2026 calendar and ADP reference PDFs.
create table public.calendar_sources (
  id text primary key,
  site text not null,
  year integer not null,
  calendar_file text not null,
  calendar_sha256 text not null,
  code_file text not null,
  code_page integer not null,
  code_sha256 text not null,
  created_at timestamptz not null default now()
);

create table public.calendar_events (
  source_id text not null references public.calendar_sources(id) on delete cascade,
  event_date date not null,
  label text not null,
  kind text not null check (kind in ('holiday', 'cutoff', 'payday')),
  classification text check (classification is null or classification in ('regular', 'special')),
  primary key (source_id, event_date, kind, label)
);

create table public.reference_codes (
  source_id text not null references public.calendar_sources(id) on delete cascade,
  code text not null,
  category text not null,
  hours_category text not null,
  percentage numeric(7, 2) not null,
  engine_active boolean not null default false,
  formula_status text not null default 'TBD' check (formula_status = 'TBD'),
  check (engine_active = false),
  primary key (source_id, code, category, hours_category)
);

alter table public.calendar_sources enable row level security;
alter table public.calendar_events enable row level security;
alter table public.reference_codes enable row level security;

revoke all on table public.calendar_sources, public.calendar_events, public.reference_codes from anon, authenticated, public;
grant select on table public.calendar_sources, public.calendar_events, public.reference_codes to authenticated;

create policy calendar_sources_select_authenticated on public.calendar_sources for select to authenticated using (true);
create policy calendar_events_select_authenticated on public.calendar_events for select to authenticated using (true);
create policy reference_codes_select_authenticated on public.reference_codes for select to authenticated using (true);

insert into public.calendar_sources (id, site, year, calendar_file, calendar_sha256, code_file, code_page, code_sha256)
values ('ncr-voyix-cebu-2026', 'Cebu', 2026, '2026_NCRV_Cebu Calendar.pdf', 'f229a4efdde407f2a17efe44102b71d5d6ee65c8c639024f62f9e18d38eadf09', 'New Hire - Setting of Expectations (1).pdf', 3, 'ffde16184f5e545b4203dcddacd4c2ff0de27d14a1345fdc8075e22e221d440c');

insert into public.calendar_events (source_id, event_date, label, kind, classification)
values
  ('ncr-voyix-cebu-2026', '2026-01-01', 'New Year''s Day', 'holiday', 'regular'),
  ('ncr-voyix-cebu-2026', '2026-01-06', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-01-15', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-01-21', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-01-30', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-02-04', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-02-13', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-02-17', 'Chinese New Year', 'holiday', 'special'),
  ('ncr-voyix-cebu-2026', '2026-02-18', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-02-24', 'Cebu Charter day', 'holiday', 'special'),
  ('ncr-voyix-cebu-2026', '2026-02-27', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-03-04', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-03-13', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-03-20', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-03-31', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-04-02', 'Maundy Thursday', 'holiday', 'regular'),
  ('ncr-voyix-cebu-2026', '2026-04-03', 'Good Friday', 'holiday', 'regular'),
  ('ncr-voyix-cebu-2026', '2026-04-04', 'Black Saturday', 'holiday', 'special'),
  ('ncr-voyix-cebu-2026', '2026-04-06', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-04-09', 'Araw ng Kagitingan', 'holiday', 'regular'),
  ('ncr-voyix-cebu-2026', '2026-04-15', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-04-21', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-04-30', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-05-01', 'Labor Day', 'holiday', 'regular'),
  ('ncr-voyix-cebu-2026', '2026-05-05', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-05-15', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-05-20', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-05-29', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-06-04', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-06-12', 'Independence Day', 'holiday', 'regular'),
  ('ncr-voyix-cebu-2026', '2026-06-15', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-06-19', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-06-30', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-07-06', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-07-15', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-07-21', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-07-31', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-08-05', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-08-06', 'Provincial Charter Day', 'holiday', 'special'),
  ('ncr-voyix-cebu-2026', '2026-08-14', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-08-21', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-08-21', 'Ninoy Aquino Day', 'holiday', 'special'),
  ('ncr-voyix-cebu-2026', '2026-08-28', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-08-31', 'National Heroes Day', 'holiday', 'regular'),
  ('ncr-voyix-cebu-2026', '2026-09-04', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-09-09', 'Osmeña Day', 'holiday', 'special'),
  ('ncr-voyix-cebu-2026', '2026-09-15', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-09-21', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-09-30', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-10-06', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-10-15', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-10-21', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-10-30', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-11-01', 'All Saints Day', 'holiday', 'special'),
  ('ncr-voyix-cebu-2026', '2026-11-02', 'All Souls Day', 'holiday', 'special'),
  ('ncr-voyix-cebu-2026', '2026-11-04', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-11-13', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-11-20', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-11-27', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-11-30', 'Bonifacio Day', 'holiday', 'regular'),
  ('ncr-voyix-cebu-2026', '2026-12-04', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-12-08', 'Immaculate Conception', 'holiday', 'special'),
  ('ncr-voyix-cebu-2026', '2026-12-15', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-12-21', 'Payroll Cut-off', 'cutoff', null),
  ('ncr-voyix-cebu-2026', '2026-12-24', 'Christmas Eve', 'holiday', 'special'),
  ('ncr-voyix-cebu-2026', '2026-12-25', 'Christmas Day', 'holiday', 'regular'),
  ('ncr-voyix-cebu-2026', '2026-12-29', 'NCPI Pay Day', 'payday', null),
  ('ncr-voyix-cebu-2026', '2026-12-30', 'Rizal Day', 'holiday', 'regular'),
  ('ncr-voyix-cebu-2026', '2026-12-31', 'Last Day of the Year', 'holiday', 'special');

insert into public.reference_codes (source_id, code, category, hours_category, percentage, engine_active, formula_status)
values
  ('ncr-voyix-cebu-2026', '2251', 'Ordinary Day', 'Excess of first 8 hours', 125, false, 'TBD'),
  ('ncr-voyix-cebu-2026', '2301', 'Rest Day', 'First 8 hours', 130, false, 'TBD'),
  ('ncr-voyix-cebu-2026', '2215', 'Special Public Holiday + Rest Day', 'First 8 hours', 150, false, 'TBD'),
  ('ncr-voyix-cebu-2026', '2235', 'Special Public Holiday + Rest Day', 'Excess of first 8 hours', 195, false, 'TBD'),
  ('ncr-voyix-cebu-2026', '2170', 'Regular/Public Holiday', 'First 8 hours', 100, false, 'TBD'),
  ('ncr-voyix-cebu-2026', '2226', 'Regular/Public Holiday', 'Excess of first 8 hours', 260, false, 'TBD'),
  ('ncr-voyix-cebu-2026', '2240', 'Regular/Public Holiday + Rest Day', 'First 8 hours', 260, false, 'TBD'),
  ('ncr-voyix-cebu-2026', '2246', 'Regular/Public Holiday + Rest Day', 'Excess of first 8 hours', 338, false, 'TBD'),
  ('ncr-voyix-cebu-2026', '2425', 'Double Regular Holiday', 'First 8 hours', 200, false, 'TBD'),
  ('ncr-voyix-cebu-2026', '2535', 'Double Regular Holiday', 'Excess of first 8 hours', 390, false, 'TBD'),
  ('ncr-voyix-cebu-2026', '2420', 'Double Regular Holiday + Rest Day', 'First 8 hours', 390, false, 'TBD'),
  ('ncr-voyix-cebu-2026', '2520', 'Double Regular Holiday + Rest Day', 'Excess of first 8 hours', 507, false, 'TBD'),
  ('ncr-voyix-cebu-2026', '2430', 'Special Public Holiday', 'First 8 hours', 30, false, 'TBD'),
  ('ncr-voyix-cebu-2026', '2233', 'Special Public Holiday', 'Excess of first 8 hours', 169, false, 'TBD');

