---
name: memory-in-repo-only
description: All memories must be saved in the repo (.claude/memory/), never in global or project-level Claude memory outside the repo
type: feedback
---

Save all memories to `.claude/memory/` inside the repo, not to the global Claude memory directory (`~/.claude/projects/*/memory/`).

**Why:** User wants all project knowledge version-controlled and visible in the repo. Global memory is invisible to other tools and collaborators.

**How to apply:** When saving any memory (feedback, user, project, reference), always write to `/Users/krisztinavajda/dev/news-reader/.claude/memory/` and update the in-repo `MEMORY.md` index.
