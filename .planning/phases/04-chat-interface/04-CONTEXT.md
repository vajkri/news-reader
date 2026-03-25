# Phase 4: Chat Interface - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Let users query the enriched article corpus in natural language via a dockable chat panel. Users can ask questions, get grounded answers citing specific articles, and follow up conversationally. A "Chat about this" button on BriefingCards opens the panel with article context. This phase builds the chat API route, tool-calling infrastructure, rate limiting, streaming UI, and panel component. The enrichment pipeline is Phase 2 (complete). UX polish across all views is Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Retrieval strategy
- **D-01:** Tool-calling over vector embeddings. The LLM calls Prisma queries as tools to search articles by keyword, date, topic, source. Zero extra cost, uses existing schema, precise results.
- **D-02:** Responses grounded only in collected articles. System prompt + tool design must prevent hallucination. The model does not fabricate news events not present in the corpus.

### Chat model
- **D-03:** `openai/gpt-5-mini` via AI Gateway ($0.25/$2.00 per M tokens). GPT-5 series quality, best-in-class tool-calling, 400K context window.

### Rate limiting
- **D-04:** Rate limiting via Postgres table using Prisma model in existing Neon DB. No new dependencies. Survives restarts. Migrates cleanly with Prisma.
- **D-05:** 20 messages/hour limit. 10-turn conversation history kept per session. No output token cap; cost controlled via message limit.

### Citation format
- **D-06:** Source cards below response. Answer text first, then clickable article cards (title, source, date) underneath. Matches existing card-based design language. ADHD-friendly.

### Panel layout and behavior
- **D-07:** Dockable, resizable chat panel. Side panel on desktop (default), bottom panel on mobile. User can reposition and resize (width when side, height when bottom).
- **D-08:** Default side panel width: 350px. Default bottom panel height: 25dvh with px min/max guards.
- **D-09:** Trigger: floating action button (bottom-right corner, always visible) + keyboard shortcut (research most common convention for chat shortcuts).
- **D-10:** No dedicated `/chat` page. Chat is an overlay panel accessible from any page.

### Conversation lifecycle
- **D-11:** Single conversation at a time. In-memory state (React). Closing the panel hides it; re-opening restores the conversation. Clears on page refresh (natural expectation).
- **D-12:** "New conversation" button inside the panel header to clear history and start fresh.
- **D-13:** No conversation persistence to database in v1. Recent questions memory deferred (SEED-002).

### First-run experience (generic open)
- **D-14:** Option B style: icon + heading ("Ask about your news") + subtitle + clickable prompt chips. Chips fade when user starts typing.
- **D-15:** Hardcoded prompt chips: "What's new with Claude?", "Top stories today", "Developer tools this week", "Summarize model releases".
- **D-16:** Input placeholder: "Ask about any topic, source, or time period..."
- **D-17:** No welcome message bubble. The icon + heading + chips are sufficient onboarding.

### "Chat about this" (contextual open from BriefingCard)
- **D-18:** "Chat about this" button on each BriefingCard. Opens the chat panel with article context pre-loaded.
- **D-19:** Wait for user to type (no auto-send). Panel shows a pinned context card at top (article title, source, date) with contextual chips below: "Summarize this article", "Why does this matter?", "Related articles", "Compare to competitors".
- **D-20:** Input placeholder changes to: "Ask anything about this article..."
- **D-21:** Consistent visual language with generic empty state (Option A style: centered chips, pinned card is the only addition).

### Context carry-over
- **D-22:** No automatic context seeding from the current page. Chat always starts blank unless explicitly triggered via "Chat about this".

### Claude's Discretion
- Tool definitions (exact Prisma query tools the LLM receives)
- System prompt wording for grounding constraint
- Streaming implementation details
- Rate limit table schema
- Panel resize handle design and drag behavior
- Keyboard shortcut choice (after researching conventions)
- Exact panel animation (slide-in transition)
- Error states (rate limit exceeded, API failure, no results found)
- "Chat about this" context card exact styling

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` -- Project vision, constraints (ADHD-friendly design, open-source, AI SDK + AI Gateway)
- `.planning/REQUIREMENTS.md` -- CHAT-01 through CHAT-04 acceptance criteria
- `.planning/ROADMAP.md` -- Phase 4 success criteria (4 items)

### Prior phase decisions (enrichment data this phase queries)
- `.planning/phases/02-ai-enrichment/02-CONTEXT.md` -- Topic taxonomy (7 seed categories, multi-tag), importance scoring (4 tiers), summary style
- `.planning/phases/03-daily-briefing/03-CONTEXT.md` -- BriefingCard design, topic grouping, importance visualization

### Pre-planning decisions
- `.planning/phases/04-chat-interface/.continue-here.md` -- All 8 architectural decisions from prior session (tool-calling, rate limiting, model, citations, etc.)

### Existing codebase
- `prisma/schema.prisma` -- Article model with enrichment fields (summary, topics Json?, importanceScore, enrichedAt)
- `src/lib/ai.ts` -- AI_MODEL constant (currently google/gemini-2.5-flash-lite for enrichment; chat uses different model)
- `src/lib/enrich.ts` -- Enrichment batch pipeline pattern (tool-calling will follow similar Prisma query patterns)
- `src/app/api/articles/route.ts` -- Existing articles API with search, filtering, pagination (reference for tool query patterns)
- `src/app/layout.tsx` -- Root layout with header nav (chat panel renders here as overlay)
- `src/components/features/briefing/BriefingCard.tsx` -- Needs "Chat about this" button
- `src/components/ui/button.tsx` -- Button component (4 variants, 4 sizes)

### Design system
- `CLAUDE.md` -- Design tokens, typography scale, 60/30/10 color rule, focus styles, container utility pattern
- `src/app/globals.css` -- CSS custom properties, dark/light mode tokens

### Design mockups
- `.planning/assets/chat-empty-state-mockup.html` -- Generic empty state options (Option B chosen)
- `.planning/assets/chat-about-this-mockup.html` -- "Chat about this" contextual state options (Option A chosen)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/ai.ts`: AI_MODEL constant pattern; chat will add a separate CHAT_MODEL constant
- `src/lib/prisma.ts`: Prisma client singleton, used by tool-calling queries
- `src/app/api/articles/route.ts`: Prisma query patterns for search, filtering, pagination (reference for building LLM tools)
- `src/lib/enrich.ts`: generateText + Output pattern, Zod schemas for structured output
- `src/components/ui/button.tsx`: Button component for "Chat about this" and panel controls
- `src/components/ui/badge.tsx`: Badge component for citation cards (source badges)

### Established Patterns
- Server Components by default; `'use client'` only for interactivity (chat panel and input need client state)
- Prisma queries with `include: { source: { select: { name: true, category: true } } }` for article + source data
- AI Gateway model strings: `'provider/model-name'` format
- Cron auth pattern: Bearer token check (similar pattern for rate limit enforcement)

### Integration Points
- `src/app/layout.tsx`: Chat panel component renders as overlay sibling to `<main>`, plus floating action button
- `src/app/api/chat/route.ts`: New API route for chat streaming endpoint
- `src/lib/chat-tools.ts`: New file defining Prisma query tools for the LLM
- `src/lib/rate-limit.ts`: New file for rate limiting logic
- `prisma/schema.prisma`: New RateLimit model for Postgres-based rate limiting
- `src/components/features/chat/`: New feature directory (ChatPanel, ChatMessage, ChatInput, SourceCard, PromptChips)
- `src/components/features/briefing/BriefingCard.tsx`: Add "Chat about this" button

</code_context>

<specifics>
## Specific Ideas

- Panel should feel like a tool drawer, not a page takeover. The user's current view stays visible behind/beside it.
- "Chat about this" pinned context card uses the same left-border accent pattern from BriefingCard redesign (importance indicator).
- Prompt chips are article-contextual when triggered from BriefingCard ("Summarize this article", "Why does this matter?") vs generic when opened standalone ("What's new with Claude?").
- Mockup reference: Option B (generic empty state) and Option A (contextual state) from `.planning/assets/`.

</specifics>

<deferred>
## Deferred Ideas

- Recent questions memory: remembering past chat queries for quick re-ask. Planted as SEED-002, triggers when adding conversation persistence or user accounts in v2.
- Context carry-over from current page (auto-seeding chat based on which page the user is on). Rejected for v1 to avoid confusing edge cases.
- Multiple saved conversation threads (ChatGPT-style sidebar). Single conversation is sufficient for v1 quick-lookup use case.
- Dynamic prompt chips generated from today's actual topics (vs hardcoded). Nice-to-have but adds complexity.
- Topic group and page-level summarize buttons (summarize all articles in a topic, summarize the whole day). Could be added later; v1 focuses on per-article "Chat about this".

</deferred>

---

*Phase: 04-chat-interface*
*Context gathered: 2026-03-21*
