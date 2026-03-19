# Codebase Concerns

**Analysis Date:** 2026-03-19

## Security Issues

**Missing Cron Job Authorization:**
- Issue: Cron endpoint `/api/fetch` has no authorization check
- Files: `src/app/api/fetch/route.ts`, `vercel.json`
- Risk: Any user can trigger RSS feed updates by calling POST /api/fetch without authentication
- Current mitigation: None
- Recommendations: Add `Authorization` header verification matching `CRON_SECRET` environment variable (see Vercel Cron Jobs pattern)
  ```typescript
  export async function POST(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }
    // ... rest of handler
  }
  ```

**Unvalidated Image URLs:**
- Issue: Thumbnail URLs extracted from RSS feeds are used directly in `Image` component without validation
- Files: `src/components/feed/columns.tsx` (line 32-38), `src/lib/thumbnail.ts`
- Risk: Could load untrusted or malicious images; potential attack surface if thumbnails point to malicious domains
- Current mitigation: Next.js Image component provides some domain restrictions, but not configured
- Recommendations: Add `next.config.js` with `images.remotePatterns` to whitelist trusted domains, or use image proxy/validation

**Uncaught Errors in Page-Level Fetches:**
- Issue: `fetch("/api/sources")` calls in page components have no error handling
- Files: `src/app/page.tsx` (lines 10-14), `src/app/sources/page.tsx` (lines 11-15)
- Risk: Silent failures; if API fails, pages render with empty state without user notification
- Current mitigation: None
- Recommendations: Wrap fetch calls in try-catch, show error toast/alert to users:
  ```typescript
  useEffect(() => {
    fetch("/api/sources")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load sources");
        return r.json();
      })
      .then(setSources)
      .catch((err) => {
        console.error(err);
        // Show error UI
      });
  }, []);
  ```

## Data Integrity Issues

**Missing Error Handling in Delete Operations:**
- Issue: `SourceList.handleDelete()` (line 24) does not check response status before calling `onDeleted()`
- Files: `src/components/sources/SourceList.tsx`
- Risk: If DELETE fails, UI still removes source from list (optimistic update with no rollback)
- Current mitigation: None
- Recommendations: Check response.ok and handle errors:
  ```typescript
  const response = await fetch(`/api/sources/${id}`, { method: "DELETE" });
  if (!response.ok) {
    alert("Failed to delete source");
    return;
  }
  onDeleted(id);
  ```

**Optimistic Update Not Rolled Back on Error:**
- Issue: `FeedTable.handleToggleRead()` (lines 80-88) updates UI immediately, but doesn't rollback if PATCH fails
- Files: `src/components/feed/FeedTable.tsx`
- Risk: If update fails server-side, UI state is incorrect (shows read/unread that wasn't persisted)
- Current mitigation: None
- Recommendations: Implement proper rollback:
  ```typescript
  setArticles((prev) =>
    prev.map((a) => (a.id === id ? { ...a, isRead } : a))
  );
  const response = await fetch(`/api/articles/${id}`, {...});
  if (!response.ok) {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: !isRead } : a))
    );
  }
  ```

**GUID Collision Risk:**
- Issue: Fallback GUID generation in `src/lib/rss.ts` (line 43) uses `Date.now()` when guid/link/title missing
- Files: `src/lib/rss.ts`
- Risk: Multiple articles without guid can generate same GUID if processed in same millisecond; creates false duplicates
- Current mitigation: Unique constraint on `guid` column will error on collision
- Recommendations: Use UUID with title/description hash as fallback:
  ```typescript
  import { v5 as uuidv5 } from 'uuid';
  const guid = item.guid ?? item.link ??
    uuidv5(`${feedUrl}-${item.title}`, NAMESPACE_URL);
  ```

## Performance Bottlenecks

**N+1 Query in Articles Listing:**
- Issue: Article query includes full `source` object for every row (line 36 in `src/app/api/articles/route.ts`)
- Files: `src/app/api/articles/route.ts`
- Risk: Loads unneeded source fields (createdAt, url, etc.); wastes bandwidth for 100-article pages
- Current mitigation: Uses `select` to pick only name/category, so not true N+1, but could be optimized
- Recommendations: Response is efficient given the select clause; no immediate concern

**Unbounded Pagination Default:**
- Issue: Default limit is 100 articles (line 12, `src/app/api/articles/route.ts`), but no max enforcement
- Files: `src/app/api/articles/route.ts`, `src/components/feed/FeedTable.tsx` (line 45)
- Risk: Client can request limit=10000+ causing large data transfers; no pagination UI to navigate beyond first page
- Current mitigation: Default is reasonable (100)
- Recommendations: Enforce max limit:
  ```typescript
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 1000);
  ```

**Unoptimized Image Loading:**
- Issue: Image component in columns.tsx uses `unoptimized` flag (line 37)
- Files: `src/components/feed/columns.tsx`
- Risk: All thumbnail images load at full size without optimization; could cause memory/rendering issues with hundreds of images
- Current mitigation: None
- Recommendations: Add responsive sizing or enable image optimization with proper domains config

**All Sources Fetched for Every Cron Run:**
- Issue: `fetchFeed` fetches all sources in parallel with `Promise.allSettled()` (line 15, `src/app/api/fetch/route.ts`)
- Files: `src/app/api/fetch/route.ts`
- Risk: Scheduled every 30 minutes (vercel.json); could cause timeout if many sources or slow feeds (Vercel functions have 60s limit)
- Current mitigation: Uses Promise.allSettled to not fail on individual errors; timeout is 15s per feed
- Recommendations: Implement staggered fetching or queue system for large source counts:
  ```typescript
  // Fetch in batches of 5 in sequence instead of all in parallel
  const batchSize = 5;
  for (let i = 0; i < sources.length; i += batchSize) {
    await Promise.allSettled(sources.slice(i, i + batchSize).map(...));
  }
  ```

## Fragile Areas

**Resilience of RSS Parser Fallbacks:**
- Files: `src/lib/rss.ts` (lines 43-52), `src/lib/thumbnail.ts`
- Why fragile: Title defaults to "Untitled", guid cascades through guid→link→title→timestamp; extraction is deeply nested and vulnerable to unexpected XML structures
- Safe modification: All changes to guid generation or title defaults should include test cases for feeds with missing fields
- Test coverage: No test files exist for rss.ts or thumbnail.ts

**Type Safety Gap in API Handlers:**
- Files: `src/app/api/articles/route.ts` (line 15 uses `any` for where clause), `src/lib/thumbnail.ts` (line 4 uses `any`)
- Why fragile: Dynamic where clause construction with `any` type defeats TypeScript safety; thumbnail extraction relies on unsafe casting
- Safe modification: Avoid adding complex filter logic without narrowing types or using type guards
- Test coverage: No tests for edge cases in filter combinations

**HTML Strip Regex in Read Time Estimation:**
- Files: `src/lib/readtime.ts` (line 4)
- Why fragile: Simple regex `/<[^>]*>/g` doesn't handle malformed HTML, CDATA, or script/style tags (will count script content as text)
- Safe modification: If description contains code examples or structured data, read time will be inflated
- Test coverage: No test cases

## Missing Critical Features

**No Network Error Recovery:**
- Problem: If RSS feed URL is down when articles are fetched, error is logged but fetch stops for that feed
- Blocks: Can't resume mid-operation; entire feed fetch fails atomically per source
- Impact: Individual source failures cascade; timeout on one slow feed doesn't affect others (thanks to Promise.allSettled)
- Recommendation: Implement retry with exponential backoff for transient failures

**No Pagination UI on Feed Page:**
- Problem: Articles API supports pagination, but FeedTable loads only first 100 with limit hardcoded (line 45)
- Blocks: Users can't browse beyond 100 articles; older articles become inaccessible
- Impact: Major usability gap for news readers
- Recommendation: Add pagination controls or infinite scroll to FeedTable

**No Article Search:**
- Problem: Only filter by source, category, and read status; no full-text search
- Blocks: Users can't find articles by keyword
- Impact: Reader becomes less useful over time as article count grows

**No Feed Validation on Add:**
- Problem: Only validates URL format, doesn't verify it's an actual RSS feed
- Blocks: Users can add any URL; if not RSS, will silently fail on first fetch
- Recommendation: Add `/api/sources/validate` endpoint that tests feed URL before adding

## Test Coverage Gaps

**No Unit Tests for RSS Parsing:**
- What's not tested: `src/lib/rss.ts`, `src/lib/thumbnail.ts`, `src/lib/readtime.ts`
- Files: `src/lib/rss.ts`, `src/lib/thumbnail.ts`, `src/lib/readtime.ts`
- Risk: Regressions in GUID generation, thumbnail extraction, or read time calculation go undetected
- Priority: **High** — recent commit (11be128) fixed RSS parsing issues that good tests would have caught

**No Tests for API Error Paths:**
- What's not tested: 400/409/500 responses from `/api/sources`, `/api/articles/*`, `/api/fetch`
- Files: All files in `src/app/api/`
- Risk: Error handling bugs aren't caught; example: DELETE route has no error handling
- Priority: **High** — essential for data integrity

**No Tests for Concurrent Operations:**
- What's not tested: What happens if user updates read status while fetch is running; concurrent deletes
- Files: `src/components/feed/FeedTable.tsx`, `src/components/sources/SourceList.tsx`
- Risk: Race conditions between client state and server state
- Priority: **Medium** — harder to reproduce but impactful

**No Integration Tests:**
- What's not tested: Full flow from adding source → fetching articles → updating read status
- Files: Entire app
- Risk: Cross-layer bugs (e.g., database cascade on delete) not caught
- Priority: **Medium** — good coverage of individual components but no end-to-end validation

## Known Issues

**Read Time Calculation Inflates on HTML Content:**
- Symptoms: Articles with embedded HTML show longer read times than expected
- Files: `src/lib/readtime.ts`
- Cause: Simple HTML strip regex counts script/style content, doesn't handle nested tags
- Impact: Users see inflated read time estimates
- Workaround: None; feature behaves as designed but not ideal

**Cron Job Has No Status Monitoring:**
- Symptoms: If `/api/fetch` hangs or errors, no alert is sent; errors are only visible in Vercel logs
- Files: `vercel.json`, `src/app/api/fetch/route.ts`
- Current state: Errors returned in response.errors array but not persisted or alerted
- Recommendation: Log errors to external service (Sentry, DataDog) or database for visibility

## Dependencies at Risk

**rss-parser @ ^3.13.0:**
- Risk: Parser relies on external HTTP calls to fetch feeds; no built-in timeout, rate limiting, or circuit breaker
- Impact: If many sources are slow or unresponsive, cron job hits Vercel function timeout
- Migration plan: Could add timeout wrapper, implement queue system, or use different parser with better defaults

**Prisma SQLite Adapters (both better-sqlite3 and libsql):**
- Risk: Dual adapters suggest environment-specific setup; could lead to migration issues
- Current: Schema uses SQLite; deployed to Vercel (likely uses libsql)
- Clarification needed: Verify which adapter is actually used in production; development uses different adapter than prod?

**Image Component from Next.js with unoptimized flag:**
- Risk: Disabling Next.js Image optimization means no automatic format conversion, responsive sizing, or lazy loading benefit
- Impact: Thumbnails load slower, larger bandwidth usage
- Recommendation: Enable optimization by configuring remotePatterns

---

*Concerns audit: 2026-03-19*
