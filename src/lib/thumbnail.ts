import "server-only";

interface MediaElement {
  $?: { url?: string };
}

interface RssItem {
  enclosure?: { url?: string };
  "media:content"?: MediaElement | MediaElement[];
  "media:thumbnail"?: MediaElement | MediaElement[];
  "itunes:image"?: { $?: { href?: string } };
}

export function extractThumbnailFromItem(item: RssItem): string | null {
  // 1. RSS enclosure
  if (item.enclosure?.url) return item.enclosure.url;
  // 2. media:content
  const mediaContent = item["media:content"];
  if (Array.isArray(mediaContent)) {
    const first = mediaContent[0];
    if (first?.["$"]?.url) return first["$"].url;
  } else if (mediaContent?.["$"]?.url) {
    return mediaContent["$"].url;
  }
  // 3. media:thumbnail
  const mediaThumbnail = item["media:thumbnail"];
  if (Array.isArray(mediaThumbnail)) {
    const first = mediaThumbnail[0];
    if (first?.["$"]?.url) return first["$"].url;
  } else if (mediaThumbnail?.["$"]?.url) {
    return mediaThumbnail["$"].url;
  }
  // 4. itunes:image
  if (item["itunes:image"]?.["$"]?.href)
    return item["itunes:image"]["$"].href;
  return null;
}
