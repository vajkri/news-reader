// One-time migration script: add sourceType and config fields to Source table
// Uses Neon HTTP adapter (TCP/5432 blocked in this environment)
// Applied: 2026-03-25 for Phase 04.3
import { neon } from '@neondatabase/serverless';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  const sql = neon(connectionString);

  console.log('Applying migration: add_source_type_fields');

  await sql`ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "sourceType" TEXT NOT NULL DEFAULT 'rss'`;
  console.log('  + sourceType TEXT NOT NULL DEFAULT rss');

  await sql`ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "sitemapPathPattern" TEXT`;
  console.log('  + sitemapPathPattern TEXT');

  await sql`ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "scrapeUrl" TEXT`;
  console.log('  + scrapeUrl TEXT');

  await sql`ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "scrapeLinkSelector" TEXT`;
  console.log('  + scrapeLinkSelector TEXT');

  // Mark migration as applied in _prisma_migrations table
  await sql`
    INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
    VALUES (
      gen_random_uuid()::text,
      'manual',
      now(),
      '20260325200000_add_source_type_fields',
      NULL,
      NULL,
      now(),
      1
    )
    ON CONFLICT DO NOTHING
  `;
  console.log('  ~ Recorded migration in _prisma_migrations');

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
