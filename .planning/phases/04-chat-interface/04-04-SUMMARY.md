---
phase: 04-chat-interface
plan: 04
subsystem: api
tags: [postgres, full-text-search, prisma, ai-sdk, system-prompt]

requires:
  - phase: 04-chat-interface-03
    provides: Chat API route with tool-calling, rate limiting, ChatPanel UI
provides:
  - Postgres full-text search via $queryRaw with to_tsvector/plainto_tsquery
  - System prompt with negative guardrails preventing hallucinated capabilities
  - Article context sent as system message (not in user chat bubble)
  - Auto-regenerating Prisma client on dev startup
affects: [04-chat-interface]

tech-stack:
  added: []
  patterns:
    - "$queryRaw with tagged template literal for parameterized Postgres full-text search"
    - "sendMessage second argument for ChatRequestOptions body in AI SDK v6"

key-files:
  created: []
  modified:
    - src/lib/chat-tools.ts
    - src/lib/chat-tools.test.ts
    - src/app/api/chat/route.ts
    - src/components/features/chat/ChatPanel.tsx
    - package.json

key-decisions:
  - "plainto_tsquery over to_tsquery for natural language query handling (splits words, treats as AND)"
  - "sendMessage second arg (ChatRequestOptions.body) for articleContext, not useChat body option (removed in v6)"

patterns-established:
  - "$queryRaw tagged template literal for safe parameterized SQL in Prisma"
  - "ChatRequestOptions.body as second arg to sendMessage for extra request fields"

requirements-completed: [CHAT-01, CHAT-04]

duration: 9min
completed: 2026-03-22
---

# Phase 04 Plan 04: Search + Guardrails Gap Closure Summary

**Postgres full-text search via $queryRaw replacing substring matching, system prompt guardrails, and article context as server-side system message**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-22T06:59:55Z
- **Completed:** 2026-03-22T07:08:31Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Replaced Prisma `findMany` with `contains` with `$queryRaw` using Postgres `to_tsvector`/`plainto_tsquery` for natural language search
- Added CAPABILITIES AND LIMITATIONS section to system prompt preventing hallucinated capabilities
- Moved article context from user message prefix to server-side system message via `sendMessage` body option
- Added `prisma generate` to dev script for auto-regeneration on startup

## Task Commits

Each task was committed atomically:

1. **Task 1 (RED): Failing tests for full-text search** - `22a4fec` (test)
2. **Task 1 (GREEN): Full-text search implementation + dev script** - `f51cc2d` (feat)
3. **Task 2: System prompt guardrails + article context** - `5745470` (feat)

## Files Created/Modified
- `src/lib/chat-tools.ts` - searchArticlesTool now uses $queryRaw with to_tsvector/plainto_tsquery
- `src/lib/chat-tools.test.ts` - Tests verify $queryRaw usage, result mapping, null topics handling
- `src/app/api/chat/route.ts` - System prompt guardrails, articleContext from request body as system message
- `src/components/features/chat/ChatPanel.tsx` - sendMessage passes articleContext via body option, no [Context:] prefix
- `package.json` - Dev script includes prisma generate

## Decisions Made
- Used `plainto_tsquery` (not `to_tsquery`) because it handles natural language queries naturally, splitting on spaces and treating words as AND conditions
- Used `sendMessage` second argument `ChatRequestOptions.body` for articleContext because `useChat` in AI SDK v6 does not have a `body` option (removed from v6 API)
- Search across title + description + summary with `ts_rank` for relevance-based ordering

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] AI SDK v6 useChat does not have body option**
- **Found during:** Task 2 (ChatPanel articleContext)
- **Issue:** Plan suggested `useChat({ body: {...} })` but AI SDK v6 removed `body` from `UseChatOptions`
- **Fix:** Used `sendMessage(message, { body: { articleContext } })` via ChatRequestOptions second parameter
- **Files modified:** src/components/features/chat/ChatPanel.tsx
- **Verification:** Build passes with TypeScript strict mode
- **Committed in:** 5745470

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** API surface change only; same end result (articleContext in request body). No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Full-text search ready for production use with Postgres
- System prompt guardrails prevent AI from claiming capabilities it does not have
- Article context flows cleanly from UI to LLM without leaking into user chat bubbles

## Self-Check: PASSED

All 5 files verified present. All 3 commits verified in git log.
