import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface ApproveBody {
  score?: number;
  dismissed?: boolean;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const articleId = parseInt(id, 10);
  if (isNaN(articleId)) {
    return NextResponse.json({ error: 'Invalid article ID' }, { status: 400 });
  }

  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { id: true, enrichedAt: true, importanceScore: true, sourceId: true, topics: true, contentType: true },
  });

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  if (!article.enrichedAt) {
    return NextResponse.json({ error: 'Article not yet enriched' }, { status: 400 });
  }

  const body = (await request.json()) as ApproveBody;
  const dismissed = body.dismissed === true;
  const finalScore = dismissed ? 1 : (body.score ?? article.importanceScore);

  // Update article: set approvedAt and optionally override score
  await prisma.article.update({
    where: { id: articleId },
    data: {
      approvedAt: new Date(),
      importanceScore: finalScore,
    },
  });

  // Record feedback for AI calibration if user changed the score
  const aiScore = article.importanceScore ?? 5;
  const userScore = finalScore ?? aiScore;
  if (userScore !== aiScore || dismissed) {
    const direction = dismissed ? 'down' : userScore > aiScore ? 'up' : userScore < aiScore ? 'down' : 'up';
    const reasons = dismissed
      ? ['not_relevant']
      : userScore !== aiScore
        ? ['score_override']
        : [];

    await prisma.articleFeedback.create({
      data: {
        articleId,
        direction,
        reasons,
        sourceId: article.sourceId,
        topics: article.topics ?? [],
        contentType: article.contentType,
      },
    });
  }

  return NextResponse.json({ ok: true, score: finalScore, dismissed });
}
