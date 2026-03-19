import type { TopicGroupData } from "@/lib/briefing";
import { BriefingCard } from "./BriefingCard";

export function TopicGroup({ group }: { group: TopicGroupData }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-[var(--foreground)]">
        {group.topic} ({group.articles.length})
      </h2>
      <div className="space-y-6">
        {group.articles.map((article) => (
          <BriefingCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
