import { CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface CaughtUpStateProps {
  lastVisit: string; // ISO string
}

export function CaughtUpState({ lastVisit }: CaughtUpStateProps): React.ReactElement {
  const visitTime = format(new Date(lastVisit), 'h:mm a');
  return (
    <div className="text-center py-12">
      <CheckCircle size={32} className="text-(--muted-foreground) mx-auto mb-3" aria-hidden="true" />
      <p className="text-base font-semibold text-(--foreground)">
        You&apos;re all caught up
      </p>
      <p className="text-sm text-(--muted-foreground) mt-1">
        No new articles since your last visit at {visitTime}.
      </p>
    </div>
  );
}
