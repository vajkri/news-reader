import { NextResponse } from 'next/server';
import {
  fetchUnenrichedArticles,
  enrichArticlesBatch,
  saveEnrichmentResults,
} from '@/lib/enrich';

export const maxDuration = 60;

const TIME_BUDGET_MS = 50_000; // Stop before maxDuration to save/respond

export async function GET(request: Request): Promise<Response> {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const startTime = Date.now();
  let totalEnriched = 0;
  const allErrors: string[] = [];

  // Process batches until all done or time budget exhausted
  while (Date.now() - startTime < TIME_BUDGET_MS) {
    const articles = await fetchUnenrichedArticles();

    if (articles.length === 0) break;

    try {
      const enrichmentResults = await enrichArticlesBatch(articles);
      const { saved, errors } = await saveEnrichmentResults(enrichmentResults);
      totalEnriched += saved;
      allErrors.push(...errors);
    } catch (error) {
      allErrors.push(error instanceof Error ? error.message : String(error));
      break;
    }
  }

  return NextResponse.json({
    enriched: totalEnriched,
    errors: allErrors,
  });
}
