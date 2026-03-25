import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/rss', () => ({
  fetchFeed: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/lib/sitemap', () => ({
  fetchSitemap: vi.fn(() => Promise.resolve([])),
}));

vi.mock('@/lib/scrape', () => ({
  fetchScrape: vi.fn(() => Promise.resolve([])),
}));

import { fetchArticles } from '@/lib/fetch-strategies';
import { fetchFeed } from '@/lib/rss';
import { fetchSitemap } from '@/lib/sitemap';
import { fetchScrape } from '@/lib/scrape';

const mockFetchFeed = vi.mocked(fetchFeed);
const mockFetchSitemap = vi.mocked(fetchSitemap);
const mockFetchScrape = vi.mocked(fetchScrape);

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchFeed.mockResolvedValue([]);
  mockFetchSitemap.mockResolvedValue([]);
  mockFetchScrape.mockResolvedValue([]);
});

describe('fetchArticles', () => {
  it('routes rss sourceType to fetchFeed', async () => {
    await fetchArticles({ sourceType: 'rss', url: 'https://x.com/feed' });

    expect(mockFetchFeed).toHaveBeenCalledWith('https://x.com/feed');
    expect(mockFetchSitemap).not.toHaveBeenCalled();
    expect(mockFetchScrape).not.toHaveBeenCalled();
  });

  it('routes sitemap sourceType to fetchSitemap with url and pathPattern', async () => {
    await fetchArticles({
      sourceType: 'sitemap',
      url: 'https://x.com/sitemap.xml',
      sitemapPathPattern: '/news/',
    });

    expect(mockFetchSitemap).toHaveBeenCalledWith('https://x.com/sitemap.xml', '/news/', undefined);
    expect(mockFetchFeed).not.toHaveBeenCalled();
    expect(mockFetchScrape).not.toHaveBeenCalled();
  });

  it('routes scrape sourceType to fetchScrape with scrapeUrl and selector', async () => {
    await fetchArticles({
      sourceType: 'scrape',
      url: 'https://x.com',
      scrapeUrl: 'https://x.com/articles',
      scrapeLinkSelector: 'a.post',
    });

    expect(mockFetchScrape).toHaveBeenCalledWith('https://x.com/articles', 'a.post');
    expect(mockFetchFeed).not.toHaveBeenCalled();
    expect(mockFetchSitemap).not.toHaveBeenCalled();
  });

  it('defaults to fetchFeed for unknown sourceType', async () => {
    await fetchArticles({ sourceType: 'unknown', url: 'https://x.com/feed' });

    expect(mockFetchFeed).toHaveBeenCalledWith('https://x.com/feed');
    expect(mockFetchSitemap).not.toHaveBeenCalled();
    expect(mockFetchScrape).not.toHaveBeenCalled();
  });

  it('passes empty string to fetchSitemap when sitemapPathPattern is null', async () => {
    await fetchArticles({
      sourceType: 'sitemap',
      url: 'https://x.com/sitemap.xml',
      sitemapPathPattern: null,
    });

    expect(mockFetchSitemap).toHaveBeenCalledWith('https://x.com/sitemap.xml', '', undefined);
  });

  it('falls back to source.url for scrape when scrapeUrl is not set', async () => {
    await fetchArticles({
      sourceType: 'scrape',
      url: 'https://x.com/listing',
      scrapeLinkSelector: 'a',
    });

    expect(mockFetchScrape).toHaveBeenCalledWith('https://x.com/listing', 'a');
  });
});
