# Phase 3: Daily Briefing - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a daily briefing page that shows the top enriched articles ranked by importance and grouped by topic. Users open the briefing and immediately understand the most important AI news without reading full articles. This phase builds the briefing page, card components, topic grouping, date navigation, and nav integration. The enrichment pipeline is Phase 2. Chat access is Phase 4. Cross-view UX polish is Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Card content and density
- Each card shows: thumbnail (or topic icon fallback), headline, full AI summary (2-3 sentences), importance badge, topic tag
- Small footer line with source name + relative time ("The Verge, 2h ago")
- No read time, no numeric score on cards
- Clicking a card opens the original article URL in a new tab (briefing is a launch pad, not a reading surface)
- When thumbnail is missing, show a subtle icon matching the article's topic category (e.g., code icon for developer tools) to keep cards visually consistent

### Layout
- Single-column card layout within section-container
- Cards stacked vertically, full width, natural top-to-bottom reading flow
- Mobile-friendly by default (single column scales naturally)

### Topic grouping
- Articles grouped by topic with visual section headings
- Section heading format: "Topic Name (N)" showing article count per group
- Groups ordered by highest importance score in the group (most critical topic first)
- Within each group, articles ordered by importance score descending
- Groups are always expanded, not collapsible (briefing is already filtered to top articles)

### Importance visualization
- Colored Badge component per card showing tier label only (no numeric score)
- Color palette: red for Critical (9-10), orange/amber for Important (7-8), blue for Notable (4-6)
- Low-importance articles (score 1-3) excluded from the briefing entirely; they live in the Feed view
- Badge positioned on the card alongside the topic tag

### Time scope and navigation
- Default briefing window: last 24 hours (rolling)
- Users can browse past briefings via a simple date stepper (prev/next arrows with date label and "Today" button)
- Briefing page accessible from main navigation (add "Briefing" link to header nav alongside Feed and Sources)

### Empty state
- Claude's Discretion: design the empty state using the frontend-design skill during implementation

### Claude's Discretion
- Empty state design and copy
- Exact card spacing, shadows, border radius
- Topic icon set for thumbnail fallbacks
- Date stepper component styling
- How to handle articles with multiple topic tags (show in primary topic group vs duplicate across groups)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` -- Project vision, constraints (ADHD-friendly design, open-source, AI SDK + AI Gateway)
- `.planning/REQUIREMENTS.md` -- BRIEF-01 through BRIEF-03 acceptance criteria
- `.planning/ROADMAP.md` -- Phase 3 success criteria (3 items)

### Phase 2 decisions (enrichment data this phase consumes)
- `.planning/phases/02-ai-enrichment/02-CONTEXT.md` -- Topic taxonomy (7 seed categories, AI-extendable, multi-tag), importance scoring (4 tiers, batch-aware), summary style (analyst briefing tone, "why it matters" line)

### Existing codebase
- `.planning/codebase/STRUCTURE.md` -- Directory layout, where to add new code
- `.planning/codebase/CONVENTIONS.md` -- Naming patterns, import organization, error handling
- `prisma/schema.prisma` -- Article model (enrichment fields added by Phase 2)
- `src/app/layout.tsx` -- Root layout with header nav (needs Briefing link)
- `src/components/ui/badge.tsx` -- Badge component (reuse for importance tier badges)
- `src/app/globals.css` -- Design tokens (color vars, container tokens, font vars)

### Design system
- `CLAUDE.md` -- Design tokens, typography scale, 60/30/10 color rule, focus styles, container utility pattern

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/badge.tsx`: Badge component with default/secondary/outline variants; extend with color variants for importance tiers
- `src/components/ui/button.tsx`: Button component for date stepper navigation arrows
- `src/app/globals.css`: All design tokens (--background, --foreground, --muted, --border, --primary, --card, --radius)
- `.section-container` CSS utility: constrains content width with padding, used across all pages

### Established Patterns
- Server Components by default; 'use client' only for interactivity (date stepper needs client state)
- `section-container` two-div pattern: outer div for background, inner div for constrained content
- Prisma queries in Server Components or API routes, serialized via JSON round-trip for dates
- Navigation links in `layout.tsx` header with `text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]` pattern

### Integration Points
- `src/app/layout.tsx`: Add "Briefing" nav link
- `src/app/briefing/page.tsx`: New page (Server Component, fetches articles via Prisma)
- `src/components/features/briefing/`: New feature directory for briefing-specific components (BriefingCard, TopicGroup, DateStepper)
- `src/types/index.ts`: Extend ArticleRow with enrichment fields (summary, topics, importanceScore, importanceTier)

</code_context>

<specifics>
## Specific Ideas

- Cards with thumbnail + topic icon fallback for visual consistency when images are missing
- Date stepper pattern: "< Mar 18 | Today | Mar 19 >" with prev/next arrows and a Today button to jump back
- Importance tier colors: red (Critical), orange/amber (Important), blue (Notable); no Low tier on briefing
- Topic groups ranked dynamically by highest importance in the group, not alphabetically
- Briefing is a launch pad: cards link out to original articles, no internal detail view needed

</specifics>

<deferred>
## Deferred Ideas

- Article retention policy: delete articles after 3 days or when count exceeds a threshold. Data management concern, not a Phase 3 UI question. Consider as infrastructure/maintenance task.
- Date picker (calendar dropdown) for jumping to arbitrary past dates instead of stepping day-by-day
- Collapsible topic groups for power users who want to dismiss already-scanned topics

</deferred>

---

*Phase: 03-daily-briefing*
*Context gathered: 2026-03-19*
