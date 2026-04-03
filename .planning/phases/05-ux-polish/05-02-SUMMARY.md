---
phase: 05-ux-polish
plan: 02
subsystem: ui
tags: [react, tailwind, tanstack-table, lucide-react, date-fns, responsive, mobile]

# Dependency graph
requires:
  - phase: 05-01
    provides: TopicIcon, SourceAvatar components, feed-watermark API route

provides:
  - TopicIcon/SourceAvatar fallback visuals in feed thumbnail column (replacing empty dash placeholder)
  - NEW badge on unread articles newer than feed watermark
  - FeedMobileList: stacked mobile list view for screens below 640px
  - Responsive FeedToolbar with full-width controls on mobile
  - highlightMatch exported from columns.tsx for reuse in mobile list

affects: [05-03, 05-04, feed-view, mobile-users]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Responsive show/hide: hidden sm:block (desktop) / block sm:hidden (mobile) wrapper pattern"
    - "Watermark fetch order: GET current value first, then POST to update (chained in finally)"
    - "ArticleVisual sub-component pattern: extract visual logic to named component for reuse"

key-files:
  created:
    - src/components/features/feed/FeedMobileList.tsx
  modified:
    - src/components/features/feed/columns.tsx
    - src/components/features/feed/FeedTable.tsx
    - src/components/features/feed/FeedToolbar.tsx
    - src/components/features/feed/index.ts

key-decisions:
  - "highlightMatch exported from columns.tsx (not duplicated) so FeedMobileList can reuse search highlighting"
  - "TOPIC_ICON_MAP imported directly in FeedMobileList to avoid require() and render icons in 32px wrapper"
  - "Watermark GET completes before POST via .finally() chaining to ensure badge display uses the previous watermark value"

patterns-established:
  - "Responsive container pattern: hidden sm:block wraps desktop table, block sm:hidden wraps mobile list"
  - "Mobile touch target minimum: min-h-[44px] on all action buttons in FeedMobileList"

requirements-completed: [UX-01, UX-02]

# Metrics
duration: 5min
completed: 2026-04-03
---

# Phase 5 Plan 02: Feed View Overhaul Summary

**Feed columns now show TopicIcon/SourceAvatar fallbacks instead of dash placeholders, NEW badges on unread articles since last visit, and a fully responsive mobile stacked list below 640px**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-03T09:55:42Z
- **Completed:** 2026-04-03T10:00:42Z
- **Tasks:** 2
- **Files modified:** 5 (1 created, 4 modified)

## Accomplishments

- Replaced empty dash placeholder in thumbnail column with TopicIcon (enriched articles) or SourceAvatar (unenriched articles)
- Added watermark-based NEW badge on unread articles in both desktop table and mobile list
- Created FeedMobileList.tsx: stacked card list with 44px touch targets, source/time metadata, read toggle and chat buttons
- Made FeedTable responsive: desktop table hidden on mobile, mobile list shown below 640px
- Made FeedToolbar responsive: all controls use w-full sm:w-* for proper stacking on narrow screens
- Exported highlightMatch from columns.tsx for reuse in FeedMobileList

## Task Commits

1. **Task 1: Update feed columns with fallback visuals and NEW badge** - `85d1b93` (feat)
2. **Task 2: Create mobile feed list, make FeedTable responsive, make toolbar responsive** - `2ed61d0` (feat)

## Files Created/Modified

- `src/components/features/feed/columns.tsx` - Added TopicIcon/SourceAvatar in thumbnail cell, NEW badge in title cell, exported highlightMatch, feedWatermark in ColumnsOptions, text-sm font-medium on title link
- `src/components/features/feed/FeedMobileList.tsx` - New stacked mobile list with ArticleVisual sub-component, 44px touch targets, chat-about-this CustomEvent dispatch
- `src/components/features/feed/FeedTable.tsx` - Added feedWatermark state + fetch effect, responsive wrappers (hidden sm:block / block sm:hidden), mobile skeleton, FeedMobileList integration
- `src/components/features/feed/FeedToolbar.tsx` - Responsive widths on all filter controls and fetch button
- `src/components/features/feed/index.ts` - Added FeedMobileList barrel export

## Decisions Made

- Exported `highlightMatch` from columns.tsx rather than duplicating in FeedMobileList, keeping search highlight logic in one place
- Used `TOPIC_ICON_MAP` import directly in FeedMobileList with 32px icon wrapper, rather than reusing TopicIcon (which has a fixed 40px container) to match mobile row density
- GET feed-watermark completes before POST via `.finally()` chaining to ensure the previous watermark value is used for badge display, then the watermark is updated to now

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Known Stubs

None - all data flows are wired. TopicIcon, SourceAvatar, and watermark badge display use real article data.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Feed view fully responsive and visually complete with contextual fallback visuals and NEW badges
- FeedMobileList ready to receive any future enhancements (e.g., swipe gestures, expanded row details)
- Ready for Plan 03 and 04 (chat panel mobile responsiveness, sources view polish)

## Self-Check: PASSED

All created files verified present. Both task commits confirmed in git log.

---
*Phase: 05-ux-polish*
*Completed: 2026-04-03*
