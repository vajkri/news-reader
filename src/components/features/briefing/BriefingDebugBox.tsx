'use client';

import { useDebug } from '@/contexts/debug';

interface BriefingDebugBoxProps {
  windowStart: string;
  windowEnd: string;
  articleCount: number;
  latestEnrichedAt: string | null;
}

export function BriefingDebugBox({
  windowStart,
  windowEnd,
  articleCount,
  latestEnrichedAt,
}: BriefingDebugBoxProps): React.ReactElement | null {
  const { debugMode } = useDebug();

  if (!debugMode) return null;

  return (
    <div className="bg-(--muted) border border-(--border) rounded-[0.625rem] p-4 space-y-2 mb-8">
      <h3 className="text-sm font-semibold text-(--foreground-secondary)">
        Debug: Briefing Metadata
      </h3>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-(--foreground-secondary) font-semibold">Briefing window</dt>
        <dd className="text-(--muted-foreground)">
          {new Date(windowStart).toLocaleString()} to {new Date(windowEnd).toLocaleString()}
        </dd>

        <dt className="text-(--foreground-secondary) font-semibold">Articles in window</dt>
        <dd className="text-(--muted-foreground)">{articleCount}</dd>

        <dt className="text-(--foreground-secondary) font-semibold">Latest enrichedAt</dt>
        <dd className="text-(--muted-foreground)">
          {latestEnrichedAt ? new Date(latestEnrichedAt).toLocaleString() : 'N/A'}
        </dd>
      </dl>
    </div>
  );
}
