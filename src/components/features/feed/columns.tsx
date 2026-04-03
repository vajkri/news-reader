"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { Circle, CircleCheck, Clock, ExternalLink, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SourceAvatar } from "@/components/ui/SourceAvatar";
import { TopicIcon } from "@/components/ui/TopicIcon";
import { parseTopics } from "@/lib/briefing";
import { ArticleRow } from "@/types";

interface ColumnsOptions {
  onToggleRead: (id: number, isRead: boolean) => void;
  searchQuery?: string;
  feedWatermark?: string | null;
}

export function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-(--highlight) text-(--highlight-foreground) rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function buildColumns({ onToggleRead, searchQuery, feedWatermark }: ColumnsOptions): ColumnDef<ArticleRow>[] {
  return [
    {
      id: "thumbnail",
      header: "",
      size: 56,
      cell: ({ row }) => {
        const { thumbnail, title, topics } = row.original;
        const sourceName = row.original.source.name;

        // Real thumbnail
        if (thumbnail) {
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
        }

        // Enriched article: show topic icon
        const parsedTopics = parseTopics(topics);
        if (parsedTopics[0] && parsedTopics[0] !== "Uncategorized") {
          return <TopicIcon topic={parsedTopics[0]} size={16} />;
        }

        // Unenriched: show source initial
        return <SourceAvatar sourceName={sourceName} size="md" />;
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const { title, link, isRead } = row.original;
        const isNew = feedWatermark && !isRead && new Date(row.original.createdAt) > new Date(feedWatermark);
        return (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 text-sm font-medium hover:underline group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) rounded-sm ${
              isRead ? "text-(--muted-foreground)" : "text-(--foreground)"
            }`}
          >
            <span className="line-clamp-2">{highlightMatch(title, searchQuery ?? "")}</span>
            {isNew && <Badge variant="secondary" className="text-xs shrink-0 ml-1.5">New</Badge>}
            <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
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
        <span className="text-xs text-(--muted-foreground) whitespace-nowrap">
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
          <span className="flex items-center gap-1 text-xs text-(--muted-foreground) whitespace-nowrap">
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
        if (!val) return <span className="text-xs text-(--muted-foreground)">—</span>;
        try {
          return (
            <span className="text-xs text-(--muted-foreground) whitespace-nowrap">
              {formatDistanceToNow(new Date(val), { addSuffix: true })}
            </span>
          );
        } catch {
          return null;
        }
      },
    },
    {
      id: "actions",
      header: "Actions",
      size: 190,
      cell: ({ row }) => {
        const { id, title, link, isRead, publishedAt } = row.original;
        const sourceName = row.original.source.name;
        return (
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleRead(id, !isRead)}
              // min-w prevents layout shift between "Read" (4ch) and "Unread" (6ch) labels
              className="min-w-[5.25rem] justify-start gap-1.5 text-xs text-(--muted-foreground) hover:text-(--foreground)"
            >
              {isRead ? <CircleCheck size={14} /> : <Circle size={14} className="text-blue-600 dark:text-blue-400" />}
              {isRead ? "Read" : "Unread"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("chat-about-this", {
                    detail: { id, title, source: sourceName, publishedAt, link },
                  })
                );
              }}
              aria-label={`Chat about ${title}`}
              className="gap-1.5 text-xs text-(--muted-foreground) hover:text-(--foreground)"
            >
              <MessageCircle size={14} />
              Chat
            </Button>
          </div>
        );
      },
    },
  ];
}
