import type { Metadata } from "next";
import { Bio } from "@/app/components/about/Bio";
import { SocialLinks } from "@/app/components/about/SocialLinks";

export const metadata: Metadata = {
  title: "About | agentstype.dev",
  description:
    "Learn about the developer behind agentstype.dev - building in public with AI-assisted coding",
};

/**
 * About page with full bio, photo/avatar, and social links.
 * Server Component.
 *
 * Layout:
 * - Desktop: Two-column grid with bio on left, social links in sticky sidebar on right
 * - Mobile: Single column with social links below bio
 */
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-zinc-100 mb-8">About</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-8">
          {/* Main content: Bio */}
          <Bio />

          {/* Sidebar: Social links */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
              Connect
            </h2>
            <SocialLinks />
          </aside>
        </div>
      </div>
    </main>
  );
}
