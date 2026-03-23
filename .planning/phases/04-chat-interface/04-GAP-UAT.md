---
status: complete
phase: 04-chat-interface
source: [04-04-SUMMARY.md, 04-05-SUMMARY.md, 04-06-SUMMARY.md, 04-07-SUMMARY.md]
started: 2026-03-22T08:45:00Z
updated: 2026-03-23T08:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Full-text search finds articles
expected: Ask "what's new with AI models?" or similar natural language query. AI finds and references relevant articles from the database.
result: issue
reported: "Loading dots disappear after a few seconds, AI bubble left empty for 45-60s until reply. Wants: Thinking.../Searching... text, 14px font in bubbles, interactive Storybook story simulating full flow."
severity: major
fix: a925f03, 043b8e6, ab442cd - Loading state, 14px font, scroll fix, FAB hide
retest: pass

### 2. Markdown rendering in AI responses
expected: AI responses render with proper formatting: bullet lists, bold text, headings, structured layout. Not raw text walls.
result: pass

### 3. Inline SourceCards for cited articles
expected: When AI cites an article by URL in its response, an inline SourceCard appears (title, source, date) instead of a plain link.
result: issue
reported: "They appear sometimes but not always. AI doesn't always include links when citing articles."
severity: minor
fix: a27a52c - System prompt requires markdown links when citing articles
retest: pass

### 4. Deferred "Searched N articles" toggle
expected: After AI finishes streaming, a collapsed "Searched N articles" toggle appears below the response. Clicking it expands to show all searched articles as SourceCards.
result: pass

### 5. System prompt guardrails
expected: Ask the AI to "set up notifications for new AI articles" or "monitor my feeds." AI should explain it cannot do that and describe what it can do instead.
result: pass

### 6. Article context via Chat about this
expected: Click "Chat about this" on a BriefingCard. Panel opens with article context. User chat bubble shows only what you typed (no [Context:...] prefix). AI's response is relevant to that specific article.
result: issue
reported: "SourceCard hydration errors (p inside p), clicking another Chat about this doesn't reset convo, context card should stay visible with messages below, AI re-introduces article redundantly, duplicate key warnings from sources"
severity: major
fix: 7a3e66a (hydration+reset), 5829df9 (context card stays), d5a07bc (no re-intro), 79bdcc3 (filter context article), 71987af (dedup sources)
retest: pass

### 7. User bubble contrast
expected: User message bubbles have subtle zinc background, not the previous max-contrast primary color. Visually distinct from AI bubbles but not jarring.
result: pass

### 8. Escape key closes panel
expected: Open the chat panel, then press Escape. Panel closes.
result: pass

### 9. Embedded desktop layout (>=1320px)
expected: At viewport widths >=1320px, opening the chat panel in side mode shows it embedded beside the main content (CSS Grid). Main content shrinks to accommodate. Not an overlay.
result: issue
reported: "Content stays same width, table cut off under chat. Grid column not controlling panel. Container uses 100dvw ignoring grid. Text selection during resize."
severity: major
fix: 67138b0 (DOM order+grid-column), a0fb93e (inline grid placement), a43fcb5 (container-width 100%), 8454867 (max 800px, no text select during resize)
retest: pass

### 10. Rate limit error display
expected: After hitting the hourly message limit, a specific error shows "You've reached the hourly message limit. Try again in X minutes." Input is disabled.
result: pass
note: Verified via Storybook RateLimitError story (d521613)

## Summary

total: 10
passed: 10
issues: 4
pending: 0
skipped: 0
blocked: 0

## Gaps
