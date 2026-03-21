---
id: SEED-001
status: dormant
planted: 2026-03-21
planted_during: v1.0 / Phase 03.2
trigger_when: after Neon Postgres migration is complete and case-insensitive contains search is confirmed working
scope: small
---

# SEED-001: Postgres full-text search for article search

## Why This Matters

The current search uses Prisma `contains` (substring matching), which is slow on large datasets and cannot rank by relevance. Postgres full-text search (`@@` operator with tsvector/GIN index) enables relevance ranking, stemming (matching "deploy" when searching "deployment"), and efficient multi-word queries. This becomes more valuable as the article corpus grows.

## When to Surface

**Trigger:** After Phase 03.2 (Neon migration) is complete and search is confirmed working with `mode: 'insensitive'` contains.

This seed should be presented during `/gsd:new-milestone` when the milestone scope matches any of these conditions:
- Search improvements or search UX work is planned
- Performance optimization for the article corpus
- Any work touching the articles API query layer

## Scope Estimate

**Small**: a few hours of focused work. The search logic is localized to one API route. Changes needed:
- Add a `tsvector` generated column or computed column on Article (title + description)
- Add a GIN index for fast full-text lookups
- Swap `contains` filters in `src/app/api/articles/route.ts` for Postgres `@@` operator (may need `$queryRaw` since Prisma's native full-text support is limited)
- No UI changes required; results just come back ranked by relevance

## Breadcrumbs

Related code and decisions found in the current codebase:

- `src/app/api/articles/route.ts` - Article search API with `contains` filters (title, source name)
- `src/components/features/feed/FeedToolbar.tsx` - Search input UI (no changes needed)
- `src/components/features/feed/FeedTable.tsx` - Renders search results (no changes needed)
- `prisma/schema.prisma` - Article model (will need tsvector column + index)
- `.planning/STATE.md` - Decision: "no mode insensitive on SQLite" (resolved by Neon migration)

## Notes

Planted during Phase 03.2 discussion. The prerequisite (Postgres) is being added in this phase. Case-insensitive `contains` is the immediate fix; full-text search is the proper long-term solution.
