import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { parseISO, isValid } from "date-fns";
import { groupArticlesByTopic } from "@/lib/briefing";
import type { ArticleRow } from "@/types";
import { TopicGroup, DateStepper } from "@/components/features/briefing";
import Link from "next/link";

export const revalidate = 300;

export default async function BriefingPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const dateParam = params.date;
  const parsed = dateParam ? parseISO(dateParam) : null;
  const selectedDate = parsed && isValid(parsed) ? parsed : new Date();
  // TLDR articles are stamped with the previous day's midnight UTC,
  // so "today's briefing" shows articles published yesterday (UTC).
  const y = selectedDate.getUTCFullYear();
  const m = selectedDate.getUTCMonth();
  const d = selectedDate.getUTCDate() - 1; // Date.UTC handles day=0 correctly (rolls to previous month's last day)
  const windowStart = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
  const windowEnd = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));

  const dateFilter = {
    enrichedAt: { not: null },
    AND: [
      { publishedAt: { not: null } },
      { publishedAt: { gte: windowStart, lte: windowEnd } },
    ],
  };
  const includeSource = { source: { select: { name: true, category: true } } };

  // All critical (9-10) and important (7-8) articles always show
  const priorityArticles = await prisma.article.findMany({
    where: { ...dateFilter, importanceScore: { gte: 7 } },
    orderBy: { importanceScore: "desc" },
    include: includeSource,
  });

  // Fill remaining slots with notable (4-6) up to 20 total
  const notableSlots = Math.max(0, 20 - priorityArticles.length);
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
