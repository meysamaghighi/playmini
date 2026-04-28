import type { Metadata } from "next";
import CarRacerPlay from "./CarRacerPlay";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Car Racing Game Online Free - Dodge Traffic | PlayMini",
  description:
    "Play car racing game online free! Dodge traffic across three lanes, see how far you can go. Top-down arcade racing game in your browser, mobile-friendly.",
  keywords: [
    "car racing game online free",
    "car racing game",
    "play car game online",
    "browser car game",
    "car racer online",
    "free racing game",
    "online car game",
    "top-down racing",
    "arcade racing game",
    "car game unblocked",
  ],
  alternates: {
    canonical: "/car-racer",
  },
  openGraph: {
    title: "Car Racing Game Online Free - Dodge Traffic | PlayMini",
    description:
      "Play car racing game online free! Dodge traffic across three lanes, see how far you can go.",
    type: "website",
    url: "https://playmini.fun/car-racer",
  },
};

export default function CarRacerPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Switch lanes, dodge traffic, see how far you go.
          </p>
        </div>
        <CarRacerPlay />

        <section className="mt-12 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">How to Play</h2>
          <div className="space-y-4 text-ink-2">
            <div>
              <h3 className="font-semibold text-ink mb-2">Desktop:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Left/Right arrows (or A/D) to switch lanes</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Mobile:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>On-screen left/right buttons under the game</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-ink mb-2">Gameplay:</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Three lanes, oncoming traffic gets faster the longer you survive</li>
                <li>One crash ends the run — beat your best score</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-8 bg-paper-2 rounded-lg p-6 border border-line">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">About Car Racer</h2>
          <div className="text-ink-2 space-y-3">
            <p>
              Car Racer is a minimal top-down arcade driver. Three lanes, a stream of oncoming
              cars, and your reflexes. Simple to pick up, gets harder the further you drive.
            </p>
            <p>
              Your best score is saved locally in your browser so you can chase it across sessions.
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
                  name: "How do I control the car?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Use left/right arrow keys or A/D to switch lanes on desktop. On mobile, use the on-screen left/right buttons shown below the game.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does the game speed up?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. The scroll speed gradually increases with your score, giving you less time to react as the run goes on.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is my best score saved?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Your personal best is stored in your browser's local storage and shown on the game-over screen.",
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
              name: "Car Racer",
              description:
                "Play Car Racer free online — a minimal top-down driving arcade game. Three lanes, dodge oncoming traffic, beat your best score.",
              url: "https://playmini.fun/car-racer",
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
      </div>
    </main>
  );
}
