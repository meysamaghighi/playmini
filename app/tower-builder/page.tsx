import type { Metadata } from "next";
import TowerBuilder from "../components/TowerBuilder";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Tower Builder - Free Stacking Game Online | PlayMini",
  description:
    "Build the tallest tower by stacking blocks perfectly! Free online tower building game. Drop blocks, align them perfectly, and challenge your precision. No download required.",
  keywords:
    "tower builder, stacking game, block stacking, tower game, precision game, free online game, casual game, mobile game, browser game",
  alternates: {
    canonical: "/tower-builder",
  },
  openGraph: {
    title: "Tower Builder - Free Stacking Game Online | PlayMini",
    description:
      "Build the tallest tower by stacking blocks perfectly! Drop blocks, align them perfectly, and challenge your precision.",
    url: "https://playmini.fun/tower-builder",
    siteName: "PlayMini",
    type: "website",
    images: [
      {
        url: "https://playmini.fun/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tower Builder Game",
      },
    ],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I play Tower Builder?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tap or click the canvas to drop the swinging block. Try to align it perfectly with the previous block. The overlapping area becomes the next block's width. Stack as many blocks as you can!",
      },
    },
    {
      "@type": "Question",
      name: "What happens if I drop a block perfectly?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If you drop a block very close to perfect alignment (within a few pixels), you'll see a 'Perfect!' message and the block will keep its full width instead of shrinking. This helps you build taller towers!",
      },
    },
    {
      "@type": "Question",
      name: "When does the game end?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The game ends when your block becomes too narrow (less than 10 pixels wide) or when you miss the previous block entirely. Your score is the number of blocks you successfully stacked.",
      },
    },
  ],
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Tower Builder",
  url: "https://playmini.fun/tower-builder",
  description:
    "Build the tallest tower by stacking blocks perfectly. Free online stacking game.",
  applicationCategory: "Game",
  genre: "Casual Game",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  browserRequirements: "Requires JavaScript. Works on all modern browsers.",
};

export default function TowerBuilderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Tower Builder
            </h1>
            <p className="text-xl text-gray-300">
              Stack blocks perfectly to build the tallest tower!
            </p>
          </header>

          <TowerBuilder />

          <section className="max-w-3xl mx-auto mt-12 space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">How to Play</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-200">
                <li>
                  A block swings back and forth at the top of the screen
                </li>
                <li>
                  Tap or click to drop the block onto the tower
                </li>
                <li>
                  The overlapping area becomes the next block&apos;s width
                </li>
                <li>
                  Perfect drops (very close alignment) keep the full width and show &quot;Perfect!&quot;
                </li>
                <li>
                  Stack as many blocks as you can before they become too narrow
                </li>
                <li>
                  The game gets faster every 5 blocks
                </li>
              </ol>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    How do I play Tower Builder?
                  </h3>
                  <p className="text-gray-200">
                    Tap or click the canvas to drop the swinging block. Try to
                    align it perfectly with the previous block. The overlapping
                    area becomes the next block&apos;s width. Stack as many blocks as
                    you can!
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    What happens if I drop a block perfectly?
                  </h3>
                  <p className="text-gray-200">
                    If you drop a block very close to perfect alignment (within
                    a few pixels), you&apos;ll see a &quot;Perfect!&quot; message and the block
                    will keep its full width instead of shrinking. This helps
                    you build taller towers!
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    When does the game end?
                  </h3>
                  <p className="text-gray-200">
                    The game ends when your block becomes too narrow (less than
                    10 pixels wide) or when you miss the previous block
                    entirely. Your score is the number of blocks you
                    successfully stacked.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">About Tower Builder</h2>
              <p className="text-gray-200 mb-4">
                Tower Builder is a precision-based stacking game where you build
                a tower by dropping blocks from a swinging crane. The challenge
                is to align each block as perfectly as possible with the one
                below it. Misaligned blocks get cut off, making each successive
                block narrower. Perfect drops reward you by keeping the full
                width, allowing you to build taller towers.
              </p>
              <p className="text-gray-200 mb-4">
                The game progressively gets faster every 5 blocks, testing your
                reaction time and precision. Your personal best is saved
                locally, so you can always try to beat your high score. The
                colorful blocks and smooth camera panning make for a satisfying
                gameplay experience.
              </p>
              <p className="text-gray-200">
                Tower Builder works on all devices with a modern web browser. No
                download or installation required. Play for free right in your
                browser!
              </p>
            </div>
          </section>

          <MoreGames />
        </div>
      </div>
    </>
  );
}
