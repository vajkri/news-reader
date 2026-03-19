# Architecture

**Analysis Date:** 2026-03-19

## Pattern Overview

**Overall:** Layered client-server architecture with Next.js App Router

**Key Characteristics:**
- Next.js 16 (React 19 with server components)
- REST API routes for data operations
- Client-side React components with server-side data fetching
- Prisma ORM for database abstraction
- Separation of server-only utilities from client code
- Scheduled RSS feed fetching via Vercel cron jobs
- SQLite database with cascading deletes

## Layers

**Presentation Layer:**
- Purpose: Render UI and handle user interactions
- Location: `src/app/` (pages) and `src/components/` (reusable components)
- Contains: React components, form handlers, state management with useState/useEffect
- Depends on: API routes, utility functions
- Used by: Browser clients

**API Layer:**
- Purpose: Handle HTTP requests, validate input, manage database operations
- Location: `src/app/api/`
- Contains: Next.js route handlers (GET, POST, PATCH, DELETE)
- Depends on: Prisma client, RSS parser, utility functions
- Used by: Frontend components, Vercel cron jobs

**Data Access Layer:**
- Purpose: Database operations and ORM abstraction
- Location: `src/lib/prisma.ts` (singleton client initialization)
- Contains: Prisma Client instance with singleton pattern for development
- Depends on: Prisma schema
- Used by: API routes

**Business Logic Layer:**
- Purpose: Core operations like RSS parsing, text processing
- Location: `src/lib/` (rss.ts, readtime.ts, thumbnail.ts)
- Contains: Pure functions for feed parsing, reading time estimation, image extraction
- Depends on: External packages (rss-parser), utility functions
- Used by: API routes

**UI Component Library:**
- Purpose: Reusable UI primitives
- Location: `src/components/ui/` (Radix UI + Tailwind wrappers)
- Contains: Badge, Button, Input, Select components
- Depends on: Tailwind CSS, Radix UI
- Used by: Feature components

**Feature Components:**
- Purpose: Domain-specific UI composition
- Location: `src/components/feed/` (FeedTable, FeedToolbar, columns), `src/components/sources/` (SourceForm, SourceList)
- Contains: Stateful components managing feed and source management
- Depends on: UI components, API calls, types
- Used by: Page components

**Types/Interfaces:**
- Purpose: Shared type definitions
- Location: `src/types/index.ts`
- Contains: ArticleRow, SourceRow interfaces for data contracts
- Depends on: None
- Used by: Components, API routes

## Data Flow

**Article Fetching Flow:**

1. User clicks "Fetch latest" button in `FeedTable` → calls `handleFetch()`
2. `handleFetch()` POSTs to `/api/fetch` endpoint
3. `/api/fetch` (POST):
   - Retrieves all Source records from Prisma
   - For each source, calls `fetchFeed(source.url)` in parallel using `Promise.allSettled()`
   - `fetchFeed()` parses RSS feed using `rss-parser`, extracts articles with custom field mapping
   - Extracts thumbnail from media:content, media:thumbnail, itunes:image, or enclosure
   - Estimates read time using `estimateReadTime()` (words ÷ 200)
   - Checks which article GUIDs already exist in database
   - Creates only new Article records via `prisma.article.createMany()`
   - Collects errors and returns summary
4. FeedTable receives result, calls `loadArticles()` to refresh display
5. `loadArticles()` GETs `/api/articles?sourceId=X&category=Y&isRead=Z&sort=date&limit=100`
6. Articles render in table with optimistic updates for read status

**Scheduled Fetching Flow:**

1. Vercel cron job triggers `/api/fetch` every 30 minutes (via `vercel.json`)
2. Same flow as manual fetch above
3. New articles automatically added to database

**Article Read Status Update:**

1. User clicks "Unread"/"Read" button → `handleToggleRead(id, isRead)` executes
2. Optimistic UI update: state changes immediately for instant feedback
3. PATCH to `/api/articles/[id]` with `{ isRead: boolean }`
4. Server updates database via Prisma
5. No rollback on error (data loss risk accepted)

**Source Management Flow:**

1. **Add Source:** SourceForm POSTs to `/api/sources` → validation → Prisma creates Source → optimistic state update
2. **List Sources:** Page.tsx fetches `/api/sources` on mount → renders SourceList
3. **Delete Source:** SourceList calls DELETE `/api/sources/[id]` → Prisma deletes with cascade (articles deleted too) → optimistic state update

## State Management

**Client-Side:**
- useState for local component state (articles, filters, loading flags)
- useEffect for side effects (loading data on mount/filter change)
- useCallback for memoized handlers (prevents unnecessary re-renders)
- Optimistic updates on mutation (UI changes before server confirmation)

**Server-Side:**
- Prisma state stored in SQLite database
- No in-memory caching layer
- Each request performs fresh database queries

**URL State:**
- No URL query parameters used (filters managed in component state only)
- Makes filtering/sorting non-shareable but simpler

## Key Abstractions

**ParsedArticle:**
- Purpose: Represents normalized article data from RSS feed
- Examples: `src/lib/rss.ts` (defined as interface)
- Pattern: Intermediate DTO between RSS parser output and database model

**ArticleRow & SourceRow:**
- Purpose: Data contracts between API and frontend
- Examples: `src/types/index.ts`
- Pattern: Type definitions matching Prisma query results with nested relations

**RSS Parser Configuration:**
- Purpose: Normalize various RSS feed formats (media namespaces, iTunes, enclosures)
- Examples: `src/lib/rss.ts` (custom fields array, User-Agent header, timeout, redirect handling)
- Pattern: Centralized parser setup with custom field extraction

**Image Extraction Pipeline:**
- Purpose: Handle multiple thumbnail sources in RSS items
- Examples: `src/lib/thumbnail.ts` (priority order: enclosure → media:content → media:thumbnail → itunes:image)
- Pattern: Fallback chain for robust media extraction

**Read Time Estimator:**
- Purpose: Estimate article reading time (words ÷ 200)
- Examples: `src/lib/readtime.ts` (strips HTML, counts words, minimum 1 minute)
- Pattern: Pure function with safety minimum

**Singleton Prisma Client:**
- Purpose: Prevent multiple PrismaClient instances in development hot reload
- Examples: `src/lib/prisma.ts` (uses global namespace, only creates once per process)
- Pattern: Standard Next.js pattern for server-only singleton initialization

## Entry Points

**Root Page (Feed):**
- Location: `src/app/page.tsx`
- Triggers: User navigates to `/` or app loads
- Responsibilities: Fetch sources on mount, render FeedTable with article list

**Sources Page:**
- Location: `src/app/sources/page.tsx`
- Triggers: User navigates to `/sources`
- Responsibilities: Fetch sources on mount, render SourceForm and SourceList

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: All page renders
- Responsibilities: Set metadata, load Geist fonts, render header with navigation, mount main children

**API Routes (Server Entry Points):**
- `GET /api/sources` → List all sources with article counts
- `POST /api/sources` → Create new source with validation
- `DELETE /api/sources/[id]` → Delete source and cascade articles
- `GET /api/articles` → List articles with filtering/sorting/pagination
- `PATCH /api/articles/[id]` → Update article read status
- `POST /api/fetch` → Fetch all feeds and create new articles

## Error Handling

**Strategy:** Graceful degradation with error collection and user feedback

**Patterns:**

**API Route Errors:**
- Input validation: return 400 with error message (e.g., invalid URL, missing fields)
- Constraint violations: catch Prisma P2002 (unique constraint) → return 409 Conflict
- Unhandled errors: throw to Next.js error boundary (server logs)
- Feed parsing failures: catch and collect error strings, continue with other feeds (Promise.allSettled)

**Client-Side Errors:**
- Form validation: check trim() and URL() before submission, show error message
- Fetch failures: no explicit error handling (silently fails, UI may not update)
- Optimistic updates: no rollback on PATCH failure (accepted data loss risk)

**RSS Parsing Errors:**
- Parser timeout (15 seconds) and redirect limit (5) configured
- Per-feed errors caught, collected, returned in fetch response
- UI shows error count and error details in status bar

## Cross-Cutting Concerns

**Logging:** None detected. No logging framework or console output configuration.

**Validation:**
- URL validation: `new URL()` constructor in both API and client (throws on invalid)
- Required field validation: trim() and nullish checks on name/url
- Unique constraint: Prisma enforces unique Source.url
- Read status type: Prisma enforces boolean

**Authentication:** Not implemented. Application is fully public with no auth layer.

**Authorization:** Not implemented. No user concept or access control.

**Content Security:**
- RSS feed URLs accepted from user input without sanitization
- HTML descriptions stored as-is (potential XSS in display, though none shown)
- Thumbnails loaded from arbitrary HTTPS/HTTP URLs via Next.js Image component with remotePatterns: ["**"]

---

*Architecture analysis: 2026-03-19*
