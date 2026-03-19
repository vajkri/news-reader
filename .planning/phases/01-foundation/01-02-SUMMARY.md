---
phase: 01-foundation
plan: 02
subsystem: ui
tags: [nextjs, react, prisma, tailwind, server-components, isr]

# Dependency graph
requires:
  - phase: 01-01
    provides: section-container utility, design tokens, Button/Select/Badge UI components
provides:
  - Component tree reorganized into features/feed/ and features/sources/ with barrel exports
  - Feed page converted to Server Component with ISR (revalidate=60)
  - All pages use .section-container for layout
  - FeedToolbar read filter tabs use Button component with aria-pressed
  - Articles API route has edge caching (revalidate=30)
affects: [02-data-layer, 03-ai-enrichment, 04-chat-ui, all future feature development]

# Tech tracking
tech-stack:
  added: []
  patterns: [features/ directory structure for components, Server Component with client child pattern, ISR revalidate export]

key-files:
  created:
    - src/components/features/feed/FeedTable.tsx
    - src/components/features/feed/FeedToolbar.tsx
    - src/components/features/feed/columns.tsx
    - src/components/features/feed/index.ts
    - src/components/features/sources/SourceForm.tsx
    - src/components/features/sources/SourceList.tsx
    - src/components/features/sources/index.ts
  modified:
    - src/app/page.tsx
    - src/app/layout.tsx
    - src/app/sources/page.tsx
    - src/app/api/articles/route.ts

key-decisions:
  - "Feed page is a Server Component that fetches sources via prisma.source.findMany; FeedTable remains use client for hooks/state"
  - "Date serialization via JSON.parse(JSON.stringify()) to pass Prisma Date objects to client components"
  - "FeedToolbar read filter tabs use Button variant=default (active) and variant=ghost (inactive) with aria-pressed"
  - "Sources page uses section-container global width instead of narrower max-w-4xl"

patterns-established:
  - "Feature components: src/components/features/{feature}/ with barrel index.ts"
  - "Layout: section-container class on inner div; outer div owns background"
  - "Server Component page fetches data, passes serialized props to use client child component"
  - "ISR: export const revalidate = N at top level of page/route files"

requirements-completed: [FOUND-04]

# Metrics
duration: 5min
completed: 2026-03-19
---

# Phase 01 Plan 02: Component Reorganization and Server Component Migration Summary

**Features directory structure, section-container layout migration, and feed page converted to Server Component with ISR caching via prisma.source.findMany**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-19T14:33:21Z
- **Completed:** 2026-03-19T14:38:00Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Moved all components into features/ directory per CLAUDE.md conventions, with barrel exports
- Converted feed page from client-side useEffect fetch to Server Component with Prisma server-side fetch and ISR
- Replaced all max-w-6xl mx-auto px-4 layout patterns with .section-container across layout, page, and sources
- Migrated FeedToolbar raw button elements to Button component with proper variant and aria-pressed attributes
- Added revalidate exports to feed page (60s) and articles API route (30s)

## Task Commits

Each task was committed atomically:

1. **Task 1: Move components to features/, add barrel exports** - `9fc18c9` (feat)
2. **Task 2: Migrate layouts, Server Component, toolbar buttons, API caching** - `ab261c6` (feat)

**Plan metadata:** (pending final commit)

## Files Created/Modified

- `src/components/features/feed/FeedTable.tsx` - Moved from src/components/feed/; unchanged logic
- `src/components/features/feed/FeedToolbar.tsx` - Moved and migrated raw buttons to Button component
- `src/components/features/feed/columns.tsx` - Moved from src/components/feed/; unchanged
- `src/components/features/feed/index.ts` - New barrel export
- `src/components/features/sources/SourceForm.tsx` - Moved from src/components/sources/; unchanged
- `src/components/features/sources/SourceList.tsx` - Moved from src/components/sources/; unchanged
- `src/components/features/sources/index.ts` - New barrel export
- `src/app/page.tsx` - Converted to Server Component with prisma fetch and ISR revalidate=60
- `src/app/layout.tsx` - Header inner div migrated to section-container
- `src/app/sources/page.tsx` - Migrated to section-container
- `src/app/api/articles/route.ts` - Added export const revalidate = 30

## Decisions Made

- Feed page uses Server Component pattern: page fetches data via Prisma, passes serialized JSON to `use client` FeedTable child. Dates serialized via `JSON.parse(JSON.stringify())` to avoid non-serializable Date objects crossing the server/client boundary.
- FeedToolbar active tab uses `variant="default"` (primary color per CLAUDE.md 10% accent rule for active states) instead of `variant="outline"` as originally drafted in plan action text.
- Sources page width standardized to section-container (1800px max) instead of retaining the narrower max-w-4xl, per plan spec.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] FeedToolbar: used variant="default" instead of plan-specified "outline" for active tab**
- **Found during:** Task 2 (FeedToolbar button migration)
- **Issue:** Plan action text specified `variant="outline"` for active state but CLAUDE.md color hierarchy specifies `--primary` for active filter tabs (10% accent), which maps to `variant="default"` in the shadcn Button component
- **Fix:** Used `variant="default"` for active tab (matches design system), `variant="ghost"` for inactive
- **Files modified:** src/components/features/feed/FeedToolbar.tsx
- **Verification:** Build passes, aria-pressed present, no raw button elements remain
- **Committed in:** ab261c6 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - design system alignment)
**Impact on plan:** Fix aligns implementation with CLAUDE.md color hierarchy. No scope creep.

## Issues Encountered

None - build and lint both passed cleanly on first run.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Component structure is CLAUDE.md-compliant and ready for new feature components
- Feed page ISR caching active; articles API caching active
- Server Component pattern established for all data-fetching pages
- FOUND-04 requirement satisfied
