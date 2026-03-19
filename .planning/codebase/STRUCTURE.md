# Codebase Structure

**Analysis Date:** 2026-03-19

## Directory Layout

```
news-reader/
├── .github/                    # GitHub workflows
├── .idea/                      # IntelliJ IDE config (not committed)
├── .planning/                  # GSD planning documents
├── prisma/                     # Database schema and migrations
│   ├── migrations/             # Prisma migration history
│   ├── schema.prisma           # Database schema definition
│   └── seed.ts                 # Database seed script
├── public/                     # Static assets
├── src/
│   ├── app/                    # Next.js App Router (pages + API routes)
│   │   ├── api/                # REST API endpoints
│   │   │   ├── articles/       # Article management endpoints
│   │   │   │   ├── route.ts    # GET articles, no POST/PUT/DELETE here
│   │   │   │   └── [id]/       # Article by ID
│   │   │   │       └── route.ts # PATCH to update read status
│   │   │   ├── fetch/          # Feed fetching endpoint
│   │   │   │   └── route.ts    # POST to fetch all RSS feeds
│   │   │   └── sources/        # Source management endpoints
│   │   │       ├── route.ts    # GET all sources, POST new source
│   │   │       └── [id]/       # Source by ID
│   │   │           └── route.ts # DELETE source
│   │   ├── sources/            # Sources management page
│   │   │   └── page.tsx        # List and add RSS sources
│   │   ├── layout.tsx          # Root layout (header, navigation, fonts)
│   │   └── page.tsx            # Home page (article feed)
│   ├── components/             # Reusable React components
│   │   ├── feed/               # Feed-related components
│   │   │   ├── FeedTable.tsx   # Main article table with filters/sorting
│   │   │   ├── FeedToolbar.tsx # Filter/sort controls, fetch button
│   │   │   └── columns.tsx     # TanStack React Table column definitions
│   │   ├── sources/            # Source management components
│   │   │   ├── SourceForm.tsx  # Form to add new RSS source
│   │   │   └── SourceList.tsx  # Table of existing sources with delete
│   │   └── ui/                 # Primitive UI components (shadcn)
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── select.tsx
│   ├── lib/                    # Utility functions and server-only modules
│   │   ├── prisma.ts           # Prisma Client singleton initialization
│   │   ├── rss.ts              # RSS feed parsing with custom fields
│   │   ├── thumbnail.ts        # Image extraction from RSS items
│   │   ├── readtime.ts         # Reading time estimation algorithm
│   │   └── utils.ts            # Tailwind utility (cn function)
│   └── types/                  # TypeScript type definitions
│       └── index.ts            # ArticleRow, SourceRow interfaces
├── .env                        # Environment variables (ignored in git)
├── components.json             # shadcn component config
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies and scripts
├── postcss.config.mjs          # PostCSS config (Tailwind)
├── prisma.json                 # Prisma config (seed script reference)
├── tsconfig.json               # TypeScript compiler options
└── vercel.json                 # Vercel deployment config (cron jobs)
```

## Directory Purposes

**src/app/:**
- Purpose: Next.js App Router — pages and API routes
- Contains: Page components, API route handlers, layout root
- Key files: `page.tsx` (home), `layout.tsx` (root), `api/` (endpoints)

**src/app/api/:**
- Purpose: REST API endpoints serving JSON
- Contains: Route handlers for articles, sources, RSS fetching
- Key files: `articles/route.ts`, `sources/route.ts`, `fetch/route.ts`

**src/app/api/articles/:**
- Purpose: Article query and update operations
- Contains: GET (list/filter), PATCH (read status)
- Key files: `route.ts` (list), `[id]/route.ts` (patch)

**src/app/api/sources/:**
- Purpose: RSS source management
- Contains: GET (list), POST (create), DELETE (remove)
- Key files: `route.ts` (list/create), `[id]/route.ts` (delete)

**src/app/api/fetch/:**
- Purpose: Scheduled RSS feed fetching
- Contains: POST endpoint that parses all RSS feeds and creates articles
- Key files: `route.ts`

**src/components/:**
- Purpose: Reusable React components organized by domain
- Contains: Feature components (feed, sources), primitive UI components
- Key files: Feature components with useState, UI primitives from shadcn

**src/components/feed/:**
- Purpose: Article feed display and management
- Contains: Main table, toolbar, column definitions
- Key files: `FeedTable.tsx` (main component), `FeedToolbar.tsx` (controls), `columns.tsx` (table schema)

**src/components/sources/:**
- Purpose: RSS source management UI
- Contains: Add source form, source list with delete
- Key files: `SourceForm.tsx`, `SourceList.tsx`

**src/components/ui/:**
- Purpose: Shadcn UI component wrappers
- Contains: Button, Input, Select, Badge (Radix UI + Tailwind)
- Key files: Each is one component

**src/lib/:**
- Purpose: Shared utility functions and server-only modules
- Contains: Prisma client, RSS parsing, text processing
- Key files: `prisma.ts` (singleton), `rss.ts` (parser), utility functions

**src/types/:**
- Purpose: Shared TypeScript type definitions
- Contains: Type definitions for API response contracts
- Key files: `index.ts` (ArticleRow, SourceRow)

**prisma/:**
- Purpose: Database schema, migrations, seed data
- Contains: Prisma ORM configuration, migration history, seed script
- Key files: `schema.prisma` (schema), `seed.ts` (initial data)

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Home page (article feed)
- `src/app/sources/page.tsx`: Sources management page
- `src/app/layout.tsx`: Root layout with header and navigation

**Configuration:**
- `next.config.ts`: Next.js image optimization, remote patterns
- `vercel.json`: Cron job schedule (30 minutes)
- `tsconfig.json`: Path alias `@/*` → `./src/*`
- `components.json`: Shadcn UI component defaults

**Core Logic:**
- `src/lib/rss.ts`: RSS feed parsing, custom field extraction, article parsing
- `src/lib/prisma.ts`: Prisma Client singleton for database access
- `src/app/api/fetch/route.ts`: Core fetching logic (Promise.allSettled, deduplication)
- `src/app/api/articles/route.ts`: Article filtering/sorting/pagination logic

**Database:**
- `prisma/schema.prisma`: Data model (Source, Article with relations)

**Testing:**
- Not found. No test files or testing framework configured.

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `FeedTable.tsx`, `SourceForm.tsx`)
- Pages: kebab-case or index (e.g., `page.tsx` for route, `[id]` for dynamic segments)
- API routes: `route.ts` for handler, `[id]` for path parameters
- Utilities: camelCase (e.g., `readtime.ts`, `thumbnail.ts`, `prisma.ts`)
- Types: `index.ts` for shared types

**Directories:**
- Feature directories: camelCase (e.g., `components/feed/`, `components/sources/`, `lib/`)
- App Router segments: kebab-case or dynamic (e.g., `api/`, `sources/`, `[id]/`)
- Shadcn UI: lowercase (e.g., `ui/badge.tsx`, `ui/button.tsx`)

**Functions:**
- React components: PascalCase (e.g., `FeedTable`, `buildColumns`)
- Utility functions: camelCase (e.g., `estimateReadTime`, `extractThumbnailFromItem`, `fetchFeed`)

**Variables/State:**
- camelCase (e.g., `sourceFilter`, `setArticles`, `isFetching`)

**Types/Interfaces:**
- PascalCase (e.g., `ArticleRow`, `SourceRow`, `ParsedArticle`)

## Where to Add New Code

**New Feature (e.g., article export, filters):**
- Primary code: Feature in `src/components/` directory (co-located with UI)
- API endpoint: `src/app/api/[feature]/route.ts`
- Types: Add to `src/types/index.ts`
- Utilities: Add to `src/lib/` if shared or directly in component if isolated

**New Component/Module:**
- Implementation: `src/components/[domain]/ComponentName.tsx`
- If feature-specific: Co-locate with related components in domain directory
- If utility: Add to `src/lib/` as pure function
- Import in parent component or page using `@/components/...` or `@/lib/...` alias

**New API Endpoint:**
- Create route: `src/app/api/[resource]/route.ts`
- For sub-resources: `src/app/api/[resource]/[id]/route.ts`
- Import Prisma: `import { prisma } from "@/lib/prisma"`
- Return: `NextResponse.json(data, { status: 200 })`

**New Database Model:**
- Update: `prisma/schema.prisma`
- Create migration: `npx prisma migrate dev --name description`
- Seed data: Add to `prisma/seed.ts` if needed
- Generate Prisma client: Automatic on schema change

**Utilities:**
- Shared helpers: `src/lib/[name].ts` (pure functions, no React)
- Server-only utilities: Add `"use server"` or `import "server-only"` at top
- Client-only utilities: Mark with `"use client"` if used in components

**UI Components:**
- Primitive components: `src/components/ui/[name].tsx` (reusable, unstyled or basic style)
- Feature components: `src/components/[domain]/[Name].tsx` (domain-specific, stateful)

## Special Directories

**prisma/migrations/:**
- Purpose: Prisma migration history (version control for schema changes)
- Generated: Yes (by `prisma migrate` commands)
- Committed: Yes (required for reproducibility across environments)

**.next/:**
- Purpose: Next.js build output and cache
- Generated: Yes
- Committed: No (in .gitignore)

**node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (by npm install)
- Committed: No (in .gitignore)

**.idea/:**
- Purpose: IntelliJ IDE project settings (now in .gitignore as of recent commit)
- Generated: Yes
- Committed: No (in .gitignore)

## Import Path Aliases

- `@/*` → `./src/*` (defined in `tsconfig.json`)

Use `@/components/feed/FeedTable` instead of `../../../components/feed/FeedTable`

All internal imports should use `@/` alias except rare cases.

## File Organization Principles

1. **Colocation:** Components and related utilities live close to usage (e.g., `components/feed/` contains FeedTable, FeedToolbar, columns)
2. **Shallow:** Avoid deep nesting; most files within 2-3 levels of `src/`
3. **Clarity:** File names match component/function names (FeedTable → FeedTable.tsx)
4. **Separation:** UI (components/) from business logic (lib/) from data (api/)
5. **Shared:** Truly shared code in `lib/` or `components/ui/`; domain-specific in feature directories

---

*Structure analysis: 2026-03-19*
