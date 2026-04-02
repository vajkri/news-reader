---
description: Tailwind v4 best practices, prefer built-in utilities and parenthetical CSS var syntax
globs:
  - "src/**"
---

# Tailwind v4 Best Practices

## CSS Variable Syntax

Use the Tailwind v4 parenthetical shorthand for CSS custom properties: `bg-(--background)`, `text-(--foreground)`, `border-(--border)`.

Do not use the bracket arbitrary-value syntax: ~~`bg-[var(--background)]`~~

**Opacity caveat:** Tailwind's `/50` opacity modifier does NOT work with CSS custom properties. Use `color-mix(in srgb, var(--muted) 50%, transparent)` in arbitrary value brackets instead.

## Prefer Built-in Utilities Over Arbitrary Values

Use Tailwind's built-in spacing/sizing classes instead of arbitrary pixel values when a match exists. For example, `bottom-[72px]` should be `bottom-18`.
