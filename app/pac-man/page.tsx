import type { Metadata } from "next";
import PacManPlay from "./PacManPlay";

export const metadata: Metadata = {
  title: "Play Pac-Man Online Free - Browser Pac-Man | PlayMini",
  description:
    "Play Pac-Man online free! Classic maze game in your browser — eat dots, dodge ghosts, grab power pellets. No download, no sign-up. Desktop and mobile.",
  keywords: [
    "pac-man online",
    "play pac-man free",
    "pac man browser game",
    "pac-man no download",
    "pac man classic game",
    "pac-man unblocked",
    "free pac-man online",
    "arcade game browser",
    "pac man maze game",
    "pac-man mobile",
  ],
  alternates: { canonical: "/pac-man" },
  openGraph: {
    title: "Play Pac-Man Online Free | PlayMini",
    description: "Classic Pac-Man in your browser. Eat dots, dodge ghosts, grab power pellets.",
    type: "website",
    url: "https://playmini.fun/pac-man",
  },
};

export default function PacManPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Eat all the dots, avoid the ghosts, and grab power pellets to turn the tables!
          </p>
        </div>
        <PacManPlay />

        {/* WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Pac-Man",
              description:
                "Play Pac-Man online free — eat dots, dodge ghosts, and grab power pellets in this classic maze game.",
              url: "https://playmini.fun/pac-man",
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
