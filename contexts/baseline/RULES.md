# Rules

Canonical copy: repository root `AGENTS.md` and `RULES.md`. This file keeps plugin-format pointers in sync with Voyix Shift.

## Must always

- Delegate domain work to the Voyix agents listed in `contexts/rules/common/agents.md`.
- Write tests when the plan names them. Do not enforce an 80% coverage gate.
- Validate inputs at Server Actions with Zod. Keep RLS intact.
- Follow existing `web/` patterns. Do not invent a repository/API layer.
- Keep diffs focused on the requested slice.

## Must never

- Include secrets, tokens, or database passwords in output or commits.
- Invent payroll rules, ADP codes, or holiday calendars.
- Bypass RLS, authorize from `user_metadata`, or grant `anon` on app tables.
- Ship UI without a browser check of the changed flow.
- Use `python-reviewer` or `seo-specialist` on this repo.

## Agent format

- Source prompts: `contexts/agents/*.md`
- Cursor mirrors: `.cursor/agents/voyix-*.md`
- Frontmatter: `name`, `description`. Cursor also uses `model`.
- File names are lowercase with hyphens and match the agent name.

## Skill format

- Skills live in `.agents/skills/<name>/SKILL.md`
- Frontmatter: `name`, `description`
- Optional Codex UI: `agents/openai.yaml`
- Impeccable is installed at `.cursor/skills/impeccable`

## Rule format

- Shared notes: `contexts/rules/<domain>/`
- Always-on Cursor rules: `.cursor/rules/*.mdc`

## Git

Commit only when asked. Do not update git config. Do not push unless asked.
