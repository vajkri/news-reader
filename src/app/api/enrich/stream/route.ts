import {
  fetchUnenrichedArticles,
  enrichArticlesBatch,
  type EnrichmentResult,
} from '@/lib/enrich';
import { prisma } from '@/lib/prisma';
import { consumeToken } from '@/lib/stream-tokens';

export const maxDuration = 300;

function sseEvent(event: string, data: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token || !consumeToken(token)) {
    return new Response('Unauthorized', { status: 401 });
  }
  const batchSize = Math.min(parseInt(url.searchParams.get('batch') ?? '5', 10) || 5, 25);
  const loop = url.searchParams.get('loop') !== 'false';

  const encoder = new TextEncoder();
  let totalEnriched = 0;
  let batchNumber = 0;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        do {
          const articles = await fetchUnenrichedArticles(batchSize);
          if (articles.length === 0) break;

          batchNumber++;
          controller.enqueue(encoder.encode(sseEvent('batch-start', {
            batchNumber,
            count: articles.length,
            articles: articles.map((a) => ({ id: a.id, title: a.title, source: a.source.name })),
          })));

          let results: EnrichmentResult[];
          try {
            results = await enrichArticlesBatch(articles);
          } catch (error) {
            controller.enqueue(encoder.encode(sseEvent('batch-error', {
              batchNumber,
              error: error instanceof Error ? error.message : String(error),
            })));
            break;
          }

          // Save results one by one and emit per-article events
          for (const result of results) {
            try {
              await prisma.article.update({
                where: { id: result.articleId },
                data: {
                  summary: result.summary,
                  topics: result.topics,
                  importanceScore: result.importanceScore,
                  contentType: result.contentType,
                  thinContent: result.thinContent,
                  enrichedAt: new Date(),
                },
              });
              totalEnriched++;
              const article = articles.find((a) => a.id === result.articleId);
              controller.enqueue(encoder.encode(sseEvent('article-enriched', {
                id: result.articleId,
                title: article?.title ?? '',
                source: article?.source.name ?? '',
                summary: result.summary,
                score: result.importanceScore,
                contentType: result.contentType,
                totalSoFar: totalEnriched,
              })));
            } catch (error) {
              controller.enqueue(encoder.encode(sseEvent('article-error', {
                id: result.articleId,
                error: error instanceof Error ? error.message : String(error),
              })));
            }
          }

          controller.enqueue(encoder.encode(sseEvent('batch-complete', {
            batchNumber,
            enriched: results.length,
            totalSoFar: totalEnriched,
          })));
        } while (loop);

        controller.enqueue(encoder.encode(sseEvent('done', { totalEnriched })));
      } catch (error) {
        controller.enqueue(encoder.encode(sseEvent('error', {
          error: error instanceof Error ? error.message : String(error),
        })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
