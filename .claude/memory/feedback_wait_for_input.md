---
name: Wait for user input at checkpoints
description: Never implement design choices without explicit user selection — especially at human-verify checkpoints
type: feedback
---

When a task involves the user choosing between options (e.g., design proposals), ALWAYS wait for the user to state their choice before implementing anything.

**Why:** User presented stop-marker proposals for selection. I jumped straight to picking Proposal 1 and implementing it without waiting for their input. The user's message was a template with [X] placeholder — they hadn't chosen yet.

**How to apply:** At any human-verify checkpoint or decision point, present options/status and STOP. Do not proceed until the user explicitly states their choice. Even if the user's message seems to invite autonomous action, confirm before implementing design decisions.
