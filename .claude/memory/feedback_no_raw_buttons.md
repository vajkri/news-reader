---
name: No raw button elements
description: Never use raw <button> elements — always use the ui Button component, adding variants as needed
type: feedback
---

Never use raw `<button>` elements in components. Always use the `Button` component from `@/components/ui`.

**Why:** The design system exists to centralize styling (cursor, transitions, focus-visible). Raw buttons bypass the system, causing inconsistencies and creating drift that's hard to catch in review.

**How to apply:** When a new button style is needed, add a new variant to `Button.tsx` rather than writing a raw `<button>`. Every interactive button in the app should flow through the single `Button` primitive.

**Available variants:** `default/outline/ghost/destructive`
**Available sizes:** `default` (h-9) / `sm` (h-7) / `lg` (h-11) / `icon` (h-8 w-8)
