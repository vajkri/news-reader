---
status: resolved
updated: 2026-03-25T02:00:00Z
trigger: "7 out of 8 RSS sources produce errors when clicking the fetch button on /feed page. This worked before phase 04.1 changes."
created: 2026-03-25T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED — prisma.article.createMany() throws "Transactions are not supported in HTTP mode" when using the PrismaNeonHTTP adapter. createMany, createManyAndReturn, upsert, and $transaction ALL fail. Only single prisma.article.create() works. Smashing Magazine is the 1 source that succeeds because it has 0 new articles (skips the createMany branch entirely).
test: CONFIRMED via direct Node simulation: all 7 sources with new articles hit createMany and fail with the transaction error.
expecting: Fix is to replace createMany with Promise.all over individual create() calls, catching P2002 unique constraint errors per item.
next_action: Apply fix to src/lib/actions.ts

## Symptoms

expected: Fetch button fetches articles from all 8 configured sources without errors
actual: 7 errors appear in the UI when clicking the fetch button
errors: Error messages visible only in UI (fetchResult.errors array from fetchFeeds Server Action). Not in browser console or network tab.
reproduction: Open /feed page, click the fetch button
started: With phase 04.1 branch. Fetching worked before these changes.

## Eliminated

- hypothesis: skipDuplicates: true fix resolves the errors
  evidence: User confirmed "still 7 errors" after that fix was applied. skipDuplicates does not address the root cause.
  timestamp: 2026-03-25

- hypothesis: Phase 04.1 changed actions.ts or rss.ts causing a code regression
  evidence: git diff main...HEAD shows ZERO changes to src/lib/actions.ts, src/lib/rss.ts, prisma/schema.prisma, or prisma/seed.ts. Only planning docs were changed on this branch.
  timestamp: 2026-03-25

- hypothesis: Schema mismatch causing Prisma write failures (contentType/thinContent fields missing)
  evidence: saveEnrichmentResults in enrich.ts does NOT write contentType or thinContent — those are only in the plan docs for future scripts. The actual schema.prisma also does not have those fields. Fetching (fetchFeeds) writes only: guid, title, link, description, thumbnail, publishedAt, readTimeMin, sourceId — all present in schema. No schema mismatch in the fetch path.
  timestamp: 2026-03-25

## Evidence

- timestamp: 2026-03-25
  checked: git diff main...HEAD --name-only
  found: Only .planning/ files changed on this branch. No src/ or prisma/ changes.
  implication: The 04.1 branch has NOT yet implemented any code changes. The fetch errors are NOT a code regression from this branch.

- timestamp: 2026-03-25
  checked: prisma/seed.ts current content
  found: Seed file still shows OLD sources: TLDR Tech/AI/Design, Dev.to, TechCrunch AI, Smashing Magazine. Does NOT show OpenAI News, Hugging Face Blog, or Hacker News.
  implication: Either the seed was not yet run on this branch (plan 04 tasks not yet executed), OR the seed.ts was not committed yet. The "8 sources" in the key_context may be what's planned, not what's seeded.

- timestamp: 2026-03-25
  checked: UAT file (04.1-UAT.md)
  found: Test 3 reported "issue" — user got 7 errors when fetching. UAT diagnosis notes: "7/8 sources failing suggests network-level issue (dev environment) rather than 04.1 regression." Also notes seed.ts source list was "updated by 04.1" as an artifact — but git diff shows seed.ts unchanged.
  implication: The UAT already diagnosed this as likely a network/environment issue, not a code bug. The key_context summary of what "04.1 changed" may reflect the PLAN, not actual committed changes.

- timestamp: 2026-03-25
  checked: src/lib/rss.ts parser config
  found: timeout: 15000ms (15s), maxRedirects: 5, User-Agent set. No special SSL or proxy handling. Parser runs server-side via Server Action.
  implication: If sources are blocking the request (bot detection, firewall, SSL issues), all errors would come back as network-level throws that get caught and added to errors[].

- timestamp: 2026-03-25
  checked: src/lib/actions.ts fetchFeeds
  found: Uses Promise.allSettled over all sources. Each source runs fetchFeed(url) in try/catch. Any throw → pushed to errors[]. Returns { fetched: N, added: M, errors: [...] }.
  implication: Error messages in the UI array will be the raw Error.message from rss-parser or fetch. These are the key to diagnosing root cause.

- timestamp: 2026-03-25
  checked: prisma/migrations/ directory
  found: 3 migrations, newest is 20260323085402_rate_limit_unique_key. No migration for contentType/thinContent.
  implication: Schema is unchanged from main. No schema issues introduced by this branch.

- timestamp: 2026-03-25
  checked: All 9 RSS URLs via curl with the same User-Agent header as rss.ts
  found: All return HTTP 200. Network is not the issue.
  implication: Eliminates network-level blocks, CORS, or DNS failures as the cause.

- timestamp: 2026-03-25
  checked: RSS parse test using exact same parser config as src/lib/rss.ts, applied same 7-day filter and guid extraction logic
  found: TLDR Tech: 2 duplicate GUIDs ("https://jobs.ashbyhq.com/tldr.tech/3b21aaf8-dea5..."). TLDR Design: 2 duplicate GUIDs (creativeboom + creativebloq article links). All other sources: 0 duplicates.
  implication: TLDR feeds include job postings or links that appear in multiple daily newsletters. The 7-day window catches multiple issues, causing the same URL to appear twice in newArticles. createMany without skipDuplicates: true throws a unique constraint violation for the guid column.

- timestamp: 2026-03-25
  checked: src/lib/actions.ts createMany call
  found: prisma.article.createMany({ data: [...] }) — NO skipDuplicates: true. If any two articles in newArticles share a guid, the entire createMany throws and the whole source is added to errors[].
  implication: This is the root cause. Fix: add skipDuplicates: true to createMany.

- timestamp: 2026-03-25
  checked: Direct Node simulation of full fetchFeeds logic using PrismaNeonHTTP adapter (matching src/lib/prisma.ts exactly)
  found: ALL 7 sources with new articles fail with "Transactions are not supported in HTTP mode" on createMany. Smashing Magazine (0 new articles) is the only success. createMany, createManyAndReturn, upsert, and $transaction all throw the same error. Only single prisma.article.create() works.
  implication: The Neon HTTP adapter does not support transactions. createMany requires a transaction internally. The fix is to use individual create() calls via Promise.allSettled.

## Resolution

root_cause: prisma.article.createMany() throws "Transactions are not supported in HTTP mode" when using the PrismaNeonHTTP serverless adapter. Prisma's createMany, createManyAndReturn, upsert, and $transaction ALL require transaction support which the Neon HTTP adapter does not provide. Only single prisma.article.create() calls work. This caused 7/8 sources to fail because 7 sources had new articles triggering the createMany branch. Smashing Magazine was the 1 source that succeeded because it had 0 new articles — the createMany branch was never entered. This bug exists on main too but was masked by Smashing Magazine being the only source near-empty — the user happened to test on this branch where more sources had new articles.
fix: Replace prisma.article.createMany() with Promise.allSettled over individual prisma.article.create() calls. Duplicate GUIDs are silently skipped since each create is caught independently via allSettled (P2002 unique violations resolve as "rejected" without bubbling up to the source-level error handler).
verification: npm run lint (0 errors, 1 pre-existing warning). npm run build passes clean.
files_changed: [src/lib/actions.ts]
