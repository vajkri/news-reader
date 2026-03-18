import "server-only";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractThumbnailFromItem(item: any): string | null {
  // 1. RSS enclosure
  if (item.enclosure?.url) return item.enclosure.url;
  // 2. media:content
  if (item["media:content"]?.["$"]?.url) return item["media:content"]["$"].url;
  if (Array.isArray(item["media:content"])) {
    const first = item["media:content"][0];
    if (first?.["$"]?.url) return first["$"].url;
  }
  // 3. media:thumbnail
  if (item["media:thumbnail"]?.["$"]?.url)
    return item["media:thumbnail"]["$"].url;
  if (Array.isArray(item["media:thumbnail"])) {
    const first = item["media:thumbnail"][0];
    if (first?.["$"]?.url) return first["$"].url;
  }
  // 4. itunes:image
  if (item["itunes:image"]?.["$"]?.href)
    return item["itunes:image"]["$"].href;
  return null;
}
