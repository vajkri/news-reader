/** Domains known to block server-side fetching (403 regardless of User-Agent) */
export const UNFETCHABLE_DOMAINS = [
  'openai.com',
  'medium.com',
  'uxdesign.cc',
  'towardsdatascience.com',
  'betterprogramming.pub',
];

export function isLinkFetchable(link?: string): boolean {
  if (!link) return false;
  try {
    const host = new URL(link).hostname.replace(/^www\./, '');
    return !UNFETCHABLE_DOMAINS.some(
      (d) => host === d || host.endsWith(`.${d}`)
    );
  } catch {
    return false;
  }
}
