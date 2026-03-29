'use client';

import { useState, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UP_REASONS = [
  'Directly useful for my work',
  'Important industry shift',
  'Great summary quality',
  'Would have missed this',
];

const DOWN_REASONS = [
  'Not relevant to me',
  'Too generic / low substance',
  'Already knew this',
  'Not actually important',
  'Duplicate coverage',
];

interface FeedbackButtonsProps {
  articleId: number;
  sourceId: number;
}

type Direction = 'up' | 'down' | null;

export function FeedbackButtons({ articleId }: FeedbackButtonsProps): React.ReactElement {
  const [activeDirection, setActiveDirection] = useState<Direction>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  const reasons = activeDirection === 'up' ? UP_REASONS : DOWN_REASONS;
  const legend = activeDirection === 'up' ? 'Why did you upvote this?' : 'Why did you downvote this?';

  const handleDirectionClick = useCallback((dir: 'up' | 'down') => {
    if (activeDirection === dir) {
      // Toggle off
      setActiveDirection(null);
      setPanelOpen(false);
      setSelectedReasons([]);
      return;
    }
    setActiveDirection(dir);
    setPanelOpen(true);
    setSelectedReasons([]);
  }, [activeDirection]);

  const handleReasonToggle = useCallback(async (reason: string) => {
    const updated = selectedReasons.includes(reason)
      ? selectedReasons.filter(r => r !== reason)
      : [...selectedReasons, reason];

    setSelectedReasons(updated);

    if (updated.length > 0 && activeDirection) {
      // Auto-submit on selection (per UI-SPEC: no explicit Submit button)
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            articleId,
            direction: activeDirection,
            reasons: updated,
          }),
        });
        // Close panel after 300ms (per UI-SPEC)
        setTimeout(() => {
          setPanelOpen(false);
        }, 300);
      } catch {
        // Silent failure: revert to default state (per UI-SPEC error handling)
        setActiveDirection(null);
        setPanelOpen(false);
        setSelectedReasons([]);
      }
    }
  }, [selectedReasons, activeDirection, articleId]);

  const upActive = activeDirection === 'up';
  const downActive = activeDirection === 'down';

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="vote"
          onClick={() => handleDirectionClick('up')}
          aria-label="Upvote: more like this"
          aria-pressed={upActive}
          className={`
            rounded border transition-colors
            ${upActive
              ? 'bg-[color-mix(in_srgb,#22c55e_10%,transparent)] border-green-500 text-green-500'
              : 'border-(--border) text-(--muted-foreground) hover:border-green-500 hover:text-green-500'
            }
          `}
        >
          <ChevronUp size={16} />
        </Button>
        <Button
          variant="ghost"
          size="vote"
          onClick={() => handleDirectionClick('down')}
          aria-label="Downvote: less like this"
          aria-pressed={downActive}
          className={`
            rounded border transition-colors
            ${downActive
              ? 'bg-[color-mix(in_srgb,#ef4444_10%,transparent)] border-red-500 text-red-500'
              : 'border-(--border) text-(--muted-foreground) hover:border-red-500 hover:text-red-500'
            }
          `}
        >
          <ChevronDown size={16} />
        </Button>
      </div>

      {panelOpen && activeDirection && (
        <fieldset className="mt-2 pl-1">
          <legend className="text-[13px] text-(--muted-foreground) mb-1.5">{legend}</legend>
          <div className="flex flex-col gap-1.5">
            {reasons.map((reason) => (
              <label key={reason} className="flex items-center gap-2 text-sm text-(--foreground) cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedReasons.includes(reason)}
                  onChange={() => handleReasonToggle(reason)}
                  className="rounded border-(--border) text-(--primary) focus-visible:ring-(--primary)"
                />
                {reason}
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  );
}
