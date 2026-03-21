import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    rateLimit: {
      findFirst: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { checkRateLimit, incrementRateLimit } from '@/lib/rate-limit';

const mockFindFirst = vi.mocked(prisma.rateLimit.findFirst);
const mockUpdate = vi.mocked(prisma.rateLimit.update);
const mockUpsert = vi.mocked(prisma.rateLimit.upsert);

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no record exists for key (new user)', async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await checkRateLimit('192.168.1.1');
    expect(result).toBeNull();
  });

  it('returns null when record count is below MAX_MESSAGES (19 messages)', async () => {
    mockFindFirst.mockResolvedValue({
      id: 1,
      key: '192.168.1.1',
      count: 19,
      windowStart: new Date(),
    });

    const result = await checkRateLimit('192.168.1.1');
    expect(result).toBeNull();
  });

  it('returns minutes-until-reset number when count >= 20', async () => {
    const windowStart = new Date(Date.now() - 30 * 60 * 1000); // 30 min ago
    mockFindFirst.mockResolvedValue({
      id: 1,
      key: '192.168.1.1',
      count: 20,
      windowStart,
    });

    const result = await checkRateLimit('192.168.1.1');
    expect(result).toBeTypeOf('number');
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(30);
  });

  it('returns null when existing record windowStart is older than 1 hour (expired window)', async () => {
    // findFirst with windowStart >= (now - 1hr) won't match expired records
    // so Prisma returns null for expired windows
    mockFindFirst.mockResolvedValue(null);

    const result = await checkRateLimit('192.168.1.1');
    expect(result).toBeNull();
  });
});

describe('incrementRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new record when none exists for key', async () => {
    mockFindFirst.mockResolvedValue(null);
    mockUpsert.mockResolvedValue({} as never);

    await incrementRateLimit('10.0.0.1');

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.anything(),
        create: expect.objectContaining({
          key: '10.0.0.1',
          count: 1,
        }),
        update: expect.objectContaining({
          count: 1,
        }),
      })
    );
  });

  it('increments count on existing record within the window', async () => {
    const windowStart = new Date(Date.now() - 10 * 60 * 1000); // 10 min ago
    mockFindFirst.mockResolvedValue({
      id: 5,
      key: '10.0.0.1',
      count: 3,
      windowStart,
    });
    mockUpdate.mockResolvedValue({} as never);

    await incrementRateLimit('10.0.0.1');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 5 },
        data: { count: 4 },
      })
    );
  });

  it('resets count to 1 and updates windowStart when window has expired', async () => {
    // findFirst with valid window returns null (expired record not matched)
    mockFindFirst.mockResolvedValue(null);
    mockUpsert.mockResolvedValue({} as never);

    await incrementRateLimit('10.0.0.1');

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          key: '10.0.0.1',
          count: 1,
        }),
        update: expect.objectContaining({
          count: 1,
          windowStart: expect.any(Date),
        }),
      })
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
