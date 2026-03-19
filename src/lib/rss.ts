import "server-only";
import Parser from "rss-parser";
import { estimateReadTime } from "./readtime";
import { extractThumbnailFromItem } from "./thumbnail";

type CustomItem = {
  "media:content": unknown;
  "media:thumbnail": unknown;
  "itunes:image": unknown;
  enclosure?: { url?: string; type?: string };
};

const parser = new Parser<Record<string, unknown>, CustomItem>({
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
      ["itunes:image", "itunes:image"],
    ],
  },
  timeout: 15000,
  maxRedirects: 5,
  headers: {
    "User-Agent": "NewsReader/1.0 (RSS aggregator)",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
});

export interface ParsedArticle {
  guid: string;
  title: string;
  link: string;
  description: string | null;
  thumbnail: string | null;
  publishedAt: Date | null;
  readTimeMin: number;
}

export async function fetchFeed(feedUrl: string): Promise<ParsedArticle[]> {
  const feed = await parser.parseURL(feedUrl);

  return feed.items.map((item) => {
    const guid = item.guid ?? item.link ?? item.title ?? String(Date.now());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const description = (item as any)["content:encoded"] ?? item.content ?? item.summary ?? null;
    return {
      guid,
      title: item.title ?? "Untitled",
      link: item.link ?? feedUrl,
      description,
      thumbnail: extractThumbnailFromItem(item),
      publishedAt: item.pubDate ? new Date(item.pubDate) : item.isoDate ? new Date(item.isoDate) : null,
      readTimeMin: estimateReadTime(description),
    };
  });
}
