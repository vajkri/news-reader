import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { parseISO, isValid, isToday, format } from "date-fns";
import { groupArticlesByTopic } from "@/lib/briefing";
import type { ArticleRow } from "@/types";
import {
  TopicGroup,
  DateStepper,
  BriefingDebugBox,
  SectionDivider,
  CaughtUpState,
  ArchiveBanner,
  StatusBar,
  PendingSection,
  TriageSection,
} from "@/components/features/briefing";
import { getWatermark, updateWatermark } from "@/lib/watermark";

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

  // Determine mode: archive if date param is present and not today
  const isArchiveMode = !!(parsed && isValid(parsed) && !isToday(parsed));

  const includeSource = { source: { select: { name: true, category: true } } };

  if (isArchiveMode) {
    // Archive mode: frozen top 15 by publishedAt date, no watermark
    const y = selectedDate.getUTCFullYear();
    const m = selectedDate.getUTCMonth();
    const d = selectedDate.getUTCDate();
    const dayStart = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));

    const archiveArticles = await prisma.article.findMany({
      where: {
        enrichedAt: { not: null },
        publishedAt: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { importanceScore: 'desc' },
      take: 15,
      include: includeSource,
    });

    const serialized = JSON.parse(JSON.stringify(archiveArticles)) as ArticleRow[];
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

        <ArchiveBanner date={selectedDate} />

        {topicGroups.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm font-semibold text-(--foreground)">
              No briefing for this day
            </p>
            <p className="text-base text-(--muted-foreground) mt-1">
              No enriched articles were published on this date.
            </p>
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

  // Live mode: watermark-based catch-me-up
  const watermark = await getWatermark();
  // Update watermark to now (record this visit)
  await updateWatermark(new Date());

  // Query new articles: enriched AND approved after watermark, top 15 by importance
  const newArticles = await prisma.article.findMany({
    where: {
      enrichedAt: { not: null, gt: watermark },
      approvedAt: { not: null },
    },
    orderBy: { importanceScore: 'desc' },
    take: 15,
    include: includeSource,
  });

  // Triage queue: enriched but not yet approved
  const triageArticles = await prisma.article.findMany({
    where: {
      enrichedAt: { not: null },
      approvedAt: null,
    },
    orderBy: { importanceScore: 'desc' },
    select: {
      id: true,
      title: true,
      summary: true,
      importanceScore: true,
      source: { select: { name: true } },
    },
  });

  // Query reviewed articles: enriched at or before watermark, published today, top 15
  const today = new Date();
  const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
  const todayEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 23, 59, 59, 999));

  const reviewedArticles = await prisma.article.findMany({
    where: {
      enrichedAt: { not: null, lte: watermark },
      publishedAt: { gte: todayStart, lte: todayEnd },
    },
    orderBy: { importanceScore: 'desc' },
    take: 15,
    include: includeSource,
  });

  // Pending articles: fetched within 48h but not yet enriched
  const pendingCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const pendingArticles = await prisma.article.findMany({
    where: {
      enrichedAt: null,
      createdAt: { gte: pendingCutoff },
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      publishedAt: true,
      source: { select: { name: true } },
    },
  });

  // Last enriched timestamp from any enriched article (for StatusBar display)
  const lastEnrichedRecord = await prisma.article.findFirst({
    where: { enrichedAt: { not: null } },
    orderBy: { enrichedAt: 'desc' },
    select: { enrichedAt: true },
  });
  const lastEnrichedAt = lastEnrichedRecord?.enrichedAt?.toISOString() ?? null;

  // Diagnostic counts (dev only)
  const [totalEnriched, devPendingCount] =
    process.env.NODE_ENV === 'development'
      ? await Promise.all([
          prisma.article.count({
            where: { enrichedAt: { not: null } },
          }),
          prisma.article.count({
            where: { enrichedAt: null },
          }),
        ])
      : [0, 0];

  const serializedNew = JSON.parse(JSON.stringify(newArticles)) as ArticleRow[];
  const serializedReviewed = JSON.parse(JSON.stringify(reviewedArticles)) as ArticleRow[];

  const newTopicGroups = groupArticlesByTopic(serializedNew);
  const reviewedTopicGroups = groupArticlesByTopic(serializedReviewed);

  const watermarkLabel = format(watermark, 'h:mm a');

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
        windowStart={todayStart.toISOString()}
        windowEnd={todayEnd.toISOString()}
        articleCount={newArticles.length + reviewedArticles.length}
        latestEnrichedAt={lastEnrichedAt}
        totalInWindow={totalEnriched}
        unenrichedInWindow={devPendingCount}
        lowScoreInWindow={0}
      />

      <StatusBar
        newCount={newArticles.length}
        lastVisit={watermark}
        lastEnrichedAt={lastEnrichedAt}
        pendingCount={pendingArticles.length}
      />

      <TriageSection
        key={triageArticles.map((a) => a.id).join(',')}
        articles={JSON.parse(JSON.stringify(triageArticles))}
      />

      <PendingSection articles={JSON.parse(JSON.stringify(pendingArticles))} />

      {newArticles.length === 0 ? (
        <>
          <CaughtUpState lastVisit={watermark.toISOString()} />
          {reviewedTopicGroups.length > 0 && (
            <>
              <SectionDivider label="Already reviewed" variant="reviewed" />
              <div className="space-y-16 opacity-50">
                {reviewedTopicGroups.map((group) => (
                  <TopicGroup key={group.topic} group={group} />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <SectionDivider label={`New since ${watermarkLabel}`} variant="new" />
          <div className="space-y-16">
            {newTopicGroups.map((group) => (
              <TopicGroup key={group.topic} group={group} isNew />
            ))}
          </div>

          {reviewedTopicGroups.length > 0 && (
            <>
              <SectionDivider label="Already reviewed" variant="reviewed" />
              <div className="space-y-16 opacity-50">
                {reviewedTopicGroups.map((group) => (
                  <TopicGroup key={group.topic} group={group} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
