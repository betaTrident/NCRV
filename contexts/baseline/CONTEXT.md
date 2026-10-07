# Product context

**Product:** Voyix Shift  
**User:** An employee on rotational night shifts, not a payroll clerk and not a manager.  
**Value:** A private record of night-differential hours. Enter a shift, see how the hours were estimated, save the snapshot.

It is not an employer payroll system. It does not submit time, approve wages, or verify employment.

Voice: plain, concise, non-authoritative about payroll. Call amounts estimates. Unresolved wage rules stay visible as TBD.

Visual system is `DESIGN.md`. Brand accent `#5F249F`. Type is Manrope and IBM Plex Mono. Do not replace the palette, type, or shell.

## Workflow

Sign in → Overview → Add shift → calculate ND → applicable wage-type lines → save record → My records / Calendar / Settings.

## Technical shape

- Frontend and server: `web/` (Next.js App Router, Server Actions)
- Data: hosted and local Supabase (`supabase/`), RLS on every app table
- No `/backend` service, no public REST envelope, no manager accounts

## Constraints

- No silent invention of ADP codes, holiday dates, or money formulas
- Authorization is `employees.id = auth.users.id`, never `user_metadata`
- One question for v1 features: does this help an employee calculate, understand, or track night differential?
