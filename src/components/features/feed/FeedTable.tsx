"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { FeedToolbar } from "./FeedToolbar";
import { buildColumns } from "./columns";
import { ArticleRow, SourceRow } from "@/types";
import { Button } from "@/components/ui/button";
import { fetchFeeds } from "@/lib/actions";

interface FetchResult {
  fetched: number;
  added: number;
  errors: string[];
}

export function FeedTable({ sources }: { sources: SourceRow[] }) {
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchResult, setFetchResult] = useState<FetchResult | null>(null);

  // Filters
  const [sourceFilter, setSourceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
  const [sortBy, setSortBy] = useState<"date" | "readTime">("date");

  // Infinite scroll state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingMore = useRef(false);

  // TanStack sorting state (for column header clicks, secondary)
  const [sorting, setSorting] = useState<SortingState>([]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadPage = useCallback(async (pageNum: number) => {
    if (pageNum === 1) setLoading(true);
    const params = new URLSearchParams();
    if (sourceFilter) params.set("sourceId", sourceFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    if (readFilter !== "all") params.set("isRead", String(readFilter === "read"));
    if (debouncedSearch) params.set("search", debouncedSearch);
    params.set("sort", sortBy);
    params.set("page", String(pageNum));
    params.set("limit", "50");

    const res = await fetch(`/api/articles?${params}`);
    const data = await res.json();

    setArticles((prev) => pageNum === 1 ? (data.articles ?? []) : [...prev, ...(data.articles ?? [])]);
    setTotal(data.total ?? 0);
    setHasMore((data.articles ?? []).length === 50);
    setLoading(false);
    isLoadingMore.current = false;
  }, [sourceFilter, categoryFilter, readFilter, sortBy, debouncedSearch]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setPage(1);
    loadPage(1);
  }, [loadPage]);

  // Load next page when page advances
  useEffect(() => {
    if (page > 1) {
      isLoadingMore.current = true;
      loadPage(page);
    }
  }, [page, loadPage]);

  // IntersectionObserver to trigger next page load
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore.current && hasMore) {
          isLoadingMore.current = true;
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );
    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  const handleFetch = async () => {
    if (isFetching) return;
    setIsFetching(true);
    setFetchResult(null);
    try {
      const data = await fetchFeeds();
      setFetchResult(data);
      setPage(1);
      await loadPage(1);
    } finally {
      setIsFetching(false);
    }
  };

  const handleToggleRead = useCallback(async (id: number, isRead: boolean) => {
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead } : a))
    );
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isRead: !isRead } : a))
      );
    }
  }, []);

  const columns = useMemo(
    () => buildColumns({ onToggleRead: handleToggleRead, searchQuery: debouncedSearch }),
    [handleToggleRead, debouncedSearch]
  );

  const table = useReactTable({
    data: articles,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const unreadCount = articles.filter((a) => !a.isRead).length;

  return (
    <div className="flex flex-col gap-0">
      <FeedToolbar
        sources={sources}
        sourceFilter={sourceFilter}
        categoryFilter={categoryFilter}
        readFilter={readFilter}
        sortBy={sortBy}
        isFetching={isFetching}
        searchQuery={searchQuery}
        onSourceChange={setSourceFilter}
        onCategoryChange={setCategoryFilter}
        onReadFilterChange={setReadFilter}
        onSortChange={setSortBy}
        onFetch={handleFetch}
        onSearchChange={setSearchQuery}
      />

      {/* Status bar */}
      <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] pb-2" aria-live="polite">
        {loading ? (
          <span>Loading...</span>
        ) : debouncedSearch ? (
          <>
            <span>Showing {articles.length} results for &quot;{debouncedSearch}&quot;</span>
            <Button variant="ghost" size="sm" className="text-xs h-6 px-2" aria-label="Clear search" onClick={() => setSearchQuery("")}>
              Clear
            </Button>
          </>
        ) : hasMore ? (
          <span>Showing {articles.length} of {total} articles</span>
        ) : (
          <span>Showing all {total} articles</span>
        )}
        {unreadCount > 0 && (
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            {unreadCount} unread
          </span>
        )}
        {fetchResult && (
          <span className="text-green-600 dark:text-green-400">
            +{fetchResult.added} new
            {fetchResult.errors.length > 0 && (
              <span className="text-amber-500 ml-1">
                ({fetchResult.errors.length} error{fetchResult.errors.length > 1 ? "s" : ""})
              </span>
            )}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[var(--border)] overflow-x-auto" aria-busy={loading}>
        <table className="w-full text-sm">
          <caption className="sr-only">Article feed</caption>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-[var(--border)] bg-[var(--muted)]"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    className="px-3 py-2.5 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              // Skeleton rows — padding and column widths match loaded rows
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border)] animate-pulse">
                  <td className="px-3 py-2.5" style={{ width: 56 }}>
                    <div className="h-10 w-10 rounded bg-[var(--muted)]" />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="h-4 w-3/4 rounded bg-[var(--muted)] mb-1.5" />
                    <div className="h-3 w-1/2 rounded bg-[var(--muted)]" />
                  </td>
                  <td className="px-3 py-2.5" style={{ width: 100 }}>
                    <div className="h-4 w-20 rounded bg-[var(--muted)]" />
                  </td>
                  <td className="px-3 py-2.5" style={{ width: 100 }}>
                    <div className="h-5 w-16 rounded-full bg-[var(--muted)]" />
                  </td>
                  <td className="px-3 py-2.5" style={{ width: 80 }}>
                    <div className="h-4 w-12 rounded bg-[var(--muted)]" />
                  </td>
                  <td className="px-3 py-2.5" style={{ width: 90 }}>
                    <div className="h-4 w-16 rounded bg-[var(--muted)]" />
                  </td>
                  <td className="px-3 py-2.5" style={{ width: 80 }}>
                    <div className="h-7 w-14 rounded bg-[var(--muted)]" />
                  </td>
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-16 text-center text-[var(--muted-foreground)]"
                >
                  <div className="flex flex-col items-center gap-1">
                    {debouncedSearch ? (
                      <>
                        <span className="font-medium">No articles found</span>
                        <span className="text-xs">Try a different keyword or clear the search.</span>
                      </>
                    ) : sources.length === 0 ? (
                      <>
                        <span className="font-medium">No articles yet</span>
                        <span className="text-xs">Add a source to start collecting articles.</span>
                      </>
                    ) : (
                      <span>No articles match your filters.</span>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-[var(--border)] transition-colors hover:bg-[var(--muted)]/40 ${
                    row.original.isRead ? "opacity-60" : ""
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-3 py-2.5 align-middle"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Infinite scroll sentinel */}
      {hasMore && !loading && (
        <div ref={sentinelRef} className="h-10 flex items-center justify-center" aria-hidden="true">
          <div className="h-4 w-4 border-2 border-[var(--muted-foreground)] border-t-transparent rounded-full animate-spin" aria-label="Loading more articles" />
        </div>
      )}
    </div>
  );
}
