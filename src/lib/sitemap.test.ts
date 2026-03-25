import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/fetch-article-meta', () => ({
  extractArticleMeta: vi.fn(),
}));

import { fetchSitemap } from '@/lib/sitemap';
import { extractArticleMeta } from '@/lib/fetch-article-meta';

const mockExtractArticleMeta = vi.mocked(extractArticleMeta);

// Build a date within the 7-day cutoff
const RECENT_DATE = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(); // 2 days ago
const OLD_DATE = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();   // 30 days ago

// Sitemap with 3 entries: 1 recent+matching, 1 old+matching, 1 recent+non-matching
const SITEMAP_WITH_LASTMOD = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/news/recent-article</loc>
    <lastmod>${RECENT_DATE}</lastmod>
  </url>
  <url>
    <loc>https://example.com/news/old-article</loc>
    <lastmod>${OLD_DATE}</lastmod>
  </url>
  <url>
    <loc>https://example.com/about/team</loc>
    <lastmod>${RECENT_DATE}</lastmod>
  </url>
</urlset>`;

// Sitemap with entries without lastmod (claude.com pattern)
const SITEMAP_WITHOUT_LASTMOD = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/blog/post-a</loc>
  </url>
  <url>
    <loc>https://example.com/blog/post-b</loc>
  </url>
</urlset>`;

// Sitemap with a single URL element (fast-xml-parser returns object, not array)
const SITEMAP_SINGLE_URL = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/news/only-article</loc>
    <lastmod>${RECENT_DATE}</lastmod>
  </url>
</urlset>`;

// Empty sitemap
const SITEMAP_EMPTY = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

function mockSitemapResponse(xml: string): void {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(xml),
  });
}

const MOCK_ARTICLE = {
  guid: 'https://example.com/news/recent-article',
  title: 'Recent Article',
  link: 'https://example.com/news/recent-article',
  description: 'A recent news article',
  thumbnail: null,
  publishedAt: new Date(RECENT_DATE),
  readTimeMin: 2,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockExtractArticleMeta.mockResolvedValue(MOCK_ARTICLE);
});

describe('fetchSitemap', () => {
  it('filters URLs by path pattern', async () => {
    mockSitemapResponse(SITEMAP_WITH_LASTMOD);

    await fetchSitemap('https://example.com/sitemap.xml', '/news/');

    // Only /news/ URLs should have been fetched (old one filtered by cutoff)
    // extractArticleMeta should only be called for the recent /news/ URL
    expect(mockExtractArticleMeta).toHaveBeenCalledWith(
      'https://example.com/news/recent-article',
      expect.any(Date)
    );
    expect(mockExtractArticleMeta).not.toHaveBeenCalledWith(
      expect.stringContaining('/about/'),
      expect.anything()
    );
  });

  it('applies 7-day cutoff based on lastmod date', async () => {
    mockSitemapResponse(SITEMAP_WITH_LASTMOD);

    await fetchSitemap('https://example.com/sitemap.xml', '/news/');

    // Old article should not trigger extractArticleMeta
    expect(mockExtractArticleMeta).not.toHaveBeenCalledWith(
      'https://example.com/news/old-article',
      expect.anything()
    );
  });

  it('handles entries without lastmod by fetching page for date', async () => {
    mockSitemapResponse(SITEMAP_WITHOUT_LASTMOD);

    // Mock articles with recent publish dates
    const recentArticle = {
      ...MOCK_ARTICLE,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    };
    mockExtractArticleMeta.mockResolvedValue(recentArticle);

    const articles = await fetchSitemap('https://example.com/sitemap.xml', '/blog/');

    // Both /blog/ URLs should have been fetched (no lastmod, so all are candidates)
    expect(mockExtractArticleMeta).toHaveBeenCalledWith(
      'https://example.com/blog/post-a',
      null
    );
    expect(mockExtractArticleMeta).toHaveBeenCalledWith(
      'https://example.com/blog/post-b',
      null
    );
    expect(articles).toHaveLength(2);
  });

  it('handles single URL object (not array) from fast-xml-parser', async () => {
    mockSitemapResponse(SITEMAP_SINGLE_URL);

    const articles = await fetchSitemap('https://example.com/sitemap.xml', '/news/');

    expect(mockExtractArticleMeta).toHaveBeenCalledTimes(1);
    expect(mockExtractArticleMeta).toHaveBeenCalledWith(
      'https://example.com/news/only-article',
      expect.any(Date)
    );
    expect(articles).toHaveLength(1);
  });

  it('returns empty array for empty sitemap', async () => {
    mockSitemapResponse(SITEMAP_EMPTY);

    const articles = await fetchSitemap('https://example.com/sitemap.xml', '/news/');

    expect(mockExtractArticleMeta).not.toHaveBeenCalled();
    expect(articles).toEqual([]);
  });

  it('excludes entries without lastmod when page date is older than 7 days', async () => {
    mockSitemapResponse(SITEMAP_WITHOUT_LASTMOD);

    // Mock extractArticleMeta to return article with old publish date
    const oldArticle = {
      ...MOCK_ARTICLE,
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    };
    mockExtractArticleMeta.mockResolvedValue(oldArticle);

    const articles = await fetchSitemap('https://example.com/sitemap.xml', '/blog/');

    // Articles with old page dates should be filtered out
    expect(articles).toHaveLength(0);
  });
});
