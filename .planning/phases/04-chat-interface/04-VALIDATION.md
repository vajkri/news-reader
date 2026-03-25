---
phase: 4
slug: chat-interface
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x |
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
| 04-01-01 | 01 | 1 | CHAT-03 | unit | `npx vitest run src/lib/chat-tools.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | CHAT-04 | unit | `npx vitest run src/lib/rate-limit.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | CHAT-01 | manual | Browser verification + `npm run build` | N/A | ⬜ pending |
| 04-02-02 | 02 | 2 | CHAT-02 | manual | Browser verification + `npm run build` | N/A | ⬜ pending |
| 04-03-01 | 03 | 3 | CHAT-01 | manual | Browser verification | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/chat-tools.test.ts` — stubs for CHAT-03 (tool-calling query functions)
- [ ] `src/lib/rate-limit.test.ts` — stubs for CHAT-04 (rate limiting logic)

*CHAT-01 and CHAT-02 are verified via build checks and manual browser verification (streaming chat route + UI components are not suitable for unit/integration tests per RESEARCH.md).*

*Existing vitest infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chat API streams responses with tool-calling | CHAT-01, CHAT-02 | Streaming endpoint requires live LLM + DB; mocking loses signal | 1. Send message via chat panel. 2. Verify streaming response with citations. 3. Verify `npm run build` passes. |
| Chat panel opens/closes with FAB and keyboard shortcut | CHAT-01 | Browser interaction, DOM focus/animation | 1. Click FAB, verify panel slides in. 2. Press Cmd+K, verify toggle. 3. Click close, verify panel hides. |
| Chat panel docks side/bottom and resizes | CHAT-01 | Browser interaction, resize handles | 1. Drag resize handle, verify panel width changes. 2. Toggle dock position, verify layout switch. |
| Streaming response renders progressively | CHAT-02 | Visual streaming behavior | 1. Send message, verify tokens appear progressively. 2. Verify loading dots before first token. |
| Citation source cards are clickable and open article links | CHAT-01 | Browser navigation | 1. Send query that returns articles. 2. Click source card, verify new tab opens to article URL. |
| "Chat about this" from BriefingCard loads article context | CHAT-01 | Cross-component interaction | 1. Navigate to briefing. 2. Click "Chat about this" on a card. 3. Verify panel opens with pinned context card. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
