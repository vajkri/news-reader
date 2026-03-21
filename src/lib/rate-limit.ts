import 'server-only';
import { prisma } from './prisma';

/** 1 hour in milliseconds */
export const WINDOW_MS = 60 * 60 * 1000;

/** Maximum messages allowed per window (D-05) */
export const MAX_MESSAGES = 20;

/**
 * Check if a key has exceeded the rate limit within the current window.
 * Returns null if under limit, or the number of minutes until the window
 * resets if at/over the limit.
 */
export async function checkRateLimit(key: string): Promise<number | null> {
  const windowCutoff = new Date(Date.now() - WINDOW_MS);

  const record = await prisma.rateLimit.findFirst({
    where: { key, windowStart: { gte: windowCutoff } },
  });

  if (!record || record.count < MAX_MESSAGES) {
    return null;
  }

  const resetAt = record.windowStart.getTime() + WINDOW_MS;
  return Math.ceil((resetAt - Date.now()) / 60000);
}

/**
 * Increment the rate limit counter for a key.
 * Creates a new record if none exists or the window has expired.
 * Increments the existing record's count if within a valid window.
 */
export async function incrementRateLimit(key: string): Promise<void> {
  const windowCutoff = new Date(Date.now() - WINDOW_MS);

  const existing = await prisma.rateLimit.findFirst({
    where: { key, windowStart: { gte: windowCutoff } },
  });

  if (existing) {
    await prisma.rateLimit.update({
      where: { id: existing.id },
      data: { count: existing.count + 1 },
    });
  } else {
    await prisma.rateLimit.upsert({
      where: { id: 0 },
      create: { key, count: 1, windowStart: new Date() },
      update: { count: 1, windowStart: new Date() },
    });
  }
}
