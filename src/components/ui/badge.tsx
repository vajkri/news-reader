import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "critical" | "important" | "notable";
}

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        {
          "bg-[var(--primary)] text-[var(--primary-foreground)]": variant === "default",
          "bg-[var(--muted)] text-[var(--muted-foreground)]": variant === "secondary",
          "border border-[var(--border)] text-[var(--foreground)]": variant === "outline",
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300": variant === "critical",
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300": variant === "important",
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300": variant === "notable",
        },
        className
      )}
      {...props}
    />
  );
}
