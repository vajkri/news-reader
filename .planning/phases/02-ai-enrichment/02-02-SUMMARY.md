---
phase: 02-ai-enrichment
plan: 02
subsystem: api
tags: [vitest, cron-jobs, next-api-route, enrichment, testing]

requires:
  - phase: 02-01
    provides: enrichment logic (fetchUnenrichedArticles, enrichArticlesBatch, saveEnrichmentResults, ArticleEnrichmentSchema)

provides:
  - GET /api/enrich cron endpoint with CRON_SECRET auth and maxDuration=60
  - vercel.json with 2 cron jobs: /api/fetch (every 30min) and /api/enrich (every hour)
  - Vitest test infrastructure with @/ path alias resolution
  - 12 unit tests covering enrichment schema, prompt building, DB save, error handling, route auth

affects: [03-feed-display, testing]

tech-stack:
  added: [vitest ^4.1.0]
  patterns: [cron-route-with-maxDuration, vitest-with-path-aliases, mock-server-only-in-tests]

key-files:
  created:
    - src/app/api/enrich/route.ts
    - src/lib/enrich.test.ts
    - src/app/api/enrich/route.test.ts
    - vitest.config.ts
  modified:
    - vercel.json
    - package.json

key-decisions:
  - "GET (not POST) on /api/enrich because Vercel cron jobs invoke via GET by default"
  - "maxDuration=60 on enrich route to allow time for AI API calls without hitting default timeout"
  - "Vitest v4 installed; vitest.config.ts uses path alias @/ -> ./src for test imports"

patterns-established:
  - "Cron route pattern: export maxDuration, export GET, check Authorization: Bearer CRON_SECRET, return NextResponse.json"
  - "Test mock pattern: vi.mock('server-only', () => ({})) prevents server-only import errors in test environment"
  - "prisma.article.update called with topics as JSON.stringify(array), enrichedAt as new Date()"

requirements-completed: [AIPL-01, AIPL-02, AIPL-03, AIPL-04]

duration: 3min
completed: 2026-03-19
---

# Phase 02 Plan 02: AI Enrichment Cron Route and Vitest Tests Summary

**GET /api/enrich cron endpoint with CRON_SECRET auth, hourly vercel.json schedule, and Vitest with 12 unit tests covering the full enrichment pipeline**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-19T17:40:40Z
- **Completed:** 2026-03-19T17:43:23Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Created `/api/enrich` GET handler with CRON_SECRET Bearer auth, empty-batch short-circuit, AI call, DB save, and structured error response
- Updated vercel.json to include second cron job: `/api/enrich` at `0 * * * *` (hourly), consuming the last Hobby plan slot alongside the existing fetch cron
- Set up Vitest v4 with `vitest.config.ts` and `@/` path alias; added `"test": "vitest run"` script to package.json
- 12 passing tests: prompt formatting, schema validation (correct data + rejection cases), DB save with JSON.stringify topics, error collection, generateText call parameters, SEED_TOPICS/BATCH_LIMIT constants, and route 401 auth

## Task Commits

1. **Task 1: Create enrichment cron route and update vercel.json** - `7462ded` (feat)
2. **Task 2: Set up Vitest and write enrichment unit tests** - `0cc2337` (feat)

## Files Created/Modified

- `src/app/api/enrich/route.ts` - GET cron handler with auth, enrichment pipeline call, JSON response
- `vercel.json` - Added second cron entry for /api/enrich on hourly schedule
- `vitest.config.ts` - Vitest config with node environment and @/ alias
- `package.json` - Added vitest devDependency and test script
- `src/lib/enrich.test.ts` - 10 unit tests for enrichment logic functions and constants
- `src/app/api/enrich/route.test.ts` - 2 route auth tests (401 without header, 401 with wrong token)

## Decisions Made

- GET method on `/api/enrich` to match Vercel's default cron invocation behavior (the existing `/api/fetch` uses POST, which may only work for manual triggers)
- `maxDuration = 60` exported from route to give headroom for AI API calls on Hobby plan
- Vitest v4 (latest) installed; no `@vitejs/plugin-react` needed since tests are server-side node environment only

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Enrichment pipeline fully operational: cron configured, endpoint secured, logic tested
- Phase 03 (feed display) can consume `summary`, `topics`, `importanceScore` from enriched articles
- `AI_GATEWAY_API_KEY` and `CRON_SECRET` must be set in Vercel project environment variables before production deployment

---
*Phase: 02-ai-enrichment*
*Completed: 2026-03-19*

## Self-Check: PASSED

All files present and commits verified:
- src/app/api/enrich/route.ts: FOUND
- vercel.json: FOUND
- vitest.config.ts: FOUND
- src/lib/enrich.test.ts: FOUND
- src/app/api/enrich/route.test.ts: FOUND
- Commit 7462ded: FOUND
- Commit 0cc2337: FOUND
