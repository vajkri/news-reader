'use client';

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { href: string; label: string }[];
  pathname: string;
}

export function HamburgerMenu({
  isOpen,
  onClose,
  navItems,
  pathname,
}: HamburgerMenuProps): React.ReactElement {
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return <></>;

  const content = (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className={`fixed top-0 left-0 h-dvh w-72 z-50 bg-(--card) border-r border-(--border) shadow-2xl transform transition-transform duration-200 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Button
          ref={closeButtonRef}
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close navigation"
          className="absolute top-3 right-3"
        >
          <X size={18} />
        </Button>
        <nav className="flex flex-col gap-1 p-4 pt-14">
          {navItems.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={`py-3 px-4 text-base font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-(--muted) text-(--foreground)"
                    : "text-(--muted-foreground) hover:bg-(--muted) hover:text-(--foreground)"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );

  if (typeof document === "undefined") return content;
  return createPortal(content, document.body);
}
