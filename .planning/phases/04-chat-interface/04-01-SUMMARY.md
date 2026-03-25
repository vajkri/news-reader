---
phase: 04-chat-interface
plan: 01
subsystem: api
tags: [prisma, rate-limiting, ai-sdk, tool-calling, vitest]

# Dependency graph
requires:
  - phase: 03.2-neon-migration
    provides: "Postgres database with JSONB topics field, Prisma schema"
provides:
  - "RateLimit Prisma model with migration for Postgres-based rate limiting"
  - "checkRateLimit and incrementRateLimit functions for 20 msg/hour enforcement"
  - "Three chat tools (searchArticlesTool, articlesByTopicTool, recentArticlesTool) for LLM tool-calling"
  - "CHAT_MODEL constant pointing to openai/gpt-5-mini"
affects: [04-02-chat-api-route, 04-03-chat-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Prisma RateLimit model with sliding window", "AI SDK tool() helper with Zod inputSchema", "mapArticleResponse for consistent tool output shape"]

key-files:
  created:
    - prisma/migrations/20260321204824_add_rate_limit/migration.sql
    - src/lib/rate-limit.ts
    - src/lib/rate-limit.test.ts
    - src/lib/chat-tools.ts
    - src/lib/chat-tools.test.ts
  modified:
    - prisma/schema.prisma
    - src/lib/ai.ts

key-decisions:
  - "RateLimit uses upsert with id:0 for expired-window reset to avoid orphan rows"
  - "Chat tools cast topics as (string[] | null) ?? [] to handle Prisma Json? type safely"

patterns-established:
  - "tool() mock pattern: vi.mock('ai', () => ({ tool: vi.fn((config) => config) })) returns config for direct execute() calls in tests"
  - "Rate limit sliding window: findFirst with windowStart >= cutoff, not per-request row creation"

requirements-completed: [CHAT-03, CHAT-04]

# Metrics
duration: 6min
completed: 2026-03-21
---

# Phase 04 Plan 01: Backend Chat Foundation Summary

**Prisma RateLimit model with 20 msg/hour sliding window, three LLM tool-calling tools (search, topic, recent), and CHAT_MODEL constant for openai/gpt-5-mini**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-21T20:47:18Z
- **Completed:** 2026-03-21T20:53:31Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- RateLimit Prisma model with @@index([key]) and migration applied to Neon Postgres
- checkRateLimit returns null (under limit) or minutes-until-reset; incrementRateLimit creates/updates records within 1-hour sliding window
- Three chat tools query articles by keyword, topic, or recency with enrichedAt guard and consistent mapped response shape
- CHAT_MODEL = 'openai/gpt-5-mini' exported alongside existing AI_MODEL
- 13 new unit tests (7 rate-limit + 6 chat-tools), full suite 44/44 green

## Task Commits

Each task was committed atomically:

1. **Task 1: Prisma RateLimit model + rate-limit library with tests**
   - `68dd591` (test: failing rate-limit tests - TDD RED)
   - `c7a2330` (feat: RateLimit model, migration, rate-limit library - TDD GREEN)

2. **Task 2: CHAT_MODEL constant + chat-tools library with tests**
   - `34261f5` (test: failing chat-tools tests - TDD RED)
   - `e122cef` (feat: CHAT_MODEL, chat-tools library - TDD GREEN)

## Files Created/Modified
- `prisma/schema.prisma` - Added RateLimit model with @@index([key])
- `prisma/migrations/20260321204824_add_rate_limit/migration.sql` - Migration for RateLimit table
- `src/lib/rate-limit.ts` - checkRateLimit and incrementRateLimit with WINDOW_MS and MAX_MESSAGES constants
- `src/lib/rate-limit.test.ts` - 7 unit tests covering window enforcement, count increment, reset
- `src/lib/ai.ts` - Added CHAT_MODEL = 'openai/gpt-5-mini' (AI_MODEL unchanged)
- `src/lib/chat-tools.ts` - searchArticlesTool, articlesByTopicTool, recentArticlesTool with Prisma queries
- `src/lib/chat-tools.test.ts` - 6 unit tests covering query args, response shape, descriptions

## Decisions Made
- RateLimit uses upsert with id:0 sentinel for expired-window reset, avoiding orphan rows accumulating
- Chat tools cast topics as `(string[] | null) ?? []` to handle Prisma `Json?` type safely (Pitfall 7 from research)
- Test mock pattern for `tool()`: mock returns config object so `.execute()` can be called directly without Zod validation layer

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Prisma migrate requires `DATABASE_URL_UNPOOLED` env var; `.env.local` not read by default Prisma CLI. Resolved by using `dotenv-cli -e .env.local` prefix.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Rate-limit and chat-tools libraries are ready for consumption by the chat API route (Plan 02)
- CHAT_MODEL constant available for streamText call in route handler
- All tests green, build passes

## Self-Check: PASSED

All 8 files verified present. All 4 commit hashes found in git log.

---
*Phase: 04-chat-interface*
*Completed: 2026-03-21*
