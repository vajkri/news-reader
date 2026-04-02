import { useState, useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import { EnrichNowButton } from '../EnrichNowButton';
import { Check, X, Minus, Plus, Loader2 } from 'lucide-react';
import type { SimArticle } from '../__mocks__/briefing-data';
import { ENRICHMENT_ARTICLES, AI_OUTPUTS } from '../__mocks__/briefing-data';

const meta = {
  title: 'Flows/Briefing',
  component: EnrichNowButton,
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true, navigation: { pathname: '/briefing' } },
  },
  decorators: [(Story) => <div style={{ maxWidth: 800, margin: '0 auto' }}><Story /></div>],
} satisfies Meta<typeof EnrichNowButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Full enrichment + triage flow
// ---------------------------------------------------------------------------

type Phase = 'ready' | 'enriching' | 'triage' | 'approved';

interface TriageItem {
  id: number;
  title: string;
  source: string;
  summary: string;
  aiScore: number;
  userScore: number;
  tier: string;
}

function EnrichmentTriageFlow() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [articles, setArticles] = useState<SimArticle[]>(
    ENRICHMENT_ARTICLES.map((a) => ({ ...a })),
  );
  const [triageItems, setTriageItems] = useState<TriageItem[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doneCount = articles.filter((a) => a.status === 'done').length;
  const totalCount = articles.length;

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  // --- Enrichment phase ---

  function startEnrichment() {
    setPhase('enriching');
    setApprovedCount(0);
    const fresh = ENRICHMENT_ARTICLES.map((a) => ({ ...a }));
    setArticles(fresh);
    processNextArticle(0, fresh);
  }

  function processNextArticle(index: number, state: SimArticle[]) {
    if (index >= state.length) {
      // Enrichment done: transition to triage
      const items: TriageItem[] = state.map((a) => {
        const ai = AI_OUTPUTS[a.id];
        return {
          id: a.id,
          title: a.title,
          source: a.source,
          summary: ai?.summary ?? '',
          aiScore: ai?.score ?? 5,
          userScore: ai?.score ?? 5,
          tier: ai?.tier ?? 'notable',
        };
      });
      setTriageItems(items);
      setTimeout(() => setPhase('triage'), 600);
      return;
    }
    const updated = [...state];
    updated[index] = { ...updated[index], status: 'analyzing', progress: 0 };
    setArticles([...updated]);
    const aiData = AI_OUTPUTS[updated[index].id];
    const fullText = aiData?.summary ?? '';
    let charIndex = 0;
    intervalRef.current = setInterval(() => {
      charIndex += 2;
      const current = [...updated];
      if (charIndex >= fullText.length) {
        current[index] = { ...current[index], status: 'scoring', aiOutput: fullText, progress: 90 };
        setArticles([...current]);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeout(() => {
          const scored = [...current];
          scored[index] = { ...scored[index], status: 'done', score: aiData?.score ?? 5, tier: aiData?.tier ?? 'notable', progress: 100 };
          setArticles([...scored]);
          setTimeout(() => processNextArticle(index + 1, scored), 400);
        }, 600);
      } else {
        current[index] = { ...current[index], aiOutput: fullText.slice(0, charIndex), progress: Math.min(100, Math.round((charIndex / fullText.length) * 80)) };
        setArticles([...current]);
      }
    }, 30);
  }

  // --- Triage phase ---

  function handleScoreChange(id: number, newScore: number) {
    setTriageItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, userScore: newScore, tier: scoreTier(newScore) }
          : item,
      ),
    );
  }

  function handleDismiss(id: number) {
    setTriageItems((prev) => prev.filter((item) => item.id !== id));
    setApprovedCount((c) => c + 1);
  }

  function handleApproveAll() {
    setApprovedCount((c) => c + triageItems.length);
    setTriageItems([]);
    setPhase('approved');
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setArticles(ENRICHMENT_ARTICLES.map((a) => ({ ...a })));
    setTriageItems([]);
    setApprovedCount(0);
    setPhase('ready');
  }

  // --- Render ---

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center justify-between py-2 px-4 mb-4 rounded-(--radius) bg-(--muted) border border-(--border)">
        <div className="flex flex-col gap-0.5 text-sm">
          <span className="text-amber-500 font-semibold">
            {phase === 'ready' && `${totalCount} articles pending`}
            {phase === 'enriching' && `${totalCount - doneCount} articles pending`}
            {phase === 'triage' && `${triageItems.length} article${triageItems.length !== 1 ? 's' : ''} awaiting review`}
            {phase === 'approved' && `${approvedCount} articles approved`}
          </span>
          <span className="text-(--muted-foreground)">
            {phase === 'ready' && 'Ready to enrich'}
            {phase === 'enriching' && `Processing batch... ${doneCount}/${totalCount}`}
            {phase === 'triage' && 'Adjust scores, dismiss, then approve'}
            {phase === 'approved' && 'Triage complete'}
          </span>
        </div>
        <div className="flex gap-2">
          {(phase === 'approved' || phase === 'triage') && (
            <Button variant="ghost" size="sm" onClick={reset}>Reset</Button>
          )}
          {phase === 'ready' && (
            <Button variant="outline" size="sm" onClick={startEnrichment} className="whitespace-nowrap">
              Enrich now ({totalCount})
            </Button>
          )}
          {phase === 'enriching' && (
            <Button variant="outline" size="sm" disabled className="whitespace-nowrap">
              <Loader2 size={14} className="animate-spin mr-2" />
              Enriching... ({doneCount} done)
            </Button>
          )}
          {phase === 'triage' && triageItems.length > 0 && (
            <Button variant="default" size="sm" onClick={handleApproveAll}>
              <Check size={14} className="mr-1" />
              Approve all ({triageItems.length})
            </Button>
          )}
        </div>
      </div>

      {/* Enrichment phase: article processing cards */}
      {(phase === 'ready' || phase === 'enriching') && (
        <div className="space-y-2">
          {articles.map((article) => (
            <div key={article.id} className={`rounded-(--radius) border overflow-hidden transition-all duration-300 ${
              article.status === 'done' ? 'border-(--border) bg-(--card)'
                : article.status === 'pending' ? 'border-(--border) bg-(--card) opacity-50'
                : 'border-amber-500/30 bg-(--card)'
            }`}>
              {(article.status === 'analyzing' || article.status === 'scoring') && (
                <div className="h-0.5 bg-(--muted)">
                  <div className="h-full bg-amber-500 transition-all duration-200" style={{ width: `${article.progress}%` }} />
                </div>
              )}
              {article.status === 'done' && <div className="h-0.5 bg-green-500" />}
              <div className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-(--foreground) truncate flex-1">{article.title}</p>
                  {article.status === 'done' && article.tier && (
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${TIER_COLORS[article.tier] ?? ''}`}>
                      {article.score}/10
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-(--muted-foreground) mt-0.5">
                  {article.source}
                  {article.status === 'pending' && ' · Waiting'}
                  {article.status === 'analyzing' && ' · Analyzing...'}
                  {article.status === 'scoring' && ' · Scoring...'}
                  {article.status === 'done' && ` · ${article.tier}`}
                </p>
                {(article.status === 'analyzing' || article.status === 'scoring' || article.status === 'done') && (
                  <div className={`mt-2 text-sm leading-relaxed ${article.status === 'done' ? 'text-(--foreground-secondary)' : 'text-(--muted-foreground)'}`}>
                    {article.aiOutput}
                    {article.status === 'analyzing' && <span className="inline-block w-[2px] h-[14px] bg-amber-500 ml-0.5 align-middle animate-pulse" />}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Triage phase: score adjust + dismiss + approve */}
      {phase === 'triage' && triageItems.length > 0 && (
        <div className="space-y-2">
          {triageItems.map((item) => {
            const tierStyle = TIER_COLORS[item.tier] ?? '';
            const changed = item.userScore !== item.aiScore;
            return (
              <div key={item.id} className="rounded-(--radius) border border-(--border) bg-(--card) overflow-hidden">
                <div className="py-3 px-4">
                  <p className="text-sm font-semibold text-(--foreground) truncate">{item.title}</p>
                  <p className="text-[13px] text-(--muted-foreground) mb-2">{item.source}</p>
                  <p className="text-sm text-(--foreground-secondary) leading-relaxed mb-3">{item.summary}</p>
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-(--border)">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleScoreChange(item.id, Math.max(1, item.userScore - 1))} disabled={item.userScore <= 1} aria-label="Decrease score">
                        <Minus size={14} />
                      </Button>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded border ${tierStyle}`}>
                        {item.userScore}/10
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => handleScoreChange(item.id, Math.min(10, item.userScore + 1))} disabled={item.userScore >= 10} aria-label="Increase score">
                        <Plus size={14} />
                      </Button>
                      {changed && <span className="text-xs text-(--muted-foreground)">AI: {item.aiScore}</span>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDismiss(item.id)} className="text-(--muted-foreground) hover:text-red-500">
                      <X size={14} className="mr-1" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Triage phase: all dismissed */}
      {phase === 'triage' && triageItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-green-500 font-semibold">{approvedCount} article{approvedCount !== 1 ? 's' : ''} triaged</p>
        </div>
      )}

      {/* Approved phase */}
      {phase === 'approved' && (
        <div className="text-center py-8">
          <p className="text-sm text-green-500 font-semibold">{approvedCount} article{approvedCount !== 1 ? 's' : ''} approved and added to briefing</p>
          <p className="text-xs text-(--muted-foreground) mt-1">Articles now appear in the "New" section</p>
        </div>
      )}
    </div>
  );
}

export const EnrichmentSim: Story = {
  name: 'Enrichment + triage',
  args: { pendingCount: 5 },
  render: () => <EnrichmentTriageFlow />,
  parameters: {
    docs: { description: { story: 'Full flow: click "Enrich now" to watch AI process articles, then triage them (adjust scores, dismiss), then approve the batch. Mirrors the real briefing page experience.' } },
  },
};

// ---------------------------------------------------------------------------
// Static button states
// ---------------------------------------------------------------------------

export const ButtonReady: Story = {
  name: 'EnrichNow: ready',
  args: { pendingCount: 47 },
};

export const ButtonEmpty: Story = {
  name: 'EnrichNow: nothing pending',
  args: { pendingCount: 0 },
};
