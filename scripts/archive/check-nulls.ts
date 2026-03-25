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
  const total = await prisma.article.count();
  const nullCT = await prisma.article.count({ where: { contentType: null } });
  const nullTC = await prisma.article.count({ where: { thinContent: null } });

  console.log(`Total articles: ${total}`);
  console.log(`Null contentType: ${nullCT}`);
  console.log(`Null thinContent: ${nullTC}`);

  if (nullCT > 0) {
    const samples = await prisma.article.findMany({
      where: { contentType: null },
      select: { id: true, title: true, enrichedAt: true, source: { select: { name: true } } },
      orderBy: { id: 'asc' },
      take: 20,
    });
    console.log('\nSample null contentType articles:');
    console.table(samples.map(a => ({ id: a.id, source: a.source.name, enrichedAt: a.enrichedAt, title: a.title.slice(0, 60) })));
  }

  await prisma.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
