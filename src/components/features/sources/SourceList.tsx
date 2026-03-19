"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceRow } from "@/types";

interface SourceListProps {
  sources: SourceRow[];
  onDeleted: (id: number) => void;
}

export function SourceList({ sources, onDeleted }: SourceListProps) {
  if (sources.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-foreground)] py-4">
        No sources yet. Add your first RSS feed above.
      </p>
    );
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this source and all its articles?")) return;
    await fetch(`/api/sources/${id}`, { method: "DELETE" });
    onDeleted(id);
  };

  return (
    <div className="rounded-lg border border-[var(--border)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Name</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Feed URL</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Category</th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wide">Articles</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {sources.map((source) => (
            <tr key={source.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/40 transition-colors">
              <td className="px-4 py-3 font-medium">{source.name}</td>
              <td className="px-4 py-3 max-w-xs">
                <span className="text-[var(--muted-foreground)] text-xs truncate block">{source.url}</span>
              </td>
              <td className="px-4 py-3">
                {source.category ? <Badge>{source.category}</Badge> : <span className="text-[var(--muted-foreground)]">—</span>}
              </td>
              <td className="px-4 py-3 text-[var(--muted-foreground)]">{source._count.articles}</td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(source.id)}
                  className="text-[var(--muted-foreground)] hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
