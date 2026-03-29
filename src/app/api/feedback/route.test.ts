import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    article: { findUnique: vi.fn() },
    articleFeedback: { create: vi.fn() },
  },
}));

import { prisma } from '@/lib/prisma';
import { POST } from './route';

const mockFindUnique = vi.mocked(prisma.article.findUnique);
const mockCreate = vi.mocked(prisma.articleFeedback.create);

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/feedback', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('creates feedback record with denormalized article fields', async () => {
    mockFindUnique.mockResolvedValue({
      sourceId: 5,
      topics: ['model releases', 'developer tools'],
      contentType: 'news',
    } as never);
    mockCreate.mockResolvedValue({} as never);

    const res = await POST(makeRequest({
      articleId: 42,
      direction: 'down',
      reasons: ['Not relevant to me'],
    }));

    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        articleId: 42,
        direction: 'down',
        reasons: ['Not relevant to me'],
        sourceId: 5,
        topics: ['model releases', 'developer tools'],
        contentType: 'news',
      },
    });
  });

  it('returns 400 for missing required fields', async () => {
    const res = await POST(makeRequest({ articleId: 1 }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid direction', async () => {
    const res = await POST(makeRequest({
      articleId: 1, direction: 'sideways', reasons: ['test'],
    }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when article not found', async () => {
    mockFindUnique.mockResolvedValue(null);
    const res = await POST(makeRequest({
      articleId: 999, direction: 'up', reasons: ['Directly useful for my work'],
    }));
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid reason strings', async () => {
    mockFindUnique.mockResolvedValue({ sourceId: 1, topics: [], contentType: null } as never);
    const res = await POST(makeRequest({
      articleId: 1, direction: 'up', reasons: ['Not a valid reason'],
    }));
    expect(res.status).toBe(400);
  });
});
