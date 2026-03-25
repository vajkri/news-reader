import "server-only";
import type { ParsedArticle } from "./rss";

/**
 * Scaffold for future scrape strategy. Fetches a listing page, extracts
 * article links via CSS selector, then fetches each for content.
 *
 * Not yet implemented -- returns empty array.
 */
export async function fetchScrape(
  listingUrl: string,
  linkSelector: string
): Promise<ParsedArticle[]> {
  void listingUrl;
  void linkSelector;
  if (process.env.NODE_ENV === "development") {
    console.warn("scrape strategy not yet implemented");
  }
  return [];
}
