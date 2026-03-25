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
