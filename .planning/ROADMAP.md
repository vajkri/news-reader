# Roadmap: AI News Tracker Companion

## Overview

Starting from a working RSS feed reader, this milestone transforms the raw article aggregator into an AI-powered reading companion. The journey runs in five phases: first hardening the developer environment and security foundation (so new work is safe to build on), then training the AI enrichment pipeline (so articles carry meaning, not just text), then surfacing the daily briefing (the core product promise), then opening the chat interface (conversational access to the enriched corpus), and finally polishing the UI across all views for the ADHD-friendly design standard the product requires.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Secure the codebase, fix corpus limits, configure dev environment (completed 2026-03-19)
- [x] **Phase 2: AI Enrichment** - Automatically summarize, classify, and score every article (completed 2026-03-19)
- [ ] **Phase 3: Daily Briefing** - Deliver the core product promise: a scannable daily AI digest
- [ ] **Phase 4: Chat Interface** - Let users query the enriched article corpus in natural language
- [ ] **Phase 5: UX Polish** - Apply ADHD-friendly design consistently across all views

## Phase Details

### Phase 1: Foundation
**Goal**: The development environment is configured for Claude Code collaboration, and the existing codebase has no security gaps or data access limits that would block future work
**Depends on**: Nothing (first phase)
**Requirements**: DEV-01, DEV-02, DEV-03, DEV-04, FOUND-01, FOUND-02, FOUND-03, FOUND-04
**Success Criteria** (what must be TRUE):
  1. Claude Code opens the project and immediately has context on conventions, rules, and preferred patterns via CLAUDE.md
  2. The cron endpoint rejects requests without a valid CRON_SECRET header and returns 401
  3. The article list can paginate past 100 articles — user can navigate to page 2, 3, and beyond
  4. User can search for a keyword in the article list and see only matching articles
  5. Caching strategy is in place — static assets cached at edge, API responses use appropriate revalidation
**Plans:** 3/3 plans complete

Plans:
- [ ] 01-01-PLAN.md — Dev environment setup, CLAUDE.md rewrite, cron auth, .section-container, Input fix
- [ ] 01-02-PLAN.md — Component reorganization, layout migration, Server Component conversion, caching
- [ ] 01-03-PLAN.md — Articles API search, infinite scroll, search UI with keyboard shortcuts and highlighting

### Phase 2: AI Enrichment
**Goal**: Every new article automatically receives an AI-generated summary, topic classification, and importance score before it appears in any user-facing view
**Depends on**: Phase 1
**Requirements**: AIPL-01, AIPL-02, AIPL-03, AIPL-04
**Success Criteria** (what must be TRUE):
  1. After the enrichment cron runs, each article has a 2-3 sentence summary visible in the article detail view
  2. Each article is tagged with at least one topic category (e.g., "model releases", "developer tools", "industry moves")
  3. Each article displays an importance score (1-10) that reflects its significance relative to the current news cycle
  4. The enrichment cron job runs independently of the RSS fetch cron — triggering one does not trigger the other
  5. Articles already enriched are not re-processed on subsequent cron runs
**Plans:** 2/2 plans complete

Plans:
- [ ] 02-01-PLAN.md — Schema migration, AI dependencies, enrichment logic (Zod schema, batch AI call, DB save)
- [ ] 02-02-PLAN.md — Enrichment cron route, vercel.json cron config, Vitest setup, unit tests

### Phase 3: Daily Briefing
**Goal**: Users open the briefing page and immediately understand the most important AI news of the day without reading a single full article
**Depends on**: Phase 2
**Requirements**: BRIEF-01, BRIEF-02, BRIEF-03
**Success Criteria** (what must be TRUE):
  1. The briefing page shows the top 5-10 articles ranked by importance score, not chronologically
  2. Each article on the briefing page is presented as a scannable card: headline, AI summary, importance indicator — no walls of text
  3. Articles on the briefing page are grouped by topic with a clear visual section heading per group
**Plans:** 1/2 plans executed

Plans:
- [ ] 03-01-PLAN.md — Briefing utility module (TDD: topic parsing, tier mapping, grouping logic + tests) and Badge tier variants
- [ ] 03-02-PLAN.md — Briefing page, BriefingCard/TopicGroup/DateStepper components, nav link, visual verification

### Phase 03.1: Adjust TL;DR source to use tldr-rss middleman (INSERTED)

**Goal:** Replace the mislabeled TLDR Tech source (currently pointing to Hacker News) with correct TLDR feeds via the tldr-rss middleman, add TLDR AI and TLDR Design sources, and add a properly named Hacker News source
**Requirements**: SRC-01, SRC-02, SRC-03
**Depends on:** Phase 3
**Plans:** 1/1 plans complete

Plans:
- [ ] 03.1-01-PLAN.md — Update seed.ts with URL-swap preamble and new TLDR/HN sources, verify DB state

### Phase 03.2: Neon Postgres migration + Vercel deployment (INSERTED)

**Goal:** Migrate the database from local SQLite to Neon Postgres via Vercel Marketplace, transfer existing article data (March 18th onward) to preserve AI enrichments, remove all SQLite dependencies, and deploy to Vercel with working cron jobs and all pages functional
**Requirements**: D-01 through D-20
**Depends on:** Phase 03.1
**Plans:** 3 plans

Plans:
- [x] 03.2-01-PLAN.md — Neon provisioning, Prisma schema migration to PostgreSQL, topics Json? type propagation across source files and tests
- [ ] 03.2-02-PLAN.md — Data migration script (SQLite to Neon), execute migration, verify data, remove SQLite dependencies
- [ ] 03.2-03-PLAN.md — Cron schedule update, case-insensitive search, Vercel deployment, production verification

### Phase 4: Chat Interface
**Goal**: Users can ask natural language questions about collected news and receive accurate, grounded answers drawn from the enriched article corpus
**Depends on**: Phase 2
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04
**Success Criteria** (what must be TRUE):
  1. User types "what's new with Claude this week?" and receives a response that cites specific articles from the database
  2. User can continue a conversation with follow-up questions and receive contextually aware responses in the same session
  3. The chat endpoint rejects requests after exceeding a defined rate limit, returning an appropriate error message rather than silently continuing
  4. Chat responses are grounded only in collected articles — the model does not fabricate news events not present in the corpus
**Plans**: TBD

### Phase 5: UX Polish
**Goal**: Every page in the application uses a consistent ADHD-friendly design — cards, visual hierarchy, bite-sized information — that works on both desktop and mobile
**Depends on**: Phase 4
**Requirements**: UX-01, UX-02
**Success Criteria** (what must be TRUE):
  1. All views (article list, article detail, briefing, chat) use card-based layouts with clear visual hierarchy and no dense text blocks
  2. The application is usable on a mobile device — all core views render correctly at 375px width without horizontal scrolling
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete   | 2026-03-19 |
| 2. AI Enrichment | 2/2 | Complete   | 2026-03-19 |
| 3. Daily Briefing | 1/2 | In Progress|  |
| 03.1 TL;DR Source Fix | 1/1 | Complete    | 2026-03-20 |
| 03.2 Neon Postgres Migration | 0/3 | Not started | - |
| 4. Chat Interface | 0/TBD | Not started | - |
| 5. UX Polish | 0/TBD | Not started | - |
