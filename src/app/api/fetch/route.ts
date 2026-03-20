import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchFeed } from "@/lib/rss";

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sources = await prisma.source.findMany();

  if (sources.length === 0) {
    return NextResponse.json({ fetched: 0, added: 0, errors: [] });
  }

  let added = 0;
  const errors: string[] = [];

  await Promise.allSettled(
    sources.map(async (source) => {
      try {
        const articles = await fetchFeed(source.url);
        const guids = articles.map((a) => a.guid);

        // Find which guids already exist
        const existing = await prisma.article.findMany({
          where: { guid: { in: guids } },
          select: { guid: true },
        });
        const existingGuids = new Set(existing.map((a) => a.guid));

        const newArticles = articles.filter((a) => !existingGuids.has(a.guid));

        if (newArticles.length > 0) {
          for (const article of newArticles) {
            await prisma.article.upsert({
              where: { guid: article.guid },
              create: {
                guid: article.guid,
                title: article.title,
                link: article.link,
                description: article.description,
                thumbnail: article.thumbnail,
                publishedAt: article.publishedAt,
                readTimeMin: article.readTimeMin,
                sourceId: source.id,
              },
              update: {},
            });
          }
          added += newArticles.length;
        }
      } catch (err) {
        errors.push(
          `${source.name}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    })
  );

  return NextResponse.json({ fetched: sources.length, added, errors });
}
