"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Radio, User } from "lucide-react";

/**
 * Navigation items for site-wide navigation.
 */
const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/live", label: "Live", icon: Radio },
  { href: "/about", label: "About", icon: User },
] as const;

/**
 * Check if a navigation item is currently active.
 * Exact match for home ("/"), prefix match for other routes.
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

/**
 * Site-wide navigation component.
 *
 * - Desktop: Sticky header with logo and nav links
 * - Mobile: Fixed bottom tab bar with icons
 */
export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Header Navigation */}
      <header className="hidden md:flex sticky top-0 z-50 h-16 items-center justify-between px-6 border-b border-zinc-800 bg-zinc-950">
        {/* Logo / Site Name */}
        <Link
          href="/"
          className="text-lg font-bold text-zinc-100 hover:text-white transition-colors"
        >
          agentstype.dev
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-6">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  active
                    ? "text-zinc-100"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 items-center justify-around border-t border-zinc-800 bg-zinc-950 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 px-4 transition-colors ${
                active ? "text-zinc-100" : "text-zinc-500"
              }`}
            >
              <Icon size={24} />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
