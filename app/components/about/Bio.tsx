import Image from "next/image";

interface BioProps {
  className?: string;
}

/**
 * Bio section with photo/avatar and long-form text.
 * Server Component.
 *
 * Replace PLACEHOLDER content with:
 * - Avatar image: add /public/avatar.jpg (or .png) and uncomment Image
 * - Bio text: personalize with your journey, philosophy, what drives you
 */
export function Bio({ className }: BioProps) {
  // Set to true when you add an avatar image to /public/avatar.jpg
  const hasAvatar = false;

  return (
    <div className={`flex flex-col md:flex-row gap-8 items-start ${className ?? ""}`}>
      {/* Avatar section */}
      <div className="flex-shrink-0">
        {hasAvatar ? (
          <Image
            src="/avatar.jpg"
            alt="Profile photo"
            width={128}
            height={128}
            className="rounded-full border-2 border-zinc-700 w-32 h-32 object-cover"
            priority
          />
        ) : (
          <div
            className="rounded-full bg-zinc-800 border-2 border-zinc-700 w-32 h-32 flex items-center justify-center text-zinc-600"
            aria-label="Avatar placeholder"
          >
            <span className="text-3xl">?</span>
          </div>
        )}
      </div>

      {/* Text section */}
      <div className="flex-1 max-w-prose">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">
          [Your Name Here]
        </h2>

        <div className="space-y-4 text-zinc-400 leading-relaxed">
          <p>
            [PLACEHOLDER: Introduce yourself. What&apos;s your background? How did you get into
            software development? What drew you to building with AI?]
          </p>

          <p>
            [PLACEHOLDER: What&apos;s your philosophy? What excites you about working
            transparently in the open? Why build agentstype.dev and stream your
            work publicly?]
          </p>

          <p>
            [PLACEHOLDER: What drives you day to day? What are you currently
            focused on? What do you hope visitors take away from watching your
            live coding sessions?]
          </p>
        </div>
      </div>
    </div>
  );
}
