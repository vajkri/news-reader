import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface FeedbackBody {
  articleId: number;
  direction: 'up' | 'down';
  reasons: string[];
}

const VALID_UP_REASONS = [
  'Directly useful for my work',
  'Important industry shift',
  'Great summary quality',
  'Would have missed this',
];

const VALID_DOWN_REASONS = [
  'Not relevant to me',
  'Too generic / low substance',
  'Already knew this',
  'Not actually important',
  'Duplicate coverage',
];

export async function POST(request: Request): Promise<Response> {
  let body: FeedbackBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { articleId, direction, reasons } = body;

  if (!articleId || !direction || !Array.isArray(reasons) || reasons.length === 0) {
    return NextResponse.json({ error: 'Missing required fields: articleId, direction, reasons' }, { status: 400 });
  }

  if (direction !== 'up' && direction !== 'down') {
    return NextResponse.json({ error: 'direction must be "up" or "down"' }, { status: 400 });
  }

  const validReasons = direction === 'up' ? VALID_UP_REASONS : VALID_DOWN_REASONS;
  const invalidReasons = reasons.filter(r => !validReasons.includes(r));
  if (invalidReasons.length > 0) {
    return NextResponse.json({ error: `Invalid reasons: ${invalidReasons.join(', ')}` }, { status: 400 });
  }

  // Fetch article for denormalization (sourceId, topics, contentType)
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { sourceId: true, topics: true, contentType: true },
  });

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  // Create feedback record with denormalized fields (per D-18)
  await prisma.articleFeedback.create({
    data: {
      articleId,
      direction,
      reasons,
      sourceId: article.sourceId,
      topics: (article.topics as string[] | null) ?? [],
      contentType: article.contentType,
    },
  });

  return NextResponse.json({ ok: true });
}
