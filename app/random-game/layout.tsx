import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GameShuffle - Tinder for Games | Swipe Through 31 Free Games",
  description:
    "Tinder for games -- shuffle through 31 free browser games, vote thumbs up or down, and discover your favorites. No download, no sign-up. Play instantly.",
  keywords: [
    "random game",
    "tinder for games",
    "game discovery",
    "free browser games",
    "random game picker",
    "play random game",
    "game shuffle",
    "mini games",
    "free online games",
  ],
  alternates: { canonical: "https://random.playmini.fun" },
  openGraph: {
    title: "GameShuffle - Tinder for Games",
    description:
      "Shuffle through 31 free browser games, vote thumbs up or down, discover your favorites. Like Tinder, but for games.",
    type: "website",
    siteName: "PlayMini",
    url: "https://random.playmini.fun",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "GameShuffle",
  description:
    "Tinder for games -- shuffle through 31 free browser games, vote thumbs up or down, and discover your favorites.",
  url: "https://random.playmini.fun",
  applicationCategory: "GameApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.5",
    ratingCount: "31",
    bestRating: "5",
  },
};

export default function RandomGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
