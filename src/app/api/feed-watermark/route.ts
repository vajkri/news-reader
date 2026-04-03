import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const FEED_WATERMARK_KEY = 'feed_watermark';
const DEFAULT_WATERMARK_AGE_MS = 24 * 60 * 60 * 1000;

export async function GET(): Promise<NextResponse> {
  const pref = await prisma.userPreference.findUnique({
    where: { key: FEED_WATERMARK_KEY },
  });
  const watermark = pref
    ? pref.value
    : new Date(Date.now() - DEFAULT_WATERMARK_AGE_MS).toISOString();
  return NextResponse.json({ watermark });
}

export async function POST(): Promise<NextResponse> {
  const now = new Date().toISOString();
  await prisma.userPreference.upsert({
    where: { key: FEED_WATERMARK_KEY },
    update: { value: now },
    create: { key: FEED_WATERMARK_KEY, value: now },
  });
  return NextResponse.json({ watermark: now });
}
