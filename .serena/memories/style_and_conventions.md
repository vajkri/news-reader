# Style and Conventions

## TypeScript
- Strict mode enabled
- Path alias: `@/*` -> `./src/*`
- Types defined in `src/types/index.ts`

## Component Conventions (from CLAUDE.md)
- **UI primitives** in `src/components/ui/` (shadcn/ui based)
- **Feature components** in `src/components/features/{page}/` for page-specific sections
- **Layout components** in `src/components/layout/`
- Single-export folders: PascalCase; multi-export folders: lowercase
- Every component directory has an `index.ts` barrel export

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

## Git
- Never append Co-Authored-By lines to commit messages
- No em dashes in user-facing text
