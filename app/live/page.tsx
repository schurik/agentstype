import { Suspense } from "react";
import { LiveFeedContent } from "./LiveFeedContent";

/**
 * Loading skeleton for the live page while content loads.
 */
function LivePageSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar skeleton */}
      <aside className="w-48 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="px-3 py-3 border-b border-zinc-800">
          <div className="h-4 w-16 bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="flex-1 p-2 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-9 bg-zinc-800 rounded animate-pulse" />
          ))}
        </div>
      </aside>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-20 bg-zinc-950 border-b border-zinc-800 px-4 py-3">
          <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
        </header>
        <main className="flex-1 overflow-hidden px-4 py-2 space-y-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="border-l-4 border-l-zinc-700 bg-zinc-900/50 px-3 py-2 animate-pulse"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-20 bg-zinc-800 rounded" />
                <div className="h-3 w-16 bg-zinc-800 rounded" />
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}

/**
 * Live feed page with project sidebar and event feed.
 *
 * Wrapped in Suspense to handle useSearchParams() during SSR.
 */
export default function LivePage() {
  return (
    <Suspense fallback={<LivePageSkeleton />}>
      <LiveFeedContent />
    </Suspense>
  );
}
