# Surfaces

## UI

Docs: `DESIGN.md`, `07-SETUP-PLAN.md`, `.superdesign/design-system.md`, `05-USER-INTERFACE.md`

Skills: `design-taste-frontend`, `minimalist-ui`, `shadcn`, `apple-design`, `accessibility`, `browser-qa`

Cursor rule: `.cursor/rules/voyix-design.mdc`

Impeccable: `.cursor/skills/impeccable` for an Impeccable pass only. Never `impeccable init`.

Canonical taste skills are `design-taste-frontend` and `minimalist-ui`. Skip `taste-skill`, `taste-skill-v1`, `gpt-tasteskill`, and `minimalist-skill` unless comparing.

## Engine

Docs: `01-BUSINESS-RULES.md`, `02-WAGE-TYPES.md`, `03-CALCULATION-ENGINE.md`

Skills: `tdd-workflow`, `verification-loop`

Cursor rule: `.cursor/rules/voyix-engine.mdc`

`calculateNd` is the only money/hours entry. Decimal strings, centavos. 9pm–6am with break excluded → 7.00 hours, 2211, 14000 centavos at ₱200.

## Schema

Docs: `04-DATA-MODEL.md`, `07-SETUP-PLAN.md` (Supabase data model)

Skills: `supabase`, `supabase-postgres-best-practices`

Cursor rule: `.cursor/rules/voyix-supabase.mdc`

Hosted project: `dvfxyrcxxktjgutpgcyw`. Always `supabase --agent no`.

## Auth

Docs: `07-SETUP-PLAN.md` Task 6 / client rules

Skills: `supabase`, `security-review`

No manager accounts. Email + password. Employee ID is a profile field. Password ≥ 12. Duplicate employee ID is a field error.

## Ship

Docs: `07-SETUP-PLAN.md` Task 8

Vercel root `web`, region Singapore when creating a new project. Env names only: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
