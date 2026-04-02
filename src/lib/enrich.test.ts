import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('ai', () => ({
  generateText: vi.fn(),
  Output: {
    array: vi.fn((opts) => opts),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    article: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    articleFeedback: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/ai', () => ({
  AI_MODEL: 'deepseek/deepseek-v3.2',
}));

import { generateText, Output } from 'ai';
import { prisma } from '@/lib/prisma';
import {
  buildBatchPrompt,
  ArticleEnrichmentSchema,
  saveEnrichmentResults,
  enrichArticlesBatch,
  fetchUnenrichedArticles,
  buildCalibrationContext,
  SEED_TOPICS,
  BATCH_LIMIT,
} from '@/lib/enrich';

const mockGenerateText = vi.mocked(generateText);
const mockPrismaFindMany = vi.mocked(prisma.article.findMany);
const mockPrismaUpdate = vi.mocked(prisma.article.update);
const mockFeedbackFindMany = vi.mocked(prisma.articleFeedback.findMany);

describe('buildBatchPrompt', () => {
  it('formats articles correctly', () => {
    const articles = [
      { id: 1, title: 'Test Article', description: 'Test desc', source: { name: 'TestSource' } },
    ];
    const result = buildBatchPrompt(articles);
    expect(result).toContain('--- Article ID: 1');
    expect(result).toContain('Source: TestSource');
    expect(result).toContain('Title: Test Article');
    expect(result).toContain('Description: Test desc');
  });

  it('handles null description with "(no description)" fallback', () => {
    const articles = [
      { id: 2, title: 'No Desc', description: null, source: { name: 'SomeSource' } },
    ];
    const result = buildBatchPrompt(articles);
    expect(result).toContain('(no description)');
  });
});

describe('ArticleEnrichmentSchema', () => {
  it('validates correct enrichment data', () => {
    const data = {
      articleId: 1,
      summary: 'Test summary.',
      topics: ['model releases'],
      importanceScore: 7,
      contentType: 'news',
      thinContent: false,
    };
    const result = ArticleEnrichmentSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects importanceScore outside 1-10 range', () => {
    const data = {
      articleId: 1,
      summary: 'Test summary.',
      topics: ['model releases'],
      importanceScore: 11,
      contentType: 'news',
      thinContent: false,
    };
    const result = ArticleEnrichmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('rejects missing articleId', () => {
    const data = {
      summary: 'Test summary.',
      topics: ['model releases'],
      importanceScore: 7,
      contentType: 'news',
      thinContent: false,
    };
    const result = ArticleEnrichmentSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('validates contentType enum values', () => {
    const validData = {
      articleId: 1,
      summary: 'Test summary.',
      topics: ['model releases'],
      importanceScore: 7,
      contentType: 'news',
      thinContent: false,
    };
    expect(ArticleEnrichmentSchema.safeParse(validData).success).toBe(true);
  });

  it('rejects invalid contentType values', () => {
    const invalidData = {
      articleId: 1,
      summary: 'Test summary.',
      topics: ['model releases'],
      importanceScore: 7,
      contentType: 'blog',
      thinContent: false,
    };
    expect(ArticleEnrichmentSchema.safeParse(invalidData).success).toBe(false);
  });
});

describe('saveEnrichmentResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls prisma.article.update with topics array directly', async () => {
    mockPrismaUpdate.mockResolvedValue({} as never);
    const results = [
      {
        articleId: 1,
        summary: 'sum',
        topics: ['model releases', 'open source'],
        importanceScore: 8,
        contentType: 'news' as const,
        thinContent: false,
      },
    ];
    const { saved, errors } = await saveEnrichmentResults(results);
    expect(mockPrismaUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        summary: 'sum',
        topics: ['model releases', 'open source'],
        importanceScore: 8,
        contentType: 'news',
        thinContent: false,
        enrichedAt: expect.any(Date),
      },
    });
    expect(saved).toBe(1);
    expect(errors).toEqual([]);
  });

  it('collects errors from rejected promises', async () => {
    mockPrismaUpdate.mockRejectedValue(new Error('DB error'));
    const results = [
      {
        articleId: 1,
        summary: 'sum',
        topics: ['model releases'],
        importanceScore: 5,
        contentType: 'news' as const,
        thinContent: false,
      },
    ];
    const { saved, errors } = await saveEnrichmentResults(results);
    expect(saved).toBe(0);
    expect(errors).toEqual(['DB error']);
  });
});

describe('enrichArticlesBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no feedback (empty calibration context)
    mockFeedbackFindMany.mockResolvedValue([]);
  });

  it('calls generateText with correct parameters', async () => {
    const mockResult = {
      articleId: 1,
      summary: 'test',
      topics: ['model releases'],
      importanceScore: 7,
      contentType: 'news' as const,
      thinContent: false,
    };
    mockGenerateText.mockResolvedValue({ output: [mockResult] } as never);

    const articles = [
      { id: 1, title: 'Test', description: 'Desc', source: { name: 'Source' } },
    ];
    await enrichArticlesBatch(articles);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'deepseek/deepseek-v3.2',
        output: expect.anything(),
      })
    );
  });
});

describe('fetchUnenrichedArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries with enrichedAt null, createdAt gte cutoff, publishedAt desc order', async () => {
    mockPrismaFindMany.mockResolvedValue([]);
    await fetchUnenrichedArticles();
    expect(mockPrismaFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          enrichedAt: null,
          createdAt: { gte: expect.any(Date) },
        }),
        orderBy: { publishedAt: 'desc' },
        take: BATCH_LIMIT,
      })
    );
  });
});

describe('constants', () => {
  it('SEED_TOPICS contains exactly 7 categories', () => {
    expect(SEED_TOPICS.length).toBe(7);
  });

  it('BATCH_LIMIT equals 25', () => {
    expect(BATCH_LIMIT).toBe(25);
  });
});

describe('buildCalibrationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty string when no feedback exists', async () => {
    mockFeedbackFindMany.mockResolvedValue([]);
    const result = await buildCalibrationContext();
    expect(result).toBe('');
  });

  it('returns empty string when feedback is below source threshold (2 downvotes, needs 3)', async () => {
    mockFeedbackFindMany.mockResolvedValue([
      { direction: 'down', reasons: [], source: { name: 'TechBlog' } },
      { direction: 'down', reasons: [], source: { name: 'TechBlog' } },
    ] as never);
    const result = await buildCalibrationContext();
    expect(result).toBe('');
  });

  it('returns calibration section when 3+ downvotes from same source', async () => {
    mockFeedbackFindMany.mockResolvedValue([
      { direction: 'down', reasons: [], source: { name: 'SpammyBlog' } },
      { direction: 'down', reasons: [], source: { name: 'SpammyBlog' } },
      { direction: 'down', reasons: [], source: { name: 'SpammyBlog' } },
    ] as never);
    const result = await buildCalibrationContext();
    expect(result).toContain('SpammyBlog');
    expect(result).toContain('User Calibration Signals');
    expect(result).toContain('downvotes');
  });

  it('returns calibration section when 3+ upvotes from same source', async () => {
    mockFeedbackFindMany.mockResolvedValue([
      { direction: 'up', reasons: [], source: { name: 'GreatSource' } },
      { direction: 'up', reasons: [], source: { name: 'GreatSource' } },
      { direction: 'up', reasons: [], source: { name: 'GreatSource' } },
    ] as never);
    const result = await buildCalibrationContext();
    expect(result).toContain('GreatSource');
    expect(result).toContain('upvotes');
  });

  it('returns reason-level signal when 5+ votes cite a reason', async () => {
    mockFeedbackFindMany.mockResolvedValue([
      { direction: 'down', reasons: ['Not relevant to me'], source: { name: 'A' } },
      { direction: 'down', reasons: ['Not relevant to me'], source: { name: 'B' } },
      { direction: 'down', reasons: ['Not relevant to me'], source: { name: 'C' } },
      { direction: 'down', reasons: ['Not relevant to me'], source: { name: 'D' } },
      { direction: 'down', reasons: ['Not relevant to me'], source: { name: 'E' } },
    ] as never);
    const result = await buildCalibrationContext();
    expect(result).toContain('Not relevant to me');
    expect(result).toContain('5 votes');
  });

  it('enrichArticlesBatch calls generateText with system prompt containing calibration context', async () => {
    mockFeedbackFindMany.mockResolvedValue([
      { direction: 'down', reasons: [], source: { name: 'SpamSource' } },
      { direction: 'down', reasons: [], source: { name: 'SpamSource' } },
      { direction: 'down', reasons: [], source: { name: 'SpamSource' } },
    ] as never);
    const mockResult = {
      articleId: 1,
      summary: 'test',
      topics: ['model releases'],
      importanceScore: 7,
      contentType: 'news' as const,
      thinContent: false,
    };
    mockGenerateText.mockResolvedValue({ output: [mockResult] } as never);

    const articles = [
      { id: 1, title: 'Test', description: 'Desc', source: { name: 'Source' } },
    ];
    await enrichArticlesBatch(articles);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        system: expect.stringContaining('SpamSource'),
      })
    );
  });
});
