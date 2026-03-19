"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

  // TanStack sorting state (for column header clicks, secondary)
  const [sorting, setSorting] = useState<SortingState>([]);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (sourceFilter) params.set("sourceId", sourceFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    if (readFilter !== "all") params.set("isRead", String(readFilter === "read"));
    params.set("sort", sortBy);
    params.set("limit", "100");

    const res = await fetch(`/api/articles?${params}`);
    const data = await res.json();
    setArticles(data.articles ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [sourceFilter, categoryFilter, readFilter, sortBy]);

  // Load on filter/sort change
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);


  const handleFetch = async () => {
    if (isFetching) return;
    setIsFetching(true);
    setFetchResult(null);
    try {
      const res = await fetch("/api/fetch", { method: "POST" });
      const data: FetchResult = await res.json();
      setFetchResult(data);
      await loadArticles();
    } finally {
      setIsFetching(false);
    }
  };

  const handleToggleRead = useCallback(async (id: number, isRead: boolean) => {
    // Optimistic update
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead } : a))
    );
    await fetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead }),
    });
  }, []);

  const columns = useMemo(
    () => buildColumns({ onToggleRead: handleToggleRead }),
    [handleToggleRead]
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
        onSourceChange={setSourceFilter}
        onCategoryChange={setCategoryFilter}
        onReadFilterChange={setReadFilter}
        onSortChange={setSortBy}
        onFetch={handleFetch}
      />

      {/* Status bar */}
      <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] pb-2">
        <span>{total} articles</span>
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
      <div className="rounded-lg border border-[var(--border)] overflow-x-auto">
        <table className="w-full text-sm">
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
              // Skeleton rows
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-[var(--border)] animate-pulse">
                  <td className="px-3 py-3">
                    <div className="h-10 w-10 rounded bg-[var(--muted)]" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-64 rounded bg-[var(--muted)]" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-20 rounded bg-[var(--muted)]" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-5 w-16 rounded-full bg-[var(--muted)]" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-12 rounded bg-[var(--muted)]" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-16 rounded bg-[var(--muted)]" />
                  </td>
                  <td className="px-3 py-3">
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
                  {sources.length === 0
                    ? "No sources yet — add some RSS feeds to get started."
                    : "No articles match your filters."}
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
    </div>
  );
}
