---
name: feedback_tailwind_variable_syntax
description: Use Tailwind v4 shorthand for CSS variable references in classes
type: feedback
---

Use the Tailwind v4 parenthetical shorthand for CSS custom properties instead of arbitrary value bracket syntax.

**Why:** Cleaner, more readable, and idiomatic Tailwind v4.

**How to apply:** Write `border-(--border)` instead of `border-[var(--border)]`. Applies to all utility classes referencing CSS variables: `bg-(--background)`, `text-(--foreground)`, etc.
