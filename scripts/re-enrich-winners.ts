// One-off script to re-enrich corrupted winner articles (951, 978, 1001).
// Their importanceScore was set to 1 by enrichment AI's dedup logic.
// Env loaded via --env-file=.env.local flag (Node 20+)
// Usage: npx tsx --env-file=.env.local scripts/re-enrich-winners.ts
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neon, types } from '@neondatabase/serverless';

types.setTypeParser(1082, (v: string) => v);
types.setTypeParser(1114, (v: string) => v);
types.setTypeParser(1184, (v: string) => v);

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  const sql = neon(connectionString);
  const adapter = new PrismaNeonHTTP(sql);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();
// Matches AI_MODEL in src/lib/ai.ts (can't import due to server-only)
const AI_MODEL = 'deepseek/deepseek-v3.2';
const ARTICLE_IDS = [951, 978, 1001];

const ReScoreSchema = z.object({
  articleId: z.number(),
  importanceScore: z.number().int().min(1).max(10),
});

async function main(): Promise<void> {
  const articles = await prisma.article.findMany({
    where: { id: { in: ARTICLE_IDS } },
    select: {
      id: true,
      title: true,
      description: true,
      summary: true,
      importanceScore: true,
      source: { select: { name: true } },
    },
  });

  console.log('Found articles:');
  for (const a of articles) {
    console.log(`  ${a.id} | score=${a.importanceScore} | ${a.title}`);
  }

  const prompt = articles
    .map(
      (a) =>
        `--- Article ID: ${a.id}\nSource: ${a.source.name}\nTitle: ${a.title}\nDescription: ${a.description ?? '(no description)'}\nSummary: ${a.summary ?? '(no summary)'}`
    )
    .join('\n\n');

  const { output } = await generateText({
    model: AI_MODEL,
    output: Output.array({ element: ReScoreSchema }),
    system: `You are rescoring articles for importance. Score each article independently on a 1-10 scale:
- 9-10: Industry-defining. New foundation model launch, major acquisition, landmark regulation passed.
- 7-8: Significant. Notable model release, major tool update, important research result.
- 4-6: Notable. Tool update, interesting research paper, company partnership.
- 1-3: Low signal. Minor update, personal blog post, incremental improvement.

Weight: 60% broad AI industry impact + 40% relevance to a frontend developer building with AI tools.
Score each article on its own merits. Do NOT penalize articles for covering similar topics.`,
    prompt: `Score these articles:\n\n${prompt}`,
  });

  if (!output) {
    console.error('AI returned no output');
    process.exit(1);
  }

  for (const result of output) {
    const article = articles.find((a) => a.id === result.articleId);
    console.log(
      `\nUpdating ${result.articleId}: score ${article?.importanceScore} -> ${result.importanceScore}`
    );
    await prisma.article.update({
      where: { id: result.articleId },
      data: { importanceScore: result.importanceScore },
    });
  }

  console.log('\nDone.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
