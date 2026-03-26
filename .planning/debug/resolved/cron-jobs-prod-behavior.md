---
status: awaiting_human_verify
trigger: "Production cron jobs (fetch and enrich) may not be working correctly. Two concerns: 1. Fetch cron: ran ~30 min after a previous fetch during off-hours, yet yielded 15 new articles (expected 0-3). 2. Enrich cron: daily briefing is generated but max article count not respected; unclear if enrichment runs correctly"
created: 2026-03-26T00:00:00Z
updated: 2026-03-26T00:02:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: CONFIRMED — two bugs fixed:
  1. /api/fetch POST handler changed to GET (Vercel cron sends GET)
  2. briefing/page.tsx priority articles now capped at MAX_BRIEFING_ARTICLES = 20

test: lint passed (0 errors), build passed clean
expecting: user confirms fetch cron runs in production and briefing respects 20-article limit
next_action: await human verification

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: Fetch should find 0-3 new articles when run 30 min after a previous fetch during off-hours. Enrich should respect max article display limits in daily briefings.
actual: 15 new articles appeared after a short-interval fetch. Daily briefing shows more articles than the configured max.
errors: No specific error messages reported
reproduction: Observe after fetch cron runs in production; check daily briefing article count
started: Recent behavior, unclear exactly when it started

## Eliminated
<!-- APPEND only - prevents re-investigating -->

- hypothesis: Deduplication logic in fetch-sources.ts is broken
  evidence: Logic is correct — loads knownGuids from DB for sitemap sources, then checks existingGuids before inserting. No bug here.
  timestamp: 2026-03-26T00:01:00Z

- hypothesis: Sitemap MAX_NO_LASTMOD cap (50) is causing excessive fetches
  evidence: The cap only applies to no-lastmod entries and is a safety limit, not a source of duplicate articles
  timestamp: 2026-03-26T00:01:00Z

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-03-26T00:01:00Z
  checked: vercel.json cron config
  found: Only ONE fetch cron at "0 5 * * *" (5 AM UTC daily) and ONE enrich cron at "0 6 * * *". No multiple/rapid intervals.
  implication: The "30 min gap" between fetches the user observed was NOT from the cron running twice — it must have been a manual trigger or the previous run was manual/UI-triggered.

- timestamp: 2026-03-26T00:01:00Z
  checked: src/app/api/fetch/route.ts
  found: Route only exported `async function POST(...)`. No GET handler.
  implication: Vercel cron sends HTTP GET to /api/fetch. Without a GET handler, Next.js returns 405 Method Not Allowed. The cron has NEVER successfully run. Fetch only works when triggered via the UI (which uses a server action calling fetchAndPersistArticles directly — bypassing the HTTP route).

- timestamp: 2026-03-26T00:01:00Z
  checked: Vercel cron documentation
  found: "Vercel makes an HTTP GET request to your project's production deployment URL to trigger a cron job."
  implication: This confirms the fetch cron was a no-op in production. Articles accumulate across all sources between manual fetches, explaining why 15 new articles appear at once.

- timestamp: 2026-03-26T00:01:00Z
  checked: src/app/api/enrich/route.ts
  found: Enrich route exports GET handler correctly — enrich cron works.
  implication: No bug in enrich cron itself.

- timestamp: 2026-03-26T00:01:00Z
  checked: src/app/briefing/page.tsx lines 38-55
  found: `priorityArticles` (score >= 7) had NO take limit — fetched ALL matching articles. `notableArticles` (score 4-6) was capped to fill up to 20 total slots. But if priority articles alone exceeded 20, the total was uncapped.
  implication: On days with many high-importance articles, the briefing showed all of them with no upper bound.

- timestamp: 2026-03-26T00:01:00Z
  checked: src/lib/actions.ts
  found: UI "fetch" button calls fetchAndPersistArticles() directly as a server action, never calls /api/fetch HTTP endpoint.
  implication: Changing POST to GET on the fetch route does not break the UI trigger path.

- timestamp: 2026-03-26T00:02:00Z
  checked: pnpm lint + pnpm build
  found: 0 errors, clean build
  implication: Fixes are safe to deploy

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause:
  BUG 1 (fetch cron never runs): /api/fetch/route.ts only exported a POST handler. Vercel cron invokes routes via HTTP GET, so every cron invocation returned 405. Fetch only ran when the UI triggered it (server action path). Articles accumulated over time between manual fetches, bursting as a large batch on the next manual trigger.
  BUG 2 (briefing article count): briefing/page.tsx fetched ALL priority articles (score >= 7) with no take limit. The 20-article cap only governed how many notable-tier (4-6) slots remained. On high-volume days, priority articles alone could exceed any intended limit.

fix:
  BUG 1: Changed `POST` to `GET` in src/app/api/fetch/route.ts (line 3)
  BUG 2: Added `const MAX_BRIEFING_ARTICLES = 20` and `take: MAX_BRIEFING_ARTICLES` to the priority articles query in src/app/briefing/page.tsx

verification: lint (0 errors) + build (clean) passed. Awaiting production confirmation.
files_changed:
  - src/app/api/fetch/route.ts
  - src/app/briefing/page.tsx
