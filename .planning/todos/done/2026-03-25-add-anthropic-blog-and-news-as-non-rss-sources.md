---
created: 2026-03-25T15:42:00.699Z
title: Add Anthropic blog and news as non-RSS sources
area: data-pipeline
files:
  - src/lib/rss.ts
  - src/lib/actions.ts
  - prisma/seed.ts
---

## Problem

Two key Anthropic sources lack RSS feeds and cannot be ingested by the current pipeline:
- https://claude.com/blog (Claude product blog)
- https://www.anthropic.com/news (Anthropic company news)

The existing fetch pipeline (`rss.ts` / `actions.ts`) assumes all sources have RSS/XML feeds parsed by `rss-parser`. These sites serve HTML pages with no discoverable RSS endpoint.

## Solution

Research options:
1. **Sitemap parsing**: Check if `/sitemap.xml` exists on either domain and extract article URLs + dates from it
2. **HTML scraping**: Fetch the listing page, parse article links/titles/dates from the DOM (e.g. with cheerio)
3. **Third-party RSS bridge**: Services like rss-bridge or feeddd that generate RSS from arbitrary web pages
4. **Abstracted source type**: Add a `sourceType` field to the Source model (`rss` | `scrape` | `sitemap`) and branch the fetch logic accordingly

The fetch pipeline would need a strategy pattern: `fetchFeed` for RSS sources, `fetchPage` (or similar) for non-RSS sources, both returning `ParsedArticle[]`.
