/** Estimates reading time in minutes from HTML or plain text content */
export function estimateReadTime(text: string | null | undefined): number {
  if (!text) return 1;
  const stripped = text.replace(/<[^>]*>/g, " ");
  const words = stripped.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
