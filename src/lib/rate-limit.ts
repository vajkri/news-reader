import 'server-only';
import { prisma } from './prisma';

/** 1 hour in milliseconds */
export const WINDOW_MS = 60 * 60 * 1000;

/** Maximum messages allowed per window (D-05) */
export const MAX_MESSAGES = 20;

/**
 * Atomically check and increment the rate limit for a key.
 * Uses a single upsert to avoid check-then-increment race conditions.
 * Returns whether the request is allowed and, if not, how many minutes until reset.
 */
export async function rateLimit(key: string): Promise<{
  allowed: boolean;
  retryAfterMinutes: number | null;
}> {
  const now = new Date();
  const windowCutoff = new Date(now.getTime() - WINDOW_MS);

  // Atomic upsert: create if not exists, update if exists
  const record = await prisma.rateLimit.upsert({
    where: { key },
    create: {
      key,
      count: 1,
      windowStart: now,
    },
    update: {
      // Prisma doesn't support conditional update expressions,
      // so we always increment here and check afterward.
      count: { increment: 1 },
    },
  });

  // If the window has expired, reset and allow
  if (record.windowStart < windowCutoff) {
    await prisma.rateLimit.update({
      where: { key },
      data: { count: 1, windowStart: now },
    });
    return { allowed: true, retryAfterMinutes: null };
  }

  // If over the limit, calculate retry time and undo the increment
  if (record.count > MAX_MESSAGES) {
    await prisma.rateLimit.update({
      where: { key },
      data: { count: { decrement: 1 } },
    });
    const resetAt = record.windowStart.getTime() + WINDOW_MS;
    const retryAfterMinutes = Math.ceil((resetAt - Date.now()) / 60000);
    return { allowed: false, retryAfterMinutes };
  }

  return { allowed: true, retryAfterMinutes: null };
}
