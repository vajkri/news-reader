---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Ready to execute
stopped_at: Completed 04.1-02-PLAN.md
last_updated: "2026-03-25T11:28:28.852Z"
progress:
  total_phases: 9
  completed_phases: 6
  total_plans: 22
  completed_plans: 20
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-19)

**Core value:** Surface only what matters from the AI news firehose, so users can stay informed without stress
**Current focus:** Phase 04.1 — source-quality-filtering-prioritize-news-over-personal-content

## Current Position

Phase: 04.1 (source-quality-filtering-prioritize-news-over-personal-content) — EXECUTING
Plan: 3 of 4

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 01 P01 | 8 | 4 tasks | 6 files |
| Phase 01-foundation P02 | 5 | 2 tasks | 11 files |
| Phase 01-foundation P03 | 5 | 3 tasks | 4 files |
| Phase 02-ai-enrichment P01 | 395 | 2 tasks | 6 files |
| Phase 02-ai-enrichment P02 | 3 | 2 tasks | 6 files |
| Phase 03-daily-briefing P01 | 2 | 2 tasks | 4 files |
| Phase 03-daily-briefing P02 | 2 | 2 tasks | 6 files |
| Phase 03.2 P01 | 72 | 3 tasks | 8 files |
| Phase 03.2 P02 | 4 | 3 tasks | 2 files |
| Phase 03.2 P03 | 5 | 3 tasks | 2 files |
| Phase 04-chat-interface P01 | 6 | 2 tasks | 7 files |
| Phase 04-chat-interface P02 | 7 | 2 tasks | 10 files |
| Phase 04-chat-interface P05 | 8 | 3 tasks | 4 files |
| Phase 04-chat-interface P04 | 9 | 2 tasks | 5 files |
| Phase 04-chat-interface P06 | 4 | 2 tasks | 5 files |
| Phase 04-chat-interface P07 | 8 | 2 tasks | 5 files |
| Phase 04.1 P01 | 10 | 2 tasks | 5 files |
| Phase 04.1 P02 | 5 | 2 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Build on existing codebase — RSS pipeline, database, and UI foundations already work
- [Init]: Vercel AI SDK v6 + AI Gateway for provider-agnostic LLM integration
- [Init]: Authentication deferred to v2 — articles/sources remain shared corpus with no userId
- [Init]: Better Auth chosen over NextAuth/Auth.js (maintenance transferred); relevant for v2 planning
- [Init]: SQLite production persistence on Vercel needs confirmation before Phase 2 (see research gap)
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

### Pending Todos

1. Add body validation to articles PATCH endpoint (area: api)
2. Replace bracket-var Tailwind syntax with v4 shorthand (area: ui)
3. Rotate leaked CRON_SECRET and scrub from git history (area: general)
4. Evaluate enrichment model and prompt for better briefing quality (area: ai-enrichment)
5. Update typography implementations to match design system scale (area: ui)

### Blockers/Concerns

- [Phase 1 prerequisite] SQLite on Vercel uses ephemeral filesystem (better-sqlite3); must confirm persistence strategy (Turso/LibSQL) during Phase 1 — if DB isn't persistent, no feature work is safe to ship
- [Research flag] Chat rate limiting (Phase 4): Upstash Ratelimit may require Vercel Pro tier; verify before planning Phase 4

### Roadmap Evolution

- Phase 03.1 inserted after Phase 03: Adjust TL;DR source to use tldr-rss middleman (URGENT)
- Phase 03.2 inserted after Phase 03: Neon Postgres migration + Vercel deployment (URGENT)
- Phase 04.1 inserted after Phase 04: Source quality filtering: prioritize news over personal content (URGENT)
- Phase 04.2 inserted after Phase 04: Code optimization via agent-skills: clean up without changing behavior (URGENT)

## Session Continuity

Last session: 2026-03-25T11:28:28.847Z
Stopped at: Completed 04.1-02-PLAN.md
Resume file: None
