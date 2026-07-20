import type { Metadata } from "next";
import SimonPlay from "./SimonPlay";

export const metadata: Metadata = {
  title: "Play Simon Says Online Free - Memory Game | PlayMini",
  description:
    "Play Simon Says online free! Watch color sequences and repeat them. Test your memory with longer patterns. Classic brain game in browser, no download needed.",
  keywords:
    "simon says, simon game, memory game, pattern game, sequence game, brain game, free online game",
  alternates: {
    canonical: "/simon",
  },
  openGraph: {
    title: "Play Simon Says Online Free - Memory Game | PlayMini",
    description:
      "Play Simon Says online free! Watch color sequences and repeat them. Test your memory with longer patterns. Classic brain game in browser, no download needed.",
    type: "website",
    url: "https://playmini.fun/simon",
  },
};

export default function SimonPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 pt-12 pb-12">
      <div className="text-center mb-8">
        <p className="text-ink-2">Watch the sequence, then repeat it</p>
      </div>
        <SimonPlay />

      {/* WebApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Simon Says Game",
            description:
              "Free online Simon Says memory game. Test your pattern recognition and memory skills.",
            url: "https://playmini.fun/simon",
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
    </main>
  );
}
