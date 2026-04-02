---
status: awaiting_human_verify
trigger: "enrich-job-timeout: GitHub Actions enrich cron job fails. Fetch step succeeds, but curl to /api/enrich fails with exit code 22 after ~61 seconds."
created: 2026-04-02T00:00:00Z
updated: 2026-04-02T00:00:00Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: CONFIRMED. The route has maxDuration=60, but it has a while loop that calls enrichArticlesBatch() repeatedly. A single enrichArticlesBatch() call (one AI round-trip for 25 articles) can easily take 30-50s, leaving no room for a second iteration AND response before the 60s hard limit kills the function. The HTTP 5xx (timeout) is then returned to curl -f, causing exit code 22.
test: verified by reading the code
expecting: fix is to remove the while loop (process exactly one batch per invocation) or increase maxDuration
next_action: apply fix - remove the while loop since the cron runs every 4 hours and multiple invocations can drain the queue incrementally

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: GitHub Actions cron job fetches RSS feeds then enriches new articles with AI summaries. Both steps should complete successfully.
actual: Fetch step succeeds ({"fetched":10,"added":5,"errors":[]}), but the enrich step fails after ~61 seconds with curl exit code 22 (HTTP error >= 400 with -f flag).
errors: "Process completed with exit code 22" -- curl -f returns 22 when server responds with HTTP error (4xx/5xx). Duration of ~61 seconds suggests Vercel function timeout (default 60s for hobby plan).
reproduction: GitHub Actions run https://github.com/vajkri/news-reader/actions/runs/23911511336/job/69734444096
started: 2026-04-02 (check if recurring)

## Eliminated
<!-- APPEND only - prevents re-investigating -->

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-04-02
  checked: src/app/api/enrich/route.ts
  found: maxDuration=60, TIME_BUDGET_MS=50_000. Route has a while loop calling enrichArticlesBatch() repeatedly until time budget or no more articles. Each AI call can take 30-50s for 25 articles.
  implication: First batch may consume nearly all 50s budget. Second iteration starts, AI call begins, then Vercel's 60s hard limit kills the function before a response is returned. curl gets 504 or similar -> exit code 22.

- timestamp: 2026-04-02
  checked: src/lib/enrich.ts
  found: BATCH_LIMIT=25. enrichArticlesBatch() makes a single generateText() call to deepseek/deepseek-v3.2 with up to 25 articles. buildCalibrationContext() also does a DB query on every iteration.
  implication: Each loop iteration = 1 DB read + 1 AI call + N DB writes. The AI call alone is the bottleneck.

- timestamp: 2026-04-02
  checked: .github/workflows/enrich.yml
  found: curl has no --max-time flag. No timeout set on the curl call. cron runs every 4 hours.
  implication: curl waits until server times out (60s), then gets the 504/timeout HTTP error -> exit code 22.

- timestamp: 2026-04-02
  checked: vercel.json
  found: empty ({}) - no function configuration overrides
  implication: hobby plan default of 60s applies to all functions

- timestamp: 2026-04-02
  checked: next.config.ts
  found: no serverExternalPackages or function config, no timeout overrides
  implication: confirms 60s Vercel hobby limit is the ceiling

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: The enrich route had a while loop processing multiple batches per invocation. A single AI call (25 articles via deepseek-v3.2) takes ~30-50s. The while loop's second iteration would start a new AI call, which Vercel's 60s hard limit kills mid-flight before a response could be returned. curl -f received the resulting 504 and exited with code 22.

fix: Removed the while loop from route.ts -- each invocation now processes exactly one batch (25 articles) and returns. The GitHub Actions workflow now loops up to 10 times, calling /api/enrich repeatedly until enriched=0 (queue drained), each call safely within 60s.

verification: pnpm build passes. pnpm lint clean on changed files. Logic verified by code review.

files_changed:
  - src/app/api/enrich/route.ts
  - .github/workflows/enrich.yml
