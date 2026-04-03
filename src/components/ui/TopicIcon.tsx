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

export function TopicIcon({ topic, size = 16 }: TopicIconProps): React.ReactElement {
  const Icon = TOPIC_ICON_MAP[topic.toLowerCase()] ?? Cpu;
  return (
    <div className="h-10 w-10 flex items-center justify-center rounded bg-(--muted) shrink-0">
      <Icon size={size} className="text-(--muted-foreground)" aria-hidden />
    </div>
  );
}
