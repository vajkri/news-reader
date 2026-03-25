import "server-only";
import { XMLParser } from "fast-xml-parser";
import { extractArticleMeta } from "./fetch-article-meta";
import type { ParsedArticle } from "./rss";

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Locale prefixes to skip (sitemap may list /ko-kr/blog/..., /de-de/blog/..., etc.)
const LOCALE_PREFIX_RE = /^https?:\/\/[^/]+\/[a-z]{2}(-[a-z]{2})?\//;

/**
 * Returns true if the URL is a locale-prefixed variant (e.g., /ko-kr/blog/...).
 * We only want the canonical (un-prefixed) URLs to avoid duplicates.
 */
function isLocaleUrl(url: string, pathPattern: string): boolean {
  const pattern = pathPattern.replace(/\*/g, "");
  // If URL matches the pattern AND has a locale prefix before it, skip it
  const match = url.match(LOCALE_PREFIX_RE);
  if (!match) return false;
  // Check if removing the locale prefix would still match the pattern
  const withoutLocale = url.replace(match[0], url.match(/^https?:\/\/[^/]+\//)?.[0] ?? "");
  return withoutLocale.includes(pattern);
}

/**
 * Fetches a sitemap XML, filters URLs by path pattern and 7-day cutoff,
 * then fetches each candidate article page for Open Graph metadata.
 *
 * Optimizations:
 * - Locale-prefixed URLs are filtered out to avoid duplicates
 * - Known guids (already in DB) are skipped to avoid refetching pages
 * - No-lastmod entries are capped to 50 newest URLs
 */
export async function fetchSitemap(
  sitemapUrl: string,
  pathPattern: string,
  knownGuids?: Set<string>
): Promise<ParsedArticle[]> {
  const cutoff = Date.now() - MAX_AGE_MS;

  let xml: string;
  try {
    const res = await fetch(sitemapUrl, {
      headers: { "User-Agent": "NewsReader/1.0 (news aggregator)" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }

  const parser = new XMLParser({ ignoreAttributes: false });
  const result = parser.parse(xml);

  // fast-xml-parser returns a single object (not array) when only one <url> element exists
  const rawUrls = result?.urlset?.url;
  const urls: Array<{ loc: string; lastmod?: string }> = Array.isArray(rawUrls)
    ? rawUrls
    : rawUrls
      ? [rawUrls]
      : [];

  // Filter by path pattern, exclude locale variants
  const pattern = pathPattern.replace(/\*/g, "");
  const candidates = urls.filter((u) => {
    if (!u.loc?.includes(pattern)) return false;
    if (isLocaleUrl(u.loc, pathPattern)) return false;
    return true;
  });

  // Skip URLs we already have in the database
  const fresh = knownGuids
    ? candidates.filter((u) => !knownGuids.has(u.loc))
    : candidates;

  // Split by presence of lastmod
  const withLastmod = fresh.filter((u) => !!u.lastmod);
  const withoutLastmod = fresh.filter((u) => !u.lastmod);

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

  // For entries without lastmod: cap to newest 50 URLs, fetch pages to extract dates
  if (withoutLastmod.length > 0) {
    const MAX_NO_LASTMOD = 50;
    const capped = withoutLastmod
      .sort((a, b) => b.loc.localeCompare(a.loc))
      .slice(0, MAX_NO_LASTMOD);

    const noLastmodResults = await Promise.allSettled(
      capped.map((u) => extractArticleMeta(u.loc, null))
    );
    for (const r of noLastmodResults) {
      if (r.status === "fulfilled" && r.value) {
        if (!r.value.publishedAt || r.value.publishedAt.getTime() >= cutoff) {
          articles.push(r.value);
        }
      }
    }
  }

  return articles;
}
