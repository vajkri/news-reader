# Architecture Research

**Domain:** AI-powered news reader / RSS reader with AI enrichment pipeline
**Researched:** 2026-03-19
**Confidence:** HIGH (Vercel AI SDK docs verified via Context7/official sources; integration patterns verified via official Prisma + Vercel docs)

## Standard Architecture

### System Overview

The target architecture adds three layers on top of the existing RSS reader: an AI enrichment pipeline (batch), an AI chat interface (interactive), and a user identity/preferences layer (persistent). These integrate at well-defined boundaries without requiring a rewrite.

```
┌───────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Feed/Briefing│  │  Chat UI     │  │  Auth UI  │  │Settings  │  │
│  │  (existing+) │  │  (new)       │  │  (new)    │  │  (new)   │  │
│  └──────┬───────┘  └──────┬───────┘  └────┬─────┘  └────┬─────┘  │
├─────────┼──────────────────┼───────────────┼──────────────┼────────┤
│                        API LAYER                                    │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌────┴──────────────┴─────┐  │
│  │  /api/articles│  │  /api/chat   │  │  /api/auth + /api/prefs  │  │
│  │  (existing+) │  │  (new)       │  │  (new)                   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┬──────────┘  │
│         │                 │                          │             │
│  ┌──────┴─────────────────┴──────────────────────────┴──────────┐  │
│  │                  AI SERVICE LAYER (new)                       │  │
│  │  Vercel AI SDK + AI Gateway (provider-agnostic)               │  │
│  │  ┌──────────────┐  ┌────────────────┐  ┌──────────────────┐  │  │
│  │  │ Enrichment   │  │  Chat/RAG      │  │  Structured      │  │  │
│  │  │ (generateText│  │  (streamText + │  │  Output          │  │  │
│  │  │  + schema)   │  │   useChat)     │  │  (generateObject)│  │  │
│  │  └──────────────┘  └────────────────┘  └──────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                        DATA LAYER                                    │
│  ┌──────────────────────────┐  ┌──────────────────────────────────┐  │
│  │  SQLite (Prisma)          │  │  Cron Jobs (Vercel)               │  │
│  │  Articles (enriched cols) │  │  /api/fetch (existing)            │  │
│  │  Sources                  │  │  /api/enrich (new)                │  │
│  │  Users                    │  │  /api/briefing/generate (new)     │  │
│  │  UserPreferences          │  │                                   │  │
│  │  ChatSessions             │  │                                   │  │
│  │  ChatMessages             │  │                                   │  │
│  └──────────────────────────┘  └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| AI Enrichment Pipeline | Batch-processes raw articles; writes summary, topics, priority, importance score back to DB | Cron-triggered API route using `generateText` with `Output.object()` + Zod schema; processes N articles per run |
| Chat Interface | Answers natural-language questions over ingested articles | `useChat` hook → `/api/chat` route → `streamText` with tool-calling; retrieves articles via Prisma queries as context |
| Briefing Generator | Builds the daily AI briefing page content | Scheduled cron or on-demand Server Action; aggregates recent articles + AI-generated cluster summaries |
| AI Gateway / Provider Config | Routes all AI calls through single interface; swaps Claude / OpenAI without code changes | `createGateway()` from `ai` package; model string format `"anthropic/claude-sonnet-4.6"`; BYOK via env vars |
| Auth Layer | Signs users in/out; persists session; gates preference APIs | NextAuth.js v5 (Auth.js) with App Router adapter; JWT sessions for simplicity, DB sessions when revocation needed |
| User Preferences | Stores topics of interest, notification thresholds, UI settings | Prisma `UserPreferences` model; read in Server Components to personalize queries |
| Notification Trigger | Fires push notification for high-priority breaking news | API route or cron-called function; checks articles above priority threshold + calls web push library |

## Recommended Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── articles/         # existing - extend with AI fields in response
│   │   ├── fetch/            # existing cron/manual fetch
│   │   ├── enrich/
│   │   │   └── route.ts      # cron target: batch AI enrichment of raw articles
│   │   ├── chat/
│   │   │   └── route.ts      # POST: streamText with article context tool
│   │   ├── briefing/
│   │   │   └── route.ts      # GET: returns or generates daily briefing data
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts  # NextAuth.js handler
│   ├── briefing/
│   │   └── page.tsx          # Daily briefing page (Server Component)
│   ├── chat/
│   │   └── page.tsx          # Chat interface (Client Component using useChat)
│   ├── settings/
│   │   └── page.tsx          # User preferences UI
│   └── page.tsx              # existing feed/article list
├── components/
│   ├── briefing/             # BriefingCard, TopicCluster, PriorityBadge
│   ├── chat/                 # ChatWindow, MessageBubble, ChatInput
│   ├── feed/                 # existing FeedTable, FeedToolbar (extend columns)
│   └── ui/                   # existing shadcn primitives
├── lib/
│   ├── ai/
│   │   ├── gateway.ts        # createGateway() singleton + model helpers
│   │   ├── enrichment.ts     # enrichArticle() — generateText with schema
│   │   ├── briefing.ts       # generateBriefing() — cluster + summarize
│   │   └── schemas.ts        # Zod schemas for all AI structured outputs
│   ├── auth.ts               # NextAuth.js config (providers, callbacks)
│   ├── prisma.ts             # existing singleton
│   ├── rss.ts                # existing
│   ├── readtime.ts           # existing
│   └── thumbnail.ts          # existing
└── types/
    └── index.ts              # extend with AI-enriched article types
```

### Structure Rationale

- **lib/ai/:** Isolates all AI logic from API routes. Routes stay thin (validate input → call lib → return response). Makes testing and provider swapping easier.
- **lib/ai/gateway.ts:** Single place to configure AI provider. All other AI functions import from here. Changing providers means editing one file.
- **lib/ai/schemas.ts:** Centralised Zod schemas ensure consistent structured output across enrichment, briefing, and classification calls.
- **app/api/enrich/:** Separate from `/api/fetch` by design — fetch gets articles into DB fast; enrich runs as a second pass so fetch latency is not blocked by AI calls.

## Architectural Patterns

### Pattern 1: Two-Phase Article Processing (Fetch then Enrich)

**What:** RSS fetch writes raw articles to DB immediately. A separate cron job (or post-fetch trigger) calls AI enrichment as a second pass, writing summary, topics, priority, and importance_score back to the same Article row.

**When to use:** Always. Keeps feed fetching fast and decoupled from AI latency. If enrichment fails, raw articles are still available. Cron can retry un-enriched articles.

**Trade-offs:** Small delay between article ingestion and enriched display. Handled by showing unenriched articles immediately with a "processing" indicator and filtering/sorting by `enrichedAt IS NOT NULL` for the briefing page.

**Example:**
```typescript
// lib/ai/enrichment.ts
import { generateText, Output } from 'ai';
import { gateway } from './gateway';
import { articleEnrichmentSchema } from './schemas';

export async function enrichArticle(article: { title: string; description: string }) {
  const { output } = await generateText({
    model: gateway('anthropic/claude-haiku-4.5'), // cheap model for batch
    output: Output.object({ schema: articleEnrichmentSchema }),
    prompt: `Analyze this AI industry news article and return structured metadata.\n\nTitle: ${article.title}\n\nDescription: ${article.description}`,
  });
  return output; // { summary, topics, priority, importanceScore, isBreaking }
}
```

```typescript
// lib/ai/schemas.ts
import { z } from 'zod';

export const articleEnrichmentSchema = z.object({
  summary: z.string().describe('1-2 sentence summary, plain text, no jargon'),
  topics: z.array(z.string()).describe('2-4 topic tags, e.g. ["model-release", "openai"]'),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  importanceScore: z.number().min(0).max(100).describe('Relevance to AI/developer audience'),
  isBreaking: z.boolean().describe('True if this is time-sensitive breaking news'),
});
```

### Pattern 2: Streaming Chat with Article Context Tool

**What:** Chat route uses `streamText` with a `getArticles` tool. When user asks "what happened with OpenAI this week?", the model calls the tool, which runs a Prisma query filtered by topic/date, and streams the synthesized answer back. No vector database needed — full-text SQL search over enriched article fields suffices for this domain.

**When to use:** The default approach. Avoids pgvector/external vector DB complexity while SQLite article count stays below ~100k rows. Upgrade to vector search only if semantic recall becomes noticeably poor.

**Trade-offs:** SQL-based retrieval is exact (keywords/topics) not semantic. Works well when articles are already topic-tagged. For vague questions, model may not find the right articles. Flag for future embedding-based fallback.

**Example:**
```typescript
// app/api/chat/route.ts
import { streamText, tool } from 'ai';
import { gateway } from '@/lib/ai/gateway';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: gateway('anthropic/claude-sonnet-4.5'),
    system: 'You are an AI news assistant. Use the getArticles tool to retrieve relevant articles before answering.',
    messages,
    tools: {
      getArticles: tool({
        description: 'Retrieve news articles by topic, date range, or keyword',
        parameters: z.object({
          topics: z.array(z.string()).optional(),
          daysBack: z.number().optional().default(7),
          limit: z.number().optional().default(10),
        }),
        execute: async ({ topics, daysBack, limit }) => {
          const since = new Date(Date.now() - daysBack * 86400000);
          return prisma.article.findMany({
            where: {
              publishedAt: { gte: since },
              ...(topics?.length ? { topics: { hasSome: topics } } : {}),
            },
            orderBy: { importanceScore: 'desc' },
            take: limit,
            select: { title: true, summary: true, url: true, publishedAt: true, topics: true },
          });
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
```

### Pattern 3: Server Action for On-Demand Generation

**What:** Use Next.js Server Actions (not API routes) for UI-triggered AI operations like "generate briefing now" or "summarise this article." Server Actions run server-side, keep API keys out of client, and integrate cleanly with React state.

**When to use:** User-initiated single-item operations. For batch background work, use API routes targeted by cron.

**Trade-offs:** Server Actions can't stream responses directly to UI without wrapper hooks. For streaming chat, stick to the API route + `useChat` pattern. For non-streaming operations (classification, summary), Server Actions are cleaner.

## Data Flow

### AI Enrichment Flow (Batch, Cron-triggered)

```
Vercel Cron (every 30min or hourly)
    ↓
POST /api/enrich
    ↓
Query: articles WHERE enrichedAt IS NULL LIMIT 20
    ↓
For each article:
  generateText(title + description) → structured output via Zod schema
    ↓
  prisma.article.update({ summary, topics, priority, importanceScore, enrichedAt })
    ↓
Return: { processed: N, errors: M }
```

### Chat Query Flow (Interactive, Streaming)

```
User types question in ChatWindow
    ↓
useChat hook → POST /api/chat { messages }
    ↓
streamText() — model decides to call getArticles tool
    ↓
getArticles({ topics: ['openai'], daysBack: 7 })
  → Prisma query → returns articles array
    ↓
Model synthesizes answer using articles as context
    ↓
Stream chunks back → Server-Sent Events → UI updates in real time
    ↓
onFinish → save ChatSession + ChatMessages to Prisma
```

### Daily Briefing Generation Flow

```
Cron (daily at 7am UTC) → POST /api/briefing/generate
    OR
User visits /briefing → check DB for today's briefing → if missing, generate on demand
    ↓
Query: articles from last 24h WHERE priority IN ('critical','high') ORDER BY importanceScore DESC
    ↓
generateText(articles batch) → { headline, sections: [{topic, summary, articles}], topStory }
    ↓
prisma.dailyBriefing.upsert({ date: today, content: JSON })
    ↓
Server Component reads briefing from DB → renders BriefingCard components
```

### Auth + Preferences Flow

```
User signs in → NextAuth.js → session JWT
    ↓
Session available in Server Components via auth()
    ↓
Prisma UserPreferences lookup by userId
    ↓
Preferences injected into: article queries (topic filter), chat system prompt, notification threshold
```

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | SQLite fine; single Vercel deployment; no queue needed; 1 enrichment cron |
| 1k-10k users | SQLite read pressure mounts — migrate to Turso (libSQL) for distributed reads; add Redis for chat session cache |
| 10k+ users | Switch to PostgreSQL + pgvector for semantic search; background job queue (Inngest or Trigger.dev) for enrichment; separate API deployment |

### Scaling Priorities

1. **First bottleneck:** SQLite write contention during cron enrichment while users query simultaneously. Fix: migrate to Turso (libSQL, drop-in replacement) or add write queuing.
2. **Second bottleneck:** AI enrichment cron costs and latency at article volume. Fix: use cheapest viable model (Claude Haiku) for bulk enrichment, reserve Sonnet/Opus for chat and briefing.

## Anti-Patterns

### Anti-Pattern 1: Enriching Inside the Fetch Cron

**What people do:** Call the AI API inside `/api/fetch` for each article as it arrives, blocking the response until all articles are enriched.

**Why it's wrong:** Feed fetch becomes fragile — one AI API timeout fails the whole batch. Cron function duration limits hit quickly. Users experience slow "Fetch latest" button. Enrichment errors prevent article storage.

**Do this instead:** Fetch stores raw articles immediately. A second cron (or a fire-and-forget call at end of fetch) handles enrichment as a separate pass. Fetch and enrich are independently retriable.

### Anti-Pattern 2: Vector Database Premature Adoption

**What people do:** Add pgvector, generate embeddings for every article, build full RAG pipeline from day one.

**Why it's wrong:** Adds significant operational complexity (embedding generation latency, vector index maintenance, Postgres migration) before validating that keyword/topic retrieval is insufficient. For a curated AI news domain with good topic tags, SQL-based retrieval covers 90% of user queries.

**Do this instead:** Start with SQL-based article retrieval via Prisma in the chat tool. Tag articles well via AI enrichment. Add embeddings only when users report the chat missing relevant articles that topic search should have found.

### Anti-Pattern 3: Client-Side AI Calls

**What people do:** Import AI SDK directly in React components to call the model from the browser.

**Why it's wrong:** Exposes API keys to the browser (critical security failure). Cannot use BYOK safely. Bypasses the AI Gateway.

**Do this instead:** All AI calls in API routes or Server Actions. Client only communicates with your own endpoints (`/api/chat`, Server Actions). API keys stay in `.env` on the server.

### Anti-Pattern 4: One Giant System Prompt With All Articles

**What people do:** Load all articles from the last week into the chat system prompt on every request.

**Why it's wrong:** Token cost scales linearly with article count. Slow to first token. Model context window saturation degrades response quality.

**Do this instead:** Use tool-calling — let the model request only the articles it needs for the specific question. 10-15 targeted articles beat 500 undifferentiated articles in context quality and cost.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vercel AI Gateway | `createGateway()` singleton in `lib/ai/gateway.ts`; model strings `"anthropic/claude-haiku-4.5"` etc. | BYOK: add provider API keys to Vercel env vars; no code changes to switch providers |
| Anthropic Claude (via Gateway) | Default provider; use Haiku for batch enrichment, Sonnet for chat/briefing | Gateway handles auth headers and streaming protocol differences |
| NextAuth.js v5 (Auth.js) | App Router adapter; `app/api/auth/[...nextauth]/route.ts`; `auth()` in Server Components | JWT sessions recommended for self-hosting simplicity; migrate to DB sessions if "sign out everywhere" is needed |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Presentation → API | HTTP fetch / `useChat` hook / Server Actions | `useChat` targets `/api/chat`; other mutations use `fetch` to API routes or Server Actions |
| API routes → AI Service Layer | Direct function calls to `lib/ai/*.ts` | Routes stay thin; all AI logic in lib functions |
| AI Service Layer → Prisma | Direct Prisma client calls | AI lib functions can read/write articles during enrichment; chat tool reads articles only |
| Cron → API routes | HTTP GET/POST from Vercel scheduler | Verify `Authorization: Bearer ${CRON_SECRET}` header in every cron-targeted route |
| Auth layer → User data | `auth()` → session → Prisma `UserPreferences` lookup | Cache with React `cache()` to avoid duplicate DB calls per render |

## Build Order Implications

Dependencies flow in this order — each item must exist before the next:

1. **Database schema extension** — Add AI enrichment columns (`summary`, `topics`, `priority`, `importanceScore`, `enrichedAt`, `isBreaking`) to Article model; add `User`, `UserPreferences`, `ChatSession`, `ChatMessage` models. Required by everything else.

2. **AI Gateway setup** (`lib/ai/gateway.ts` + `lib/ai/schemas.ts`) — Required by enrichment pipeline, chat API, and briefing generator.

3. **Article enrichment pipeline** (`lib/ai/enrichment.ts` + `/api/enrich`) — Populates AI fields that feed pipeline and briefing display. Can ship before auth; runs as single shared pipeline (no per-user logic yet).

4. **Authentication** (`lib/auth.ts` + NextAuth routes) — Required before user preferences, personalised chat, and notifications.

5. **User preferences** (`UserPreferences` model + settings UI) — Required before personalized article queries.

6. **Chat interface** (`/api/chat` + `app/chat/page.tsx`) — Depends on enrichment (topic tags improve tool precision) and auth (persist chat history per user).

7. **Daily briefing page** (`/api/briefing` + `app/briefing/page.tsx`) — Depends on enrichment pipeline being populated. Can ship without auth (public briefing) then personalize after.

8. **Push notifications** — Depends on auth (need user accounts to send to) and enrichment (`isBreaking` flag triggers notifications). Build last.

## Sources

- [Vercel AI SDK — Getting Started: Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) — HIGH confidence
- [Vercel AI SDK — Generating Structured Data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) — HIGH confidence
- [Vercel AI SDK — RAG Chatbot Guide](https://ai-sdk.dev/cookbook/guides/rag-chatbot) — HIGH confidence
- [Vercel AI SDK — AI Gateway Providers](https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway) — HIGH confidence
- [Prisma — AI SDK + Next.js Chat Integration Guide](https://www.prisma.io/docs/guides/ai-sdk-nextjs) — HIGH confidence
- [Vercel Academy — Automatic Summarization](https://vercel.com/academy/ai-sdk/automatic-summarization) — HIGH confidence
- [Vercel Academy — Text Classification](https://vercel.com/academy/ai-sdk/text-classification) — HIGH confidence
- [NextAuth.js v5 App Router authentication](https://next-auth.js.org) — MEDIUM confidence (rapidly evolving; verify version compatibility with Next.js 16 before implementing)
- [Next.js Background Jobs — Inngest vs Trigger.dev vs Vercel Cron](https://www.hashbuilds.com/articles/next-js-background-jobs-inngest-vs-trigger-dev-vs-vercel-cron) — MEDIUM confidence

---
*Architecture research for: AI news reader — AI enrichment + chat integration with existing Next.js/Prisma/SQLite stack*
*Researched: 2026-03-19*
