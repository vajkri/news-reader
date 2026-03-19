# Phase 2: AI Enrichment - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Automatically enrich every new article with an AI-generated summary, topic classification, and importance score via a background cron pipeline. This phase delivers the enrichment pipeline and schema changes only. Displaying enrichment data in user-facing views (beyond article detail) is Phase 3. Chat access to enriched data is Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Topic taxonomy
- Seeded + AI-extendable: 7 seed categories, AI can create new ones when articles don't fit
- Seed categories: model releases, developer tools, industry moves, research & breakthroughs, AI regulation & policy, open source, AI coding tools
- Articles can have multiple topic tags (not limited to one)
- Store as array/relation, not single enum

### Importance scoring
- Blended scoring: weighs both broad impact AND relevance to an AI-interested frontend developer
- Batch-aware scoring: AI sees all unenriched articles in one batch and scores them relative to each other, not independently
- Score stored as numeric 1-10, displayed as tier labels
- 4 tiers: Critical (9-10), Important (7-8), Notable (4-6), Low (1-3)

### Summary style
- Analyst briefing tone: factual, implications-forward, dry
- Every summary includes a "why it matters" implication line
- 2-3 sentences per article
- Content source: RSS description + title + source name (no full-text scraping in v1)
- AI should flag cases where RSS description is too thin to produce a meaningful summary
- Example tone: "Anthropic released Claude 4.5 with 2x context window. This positions them ahead of GPT-5 on long-form tasks. Pricing unchanged."

### Enrichment timing
- Separate cron job, decoupled from RSS fetch (AIPL-04 requirement)
- Schedule: every hour (RSS fetch runs every 30 min)
- CRON_SECRET auth, same pattern as /api/fetch
- Already-enriched articles skipped on subsequent runs (AIPL-04 requirement)
- Uses the last available Hobby plan cron slot

### Claude's Discretion
- Error handling strategy for mid-batch failures (partial save vs skip-and-retry)
- Schema design for enrichment fields (new columns on Article vs separate table)
- Batch size for AI API calls (all unenriched at once vs chunked)
- Prompt engineering for classification, scoring, and summarization
- How to handle AI-generated categories that aren't in the seed list (store freely vs normalize)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` -- Project vision, constraints, key decisions (AI SDK + AI Gateway, Claude as default provider)
- `.planning/REQUIREMENTS.md` -- AIPL-01 through AIPL-04 acceptance criteria
- `.planning/ROADMAP.md` -- Phase 2 success criteria (5 items)

### Existing codebase
- `.planning/codebase/CONCERNS.md` -- Known issues, fragile areas, test coverage gaps
- `.planning/codebase/STACK.md` -- Full technology stack (Prisma, SQLite, Next.js 16, etc.)
- `prisma/schema.prisma` -- Current Article model (no enrichment fields yet)
- `src/app/api/fetch/route.ts` -- Existing cron pattern (CRON_SECRET auth, Promise.allSettled)
- `vercel.json` -- Current cron config (1 job, 1 slot remaining on Hobby plan)

### Phase 1 decisions
- `.planning/phases/01-foundation/01-CONTEXT.md` -- Caching strategy, Server Component patterns, design system tokens

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/api/fetch/route.ts`: Cron handler pattern with CRON_SECRET auth, Promise.allSettled for parallel processing, error aggregation
- `src/lib/prisma.ts`: Prisma client singleton
- `src/lib/rss.ts`: RSS parsing with guid deduplication logic (same skip-existing pattern needed for enrichment)

### Established Patterns
- Cron auth: `Bearer ${process.env.CRON_SECRET}` header check, 401 on failure
- Batch processing: Promise.allSettled with per-item error collection
- Prisma createMany for bulk inserts
- Deduplication: check existing records before processing (guid-based in fetch, enrichment-status-based here)

### Integration Points
- `prisma/schema.prisma`: Needs new fields (summary, topics, importanceScore, enrichedAt) on Article model
- `vercel.json`: Needs second cron entry for enrichment endpoint
- New API route: `src/app/api/enrich/route.ts` (follows fetch pattern)
- No AI SDK packages installed yet: needs `ai` and `@ai-sdk/react` (or just `ai` for server-only pipeline)

</code_context>

<specifics>
## Specific Ideas

- Analyst briefing tone modeled after: "Anthropic released Claude 4.5 with 2x context window. This positions them ahead of GPT-5 on long-form tasks. Pricing unchanged."
- 7 seed categories chosen by a frontend tech lead tracking AI/tech news: model releases, developer tools, industry moves, research & breakthroughs, AI regulation & policy, open source, AI coding tools
- Batch-aware scoring means the enrichment prompt should include all unenriched articles so the AI can rank them relative to each other
- Tier labels (Critical/Important/Notable/Low) designed for ADHD-friendly scanning in the Phase 3 briefing

</specifics>

<deferred>
## Deferred Ideas

- Full-text article fetching for richer summaries (v2): scrape article URLs to get full body text, producing higher-quality summaries especially for articles with thin RSS descriptions. Requires readability extraction, paywall handling, rate limiting, robots.txt compliance.

</deferred>

---

*Phase: 02-ai-enrichment*
*Context gathered: 2026-03-19*
