import type { Metadata } from "next";
import MusicTriviaPlay from "./MusicTriviaPlay";

export const metadata: Metadata = {
  title: "Play Music Trivia Online Free - Song Quiz Game | PlayMini",
  description:
    "Play Music Trivia online free! 170+ songs, test your music knowledge, timeline challenge. Browser-based song quiz perfect for parties. No download needed.",
  keywords:
    "music trivia, song quiz, music quiz game, party game, timeline game, music knowledge, free trivia",
  alternates: {
    canonical: "/music-trivia",
  },
  openGraph: {
    title: "Play Music Trivia Online Free - Song Quiz Game | PlayMini",
    description:
      "Play Music Trivia online free! 170+ songs, test your music knowledge, timeline challenge. Browser-based song quiz perfect for parties. No download needed.",
    type: "website",
    url: "https://playmini.fun/music-trivia",
  },
};

export default function MusicTriviaPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <MusicTriviaPlay />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Music Party Trivia",
              description:
                "Free music trivia game with 170+ songs. Trivia questions and timeline challenge.",
              url: "https://playmini.fun/music-trivia",
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
