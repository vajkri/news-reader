import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface SourceCardProps {
  title: string;
  source: string;
  publishedAt: string | null;
  link: string;
}

export function SourceCard({
  title,
  source,
  publishedAt,
  link,
}: SourceCardProps): React.ReactElement {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 transition-colors hover:bg-[var(--muted)] focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none my-1.5"
    >
      <span className="block text-sm font-semibold text-[var(--foreground)] leading-snug mb-1.5">
        {title}
      </span>
      <span className="flex items-center gap-2">
        <Badge variant="secondary">{source}</Badge>
        {publishedAt && (
          <span className="text-[0.8125rem] text-[var(--muted-foreground)]">
            {formatDistanceToNow(new Date(publishedAt), { addSuffix: true })}
          </span>
        )}
      </span>
    </a>
  );
}
