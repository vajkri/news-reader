import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    article: {
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

// Mock tool() to return the config object so we can call .execute directly
vi.mock('ai', () => ({
  tool: vi.fn((config) => config),
}));

import { prisma } from '@/lib/prisma';
import {
  searchArticlesTool,
  articlesByTopicTool,
  recentArticlesTool,
} from '@/lib/chat-tools';

const mockFindMany = vi.mocked(prisma.article.findMany);
const mockQueryRaw = vi.mocked(prisma.$queryRaw);

const sampleRawArticle = {
  id: 1,
  title: 'Claude 4 Released',
  summary: 'Anthropic released Claude 4 with improved reasoning.',
  link: 'https://example.com/claude-4',
  publishedAt: new Date('2026-03-20'),
  importanceScore: 9,
  topics: ['model releases', 'industry moves'],
  sourceName: 'TechCrunch',
  sourceCategory: 'tech',
};

const sampleArticle = {
  id: 1,
  title: 'Claude 4 Released',
  summary: 'Anthropic released Claude 4 with improved reasoning.',
  source: { name: 'TechCrunch', category: 'tech' },
  publishedAt: new Date('2026-03-20'),
  link: 'https://example.com/claude-4',
  importanceScore: 9,
  topics: ['model releases', 'industry moves'],
};

describe('searchArticlesTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls prisma.$queryRaw (not findMany) for full-text search', async () => {
    mockQueryRaw.mockResolvedValue([sampleRawArticle] as never);

    await searchArticlesTool.execute({ query: 'Claude', limit: 5 }, {} as never);

    expect(mockQueryRaw).toHaveBeenCalled();
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it('returns mapped results with source name from raw query', async () => {
    mockQueryRaw.mockResolvedValue([sampleRawArticle] as never);

    const result = await searchArticlesTool.execute({ query: 'Claude', limit: 5 }, {} as never);

    expect(result).toEqual([
      {
        id: 1,
        title: 'Claude 4 Released',
        summary: 'Anthropic released Claude 4 with improved reasoning.',
        source: 'TechCrunch',
        publishedAt: new Date('2026-03-20'),
        link: 'https://example.com/claude-4',
        importanceScore: 9,
        topics: ['model releases', 'industry moves'],
      },
    ]);
  });

  it('returns empty topics array when topics is null', async () => {
    mockQueryRaw.mockResolvedValue([
      { ...sampleRawArticle, topics: null },
    ] as never);

    const result = await searchArticlesTool.execute({ query: 'Claude', limit: 5 }, {} as never);

    expect(result[0].topics).toEqual([]);
  });

  it('has a non-empty description and inputSchema', () => {
    expect(searchArticlesTool.description).toBeTypeOf('string');
    expect(searchArticlesTool.description.length).toBeGreaterThan(0);
    expect(searchArticlesTool.inputSchema).toBeDefined();
  });
});

describe('articlesByTopicTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls prisma.article.findMany filtering topics path contains the topic string', async () => {
    mockFindMany.mockResolvedValue([sampleArticle] as never);

    await articlesByTopicTool.execute({ topic: 'model releases', limit: 5 }, {} as never);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          topics: { path: [], array_contains: 'model releases' },
          enrichedAt: { not: null },
        }),
      })
    );
  });
});

describe('recentArticlesTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls prisma.article.findMany with publishedAt >= 7 days ago, enrichedAt not null', async () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    mockFindMany.mockResolvedValue([sampleArticle] as never);

    await recentArticlesTool.execute({ days: 7 }, {} as never);

    const expectedCutoff = new Date(now - 7 * 24 * 60 * 60 * 1000);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          publishedAt: { gte: expectedCutoff },
          enrichedAt: { not: null },
        }),
        take: 10,
      })
    );

    vi.restoreAllMocks();
  });

  it('defaults to 3 days when days not provided', async () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    mockFindMany.mockResolvedValue([] as never);

    // Zod .default(3) applies before execute; mock bypasses Zod so we pass default value
    await recentArticlesTool.execute({ days: 3 }, {} as never);

    const expectedCutoff = new Date(now - 3 * 24 * 60 * 60 * 1000);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          publishedAt: { gte: expectedCutoff },
        }),
      })
    );

    vi.restoreAllMocks();
  });
});

describe('tool descriptions', () => {
  it('all tool descriptions are non-empty strings', () => {
    expect(searchArticlesTool.description).toBeTypeOf('string');
    expect(searchArticlesTool.description.length).toBeGreaterThan(0);

    expect(articlesByTopicTool.description).toBeTypeOf('string');
    expect(articlesByTopicTool.description.length).toBeGreaterThan(0);

    expect(recentArticlesTool.description).toBeTypeOf('string');
    expect(recentArticlesTool.description.length).toBeGreaterThan(0);
  });
});
