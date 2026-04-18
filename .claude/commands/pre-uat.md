You are running an automated preliminary UAT pass on my behalf, before I do
manual testing. Your job is to check every item in the UAT spec autonomously,
catch what's obviously wrong, fix it, and leave the UAT file ready for my
manual round — with fewer issues in it.

═══════════════════════════════════════════════════════════
SETUP
═══════════════════════════════════════════════════════════

Phase: $ARGUMENTS

Locate the UAT spec:

PHASE_DIR=$(ls -d .planning/phases/${PHASE_ARG}-* 2>/dev/null | head -1)
UAT_FILE=$(ls "$PHASE_DIR"/*-UAT.md 2>/dev/null | head -1)

If no match is found, list available phases and ask which to use.

Read $UAT_FILE. Identify which tests can be verified autonomously:
- App/UI tests: use Playwright to navigate, interact, and screenshot
- Storybook tests: start Storybook if needed, visit each story via Playwright
- Static/code tests: read source files directly

Note which tests require human judgment, auth, real external data, or
physical devices — mark those skipped with a reason, don't attempt them.

═══════════════════════════════════════════════════════════
HOW TO CHECK EACH TEST
═══════════════════════════════════════════════════════════

Work through every UAT item in order. For each:

1. Read the expected behavior carefully
2. Run the appropriate automated check
3. Record the result immediately using GSD format (see below)

─── FOR APP / UI TESTS ────────────────────────────────────

Use Playwright:
- Navigate to the relevant page, route, or state
- Take a screenshot
- Compare what you see against the expected result
- Also check: console errors, broken images, missing elements,
  wrong copy, layout issues, broken interactions

─── FOR STORYBOOK TESTS ───────────────────────────────────

Start Storybook if not already running. For each referenced story:
- Navigate to the story in Playwright and screenshot it
- Check for ALL of the following:
  • Broken or missing images
  • Overflow or clipping
  • Empty content where content is expected
  • Missing variants or sizes (sm/md/lg etc.)
  • Missing states: loading, empty, error, success
  • Hardcoded markup in stories deviating from the real component
  • Required props not being passed (check console for warnings)
  • Controls not wired to actual props
  • Wrong component usage (raw HTML where a design system
  component should be used)

═══════════════════════════════════════════════════════════
RECORDING RESULTS
═══════════════════════════════════════════════════════════

Write results back into $UAT_FILE. Follow the result format, gap
structure, severity inference rules, and write/commit conventions
defined in:

@~/.claude/get-shit-done/workflows/verify-work.md

Treat yourself as the "user" in that workflow — your automated
observations are the responses. Severity is always inferred from
what you find, never asked.

═══════════════════════════════════════════════════════════
AFTER ALL TESTS ARE RUN
═══════════════════════════════════════════════════════════

Follow the post-session flow from verify-work.md end-to-end —
including commit, diagnosis, fix planning, plan verification,
and routing — preserving all workflow gates exactly as defined there.

Then present a handoff summary:

- How many items passed, had issues, or were skipped
- What was fixed
- Which items still need my manual eyes and why
- The command to start my manual UAT round:
  `/gsd:verify-work $ARGUMENTS`