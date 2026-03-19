# Session Wrap-Up

Run this at the end of every session. Work through all 4 phases in order.
Be thorough but efficient — auto-apply everything, don't ask for approval on
individual items.

---

## Phase 1: Ship It

Before anything else, make sure the work is actually done:

- Linting, tsc passing
- No debug code, console.logs, or TODOs left behind from this session
- Changes committed with a clear commit message
- If you touched a feature end-to-end, do a quick sanity check

If anything is unfinished, flag it clearly:

> TODO: [what and why]

Then continue to Phase 2 regardless.

---

## Phase 2: Remember It

Review what was learned during the session. Place each piece of knowledge
in the right location — do not duplicate across locations.

See `.claude/rules/memory-placement.md` for the full placement guide and decision framework.

Never write the same fact in two places. Use `@import` if a memory needs to be always-available in Claude Code.

Apply all memory writes now.

**Before committing — placement self-check:**

Re-read each item written this phase against the placement test in `.claude/rules/memory-placement.md`.

Anything in the wrong place — move it now, before the commit.

Then commit any changes to docs files:

```
git add CLAUDE.md .claude/memory/ .claude/rules/ .claude/commands/
git commit -m "docs: update project memory and conventions"
```

(Skip the commit if nothing changed.)

---

## Phase 3: Review & Improve

Analyze the conversation for self-improvement findings. If the session was
short or routine with nothing notable, say "Nothing to improve" and move on.

**Auto-apply all actionable findings immediately — do not ask for approval.**
Apply changes, then commit all docs changes together:

```
git add CLAUDE.md .claude/memory/ .claude/rules/ .claude/commands/
git commit -m "docs: apply wrap-up improvements"
```

Then present a summary.

**Finding categories:**

- **Skill gap** — Things Claude struggled with, got wrong, or needed multiple
  attempts to get right
- **Friction** — Repeated manual steps, things the user had to ask for
  explicitly that should have been automatic
- **Knowledge** — Facts about the project, preferences, or setup that Claude
  didn't know but should have
- **Automation** — Repetitive patterns that could become a skill, hook, or script
- **Docs drift** — Instructions or memories that feel duplicated, stale, or misplaced → fix inline using the same placement test from Phase 2; only escalate to `/docs-review` for cross-session or whole-system audits

**Action types:**

- **CLAUDE.md** — Edit the relevant project or global CLAUDE.md
- **Rules** — Create or update a `.claude/rules/` file
- **Memory** — Save a behavioral correction to `.claude/memory/`
- **Skill / Hook** — Document a new skill or hook spec to be built
- **CLAUDE.local.md** — Create or update per-project local context

Present a summary in two sections — applied first, then no-action:

```
Findings (applied):

1. Friction: User had to remind Claude to run tests after every change
   → [CLAUDE.md] Added rule: always run tests after editing source files

2. Skill gap: Got the migration command wrong twice
   → [Memory] Saved correct db migration command for this project

3. Knowledge: Staging env uses a different .env file
   → [CLAUDE.local.md] Noted staging env config path

---
No action needed:

4. Knowledge: API rate limits 429 → already in CLAUDE.md
```

---

## Phase 4: Publish It

Review the conversation for anything worth documenting beyond the codebase.
Look for:

- Interesting technical solutions or non-obvious debugging approaches
- Architecture decisions made and the reasoning behind them
- How-tos or setup guides that don't exist yet
- Lessons from things that went wrong

**If publishable material exists:**

Draft it and save to `Drafts/` in the project.

**If nothing is worth publishing:**

Say "Nothing worth publishing from this session" and you're done.
