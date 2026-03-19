# Phase 2: AI Enrichment - Research

**Researched:** 2026-03-19
**Domain:** Vercel AI SDK v6, Vercel AI Gateway, Prisma SQLite schema migration, Vercel cron jobs
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Topic taxonomy**
- Seeded + AI-extendable: 7 seed categories, AI can create new ones when articles don't fit
- Seed categories: model releases, developer tools, industry moves, research & breakthroughs, AI regulation & policy, open source, AI coding tools
- Articles can have multiple topic tags (not limited to one)
- Store as array/relation, not single enum

**Importance scoring**
- Blended scoring: weighs both broad impact AND relevance to an AI-interested frontend developer
- Batch-aware scoring: AI sees all unenriched articles in one batch and scores them relative to each other, not independently
- Score stored as numeric 1-10, displayed as tier labels
- 4 tiers: Critical (9-10), Important (7-8), Notable (4-6), Low (1-3)

**Summary style**
- Analyst briefing tone: factual, implications-forward, dry
- Every summary includes a "why it matters" implication line
- 2-3 sentences per article
- Content source: RSS description + title + source name (no full-text scraping in v1)
- AI should flag cases where RSS description is too thin to produce a meaningful summary
- Example tone: "Anthropic released Claude 4.5 with 2x context window. This positions them ahead of GPT-5 on long-form tasks. Pricing unchanged."

**Enrichment timing**
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

### Deferred Ideas (OUT OF SCOPE)
- Full-text article fetching for richer summaries (v2): scrape article URLs to get full body text, producing higher-quality summaries especially for articles with thin RSS descriptions. Requires readability extraction, paywall handling, rate limiting, robots.txt compliance.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AIPL-01 | Each article is automatically summarized into a 2-3 sentence AI summary | AI SDK `generateText` with `Output.array()` produces per-article summaries in one batch call; Prisma `summary String?` column stores result |
| AIPL-02 | Each article is classified by topic (model releases, developer tools, industry moves, etc.) | Same batch call returns topics array per article; stored as `String` JSON column in SQLite (no native array support) |
| AIPL-03 | Each article receives an importance score (1-10) based on significance | Batch-aware prompt includes all articles; AI returns relative scores; stored as `Int?` column |
| AIPL-04 | AI enrichment runs as a separate cron job, decoupled from RSS fetch | Vercel Hobby plan supports exactly 2 cron jobs; second slot added to vercel.json at `/api/enrich`; enrichedAt timestamp gates skip logic |
</phase_requirements>

---

## Summary

This phase introduces AI enrichment via a new `/api/enrich` cron route that queries all unenriched articles, sends them in a single batch to Claude via the Vercel AI SDK + AI Gateway, and writes summary, topics, and importanceScore back to the database. The existing `/api/fetch` cron pattern (CRON_SECRET auth, Promise.allSettled error isolation) is directly reusable.

The Vercel AI SDK is at v6.0.116 as of March 2026. The key structural shift in v6 is that `generateObject` / `streamObject` are deprecated; structured output now uses `generateText` with `Output.array()` or `Output.object()` from the `ai` package. The project decision (PROJECT.md) mandates Vercel AI Gateway for provider flexibility. With the gateway, model calls use a `"provider/model.version"` string (e.g., `'anthropic/claude-haiku-4.5'`) instead of a provider-specific factory function. The only required package is `ai` — no `@ai-sdk/anthropic` needed. Authentication uses `AI_GATEWAY_API_KEY`.

SQLite does not support native scalar arrays in Prisma. Topics must be stored as a `String` column with `JSON.stringify` / `JSON.parse` in application code. Avoid adding a `@default` to the topics field due to a known Prisma SQLite migration bug. The enrichment sentinel is an `enrichedAt DateTime?` nullable timestamp: null means unenriched, set means skip.

**Primary recommendation:** Install `ai` + `zod`. Use `generateText` with `Output.array()` and model string `'anthropic/claude-haiku-4.5'` via AI Gateway. Store topics as serialized JSON string. Gate skip logic on `enrichedAt IS NULL`. Set `export const maxDuration = 60` on the enrich route.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | 6.0.116 | AI SDK core: `generateText`, `Output.array()`, AI Gateway routing, error types | Only package needed; AI Gateway is built into the `ai` package — no provider-specific SDK required |
| `zod` | 4.3.6 | Schema validation for structured AI output | Required by AI SDK `Output` types; already in ecosystem |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@ai-sdk/react` | 3.0.118 | Client-side streaming hooks | NOT needed for Phase 2 (server-only pipeline) |
| `@ai-sdk/anthropic` | 3.0.58 | Direct Anthropic provider (no gateway) | Only if AI Gateway is unavailable; bypasses gateway routing/monitoring |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| AI Gateway string model | `@ai-sdk/anthropic` direct | Direct is simpler for local dev but bypasses gateway auth, cost monitoring, and failover |
| Per-article API calls | Batch in single call | Batch is cheaper (fewer API calls), required by batch-aware scoring decision |
| Separate `ArticleEnrichment` table | Columns on `Article` | Separate table is cleaner but adds JOIN complexity for Phase 3 display; columns simpler given single-enrichment-per-article constraint |

**Installation:**
```bash
npm install ai zod
```

**Version verification (confirmed 2026-03-19):**
- `ai`: 6.0.116 (published 2026-03-05)
- `zod`: 4.3.6 (published 2026-01-22)

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/api/enrich/
│   └── route.ts            # New cron handler (mirrors /api/fetch pattern)
├── lib/
│   ├── ai.ts               # Model config constant (gateway model string)
│   └── enrich.ts           # Enrichment logic (batch AI call, schema, prompt)
prisma/
└── schema.prisma           # Add summary, topics, importanceScore, enrichedAt to Article
```

### Pattern 1: AI Gateway Model String (AI SDK v6)

**What:** With the Vercel AI Gateway, pass a `"provider/model.version"` string directly as the `model` parameter. No provider factory import needed.

**When to use:** All LLM calls in this project (project decision mandates gateway).

```typescript
// Source: https://vercel.com/docs/ai-gateway/getting-started/text
import { generateText, Output } from 'ai';
import { z } from 'zod';

// AI_GATEWAY_API_KEY env var is read automatically by the ai package
// Model string format: "provider/model-name.version" (dots for version numbers)
const { output } = await generateText({
  model: 'anthropic/claude-haiku-4.5',  // gateway routing: provider/model.version
  output: Output.array({ element: EnrichmentSchema }),
  system: SYSTEM_PROMPT,
  prompt: buildBatchPrompt(articles),
  maxTokens: 4096,
});
```

### Pattern 2: Batch Structured Output with AI SDK v6

**What:** Single `generateText` call with `Output.array()` returns a typed array of enrichment results for all unenriched articles.

**When to use:** Any time multiple items need identical structured processing in one LLM call.

```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
import { generateText, Output } from 'ai';
import { z } from 'zod';

const EnrichmentSchema = z.object({
  articleId: z.number(),
  summary: z.string(),
  topics: z.array(z.string()),
  importanceScore: z.number().int().min(1).max(10),
  thinContent: z.boolean(), // flag for insufficient RSS description
});

const { output } = await generateText({
  model: 'anthropic/claude-haiku-4.5',
  output: Output.array({ element: EnrichmentSchema }),
  system: SYSTEM_PROMPT,
  prompt: buildBatchPrompt(articles),
  maxTokens: 4096,
});
// output: EnrichmentResult[]
```

### Pattern 3: Enrichment Skip Gate

**What:** Query only articles where `enrichedAt IS NULL`. Update `enrichedAt` on success. This is the idempotency mechanism for AIPL-04.

**When to use:** Every cron invocation.

```typescript
// Source: project pattern from src/lib/rss.ts deduplication
const unenriched = await prisma.article.findMany({
  where: { enrichedAt: null },
  select: { id: true, title: true, description: true, source: { select: { name: true } } },
  orderBy: { publishedAt: 'desc' },
  take: BATCH_LIMIT, // cap to prevent timeout
});

if (unenriched.length === 0) {
  return NextResponse.json({ enriched: 0, skipped: 0 });
}
```

### Pattern 4: Cron Route with maxDuration

**What:** Export `maxDuration` from the route file to extend function timeout for AI API calls.

**When to use:** Any route making outbound LLM calls.

```typescript
// Source: https://vercel.com/docs/functions/configuring-functions/duration
export const maxDuration = 60; // seconds; Hobby plan Fluid Compute max is 300s

export async function GET(request: Request): Promise<Response> {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  // ...
}
```

Note: Vercel cron jobs call routes via GET by default. The existing `/api/fetch` uses POST — verify whether the cron is configured for POST or if only manual triggers use POST. The new `/api/enrich` should export a `GET` handler to match Vercel's cron invocation.

### Pattern 5: Topics Stored as JSON String in SQLite

**What:** SQLite has no native array type. Store topics as `JSON.stringify(["model releases", "developer tools"])` in a `String` column. Parse in application layer.

**When to use:** Any array field with SQLite + Prisma.

```typescript
// Writing
await prisma.article.update({
  where: { id: articleId },
  data: {
    topics: JSON.stringify(enrichmentResult.topics),
    summary: enrichmentResult.summary,
    importanceScore: enrichmentResult.importanceScore,
    enrichedAt: new Date(),
  },
});

// Reading (in API/component layer)
const topics: string[] = JSON.parse(article.topics ?? '[]');
```

### Pattern 6: Per-Item Save with Partial Failure Tolerance

**What:** After receiving the batch AI response, save each article's enrichment result individually. Use `Promise.allSettled` so one DB write failure does not block others. Collect errors for logging.

**When to use:** Applying batch AI results back to DB.

```typescript
const results = await Promise.allSettled(
  output.map(async (result) => {
    await prisma.article.update({
      where: { id: result.articleId },
      data: {
        summary: result.summary,
        topics: JSON.stringify(result.topics),
        importanceScore: result.importanceScore,
        enrichedAt: new Date(),
      },
    });
  })
);

const errors = results
  .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
  .map((r) => r.reason instanceof Error ? r.reason.message : String(r.reason));
```

### Anti-Patterns to Avoid

- **Setting `@default` on the topics field in Prisma schema:** A known Prisma bug generates invalid SQL for JSON defaults on SQLite (issue #26571). Use `topics String?` with no default; parse null as `[]` in application code.
- **Making one API call per article:** Defeats batch-aware scoring. The relative importance scoring requires all articles in a single prompt.
- **Using `generateObject` / `streamObject`:** Deprecated in AI SDK v6. Use `generateText` with `Output.array()` instead.
- **No batch cap:** Without `take: N`, a large article backlog could exceed Vercel's function timeout. Cap at ~50 articles per run.
- **Vercel cron method mismatch:** Vercel crons invoke via GET. If the route only exports POST, the cron receives a 405. Check and align HTTP method.
- **Using `@ai-sdk/anthropic` provider directly:** Bypasses the AI Gateway, losing cost monitoring, failover, and provider-agnostic routing.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema validation of AI output | Custom JSON parsing + type guards | `zod` + `Output.array({ element: schema })` | AI output can drift; Zod validates and throws `AI_NoObjectGeneratedError` on schema mismatch |
| Structured output mode | Raw JSON prompting + regex | `Output.array()` from `ai` v6 | SDK handles tool_use / response_format under the hood per provider |
| Provider routing and auth | Direct HTTP to provider APIs | AI Gateway (`AI_GATEWAY_API_KEY`) | Gateway handles auth, cost tracking, failover, and provider switching |
| Idempotency tracking | Separate enrichment_status table | `enrichedAt DateTime?` on Article | Single nullable timestamp is sufficient; no extra join needed |

**Key insight:** The AI SDK's `Output.array()` is specifically designed for batch structured output. It handles provider-specific schema passing, validates each element, and throws typed errors on failure — none of which are trivial to replicate correctly.

---

## Common Pitfalls

### Pitfall 1: Prisma Json Default on SQLite Breaks Migration

**What goes wrong:** Adding `topics String @default("[]")` to the schema causes `npx prisma migrate dev` to generate SQL with unquoted JSON, failing with "unrecognized token."

**Why it happens:** Prisma SQLite migration codegen bug (tracked: prisma/prisma#26571, active as of 2025).

**How to avoid:** Use `topics String?` (no default). Initialize `null` and parse `null` as `[]` in application code.

**Warning signs:** Migration SQL file contains bare `DEFAULT []` without string quoting.

### Pitfall 2: AI SDK v5/v6 API Mismatch

**What goes wrong:** Using `generateObject({ schema, prompt })` pattern from training data or older docs causes runtime errors in AI SDK v6.

**Why it happens:** `generateObject` / `streamObject` are deprecated in v6; replaced by `generateText` + `Output.object()` / `Output.array()`.

**How to avoid:** Use `generateText` with `output: Output.array({ element: schema })`. Import `Output` from `'ai'`.

**Warning signs:** TypeScript error "Property 'object' does not exist on type..." or runtime `AI_NoObjectGeneratedError` with no schema mismatch.

### Pitfall 3: Cron Job HTTP Method Mismatch

**What goes wrong:** Enrich cron never runs (or silently returns 405) because Vercel cron calls GET but the route only exports a POST handler.

**Why it happens:** The existing `/api/fetch` uses POST (may be manually triggered only; Vercel cron default is GET).

**How to avoid:** Export `GET` handler in `src/app/api/enrich/route.ts`. Check Vercel deployment logs for the fetch cron's actual invocation method.

**Warning signs:** Vercel logs show cron invocation with 405 status.

### Pitfall 4: Batch Too Large Causes Timeout

**What goes wrong:** First enrichment run has hundreds of articles; LLM response time exceeds `maxDuration` and Vercel terminates the function.

**Why it happens:** No upper bound on `findMany` query; 100+ articles in a single prompt creates large token counts.

**How to avoid:** Add `take: 50` (or configurable constant) to the `findMany` query. Multiple hourly runs drain the backlog.

**Warning signs:** Vercel function timeout errors in logs; no `enrichedAt` values being set despite articles existing.

### Pitfall 5: Article ID Not Returned in AI Response

**What goes wrong:** AI returns enrichment data but it cannot be matched back to the original article row for DB update.

**Why it happens:** LLM may reorder or omit items; without an ID in the output schema, position-based matching is fragile.

**How to avoid:** Include `articleId: z.number()` in the output schema element. Pass `id` in the prompt context for each article. Match output to DB records by `articleId`, not array index.

**Warning signs:** Wrong enrichment saved to wrong article; mismatched scores.

### Pitfall 6: AI_GATEWAY_API_KEY Not Set in Production

**What goes wrong:** AI calls fail with `AI_LoadAPIKeyError` in production; enrichment cron runs but writes nothing.

**Why it happens:** Env var set in `.env.local` for dev but not added to Vercel project environment variables.

**How to avoid:** Add `AI_GATEWAY_API_KEY` to Vercel project settings before deploying. Also verify `CRON_SECRET` is present.

**Warning signs:** `AI_LoadAPIKeyError` in Vercel function logs; enrichment route returns 500.

---

## Code Examples

### AI Gateway Model Configuration

```typescript
// Source: https://vercel.com/docs/ai-gateway/getting-started/text
// No provider import needed — AI Gateway handles routing via model string
// AI_GATEWAY_API_KEY env var is read automatically by the 'ai' package

// Model strings for AI Gateway (format: "provider/model-name.version"):
// 'anthropic/claude-haiku-4.5'   — fastest, cheapest ($1/$5 per MTok) — recommended for enrichment
// 'anthropic/claude-sonnet-4.6'  — better quality, moderate cost ($3/$15 per MTok)
// 'anthropic/claude-opus-4.6'    — highest quality, expensive ($5/$25 per MTok)
```

### Batch Enrichment Call

```typescript
// Source: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
import { generateText, Output } from 'ai';
import { z } from 'zod';

const ArticleEnrichmentSchema = z.object({
  articleId: z.number(),
  summary: z.string().describe('2-3 sentence analyst briefing. Final sentence: why it matters.'),
  topics: z.array(z.string()).describe('Topic categories. Use seeds or create new ones.'),
  importanceScore: z.number().int().min(1).max(10),
  thinContent: z.boolean().describe('True if RSS description too thin for meaningful summary'),
});

const SEED_TOPICS = [
  'model releases', 'developer tools', 'industry moves',
  'research & breakthroughs', 'AI regulation & policy', 'open source', 'AI coding tools',
];

const SYSTEM_PROMPT = `You are an analyst briefing tool for an AI-focused frontend developer.
For each article in the batch:
1. Write a 2-3 sentence summary. Tone: factual, dry, implications-forward. Final sentence starts with "This" and states the implication.
2. Assign one or more topic categories. Prefer from the seed list: ${SEED_TOPICS.join(', ')}. Create new categories only when no seed fits.
3. Score importance 1-10 relative to the OTHER articles in this batch. Consider: broad AI industry impact AND relevance to a frontend developer building with AI tools.
4. Set thinContent=true if the article description is too short or generic to summarize meaningfully.

Return results for ALL articles in the batch. Include the articleId in each result.`;

function buildBatchPrompt(
  articles: Array<{ id: number; title: string; description: string | null; sourceName: string }>
): string {
  return articles
    .map(
      (a) =>
        `--- Article ID: ${a.id}\nSource: ${a.sourceName}\nTitle: ${a.title}\nDescription: ${a.description ?? '(no description)'}`
    )
    .join('\n\n');
}

export async function enrichArticlesBatch(
  articles: Array<{ id: number; title: string; description: string | null; sourceName: string }>
): Promise<typeof ArticleEnrichmentSchema._type[]> {
  const { output } = await generateText({
    model: 'anthropic/claude-haiku-4.5',
    output: Output.array({ element: ArticleEnrichmentSchema }),
    system: SYSTEM_PROMPT,
    prompt: buildBatchPrompt(articles),
    maxTokens: 4096,
  });
  return output;
}
```

### Prisma Schema Addition

```prisma
// prisma/schema.prisma — add to Article model
model Article {
  // ... existing fields ...
  summary         String?
  topics          String?   // JSON-serialized string[]; no @default (SQLite migration bug)
  importanceScore Int?
  enrichedAt      DateTime?

  @@index([enrichedAt]) // enables efficient unenriched query
}
```

### Cron Route Structure

```typescript
// src/app/api/enrich/route.ts
import { NextResponse } from 'next/server';

export const maxDuration = 60; // seconds; Vercel Hobby Fluid Compute max is 300s

const BATCH_LIMIT = 50;

export async function GET(request: Request): Promise<Response> {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  // query unenriched, call enrichArticlesBatch(), save results with Promise.allSettled
  // return NextResponse.json({ enriched: N, errors: string[] })
}
```

### vercel.json Addition

```json
{
  "crons": [
    { "path": "/api/fetch", "schedule": "*/30 * * * *" },
    { "path": "/api/enrich", "schedule": "0 * * * *" }
  ]
}
```

### Environment Variables Required

```bash
# .env.local
AI_GATEWAY_API_KEY=your_key_from_vercel_ai_gateway_dashboard
CRON_SECRET=any-dev-value
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `generateObject({ schema, prompt })` | `generateText({ output: Output.array({ element }) })` | AI SDK v6 (2026) | `generateObject` deprecated; use new Output API |
| `streamObject` | `streamText` with `Output.array()` + `elementStream` | AI SDK v6 (2026) | Same deprecation path |
| `anthropic('model-id')` factory | `'anthropic/model.version'` string via gateway | AI Gateway integration | One key, all providers; cost monitoring + failover |
| Per-article API calls | Batch array output in one call | v4+ | Token efficiency + batch-aware scoring |

**Deprecated/outdated:**
- `generateObject` from `ai` v5: deprecated in v6, will be removed in a future version. Use `generateText` + `Output`.
- `streamObject` from `ai` v5: same deprecation.
- Direct `@ai-sdk/anthropic` usage: still works but bypasses gateway; not recommended for this project.

---

## Open Questions

1. **Vercel cron HTTP method for `/api/fetch`**
   - What we know: `/api/fetch` exports only POST; Vercel cron default is GET
   - What's unclear: Whether the existing cron is actually working in production (may be manually triggered via POST in local dev)
   - Recommendation: Check Vercel deployment logs for the fetch cron invocation method. If existing cron uses GET, align `/api/enrich` to GET. If POST, investigate whether cron method can be configured.

2. **Batch size tuning**
   - What we know: Hobby plan function timeout is 300s max (Fluid Compute); `maxDuration = 60` is a conservative default
   - What's unclear: Token count for a batch of 50 articles with ~200-word descriptions
   - Recommendation: Start with `take: 50`. Log `usage.totalTokens` from the AI SDK response. Adjust cap based on observed token counts.

3. **AI-generated category normalization**
   - What we know: User decision is Claude's discretion
   - What's unclear: Whether to store AI-invented categories verbatim or normalize to closest seed
   - Recommendation: Store verbatim. Categories are strings — Phase 3 display can group or deduplicate. Normalization is a v2 concern.

4. **Thin content handling**
   - What we know: AI should flag thin RSS descriptions; noted in user decisions
   - What's unclear: What to do when `thinContent: true` — write a partial summary, skip, or write a generic one
   - Recommendation: Write the best summary possible even with thin content; store `thinContent` as a nullable boolean column for Phase 3 to optionally surface a "limited info" indicator.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — Wave 0 must add Vitest |
| Config file | `vitest.config.ts` — Wave 0 |
| Quick run command | `npx vitest run --reporter=dot` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AIPL-01 | Summary written to DB after enrichment | unit (mock AI) | `npx vitest run src/lib/enrich.test.ts -t "writes summary"` | Wave 0 |
| AIPL-02 | Topics array stored as JSON string | unit | `npx vitest run src/lib/enrich.test.ts -t "topics serialized"` | Wave 0 |
| AIPL-03 | importanceScore saved as integer 1-10 | unit | `npx vitest run src/lib/enrich.test.ts -t "importance score"` | Wave 0 |
| AIPL-04 | Already-enriched articles are skipped | unit | `npx vitest run src/lib/enrich.test.ts -t "skips enriched"` | Wave 0 |
| AIPL-04 | Enrich cron returns 401 without CRON_SECRET | unit (route) | `npx vitest run src/app/api/enrich/route.test.ts -t "auth"` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/enrich.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` — Vitest config with Next.js/TypeScript support
- [ ] `src/lib/enrich.test.ts` — unit tests covering AIPL-01 through AIPL-04 (mock `generateText`)
- [ ] `src/app/api/enrich/route.test.ts` — route-level auth test
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react`

---

## Sources

### Primary (HIGH confidence)

- `https://vercel.com/docs/ai-gateway/getting-started/text` — AI Gateway model string format (`'provider/model.version'`), `AI_GATEWAY_API_KEY`, TypeScript example
- `https://vercel.com/docs/ai-gateway` — AI Gateway overview, capabilities, authentication
- `https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data` — `Output.array()` API, batch pattern
- `https://ai-sdk.dev/docs/migration-guides/migration-guide-6-0` — `generateObject` deprecation confirmed
- `https://platform.claude.com/docs/en/docs/about-claude/models` — Claude model IDs and pricing (verified 2026-03-19)
- `https://vercel.com/docs/functions/configuring-functions/duration` — `maxDuration` export pattern, 300s Hobby Fluid Compute max
- `npm view ai version` — 6.0.116 confirmed (published 2026-03-05)
- `npm view zod version` — 4.3.6 confirmed (published 2026-01-22)

### Secondary (MEDIUM confidence)

- `https://vercel.com/blog/ai-sdk-6` — AI SDK v6 feature overview, `Output` API introduction
- Prisma SQLite JSON default bug (prisma/prisma#26571) — confirmed via WebSearch; avoid `@default` on String/Json fields in SQLite schemas

### Tertiary (LOW confidence)

- Batch size of 50 articles — estimated based on haiku 200k context limit; needs empirical validation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified against npm registry 2026-03-19; AI Gateway model string format verified against official Vercel docs
- Architecture: HIGH — AI SDK v6 API verified against official docs; cron pattern mirrors existing working code; gateway setup verified
- Pitfalls: HIGH for known issues (Prisma SQLite bug, API deprecation, method mismatch, missing env var); MEDIUM for operational pitfalls (batch size tuning)

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (AI SDK moves fast; re-verify if more than 30 days old)
