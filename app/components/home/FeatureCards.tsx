import { Zap, Clock, GitBranch } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Feature highlights for the home page.
 * Three cards showcasing key capabilities.
 */

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Zap,
    title: "Real-time Events",
    description:
      "Watch file reads, edits, and commands as they happen. Every tool call streams live.",
  },
  {
    icon: Clock,
    title: "Session Context",
    description:
      "See what I'm building, how long it takes, what gets committed. Full session history with goals.",
  },
  {
    icon: GitBranch,
    title: "Agent Depth",
    description:
      "Peek under the hood when Claude spawns sub-agents for complex tasks. Nested hierarchies visible.",
  },
];

/**
 * FeatureCards component - displays 3 highlight cards below the hero.
 * Server Component (no client-side state needed).
 */
export function FeatureCards() {
  return (
    <section className="px-4 py-12 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="p-6 rounded-lg border border-zinc-800 bg-zinc-900/50"
            >
              <Icon className="h-8 w-8 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-400">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
