import Link from "next/link";
import MobileNav from "./MobileNav";
import CommandPalette from "./CommandPalette";

const navLinks = [
  { href: "/daily", label: "Daily" },
  { href: "/", label: "Browse" },
  { href: "/random-game", label: "Random" },
];

export default function SiteHeader() {
  return (
    <nav
      className="border-b border-line sticky top-0 z-50 backdrop-blur"
      style={{ background: "color-mix(in oklab, var(--paper) 88%, transparent)" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-xl text-ink flex-shrink-0"
          style={{ fontWeight: 700, letterSpacing: "-0.01em" }}
        >
          playmini
        </Link>

        <div className="hidden sm:flex items-center gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-2 hover:text-ink transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <CommandPalette />
          <MobileNav links={navLinks} />
        </div>
      </div>
    </nav>
  );
}
