---
created: 2026-03-19T17:07:41.923Z
title: Add body validation to articles PATCH endpoint
area: api
files:
  - src/app/api/articles/[id]/route.ts:17
---

## Problem

The PATCH endpoint for toggling article read status does not validate that `body.isRead` is a boolean. Non-boolean values could cause Prisma runtime errors.

Identified in PR #4 code review (comment #10).

## Solution

Validate `isRead` is a boolean before passing to Prisma. Return 400 with descriptive error if validation fails.
