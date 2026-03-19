# Project Conventions

## Component Organization

### Folder Organization

```
src/components/
├── ui/                   # Generic reusable UI primitives (e.g. Button, Card, Input, Badge, SearchBar)
├── layout/               # Layout primitives (e.g. Stack, Inline, Grid, Container, Cluster)
└── features/             # Feature components, nested by usage
```

### Naming Conventions

| Folder type      | Naming        | Example            |
| ---------------- | ------------- | ------------------ |
| Single export    | `PascalCase/` | `features/Header/` |
| Multiple exports | `lowercase/`  | `features/home/`   |

### Nesting Rules

1. **Page-scoped components** → `features/{page}/Component.tsx`
2. **Standalone features** → `features/FeatureName/`
3. **Sub-components** → nested under parent: `Parent/index.tsx` + `Parent/Child.tsx`

### Feature components

- Page-specific sections (e.g. HeroSection, CategoryPills, OffersLoader, TrustSection, etc.) live in `src/components/features/{page}/`
- Each section gets its own file: `src/components/features/{page}/HeroSection.tsx`, etc.
- One-off components that are page-specific but may grow in complexity belong here — not inline in page files
- Shared layout-level components (Header, Footer, Nav) live in `src/components/features/` subdirectories, e.g. `src/components/features/Footer/`

### UI primitives

- Generic, reusable components live in `src/components/ui/` (Button, Card, Input, Badge, SearchBar, etc.)
- Layout primitives (Stack, Inline, Grid, Container, Cluster) live in `src/components/layout/`

### Barrel exports

- Every component directory has an `index.ts` barrel export
- Export everything in one line, like so: `export * from './Button'`

## Tool Preferences

**Code searches:** Serena tools first (`serena-find_file`, `serena-find_symbol`, `serena-search_for_pattern`), then glob → grep → shell.

**Third-party library docs:** Query context7 MCP before writing code that uses any library/framework.

1. `mcp__context7__resolve-library-id` — find library ID
2. `mcp__context7__query-docs` — query relevant docs
3. Write code based on results

Skip context7 if: already queried this session, basic JS/TS syntax, or project-internal code only.

## Design System

### Design Tokens

All tokens are defined in `src/app/globals.css`.

- **Color tokens** live in the `@theme` block as `--color-*` variables. Tailwind auto-generates utility classes: `bg-lego-red`, `text-lego-dark`, `border-lego-grey-pale`, etc.
- **Font utilities:** `font-display` (Baloo 2) and `font-body` (DM Sans) — defined via `@theme`.
- **Radius utilities:** `rounded-sm` (6px), `rounded-md` (10px), `rounded-lg` (12px), `rounded-xl` (16px), `rounded-pill` (999px).
- **Shadow utilities:** `shadow-sm`, `shadow-md`, `shadow-lg`.
- **rgba-based values** (tints, depth shadows) are plain CSS custom properties in `:root`, NOT in `@theme`. Tailwind v4 silently drops rgba values from `@theme`. Reference via `style={{ background: 'var(--lego-red-tint)' }}` or the arbitrary-value syntax `[background:var(--lego-red-tint)]`.
- **Container tokens** in `:root`: `--container-width`, `--container-max-width`, `--container-padding`. Used by `.section-container` utility in `@layer components`.

Available `:root` variables:
- `--lego-red-tint` / `--lego-red-tint-md` — rgba red background tints
- `--lego-yellow-tint` / `--lego-yellow-tint-md` — rgba yellow background tints
- `--depth-default` / `--depth-red` / `--depth-yellow` — box-shadow depth values

### UI Components

All components importable from `@/components/ui`.

- **`Button`** — 4 variants (`yellow` / `red` / `grey` / `ghost`), 2 sizes (`icon` 48x48 / `label` h-48). Brick-depth press on yellow/red/grey; ghost is transparent with `hover:bg-white/20`. Accepts `className`, `id` props for composition.
- **`SlideFrame`** — Chrome wrapper for slides. Props: `onClose`, `leftArrow`, `rightArrow`, `children`, `stopIndex`, `stopLabel`, `subSlideTotal`, `subSlideCurrent`. Renders stud-pattern header bar + grey-wash outer + white inner card.
- **`StopBadge`** — Red pill showing "STOP N . LABEL". Props: `stopIndex` (0-based), `stopLabel`.
- **`SubSlideProgress`** — Dot row for sub-slide navigation. Props: `total`, `current` (0-based). Decorative — `aria-hidden="true"`.
- **Content blocks** (6 types, all importable from `@/components/ui`):
  - `BulletList` — Heading + bullet list with variant-colored dots
  - `TwoColumnCards` — Side-by-side cards with border + depth shadow
  - `EntityCards` — Full-width stacked cards with badge (initials) + title + description
  - `NumberedSteps` — Large step numbers + title + description with tinted rows
  - `CalloutBox` — Bordered emphasis box with left accent stripe (default: yellow)
  - `DataTable` — Table with tinted header + depth shadow, first column bold

### Variant System

Content blocks support a `variant` prop: `'default' | 'red' | 'yellow'`

The variant controls three visual properties simultaneously:
1. Background tint
2. Border color
3. Depth shadow (box-shadow)

Variant styles are defined in `src/components/ui/content-blocks/variants.ts` as `variantStyleMap`. All content blocks apply them via `style={variantStyleMap[variant]}` on the outer wrapper — NOT via Tailwind classes (because rgba values cannot be Tailwind tokens in v4).

`CalloutBox` defaults to yellow but accepts `variant` like all other content blocks.

### Typography Scale

| Use case       | Font     | Size  | Weight |
| -------------- | -------- | ----- | ------ |
| Page Title     | Baloo 2  | 40px  | 800    |
| Slide Heading  | Baloo 2  | 30px  | 700    |
| Section Heading| Baloo 2  | 22px  | 700    |
| Card Title     | Baloo 2  | 18px  | 700    |
| Body           | DM Sans  | 18px  | 400    |
| Badge / Label  | Baloo 2  | 14px  | 700    |

Minimum content font size: 18px. Badge/label exception: 14px.

### Depth System

Two depth techniques are used — choose based on context:

- **Buttons:** `border-bottom: 4px solid <color>` (Tailwind: `border-b-4`). Collapses to `border-b-2` on `:active` for press effect. Works because buttons are not rounded-full.
- **Content blocks:** `box-shadow: 0 6px 0 0 <color>` via `--depth-*` CSS variables. Box-shadow is used (not border-bottom) to preserve rounded corners on the block container.

### Color Hierarchy

| Color  | Semantic meaning         | Example use                  |
| ------ | ------------------------ | ---------------------------- |
| Red    | "Where you are" (current)| Current stop marker, active state |
| Yellow | "What to do next" (action)| Primary CTA buttons, entity cards default |
| Green  | "Where you've been" (visited) | Visited stop indicators   |
| Grey   | "Not yet / go back" (secondary) | Inactive stops, secondary buttons |

## Git

Never append `Co-Authored-By` lines to commit messages.

## Documentation & Memory

Where persistent knowledge lives — see `.claude/rules/memory-placement.md` for the full placement guide.

- **`CLAUDE.md`** — prescriptive code conventions (this file)
- **`.claude/memory/`** — behavioral corrections, user preferences, reference pointers
- **`.planning/`** — GSD phases, roadmap, research, project state
- **`.serena/memories/`** — descriptive project knowledge (when Serena is configured)
