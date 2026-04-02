'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PendingArticle {
  id: number;
  title: string;
  publishedAt: string | null;
  source: { name: string };
}

interface PendingSectionProps {
  articles: PendingArticle[];
}

const COLLAPSED_LIMIT = 5;

export function PendingSection({
  articles,
}: PendingSectionProps): React.ReactElement | null {
  const [expanded, setExpanded] = useState(false);

  if (articles.length === 0) return null;

  const visible = expanded ? articles : articles.slice(0, COLLAPSED_LIMIT);
  const hiddenCount = articles.length - COLLAPSED_LIMIT;

  return (
    <section className="mb-6 opacity-60">
      <h2 className="text-sm font-semibold text-amber-600 dark:text-amber-500 mb-3">
        Pending enrichment ({articles.length})
      </h2>
      <div className="space-y-2">
        {visible.map((article) => (
          <div
            key={article.id}
            className="flex items-baseline justify-between gap-4 py-2 pl-4 border-l-[3px] border-amber-600 dark:border-amber-500"
          >
            <div className="min-w-0">
              <p className="text-sm text-(--foreground) truncate">
                {article.title}
              </p>
              <p className="text-[13px] text-(--muted-foreground) italic">
                {article.source.name} · Awaiting enrichment
              </p>
            </div>
          </div>
        ))}
      </div>
      {hiddenCount > 0 && (
        <div className="text-center mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : `Show all ${articles.length} articles`}
          </Button>
        </div>
      )}
    </section>
  );
}
