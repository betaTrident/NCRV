-- Remove the human-readable employee ID field so a profile does not require
-- a workplace identifier, and record when the employee accepted the Terms.

alter table public.employees
  drop constraint if exists employees_employee_id_key;

alter table public.employees
  drop column if exists employee_id;

alter table public.employees
  add column terms_accepted_at timestamptz not null default now();

alter table public.employees
  alter column terms_accepted_at drop default;

comment on column public.employees.terms_accepted_at is
  'When the employee accepted the current Terms and Privacy Notice at signup.';
