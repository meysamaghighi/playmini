import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-line mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-xs text-ink-3">
          Free browser games. No download, no sign-up required.
        </p>
        <div className="mt-3">
          <Link href="/about" className="text-sm text-ink-2 hover:text-ink underline">
            About
          </Link>
        </div>
        <div className="mt-6">
          <p className="text-xs text-ink-3 mb-2 font-mono uppercase tracking-wider">
            Sibling sites
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="https://doodlelab.fun"
              className="px-4 py-1.5 border border-line rounded-full text-sm text-ink hover:bg-paper-2 transition-colors"
            >
              DoodleLab · Drawing games
            </Link>
            <Link
              href="https://benchmybrain.com"
              className="px-4 py-1.5 border border-line rounded-full text-sm text-ink hover:bg-paper-2 transition-colors"
            >
              BenchMyBrain · Cognitive tests
            </Link>
          </div>
        </div>
        <p className="mt-6 text-xs text-ink-3 font-mono">© 2026 · made by Meysam</p>
      </div>
    </footer>
  );
}
