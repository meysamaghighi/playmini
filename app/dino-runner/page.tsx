import type { Metadata } from "next";
import DinoRunnerPlay from "./DinoRunnerPlay";

export const metadata: Metadata = {
  title: "Play Dino Run Game Online Free - Chrome Dino | PlayMini",
  description:
    "Play Dino Run game online free! Jump and duck through cacti and pterodactyls — classic T-Rex runner in your browser. Speeds up as your score grows, works on mobile and desktop.",
  keywords: [
    "chrome dino game online",
    "dino run game online",
    "play dino game online",
    "t-rex runner game",
    "chrome dinosaur game",
    "dinosaur game no internet",
    "dino game free",
    "endless runner game",
    "chrome dino runner",
    "offline dino game",
    "dinosaur jump game",
  ],
  alternates: {
    canonical: "/dino-runner",
  },
  openGraph: {
    title: "Play Dino Run Game Online Free - Chrome Dino | PlayMini",
    description:
      "Play Dino Run game online free! Jump and duck through cacti and pterodactyls — classic T-Rex runner in your browser.",
    type: "website",
    url: "https://playmini.fun/dino-runner",
  },
};

export default function DinoRunnerPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Jump over cacti, duck under pterodactyls, and see how far you can go.
          </p>
        </div>
        <DinoRunnerPlay />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Dino Runner",
              description:
                "Play Dino Runner free online — a classic endless runner with jump, duck, and a saved high score.",
              url: "https://playmini.fun/dino-runner",
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
