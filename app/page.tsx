import type { Metadata } from "next";
import { Hero } from "@/app/components/home/Hero";
import { FeatureCards } from "@/app/components/home/FeatureCards";

export const metadata: Metadata = {
  title: "agentstype.dev",
  description:
    "Watch real-time Claude Code sessions. See every file read, edit, and command as it happens.",
};

/**
 * Home page with hero section and feature highlights.
 * Entry point for site visitors.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-background pt-16">
      {/* Hero section */}
      <div className="max-w-6xl mx-auto">
        <Hero />
      </div>

      {/* Subtle divider */}
      <div className="border-t border-zinc-800/50" />

      {/* Feature cards section */}
      <FeatureCards />
    </main>
  );
}
