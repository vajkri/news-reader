import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
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
        },
        className
      )}
      {...props}
    />
  );
}
