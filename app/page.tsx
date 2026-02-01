"use client";

import { Header } from "@/app/components/ui/Header";
import { EventFeed } from "@/app/components/feed/EventFeed";

/**
 * Main page composing Header and EventFeed.
 * Full-height layout with sticky header and scrollable feed.
 */
export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <main className="flex-1 overflow-hidden">
        <EventFeed />
      </main>
    </div>
  );
}
