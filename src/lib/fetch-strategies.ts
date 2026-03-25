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

type StrategyFn = (source: FetchSource, knownGuids?: Set<string>) => Promise<ParsedArticle[]>;

const strategies: Record<string, StrategyFn> = {
  rss: (source) => fetchFeed(source.url),
  sitemap: (source, knownGuids) =>
    fetchSitemap(source.url, source.sitemapPathPattern ?? "", knownGuids),
  scrape: (source) => fetchScrape(source.scrapeUrl ?? source.url, source.scrapeLinkSelector ?? "a"),
};

/**
 * Dispatches article fetching to the correct strategy based on `source.sourceType`.
 * Defaults to the `rss` strategy for unknown source types.
 *
 * @param knownGuids - URLs already in the DB; sitemap strategy skips these to avoid refetching pages.
 */
export async function fetchArticles(
  source: FetchSource,
  knownGuids?: Set<string>
): Promise<ParsedArticle[]> {
  const strategy = strategies[source.sourceType];
  if (!strategy) {
    console.warn(`Unknown sourceType "${source.sourceType}", falling back to rss`);
  }
  return (strategy ?? strategies.rss)(source, knownGuids);
}
