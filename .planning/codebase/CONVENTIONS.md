# Coding Conventions

**Analysis Date:** 2026-03-19

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `FeedTable.tsx`, `SourceForm.tsx`)
- API routes: lowercase with hyphens in directories, function names are uppercase (e.g., `route.ts` with `GET`, `POST`, `PATCH` exports)
- Utilities/helpers: lowercase with hyphens (e.g., `readtime.ts`, `thumbnail.ts`, `rss.ts`)
- Types: `index.ts` in `types/` directory

**Functions:**
- Exported components: PascalCase (e.g., `FeedTable`, `SourceForm`, `FeedToolbar`)
- Exported utilities: camelCase (e.g., `fetchFeed`, `estimateReadTime`, `extractThumbnailFromItem`, `buildColumns`)
- Event handlers: camelCase with `handle` prefix (e.g., `handleSubmit`, `handleFetch`, `handleToggleRead`)
- State setters: `set` prefix (e.g., `setArticles`, `setLoading`, `setError`)
- Callbacks: `on` prefix for props (e.g., `onAdded`, `onToggleRead`, `onFetch`)

**Variables:**
- State variables: camelCase (e.g., `sourceFilter`, `categoryFilter`, `readFilter`, `isFetching`)
- Constants: camelCase (e.g., `articles`, `sources`, `errors`)
- Type/interface names: PascalCase (e.g., `ArticleRow`, `SourceRow`, `FetchResult`)

**Types:**
- Interfaces: PascalCase (e.g., `SourceFormProps`, `FeedToolbarProps`, `ColumnsOptions`)
- Type aliases: PascalCase (e.g., `CustomItem`)
- Exported types: PascalCase (e.g., `ParsedArticle`, `ArticleRow`, `SourceRow`)

## Code Style

**Formatting:**
- No explicit formatter configured in package.json (no prettier setup detected)
- Code follows consistent spacing: 2-space indentation throughout
- Line length appears unconstrained (lines up to 200+ characters observed)
- JSX formatting: attributes on same line when reasonable, multiline when needed

**Linting:**
- ESLint with Next.js configuration (`eslint-config-next`)
- Config: `eslint.config.mjs` using flat config format
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`
- Uses `@typescript-eslint` rules via Next.js config
- Rule disables: `// eslint-disable-next-line @typescript-eslint/no-explicit-any` for unsafe types, `react-hooks/exhaustive-deps` for specific hook dependencies

## Import Organization

**Order:**
1. External libraries (React, Next.js, third-party packages)
2. Relative imports from `@/` alias (internal modules)
3. Relative imports (`.`, `./` for same-directory files)

**Path Aliases:**
- `@/*` → `./src/*` (tsconfig.json)
- All internal code uses `@/` prefix (e.g., `@/lib/prisma`, `@/components/ui/button`, `@/types`)

**Example pattern from `src/components/feed/FeedTable.tsx`:**
```typescript
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { FeedToolbar } from "./FeedToolbar";
import { buildColumns } from "./columns";
import { ArticleRow, SourceRow } from "@/types";
```

**Server-only utilities:**
- Server utilities import `"server-only"` at the top (e.g., `src/lib/prisma.ts`, `src/lib/rss.ts`, `src/lib/thumbnail.ts`)
- Client components marked with `"use client"` at the top

## Error Handling

**Patterns:**
- **API routes:** Use `NextResponse.json()` with status codes; validate inputs and return 400 for bad requests, 409 for conflicts
- **Type guards:** Check error type before accessing message: `err instanceof Error ? err.message : String(err)`
- **Silent catches:** Some catches are empty (e.g., `catch { setError("...") }`) - swallow error but set user-facing message
- **Promise.allSettled:** Used for parallel operations that may fail individually (e.g., in `src/app/api/fetch/route.ts` for fetching multiple RSS feeds)
- **State error handling:** Component state includes `error` field, cleared on retry, set on failure

**Example from `src/app/api/sources/route.ts`:**
```typescript
try {
  new URL(url);
} catch {
  return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
}

try {
  const source = await prisma.source.create({ data: {...} });
  return NextResponse.json(source, { status: 201 });
} catch (err: unknown) {
  if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
    return NextResponse.json({ error: "A source with this URL already exists" }, { status: 409 });
  }
  throw err;
}
```

## Logging

**Framework:** No explicit logging library (console usage not detected in production code)

**Patterns:**
- No centralized logging infrastructure observed
- Error information passed via state/HTTP responses rather than logged

## Comments

**When to Comment:**
- Function-level comments: Minimal, used only for clarification (e.g., `/** Estimates reading time in minutes from HTML or plain text content */`)
- Logic comments: Used for complex branching or fallback logic (e.g., in `thumbnail.ts`: `// 1. RSS enclosure`, `// 2. media:content`)
- Component comments: Used to separate major logical sections (e.g., `// Filters`, `// Load on filter/sort change`, `// Auto-fetch on first mount`)
- Suppress comments: `// eslint-disable-next-line` for specific rule disables (with reason)

**JSDoc/TSDoc:**
- Minimal JSDoc usage
- When used: Single-line JSDoc for simple utilities (e.g., `/** Estimates reading time... */`)
- No parameter-level JSDoc observed
- Type definitions relied on via TypeScript interfaces

**Example from `src/lib/readtime.ts`:**
```typescript
/** Estimates reading time in minutes from HTML or plain text content */
export function estimateReadTime(text: string | null | undefined): number {
  if (!text) return 1;
  const stripped = text.replace(/<[^>]*>/g, " ");
  const words = stripped.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
```

## Function Design

**Size:** Components 50-233 lines, utilities 5-56 lines. Larger components (200+ lines) have clear section comments dividing logic blocks.

**Parameters:**
- Props objects used for components (avoid positional params)
- Destructuring at function signature level (e.g., `export function FeedTable({ sources }: { sources: SourceRow[] })`)
- Inline type annotations for simple props

**Return Values:**
- Components: JSX elements
- Utilities: Typed return values (explicit type annotations on functions)
- Optional values: `null` return for missing data
- Arrays: Empty arrays `[]` for no items

**Example from `src/components/feed/columns.tsx`:**
```typescript
export function buildColumns({ onToggleRead }: ColumnsOptions): ColumnDef<ArticleRow>[] {
  return [
    {
      id: "thumbnail",
      header: "",
      size: 56,
      cell: ({ row }) => {
        const { thumbnail, title } = row.original;
        if (!thumbnail) {
          return <div className="h-10 w-10...">—</div>;
        }
        return <div>...</div>;
      },
    },
    // ... more columns
  ];
}
```

## Module Design

**Exports:**
- Named exports preferred (e.g., `export function FeedTable(...)`, `export interface ArticleRow`)
- Default exports used in Next.js page components (e.g., `export default function HomePage()`)
- Barrel files: `src/types/index.ts` exports all types

**Barrel Files:**
- `src/types/index.ts` re-exports all type definitions
- Used for centralized type imports: `import { ArticleRow, SourceRow } from "@/types"`

**Component composition:**
- Container components (stateful): e.g., `FeedTable` manages data, state, filtering
- Presentational components: e.g., `FeedToolbar`, column definitions
- Utilities extracted to `lib/` for server logic, components stay in `components/`

---

*Convention analysis: 2026-03-19*
