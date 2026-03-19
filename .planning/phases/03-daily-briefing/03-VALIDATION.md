---
phase: 3
slug: daily-briefing
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.1.0 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | BRIEF-01 | unit | `npx vitest run src/lib/__tests__/briefing.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | BRIEF-02 | unit | `npx vitest run src/lib/__tests__/briefing.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | BRIEF-03 | unit | `npx vitest run src/lib/__tests__/briefing.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/__tests__/briefing.test.ts` — stubs for BRIEF-01, BRIEF-02, BRIEF-03
- [ ] Briefing utility module test coverage for topic grouping, importance ranking, date windowing

*Existing vitest infrastructure covers framework needs. Only test files required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Briefing card visual layout (scannable, no text walls) | BRIEF-02 | Visual/layout assessment | Open /briefing, verify cards show headline + summary + importance badge, no long paragraphs |
| Topic section headings visually distinct | BRIEF-03 | Visual assessment | Open /briefing with multi-topic data, verify each group has clear heading |
| Date stepper navigation UX | BRIEF-01 | Client interaction | Click prev/next date buttons, verify URL updates and content refreshes |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
