---
status: resolved
trigger: "TLDR newsletter sources don't get updated when user clicks 'fetch new' in the UI. Other RSS feed sources update correctly. TLDR sources have been stuck with the same articles since initial fetch."
created: 2026-03-21T00:00:00Z
updated: 2026-03-21T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - `fetchFeed` in rss.ts applies a 24-hour age filter that silently drops all TLDR articles on every fetch after the first 24 hours
test: Verified by checking live RSS feed dates vs. the cutoff calculation
expecting: n/a - root cause confirmed
next_action: Remove the maxAgeMs age filter from fetchFeed; deduplication via guid uniqueness already prevents re-insertion

## Symptoms

expected: When clicking "fetch new" in the UI, TLDR sources should fetch and store new articles, just like other RSS sources do.
actual: TLDR sources remain unchanged after fetch -- same articles since the first time they were fetched. Other RSS feeds update correctly.
errors: No known errors reported.
reproduction: Click "fetch new" in the UI. Observe that TLDR sources still show the same old articles while other feeds get new ones.
started: Since the first fetch. TLDR sources have never updated after the initial load.

## Eliminated

- hypothesis: TLDR articles have duplicate GUIDs causing false deduplication
  evidence: GUID = item.guid (the article URL with utm_source) - these are distinct per article
  timestamp: 2026-03-21

- hypothesis: TLDR RSS feed doesn't update / always returns same items
  evidence: Feed returns articles from multiple days (Mar 11-20), new days appear each day
  timestamp: 2026-03-21

## Evidence

- timestamp: 2026-03-21
  checked: Live TLDR RSS feed (https://bullrich.dev/tldr-rss/tech.rss) pubDates
  found: All items have pubDate set to exactly midnight UTC of their publication day (e.g., Fri 20 Mar 2026 00:00:00 GMT)
  implication: Articles age quickly - within hours of publication they're 8-10+ hours old; by next day's cron run they're 24-32h old

- timestamp: 2026-03-21
  checked: fetchFeed() in src/lib/rss.ts, line 47-54
  found: Default maxAgeMs = 24 hours. Filter: `return !pubDate || pubDate >= cutoff`. Items without pubDate always pass; items with pubDate must be newer than 24h.
  implication: TLDR's midnight-UTC timestamps mean by the time the cron runs the next morning, all of yesterday's articles are >24h old and silently dropped

- timestamp: 2026-03-21
  checked: DB articles for TLDR sources (sourceId 9, 10, 11)
  found: All articles have publishedAt of 2026-03-18 or 2026-03-19. None from Mar 20 forward despite feed having Mar 20 articles.
  implication: Only the very first fetch captured articles that happened to be <24h old at fetch time; all subsequent fetches return 0 new articles

- timestamp: 2026-03-21
  checked: Both callers of fetchFeed (api/fetch/route.ts and lib/actions.ts)
  found: Both call fetchFeed(source.url) with no maxAgeMs override - default 24h filter applies to all sources
  implication: Fix must be in fetchFeed itself (remove the filter) - the guid-based deduplication in callers already handles idempotency

## Resolution

root_cause: `fetchFeed()` in src/lib/rss.ts applies a 24-hour age cutoff filter. TLDR newsletters publish all articles timestamped at exactly midnight UTC. By the time the next cron run executes (30min later, or any time next day), all those articles are >24h old and silently filtered out. The guid-based deduplication in the callers already prevents duplicate insertion, making the age filter redundant and harmful.
fix: Widened age cutoff from 24h to 7 days. Keeps sponsor filter. GUID dedup in callers prevents duplicates.
verification: lint clean, tsc --noEmit clean. Committed on debug/tldr-fetch-stale (5d1333f).
files_changed: [src/lib/rss.ts]
