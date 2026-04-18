import * as React from "react";

/** Brand-inspired colors for known sources. Intentionally distinct from TopicIcon's category palette. */
const SOURCE_COLORS: Record<string, string> = {
  "hacker news": "text-orange-500 dark:text-orange-400",
  "techcrunch ai": "text-green-600 dark:text-green-400",
  "smashing magazine": "text-red-500 dark:text-red-400",
  "tldr tech": "text-slate-600 dark:text-slate-400",
  "tldr ai": "text-cyan-600 dark:text-cyan-400",
  "tldr design": "text-pink-500 dark:text-pink-400",
  "openai news": "text-gray-700 dark:text-gray-300",
  "anthropic news": "text-orange-700 dark:text-orange-300",
  "claude blog": "text-orange-700 dark:text-orange-300",
};

/** Fallback palette for unknown sources; warm/neutral tones that don't clash with topic-icon colors. */
const FALLBACK_COLORS = [
  "text-stone-600 dark:text-stone-400",
  "text-zinc-600 dark:text-zinc-400",
  "text-orange-600 dark:text-orange-400",
  "text-teal-600 dark:text-teal-400",
  "text-cyan-700 dark:text-cyan-400",
  "text-fuchsia-600 dark:text-fuchsia-400",
] as const;

function getInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

interface SourceAvatarProps {
  sourceName: string;
  size?: "sm" | "md";
}

export function SourceAvatar({ sourceName, size = "md" }: SourceAvatarProps): React.ReactElement {
  const key = sourceName.toLowerCase();
  const hash = sourceName.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const textColor = SOURCE_COLORS[key] ?? FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  return (
    <div
      className={`${sizeClass} rounded flex items-center justify-center shrink-0 bg-white dark:bg-(--muted) border border-(--border)`}
    >
      <span className={`${textColor} font-semibold leading-none`}>
        {getInitials(sourceName)}
      </span>
    </div>
  );
}
