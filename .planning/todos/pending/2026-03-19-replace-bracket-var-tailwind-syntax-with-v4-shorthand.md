---
created: 2026-03-19T14:31:02.545Z
title: Replace bracket-var Tailwind syntax with v4 shorthand
area: ui
files:
  - src/components/ui/button.tsx
  - src/components/ui/input.tsx
  - src/components/ui/select.tsx
  - src/components/ui/badge.tsx
  - src/components/feed/FeedToolbar.tsx
  - src/components/feed/FeedTable.tsx
  - src/components/feed/columns.tsx
  - src/components/sources/SourceList.tsx
  - src/app/layout.tsx
  - src/app/sources/page.tsx
---

## Problem

All source files use the old arbitrary-value bracket syntax for CSS variable references in Tailwind classes: `border-[var(--border)]`, `bg-[var(--muted)]`, `text-[var(--foreground)]`, etc. Tailwind v4 supports a cleaner parenthetical shorthand: `border-(--border)`, `bg-(--muted)`, `text-(--foreground)`.

~60 occurrences across 10 source files (UI primitives, feed components, sources, layout).

## Solution

Find-and-replace `[var(--` with `(--` and corresponding closing `)]` with `)` across all `.tsx` files. Verify no regressions visually after the change. Planning docs (`.planning/`) can be left as-is since they are historical records.
