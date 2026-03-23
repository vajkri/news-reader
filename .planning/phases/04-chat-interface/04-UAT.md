---
status: resolved
phase: 04-chat-interface
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03 commit 372cd60]
started: 2026-03-21T21:30:00Z
updated: 2026-03-21T21:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. FAB Visibility
expected: A floating action button with a sparkle icon is visible in the bottom-right corner of the page. It appears on all pages (Feed, Briefing, Sources).
result: pass

### 2. Panel Open/Close
expected: Clicking the FAB opens a chat panel that slides in from the right. The panel has a header with a close (X) button. Clicking X closes the panel with a slide-out animation.
result: issue
reported: "Multiple layout issues: (a) body needs scroll-lock when chat is open in side-mode on mobile, (b) default width should be 420px, (c) on devices <=430px chat should be 100% width, (d) starting at 1320px width side-mode should be embedded in the page not overlaying so resizing affects both chat and content, (e) users on desktop need to see the table while chatting"
severity: major

### 3. Keyboard Shortcut
expected: Pressing Cmd+K (Mac) or Ctrl+K (Windows/Linux) toggles the chat panel open and closed from any page.
result: pass

### 4. Empty State
expected: When the panel opens with no article context, it shows an icon, "Ask about your news" heading, descriptive sub-copy, and 4 prompt chips ("What's new with Claude?", "Top stories today", "Developer tools this week", "Summarize model releases").
result: pass

### 5. Send Message and Streaming
expected: Clicking a prompt chip or typing a question and pressing Enter/clicking send triggers a response. Loading dots appear while waiting. The response streams in progressively (text appears word by word).
result: issue
reported: "Chat can't find articles that exist in the database. Searching 'vite 8 release' returns nothing even though 'Vite 8 Lands, Agents Learn, GPL Looks Nervous' exists. The searchArticlesTool uses Prisma contains (exact substring) instead of full-text search, so the LLM's natural language queries rarely match article titles. Also required prisma generate to fix initial 500 error (prisma.rateLimit undefined)."
severity: blocker

### 6. Source Cards
expected: When the AI response references articles, source cards appear below the message showing article title, source name, and relative date. Clicking a source card opens the article link in a new tab.
result: issue
reported: "Source cards show ALL tool results (~10) instead of only the articles the AI actually cited in its text. Cards appear before the text response streams in, creating a confusing disjointed experience (empty chat bubble, then cards, then text fills in much later). Many cards are irrelevant to the question asked (e.g. Flutter, Go articles for a Claude question). Feels like two separate responses."
severity: major

### 7. Panel Dock and Resize
expected: The panel can be toggled between side (right) and bottom dock positions. A resize handle on the left edge of the side panel allows dragging to change width. On mobile-width screens, the panel defaults to bottom dock.
result: issue
reported: "Hydration mismatch error on mobile: useState initializer uses window.innerWidth which doesn't exist during SSR, causing server/client HTML diff (side vs bottom dock classes). Also on mobile the panel still opens in side-mode instead of defaulting to bottom dock."
severity: major

### 8. New Conversation
expected: The panel header has a Plus (+) button. Clicking it clears the current conversation and returns to the empty state with prompt chips.
result: issue
reported: "Clear conversation button clears messages but does not clear articleContext. Once an article context is set via 'Chat about this', it persists forever: clicking the FAB on other pages still shows the old article context, and the + button doesn't reset to a non-contextual generic chat."
severity: major

### 9. Chat About This (Briefing Page)
expected: On the /briefing page, each BriefingCard has a "Chat about this" ghost button with a message icon. Clicking it opens the chat panel with a pinned context card showing the article title, source, and date. Contextual prompt chips appear ("Summarize this article", "Why does this matter?", etc.) and the input placeholder says "Ask anything about this article...".
result: issue
reported: "Three issues: (a) The [Context: Discussing article ...] prefix is visible in the user's chat bubble after clicking a prompt chip or typing. This is system context for the LLM, not user-facing. (b) AI response has no markdown rendering: dash-lists show as plain text, no real bullets, no bold, no structure. Hard to read wall of text. (c) Same streaming cohesion issue as Test 5/6 with source cards appearing before text."
severity: major

### 10. Rate Limiting
expected: After sending 20 messages within an hour (or temporarily lowering MAX_MESSAGES for testing), an error message appears saying "You've reached the hourly message limit. Try again in N minutes." and the input becomes disabled.
result: issue
reported: "Rate limit hit shows generic 'Something went wrong. Refresh the page or try again in a moment.' instead of a specific rate-limit message with minutes until reset. No input disabling. Also: (a) AI responses show raw ugly URLs inline instead of proper links, (b) AI hallucinates capabilities like 'Monitor the feeds and notify you if articles appear here later' which is not a real feature."
severity: major

### 11. Dark Mode
expected: Toggle system dark mode preference. The chat panel, FAB, messages, source cards, and prompt chips all render with correct dark mode colors matching the design system (dark backgrounds, light text, proper contrast).
result: issue
reported: "User chat bubble has way too much contrast: white in dark mode and black in light mode feels like it's screaming. Should be a subtly different shade from AI bubbles, not max contrast."
severity: cosmetic

## Summary

total: 11
passed: 3
issues: 8
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Body receives scroll-lock when chat panel is open in side-mode on mobile"
  status: failed
  reason: "User reported: body needs scroll-lock when chat is open in side-mode on mobile"
  severity: major
  test: 2
  root_cause: "ChatPanel.tsx has no effect that toggles `overflow: hidden` on `document.body` when the panel is open. The panel overlays the page with `position: fixed` but the body remains scrollable underneath."
  artifacts: [src/components/features/chat/ChatPanel.tsx]
  missing: ["useEffect in ChatPanel that sets `document.body.style.overflow = 'hidden'` when `isOpen && dockPosition === 'side'` on mobile viewports, and restores on cleanup"]

- truth: "Chat panel default width is 420px"
  status: failed
  reason: "User reported: default width should be 420px"
  severity: major
  test: 2
  root_cause: "ChatPanel.tsx line 104 initializes `panelWidth` state to 350 instead of 420: `const [panelWidth, setPanelWidth] = useState(350)`"
  artifacts: [src/components/features/chat/ChatPanel.tsx]
  missing: ["Change useState(350) to useState(420) on line 104"]

- truth: "Chat panel is 100% width on devices <=430px"
  status: failed
  reason: "User reported: on devices <=430px chat should be 100% width"
  severity: major
  test: 2
  root_cause: "ChatPanel.tsx applies a fixed pixel width via `panelStyle` for side-mode with no responsive override. There is no CSS media query or JS check to force 100% width on narrow viewports (<=430px)."
  artifacts: [src/components/features/chat/ChatPanel.tsx]
  missing: ["Width logic that detects viewport <=430px and sets width to '100%' instead of the pixel value. Either a CSS media query override or a JS condition in panelStyle computation."]

- truth: "At >=1320px viewport width, side-mode chat is embedded in the page layout, not overlaying content; resizing the panel resizes both chat and page content"
  status: failed
  reason: "User reported: starting at 1320px width side-mode should be embedded in the page not overlaying, so resizing affects both chat and content. Users on desktop need to see the table while chatting."
  severity: major
  test: 2
  root_cause: "ChatPanel uses `position: fixed` unconditionally for side-mode (line 177). There is no embedded/inline layout mode. The panel always overlays page content regardless of viewport width. No mechanism exists to shrink the main content area when the chat is open."
  artifacts: [src/components/features/chat/ChatPanel.tsx, src/components/features/chat/ChatWrapper.tsx, "page layout components that wrap main content"]
  missing: ["An embedded layout mode for >=1320px viewports where: (1) ChatPanel uses relative/flex positioning instead of fixed, (2) the main page content area shrinks by the panel width (e.g. via CSS margin-right or flex layout), (3) ChatWrapper or a layout parent coordinates the embedded vs overlay modes. This is a structural layout change requiring coordination between the chat panel and the page shell."]

- truth: "Pressing Escape closes the chat panel when it is open"
  status: failed
  reason: "User reported: want support for closing the chat via pressing Esc"
  severity: minor
  test: 2
  root_cause: "ChatWrapper.tsx only listens for Cmd+K / Ctrl+K (lines 18-25). No keydown listener exists for the Escape key."
  artifacts: [src/components/features/chat/ChatWrapper.tsx]
  missing: ["Add `e.key === 'Escape'` check to the existing keydown handler in ChatWrapper that calls `setIsOpen(false)` when the panel is open"]

- truth: "Search tool finds articles using natural language queries that don't exactly match article titles"
  status: failed
  reason: "User reported: searching 'vite 8 release' returns nothing even though 'Vite 8 Lands, Agents Learn, GPL Looks Nervous' exists. searchArticlesTool uses Prisma contains (exact substring) which fails for natural language queries from the LLM."
  severity: blocker
  test: 5
  root_cause: "chat-tools.ts searchArticlesTool (line 49-62) uses `prisma.article.findMany` with `{ contains: query, mode: 'insensitive' }`. This is exact substring matching: 'vite 8 release' must appear verbatim in the title. The LLM generates natural language queries ('vite 8 release') that don't match editorial titles ('Vite 8 Lands...'). Multi-word queries fail because `contains` treats the whole string as one substring. SEED-001 already documents this as a known limitation requiring Postgres full-text search."
  artifacts: [src/lib/chat-tools.ts]
  missing: ["Replace Prisma `contains` with Postgres full-text search using `to_tsvector`/`plainto_tsquery` and the `@@` operator (requires `$queryRaw` or `$queryRawUnsafe` since Prisma doesn't natively support `@@`). Alternatively, split the query into individual words and search with AND/OR conditions. SEED-001 has the full design."]

- truth: "Prisma client is regenerated after schema changes so rateLimit model is available at runtime"
  status: failed
  reason: "prisma.rateLimit was undefined at runtime causing 500 error. Required manual prisma generate to fix."
  severity: blocker
  test: 5
  root_cause: "package.json `dev` script is just `next dev` (line 6). After adding the RateLimit model to the Prisma schema and running a migration, the Prisma client was not regenerated automatically. `prisma generate` only runs on `postinstall` (npm install) and `build` (line 7). A developer running `npm run dev` after a schema change without `npm install` or manual `prisma generate` gets a stale client."
  artifacts: [package.json]
  missing: ["Add `prisma generate` to the `dev` script: `\"dev\": \"prisma generate && next dev\"`. This ensures the Prisma client is always in sync with the schema when starting dev server."]

- truth: "Source cards only show articles the AI actually cited in its text response, not all tool results"
  status: failed
  reason: "User reported: source cards show ALL tool results (~10) instead of only the 2 articles cited. Many are irrelevant to the question."
  severity: major
  test: 6
  root_cause: "ChatPanel.tsx `extractSources` (lines 63-92) extracts ALL articles from ALL tool result parts indiscriminately. It iterates every tool part with `state === 'output-available'` and pushes every article into the sources array. There is no cross-referencing with the AI's text response to filter to only cited articles."
  artifacts: [src/components/features/chat/ChatPanel.tsx, src/components/features/chat/ChatMessage.tsx]
  missing: ["Filter logic that compares tool result article titles against the text content of the assistant message. Only include sources whose title (or a substring/fuzzy match) appears in the assistant's text parts. Alternatively, let the AI explicitly return which articles it cited via a structured output."]

- truth: "Source cards appear after or alongside the AI text, not before it in a disjointed way"
  status: failed
  reason: "User reported: cards appear before the text response streams in, creating empty chat bubble then cards then text much later. Feels like two separate responses."
  severity: major
  test: 6
  root_cause: "The AI SDK streaming flow sends tool results before the final text response (tool-call -> tool-result -> text generation). ChatMessage renders sources immediately when tool parts have `state: 'output-available'`, which happens before text parts are streamed. ChatMessage.tsx renders sources unconditionally below the text div (lines 39-50), so they appear as soon as tool results arrive while the text bubble is still empty."
  artifacts: [src/components/features/chat/ChatMessage.tsx, src/components/features/chat/ChatPanel.tsx]
  missing: ["Defer source card rendering until the text response is complete (status !== 'streaming'), or render sources inline after text content exists. Could check if text parts have content before showing sources, or wait until the message is finalized."]

- truth: "ChatPanel dock position initializer does not cause hydration mismatch"
  status: failed
  reason: "User reported: useState initializer with window.innerWidth causes SSR/client mismatch. Server renders side-mode classes, client renders bottom-mode classes on mobile."
  severity: major
  test: 7
  root_cause: "ChatPanel.tsx line 101-103: `useState<'side' | 'bottom'>(() => typeof window !== 'undefined' && window.innerWidth < 768 ? 'bottom' : 'side')`. During SSR, `typeof window` is `'undefined'`, so the server always picks `'side'`. On a mobile client, `window.innerWidth < 768` evaluates to true, picking `'bottom'`. The server HTML has side-mode classes, client hydration has bottom-mode classes, causing a React hydration mismatch."
  artifacts: [src/components/features/chat/ChatPanel.tsx]
  missing: ["Initialize state to a consistent SSR-safe default (e.g. always 'side'), then use a useEffect to detect mobile width and update to 'bottom' after mount. This avoids the hydration mismatch by ensuring server and client render the same initial value."]

- truth: "On mobile-width screens the panel defaults to bottom dock mode"
  status: failed
  reason: "User reported: on mobile the panel still opens on the side instead of bottom dock"
  severity: major
  test: 7
  root_cause: "Same root cause as the hydration mismatch gap. Because SSR always defaults to 'side' and the useState initializer with window check causes hydration errors, the fix for hydration (consistent SSR default) must also include a post-mount useEffect that sets 'bottom' on mobile. Currently even the client-side check doesn't reliably work due to the hydration conflict."
  artifacts: [src/components/features/chat/ChatPanel.tsx]
  missing: ["A useEffect that runs after mount, checks `window.innerWidth < 768`, and calls `setDockPosition('bottom')` if true. Combined with SSR-safe default of 'side', this solves both the hydration mismatch and the mobile default."]

- truth: "New conversation button and FAB toggle clear articleContext, returning to generic non-contextual chat"
  status: failed
  reason: "User reported: once article context is set via Chat about this, it persists forever. FAB on other pages still shows old article context. + button doesn't reset to generic chat."
  severity: major
  test: 8
  root_cause: "ChatWrapper.tsx owns `articleContext` state (line 9-14). ChatPanel.tsx `handleNewConversation` (line 163-165) only calls `setMessages([])` to clear messages. It has no callback to clear `articleContext` in the parent. ChatPanel receives `articleContext` as a read-only prop with no `onClearContext` callback. ChatWrapper never calls `setArticleContext(null)` except when a new 'chat-about-this' event fires."
  artifacts: [src/components/features/chat/ChatWrapper.tsx, src/components/features/chat/ChatPanel.tsx]
  missing: ["ChatWrapper needs to pass an `onClearContext` callback (that calls `setArticleContext(null)`) to ChatPanel. ChatPanel's `handleNewConversation` must call both `setMessages([])` and `onClearContext()`. The FAB toggle should also clear context when opening a fresh panel (or at minimum, the + button must reset it)."]

- truth: "Article context prefix is hidden from user's chat bubble; only visible to the LLM"
  status: failed
  reason: "User reported: [Context: Discussing article ...] prefix is visible in the user's chat bubble. This is system context for the LLM, not user-facing."
  severity: major
  test: 9
  root_cause: "ChatPanel.tsx `handleSend` (lines 143-154) prepends `[Context: Discussing article \"...\"] ` directly into the user message text sent to the AI SDK. The AI SDK stores this as the message content, so ChatMessage renders the full string including the context prefix in the user bubble. The context is baked into `msg.parts[].text`, not sent as a separate system message."
  artifacts: [src/components/features/chat/ChatPanel.tsx, src/app/api/chat/route.ts]
  missing: ["Move article context out of the user message text. Options: (1) Send context as a system message in the API route by reading an articleContext field from the request body, (2) Use the AI SDK's system message support to inject context, (3) If keeping inline, strip the `[Context: ...]` prefix from display in ChatMessage. Option 1 or 2 is the clean approach."]

- truth: "AI chat responses render with proper markdown formatting: bullet lists, bold, headings, structured text"
  status: failed
  reason: "User reported: dash-lists show as plain text, no real bullets, no bold, no structure. Hard to read wall of text. User has ADHD and cannot decode unformatted body text."
  severity: blocker
  test: 9
  root_cause: "ChatMessage.tsx line 37 renders text content with a plain `<p>` tag and `whitespace-pre-wrap`. No markdown parsing library is installed or used. The AI returns markdown-formatted text (dashes, asterisks, etc.) but it is rendered as raw text. Neither `react-markdown` nor any markdown library exists in package.json."
  artifacts: [src/components/features/chat/ChatMessage.tsx, package.json]
  missing: ["Install `react-markdown` (and optionally `remark-gfm` for tables/strikethrough). Replace the `<p>` tag in ChatMessage with `<ReactMarkdown>` component. Add prose styling (e.g. Tailwind `prose` class or custom styles) for headings, lists, bold, links, code blocks."]

- truth: "Rate limit error shows specific message with minutes until reset and disables input"
  status: failed
  reason: "User reported: rate limit hit shows generic 'Something went wrong' error instead of specific rate-limit message. No input disabling."
  severity: major
  test: 10
  root_cause: "The API route (route.ts lines 30-34) correctly returns a 429 JSON response with `{ error: 'rate_limited', retryAfterMinutes }`. However, ChatPanel.tsx uses `useChat()` which surfaces all errors as a generic `error` object (line 99). The error display (lines 359-365) renders a hardcoded generic message: 'Something went wrong. Refresh the page or try again in a moment.' There is no parsing of the error response to detect 429/rate_limited status, no extraction of `retryAfterMinutes`, and no logic to disable the ChatInput when rate-limited."
  artifacts: [src/components/features/chat/ChatPanel.tsx, src/components/features/chat/ChatInput.tsx]
  missing: ["Parse the `error` from useChat to detect rate limit responses (check error.status === 429 or parse error.message for rate_limited). Display a specific message like 'You have reached the hourly message limit. Try again in N minutes.' Set a `rateLimited` state that disables ChatInput via the `disabled` prop until the window resets."]

- truth: "AI responses render URLs as clickable links, not raw URL strings"
  status: failed
  reason: "User reported: raw ugly URLs displayed inline in AI responses instead of proper links"
  severity: major
  test: 10
  root_cause: "Same root cause as the markdown rendering gap. ChatMessage.tsx renders all text as plain `<p>` with no markdown processing. The AI returns URLs as markdown links `[text](url)` or raw URLs, but without a markdown renderer they display as raw strings. Even if the AI uses markdown link syntax, it renders as literal `[text](url)` text."
  artifacts: [src/components/features/chat/ChatMessage.tsx, package.json]
  missing: ["Installing and using `react-markdown` in ChatMessage (same fix as the markdown rendering gap) will automatically convert markdown links and raw URLs into clickable `<a>` elements. Add `rehype-autolink-headings` or URL auto-linking if the AI outputs bare URLs without markdown syntax."]

- truth: "AI does not hallucinate capabilities it doesn't have (e.g. notifications, web search, feed monitoring)"
  status: failed
  reason: "User reported: AI says 'Monitor the feeds and notify you if articles appear here later' which is not a real feature. System prompt needs guardrails."
  severity: major
  test: 10
  root_cause: "The SYSTEM_PROMPT in route.ts (lines 12-22) instructs the AI to only use tool results and not fabricate news, but it lacks explicit guardrails about the application's capabilities. The prompt says nothing about what the system cannot do. Without negative constraints, the LLM infers capabilities (monitoring, notifications, web search) that don't exist."
  artifacts: [src/app/api/chat/route.ts]
  missing: ["Add explicit negative guardrails to SYSTEM_PROMPT listing capabilities the system does NOT have. E.g.: 'You CANNOT: set up notifications or alerts, monitor feeds in real-time, search the web, access external URLs, or perform any action outside of searching the article database. If asked to do something outside your capabilities, explain what you can do instead.'"]

- truth: "User chat bubble uses subtle contrast differentiation from AI bubbles, not max contrast"
  status: failed
  reason: "User reported: user bubble is white in dark mode / black in light mode, feels like screaming. Should be a subtly different shade."
  severity: cosmetic
  test: 11
  root_cause: "ChatMessage.tsx line 33 uses `bg-[var(--primary)] text-[var(--primary-foreground)]` for user bubbles. In globals.css, `--primary` is `#18181b` (near-black) in light mode and `#fafafa` (near-white) in dark mode. `--primary-foreground` is the inverse. This creates maximum contrast bubbles: black-on-white in light mode, white-on-black in dark mode. The design intent was for `--primary` to be an accent color, but it's being used as the dominant user bubble background."
  artifacts: [src/components/features/chat/ChatMessage.tsx, src/app/globals.css]
  missing: ["Replace user bubble colors with a subtler differentiation. Options: (1) Use `bg-[var(--muted)]` or `bg-[var(--secondary)]` with `text-[var(--foreground)]` for a gentle distinction from AI bubbles, (2) Create dedicated chat bubble tokens like `--chat-user-bg` / `--chat-user-fg` with subtle values (e.g. zinc-100 light / zinc-800 dark), (3) Use a tinted version of the background color."]
