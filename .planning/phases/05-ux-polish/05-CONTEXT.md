# Phase 5: UX Polish - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign all views with consistent ADHD-friendly design: cards, visual hierarchy, bite-sized information, and mobile responsiveness. Every page uses the established design system tokens and typography scale. The feed gets the biggest overhaul (compact list with fallback visuals and NEW badges), briefing gets a UX review, all views get mobile support, and the app shell gets navigation polish. No new capabilities; this phase is about making existing features visually consistent and mobile-ready.

</domain>

<decisions>
## Implementation Decisions

### Feed redesign
- **D-01:** Compact list layout (not cards). Polish existing rows with better visual treatment: larger touch targets, badges, fallback icons inline. Dense but scannable.
- **D-02:** Fallback visuals for articles without thumbnails: topic category icon (Lucide) when enriched, colored source initial (first letter on colored circle) when not yet enriched. No favicon fetching.
- **D-03:** Watermark-based NEW badge on feed items. Same model as briefing: articles fetched since last feed page visit get a "New" badge. Reuses the existing UserPreference watermark pattern; needs a separate watermark key for the feed view (distinct from briefing watermark).
- **D-04:** On mobile (below breakpoint), feed switches from table to stacked list items: icon + title on top, metadata below. No horizontal scrolling.

### Mobile responsiveness
- **D-05:** Header nav collapses to hamburger menu on mobile (375px and below). Standard mobile pattern.
- **D-06:** Chat panel goes full-width on mobile (takes over viewport). No resize handle on smallest screens. Side panel behavior remains on desktop.
- **D-07:** Briefing mobile layout: Claude's discretion. Briefing is already card-based and should adapt well with minimal mobile-specific work.

### Visual consistency
- **D-08:** Typography todo folded into this phase: audit and enforce the design system typography scale (globals.css) across all views. Fix any font size, weight, or token usage that drifts from the spec.
- **D-09:** Card primitive decision: Claude's discretion. Evaluate during implementation whether briefing cards, chat source cards, and feed items should share a common Card component in ui/, or stay independently styled.
- **D-10:** Text hierarchy audit: delegate to frontend-design skill during implementation. Flag any views where --foreground/--foreground-secondary/--muted-foreground usage is incorrect.
- **D-11:** Dedicated dark mode pass. Audit contrast ratios, card backgrounds (--card), borders (--border), and text colors in dark mode. Fix any issues found. Not optional.

### Navigation and layout
- **D-12:** Active state indicator on current page nav link in header. Highlight method: Claude's discretion (bold, underline, or primary color).
- **D-13:** Keep current app shell structure: sticky header + main content + chat panel overlay. No sidebar, no structural changes.
- **D-14:** Sources page gets a full visual refresh to match overall design consistency. Not low priority.

### Frontend-design skill directives
- **D-15:** The frontend-design skill MUST audit the entire app for UX/UI enhancement opportunities during implementation. Not just the feed.
- **D-16:** Extra frontend-design focus on the briefing page: review all individual states (morning visit, evening visit, caught up, archive, pending enrichment, triage) and all flows. Propose UX enhancements if any are found.

### Claude's Discretion
- Card primitive decision (shared vs independent styling)
- Active state indicator style for nav
- Briefing mobile responsive layout
- Topic icon mapping (which Lucide icons for which categories)
- Colored initial palette for source avatars
- Feed compact list row height and spacing
- Sources page visual refresh approach
- Any additional UX improvements surfaced by frontend-design audit

### Folded Todos
- **Update typography implementations to match design system scale** (area: ui). Originally tracked as standalone todo. Directly relevant: enforce typography scale across all views as part of the visual consistency pass.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System
- `CLAUDE.md` -- Design system section: typography scale, color tokens, 60/30/10 rule, component specs, focus styles
- `.claude/rules/design-system.md` -- Full design token reference, container utilities, UI components, typography table
- `.claude/rules/tailwind-css-vars.md` -- Tailwind v4 CSS variable syntax rules
- `src/app/globals.css` -- CSS custom properties, container utilities, app layout grid, dark mode tokens

### Current Views (audit targets)
- `src/app/page.tsx` -- Feed page (Server Component, revalidate=60)
- `src/app/briefing/page.tsx` -- Briefing page (force-dynamic, watermark model, archive mode)
- `src/app/sources/page.tsx` -- Sources page (client component, form + list)
- `src/app/layout.tsx` -- Root layout (header, nav, chat wrapper, debug provider)

### Components
- `src/components/features/feed/` -- FeedTable, FeedToolbar, columns (TanStack React Table)
- `src/components/features/briefing/` -- BriefingCard, TopicGroup, DateStepper, StatusBar, CaughtUpState, ArchiveBanner, PendingSection, TriageSection
- `src/components/features/chat/` -- ChatPanel, ChatFAB, ChatInput, ChatMessage, SourceCard, PromptChips
- `src/components/features/sources/` -- SourceForm, SourceList
- `src/components/ui/` -- Badge, Button, Input, Select, Switch

### Watermark Pattern (reuse for feed NEW badge)
- `src/lib/watermark.ts` -- getWatermark, updateWatermark utilities
- `prisma/schema.prisma` -- UserPreference model

### Briefing Mockup (reference for states/flows)
- `.planning/assets/briefing-mockup.html` -- Interactive mockup showing all 5 briefing scenarios

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Badge component** (`src/components/ui/badge.tsx`): 6 variants including critical/important/notable. Can be used for NEW badge.
- **Watermark utilities** (`src/lib/watermark.ts`): getWatermark/updateWatermark pattern. Extend with a feed-specific watermark key.
- **UserPreference model**: Already stores per-user preferences (watermark, rate limit). No schema change needed for feed watermark.
- **TopicGroup component**: Already maps topics to visual groupings. Topic-to-icon mapping could be extracted for reuse in feed.
- **Design tokens**: Full light/dark token set in globals.css. All components should use these.

### Established Patterns
- **Container utilities**: `section-container` (1460px) for wide views (feed, sources), `reading-container` (1024px) for focused reading (briefing)
- **CSS Grid for chat**: `app-content` uses CSS Grid with `data-chat-embedded` attribute for layout coordination
- **Server Components by default**: Feed page is Server Component; Sources is client. Briefing is Server Component.
- **Barrel exports**: Every component directory has index.ts

### Integration Points
- Header nav (`layout.tsx` line 35-53): Add active state indicator, hamburger menu
- Feed page (`page.tsx`): Currently renders FeedTable directly; may need wrapper for NEW badge watermark logic
- Chat panel CSS (`globals.css` line 83-99): Mobile full-width override needed
- FeedToolbar: Filters and controls need responsive treatment

</code_context>

<specifics>
## Specific Ideas

- User wants frontend-design skill to evaluate the entire app holistically, not just individual components
- Briefing audit should cover all 5 scenarios: morning visit, evening visit, caught up, archive, pending enrichment
- Feed fallback visuals: topic icons from Lucide for enriched articles, colored circle with first letter for unenriched. No favicon fetching.
- NEW badge in feed should feel consistent with the briefing's "New" badge treatment
- User explicitly wants sources page polished too, despite it being admin-only

</specifics>

<deferred>
## Deferred Ideas

### Reviewed Todos (not folded)
- **Add body validation to articles PATCH endpoint** (area: api). Out of scope for UX phase; belongs in a code quality pass.
- **Evaluate enrichment model and prompt for better briefing quality** (area: ai-enrichment). Already addressed in Phase 04.1; todo may be stale.

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 05-ux-polish*
*Context gathered: 2026-04-03*
