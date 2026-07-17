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
        {/* FAQ Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "How do I play snake game online?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Use arrow keys or W/A/S/D on desktop. On mobile, swipe to change direction. Eat food to grow longer. Avoid hitting walls or your own tail.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does snake game get faster as I play?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. The snake speeds up each time it eats, making the game progressively harder.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I play snake game on my phone?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Swipe up, down, left, or right to control the snake on touchscreen devices.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Is snake game free to play?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. No download or sign-up needed. Runs in any modern browser. High score is saved locally.",
                  },
                },
              ],
            }),
          }}
        />

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

