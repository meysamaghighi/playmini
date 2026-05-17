import type { Metadata } from "next";
import Link from "next/link";
import HomeHero from "./components/HomeHero";
import HomeGrid from "./components/HomeGrid";

export const metadata: Metadata = {
  title: "PlayMini - Free Browser Games | 2048, Snake, Minesweeper & More",
  description:
    "Free online mini games you can play instantly. 2048, Snake, Minesweeper, Memory Match, Whack-a-Mole, Tic-Tac-Toe and more. No download, no sign-up.",
  keywords: [
    "free online games",
    "browser games",
    "2048",
    "snake game",
    "minesweeper",
    "memory match",
    "whack a mole",
    "tic tac toe",
    "mini games",
    "no download games",
    "classic games",
    "sudoku",
    "voxel builder",
    "car racer",
    "tower builder",
    "soccer game",
    "penalty kicks",
    "pong game",
    "ping pong",
    "music trivia",
    "song quiz",
  ],
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-5 pb-12">
      <HomeHero />
      <HomeGrid />
      <div className="mt-8 text-center text-xs text-ink-3">
        <p>
          More games coming soon
          <Link href="/michael" aria-label="" className="text-ink-3 hover:text-ink-3 no-underline">!</Link>
        </p>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "PlayMini",
            url: "https://playmini.fun",
            description: "Free online mini games you can play instantly in your browser.",
          }),
        }}
      />
    </main>
  );
}
