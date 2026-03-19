# Phase 1: Foundation - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Secure the codebase, fix corpus limits, and configure the dev environment for Claude Code collaboration. This phase delivers: CLAUDE.md with project conventions, cron endpoint auth, article pagination past 100, keyword search, and a caching strategy. No new features beyond these foundations.

</domain>

<decisions>
## Implementation Decisions

### Pagination
- Infinite scroll, not page numbers or load-more button
- 50 articles per batch (matches existing API default)
- Show total article count in status bar (e.g. "Showing 150 of 342")
- Keep all loaded articles in DOM (no virtualization) -- corpus size is hundreds, not thousands
- Server-side pagination via existing `page` and `limit` API params

### Search
- Inline search input in the FeedToolbar, alongside existing filters (Proposal A)
- Search scope: title + source name
- Server-side search via new `search` query param on articles API
- Debounced input (300ms), no submit button needed
- Keyboard shortcut: `/` to focus, `Esc` to clear
- Active search indicator in status bar with clear button
- Highlight matching text in article titles
- Search combines with existing filters (AND logic)
- Interactive HTML mockup available: `.planning/mockups/search-proposal-A-inline.html`

### CLAUDE.md Conventions
- Rewrite the existing CLAUDE.md (currently from a different project) for this codebase
- Keep the structural template: folder organization, tool preferences, design system, git rules
- Prefer Server Components by default; only add `'use client'` when interactivity required
- Strict TypeScript: no `any` types, explicit return types on exports
- Barrel exports: every component directory gets an index.ts
- Conventional Commits format (feat:, fix:, docs:, chore:)
- No Co-Authored-By lines on commit messages
- Reorganize `src/components/feed/` and `src/components/sources/` into `src/components/features/feed/` and `src/components/features/sources/`

### Design System (CLAUDE.md section)
- Document in the same format as the Lego project's design system section: token table, component inventory, typography scale, depth/shadow system
- Tokens from `globals.css`: zinc palette, CSS variables (--background, --foreground, --muted, etc.), light/dark mode via prefers-color-scheme
- Typography: Geist Sans for UI, Geist Mono for code/mono content
- Components: Button (4 variants), Input, Select, Badge (3 variants) from shadcn/ui
- Add `.section-container` utility to globals.css for consistent horizontal padding:
  ```css
  :root {
    --container-width: 100dvw;
    --container-max-width: 1800px;
    --container-padding: 1.5rem;
  }
  @layer components {
    .section-container {
      width: var(--container-width);
      max-width: var(--container-max-width);
      margin-inline: auto;
      padding-inline: var(--container-padding);
    }
  }
  ```
- Migrate existing `max-w-6xl mx-auto px-4` usages to `.section-container`

### .claude/ File Cleanup
- Update `memory/feedback_no_raw_buttons.md`: correct Button variants to default/outline/ghost/destructive
- Update `memory/feedback_section_container.md`: adapt for this project once .section-container is added
- Apply `memory/feedback_focus_visible_only.md`: fix existing Input component to use focus-visible instead of bare focus
- Remove stale `feedback_copy_holistic.md` reference from MEMORY.md (file doesn't exist)
- Keep all other files as-is (universal rules, process commands)

### Caching Strategy
- Near-realtime freshness: API responses cached briefly (30-60s revalidation)
- Feed page: Server Component with client islands for interactive controls (filters, search, read toggle)
- Static assets: standard CDN caching via Vercel defaults
- Articles API: short revalidation window appropriate for 30-min cron cycle

### Cron Auth (FOUND-03)
- Add CRON_SECRET header validation to `/api/fetch` endpoint
- Return 401 on invalid/missing auth

### Claude's Discretion
- Error handling patterns in CLAUDE.md (whether to codify now or let evolve)
- Exact ISR/revalidation timing for pages vs API routes
- Loading skeleton design for infinite scroll
- How to handle the Server Component + client island boundary (data fetching pattern)
- DEV-02, DEV-03, DEV-04 implementation details (Claude Code memories, skills, Serena MCP)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project context
- `.planning/PROJECT.md` -- Project vision, constraints, key decisions
- `.planning/REQUIREMENTS.md` -- DEV-01 through DEV-04, FOUND-01 through FOUND-04
- `.planning/ROADMAP.md` -- Phase 1 success criteria

### Existing codebase analysis
- `.planning/codebase/CONCERNS.md` -- Security issues, data integrity gaps, performance bottlenecks, test coverage gaps

### Design reference
- `CLAUDE.md` -- Existing conventions template (from Lego project, to be rewritten)
- `.claude/rules/memory-placement.md` -- Memory/documentation placement guide

### Search mockup
- `.planning/mockups/search-proposal-A-inline.html` -- Approved search UI design (interactive, open in browser)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx`: Button with 4 variants (default/outline/ghost/destructive), 4 sizes
- `src/components/ui/input.tsx`: Input with border/focus ring styling
- `src/components/ui/select.tsx`: Native select with ChevronDown icon
- `src/components/ui/badge.tsx`: Badge with 3 variants (default/secondary/outline)
- `src/lib/utils.ts`: cn() utility (clsx + tailwind-merge)
- `src/lib/prisma.ts`: Prisma client singleton

### Established Patterns
- CSS variables for theming (zinc palette, light/dark via prefers-color-scheme)
- Geist Sans/Mono loaded via next/font/local in layout.tsx
- TanStack React Table for data display with sorting/filtering
- Client-side data fetching via useEffect + fetch (to be migrated to Server Components)
- Optimistic UI updates (read toggle) without rollback (to be fixed)
- lucide-react for icons

### Integration Points
- `src/app/layout.tsx`: Header with nav (Feed, Sources) -- will need `.section-container`
- `src/app/page.tsx`: Feed page entry point -- migrate to Server Component
- `src/components/feed/FeedTable.tsx`: Main feed component -- add infinite scroll, search input
- `src/components/feed/FeedToolbar.tsx`: Filter controls -- add search input inline
- `src/app/api/articles/route.ts`: Articles API -- add `search` query param
- `src/app/api/fetch/route.ts`: Cron endpoint -- add CRON_SECRET auth
- `src/app/globals.css`: Design tokens -- add .section-container utility
- `vercel.json`: Cron config (30-min schedule)

</code_context>

<specifics>
## Specific Ideas

- Design system documentation in CLAUDE.md should mirror the Lego project's format: token table, component inventory, typography scale, depth system
- `.section-container` pattern proven in previous project: outer div owns background (full-width), inner div uses .section-container (max-width + padding)
- Search UI approved via interactive mockup (Proposal A) -- search inline with filters, keyboard shortcut, debounced, with text highlighting

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-19*
