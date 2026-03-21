---
created: 2026-03-20T06:08:27.802Z
title: Improve daily briefing card readability and scannability
area: ui
files:
  - src/components/features/briefing/BriefingCard.tsx
  - src/components/features/briefing/TopicGroup.tsx
  - src/app/briefing/page.tsx
---

## Problem

Daily briefing article cards are hard to read and don't give a quick overview of why an article is important or what it means. Users need to scan through content to understand relevance, which defeats the ADHD-friendly design goal.

## Solution

Redesign briefing cards for faster scanning:
- Lead with the "why it matters" sentence (the implication, currently buried at end of summary)
- Stronger visual hierarchy between headline, key takeaway, and metadata
- Consider color-coded importance indicators that communicate at a glance
- Reduce text density per card
