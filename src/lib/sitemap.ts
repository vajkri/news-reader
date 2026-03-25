import "server-only";
import { XMLParser } from "fast-xml-parser";
import { extractArticleMeta } from "./fetch-article-meta";
import type { ParsedArticle } from "./rss";

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Fetches a sitemap XML, filters URLs by path pattern and 7-day cutoff,
 * then fetches each candidate article page for Open Graph metadata.
 *
 * For entries with `lastmod`: applies cutoff during sitemap parsing (cheap).
 * For entries without `lastmod` (e.g. claude.com): fetches each page to
 * extract `datePublished` from page HTML, then applies cutoff.
 */
export async function fetchSitemap(
  sitemapUrl: string,
  pathPattern: string
): Promise<ParsedArticle[]> {
  const cutoff = Date.now() - MAX_AGE_MS;

  const res = await fetch(sitemapUrl, {
    headers: { "User-Agent": "NewsReader/1.0 (news aggregator)" },
    // Disable caching so cron always gets a fresh sitemap
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    next: { revalidate: 0 } as any,
  });
  const xml = await res.text();

  const parser = new XMLParser({ ignoreAttributes: false });
  const result = parser.parse(xml);

  // fast-xml-parser returns a single object (not array) when only one <url> element exists
  const rawUrls = result?.urlset?.url;
  const urls: Array<{ loc: string; lastmod?: string }> = Array.isArray(rawUrls)
    ? rawUrls
    : rawUrls
      ? [rawUrls]
      : [];

  // Filter by path pattern (strip glob wildcard, use simple substring match)
  const pattern = pathPattern.replace(/\*/g, "");
  const candidates = pattern
    ? urls.filter((u) => u.loc?.includes(pattern))
    : urls;

  // Split by presence of lastmod
  const withLastmod = candidates.filter((u) => !!u.lastmod);
  const withoutLastmod = candidates.filter((u) => !u.lastmod);

  // For entries with lastmod: apply cutoff before fetching (avoids unnecessary requests)
  const recentWithLastmod = withLastmod.filter(
    (u) => new Date(u.lastmod!).getTime() >= cutoff
  );

  const articles: ParsedArticle[] = [];

  // Fetch article pages for lastmod-filtered entries
  const lastmodResults = await Promise.allSettled(
    recentWithLastmod.map((u) => extractArticleMeta(u.loc, new Date(u.lastmod!)))
  );
  for (const r of lastmodResults) {
    if (r.status === "fulfilled" && r.value) articles.push(r.value);
  }

  // For entries without lastmod: fetch page to get date, then apply cutoff
  if (withoutLastmod.length > 0) {
    const noLastmodResults = await Promise.allSettled(
      withoutLastmod.map((u) => extractArticleMeta(u.loc, null))
    );
    for (const r of noLastmodResults) {
      if (r.status === "fulfilled" && r.value) {
        // Include if no date found (cannot filter) or date is within cutoff
        if (!r.value.publishedAt || r.value.publishedAt.getTime() >= cutoff) {
          articles.push(r.value);
        }
      }
    }
  }

  return articles;
}
