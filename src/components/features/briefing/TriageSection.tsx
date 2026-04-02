'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TriageCard } from './TriageCard';
import type { TriageArticle } from './TriageCard';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface TriageSectionProps {
  articles: TriageArticle[];
}

export function TriageSection({ articles: initial }: TriageSectionProps): React.ReactElement | null {
  const [articles, setArticles] = useState(initial);
  const [scores, setScores] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {};
    for (const a of initial) map[a.id] = a.importanceScore ?? 5;
    return map;
  });
  const [approvedCount, setApprovedCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  if (initial.length === 0 && approvedCount === 0) return null;

  function handleScoreChange(id: number, score: number) {
    setScores((prev) => ({ ...prev, [id]: score }));
  }

  function handleDismiss(id: number) {
    setArticles((prev) => prev.filter((a) => a.id !== id));
    setApprovedCount((c) => c + 1);
  }

  async function handleApproveAll() {
    setSubmitting(true);
    const remaining = [...articles];
    const failedIds = new Set<number>();
    for (const article of remaining) {
      try {
        const res = await fetch(`/api/articles/${article.id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score: scores[article.id] ?? article.importanceScore }),
        });
        if (!res.ok) failedIds.add(article.id);
      } catch {
        failedIds.add(article.id);
      }
    }
    const succeeded = remaining.length - failedIds.size;
    setApprovedCount((c) => c + succeeded);
    setArticles(failedIds.size === 0 ? [] : remaining.filter((a) => failedIds.has(a.id)));
    setSubmitting(false);
  }

  if (articles.length === 0) {
    return (
      <section className="mb-6 text-center py-4">
        <p className="text-sm text-green-500 font-semibold">
          {approvedCount} article{approvedCount !== 1 ? 's' : ''} triaged
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-(--muted-foreground)"
          onClick={() => router.refresh()}
        >
          Refresh briefing
        </Button>
      </section>
    );
  }

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-amber-500">
          Triage: {articles.length} article{articles.length !== 1 ? 's' : ''} awaiting review
        </h2>
        <Button
          variant="default"
          size="sm"
          onClick={handleApproveAll}
          disabled={submitting}
        >
          <Check size={14} className="mr-1" />
          {submitting ? 'Approving...' : `Approve all (${articles.length})`}
        </Button>
      </div>
      <div className="space-y-2">
        {articles.map((article) => (
          <TriageCard
            key={article.id}
            article={article}
            score={scores[article.id] ?? article.importanceScore ?? 5}
            onScoreChange={handleScoreChange}
            onDismiss={handleDismiss}
          />
        ))}
      </div>
    </section>
  );
}
