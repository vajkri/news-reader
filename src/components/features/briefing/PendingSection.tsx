interface PendingArticle {
  id: number;
  title: string;
  publishedAt: string | null;
  source: { name: string };
}

interface PendingSectionProps {
  articles: PendingArticle[];
}

export function PendingSection({
  articles,
}: PendingSectionProps): React.ReactElement | null {
  if (articles.length === 0) return null;

  return (
    <section className="mb-6 opacity-60">
      <h2 className="text-sm font-semibold text-amber-600 dark:text-amber-500 mb-3">
        Pending enrichment ({articles.length})
      </h2>
      <div className="space-y-2">
        {articles.map((article) => (
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
    </section>
  );
}
