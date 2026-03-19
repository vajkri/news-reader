import { NextResponse } from 'next/server';
import {
  fetchUnenrichedArticles,
  enrichArticlesBatch,
  saveEnrichmentResults,
} from '@/lib/enrich';

export const maxDuration = 60;

export async function GET(request: Request): Promise<Response> {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const articles = await fetchUnenrichedArticles();

  if (articles.length === 0) {
    return NextResponse.json({ enriched: 0, skipped: 0, errors: [] });
  }

  try {
    const enrichmentResults = await enrichArticlesBatch(articles);
    const { saved, errors } = await saveEnrichmentResults(enrichmentResults);

    return NextResponse.json({
      enriched: saved,
      skipped: articles.length - saved,
      errors,
    });
  } catch (error) {
    return NextResponse.json(
      {
        enriched: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      },
      { status: 500 },
    );
  }
}
