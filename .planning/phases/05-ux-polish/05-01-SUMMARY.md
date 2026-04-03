---
phase: 05-ux-polish
plan: 01
subsystem: ui
tags: [react, nextjs, tailwind, lucide-react, responsive, navigation, prisma]

# Dependency graph
requires: []
provides:
  - SourceAvatar: deterministic colored circle from source name hash (6-color palette)
  - TopicIcon: Lucide icon mapped from topic string with container div
  - TOPIC_ICON_MAP: exported constant for reuse without container div
  - NavLinks: client component with usePathname active link detection
  - HamburgerMenu: mobile slide-in nav drawer with Escape key and focus management
  - feed-watermark API: GET/POST for feed visit timestamp (key: feed_watermark)
affects:
  - 05-02 (FeedTable uses SourceAvatar, TopicIcon, feed-watermark)
  - 05-03 (mobile layout uses HamburgerMenu)
  - all plans needing nav active state

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TOPIC_ICON_MAP exported from TopicIcon.tsx for DRY reuse in TopicGroup
    - NavLinks wraps both desktop nav and hamburger trigger in one client component
    - HamburgerMenu uses conditional render (returns <></> when closed) for performance

key-files:
  created:
    - src/components/ui/SourceAvatar.tsx
    - src/components/ui/TopicIcon.tsx
    - src/components/ui/index.ts
    - src/components/features/layout/NavLinks.tsx
    - src/components/features/layout/HamburgerMenu.tsx
    - src/components/features/layout/index.ts
    - src/app/api/feed-watermark/route.ts
  modified:
    - src/components/features/briefing/TopicGroup.tsx
    - src/app/layout.tsx

key-decisions:
  - "TOPIC_ICON_MAP exported from TopicIcon.tsx so TopicGroup can use bare icon without container div"
  - "HamburgerMenu conditionally renders null when closed (returns <></>) for performance"
  - "NavLinks is a single client component rendering both desktop nav links and hamburger trigger"
  - "feed-watermark API uses prisma.userPreference upsert pattern (same as briefing watermark)"

patterns-established:
  - "UI primitive barrel: src/components/ui/index.ts exports all primitives"
  - "Layout components in src/components/features/layout/ with barrel index.ts"

requirements-completed: [UX-01, UX-02]

# Metrics
duration: 12min
completed: 2026-04-03
---

# Phase 05 Plan 01: Shared UI Infrastructure Summary

**SourceAvatar + TopicIcon primitives, responsive NavLinks with hamburger drawer, and feed watermark GET/POST API route**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-04-03T09:50:00Z
- **Completed:** 2026-04-03T10:02:00Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- SourceAvatar: deterministic colored circle (6-hue palette, hash-based) with sm/md size variants
- TopicIcon: Lucide icon from topic string with bg-(--muted) container; TOPIC_ICON_MAP exported for DRY reuse
- NavLinks: client component showing active page (font-semibold + foreground) via usePathname; desktop hidden sm:flex, hamburger sm:hidden
- HamburgerMenu: full-height slide-in drawer, backdrop scrim, Escape key handler, focus-on-open via useRef
- layout.tsx stays Server Component; NavLinks imported from feature barrel
- feed-watermark API: GET returns stored timestamp or 24h-ago default; POST upserts current time

## Task Commits

1. **Task 1: SourceAvatar and TopicIcon UI primitives** - `c7b4df5` (feat)
2. **Task 2: Responsive NavLinks and HamburgerMenu, layout update** - `61d2f8a` (feat)
3. **Task 3: Feed watermark API route** - `d38c900` (feat)

## Files Created/Modified
- `src/components/ui/SourceAvatar.tsx` - Colored initial circle, 6-hue deterministic palette
- `src/components/ui/TopicIcon.tsx` - Topic-to-Lucide-icon map with container div; exports TOPIC_ICON_MAP
- `src/components/ui/index.ts` - Barrel export for all 7 UI primitives
- `src/components/features/briefing/TopicGroup.tsx` - Imports TOPIC_ICON_MAP from shared TopicIcon instead of inline map
- `src/components/features/layout/NavLinks.tsx` - Client nav with active state, hamburger trigger
- `src/components/features/layout/HamburgerMenu.tsx` - Mobile drawer, backdrop, Escape, focus trap
- `src/components/features/layout/index.ts` - Barrel export for layout feature components
- `src/app/layout.tsx` - Replaces inline nav links with NavLinks component
- `src/app/api/feed-watermark/route.ts` - GET/POST feed watermark endpoint

## Decisions Made
- TOPIC_ICON_MAP exported from TopicIcon.tsx so TopicGroup can use bare icon (size 20, no container) without duplicating the map
- HamburgerMenu returns `<></>` when closed (not null/undefined) for React element type constraint
- NavLinks single client component handles both desktop nav and mobile hamburger trigger; no extra wrapper components
- feed-watermark follows identical prisma.userPreference upsert pattern as briefing watermark

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Pre-existing lint errors in `Flows.stories.tsx` (react/no-unescaped-entities) and `enrich.test.ts` (@typescript-eslint/no-unused-vars) — out of scope, not caused by this plan's changes. All changed files pass lint with zero errors.

## Known Stubs

None.

## Next Phase Readiness
- SourceAvatar and TopicIcon ready for use in FeedTable columns (Plan 02)
- NavLinks active state wired; hamburger menu functional on mobile
- feed-watermark API ready for FeedTable to call on mount (Plan 02)
- All barrel exports in place for clean imports

---
*Phase: 05-ux-polish*
*Completed: 2026-04-03*
