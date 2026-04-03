import * as React from "react";

const PALETTE = [
  "bg-blue-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-amber-600",
  "bg-rose-600",
  "bg-sky-600",
] as const;

interface SourceAvatarProps {
  sourceName: string;
  size?: "sm" | "md";
}

export function SourceAvatar({ sourceName, size = "md" }: SourceAvatarProps): React.ReactElement {
  const hash = sourceName.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const bg = PALETTE[hash % PALETTE.length];
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  return (
    <div
      className={`${bg} ${sizeClass} rounded flex items-center justify-center shrink-0`}
    >
      <span className="text-white font-semibold">
        {sourceName[0]?.toUpperCase() ?? "?"}
      </span>
    </div>
  );
}
