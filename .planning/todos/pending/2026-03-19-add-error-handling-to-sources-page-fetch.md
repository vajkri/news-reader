---
created: 2026-03-19T17:07:41.923Z
title: Add error handling to sources page fetch
area: ui
files:
  - src/app/sources/page.tsx:12-14
---

## Problem

Sources page fetches data with no error handling. The fetch chain has no `.catch()` and no `res.ok` check. A 500 response gets passed to `setSources` as error JSON, likely causing a runtime error. Unhandled promise rejection in console.

Identified in PR #4 code review (comment #6).

## Solution

Add `.catch()` handler and check `res.ok` before passing to state setter. Show an error state in the UI when fetch fails.
