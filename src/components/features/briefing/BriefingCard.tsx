'use client';

import type { BriefingArticle } from "@/lib/briefing";
import { splitSummary } from "@/lib/briefing";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const TIER_BORDER: Record<string, string> = {
  critical: "border-l-red-600",
  important: "border-l-amber-600",
  notable: "border-l-blue-500",
};

export function BriefingCard({ article }: { article: BriefingArticle }): React.ReactElement {
  const parts = splitSummary(article.summary);

  return (
    <article className="rounded-[0.625rem] border border-(--border) bg-(--card) overflow-hidden">
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "block",
          "hover:bg-[color-mix(in_srgb,var(--muted)_50%,transparent)] transition-colors",
          "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-(--primary) focus-visible:outline-none",
        )}
      >
        <div
          className={cn(
            "py-5 pr-5 pl-6 border-l-[3.5px]",
            TIER_BORDER[article.importanceTier] ?? "border-l-transparent",
          )}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[0.8125rem] font-medium text-(--muted-foreground)">
              {article.source.name}
            </span>
            {article.publishedAt && (
              <>
                <span className="w-[3px] h-[3px] rounded-full bg-(--muted-foreground)" />
                <span className="text-[0.8125rem] text-(--muted-foreground)">
                  {formatDistanceToNow(new Date(article.publishedAt), {
                    addSuffix: true,
                  })}
                </span>
              </>
            )}
          </div>

          <h3 className="text-lg font-semibold text-(--foreground) leading-[1.4] tracking-[-0.01em]">
            {article.title}
          </h3>

          {parts?.takeaway && (
            <p className="text-base font-medium text-(--foreground-secondary) leading-normal mt-2">
              {parts.takeaway}
            </p>
          )}

          {parts?.context && (
            <p className="text-base text-(--muted-foreground) leading-normal mt-1.5 line-clamp-2">
              {parts.context}
            </p>
          )}
        </div>
      </a>
      <div className="px-6 pb-3 pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="text-(--muted-foreground) hover:text-(--foreground) gap-1.5 text-[0.8125rem]"
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(
              new CustomEvent('chat-about-this', {
                detail: {
                  id: article.id,
                  title: article.title,
                  source: article.source.name,
                  publishedAt: article.publishedAt,
                },
              })
            );
          }}
        >
          <MessageCircle size={14} />
          Chat about this
        </Button>
      </div>
    </article>
  );
}
