import type { Metadata } from "next";
import SpaceInvadersPlay from "./SpaceInvadersPlay";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Space Invaders Online Free - 10 Levels & Power-Ups | PlayMini",
  description:
    "Play Space Invaders online free! 10 levels + endless mode, 3 enemy types, power-ups (shield, rapid fire, spread shot). Classic arcade shooter in your browser. No download needed.",
  keywords: [
    "play space invaders online free",
    "space invaders online",
    "space invaders free",
    "classic space invaders game",
    "space invaders browser game",
    "retro arcade games online",
    "space invaders no download",
    "arcade shooter game",
    "space invaders levels",
    "alien shooter game",
    "classic arcade game online",
    "space shooter game free",
  ],
  alternates: {
    canonical: "/space-invaders",
  },
  openGraph: {
    title: "Play Space Invaders Online Free - 10 Levels & Power-Ups | PlayMini",
    description:
      "Play Space Invaders online free! 10 levels, 3 enemy types, power-ups. Classic arcade shooter in your browser.",
    type: "website",
    url: "https://playmini.fun/space-invaders",
  },
};

export default function SpaceInvadersPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <p className="text-ink-2">10 levels, 3 enemy types, power-ups -- defend Earth!</p>
      </div>
        <SpaceInvadersPlay />

      {/* WebApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Space Invaders Game",
            description:
              "Free online Space Invaders arcade game. Defend Earth from alien invaders!",
            url: "https://playmini.fun/space-invaders",
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
