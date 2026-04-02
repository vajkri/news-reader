# Requirements: AI News Tracker Companion

**Defined:** 2026-03-19
**Core Value:** Surface only what matters from the AI news firehose, so users can stay informed without stress

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Dev Environment

- [x] **DEV-01**: CLAUDE.md configured with project conventions, rules, and coding preferences
- [x] **DEV-02**: Claude Code memories set up for project context
- [x] **DEV-03**: Relevant skills added and configured for the project workflow
- [x] **DEV-04**: Serena MCP server integrated for code intelligence

### Foundation

- [x] **FOUND-01**: Article listing supports pagination beyond 100 articles
- [x] **FOUND-02**: User can search articles by keyword across the full corpus
- [x] **FOUND-03**: Cron job endpoint validates CRON_SECRET header before executing
- [x] **FOUND-04**: Proper caching strategy implemented (static assets, API responses, ISR/revalidation where appropriate)

### AI Pipeline

- [x] **AIPL-01**: Each article is automatically summarized into a 2-3 sentence AI summary
- [x] **AIPL-02**: Each article is classified by topic (model releases, developer tools, industry moves, etc.)
- [x] **AIPL-03**: Each article receives an importance score (1-10) based on significance
- [x] **AIPL-04**: AI enrichment runs as a separate cron job, decoupled from RSS fetch

### Daily Briefing

- [x] **BRIEF-01**: User can view a daily briefing page showing the top 5-10 most important articles
- [x] **BRIEF-02**: Briefing displays AI summaries in an ADHD-friendly card layout (scannable, visual)
- [x] **BRIEF-03**: Briefing is grouped by topic with clear visual hierarchy

### Chat

- [x] **CHAT-01**: User can ask natural language questions about collected news
- [x] **CHAT-02**: Chat supports both quick lookups ("what's new with Claude?") and deeper analysis
- [x] **CHAT-03**: Chat uses tool-calling pattern to query database (not raw article context)
- [x] **CHAT-04**: Chat endpoint has rate limiting from day one

### Source Quality Filtering

- [x] **SQF-01**: Dev.to removed from sources; high-quality AI/ML feeds added (OpenAI News, Hugging Face Blog, Hacker News)
- [x] **SQF-02**: Article model extended with contentType (5-value enum) and thinContent (boolean), persisted during enrichment
- [x] **SQF-03**: Enrichment system prompt improved with contentType taxonomy, importance score anchors, and summary quality rules
- [x] **SQF-04**: Chat system prompt improved with answer-first behavior and named capabilities per UX research
- [x] **SQF-05**: Enrichment model evaluated across 4 candidates and best selected based on quality and cost
- [x] **SQF-06**: Full article corpus re-enriched with improved prompt and selected model

### Non-RSS Source Ingestion

- [x] **SITE-01**: Strategy pattern dispatcher routes fetching by source type (rss, sitemap, scrape)
- [x] **SITE-02**: Sitemap strategy parses XML, filters by path pattern and 7-day cutoff, returns ParsedArticle[]
- [x] **SITE-03**: Article meta extraction from HTML pages (og:title, og:description, og:image, datePublished)
- [x] **SITE-04**: Source model extended with sourceType, sitemapPathPattern, scrapeUrl, scrapeLinkSelector
- [x] **SITE-05**: Anthropic News and Claude Blog added as sitemap sources
- [x] **SITE-06**: Fetch cron dispatches to correct strategy based on source.sourceType

### Enrichment Pipeline Reliability

- [x] **EPR-01**: BATCH_LIMIT increased to 25, enrichment orders newest-first with 48h staleness cutoff
- [x] **EPR-02**: UserPreference and ArticleFeedback Prisma models with migration applied
- [x] **EPR-03**: GitHub Actions workflow replaces Vercel cron (every 4h, fetch+enrich, manual dispatch)
- [x] **EPR-04**: Briefing uses watermark-based "catch me up" model with new/reviewed sections and caught-up state
- [x] **EPR-05**: Archive mode shows frozen top 15 by publishedAt date with archive banner, no feedback/enrich
- [ ] **EPR-06**: On-demand enrichment via EnrichNow button with StatusBar and PendingSection
- [ ] **EPR-07**: Feedback API and UI with up/down buttons, reason checkboxes, denormalized storage
- [x] **EPR-08**: Calibration prompt injection from accumulated feedback patterns

### UX / Design

- [ ] **UX-01**: All views redesigned with ADHD-friendly scannable layout (cards, visual hierarchy, no text walls)
- [ ] **UX-02**: Responsive design verified for mobile use

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Authentication & Personalization

- **AUTH-01**: User accounts via Better Auth (sign up, login, sessions)
- **AUTH-02**: Configurable topic interest preferences per user

### Notifications

- **NOTIF-01**: Push notifications for critical-only news events (Web Push)

### Reading Experience

- **SAVE-01**: Saved/bookmarked articles (read-later queue)
- **UX-03**: Focus mode (distraction-free single-article view)

### AI Enhancements

- **AIPL-05**: Topic cluster summaries (merge duplicate coverage into one synthesized summary)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Email digests | Anti-newsletter product shouldn't add another newsletter |
| Twitter/X integration | Legal/technical complexity; RSS covers the same ground via aggregator feeds |
| Mobile app | Web-first; Safari on iOS handles text-to-speech natively |
| Comments / social features | Consumption tool, not a publishing platform |
| Full article scraping | Legal liability; summarize RSS description instead |
| Engagement / recommendation algorithms | Explicitly anti-feature; users control their feed, not the algorithm |
| Multi-language support | English-only for v1; architecture can accommodate language fields later |
| Real-time live updates / WebSockets | 30-min cron is sufficient; push notifications handle critical alerts |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEV-01 | Phase 1 | Complete |
| DEV-02 | Phase 1 | Complete |
| DEV-03 | Phase 1 | Complete |
| DEV-04 | Phase 1 | Complete |
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| AIPL-01 | Phase 2 | Complete |
| AIPL-02 | Phase 2 | Complete |
| AIPL-03 | Phase 2 | Complete |
| AIPL-04 | Phase 2 | Complete |
| BRIEF-01 | Phase 3 | Complete |
| BRIEF-02 | Phase 3 | Complete |
| BRIEF-03 | Phase 3 | Complete |
| CHAT-01 | Phase 4 | Complete |
| CHAT-02 | Phase 4 | Complete |
| CHAT-03 | Phase 4 | Complete |
| CHAT-04 | Phase 4 | Complete |
| SQF-01 | Phase 04.1 | Complete |
| SQF-02 | Phase 04.1 | Complete |
| SQF-03 | Phase 04.1 | Complete |
| SQF-04 | Phase 04.1 | Complete |
| SQF-05 | Phase 04.1 | Complete |
| SQF-06 | Phase 04.1 | Complete |
| SITE-01 | Phase 04.3 | Complete |
| SITE-02 | Phase 04.3 | Complete |
| SITE-03 | Phase 04.3 | Complete |
| SITE-04 | Phase 04.3 | Complete |
| SITE-05 | Phase 04.3 | Complete |
| SITE-06 | Phase 04.3 | Complete |
| EPR-01 | Phase 04.6 | Complete |
| EPR-02 | Phase 04.6 | Complete |
| EPR-03 | Phase 04.6 | Complete |
| EPR-04 | Phase 04.6 | Complete |
| EPR-05 | Phase 04.6 | Complete |
| EPR-06 | Phase 04.6 | Pending |
| EPR-07 | Phase 04.6 | Pending |
| EPR-08 | Phase 04.6 | Complete |
| UX-01 | Phase 5 | Pending |
| UX-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 41 total
- Mapped to phases: 41
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-29 after Phase 04.6 planning*
