---
status: awaiting_human_verify
trigger: "After cleanup-dupes cron runs, some winner articles disappear from the briefing. Winners 951, 1001, 1019, 978, 965 -- some now missing."
created: 2026-04-02T00:00:00Z
updated: 2026-04-02T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED -- two code paths set duplicateOf without checking winner status
test: Read all relevant files -- complete
expecting: n/a
next_action: Await human verification that winners no longer disappear after a dedup run

## Symptoms

expected: Winner articles (IDs 951, 1001, 1019, 978, 965) should remain visible in the briefing after dedup marks their duplicates
actual: Some winner articles from the last dedup run cannot be found in the briefing
errors: No errors reported -- articles silently disappear
reproduction: Run cleanup-dupes cron, then check briefing for winner articles
started: Discovered after the last cleanup-dupes run

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-04-02T00:00:00Z
  checked: cleanup-dupes/route.ts lines 28-32
  found: Query fetches articles WHERE duplicateOf IS NULL -- this includes articles that are winners (other articles point to them). The `claimed` set only prevents duplicates within a single run, not across runs.
  implication: A winner from a previous run can be fed to the AI as a candidate and get picked as a duplicateId in a new group.

- timestamp: 2026-04-02T00:00:00Z
  checked: enrich/stream/route.ts line 64
  found: `duplicateOf: result.duplicateOf` is written unconditionally -- no check whether the article is already a winner (has other articles pointing to it).
  implication: Enrichment AI can mark a winner as a duplicate, overwriting its null duplicateOf with a non-null value.

- timestamp: 2026-04-02T00:00:00Z
  checked: enrich.ts ArticleEnrichmentSchema / SYSTEM_PROMPT
  found: The AI is only given articles in the current batch. It cannot know if an article in the batch is already a winner from a prior cleanup-dupes run. No instruction prevents it from marking any batch article as a duplicate.
  implication: Even a correctly-prompted AI has no way to avoid this -- the constraint must be enforced in code.

## Resolution

root_cause: Two code paths set duplicateOf on articles without checking if the article is already a winner (i.e., has other articles with duplicateOf pointing to it). (1) cleanup-dupes fetches all non-duplicate articles as candidates, so existing winners can be re-evaluated and mistakenly assigned as duplicates. (2) enrich/stream writes duplicateOf from AI output unconditionally.
fix: (1) In cleanup-dupes/route.ts: after validating groups, skip any article that is already a winner (query DB for articles that have duplicateOf pointing to any candidate ID, then exclude those from being marked as dupes). (2) In enrich/stream/route.ts: before saving, filter out duplicateOf values that refer to articles that are already winners, or skip setting duplicateOf if the article being saved is already a winner.
verification: Build passes clean. Pre-existing lint errors in unrelated files (Storybook story, test file).
files_changed: [src/app/api/cleanup-dupes/route.ts, src/app/api/enrich/stream/route.ts]
