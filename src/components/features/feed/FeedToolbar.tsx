"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SourceRow } from "@/types";

interface FeedToolbarProps {
  sources: SourceRow[];
  sourceFilter: string;
  categoryFilter: string;
  readFilter: "all" | "unread" | "read";
  sortBy: "date" | "readTime";
  isFetching: boolean;
  onSourceChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onReadFilterChange: (v: "all" | "unread" | "read") => void;
  onSortChange: (v: "date" | "readTime") => void;
  onFetch: () => void;
}

export function FeedToolbar({
  sources,
  sourceFilter,
  categoryFilter,
  readFilter,
  sortBy,
  isFetching,
  onSourceChange,
  onCategoryChange,
  onReadFilterChange,
  onSortChange,
  onFetch,
}: FeedToolbarProps) {
  const categories = Array.from(
    new Set(sources.map((s) => s.category).filter(Boolean))
  ) as string[];

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      {/* Read filter tabs */}
      <div className="flex items-center gap-1">
        {(["all", "unread", "read"] as const).map((val) => (
          <Button
            key={val}
            variant={readFilter === val ? "default" : "ghost"}
            size="sm"
            onClick={() => onReadFilterChange(val)}
            aria-pressed={readFilter === val}
            className={`text-xs capitalize ${readFilter === val ? "font-semibold" : ""}`}
          >
            {val}
          </Button>
        ))}
      </div>

      <Select
        value={sourceFilter}
        onChange={(e) => onSourceChange(e.target.value)}
        placeholder="All sources"
        className="w-40"
      >
        {sources.map((s) => (
          <option key={s.id} value={String(s.id)}>
            {s.name}
          </option>
        ))}
      </Select>

      {categories.length > 0 && (
        <Select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="All categories"
          className="w-40"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      )}

      <Select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as "date" | "readTime")}
        className="w-36"
      >
        <option value="date">Newest first</option>
        <option value="readTime">Read time</option>
      </Select>

      <div className="ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onFetch}
          disabled={isFetching}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Fetching…" : "Fetch latest"}
        </Button>
      </div>
    </div>
  );
}
