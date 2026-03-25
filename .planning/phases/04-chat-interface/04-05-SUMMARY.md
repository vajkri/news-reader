---
phase: 04-chat-interface
plan: 05
subsystem: ui
tags: [react, css-grid, responsive, hydration, rate-limit, ssr]

# Dependency graph
requires:
  - phase: 04-chat-interface/03
    provides: ChatPanel, ChatWrapper, ChatInput base components
provides:
  - SSR-safe ChatPanel with no hydration mismatch
  - Responsive widths (420px default, 100% on <=430px)
  - Body scroll-lock in overlay mode
  - Escape key close handler
  - Article context clearing on new conversation
  - Rate limit error display with minutes and disabled input
  - Embedded desktop layout via CSS Grid at >=1320px
affects: [04-chat-interface]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS custom property + data attribute pattern for cross-component layout coordination"
    - "useMemo derivation for error parsing instead of synced state"
    - "Ref guard for one-time mount-only state initialization to avoid lint warnings"

key-files:
  created: []
  modified:
    - src/components/features/chat/ChatPanel.tsx
    - src/components/features/chat/ChatWrapper.tsx
    - src/app/layout.tsx
    - src/app/globals.css

key-decisions:
  - "Used useMemo for rate limit derivation instead of useEffect+setState to satisfy react-hooks/set-state-in-effect lint rule"
  - "Used ref guard for initial dock position detection to avoid synchronous setState in effect"
  - "CSS Grid embedded layout uses data attribute on html element for decoupled coordination between ChatPanel and .app-content"

patterns-established:
  - "data-chat-embedded attribute on html element drives CSS Grid layout transition"
  - "initialDockRef pattern for SSR-safe one-time client-side state initialization"

requirements-completed: [CHAT-01, CHAT-02, CHAT-03]

# Metrics
duration: 8min
completed: 2026-03-22
---

# Phase 04 Plan 05: ChatPanel Layout and State Fixes Summary

**SSR-safe chat panel with 420px default, responsive full-width on narrow viewports, embedded CSS Grid desktop layout at >=1320px, scroll-lock, Escape close, context clearing, and rate limit error display**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-22T06:59:51Z
- **Completed:** 2026-03-22T07:08:09Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- Fixed hydration mismatch by replacing window-dependent useState initializer with SSR-safe default + mount-time ref-guarded detection
- Implemented embedded desktop layout where chat panel sits beside main content in a CSS Grid at >=1320px viewport width
- Added rate limit error parsing that shows specific "try again in X minutes" message and disables input
- Escape key closes panel, new conversation and FAB toggle clear article context, body scroll locked in overlay mode

## Task Commits

Each task was committed atomically:

1. **Task 1+2+3: ChatPanel rendering fixes, state, embedded layout** - `f7aba29` (fix)
2. **Task 2+3: ChatWrapper Escape key, context clearing, embedded mode** - `9d725d2` (fix)
3. **Task 3: Embedded desktop layout via CSS Grid** - `dba57d7` (feat)

## Files Created/Modified
- `src/components/features/chat/ChatPanel.tsx` - SSR-safe dock init, 420px default, narrow viewport detection, scroll-lock, embedded mode rendering, rate limit useMemo, context clearing, dock toggle hiding
- `src/components/features/chat/ChatWrapper.tsx` - Escape key handler, embedded mode detection at 1320px, handleClearContext callback, FAB toggle context clearing
- `src/app/layout.tsx` - Wrapped main + ChatWrapper in .app-content div for CSS Grid
- `src/app/globals.css` - Body flex column, .app-content grid container, embedded chat grid rules via data attribute selector

## Decisions Made
- Used `useMemo` for rate limit derivation from error instead of `useEffect` + `setState` to satisfy the `react-hooks/set-state-in-effect` lint rule
- Used a ref guard (`initialDockRef`) for one-time mobile dock detection to avoid synchronous setState in the effect body
- CSS Grid coordination uses `document.documentElement.dataset.chatEmbedded` and `--chat-panel-width` custom property set by ChatPanel, consumed by CSS rules on `.app-content`
- `sticky top-12` positioning for embedded panel (aligns below the 3rem header) instead of fixed positioning

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed invalid useChat body option**
- **Found during:** Task 1 (build verification)
- **Issue:** Another parallel agent added `body: { articleContext }` to `useChat()` options, but `body` is not a valid option in AI SDK v6 useChat
- **Fix:** Removed the `body` option from `useChat()` call; article context is handled via `sendMessage` options instead
- **Files modified:** src/components/features/chat/ChatPanel.tsx
- **Verification:** Build passes
- **Committed in:** f7aba29

**2. [Rule 1 - Bug] Fixed react-hooks/set-state-in-effect lint errors**
- **Found during:** Task 1 (lint verification)
- **Issue:** `setDockPosition` in mount effect and `setRateLimited` in error-sync effect triggered `react-hooks/set-state-in-effect` lint rule
- **Fix:** Moved dock detection into resize listener with ref guard; replaced rateLimited state+effect with useMemo derivation
- **Files modified:** src/components/features/chat/ChatPanel.tsx
- **Verification:** Lint passes with 0 errors
- **Committed in:** f7aba29

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both fixes necessary for build/lint compliance. No scope creep.

## Issues Encountered
- Parallel agent contention: Another agent modified ChatPanel.tsx during execution, adding an invalid `body` option to `useChat()` and reverting the `useMemo` import. Both were resolved by re-reading the file and re-applying fixes.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Chat panel is fully responsive with embedded desktop layout
- All UAT layout and state issues addressed
- Ready for remaining gap closure plans (06, 07)

---
*Phase: 04-chat-interface*
*Completed: 2026-03-22*
