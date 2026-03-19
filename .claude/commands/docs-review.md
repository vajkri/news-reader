# /docs-review — Periodic Doc Audit

Run after major milestones, after extended feature work, or when /wrap flags docs as cluttered.
Work through all 4 phases in order. Be thorough but efficient.

---

## Phase 1: Inventory

Read every file in the instruction/memory system:

- `CLAUDE.md`
- `.claude/rules/*.md` (all files)
- `.claude/commands/*.md` (all files)
- `.claude/memory/*.md` (all files)
- `.serena/memories/*.md` (all files, if Serena is configured)

Present a table: file path | line count | purpose summary.

---

## Phase 2: Audit

Apply these 5 checks across all files:

**Check 1 — Duplication**
Same fact, rule, or example appears in 2+ files. Flag both locations.

**Check 2 — Misplacement**
Apply the placement test to every piece of content:

- "Must Claude follow this on every interaction?" → yes = belongs in `CLAUDE.md` or `.claude/rules/`
- "Is this a behavioral correction, user preference, or reference pointer?" → yes = belongs in `.claude/memory/`
- "Is this describing what the project is or has?" → yes = belongs in `.serena/memories/` (when configured)
- "Is this project state, planning, or phase work?" → yes = belongs in `.planning/`

Flag anything in the wrong place.

**Check 3 — Size drift**

- CLAUDE.md > 150 lines → warn
- CLAUDE.md > 200 lines → critical: flag for splitting via `.claude/rules/` or `@import`

**Check 4 — Contradictions**
Two rules give conflicting guidance for the same situation (e.g. "always use X" vs "prefer Y" for the same context). Flag both.

**Check 5 — Staleness**
References to: WIP phases that are now complete, "not yet configured" tooling that now exists, dead file paths, or one-time instructions that no longer apply.

---

## Phase 3: Report

Present all findings in a table:

| #   | File(s)                    | Check        | Excerpt                        | Suggested action                                         |
| --- | -------------------------- | ------------ | ------------------------------ | -------------------------------------------------------- |
| 1   | `.claude/memory/foo.md`    | Misplacement | "Always use tv() for variants" | [PROMOTE] → `CLAUDE.md` or `.claude/rules/`              |
| 2   | `CLAUDE.md` + `bar.md`     | Duplication  | Design token rules             | [DELETE] from `bar.md`                                   |
| 3   | `CLAUDE.md`                | Size drift   | 210 lines                      | [SPLIT] extract token section → `rules/design-tokens.md` |

Action legend:

- `[MOVE]` — content belongs in a different file
- `[DELETE]` — duplicate; authoritative copy exists elsewhere
- `[PROMOTE]` — memory/serena entry that has proven stable; make it a permanent rule in CLAUDE.md or `.claude/rules/`
- `[SPLIT]` — file too large; extract section to a new rules file
- `[UPDATE]` — stale reference to fix

Ask: "Apply all? (yes / select by number / skip)"

---

## Phase 4: Apply

For each approved finding:

1. Edit, move, or delete files as needed
2. Update `.claude/memory/MEMORY.md` index if memory files changed
3. Update `.serena/memories/MEMORY.md` links if Serena files changed
4. Commit all changes together:

```bash
git add CLAUDE.md .claude/rules/ .claude/commands/ .claude/memory/ .gitignore
git commit -m "docs: apply docs-review cleanup"
```

Present a summary of what changed.
