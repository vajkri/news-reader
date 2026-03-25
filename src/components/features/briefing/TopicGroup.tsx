import type { TopicGroupData } from "@/lib/briefing";
import { BriefingCard } from "./BriefingCard";
import {
  Code2,
  Cpu,
  Building2,
  FlaskConical,
  Scale,
  GitBranch,
  Terminal,
} from "lucide-react";

const TOPIC_ICONS: Record<string, React.ElementType> = {
  "developer tools": Code2,
  "model releases": Cpu,
  "industry moves": Building2,
  "research & breakthroughs": FlaskConical,
  "ai regulation & policy": Scale,
  "open source": GitBranch,
  "ai coding tools": Terminal,
};

function TopicIcon({ topic }: { topic: string }) {
  const Icon = TOPIC_ICONS[topic.toLowerCase()] ?? Cpu;
  return (
    <Icon size={20} className="text-(--muted-foreground)" aria-hidden />
  );
}

export function TopicGroup({ group }: { group: TopicGroupData }) {
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
          <BriefingCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
