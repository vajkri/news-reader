---
created: 2026-03-21T20:11:02.231Z
title: Update typography implementations to match design system scale
area: ui
files:
  - src/app/layout.tsx:30-46
  - src/app/briefing/page.tsx:63-82
  - src/app/sources/page.tsx:21
  - src/components/features/briefing/BriefingCard.tsx:49-60
  - src/components/features/briefing/TopicGroup.tsx:36
  - src/components/features/briefing/DateStepper.tsx:42
  - src/components/features/feed/FeedTable.tsx:174-272
  - src/components/features/feed/columns.tsx:43-146
  - src/components/features/feed/FeedToolbar.tsx:73
  - src/components/features/sources/SourceForm.tsx:58-83
  - src/components/features/sources/SourceList.tsx:16-45
---

## Problem

Typography scale was updated in CLAUDE.md and Phase 4 UI-SPEC but no code changes were made. The new scale is: body 16px (was 14px), heading 18px (was 16px), small/label 14px. All existing components still use the old scale via Tailwind classes.

Key mapping:
- `text-sm` used for body text → should be `text-base` (16px)
- `text-base` used for headings → should be `text-lg` (18px)
- `text-sm` used for labels/metadata → stays `text-sm` (14px, correct)
- `text-xs` for badges/table headers → stays (12px Badge exception)

## Solution

Audit each file and update Tailwind classes to match new scale. Not every `text-sm` changes; only those used for body-level text. Labels, nav links, and metadata at 14px/600 stay as `text-sm font-semibold`. Natural candidate for Phase 5 (UX Polish) since it touches all views.
