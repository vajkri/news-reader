'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { triggerEnrichment } from '@/lib/actions';

interface EnrichNowButtonProps {
  pendingCount: number;
}

export function EnrichNowButton({ pendingCount }: EnrichNowButtonProps): React.ReactElement {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(false);
  const router = useRouter();

  function handleEnrich() {
    setError(false);
    startTransition(async () => {
      const result = await triggerEnrichment();
      if (result.ok) {
        router.refresh();
      } else {
        setError(true);
        setTimeout(() => setError(false), 3000);
      }
    });
  }

  const label = error
    ? 'Enrichment failed. Try again.'
    : isPending
      ? 'Enriching...'
      : `Enrich now (${pendingCount})`;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEnrich}
      disabled={isPending}
      className="whitespace-nowrap"
    >
      {label}
    </Button>
  );
}
