"use server";

export async function fetchFeeds() {
  return { fetched: 0, added: 0, errors: [] };
}

export async function triggerEnrichment() {
  return { ok: true, enriched: 0 };
}
