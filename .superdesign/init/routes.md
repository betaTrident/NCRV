# Routes

Next.js 16 App Router under `web/src/app`. The root layout applies global fonts and tokens. `(app)` routes use the authenticated `AppShell`; `(auth)` routes use the signed-out-only group layout and each page composes `AuthSplit`.

| URL | Route file | Layout | Summary |
| --- | --- | --- | --- |
| `/` | `src/app/(app)/page.tsx` | Root → authenticated app group → AppShell | Overview: payroll-period banner, metrics, recent-shift ledger, and explicit empty/error states. |
| `/shift/new` | `src/app/(app)/shift/new/page.tsx` | AppShell | Shift calculation and save flow; configuration-backed preview. |
| `/records` | `src/app/(app)/records/page.tsx` | AppShell | Filterable saved-shift ledger. |
| `/records/:id` | `src/app/(app)/records/[id]/page.tsx` | AppShell | Immutable saved calculation trace and wage lines. |
| `/calendar` | `src/app/(app)/calendar/page.tsx` | AppShell | Holiday/period reference empty state; no dates invented. |
| `/settings` | `src/app/(app)/settings/page.tsx` | AppShell | Account settings placeholder and sign out. |
| `/login` | `src/app/(auth)/login/page.tsx` | Root → auth group → AuthSplit | Employee sign-in form. |
| `/signup` | `src/app/(auth)/signup/page.tsx` | Root → auth group → AuthSplit | Profile creation form. |
| `/forgot-password` | `src/app/(auth)/forgot-password/page.tsx` | Root → auth group → AuthSplit | Password reset-request form. |
| `/reset-password` | `src/app/reset-password/page.tsx` | Root → AuthSplit (page-local) | New-password form or expired-link state. |
| `/privacy` | `src/app/privacy/page.tsx` | Root (standalone) | Privacy notice. |
| `/terms` | `src/app/terms/page.tsx` | Root (standalone) | Terms page. |
| `/auth/confirm` | `src/app/auth/confirm/route.ts` | Route handler | Auth confirmation exchange/redirect handler; not a visual page. |

No separate client router configuration exists: file-system routing is the source of truth.

