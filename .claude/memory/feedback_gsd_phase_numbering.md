---
name: gsd-phase-numbering
description: User may have phases on other branches; always use exact phase numbers they specify, don't auto-assign
type: feedback
---

When inserting phases with /gsd:insert-phase, use the exact phase number the user specifies (e.g. 03.2) rather than auto-calculating.

**Why:** The user may have phases on other branches (e.g. 03.1 on a different feature branch) that aren't visible in the current branch's roadmap.

**How to apply:** If the user provides a decimal phase number explicitly, pass it through as-is rather than letting the CLI auto-calculate the next available decimal.
