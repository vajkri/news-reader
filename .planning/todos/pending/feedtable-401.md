---
area: ui/api
priority: medium
source: phase-02-uat
created: 2026-03-19
---

FeedTable.tsx calls POST /api/fetch directly from the client without Authorization header, causing 401 on the homepage. The /api/fetch route requires CRON_SECRET auth (added in Phase 1). FeedTable needs a separate public endpoint or a different data-fetching approach (e.g., server component, or a public GET /api/articles endpoint).
