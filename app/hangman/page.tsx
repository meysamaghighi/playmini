import type { Metadata } from "next";
import HangmanPlay from "./HangmanPlay";

export const metadata: Metadata = {
  title: "Hangman Game Online Free - Classic Word Puzzle | PlayMini",
  description:
    "Play Hangman game online free! Guess the word letter by letter, 200+ words across 10 categories. Classic word guessing game in your browser, no download needed, mobile-friendly.",
  keywords: [
    "hangman game online free",
    "hangman game",
    "play hangman online",
    "hangman online",
    "free hangman game",
    "word guessing game",
    "hangman word game",
    "online hangman unblocked",
    "hangman online free no download",
  ],
  alternates: {
    canonical: "/hangman",
  },
  openGraph: {
    title: "Hangman Game Online Free - Classic Word Puzzle | PlayMini",
    description:
      "Play Hangman game online free! Guess the word letter by letter, 200+ words across 10 categories. Classic word guessing game in your browser, no download needed.",
    type: "website",
    url: "https://playmini.fun/hangman",
  },
};

export default function HangmanPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Guess the word one letter at a time. 200+ words, 10 categories, 6 lives!
          </p>
        </div>

        {/* Game */}
        <HangmanPlay />

        {/* WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Hangman",
              description:
                "Play Hangman free online with 200+ words across 10 categories. Guess the word before running out of chances.",
              url: "https://playmini.fun/hangman",
              applicationCategory: "Game",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              browserRequirements: "Requires JavaScript. Works on all modern browsers.",
            }),
          }}
        />
      </div>
    </main>
  );
}
