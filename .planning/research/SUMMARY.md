# Project Research Summary

**Project:** AI-powered news reader (news-tracker companion)
**Domain:** Personal AI RSS aggregator with LLM enrichment, chat, auth, and push notifications
**Researched:** 2026-03-19
**Confidence:** HIGH

## Executive Summary

This project adds three new capability layers — AI enrichment, user authentication, and push notifications — to an existing Next.js 16 / Prisma / SQLite RSS reader. The codebase already handles feed ingestion, article storage, and a feed UI; the milestone is transforming that raw aggregator into a personalized AI reading companion. Experts build this class of product by strictly separating the batch enrichment pipeline from the interactive chat interface, and by treating auth as a schema-level concern that must be designed before any user-specific feature is built. The recommended stack is purpose-built for this: Vercel AI SDK v6 for all LLM calls (provider-agnostic, streams natively with App Router), Better Auth for self-hosted authentication (Auth.js has entered maintenance mode), and the native Web Push API via `web-push` for notifications without third-party dependencies.

The central product bet is a daily AI briefing page that replaces manual feed scanning for ADHD-friendly consumption. This requires a two-phase article processing pattern: RSS fetch writes raw articles immediately, a separate cron-triggered enrichment job classifies and summarizes them as a second pass. The chat interface ("what happened with OpenAI this week?") builds on top of the enriched corpus using tool-calling with SQL-based retrieval — no vector database is needed until semantic recall demonstrably fails, which for a curated AI news domain with good topic tags is unlikely at initial scale.

The top risks are financial (an unprotected `/api/chat` endpoint can exhaust an API budget in minutes), architectural (coupling AI enrichment to the fetch cron creates fragile, hard-to-debug pipelines), and data-integrity related (retrofitting auth without a migration plan for existing article/source rows breaks the schema). All three are preventable with upfront design decisions: rate limiting ships with the first AI endpoint, enrichment is always a separate cron job, and auth migration is planned before writing a single auth file.

## Key Findings

### Recommended Stack

The additive stack builds on what already exists. The AI layer is Vercel AI SDK v6 (`ai@^6.0.130`) with `@ai-sdk/anthropic` as the default provider and `@ai-sdk/react` for the `useChat` chat hook — v6 is the current stable release (Dec 2025) and is the only version where `generateObject`/`streamObject` are cleanly replaced with the new `output` setting on `generateText`/`streamText`. For auth, Better Auth (`better-auth@^1.5.5`) is the clear choice: Auth.js transferred maintenance to the Better Auth team in early 2026, and Clerk is incompatible with the self-hostable requirement. Push notifications use `web-push@^3.x` directly per the official Next.js PWA guide — no Firebase dependency, no third-party service. Note that the ARCHITECTURE.md draft references "NextAuth.js v5" in some component tables; this is superseded by the STACK.md recommendation for Better Auth and should be treated as an error in that document.

**Core technologies:**
- `ai@^6.0.130` (Vercel AI SDK): LLM primitives — `generateText`, `streamText`, structured output via Zod schemas; native App Router integration
- `@ai-sdk/react@^3.0.132`: `useChat` hook for streaming chat UI without manual WebSocket management
- `@ai-sdk/anthropic@^3.0.58`: Claude provider; swap to other providers by changing one import
- `better-auth@^1.5.5`: Self-hosted auth with native Prisma adapter; auto-generates schema additions via CLI
- `web-push@^3.x`: VAPID-based push notifications; server-side only; no third-party service required
- `zod@^3.23`: Runtime schema validation for AI structured outputs; must stay on v3 (not v4 alpha)

### Expected Features

The product already has most table-stakes feed reader functionality (article list, mark read, source management, filters, read time). The gaps that block the core value proposition are: article pagination beyond 100 items, article search, cron authorization security hardening, and all personalization features (which require auth first).

**Must have (table stakes for this milestone):**
- User account / authentication — unlocks all personalization; without it the product is a generic RSS reader
- AI daily briefing page — the core value proposition; replaces manual feed scanning with ADHD-friendly digest
- AI importance scoring and classification — feeds the briefing; without it the briefing is random selection
- Configurable user interest topics — personalizes AI ranking and briefing content
- Article pagination fix — prerequisite for chat and briefing to have meaningful data coverage
- Cron authorization security fix — security baseline before exposing to additional users

**Should have (competitive differentiators):**
- Chat interface over collected articles (RAG with SQL-based retrieval) — qualitatively different from browsing feeds
- Push notifications for critical-only events — solves notification fatigue; requires stable importance scoring first
- Article search — natural complement to chat; add when corpus is large enough to benefit
- Saved / bookmarked articles — Pocket shut down in 2025, creating user need
- Focus mode — established ADHD UX pattern; low complexity once design system is in place

**Defer (v2+):**
- Topic cluster summaries — multi-article synthesis is technically complex; validate single-article summarization first
- AI provider switching UI — architecture already supports it; expose UI only when users request it
- Feed URL validation on add — useful quality-of-life but not blocking for a technical audience

**Anti-features to avoid:** Engagement/recommendation algorithms (optimize for addiction, not information), email digests (adds infrastructure complexity to an anti-newsletter product), comments/social reactions (moderation scope explosion), real-time WebSocket feeds (architecture complexity without proportional user value for AI news).

### Architecture Approach

The architecture adds three new layers at well-defined boundaries without requiring a rewrite of the existing feed reader. The presentation layer gains briefing, chat, settings, and auth UI pages. The API layer gains `/api/enrich`, `/api/chat`, `/api/briefing`, and `/api/auth` routes. A new AI service layer (`lib/ai/`) isolates all LLM logic — gateway singleton, enrichment functions, briefing generation, Zod schemas — from the route handlers. The data layer gains AI enrichment columns on the Article model plus User, UserPreferences, ChatSession, and ChatMessage models.

The two critical patterns are: (1) two-phase article processing where fetch and enrichment are separate cron jobs, never coupled; and (2) streaming chat with tool-calling where the model requests articles via a `getArticles` Prisma tool rather than receiving all articles in context upfront. SQL-based article retrieval (filtering by topics, date, importance score) is sufficient for the initial chat implementation — vector embeddings are an optional future upgrade, not a day-one requirement.

**Major components:**
1. AI Enrichment Pipeline (`lib/ai/enrichment.ts` + `/api/enrich`) — batch-processes raw articles via cron; writes summary, topics, priority, importance score back to Article rows; uses Claude Haiku for cost efficiency
2. Chat Interface (`/api/chat` + `app/chat/page.tsx`) — `streamText` with `getArticles` tool-calling; `useChat` hook client-side; SQL retrieval over enriched article corpus
3. Daily Briefing Generator (`lib/ai/briefing.ts` + `/api/briefing`) — daily cron or on-demand generation; aggregates high-priority articles into ADHD-friendly digest
4. Auth Layer (`lib/auth.ts` + Better Auth routes) — Better Auth with Prisma adapter; JWT sessions for self-hosting simplicity
5. User Preferences (`UserPreferences` model + settings UI) — stores topic interests, notification thresholds; injected into article queries and chat system prompt
6. Notification Trigger (`/api/notifications`) — checks articles above priority threshold; calls `web-push`; handles 410 Gone subscription cleanup

### Critical Pitfalls

1. **Unprotected AI chat endpoint burns API budget** — rate limiting with Upstash Ratelimit per authenticated user ID and `maxTokens` on every LLM call must ship with the first AI endpoint; retrofitting is not acceptable
2. **Re-summarizing the same articles on every cron run** — add `summaryGeneratedAt` (renamed `enrichedAt` in architecture) nullable timestamp to Article schema from day one; filter `WHERE enrichedAt IS NULL` in every enrichment job
3. **Unbounded chat context and chat history growth** — use tool-calling with targeted Prisma queries (10-15 articles max per turn) and a sliding window of 6-10 message pairs; never forward the full `messages` array to `streamText`
4. **Auth retrofit breaking existing data** — decide upfront that articles and sources are shared corpus (no userId on Article); sources can have nullable userId for future per-user feeds; plan migration before writing any auth code
5. **AI hallucination on fast-moving AI news** — ground every summarization prompt with "only use information from the provided text"; use temperature 0; keep summaries to 3 bullet points maximum; always show original source link alongside AI summary
6. **Push notification subscriptions silently failing** — check HTTP status on every push send; delete subscription from DB immediately on 410 Gone; document iOS PWA home-screen install requirement

## Implications for Roadmap

Based on research, the feature dependency graph and architecture build order point to a clear 5-phase structure. Auth is the unblocking dependency for the second half of features, so it must come early. The AI enrichment pipeline must be operational before the briefing page or chat can deliver value.

### Phase 1: Foundation and Security Hardening
**Rationale:** Two known security gaps (missing CRON_SECRET on `/api/fetch`, article pagination limitation) block safely scaling to more users. Fixing these before adding new surface area is non-negotiable. Schema migration for AI enrichment columns also belongs here because it is required by every subsequent phase.
**Delivers:** Secured cron endpoints, article corpus accessible beyond 100 items, Prisma schema extended with AI enrichment columns and initial auth tables (even if auth UI ships later), database migration completed.
**Addresses:** Cron authorization fix, article pagination fix (P1 features)
**Avoids:** Missing CRON_SECRET security pitfall; auth retrofit breaking existing data if schema is designed now

### Phase 2: AI Enrichment Pipeline
**Rationale:** Everything downstream — briefing page, chat, importance-based notifications — depends on articles having AI-generated summaries, topics, and importance scores. This phase builds and validates the enrichment pipeline in isolation before any user-facing AI features are exposed.
**Delivers:** `/api/enrich` cron route, `lib/ai/gateway.ts` singleton, `lib/ai/enrichment.ts`, `lib/ai/schemas.ts`, AI enrichment columns populated for existing articles, dashboard indicator showing enrichment status.
**Uses:** Vercel AI SDK v6, `@ai-sdk/anthropic`, Claude Haiku model for batch cost efficiency
**Implements:** AI Enrichment Pipeline component; two-phase fetch-then-enrich pattern
**Avoids:** Re-summarization loop (summaryGeneratedAt/enrichedAt filter), coupling enrichment to fetch cron, AI hallucination pitfall (prompt grounding constraints in initial implementation)

### Phase 3: Authentication and User Preferences
**Rationale:** Auth is the unblocking dependency for personalization. Without user accounts, topic interests cannot be saved, the briefing cannot be personalized, and push subscriptions cannot be tied to a user. This phase installs Better Auth, migrates existing data safely, and builds the settings UI for topic configuration.
**Delivers:** Better Auth setup with Prisma adapter, User and UserPreferences models, sign-in/sign-out UI, settings page for configurable topic interests, existing articles/sources verified accessible post-migration.
**Uses:** `better-auth@^1.5.5`, `@better-auth/prisma` (bundled), Prisma migrations on SQLite
**Implements:** Auth Layer + User Preferences components
**Avoids:** Auth retrofit breaking existing data (migration plan executed here); NextAuth/Auth.js beta pitfall (using Better Auth instead)

### Phase 4: AI Daily Briefing Page
**Rationale:** The daily briefing is the core value proposition — the reason this product exists. It can now be built because enrichment is running (Phase 2) and user topic preferences are available (Phase 3). This is the feature that validates the product concept.
**Delivers:** `/api/briefing/generate` cron route, `lib/ai/briefing.ts`, `app/briefing/page.tsx` with ADHD-friendly card layout, importance-ranked article display, daily cron at 7am UTC, on-demand generation fallback.
**Uses:** Vercel AI SDK v6 `generateText` with structured output, user topic preferences from Phase 3, enriched article corpus from Phase 2
**Implements:** Daily Briefing Generator component; Server Component rendering pattern
**Avoids:** Streaming into narrow mobile cards (use dedicated briefing panel), walls of AI summary text (3-bullet maximum per article)

### Phase 5: Chat Interface
**Rationale:** Chat builds on the enriched corpus (Phase 2) and benefits from auth for per-user history (Phase 3). It is the most technically complex feature and must not be rushed. Rate limiting and sliding window context management must be designed into the initial implementation.
**Delivers:** `/api/chat` route with `streamText` + `getArticles` tool-calling, `app/chat/page.tsx` with `useChat` hook, per-user chat history persistence, rate limiting per authenticated user, 6-10 message sliding window enforced server-side.
**Uses:** `@ai-sdk/react` `useChat`, Vercel AI SDK `streamText` + `tool`, Claude Sonnet model for chat quality
**Implements:** Chat Interface component; SQL-based article retrieval via Prisma tool
**Avoids:** Unprotected chat endpoint (rate limiting is part of initial implementation), unbounded chat context, chat history growth, full article body in context

### Phase 6: Push Notifications
**Rationale:** Push notifications depend on importance scoring (Phase 2) being stable and calibrated, and on user accounts (Phase 3) for subscription management. Building last ensures the `isBreaking` signal is reliable before alerting users.
**Delivers:** VAPID key generation, `PushSubscription` model, subscription registration UI, notification trigger cron/API route, 410 Gone subscription cleanup, iOS PWA install documentation.
**Uses:** `web-push@^3.x`, existing importance scoring from Phase 2, auth from Phase 3
**Implements:** Notification Trigger component
**Avoids:** Push subscriptions silently failing (410 handling required), permission prompt on first page load (prompt after 3+ visits or explicit opt-in), VAPID private key exposure to client

### Phase Ordering Rationale

- **Security before features:** Known vulnerabilities (missing CRON_SECRET) are fixed before new surface area is added.
- **Schema-first auth:** Better Auth schema additions are designed in Phase 1 even if auth UI ships in Phase 3 — this prevents the auth retrofit pitfall where adding foreign keys to populated SQLite tables requires a full table rebuild.
- **Enrichment before briefing/chat:** Both Phase 4 and Phase 5 depend on articles having AI-enriched fields. A briefing from un-enriched articles is just a random article dump. Chat topic filtering requires enriched topic tags.
- **Briefing before chat:** Briefing validates that the enrichment pipeline produces useful signal. If importance scoring is miscalibrated, you discover it on the briefing page (low stakes) rather than in the chat interface (high stakes, harder to debug).
- **Notifications last:** The `isBreaking` and importance score thresholds need real-world calibration before push alerts go out. Premature notifications training users to ignore alerts defeats the product's core promise of high-signal-only notifications.

### Research Flags

Phases likely needing `/gsd:research-phase` during planning:
- **Phase 3 (Better Auth):** First implementation of Better Auth in this codebase. The CLI-generated schema and SQLite migration compatibility with Prisma 5.x should be verified against the latest `better-auth@1.5.x` changelog before writing the phase plan.
- **Phase 5 (Chat rate limiting):** Upstash Ratelimit integration with Vercel KV may require Vercel Pro tier; confirm plan requirements and alternative approaches (e.g., in-DB rate limiting for self-hosted instances) before implementation.

Phases with standard, well-documented patterns (can skip research-phase):
- **Phase 1 (Security hardening):** CRON_SECRET pattern is documented in CONCERNS.md; pagination is a known Prisma pattern.
- **Phase 2 (AI enrichment):** Vercel AI SDK v6 enrichment pattern is well-documented with official examples; two-phase cron is a standard pattern.
- **Phase 4 (Daily briefing):** Server Component + `generateText` with structured output is the canonical AI SDK Next.js pattern.
- **Phase 6 (Push notifications):** Official Next.js PWA guide covers `web-push` integration end-to-end.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All package versions confirmed against npm and official docs; Better Auth maintenance transfer sourced from GitHub discussion with 13k+ views |
| Features | MEDIUM | Core RSS reader features HIGH confidence from competitive analysis; AI briefing and chat feature patterns MEDIUM confidence from emerging product category |
| Architecture | HIGH | Vercel AI SDK integration patterns verified via official docs and Context7; Prisma integration confirmed via official Prisma docs |
| Pitfalls | HIGH | Critical pitfalls (unprotected endpoint, re-summarization loop, context explosion) verified against official Vercel security docs and BBC/EBU published study on AI news accuracy |

**Overall confidence:** HIGH

### Gaps to Address

- **Auth.js vs Better Auth in ARCHITECTURE.md:** The architecture document references "NextAuth.js v5 (Auth.js)" in component tables, inconsistent with the STACK.md recommendation for Better Auth. The roadmapper should use Better Auth everywhere and treat the NextAuth references as drafting artifacts.
- **SQLite in production on Vercel:** The pitfalls research flags a dual adapter risk (better-sqlite3 locally vs libsql/Turso on Vercel). This needs explicit clarification during Phase 1 planning: confirm whether the Vercel deployment is running better-sqlite3 (serverless SQLite file on ephemeral filesystem — not persistent) or already using Turso. If better-sqlite3, database persistence is broken in production and must be migrated to Turso before any new feature work.
- **Chat rate limiting infrastructure:** The recommended Upstash Ratelimit approach requires Vercel KV (Pro tier). For self-hosted deployments, an alternative in-database rate limiting approach needs to be designed during Phase 5 planning.
- **iOS push notification user education:** iOS 16.4+ requires the user to install the app to home screen before push can be enabled. This UX flow (detect iOS, surface install prompt, gate notification opt-in) needs explicit design before Phase 6.

## Sources

### Primary (HIGH confidence)
- https://ai-sdk.dev/docs/introduction — Vercel AI SDK v6 stable, package names and versions
- https://ai-sdk.dev/docs/migration-guides/migration-guide-6-0 — generateObject/streamObject deprecated in v6
- https://github.com/nextauthjs/next-auth/discussions/13252 — Auth.js maintenance transfer to Better Auth
- https://nextjs.org/docs/app/guides/progressive-web-apps — Official Next.js PWA/push notifications guide
- https://better-auth.com/docs/installation — better-auth v1.5.5
- https://www.prisma.io/docs/guides/betterauth-nextjs — Better Auth + Prisma + Next.js
- https://vercel.com/kb/guide/securing-ai-app-rate-limiting — Vercel AI app rate limiting
- https://ai-sdk.dev/docs/advanced/rate-limiting — AI SDK rate limiting
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Re-engageable_Notifications_Push — Web Push 410 handling
- https://www.theregister.com/2025/02/12/bbc_ai_news_accuracy/ — BBC/EBU AI news summary accuracy study (45% error rate)
- .planning/codebase/CONCERNS.md — direct codebase audit findings

### Secondary (MEDIUM confidence)
- https://betterstack.com/community/guides/scaling-nodejs/better-auth-vs-nextauth-authjs-vs-autho/ — Auth comparison
- https://community.vercel.com/t/how-to-implement-conversation-compaction-with-ai-sdk-v5/29171 — Chat conversation compaction patterns
- https://medium.com/@miteigi/the-role-of-long-context-in-llms-for-rag-a-comprehensive-review-499d73367e89 — LLM context degradation

### Tertiary (LOW confidence — needs validation during implementation)
- SQLite production persistence on Vercel — requires direct confirmation of current deployment setup
- Upstash Ratelimit plan requirements — verify Pro tier requirement before Phase 5

---
*Research completed: 2026-03-19*
*Ready for roadmap: yes*
