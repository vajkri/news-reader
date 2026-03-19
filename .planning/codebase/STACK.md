# Technology Stack

**Analysis Date:** 2026-03-19

## Languages

**Primary:**
- TypeScript 5.x - Used for all application code (`src/**/*.ts`, `src/**/*.tsx`)
- JavaScript (ES2017 target) - Runtime environment, some config files (`.mjs`)

**Secondary:**
- SQL - Prisma ORM with SQLite database

## Runtime

**Environment:**
- Node.js - Server runtime (type target ES2017)
- Next.js 16.1.7 - Full-stack React framework

**Package Manager:**
- npm - Primary dependency manager
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.1.7 - Full-stack React framework with App Router (`src/app/`)
- React 19.2.3 - UI component library
- React DOM 19.2.3 - DOM rendering

**UI Components:**
- Tailwind CSS 4.x - Utility-first CSS framework
- Radix UI 2.x - Headless component library
  - `@radix-ui/react-select` (2.2.6) - Select component
  - `@radix-ui/react-slot` (1.2.4) - Slot composition
- shadcn/ui - Unstyled UI components (referenced in `geist` and tailwind setup)

**Data/State:**
- @tanstack/react-table 8.21.3 - Headless table component library
- Prisma 5.22.0 - ORM for database management
- @prisma/client 5.22.0 - Prisma client library
- rss-parser 3.13.0 - RSS/XML feed parsing

**Utilities:**
- date-fns 4.1.0 - Date manipulation library
- clsx 2.1.1 - Conditional CSS class merging
- tailwind-merge 3.5.0 - Tailwind class conflict resolution
- class-variance-authority 0.7.1 - Component variant management
- lucide-react 0.577.0 - SVG icon library
- server-only 0.0.1 - Marks code as server-only (prevents client import)

## Database Adapters

**Primary:**
- SQLite with `better-sqlite3` (12.8.0) - Synchronous SQLite driver
- @prisma/adapter-better-sqlite3 (7.5.0) - Prisma's better-sqlite3 adapter

**Secondary (Optional):**
- @libsql/client (0.17.0) - LibSQL client
- @prisma/adapter-libsql (7.5.0) - Prisma's libSQL adapter (for Turso-compatible databases)

## Testing & Quality

**Linting:**
- ESLint 9.x - JavaScript/TypeScript linter
- eslint-config-next - Next.js ESLint config

**Code Formatting:**
- Tailwind CSS built-in formatting via @tailwindcss/postcss

**TypeScript:**
- TypeScript 5.x - Static type checking
- Strict mode enabled (`"strict": true` in `tsconfig.json`)

## Build & Development

**Build Tools:**
- Next.js 16.1.7 - Built-in webpack/Turbopack bundler
- tsx 4.21.0 - TypeScript executor for scripts

**CSS Processing:**
- PostCSS 4.x (via @tailwindcss/postcss)
- Tailwind CSS 4.x - CSS-in-JS utility generation

**Dev Tools:**
- Next.js dev server - `npm run dev`
- Prisma Studio - `npm run db:studio`

## Configuration

**Environment:**
- Configured via `.env` file
- Key variable: `DATABASE_URL` (required)
  - Format: `"file:./dev.db"` for local SQLite
  - Can point to Turso/LibSQL for production

**Build:**
- `tsconfig.json` - TypeScript configuration
  - Target: ES2017
  - Module resolution: bundler
  - Path alias: `@/*` → `./src/*`
  - Strict mode enabled
  - JSX: react-jsx

- `next.config.ts` - Next.js configuration
  - Remote image patterns configured for all HTTPS/HTTP hosts
  - Allows RSS feed image handling

- `eslint.config.mjs` - ESLint configuration (flat config)
  - Extends eslint-config-next core-web-vitals
  - Extends eslint-config-next typescript
  - Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

- `postcss.config.mjs` - PostCSS configuration
  - Uses @tailwindcss/postcss plugin

- `vercel.json` - Deployment configuration
  - Contains cron job definition for RSS feed fetching

## Deployment

**Platform:**
- Vercel - Primary deployment target (inferred from `vercel.json` and Next.js setup)

**Special Features:**
- Cron Jobs configured in `vercel.json`
  - Path: `/api/fetch`
  - Schedule: Every 30 minutes (`*/30 * * * *`)

## Package Management

**Critical Dependencies (by function):**
- Database: Prisma Client, better-sqlite3, LibSQL adapter
- RSS Feeds: rss-parser
- UI Rendering: React, Next.js, Tailwind CSS, Radix UI
- Tables: @tanstack/react-table
- Icons: lucide-react
- Date: date-fns

**Development Dependencies:**
- Type definitions: @types/react, @types/react-dom, @types/node, @types/better-sqlite3
- Tooling: TypeScript, ESLint, tsx

---

*Stack analysis: 2026-03-19*
