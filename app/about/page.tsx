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
      <h1 className="text-3xl font-black mb-6">About PlayMini</h1>

      <section className="mb-8">
        <p className="text-gray-300 mb-4">
          PlayMini is a free collection of 31 browser games spanning arcade,
          puzzle, word, strategy, sports, and creative genres. Every game is
          custom-built from scratch -- no embedded iframes or third-party
          content.
        </p>
        <p className="text-gray-300">
          All games run directly in your browser. No downloads, no accounts, no
          personal data collected.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Built by MeyDev</h2>
        <p className="text-gray-300 mb-2">
          PlayMini is built and maintained by an independent developer focused
          on creating simple, fun games that respect your privacy.
        </p>
        <p className="text-gray-300">
          Questions or feedback?{" "}
          <a
            href="mailto:meydev.studio@gmail.com"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            meydev.studio@gmail.com
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Privacy & Data</h2>
        <ul className="space-y-2 text-gray-300">
          <li className="flex gap-2">
            <span className="text-green-400 font-bold">•</span>
            <span>
              <strong>No accounts:</strong> Play instantly without signing up.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400 font-bold">•</span>
            <span>
              <strong>No personal data:</strong> We don't collect names, emails,
              or any identifying information.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400 font-bold">•</span>
            <span>
              <strong>Local scores:</strong> High scores are saved in your
              browser's localStorage only. They never leave your device.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400 font-bold">•</span>
            <span>
              <strong>Analytics:</strong> We use Google Analytics for anonymous
              usage statistics (page views, game plays). No tracking cookies
              beyond that.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-green-400 font-bold">•</span>
            <span>
              <strong>Ads:</strong> We may display non-intrusive ads via Google
              AdSense to support the site. No popups or interstitials.
            </span>
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">More Projects</h2>
        <p className="text-gray-300 mb-4">
          Check out our other free tools and games:
        </p>
        <ul className="space-y-2">
          <li>
            <Link
              href="https://cashcalcs.com"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              CashCalcs
            </Link>
            <span className="text-gray-400"> - Financial calculators & guides</span>
          </li>
          <li>
            <Link
              href="https://benchmybrain.com"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              BenchMyBrain
            </Link>
            <span className="text-gray-400"> - Cognitive & speed tests</span>
          </li>
          <li>
            <Link
              href="https://doodlelab.fun"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              DoodleLab
            </Link>
            <span className="text-gray-400"> - Drawing & creative games</span>
          </li>
        </ul>
      </section>

      <div className="mt-12 pt-8 border-t border-gray-800">
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
        >
          Back to Games
        </Link>
      </div>
    </main>
  );
}
