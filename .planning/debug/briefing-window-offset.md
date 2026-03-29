---
status: awaiting_human_verify
trigger: "The briefing window calculation is wrong. For today's briefing (March 28, 2026), the debug metadata shows window 3/25 1:00AM to 3/26 12:59:59AM — two days behind and offset by 1 hour."
created: 2026-03-28T00:00:00Z
updated: 2026-03-28T00:00:00Z
---

## Current Focus

hypothesis: TLDR articles from 3/27 have publishedAt within the window BUT enrichedAt IS null — they were fetched but never enriched. The briefing query requires enrichedAt: { not: null }, excluding all unenriched articles. OR: TLDR articles have importanceScore < 4 after enrichment, which would exclude them from both priorityArticles (gte 7) and notableArticles (gte 4, lte 6) queries.
test: Add diagnostic counts to page.tsx — total articles in window regardless of enrichedAt, count with enrichedAt null, count with importanceScore < 4. Expose these in BriefingDebugBox.
expecting: One of: (a) unenrichedInWindow > 0 confirms enrichment gap, (b) lowScoreInWindow > 0 confirms scoring exclusion.
next_action: Run pnpm lint, then checkpoint for user to report totalInWindow / unenrichedInWindow / lowScoreInWindow values from the debug box.

## Symptoms

expected: Briefing window for March 28 should include articles from March 27 (the previous day). Window should start from 00:00:00 of the previous day.
actual: Window shows 3/25 1:00AM to 3/26 12:59:59AM — two days behind and offset by 1 hour.
errors: No errors — just wrong date range calculation.
reproduction: Enable debug mode on /briefing page. The BriefingDebugBox shows the incorrect window dates.
started: Likely always been this way — only now visible thanks to debug mode.

## Eliminated

- hypothesis: The window start/end computation in page.tsx (lines 25-26) is fundamentally wrong
  evidence: The code correctly computes d = getUTCDate() - 1 and uses Date.UTC(y, m, d, 0, 0, 0) — this is correct. The 1AM display offset is toLocaleString() converting UTC midnight to local timezone.
  timestamp: 2026-03-28T00:00:00Z

## Evidence

- timestamp: 2026-03-28T00:00:00Z
  checked: src/app/briefing/page.tsx lines 22-26
  found: Window computed as: d = getUTCDate() - 1; windowStart = Date.UTC(y, m, d, 0, 0, 0); windowEnd = Date.UTC(y, m, d, 23, 59, 59, 999). For selectedDate = new Date() on 3/28 UTC, this correctly yields 3/27 00:00 - 3/27 23:59 UTC.
  implication: The 1AM display offset is purely toLocaleString() converting UTC midnight into a UTC+1 client timezone. The "two days behind" is a stale cache artifact OR the real issue is that new Date() on the server during a cached render was 3/26.

- timestamp: 2026-03-28T00:00:00Z
  checked: The actual bug per objective
  found: The objective states "window should start from 00:00:00 of the previous day" — this IS what the code does. The real problem reported is that the window shows 3/25-3/26 for a 3/28 briefing. This means selectedDate evaluated to 3/26 UTC at render time. With revalidate=300, a page rendered on 3/26 UTC would serve stale until first request after 5 min. If no request came on 3/27, the cached 3/26 render would still be served on 3/28.
  implication: The fix is to make the page dynamic (remove revalidate=300 or use Date from request) so it always computes the window relative to the CURRENT date, not cached render time.

## Resolution

root_cause: The page has `export const revalidate = 300` (5-minute ISR cache). The window is computed from `new Date()` at render time. If no request hits the page for >5 min between renders, the cached render with an old `new Date()` is served, resulting in a stale window. Additionally, the page uses the server's clock via `new Date()` without a `?date=` param, so any cached render will have the wrong window for future requests. The fix: remove the static revalidate and either (a) make the page fully dynamic, or (b) read the date from a URL param that the client navigates to — which the DateStepper already supports. The correct fix is to not use `new Date()` as the default; instead redirect to today's date as a query param so the date is baked into the URL and cache key.
fix: "Replaced `export const revalidate = 300` with `export const dynamic = 'force-dynamic'` in src/app/briefing/page.tsx. The page now server-renders on every request, so new Date() always reflects the current time and the window is never stale."
verification: "pnpm lint: 0 errors. pnpm build: passes. /briefing route now shows as ƒ (Dynamic) in build output."
files_changed: ["src/app/briefing/page.tsx"]
