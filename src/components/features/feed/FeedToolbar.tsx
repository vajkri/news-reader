"use client";

import { useEffect, useRef } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SourceRow } from "@/types";

interface FeedToolbarProps {
  sources: SourceRow[];
  sourceFilter: string;
  categoryFilter: string;
  readFilter: "all" | "unread" | "read";
  sortBy: "date" | "readTime";
  isFetching: boolean;
  searchQuery: string;
  onSourceChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onReadFilterChange: (v: "all" | "unread" | "read") => void;
  onSortChange: (v: "date" | "readTime") => void;
  onFetch: () => void;
  onSearchChange: (v: string) => void;
}

export function FeedToolbar({
  sources,
  sourceFilter,
  categoryFilter,
  readFilter,
  sortBy,
  isFetching,
  searchQuery,
  onSourceChange,
  onCategoryChange,
  onReadFilterChange,
  onSortChange,
  onFetch,
  onSearchChange,
}: FeedToolbarProps) {
  const categories = Array.from(
    new Set(sources.map((s) => s.category).filter(Boolean))
  ) as string[];

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        onSearchChange("");
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onSearchChange]);

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
            className={`text-sm capitalize ${readFilter === val ? "font-semibold" : ""}`}
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

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-(--muted-foreground)" />
        <Input
          ref={searchInputRef}
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search articles..."
          aria-label="Search articles"
          className="w-48 pl-8 focus-visible:w-64 transition-all"
        />
      </div>

      <div className="ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onFetch}
          disabled={isFetching}
          className="gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Fetching..." : "Fetch latest"}
        </Button>
      </div>
    </div>
  );
}
