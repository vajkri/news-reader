# Phase 5: UX Polish - Research

**Researched:** 2026-04-03
**Domain:** React/Next.js UI polish, mobile responsiveness, design system enforcement
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Compact list layout (not cards). Polish existing rows: larger touch targets, badges, fallback icons inline.
- **D-02:** Fallback visuals: topic category icon (Lucide) when enriched, colored source initial (first letter on colored circle) when not enriched. No favicon fetching.
- **D-03:** Watermark-based NEW badge. Articles fetched since last feed page visit get "New" badge. Separate watermark key (`feed_watermark`), reuses UserPreference upsert pattern.
- **D-04:** Mobile feed: stacked list items below breakpoint. Icon + title on top, metadata below. No horizontal scrolling.
- **D-05:** Header nav collapses to hamburger menu on mobile (375px / below `sm`). Standard mobile pattern.
- **D-06:** Chat panel full-width on mobile. No resize handle on smallest screens. Desktop behavior unchanged.
- **D-07:** Briefing mobile layout: Claude's discretion.
- **D-08:** Typography audit: enforce design system scale across all views. Fix font size, weight, and token drift.
- **D-09:** Card primitive: Claude's discretion (shared vs independent styling).
- **D-10:** Text hierarchy audit: delegate to frontend-design skill. Flag incorrect token usage.
- **D-11:** Dedicated dark mode pass: audit contrast ratios, card backgrounds, borders, text. Not optional.
- **D-12:** Active nav link indicator: Claude's discretion (bold, underline, or primary color).
- **D-13:** Keep current app shell structure: sticky header + main + chat overlay. No structural changes.
- **D-14:** Sources page full visual refresh.
- **D-15:** frontend-design skill MUST audit entire app holistically.
- **D-16:** Extra frontend-design focus on briefing page: all 5 states (morning, evening, caught up, archive, pending enrichment).

### Claude's Discretion
- Card primitive decision (shared vs independent styling)
- Active state indicator style for nav
- Briefing mobile responsive layout
- Topic icon mapping (Lucide icons per category)
- Colored initial palette for source avatars
- Feed compact list row height and spacing
- Sources page visual refresh approach
- Any additional UX improvements from frontend-design audit

### Deferred Ideas (OUT OF SCOPE)
- Add body validation to articles PATCH endpoint (area: api)
- Evaluate enrichment model and prompt for better briefing quality (area: ai-enrichment)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UX-01 | All views redesigned with ADHD-friendly scannable layout (cards, visual hierarchy, no text walls) | Feed fallback visuals, NEW badge, typography audit, sources refresh, briefing mobile states - all covered below |
| UX-02 | Responsive design verified for mobile use | Mobile breakpoints, hamburger menu, chat full-width, feed stacked layout, touch targets - all covered below |
</phase_requirements>

---

## Summary

Phase 5 is a frontend-only polish pass with no new API endpoints and no schema changes. The codebase is a Next.js 15 app using Tailwind v4 with CSS custom properties, shadcn components, and TanStack Table for the feed. All design tokens are already defined in `globals.css` -- the work is about enforcing correct usage and adding missing mobile behaviors.

The largest work item is the feed: the existing `FeedTable` uses `<table>` for desktop and needs a parallel mobile list view below `sm` (640px). The hamburger nav requires extracting the header nav links into a `'use client'` wrapper component (layout.tsx is currently a Server Component). The feed NEW badge requires a new API route or server action for the feed watermark, similar to the existing `briefing_watermark` pattern in `src/lib/watermark.ts`.

The briefing, chat, and sources pages need mobile polish and token audit rather than structural rewrites -- the underlying designs are already card-based and token-correct for the most part. Dark mode audit is the highest-risk item due to contrast ratios needing explicit verification against WCAG 2.2 AA (4.5:1 body, 3:1 large text).

**Primary recommendation:** Plan in waves: (1) layout infrastructure (hamburger nav, chat mobile), (2) feed overhaul (new components, mobile list, NEW badge), (3) visual polish pass (typography, dark mode, sources refresh, briefing mobile).

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on This Phase |
|-----------|---------------------|
| `'use client'` only when interactivity required | Nav active state needs `usePathname()` -- wrap in client component, keep layout Server Component |
| No `any` types, explicit return types on exports | All new components need typed props and return types |
| Tailwind v4 CSS var syntax: `bg-(--var)` not `bg-[var(--var)]` | All new CSS class usage must follow this pattern |
| Focus styles: `focus-visible:` only, never bare `focus:` | Hamburger drawer, nav links, avatar circles all need `focus-visible:` |
| WCAG 2.2 AA: 4.5:1 body text, 3:1 large/UI | Dark mode audit is a hard requirement, not optional |
| Never `<button>` elements -- always `Button` component | Hamburger trigger, drawer close button must use `Button` |
| Barrel exports: every component dir has `index.ts` | `SourceAvatar`, `TopicIcon`, `HamburgerMenu` need barrel exports |
| Conventional Commits format | Commit messages: `feat:`, `fix:`, etc. |
| No em dashes in UI copy | Copywriting contract in UI-SPEC already reflects this |
| Serena tools first for code search | Relevant to implementation agents, not planning |
| Context7 before writing library code | Relevant to implementation agents |

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15 (App Router) | Framework | Already in use; Server Components + `usePathname` for nav |
| Tailwind CSS | v4 | Styling | Already in use; `bg-(--var)` syntax enforced |
| lucide-react | current | Icons | Already in use; `optimizePackageImports` in next.config.ts |
| shadcn/ui | zinc preset | Component primitives | Already in use; Button, Badge, Input, Select |
| date-fns | current | Date formatting | Already in use in feed and briefing |

### No New Packages

This phase adds no new npm dependencies. Everything needed is already installed:
- Lucide icons: already used extensively
- CSS custom properties: full token set in `globals.css`
- shadcn Badge component: 6 variants including `secondary` for NEW badge
- UserPreference Prisma model: reuse for `feed_watermark` key

---

## Architecture Patterns

### Recommended Project Structure (new files this phase)

```
src/components/
├── ui/
│   ├── SourceAvatar.tsx       # NEW: colored initial circle
│   ├── TopicIcon.tsx          # NEW: Lucide icon from topic string
│   └── index.ts               # UPDATED: add SourceAvatar, TopicIcon exports
├── features/
│   ├── layout/
│   │   ├── HamburgerMenu.tsx  # NEW: mobile nav drawer
│   │   └── index.ts           # NEW: barrel export
│   └── feed/
│       ├── FeedMobileList.tsx # NEW: stacked mobile list view
│       ├── FeedRow.tsx        # NEW: single mobile row component
│       ├── columns.tsx        # MODIFIED: TopicIcon/SourceAvatar + NEW badge
│       ├── FeedTable.tsx      # MODIFIED: hide table on mobile, show list
│       └── FeedToolbar.tsx    # MODIFIED: responsive wrapping
```

### Pattern 1: Nav Active State with Client Wrapper

The root `layout.tsx` is a Server Component. `usePathname()` requires `'use client'`. Extract nav into a thin client wrapper.

```tsx
// src/components/features/layout/NavLinks.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLinks(): React.ReactElement {
  const pathname = usePathname();
  return (
    <nav aria-label="Main navigation" className="flex items-center gap-4">
      {[
        { href: '/', label: 'Feed' },
        { href: '/briefing', label: 'Briefing' },
        { href: '/sources', label: 'Sources' },
      ].map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={
              isActive
                ? 'text-sm font-semibold text-(--foreground)'
                : 'text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors'
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
```

### Pattern 2: Feed Watermark (server action)

The feed page is a Server Component (`revalidate = 60`). The NEW badge logic requires knowing the watermark timestamp. The cleanest approach: add a Server Action (or a new API route `/api/feed-watermark`) that the `FeedTable` client component can call on mount. The watermark update happens client-side after mount (mirrors how `updateWatermark` works in briefing, but there it's called server-side during SSR).

Since `FeedTable` is already `'use client'`, the feed watermark:
1. Is fetched via a GET to `/api/feed-watermark` on component mount
2. Is updated via a POST/PATCH to the same route after fetching
3. Returns a timestamp; any article with `createdAt > watermark` and `!isRead` gets the NEW badge

The existing `src/lib/watermark.ts` is `server-only` -- it cannot be imported in a client component. Two approaches:
- **API route** (preferred, consistent with other client data fetching in FeedTable): `GET /api/feed-watermark` returns `{ watermark: string }`, `POST /api/feed-watermark` updates it
- Server action: alternative, but FeedTable uses `fetch` patterns throughout -- API route keeps consistency

### Pattern 3: Deterministic Source Avatar Color

Hash source name to one of 6 Tailwind 600-level background colors. Simple, no dependencies.

```tsx
// src/components/ui/SourceAvatar.tsx
const PALETTE = [
  'bg-blue-600', 'bg-violet-600', 'bg-emerald-600',
  'bg-amber-600', 'bg-rose-600', 'bg-sky-600',
] as const;

function hashName(name: string): number {
  return name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

export function SourceAvatar({ sourceName, size = 'md' }: SourceAvatarProps): React.ReactElement {
  const bg = PALETTE[hashName(sourceName) % PALETTE.length];
  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
  return (
    <div className={`${bg} ${sizeClass} rounded flex items-center justify-center shrink-0`}>
      <span className="text-white font-semibold">{sourceName[0]?.toUpperCase() ?? '?'}</span>
    </div>
  );
}
```

### Pattern 4: TopicIcon Component

Reuses the icon mapping already in `TopicGroup.tsx`. Extract to `ui/TopicIcon.tsx` so feed columns can import it.

```tsx
// src/components/ui/TopicIcon.tsx
import { Code2, Cpu, Building2, FlaskConical, Scale, GitBranch, Terminal } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const TOPIC_ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  'developer tools': Code2,
  'model releases': Cpu,
  'industry moves': Building2,
  'research & breakthroughs': FlaskConical,
  'ai regulation & policy': Scale,
  'open source': GitBranch,
  'ai coding tools': Terminal,
};

export function TopicIcon({ topic, size = 16 }: { topic: string; size?: number }): React.ReactElement {
  const Icon = TOPIC_ICON_MAP[topic.toLowerCase()] ?? Cpu;
  return (
    <div className="h-10 w-10 flex items-center justify-center rounded bg-(--muted) shrink-0">
      <Icon size={size} className="text-(--muted-foreground)" aria-hidden />
    </div>
  );
}
```

**Note:** The mapping in `TopicGroup.tsx` should be updated to import from `TopicIcon.tsx` after extraction (DRY).

### Pattern 5: Mobile Feed List (parallel to table)

FeedTable renders two views and hides/shows via Tailwind responsive classes:

```tsx
// In FeedTable.tsx
<>
  {/* Desktop table — hidden on mobile */}
  <div className="hidden sm:block">
    <table>...</table>
  </div>

  {/* Mobile list — shown on mobile only */}
  <div className="block sm:hidden">
    <FeedMobileList
      rows={table.getRowModel().rows}
      onToggleRead={handleToggleRead}
    />
  </div>
</>
```

### Pattern 6: Hamburger Menu Drawer

The hamburger is `hidden sm:flex` for the trigger, uses controlled boolean `isOpen` state in the nav client wrapper. Drawer renders as a fixed overlay with backdrop.

```tsx
// Drawer structure
<>
  {isOpen && (
    <div
      className="fixed inset-0 bg-black/40 z-40"
      onClick={() => setIsOpen(false)}
      aria-hidden="true"
    />
  )}
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Navigation"
    className={`fixed top-0 left-0 h-full w-72 z-50 bg-(--background) border-r border-(--border)
      transform transition-transform duration-200
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
  >
    ...nav links with p-4 touch targets...
  </div>
</>
```

**Focus trap:** Use `useEffect` + `keydown` listener for Escape key. Focus trap library is NOT needed -- the three nav links are simple enough to handle with `tabIndex` management manually.

### Anti-Patterns to Avoid

- **Importing `watermark.ts` in client components:** It is `server-only`. Always use API route for feed watermark.
- **`focus:` instead of `focus-visible:`:** All new interactive elements must use `focus-visible:` to avoid rings on mouse click.
- **Bare `<button>` elements:** Hamburger trigger, drawer close -- always use the `Button` component.
- **`bg-[var(--token)]` syntax:** Use `bg-(--token)` (Tailwind v4 parenthetical shorthand).
- **`/50` opacity modifier on CSS vars:** Use `color-mix(in srgb, var(--muted) 50%, transparent)` instead.
- **`React.forwardRef`:** Project uses React 19 (verified by `react19-no-forwardref` skill rule). Use `ref` as a prop directly.
- **Defining components inside components:** The `rerender-no-inline-components` rule from the react-best-practices skill applies -- all new components should be defined at module scope.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Icon library | Custom SVG icons | `lucide-react` (already installed) | Consistent sizing, accessibility, tree-shaken |
| Color contrast checking | Manual hex math | WCAG contrast ratio tables + browser DevTools | Error-prone by hand |
| Topic icon map | Separate lookup per consumer | Single `TopicIcon.tsx` shared component | Already partially exists in TopicGroup; DRY |
| Focus trap | Custom focus management | Simple `useEffect` + Escape listener | 3 links only; full trap library is over-engineering |
| Modal backdrop | Custom portal | Inline fixed div with `z-40` | No portal needed for single-level nav drawer |

---

## Common Pitfalls

### Pitfall 1: `layout.tsx` Cannot Use Hooks

**What goes wrong:** Adding `usePathname()` directly to `layout.tsx` breaks because it's a Server Component.

**Why it happens:** Next.js App Router layouts are Server Components by default. `usePathname` is a client hook.

**How to avoid:** Extract nav into `NavLinks.tsx` (or `HeaderNav.tsx`) with `'use client'`. Keep `layout.tsx` as a Server Component. The hamburger menu client state lives in the same wrapper.

**Warning signs:** "You're importing a component that needs `useState`" error in build.

### Pitfall 2: Feed Watermark Race Condition

**What goes wrong:** Watermark is read and immediately updated on mount. If two tabs are open, the second tab's mount overwrites the first tab's watermark before articles are shown.

**Why it happens:** Mount fires before user sees the articles.

**How to avoid:** Read watermark first, render NEW badges, then update watermark after a short delay or after the first article render cycle. Alternatively, update on page unload (less reliable). Simplest: update on mount but use the already-read value for badge computation -- the update doesn't affect the current render.

**Warning signs:** Articles stop showing NEW badge immediately on second visit.

### Pitfall 3: TanStack Table + Mobile List Divergence

**What goes wrong:** Read state updated in table rows but not reflected in mobile list (or vice versa).

**Why it happens:** `articles` state in `FeedTable` is shared, but mobile list is a separate component. If mobile list subscribes to a filtered/transformed version, optimistic read toggle updates can diverge.

**How to avoid:** Both table and mobile list consume the same `articles` state from `FeedTable`. Pass `onToggleRead` and `articles` as props to both. Mobile list renders from `articles` directly, not from `table.getRowModel()`.

### Pitfall 4: Hamburger Menu Focus Accessibility

**What goes wrong:** Screen reader users get trapped or lose focus context when drawer opens/closes.

**Why it happens:** Focus returns to body instead of trigger button on close.

**How to avoid:** Store a ref to the hamburger trigger button. On drawer close, call `triggerRef.current?.focus()`. On drawer open, move focus to the first nav link or the close button inside the drawer.

### Pitfall 5: Dark Mode Contrast on Source Avatars

**What goes wrong:** Avatar backgrounds (600-level Tailwind colors) are declared in light mode but not tested in dark mode.

**Why it happens:** 600-level colors (`bg-blue-600` etc.) are fixed values -- they don't change with color scheme. But the text on them (`text-white`) needs 4.5:1 against each 600-level color.

**How to avoid:** Per UI-SPEC, `text-white` on 600-level backgrounds meets contrast. But verify with browser DevTools contrast checker during dark mode audit pass.

### Pitfall 6: `revalidate = 60` on Feed Page Conflicts with Watermark

**What goes wrong:** The feed page is a Server Component with `revalidate = 60`. The feed watermark must be client-side (FeedTable reads and writes it via API route). No conflict -- the watermark is not part of SSR. But if you try to pass the watermark as a prop from the Server Component, you'd introduce a server-side watermark read that doesn't account for the actual client visit time.

**How to avoid:** Keep watermark entirely client-side. `FeedTable` fetches watermark from `/api/feed-watermark` on mount. SSR page passes no watermark. This is the correct approach given `revalidate = 60` caching.

### Pitfall 7: Topics Field Type at Runtime

**What goes wrong:** `ArticleRow.topics` is typed as `Prisma.JsonValue | null`. At runtime it may be an array of strings, null, or (legacy) a JSON string.

**Why it happens:** Topics were stored as JSON string in SQLite era, changed to JSONB in Phase 03.2. The `parseTopics` function in `briefing.ts` handles this. For `TopicIcon` in feed columns, the same parser is needed.

**How to avoid:** Import and reuse `parseTopics` from `@/lib/briefing` in `columns.tsx` when extracting the first topic for the icon. Do not access `topics[0]` directly.

---

## Code Examples

### Feed NEW Badge Logic (columns.tsx)

```tsx
// In buildColumns, title cell addition:
// articles prop not available in column def -- badge check must be based on
// a prop passed into buildColumns options

// Option: pass watermark as ISO string into buildColumns options
interface ColumnsOptions {
  onToggleRead: (id: number, isRead: boolean) => void;
  searchQuery?: string;
  feedWatermark?: string | null;  // ADD
}

// In title cell:
const isNew = feedWatermark
  && !isRead
  && article.createdAt > feedWatermark;

{isNew && (
  <Badge variant="secondary" className="text-xs shrink-0">New</Badge>
)}
```

### Mobile Chat Panel Override

No new CSS class needed. In `ChatPanel.tsx`, the `isNarrowViewport` state already handles `width: '100%'` on narrow viewports. The current threshold is `<= 430`. The UI-SPEC says `< 640px` (`sm`). The threshold in ChatPanel should be updated to match the 640px breakpoint (`window.innerWidth < 640`), and the resize handle already hides on `isNarrowViewport`.

Current code (line 301-302):
```ts
width: isNarrowViewport ? '100%' : `${panelWidth}px`,
```

Change: update `checkWidth` to use `640` instead of `430` as the narrow breakpoint. This is the only change needed for chat mobile.

### SourceList Visual Refresh

Current: table-based. Refresh to card list items while keeping table structure for data density. Add `gap-0` between rows, increase padding to `py-3`, add source favicon placeholder (SourceAvatar), URL truncation with `max-w-[20ch]`.

---

## Runtime State Inventory

Step 2.5: SKIPPED. This phase involves no rename, rebrand, refactor, string replacement, or data migration. All changes are frontend UI only.

---

## Environment Availability

Step 2.6: The phase is purely frontend code changes. No external tools, services, or CLIs beyond the project's own build toolchain are required.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/dev | Yes | v25.5.0 | -- |
| pnpm | Package manager | Yes | 10.28.2 | -- |
| lucide-react | New UI components | Yes (installed) | current | -- |
| shadcn Badge `secondary` variant | NEW badge | Yes (in badge.tsx) | current | -- |

No missing dependencies.

---

## Validation Architecture

nyquist_validation is enabled in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `pnpm test` (vitest run) |
| Full suite command | `pnpm test` |
| Storybook | `pnpm storybook` (port 6006) |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-01 | Feed fallback visuals render without crash | Visual (Storybook) | `pnpm storybook` | No -- Wave 0 |
| UX-01 | `parseTopics` used in TopicIcon (not raw access) | unit | `pnpm test -- src/lib/briefing.test.ts` | Yes |
| UX-01 | `SourceAvatar` hashes source name deterministically | unit | `pnpm test -- src/components/ui/SourceAvatar.test.ts` | No -- Wave 0 |
| UX-01 | Feed watermark API: GET returns stored or default timestamp | unit | `pnpm test -- src/app/api/feed-watermark/route.test.ts` | No -- Wave 0 |
| UX-01 | Feed watermark API: POST updates stored value | unit | same | No -- Wave 0 |
| UX-02 | No horizontal scroll at 375px | manual | browser DevTools / `pnpm dev` | manual only |
| UX-02 | Touch targets >= 44px on mobile list | manual | browser DevTools | manual only |

**Note:** Most UX-02 criteria are visual/manual. The automated coverage focus is on the new utility functions (feed watermark API, SourceAvatar hash function).

### Sampling Rate
- **Per task commit:** `pnpm test`
- **Per wave merge:** `pnpm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/app/api/feed-watermark/route.test.ts` -- covers feed watermark GET/POST behavior
- [ ] `src/components/ui/SourceAvatar.test.ts` -- covers deterministic hash function

*(Existing watermark test in `src/lib/watermark.test.ts` covers the `briefing_watermark` pattern; new test covers the feed variant.)*

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `forwardRef` in React | Ref as prop (React 19) | React 19 | New components should not use `forwardRef` -- pass `ref` directly as prop |
| `bg-[var(--token)]` Tailwind arbitrary | `bg-(--token)` parenthetical | Tailwind v4 | All new class strings must follow v4 syntax |
| `focus:` pseudo | `focus-visible:` pseudo | Ongoing best practice | All interactive elements in this phase use `focus-visible:` |

---

## Open Questions

1. **Briefing mobile layout (D-07 is Claude's Discretion)**
   - What we know: Briefing is `reading-container` (1024px max-width), card-based, already responsive-ish.
   - What's unclear: At 375px, `BriefingCard` may have too-tight padding on the left border (`border-l-[3.5px] pl-6`). DateStepper needs testing.
   - Recommendation: Implementation agent tests at 375px and adjusts padding/spacing as needed. Likely minimal changes.

2. **Sources page visual refresh approach (D-14 + Claude's Discretion)**
   - What we know: Currently table-based with `SourceList`. UI-SPEC keeps table structure.
   - What's unclear: How much visual lift does the Sources page get vs just applying token corrections?
   - Recommendation: Keep table structure, improve spacing (py-3, better type treatments), add a `SourceAvatar` column as a nice-to-have visual anchor. Delete confirmation should use a proper dialog component rather than `window.confirm()` (accessibility improvement within scope).

3. **`window.confirm()` in SourceList (accessibility)**
   - Currently uses `window.confirm()` for delete confirmation -- not accessible, not visually consistent.
   - Recommendation: Replace with an inline confirmation pattern (show "Are you sure?" with Cancel/Delete buttons replacing the trash icon row) or use the shadcn Dialog if available. This is within the Sources page refresh scope (D-14).

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection -- all findings verified against source files
- `src/lib/watermark.ts` -- existing watermark pattern, server-only
- `src/app/globals.css` -- all token values verified
- `prisma/schema.prisma` -- UserPreference model structure
- `src/components/features/feed/columns.tsx` -- current thumbnail cell, topics access
- `src/components/features/briefing/TopicGroup.tsx` -- existing TOPIC_ICONS map
- `.planning/phases/05-ux-polish/05-CONTEXT.md` -- all decisions
- `.planning/phases/05-ux-polish/05-UI-SPEC.md` -- component inventory, interaction contracts
- `.claude/rules/design-system.md`, `.claude/rules/tailwind-css-vars.md` -- enforced conventions

### Secondary (MEDIUM confidence)
- `react-best-practices` skill (SKILL.md) -- `rerender-no-inline-components`, React 19 ref pattern
- `composition-patterns` skill (SKILL.md) -- compound component guidance

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and in use
- Architecture: HIGH -- patterns derived from existing codebase conventions
- Pitfalls: HIGH -- identified from actual code structure and existing patterns
- Mobile breakpoints: HIGH -- defined in UI-SPEC, confirmed against Tailwind `sm` = 640px
- Dark mode audit: HIGH (what to check) / MEDIUM (whether it passes -- requires runtime verification)

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable stack)
