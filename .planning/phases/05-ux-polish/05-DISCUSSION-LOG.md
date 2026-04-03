# Phase 5: UX Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-03
**Phase:** 05-ux-polish
**Areas discussed:** Feed redesign, Mobile responsiveness, Visual consistency, Navigation and layout

---

## Feed Redesign

### Layout style

| Option | Description | Selected |
|--------|-------------|----------|
| Card-based | Each article is a card. More visual, more space for fallback images/icons. Bigger redesign. | |
| Compact list | Keep list-style rows but with better visual treatment: larger touch targets, badges, fallback icons inline. Less visual but denser. | ✓ |
| Hybrid | Cards on mobile, compact list on desktop. Responsive switch at a breakpoint. | |

**User's choice:** Compact list
**Notes:** None

### Fallback visual strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Source favicon only | Always show source favicon. Simple, always available, recognizable. No dependency on enrichment. | |
| Layered: favicon then topic | Show favicon immediately, swap to topic icon once enriched. More visual info but adds complexity. | |
| Topic icon + colored initial | Topic icon when enriched, colored source initial when not yet enriched. No favicon fetching needed. | ✓ |

**User's choice:** Topic icon + colored initial
**Notes:** User asked about fetch/enrich gap. Confirmed enrichment is decoupled from fetch (GitHub Actions every 4h). Topic icons require enrichment; colored initials work immediately.

### NEW badge definition

| Option | Description | Selected |
|--------|-------------|----------|
| Watermark-based | Same model as briefing: articles fetched since last feed page visit get NEW badge. Reuses watermark pattern. | ✓ |
| Time-based | Articles from last N hours get NEW badge. Simpler, no state tracking. | |
| Unread-based | Articles not yet clicked/opened get NEW. Requires tracking read state per article. | |

**User's choice:** Watermark-based
**Notes:** None

---

## Mobile Responsiveness

### Header nav on mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Hamburger menu | Collapse nav links into hamburger icon. Standard mobile pattern. | ✓ |
| Bottom tab bar | Fixed bottom bar with icons. Thumb-friendly, always visible, app-like. | |
| Scrollable top bar | Keep horizontal nav links, allow horizontal scroll. Minimal change. | |

**User's choice:** Hamburger menu
**Notes:** None

### Chat panel on mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Full-screen overlay | Chat takes over entire screen when open. Back button to return. | |
| Bottom sheet | Slides up from bottom, draggable height. Can peek at page behind it. | |
| Keep current | Current side panel behavior is fine. Let CSS handle the collapse. | |

**User's choice:** Other (free text)
**Notes:** "I just want chat to default to the side on mobile and be full-width without the possibility to resize on smallest screens"

### Feed on mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Stacked list items | Each article becomes a stacked row: icon + title on top, metadata below. No horizontal scrolling. | ✓ |
| Horizontal scroll table | Keep table, allow horizontal scroll. Less work but awkward touch UX. | |
| You decide | Claude picks best responsive approach during implementation. | |

**User's choice:** Stacked list items
**Notes:** None

### Briefing mobile layout

**User's choice:** You decide (Claude's discretion)
**Notes:** Briefing is already card-based, should adapt well.

---

## Visual Consistency

### Typography todo

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, fold it in | Fix typography inconsistencies as part of visual consistency pass. Natural fit. | ✓ |
| No, separate concern | Keep as standalone todo. Phase 5 focuses on layout/UX, not font auditing. | |

**User's choice:** Yes, fold it in
**Notes:** None

### Card primitive

| Option | Description | Selected |
|--------|-------------|----------|
| Shared Card primitive | Create reusable Card component in ui/ that all views use. | |
| Keep independent | Each view keeps own card styling. Not coupled. | |
| You decide | Claude evaluates during implementation. | ✓ |

**User's choice:** You decide
**Notes:** None

### Text hierarchy audit

| Option | Description | Selected |
|--------|-------------|----------|
| Let frontend-design audit | Frontend-design skill audits all views and flags hierarchy issues. | ✓ |
| I have specific pain points | User knows which areas feel off. | |

**User's choice:** Let frontend-design audit
**Notes:** None

### Dark mode

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated pass | Audit dark mode specifically: contrast ratios, card backgrounds, borders. | ✓ |
| Token-based is fine | Current approach handles it. No dedicated work. | |
| You decide | Claude checks during implementation if needed. | |

**User's choice:** Dedicated pass
**Notes:** None

---

## Navigation and Layout

### Active state indicator

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, active indicator | Highlight current page link (bold, underline, or primary color). | ✓ |
| Keep minimal | Current hover-only style is sufficient. | |
| You decide | Claude implements appropriate active state. | |

**User's choice:** Yes, active indicator
**Notes:** None

### App shell structure

| Option | Description | Selected |
|--------|-------------|----------|
| Keep current structure | Sticky header + main content + chat overlay. Just polish details. | ✓ |
| Add a sidebar | Move nav to collapsible sidebar. More room for future features. | |
| You decide | Claude evaluates if structural changes needed. | |

**User's choice:** Keep current structure
**Notes:** None

### Sources page priority

| Option | Description | Selected |
|--------|-------------|----------|
| Visual refresh | Polish sources page to match overall design. Consistent everywhere. | ✓ |
| Low priority | Sources is admin/setup only. Functional is fine. | |
| You decide | Claude includes if time permits. | |

**User's choice:** Visual refresh
**Notes:** None

---

## Claude's Discretion

- Card primitive decision (shared vs independent)
- Active state indicator style
- Briefing mobile responsive layout
- Topic icon mapping
- Colored initial palette
- Feed row height/spacing
- Sources page visual refresh approach

## Deferred Ideas

None -- discussion stayed within phase scope

## Additional User Directives

- Frontend-design skill must audit the entire app for UX/UI enhancements
- Extra focus on briefing page: all states, flows, UX enhancement suggestions
- NEW badge in feed should feel consistent with briefing's "New" treatment
