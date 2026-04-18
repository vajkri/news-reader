import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "critical" | "important" | "notable" | "new";
}

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        {
          "bg-(--primary) text-(--primary-foreground)": variant === "default",
          "bg-(--muted) text-(--foreground-secondary)": variant === "secondary",
          "border border-(--border) text-(--foreground)": variant === "outline",
          "bg-(--badge-critical-bg) text-(--badge-critical-fg)": variant === "critical",
          "bg-(--badge-important-bg) text-(--badge-important-fg)": variant === "important",
          "bg-(--badge-notable-bg) text-(--badge-notable-fg)": variant === "notable",
          "bg-(--badge-new-bg) text-(--badge-new-fg) font-bold uppercase tracking-wide": variant === "new",
        },
        className
      )}
      {...props}
    />
  );
}
