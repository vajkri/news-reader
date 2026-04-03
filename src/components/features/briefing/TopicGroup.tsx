import type { TopicGroupData } from "@/lib/briefing";
import { BriefingCard } from "./BriefingCard";
import { TOPIC_ICON_MAP } from "@/components/ui/TopicIcon";
import { Cpu } from "lucide-react";

function TopicIcon({ topic }: { topic: string }) {
  const Icon = TOPIC_ICON_MAP[topic.toLowerCase()] ?? Cpu;
  return (
    <Icon size={20} className="text-(--muted-foreground)" aria-hidden />
  );
}

interface TopicGroupProps {
  group: TopicGroupData;
  isNew?: boolean;
}

export function TopicGroup({ group, isNew }: TopicGroupProps) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-(--foreground)">
        <TopicIcon topic={group.topic} />
        {group.topic}
        <span className="text-sm font-normal text-(--muted-foreground)">
          ({group.articles.length})
        </span>
      </h2>
      <div className="space-y-4">
        {group.articles.map((article) => (
          <BriefingCard key={article.id} article={article} isNew={isNew} />
        ))}
      </div>
    </section>
  );
}
