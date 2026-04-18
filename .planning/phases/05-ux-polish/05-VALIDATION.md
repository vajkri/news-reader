---
phase: 05
slug: ux-polish
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-03
---

# Phase 05 -- Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | ESLint + Next.js build (TypeScript strict) |
| **Config file** | next.config.ts, eslint.config.mjs |
| **Quick run command** | `pnpm lint && pnpm build` |
| **Full suite command** | `pnpm lint && pnpm build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm lint && pnpm build`
- **After every plan wave:** Run `pnpm lint && pnpm build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 05-01-T1 | 01 | 1 | UX-01 | build + lint | `pnpm build` | pending |
| 05-01-T2 | 01 | 1 | UX-02 | build + lint | `pnpm build` | pending |
| 05-01-T3 | 01 | 1 | UX-01 | build + lint | `pnpm build` | pending |
| 05-02-T1 | 02 | 2 | UX-01 | build + lint | `pnpm build` | pending |
| 05-02-T2 | 02 | 2 | UX-01, UX-02 | build + lint | `pnpm build` | pending |
| 05-03-T1 | 03 | 2 | UX-01, UX-02 | build + lint | `pnpm build` | pending |
| 05-03-T2 | 03 | 2 | UX-02 | build + lint | `pnpm build` | pending |
| 05-03-T3 | 03 | 2 | UX-01 | build + lint | `pnpm build && pnpm lint` | pending |
| 05-04-T1 | 04 | 3 | UX-01, UX-02 | build + lint | `pnpm build` | pending |
| 05-04-T2 | 04 | 3 | UX-01 | build + lint | `pnpm build && pnpm lint` | pending |
| 05-04-T3 | 04 | 3 | UX-01, UX-02 | manual | visual checkpoint | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. Lint + build verify TypeScript correctness and component rendering. No additional test setup needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Card-based layouts with visual hierarchy | UX-01 | Visual design quality | Open each view, verify card layouts, clear hierarchy, no dense text blocks |
| Mobile responsive at 375px | UX-02 | Viewport testing | Open devtools, set width to 375px, verify all views render without horizontal scroll |
| Dark mode contrast | UX-01 | WCAG contrast ratios | Toggle dark mode, verify text/background contrast meets 4.5:1 AA |
| ADHD-friendly information density | UX-01 | Subjective UX | Verify bite-sized information chunks, scannable layout |
| Holistic design consistency | UX-01 | Cross-view comparison | Compare visual patterns across feed, briefing, sources, chat |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready
