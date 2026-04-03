"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Circle, CircleCheck, Clock, Cpu, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SourceAvatar } from "@/components/ui/SourceAvatar";
import { TOPIC_ICON_MAP } from "@/components/ui/TopicIcon";
import { parseTopics } from "@/lib/briefing";
import { ArticleRow } from "@/types";
import { highlightMatch } from "./columns";

interface FeedMobileListProps {
  articles: ArticleRow[];
  onToggleRead: (id: number, isRead: boolean) => void;
  searchQuery?: string;
  feedWatermark?: string | null;
}

function ArticleVisual({
  article,
}: {
  article: ArticleRow;
}): React.ReactElement {
  const sourceName = article.source.name;
  const parsedTopics = parseTopics(article.topics);

  if (article.thumbnail) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={article.thumbnail}
        alt={article.title}
        className="h-8 w-8 rounded object-cover shrink-0"
      />
    );
  }

  if (parsedTopics[0] && parsedTopics[0] !== "Uncategorized") {
    const Icon = TOPIC_ICON_MAP[parsedTopics[0].toLowerCase()] ?? Cpu;
    return (
      <div className="h-8 w-8 flex items-center justify-center rounded bg-(--muted) shrink-0">
        <Icon size={16} className="text-(--muted-foreground)" aria-hidden />
      </div>
    );
  }

  return <SourceAvatar sourceName={sourceName} size="sm" />;
}

export function FeedMobileList({
  articles,
  onToggleRead,
  searchQuery,
  feedWatermark,
}: FeedMobileListProps): React.ReactElement {
  return (
    <div>
      {articles.map((article) => {
        const { id, title, link, isRead, publishedAt, readTimeMin } = article;
        const sourceName = article.source.name;
        const isNew =
          feedWatermark &&
          !isRead &&
          new Date(article.createdAt) > new Date(feedWatermark);

        return (
          <div
            key={id}
            className={`py-3 px-4 border-b border-(--border) ${isRead ? "opacity-60" : ""}`}
          >
            <div className="flex items-start gap-3">
              <ArticleVisual article={article} />
              <div className="flex-1 min-w-0">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-(--foreground) line-clamp-2 hover:underline"
                >
                  {highlightMatch(title, searchQuery ?? "")}
                  {isNew && (
                    <Badge variant="secondary" className="text-xs shrink-0 ml-1.5 align-middle">
                      New
                    </Badge>
                  )}
                </a>
                <div className="flex items-center gap-2 mt-1 text-xs text-(--muted-foreground) flex-wrap">
                  <span>{sourceName}</span>
                  {publishedAt && (
                    <>
                      <span aria-hidden>&middot;</span>
                      <span>
                        {formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}
                      </span>
                    </>
                  )}
                  {readTimeMin && (
                    <>
                      <span aria-hidden>&middot;</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} aria-hidden />
                        {readTimeMin} min
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs min-h-[44px] text-(--muted-foreground) hover:text-(--foreground)"
                onClick={() => onToggleRead(id, !isRead)}
              >
                {isRead ? (
                  <CircleCheck size={14} />
                ) : (
                  <Circle size={14} className="text-blue-600 dark:text-blue-400" />
                )}
                {isRead ? "Read" : "Unread"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs min-h-[44px] text-(--muted-foreground) hover:text-(--foreground)"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("chat-about-this", {
                      detail: {
                        articleId: id,
                        id,
                        title,
                        source: sourceName,
                        publishedAt,
                        link,
                      },
                    })
                  );
                }}
                aria-label={`Chat about ${title}`}
              >
                <MessageCircle size={14} />
                Chat
              </Button>
            </div>
          </div>
        );
      })}
      {articles.length === 0 && (
        <div className="py-16 text-center text-(--muted-foreground) text-sm">
          No articles to display.
        </div>
      )}
    </div>
  );
}
