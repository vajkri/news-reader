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
  duplicateOf: z
    .number()
    .nullable()
    .describe(
      'If this article covers the same news event as another article in this batch, set to the articleId of the best-quality version. The best version gets null. Duplicates get importanceScore=1.'
    ),
});

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

## Duplicate Detection
Multiple articles in the batch may cover the SAME news event (e.g., same funding round, same product launch, same research paper).
- Group articles about the same event.
- Pick the BEST quality version as the winner (set duplicateOf=null). Prefer TLDR sources when quality is comparable; they are the user's favorite.
- For all other duplicates: set duplicateOf to the winner's articleId AND set importanceScore=1.
- Only flag true duplicates (same event/news). Articles on similar topics but different events are NOT duplicates.

## Output
Return results for ALL articles in the batch. Include the articleId in each result.`;

export const BATCH_LIMIT = 25;

const SOURCE_SIGNAL_THRESHOLD = 3; // 3+ same-direction votes from a source
const REASON_SIGNAL_THRESHOLD = 5; // 5+ votes for a reason type

export async function buildCalibrationContext(): Promise<string> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const feedback = await prisma.articleFeedback.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    include: { source: { select: { name: true } } },
  });

  if (feedback.length === 0) return '';

  const lines: string[] = [];

  // Source-level signals: 3+ same-direction votes from a source
  const sourceVotes = new Map<string, { up: number; down: number }>();
  for (const f of feedback) {
    const key = f.source.name;
    const entry = sourceVotes.get(key) ?? { up: 0, down: 0 };
    if (f.direction === 'up') entry.up++;
    else entry.down++;
    sourceVotes.set(key, entry);
  }

  for (const [sourceName, counts] of sourceVotes) {
    if (counts.down >= SOURCE_SIGNAL_THRESHOLD) {
      lines.push(`- User frequently downvotes articles from "${sourceName}". Score these lower unless genuinely significant.`);
    }
    if (counts.up >= SOURCE_SIGNAL_THRESHOLD) {
      lines.push(`- User frequently upvotes articles from "${sourceName}". These tend to be relevant.`);
    }
  }

  // Reason-level signals: 5+ votes citing a specific reason
  const reasonCounts = new Map<string, number>();
  for (const f of feedback) {
    const reasons = f.reasons as string[];
    for (const reason of reasons) {
      reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
    }
  }

  for (const [reason, count] of reasonCounts) {
    if (count >= REASON_SIGNAL_THRESHOLD) {
      lines.push(`- User feedback pattern (${count} votes): "${reason}". Adjust scoring to reflect this preference.`);
    }
  }

  if (lines.length === 0) return '';

  return `\n\n## User Calibration Signals\nBased on accumulated user feedback, apply these adjustments:\n${lines.join('\n')}`;
}

export type UnenrichedArticle = {
  id: number;
  title: string;
  description: string | null;
  source: { name: string };
};

export async function fetchUnenrichedArticles(batchSize?: number): Promise<UnenrichedArticle[]> {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  return prisma.article.findMany({
    where: {
      enrichedAt: null,
      createdAt: { gte: cutoff },
    },
    select: {
      id: true,
      title: true,
      description: true,
      source: { select: { name: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: batchSize ?? BATCH_LIMIT,
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
  const calibration = await buildCalibrationContext();
  const { output } = await generateText({
    model: AI_MODEL,
    output: Output.array({ element: ArticleEnrichmentSchema }),
    system: SYSTEM_PROMPT + calibration,
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
          topics: result.topics,
          importanceScore: result.importanceScore,
          contentType: result.contentType,
          thinContent: result.thinContent,
          duplicateOf: result.duplicateOf,
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
