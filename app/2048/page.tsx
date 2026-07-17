import { Metadata } from "next";
import Game2048Play from "./2048Play";

export const metadata: Metadata = {
  title: "2048 Game Online Free - Classic Puzzle Game | PlayMini",
  description:
    "Play 2048 game online free! Slide and merge numbered tiles to reach 2048. Addictive puzzle game, no download, works on mobile and desktop. Beat your high score!",
  keywords: [
    "play 2048 online free",
    "2048 game online",
    "2048 puzzle game",
    "2048 game free",
    "2048 browser game",
    "how to win 2048",
    "2048 strategy",
    "2048 online no download",
    "2048 unblocked",
    "merge puzzle game",
    "sliding tile puzzle",
    "number puzzle game",
  ],
  alternates: {
    canonical: "/2048",
  },
  openGraph: {
    title: "2048 Game Online Free - Classic Puzzle Game | PlayMini",
    description:
      "Play 2048 game online free! Slide and merge numbered tiles to reach 2048. Addictive puzzle game, no download, works on mobile and desktop.",
    type: "website",
    url: "https://playmini.fun/2048",
  },
};

export default function Page2048() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "2048 Game",
            url: "https://playmini.fun/2048",
            applicationCategory: "Game",
            genre: "Puzzle",
            description:
              "Play the addictive 2048 puzzle game online for free. Combine numbered tiles to reach 2048.",
            browserRequirements: "Requires JavaScript. Works on mobile and desktop browsers.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />

      <div className="min-h-screen bg-paper text-ink py-8 px-4">
        <div className="max-w-4xl mx-auto">
        <Game2048Play />
        </div>
      </div>
    </>
  );
}
