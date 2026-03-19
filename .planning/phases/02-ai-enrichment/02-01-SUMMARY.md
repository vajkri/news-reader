---
phase: 02-ai-enrichment
plan: 01
subsystem: data-layer
tags: [prisma, ai-sdk, enrichment, schema]
dependency_graph:
  requires: []
  provides: [enrichment-schema, enrichment-logic]
  affects: [Article-model, ArticleRow-type]
tech_stack:
  added: [ai@6.x, zod@4.x]
  patterns: [generateText-Output.array, Promise.allSettled-error-isolation, server-only-module]
key_files:
  created:
    - src/lib/ai.ts
    - src/lib/enrich.ts
  modified:
    - prisma/schema.prisma
    - src/types/index.ts
    - package.json
    - package-lock.json
decisions:
  - "maxOutputTokens (not maxTokens) is the correct AI SDK v6 param name; auto-fixed during Task 2"
  - "topics stored as JSON string (String?) per SQLite limitation; no @default to avoid Prisma bug #26571"
  - "enrichArticlesBatch uses generateText + Output.array() not deprecated generateObject"
  - "AI Gateway model string 'anthropic/claude-haiku-4.5' requires only ai package, no @ai-sdk/anthropic"
metrics:
  duration_seconds: 395
  completed_date: "2026-03-19"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 4
requirements_covered: [AIPL-01, AIPL-02, AIPL-03]
---

# Phase 2 Plan 1: AI Enrichment Schema and Logic Summary

**One-liner:** Prisma Article model extended with 4 enrichment columns (summary, topics, importanceScore, enrichedAt), backed by ai+zod batch enrichment module using generateText with Output.array() via Vercel AI Gateway.

## What Was Built

### Task 1: Enrichment schema fields and AI dependencies

Added 4 nullable fields to the `Article` Prisma model after `isRead`, before `createdAt`:

- `summary String?`
- `topics String?` (no @default — avoids Prisma SQLite bug #26571)
- `importanceScore Int?`
- `enrichedAt DateTime?`

Added `@@index([enrichedAt])` for efficient unenriched article queries.

Updated `ArticleRow` in `src/types/index.ts` with matching nullable fields. `topics` is `string | null` at the type level; application code uses `JSON.parse(article.topics ?? '[]')` to get `string[]`.

Installed `ai` (v6) and `zod` packages. Applied schema with `npx prisma db push`.

### Task 2: AI model config and batch enrichment logic

`src/lib/ai.ts` — single constant `AI_MODEL = 'anthropic/claude-haiku-4.5'` for Vercel AI Gateway. Centralized so Phase 4 (chat) can reuse without duplication.

`src/lib/enrich.ts` — server-only module exporting:

- `SEED_TOPICS`: 7-item const array of topic categories
- `ArticleEnrichmentSchema`: Zod schema with articleId, summary, topics, importanceScore (1-10 int), thinContent
- `BATCH_LIMIT = 50`: cap to prevent Vercel timeout on large backlogs
- `fetchUnenrichedArticles()`: queries articles where enrichedAt IS NULL, ordered by publishedAt desc, capped at BATCH_LIMIT
- `buildBatchPrompt()`: formats articles as `--- Article ID: N\nSource: ...\nTitle: ...\nDescription: ...` blocks
- `enrichArticlesBatch()`: calls generateText with Output.array() and returns typed enrichment results
- `saveEnrichmentResults()`: Promise.allSettled per-item saves with error collection, returns `{ saved, errors }`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] maxTokens renamed to maxOutputTokens in AI SDK v6**

- **Found during:** Task 2
- **Issue:** TypeScript compilation failed: "maxTokens does not exist in type CallSettings". AI SDK v6 renamed the parameter from `maxTokens` to `maxOutputTokens`.
- **Fix:** Replaced `maxTokens: 4096` with `maxOutputTokens: 4096` in `enrichArticlesBatch`.
- **Files modified:** src/lib/enrich.ts
- **Commit:** 2cbdeca (included in Task 2 commit)

### Infrastructure Fix

**Worktree missing .env file**

- **Found during:** Task 1 verification
- **Issue:** `npx prisma db push` failed with validation error because DATABASE_URL was not set. The `.env` lives at the main repo root, not in the worktree.
- **Fix:** Created `.env` in the worktree with absolute path `DATABASE_URL="file:/Users/krisztinavajda/dev/news-reader/prisma/dev.db"` and `CRON_SECRET=any-dev-value`.
- **Note:** This file is gitignored and should be recreated by any developer working in this worktree.

## Self-Check: PASSED

All created files verified on disk. Both task commits confirmed in git log (d59ae29, 2cbdeca).
