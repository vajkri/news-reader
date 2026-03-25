# News Reader - Project Overview

A personal RSS news reader/tracker built with Next.js. Users can add RSS feed sources, and the app periodically fetches articles from those feeds and displays them in a filterable, sortable table.

## Tech Stack

- **Framework:** Next.js 16.1.7 (App Router, `src/` directory)
- **Language:** TypeScript (strict mode)
- **React:** 19.2.3
- **Database:** Neon Postgres via Prisma ORM (@prisma/adapter-neon, @neondatabase/serverless)
- **Styling:** Tailwind CSS v4, shadcn/ui (zinc base, CSS variables, lucide icons)
- **Fonts:** Geist Sans + Geist Mono (loaded as local fonts from node_modules)
- **Data table:** @tanstack/react-table
- **RSS parsing:** rss-parser
- **Deployment:** Vercel (with cron job for periodic feed fetching every 30 min)
- **Path alias:** `@/*` maps to `./src/*`

## Data Model (Prisma/Neon Postgres)

- **Source**: id, name, url (unique), category?, createdAt, articles[]
- **Article**: id, guid (unique), title, link, description?, thumbnail?, publishedAt?, readTimeMin?, isRead (default false), createdAt, sourceId (FK to Source)

## Pages

- `/` — Feed page: client-side component that fetches sources and renders a FeedTable
- `/sources` — Sources management page

## API Routes

- `GET/POST /api/sources` — List/create sources
- `GET/PUT/DELETE /api/sources/[id]` — Single source CRUD
- `GET /api/articles` — List articles (with filtering)
- `PATCH /api/articles/[id]` — Update article (e.g. mark as read)
- `POST /api/fetch` — Fetch new articles from all RSS sources (also triggered by Vercel cron every 30 min)
