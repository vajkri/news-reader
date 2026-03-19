# Pitfalls Research

**Domain:** AI-enhanced news reader — RSS ingestion + LLM summarization/classification + chat + push notifications + auth
**Researched:** 2026-03-19
**Confidence:** HIGH (critical pitfalls verified against official docs and real-world incidents)

---

## Critical Pitfalls

### Pitfall 1: Unprotected AI Chat Endpoint Burns Through API Budget

**What goes wrong:**
The `/api/chat` route calls the LLM on every request. Without rate limiting, a single abuser (or a poorly-written frontend that retries on error) can exhaust hundreds of dollars of API quota in minutes. Because LLM API keys live in environment variables and the chat route is server-side, the user never sees the key — but the damage is real. This is the #1 AI app production incident.

**Why it happens:**
Developers build the happy path (authenticated user asks a question, gets an answer) and skip the abuse surface. The endpoint feels "secure" because it's server-side. It isn't — any authenticated session can hammer it.

**How to avoid:**
- Add rate limiting before the AI call on every chat/summarize route. Vercel's official guidance pairs Upstash Ratelimit with `@upstash/ratelimit` and Redis KV for sliding-window limits per user ID.
- Set `maxTokens` on every LLM call — never leave it unbounded.
- For the open-source/self-hosted variant: users who supply their own API keys are self-limiting, but the hosted demo instance needs hard caps.
- Consider per-user daily token budgets stored in the database.

**Warning signs:**
- No `rateLimit` middleware on any AI route
- LLM calls without `maxTokens` set
- `useChat` pointing directly at `/api/chat` with no authentication gate
- Absence of spend alerts in the AI provider dashboard

**Phase to address:**
AI features phase (first phase that introduces any LLM call). Rate limiting must ship with the first AI endpoint, not be retrofitted.

---

### Pitfall 2: Re-Summarizing the Same Articles on Every Cron Run

**What goes wrong:**
The cron job fetches articles every 30 minutes. If summarization is triggered inside the same cron handler without a "summarized" flag check, every new cron run re-summarizes previously processed articles. With 10 feeds × 20 articles = 200 article summaries per run, at Claude Haiku pricing this becomes expensive fast and adds latency that risks hitting Vercel's function timeout.

**Why it happens:**
Summarization logic gets added to the fetch handler because "it runs on new articles anyway." The missing piece: the handler doesn't distinguish between articles that already have summaries and truly new ones.

**How to avoid:**
- Add a `summaryGeneratedAt` nullable timestamp column to the `Article` table in Prisma schema.
- In the summarization job, filter: `WHERE summaryGeneratedAt IS NULL`.
- Decouple summarization from fetch: fetch cron populates articles, a separate cron or background job processes unsummarized articles.
- Cap per-run processing: process at most N articles per invocation.

**Warning signs:**
- Summarization called inside the existing `/api/fetch` handler
- No `summaryGeneratedAt` or `isProcessed` flag in the Article schema
- Cron logs showing identical article IDs being summarized repeatedly

**Phase to address:**
AI features phase (schema migration must come before any summarization code).

---

### Pitfall 3: Sending Full Article Body to the LLM Context on Every Chat Turn

**What goes wrong:**
The chat interface needs access to recent articles to answer "what happened with OpenAI this week?" The naive approach loads the last 100 articles' full text into every chat message as system context. At ~500 tokens per article × 100 articles = 50,000 tokens per request, this costs ~$0.25 per chat turn on Claude Sonnet and will hit context limits or degrade response quality.

**Why it happens:**
RAG (retrieval-augmented generation) is non-trivial to set up, so developers skip it and stuff everything into the context. Works locally with 5 test articles; fails in production with 500+ articles.

**How to avoid:**
- Start with a simple keyword/recency filter: pass only articles matching the user's query terms and from the last N days, capped at 20-30 articles.
- Use article summaries (if already generated) rather than full content for context — already much cheaper.
- Store summaries in a short-text column; pass only title + summary + date as context, not full body.
- If real semantic search is needed later, `sqlite-vec` extension adds vector similarity search to the existing SQLite database without adding infrastructure.

**Warning signs:**
- `context` or `system` prompt includes raw article content without length capping
- No token counting before the LLM call
- Chat latency above 5 seconds on short queries
- Context payloads over 8,000 tokens per request

**Phase to address:**
Chat interface phase. RAG or keyword filtering must be designed before the first chat route is written.

---

### Pitfall 4: Chat History Growing Unbounded Across Sessions

**What goes wrong:**
`useChat` keeps message history in client state per session. If a user has a long conversation (50+ turns) and the client sends the full history on every request, the context window fills with old turns, quality degrades on recent questions, and costs spike. After 150+ messages, this can exceed even 200k token limits.

**Why it happens:**
`useChat` returns the full `messages` array and developers forward it all directly to the `streamText` call. Works fine during development with short test conversations.

**How to avoid:**
- Implement a sliding window: forward only the last 6-10 message pairs to the model.
- For longer sessions, summarize earlier turns before they fall off the window (Vercel AI SDK v5 has documented patterns for "conversation compaction").
- Store conversations in the database, but only send a truncated slice per request.

**Warning signs:**
- Chat route passes `messages` directly from the `useChat` hook without any trimming
- No `maxTokens` ceiling on output
- Users reporting chat gets "confused" or "forgets context" after long sessions (opposite symptoms: too much context degrades reasoning)

**Phase to address:**
Chat interface phase. Sliding window should be in the initial implementation, not added when it breaks.

---

### Pitfall 5: Authentication Retrofit Breaking Existing Data

**What goes wrong:**
The existing `Article`, `Source`, and other tables have no `userId` foreign key. Retrofitting auth means migrating these tables — either adding nullable `userId` columns (leaving old data "anonymous") or doing a data migration. If the migration strategy isn't designed upfront, you end up with orphaned rows, broken foreign key constraints, or a multi-user app where everyone sees everyone's data.

**Why it happens:**
Auth is added "after the core features work," treating it as a layer-on top rather than a schema concern. Prisma migrations on SQLite also have limitations: SQLite doesn't support `ALTER COLUMN` or adding non-nullable foreign keys to existing tables without a full table rebuild.

**How to avoid:**
- Design the auth schema migration before writing any auth code. Decide: are articles/sources shared across all users (global read corpus) or per-user? Given the open-source/personalization requirements, sources and preferences are per-user, but the article corpus can be shared.
- Use Prisma's `db push` to prototype, then `migrate dev` for committed migrations.
- Adding a nullable `userId` to `Source` allows existing sources to remain until claimed; new sources require an owner.
- Keep article corpus global (no userId on Article) — classification/preferences are per-user, not the articles themselves.

**Warning signs:**
- Auth phase starting without a migration plan for existing tables
- Adding `userId NOT NULL` columns to tables with existing rows without a migration
- No decision made on "shared corpus vs. per-user" before coding

**Phase to address:**
Authentication phase (must be the first step, before adding any user-specific features).

---

### Pitfall 6: Push Notifications Silently Failing in Production

**What goes wrong:**
Push notification subscriptions are stored in the database at subscription time. If the `PushSubscription` object expires, the user uninstalls and reinstalls the app, or the browser clears service worker data, the stored subscription becomes invalid. Sending to an invalid endpoint returns HTTP 410 (Gone) — but if the handler doesn't check for 410 and remove the stale subscription, the database fills with dead subscriptions and all sends silently fail for that user.

**Why it happens:**
The "send notification" path is tested with a fresh subscription but never tested after subscription invalidation. The 410 handling code path never executes in development.

**How to avoid:**
- Always check the HTTP status code from the push service. On 410 Gone, delete the subscription from the database immediately.
- On 429 (rate limited by push service), implement exponential backoff.
- Periodically audit subscription health: if a user has received no successful pushes in 30 days, prompt re-subscription.
- iOS PWA push requires "Add to Home Screen" — this is a known requirement; document it clearly for users.

**Warning signs:**
- Push send handler that doesn't check response status
- No subscription cleanup code anywhere in the codebase
- Growing `PushSubscription` table with no deduplication or expiry policy
- iOS users reporting they never receive notifications (likely not added to home screen)

**Phase to address:**
Push notifications phase. 410 handling must ship with the initial implementation.

---

### Pitfall 7: AI Summarization Hallucinating on Fast-Moving AI News Stories

**What goes wrong:**
BBC/EBU research (2025) found 45% of AI-generated news summaries had at least one significant error. AI news — model releases, acquisitions, benchmark comparisons — is especially risky because: (1) the training cutoff means the model may "know" old facts about the same company/model and blend them in, and (2) summaries can misattribute claims when multiple actors are named in a single article.

**Why it happens:**
Summarization prompts that say "summarize this article" without grounding constraints invite the model to fill gaps from training data. For AI industry news, the model has strong priors (e.g., GPT-4 capabilities, Anthropic announcements) that can override the article's actual content.

**How to avoid:**
- Ground the prompt: "Summarize ONLY the information in the provided text. Do not add any information not present in the article. If uncertain, use the article's exact wording."
- Use temperature 0 or very low for summarization (not chat).
- Pass publication date in the system prompt so the model can flag if it's summarizing potentially outdated content.
- Keep summaries short (3 bullet points max) — shorter outputs hallucinate less.
- For article display, show the original title and source next to every AI summary so users can verify.

**Warning signs:**
- Summarization prompt without "only use information from this text" instruction
- Temperature set above 0 for deterministic summarization tasks
- No original article link shown alongside AI summary
- Users reporting factual errors in summaries

**Phase to address:**
AI features phase (prompt design and grounding constraints in the initial summarization implementation).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Call LLM in same handler as cron fetch | Simpler code, one deployment | Can't independently scale, retry, or monitor AI processing; cron hits 60s timeout | Never — decouple from day one |
| Use global app API key for all users | Zero auth complexity | Open-source users expect to bring their own key; shared key creates shared cost/rate-limit | Only for a locked-down single-user deploy |
| Skip rate limiting on chat route | Faster to ship | Single abusive request can exhaust API budget | Never — rate limiting is not optional |
| Store full article body in context for chat | Easier to retrieve | Token costs explode; quality degrades with many articles | Prototype/demo only, not production |
| Nullable userId on existing tables | Avoids migration complexity | Anonymous data accumulates; future multi-user queries become complex | Acceptable as transitional state for < 1 sprint |
| No sliding window on chat history | Simpler `useChat` integration | Long conversations degrade in quality and cost spikes | Prototype only |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vercel AI SDK `streamText` | Forgetting `maxTokens` — open-ended generation | Always set `maxTokens` per task type: summaries ~200, chat replies ~800 |
| Vercel AI SDK `useChat` | Forwarding full `messages` array to API | Slice to last N turns server-side before passing to `streamText` |
| Vercel AI Gateway | Using gateway URL but still hardcoding provider model strings | Use the gateway's provider-agnostic model references so switching providers doesn't require code changes |
| Web Push `web-push` library | Not handling 410 Gone from push endpoints | Delete stale subscription on 410; back off on 429 |
| NextAuth.js / Auth.js | Missing `NEXTAUTH_SECRET` in Vercel production env | Set secret before first deployment; rotating it invalidates all active sessions |
| NextAuth.js middleware | Using database strategy with Edge middleware | Edge middleware requires JWT strategy — use `strategy: "jwt"` |
| Prisma + SQLite in production | Dual adapter setup (better-sqlite3 + libsql) | Confirm which adapter is live in Vercel (should be libsql/Turso); test migrations in that environment, not just locally |
| Prisma migrations + SQLite | Adding NOT NULL foreign key to populated table | SQLite requires table rebuild; use `npx prisma migrate dev` and test on a copy of prod data before applying |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Summarizing articles in the cron handler | Cron runs approach 60s limit; articles get partially processed | Separate summarization job; use `summaryGeneratedAt` flag | ~20+ articles per run |
| Fetching all sources in parallel without batching | Already present (documented in CONCERNS.md) | Batch in groups of 5 as noted | ~15+ feeds |
| Unbounded chat context | Slow responses; cost spike; degraded quality | Sliding window of 6-10 pairs; use summaries for older turns | ~20 conversation turns |
| Loading 100 raw articles into chat context | Per-request token cost $0.10+ | Keyword filter + summary-only context | 10+ articles |
| No pagination on article listing | Already present (documented in CONCERNS.md) | Cursor-based pagination | 100+ articles |
| Streaming AI responses on Vercel Hobby | Function timeout cuts stream mid-response | Use Vercel Pro for AI features, or split into smaller completions | Responses > 30 seconds generation time |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| No CRON_SECRET on `/api/fetch` (existing) | Anyone can trigger feed fetch | Add `Authorization: Bearer ${CRON_SECRET}` check (documented in CONCERNS.md) |
| No rate limiting on `/api/chat` | API budget exhaustion from a single abuser | Upstash Ratelimit per authenticated user ID; sliding window |
| Exposing AI provider API key in client code | Key scraped from browser DevTools | All LLM calls must be server-side only; never `NEXT_PUBLIC_` for AI keys |
| Storing push VAPID private key in client | VAPID private key must stay server-side | `VAPID_PRIVATE_KEY` as a regular (non-`NEXT_PUBLIC_`) env var only |
| Open-source app using shared API key | All public forks of the project share costs | Document user-supplied API key pattern in setup instructions; support `ANTHROPIC_API_KEY` per-instance env var |
| No auth on AI routes before auth phase ships | Anyone with the URL can call LLM endpoints | If AI features ship before auth, add IP-based or basic token protection as a temporary gate |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing a wall of AI summary text | Defeats ADHD-accessible design goal | 3-bullet summary max; expandable for detail; never more than 80 words per summary |
| Streaming AI response into a narrow mobile card | Text jumps as it streams; disorienting | Stream into a dedicated chat panel or summary drawer, not inline in the article list |
| Push notification prompt on first page load | Browser permission denied rate spikes above 90% | Prompt only after user has visited 3+ times or explicitly clicks "Notify me" |
| "Generating..." spinner with no timeout | User waits indefinitely if LLM call hangs | Show spinner with 30s timeout fallback; display "Try again" if stream stalls |
| AI classification tags with no explanation | Users confused by mystery labels like "infra" | Either use plain-language categories users configured, or show a tooltip with the confidence level |
| Chat response with no article attribution | User can't verify AI's claim | Include article title + link in every factual statement from chat |

---

## "Looks Done But Isn't" Checklist

- [ ] **AI summarization:** Summaries display correctly — verify the `summaryGeneratedAt` flag is set, no re-processing of existing summaries on next cron run
- [ ] **Chat interface:** Chat answers questions — verify rate limiting is active and sliding window is enforced (test with 30+ turn conversation)
- [ ] **Push notifications:** Notifications send in dev — verify 410 Gone handling removes stale subscriptions in production; verify iOS requires PWA install
- [ ] **Authentication:** Users can log in — verify `NEXTAUTH_SECRET` is set in Vercel production env; verify existing Article/Source data is accessible post-migration
- [ ] **AI classification:** Tags appear on articles — verify a "no category" fallback exists for articles that don't fit user-defined topics
- [ ] **Cron job:** Feed fetches run — verify `CRON_SECRET` authorization is enforced (existing gap from CONCERNS.md)
- [ ] **Open-source deploy:** App works with creator's key — verify a new self-hoster can configure their own `ANTHROPIC_API_KEY` without code changes

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Runaway API costs from unprotected chat | HIGH | Rotate API key immediately; add rate limiting; audit usage logs; potentially dispute charges with provider |
| Re-summarization loop | LOW | Add `summaryGeneratedAt` filter; re-run is idempotent as summaries are overwriteable |
| Chat context explosion | LOW | Reduce sliding window; deploy immediately; no data loss |
| Broken auth migration | HIGH | Rollback Prisma migration; restore from SQLite backup; re-plan migration with nullable columns first |
| Stale push subscriptions | LOW | Backfill: send test push to all stored subscriptions, delete any that return 410 |
| Hallucinating summaries in production | MEDIUM | Update prompt with grounding constraints; mark affected articles for re-summarization; add disclaimer in UI |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Unprotected AI chat endpoint | AI Features (first LLM route) | Attempt 20 rapid requests without auth; confirm rate limit returns 429 |
| Re-summarizing existing articles | AI Features (schema migration) | Confirm `summaryGeneratedAt` column exists; run cron twice, verify no duplicate processing |
| Unbounded chat context | Chat Interface (initial implementation) | Send 30-turn conversation; verify token count per request stays below 8,000 |
| Chat history growth | Chat Interface (initial implementation) | Long conversation test; verify sliding window truncation in server logs |
| Auth retrofit breaking existing data | Authentication (migration planning) | Run migration on copy of prod SQLite; verify all existing articles/sources remain accessible |
| Push subscription staleness | Push Notifications | Manually invalidate a subscription; verify it is deleted from DB on next send attempt |
| AI hallucination on news | AI Features (prompt design) | Test summarization on 5 known articles; check for facts not present in source text |
| Missing CRON_SECRET | Phase 1 / Security hardening | Attempt POST to `/api/fetch` without header; confirm 401 response |

---

## Sources

- [Vercel: Securing AI Apps with Rate Limiting](https://vercel.com/kb/guide/securing-ai-app-rate-limiting) — HIGH confidence, official Vercel KB
- [Vercel AI SDK: Rate Limiting docs](https://ai-sdk.dev/docs/advanced/rate-limiting) — HIGH confidence, official AI SDK docs
- [Vercel AI SDK: Core Settings (maxTokens)](https://ai-sdk.dev/docs/ai-sdk-core/settings) — HIGH confidence, official docs
- [BBC/EBU study: AI summaries accuracy](https://www.theregister.com/2025/02/12/bbc_ai_news_accuracy/) — HIGH confidence, published study with specific error rates (45% had significant issues)
- [Bloomberg AI summary corrections incident](https://generative-ai-newsroom.com/the-news-industrys-genai-cautionary-tales-84387d1ca087) — HIGH confidence, documented incident
- [Vercel AI SDK v5 conversation compaction](https://community.vercel.com/t/how-to-implement-conversation-compaction-with-ai-sdk-v5/29171) — MEDIUM confidence, community discussion with official SDK context
- [LLM context degradation beyond 100k tokens (Anthropic research)](https://medium.com/@miteigi/the-role-of-long-context-in-llms-for-rag-a-comprehensive-review-499d73367e89) — MEDIUM confidence, references Anthropic finding
- [sqlite-vec for vector search on SQLite](https://github.com/asg017/sqlite-vec) — HIGH confidence, official GitHub repo
- [NextAuth session persistence pitfalls](https://clerk.com/articles/nextjs-session-management-solving-nextauth-persistence-issues) — MEDIUM confidence (Clerk-authored, competitor bias possible, but pitfalls match known Auth.js issues)
- [Web Push 410 handling — MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Re-engageable_Notifications_Push) — HIGH confidence, MDN official docs
- Known issues from `.planning/codebase/CONCERNS.md` (codebase audit 2026-03-19) — HIGH confidence, direct codebase analysis

---

*Pitfalls research for: AI news tracker companion — RSS + LLM + chat + push + auth*
*Researched: 2026-03-19*
