# AI News Tracker Companion

## What This Is

An AI-powered news tracking tool that helps people stay up-to-date with the AI landscape without information overload. It ingests news from RSS feeds and other sources, uses AI to summarize, classify, and prioritize content, then presents it in a scannable, ADHD-friendly format. Open-source and personalizable — users configure their interests, and the AI surfaces only what matters to them.

## Core Value

Surface only what matters from the AI news firehose, so users can stay informed without stress.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ RSS feed fetching and article ingestion — existing
- ✓ Feed source management (add/remove/configure) — existing
- ✓ Article storage with metadata (title, date, thumbnail, read time) — existing
- ✓ Cron-based automatic feed updates — existing
- ✓ Article listing and browsing interface — existing
- ✓ Next.js web application with responsive layout — existing
- ✓ AI summarization of individual articles — Validated in Phase 2: AI Enrichment
- ✓ AI classification and prioritization of articles by topic and importance — Validated in Phase 2: AI Enrichment
- ✓ Source quality curation with contentType and thinContent enrichment fields — Validated in Phase 04.1: Source Quality Filtering
- ✓ Enrichment model evaluation and selection (deepseek/deepseek-v3.2) — Validated in Phase 04.1: Source Quality Filtering
- ✓ Non-RSS source ingestion via sitemap parsing with strategy pattern dispatch — Validated in Phase 04.3: Non-RSS Source Ingestion
- ✓ Dev-only debug mode infrastructure with floating toggle, React Context state, and briefing page annotations — Validated in Phase 04.5: Dev Debug Mode Infrastructure

### Active

<!-- Current scope. Building toward these. -->

- ✓ AI-powered daily briefing page (scannable, visual, no walls of text) — Validated in Phase 3: Daily Briefing
- [ ] Chat interface for querying collected news ("what happened with OpenAI this week?")
- [ ] Chat supports both quick lookups and deeper analysis conversations
- [ ] ADHD-friendly design throughout (bite-sized content, visual hierarchy, scannable layouts)

### Validated in Phase 1: Foundation

- ✓ Dev environment configured for Claude Code collaboration (CLAUDE.md, memories, Serena MCP, skills)
- ✓ Cron endpoint secured with CRON_SECRET auth guard (401 on invalid)
- ✓ Article list pagination via infinite scroll (50 per batch, IntersectionObserver)
- ✓ Keyword search across article titles and source names (server-side, debounced)
- ✓ Caching strategy: revalidate=60 on feed page, revalidate=30 on articles API
- ✓ Components reorganized into features/ directory with barrel exports

### Deferred (v2)

- [ ] Configurable user interests and topic preferences
- [ ] Push notifications for critical-only news events
- [ ] Full user authentication (sign up, login, saved preferences)
- [ ] Topic cluster summaries

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Email digests — start with dashboard-only; adding email adds complexity and is ironic given the goal of fewer newsletters
- Twitter/X integration — RSS feeds and blog/docs sources only for v1; social media scraping adds legal and technical complexity
- Mobile app — web-first, Safari on iOS handles text-to-speech natively
- Multi-language support — English-only for v1
- User-generated content — this is a consumption tool, not a publishing platform

## Context

- **Brownfield project**: Existing Next.js 16 app with working RSS feed pipeline, Prisma/Neon Postgres database, shadcn/ui components, and Vercel deployment (live at https://news-reader-eta.vercel.app)
- **User has ADHD**: Every design decision must prioritize scannability — short text blocks, visual hierarchy, card-based layouts, no dense paragraphs
- **Open-source**: Built for a broad audience (anyone overwhelmed by AI news), not just the creator. Must be configurable and self-hostable
- **AI ecosystem focus**: Primary interest areas include model releases, developer tools (Claude Code, GitHub Copilot, SDKs), and industry moves (acquisitions, policy)
- **Existing concerns**: Codebase has known issues with missing cron authorization, unvalidated image URLs, error handling gaps, and no test coverage for RSS parsing (documented in `.planning/codebase/CONCERNS.md`)

## Constraints

- **Tech stack**: Next.js 16, React 19, Prisma, Neon Postgres, Tailwind CSS, shadcn/ui — build on existing stack
- **AI integration**: Vercel AI SDK with AI Gateway for provider flexibility (start with Claude, support switching)
- **Design**: ADHD-accessible — no walls of text, visual/scannable format, bite-sized information
- **Simplicity**: Start with simplest viable solutions, iterate based on real usage
- **Open-source**: Architecture must support self-hosting and user-provided API keys

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build on existing codebase | RSS pipeline, database, and UI foundations already work — rewriting wastes time | — Pending |
| Vercel AI SDK + AI Gateway | Provider-agnostic AI integration, built for Next.js, supports multiple providers via single API | — Pending |
| Start with Claude as default AI provider | Creator is in the Claude ecosystem; AI Gateway makes switching trivial later | — Pending |
| Defer authentication to v2 | Auth is a schema migration (no userId on articles); v1 works as single-user tool. Research flags auth as critical for v2 personalization — plan schema early to avoid retrofit | — Pending |
| Dashboard briefing over email | Simpler to build, avoids irony of adding another newsletter, dashboard can evolve to be richer | — Pending |
| ADHD-friendly design as constraint, not feature | Accessibility drives all design — not a toggle, it's the default for everyone | — Pending |

---
*Last updated: 2026-03-28 after Phase 04.5 (Dev Debug Mode Infrastructure) completion*
