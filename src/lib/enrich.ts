import 'server-only';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { prisma } from './prisma';
import { AI_MODEL } from './ai';

export const SEED_TOPICS = [
  'model releases',
  'developer tools',
  'industry moves',
  'research & breakthroughs',
  'AI regulation & policy',
  'open source',
  'AI coding tools',
] as const;

export const ArticleEnrichmentSchema = z.object({
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
  thinContent: z
    .boolean()
    .describe(
      'True if RSS description is too short or generic for a meaningful summary'
    ),
});

const SYSTEM_PROMPT = `You are an analyst briefing tool for an AI-focused frontend developer.
For each article in the batch:
1. Write a 2-3 sentence summary. Tone: factual, dry, implications-forward. Final sentence starts with "This" and states the implication.
2. Assign one or more topic categories. Prefer from the seed list: model releases, developer tools, industry moves, research & breakthroughs, AI regulation & policy, open source, AI coding tools. Create new categories only when no seed fits.
3. Score importance 1-10 relative to the OTHER articles in this batch. Consider: broad AI industry impact AND relevance to a frontend developer building with AI tools.
4. Set thinContent=true if the article description is too short or generic to summarize meaningfully.

Return results for ALL articles in the batch. Include the articleId in each result.`;

export const BATCH_LIMIT = 50;

export type UnenrichedArticle = {
  id: number;
  title: string;
  description: string | null;
  source: { name: string };
};

export async function fetchUnenrichedArticles(): Promise<UnenrichedArticle[]> {
  return prisma.article.findMany({
    where: { enrichedAt: null },
    select: {
      id: true,
      title: true,
      description: true,
      source: { select: { name: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: BATCH_LIMIT,
  });
}

export function buildBatchPrompt(articles: UnenrichedArticle[]): string {
  return articles
    .map(
      (a) =>
        `--- Article ID: ${a.id}\nSource: ${a.source.name}\nTitle: ${a.title}\nDescription: ${a.description ?? '(no description)'}`
    )
    .join('\n\n');
}

export type EnrichmentResult = z.infer<typeof ArticleEnrichmentSchema>;

export async function enrichArticlesBatch(
  articles: UnenrichedArticle[]
): Promise<EnrichmentResult[]> {
  const { output } = await generateText({
    model: AI_MODEL,
    output: Output.array({ element: ArticleEnrichmentSchema }),
    system: SYSTEM_PROMPT,
    prompt: buildBatchPrompt(articles),
    maxOutputTokens: 4096,
  });

  if (output === null || output === undefined) {
    throw new Error('AI returned no structured output');
  }

  return output;
}

export async function saveEnrichmentResults(
  results: EnrichmentResult[]
): Promise<{ saved: number; errors: string[] }> {
  const settled = await Promise.allSettled(
    results.map((result) =>
      prisma.article.update({
        where: { id: result.articleId },
        data: {
          summary: result.summary,
          topics: JSON.stringify(result.topics),
          importanceScore: result.importanceScore,
          enrichedAt: new Date(),
        },
      })
    )
  );

  const errors = settled
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map((r) =>
      r.reason instanceof Error ? r.reason.message : String(r.reason)
    );

  const saved = settled.filter((r) => r.status === 'fulfilled').length;

  return { saved, errors };
}
