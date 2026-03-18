"use client";

import { useEffect, useState } from "react";
import { FeedTable } from "@/components/feed/FeedTable";
import { SourceRow } from "@/types";

export default function HomePage() {
  const [sources, setSources] = useState<SourceRow[]>([]);

  useEffect(() => {
    fetch("/api/sources")
      .then((r) => r.json())
      .then(setSources);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <FeedTable sources={sources} />
    </div>
  );
}
