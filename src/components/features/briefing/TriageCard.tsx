'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Minus, Plus } from 'lucide-react';

export interface TriageArticle {
  id: number;
  title: string;
  summary: string | null;
  importanceScore: number | null;
  source: { name: string };
}

interface TriageCardProps {
  article: TriageArticle;
  score: number;
  onScoreChange: (id: number, score: number) => void;
  onDismiss: (id: number) => void;
}

const TIER_COLORS: Record<string, string> = {
  critical: 'text-red-500 bg-red-500/10 border-red-500/20',
  important: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  notable: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

function scoreTier(score: number): string {
  if (score >= 9) return 'critical';
  if (score >= 7) return 'important';
  return 'notable';
}

export function TriageCard({ article, score, onScoreChange, onDismiss }: TriageCardProps): React.ReactElement {
  const aiScore = article.importanceScore ?? 5;
  const [dismissing, setDismissing] = useState(false);

  async function handleDismiss() {
    setDismissing(true);
    const res = await fetch(`/api/articles/${article.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dismissed: true }),
    });
    if (res.ok) onDismiss(article.id);
    setDismissing(false);
  }

  const tier = scoreTier(score);
  const tierStyle = TIER_COLORS[tier] ?? '';
  const changed = score !== aiScore;

  return (
    <div className="rounded-(--radius) border border-(--border) bg-(--card) overflow-hidden">
      <div className="py-3 px-4">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-semibold text-(--foreground) truncate flex-1">
            {article.title}
          </p>
        </div>
        <p className="text-[13px] text-(--muted-foreground) mb-2">
          {article.source.name}
        </p>

        {article.summary && (
          <p className="text-sm text-(--foreground-secondary) leading-relaxed mb-3">
            {article.summary}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-(--border)">
          {/* Score adjuster */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onScoreChange(article.id, Math.max(1, score - 1))}
              disabled={score <= 1 || dismissing}
              aria-label="Decrease score"
            >
              <Minus size={14} />
            </Button>
            <span className={`text-sm font-bold px-2 py-0.5 rounded border ${tierStyle}`}>
              {score}/10
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onScoreChange(article.id, Math.min(10, score + 1))}
              disabled={score >= 10 || dismissing}
              aria-label="Increase score"
            >
              <Plus size={14} />
            </Button>
            {changed && (
              <span className="text-xs text-(--muted-foreground)">
                AI: {aiScore}
              </span>
            )}
          </div>

          {/* Dismiss only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            disabled={dismissing}
            className="text-(--muted-foreground) hover:text-red-500"
          >
            <X size={14} className="mr-1" />
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
