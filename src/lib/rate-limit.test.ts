import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    rateLimit: {
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { rateLimit, WINDOW_MS, MAX_MESSAGES } from '@/lib/rate-limit';

const mockUpsert = vi.mocked(prisma.rateLimit.upsert);
const mockUpdate = vi.mocked(prisma.rateLimit.update);

describe('rateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows and creates a new record for a first-time key', async () => {
    mockUpsert.mockResolvedValue({
      id: 1,
      key: '192.168.1.1',
      count: 1,
      windowStart: new Date(),
    });

    const result = await rateLimit('192.168.1.1');

    expect(result).toEqual({ allowed: true, retryAfterMinutes: null });
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: '192.168.1.1' },
        create: expect.objectContaining({ key: '192.168.1.1', count: 1 }),
        update: { count: { increment: 1 } },
      })
    );
  });

  it('allows when count is at MAX_MESSAGES (20) within window', async () => {
    mockUpsert.mockResolvedValue({
      id: 1,
      key: '192.168.1.1',
      count: MAX_MESSAGES,
      windowStart: new Date(),
    });

    const result = await rateLimit('192.168.1.1');

    expect(result).toEqual({ allowed: true, retryAfterMinutes: null });
  });

  it('denies when count exceeds MAX_MESSAGES and returns retry minutes', async () => {
    const windowStart = new Date(Date.now() - 30 * 60 * 1000); // 30 min ago
    mockUpsert.mockResolvedValue({
      id: 1,
      key: '192.168.1.1',
      count: MAX_MESSAGES + 1,
      windowStart,
    });
    mockUpdate.mockResolvedValue({} as never);

    const result = await rateLimit('192.168.1.1');

    expect(result.allowed).toBe(false);
    expect(result.retryAfterMinutes).toBeTypeOf('number');
    expect(result.retryAfterMinutes).toBeGreaterThan(0);
    expect(result.retryAfterMinutes).toBeLessThanOrEqual(30);
    // Should decrement to undo the over-limit increment
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: '192.168.1.1' },
        data: { count: { decrement: 1 } },
      })
    );
  });

  it('resets window when windowStart is older than WINDOW_MS', async () => {
    const expiredStart = new Date(Date.now() - WINDOW_MS - 60000); // expired 1 min ago
    mockUpsert.mockResolvedValue({
      id: 1,
      key: '192.168.1.1',
      count: 50, // high count from old window
      windowStart: expiredStart,
    });
    mockUpdate.mockResolvedValue({} as never);

    const result = await rateLimit('192.168.1.1');

    expect(result).toEqual({ allowed: true, retryAfterMinutes: null });
    // Should reset count and windowStart
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: '192.168.1.1' },
        data: expect.objectContaining({ count: 1, windowStart: expect.any(Date) }),
      })
    );
  });

  it('allows when count is below MAX_MESSAGES within valid window', async () => {
    mockUpsert.mockResolvedValue({
      id: 1,
      key: '10.0.0.1',
      count: 5,
      windowStart: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
    });

    const result = await rateLimit('10.0.0.1');

    expect(result).toEqual({ allowed: true, retryAfterMinutes: null });
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
