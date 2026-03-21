---
created: 2026-03-21T19:02:30.783Z
title: Evaluate enrichment model and prompt for better briefing quality
area: ai-enrichment
files:
  - src/lib/ai.ts:6
  - src/lib/enrich.ts:79-95
  - .superpowers/assets/ai-gateway-models.md
---

## Problem

Current enrichment model (`google/gemini-2.5-flash-lite`, $0.10/$0.40 per M tokens) produces summaries and importance scores that could be higher quality. Better enrichment directly improves daily briefing usefulness since chat responses are grounded in these summaries.

## Solution

Two-part evaluation:

**1. Model comparison (budget: under $1/M both in and out)**
Run test enrichment batches on the same set of articles with different models, compare summary quality and importance scoring accuracy:
- `deepseek/deepseek-v3.2` ($0.28/$0.42) — strong reasoning, good for importance scoring
- `google/gemini-3.1-flash-lite-preview` ($0.25/$1.50) — Newer than `google/gemini-2.5-flash-lite`.
- `openai/gpt-4.1-mini` ($0.40/$1.60) — Proven tool-calling. Solid mid-tier.
- Current `google/gemini-2.5-flash-lite` as baseline

**2. Prompt tuning**
Experiment with enrichment prompt instructions (`SYSTEM_PROMPT` and `buildBatchPrompt` in `src/lib/enrich.ts`) to improve:
- Summary quality (more insightful, less generic)
- Importance scoring accuracy (better calibration of 1-10 scale)
- Topic classification precision

Reference: `.superpowers/assets/ai-gateway-models.md` for full model pricing list.
