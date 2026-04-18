import * as React from "react";
import {
  Code2,
  Cpu,
  Building2,
  FlaskConical,
  Scale,
  GitBranch,
  Terminal,
} from "lucide-react";

export const TOPIC_ICON_MAP: Record<string, React.ElementType> = {
  "developer tools": Code2,
  "model releases": Cpu,
  "industry moves": Building2,
  "research & breakthroughs": FlaskConical,
  "ai regulation & policy": Scale,
  "open source": GitBranch,
  "ai coding tools": Terminal,
};

interface TopicIconProps {
  topic: string;
  size?: number;
}

const TOPIC_COLOR_MAP: Record<string, string> = {
  "developer tools": "text-blue-600 dark:text-blue-400",
  "model releases": "text-violet-600 dark:text-violet-400",
  "industry moves": "text-amber-600 dark:text-amber-400",
  "research & breakthroughs": "text-emerald-600 dark:text-emerald-400",
  "ai regulation & policy": "text-rose-600 dark:text-rose-400",
  "open source": "text-sky-600 dark:text-sky-400",
  "ai coding tools": "text-indigo-600 dark:text-indigo-400",
};

export function TopicIcon({ topic, size = 16 }: TopicIconProps): React.ReactElement {
  const Icon = TOPIC_ICON_MAP[topic.toLowerCase()] ?? Cpu;
  const color = TOPIC_COLOR_MAP[topic.toLowerCase()] ?? "text-(--muted-foreground)";
  return (
    <div className="h-10 w-10 flex items-center justify-center rounded bg-white dark:bg-(--muted) border border-(--border) shrink-0">
      <Icon size={size} className={color} aria-hidden />
    </div>
  );
}
