import type { BriefingArticle } from "@/lib/briefing";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
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

function getTopicIcon(topic: string): React.ElementType {
  return TOPIC_ICONS[topic.toLowerCase()] ?? Cpu;
}

const TIER_LABELS: Record<string, string> = {
  critical: "Critical",
  important: "Important",
  notable: "Notable",
};

export function BriefingCard({ article }: { article: BriefingArticle }) {
  const Icon = getTopicIcon(article.parsedTopics[0] ?? "");

  return (
    <article>
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 hover:bg-[color-mix(in_srgb,var(--muted)_50%,transparent)] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)] focus-visible:outline-none"
      >
        <div className="flex gap-4">
          <div className="w-20 h-20 flex-shrink-0">
            {article.thumbnail ? (
              <img
                src={article.thumbnail}
                alt=""
                className="w-20 h-20 rounded-md object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-md bg-[var(--muted)] flex items-center justify-center">
                <Icon
                  size={32}
                  className="text-[var(--muted-foreground)]"
                  aria-hidden
                />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant={article.importanceTier}>
                {TIER_LABELS[article.importanceTier]}
              </Badge>
              <Badge variant="outline">{article.parsedTopics[0]}</Badge>
            </div>

            <h3 className="text-base font-semibold text-[var(--foreground)] line-clamp-2">
              {article.title}
            </h3>

            {article.summary && (
              <p className="mt-1 text-sm text-[var(--foreground)] leading-relaxed line-clamp-3">
                {article.summary}
              </p>
            )}

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-[var(--muted-foreground)]">
                {article.source.name}
                {article.publishedAt
                  ? `, ${formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}`
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </a>
    </article>
  );
}
