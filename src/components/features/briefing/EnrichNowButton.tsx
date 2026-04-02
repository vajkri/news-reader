'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { triggerEnrichment } from '@/lib/actions';

interface EnrichNowButtonProps {
  pendingCount: number;
}

export function EnrichNowButton({ pendingCount }: EnrichNowButtonProps): React.ReactElement {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(false);
  const [enrichedSoFar, setEnrichedSoFar] = useState(0);
  const router = useRouter();

  async function handleEnrich() {
    setError(false);
    setRunning(true);
    setEnrichedSoFar(0);

    let total = 0;
    while (true) {
      const result = await triggerEnrichment();
      if (!result.ok) {
        setError(true);
        setTimeout(() => setError(false), 3000);
        break;
      }
      total += result.enriched ?? 0;
      setEnrichedSoFar(total);
      if (!result.enriched || result.enriched === 0) break;
    }

    setRunning(false);
    router.refresh();
  }

  const label = error
    ? 'Enrichment failed. Try again.'
    : running
      ? `Enriching... (${enrichedSoFar} done)`
      : `Enrich now (${pendingCount})`;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleEnrich}
      disabled={running}
      className="whitespace-nowrap"
    >
      {label}
    </Button>
  );
}
