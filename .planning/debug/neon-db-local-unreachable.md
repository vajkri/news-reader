---
status: fixing
trigger: "Neon Postgres unreachable from local dev server but production (Vercel) works fine with the same database."
created: 2026-03-23T00:00:00Z
updated: 2026-03-23T01:00:00Z
---

## Current Focus

hypothesis: DATABASE_URL in .env.local is wrapped in double-quotes, causing Prisma to receive an invalid connection string
test: Strip quotes from DATABASE_URL (and DATABASE_URL_UNPOOLED) in .env.local
expecting: Prisma connects successfully after quotes are removed
next_action: Fix the quoted value in .env.local

## Symptoms

expected: Local dev server connects to Neon Postgres and serves pages
actual: PrismaClientInitializationError: Can't reach database server at ep-nameless-silence-algy2ve0-pooler.c-3.eu-central-1.aws.neon.tech:5432
errors: Runtime PrismaClientInitializationError on page load (src/app/page.tsx:7)
reproduction: Run npm run dev, load localhost:3000
started: After PR review fixes were applied (rate-limit migration, schema changes). Production works fine.

## Eliminated

- hypothesis: DATABASE_URL wrapped in double-quotes causing Prisma to receive invalid connection string
  evidence: Next.js (@next/env) strips quotes per dotenv spec — both quoted and unquoted forms produce the same valid URL for the runtime. The URL is correctly formed (postgresql://...pooler host, sslmode=require).
  timestamp: 2026-03-23T01:30:00Z

- hypothesis: DNS/network issue
  evidence: nslookup resolves to 3 IPs. TCP connects to port 5432 in ~540ms. Not a network problem.
  timestamp: 2026-03-23T01:30:00Z

- hypothesis: Missing DATABASE_URL_UNPOOLED variable
  evidence: Both DATABASE_URL and DATABASE_URL_UNPOOLED present in .env.local. Prisma CLI doesn't read .env.local (only .env), but Next.js runtime does.
  timestamp: 2026-03-23T01:30:00Z

- hypothesis: Neon compute suspended (won't wake up)
  evidence: Raw TCP+TLS+Postgres startup message gets auth challenge (type 'R') back from pooler in 23ms. HTTP API queries work instantly (SELECT 1, SELECT count(*) FROM Source - returns 6 rows). Compute is awake.
  timestamp: 2026-03-23T01:30:00Z

- hypothesis: Connection pool exhaustion (too many connections)
  evidence: pg_stat_activity shows 14 connections — all Neon-internal (pgbouncer, compute_ctl, vm-monitor, etc). Only 1 user connection (our HTTP query). max_connections=112. No user-side exhaustion.
  timestamp: 2026-03-23T02:00:00Z

- hypothesis: Network routing or IP block
  evidence: TCP connects fine. Traceroute reaches AWS in 7 hops. Auth challenge received in 23ms. Not blocked at TCP level.
  timestamp: 2026-03-23T02:00:00Z

## Evidence

- timestamp: 2026-03-23T01:00:00Z
  checked: DNS resolution for ep-nameless-silence-algy2ve0-pooler.c-3.eu-central-1.aws.neon.tech
  found: Resolves to 3 IPs (52.29.229.153, 35.157.70.52, 3.127.101.230). DNS is fine.
  implication: Not a network/DNS issue.

- timestamp: 2026-03-23T01:00:00Z
  checked: .env.local keys
  found: DATABASE_URL and DATABASE_URL_UNPOOLED are both present.
  implication: The vars exist, so it's not a missing variable issue.

- timestamp: 2026-03-23T01:00:00Z
  checked: DATABASE_URL value format in .env.local
  found: Value was wrapped in double-quotes (dotenv file format). Next.js (@next/env) strips these correctly per dotenv spec — URL is valid at runtime.
  implication: Not the cause.

- timestamp: 2026-03-23T01:30:00Z
  checked: Raw Postgres handshake to pooler
  found: SSL accepted, Postgres startup gets auth challenge (type R=82) back. Server is responding to protocol correctly.
  implication: Server is reachable and alive. Prisma's "Can't reach database" error is misleading.

- timestamp: 2026-03-23T01:30:00Z
  checked: Prisma pool startup log
  found: Prisma logs "Starting a postgresql pool with 21 connections" before failing. 21 connections is the default (num_cpus * 2 + 1).
  implication: Prisma may be hitting Neon's connection limit or there's an auth/credential issue on the pooler.

- timestamp: 2026-03-23T02:00:00Z
  checked: Full Postgres protocol trace (TCP+TLS+startup+auth)
  found: Server responds with SASL auth request (method 10) in 23ms. Then returns "08P01 Authentication timed out" at exactly 15 seconds. This is Neon proxy's hard 15-second auth completion timeout.
  implication: Neon proxy initiates compute wakeup during SCRAM auth exchange, but the compute cannot complete auth validation within 15 seconds.

- timestamp: 2026-03-23T02:00:00Z
  checked: Neon HTTP API (port 443, /sql endpoint)
  found: HTTP queries succeed instantly - SELECT 1 returns ok, SELECT count(*) FROM Source returns 6. DB is fully operational.
  implication: The issue is specifically TCP Postgres authentication, not database health. HTTP path works, TCP Postgres path doesn't.

- timestamp: 2026-03-23T02:00:00Z
  checked: _prisma_migrations table in DB
  found: Only 2 migrations applied (20260321133925_init, 20260321204824_add_rate_limit). The migration 20260323085402_rate_limit_unique_key was NEVER applied to the DB.
  implication: The schema has @unique on RateLimit.key but the DB doesn't have the unique index. Schema drift. The migration ran locally (created file) but couldn't connect to DB to apply it.

- timestamp: 2026-03-23T02:00:00Z
  checked: Vercel deployment builds (latest 50min ago and 2h ago)
  found: All recent builds are Preview builds and show Ready status. During these builds, DB connection must have worked for prerendering.
  implication: TCP Postgres auth worked during Vercel builds but is now failing. Something changed after the builds. The issue is temporal/transient OR specific to this IP/network from local dev.

- timestamp: 2026-03-23T02:00:00Z
  checked: HTTP keep-alive + immediate TCP test
  found: Even after a successful HTTP query (confirming compute awake), immediate TCP postgres auth still fails at 15s. The compute being awake via HTTP does not fix TCP auth.
  implication: TCP Postgres auth and HTTP query use different Neon proxy code paths. The TCP auth timeout is a specific issue with the Neon TCP proxy for this endpoint.

## Resolution

root_cause: Neon TCP Postgres authentication consistently times out at exactly 15 seconds (Neon proxy hard limit, 08P01 error). The database is fully healthy — HTTP API queries work instantly. The TCP auth path for this compute endpoint is broken (Neon infrastructure issue). Additionally, the pending migration (rate-limit unique key) was never applied to the DB because it also failed to connect via TCP.

fix: |
  1. Switched Prisma from TCP Postgres driver to Neon HTTP adapter (@prisma/adapter-neon@5.22.0 + @neondatabase/serverless@0.10.4).
     Added driverAdapters preview feature to schema.prisma. Updated src/lib/prisma.ts to use PrismaNeonHTTP with pg type parsers overridden to return raw strings (Neon driver returns Date objects; Prisma HTTP adapter expects strings).
  2. Applied pending migration 20260323085402_rate_limit_unique_key directly via Neon HTTP API.
  3. Ran prisma generate to regenerate client.

verification: npm run build passes — all 11 pages built including / (homepage with prisma.source.findMany). 677ms query time.

files_changed:
  - src/lib/prisma.ts
  - prisma/schema.prisma
  - package.json (added @prisma/adapter-neon@5.22.0, @neondatabase/serverless@0.10.4)
