import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateText, Output } from 'ai';
import { AI_MODEL } from '@/lib/ai';
import { Prisma } from '@prisma/client';
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
      publishedAt: true,
      importanceScore: true,
      source: { select: { name: true } },
    },
    orderBy: { enrichedAt: 'desc' },
    take: 200,
  });

  if (articles.length < 2) {
    return NextResponse.json({ duplicatesFound: 0, message: 'Not enough articles to compare' });
  }

  // Build lookup maps for code-level validation
  const articleMap = new Map(articles.map((a) => [a.id, a]));

  const articleList = articles
    .map((a) => `ID: ${a.id} | Source: ${a.source.name} | Published: ${a.publishedAt?.toISOString().slice(0, 10) ?? 'unknown'} | Title: ${a.title}${a.summary ? ` | Summary: ${a.summary.slice(0, 300)}` : ''}`)
    .join('\n');

  const { output } = await generateText({
    model: AI_MODEL,
    output: Output.object({ schema: DuplicateDetectionSchema }),
    system: `You identify duplicate news articles. Two articles are duplicates ONLY when they describe the identical real-world event with matching key facts: same company, same action, same figures, same date.

<not_duplicates>
- Same topic, different events: "OpenAI raises $3B" vs "AI funding trends" are NOT duplicates.
- Same company, different news: "xAI cofounder leaves" vs "AI startups venture returns" are NOT duplicates.
- Overlapping keywords without matching facts: NOT duplicates.
</not_duplicates>

Each article MUST appear in at most one group. For each group, pick the most comprehensive article as winner. Prefer TLDR sources when quality is comparable. Return ONLY groups where you are certain.`,
    prompt: `Identify duplicate groups. Be strict; false positives are worse than missed duplicates.\n\n${articleList}`,
  });

  if (!output || output.groups.length === 0) {
    return NextResponse.json({ duplicatesFound: 0 });
  }

  // Code-level validation: enforce hard constraints the AI may violate
  const claimed = new Set<number>();
  const validatedGroups: typeof output.groups = [];

  for (const group of output.groups) {
    const winner = articleMap.get(group.winnerId);
    if (!winner || claimed.has(group.winnerId)) continue;

    const validDupes = group.duplicateIds.filter((dupeId) => {
      if (dupeId === group.winnerId || claimed.has(dupeId)) return false;
      const dupe = articleMap.get(dupeId);
      if (!dupe) return false;
      // Same source: never duplicates
      if (dupe.source.name === winner.source.name) return false;
      // 48h window: reject if either date is missing or published too far apart
      if (!winner.publishedAt || !dupe.publishedAt) return false;
      const diffMs = Math.abs(winner.publishedAt.getTime() - dupe.publishedAt.getTime());
      if (diffMs > 48 * 60 * 60 * 1000) return false;
      return true;
    });

    if (validDupes.length === 0) continue;

    claimed.add(group.winnerId);
    validDupes.forEach((id) => claimed.add(id));
    validatedGroups.push({ winnerId: group.winnerId, duplicateIds: validDupes });
  }

  let marked = 0;
  for (const group of validatedGroups) {
    for (const dupeId of group.duplicateIds) {
      try {
        // Re-point orphans and mark dupe atomically
        await prisma.$transaction([
          prisma.article.updateMany({
            where: { duplicateOf: dupeId },
            data: { duplicateOf: group.winnerId },
          }),
          prisma.article.update({
            where: { id: dupeId },
            data: { duplicateOf: group.winnerId, importanceScore: 1 },
          }),
        ]);
        marked++;
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') continue;
        throw e;
      }
    }
  }

  return NextResponse.json({
    duplicatesFound: validatedGroups.length,
    articlesMarked: marked,
    groups: validatedGroups,
  });
}
