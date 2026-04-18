---
phase: 05-ux-polish
plan: 04
subsystem: ui
tags: [responsive, mobile, accessibility, tailwind, briefing, feed, sources, chat, nav]

# Dependency graph
requires:
  - phase: 05-02
    provides: Feed mobile list, SourceAvatar, TopicIcon, feed watermark NEW badges
  - phase: 05-03
    provides: Typography/dark mode audit, TriageSection, FeedbackButtons

provides:
  - Mobile-responsive briefing page (all 5 states at 375px)
  - 44px touch targets on DateStepper buttons
  - Holistic design audit applied across feed, briefing, sources, chat, nav

affects: [future ui phases, phase-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mobile-first padding: pl-4 sm:pl-6 pattern for left-border cards"
    - "Responsive date label: abbreviated MMM d on mobile, MMM d yyyy on desktop"
    - "Touch target expansion: min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
    - "Inline error state: replace alert() with role=alert paragraph + state variable"

key-files:
  created: []
  modified:
    - src/components/features/briefing/BriefingCard.tsx
    - src/components/features/briefing/DateStepper.tsx
    - src/components/features/briefing/StatusBar.tsx
    - src/components/features/briefing/CaughtUpState.tsx
    - src/components/features/briefing/ArchiveBanner.tsx
    - src/app/briefing/page.tsx
    - src/components/features/feed/FeedTable.tsx
    - src/components/features/feed/FeedMobileList.tsx
    - src/components/features/feed/columns.tsx
    - src/components/features/layout/NavLinks.tsx
    - src/components/features/sources/SourceList.tsx

key-decisions:
  - "BriefingCard uses pl-4 sm:pl-6 (16px mobile / 24px desktop) to prevent cramping at 375px"
  - "DateStepper buttons get min-h/w-[44px] overridden at sm: to restore desktop icon size"
  - "CaughtUpState copy changed to 'You are caught up.' per UI-SPEC copywriting contract"
  - "ArchiveBanner copy changed to 'Viewing archive: {date}' per UI-SPEC"
  - "SourceList alert() replaced with inline role=alert error state"
  - "NavLinks desktop links gain focus-visible:outline styles for keyboard accessibility"
  - "FeedTable/FeedMobileList/columns: error text uses --destructive token; links get focus-visible outlines"

requirements-completed:
  - UX-01
  - UX-02

# Metrics
duration: 15min
completed: 2026-04-03
---

# Phase 05 Plan 04: Briefing Mobile Polish and Holistic Audit Summary

**Briefing page mobile-polished for all 5 states (375px), touch targets expanded to 44px, holistic design audit applied across all views fixing token inconsistencies, missing focus-visible styles, and alert() antipattern**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-03T10:02:00Z
- **Completed:** 2026-04-03T10:14:18Z
- **Tasks completed:** 2 of 3 (Task 3 is visual checkpoint, awaiting user approval)
- **Files modified:** 11

## Accomplishments

- BriefingCard mobile: `pl-4 sm:pl-6` padding, `flex-wrap` on badge/title rows, `min-w-0` on title heading
- DateStepper: 44px touch targets on mobile, abbreviated date label (`MMM d` vs `MMM d, yyyy`) to fit narrow screens
- StatusBar: `flex-col sm:flex-row` wrapping for mobile
- CaughtUpState: copy aligned to UI-SPEC ("You are caught up.")
- ArchiveBanner: copy aligned to UI-SPEC ("Viewing archive: {date}")
- FeedTable: error text uses `text-(--destructive)` token (was hardcoded `text-red-600 dark:text-red-400`)
- SourceList: `alert()` replaced with inline `role="alert"` error state; added `onDeleteError` callback prop
- NavLinks: `focus-visible:outline` added to desktop nav links
- columns.tsx + FeedMobileList: article links gain `focus-visible:outline` styles
- briefing/page.tsx: `flex-wrap gap-4` on header container for overflow safety

## 5 Briefing States Audit

All 5 states verified against design system:

| State | Components | Mobile-safe |
|-------|-----------|-------------|
| Morning visit (new articles) | SectionDivider + TopicGroups with isNew + reviewed | Yes: pl-4 padding, flex-wrap |
| Evening visit (mixed) | Both new + reviewed sections with SectionDivider | Yes: same as morning |
| Caught up | CaughtUpState (centered py-12) | Yes: text-center, no fixed widths |
| Archive | ArchiveBanner + TopicGroups (no feedback) | Yes: flex items-start, text truncates |
| Pending enrichment | PendingSection (truncate on titles, min-w-0) | Yes: truncate already present |

## Task Commits

1. **Task 1: Briefing mobile polish and all-states audit** - `e78843f` (feat)
2. **Task 2: Holistic frontend-design audit across all views** - `726ab84` (fix)
3. **Task 3: Visual verification checkpoint** - pending user approval

## Files Created/Modified

- `src/components/features/briefing/BriefingCard.tsx` - pl-4 sm:pl-6, flex-wrap on badge/title rows
- `src/components/features/briefing/DateStepper.tsx` - 44px touch targets, abbreviated mobile date
- `src/components/features/briefing/StatusBar.tsx` - flex-col sm:flex-row mobile wrapping
- `src/components/features/briefing/CaughtUpState.tsx` - copy fix per UI-SPEC
- `src/components/features/briefing/ArchiveBanner.tsx` - copy fix per UI-SPEC
- `src/app/briefing/page.tsx` - flex-wrap gap-4 on header
- `src/components/features/feed/FeedTable.tsx` - error text uses --destructive token
- `src/components/features/feed/FeedMobileList.tsx` - focus-visible on article link
- `src/components/features/feed/columns.tsx` - focus-visible on article title link
- `src/components/features/layout/NavLinks.tsx` - focus-visible on desktop nav links
- `src/components/features/sources/SourceList.tsx` - inline error state replaces alert()

## Decisions Made

- `pl-4 sm:pl-6` chosen over `pl-5 sm:pl-6` to give 16px on mobile (spec allows `md=16px` for card padding)
- `min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0` pattern cleanly resets to default icon size at sm breakpoint
- SourceList gets an `onDeleteError` callback as an optional prop so the parent (sources page) can also react to delete failures if needed
- `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) rounded-sm` applied consistently to all plain `<a>` tags and nav links that lacked it

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Replaced alert() in SourceList with inline error state**
- **Found during:** Task 2 (holistic audit)
- **Issue:** `alert()` is an anti-pattern — blocks UI thread, inaccessible, inconsistent with design system
- **Fix:** Added `deleteError` state + inline `<p role="alert">` using `text-(--destructive)` token; added optional `onDeleteError` callback
- **Files modified:** `src/components/features/sources/SourceList.tsx`
- **Verification:** Build passes, lint passes
- **Committed in:** `726ab84` (Task 2 commit)

**2. [Rule 2 - Missing Critical] Added focus-visible styles to plain anchor links**
- **Found during:** Task 2 (holistic audit)
- **Issue:** Article title links in columns.tsx and FeedMobileList, plus NavLinks desktop links, had no `focus-visible` styles - violates WCAG 2.2 AA keyboard accessibility requirement
- **Fix:** Added `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) rounded-sm` to all affected links
- **Files modified:** `src/components/features/feed/columns.tsx`, `src/components/features/feed/FeedMobileList.tsx`, `src/components/features/layout/NavLinks.tsx`
- **Verification:** Build passes, lint passes
- **Committed in:** `726ab84` (Task 2 commit)

**3. [Rule 2 - Missing Critical] Copywriting contract violations fixed**
- **Found during:** Task 2 (holistic audit)
- **Issue:** CaughtUpState used "You're all caught up" (UI-SPEC requires "You are caught up."); ArchiveBanner used "Archive:" prefix (UI-SPEC requires "Viewing archive:")
- **Fix:** Updated copy in both components per UI-SPEC copywriting contract
- **Files modified:** `src/components/features/briefing/CaughtUpState.tsx`, `src/components/features/briefing/ArchiveBanner.tsx`
- **Committed in:** `e78843f` (Task 1 commit), `726ab84` (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 Rule 1 bug, 2 Rule 2 missing critical)
**Impact on plan:** All fixes necessary for correctness, accessibility, and spec compliance. No scope creep.

## Design Audit Findings

### Feed
- FeedTable: error token inconsistency fixed (hardcoded colors -> --destructive)
- FeedMobileList: focus-visible added to article link
- columns.tsx: focus-visible added to title link
- FeedToolbar: no issues found; flex-wrap already correct
- All buttons use `Button` component
- All focus states use `focus-visible:` (pre-existing + new fixes)

### Briefing
- BriefingCard: mobile padding improved, flex-wrap added
- DateStepper: touch targets expanded
- StatusBar: mobile flex-col wrapping added
- CaughtUpState: copy aligned to spec
- ArchiveBanner: copy aligned to spec
- PendingSection: overflow protection already present (truncate, min-w-0)
- TriageSection: no issues found; uses Button component, correct tokens
- SectionDivider: no issues found

### Sources
- SourceList: alert() replaced with inline error; rest looks correct
- SourceForm: flex-wrap on form row already present; no issues found

### Chat
- ChatPanel: no issues found; SourcesToggle uses raw button intentionally (documented in codebase)
- ChatMessage: no issues found; uses design tokens throughout
- PromptChips: no issues found; uses Button component

### Nav
- NavLinks: focus-visible added to desktop links
- HamburgerMenu: focus-visible on X button via Button component (inherits); link items use plain Link but have py-3 px-4 visible focus area

## Known Stubs

None.

## Next Phase Readiness

- All UX polish code changes complete (Tasks 1 and 2)
- Awaiting visual verification checkpoint (Task 3) from user
- After visual approval, Phase 5 UX Polish is complete

---
*Phase: 05-ux-polish*
*Completed: 2026-04-03*
