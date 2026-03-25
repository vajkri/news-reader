import "server-only";
import { prisma } from "@/lib/prisma";
import { fetchArticles, type FetchSource } from "@/lib/fetch-strategies";

interface FetchResult {
  fetched: number;
  added: number;
  errors: string[];
}

/**
 * Fetches articles from all sources using the strategy dispatcher,
 * deduplicates against existing articles, and persists new ones.
 *
 * Shared between the cron route (POST /api/fetch) and the UI server action.
 */
export async function fetchAndPersistArticles(): Promise<FetchResult> {
  const sources: (FetchSource & { id: number; name: string })[] =
    await prisma.source.findMany({
      select: {
        id: true,
        name: true,
        url: true,
        sourceType: true,
        sitemapPathPattern: true,
        scrapeUrl: true,
        scrapeLinkSelector: true,
      },
    });

  if (sources.length === 0) {
    return { fetched: 0, added: 0, errors: [] };
  }

  let totalAdded = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    sources.map(async (source) => {
      try {
        // For sitemap sources, pre-load known guids so the strategy can skip
        // pages we already have (avoids refetching 50+ pages on every cron run)
        let knownGuids: Set<string> | undefined;
        if (source.sourceType === "sitemap") {
          const existingArticles = await prisma.article.findMany({
            where: { sourceId: source.id },
            select: { guid: true },
          });
          knownGuids = new Set(existingArticles.map((a) => a.guid));
        }

        const articles = await fetchArticles(source, knownGuids);
        const guids = articles.map((a) => a.guid);

        if (guids.length === 0) return;

        const existing = await prisma.article.findMany({
          where: { guid: { in: guids } },
          select: { guid: true },
        });
        const existingGuids = new Set(existing.map((a) => a.guid));

        const newArticles = articles.filter((a) => !existingGuids.has(a.guid));

        for (const article of newArticles) {
          try {
            await prisma.article.create({
              data: {
                guid: article.guid,
                title: article.title,
                link: article.link,
                description: article.description,
                thumbnail: article.thumbnail,
                publishedAt: article.publishedAt,
                readTimeMin: article.readTimeMin,
                sourceId: source.id,
              },
            });
            totalAdded++;
          } catch (e) {
            // Skip duplicates (race condition with guid unique constraint)
            if (e instanceof Error && e.message.includes("Unique constraint"))
              continue;
            throw e;
          }
        }
      } catch (err) {
        errors.push(
          `${source.name}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    })
  );

  return { fetched: sources.length, added: totalAdded, errors };
}
