import { describe, it, expect } from 'vitest';
import { parseTopics, scoreToTier, groupArticlesByTopic } from './briefing';
import type { ArticleRow } from '@/types';

// Helper to create a minimal ArticleRow for testing
function makeArticle(overrides: Partial<ArticleRow>): ArticleRow {
  return {
    id: 1,
    guid: 'g1',
    title: 'Test',
    link: 'https://example.com',
    description: null,
    thumbnail: null,
    publishedAt: '2026-03-19T00:00:00Z',
    readTimeMin: null,
    isRead: false,
    summary: 'Summary text',
    topics: null,
    importanceScore: 5,
    enrichedAt: '2026-03-19T01:00:00Z',
    sourceId: 1,
    source: { name: 'Test Source', category: null },
    ...overrides,
  };
}

describe('parseTopics', () => {
  it('returns ["Uncategorized"] for null', () => {
    expect(parseTopics(null)).toEqual(['Uncategorized']);
  });

  it('returns ["Uncategorized"] for empty string', () => {
    expect(parseTopics('')).toEqual(['Uncategorized']);
  });

  it('returns ["Uncategorized"] for non-JSON string', () => {
    expect(parseTopics('not json')).toEqual(['Uncategorized']);
  });

  it('returns ["Uncategorized"] for empty array JSON', () => {
    expect(parseTopics('[]')).toEqual(['Uncategorized']);
  });

  it('returns parsed array for valid JSON topics', () => {
    expect(parseTopics('["model releases","developer tools"]')).toEqual([
      'model releases',
      'developer tools',
    ]);
  });

  it('returns single-item array for JSON with one topic', () => {
    expect(parseTopics('["AI safety"]')).toEqual(['AI safety']);
  });
});

describe('scoreToTier', () => {
  it('returns "notable" for null score', () => {
    expect(scoreToTier(null)).toBe('notable');
  });

  it('returns "notable" for score 3 (below range)', () => {
    expect(scoreToTier(3)).toBe('notable');
  });

  it('returns "notable" for score 4', () => {
    expect(scoreToTier(4)).toBe('notable');
  });

  it('returns "notable" for score 6', () => {
    expect(scoreToTier(6)).toBe('notable');
  });

  it('returns "important" for score 7', () => {
    expect(scoreToTier(7)).toBe('important');
  });

  it('returns "important" for score 8', () => {
    expect(scoreToTier(8)).toBe('important');
  });

  it('returns "critical" for score 9', () => {
    expect(scoreToTier(9)).toBe('critical');
  });

  it('returns "critical" for score 10', () => {
    expect(scoreToTier(10)).toBe('critical');
  });
});

describe('groupArticlesByTopic', () => {
  it('returns empty array for empty input', () => {
    expect(groupArticlesByTopic([])).toEqual([]);
  });

  it('groups articles by primary topic into correct number of groups', () => {
    const articles = [
      makeArticle({ id: 1, topics: '["AI safety","model releases"]', importanceScore: 8 }),
      makeArticle({ id: 2, topics: '["model releases"]', importanceScore: 9 }),
      makeArticle({ id: 3, topics: '["AI safety"]', importanceScore: 6 }),
    ];
    const groups = groupArticlesByTopic(articles);
    expect(groups).toHaveLength(2);
  });

  it('assigns each article to its first (primary) topic only', () => {
    const articles = [
      makeArticle({ id: 1, topics: '["AI safety","model releases"]', importanceScore: 7 }),
      makeArticle({ id: 2, topics: '["model releases"]', importanceScore: 5 }),
    ];
    const groups = groupArticlesByTopic(articles);
    const aiSafetyGroup = groups.find((g) => g.topic === 'AI safety');
    const modelReleasesGroup = groups.find((g) => g.topic === 'model releases');
    expect(aiSafetyGroup?.articles).toHaveLength(1);
    expect(aiSafetyGroup?.articles[0].id).toBe(1);
    expect(modelReleasesGroup?.articles).toHaveLength(1);
    expect(modelReleasesGroup?.articles[0].id).toBe(2);
  });

  it('sorts groups by maxScore descending', () => {
    const articles = [
      makeArticle({ id: 1, topics: '["AI safety"]', importanceScore: 6 }),
      makeArticle({ id: 2, topics: '["model releases"]', importanceScore: 9 }),
      makeArticle({ id: 3, topics: '["hardware"]', importanceScore: 7 }),
    ];
    const groups = groupArticlesByTopic(articles);
    expect(groups[0].topic).toBe('model releases');
    expect(groups[1].topic).toBe('hardware');
    expect(groups[2].topic).toBe('AI safety');
  });

  it('preserves article order within each group', () => {
    const articles = [
      makeArticle({ id: 1, topics: '["AI safety"]', importanceScore: 9 }),
      makeArticle({ id: 2, topics: '["AI safety"]', importanceScore: 7 }),
      makeArticle({ id: 3, topics: '["AI safety"]', importanceScore: 5 }),
    ];
    const groups = groupArticlesByTopic(articles);
    expect(groups).toHaveLength(1);
    expect(groups[0].articles.map((a) => a.id)).toEqual([1, 2, 3]);
  });

  it('computes maxScore correctly for each group', () => {
    const articles = [
      makeArticle({ id: 1, topics: '["AI safety"]', importanceScore: 6 }),
      makeArticle({ id: 2, topics: '["AI safety"]', importanceScore: 9 }),
    ];
    const groups = groupArticlesByTopic(articles);
    expect(groups[0].maxScore).toBe(9);
  });

  it('handles articles with null importanceScore in maxScore calculation', () => {
    const articles = [
      makeArticle({ id: 1, topics: '["AI safety"]', importanceScore: null }),
    ];
    const groups = groupArticlesByTopic(articles);
    expect(groups[0].maxScore).toBe(0);
  });
});
