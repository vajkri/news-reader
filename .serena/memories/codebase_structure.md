# Codebase Structure

```
news-reader/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (Geist fonts, header nav)
│   │   ├── page.tsx            # Feed page (client component)
│   │   ├── globals.css         # Tailwind + design tokens
│   │   ├── sources/
│   │   │   └── page.tsx        # Sources management page
│   │   └── api/
│   │       ├── articles/
│   │       │   ├── route.ts    # GET articles
│   │       │   └── [id]/route.ts # PATCH article
│   │       ├── sources/
│   │       │   ├── route.ts    # GET/POST sources
│   │       │   └── [id]/route.ts # GET/PUT/DELETE source
│   │       └── fetch/
│   │           └── route.ts    # POST: fetch RSS articles (cron target)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives (badge, button, select, input)
│   │   ├── feed/               # Feed feature components
│   │   │   ├── FeedTable.tsx
│   │   │   ├── FeedToolbar.tsx
│   │   │   └── columns.tsx
│   │   └── sources/            # Source management components
│   │       ├── SourceForm.tsx
│   │       └── SourceList.tsx
│   ├── lib/
│   │   ├── prisma.ts           # Prisma singleton (server-only)
│   │   ├── utils.ts            # cn() utility (clsx + tailwind-merge)
│   │   ├── rss.ts              # RSS feed parsing
│   │   ├── thumbnail.ts        # Thumbnail extraction
│   │   └── readtime.ts         # Read time estimation
│   └── types/
│       └── index.ts            # Shared TypeScript types
├── prisma/
│   ├── schema.prisma           # Database schema (Source, Article)
│   ├── seed.ts                 # Database seeder
│   └── migrations/             # Prisma migrations
├── CLAUDE.md                   # Project conventions for Claude
├── vercel.json                 # Cron config: /api/fetch every 30 min
├── components.json             # shadcn/ui config
├── next.config.ts              # Remote image patterns (all hosts allowed)
└── .planning/                  # GSD planning artifacts
```
