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

## shadcn/ui

| Command | Description |
|---------|-------------|
| `npx shadcn@latest add <component>` | Add a shadcn/ui component |
