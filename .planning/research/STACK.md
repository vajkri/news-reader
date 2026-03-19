# Stack Research

**Domain:** AI-powered news reader — adding AI features, authentication, and push notifications to existing Next.js 16 app
**Researched:** 2026-03-19
**Confidence:** HIGH (all key claims verified against official docs and current npm releases)

---

## Context: What Already Exists

The following are **already in place** and do not need to be chosen:

| Already Installed | Version | Role |
|-------------------|---------|------|
| Next.js | 16.1.7 | App framework with App Router |
| React | 19.2.3 | UI library |
| Prisma | 5.22.0 | ORM |
| better-sqlite3 | 12.8.0 | SQLite driver |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | current | Component system |
| lucide-react | 0.577.0 | Icons |

Everything below is the **additive stack** for the new milestone.

---

## Recommended Stack

### AI Layer

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `ai` (Vercel AI SDK) | ^6.0.130 | Core AI primitives: generateText, streamText, structured output | Official AI SDK for Next.js. v6 is current stable (released Dec 2025). Integrates with Server Components, Server Actions, and Route Handlers natively. Provider-agnostic. |
| `@ai-sdk/react` | ^3.0.132 | `useChat` hook for the chat interface | Ships with AI SDK. Handles streaming, optimistic updates, and message state client-side without manual WebSocket management. |
| `@ai-sdk/anthropic` | ^3.0.58 | Claude provider | Lightweight provider package. Decoupled so swapping to OpenAI/Google later requires only changing the provider import and model string — no other code changes. |
| `zod` | ^3.x | Schema validation for structured AI output | Required by AI SDK for typed classification/summarization outputs. Already likely available; add if not present. |

**How AI Gateway fits in:** The `ai` package includes the Vercel AI Gateway provider by default. Set `AI_GATEWAY_API_KEY` in environment to route through the gateway. For self-hosted deployments where users supply their own keys, use `@ai-sdk/anthropic` directly with `ANTHROPIC_API_KEY` — the provider abstraction is the same either way.

**AI SDK v6 key patterns for this project:**

- **Summarization:** `generateText` with `output: Output.object({ schema: z.object({ summary, keyPoints, category }) })` — combines generation and structured extraction in one call.
- **Classification:** Same pattern with `category: z.enum([...])` in the Zod schema — type-safe, validated output.
- **Chat interface:** `streamText` on a Route Handler + `useChat` client hook. The SDK handles streaming protocol; no WebSocket setup needed.
- **generateObject / streamObject are deprecated in v6** — use `generateText`/`streamText` with the `output` setting instead.

### Authentication

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `better-auth` | ^1.5.5 | Full authentication system | Auth.js (NextAuth) is entering maintenance mode and its team has handed stewardship to Better Auth. Official guidance: "If you're starting something new, we recommend Better Auth." Self-hosted, open-source, free. |
| `@better-auth/prisma` | bundled in better-auth | Prisma adapter | Native Prisma integration — auto-generates the auth schema additions with `npx @better-auth/cli generate`. No manual schema writing. |

**Why Better Auth over Auth.js v5:**
Auth.js v5 has been in beta for over a year with no stable release roadmap. The Auth.js team transferred maintenance to the Better Auth team in early 2026. Better Auth provides the same self-hosted, open-source model, with superior TypeScript ergonomics, auto schema generation, and built-in features (2FA, sessions, organizations) that would require plugins in Auth.js. Source: https://github.com/nextauthjs/next-auth/discussions/13252

**Why Better Auth over Clerk:**
This project is explicitly open-source and self-hostable. Clerk is a managed service — user data lives on Clerk's servers. That is incompatible with the project's constraint of supporting self-hosted deployments with user-provided credentials.

**Better Auth database note:** Existing Prisma schema works as-is. Run `npx @better-auth/cli generate` to add auth tables (User, Session, Account, VerificationToken). Better Auth generates SQL migrations compatible with SQLite/better-sqlite3.

### Push Notifications

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `web-push` | ^3.x | Send push notifications from server | Official Next.js documentation uses `web-push` directly (verified: https://nextjs.org/docs/app/guides/progressive-web-apps). Self-hosted, no third-party service dependency. Generates and uses VAPID keys. |

**Service worker:** A `public/sw.js` file handles incoming push events client-side. Next.js serves it as a static file at `/sw.js` — no build step needed. VAPID keys are generated once with `npx web-push generate-vapid-keys` and stored in environment variables.

**What NOT to use for push notifications:** Firebase Cloud Messaging (FCM) adds a Google dependency and requires Firebase SDK overhead. Not appropriate for a self-hostable open-source project. The native Web Push API + `web-push` library covers 100% of the required use case.

**Browser support:** iOS 16.4+ (installed PWA only), Safari 16+ macOS, all Chromium browsers, Firefox. The user must install the app to home screen for iOS push — document this in the UI.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | ^3.23 | Runtime type validation | Already likely present; needed for AI SDK structured outputs and form validation in auth flows |
| `@types/web-push` | latest | TypeScript types for web-push | Dev dependency; provides types for `PushSubscription` and VAPID configuration |

---

## Installation

```bash
# AI layer
npm install ai @ai-sdk/react @ai-sdk/anthropic zod

# Authentication
npm install better-auth

# Push notifications
npm install web-push

# Dev dependencies
npm install -D @types/web-push
```

**Post-install steps:**

```bash
# Generate Better Auth schema additions (appends to existing Prisma schema)
npx @better-auth/cli generate

# Apply schema to database
npx prisma migrate dev --name add-auth-tables

# Generate VAPID keys for push notifications (run once, store in .env)
npx web-push generate-vapid-keys
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `better-auth` | Auth.js v5 (`next-auth@beta`) | If migrating an existing project already using NextAuth v4 — v5 migration path is documented. For new projects, Auth.js is entering maintenance mode. |
| `better-auth` | Clerk | If building a closed SaaS product where managed auth UX (prebuilt components, email verification flows) is more important than self-hosting — Clerk's UI components are genuinely faster to ship |
| `web-push` (native Web Push) | Firebase Cloud Messaging | If targeting Android-only where FCM's delivery reliability on low-power devices matters AND you're already in the Google ecosystem |
| `@ai-sdk/anthropic` (direct) | Vercel AI Gateway | If deploying to Vercel Pro and want provider fallbacks/routing managed by Vercel infrastructure — use `AI_GATEWAY_API_KEY` instead of `ANTHROPIC_API_KEY` |
| AI SDK v6 | LangChain.js | If building complex multi-agent orchestration with memory and document chains — LangChain has more abstractions. For straightforward summarization + classification + chat, AI SDK is lighter and integrates better with Next.js patterns |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `next-auth@beta` (Auth.js v5) | Stuck in beta; Auth.js team handed maintenance to Better Auth. Official advice for new projects: use Better Auth. | `better-auth` |
| `next-auth@4` (stable) | Pages Router API, no App Router native support, `@next-auth/*-adapter` scope is deprecated | `better-auth` |
| `generateObject` / `streamObject` | Deprecated in AI SDK v6. Will be removed in a future version. | `generateText` / `streamText` with `output` setting |
| `ai@4.x` or `ai@5.x` | v6 is current stable (released Dec 2025). v5 still receives patches but v6 has better structured output and agent support | `ai@^6.0.130` |
| Firebase Cloud Messaging | Adds Google dependency, not self-hostable, overkill for this use case | `web-push` + native Web Push API |
| `next-pwa` | Not maintained for Next.js 15+/App Router. Requires webpack config, not Turbopack-compatible | Manual `public/sw.js` + `app/manifest.ts` (per official Next.js PWA guide) |
| OpenAI as default AI provider | Project is in the Claude ecosystem; switching later is trivial with AI SDK — but start with `@ai-sdk/anthropic` | `@ai-sdk/anthropic` with Claude |

---

## Stack Patterns by Variant

**If deploying to Vercel (managed):**
- Use `AI_GATEWAY_API_KEY` (Vercel AI Gateway) instead of `ANTHROPIC_API_KEY` directly
- AI Gateway handles provider routing, rate limiting, and fallbacks at the infrastructure level
- Authentication is still Better Auth (self-managed DB)

**If self-hosting (user-deployed instance):**
- Use `ANTHROPIC_API_KEY` directly with `@ai-sdk/anthropic`
- Document that users supply their own API key
- Push notifications work identically — VAPID keys are self-generated

**If SQLite becomes a bottleneck (many concurrent users):**
- Better Auth works with LibSQL/Turso (already in the stack as optional adapter)
- Migrate: `DATABASE_URL` → Turso connection string, swap `better-sqlite3` adapter for `@prisma/adapter-libsql`
- No auth or AI code changes required

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `ai@^6.0.130` | Next.js 16, React 19 | v6 targets React Server Components; works with App Router natively |
| `@ai-sdk/react@^3.0.132` | React 19.x | useChat hook is client-side; must be used in `'use client'` components |
| `better-auth@^1.5.5` | Prisma 5.x, Next.js 16 | Next.js middleware: check cookie existence only (no DB calls in middleware — too slow) |
| `web-push@^3.x` | Node.js 18+ | Server Actions or Route Handlers only; never runs client-side |
| `zod@^3.23` | AI SDK v6 | AI SDK v6 uses Zod 3.x; do NOT use Zod v4 (alpha) — API incompatibilities |

---

## Environment Variables

```bash
# AI — choose one of these setups:

# Option A: Direct Anthropic (self-hosted)
ANTHROPIC_API_KEY=sk-ant-...

# Option B: Vercel AI Gateway (managed Vercel deployment)
AI_GATEWAY_API_KEY=...

# Authentication
BETTER_AUTH_SECRET=...                    # Generate: openssl rand -base64 32
BETTER_AUTH_URL=https://yourdomain.com    # Full URL of the app

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...          # From: npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=...                     # Never expose to client
```

---

## Sources

- https://ai-sdk.dev/docs/introduction — AI SDK v6 current stable, package names confirmed (HIGH confidence)
- https://github.com/vercel/ai/releases — ai@6.0.130, @ai-sdk/react@3.0.132 versions confirmed (HIGH confidence)
- https://vercel.com/blog/ai-sdk-6 — AI SDK 6 features, release date (Dec 2025) (HIGH confidence)
- https://ai-sdk.dev/docs/migration-guides/migration-guide-6-0 — generateObject/streamObject deprecated in v6 (HIGH confidence)
- https://github.com/nextauthjs/next-auth/discussions/13252 — Auth.js maintenance transfer to Better Auth team (HIGH confidence)
- https://nextjs.org/docs/app/guides/progressive-web-apps — Official Next.js PWA/push notifications guide using `web-push` (HIGH confidence)
- https://better-auth.com/docs/installation — better-auth v1.5.5 install (HIGH confidence, npm corroborated: 611k weekly downloads)
- https://www.prisma.io/docs/guides/betterauth-nextjs — Better Auth + Prisma + Next.js official Prisma docs (HIGH confidence)
- https://betterstack.com/community/guides/scaling-nodejs/better-auth-vs-nextauth-authjs-vs-autho/ — Comparison analysis (MEDIUM confidence)
- WebSearch: @ai-sdk/anthropic version 3.0.58 from npmjs.com (MEDIUM confidence — npm page 403'd but search snippet reliable)

---

*Stack research for: AI news reader — AI features, auth, push notifications milestone*
*Researched: 2026-03-19*
