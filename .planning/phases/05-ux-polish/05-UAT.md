---
status: testing
phase: 05-ux-polish
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md, 05-04-SUMMARY.md, 05-05-SUMMARY.md, 05-06-SUMMARY.md]
started: 2026-04-05T08:00:00Z
updated: 2026-04-08T10:00:00Z
---

## Current Test

number: 19-21
name: Sources/Chat Stories, Layout Stories, Page Stories
expected: |
  19. SourceList: default/empty/error/delete-confirm. SourceForm: empty/validation. ChatPanel: closed/open/article/mobile.
  20. NavLinks: each route active. HamburgerMenu: closed/open.
  21. Pages/Feed and Pages/Sources render with mock data without errors.
awaiting: user response

## Tests

### 1. Feed Thumbnails
expected: On the feed page, enriched articles show a colored topic icon in the thumbnail column. Unenriched articles show a colored circle with the source's initial letter. No rows show an empty dash placeholder.
result: pass

### 2. Feed NEW Badges
expected: Articles added since your last visit show a "NEW" badge next to the title. On a second visit (or page reload), those badges disappear (watermark updated).
result: pass

### 3. Feed Mobile View
expected: Below 640px width: table is replaced by a stacked card list with source, time, read toggle, and chat buttons. Toolbar controls stack full-width.
result: pass

### 4. Navigation Active State
expected: The current page's nav link appears bold and uses foreground color. Other nav links appear at normal weight and muted color. Check on Feed, Briefing, and Sources pages.
result: pass

### 5. Hamburger Menu (Mobile)
expected: Below 640px: a hamburger icon replaces desktop nav links. Tapping it opens a slide-in drawer with nav links. Pressing Escape closes it.
result: pass

### 6. Sources Page Visual Refresh
expected: Each source row shows a colored initial circle (SourceAvatar). Clicking Delete shows inline "Delete source" / "Keep source" buttons instead of a browser confirm dialog.
result: pass

### 7. Sources Mobile Layout
expected: Below 640px: URL column is hidden from the table. Add-source form inputs stack vertically.
result: pass

### 8. Chat Panel Mobile
expected: Below 640px: the chat panel expands to full viewport width. Resize handle is hidden on mobile.
result: pass

### 9. Briefing Mobile Polish
expected: At 375px width: BriefingCards render without horizontal overflow. DateStepper prev/next buttons are comfortably tappable (44px targets).
result: pass

### 10. Briefing Copy
expected: Caught-up state shows "You are caught up." and archive banner shows "Viewing archive: {date}".
result: pass

### 11. Focus-Visible Outlines
expected: Tabbing through article title links, nav links, and feed mobile list links shows a visible focus ring (primary color outline). Clicking with mouse does NOT show the ring.
result: pass

### 12. Storybook Build and Config
expected: `pnpm build-storybook` passes with exit 0. Storybook toolbar shows a dark mode toggle (via @storybook/addon-themes) and a 375px mobile viewport option.
result: pass

### 13. Storybook Dark Mode Toggle
expected: Toggling dark mode in Storybook toolbar applies the `dark` class to the preview. Components switch to dark color tokens (dark backgrounds, light text). Toggling back restores light mode.
result: pass

### 14. UI Primitive Stories: Button and Badge
expected: Button stories show all 4 variants (default, outline, ghost, destructive) and sizes (sm, default, lg, icon). Badge stories show all 6 variants (default, secondary, outline, critical, important, notable).
result: pass

### 15. UI Primitive Stories: SourceAvatar and TopicIcon
expected: SourceAvatar stories show deterministic colored circles with initials for different source names, in sm and md sizes. TopicIcon stories show correct Lucide icons for all 7 named topics plus a fallback for unknown topics.
result: pass

### 16. Feed Feature Stories
expected: FeedTable story renders a populated table with mock articles. FeedMobileList story shows stacked cards with NEW badges and search highlighting. FeedToolbar story shows filter controls.
result: issue
reported: "broken image at http://localhost:6006/?path=/story/features-feed-feedtable--default. Dark should be the default theme."
severity: major

### 17. Briefing Feature Stories
expected: BriefingCard stories show all 3 importance tiers (critical, important, notable). DateStepper stories show today and archive dates. StatusBar stories cover morning, evening, caught-up, and pending enrichment states.
result: issue
reported: "Page stories should not be duplicating markup EVER. Should use page components with mock data instead (e.g. from src/app/page.tsx). Different states should be simulated by passing different mock data."
severity: major

### 18. Briefing Page Stories (5 States)
expected: Pages/Briefing in Storybook shows 5 composition stories: morning visit, evening visit, caught up, archive, and pending enrichment. Each renders without errors.
result: issue
reported: "Page stories should not be duplicating markup EVER. Should use page components with mock data instead (e.g. from src/app/page.tsx). Different states should be simulated by passing different mock data."
severity: major

### 19. Sources and Chat Feature Stories
expected: SourceList stories show default, empty, error, and delete confirmation states. SourceForm stories show empty form and validation error. ChatPanel stories show closed, open, with article context, and mobile states.
result: issue
reported: "cannot resize chat on mobile. default height of chat on mobile should be what the current max height is."
severity: major

### 20. Layout Feature Stories
expected: NavLinks stories show each route (feed, briefing, sources) as the active page. HamburgerMenu stories show closed and open states.
result: issue
reported: "unnecessary stories: HamburgerMenu--open-briefing-active, HamburgerMenu--open-sources-active, NavLinks--feed-active, NavLinks--sources-active"
severity: minor

### 21. Feed and Sources Page Stories
expected: Pages/Feed story renders the full feed page composition with mock data. Pages/Sources story renders with source list and form. Both render without errors.
result: pass

## Summary

total: 21
passed: 16
issues: 5
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Enriched articles show colored topic icon; unenriched show colored circle with source initial"
  status: failed
  reason: "User reported: Initials should be multi-letter (min 2, max 3). Avatar colors too vivid; icons need white bg with colored icons for balance."
  severity: cosmetic
  test: 1
  artifacts: []
  missing: []

- truth: "FeedTable story renders a populated table with mock articles"
  status: failed
  reason: "User reported: broken image at FeedTable--default story. Dark should be the default theme."
  severity: major
  test: 16
  artifacts: []
  missing: []

- truth: "BriefingCard stories show all 3 importance tiers. DateStepper, StatusBar cover all states."
  status: failed
  reason: "User reported: Page stories should not be duplicating markup. Should use page components with mock data instead."
  severity: major
  test: 17
  artifacts: []
  missing: []

- truth: "Pages/Briefing shows 5 composition stories rendering without errors"
  status: failed
  reason: "User reported: Page stories should not be duplicating markup EVER. Should use actual page components from src/app/ with mock data. Different states simulated by passing different mock data."
  severity: major
  test: 18
  artifacts: []
  missing: []

- truth: "ChatPanel mobile states show closed, open, with article context, mobile variants"
  status: failed
  reason: "User reported: cannot resize chat on mobile. Default height of chat on mobile should be what the current max height is."
  severity: major
  test: 19
  artifacts: []
  missing: []

- truth: "NavLinks stories show each route as active; HamburgerMenu shows closed/open"
  status: failed
  reason: "User reported: unnecessary stories: HamburgerMenu--open-briefing-active, HamburgerMenu--open-sources-active, NavLinks--feed-active, NavLinks--sources-active. Remove duplicate per-route active stories."
  severity: minor
  test: 20
  artifacts: []
  missing: []
