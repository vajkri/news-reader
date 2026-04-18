---
phase: 05-ux-polish
plan: 03
subsystem: ui
tags: [react, nextjs, tailwind, sources, chat, typography, dark-mode, responsive, accessibility]

# Dependency graph
requires:
  - 05-01 (SourceAvatar primitive)
provides:
  - SourceList: SourceAvatar visual anchor per row, inline delete confirmation, mobile URL column hidden
  - SourceForm: mobile-responsive stacking (w-full on mobile, flex on sm+)
  - ChatPanel: full viewport width below 640px (Tailwind sm breakpoint)
  - Typography: enforced design system scale across all views
affects:
  - sources page (SourceList, SourceForm)
  - chat panel mobile behavior
  - briefing (BriefingCard, CaughtUpState typography)
  - feed (FeedTable status bar, columns title)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Inline delete confirmation replaces window.confirm for accessible delete flow
    - SourceAvatar created locally (dependency from Plan 01 not yet merged)

key-files:
  created:
    - src/components/ui/SourceAvatar.tsx
    - src/components/ui/index.ts
  modified:
    - src/components/features/sources/SourceList.tsx
    - src/components/features/sources/SourceForm.tsx
    - src/components/features/chat/ChatPanel.tsx
    - src/components/features/briefing/BriefingCard.tsx
    - src/components/features/briefing/CaughtUpState.tsx
    - src/components/features/feed/FeedTable.tsx
    - src/components/features/feed/columns.tsx
    - src/components/features/briefing/stories/Flows.stories.tsx

key-decisions:
  - "SourceAvatar created in this worktree as Plan 01 dependency not yet merged to worktree base"
  - "Pre-existing lint errors in Flows.stories.tsx fixed (Rule 3) since plan acceptance requires lint 0"
  - "text-[0.8125rem] (13px) replaced with text-sm (14px) for metadata throughout - below minimum non-badge size"
  - "CaughtUpState heading changed from text-base to text-lg per heading spec"
  - "FeedTable status bar changed from text-xs to text-sm per design system metadata scale"

patterns-established:
  - "Inline delete confirmation: deletingId state + conditional render of confirm/cancel buttons"

requirements-completed: [UX-01, UX-02]

# Metrics
duration: 15min
completed: 2026-04-03
---

# Phase 05 Plan 03: Sources Polish, Chat Mobile Fix, Typography Audit Summary

**Sources page visual refresh with SourceAvatar and accessible inline delete; chat panel full-width at 640px; typography scale enforced across all views.**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-04-03
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

**Task 1: Sources page visual refresh**
- SourceAvatar added as first column in SourceList (deterministic 6-hue palette, size="sm")
- Inline delete confirmation replaces `window.confirm()`: "Delete source?" label with "Delete source" and "Keep source" buttons
- URL column hidden on mobile (`hidden sm:table-cell`) to prevent horizontal scroll
- Empty state copy updated to UI-SPEC: "No sources added yet. Add your first RSS feed to start fetching articles."
- SourceForm inputs now stack vertically on mobile (`w-full`), go side-by-side on `sm+`

**Task 2: Chat panel mobile threshold**
- `window.innerWidth <= 430` changed to `window.innerWidth < 640`
- Full-width mode now triggers at Tailwind's `sm` breakpoint (640px) — consistent with rest of responsive layout
- Resize handle already hidden when `isNarrowViewport` is true (no additional change needed)

**Task 3: Typography audit and dark mode pass**
- BriefingCard: metadata from `text-[0.8125rem]` (13px) to `text-sm` (14px), title and summary already correct
- CaughtUpState: heading from `text-base font-semibold` to `text-lg font-semibold`
- ChatPanel: "Chatting about" context metadata from `text-[0.8125rem]` to `text-sm`
- FeedTable: status bar from `text-xs` to `text-sm`
- columns.tsx: title link from `text-base font-medium` to `text-sm font-medium`
- globals.css dark mode audit: `--card: #0f0f12`, `--foreground-secondary: #d4d4d8`, `--border: #27272a`, `--muted-foreground: #a1a1aa` all confirmed correct (no changes needed)
- No `text-gray-*` or `bg-gray-*` found in any component

## Task Commits

| Task | Name | Commit |
|------|------|--------|
| 1 | Sources visual refresh with SourceAvatar and inline delete | aa67d65 |
| 2 | Chat panel full-width below 640px | 02f33f6 |
| 3 | Typography audit and dark mode pass | 6177cc6 |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] SourceAvatar.tsx created in this worktree**
- **Found during:** Task 1
- **Issue:** Plan 01 created SourceAvatar on `gsd/phase-05-ux-polish` branch but this worktree is based on `main` (e5161e8); SourceAvatar missing
- **Fix:** Created `src/components/ui/SourceAvatar.tsx` and `src/components/ui/index.ts` with identical implementation from Plan 01 git history
- **Files modified:** src/components/ui/SourceAvatar.tsx, src/components/ui/index.ts
- **Commit:** aa67d65

**2. [Rule 3 - Blocking] Pre-existing lint error in Flows.stories.tsx**
- **Found during:** Task 3 lint check
- **Issue:** Unescaped quote characters in line 289 caused `pnpm lint` to fail (pre-existing, not caused by this plan)
- **Fix:** Replaced raw `"` characters with `&quot;` HTML entities
- **Files modified:** src/components/features/briefing/stories/Flows.stories.tsx
- **Commit:** 6177cc6

## Known Stubs

None. All changes wire to real data.

## Self-Check: PASSED
