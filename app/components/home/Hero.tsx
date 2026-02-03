"use client";

import Link from "next/link";
import { Radio } from "lucide-react";
import { TerminalMockup } from "@/app/components/ui/TerminalMockup";
import { LivePreview } from "./LivePreview";

/**
 * Hero section for the home page.
 * Split layout with tagline/CTA on left, terminal preview on right.
 * Responsive: terminal appears above text on mobile.
 */
export function Hero() {
  return (
    <section className="px-4 py-8 lg:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left column - text content */}
        <div className="order-2 lg:order-1">
          {/* Tagline */}
          <h1 className="text-4xl lg:text-5xl font-bold text-zinc-100">
            Watch Code Come Alive
          </h1>

          {/* Subheader */}
          <p className="text-lg text-zinc-400 mt-4">
            Real-time streaming of Claude Code sessions. See every file read,
            edit, and command as it happens — with full context of what&apos;s
            being built.
          </p>

          {/* Bio intro */}
          <p className="text-sm text-zinc-500 mt-6">
            I&apos;m Alex, a developer exploring the intersection of AI and
            software creation. This site streams my actual coding sessions with
            Claude, giving you a live window into AI-assisted development.
          </p>

          {/* CTA button */}
          <Link
            href="/live"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-colors mt-8"
          >
            <Radio size={18} />
            Enter the Stream
          </Link>
        </div>

        {/* Right column - terminal preview */}
        <div className="order-1 lg:order-2">
          <TerminalMockup title="agentstype.dev">
            <LivePreview />
          </TerminalMockup>
        </div>
      </div>
    </section>
  );
}
