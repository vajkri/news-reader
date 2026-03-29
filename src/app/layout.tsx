import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { ChatWrapper } from "@/components/features/chat";
import { DebugProvider } from "@/contexts/debug";
import { DebugToggle } from "@/components/features/debug";
import "./globals.css";

const geistSans = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "News Reader",
  description: "Personal RSS news tracker",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <DebugProvider>
          <header className="sticky top-0 z-10 border-b border-(--border) bg-[color-mix(in_srgb,var(--background)_95%,transparent)] backdrop-blur">
            <div className="section-container h-12 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <span className="font-semibold text-sm tracking-tight">News Reader</span>
                <nav aria-label="Main navigation" className="flex items-center gap-4">
                  <Link
                    href="/"
                    className="text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                  >
                    Feed
                  </Link>
                  <Link
                    href="/briefing"
                    className="text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                  >
                    Briefing
                  </Link>
                  <Link
                    href="/sources"
                    className="text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors"
                  >
                    Sources
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          <div className="app-content">
            <main>{children}</main>
            <ChatWrapper />
          </div>
          <DebugToggle />
        </DebugProvider>
      </body>
    </html>
  );
}
