# Project Conventions

## Component Organization

### Folder Organization

```
src/components/
├── ui/                   # Generic reusable UI primitives (e.g. Button, Input, Badge, Select)
├── layout/               # Layout primitives (e.g. Stack, Inline, Grid, Container)
└── features/             # Feature components, nested by usage
```

### Naming Conventions

| Folder type      | Naming        | Example                   |
| ---------------- | ------------- | ------------------------- |
| Single export    | `PascalCase/` | `features/Header/`        |
| Multiple exports | `lowercase/`  | `features/feed/`          |

### Nesting Rules

1. **Page-scoped components** → `features/{page}/Component.tsx`
2. **Standalone features** → `features/FeatureName/`
3. **Sub-components** → nested under parent: `Parent/index.tsx` + `Parent/Child.tsx`

### Feature components

- Page-specific sections live in `src/components/features/{page}/`
- Each section gets its own file: `src/components/features/feed/FeedToolbar.tsx`, etc.
- Shared layout-level components (Header, Footer, Nav) live in `src/components/features/` subdirectories

### UI primitives

- Generic, reusable components live in `src/components/ui/` (Button, Input, Badge, Select, etc.)
- Layout primitives live in `src/components/layout/`

### Barrel exports

- Every component directory has an `index.ts` barrel export
- Export everything in one line, like so: `export * from './Button'`

## Tool Preferences

**Code searches:** Serena tools first (`serena-find_file`, `serena-find_symbol`, `serena-search_for_pattern`), then glob, grep, shell.

**Third-party library docs:** Query context7 MCP before writing code that uses any library/framework.

1. `mcp__context7__resolve-library-id` — find library ID
2. `mcp__context7__query-docs` — query relevant docs
3. Write code based on results

Skip context7 if: already queried this session, basic JS/TS syntax, or project-internal code only.

### Available Skills

Skills are injected via the Vercel plugin bootstrap and provide domain expertise:

- **investigation-mode**: Orchestrated debugging for stuck/broken/hung states. Follow the triage order: runtime logs, workflow status, browser verification, deploy status. Always report evidence at every step.
- **cron-jobs**: Vercel Cron configuration in `vercel.json`. Cron handlers must verify `CRON_SECRET` via Authorization header. Hobby plan: max 2 jobs, min daily interval.

### Serena MCP

Serena provides semantic code intelligence (symbol search, reference finding, symbolic editing). Already configured:

- Config: `.serena/project.yml` (project_name: NewsReader, languages: typescript + bash)
- Start: `npm run serena` (starts MCP server on port 56667)
- MCP endpoint: `http://localhost:56667/mcp` (configure in your MCP client to point here)
- Memories: `.serena/memories/` (onboarding completed, project structure indexed)

## Coding Conventions

- Prefer Server Components by default; `'use client'` only when interactivity is required
- Strict TypeScript: no `any` types, explicit return types on exports
- Conventional Commits format: `feat:`, `fix:`, `docs:`, `chore:`

## Accessibility

Target: **WCAG 2.2 AA** conformance. All UI must meet:
- Text contrast: 4.5:1 minimum (3:1 for large text, 18px+ bold or 24px+)
- Non-text contrast: 3:1 for UI components and graphical objects
- Focus indicators: visible `focus-visible` outlines on all interactive elements
- Always use explicit text colors on colored backgrounds; never rely on inheritance for contrast

## Design System

### Design Tokens

All tokens are defined in `src/app/globals.css`.

- **Color tokens** are CSS custom properties in `:root`. Light/dark mode via `prefers-color-scheme`. Variables: `--background`, `--foreground`, `--muted`, `--muted-foreground`, `--border`, `--primary`, `--primary-foreground`, `--secondary`, `--accent`, `--card`, `--highlight`, `--highlight-foreground`, `--radius`.
- **Highlight tokens:** `--highlight` (warm yellow bg) and `--highlight-foreground` (dark text on highlight). Use via `style={{ background: 'var(--highlight)', color: 'var(--highlight-foreground)' }}` on `<mark>` elements. Both modes meet WCAG 2.2 AA contrast.
- **Font variables:** `--font-geist-sans` (Geist Sans, for UI) and `--font-geist-mono` (Geist Mono, for code). Loaded via `next/font/local` in `layout.tsx`.
- **Container tokens** in `:root`: `--container-width` (100dvw), `--container-max-width` (1460px), `--container-padding` (1.5rem). Used by `.section-container` utility in `@layer components`.

### Container Utility

Use a two-div pattern: outer div owns background (full-width), inner div uses `.section-container` to constrain and pad content.

```html
<div><!-- outer: full-width background -->
  <div class="section-container"><!-- inner: max-width + padding -->
    ...content...
  </div>
</div>
```

Never put `.section-container` on the same element as the background.

### UI Components

All components importable from `@/components/ui`.

- **`Button`** — 4 variants (`default/outline/ghost/destructive`), 4 sizes (`default` h-9 / `sm` h-7 / `lg` h-11 / `icon` h-8 w-8). Already uses `focus-visible`.
- **`Input`** — h-9, focus-visible ring using `--primary`. Use `focus-visible:` not bare `focus:`.
- **`Select`** — Native select with ChevronDown icon.
- **`Badge`** — 3 variants (`default` / `secondary` / `outline`). Uses `text-xs` (12px — the only 12px exception).

### Typography Scale

| Role        | Font       | Size  | Weight | Usage                                          |
| ----------- | ---------- | ----- | ------ | ---------------------------------------------- |
| Body        | Geist Sans | 14px  | 400    | Article metadata, filter labels, secondary text |
| UI Label    | Geist Sans | 14px  | 600    | Button labels, nav links, badge text, status bar |
| Heading     | Geist Sans | 16px  | 600    | Column headers, section titles                 |
| Mono        | Geist Mono | 13px  | 400    | Code references, URL display                   |

Minimum font size: 13px. Badge exception: 12px (`text-xs`) — do not add new 12px elements.

### Color

60/30/10 rule:
- **60% Dominant** — `--background` (page background, card backgrounds)
- **30% Secondary** — `--muted` / `--secondary` (toolbar, hover states, muted surfaces)
- **10% Accent** — `--primary` (reserved for: default Button, active filter tabs, search focus ring, active nav link)

`--primary` is NOT used for hover states (use `--accent`/`--muted`), badges, or informational highlights.

Search match highlight: `bg-yellow-200 dark:bg-yellow-800` on `<mark>` spans in article titles only. This is a functional highlight, not a brand accent.

### Focus Styles

Always use `focus-visible:` pseudo-class, never bare `focus:`. This prevents focus rings from appearing on mouse click while preserving keyboard accessibility.

## Git

Never append `Co-Authored-By` lines to commit messages. Use Conventional Commits format.

## Documentation & Memory

Where persistent knowledge lives — see `.claude/rules/memory-placement.md` for the full placement guide.

- **`CLAUDE.md`** — prescriptive code conventions (this file)
- **`.claude/memory/`** — behavioral corrections, user preferences, reference pointers
- **`.planning/`** — GSD phases, roadmap, research, project state
- **`.serena/memories/`** — descriptive project knowledge (when Serena is configured)

## Known Limitations

- SQLite `contains` is case-sensitive (no `mode: 'insensitive'` support unlike PostgreSQL)
- `.env.local` must include `CRON_SECRET=any-dev-value` for local cron endpoint testing
