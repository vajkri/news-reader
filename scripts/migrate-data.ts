/**
 * Data migration script: SQLite -> Neon Postgres
 *
 * Reads sources and articles (March 18th 2026 onward) from the local SQLite
 * dev.db using better-sqlite3, then writes them to Neon Postgres via PrismaClient.
 *
 * Idempotent: skips sources already in Postgres by url, skips articles by guid.
 *
 * Run AFTER schema switch to Postgres (plan 03.2-01), BEFORE removing better-sqlite3.
 * Requires DATABASE_URL in .env.local pointing to Neon (via vercel env pull).
 *
 * Usage:
 *   npx dotenv-cli -e .env.local -- npx tsx scripts/migrate-data.ts
 */

import Database from 'better-sqlite3';
import { PrismaClient } from '@prisma/client';

const CUTOFF = new Date('2026-03-18T00:00:00.000Z');

const sqliteDb = new Database('./prisma/dev.db', { readonly: true });
const prisma = new PrismaClient(); // uses DATABASE_URL from .env.local (Neon)

interface SqliteSource {
  id: number;
  name: string;
  url: string;
  category: string | null;
  createdAt: number;
}

interface SqliteArticle {
  id: number;
  guid: string;
  title: string;
  link: string;
  description: string | null;
  thumbnail: string | null;
  // SQLite stores these as Unix millisecond integers (not ISO strings)
  publishedAt: number | null;
  readTimeMin: number | null;
  isRead: number;
  summary: string | null;
  topics: string | null;
  importanceScore: number | null;
  enrichedAt: number | null;
  createdAt: number;
  sourceId: number;
}

async function main(): Promise<void> {
  console.log('--- Starting data migration: SQLite -> Neon Postgres ---\n');

  // 1. Migrate all sources (idempotent by url)
  console.log('Migrating sources...');
  const sources = sqliteDb.prepare('SELECT * FROM Source').all() as SqliteSource[];

  for (const s of sources) {
    await prisma.source.upsert({
      where: { url: s.url },
      create: { name: s.name, url: s.url, category: s.category },
      update: {},
    });
    console.log(`  source: ${s.name}`);
  }
  console.log(`\nSources done: ${sources.length} processed.\n`);

  // 2. Migrate articles from March 18th 2026 onward (idempotent by guid)
  console.log(`Migrating articles (>= ${CUTOFF.toISOString()})...`);
  // Note: SQLite stores publishedAt as Unix millisecond integers, not ISO strings.
  // Compare using the numeric timestamp value.
  const articles = sqliteDb
    .prepare('SELECT * FROM Article WHERE publishedAt >= ? ORDER BY publishedAt ASC')
    .all(CUTOFF.getTime()) as SqliteArticle[];

  let created = 0;
  let skipped = 0;

  for (const a of articles) {
    // Idempotency check: skip if already in Postgres
    const existing = await prisma.article.findUnique({ where: { guid: a.guid } });
    if (existing) {
      skipped++;
      continue;
    }

    // Look up source in SQLite by sourceId to get the url, then find matching Postgres source
    const srcRow = sqliteDb
      .prepare('SELECT url FROM Source WHERE id = ?')
      .get(a.sourceId) as { url: string } | undefined;

    if (!srcRow) {
      console.warn(`  skip article (SQLite source not found for id ${a.sourceId}): ${a.guid}`);
      skipped++;
      continue;
    }

    const pgSource = await prisma.source.findUnique({ where: { url: srcRow.url } });
    if (!pgSource) {
      console.warn(`  skip article (Postgres source not found for url ${srcRow.url}): ${a.guid}`);
      skipped++;
      continue;
    }

    await prisma.article.create({
      data: {
        guid: a.guid,
        title: a.title,
        link: a.link,
        description: a.description,
        thumbnail: a.thumbnail,
        publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
        readTimeMin: a.readTimeMin,
        isRead: Boolean(a.isRead),
        summary: a.summary,
        topics: a.topics ? JSON.parse(a.topics) : null,
        importanceScore: a.importanceScore,
        enrichedAt: a.enrichedAt ? new Date(a.enrichedAt) : null,
        sourceId: pgSource.id,
      },
    });
    created++;
  }

  console.log(`\nDone. ${created} articles created, ${skipped} skipped.`);
}

main()
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  })
  .finally(() => {
    sqliteDb.close();
    prisma.$disconnect();
  });
