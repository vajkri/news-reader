// Check if contentType field exists in schema and what type it is
// Env loaded via --env-file=.env.local flag (Node 20+)
import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neon, types } from '@neondatabase/serverless';

types.setTypeParser(1082, (v: string) => v);
types.setTypeParser(1114, (v: string) => v);
types.setTypeParser(1184, (v: string) => v);

const sql = neon(process.env.DATABASE_URL!);
const adapter = new PrismaNeonHTTP(sql);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  // Check raw DB column type
  const colInfo = await prisma.$queryRaw<Array<{ column_name: string; data_type: string; is_nullable: string }>>`
    SELECT column_name::text, data_type::text, is_nullable::text
    FROM information_schema.columns
    WHERE table_name = 'Article'
    AND column_name IN ('contentType', 'thinContent', 'enrichedAt', 'summary')
    ORDER BY column_name
  `;
  console.log('Column info:');
  console.table(colInfo);

  // Check a specific null article's full data
  const article = await prisma.article.findFirst({
    where: { contentType: null },
    select: { id: true, title: true, summary: true, contentType: true, thinContent: true, enrichedAt: true },
  });
  console.log('\nSample null article:');
  console.log(JSON.stringify(article, null, 2));

  // Check a non-null article
  const good = await prisma.article.findFirst({
    where: { contentType: { not: null } },
    select: { id: true, title: true, summary: true, contentType: true, thinContent: true, enrichedAt: true },
  });
  console.log('\nSample good article:');
  console.log(JSON.stringify(good, null, 2));

  await prisma.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
