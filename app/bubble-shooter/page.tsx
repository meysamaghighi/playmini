import type { Metadata } from "next";
import BubbleShooter from "../components/BubbleShooter";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Bubble Shooter Online Free - Match 3 Puzzle | PlayMini",
  description:
    "Play Bubble Shooter online free! Aim, shoot, and match 3 or more bubbles of the same color to pop them. Classic match-3 puzzle, works on mobile and desktop.",
  keywords: [
    "bubble shooter game free online",
    "bubble pop game",
    "bubble shooter online",
    "free bubble shooter",
    "bubble game online",
    "match 3 bubbles",
    "puzzle game online",
    "bubble shooter unblocked",
  ],
  alternates: {
    canonical: "/bubble-shooter",
  },
  openGraph: {
    title: "Play Bubble Shooter Online Free - Match 3 Puzzle | PlayMini",
    description:
      "Play Bubble Shooter online free! Aim, shoot, and match 3 or more bubbles of the same color to pop them.",
    type: "website",
    url: "https://playmini.fun/bubble-shooter",
  },
};

export default function BubbleShooterPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-ink mb-3">Bubble Shooter</h1>
        <p className="text-ink-2">Aim, shoot, match 3+ of the same color</p>
      </div>

      <BubbleShooter />

      <section className="mt-12 bg-paper-2 rounded-lg p-6 border border-line">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">How to Play</h2>
        <div className="space-y-4 text-ink-2">
          <div>
            <h3 className="font-semibold text-ink mb-2">Controls:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Desktop: move the mouse to aim, click to shoot</li>
              <li>Mobile: drag to aim, tap to shoot</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-ink mb-2">Goal:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Match 3 or more bubbles of the same color to pop them</li>
              <li>Bubbles that lose their connection to the top row fall for bonus points</li>
              <li>Clear the whole board to win — don't let bubbles cross the danger line</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-ink mb-2">Tips:</h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Bounce shots off the side walls to reach awkward gaps</li>
              <li>Chain clusters — dropping bubbles by cutting their anchor is the big points move</li>
              <li>Use the &ldquo;Next&rdquo; preview to plan two shots ahead</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-8 bg-paper-2 rounded-lg p-6 border border-line">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">About Bubble Shooter</h2>
        <div className="text-ink-2 space-y-3">
          <p>
            Bubble Shooter is a classic match-3 puzzle: aim the bubble at the bottom, shoot it into
            the pack, and pop groups of the same color. Easy to pick up, satisfying to chain.
          </p>
          <p>
            This version is pure, no-frills bubble popping — clear the board before bubbles reach
            the danger line. Your best score is saved in your browser.
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How do I aim in Bubble Shooter?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "On desktop, move your mouse to aim and click to shoot. On mobile, drag to aim and tap to shoot. A dotted line shows the path your bubble will take.",
                },
              },
              {
                "@type": "Question",
                name: "What happens when I match 3 bubbles?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "When you form a group of 3 or more bubbles of the same color, they pop and disappear. Any bubbles that lose their connection to the top also fall, giving bonus points.",
                },
              },
              {
                "@type": "Question",
                name: "How do I win?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Clear every bubble from the board. If bubbles reach the danger line near the bottom, the game ends.",
                },
              },
              {
                "@type": "Question",
                name: "Is my score saved?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Your best score is saved in your browser's local storage and shown during play.",
                },
              },
            ],
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Bubble Shooter Game",
            description:
              "Free online Bubble Shooter puzzle. Match 3+ bubbles of the same color to pop them and clear the board.",
            url: "https://playmini.fun/bubble-shooter",
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

      <MoreGames />
    </main>
  );
}
