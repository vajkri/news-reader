import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    userPreference: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { getWatermark, updateWatermark } from '@/lib/watermark';

const mockFindUnique = vi.mocked(prisma.userPreference.findUnique);
const mockUpsert = vi.mocked(prisma.userPreference.upsert);

describe('getWatermark', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns stored watermark date when preference exists', async () => {
    const stored = '2026-03-29T10:00:00.000Z';
    mockFindUnique.mockResolvedValue({ id: 1, key: 'briefing_watermark', value: stored, updatedAt: new Date() });
    const result = await getWatermark();
    expect(result).toEqual(new Date(stored));
  });

  it('returns date 24h ago when no preference exists (first visit)', async () => {
    mockFindUnique.mockResolvedValue(null);
    const before = Date.now() - 24 * 60 * 60 * 1000;
    const result = await getWatermark();
    const after = Date.now() - 24 * 60 * 60 * 1000;
    expect(result.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.getTime()).toBeLessThanOrEqual(after + 100);
  });
});

describe('updateWatermark', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('upserts watermark with ISO string value', async () => {
    mockUpsert.mockResolvedValue({} as never);
    const ts = new Date('2026-03-29T12:00:00.000Z');
    await updateWatermark(ts);
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { key: 'briefing_watermark' },
      update: { value: '2026-03-29T12:00:00.000Z' },
      create: { key: 'briefing_watermark', value: '2026-03-29T12:00:00.000Z' },
    });
  });
});
