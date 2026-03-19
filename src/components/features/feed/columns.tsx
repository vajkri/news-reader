"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArticleRow } from "@/types";

interface ColumnsOptions {
  onToggleRead: (id: number, isRead: boolean) => void;
  searchQuery?: string;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm px-0.5" style={{ background: 'var(--highlight)', color: 'var(--highlight-foreground)' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function buildColumns({ onToggleRead, searchQuery }: ColumnsOptions): ColumnDef<ArticleRow>[] {
  return [
    {
      id: "thumbnail",
      header: "",
      size: 56,
      cell: ({ row }) => {
        const { thumbnail, title } = row.original;
        if (!thumbnail) {
          return (
            <div className="h-10 w-10 flex-shrink-0 rounded bg-[var(--muted)] flex items-center justify-center">
              <span className="text-[var(--muted-foreground)] text-xs">—</span>
            </div>
          );
        }
        return (
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const { title, link, isRead } = row.original;
        return (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-start gap-1 text-sm font-medium hover:underline group ${
              isRead ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
            }`}
          >
            <span className="line-clamp-2">{highlightMatch(title, searchQuery ?? "")}</span>
            <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
          </a>
        );
      },
    },
    {
      id: "source",
      header: "Source",
      accessorFn: (row) => row.source.name,
      size: 120,
      cell: ({ row }) => (
        <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
          {row.original.source.name}
        </span>
      ),
    },
    {
      id: "category",
      header: "Category",
      accessorFn: (row) => row.source.category,
      size: 110,
      cell: ({ row }) => {
        const cat = row.original.source.category;
        if (!cat) return null;
        return <Badge>{cat}</Badge>;
      },
    },
    {
      accessorKey: "readTimeMin",
      header: "Read time",
      size: 90,
      cell: ({ getValue }) => {
        const mins = getValue() as number | null;
        if (!mins) return null;
        return (
          <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] whitespace-nowrap">
            <Clock className="h-3 w-3" />
            {mins} min
          </span>
        );
      },
    },
    {
      accessorKey: "publishedAt",
      header: "Published",
      size: 100,
      cell: ({ getValue }) => {
        const val = getValue() as string | null;
        if (!val) return <span className="text-xs text-[var(--muted-foreground)]">—</span>;
        try {
          return (
            <span className="text-xs text-[var(--muted-foreground)] whitespace-nowrap">
              {formatDistanceToNow(new Date(val), { addSuffix: true })}
            </span>
          );
        } catch {
          return null;
        }
      },
    },
    {
      id: "isRead",
      header: "Status",
      size: 80,
      cell: ({ row }) => {
        const { id, isRead } = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleRead(id, !isRead)}
            className={`text-xs ${
              isRead
                ? "text-[var(--muted-foreground)]"
                : "text-blue-600 dark:text-blue-400 font-semibold"
            }`}
          >
            {isRead ? "Read" : "Unread"}
          </Button>
        );
      },
    },
  ];
}
