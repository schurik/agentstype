import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | agentstype.dev",
  description: "Learn more about agentstype.dev and the developer behind it",
};

/**
 * Placeholder About page for navigation testing.
 * Full implementation will be built in Plan 05-03.
 */
export default function AboutPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">About</h1>
        <p className="text-zinc-500">Coming soon</p>
      </div>
    </main>
  );
}
