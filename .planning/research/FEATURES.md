# Feature Research

**Domain:** AI-powered personal news aggregator / intelligent reading companion
**Researched:** 2026-03-19
**Confidence:** MEDIUM — core feed reader features HIGH confidence from competitive analysis; AI chat/briefing features MEDIUM confidence from emerging patterns; ADHD UX patterns MEDIUM confidence from community research

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Article list / feed view | Every RSS reader and news app has this; it's the core loop | LOW | Already exists. Needs pagination beyond 100 articles (current gap in CONCERNS.md) |
| Mark as read / unread | Essential for tracking what you've consumed; fundamental to inbox-zero style reading | LOW | Already exists. Needs rollback on error (current gap) |
| Feed source management (add/remove) | Users curate their own sources; without this, the app is closed-garden | LOW | Already exists. Missing validation that a URL is actually an RSS feed |
| Article filtering by source/topic | With many sources, filtering is the only way to find relevant content | LOW | Already exists (source, category, read status filters) |
| Article search | As the corpus grows, users need keyword lookup; without it the history is inaccessible | MEDIUM | Missing — documented as gap in CONCERNS.md |
| Visual source attribution | Users need to know where an article came from to calibrate trust | LOW | Already exists via source name in columns |
| Read time estimate | Sets expectations before clicking; users decide whether to read now or save | LOW | Already exists; inflates on HTML content (known issue) |
| Thumbnail previews | Visual scanning requires images; plain-text lists feel like 1990s RSS | LOW | Already exists; currently unoptimized |
| Responsive layout (mobile-friendly) | Majority of casual reading happens on mobile | MEDIUM | Exists via Tailwind but not fully verified for mobile use |
| Article open in original source | Readers need the canonical source for sharing, context, full content | LOW | Implied by current link-through behavior |
| User account / persistent preferences | Any personalization feature requires identity; without auth, preferences are ephemeral | HIGH | Not implemented — marked as Active requirement |
| ADHD-friendly scannability | Short blocks, strong visual hierarchy, no walls of text — this is the project's core design contract | MEDIUM | Described as a constraint, not a feature; must be applied to every view |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AI daily briefing page | Replaces manually scrolling the feed; surfaces the 5-10 things that actually matter today; the reason this project exists | HIGH | Core Active requirement; needs AI summarization + importance ranking + ADHD-friendly card layout |
| AI importance scoring / classification | Unlike pure RSS readers, articles are ranked by signal vs noise; prevents cognitive overload | HIGH | Requires AI classification pipeline — topic detection, recency weighting, user interest alignment |
| Chat interface over collected news | "What happened with OpenAI this week?" is qualitatively different from browsing; answers questions instead of presenting documents | HIGH | RAG architecture needed — embed/index articles, natural language query, cited answers |
| Configurable user interest topics | Personal AI curation beats generic feed chronology; users explicitly say what matters to them | MEDIUM | Requires user account + preference storage + AI using those preferences in ranking |
| Push notifications for critical-only events | Solve notification fatigue by only alerting on genuinely important developments; opt-in high-signal alerts vs constant pings | MEDIUM | Needs importance threshold logic + Web Push API; Vercel has no native push infra — requires third-party (e.g., OneSignal, web-push library) |
| Topic cluster summaries | Instead of 12 articles about the same GPT-5 announcement, one synthesized summary with links | HIGH | Requires deduplication + clustering + multi-article summarization; complex but high value |
| Self-hostable with user-provided API keys | Differentiated for the open-source audience; users control their data and AI costs | MEDIUM | Already planned; requires environment variable documentation and a "bring your own key" onboarding flow |
| AI provider flexibility (switchable backend) | Avoid lock-in to a single AI provider; future-proofs the product | MEDIUM | Already planned via Vercel AI SDK + AI Gateway; architectural decision already made |
| Saved / bookmarked articles | Separate "read later" queue from the main feed; reading layer vs discovery layer | LOW | Not present; Pocket (competitor) shut down in 2025, creating a gap users feel |
| Focus mode (distraction-free reading) | ADHD users benefit from a single-article view that removes all navigation and noise | LOW | Research confirms "focus mode" as an established ADHD UX pattern; low complexity to implement |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Email digest / newsletter | Familiar format; users know how to consume email | Adds newsletter to an anti-newsletter product; ironic; adds email infrastructure complexity (SES, deliverability, unsubscribe flows); already marked Out of Scope | Invest in the daily briefing page instead — richer, faster, on-demand |
| Engagement/recommendation algorithm | "Make it feel like Twitter" — surfaces trending content | Creates engagement bait and rage-bait dynamics; Smartnews launched a separate app *specifically to undo this*; algorithmic feeds optimize for addiction, not information | Use explicit user interest configuration + importance scoring; let users control their feed rather than being controlled by it |
| Comments / social reactions | Community around news feels valuable | Turns a quiet reading tool into a moderation problem; requires user safety infrastructure; mission is consumption, not publishing; explicitly Out of Scope | Link out to original article discussions instead |
| Twitter/X social feed integration | AI Twitter is where real-time discourse happens | Legal and technical complexity; ToS issues; ephemeral content clutters archivable feed; already marked Out of Scope | Cover the same ground via RSS feeds from aggregator sites (e.g., Hacker News RSS, blog RSS from active AI researchers) |
| Real-time live updates / WebSockets | "Breaking news" feels urgent and valuable | Most AI news doesn't require sub-minute updates; adds infrastructure complexity (no SSE/WebSocket support in basic Vercel functions); 30-minute cron is sufficient for the use case | On-demand manual refresh + cron every 30 min; push notifications for critical alerts only |
| Full article scraping / paywall bypass | Users want to read the full article without leaving | Legal liability; copyright concerns; complex HTML parsing; fragile per-site; similar products (Readability, Pocket) have struggled with reliability | Summarize what's available in the RSS description; deep-link to original for full content |
| User-generated content / sharing feeds | Community curation sounds compelling | Scope explosion; moderation overhead; this is a personal tracker, not a media platform; Out of Scope | Open-source means users can fork and configure their own instance |
| Infinite notification frequency | "Never miss anything" | Notification fatigue is the central problem this product solves; frequency defeats purpose | Strict importance threshold; maximum 1-2 critical alerts per day; user-configurable notification limit |
| Multi-language support | Broader audience appeal | Adds translation pipeline complexity; AI summarization quality degrades across languages; already marked Out of Scope for v1 | English-only for v1; architecture can accommodate language fields later |

## Feature Dependencies

```
[User Account / Auth]
    └──enables──> [Configurable User Interests]
                      └──enables──> [AI Importance Scoring per user]
                                        └──enables──> [Personalized Daily Briefing]
                                        └──enables──> [Push Notifications (critical-only)]

[Article Storage + Ingestion]
    └──enables──> [Article Search]
    └──enables──> [AI Daily Briefing]
    └──enables──> [Chat Interface (RAG)]
                      └──requires──> [Article Embedding / Vector Index]

[AI Classification Pipeline]
    └──enables──> [Topic Cluster Summaries]
    └──enables──> [Importance Scoring]
    └──feeds──> [Daily Briefing Page]

[ADHD-Friendly Design System]
    └──applies to──> [Daily Briefing Page]
    └──applies to──> [Chat Interface]
    └──applies to──> [Article List View]
    └──applies to──> [Focus Mode]

[Daily Briefing Page]
    └──enhances with──> [Topic Cluster Summaries]
    └──enhances with──> [Importance Scoring]
```

### Dependency Notes

- **User Account requires being built before personalization**: Any feature that saves user state (interests, notification preferences, saved articles) needs auth first. Auth is the unblocking dependency for the second half of the Active requirements list.
- **Article Storage enables Chat (RAG)**: The chat interface is only as good as the indexed corpus. Chat needs a vector index or full-text search over stored articles — the existing SQLite store is the foundation.
- **AI Classification enables multiple features**: Importance scoring, topic clustering, and briefing generation all share the same upstream classification step. Building the classification pipeline once, then building features on top of it, is the correct sequencing.
- **ADHD design applies globally**: It is not a single feature with dependencies — it is a design constraint that every interface component must satisfy. It cannot be added afterward; it must be built in.
- **Pagination is a prerequisite for Chat quality**: Chat answers "what happened this week" but if the corpus only holds 100 articles, answers are incomplete. Fixing the pagination/article access gap is a prerequisite for reliable chat.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] User account / authentication — enables all personalization; without it the product is a generic RSS reader
- [ ] Configurable topic interests — the personalization contract with users; drives AI ranking and briefing
- [ ] AI daily briefing page — the core value proposition; replaces manual feed scanning; must be ADHD-friendly
- [ ] AI importance scoring / classification — feeds the briefing; without it the briefing is just a random selection
- [ ] Article pagination / access to full corpus — prerequisite for chat and briefing to have meaningful data
- [ ] Cron authorization security fix — security baseline before exposing to additional users (documented concern)

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Chat interface over collected news — add after briefing is working; validates that the corpus is rich enough to answer questions; more complex to build and test
- [ ] Article search — natural complement to chat; add when user feedback shows they want to find specific articles
- [ ] Saved / bookmarked articles — add when users express the need to separate "read later" from "already scanned"
- [ ] Push notifications (critical-only) — add after importance scoring is stable; requires threshold calibration before enabling notifications
- [ ] Focus mode — low-complexity enhancement once core ADHD-friendly design system is established

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Topic cluster summaries — technically complex (multi-article synthesis, deduplication clustering); defer until single-article summarization is validated
- [ ] AI provider flexibility via UI — architecture already supports it via AI Gateway; expose a UI only when users request provider-switching
- [ ] Feed validation on add — useful QoL, but not blocking for an open-source audience who knows what an RSS URL looks like

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| User authentication | HIGH | MEDIUM | P1 |
| AI daily briefing page | HIGH | HIGH | P1 |
| AI importance scoring / classification | HIGH | HIGH | P1 |
| Configurable user interests | HIGH | MEDIUM | P1 |
| Article pagination (fix existing gap) | MEDIUM | LOW | P1 |
| Cron authorization fix | MEDIUM (security) | LOW | P1 |
| Chat interface (RAG) | HIGH | HIGH | P2 |
| Article search | MEDIUM | MEDIUM | P2 |
| Push notifications (critical-only) | MEDIUM | MEDIUM | P2 |
| Saved / bookmarks | MEDIUM | LOW | P2 |
| Focus mode | MEDIUM | LOW | P2 |
| Topic cluster summaries | HIGH | HIGH | P3 |
| Feed validation on add | LOW | LOW | P3 |
| AI provider switching UI | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch (blocks the core value proposition)
- P2: Should have, add when possible (extends value, validates use cases)
- P3: Nice to have, future consideration (complexity outweighs immediate value)

## Competitor Feature Analysis

| Feature | Feedly / Inoreader | Perplexity | Our Approach |
|---------|--------------|--------------|--------------|
| Feed source management | Full RSS management, folder organization, 150+ sources | Not RSS-based; web crawl | Simpler: add/remove RSS feeds, category tags only — ADHD-friendly, not power-user |
| AI summarization | Feedly has AI summaries (paid); Inoreader adding AI | Core feature; single-article and topic synthesis | Per-article summary + daily briefing; powered by Claude via Vercel AI SDK |
| Chat / conversational query | Not present in either | Core product feature (web-wide search) | Chat over *your collected feeds only* — personal corpus, not the open web; cited answers |
| Personalization | Follow topics, keyword rules, priority scores | Implicit (search history) | Explicit user interest configuration + AI-driven importance scoring |
| Notifications | Available but users report overload | None | Critical-only: maximum 1-2/day; user-configurable threshold |
| ADHD-friendly design | Standard news UI; no special accommodations | Dense interface | Core constraint; every component must meet scannability bar |
| Open-source / self-hosted | No; SaaS only | No; SaaS only | Yes — differentiator for technical audience; user-provided API keys |
| Social features | Inoreader has sharing; Feedly has team boards | None | None — reading tool, not publishing platform |
| Mobile app | Yes (both) | Yes | Web-first; Safari iOS handles text-to-speech natively |

## Sources

- [Zapier: Best RSS reader apps 2026](https://zapier.com/blog/best-rss-feed-reader-apps/)
- [Inoreader vs Feedly feature comparison](https://www.inoreader.com/alternative-to-feedly)
- [Slant: Feedly vs Inoreader 2026](https://www.slant.co/versus/1455/1461/~feedly_vs_inoreader)
- [Reuters Institute: Walking the notification tightrope 2025](https://reutersinstitute.politics.ox.ac.uk/digital-news-report/2025/walking-notification-tightrope-how-engage-audiences-while-avoiding)
- [Dupple: What is the best AI news aggregator?](https://dupple.com/blog/what-is-the-best-ai-news-aggregator)
- [Perplexity daily news briefing cookbook](https://docs.perplexity.ai/docs/cookbook/showcase/daily-news-briefing)
- [UXPA: Designing for ADHD in UX](https://uxpa.org/designing-for-adhd-in-ux/)
- [ADHD friendly design tips 2025](https://www.influencers-time.com/adhd-friendly-design-high-legibility-tips-for-2025/)
- [Din Studio: UI/UX for ADHD](https://din-studio.com/ui-ux-for-adhd-designing-interfaces-that-actually-help-students/)
- [Press Gazette: Smartnews launches Newsarc against rage-bait](https://pressgazette.co.uk/publishers/digital-journalism/smartnews-aggregators/)
- [Reuters Institute: How AI will reshape news 2026](https://reutersinstitute.politics.ox.ac.uk/news/how-will-ai-reshape-news-2026-forecasts-17-experts-around-world)
- [Readless: Inoreader alternatives 2026](https://www.readless.app/blog/inoreader-alternatives-2026)
- [Artifact app Wikipedia](https://en.wikipedia.org/wiki/Artifact_(app)) — shut down January 2024; low-interest signal for pure social news
- [aifeed.fyi briefing](https://aifeed.fyi/briefing) — product in same space; checks 60 sources for daily briefing
- Codebase analysis: `.planning/codebase/CONCERNS.md`, `.planning/codebase/ARCHITECTURE.md`

---
*Feature research for: AI news tracker companion (personal AI-powered RSS aggregator)*
*Researched: 2026-03-19*
