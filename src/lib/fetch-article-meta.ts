import "server-only";
import * as cheerio from "cheerio";
import { estimateReadTime } from "./readtime";
import type { ParsedArticle } from "./rss";

/**
 * Fetches a single article page and extracts Open Graph metadata, publish date,
 * and thumbnail. Returns null on HTTP error, timeout, or any exception.
 */
export async function extractArticleMeta(
  url: string,
  lastmod: Date | null
): Promise<ParsedArticle | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "NewsReader/1.0 (news aggregator)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ??
      $("title").text().trim() ??
      "Untitled";

    const description =
      $('meta[property="og:description"]').attr("content") ??
      $('meta[name="description"]').attr("content") ??
      null;

    const thumbnail =
      $('meta[property="og:image"]').attr("content") ??
      $('meta[name="twitter:image"]').attr("content") ??
      null;

    // Extract publish date: JSON-LD datePublished > article:published_time > lastmod fallback
    let publishedAt: Date | null = lastmod;

    // Try JSON-LD datePublished across all ld+json script blocks
    const ldJsonBlocks = $('script[type="application/ld+json"]').toArray();
    for (const block of ldJsonBlocks) {
      const text = $(block).text();
      const match = text.match(/"datePublished"\s*:\s*"([^"]+)"/);
      if (match) {
        const parsed = new Date(match[1]);
        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed;
          break;
        }
      }
    }

    // Fall back to article:published_time if no JSON-LD date found
    if (publishedAt === lastmod) {
      const metaDate = $('meta[property="article:published_time"]').attr("content");
      if (metaDate) {
        const parsed = new Date(metaDate);
        if (!isNaN(parsed.getTime())) publishedAt = parsed;
      }
    }

    return {
      guid: url,
      title,
      link: url,
      description,
      thumbnail,
      publishedAt,
      readTimeMin: estimateReadTime(description),
    };
  } catch {
    return null;
  }
}
