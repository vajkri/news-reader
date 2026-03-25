// Temporary seed verification script — uses Neon HTTP adapter to avoid TCP/5432 restriction
// Env loaded via --env-file=.env.local flag (Node 20+)
import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neon, types } from '@neondatabase/serverless';

types.setTypeParser(1082, (v: string) => v);
types.setTypeParser(1114, (v: string) => v);
types.setTypeParser(1184, (v: string) => v);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');
const sql = neon(connectionString);
const adapter = new PrismaNeonHTTP(sql);
const prisma = new PrismaClient({ adapter });

const SOURCES = [
  { name: 'TLDR Tech',         url: 'https://bullrich.dev/tldr-rss/tech.rss',                           category: 'Tech'   },
  { name: 'TLDR AI',           url: 'https://bullrich.dev/tldr-rss/ai.rss',                             category: 'AI'     },
  { name: 'TLDR Design',       url: 'https://bullrich.dev/tldr-rss/design.rss',                         category: 'Design' },
  { name: 'TechCrunch AI',     url: 'https://techcrunch.com/category/artificial-intelligence/feed/',    category: 'AI'     },
  { name: 'Smashing Magazine', url: 'https://www.smashingmagazine.com/feed/',                           category: 'Design' },
  { name: 'OpenAI News',       url: 'https://openai.com/news/rss.xml',                                  category: 'AI'     },
  { name: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml',                             category: 'AI'     },
  { name: 'Hacker News',       url: 'https://hnrss.org/frontpage',                                      category: 'Tech'   },
];

async function main(): Promise<void> {
  console.log('Seeding sources (Neon HTTP adapter)...');

  // Dev.to deletion (idempotent)
  const deleted = await prisma.source.deleteMany({ where: { url: 'https://dev.to/feed' } });
  console.log(`  ~ Dev.to deleteMany: ${deleted.count} rows deleted (0 = already gone)`);

  // Use raw SQL INSERT ON CONFLICT DO NOTHING to avoid transaction requirement
  for (const source of SOURCES) {
    await prisma.$executeRaw`
      INSERT INTO "Source" (name, url, category)
      VALUES (${source.name}, ${source.url}, ${source.category})
      ON CONFLICT (url) DO NOTHING
    `;
    console.log(`  ok ${source.name}`);
  }

  console.log('Done.\n');

  // Verify
  const devTo = await prisma.source.count({ where: { url: 'https://dev.to/feed' } });
  const openai = await prisma.source.count({ where: { name: 'OpenAI News' } });
  const hf = await prisma.source.count({ where: { name: 'Hugging Face Blog' } });
  const hn = await prisma.source.count({ where: { name: 'Hacker News' } });

  console.log(`Dev.to in DB: ${devTo} (must be 0)`);
  console.log(`OpenAI News: ${openai} | Hugging Face Blog: ${hf} | Hacker News: ${hn}`);

  const counts = await prisma.$queryRaw<Array<{ name: string; count: number }>>`
    SELECT s.name, COUNT(a.id)::int as count
    FROM "Source" s
    LEFT JOIN "Article" a ON a."sourceId" = s.id
    GROUP BY s.name
    ORDER BY s.name
  `;
  console.log('\nArticle counts by source:');
  console.table(counts);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
