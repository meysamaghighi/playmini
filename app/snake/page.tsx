import type { Metadata } from "next";
import SnakePlay from "./SnakePlay";

export const metadata: Metadata = {
  title: "Play Snake Game Online Free - Snake Game Browser | PlayMini",
  description:
    "Play snake game online free! Classic snake game in your browser. Eat food, grow longer, beat your high score. No download. Desktop and mobile friendly.",
  keywords: [
    "play snake game online free",
    "snake game browser",
    "snake game online",
    "classic snake game",
    "browser snake game",
    "snake game no download",
    "free snake game",
    "snake game unblocked",
    "retro snake game",
    "nokia snake game",
    "arcade snake online",
    "mobile snake game",
  ],
  alternates: {
    canonical: "/snake",
  },
  openGraph: {
    title: "Play Snake Game Online Free - Snake Game Browser | PlayMini",
    description:
      "Play snake game online free! Classic snake game in your browser. Eat food, grow longer, beat your high score.",
    type: "website",
    url: "https://playmini.fun/snake",
  },
};

export default function SnakePage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <SnakePlay />

      <div className="container mx-auto px-4 pb-12 max-w-4xl">
        {/* WebApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Snake Game",
              description:
                "Play the classic Snake game free online with smooth controls and high score tracking.",
              url: "https://playmini.fun/snake",
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

