import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateText, Output } from 'ai';
import { AI_MODEL } from '@/lib/ai';
import { z } from 'zod';

export const maxDuration = 120;

const DuplicateGroupSchema = z.object({
  winnerId: z.number().describe('The articleId of the best-quality version'),
  duplicateIds: z.array(z.number()).describe('articleIds that are duplicates of the winner'),
});

const DuplicateDetectionSchema = z.object({
  groups: z.array(DuplicateGroupSchema).describe('Groups of articles covering the same news event. Only include groups with 2+ articles.'),
});

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Get articles enriched in the last 7 days that aren't already marked as duplicates
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const articles = await prisma.article.findMany({
    where: {
      enrichedAt: { not: null, gte: sevenDaysAgo },
      duplicateOf: null,
    },
    select: {
      id: true,
      title: true,
      summary: true,
      importanceScore: true,
      source: { select: { name: true } },
    },
    orderBy: { enrichedAt: 'desc' },
    take: 200,
  });

  if (articles.length < 2) {
    return NextResponse.json({ duplicatesFound: 0, message: 'Not enough articles to compare' });
  }

  const articleList = articles
    .map((a) => `ID: ${a.id} | Source: ${a.source.name} | Title: ${a.title}`)
    .join('\n');

  const { output } = await generateText({
    model: AI_MODEL,
    output: Output.object({ schema: DuplicateDetectionSchema }),
    system: `You detect duplicate news articles. Articles covering the SAME news event (same funding round, same product launch, same research paper) are duplicates. Similar topics but different events are NOT duplicates.

For each duplicate group, pick the best-quality article as the winner. Prefer TLDR sources when quality is comparable.

Only return groups where you are confident the articles cover the exact same event.`,
    prompt: `Find duplicate groups in these articles:\n\n${articleList}`,
  });

  if (!output || output.groups.length === 0) {
    return NextResponse.json({ duplicatesFound: 0 });
  }

  // Validate AI output: only allow IDs that exist in our input batch
  const validIds = new Set(articles.map((a) => a.id));

  let marked = 0;
  for (const group of output.groups) {
    if (!validIds.has(group.winnerId)) continue;
    if (group.duplicateIds.includes(group.winnerId)) continue;

    const validDupes = group.duplicateIds.filter((id) => validIds.has(id) && id !== group.winnerId);
    for (const dupeId of validDupes) {
      await prisma.article.update({
        where: { id: dupeId },
        data: { duplicateOf: group.winnerId, importanceScore: 1 },
      });
      marked++;
    }
  }

  return NextResponse.json({
    duplicatesFound: output.groups.length,
    articlesMarked: marked,
    groups: output.groups,
  });
}
