---
id: SEED-002
status: dormant
planted: 2026-03-21
planted_during: v1.0/Phase 4 (Chat Interface)
trigger_when: conversation persistence or user accounts in v2
scope: Small
---

# SEED-002: Recent questions memory for chat panel

## Why This Matters

Users with ADHD often re-research the same topics. A lightweight "recent questions" list lets them quickly re-ask past queries without retyping, reducing friction and cognitive load. Just the question text, not full conversation threads.

## When to Surface

**Trigger:** When adding conversation persistence or user accounts in v2

This seed should be presented during `/gsd:new-milestone` when the milestone
scope matches any of these conditions:
- Conversation persistence or history features
- User accounts / authentication (AUTH-01)
- Chat UX improvements or personalization

## Scope Estimate

**Small** -- A localStorage array of past query strings + dropdown/list UI in the chat panel. A few hours of work.

## Breadcrumbs

Related code and decisions found in the current codebase:

- `.planning/phases/04-chat-interface/.continue-here.md` -- Chat architecture decisions (10-turn history, single conversation, ephemeral state)
- `.planning/REQUIREMENTS.md` -- CHAT-01/02 (natural language queries, quick lookups + deeper analysis)
- `.planning/PROJECT.md` -- AUTH-01 deferred to v2 (user accounts)
- `src/app/chat/` -- Chat page (will be created in Phase 4)

## Notes

Discussed during Phase 4 discuss-phase. User loved the idea but agreed it's not v1 scope. The chat panel uses in-memory state (clears on refresh), so this would be the first step toward any persistence layer.
