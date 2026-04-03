---
phase: 05-ux-polish
plan: 05
subsystem: tooling
tags: [storybook, ui-components, design-system, dark-mode, viewport, rsc]
dependency_graph:
  requires: [05-04]
  provides: [storybook-ui-primitives]
  affects: []
tech_stack:
  added: [storybook@10.3.3, "@storybook/addon-themes@10.3.4"]
  patterns: [CSF3, withThemeByClassName, fixture-data]
key_files:
  created:
    - .storybook/preview.ts (updated: dark mode + viewport config)
    - src/stories/fixtures.ts
    - src/stories/ui/Button.stories.tsx
    - src/stories/ui/Badge.stories.tsx
    - src/stories/ui/Input.stories.tsx
    - src/stories/ui/Select.stories.tsx
    - src/stories/ui/SourceAvatar.stories.tsx
    - src/stories/ui/TopicIcon.stories.tsx
    - .claude/rules/storybook-stories.md
  modified:
    - .storybook/main.ts
    - package.json
decisions:
  - "Used @storybook/addon-themes withThemeByClassName (not withThemeByDataAttribute) since app uses Tailwind dark class on html element"
  - "Standard Preview type export in preview.ts (not definePreview) since __definePreview is internal in v10"
  - "stories glob covers src/** to include both existing feature stories and new src/stories/ location"
metrics:
  duration_min: 15
  tasks_completed: 3
  files_changed: 11
  completed_date: "2026-04-03"
---

# Phase 05 Plan 05: Storybook Setup + UI Primitive Stories Summary

**One-liner:** Storybook v10 configured with `@storybook/addon-themes` dark mode toggle, custom 375px viewport, RSC support, and 6 UI primitive story files using realistic fixture data.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 05-05-01 | Install and configure Storybook | 6a3ceae | .storybook/main.ts, .storybook/preview.ts, package.json |
| 05-05-02 | Create fixture data and UI primitive stories | 2596229 | src/stories/fixtures.ts + 6 story files |
| 05-05-03 | Add Storybook enforcement rule | 1893729 | .claude/rules/storybook-stories.md |

## What Was Built

### Storybook Configuration

- `main.ts`: Added `@storybook/addon-themes` to addons, `staticDirs: ['../public']`, `experimentalRSC: true` preserved
- `preview.ts`: `withThemeByClassName({ light: '', dark: 'dark' })` for CSS class-based dark mode, `INITIAL_VIEWPORTS` + custom `mobile375` (375x812px) viewport, `globals.css` import for design tokens

### Fixture Data (`src/stories/fixtures.ts`)

- `mockSources`: 4 Source objects (Anthropic Blog, The Verge AI, Hacker News, OpenAI Blog)
- `mockArticles`: 6 ArticleRow objects covering: thumbnail, enriched/no-thumbnail, unenriched, read, long title, before-watermark
- `mockWatermark`: ISO date string for watermark boundary testing
- All types imported from `@/types` for compile-time correctness

### UI Primitive Stories (`src/stories/ui/`)

| File | Stories |
|------|---------|
| Button.stories.tsx | Default, Outline, Ghost, Destructive, Small, Large, Disabled, AllVariants |
| Badge.stories.tsx | All 6 variants, ImportanceTiers context |
| Input.stories.tsx | Default, WithPlaceholder, WithValue, Disabled, AllStates |
| Select.stories.tsx | Default, WithOptions, WithSelectedValue, Disabled, AllStates |
| SourceAvatar.stories.tsx | Default, Small, ColorPalette, BothSizes, FromFixtures |
| TopicIcon.stories.tsx | 7 named topics + UnknownFallback + AllTopics |

## Deviations from Plan

### Auto-fixed Issues

None.

### Configuration Notes

1. **Storybook already installed at v10.3.3** - The plan called for running `pnpm dlx storybook@latest init`, but Storybook was already installed with `experimentalRSC: true` and webpack aliases for server-module mocking. The init was skipped; config was updated in-place.

2. **`definePreview` not used** - The plan suggested using `definePreview` from `@storybook/nextjs`. In v10, `definePreview` is exported as `__definePreview` (internal, unstable) from `@storybook/react`. The standard `Preview` type export approach was used instead, consistent with existing stories in the codebase.

3. **`@storybook/addon-themes` installed** - Was not in `devDependencies`; installed via `pnpm add -D @storybook/addon-themes`.

4. **Stories glob unchanged** - The plan proposed changing to `../src/stories/**/*.stories.@(ts|tsx)` but the existing glob `../src/**/*.stories.@(ts|tsx)` already covers both the new `src/stories/` location and existing feature stories. Left as-is to avoid breaking existing stories.

## Known Stubs

None. All stories import real components with real props. No hardcoded empty data flows to rendering.

## Self-Check: PASSED

- `.storybook/main.ts` exists with `experimentalRSC: true`: FOUND
- `.storybook/preview.ts` imports globals.css, withThemeByClassName, INITIAL_VIEWPORTS: FOUND
- `package.json` has "build-storybook" script: FOUND
- `src/stories/fixtures.ts` exports mockSources, mockArticles, mockWatermark: FOUND
- All 6 story files exist in `src/stories/ui/`: FOUND
- `.claude/rules/storybook-stories.md` exists: FOUND
- `pnpm build-storybook` exits 0: VERIFIED (two successful builds)
- Commits 6a3ceae, 2596229, 1893729 exist: FOUND
