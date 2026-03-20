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

const READ_TIME_RE = /\s*\((\d+)\s+minute\s+read\)\s*$/i;

function extractReadTime(title: string): { title: string; readTimeMin: number | null } {
  const match = title.match(READ_TIME_RE);
  if (!match) return { title, readTimeMin: null };
  return { title: title.replace(READ_TIME_RE, "").trim(), readTimeMin: parseInt(match[1], 10) };
}

export interface ParsedArticle {
  guid: string;
  title: string;
  link: string;
  description: string | null;
  thumbnail: string | null;
  publishedAt: Date | null;
  readTimeMin: number;
}

export async function fetchFeed(feedUrl: string, { maxAgeMs = 24 * 60 * 60 * 1000 }: { maxAgeMs?: number } = {}): Promise<ParsedArticle[]> {
  const feed = await parser.parseURL(feedUrl);
  const cutoff = new Date(Date.now() - maxAgeMs);

  return feed.items.filter((item) => {
    if (/\(sponsor\)/i.test(item.title ?? "")) return false;
    const pubDate = item.pubDate ? new Date(item.pubDate) : item.isoDate ? new Date(item.isoDate) : null;
    return !pubDate || pubDate >= cutoff;
  }).map((item) => {
    const guid = item.guid ?? item.link ?? item.title ?? String(Date.now());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const description = (item as any)["content:encoded"] ?? item.content ?? item.summary ?? null;
    const rawTitle = item.title ?? "Untitled";
    const { title, readTimeMin: titleReadTime } = extractReadTime(rawTitle);
    return {
      guid,
      title,
      link: item.link ?? item.guid ?? feedUrl,
      description,
      thumbnail: extractThumbnailFromItem(item),
      publishedAt: item.pubDate ? new Date(item.pubDate) : item.isoDate ? new Date(item.isoDate) : null,
      readTimeMin: titleReadTime ?? estimateReadTime(description),
    };
  });
}
