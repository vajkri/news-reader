# Phase 1: Foundation - Research

**Researched:** 2026-03-19
**Domain:** Next.js App Router (Next.js 16), React 19, Prisma SQLite/LibSQL, Vercel Cron, Infinite Scroll, Keyword Search
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Pagination:**
- Infinite scroll, not page numbers or load-more button
- 50 articles per batch (matches existing API default)
- Show total article count in status bar ("Showing 150 of 342")
- Keep all loaded articles in DOM (no virtualization) — corpus is hundreds, not thousands
- Server-side pagination via existing `page` and `limit` API params

**Search:**
- Inline search input in the FeedToolbar, alongside existing filters (Proposal A)
- Search scope: title + source name
- Server-side search via new `search` query param on articles API
- Debounced input (300ms), no submit button needed
- Keyboard shortcut: `/` to focus, `Esc` to clear
- Active search indicator in status bar with clear button
- Highlight matching text in article titles
- Search combines with existing filters (AND logic)
- Interactive HTML mockup: `.planning/mockups/search-proposal-A-inline.html`

**CLAUDE.md Conventions:**
- Rewrite existing CLAUDE.md for this codebase
- Keep structural template: folder org, tool preferences, design system, git rules
- Prefer Server Components by default; `'use client'` only when interactivity required
- Strict TypeScript: no `any` types, explicit return types on exports
- Barrel exports: every component directory gets an index.ts
- Conventional Commits (feat:, fix:, docs:, chore:)
- No Co-Authored-By lines on commit messages
- Reorganize `src/components/feed/` and `src/components/sources/` into `src/components/features/feed/` and `src/components/features/sources/`

**Design System (CLAUDE.md section):**
- Same format as Lego project: token table, component inventory, typography scale, depth/shadow system
- Tokens from `globals.css`: zinc palette, CSS variables, light/dark via prefers-color-scheme
- Typography: Geist Sans for UI, Geist Mono for code/mono
- Components: Button (4 variants: default/outline/ghost/destructive), Input, Select, Badge (3 variants) from shadcn/ui
- Add `.section-container` utility to globals.css
- Migrate existing `max-w-6xl mx-auto px-4` usages to `.section-container`

**.claude/ File Cleanup:**
- Update `memory/feedback_no_raw_buttons.md`: correct Button variants to default/outline/ghost/destructive
- Update `memory/feedback_section_container.md`: adapt for this project once .section-container is added
- Apply `memory/feedback_focus_visible_only.md`: fix existing Input component to use focus-visible
- Remove stale `feedback_copy_holistic.md` reference from MEMORY.md

**Caching Strategy:**
- Near-realtime freshness: API responses cached 30-60s revalidation
- Feed page: Server Component with client islands for interactive controls
- Static assets: standard CDN caching via Vercel defaults
- Articles API: short revalidation window matching 30-min cron cycle

**Cron Auth (FOUND-03):**
- Add CRON_SECRET header validation to `/api/fetch`
- Return 401 on invalid/missing auth

### Claude's Discretion

- Error handling patterns in CLAUDE.md (whether to codify now or let evolve)
- Exact ISR/revalidation timing for pages vs API routes
- Loading skeleton design for infinite scroll
- How to handle the Server Component + client island boundary (data fetching pattern)
- DEV-02, DEV-03, DEV-04 implementation details (Claude Code memories, skills, Serena MCP)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DEV-01 | CLAUDE.md configured with project conventions, rules, and coding preferences | Section: CLAUDE.md Rewrite Pattern |
| DEV-02 | Claude Code memories set up for project context | Section: Memory File Management |
| DEV-03 | Relevant skills added and configured for project workflow | Section: Skills Configuration |
| DEV-04 | Serena MCP server integrated for code intelligence | Serena script already in package.json; wire up config |
| FOUND-01 | Article listing supports pagination beyond 100 articles | Section: Infinite Scroll Pattern |
| FOUND-02 | User can search articles by keyword across the full corpus | Section: Server-Side Search Pattern |
| FOUND-03 | Cron job endpoint validates CRON_SECRET header before executing | Section: Cron Auth Pattern |
| FOUND-04 | Proper caching strategy implemented (static, API, ISR/revalidation) | Section: Caching Architecture |
</phase_requirements>

---

## Summary

Phase 1 is a cross-cutting foundation phase covering four distinct work areas: dev environment setup, cron security, data access improvements (pagination + search), and caching. None of these areas require new dependencies beyond what is already installed. The existing codebase runs on Next.js 16.1.7 and React 19 — both are current major versions — with Prisma + SQLite/LibSQL for data.

The biggest implementation complexity is the FeedTable refactor: the current component does everything client-side (fetches, filters, pagination). The locked decision is infinite scroll with server-side pagination, which requires converting the data-fetch from a single `limit=100` call to an accumulating page-by-page fetch driven by scroll position. The TanStack React Table instance can remain client-side but must be fed the accumulated article list rather than a single fetched page.

Search and pagination share the same URL param mechanism on the existing `/api/articles` route — the API already supports `page`, `limit`, and filtering; it only needs a `search` param added. The `CRON_SECRET` auth fix is a two-line change. CLAUDE.md rewrite is documentation work with no code risk.

**Primary recommendation:** Work in this order — (1) FOUND-03 cron auth (isolated, zero risk), (2) FOUND-04 caching (Next.js config only), (3) FOUND-01/02 together (they share the same FeedTable refactor), (4) DEV-01 through DEV-04 (docs/config).

---

## Standard Stack

### Core (already installed — no new deps needed)

| Library | Version (installed) | Purpose | Notes |
|---------|--------------------|---------|----|
| next | 16.1.7 | App Router, Server Components, ISR | Latest: 16.2.0 — minor update safe |
| react | 19.2.3 | UI, hooks, concurrent features | React 19 concurrent mode active |
| @prisma/client | ^5.22.0 | ORM — Prisma query API | Used with `where` + `skip`/`take` for pagination |
| @libsql/client | ^0.17.0 | LibSQL adapter for Vercel production | Turso/LibSQL = persistent SQLite on Vercel |
| @tanstack/react-table | 8.21.3 | Table rendering, sorting | Keep for column rendering; remove client-side filter logic |
| tailwindcss | ^4 | Utility CSS | v4 — `@theme inline` syntax, no `tailwind.config.js` |
| lucide-react | ^0.577.0 | Icons | Already used in toolbar |

### No New Dependencies Required

All phase 1 features can be implemented with the existing stack:
- Infinite scroll: native `IntersectionObserver` API (browser built-in)
- Search debounce: `setTimeout`/`clearTimeout` (no lodash needed)
- Keyword highlight: string `split` + React span wrapping (no library)
- Cron auth: standard `Request.headers.get()` check

---

## Architecture Patterns

### Recommended Component Structure After Reorganization

```
src/components/
├── ui/                           # Generic primitives (Button, Input, Select, Badge)
│   └── index.ts                  # Barrel export
├── layout/                       # (future) Stack, Container, Grid
└── features/
    ├── feed/                     # Renamed from src/components/feed/
    │   ├── FeedTable.tsx
    │   ├── FeedToolbar.tsx
    │   ├── columns.tsx
    │   └── index.ts
    └── sources/                  # Renamed from src/components/sources/
        ├── SourceForm.tsx
        ├── SourceList.tsx
        └── index.ts
```

Note: `src/components/ui/SourceForm.tsx` and `SourceList.tsx` are currently in the wrong folder — they are feature components, not ui primitives. Move them to `features/sources/`.

### Pattern 1: Cron Auth (FOUND-03)

**What:** Check Authorization header matches `Bearer ${CRON_SECRET}` before executing cron logic.
**When to use:** Any endpoint invoked by Vercel Cron or external automation.

```typescript
// src/app/api/fetch/route.ts
export async function POST(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  // ... existing logic
}
```

Important: The cron job header is sent automatically by Vercel when invoked from vercel.json schedule. The `CRON_SECRET` env var must be set in Vercel project settings AND locally in `.env.local` for manual testing.

### Pattern 2: Infinite Scroll with IntersectionObserver (FOUND-01)

**What:** Append each page of results to accumulated state; trigger next fetch when sentinel element scrolls into view.
**When to use:** Linear content lists where all items stay in DOM.

```typescript
// Core pattern — inside FeedTable (client component)
const [page, setPage] = useState(1);
const [articles, setArticles] = useState<ArticleRow[]>([]);
const [hasMore, setHasMore] = useState(true);
const sentinelRef = useRef<HTMLDivElement>(null);

// Append results (do NOT replace — accumulate)
const loadPage = useCallback(async (pageNum: number) => {
  const params = buildParams({ page: pageNum, limit: 50, ...filters });
  const res = await fetch(`/api/articles?${params}`);
  const data = await res.json();
  setArticles((prev) => pageNum === 1 ? data.articles : [...prev, ...data.articles]);
  setHasMore(data.articles.length === 50);
  setTotal(data.total);
}, [filters]);

// Reset to page 1 on filter/search change
useEffect(() => {
  setPage(1);
  loadPage(1);
}, [sourceFilter, categoryFilter, readFilter, sortBy, searchQuery]);

// Advance page when sentinel visible
useEffect(() => {
  if (!hasMore) return;
  const observer = new IntersectionObserver(
    (entries) => { if (entries[0].isIntersecting) setPage((p) => p + 1); },
    { threshold: 0.1 }
  );
  if (sentinelRef.current) observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [hasMore]);

// Load when page advances (but skip initial — handled by filter effect)
useEffect(() => {
  if (page > 1) loadPage(page);
}, [page]);
```

The sentinel div sits below the table rows. When it enters the viewport, `page` increments and `loadPage` fires. On filter change, reset `page` to 1 and replace articles (not append).

**Status bar text:** `"Showing ${articles.length} of ${total}"` — update this from the current `{total} articles` display.

### Pattern 3: Server-Side Search via Prisma (FOUND-02)

**What:** Add `search` query param to `/api/articles` that filters on `title` and `source.name` via Prisma `contains`.
**When to use:** Keyword filtering across text fields.

```typescript
// src/app/api/articles/route.ts — additions
const search = searchParams.get("search") ?? "";

// Add to where clause (Prisma SQLite: mode: 'insensitive' not supported — use contains)
if (search) {
  where.OR = [
    { title: { contains: search } },
    { source: { name: { contains: search } } },
  ];
}
```

Note: SQLite via Prisma does NOT support `mode: 'insensitive'` in `contains` — this is a PostgreSQL-only feature. Case sensitivity is a known limitation. The search will be case-sensitive unless handled in application code or via raw SQL `LIKE` with `LOWER()`. For phase 1, case-sensitive search is acceptable (document in CLAUDE.md).

The `where.OR` and existing `where.source = { category }` filter both target the `source` relation — these can conflict if both are set. Careful typing of the `where` object is needed. The current `any` type on `where` masks this. Fix by using a typed Prisma `WhereInput`:

```typescript
import { Prisma } from "@prisma/client";
const where: Prisma.ArticleWhereInput = {};
```

### Pattern 4: Search Debounce (FOUND-02)

**What:** Delay API call until 300ms after last keypress.
**When to use:** Any text input driving server-side data fetch.

```typescript
// Inside FeedTable or a custom hook
const [searchQuery, setSearchQuery] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
  return () => clearTimeout(timer);
}, [searchQuery]);

// debouncedSearch drives the API call (not searchQuery directly)
```

### Pattern 5: Keyword Highlight in Article Titles

**What:** Wrap matched substring in `<mark>` or `<span>` with highlight styling.
**When to use:** Show search query match in rendered text.

```typescript
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-800 rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}
```

Pass `debouncedSearch` (not live query) as the highlight term so highlight only appears after debounce settles.

### Pattern 6: Next.js Caching for API Routes (FOUND-04)

**What:** Control how long the articles API response is cached at the edge.
**When to use:** API routes that fetch from the database and can tolerate brief staleness.

```typescript
// src/app/api/articles/route.ts — add export
export const revalidate = 30; // seconds — cache at edge, revalidate every 30s
```

For the feed page (Server Component), use `revalidate` export as well:

```typescript
// src/app/page.tsx — after converting to Server Component
export const revalidate = 60; // 60s ISR for the page shell
```

Static assets (JS, CSS, fonts) are handled automatically by Next.js/Vercel — no config needed.

### Pattern 7: Keyboard Shortcut for Search Focus

**What:** Press `/` to focus search input; `Esc` to clear and blur.
**When to use:** Power-user keyboard navigation in content-dense lists.

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    if (e.key === "Escape") {
      setSearchQuery("");
      searchInputRef.current?.blur();
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, []);
```

### Anti-Patterns to Avoid

- **Replacing articles on each page load:** When implementing infinite scroll, `setArticles(data.articles)` replaces instead of appending. Only replace on page 1 (filter reset).
- **Driving UI from `searchQuery` directly:** Always use `debouncedSearch` for API calls; `searchQuery` only for the input value.
- **Adding `mode: 'insensitive'` to Prisma contains:** This is PostgreSQL-only and will throw at runtime on SQLite.
- **Using raw `<button>` elements:** Always use the `Button` component from `@/components/ui` (feedback_no_raw_buttons).
- **Using bare `focus:` instead of `focus-visible:`:** Per project rule, all focus styles use `focus-visible:`.
- **Mixing `where.source` (relation filter) and `where.OR[source]`:** If both `category` and `search` filters are active simultaneously, the Prisma `where` needs to use `AND` to combine them correctly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Scroll detection | Custom scroll event listener with position math | `IntersectionObserver` | Observer is performant, threshold-based, handles resize automatically |
| Search debounce | Complex debounce utility | `setTimeout`/`clearTimeout` in `useEffect` | Built-in, no dep, well-understood cleanup |
| Text highlighting | Regex-based DOM manipulation | Simple `indexOf` + React node split | Regex overkill; indexOf is sufficient for simple match |
| Caching config | Custom cache headers in route handler | `export const revalidate` in route.ts | Next.js handles edge caching from export |

**Key insight:** Everything in this phase is achievable with browser APIs and Next.js built-ins. No new npm packages are needed.

---

## Common Pitfalls

### Pitfall 1: Filter Change Doesn't Reset Scroll Position

**What goes wrong:** User changes source filter while on page 3. New results load appended after old ones instead of replacing them.
**Why it happens:** The accumulator state (`articles`) persists across filter changes.
**How to avoid:** In the filter change effect, always reset to page 1 AND clear articles before loading: `setPage(1); setArticles([]); loadPage(1)`.
**Warning signs:** After changing a filter, article count is higher than expected; duplicate entries visible.

### Pitfall 2: IntersectionObserver Double-Fire

**What goes wrong:** Scrolling to sentinel triggers multiple simultaneous page fetches.
**Why it happens:** Observer fires, page increments, but component hasn't re-rendered yet with new data, so sentinel is still in view.
**How to avoid:** Track a `isLoadingMore` boolean state. Only call `loadPage` when not already loading. The observer callback checks this flag.

```typescript
const isLoadingMore = useRef(false);
// In observer callback:
if (entries[0].isIntersecting && !isLoadingMore.current && hasMore) {
  isLoadingMore.current = true;
  setPage((p) => p + 1);
}
// After loadPage resolves: isLoadingMore.current = false
```

### Pitfall 3: Prisma `where.OR` + Relation Filter Conflict

**What goes wrong:** Search filter breaks the category filter when both are active.
**Why it happens:** Setting `where.source = { category }` and then `where.OR = [{ source: { name: ... } }]` creates conflicting relation conditions. Prisma does not merge them.
**How to avoid:** Use `AND` explicitly:

```typescript
const conditions: Prisma.ArticleWhereInput[] = [];
if (category) conditions.push({ source: { category } });
if (search) conditions.push({
  OR: [{ title: { contains: search } }, { source: { name: { contains: search } } }]
});
if (conditions.length > 0) where.AND = conditions;
```

### Pitfall 4: `CRON_SECRET` Not Set in Local `.env.local`

**What goes wrong:** Manual POST to `/api/fetch` during development returns 401 unexpectedly.
**Why it happens:** `process.env.CRON_SECRET` is undefined locally, so `undefined !== 'Bearer undefined'` passes on prod but fails locally if `.env.local` is missing the key.
**How to avoid:** Document in CLAUDE.md that `.env.local` must include `CRON_SECRET=any-dev-value`. The check is `authHeader !== \`Bearer ${process.env.CRON_SECRET}\`` — if the env var is not set, any header (including no header) with value `"Bearer undefined"` would pass, which is the wrong behavior. Always set the env var.

### Pitfall 5: `export const revalidate` on Client Components

**What goes wrong:** Adding `export const revalidate = 30` to a file with `'use client'` has no effect.
**Why it happens:** Route segment config (`revalidate`, `dynamic`) is only processed by the Next.js server on Server Components and route handlers.
**How to avoid:** `revalidate` export belongs in Server Component files and route handler files only. The feed page conversion to Server Component is a prerequisite for the page-level caching to work.

### Pitfall 6: Component Directory Reorganization Breaks Imports

**What goes wrong:** Moving `src/components/feed/` to `src/components/features/feed/` breaks all existing imports.
**Why it happens:** Relative imports throughout the codebase reference the old path.
**How to avoid:** After moving files, run a global find-and-replace of the import path. The `@/components/feed/` alias path must be updated everywhere. Check: `src/app/page.tsx`, `src/app/sources/page.tsx`, and any other files importing from feed/ or sources/.

---

## Code Examples

### Cron Auth (complete route handler)

```typescript
// src/app/api/fetch/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchFeed } from "@/lib/rss";

export async function POST(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 }) as unknown as NextResponse;
  }
  // ... existing logic unchanged
}
```

### Articles API with Search + Typed Where

```typescript
// src/app/api/articles/route.ts (key additions)
import { Prisma } from "@prisma/client";

export const revalidate = 30;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const search = searchParams.get("search") ?? "";
  const where: Prisma.ArticleWhereInput = {};
  const andConditions: Prisma.ArticleWhereInput[] = [];

  if (sourceId) where.sourceId = parseInt(sourceId, 10);
  if (isRead !== null && isRead !== "") where.isRead = isRead === "true";
  if (category) andConditions.push({ source: { category } });
  if (search) andConditions.push({
    OR: [
      { title: { contains: search } },
      { source: { name: { contains: search } } },
    ],
  });
  if (andConditions.length) where.AND = andConditions;
  // ... rest unchanged
}
```

### `.section-container` CSS Utility

```css
/* src/app/globals.css */
:root {
  --container-width: 100dvw;
  --container-max-width: 1800px;
  --container-padding: 1.5rem;
}

@layer components {
  .section-container {
    width: var(--container-width);
    max-width: var(--container-max-width);
    margin-inline: auto;
    padding-inline: var(--container-padding);
  }
}
```

Usages to migrate: `layout.tsx` header inner div (`max-w-6xl mx-auto px-4`), `page.tsx` outer div, `sources/page.tsx` outer div.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `limit=100` single fetch | Page-by-page with IntersectionObserver | Unlocks access to all articles |
| No auth on cron endpoint | `CRON_SECRET` header check | Prevents public triggering |
| `any` type on Prisma `where` | `Prisma.ArticleWhereInput` typed | TypeScript safety on query construction |
| `max-w-6xl mx-auto px-4` scattered | `.section-container` utility | Single source of layout truth |
| Page component fully client | Server Component shell + client islands | Enables ISR caching on page |

**Known constraints:**
- SQLite `contains` is case-sensitive (no `mode: 'insensitive'`) — document in CLAUDE.md as a known limitation
- Prisma dual-adapter setup (`better-sqlite3` dev, `libsql` prod) is intentional — the `build` script runs `prisma migrate deploy` confirming Vercel uses LibSQL/Turso

---

## Open Questions

1. **LibSQL persistence on Vercel confirmed?**
   - What we know: `@libsql/client` and `@prisma/adapter-libsql` are installed; `package.json` build script runs `prisma migrate deploy` suggesting production database migrations work
   - What's unclear: Whether a Turso database URL is configured in Vercel env vars — if not, Vercel will use the ephemeral filesystem and data will vanish on redeploy
   - Recommendation: Check Vercel project environment variables for `DATABASE_URL` containing a `libsql://` or `https://` Turso URL. If absent, block Phase 2 until resolved. (This concern is logged in STATE.md.)

2. **Feed page Server Component conversion scope**
   - What we know: `src/app/page.tsx` is currently `'use client'` and uses `useEffect` for data fetch; the locked decision says "Server Component with client islands"
   - What's unclear: The entire FeedTable must remain `'use client'` (it uses hooks, IntersectionObserver, state). The Server Component benefit is only for the initial page shell + passing `sources` as a prop (fetched server-side).
   - Recommendation: Convert `page.tsx` to a Server Component that fetches sources and passes them as props to `<FeedTable sources={sources} />`. FeedTable stays client. This is a shallow but correct refactor.

3. **FeedToolbar read-filter tabs use raw `<button>` elements**
   - What we know: `FeedToolbar.tsx` renders read filter tabs as raw `<button>` elements — violates the `feedback_no_raw_buttons` memory rule
   - What's unclear: Whether the fix belongs in this phase or is noted and deferred
   - Recommendation: Fix during the FeedToolbar refactor in this phase since the file is already being modified for search.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — no test files, no test config |
| Config file | None — Wave 0 must create |
| Quick run command | `npx jest --testPathPattern="articles\|fetch\|cron" --passWithNoTests` |
| Full suite command | `npx jest --passWithNoTests` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | API returns page 2 with offset articles | unit | `npx jest tests/api/articles.test.ts -t "pagination"` | Wave 0 |
| FOUND-01 | API total count is accurate across pages | unit | `npx jest tests/api/articles.test.ts -t "total count"` | Wave 0 |
| FOUND-02 | Search by title returns matching articles | unit | `npx jest tests/api/articles.test.ts -t "search title"` | Wave 0 |
| FOUND-02 | Search by source name returns matching articles | unit | `npx jest tests/api/articles.test.ts -t "search source"` | Wave 0 |
| FOUND-02 | Search + category filter combine via AND | unit | `npx jest tests/api/articles.test.ts -t "search and category"` | Wave 0 |
| FOUND-03 | POST /api/fetch without auth returns 401 | unit | `npx jest tests/api/fetch.test.ts -t "401"` | Wave 0 |
| FOUND-03 | POST /api/fetch with valid CRON_SECRET proceeds | unit | `npx jest tests/api/fetch.test.ts -t "authorized"` | Wave 0 |
| FOUND-04 | `revalidate` export present on articles route | smoke | Manual: check source file export | N/A |
| DEV-01 | CLAUDE.md exists with required sections | smoke | `test -f CLAUDE.md && grep -q "Design System" CLAUDE.md` | N/A |
| DEV-02-04 | Memory/skill files exist | smoke | Manual: verify .claude/memory/ contents | N/A |

> Note: API route unit tests require either a test database or Prisma mock. Given zero test infrastructure today, start minimal: test the route logic with mock Prisma client or simple integration tests against a test SQLite file.

### Sampling Rate

- **Per task commit:** Lint check — `npm run lint`
- **Per wave merge:** `npx jest --passWithNoTests`
- **Phase gate:** All tests green + lint clean before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `jest.config.js` — test framework configuration
- [ ] `tests/api/articles.test.ts` — covers FOUND-01 and FOUND-02
- [ ] `tests/api/fetch.test.ts` — covers FOUND-03
- [ ] `jest.setup.ts` — Prisma mock setup

> Alternative: If Jest setup cost is too high for a foundation phase, document these as manual verification steps and defer automated tests to Phase 2. The cron auth check (FOUND-03) is the highest-value test given the security nature.

---

## Sources

### Primary (HIGH confidence)

- Codebase direct read — `src/app/api/articles/route.ts`, `src/app/api/fetch/route.ts`, `src/components/feed/FeedTable.tsx`, `src/components/feed/FeedToolbar.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`, `vercel.json`, `package.json`
- `.planning/codebase/CONCERNS.md` — pre-analyzed security issues, data integrity gaps, pagination gap
- `.planning/phases/01-foundation/01-CONTEXT.md` — locked decisions and code context
- Vercel Cron Jobs skill (injected) — Authorization header pattern, CRON_SECRET verification

### Secondary (MEDIUM confidence)

- Prisma docs (SQLite `contains` case-sensitivity behavior) — confirmed via known Prisma limitation; `mode: 'insensitive'` is documented as PostgreSQL-only
- Next.js `export const revalidate` — standard App Router route segment config; HIGH confidence in the mechanism, MEDIUM on exact edge caching behavior on Vercel hobby vs pro tiers
- IntersectionObserver for infinite scroll — widely documented browser API, stable since 2019

### Tertiary (LOW confidence)

- Exact ISR behavior difference between `revalidate` on API routes vs page routes under Next.js 16 — behavior may differ from Next.js 14/15 docs; verify actual caching by inspecting response headers in production
- Vercel LibSQL/Turso persistence confirmation — inferred from package.json, not directly verified against Vercel project settings

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — direct codebase read, no guessing
- Architecture patterns: HIGH — all patterns derived from existing code structure and locked decisions
- Cron auth: HIGH — pattern from Vercel skill injection matches CONCERNS.md recommendation exactly
- Pagination/search: HIGH — API already supports params; extension is additive
- Caching: MEDIUM — Next.js route segment config is standard but Vercel edge behavior under v16 is not directly verified
- Test architecture: MEDIUM — no test infra exists; recommendations are conservative

**Research date:** 2026-03-19
**Valid until:** 2026-04-18 (30 days — stable stack, no fast-moving dependencies)
