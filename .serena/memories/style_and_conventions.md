# Style and Conventions

## TypeScript
- Strict mode enabled
- Path alias: `@/*` -> `./src/*`
- Types defined in `src/types/index.ts`

## Styling
- Tailwind CSS v4 with CSS variables
- shadcn/ui with zinc base color
- Geist Sans (UI text) + Geist Mono (code)
- `cn()` utility for class merging (clsx + tailwind-merge)
- Dark mode support via CSS variables

## Data Fetching Pattern
- Server data access via Prisma singleton (`src/lib/prisma.ts`, uses `server-only`)
- API routes for CRUD operations
- Client-side fetching with `fetch()` + `useState`/`useEffect`

## ESLint
- next/core-web-vitals + typescript config
- Flat config format (`eslint.config.mjs`)

All prescriptive rules (component organization, design tokens, accessibility, git conventions) live in `CLAUDE.md` and `.claude/rules/`. This file is descriptive only.
