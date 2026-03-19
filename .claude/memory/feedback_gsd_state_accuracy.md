---
name: GSD state files must reflect reality — read actual sources, don't invent
description: STATE.md and ROADMAP.md must stay accurate. Pending todos come from .planning/todos/pending/, not invented. State tracking drifts when work happens outside GSD executor.
type: feedback
---

STATE.md and ROADMAP.md must accurately reflect the project's real state at all times.

**Why:** Phases 1–3 were executed across many sessions with significant manual work (styleguide iterations, design reviews, bug fixes) outside the GSD executor flow. The GSD state tracking auto-updates when the executor runs plans, but manual work causes drift. The user found both files deeply stale — Phase 1 listed as current when Phase 3 was complete.

**How to apply:**
1. **Pending Todos** come from `.planning/todos/pending/` — always read those files. Never invent todos or add items that aren't tracked there.
2. After completing work manually (outside GSD executor), proactively check if STATE.md and ROADMAP.md need updating — don't wait for the user to notice.
3. When running `phase complete` or other GSD tooling commands, verify the output actually updated the files correctly (check checkboxes, progress tables, plan counts). The tooling can partially fail silently.
4. Plan checkboxes in ROADMAP.md must be checked when plans are done — even if they were executed manually without SUMMARY.md files.
5. Blockers/Concerns should be pruned when resolved — don't leave stale entries about problems that were solved sessions ago.
