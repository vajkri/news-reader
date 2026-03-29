import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { parseISO, isValid } from "date-fns";
import { groupArticlesByTopic } from "@/lib/briefing";
import type { ArticleRow } from "@/types";
import { TopicGroup, DateStepper, BriefingDebugBox } from "@/components/features/briefing";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function BriefingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const dateParam = params.date;
  const parsed = dateParam ? parseISO(dateParam) : null;
  const selectedDate = parsed && isValid(parsed) ? parsed : new Date();
  const y = selectedDate.getUTCFullYear();
  const m = selectedDate.getUTCMonth();
  const d = selectedDate.getUTCDate();
  // Look at yesterday's articles: enrichment runs overnight, so today's briefing covers the prior day
  const windowStart = new Date(Date.UTC(y, m, d - 1, 0, 0, 0, 0));
  const windowEnd = new Date(Date.UTC(y, m, d - 1, 23, 59, 59, 999));

  const dateFilter = {
    enrichedAt: { not: null },
    AND: [
      { publishedAt: { not: null } },
      { publishedAt: { gte: windowStart, lte: windowEnd } },
    ],
  };
  const includeSource = { source: { select: { name: true, category: true } } };

  const MAX_BRIEFING_ARTICLES = 20;

  // Diagnostic: count articles in window ignoring enrichedAt/score filters (dev only)
  const [totalInWindow, unenrichedInWindow, lowScoreInWindow] =
    process.env.NODE_ENV === 'development'
      ? await Promise.all([
          prisma.article.count({
            where: { publishedAt: { gte: windowStart, lte: windowEnd } },
          }),
          prisma.article.count({
            where: { publishedAt: { gte: windowStart, lte: windowEnd }, enrichedAt: null },
          }),
          prisma.article.count({
            where: { publishedAt: { gte: windowStart, lte: windowEnd }, enrichedAt: { not: null }, importanceScore: { lt: 4 } },
          }),
        ])
      : [0, 0, 0];

  // Critical (9-10) and important (7-8) articles fill up to the cap
  const priorityArticles = await prisma.article.findMany({
    where: { ...dateFilter, importanceScore: { gte: 7 } },
    orderBy: { importanceScore: "desc" },
    take: MAX_BRIEFING_ARTICLES,
    include: includeSource,
  });

  // Fill remaining slots with notable (4-6) up to the cap
  const notableSlots = Math.max(0, MAX_BRIEFING_ARTICLES - priorityArticles.length);
  const notableArticles = notableSlots > 0
    ? await prisma.article.findMany({
        where: { ...dateFilter, importanceScore: { gte: 4, lte: 6 } },
        orderBy: { importanceScore: "desc" },
        take: notableSlots,
        include: includeSource,
      })
    : [];

  const articles = [...priorityArticles, ...notableArticles];

  const serialized = JSON.parse(JSON.stringify(articles)) as ArticleRow[];
  const topicGroups = groupArticlesByTopic(serialized);

  const latestEnrichedAt = articles.reduce<string | null>((latest, a) => {
    const enriched = a.enrichedAt ? new Date(a.enrichedAt).toISOString() : null;
    return enriched && (!latest || enriched > latest) ? enriched : latest;
  }, null);

  return (
    <div className="reading-container py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold text-(--foreground)">
          Daily Briefing
        </h1>
        <Suspense fallback={<div className="h-8 w-[120px]" />}>
          <DateStepper />
        </Suspense>
      </div>

      <BriefingDebugBox
        windowStart={windowStart.toISOString()}
        windowEnd={windowEnd.toISOString()}
        articleCount={articles.length}
        latestEnrichedAt={latestEnrichedAt}
        totalInWindow={totalInWindow}
        unenrichedInWindow={unenrichedInWindow}
        lowScoreInWindow={lowScoreInWindow}
      />

      {topicGroups.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm font-semibold text-(--foreground)">
            No briefing for this day
          </p>
          <p className="text-base text-(--muted-foreground) mt-1">
            No articles with an importance score of 4 or higher were published
            on this date. Check the Feed for all collected articles.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-sm font-semibold text-(--primary) hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 rounded"
          >
            View Feed
          </Link>
        </div>
      ) : (
        <div className="space-y-16">
          {topicGroups.map((group) => (
            <TopicGroup key={group.topic} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
