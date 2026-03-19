# Task Completion Checklist

After completing a coding task, run through these steps:

1. **Lint:** `npm run lint` — fix any ESLint errors
2. **Build check:** `npm run build` — ensures Prisma generation, migrations, and Next.js build all pass
3. **If schema changed:** Run `npx prisma migrate dev --name <description>` to create a migration
4. **If new UI components:** Verify barrel exports exist in `index.ts`
5. **Manual test:** `npm run dev` and verify the change works in browser
