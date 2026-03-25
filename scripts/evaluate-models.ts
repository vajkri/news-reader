// Env loaded via --env-file=.env.local flag (Node 20+)
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neon, types } from '@neondatabase/serverless';

// TCP/5432 is blocked in this environment; use Neon HTTP adapter (same as src/lib/prisma.ts)
types.setTypeParser(1082, (v: string) => v); // date
types.setTypeParser(1114, (v: string) => v); // timestamp
types.setTypeParser(1184, (v: string) => v); // timestamptz

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');
  const sql = neon(connectionString);
  const adapter = new PrismaNeonHTTP(sql);
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

const MODELS = [
  'google/gemini-2.5-flash-lite',
  'deepseek/deepseek-v3.2',
  'google/gemini-3.1-flash-lite-preview',
  'openai/gpt-4.1-mini',
] as const;

const SEED_TOPICS = [
  'model releases',
  'developer tools',
  'industry moves',
  'research & breakthroughs',
  'AI regulation & policy',
  'open source',
  'AI coding tools',
] as const;

const ArticleEnrichmentSchema = z.object({
  articleId: z.number(),
  summary: z
    .string()
    .describe(
      '2-3 sentence analyst briefing. Final sentence states why it matters, starting with "This".'
    ),
  topics: z
    .array(z.string())
    .describe(
      `Topic categories. Prefer seeds: ${SEED_TOPICS.join(', ')}. Create new only when no seed fits.`
    ),
  importanceScore: z.number().int().min(1).max(10),
  contentType: z
    .enum(['news', 'tutorial', 'opinion', 'announcement', 'roundup'])
    .describe(
      'Primary content type. news=factual reporting, tutorial=how-to/guide, opinion=analysis/commentary, announcement=official company post, roundup=digest/list'
    ),
  thinContent: z
    .boolean()
    .describe(
      'True if RSS description is too short or generic for a meaningful summary'
    ),
});

type EnrichmentResult = z.infer<typeof ArticleEnrichmentSchema>;

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

## Output
Return results for ALL articles in the batch. Include the articleId in each result.`;

type Article = {
  id: number;
  title: string;
  description: string | null;
  source: { name: string };
};

function buildBatchPrompt(articles: Article[]): string {
  return articles
    .map(
      (a) =>
        `--- Article ID: ${a.id}\nSource: ${a.source.name}\nTitle: ${a.title}\nDescription: ${a.description ?? '(no description)'}`
    )
    .join('\n\n');
}

type ModelStats = {
  modelId: string;
  avgScore: number;
  minScore: number;
  maxScore: number;
  typeCounts: Record<string, number>;
  thinCount: number;
  errorCount: number;
  results: EnrichmentResult[];
};

async function runModel(modelId: string, articles: Article[], batchPrompt: string): Promise<ModelStats> {
  console.log(`\n=== ${modelId} ===`);
  try {
    const { output } = await generateText({
      model: modelId,
      output: Output.array({ element: ArticleEnrichmentSchema }),
      system: SYSTEM_PROMPT,
      prompt: batchPrompt,
      maxOutputTokens: 4096,
    });

    if (!output || output.length === 0) {
      throw new Error('No output returned');
    }

    const articleMap = new Map(articles.map((a) => [a.id, a]));

    for (const result of output) {
      const article = articleMap.get(result.articleId);
      const titleDisplay = article?.title?.substring(0, 60) ?? `ID ${result.articleId}`;
      console.log(`\n  Article: "${titleDisplay}..."`);
      console.log(`    Summary: ${result.summary.substring(0, 120)}...`);
      console.log(
        `    Score: ${result.importanceScore} | Type: ${result.contentType} | Thin: ${result.thinContent} | Topics: [${result.topics.join(', ')}]`
      );
    }

    const scores = output.map((r) => r.importanceScore);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const typeCounts: Record<string, number> = {};
    for (const r of output) {
      typeCounts[r.contentType] = (typeCounts[r.contentType] ?? 0) + 1;
    }
    const thinCount = output.filter((r) => r.thinContent).length;

    return {
      modelId,
      avgScore,
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores),
      typeCounts,
      thinCount,
      errorCount: 0,
      results: output,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ERROR: ${message}`);
    return {
      modelId,
      avgScore: 0,
      minScore: 0,
      maxScore: 0,
      typeCounts: {},
      thinCount: 0,
      errorCount: 1,
      results: [],
    };
  }
}

function printSummaryTable(stats: ModelStats[]): void {
  console.log('\n\n=== SUMMARY TABLE ===\n');

  const header =
    '| Model                              | Avg Score | Score Range | news | tutorial | opinion | announcement | roundup | thinContent | Errors |';
  const divider =
    '|------------------------------------|-----------|-------------|------|----------|---------|--------------|---------|-------------|--------|';
  console.log(header);
  console.log(divider);

  for (const s of stats) {
    const avgStr = s.errorCount > 0 ? 'ERROR' : s.avgScore.toFixed(1);
    const rangeStr = s.errorCount > 0 ? '-' : `${s.minScore}-${s.maxScore}`;
    const tc = s.typeCounts;
    const row = [
      s.modelId.padEnd(34),
      avgStr.padStart(9),
      rangeStr.padStart(11),
      String(tc['news'] ?? 0).padStart(4),
      String(tc['tutorial'] ?? 0).padStart(8),
      String(tc['opinion'] ?? 0).padStart(7),
      String(tc['announcement'] ?? 0).padStart(12),
      String(tc['roundup'] ?? 0).padStart(7),
      String(s.thinCount).padStart(11),
      String(s.errorCount).padStart(6),
    ].join(' | ');
    console.log(`| ${row} |`);
  }
  console.log('\n');
}

async function main(): Promise<void> {
  console.log('Fetching test batch from database...');

  const articles = await prisma.article.findMany({
    where: { enrichedAt: { not: null } },
    select: {
      id: true,
      title: true,
      description: true,
      source: { select: { name: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: 10,
  });

  if (articles.length === 0) {
    console.error('No enriched articles found in database. Run the enrich cron first.');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`Test batch: ${articles.length} articles`);
  console.log('Models to evaluate:', MODELS.join(', '));
  console.log('\nThis will take 2-4 minutes (4 sequential AI calls)...');

  const batchPrompt = buildBatchPrompt(articles);
  const allStats: ModelStats[] = [];

  for (const modelId of MODELS) {
    const stats = await runModel(modelId, articles, batchPrompt);
    allStats.push(stats);
  }

  printSummaryTable(allStats);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  prisma.$disconnect().catch(() => {});
  process.exit(1);
});
