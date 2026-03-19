---
name: tailwind-docs-scanning-bug
description: Tailwind v4 scans .planning/** and other doc dirs — never use example arbitrary-value class names in docs
type: feedback
---

Never write Tailwind arbitrary-value class placeholders with literal dots (ellipsis) in documentation or planning files. Avoid className with placeholder values or bracket-notation utilities with dot-dot-dot inside.

**Why:** Tailwind v4's oxide scanner auto-scans ALL non-gitignored files including markdown docs. Placeholder dots get extracted as class candidates, and Tailwind's inference engine generates invalid CSS from them (e.g. an invalid font-size declaration). This causes a turbopack CSS parse error in dev mode.

**How to apply:**
- In planning/doc files: use prose descriptions or JSX-style curly-brace placeholders instead of literal class strings with dots
- In `src/app/globals.css`: `@source not` exclusions must remain to prevent scanning doc dirs. Paths are **relative to the CSS file** (not the project root), so use `../../` prefix to reach root-level dirs (e.g. `@source not "../../.planning/**"`)
- If a new doc directory is added that's not gitignored, add another `@source not` exclusion
