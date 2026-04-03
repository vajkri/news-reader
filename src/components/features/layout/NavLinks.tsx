'use client';

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HamburgerMenu } from "./HamburgerMenu";

const NAV_ITEMS = [
  { href: "/", label: "Feed" },
  { href: "/briefing", label: "Briefing" },
  { href: "/sources", label: "Sources" },
];

export function NavLinks(): React.ReactElement {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <nav aria-label="Main navigation" className="hidden sm:flex items-center gap-4">
        {NAV_ITEMS.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "text-sm font-semibold text-(--foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) rounded-sm"
                  : "text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary) rounded-sm"
              }
            >
              {label}
            </Link>
          );
        })}
      </nav>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </Button>
      <HamburgerMenu
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        navItems={NAV_ITEMS}
        pathname={pathname}
      />
    </>
  );
}
