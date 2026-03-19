---
name: Context7 library IDs — known working IDs for key project libraries
description: Skip resolve step for known libraries. Tailwind CSS resolve returns only plugins, not core — use /tailwindlabs/tailwindcss.com directly.
type: reference
---

Known working Context7 library IDs (skip `resolve-library-id` for these):

| Library | Context7 ID | Notes |
|---------|------------|-------|
| Tailwind CSS | `/tailwindlabs/tailwindcss.com` | Resolve returns plugins only. Query `/tailwindlabs/tailwindcss` redirects to this. |

For other libraries, use `resolve-library-id` first as normal.
