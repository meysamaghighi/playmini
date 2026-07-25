import type { Metadata } from "next";
import AsteroidsPlay from "./AsteroidsPlay";

export const metadata: Metadata = {
  title: "Play Asteroids Online Free - Classic Arcade Browser Game | PlayMini",
  description:
    "Play Asteroids online free! Shoot asteroids, dodge debris, survive wave after wave. Classic arcade shooter in your browser — no download, no sign-up.",
  keywords: [
    "asteroids online",
    "play asteroids free",
    "asteroids browser game",
    "asteroids unblocked",
    "classic asteroids game",
    "asteroids no download",
    "space shooter browser",
    "retro arcade game online",
    "asteroids arcade",
    "asteroid shooter game",
  ],
  alternates: { canonical: "/asteroids" },
  openGraph: {
    title: "Play Asteroids Online Free | PlayMini",
    description: "Classic Asteroids in your browser — rotate, thrust, shoot. No download needed.",
    type: "website",
    url: "https://playmini.fun/asteroids",
  },
};

export default function AsteroidsPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Destroy all asteroids to advance — but watch out, they split into smaller, faster pieces!
          </p>
        </div>
        <AsteroidsPlay />

        {/* WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Asteroids",
              description:
                "Play Asteroids online free — shoot asteroids, dodge debris, and survive wave after wave in this classic arcade shooter.",
              url: "https://playmini.fun/asteroids",
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
