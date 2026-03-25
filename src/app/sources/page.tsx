"use client";

import { useEffect, useState } from "react";
import { SourceForm } from "@/components/features/sources/SourceForm";
import { SourceList } from "@/components/features/sources/SourceList";
import { SourceRow } from "@/types";

export default function SourcesPage() {
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sources")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load sources (${r.status})`);
        return r.json();
      })
      .then(setSources)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="section-container py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">RSS Sources</h1>
        <p className="text-sm text-(--muted-foreground) mt-1">
          Manage the RSS feeds your reader pulls from.
        </p>
      </div>
      <SourceForm onAdded={(s) => setSources((prev) => [s, ...prev])} />
      <SourceList
        sources={sources}
        onDeleted={(id) => setSources((prev) => prev.filter((s) => s.id !== id))}
        error={error}
      />
    </div>
  );
}
