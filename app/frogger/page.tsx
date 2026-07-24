import type { Metadata } from "next";
import FroggerPlay from "./FroggerPlay";

export const metadata: Metadata = {
  title: "Play Frogger Online Free - Classic Frogger Browser Game | PlayMini",
  description:
    "Play Frogger online free! Hop across busy roads and rivers to reach home. Classic arcade game in your browser — no download, no sign-up. Desktop and mobile.",
  keywords: [
    "frogger online",
    "play frogger free",
    "frogger browser game",
    "frogger unblocked",
    "classic frogger game",
    "frogger no download",
    "arcade frogger online",
    "frog crossing game",
    "frogger mobile",
  ],
  alternates: { canonical: "/frogger" },
  openGraph: {
    title: "Play Frogger Online Free | PlayMini",
    description: "Hop across traffic and rivers to reach home. Classic Frogger in your browser.",
    type: "website",
    url: "https://playmini.fun/frogger",
  },
};

export default function FroggerPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Guide your frog across busy roads and treacherous rivers — reach all 5 home slots to win!
          </p>
        </div>
        <FroggerPlay />

        {/* WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Frogger",
              description:
                "Play Frogger online free — hop across busy roads and rivers to reach home in this classic arcade game.",
              url: "https://playmini.fun/frogger",
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
