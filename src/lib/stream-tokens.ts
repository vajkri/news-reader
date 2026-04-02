import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';

// Stateless HMAC-signed tokens for SSE stream auth.
// Works across Turbopack module boundaries and serverless isolates
// because verification only needs the secret, not shared memory.
const TTL_MS = 5 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.CRON_SECRET;
  if (!secret) throw new Error('CRON_SECRET not configured');
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

export function createToken(): string {
  const timestamp = Date.now().toString();
  const signature = sign(timestamp);
  return `${timestamp}.${signature}`;
}

export function verifyToken(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const age = Date.now() - Number(timestamp);
  if (isNaN(age) || age < 0 || age > TTL_MS) return false;

  const expected = sign(timestamp);
  return expected.length === signature.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
