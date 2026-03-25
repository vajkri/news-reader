"use server";

import { prisma } from "@/lib/prisma";
import { fetchFeed } from "@/lib/rss";

interface FetchResult {
  fetched: number;
  added: number;
  errors: string[];
}

export async function fetchFeeds(): Promise<FetchResult> {
  const sources = await prisma.source.findMany();

  if (sources.length === 0) {
    return { fetched: 0, added: 0, errors: [] };
  }

  let added = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    sources.map(async (source) => {
      try {
        const articles = await fetchFeed(source.url);
        const guids = articles.map((a) => a.guid);

        const existing = await prisma.article.findMany({
          where: { guid: { in: guids } },
          select: { guid: true },
        });
        const existingGuids = new Set(existing.map((a) => a.guid));

        const newArticles = articles.filter((a) => !existingGuids.has(a.guid));

        if (newArticles.length > 0) {
          const results = await Promise.allSettled(
            newArticles.map((article) =>
              prisma.article.create({
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
              })
            )
          );
          added += results.filter((r) => r.status === "fulfilled").length;
        }
      } catch (err) {
        errors.push(
          `${source.name}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    })
  );

  return { fetched: sources.length, added, errors };
}
