"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg" | "icon" | "vote";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            "bg-(--primary) text-(--primary-foreground) hover:bg-[color-mix(in_srgb,var(--primary)_90%,transparent)]":
              variant === "default",
            "border border-(--border) bg-transparent hover:bg-(--accent)":
              variant === "outline",
            "hover:bg-(--accent) bg-transparent": variant === "ghost",
            "bg-red-500 text-white hover:bg-red-600": variant === "destructive",
          },
          {
            "h-9 px-4 py-2 text-sm": size === "default",
            "h-7 px-2.5 text-xs": size === "sm",
            "h-11 px-8": size === "lg",
            "h-8 w-8 p-0": size === "icon",
            "h-7 w-7 p-0": size === "vote",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
