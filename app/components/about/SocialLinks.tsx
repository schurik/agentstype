import { Github, Twitter } from "lucide-react";

interface SocialLinksProps {
  className?: string;
}

const links = [
  {
    href: "https://github.com/PLACEHOLDER",
    icon: Github,
    label: "GitHub",
  },
  {
    href: "https://x.com/PLACEHOLDER",
    icon: Twitter,
    label: "X / Twitter",
  },
];

/**
 * Social media links component.
 * Server Component - pure links, no state.
 * Replace PLACEHOLDER URLs with real values.
 */
export function SocialLinks({ className }: SocialLinksProps) {
  return (
    <nav className={className} aria-label="Social links">
      <ul className="flex flex-col gap-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{link.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
