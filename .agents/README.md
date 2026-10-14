# Skills

Runtime skill tree for Cursor, Codex, and Gemini. Path: `.agents/skills/<name>/SKILL.md`.

Do not copy this tree into `.gemini/skills`. Gemini and Codex both scan `.agents/skills/` from the repo.

## Load by default (this product)

| Skill | When |
| --- | --- |
| `voyix-shift-workflow` | Start of a feature slice |
| `design-taste-frontend` | UI taste / anti-slop |
| `minimalist-ui` | Quiet, dense employee UI |
| `shadcn` | Legacy migration reference only; the runtime uses Voyix Ant adapters |
| `apple-design` | Press feedback, spatial motion, reduced-motion, restraint (CSS only on Voyix) |
| `accessibility` | Keyboard, names, contrast |
| `browser-qa` | Browser verification of UI |
| `supabase` | Auth, RLS, CLI, clients |
| `supabase-postgres-best-practices` | SQL, indexes, RLS performance |
| `tdd-workflow` | Named characterization / contract tests |
| `verification-loop` | Before calling a slice done |
| `security-review` | Auth, secrets, Server Actions |
| `nextjs-turbopack` | Next 16 / Turbopack issues |
| `frontend-patterns` | React/Next composition that still obeys Voyix shell contracts |
| `git-workflow` | When the user asked to commit or open a PR |
| `documentation-lookup` | Library docs (prefer Context7 / Supabase MCP first) |

Impeccable stays at `.cursor/skills/impeccable`. Never run `impeccable init`.

## Canonical vs duplicate taste

Use `design-taste-frontend` and `minimalist-ui` (locked in `skills-lock.json`). Do not also load `taste-skill`, `taste-skill-v1`, `gpt-tasteskill`, or `minimalist-skill` unless comparing.

## Parked unless the user names them

`python-patterns`, `python-testing`, `seo`, `brutalist-skill`, `soft-skill`, `imagegen-frontend-mobile`, `docker-patterns` as a default architecture, `backend-patterns` / `api-design` when they push a public REST API, `redesign-skill` / `stitch-skill` / `image-to-code-skill` except as explicit design exploration.

## Available on request

| Skill | When |
| --- | --- |
| `logo-design` | Logo, wordmark, brand-mark, favicon, or identity-system work explicitly requested by the user. It does not override Voyix's established brand constraints. |

## Adding a skill

Put it in `.agents/skills/<name>/` with `SKILL.md`. Add `agents/openai.yaml` if Codex should show it in the skill picker. Record source in `skills-lock.json` when it came from GitHub.

## October 15, 2026 redesign execution contract

The user authorized production implementation of Direction A — Editorial Night Ledger and approved the recommended Calendar/Week package: Day remains default; reviewed Week records save atomically with idempotent retries; Calendar uses Month, Week, and References; the read-only Cebu 2026 source is explicitly selected; non-ND codes remain reference-only; filing reminders are source-labelled guidance.

Ant Design is the interaction primitive layer behind `web/src/components/ui/**`. `AntdRegistry` and the small `VoyixAntProvider` preserve the root Server Component. Product components, native date/time inputs, semantic record tables, Lucide icons, Server Actions/`useActionState`, and CSS tokens remain authoritative. Use explicit `Button` and `ButtonLink`; no polymorphic `asChild` contract, direct route-level Ant imports, Ant Form, Ant icons, default dashboard layout, GSAP, or Framer Motion. Controls are at least 44 px; control motion is 180 ms and the page entrance is 280 ms with reduced-motion support.

Source data is separate from employee-owned facts and the active wage engine. No source date silently sets classification. Only ordinary-day code 2211 has a confirmed money formula; all others stay TBD. See `docs/SOURCE-REFERENCE-VERIFICATION.md` for independent PDF comparison and provenance. Source imports do not create personal payroll periods.

Earlier statements that implementation is paused or that Radix/shadcn must remain the runtime primitive layer are superseded by this execution contract. Historical setup examples are retained for context. Commit/push/deployment remain separate user actions.
