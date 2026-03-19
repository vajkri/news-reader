# Suggested Commands

## Development

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Generate Prisma client, run migrations, build Next.js |
| `npm run start` | Start production server |

## Database

| Command | Description |
|---------|-------------|
| `npx prisma migrate dev` | Create/apply a new migration |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma generate` | Regenerate Prisma client after schema changes |
| `npm run seed` | Seed the database (`npx tsx prisma/seed.ts`) |
| `npm run db:studio` | Open Prisma Studio GUI |

## Code Quality

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint (next/core-web-vitals + typescript rules) |

## Serena MCP Server

| Command | Description |
|---------|-------------|
| `npm run serena` | Start the Serena MCP server (streamable-http, port 56667) |

## System Utilities (macOS/Darwin)

| Command | Description |
|---------|-------------|
| `git` | Version control |
| `ls` / `find` / `grep` | File listing and searching |
| `open .` | Open current directory in Finder |
| `pbcopy` / `pbpaste` | Clipboard operations |

## shadcn/ui

| Command | Description |
|---------|-------------|
| `npx shadcn@latest add <component>` | Add a shadcn/ui component |
