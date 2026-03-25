---
created: 2026-03-21T17:11:20.170Z
title: Rotate leaked CRON_SECRET and scrub from git history
area: general
files:
  - vercel.json
  - .env.local
---

## Problem

The `CRON_SECRET` value has been committed to the repository, exposing it in git history. This is a security vulnerability: anyone with repo access can read the secret and forge cron job requests.

Three things need to happen:
1. **Rotate the secret** in Vercel environment variables (the old value is compromised)
2. **Remove the secret from git history** (BFG Repo Cleaner or `git filter-repo`)
3. **Verify `.env*.local` is in `.gitignore`** to prevent future leaks

## Solution

1. Generate a new `CRON_SECRET` value
2. Update it in Vercel env vars (`vercel env rm CRON_SECRET` + `vercel env add CRON_SECRET`)
3. Run `vercel env pull` to update local `.env.local`
4. Scrub the old value from git history using BFG or git filter-repo
5. Force push the cleaned history
6. Confirm the cron endpoint rejects requests with the old secret
