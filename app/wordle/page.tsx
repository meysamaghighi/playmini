import type { Metadata } from "next";
import WordlePlay from "./WordlePlay";
import MoreGames from "../components/MoreGames";

export const metadata: Metadata = {
  title: "Play Word Guess Online Free - Wordle Game | PlayMini",
  description:
    "Play Word Guess online free! Guess the 5-letter word in 6 tries. Wordle-style word game with unlimited plays, color feedback, and streak tracking.",
  keywords: [
    "word guess",
    "wordle clone",
    "word puzzle",
    "5 letter word game",
    "daily word game",
    "word game online",
    "free word puzzle",
    "guess the word",
    "vocabulary game",
    "brain teaser",
  ],
  alternates: {
    canonical: "/wordle",
  },
  openGraph: {
    title: "Play Word Guess Online Free - Wordle Game | PlayMini",
    description:
      "Play Word Guess online free! Guess the 5-letter word in 6 tries. Wordle-style word game with unlimited plays, color feedback, and streak tracking.",
    url: "https://playmini.fun/wordle",
    siteName: "PlayMini",
    type: "website",
    images: [
      {
        url: "https://playmini.fun/og-image.png",
        width: 1200,
        height: 630,
        alt: "PlayMini - Word Guess Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Word Guess - Free Wordle Game Online | PlayMini",
    description:
      "Guess the 5-letter word in 6 tries. Unlimited plays, color feedback, streak tracking.",
    images: ["https://playmini.fun/og-image.png"],
  },
};

export default function WordlePage() {
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Word Guess - Free Wordle Game",
    description:
      "A free Wordle-style word puzzle game where you guess a 5-letter word in 6 tries. Features unlimited plays and streak tracking.",
    url: "https://playmini.fun/wordle",
    applicationCategory: "Game",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
        <WordlePlay />

      <MoreGames />
    </div>
  );
}
