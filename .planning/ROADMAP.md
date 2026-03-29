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
- [x] **Phase 3: Daily Briefing** - Deliver the core product promise: a scannable daily AI digest (completed 2026-03-21)
- [x] **Phase 03.1: TL;DR Source Fix** - Replace mislabeled TLDR source, add TLDR AI/Design feeds (completed 2026-03-20)
- [x] **Phase 03.2: Neon Postgres Migration** - SQLite to Neon, data migration, Vercel deployment (completed 2026-03-21)
- [x] **Phase 4: Chat Interface** - Let users query the enriched article corpus in natural language (completed 2026-03-27)
- [x] **Phase 04.1: Source Quality Filtering** - Content type taxonomy, enrichment prompt overhaul, model evaluation (completed 2026-03-25)
- [ ] **Phase 04.2: Code Optimization** - Clean up without changing behavior
- [x] **Phase 04.3: Sitemap Ingestion** - Non-RSS source ingestion via sitemap parsing (completed 2026-03-25)
- [x] **Phase 04.4: Feed Chat Buttons** - "Chat about this" on feed items (completed 2026-03-28)
- [x] **Phase 04.5: Debug Mode** - Dev-only debug toggle and briefing annotations (completed 2026-03-28)
- [ ] **Phase 04.6: Enrichment Reliability** - Fix enrichment pipeline for daily article volume
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
- [x] 01-01-PLAN.md — Dev environment setup, CLAUDE.md rewrite, cron auth, .section-container, Input fix
- [x] 01-02-PLAN.md — Component reorganization, layout migration, Server Component conversion, caching
- [x] 01-03-PLAN.md — Articles API search, infinite scroll, search UI with keyboard shortcuts and highlighting

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
- [x] 02-01-PLAN.md — Schema migration, AI dependencies, enrichment logic (Zod schema, batch AI call, DB save)
- [x] 02-02-PLAN.md — Enrichment cron route, vercel.json cron config, Vitest setup, unit tests

### Phase 3: Daily Briefing
**Goal**: Users open the briefing page and immediately understand the most important AI news of the day without reading a single full article
**Depends on**: Phase 2
**Requirements**: BRIEF-01, BRIEF-02, BRIEF-03
**Success Criteria** (what must be TRUE):
  1. The briefing page shows the top 5-10 articles ranked by importance score, not chronologically
  2. Each article on the briefing page is presented as a scannable card: headline, AI summary, importance indicator — no walls of text
  3. Articles on the briefing page are grouped by topic with a clear visual section heading per group
**Plans:** 2/2 plans complete

Plans:
- [x] 03-01-PLAN.md — Briefing utility module (TDD: topic parsing, tier mapping, grouping logic + tests) and Badge tier variants
- [x] 03-02-PLAN.md — Briefing page, BriefingCard/TopicGroup/DateStepper components, nav link, visual verification

### Phase 03.1: Adjust TL;DR source to use tldr-rss middleman (INSERTED)

**Goal:** Replace the mislabeled TLDR Tech source (currently pointing to Hacker News) with correct TLDR feeds via the tldr-rss middleman, add TLDR AI and TLDR Design sources, and add a properly named Hacker News source
**Requirements**: SRC-01, SRC-02, SRC-03
**Depends on:** Phase 3
**Plans:** 1/1 plans complete

Plans:
- [x] 03.1-01-PLAN.md — Update seed.ts with URL-swap preamble and new TLDR/HN sources, verify DB state

### Phase 03.2: Neon Postgres migration + Vercel deployment (INSERTED)

**Goal:** Migrate the database from local SQLite to Neon Postgres via Vercel Marketplace, transfer existing article data (March 18th onward) to preserve AI enrichments, remove all SQLite dependencies, and deploy to Vercel with working cron jobs and all pages functional
**Requirements**: D-01 through D-20
**Depends on:** Phase 03.1
**Plans:** 3/3 plans complete

Plans:
- [x] 03.2-01-PLAN.md — Neon provisioning, Prisma schema migration to PostgreSQL, topics Json? type propagation across source files and tests
- [x] 03.2-02-PLAN.md — Data migration script (SQLite to Neon), execute migration, verify data, remove SQLite dependencies
- [x] 03.2-03-PLAN.md — Cron schedule update, case-insensitive search, Vercel deployment, production verification

### Phase 4: Chat Interface
**Goal**: Users can ask natural language questions about collected news and receive accurate, grounded answers drawn from the enriched article corpus
**Depends on**: Phase 2
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04
**Success Criteria** (what must be TRUE):
  1. User types "what's new with Claude this week?" and receives a response that cites specific articles from the database
  2. User can continue a conversation with follow-up questions and receive contextually aware responses in the same session
  3. The chat endpoint rejects requests after exceeding a defined rate limit, returning an appropriate error message rather than silently continuing
  4. Chat responses are grounded only in collected articles — the model does not fabricate news events not present in the corpus
**Plans:** 7/7 plans complete

Plans:
- [x] 04-01-PLAN.md — Prisma RateLimit model, rate-limit library, chat-tools library, CHAT_MODEL constant, unit tests
- [x] 04-02-PLAN.md — Chat API route with streaming + tool-calling, all chat UI components (ChatPanel, ChatMessage, ChatInput, PromptChips, SourceCard, ChatFAB)
- [x] 04-03-PLAN.md — Layout integration (ChatWrapper in root layout), BriefingCard "Chat about this" button, end-to-end verification
- [x] 04-04-PLAN.md — [gap closure] Full-text search via $queryRaw, prisma generate in dev script, system prompt guardrails, article context as system message
- [x] 04-05-PLAN.md — [gap closure] ChatPanel responsive fixes (hydration, widths, scroll-lock, Escape), embedded desktop layout, context clearing, rate limit error
- [x] 04-06-PLAN.md — [gap closure] Markdown rendering with react-markdown, inline SourceCards via custom link renderer, deferred toggle, user bubble contrast
- [x] 04-07-PLAN.md — [gap closure] Storybook setup with ChatMessage stories for prototyping

### Phase 04.1: Source quality filtering: prioritize news over personal content (INSERTED)

**Goal:** Curate higher-quality RSS sources, add contentType and thinContent fields to the enrichment pipeline, improve enrichment and chat system prompts using UX research, evaluate enrichment models, and re-enrich the full article corpus
**Requirements**: SQF-01, SQF-02, SQF-03, SQF-04, SQF-05, SQF-06
**Depends on:** Phase 4
**Success Criteria** (what must be TRUE):
  1. Dev.to is removed from sources; OpenAI News, Hugging Face Blog, and Hacker News are added
  2. Every article in the database has a non-null contentType and thinContent value after re-enrichment
  3. Enrichment prompt includes contentType taxonomy, importance score anchors, and summary quality rules
  4. Chat prompt uses answer-first behavior with named capabilities per chatbot-prompt-design skill
  5. AI_MODEL reflects the winning model from structured evaluation
**Plans:** 4/4 plans complete

Plans:
- [x] 04.1-01-PLAN.md — Schema migration (contentType + thinContent), seed.ts source updates, enrichment code + tests
- [x] 04.1-02-PLAN.md — Enrichment and chat system prompt rewrites using chatbot-prompt-design skill
- [x] 04.1-03-PLAN.md — Model evaluation script, user selects winner, AI_MODEL updated
- [x] 04.1-04-PLAN.md — Dev.to article deletion via seed cascade, full corpus re-enrichment script

### Phase 04.2: Code optimization via agent-skills: clean up without changing behavior (INSERTED)

**Goal:** [Urgent work - to be planned]
**Requirements**: TBD
**Depends on:** Phase 4
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 04.2 to break down)

### Phase 04.3: Non-RSS source ingestion via sitemap parsing (INSERTED)

**Goal:** Add sitemap-based source ingestion with strategy pattern dispatch, enabling Anthropic News and Claude Blog as non-RSS sources
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, SITE-05, SITE-06
**Depends on:** Phase 04.1
**Success Criteria** (what must be TRUE):
  1. Fetch cron dispatches to correct strategy (rss/sitemap/scrape) based on source.sourceType
  2. Sitemap strategy parses XML, filters by path pattern and 7-day cutoff, extracts article metadata from HTML pages
  3. Anthropic News and Claude Blog articles appear in the feed after cron runs
  4. Existing RSS sources continue to work unchanged
**Plans:** 2/2 plans complete

Plans:
- [x] 04.3-01-PLAN.md — Strategy modules (fetch-article-meta, sitemap, scrape scaffold, dispatcher) + unit tests
- [x] 04.3-02-PLAN.md — Schema migration (sourceType fields), seed Anthropic News + Claude Blog, wire fetch cron to dispatcher

### Phase 04.4: Chat about this: feed item chat buttons (INSERTED)

**Goal:** Each article card in the feed has a "Chat about this" button that opens the chat interface pre-seeded with context about that specific article, so users can ask follow-up questions without manually searching
**Requirements**: TBD
**Depends on:** Phase 4
**Plans:** 2/2 plans complete

Plans:
- [x] 04.4-01-PLAN.md -- Feed Actions column (read toggle + chat button), ChatPanel "Read this for me" chip with Sparkles icon
- [x] 04.4-02-PLAN.md -- fetchArticleContent chat tool (cheerio URL extraction), system prompt ADHD-friendly summary guidance

### Phase 04.5: Dev debug mode infrastructure (INSERTED)

**Goal:** Deliver a dev-only debug mode infrastructure with a floating toggle, React Context state management, and inline debug annotations on the daily briefing page (timeframe metadata box and per-card JSON output)
**Requirements**: D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10, D-11
**Depends on:** Phase 4
**Success Criteria** (what must be TRUE):
  1. A floating debug toggle button is visible in the bottom-right corner in development mode only
  2. Clicking the toggle activates debug mode, showing inline annotations on the briefing page
  3. A debug box between the briefing heading and topic groups shows the timeframe date range and enrichment metadata
  4. Each BriefingCard displays the full article database record as formatted JSON when debug mode is on
  5. All debug UI produces zero footprint in production builds
**Plans:** 2/2 plans complete

Plans:
- [x] 04.5-01-PLAN.md — DebugProvider context + useDebug hook, DebugToggle floating button, layout wiring, ArticleRow type extension
- [x] 04.5-02-PLAN.md — BriefingDebugBox component, per-card debug JSON in BriefingCard, briefing page integration

### Phase 04.6: Enrichment pipeline reliability (INSERTED)

**Goal:** Redesign the enrichment pipeline and briefing model for reliability: increase batch size to 25, flip to newest-first ordering with 48h staleness cutoff, replace Vercel cron with GitHub Actions every-4-hour schedule, rewrite briefing as watermark-based "catch me up" view with new/reviewed sections, add on-demand enrichment from the briefing page, and close the feedback loop with up/down voting that calibrates the enrichment prompt
**Requirements**: EPR-01, EPR-02, EPR-03, EPR-04, EPR-05, EPR-06, EPR-07, EPR-08
**Depends on:** Phase 04.5
**Success Criteria** (what must be TRUE):
  1. BATCH_LIMIT is 25 and enrichment processes newest articles first with 48h staleness cutoff
  2. GitHub Actions workflow runs fetch+enrich every 4 hours; vercel.json has no cron entries
  3. Briefing page shows articles since last watermark as "new" with a New badge, older articles dimmed as "reviewed"
  4. Archive mode via DateStepper shows frozen top 15 by importance with an Archive banner
  5. User can trigger on-demand enrichment from the briefing page via EnrichNow button
  6. Pending unenriched articles appear in an amber section with "Awaiting enrichment" labels
  7. Each new article has up/down feedback buttons with reason checkboxes
  8. Accumulated feedback patterns are injected into the enrichment system prompt for calibration
**Plans:** 6 plans

Plans:
- [ ] 04.6-01-PLAN.md — Schema migration (UserPreference + ArticleFeedback), enrichment pipeline fixes (BATCH_LIMIT 25, DESC ordering, 48h staleness)
- [ ] 04.6-02-PLAN.md — GitHub Actions workflow (every 4h fetch+enrich), remove Vercel cron entries
- [ ] 04.6-03-PLAN.md — Watermark library + tests, SectionDivider/CaughtUpState/ArchiveBanner components, briefing page rewrite
- [ ] 04.6-04-PLAN.md — triggerEnrichment server action, StatusBar, EnrichNowButton, PendingSection components
- [ ] 04.6-05-PLAN.md — Feedback API route + tests, FeedbackButtons component, BriefingCard integration
- [ ] 04.6-06-PLAN.md — Calibration prompt injection (buildCalibrationContext), wire StatusBar/PendingSection into briefing page

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
| 3. Daily Briefing | 2/2 | Complete   | 2026-03-21 |
| 03.1 TL;DR Source Fix | 1/1 | Complete    | 2026-03-20 |
| 03.2 Neon Postgres Migration | 3/3 | Complete    | 2026-03-21 |
| 4. Chat Interface | 7/7 | Complete | 2026-03-27 |
| 04.1 Source Quality Filtering | 4/4 | Complete    | 2026-03-25 |
| 04.2 Code Optimization         | 0/TBD | Not started | -          |
| 04.3 Non-RSS Source Ingestion   | 2/2 | Complete    | 2026-03-25 |
| 04.4 Feed Chat Buttons          | 2/2 | Complete    | 2026-03-28 |
| 04.5 Dev Debug Mode             | 2/2 | Complete    | 2026-03-28 |
| 04.6 Enrichment Reliability   | 0/6 | In progress | -          |
| 5. UX Polish                    | 0/TBD | Not started | -          |
| 6. AWS Deployment (CDK/ECS/CI)  | 0/TBD | Not started | -          |

### Phase 6: AWS deployment with CDK, ECS, and CI/CD pipeline

**Goal:** Deploy the same Next.js application to AWS as a secondary hosting environment alongside Vercel, using ECS Fargate for compute, CDK (TypeScript) for infrastructure-as-code, and GitHub Actions for CI/CD. The two deployments share the same Neon Postgres database and run simultaneously from the same codebase. This phase exists purely for hands-on AWS learning and platform comparison, not for high availability or failover.

**Motivation:** Build demonstrable AWS experience targeting a specific role that requires: ECS, RDS, IAM, networking, CI/CD pipelines, and IaC. The frontend-lean candidate profile means CDK in TypeScript is the right IaC choice (same language across the stack). Hosting the same app on both Vercel and AWS enables direct UI/DX comparison.

**Depends on:** Phase 5 (UX Polish, so the app being deployed is in its final v1 state)

**Requirements:**
- AWS-INFRA-01: CDK stack defines VPC with public/private subnets, NAT gateway, and security groups
- AWS-INFRA-02: ECS Fargate service runs the Next.js app behind an Application Load Balancer (ALB)
- AWS-INFRA-03: ECR repository stores Docker images built from a multi-stage Dockerfile
- AWS-INFRA-04: IAM roles follow least-privilege: ECS task role, execution role, GitHub Actions deploy role
- AWS-INFRA-05: Environment variables (DATABASE_URL, AI API keys) stored in AWS SSM Parameter Store or Secrets Manager, injected into ECS task definition
- AWS-CICD-01: GitHub Actions workflow builds, tests, pushes Docker image to ECR, and deploys to ECS on push to main
- AWS-CICD-02: Pipeline stages: lint, test, build Docker image, push to ECR, update ECS service
- AWS-CICD-03: Vercel deployment continues to work unchanged (vercel.json, Git integration untouched)
- AWS-CRON-01: EventBridge scheduled rules replace Vercel cron jobs (/api/fetch every 4h, /api/enrich 30min after fetch)
- AWS-DB-01: Both deployments connect to the same Neon Postgres database (shared corpus)
- AWS-DOCKER-01: Multi-stage Dockerfile uses Next.js standalone output for minimal image size
- AWS-DOCKER-02: Dockerfile works for local testing via docker compose before deploying to AWS
- AWS-NET-01: ALB health check endpoint returns 200 (new /api/health route)
- AWS-NET-02: HTTPS via ACM certificate on ALB (or HTTP-only for learning MVP, upgrade later)

**Success Criteria** (what must be TRUE):
  1. `cdk deploy` provisions the full stack: VPC, ECS cluster, Fargate service, ALB, ECR, IAM roles
  2. The app is reachable at the ALB DNS name (or custom domain) and renders the same UI as Vercel
  3. GitHub Actions pipeline deploys a new version to ECS automatically on push to main
  4. Cron jobs (fetch + enrich) run on schedule via EventBridge and process articles into the shared Neon database
  5. `cdk destroy` tears down all AWS resources cleanly (no orphaned resources)
  6. Vercel deployment is completely unaffected; both run simultaneously

**Suggested plan breakdown** (to be confirmed during /gsd:plan-phase):
- Plan 1: Dockerfile (multi-stage, standalone output) + /api/health endpoint + local docker compose verification
- Plan 2: CDK stack scaffolding (VPC, subnets, security groups, ECR, IAM roles)
- Plan 3: CDK ECS Fargate service + ALB + health check + environment variable injection from SSM
- Plan 4: GitHub Actions CI/CD pipeline (lint, test, Docker build, ECR push, ECS deploy)
- Plan 5: EventBridge scheduled rules for fetch/enrich crons + verification
- Plan 6: End-to-end verification (both deployments serving same data, crons working on both)

**Nice-to-have extensions** (if time permits, not required for phase completion):
- RDS Postgres instance alongside Neon (for RDS experience; Prisma connection string swap)
- CloudWatch container insights + X-Ray tracing (observability)
- Custom domain via Route 53
- CDK pipeline (self-mutating pipeline that deploys CDK changes)

**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd:plan-phase 6 to break down)
