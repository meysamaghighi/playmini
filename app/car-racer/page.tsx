import type { Metadata } from "next";
import CarRacerPlay from "./CarRacerPlay";

export const metadata: Metadata = {
  title: "Car Racing Game Online Free - Dodge Traffic | PlayMini",
  description:
    "Play car racing game online free! Dodge traffic across three lanes, see how far you can go. Top-down arcade racing game in your browser, mobile-friendly.",
  keywords: [
    "car racing game online free",
    "car racing game",
    "play car game online",
    "browser car game",
    "car racer online",
    "free racing game",
    "online car game",
    "top-down racing",
    "arcade racing game",
    "car game unblocked",
  ],
  alternates: {
    canonical: "/car-racer",
  },
  openGraph: {
    title: "Car Racing Game Online Free - Dodge Traffic | PlayMini",
    description:
      "Play car racing game online free! Dodge traffic across three lanes, see how far you can go.",
    type: "website",
    url: "https://playmini.fun/car-racer",
  },
};

export default function CarRacerPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <p className="text-ink-2 text-lg">
            Switch lanes, dodge traffic, see how far you go.
          </p>
        </div>
        <CarRacerPlay />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Car Racer",
              description:
                "Play Car Racer free online — a minimal top-down driving arcade game. Three lanes, dodge oncoming traffic, beat your best score.",
              url: "https://playmini.fun/car-racer",
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
