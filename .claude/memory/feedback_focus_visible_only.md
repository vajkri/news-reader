---
name: Use focus-visible not focus
description: Always use :focus-visible (not :focus) for focus styles — avoids focus rings on mouse clicks
type: feedback
---

Always use `focus-visible:` instead of `focus:` in Tailwind classes, and `:focus-visible` instead of `:focus` in CSS.

**Why:** `:focus` shows focus rings on mouse clicks, which is visually noisy. `:focus-visible` only shows them for keyboard navigation, giving a cleaner UX while maintaining accessibility.

**How to apply:** When writing any interactive element (buttons, links, inputs), use `focus-visible:ring-2 focus-visible:outline-none` etc. Never use the bare `focus:` variant.
