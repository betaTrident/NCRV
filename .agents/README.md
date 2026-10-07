# Skills

Runtime skill tree for Cursor, Codex, and Gemini. Path: `.agents/skills/<name>/SKILL.md`.

Do not copy this tree into `.gemini/skills`. Gemini and Codex both scan `.agents/skills/` from the repo.

## Load by default (this product)

| Skill | When |
| --- | --- |
| `voyix-shift-workflow` | Start of a feature slice |
| `design-taste-frontend` | UI taste / anti-slop |
| `minimalist-ui` | Quiet, dense employee UI |
| `shadcn` | Adding or fixing shadcn primitives |
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

## Adding a skill

Put it in `.agents/skills/<name>/` with `SKILL.md`. Add `agents/openai.yaml` if Codex should show it in the skill picker. Record source in `skills-lock.json` when it came from GitHub.
