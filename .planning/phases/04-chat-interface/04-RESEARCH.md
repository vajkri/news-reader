# Phase 4: Chat Interface - Research

**Researched:** 2026-03-21
**Domain:** Vercel AI SDK v6 streaming + tool-calling, React chat UI, Postgres rate limiting
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Tool-calling over vector embeddings. LLM calls Prisma queries as tools to search articles by keyword, date, topic, source.
- **D-02:** Responses grounded only in collected articles. System prompt + tool design must prevent hallucination.
- **D-03:** `openai/gpt-5-mini` via AI Gateway ($0.25/$2.00 per M tokens). GPT-5 series quality, best-in-class tool-calling, 400K context window.
- **D-04:** Rate limiting via Postgres table using Prisma model in existing Neon DB. No new dependencies.
- **D-05:** 20 messages/hour limit. 10-turn conversation history kept per session. No output token cap.
- **D-06:** Source cards below response. Answer text first, then clickable article cards (title, source, date) underneath.
- **D-07:** Dockable, resizable chat panel. Side panel on desktop (default), bottom panel on mobile.
- **D-08:** Default side panel width: 350px. Default bottom panel height: 25dvh with px min/max guards.
- **D-09:** Trigger: floating action button (bottom-right corner, always visible) + keyboard shortcut (Cmd+K / Ctrl+K per UI-SPEC).
- **D-10:** No dedicated `/chat` page. Chat is an overlay panel accessible from any page.
- **D-11:** Single conversation at a time. In-memory React state. Closing hides; re-opening restores. Clears on page refresh.
- **D-12:** "New conversation" button inside panel header to clear history.
- **D-13:** No conversation persistence to database in v1.
- **D-14:** Generic empty state: icon + heading + subtitle + clickable prompt chips.
- **D-15:** Hardcoded chips: "What's new with Claude?", "Top stories today", "Developer tools this week", "Summarize model releases".
- **D-16:** Input placeholder: "Ask about any topic, source, or time period..."
- **D-17:** No welcome message bubble.
- **D-18:** "Chat about this" button on each BriefingCard. Opens with article context pre-loaded.
- **D-19:** Wait for user to type (no auto-send). Pinned context card (title, source, date) + contextual chips.
- **D-20:** Input placeholder changes to: "Ask anything about this article..."
- **D-21:** Consistent visual language with generic empty state.
- **D-22:** No automatic context seeding from current page. Chat starts blank unless triggered via "Chat about this".

### Claude's Discretion
- Tool definitions (exact Prisma query tools the LLM receives)
- System prompt wording for grounding constraint
- Streaming implementation details
- Rate limit table schema
- Panel resize handle design and drag behavior
- Keyboard shortcut choice (researched: Cmd+K / Ctrl+K confirmed in UI-SPEC)
- Exact panel animation (slide-in transition)
- Error states (rate limit exceeded, API failure, no results found)
- "Chat about this" context card exact styling

### Deferred Ideas (OUT OF SCOPE)
- Recent questions memory (SEED-002)
- Context carry-over from current page (auto-seeding)
- Multiple saved conversation threads
- Dynamic prompt chips generated from today's topics
- Topic group / page-level summarize buttons
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHAT-01 | User can ask natural language questions about collected news | Covered by useChat + streamText + Prisma tool-calling pattern |
| CHAT-02 | Chat supports both quick lookups and deeper analysis | Covered by tool-calling with multi-tool support; LLM selects appropriate query depth |
| CHAT-03 | Chat uses tool-calling pattern to query database (not raw article context) | Covered by `tool()` helper in streamText; Prisma query tools execute server-side |
| CHAT-04 | Chat endpoint has rate limiting from day one | Covered by Postgres RateLimit model + Prisma check in route handler before calling streamText |
</phase_requirements>

---

## Summary

Phase 4 builds a dockable chat panel that lets users ask natural language questions about their collected news articles. The AI model uses tool-calling to run Prisma queries against the existing Neon Postgres database, returning grounded answers with source citations.

The core technical stack is already fully installed: Vercel AI SDK v6 (`ai@6.0.134`) provides `streamText` + `tool()` for the server route and `@ai-sdk/react@3.0.136` provides `useChat` for the client. Rate limiting uses a new Prisma model in the existing Neon DB, requiring only a migration — no new dependencies. The panel is a client component tree rendered in `layout.tsx` as an overlay sibling to `<main>`.

The AI SDK v6 streaming pattern has changed significantly from v4/v5. The canonical approach is `streamText` on the server returning `result.toUIMessageStreamResponse()`, and `useChat` from `@ai-sdk/react` consuming it with `sendMessage({ text })`. The old `append` / `handleSubmit` API is gone. `messages` is now an array of `UIMessage` with a `parts` array, not a flat `content` string. `maxSteps` is also removed: use `stopWhen: stepCountIs(N)` (import `stepCountIs` from `ai`).

**Primary recommendation:** Follow the `streamText` + `tool()` + `toUIMessageStreamResponse()` + `useChat` chain exactly. Do not use `generateText` for the chat route (it does not stream). Do not use `toTextStreamResponse()` (loses tool call metadata). Install `@ai-sdk/react` as it is a separate package not included in the main `ai` package.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | 6.0.134 (installed) | `streamText`, `tool()`, `convertToModelMessages`, `stepCountIs` | Already installed; AI SDK v6 is the project standard |
| `@ai-sdk/react` | 3.0.136 (npm latest) | `useChat` hook for client-side chat state + streaming | Separate package; `useChat` is NOT in the main `ai` package in v6 |
| `@prisma/client` | 5.22.0 (installed) | Prisma query tools + RateLimit model | Already installed |
| `zod` | 4.3.6 (installed) | Tool input schemas | Already installed; `tool()` uses `inputSchema` (Zod) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `date-fns` | 4.1.0 (installed) | `formatDistanceToNow` for relative dates in source cards | Already installed |
| `lucide-react` | 0.577.0 (installed) | `Sparkles`, `Plus`, `X`, `ArrowUp` icons per UI-SPEC | Already installed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Postgres rate limiting (D-04) | Upstash Ratelimit | Upstash requires additional service + potential Pro tier cost; Postgres is already live with no extra deps |
| `useChat` from `@ai-sdk/react` | Manual `fetch` + `ReadableStream` parsing | useChat handles reconnect, status, error, tool results automatically; manual approach is 200+ lines of infrastructure |
| Tool-calling (D-01) | Vector embeddings + RAG | Embeddings require new infra (pgvector or Pinecone); tool-calling uses zero extra cost with existing Prisma schema |

**Installation required:**
```bash
npm install @ai-sdk/react
```

**Version verification:**
```bash
npm view @ai-sdk/react version   # 3.0.136 verified 2026-03-21
npm view ai version              # 6.0.134 verified 2026-03-21
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/api/chat/
│   └── route.ts              # POST: streamText with tools, rate limit check
├── lib/
│   ├── chat-tools.ts         # tool() definitions calling Prisma
│   ├── rate-limit.ts         # checkRateLimit(), incrementRateLimit()
│   └── ai.ts                 # Add CHAT_MODEL constant alongside AI_MODEL
├── components/features/chat/
│   ├── ChatPanel.tsx          # 'use client' — panel shell, dock/resize logic
│   ├── ChatMessage.tsx        # 'use client' — user + assistant bubbles
│   ├── ChatInput.tsx          # 'use client' — input + send button
│   ├── PromptChips.tsx        # 'use client' — chip set, fades on typing
│   ├── SourceCard.tsx         # Server-compatible — citation card
│   ├── ChatFAB.tsx            # 'use client' — floating action button
│   └── index.ts              # barrel export
└── components/features/briefing/
    └── BriefingCard.tsx       # Add "Chat about this" ghost Button
```

### Pattern 1: Server Route with Tool-Calling

```typescript
// src/app/api/chat/route.ts
import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, incrementRateLimit } from '@/lib/rate-limit';
import { articleSearchTool, articleByTopicTool, recentArticlesTool } from '@/lib/chat-tools';

export const maxDuration = 60;

export async function POST(request: Request) {
  const { messages, articleContext } = await request.json();

  // Rate limiting check (D-04, D-05)
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const limited = await checkRateLimit(ip);
  if (limited) {
    return Response.json({ error: 'rate_limited', retryAfterMinutes: limited }, { status: 429 });
  }

  await incrementRateLimit(ip);

  const result = streamText({
    model: CHAT_MODEL,  // 'openai/gpt-5-mini'
    system: SYSTEM_PROMPT,
    messages: convertToModelMessages(messages.slice(-10)), // D-05: 10-turn history
    tools: {
      searchArticles: articleSearchTool,
      articlesByTopic: articleByTopicTool,
      recentArticles: recentArticlesTool,
    },
    stopWhen: stepCountIs(3), // allow tool-call → result → answer cycles
  });

  return result.toUIMessageStreamResponse();
}
```

**Source:** Vercel Academy AI SDK Tool Use + ai-sdk.dev/docs/reference/ai-sdk-core/stream-text

### Pattern 2: Tool Definitions

```typescript
// src/lib/chat-tools.ts
import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from './prisma';

export const articleSearchTool = tool({
  description: 'Search articles by keyword in title or description',
  inputSchema: z.object({
    query: z.string().describe('Search keyword or phrase'),
    limit: z.number().optional().default(5),
  }),
  execute: async ({ query, limit }) => {
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        enrichedAt: { not: null },
      },
      orderBy: [{ importanceScore: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
      include: { source: { select: { name: true, category: true } } },
    });
    return articles.map(a => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      source: a.source.name,
      publishedAt: a.publishedAt,
      link: a.link,
      importanceScore: a.importanceScore,
      topics: a.topics,
    }));
  },
});
```

**Source:** ai-sdk.dev/docs/reference/ai-sdk-core/stream-text (tools parameter)

### Pattern 3: Client Hook

```typescript
// src/components/features/chat/ChatPanel.tsx
'use client';
import { useChat } from '@ai-sdk/react';

const { messages, sendMessage, status, error } = useChat({
  api: '/api/chat',
  body: articleContext ? { articleContext } : undefined,
});

// Send a message
sendMessage({ text: inputValue });

// Check streaming state
const isStreaming = status === 'streaming' || status === 'submitted';

// Messages have parts array, not content string
messages.map(msg => msg.parts.filter(p => p.type === 'text').map(p => p.text).join(''))
```

**Source:** ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat

### Pattern 4: Rate Limit via Prisma

```typescript
// prisma/schema.prisma (new model)
model RateLimit {
  id          Int      @id @default(autoincrement())
  key         String   // IP address or session identifier
  count       Int      @default(0)
  windowStart DateTime @default(now())
  @@index([key])
}
```

```typescript
// src/lib/rate-limit.ts
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_MESSAGES = 20;           // D-05

export async function checkRateLimit(key: string): Promise<number | null> {
  const windowStart = new Date(Date.now() - WINDOW_MS);
  const record = await prisma.rateLimit.findFirst({
    where: { key, windowStart: { gte: windowStart } },
  });
  if (!record || record.count < MAX_MESSAGES) return null;
  // Return minutes until reset
  const resetAt = new Date(record.windowStart.getTime() + WINDOW_MS);
  return Math.ceil((resetAt.getTime() - Date.now()) / 60000);
}
```

### Pattern 5: Keyboard Shortcut (Cmd+K / Ctrl+K)

```typescript
// In ChatPanel.tsx or layout-level effect
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(prev => !prev);
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, []);
```

**Source:** UI-SPEC confirmed Cmd+K/Ctrl+K convention (matches Linear, Vercel, Raycast)

### Anti-Patterns to Avoid

- **Using `generateText` in chat route:** Does not stream. Always use `streamText` for the chat endpoint.
- **Using `toTextStreamResponse()`:** Loses tool call data. Use `toUIMessageStreamResponse()` to preserve tool results for citation cards.
- **Accessing `message.content` (string):** AI SDK v6 messages use `message.parts` (array). `content` no longer exists on UIMessage.
- **Using `append()` or `handleSubmit()`:** These are AI SDK v4 APIs. v6 uses `sendMessage({ text })`.
- **Importing `useChat` from `ai`:** It lives in `@ai-sdk/react`. `import { useChat } from 'ai'` will fail.
- **Using `maxSteps`:** Removed in AI SDK v6. Use `stopWhen: stepCountIs(N)` with `stepCountIs` imported from `ai`.
- **Using `mode: 'insensitive'` without confirming Postgres:** Postgres supports it (project migrated from SQLite in Phase 3.2); safe to use.
- **Fetching all articles into context:** Never dump articles into the prompt. Tool-calling retrieves only what is needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Client chat state + streaming | Manual fetch + ReadableStream parser | `useChat` from `@ai-sdk/react` | Status machine, reconnect, tool invocation handling, error state, abort signal — all built in |
| Tool schema validation | Manual JSON validation | `tool()` with Zod `inputSchema` | AI SDK validates tool inputs before `execute` runs |
| SSE stream parsing | Manual EventSource or fetch body reader | `toUIMessageStreamResponse()` + `useChat` | Protocol handles text deltas, tool calls, tool results, finish events, errors |
| Streaming response headers | Manual Content-Type setup | `toUIMessageStreamResponse()` | Sets correct headers automatically |
| Message history trimming | Custom slice logic | `messages.slice(-N)` passed to `convertToModelMessages()` | `convertToModelMessages` handles UIMessage to ModelMessage conversion |

**Key insight:** AI SDK v6 is opinionated about the protocol between server and client. Once you use `toUIMessageStreamResponse()` on the server and `useChat` on the client, the streaming, tool-calling, and message state work automatically. Deviating from this pair breaks the protocol.

---

## Common Pitfalls

### Pitfall 1: `useChat` Not in `ai` Package

**What goes wrong:** `import { useChat } from 'ai'` compiles but fails at runtime — `useChat` does not exist in `ai@6`.
**Why it happens:** AI SDK v6 split React hooks into `@ai-sdk/react` (separate package, not installed by default).
**How to avoid:** Always import from `@ai-sdk/react`. Run `npm install @ai-sdk/react` before implementation.
**Warning signs:** TypeScript error "Module has no exported member 'useChat'" or runtime undefined.

### Pitfall 2: `message.content` Is Undefined

**What goes wrong:** Rendering `{message.content}` shows nothing. Messages appear empty.
**Why it happens:** AI SDK v6 `UIMessage` uses `parts: UIMessagePart[]` not a flat `content` string.
**How to avoid:** Render `{msg.parts.filter(p => p.type === 'text').map(p => p.text).join('')}`.
**Warning signs:** Silent empty message bubbles in the UI.

### Pitfall 3: Tool Execution Stops After First Tool Call

**What goes wrong:** Response hangs or ends with no text after the model calls a tool.
**Why it happens:** `stopWhen` defaults to `stepCountIs(1)`, so execution stops after one step (the tool call) without completing the final reply.
**How to avoid:** Set `stopWhen: stepCountIs(3)` in `streamText` (import `stepCountIs` from `ai`). This allows tool-call, tool-result, final-answer cycles up to 3 steps.
**Warning signs:** Status gets stuck at `streaming`, then finishes with no text content in the assistant message.

### Pitfall 4: Rate Limit Window Slide Bug

**What goes wrong:** A user can send 20 messages, wait 1 second, and send 20 more — the window is not truly enforced.
**Why it happens:** Creating a new RateLimit row per request rather than checking the existing window.
**How to avoid:** Use a single row per key with `windowStart`; reset when `windowStart + 1 hour < now`. See Pattern 4.
**Warning signs:** Users exceed 20 messages/hour in testing.

### Pitfall 5: Panel Z-Index Conflicts with Sticky Header

**What goes wrong:** Chat panel appears behind the sticky header (`z-10` in layout.tsx).
**Why it happens:** Layout header has `z-index: 10`; panel needs higher z-index.
**How to avoid:** Set panel to `z-50` or higher. FAB should also be `z-50`.
**Warning signs:** Panel slides in but header overlaps it at the top.

### Pitfall 6: `convertToModelMessages` Receives UIMessage with Tool Parts

**What goes wrong:** Server errors when tool-result parts from prior turns are in the message history.
**Why it happens:** `convertToModelMessages` expects UI messages; tool invocation parts must be properly serialized.
**How to avoid:** Pass the full `messages` array from `useChat` to the POST body; AI SDK handles the conversion correctly.
**Warning signs:** 500 errors on the second message in a session that used tools.

### Pitfall 7: `topics` is `Json?` (not `string[]`) in Prisma

**What goes wrong:** `article.topics` comes back as a Prisma `JsonValue`, not `string[]`.
**Why it happens:** Phase 3.2 migrated topics from `String?` to `Json?` for Postgres JSONB.
**How to avoid:** Cast with `(article.topics as string[] | null)` when passing to tool responses.
**Warning signs:** TypeScript errors on `article.topics.join()` or runtime crash when topics is not null.

---

## Code Examples

Verified patterns from official sources:

### Route Handler (complete pattern)

```typescript
// src/app/api/chat/route.ts
import { streamText, convertToModelMessages, stepCountIs } from 'ai';
import { CHAT_MODEL } from '@/lib/ai';
import { articleSearchTool, articlesByTopicTool, recentArticlesTool } from '@/lib/chat-tools';
import { checkRateLimit, incrementRateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const { messages } = await request.json();

  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const retryAfter = await checkRateLimit(ip);
  if (retryAfter !== null) {
    return Response.json({ error: 'rate_limited', retryAfterMinutes: retryAfter }, { status: 429 });
  }
  await incrementRateLimit(ip);

  const result = streamText({
    model: CHAT_MODEL,
    system: `You are a news assistant that answers questions about AI industry news.
You MUST only use information returned by your tools. Do NOT fabricate news events,
quotes, or details not present in the tool results. If no articles match, say so clearly.`,
    messages: convertToModelMessages(messages.slice(-10)),
    tools: { articleSearchTool, articlesByTopicTool, recentArticlesTool },
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
```

**Source:** Vercel Academy AI SDK Tool Use, ai-sdk.dev/docs/reference/ai-sdk-core/stream-text

### Client Chat Hook Usage

```typescript
'use client';
import { useChat } from '@ai-sdk/react';

const { messages, sendMessage, status, error } = useChat({
  api: '/api/chat',
});

// Send user message
sendMessage({ text: "What's new with Claude?" });

// Status values: 'ready' | 'submitted' | 'streaming' | 'error'
const isLoading = status === 'submitted' || status === 'streaming';

// Render message parts
messages.map(msg =>
  msg.parts
    .filter(p => p.type === 'text')
    .map(p => p.text)
    .join('')
)
```

**Source:** ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat

### Contextual Chat (Chat about this)

```typescript
// ChatPanel receives optional articleContext prop
const { messages, sendMessage } = useChat({
  api: '/api/chat',
  // Pass article context in request body each time
  onFinish: undefined,
});

// On send, include context in body:
// useChat does not have a built-in body-per-message option
// Use fetch directly for contextual sends, OR pass context via initial system tool
```

**Note:** For article context (D-18, D-19), the pinned context card is purely UI state — it shows what article the user is chatting about. The article context gets injected into the first user message text or as an additional tool call providing the specific article data. Simpler: include context as a prefixed instruction in the first message text: `"[Context: Article ID ${article.id}] ${userMessage}"`.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useChat` from `ai` | `useChat` from `@ai-sdk/react` | AI SDK v6 | Must install separate package |
| `message.content: string` | `message.parts: UIMessagePart[]` | AI SDK v5/v6 | Rendering code must iterate parts |
| `append()` / `handleSubmit()` | `sendMessage({ text })` | AI SDK v6 | All form submission code changes |
| `toDataStreamResponse()` | `toUIMessageStreamResponse()` | AI SDK v6 | New method name on StreamTextResult |
| `tool.parameters` (Zod) | `tool.inputSchema` (Zod) | AI SDK v6 | Field rename; same Zod schema syntax |
| `maxSteps: N` | `stopWhen: stepCountIs(N)` | AI SDK v6 | `maxSteps` removed; import `stepCountIs` from `ai` |

**Deprecated/outdated:**
- `useChat` from `ai` (main package): Removed in v6 — now in `@ai-sdk/react`
- `append()`: Replaced by `sendMessage()`
- `message.content`: Replaced by `message.parts`
- `toDataStreamResponse()`: Renamed to `toUIMessageStreamResponse()`
- `maxSteps`: Removed — replaced by `stopWhen: stepCountIs(N)` (verified in `ai@6.0.134` type definitions)

---

## Open Questions

1. **Article context injection for "Chat about this" (D-18)**
   - What we know: Chat panel shows a pinned context card with article metadata. No auto-send (D-19).
   - What's unclear: How to pass article context to the API route without corrupting subsequent messages.
   - Recommendation: Inject article ID into first user message as a prefix ("Regarding article #123: ...") OR add a `searchArticleById` tool and inject the article ID in a hidden initial tool call. The simpler prefix approach avoids protocol complexity.

2. **Panel drag/resize implementation**
   - What we know: Side panel 350px wide, draggable; bottom panel 25dvh, draggable.
   - What's unclear: Pure CSS vs. JavaScript drag. No drag library is installed.
   - Recommendation: Use `mousedown`/`mousemove`/`mouseup` (+ touch events for mobile) directly on the resize handle div. No library needed for a single-axis drag. Store width/height in `useState`.

3. **Rate limit key: IP vs. session**
   - What we know: No auth in v1. D-04 specifies Postgres-based rate limiting.
   - What's unclear: `x-forwarded-for` may be spoofable; shared IP (corporate) could block multiple users.
   - Recommendation: Use `x-forwarded-for` for v1. Add a note for v2 (user accounts) to migrate to userId-based limits.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npm test -- --reporter=verbose src/lib/rate-limit.test.ts` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHAT-01 | Natural language question returns grounded article response | integration (manual) | Manual browser test | N/A |
| CHAT-02 | Tool-calling retrieves articles by keyword / topic | unit | `npm test -- src/lib/chat-tools.test.ts` | Wave 0 |
| CHAT-03 | Tool-calling queries DB, not raw context injection | unit | `npm test -- src/lib/chat-tools.test.ts` | Wave 0 |
| CHAT-04 | Rate limit rejects at 21st message in same window | unit | `npm test -- src/lib/rate-limit.test.ts` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- src/lib/rate-limit.test.ts src/lib/chat-tools.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/lib/rate-limit.test.ts` — covers CHAT-04: window enforcement, count increment, reset after 1 hour
- [ ] `src/lib/chat-tools.test.ts` — covers CHAT-02, CHAT-03: tool execute() calls Prisma with correct query shape

*(Existing pattern: mock Prisma + mock `ai` module using `vi.mock()`. See `src/lib/enrich.test.ts` for reference.)*

---

## Sources

### Primary (HIGH confidence)
- `node_modules/ai/dist/index.d.ts` — StreamTextResult methods (`toUIMessageStreamResponse`, `toTextStreamResponse`), `tool()` function signature, `AbstractChat`, `UIMessage` type structure, `stepCountIs` and `stopWhen` parameter — verified directly in installed package
- Vercel Academy AI SDK Tool Use (https://vercel.com/academy/ai-sdk/tool-use) — complete route handler example with `streamText` + `convertToModelMessages` + tools + `toUIMessageStreamResponse()`
- ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat — `useChat` params and return values (`messages`, `sendMessage`, `status`, `error`)
- ai-sdk.dev/docs/reference/ai-sdk-core/stream-text — `streamText` parameters including `tools`, `stopWhen: stepCountIs(N)`
- https://vercel.com/ai-gateway/models/gpt-5-mini — confirmed model string `openai/gpt-5-mini` is live on AI Gateway

### Secondary (MEDIUM confidence)
- `npm view @ai-sdk/react version` output: 3.0.136 (verified 2026-03-21)
- `npm view ai version` output: 6.0.134 (verified 2026-03-21)
- WebSearch for gpt-5-mini on Vercel AI Gateway: multiple results confirming availability

### Tertiary (LOW confidence)
- None — all critical claims are verified from installed package or official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from installed packages + npm registry
- Architecture: HIGH — verified from official AI SDK docs + Vercel Academy examples
- Pitfalls: HIGH — derived from type inspection of installed `ai@6.0.134` (breaking changes confirmed)
- Validation: HIGH — follows established Vitest + vi.mock pattern from existing tests

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (AI SDK moves fast; re-verify if more than 30 days pass)
