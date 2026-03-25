# Tailwind v4 CSS Variable Syntax

Use the Tailwind v4 parenthetical shorthand for CSS custom properties: `bg-(--background)`, `text-(--foreground)`, `border-(--border)`.

Do not use the bracket arbitrary-value syntax: ~~`bg-[var(--background)]`~~

**Opacity caveat:** Tailwind's `/50` opacity modifier does NOT work with CSS custom properties. Use `color-mix(in srgb, var(--muted) 50%, transparent)` in arbitrary value brackets instead.
