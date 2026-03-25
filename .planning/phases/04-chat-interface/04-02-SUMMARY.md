---
phase: 04-chat-interface
plan: 02
subsystem: ui
tags: [ai-sdk, react, streaming, tool-calling, useChat, chat-ui, rate-limiting]

# Dependency graph
requires:
  - phase: 04-chat-interface
    plan: 01
    provides: "RateLimit model, checkRateLimit/incrementRateLimit, chat tools, CHAT_MODEL constant"
provides:
  - "POST /api/chat streaming route with tool-calling and rate limiting"
  - "ChatPanel dockable/resizable panel with empty states, message list, auto-scroll"
  - "ChatMessage with v6 parts-based rendering and source card extraction"
  - "ChatInput with typing change callback for chip fade"
  - "PromptChips with opacity transition"
  - "SourceCard citation card with Badge and relative date"
  - "ChatFAB floating action button"
  - "Barrel export for all chat components"
affects: [04-03-layout-integration]

# Tech tracking
tech-stack:
  added: ["@ai-sdk/react@3.0.136"]
  patterns: ["useChat() with DefaultChatTransport (default /api/chat)", "v6 tool-<toolName> part type pattern for source extraction", "streamText + toUIMessageStreamResponse server pattern"]

key-files:
  created:
    - src/app/api/chat/route.ts
    - src/components/features/chat/ChatPanel.tsx
    - src/components/features/chat/ChatMessage.tsx
    - src/components/features/chat/ChatInput.tsx
    - src/components/features/chat/PromptChips.tsx
    - src/components/features/chat/SourceCard.tsx
    - src/components/features/chat/ChatFAB.tsx
    - src/components/features/chat/index.ts
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "useChat() with no args uses DefaultChatTransport which defaults to /api/chat; v6 removed the api option from useChat directly"
  - "convertToModelMessages returns a Promise in v6; must be awaited"
  - "Tool parts in v6 use type tool-<toolName> with state output-available and output field, not tool-invocation with result"
  - "Dock position initialized via useState initializer function instead of useEffect to avoid lint set-state-in-effect error"

patterns-established:
  - "v6 useChat pattern: useChat() with no options for default /api/chat endpoint"
  - "v6 tool result extraction: check part.type starts with tool- prefix, state === output-available, read output field"
  - "Chat panel dock toggle: useState initializer with window.innerWidth check for SSR safety"

requirements-completed: [CHAT-01, CHAT-02]

# Metrics
duration: 7min
completed: 2026-03-21
---

# Phase 04 Plan 02: Chat API Route and UI Components Summary

**Streaming chat API route with streamText + tool-calling + rate limiting, and 6 UI components (ChatPanel, ChatMessage, ChatInput, PromptChips, SourceCard, ChatFAB) using AI SDK v6 useChat hook**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-21T20:56:56Z
- **Completed:** 2026-03-21T21:04:22Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- POST /api/chat route streams responses via streamText with 3 tools (searchArticles, articlesByTopic, recentArticles), rate limiting, and 10-turn history
- ChatPanel with dockable side/bottom layout, resize handle, generic and contextual empty states, auto-scroll, loading dots, error display
- All 6 chat components built with proper 'use client' directives, focus-visible accessibility, Button component usage (no raw buttons)
- @ai-sdk/react installed; useChat v6 API used with sendMessage (not deprecated append/handleSubmit)
- Full test suite (44/44) and build pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Chat API route with streaming, tool-calling, and rate limiting** - `90a25f4` (feat)
2. **Task 2: Install @ai-sdk/react and build all chat UI components** - `b26e032` (feat)

## Files Created/Modified
- `src/app/api/chat/route.ts` - POST handler: streamText + convertToModelMessages + stopWhen + toUIMessageStreamResponse
- `src/components/features/chat/ChatPanel.tsx` - Dockable panel with useChat, resize, empty states, message rendering
- `src/components/features/chat/ChatMessage.tsx` - User/assistant bubbles with v6 parts-based text extraction
- `src/components/features/chat/ChatInput.tsx` - Text input with send button and typing change callback
- `src/components/features/chat/PromptChips.tsx` - Clickable chip set with opacity fade transition
- `src/components/features/chat/SourceCard.tsx` - Citation card with Badge, relative date, focus-visible ring
- `src/components/features/chat/ChatFAB.tsx` - Floating action button with Sparkles/X toggle
- `src/components/features/chat/index.ts` - Barrel export for all 6 components
- `package.json` - Added @ai-sdk/react dependency
- `package-lock.json` - Lock file updated

## Decisions Made
- useChat() called with no args: v6 removed the `api` option; DefaultChatTransport defaults to `/api/chat`
- `convertToModelMessages` returns a Promise in v6, requiring `await` (auto-fixed during build verification)
- Tool part extraction uses v6 `tool-<toolName>` type pattern with `state: 'output-available'` and `output` field (not the removed `tool-invocation` type)
- Dock position set via useState initializer function (not useEffect + setState) to satisfy React lint rules

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] convertToModelMessages requires await in v6**
- **Found during:** Task 1 (Chat API route)
- **Issue:** `convertToModelMessages()` returns `Promise<ModelMessage[]>` in AI SDK v6, not a synchronous array
- **Fix:** Added `await` before `convertToModelMessages(messages.slice(-10))`
- **Files modified:** src/app/api/chat/route.ts
- **Verification:** Build passes
- **Committed in:** 90a25f4

**2. [Rule 1 - Bug] useChat api option removed in v6**
- **Found during:** Task 2 (ChatPanel)
- **Issue:** `api` property no longer exists on UseChatOptions in AI SDK v6; transport uses DefaultChatTransport
- **Fix:** Removed `{ api: '/api/chat' }` option; called `useChat()` with no args (defaults to /api/chat)
- **Files modified:** src/components/features/chat/ChatPanel.tsx
- **Verification:** Build passes
- **Committed in:** b26e032

**3. [Rule 1 - Bug] tool-invocation part type removed in v6**
- **Found during:** Task 2 (ChatPanel source extraction)
- **Issue:** v6 uses `tool-<toolName>` (e.g., `tool-searchArticles`) instead of `tool-invocation`, and `output` instead of `result`
- **Fix:** Updated extractSources to check for `tool-searchArticles`, `tool-articlesByTopic`, `tool-recentArticles` types with `state === 'output-available'`
- **Files modified:** src/components/features/chat/ChatPanel.tsx
- **Verification:** Build passes
- **Committed in:** b26e032

**4. [Rule 3 - Blocking] useState initializer for dock position**
- **Found during:** Task 2 (ChatPanel lint)
- **Issue:** `setDockPosition()` inside useEffect triggers React lint error (set-state-in-effect)
- **Fix:** Used useState initializer function `() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'bottom' : 'side'`
- **Files modified:** src/components/features/chat/ChatPanel.tsx
- **Verification:** Lint passes (0 errors in chat files)
- **Committed in:** b26e032

---

**Total deviations:** 4 auto-fixed (3 bugs, 1 blocking)
**Impact on plan:** All auto-fixes necessary for AI SDK v6 compatibility and lint compliance. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Chat API route and all UI components are ready for layout integration (Plan 03)
- ChatPanel, ChatFAB need to be rendered in layout.tsx as overlay siblings
- BriefingCard needs "Chat about this" button wiring to ChatPanel articleContext prop
- Cmd+K keyboard shortcut belongs in the layout-level component that owns isOpen state

## Self-Check: PASSED

All 8 created files verified present. Both commit hashes (90a25f4, b26e032) found in git log.
