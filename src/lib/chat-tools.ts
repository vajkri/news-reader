import 'server-only';
import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from './prisma';

interface RawSearchResult {
  id: number;
  title: string;
  summary: string | null;
  link: string;
  publishedAt: Date | null;
  importanceScore: number | null;
  topics: unknown;
  sourceName: string;
  sourceCategory: string | null;
}

function mapArticleResponse(a: {
  id: number;
  title: string;
  summary: string | null;
  source: { name: string; category: string | null };
  publishedAt: Date | null;
  link: string;
  importanceScore: number | null;
  topics: unknown;
}): {
  id: number;
  title: string;
  summary: string | null;
  source: string;
  publishedAt: Date | null;
  link: string;
  importanceScore: number | null;
  topics: string[];
} {
  return {
    id: a.id,
    title: a.title,
    summary: a.summary,
    source: a.source.name,
    publishedAt: a.publishedAt,
    link: a.link,
    importanceScore: a.importanceScore,
    topics: (a.topics as string[] | null) ?? [],
  };
}

export const searchArticlesTool = tool({
  description:
    'Search articles by keyword in title or description. Use for specific queries like company names, product names, or topics.',
  inputSchema: z.object({
    query: z.string().describe('Search keyword or phrase'),
    limit: z
      .number()
      .optional()
      .default(5)
      .describe('Max results to return'),
  }),
  execute: async ({ query, limit }) => {
    const articles = await prisma.$queryRaw<RawSearchResult[]>`
      SELECT
        a.id, a.title, a.summary, a.link,
        a."publishedAt", a."importanceScore", a.topics,
        s.name AS "sourceName", s.category AS "sourceCategory"
      FROM "Article" a
      JOIN "Source" s ON a."sourceId" = s.id
      WHERE a."enrichedAt" IS NOT NULL
        AND (
          to_tsvector('english', coalesce(a.title, '') || ' ' || coalesce(a.description, '') || ' ' || coalesce(a.summary, ''))
          @@ plainto_tsquery('english', ${query})
        )
      ORDER BY
        ts_rank(
          to_tsvector('english', coalesce(a.title, '') || ' ' || coalesce(a.description, '') || ' ' || coalesce(a.summary, '')),
          plainto_tsquery('english', ${query})
        ) DESC,
        a."importanceScore" DESC NULLS LAST,
        a."publishedAt" DESC NULLS LAST
      LIMIT ${limit}
    `;

    return articles.map((a) => ({
      id: a.id,
      title: a.title,
      summary: a.summary,
      source: a.sourceName,
      publishedAt: a.publishedAt,
      link: a.link,
      importanceScore: a.importanceScore,
      topics: (a.topics as string[] | null) ?? [],
    }));
  },
});

export const articlesByTopicTool = tool({
  description:
    'Find articles by topic category. Topics include: model releases, developer tools, industry moves, open source, research, policy, infrastructure.',
  inputSchema: z.object({
    topic: z.string().describe('Topic category'),
    limit: z.number().optional().default(5),
  }),
  execute: async ({ topic, limit }) => {
    const articles = await prisma.article.findMany({
      where: {
        topics: { path: [], array_contains: topic },
        enrichedAt: { not: null },
      },
      orderBy: [{ importanceScore: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
      include: { source: { select: { name: true, category: true } } },
    });
    return articles.map(mapArticleResponse);
  },
});

export const recentArticlesTool = tool({
  description:
    'Get the most recent and important articles from the last N days. Good for "what happened today/this week" questions.',
  inputSchema: z.object({
    days: z
      .number()
      .optional()
      .default(3)
      .describe('Number of days to look back'),
  }),
  execute: async ({ days }) => {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const articles = await prisma.article.findMany({
      where: {
        publishedAt: { gte: cutoff },
        enrichedAt: { not: null },
      },
      orderBy: [{ importanceScore: 'desc' }, { publishedAt: 'desc' }],
      take: 10,
      include: { source: { select: { name: true, category: true } } },
    });
    return articles.map(mapArticleResponse);
  },
});
