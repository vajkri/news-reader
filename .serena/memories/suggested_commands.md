# Suggested Commands

## Development

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Generate Prisma client, run migrations, build Next.js |
| `pnpm start` | Start production server |

## Database

| Command | Description |
|---------|-------------|
| `pnpm prisma migrate dev` | Create/apply a new migration |
| `pnpm prisma migrate deploy` | Apply pending migrations (production) |
| `pnpm prisma generate` | Regenerate Prisma client after schema changes |
| `pnpm seed` | Seed the database (`tsx prisma/seed.ts`) |
| `pnpm db:studio` | Open Prisma Studio GUI |

## Code Quality

| Command | Description |
|---------|-------------|
| `pnpm lint` | Run ESLint (next/core-web-vitals + typescript rules) |

## shadcn/ui

| Command | Description |
|---------|-------------|
| `pnpm dlx shadcn@latest add <component>` | Add a shadcn/ui component |
