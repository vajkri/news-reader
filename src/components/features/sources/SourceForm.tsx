"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SourceRow } from "@/types";

interface SourceFormProps {
  onAdded: (source: SourceRow) => void;
}

export function SourceForm({ onAdded }: SourceFormProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !url.trim()) {
      setError("Name and URL are required.");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url, category }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to add source.");
        return;
      }
      onAdded(data);
      setName("");
      setUrl("");
      setCategory("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h2 className="text-base font-semibold">Add RSS source</h2>
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Name (e.g. Hacker News)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-0 flex-1 basis-36"
        />
        <Input
          placeholder="RSS feed URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="url"
          className="min-w-0 flex-[2] basis-48"
        />
        <Input
          placeholder="Category (optional)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="min-w-0 flex-1 basis-32"
        />
        <Button type="submit" disabled={loading}>
          {loading ? "Adding…" : "Add source"}
        </Button>
      </div>
      {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
    </form>
  );
}
