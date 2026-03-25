---
phase: 04-chat-interface
type: gap-closure-decisions
decided: 2026-03-22
---

# Gap Closure Decisions

Decisions made during UAT review for Phase 04 gap closure.

## D-01: Search Tool
**Choice:** Full-text search via Postgres `to_tsvector`/`plainto_tsquery` with `$queryRaw`
**Why:** Best match quality, handles stemming, built-in ranking. LLM generates natural language queries that need fuzzy matching.

## D-02: Embedded Layout (>=1320px)
**Choice:** CSS Grid with `grid-template-columns: 1fr {panelWidth}px`
**Why:** Precise control, easier to animate column changes.

## D-03: Markdown Rendering
**Choice:** `react-markdown` + `remark-gfm`
**Why:** Industry standard, handles all markdown. ~35KB gzipped. Well-maintained.

## D-04: Source Card Display
**Choice:** Hybrid: inline SourceCards in AI text + deferred "Searched N articles" toggle
**How:** Instruct AI to format citations as `[Article Title](link)`. Custom `react-markdown` link renderer swaps matching URLs into SourceCard components inline. Full tool results go behind a collapsed toggle, deferred until text completes.

## D-05: Article Context
**Choice:** System message in API route
**How:** Send `articleContext` as separate field in request body. API route injects it into system prompt server-side. User bubble shows only what they typed.

## Additional: Storybook
**Choice:** Set up minimal Storybook for ChatMessage prototyping
**Scope:** ChatMessage stories covering plain text, markdown, inline SourceCards, deferred toggle, streaming simulation. User will expand to other components later.
