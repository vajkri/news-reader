import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('@/lib/readtime', () => ({ estimateReadTime: vi.fn(() => 3) }));

import { extractArticleMeta } from '@/lib/fetch-article-meta';

// Helper: configure globalThis.fetch to return a successful HTML response
function mockHtmlResponse(html: string): void {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(html),
  });
}

const FULL_HTML = `<html><head>
  <meta property="og:title" content="Test Title">
  <meta property="og:description" content="Test description">
  <meta property="og:image" content="https://example.com/img.jpg">
  <meta property="article:published_time" content="2026-03-20T00:00:00Z">
  </head><body>
  <script type="application/ld+json">{"datePublished":"Mar 20, 2026"}</script>
  </body></html>`;

const NO_DATE_HTML = `<html><head>
  <meta property="og:title" content="No Date Article">
  <meta property="og:description" content="A description without dates">
  <meta property="og:image" content="https://example.com/nodate.jpg">
  </head><body></body></html>`;

const NO_JSONLD_HTML = `<html><head>
  <meta property="og:title" content="Meta Date Article">
  <meta property="og:description" content="Uses article:published_time">
  <meta property="article:published_time" content="2026-03-18T12:00:00Z">
  </head><body></body></html>`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('extractArticleMeta', () => {
  it('extracts og meta tags correctly', async () => {
    mockHtmlResponse(FULL_HTML);

    const result = await extractArticleMeta('https://example.com/article', null);

    expect(result).not.toBeNull();
    expect(result!.title).toBe('Test Title');
    expect(result!.description).toBe('Test description');
    expect(result!.thumbnail).toBe('https://example.com/img.jpg');
  });

  it('extracts datePublished from JSON-LD script block', async () => {
    mockHtmlResponse(FULL_HTML);

    const result = await extractArticleMeta('https://example.com/article', null);

    expect(result).not.toBeNull();
    expect(result!.publishedAt).toBeInstanceOf(Date);
    expect(result!.publishedAt!.getFullYear()).toBe(2026);
    expect(result!.publishedAt!.getMonth()).toBe(2); // March = 2 (0-indexed)
  });

  it('falls back to article:published_time when no JSON-LD date', async () => {
    mockHtmlResponse(NO_JSONLD_HTML);

    const result = await extractArticleMeta('https://example.com/article', null);

    expect(result).not.toBeNull();
    expect(result!.publishedAt).toBeInstanceOf(Date);
    expect(result!.publishedAt!.toISOString()).toBe('2026-03-18T12:00:00.000Z');
  });

  it('falls back to lastmod parameter when no page date found', async () => {
    mockHtmlResponse(NO_DATE_HTML);

    const lastmod = new Date('2026-03-15T00:00:00Z');
    const result = await extractArticleMeta('https://example.com/article', lastmod);

    expect(result).not.toBeNull();
    expect(result!.publishedAt).toBe(lastmod);
  });

  it('uses URL as guid and link', async () => {
    mockHtmlResponse(FULL_HTML);

    const url = 'https://example.com/my-article';
    const result = await extractArticleMeta(url, null);

    expect(result).not.toBeNull();
    expect(result!.guid).toBe(url);
    expect(result!.link).toBe(url);
  });

  it('returns null on non-200 response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

    const result = await extractArticleMeta('https://example.com/missing', null);

    expect(result).toBeNull();
  });

  it('returns null on fetch error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await extractArticleMeta('https://example.com/broken', null);

    expect(result).toBeNull();
  });

  it('returns null on fetch timeout', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(
      new DOMException('The operation was aborted.', 'AbortError')
    );

    const result = await extractArticleMeta('https://example.com/slow', null);

    expect(result).toBeNull();
  });
});
