import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About PlayMini - Free Browser Games",
  description:
    "Learn about PlayMini, a collection of 31 free browser games. Custom-built games with no downloads, no accounts, and no tracking.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About PlayMini",
    description:
      "31 custom-built browser games. Free to play, no downloads or sign-ups required.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1
        className="font-display text-5xl md:text-6xl mb-6 text-ink"
        style={{ fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1 }}
      >
        About PlayMini
      </h1>

      <section className="mb-8">
        <p className="text-ink-2 mb-4">
          PlayMini is a free collection of 31 browser games spanning arcade,
          puzzle, word, strategy, sports, and creative genres. Every game is
          custom-built from scratch &mdash; no embedded iframes or third-party
          content.
        </p>
        <p className="text-ink-2">
          All games run directly in your browser. No downloads, no accounts, no
          personal data collected (opt-in leaderboard submissions are the one
          exception).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-ink mb-3">Built by MeyDev</h2>
        <p className="text-ink-2 mb-2">
          PlayMini is built and maintained by an independent developer focused
          on creating simple, fun games that respect your privacy.
        </p>
        <p className="text-ink-2">
          Questions or feedback?{" "}
          <a
            href="mailto:meydev.studio@gmail.com"
            className="underline hover:opacity-80"
            style={{ color: "var(--accent)" }}
          >
            meydev.studio@gmail.com
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-ink mb-3">Privacy &amp; Data</h2>
        <ul className="space-y-2 text-ink-2">
          <li className="flex gap-2">
            <span className="font-bold" style={{ color: "var(--accent)" }}>•</span>
            <span>
              <strong className="text-ink">No accounts:</strong> Play instantly without signing up.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold" style={{ color: "var(--accent)" }}>•</span>
            <span>
              <strong className="text-ink">No personal data:</strong> We don&apos;t collect names, emails, or any identifying information.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold" style={{ color: "var(--accent)" }}>•</span>
            <span>
              <strong className="text-ink">Local scores:</strong> High scores are saved in your browser&apos;s localStorage only. They never leave your device (opt-in leaderboard submissions are the one exception).
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold" style={{ color: "var(--accent)" }}>•</span>
            <span>
              <strong className="text-ink">Leaderboards:</strong> If you choose to submit a score, we store your chosen nickname, the score, and a two-letter country code derived from your IP address at submit time (the IP itself is never stored). Nickname, country flag, and score are shown publicly on that leaderboard.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold" style={{ color: "var(--accent)" }}>•</span>
            <span>
              <strong className="text-ink">Analytics:</strong> We use Google Analytics for anonymous usage statistics (page views, game plays). No tracking cookies beyond that.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold" style={{ color: "var(--accent)" }}>•</span>
            <span>
              <strong className="text-ink">Ads:</strong> We may display non-intrusive ads via Google AdSense to support the site. No popups or interstitials.
            </span>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-ink mb-3">Sibling sites</h2>
        <p className="text-ink-2 mb-4">Free tools and games from the same shop:</p>
        <ul className="space-y-2">
          <li>
            <Link
              href="https://benchmybrain.com"
              className="underline hover:opacity-80"
              style={{ color: "var(--accent)" }}
            >
              BenchMyBrain
            </Link>
            <span className="text-ink-2"> &mdash; cognitive &amp; speed tests</span>
          </li>
          <li>
            <Link
              href="https://doodlelab.fun"
              className="underline hover:opacity-80"
              style={{ color: "var(--accent)" }}
            >
              DoodleLab
            </Link>
            <span className="text-ink-2"> &mdash; drawing &amp; creative games</span>
          </li>
        </ul>
      </section>

      <div className="mt-12 pt-8 border-t border-line">
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full font-bold text-paper transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          Back to games
        </Link>
      </div>
    </main>
  );
}
