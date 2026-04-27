import Link from "next/link";
import MobileNav from "./MobileNav";

const navLinks = [
  { href: "/daily", label: "🔥 Daily" },
  { href: "/snake", label: "Snake" },
  { href: "/2048", label: "2048" },
  { href: "/chess", label: "Chess" },
  { href: "/minesweeper", label: "Minesweeper" },
  { href: "/wordle", label: "Word Guess" },
];

export default function SiteHeader() {
  return (
    <nav
      className="border-b border-line sticky top-0 z-50 backdrop-blur"
      style={{ background: "color-mix(in oklab, var(--paper) 88%, transparent)" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl text-ink"
          style={{ fontWeight: 700, letterSpacing: "-0.01em" }}
        >
          PlayMini
        </Link>
        <div className="hidden sm:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink-2 hover:text-ink transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/"
            className="text-sm font-medium transition-colors"
            style={{ color: "var(--accent)" }}
          >
            All Games
          </Link>
        </div>
        <MobileNav links={navLinks} />
      </div>
    </nav>
  );
}
