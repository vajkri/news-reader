"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceAvatar } from "@/components/ui/SourceAvatar";
import { SourceRow } from "@/types";

interface SourceListProps {
  sources: SourceRow[];
  onDeleted: (id: number) => void;
  error?: string | null;
}

export function SourceList({ sources, onDeleted, error }: SourceListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (error) {
    return (
      <p role="alert" className="text-sm text-(--destructive) py-4">
        {error}
      </p>
    );
  }

  if (sources.length === 0) {
    return (
      <p className="text-base text-(--muted-foreground) py-4">
        No sources added yet. Add your first RSS feed to start fetching articles.
      </p>
    );
  }

  const handleDelete = async (id: number) => {
    const response = await fetch(`/api/sources/${id}`, { method: "DELETE" });
    if (!response.ok) {
      alert("Failed to delete source. Please try again.");
      return;
    }
    onDeleted(id);
    setDeletingId(null);
  };

  return (
    <div className="rounded-lg border border-(--border) overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-(--border) bg-(--muted)">
            <th className="w-14" />
            <th className="px-4 py-2.5 text-left text-xs font-medium text-(--muted-foreground) uppercase tracking-wide">Name</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-(--muted-foreground) uppercase tracking-wide hidden sm:table-cell">Feed URL</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-(--muted-foreground) uppercase tracking-wide">Category</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-(--muted-foreground) uppercase tracking-wide">Articles</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr key={source.id} className="border-b border-(--border) last:border-0 hover:bg-[color-mix(in_srgb,var(--muted)_40%,transparent)] transition-colors">
              <td className="px-4 py-3">
                <SourceAvatar sourceName={source.name} size="sm" />
              </td>
              <td className="px-4 py-3 font-medium">{source.name}</td>
              <td className="px-4 py-3 max-w-xs hidden sm:table-cell">
                <span className="text-(--muted-foreground) text-xs truncate block">{source.url}</span>
              </td>
              <td className="px-4 py-3">
                {source.category ? <Badge>{source.category}</Badge> : <span className="text-(--muted-foreground)">-</span>}
              </td>
              <td className="px-4 py-3 text-(--muted-foreground)">{source._count.articles}</td>
              <td className="px-4 py-3">
                {deletingId === source.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-(--foreground)">Delete source?</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => { await handleDelete(source.id); }}
                    >
                      Delete source
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingId(null)}
                    >
                      Keep source
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingId(source.id)}
                    className="text-(--muted-foreground) hover:text-(--destructive)"
                    aria-label={`Delete ${source.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
