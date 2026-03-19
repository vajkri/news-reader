# External Integrations

**Analysis Date:** 2026-03-19

## APIs & External Services

**RSS Feed Sources:**
- External RSS feeds (user-defined)
  - SDK/Client: `rss-parser` (3.13.0)
  - Authentication: None (public RSS feeds)
  - Usage: `/src/lib/rss.ts` - `fetchFeed()` function
  - Features:
    - Custom User-Agent header: `"NewsReader/1.0 (RSS aggregator)"`
    - Timeout: 15 seconds
    - Max redirects: 5
    - Supports multiple media formats: `media:content`, `media:thumbnail`, `itunes:image`

## Data Storage

**Database:**
- **Type:** SQLite
- **Primary Connection:** Local file-based (`dev.db`)
  - Environment variable: `DATABASE_URL`
  - Client: Prisma ORM (@prisma/client 5.22.0)
  - Driver: better-sqlite3 (synchronous)
  - Adapter: @prisma/adapter-better-sqlite3

- **Alternative (Production-Ready):**
  - Turso/LibSQL via @libsql/client
  - Adapter: @prisma/adapter-libsql
  - Uses same `DATABASE_URL` environment variable

**Schema Entities:**
- `Source` - RSS feed sources (name, URL, category)
- `Article` - Parsed articles from feeds (with read status tracking)
- One-to-Many relationship: Source → Articles

**File Storage:**
- Not used - Images are fetched from remote RSS sources via extracted URLs

**Caching:**
- None - No Redis or caching layer detected

## Authentication & Identity

**Auth Provider:**
- None - Application is completely unauthenticated
- No user management or login system
- Public data access (all sources and articles accessible to anyone)

**Security Considerations:**
- No authorization checks on API routes
- All GET/POST endpoints are public
- Cron job endpoint (`/api/fetch`) has no authentication checks

## Monitoring & Observability

**Error Tracking:**
- None detected - No Sentry, Rollbar, or similar integration

**Logs:**
- Standard console logging via Next.js
- Error messages captured in cron fetch response
- Location: `src/app/api/fetch/route.ts` - errors array

**Deployment Logs:**
- Vercel deployment logs (available via Vercel dashboard/CLI)

## CI/CD & Deployment

**Hosting:**
- Vercel - Primary platform
- Production deployments from main branch
- Preview deployments for pull requests

**CI Pipeline:**
- GitHub Actions (configured in `.github/workflows/`)
- Not fully analyzed but repository shows workflow files
- Auto-PR-review capability via Claude Code GitHub Action

**Build Process:**
- `npm run build` triggers:
  1. `prisma generate` - Generate Prisma Client
  2. `prisma migrate deploy` - Run pending migrations
  3. `next build` - Next.js production build

## Environment Configuration

**Required Environment Variables:**
- `DATABASE_URL` - SQLite connection string or Turso/LibSQL URL
  - Development: `"file:./dev.db"`
  - Production: Should point to persistent database

**Optional Environment Variables:**
- `NODE_ENV` - Runtime environment (checked in `src/lib/prisma.ts`)
- `CRON_SECRET` - Not currently enforced but recommended for production

**Secrets Location:**
- `.env` file (local development)
- Vercel Environment Variables dashboard (production)
- Note: `.env` file exists with `DATABASE_URL` configured locally

## Webhooks & Callbacks

**Incoming:**
- `/api/fetch` - Vercel cron endpoint (triggered every 30 minutes)
  - No authentication checks currently
  - Returns: `{ fetched: number, added: number, errors: string[] }`

**Outgoing:**
- None - No external webhook calls

## Internal API Routes

**Articles API:**
- `GET /api/articles` - Fetch articles with filtering/pagination
  - Parameters: `sourceId`, `category`, `isRead`, `sort`, `page`, `limit`
  - Returns: Paginated articles with source metadata

- `PATCH /api/articles/[id]` - Mark article as read/unread
  - Payload: `{ isRead: boolean }`
  - Returns: Updated article

**Sources API:**
- `GET /api/sources` - Fetch all RSS sources
  - Returns: Sources with article count

- `POST /api/sources` - Add new RSS source
  - Payload: `{ name: string, url: string, category?: string }`
  - Validation: URL format validation
  - Returns: Created source (201) or error (400/409)

- `PATCH /api/sources/[id]` - Update source (implied from route existence)

- `DELETE /api/sources/[id]` - Delete source (implied from route existence)

**Fetch/Sync API:**
- `POST /api/fetch` - Trigger RSS feed sync (called by Vercel cron)
  - No request body
  - Returns: `{ fetched: number, added: number, errors: string[] }`
  - Process: Fetches all sources, finds new articles, creates entries

## Network & Request Handling

**RSS Feed Fetching:**
- Default headers applied by rss-parser:
  ```
  User-Agent: NewsReader/1.0 (RSS aggregator)
  Accept: application/rss+xml, application/xml, text/xml, */*
  ```
- Timeout: 15 seconds per feed
- Max redirects: 5 (handles feed redirects/changes)
- Error handling: Individual feed errors don't block other feeds (Promise.allSettled)

**Image Handling:**
- Remote image patterns in `next.config.ts` allow all HTTPS and HTTP images
- Images served through Next.js Image component from remote URLs
- Thumbnail extraction from RSS metadata (media:content, media:thumbnail, itunes:image)

## Data Processing

**Article Parsing:**
- RSS parser extracts:
  - GUID/URL as unique identifier
  - Title, link, description
  - Thumbnail from media extensions
  - Publication date (pubDate or isoDate)
- Read time estimation from description text
- Duplicate detection via GUID before insertion

**Data Validation:**
- URL validation for RSS sources (new URL validation)
- Unique constraint on source URLs
- Unique constraint on article GUIDs

---

*Integration audit: 2026-03-19*
