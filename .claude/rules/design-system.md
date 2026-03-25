---
description: Design system tokens, components, typography, color rules, and focus styles
globs:
  - "src/**"
---

# Design System

## Design Tokens

All tokens are defined in `src/app/globals.css`.

- **Color tokens** are CSS custom properties in `:root`. Light/dark mode via `prefers-color-scheme`. Variables: `--background`, `--foreground`, `--foreground-secondary`, `--muted`, `--muted-foreground`, `--border`, `--primary`, `--primary-foreground`, `--secondary`, `--accent`, `--card`, `--highlight`, `--highlight-foreground`, `--radius`.
- **Text hierarchy tokens:** `--foreground` (primary text, titles), `--foreground-secondary` (secondary text like insights/takeaways; zinc-700 light, zinc-300 dark), `--muted-foreground` (metadata, supporting context). Never use opacity on text colors; use explicit tokens for verifiable contrast.
- **Highlight tokens:** `--highlight` (warm yellow bg) and `--highlight-foreground` (dark text on highlight). Use via `style={{ background: 'var(--highlight)', color: 'var(--highlight-foreground)' }}` on `<mark>` elements. Both modes meet WCAG 2.2 AA contrast.
- **Font variables:** `--font-geist-sans` (Geist Sans, for UI) and `--font-geist-mono` (Geist Mono, for code). Loaded via `next/font/local` in `layout.tsx`.
- **Container tokens** in `:root`: `--container-width` (100%), `--container-max-width` (1460px), `--container-max-width-reading` (1024px), `--container-padding` (1.5rem). Used by `.section-container` and `.reading-container` utilities in `@layer components`.

## Container Utility

Use a two-div pattern: outer div owns background (full-width), inner div uses `.section-container` (wide, 1460px) or `.reading-container` (narrow, 1024px for reading-focused pages) to constrain and pad content.

```html
<div><!-- outer: full-width background -->
  <div class="section-container"><!-- inner: max-width + padding -->
    ...content...
  </div>
</div>
```

Never put `.section-container` on the same element as the background.

## UI Components

All components importable from `@/components/ui`.

- **`Button`** -- 4 variants (`default/outline/ghost/destructive`), 4 sizes (`default` h-9 / `sm` h-7 / `lg` h-11 / `icon` h-8 w-8). Already uses `focus-visible`.
- **`Input`** -- h-9, focus-visible ring using `--primary`. Use `focus-visible:` not bare `focus:`.
- **`Select`** -- Native select with ChevronDown icon.
- **`Badge`** -- 6 variants (`default` / `secondary` / `outline` / `critical` / `important` / `notable`). Uses `text-xs` (12px, the only 12px exception).

Never use raw `<button>` elements. Always use the `Button` component, adding variants as needed.

## Typography Scale

| Role        | Font       | Size  | Weight | Usage                                          |
| ----------- | ---------- | ----- | ------ | ---------------------------------------------- |
| Body        | Geist Sans | 16px  | 400    | Article content, descriptions, primary reading text |
| UI Label    | Geist Sans | 14px  | 600    | Button labels, nav links, badge text, status bar |
| Small       | Geist Sans | 14px  | 400    | Article metadata, filter labels, secondary text |
| Heading     | Geist Sans | 18px  | 600    | Column headers, section titles                 |
| Mono        | Geist Mono | 13px  | 400    | Code references, URL display                   |

Minimum font size: 13px. Badge exception: 12px (`text-xs`), do not add new 12px elements.

## Color

60/30/10 rule:
- **60% Dominant** -- `--background` (page background, card backgrounds)
- **30% Secondary** -- `--muted` / `--secondary` (toolbar, hover states, muted surfaces)
- **10% Accent** -- `--primary` (reserved for: default Button, active filter tabs, search focus ring, active nav link)

`--primary` is NOT used for hover states (use `--accent`/`--muted`), badges, or informational highlights.

Search match highlight: `bg-yellow-200 dark:bg-yellow-800` on `<mark>` spans in article titles only. This is a functional highlight, not a brand accent.

## Focus Styles

Always use `focus-visible:` pseudo-class, never bare `focus:`. This prevents focus rings from appearing on mouse click while preserving keyboard accessibility.
