# Phase 3: Daily Briefing - Research

**Researched:** 2026-03-19
**Domain:** Next.js Server Components, Prisma date filtering, React client state, UI card design
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Card content and density:**
- Each card shows: thumbnail (or topic icon fallback), headline, full AI summary (2-3 sentences), importance badge, topic tag
- Small footer line with source name + relative time ("The Verge, 2h ago")
- No read time, no numeric score on cards
- Clicking a card opens the original article URL in a new tab (briefing is a launch pad, not a reading surface)
- When thumbnail is missing, show a subtle icon matching the article's topic category to keep cards visually consistent

**Layout:**
- Single-column card layout within section-container
- Cards stacked vertically, full width, natural top-to-bottom reading flow
- Mobile-friendly by default (single column scales naturally)

**Topic grouping:**
- Articles grouped by topic with visual section headings
- Section heading format: "Topic Name (N)" showing article count per group
- Groups ordered by highest importance score in the group (most critical topic first)
- Within each group, articles ordered by importance score descending
- Groups are always expanded, not collapsible

**Importance visualization:**
- Colored Badge component per card showing tier label only (no numeric score)
- Color palette: red for Critical (9-10), orange/amber for Important (7-8), blue for Notable (4-6)
- Low-importance articles (score 1-3) excluded from the briefing entirely

**Time scope and navigation:**
- Default briefing window: last 24 hours (rolling)
- Date stepper: prev/next arrows with date label and "Today" button
- Briefing page accessible from main navigation (add "Briefing" link to header nav)

### Claude's Discretion
- Empty state design and copy
- Exact card spacing, shadows, border radius
- Topic icon set for thumbnail fallbacks
- Date stepper component styling
- How to handle articles with multiple topic tags (show in primary topic group vs duplicate across groups)

### Deferred Ideas (OUT OF SCOPE)
- Article retention policy (delete after 3 days or count threshold)
- Date picker (calendar dropdown) for jumping to arbitrary past dates
- Collapsible topic groups

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BRIEF-01 | User can view a daily briefing page showing the top 5-10 most important articles | Prisma query with `importanceScore >= 4` filter, ordered by score descending, limited to 10; date window filter using `publishedAt >= startOfDay` |
| BRIEF-02 | Briefing displays AI summaries in an ADHD-friendly card layout (scannable, visual) | BriefingCard component reusing existing Badge, thumbnail field, and summary field from enriched Article; `date-fns` formatDistanceToNow for relative time |
| BRIEF-03 | Briefing is grouped by topic with clear visual hierarchy | Topics stored as JSON string; parse on server, group articles by primary topic, order groups by max score in group; TopicGroup component with heading |

</phase_requirements>

---

## Summary

Phase 3 delivers the daily briefing page as a pure UI layer on top of the enrichment data built in Phase 2. No new schema migrations are needed; all required fields (`summary`, `topics`, `importanceScore`, `enrichedAt`) are already on the Article model. The main technical work is writing the Prisma query for briefing articles, parsing the JSON topics field, implementing the grouping and ordering logic, extending the Badge component with color variants, and building three new components: BriefingCard, TopicGroup, and DateStepper.

The date stepper is the only interactive element that requires client state. The briefing page itself can be a Server Component like the home page, with only the DateStepper wrapped in `'use client'`. The recommended pattern is to pass the selected date via a URL search param (`?date=2026-03-19`) so the Server Component can re-fetch when the date changes — this avoids prop-drilling and enables direct linking to a specific briefing day.

The topics field stores a JSON-encoded string array (`'["model releases","developer tools"]'`). Parsing must happen on the server before grouping. Multi-topic articles should be assigned to their first topic tag (primary topic) rather than duplicated across groups — this is the cleanest approach for a launch-pad briefing and avoids visual confusion.

**Primary recommendation:** Build the briefing page as a Server Component that reads `?date` from searchParams, queries Prisma for `importanceScore >= 4` articles within the 24-hour window, parses topics, groups and sorts, then renders TopicGroup and BriefingCard components.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 16.1.7 (installed) | Page routing, Server Components, searchParams | Already in project |
| Prisma Client | 5.22.0 (installed) | Database queries with date range filtering | Already in project |
| date-fns | 4.1.0 (installed) | Date arithmetic (startOfDay, subDays) and relative time (formatDistanceToNow) | Already in project |
| lucide-react | 0.577.0 (installed) | Topic icon fallbacks (Code2, Cpu, Building2, etc.) | Already in project |
| React | 19.2.3 (installed) | Client component for DateStepper | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx + tailwind-merge | installed | Conditional class merging for variant Badge | Reuse existing `cn()` utility in `src/lib/utils.ts` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| URL searchParam for date | useState in layout | URL param enables Server Component re-fetch without API call; useState would require full client hydration of the page |
| Primary topic assignment | Duplicate across all topics | Duplication adds visual noise in a filtered briefing; primary-only is simpler and sufficient |

**Installation:**
No new packages needed. All dependencies installed by Phase 1 and Phase 2.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── briefing/
│       └── page.tsx              # Server Component, reads searchParams.date
├── components/
│   └── features/
│       └── briefing/             # New feature directory (matches CLAUDE.md convention)
│           ├── BriefingCard.tsx  # Article card (Server Component)
│           ├── TopicGroup.tsx    # Topic section heading + card list (Server Component)
│           ├── DateStepper.tsx   # Prev/Next/Today navigation ('use client')
│           └── index.ts          # Barrel export
└── types/
    └── index.ts                  # Extend ArticleRow; add BriefingArticle type
```

### Pattern 1: Server Component Page with URL Date Param

**What:** briefing/page.tsx receives `searchParams` and reads the `date` param to determine the 24-hour window. This is a React Server Component — no `'use client'`, Prisma called directly.

**When to use:** Any time the page data changes based on a URL parameter without requiring client-side state.

**Example:**
```typescript
// src/app/briefing/page.tsx
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, parseISO, isValid } from "date-fns";

export default async function BriefingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const dateParam = params.date;

  // Resolve selected date: URL param or today
  const selectedDate = dateParam && isValid(parseISO(dateParam))
    ? parseISO(dateParam)
    : new Date();

  const windowStart = startOfDay(selectedDate);
  const windowEnd = endOfDay(selectedDate);

  const articles = await prisma.article.findMany({
    where: {
      enrichedAt: { not: null },
      importanceScore: { gte: 4 }, // exclude Low tier (1-3)
      publishedAt: {
        gte: windowStart,
        lte: windowEnd,
      },
    },
    orderBy: { importanceScore: "desc" },
    take: 10,
    include: { source: { select: { name: true, category: true } } },
  });

  // Serialize for safe JSON round-trip (dates → strings)
  const serialized = JSON.parse(JSON.stringify(articles));
  // ... group by topic, render TopicGroup components
}
```

### Pattern 2: Topics JSON Parsing and Group Logic

**What:** `topics` field is stored as a JSON string array. Parse on server, assign each article to its first (primary) topic, then group and sort.

**Example:**
```typescript
// src/lib/briefing.ts  (or inline in page.tsx)
export type BriefingArticle = ArticleRow & {
  parsedTopics: string[];
  importanceTier: "critical" | "important" | "notable";
};

function parseTopics(raw: string | null): string[] {
  if (!raw) return ["Uncategorized"];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ["Uncategorized"];
  } catch {
    return ["Uncategorized"];
  }
}

function scoreToTier(score: number | null): BriefingArticle["importanceTier"] {
  if (!score || score <= 3) return "notable"; // won't appear, but safe fallback
  if (score >= 9) return "critical";
  if (score >= 7) return "important";
  return "notable";
}

export function groupArticlesByTopic(articles: ArticleRow[]): TopicGroup[] {
  const groups = new Map<string, BriefingArticle[]>();

  for (const article of articles) {
    const topics = parseTopics(article.topics);
    const primaryTopic = topics[0]; // first topic = primary
    const enriched: BriefingArticle = {
      ...article,
      parsedTopics: topics,
      importanceTier: scoreToTier(article.importanceScore),
    };
    if (!groups.has(primaryTopic)) groups.set(primaryTopic, []);
    groups.get(primaryTopic)!.push(enriched);
  }

  // Sort groups: highest max-importance score first
  return Array.from(groups.entries())
    .map(([topic, items]) => ({
      topic,
      articles: items, // already sorted by score from Prisma query
      maxScore: Math.max(...items.map((a) => a.importanceScore ?? 0)),
    }))
    .sort((a, b) => b.maxScore - a.maxScore);
}
```

### Pattern 3: DateStepper Client Component

**What:** Client component with prev/next/today buttons. Navigates by updating the URL `?date=` param using `useRouter().push()`. No external state needed.

**Example:**
```typescript
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { format, subDays, addDays, isToday, parseISO, isValid } from "date-fns";
import { Button } from "@/components/ui/button";

export function DateStepper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  const currentDate = dateParam && isValid(parseISO(dateParam))
    ? parseISO(dateParam)
    : new Date();

  const goTo = (date: Date) => {
    if (isToday(date)) {
      router.push("/briefing");
    } else {
      router.push(`/briefing?date=${format(date, "yyyy-MM-dd")}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => goTo(subDays(currentDate, 1))}>
        {/* ChevronLeft icon */}
      </Button>
      <span className="text-sm font-medium min-w-[120px] text-center">
        {isToday(currentDate) ? "Today" : format(currentDate, "MMM d, yyyy")}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => goTo(addDays(currentDate, 1))}
        disabled={isToday(currentDate)}
      >
        {/* ChevronRight icon */}
      </Button>
      {!isToday(currentDate) && (
        <Button variant="ghost" size="sm" onClick={() => goTo(new Date())}>
          Today
        </Button>
      )}
    </div>
  );
}
```

### Pattern 4: Badge Variant Extension for Importance Tiers

**What:** Extend the existing Badge component in `src/components/ui/badge.tsx` with three new color variants (`critical`, `important`, `notable`). These map to the locked color palette (red, amber, blue).

**Example:**
```typescript
// Extended BadgeProps and variant map in badge.tsx
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "critical" | "important" | "notable";
}

// In className mapping:
"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300": variant === "critical",
"bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300": variant === "important",
"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300": variant === "notable",
```

Note: Use Tailwind color tokens directly for these semantic colors (not CSS vars) since these are functional tiers, not brand colors. Verify WCAG 2.2 AA contrast for both light and dark modes.

### Anti-Patterns to Avoid

- **Client-rendering the whole briefing page:** The page should be a Server Component. Only DateStepper needs `'use client'`. Fetching in a client useEffect would break ISR and add loading states.
- **Calling JSON.parse in a client component on raw `topics` string:** Parse topics on the server before passing to client components. Passing the raw string to client components risks parsing errors in the browser.
- **Using `new Date()` inside a Server Component for "today":** `new Date()` in a Server Component runs at request time and is fine for this use case — but be aware it will be UTC-based on Vercel. The date param passed from the client should be in ISO format (`yyyy-MM-dd`) to avoid timezone confusion.
- **Fetching articles via API route from the briefing page:** Briefing page is a Server Component — call Prisma directly. Creating an `/api/briefing` route and fetching it client-side adds unnecessary latency and hydration overhead.
- **Hardcoding date range at build time:** Don't use `generateStaticParams` or export a static `revalidate` that would freeze the "today" window. Use `export const dynamic = "force-dynamic"` or pass no revalidate, since the briefing changes every time cron runs.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Relative time ("2h ago") | Custom interval formatter | `date-fns formatDistanceToNow` | Already installed; handles all edge cases (just now, hours, days) |
| Date arithmetic (start/end of day) | Manual midnight calculation | `date-fns startOfDay / endOfDay` | DST-safe, handles all locales correctly |
| Conditional Tailwind classes | Inline ternary chains | `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge) | Already established pattern in codebase |
| Icon set for topic fallbacks | Custom SVG icons | `lucide-react` (already installed) | Consistent with existing icon usage; covers all topic categories |
| URL navigation | `window.location.href` | `next/navigation useRouter` | Required for App Router client components; avoids full page reload |

**Key insight:** Phase 3 is entirely a UI composition layer. Almost every sub-problem (date math, icons, relative time, class utilities) is already solved by installed dependencies.

---

## Common Pitfalls

### Pitfall 1: Date Filtering Misses Articles Near Midnight
**What goes wrong:** Articles published at 23:59 or 00:01 may be missed if the date window uses `new Date()` without `startOfDay`/`endOfDay`.
**Why it happens:** `new Date()` returns current timestamp, not start of day; Prisma `gte` with a mid-day timestamp excludes morning articles.
**How to avoid:** Always use `startOfDay(date)` and `endOfDay(date)` for the window boundaries.
**Warning signs:** Briefing shows fewer articles than expected for past days.

### Pitfall 2: Topics Field Parse Failure Crashes the Page
**What goes wrong:** `JSON.parse(null)` or `JSON.parse("")` throws, crashing the Server Component render.
**Why it happens:** Articles enriched before the topics field existed, or enrichment failures, may leave `topics` as null.
**How to avoid:** Always wrap JSON.parse in try/catch with a fallback `["Uncategorized"]`. The `parseTopics()` helper above handles this.
**Warning signs:** 500 errors on briefing page when any article has null topics.

### Pitfall 3: searchParams in Next.js 15+ is Async
**What goes wrong:** `searchParams.date` throws a type error or returns undefined when accessed synchronously.
**Why it happens:** Next.js 15 made `searchParams` (and `params`) async Promises in Server Components.
**How to avoid:** Always `await searchParams` before reading properties (see Pattern 1 example above).
**Warning signs:** TypeScript error "Property 'date' does not exist on type Promise"; runtime undefined for date param.

### Pitfall 4: DateStepper Allows Navigation to Future Dates
**What goes wrong:** User can click "next" past today and see an empty briefing with no explanation.
**Why it happens:** No upper bound on the date stepper.
**How to avoid:** Disable the "next" button when `isToday(currentDate)` is true (shown in Pattern 3 example).
**Warning signs:** Empty briefing page with no articles and a future date in the stepper.

### Pitfall 5: Briefing Shows No Articles Despite Enriched Data
**What goes wrong:** The `publishedAt` date window filter returns zero articles even though enriched articles exist.
**Why it happens:** RSS feeds set `publishedAt` from the original publication date, which may be in UTC. If the article was published yesterday 11pm UTC but the user is in UTC+1, it falls in the previous day's window.
**How to avoid:** For MVP, accept UTC-based windows. Document that briefing windows are UTC. This is a known tradeoff vs. complexity of timezone-aware filtering.
**Warning signs:** Users in non-UTC timezones see articles in the "wrong" day's briefing.

### Pitfall 6: No `importanceTier` Field on Article — Derive It
**What goes wrong:** Treating `importanceTier` as a stored field when the schema only has `importanceScore` (Int).
**Why it happens:** The Phase 2 schema stores the numeric score, not the string tier label. The tier is derived at display time.
**How to avoid:** Use the `scoreToTier()` utility function to derive tier from score. Never add a migration for a derived field.
**Warning signs:** TypeScript error "Property importanceTier does not exist" on ArticleRow.

---

## Code Examples

Verified patterns from existing codebase:

### Prisma Date Range Query
```typescript
// Pattern: filter by date range + importance score floor
const articles = await prisma.article.findMany({
  where: {
    enrichedAt: { not: null },          // only enriched articles
    importanceScore: { gte: 4 },        // exclude Low tier (1-3)
    publishedAt: {
      gte: startOfDay(selectedDate),    // date-fns startOfDay
      lte: endOfDay(selectedDate),      // date-fns endOfDay
    },
  },
  orderBy: { importanceScore: "desc" }, // highest first
  take: 10,                             // top 10 cap
  include: { source: { select: { name: true, category: true } } },
});
```

### Relative Time Format (date-fns)
```typescript
import { formatDistanceToNow } from "date-fns";

// "The Verge, 2 hours ago"
const relativeTime = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });
```

### Nav Link Addition (layout.tsx pattern)
```typescript
// Add alongside existing Feed and Sources links in src/app/layout.tsx
<Link
  href="/briefing"
  className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
>
  Briefing
</Link>
```

### Barrel Export (index.ts pattern)
```typescript
// src/components/features/briefing/index.ts
export * from './BriefingCard'
export * from './TopicGroup'
export * from './DateStepper'
```

### Topic Icon Map (lucide-react)
```typescript
import { Code2, Cpu, Building2, FlaskConical, Scale, GitBranch, Terminal } from "lucide-react";

const TOPIC_ICONS: Record<string, React.ElementType> = {
  "developer tools":         Code2,
  "model releases":          Cpu,
  "industry moves":          Building2,
  "research & breakthroughs": FlaskConical,
  "ai regulation & policy":  Scale,
  "open source":             GitBranch,
  "ai coding tools":         Terminal,
};

function getTopicIcon(topic: string): React.ElementType {
  return TOPIC_ICONS[topic.toLowerCase()] ?? Cpu; // Cpu as default fallback
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `params`/`searchParams` as plain objects | `params`/`searchParams` as Promises (must `await`) | Next.js 15 | Must use `await searchParams` in Server Components |
| `useRouter().push` with full URL | Same, but `next/navigation` (not `next/router`) | App Router (Next 13+) | Must import from `next/navigation` not `next/router` |
| Direct `new Date()` comparison | Use `startOfDay`/`endOfDay` from date-fns | Always | Avoids partial-day filtering bugs |

**Deprecated/outdated:**
- `next/router`: Replaced by `next/navigation` for App Router. Using `next/router` in App Router components throws a runtime error.
- `pages/briefing.tsx`: This project uses App Router (`src/app/`), not Pages Router. Do not create a file in `pages/`.

---

## Open Questions

1. **Articles with no `publishedAt`**
   - What we know: `publishedAt` is `DateTime?` (nullable) in schema
   - What's unclear: Should articles with `publishedAt = null` appear in the briefing?
   - Recommendation: Exclude them from the briefing (fall back to `enrichedAt` only if explicitly decided). Add `publishedAt: { not: null }` to the where clause as a safe default.

2. **Multi-topic articles in Claude's Discretion**
   - What we know: Articles can have multiple topic tags; CONTEXT.md leaves this to Claude's discretion
   - Recommendation: Assign to primary topic (first element of the parsed array). This is simpler and avoids duplication. Can be revisited if users complain about miscategorization.

3. **`force-dynamic` vs. `revalidate` for briefing page**
   - What we know: The briefing page changes when cron runs (every hour)
   - What's unclear: Should it be `export const revalidate = 3600` (ISR, cached) or `force-dynamic` (always fresh)?
   - Recommendation: Use `export const revalidate = 300` (5 minutes) as a balance. The briefing doesn't need second-by-second freshness, and ISR reduces database load.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npm test -- --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BRIEF-01 | `groupArticlesByTopic` excludes articles with importanceScore < 4 | unit | `npm test -- src/lib/briefing.test.ts` | Wave 0 |
| BRIEF-01 | `groupArticlesByTopic` returns groups sorted by max score descending | unit | `npm test -- src/lib/briefing.test.ts` | Wave 0 |
| BRIEF-02 | `scoreToTier` maps scores to correct tier labels | unit | `npm test -- src/lib/briefing.test.ts` | Wave 0 |
| BRIEF-02 | `parseTopics` returns `["Uncategorized"]` for null/invalid JSON | unit | `npm test -- src/lib/briefing.test.ts` | Wave 0 |
| BRIEF-03 | Articles within a group are ordered by importanceScore descending | unit | `npm test -- src/lib/briefing.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- src/lib/briefing.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/lib/briefing.test.ts` — covers BRIEF-01, BRIEF-02, BRIEF-03 (grouping logic, tier derivation, topic parsing)
- [ ] `src/lib/briefing.ts` — pure utility module to extract testable logic from Server Component

*(Note: Server Component rendering and DateStepper navigation are manual-only. Vitest runs in `environment: 'node'` — no DOM/JSDOM configured, so component render tests are out of scope for this phase.)*

---

## Sources

### Primary (HIGH confidence)
- Existing codebase: `prisma/schema.prisma` — verified Article model fields (summary, topics as String?, importanceScore as Int?, enrichedAt)
- Existing codebase: `src/types/index.ts` — verified ArticleRow already includes enrichment fields
- Existing codebase: `src/app/page.tsx` — verified Server Component pattern with Prisma + JSON serialization
- Existing codebase: `src/app/layout.tsx` — verified nav link pattern for adding Briefing link
- Existing codebase: `src/components/ui/badge.tsx` — verified Badge variant extension approach
- Existing codebase: `vitest.config.ts` + `package.json` — confirmed Vitest 4.1.0, `npm test` command

### Secondary (MEDIUM confidence)
- Next.js App Router docs: `searchParams` is async Promise in Next.js 15+ — verified by TypeScript signature in existing pages
- Phase 2 CONTEXT.md: Topics stored as JSON string array, no `@default` per Prisma SQLite bug #26571 — confirmed in schema (topics String?)

### Tertiary (LOW confidence)
- WCAG 2.2 AA contrast for Tailwind red-100/red-800, amber-100/amber-800, blue-100/blue-800 badge variants: these are standard Tailwind palette colors with typically sufficient contrast but should be verified visually with the actual design system before shipping

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed; verified versions in package.json
- Architecture: HIGH — patterns derived directly from existing codebase patterns (page.tsx, layout.tsx, feed components)
- Pitfalls: HIGH — derived from actual schema constraints (nullable topics, async searchParams) and Phase 2 implementation notes
- Test map: HIGH — Vitest config verified, test commands confirmed

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable stack; Next.js minor version bumps possible but non-breaking)
