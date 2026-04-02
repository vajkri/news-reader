'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { createEnrichStreamToken } from '@/lib/actions';

interface EnrichedArticle {
  id: number;
  title: string;
  source: string;
  summary: string;
  score: number;
  duplicateOf: number | null;
}

interface ProcessingArticle {
  id: number;
  title: string;
  source: string;
}

interface EnrichmentProgressProps {
  pendingCount: number;
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

export function EnrichmentProgress({ pendingCount }: EnrichmentProgressProps): React.ReactElement {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enriched, setEnriched] = useState<EnrichedArticle[]>([]);
  const [processing, setProcessing] = useState<ProcessingArticle[]>([]);
  const [totalSoFar, setTotalSoFar] = useState(0);
  const router = useRouter();

  const startEnrichment = useCallback(async (loop: boolean = true) => {
    setRunning(true);
    setDone(false);
    setError(null);
    setEnriched([]);
    setProcessing([]);
    setTotalSoFar(0);

    function onEvent(event: string, data: Record<string, unknown>) {
      switch (event) {
        case 'batch-start':
          setProcessing(data.articles as ProcessingArticle[]);
          break;
        case 'article-enriched':
          setProcessing((prev) => prev.filter((a) => a.id !== data.id));
          setEnriched((prev) => [...prev, {
            id: data.id as number,
            title: data.title as string,
            source: data.source as string,
            summary: data.summary as string,
            score: data.score as number,
            duplicateOf: (data.duplicateOf as number | null) ?? null,
          }]);
          setTotalSoFar(data.totalSoFar as number);
          break;
        case 'batch-complete':
          setProcessing([]);
          break;
        case 'batch-error':
          setError(data.error as string);
          break;
        case 'done':
          setTotalSoFar(data.totalEnriched as number);
          break;
        case 'error':
          setError(data.error as string);
          break;
      }
    }

    const tokenResult = await createEnrichStreamToken();
    if ('error' in tokenResult) {
      setError(tokenResult.error);
      setRunning(false);
      return;
    }

    const url = `/api/enrich/stream?batch=5&loop=${loop}&token=${tokenResult.token}`;
    const es = new EventSource(url);

    const events = ['batch-start', 'article-enriched', 'batch-complete', 'batch-error', 'done'] as const;
    for (const event of events) {
      es.addEventListener(event, (e: MessageEvent) => {
        try {
          onEvent(event, JSON.parse(e.data));
        } catch {
          // Malformed event data; skip
        }
      });
    }

    // Server-sent 'error' events carry a message in data; parse it if available
    es.addEventListener('error', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.error) setError(data.error as string);
      } catch {
        setError('Connection lost');
      }
      es.close();
      setRunning(false);
      setDone(true);
      router.refresh();
    });

    es.addEventListener('done', () => {
      es.close();
      setRunning(false);
      setDone(true);
      router.refresh();
    });
  }, [router]);

  // Not running, not done: show enrich button
  if (!running && !done) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => startEnrichment(true)} className="whitespace-nowrap">
          Enrich now ({pendingCount})
        </Button>
        <Button variant="ghost" size="sm" onClick={() => startEnrichment(false)} className="whitespace-nowrap text-(--muted-foreground)">
          Single batch
        </Button>
      </div>
    );
  }

  // Done: show result + refresh
  if (!running && done) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-green-500 font-semibold">{totalSoFar} enriched</span>
        <Button variant="outline" size="sm" onClick={() => router.refresh()}>
          Refresh briefing
        </Button>
        {pendingCount - totalSoFar > 0 && (
          <Button variant="ghost" size="sm" onClick={() => startEnrichment(true)} className="text-(--muted-foreground)">
            Enrich more
          </Button>
        )}
      </div>
    );
  }

  // Running: show progress
  return (
    <div>
      {/* Counter in status area */}
      <div className="flex items-center gap-2 mb-3" role="status" aria-live="polite">
        <Loader2 size={14} className="animate-spin text-amber-500" />
        <span className="text-sm font-semibold text-amber-500">
          Enriching... ({totalSoFar}/{pendingCount})
        </span>
        {error && <span className="text-sm text-red-500" role="alert">{error}</span>}
      </div>

      {/* Processing articles (current batch) */}
      {processing.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {processing.map((a) => (
            <div key={a.id} className="flex items-center gap-2 py-1.5 pl-3 border-l-[3px] border-amber-500 opacity-60">
              <Loader2 size={12} className="animate-spin text-amber-500 shrink-0" />
              <p className="text-sm text-(--foreground) truncate">{a.title}</p>
              <span className="text-[13px] text-(--muted-foreground) shrink-0">{a.source}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recently enriched articles */}
      {enriched.length > 0 && (
        <div className="space-y-1.5">
          {enriched.slice(-10).map((a) => {
            const isDupe = a.duplicateOf !== null;
            const tier = scoreTier(a.score);
            const tierStyle = TIER_COLORS[tier] ?? '';
            return (
              <div key={a.id} className={`flex items-center gap-2 py-1.5 pl-3 border-l-[3px] ${isDupe ? 'border-(--border) opacity-40' : 'border-green-500'}`}>
                <p className="text-sm text-(--foreground) truncate flex-1">{a.title}</p>
                {isDupe ? (
                  <span className="text-[13px] text-(--muted-foreground) shrink-0">duplicate</span>
                ) : (
                  <span className={`text-[13px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${tierStyle}`}>
                    {a.score}/10
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
