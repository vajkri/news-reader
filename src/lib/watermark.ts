import 'server-only';
import { prisma } from './prisma';

const WATERMARK_KEY = 'briefing_watermark';
const DEFAULT_WATERMARK_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getWatermark(): Promise<Date> {
  const pref = await prisma.userPreference.findUnique({
    where: { key: WATERMARK_KEY },
  });
  if (pref) {
    return new Date(pref.value);
  }
  // First visit: seed watermark to 24h ago to avoid overwhelming with full backlog
  return new Date(Date.now() - DEFAULT_WATERMARK_AGE_MS);
}

export async function updateWatermark(ts: Date): Promise<void> {
  await prisma.userPreference.upsert({
    where: { key: WATERMARK_KEY },
    update: { value: ts.toISOString() },
    create: { key: WATERMARK_KEY, value: ts.toISOString() },
  });
}
