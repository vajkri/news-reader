# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## fetch-errors-04.1-branch — createMany fails with "Transactions are not supported in HTTP mode" on Neon HTTP adapter
- **Date:** 2026-03-25
- **Error patterns:** createMany, transactions not supported, HTTP mode, Neon, prisma, RSS fetch, errors, fetchFeeds, allSettled
- **Root cause:** prisma.article.createMany() internally requires transaction support, which the PrismaNeonHTTP serverless adapter does not provide. All sources with new articles fail with "Transactions are not supported in HTTP mode". Sources with 0 new articles succeed (skip the createMany branch entirely).
- **Fix:** Replace prisma.article.createMany() with Promise.allSettled over individual prisma.article.create() calls. Duplicate GUIDs are silently skipped since each create is caught independently via allSettled.
- **Files changed:** src/lib/actions.ts
---

