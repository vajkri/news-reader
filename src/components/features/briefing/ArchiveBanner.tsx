import { Archive } from 'lucide-react';
import { format } from 'date-fns';

interface ArchiveBannerProps {
  date: Date;
}

export function ArchiveBanner({ date }: ArchiveBannerProps): React.ReactElement {
  const dateLabel = format(date, 'MMM d');
  return (
    <div className="flex items-start gap-3 py-2 px-4 mb-6 rounded-[var(--radius)] bg-[rgba(37,99,235,0.06)] border border-[rgba(37,99,235,0.15)]">
      <Archive size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-[13px] text-(--foreground-secondary)">
        Archive: {dateLabel}. Showing top 15 articles by importance. Feedback and enrichment are not available for past dates.
      </p>
    </div>
  );
}
