---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: "Phase 04.6 shipped — PR #21"
stopped_at: Completed 04.6-06-PLAN.md
last_updated: "2026-04-02T09:17:54.995Z"
progress:
  total_phases: 14
  completed_phases: 11
  total_plans: 34
  completed_plans: 34
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Surface only what matters from the AI news firehose, so users can stay informed without stress
**Current focus:** Phase 04.6 — enrichment-pipeline-reliability

## Current Position

Phase: 06
Plan: Not started

## Performance Metrics

| Phase | Plan | Duration (min) | Tasks | Files |
|-------|------|---------------|-------|-------|
| 01 Foundation | P01 | 8 | 4 | 6 |
| 01 Foundation | P02 | 5 | 2 | 11 |
| 01 Foundation | P03 | 5 | 3 | 4 |
| 02 AI Enrichment | P01 | 395 | 2 | 6 |
| 02 AI Enrichment | P02 | 3 | 2 | 6 |
| 03 Daily Briefing | P01 | 2 | 2 | 4 |
| 03 Daily Briefing | P02 | 2 | 2 | 6 |
| 03.2 Neon Migration | P01 | 72 | 3 | 8 |
| 03.2 Neon Migration | P02 | 4 | 3 | 2 |
| 03.2 Neon Migration | P03 | 5 | 3 | 2 |
| 04 Chat Interface | P01 | 6 | 2 | 7 |
| 04 Chat Interface | P02 | 7 | 2 | 10 |
| 04 Chat Interface | P04 | 9 | 2 | 5 |
| 04 Chat Interface | P05 | 8 | 3 | 4 |
| 04 Chat Interface | P06 | 4 | 2 | 5 |
| 04 Chat Interface | P07 | 8 | 2 | 5 |
| 04.1 Source Quality | P01 | 10 | 2 | 5 |
| 04.1 Source Quality | P02 | 5 | 2 | 2 |
| 04.1 Source Quality | P03 | 10 | 3 | 3 |
| 04.1 Source Quality | P04 | 1844 | 2 | 5 |
| 04.3 Sitemap Ingestion | P01 | 5 | 2 | 9 |
| 04.3 Sitemap Ingestion | P02 | 7 | 2 | 4 |
| 04.5 Debug Mode | P01 | 3 | 2 | 5 |
| 04.5 Debug Mode | P02 | 2 | 2 | 4 |

**Total plans completed:** 24
**Total phases completed:** 12 (1, 2, 3, 03.1, 03.2, 4, 04.1, 04.3, 04.4, 04.5)
| Phase 04.6 P02 | 5 | 2 tasks | 2 files |
| Phase 04.6 P01 | 10 | 2 tasks | 4 files |
| Phase 04.6 P03 | 4 | 3 tasks | 8 files |
| Phase 04.6 P06 | 15 | 2 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Build on existing codebase — RSS pipeline, database, and UI foundations already work
- [Init]: Vercel AI SDK v6 + AI Gateway for provider-agnostic LLM integration
- [Init]: Authentication deferred to v2 — articles/sources remain shared corpus with no userId
- [Init]: Better Auth chosen over NextAuth/Auth.js (maintenance transferred); relevant for v2 planning
- [Init]: SQLite replaced by Neon Postgres in Phase 03.2; no longer a concern
- [Phase 01]: CLAUDE.md rewritten for this project: zinc palette, Geist fonts, shadcn/ui Button default/outline/ghost/destructive variants, 60/30/10 color rule
- [Phase 01]: section-container uses 1800px max-width and 1.5rem padding; cron endpoint secured with CRON_SECRET Bearer auth returning 401
- [Phase 01-foundation]: Feed page is a Server Component; FeedTable remains use client; server fetches sources via Prisma, serializes dates via JSON round-trip
- [Phase 01-foundation]: section-container replaces max-w-6xl mx-auto px-4 across all pages and layout header
- [Phase 01-foundation P03]: AND array composition for Prisma where prevents category relation + search OR conflict; no mode insensitive on SQLite (unsupported)
- [Phase 01-foundation P03]: hasMore detection by checking returned page length equals page size (50); auto-fetch on mount removed (cron is authenticated)
- [Phase 02-ai-enrichment]: maxOutputTokens (not maxTokens) is the correct AI SDK v6 param; auto-fixed during implementation
- [Phase 02-ai-enrichment]: topics stored as JSON string with no @default to avoid Prisma SQLite migration bug #26571
- [Phase 02-ai-enrichment]: enrichArticlesBatch uses generateText + Output.array(), not deprecated generateObject
- [Phase 02-ai-enrichment]: GET method on /api/enrich to match Vercel cron default invocation; maxDuration=60 for AI call headroom
- [Phase 02-ai-enrichment]: Vitest v4 installed for test infrastructure; vi.mock('server-only') pattern established for server-only module tests
- [Phase 03-daily-briefing]: briefing.ts has no server-only import: pure functions need no server-side protection, avoids vi.mock workaround
- [Phase 03-daily-briefing]: Badge tier variants use Tailwind palette (not CSS vars): functional tier indicators, not brand colors
- [Phase 03-daily-briefing]: UI-SPEC visual overrides applied: 20px topic headings, 80x80 thumbnails, gap-6 card spacing, space-y-12 topic group separation
- [Phase 03-daily-briefing]: Empty state includes View Feed CTA link per UI-SPEC copywriting contract
- [Phase 03.1]: URL-swap preamble in seed.ts uses findUnique + name guard before upsert loop so Hacker News upsert creates a new row rather than matching the old TLDR Tech record
- [Phase 03.1]: Dev DB had 4 stale sources from prior experiments; cleaned up manually; seed.ts preamble is correct for fresh databases
- [Briefing redesign]: BriefingCard restructured with vertical layout: byline, title (18px), takeaway (extracted last "This..." sentence), context (remaining summary). No thumbnails, no badges; left border = importance, group icon = category
- [Briefing redesign]: New design tokens: --foreground-secondary (zinc-700/zinc-300), --container-max-width-reading (1024px), dark --card elevated to #0f0f12. No opacity on text colors; explicit tokens only for verifiable contrast
- [Phase 03.2]: topics field changed from String? (SQLite) to Json? (Postgres JSONB); no JSON.stringify on write, no JSON.parse on read
- [Phase 03.2]: directUrl = env(DATABASE_URL_UNPOOLED) used for migrations to bypass PgBouncer
- [Phase 03.2]: postinstall: prisma generate added to package.json for Vercel build cache safety
- [Phase 03.2]: Migration script reads SQLite via better-sqlite3 direct SQL (not Prisma) to avoid dual-engine conflict after Postgres schema switch
- [Phase 03.2]: SQLite stores DateTime as Unix ms integers; cutoff comparison must use CUTOFF.getTime() not .toISOString() in raw SQL
- [Phase 03.2]: Cron schedule: fetch at 05:00 UTC, enrich at 06:00 UTC (1-hour gap for fetch to complete before enrich)
- [Phase 03.2]: mode: insensitive on Postgres contains replaces case-sensitive SQLite workaround; both title and source.name filters updated
- [Phase 04-chat-interface]: RateLimit uses upsert with id:0 sentinel for expired-window reset; chat tools cast topics as (string[] | null) ?? [] for safe Json? handling
- [Phase 04-chat-interface]: useChat() with no args uses DefaultChatTransport defaulting to /api/chat; v6 removed api option from useChat
- [Phase 04-chat-interface]: convertToModelMessages returns Promise in v6, must be awaited
- [Phase 04-chat-interface]: Tool parts in v6 use type tool-<toolName> with state output-available and output field, replacing removed tool-invocation type
- [Phase 04-chat-interface]: CSS Grid embedded layout uses data attribute on html element for decoupled coordination between ChatPanel and .app-content
- [Phase 04-chat-interface]: useMemo for rate limit derivation instead of useEffect+setState to satisfy react-hooks/set-state-in-effect rule
- [Phase 04-chat-interface]: plainto_tsquery over to_tsquery for natural language query handling; sendMessage ChatRequestOptions.body for articleContext (useChat body removed in v6)
- [Phase 04-chat-interface]: SourcesToggle uses raw button: disclosure toggle doesn't fit Button component styling
- [Phase 04-chat-interface]: Inline SourceCards via custom react-markdown a renderer matching sources by URL
- [Phase 04-chat-interface]: Storybook configured with @storybook/nextjs; stories colocated with ChatMessage component; globals.css imported in preview.ts for design tokens
- [Phase 04.1]: Migration applied via Neon HTTP API when TCP/5432 blocked; vitest.config.ts exclude added for .claude/worktrees/ to prevent test conflicts
- [Phase 04.1]: Enrichment SYSTEM_PROMPT restructured with 7 explicit sections; content type taxonomy: announcement=FROM company, news=ABOUT company by third party; thinContent threshold made explicit at 50 words
- [Phase 04.1]: Chat SYSTEM_PROMPT: answer-first rule, 4 named capabilities, fast-failure one-sentence response, removed negative-framed CAPABILITIES AND LIMITATIONS block
- [Phase 04.1]: deepseek/deepseek-v3.2 selected as enrichment model over gemini-2.5-flash-lite, gemini-3.1-flash-lite-preview, and gpt-4.1-mini based on structured evaluation (2026-03-25)
- [Phase 04.1]: deepseek/deepseek-v3.2 used for full corpus re-enrichment; Neon HTTP adapter required in all local scripts
- [Phase 04.3]: vi.clearAllMocks() required in beforeEach for module mock tests; vi.restoreAllMocks() removes vi.mock() stubs causing test failures
- [Phase 04.3]: Strategy dispatcher uses Record<sourceType, handler> map with default fallback (rss) for easily extensible source type routing
- [Phase 04.3]: Manual migration applied via Neon HTTP (TCP/5432 blocked); recorded in _prisma_migrations table
- [Phase 04.3]: Existing RSS sources need no sourceType in seed.ts: schema default 'rss' applies; upsert update:{} does not overwrite
- [Phase 04.4]: Actions column replaces standalone Status column; consolidates read toggle (Circle/CircleCheck icons) + "Chat about this" (MessageCircle icon) buttons
- [Phase 04.4]: ChipConfig type exported from PromptChips.tsx; supports label + optional icon ComponentType; used by both CONTEXTUAL_CHIPS and GENERIC_CHIPS
- [Phase 04.4]: fetchArticleContentTool uses cheerio for HTML extraction with 10s timeout and 8000-char truncation; returns { title, url, content, error }
- [Phase 04.4]: Chat route stepCountIs increased from 3 to 4 to accommodate search -> result -> fetch -> summarize flow
- [Phase 04.5]: DebugToggle uses inner component pattern for rules-of-hooks compliance; React 19 Context value prop
- [Phase 04.5]: BriefingDebugBox receives computed props from server component; per-card debug JSON uses full BriefingArticle object with no collapse/expand
- [Phase 04.6]: GitHub Actions replaces Vercel Cron Jobs: every 4h schedule vs once daily, not tied to Vercel plan limits, supports manual dispatch
- [Phase 04.6]: vars.APP_URL as GitHub repo variable + secrets.CRON_SECRET for GitHub Actions calling Vercel API routes
- [Phase 04.6]: Migration applied via prisma migrate deploy (non-interactive env); migration SQL hand-authored from schema diff
- [Phase 04.6]: createdAt used for staleness filter in fetchUnenrichedArticles, not publishedAt; createdAt = row-insert time reflecting when article was fetched
- [Phase 04.6]: Watermark stored in UserPreference DB table using existing upsert pattern (same as RateLimit)
- [Phase 04.6]: Archive detection: date param present AND not today via isToday() check
- [Phase 04.6]: First visit seeds watermark to 24h ago to prevent backlog overwhelm
- [Phase 04.6]: buildCalibrationContext queries last 30 days, SOURCE_SIGNAL_THRESHOLD=3, REASON_SIGNAL_THRESHOLD=5; empty/below-threshold returns empty string to avoid noise injection
- [Phase 04.6]: lastEnrichedAt for StatusBar sourced from DB findFirst query on most recently enriched article, not computed from newArticles subset

### Pending Todos

1. Add body validation to articles PATCH endpoint (area: api)
2. Rotate leaked CRON_SECRET and scrub from git history (area: general)
3. Update typography implementations to match design system scale (area: ui)
4. Restore briefing page caching (ISR or 'use cache') after force-dynamic removal; currently every request hits DB (area: performance, consider at end of 04.6)

### Blockers/Concerns

- Enrichment pipeline unreliable: batch limit of 15 insufficient for ~50 daily articles; cron-only approach may not be viable (Phase 04.6)

### Roadmap Evolution

- Phase 03.1 inserted after Phase 03: Adjust TL;DR source to use tldr-rss middleman (URGENT)
- Phase 03.2 inserted after Phase 03: Neon Postgres migration + Vercel deployment (URGENT)
- Phase 04.1 inserted after Phase 04: Source quality filtering: prioritize news over personal content (URGENT)
- Phase 04.2 inserted after Phase 04: Code optimization via agent-skills: clean up without changing behavior (URGENT)
- Phase 04.3 inserted after Phase 04: Non-RSS source ingestion via sitemap parsing (URGENT)
- Phase 04.4 inserted after Phase 04: Chat about this: feed item chat buttons (URGENT)
- Phase 04.5 inserted after Phase 04: Dev debug mode infrastructure (URGENT)
- Phase 04.6 inserted after Phase 04.5: Enrichment pipeline reliability (URGENT)
- Phase 6 added: AWS deployment with CDK, ECS, and CI/CD pipeline (learning-driven, hands-on AWS experience for role targeting ECS/IAM/networking/IaC)

## Session Continuity

Last session: 2026-03-29T16:50:23.703Z
Stopped at: Completed 04.6-06-PLAN.md
Resume file: None
