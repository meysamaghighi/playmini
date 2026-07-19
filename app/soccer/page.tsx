import type { Metadata } from "next";
import SoccerPlay from "./SoccerPlay";

export const metadata: Metadata = {
  title: "Play Penalty Kicks Online Free - Soccer Game | PlayMini",
  description:
    "Play Penalty Kicks online free! Aim your shot, beat the goalkeeper, score goals. 10 rounds of soccer action. Browser game, works on mobile and desktop.",
  keywords:
    "penalty kicks, soccer game, football game, free soccer game, online soccer, penalty shootout, browser game",
  alternates: {
    canonical: "/soccer",
  },
  openGraph: {
    title: "Play Penalty Kicks Online Free - Soccer Game | PlayMini",
    description:
      "Play Penalty Kicks online free! Aim your shot, beat the goalkeeper, score goals. 10 rounds of soccer action. Browser game, works on mobile and desktop.",
    type: "website",
    url: "https://playmini.fun/soccer",
  },
};

export default function SoccerPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Aim carefully and blast it past the keeper! Score as many goals as you can in 10 rounds.
          </p>
        </div>
        <SoccerPlay />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Penalty Kicks",
              description:
                "Free online penalty kick game. Aim, shoot, and beat the goalkeeper.",
              url: "https://playmini.fun/soccer",
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
