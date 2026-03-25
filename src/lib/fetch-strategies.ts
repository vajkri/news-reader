import "server-only";
import { fetchFeed } from "./rss";
import { fetchSitemap } from "./sitemap";
import { fetchScrape } from "./scrape";
import type { ParsedArticle } from "./rss";

/**
 * Minimal source descriptor needed by the dispatcher.
 * Matches the shape of the Prisma Source model fields used here.
 */
export type FetchSource = {
  url: string;
  sourceType: string;
  sitemapPathPattern?: string | null;
  scrapeUrl?: string | null;
  scrapeLinkSelector?: string | null;
};

const strategies: Record<string, (source: FetchSource) => Promise<ParsedArticle[]>> = {
  rss: (source) => fetchFeed(source.url),
  sitemap: (source) => fetchSitemap(source.url, source.sitemapPathPattern ?? ""),
  scrape: (source) => fetchScrape(source.scrapeUrl ?? source.url, source.scrapeLinkSelector ?? "a"),
};

/**
 * Dispatches article fetching to the correct strategy based on `source.sourceType`.
 * Defaults to the `rss` strategy for unknown source types.
 */
export async function fetchArticles(source: FetchSource): Promise<ParsedArticle[]> {
  const strategy = strategies[source.sourceType] ?? strategies.rss;
  return strategy(source);
}
