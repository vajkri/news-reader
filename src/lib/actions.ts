"use server";

import { fetchAndPersistArticles } from "@/lib/fetch-sources";
import { createToken } from './stream-tokens';

interface FetchResult {
  fetched: number;
  added: number;
  errors: string[];
}

export async function fetchFeeds(): Promise<FetchResult> {
  return fetchAndPersistArticles();
}

// Gate on CRON_SECRET as an "is this environment configured?" check.
// The token itself is independent of the secret; this prevents streaming
// on misconfigured deployments where enrichment would fail anyway.
export async function createEnrichStreamToken(): Promise<{ token: string } | { error: string }> {
  if (!process.env.CRON_SECRET) return { error: 'CRON_SECRET not configured' };
  return { token: createToken() };
}

interface EnrichResult {
  ok: boolean;
  enriched?: number;
  error?: string;
}

export async function triggerEnrichment(): Promise<EnrichResult> {
  const secret = process.env.CRON_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!secret) {
    return { ok: false, error: "CRON_SECRET not configured" };
  }

  try {
    const res = await fetch(`${appUrl}/api/enrich`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (!res.ok) {
      return { ok: false, error: `Enrichment failed: ${res.status}` };
    }
    const data = (await res.json()) as { enriched?: number };
    return { ok: true, enriched: data.enriched };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
