# Task Completion Checklist

After completing a coding task, run through these steps:

1. **Lint:** `pnpm lint` -- fix any ESLint errors
2. **Build check:** `pnpm build` -- ensures Prisma generation, migrations, and Next.js build all pass
3. **If schema changed:** Run `pnpm prisma migrate dev --name <description>` to create a migration
4. **If new UI components:** Verify barrel exports exist in `index.ts`
5. **Manual test:** `pnpm dev` and verify the change works in browser
