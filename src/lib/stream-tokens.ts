import 'server-only';

// One-time tokens for SSE stream auth (CRON_SECRET never leaves server).
// In-memory Set: works on single-instance / dev server. On multi-instance
// serverless (Vercel), token creator and consumer may hit different isolates.
// Acceptable for single-user app; swap to KV/DB if this becomes multi-user.
const streamTokens = new Set<string>();

export function createToken(): string {
  const token = crypto.randomUUID();
  streamTokens.add(token);
  setTimeout(() => streamTokens.delete(token), 5 * 60 * 1000);
  return token;
}

export function consumeToken(token: string): boolean {
  if (streamTokens.has(token)) {
    streamTokens.delete(token);
    return true;
  }
  return false;
}
