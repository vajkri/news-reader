"use server";

import { fetchAndPersistArticles } from "@/lib/fetch-sources";

interface FetchResult {
  fetched: number;
  added: number;
  errors: string[];
}

export async function fetchFeeds(): Promise<FetchResult> {
  return fetchAndPersistArticles();
}

export async function getEnrichStreamUrl(loop: boolean = true): Promise<{ url: string; headers: Record<string, string> } | { error: string }> {
  const secret = process.env.CRON_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  if (!secret) return { error: 'CRON_SECRET not configured' };
  return {
    url: `${appUrl}/api/enrich/stream?batch=5&loop=${loop}`,
    headers: { Authorization: `Bearer ${secret}` },
  };
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
