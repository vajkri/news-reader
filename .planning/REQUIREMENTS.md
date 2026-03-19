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

- [ ] **FOUND-01**: Article listing supports pagination beyond 100 articles
- [ ] **FOUND-02**: User can search articles by keyword across the full corpus
- [x] **FOUND-03**: Cron job endpoint validates CRON_SECRET header before executing
- [x] **FOUND-04**: Proper caching strategy implemented (static assets, API responses, ISR/revalidation where appropriate)

### AI Pipeline

- [ ] **AIPL-01**: Each article is automatically summarized into a 2-3 sentence AI summary
- [ ] **AIPL-02**: Each article is classified by topic (model releases, developer tools, industry moves, etc.)
- [ ] **AIPL-03**: Each article receives an importance score (1-10) based on significance
- [ ] **AIPL-04**: AI enrichment runs as a separate cron job, decoupled from RSS fetch

### Daily Briefing

- [ ] **BRIEF-01**: User can view a daily briefing page showing the top 5-10 most important articles
- [ ] **BRIEF-02**: Briefing displays AI summaries in an ADHD-friendly card layout (scannable, visual)
- [ ] **BRIEF-03**: Briefing is grouped by topic with clear visual hierarchy

### Chat

- [ ] **CHAT-01**: User can ask natural language questions about collected news
- [ ] **CHAT-02**: Chat supports both quick lookups ("what's new with Claude?") and deeper analysis
- [ ] **CHAT-03**: Chat uses tool-calling pattern to query database (not raw article context)
- [ ] **CHAT-04**: Chat endpoint has rate limiting from day one

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
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| AIPL-01 | Phase 2 | Pending |
| AIPL-02 | Phase 2 | Pending |
| AIPL-03 | Phase 2 | Pending |
| AIPL-04 | Phase 2 | Pending |
| BRIEF-01 | Phase 3 | Pending |
| BRIEF-02 | Phase 3 | Pending |
| BRIEF-03 | Phase 3 | Pending |
| CHAT-01 | Phase 4 | Pending |
| CHAT-02 | Phase 4 | Pending |
| CHAT-03 | Phase 4 | Pending |
| CHAT-04 | Phase 4 | Pending |
| UX-01 | Phase 5 | Pending |
| UX-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after roadmap creation*
