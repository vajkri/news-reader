---
name: WCAG 2.2 AA conformance required
description: All UI must meet WCAG 2.2 AA accessibility standards, especially color contrast ratios
type: feedback
---

All UI must conform to WCAG 2.2 AA. Text contrast minimum 4.5:1, large text 3:1, non-text UI 3:1.

**Why:** User explicitly requested WCAG 2.2 AA after discovering a search highlight with only 3.05:1 contrast ratio. Accessibility is a hard requirement, not a nice-to-have.

**How to apply:** Always use explicit text colors on colored backgrounds. Check contrast ratios when choosing color combinations. Use `focus-visible` not `focus`. Test both light and dark mode contrast.
