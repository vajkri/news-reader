// Re-enrichment for articles with null contentType/thinContent only
// Env loaded via --env-file=.env.local flag (Node 20+)
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
const BATCH_SIZE = 10; // Smaller batch for targeted fix

const AI_MODEL = 'deepseek/deepseek-v3.2';

const SEED_TOPICS = [
  'model releases', 'developer tools', 'industry moves',
  'research & breakthroughs', 'AI regulation & policy', 'open source', 'AI coding tools',
];

const SYSTEM_PROMPT = `You are an analyst briefing tool for an AI-focused frontend developer's news tracker.

## Tasks
For each article in the batch, produce: summary, topics, importanceScore, contentType, thinContent.

## Summary Rules
- 2-3 sentences. Tone: factual, dry, implications-forward.
- Final sentence MUST start with "This" and state why it matters.
- Do NOT open with generic phrases like "In a recent post...", "The article discusses...", or "According to...". Lead with the substance.
- If thinContent=true, write the best summary possible from what is available; do not leave it blank.

## Importance Scoring (1-10)
Score relative to the OTHER articles in this batch. Use these anchors:
- 9-10: Industry-defining. New foundation model launch, major acquisition, landmark regulation passed.
- 7-8: Significant. Notable model release, major tool update, important research result.
- 4-6: Notable. Tool update, interesting research paper, company partnership.
- 1-3: Low signal. Minor update, personal blog post, incremental improvement.

Weight: 60% broad AI industry impact + 40% relevance to a frontend developer building with AI tools.

## Topic Classification
Prefer from seed list: ${SEED_TOPICS.join(', ')}.
- Create a new category ONLY when no seed fits AND the topic is clearly recurring.
- Assign 1-3 topics per article. Most articles need only 1.

## Content Type (ONE per article)
- news: Third-party reporting on an event, release, or development.
- tutorial: How-to, guide, step-by-step instructions, code walkthrough.
- opinion: Analysis, commentary, editorial viewpoint, personal take.
- announcement: Official post from the company/org itself (press release, product page, changelog).
- roundup: Weekly/monthly digest, curated list of links or tools.

Key distinction: "announcement" is FROM the company. "news" is ABOUT the company by a third party.

## Thin Content
Set thinContent=true ONLY if the RSS description is fewer than 50 words OR consists entirely of generic boilerplate with no article-specific content.

## CRITICAL: You MUST return a result for EVERY articleId in the batch. Do not skip any.

## Output
Return results for ALL articles in the batch. Include the articleId in each result.`;

const ArticleEnrichmentSchema = z.object({
  articleId: z.number(),
  summary: z.string(),
  topics: z.array(z.string()),
  importanceScore: z.number().int().min(1).max(10),
  contentType: z.enum(['news', 'tutorial', 'opinion', 'announcement', 'roundup']),
  thinContent: z.boolean(),
});

type EnrichmentResult = z.infer<typeof ArticleEnrichmentSchema>;
type ArticleRow = { id: number; title: string; description: string | null; source: { name: string } };

function buildBatchPrompt(articles: ArticleRow[]): string {
  return articles
    .map(a => `--- Article ID: ${a.id}\nSource: ${a.source.name}\nTitle: ${a.title}\nDescription: ${a.description ?? '(no description)'}`)
    .join('\n\n');
}

async function main(): Promise<void> {
  const nullArticles = await prisma.article.findMany({
    where: { contentType: null },
    select: { id: true, title: true, description: true, source: { select: { name: true } } },
    orderBy: { id: 'asc' },
  });

  console.log(`Articles with null contentType to fix: ${nullArticles.length}`);

  let totalSaved = 0;
  let totalErrors = 0;
  let batchNum = 0;

  for (let i = 0; i < nullArticles.length; i += BATCH_SIZE) {
    const batch = nullArticles.slice(i, i + BATCH_SIZE);
    batchNum++;
    const ids = batch.map(a => a.id).join(', ');
    console.log(`\nBatch ${batchNum} (IDs: ${ids}):`);

    try {
      const { output } = await generateText({
        model: AI_MODEL,
        output: Output.array({ element: ArticleEnrichmentSchema }),
        system: SYSTEM_PROMPT,
        prompt: buildBatchPrompt(batch),
        maxOutputTokens: 4096,
      });

      if (!output) {
        console.error(`  ERROR: AI returned no output for batch ${batchNum}`);
        totalErrors += batch.length;
        continue;
      }

      const results: EnrichmentResult[] = output;
      console.log(`  AI returned ${results.length} results for ${batch.length} articles`);

      // Log any missing IDs
      const batchIds = new Set(batch.map(a => a.id));
      const returnedIds = new Set(results.map(r => r.articleId));
      const missingIds = [...batchIds].filter(id => !returnedIds.has(id));
      if (missingIds.length > 0) {
        console.warn(`  WARNING: AI did not return results for IDs: ${missingIds.join(', ')}`);
      }

      const settled = await Promise.allSettled(
        results
          .filter(r => batchIds.has(r.articleId)) // Only update articles in this batch
          .map(result =>
            prisma.article.update({
              where: { id: result.articleId },
              data: {
                summary: result.summary,
                topics: result.topics,
                importanceScore: result.importanceScore,
                contentType: result.contentType,
                thinContent: result.thinContent,
                enrichedAt: new Date(),
              },
            })
          )
      );

      const saved = settled.filter(r => r.status === 'fulfilled').length;
      const errors = settled.filter(r => r.status === 'rejected').length;
      totalSaved += saved;
      totalErrors += errors;

      console.log(`  Saved: ${saved}, Errors: ${errors}`);
      if (errors > 0) {
        settled
          .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
          .forEach(r => console.error(`    ${r.reason}`));
      }
    } catch (err) {
      console.error(`  BATCH ERROR: ${err instanceof Error ? err.message : String(err)}`);
      totalErrors += batch.length;
    }
  }

  console.log(`\n--- Null fix complete ---`);
  console.log(`Total saved: ${totalSaved}`);
  console.log(`Total errors: ${totalErrors}`);

  const remaining = await prisma.article.count({ where: { contentType: null } });
  const remainingTC = await prisma.article.count({ where: { thinContent: null } });
  console.log(`Remaining null contentType: ${remaining}`);
  console.log(`Remaining null thinContent: ${remainingTC}`);

  await prisma.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
