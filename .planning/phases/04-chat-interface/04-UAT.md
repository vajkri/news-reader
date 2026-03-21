---
status: complete
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
  artifacts: []
  missing: []

- truth: "Chat panel default width is 420px"
  status: failed
  reason: "User reported: default width should be 420px"
  severity: major
  test: 2
  artifacts: []
  missing: []

- truth: "Chat panel is 100% width on devices <=430px"
  status: failed
  reason: "User reported: on devices <=430px chat should be 100% width"
  severity: major
  test: 2
  artifacts: []
  missing: []

- truth: "At >=1320px viewport width, side-mode chat is embedded in the page layout, not overlaying content; resizing the panel resizes both chat and page content"
  status: failed
  reason: "User reported: starting at 1320px width side-mode should be embedded in the page not overlaying, so resizing affects both chat and content. Users on desktop need to see the table while chatting."
  severity: major
  test: 2
  artifacts: []
  missing: []

- truth: "Pressing Escape closes the chat panel when it is open"
  status: failed
  reason: "User reported: want support for closing the chat via pressing Esc"
  severity: minor
  test: 2
  artifacts: []
  missing: []

- truth: "Search tool finds articles using natural language queries that don't exactly match article titles"
  status: failed
  reason: "User reported: searching 'vite 8 release' returns nothing even though 'Vite 8 Lands, Agents Learn, GPL Looks Nervous' exists. searchArticlesTool uses Prisma contains (exact substring) which fails for natural language queries from the LLM."
  severity: blocker
  test: 5
  artifacts: []
  missing: []

- truth: "Prisma client is regenerated after schema changes so rateLimit model is available at runtime"
  status: failed
  reason: "prisma.rateLimit was undefined at runtime causing 500 error. Required manual prisma generate to fix."
  severity: blocker
  test: 5
  artifacts: []
  missing: []

- truth: "Source cards only show articles the AI actually cited in its text response, not all tool results"
  status: failed
  reason: "User reported: source cards show ALL tool results (~10) instead of only the 2 articles cited. Many are irrelevant to the question."
  severity: major
  test: 6
  artifacts: []
  missing: []

- truth: "Source cards appear after or alongside the AI text, not before it in a disjointed way"
  status: failed
  reason: "User reported: cards appear before the text response streams in, creating empty chat bubble then cards then text much later. Feels like two separate responses."
  severity: major
  test: 6
  artifacts: []
  missing: []

- truth: "ChatPanel dock position initializer does not cause hydration mismatch"
  status: failed
  reason: "User reported: useState initializer with window.innerWidth causes SSR/client mismatch. Server renders side-mode classes, client renders bottom-mode classes on mobile."
  severity: major
  test: 7
  artifacts: []
  missing: []

- truth: "On mobile-width screens the panel defaults to bottom dock mode"
  status: failed
  reason: "User reported: on mobile the panel still opens on the side instead of bottom dock"
  severity: major
  test: 7
  artifacts: []
  missing: []

- truth: "New conversation button and FAB toggle clear articleContext, returning to generic non-contextual chat"
  status: failed
  reason: "User reported: once article context is set via Chat about this, it persists forever. FAB on other pages still shows old article context. + button doesn't reset to generic chat."
  severity: major
  test: 8
  artifacts: []
  missing: []

- truth: "Article context prefix is hidden from user's chat bubble; only visible to the LLM"
  status: failed
  reason: "User reported: [Context: Discussing article ...] prefix is visible in the user's chat bubble. This is system context for the LLM, not user-facing."
  severity: major
  test: 9
  artifacts: []
  missing: []

- truth: "AI chat responses render with proper markdown formatting: bullet lists, bold, headings, structured text"
  status: failed
  reason: "User reported: dash-lists show as plain text, no real bullets, no bold, no structure. Hard to read wall of text. User has ADHD and cannot decode unformatted body text."
  severity: blocker
  test: 9
  artifacts: []
  missing: []

- truth: "Rate limit error shows specific message with minutes until reset and disables input"
  status: failed
  reason: "User reported: rate limit hit shows generic 'Something went wrong' error instead of specific rate-limit message. No input disabling."
  severity: major
  test: 10
  artifacts: []
  missing: []

- truth: "AI responses render URLs as clickable links, not raw URL strings"
  status: failed
  reason: "User reported: raw ugly URLs displayed inline in AI responses instead of proper links"
  severity: major
  test: 10
  artifacts: []
  missing: []

- truth: "AI does not hallucinate capabilities it doesn't have (e.g. notifications, web search, feed monitoring)"
  status: failed
  reason: "User reported: AI says 'Monitor the feeds and notify you if articles appear here later' which is not a real feature. System prompt needs guardrails."
  severity: major
  test: 10
  artifacts: []
  missing: []

- truth: "User chat bubble uses subtle contrast differentiation from AI bubbles, not max contrast"
  status: failed
  reason: "User reported: user bubble is white in dark mode / black in light mode, feels like screaming. Should be a subtly different shade."
  severity: cosmetic
  test: 11
  artifacts: []
  missing: []
