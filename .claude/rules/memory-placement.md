# Memory & Documentation Placement

This project uses 4 locations for persistent knowledge. Never duplicate content across them.

## Placement test

Ask this before every write:

| Question | Location |
|---|---|
| "Must Claude follow this on every interaction?" | `CLAUDE.md` or `.claude/rules/` |
| "Did the user correct Claude or express a preference?" | `.claude/memory/` |
| "Is this describing what the project is or has?" | `.serena/memories/` (when configured) |
| "Is this project state, planning, or phase work?" | `.planning/` |

## Location details

### `CLAUDE.md` — Prescriptive conventions
Rules Claude must follow every session: code style, component patterns, design tokens, tool preferences.
Keep under 150 lines. If approaching the limit, extract scoped rules to `.claude/rules/`.

### `.claude/rules/` — Scoped prescriptive rules
Rules that apply to specific files or areas. Use `paths:` frontmatter to scope (e.g. `paths: tests/**`).

### `.claude/memory/` — Behavioral memories
Feedback corrections, user preferences, reference pointers. Things the user told Claude to do differently.
Each memory is a separate `.md` file with frontmatter (`name`, `description`, `type`).
`MEMORY.md` in this directory is the index — update it when adding or removing files.

### `.serena/memories/` — Descriptive project knowledge
Key files, architecture, discovered patterns. Not rules — descriptions of what the project is or has.
Available once Serena is configured.

### `.planning/` — Project state & planning
GSD-managed: roadmap, phases, research, assets, todos, state tracking.
Don't duplicate planning info into memory files.

### `CLAUDE.local.md` — Ephemeral / personal
Local URLs, sandbox credentials, current WIP focus. Not committed.

## Promoting memories

When a `.claude/memory/` entry has proven stable and generally applicable, promote it to `CLAUDE.md` or `.claude/rules/` and delete the memory file. The `/docs-review` command handles this systematically.
