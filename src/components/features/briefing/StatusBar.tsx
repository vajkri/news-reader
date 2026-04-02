import { format } from 'date-fns';
import { EnrichmentProgress } from './EnrichmentProgress';

interface StatusBarProps {
  newCount: number;
  lastVisit: Date | null;
  lastEnrichedAt: string | null;
  pendingCount: number;
}

export function StatusBar({
  newCount,
  lastVisit,
  lastEnrichedAt,
  pendingCount,
}: StatusBarProps): React.ReactElement {
  const visitTime = lastVisit ? format(lastVisit, 'h:mm a') : null;
  const enrichedTime = lastEnrichedAt
    ? format(new Date(lastEnrichedAt), 'h:mm a')
    : 'Never';

  return (
    <div className="flex items-center justify-between py-2 px-4 mb-6 rounded-(--radius) bg-(--muted) border border-(--border)">
      <div className="flex flex-col gap-0.5 text-sm">
        <span>
          <span
            className={
              newCount > 0
                ? 'text-green-500 font-semibold'
                : 'text-(--foreground-secondary)'
            }
          >
            {newCount} new article{newCount !== 1 ? 's' : ''}
          </span>
          {visitTime && (
            <span className="text-(--muted-foreground)">
              {' '}since last visit ({visitTime})
            </span>
          )}
        </span>
        <span className="text-(--muted-foreground)">
          Last enriched: {enrichedTime}
        </span>
      </div>
      {pendingCount > 0 && <EnrichmentProgress pendingCount={pendingCount} />}
    </div>
  );
}
