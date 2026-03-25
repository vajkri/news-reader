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

## Git

Never append `Co-Authored-By` lines to commit messages. Use Conventional Commits format.
