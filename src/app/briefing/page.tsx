import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, parseISO, isValid } from "date-fns";
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
  const selectedDate =
    dateParam && isValid(parseISO(dateParam))
      ? parseISO(dateParam)
      : new Date();
  const windowStart = startOfDay(selectedDate);
  const windowEnd = endOfDay(selectedDate);

  const articles = await prisma.article.findMany({
    where: {
      enrichedAt: { not: null },
      importanceScore: { gte: 4 },
      AND: [
        { publishedAt: { not: null } },
        { publishedAt: { gte: windowStart, lte: windowEnd } },
      ],
    },
    orderBy: { importanceScore: "desc" },
    take: 10,
    include: { source: { select: { name: true, category: true } } },
  });

  const serialized = JSON.parse(JSON.stringify(articles)) as ArticleRow[];
  const topicGroups = groupArticlesByTopic(serialized);

  return (
    <div className="section-container py-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-base font-semibold text-[var(--foreground)]">
          Daily Briefing
        </h1>
        <DateStepper />
      </div>

      {topicGroups.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            No briefing for this day
          </p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            No articles with an importance score of 4 or higher were published
            on this date. Check the Feed for all collected articles.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-sm font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 rounded"
          >
            View Feed
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {topicGroups.map((group) => (
            <TopicGroup key={group.topic} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
